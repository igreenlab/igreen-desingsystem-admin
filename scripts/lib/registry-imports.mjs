/**
 * registry-imports.mjs — o que um item do registry IMPORTA está declarado?
 *
 * ## O furo que isto fecha
 *
 * O `registry-check` valida a direção **oposta**: "todo `files[].path` existe no disco".
 * Isso pega entrada apontando pra arquivo removido. Não pega o inverso — arquivo que o
 * componente importa e que **ninguém distribui**, ou que mora em outro item **não
 * declarado** nas `registryDependencies`. Nos dois casos o consumidor de copy-in recebe
 * um import que não resolve, e o build dele quebra. Nenhum gate cobria esse eixo.
 *
 * Medido em 2026-08-18, rodando a checagem à mão pela primeira vez — **2 defeitos vivos**,
 * ambos silenciosos:
 *
 * 1. `app-shell` importa `@/components/ui/SingleMenuSidebar` desde que o shell passou a
 *    montar as duas sidebars, e o item declarava só `@igreen/menu-sidebar`. Quem rodasse
 *    `igreen:add -- app-shell` recebia um AppShell importando componente que nunca foi
 *    copiado. Foi introduzido e **publicado** no mesmo dia (registry da v0.42.0).
 * 2. `color-picker` importava `{ Input } from "@/components/shadcn"` — o **barrel**, que
 *    não existe no consumidor (lá os primitivos caem soltos em `components/ui/`, e o
 *    rewrite só traduz a forma `@/components/shadcn/<x>`). O item também não declarava
 *    `@igreen/input`. Dois motivos pro import morrer, e o `registry-check` aprovava porque
 *    ele só olha import **relativo** pra `shadcn/`, não o alias do barrel.
 *
 * ## As três armadilhas — todas descobertas errando a medição antes de escrever o gate
 *
 * A primeira versão da medição acusou **267** faltas; a segunda, 96; a real é 0 (depois
 * dos 2 consertos). Cada redução foi um defeito do instrumento, e os três estão codificados
 * aqui de propósito:
 *
 * 1. **`registryDependencies` são o mecanismo, não exceção.** `data-table` importar
 *    `src/lib/utils.ts` é legítimo: ele declara `@igreen/utils`, e o copy-in traz o item.
 *    Tratar tudo fora do `files[]` próprio como falta acusa o desenho do registry inteiro.
 * 2. **Resolver arquivo ANTES de path cru.** `existeArquivo("src/components/ui/Table")` é
 *    verdadeiro pra um DIRETÓRIO, e nenhum item lista diretório — resolver `@/…/Table` pra
 *    pasta gerava 96 falsos. A extensão vem primeiro; path cru só vale se for arquivo.
 * 3. **Um arquivo pode ter VÁRIOS donos.** `MenuSidebar/use-media-query.ts` está listado em
 *    `table`, `menu-sidebar` E `data-table`. Um mapa `path → dono` guarda o último e acusa
 *    o `app-shell` (que declara `menu-sidebar`) de não declarar `data-table`. É `path → Set`,
 *    e basta **um** dono alcançável.
 *
 * Módulo PURO: recebe `lerFonte` e `existeArquivo` injetados. Quem toca disco é o
 * `.test.mjs` — assim a lógica roda contra fixture dos 2 defeitos reais (L-064).
 */

/**
 * Ordem de resolução de import. **Extensões antes do path cru** — ver armadilha 2.
 * `""` fica no fim e só é aceito quando o caminho é arquivo.
 */
const EXTENSOES = [".ts", ".tsx", "/index.ts", "/index.tsx", ""];

const normalizar = (p) => String(p).replace(/\\/g, "/");

/** Junta segmentos de path POSIX resolvendo `.` e `..`, sem depender de `node:path`. */
function juntar(...partes) {
  const out = [];
  for (const seg of normalizar(partes.join("/")).split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return out.join("/");
}

const pastaDe = (arquivo) => normalizar(arquivo).split("/").slice(0, -1).join("/");

/**
 * Resolve um especificador de import pra path do repo, ou `null`.
 *
 * `null` significa "fora do escopo deste gate": pacote npm (é o `deps-declared` que
 * cobre) ou caminho que não existe no disco.
 */
export function resolverImport(arquivoBase, spec, existeArquivo) {
  let bruto;
  if (spec.startsWith(".")) bruto = juntar(pastaDe(arquivoBase), spec);
  else if (spec.startsWith("@/")) bruto = juntar("src", spec.slice(2));
  else return null;
  for (const ext of EXTENSOES) {
    const candidato = bruto + ext;
    if (existeArquivo(candidato)) return candidato;
  }
  return null;
}

/** Extrai os especificadores de `import`/`from` de um fonte TS/TSX. */
export function especificadores(fonte) {
  return [...String(fonte).matchAll(/(?:from|import)\s+["']([^"']+)["']/g)].map((m) => m[1]);
}

/**
 * Fecho transitivo dos itens alcançáveis a partir de `nome` via `registryDependencies`.
 * Só segue `@igreen/<x>`: dep do registry oficial do shadcn não traz arquivo nosso.
 */
export function itensAlcancaveis(nome, porNome, vistos = new Set()) {
  if (vistos.has(nome)) return vistos;
  vistos.add(nome);
  for (const dep of porNome.get(nome)?.registryDependencies ?? []) {
    const m = String(dep).match(/^@igreen\/(.+)$/);
    if (m) itensAlcancaveis(m[1], porNome, vistos);
  }
  return vistos;
}

/**
 * @param {object} entrada
 * @param {Array<object>} entrada.items          `registry.json`.items
 * @param {(path: string) => string|null} entrada.lerFonte      conteúdo, ou null
 * @param {(path: string) => boolean} entrada.existeArquivo     true só pra ARQUIVO
 * @returns {{itensConferidos: number, importsConferidos: number,
 *            naoDistribuidos: Array<object>, naoDeclarados: Array<object>}}
 */
export function checkRegistryImports({ items, lerFonte, existeArquivo }) {
  const porNome = new Map((items ?? []).map((i) => [i.name, i]));

  // path → Set de itens que o distribuem (armadilha 3: pode ser mais de um).
  const donos = new Map();
  for (const it of items ?? []) {
    for (const f of it.files ?? []) {
      const p = normalizar(f.path);
      if (!donos.has(p)) donos.set(p, new Set());
      donos.get(p).add(it.name);
    }
  }

  const naoDistribuidos = [];
  const naoDeclarados = [];
  let itensConferidos = 0;
  let importsConferidos = 0;

  for (const item of items ?? []) {
    const paths = (item.files ?? []).map((f) => normalizar(f.path));
    const proprios = new Set(paths);
    const fontes = paths.filter((p) => /\.tsx?$/.test(p) && existeArquivo(p));
    if (fontes.length === 0) continue;
    itensConferidos++;
    const alcancaveis = itensAlcancaveis(item.name, porNome);

    for (const arquivo of fontes) {
      const src = lerFonte(arquivo);
      if (src === null) continue;
      for (const spec of especificadores(src)) {
        const alvo = resolverImport(arquivo, spec, existeArquivo);
        if (alvo === null || proprios.has(alvo)) continue;
        importsConferidos++;

        const quemDistribui = donos.get(alvo);
        if (quemDistribui === undefined) {
          naoDistribuidos.push({ item: item.name, de: arquivo, spec, alvo });
          continue;
        }
        // Basta UM dono alcançável (armadilha 3).
        const ok = [...quemDistribui].some((d) => alcancaveis.has(d));
        if (!ok) {
          naoDeclarados.push({
            item: item.name,
            de: arquivo,
            spec,
            alvo,
            donos: [...quemDistribui].sort(),
          });
        }
      }
    }
  }

  return { itensConferidos, importsConferidos, naoDistribuidos, naoDeclarados };
}

/** Mensagens prontas pra reprovar, uma por achado. */
export function formatarAchados({ naoDistribuidos, naoDeclarados }) {
  const linhas = [];
  for (const a of naoDistribuidos) {
    linhas.push(
      `[${a.item}] importa "${a.spec}" (${a.alvo}) e NENHUM item do registry distribui esse arquivo` +
        ` — em ${a.de}. Conserte adicionando o arquivo ao files[] do item, ou trocando o import` +
        ` por um caminho que já é distribuído.`,
    );
  }
  for (const a of naoDeclarados) {
    linhas.push(
      `[${a.item}] importa "${a.spec}" (${a.alvo}), que mora em ${a.donos.map((d) => `"${d}"`).join(" ou ")}` +
        ` — mas ${a.item} não declara nenhum deles em registryDependencies (em ${a.de}).` +
        ` Adicione "@igreen/${a.donos[0]}".`,
    );
  }
  return linhas;
}
