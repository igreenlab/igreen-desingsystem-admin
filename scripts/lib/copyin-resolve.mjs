/**
 * copyin-resolve — import RELATIVO sobrevive ao copy-in?
 *
 * ## O furo que isto fecha
 *
 * O `shadcn add` reescreve apenas especificador que começa com `@/` ou `#`. Um import
 * **relativo** (`./x`, `../y`) passa verbatim pro projeto do consumidor. Isso só funciona
 * se os dois arquivos caírem na MESMA pasta relativa lá — e o `target` de cada entrada de
 * `files[]` pode mandá-los pra pastas diferentes.
 *
 * Aconteceu em 2026-09-24 com o item `card`:
 *
 *     card.tsx              target: components/ui/card.tsx
 *     clickable-surface.tsx target: src/components/shadcn/clickable-surface.tsx
 *     e card.tsx fazia  import … from "./clickable-surface"
 *
 * No consumidor virava `src/components/ui/clickable-surface` — que não existe. O arquivo
 * **não compila**, e isso foi servido por 4 semanas na 0.68.0. O gêmeo `kpi` sempre
 * importou por alias e nunca teve o problema.
 *
 * ## Por que nenhum gate existente pegava
 *
 * - `registry-check` §0 procura `from "(../)+shadcn/…"` e varre só `src/components/ui` e
 *   `src/blocks`. O `card.tsx` mora em `shadcn/` e o import é `./`.
 * - `registry-imports` resolve tudo em path de **fonte**: a palavra `target` não aparece
 *   no módulo. Ele prova que o arquivo é ENTREGUE, não que o import o ALCANÇA.
 *
 * É a L-065 de novo: só o consumidor real exercita o que é distribuído. Este gate simula
 * o destino.
 */

/** Diretório de um path POSIX. */
function dir(p) {
  const i = p.lastIndexOf("/");
  return i === -1 ? "" : p.slice(0, i);
}

/** Resolve `base/../x` sem tocar no disco. */
function normaliza(p) {
  const out = [];
  for (const seg of p.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return out.join("/");
}

/**
 * Onde o arquivo cai no projeto do consumidor.
 * O `igreen-add` usa: `target.startsWith("src/") ? target : "src/" + target`.
 */
export function destinoNoConsumidor(file) {
  const t = file.target ?? file.path;
  return t.startsWith("src/") ? t : `src/${t}`;
}

/** Imports relativos de um texto de módulo. */
export function importsRelativos(fonte) {
  return [...fonte.matchAll(/from\s+"(\.[^"]*)"/g)].map((m) => m[1]);
}

/** Só código resolve import; `.md` e `.json` entram no `files[]` como anexo. */
const EH_CODIGO = /\.(tsx?|jsx?|mjs|cjs)$/;

/** Nome do item a partir de um `registryDependency` (`@igreen/table` → `table`). */
const semEscopo = (d) => d.replace(/^@[^/]+\//, "");

/**
 * Todos os itens que o copy-in de `nome` instala: ele + as `registryDependencies`,
 * transitivamente. Um relativo pode apontar pro arquivo de um irmão instalado junto —
 * é o caso normal (`data-table` → `../Table`, entregue por `@igreen/table`).
 */
export function itensInstalados(nome, porNome, vistos = new Set()) {
  if (vistos.has(nome)) return vistos;
  const item = porNome.get(nome);
  if (!item) return vistos;
  vistos.add(nome);
  for (const d of item.registryDependencies ?? []) {
    itensInstalados(semEscopo(d), porNome, vistos);
  }
  return vistos;
}

/**
 * @param {{items: any[], lerFonte: (path: string) => string | null}} entrada
 * @returns {{quebrados: {item: string, arquivo: string, spec: string, aponta: string}[], conferidos: number}}
 *   `quebrados` = import relativo cujo alvo não é entregue por NENHUM item que o
 *   copy-in instala junto.
 */
export function checkCopyinResolve({ items, lerFonte }) {
  const porNome = new Map(items.map((i) => [i.name, i]));
  const quebrados = [];
  let conferidos = 0;

  for (const item of items) {
    const instalados = itensInstalados(item.name, porNome);
    // Destinos sem extensão, pra casar com o specifier (que não a tem).
    const destinos = new Set();
    for (const nome of instalados) {
      for (const f of porNome.get(nome)?.files ?? []) {
        destinos.add(destinoNoConsumidor(f).replace(/\.[jt]sx?$/, ""));
      }
    }

    for (const f of item.files ?? []) {
      if (!EH_CODIGO.test(f.path)) continue;
      const fonte = lerFonte(f.path);
      if (fonte == null) continue;
      const base = dir(destinoNoConsumidor(f));

      for (const spec of importsRelativos(fonte)) {
        conferidos++;
        const alvo = normaliza(`${base}/${spec}`);
        // Pode apontar pro arquivo, ou pro index de uma pasta entregue.
        if (destinos.has(alvo)) continue;
        if (destinos.has(`${alvo}/index`)) continue;
        quebrados.push({ item: item.name, arquivo: f.path, spec, aponta: alvo });
      }
    }
  }
  return { quebrados, conferidos };
}
