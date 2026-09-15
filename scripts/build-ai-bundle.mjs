/**
 * build-ai-bundle — monta `dist-lib/ai/`, o pacote de conteúdo para IA que NÃO
 * roda em Claude Code.
 *
 * ## Por que existe
 *
 * O pipeline do DS (roteiros, regras, exemplos, guias) só é legível pelo Claude
 * Code: skills com frontmatter, slash commands, auto-load de `rules/`. Consumidor
 * com loop próprio sobre a API não tem nenhum desses mecanismos — e é o caso do
 * iGreen OS, que hoje GARIMPA o nosso código-fonte com uma lista de nomes escrita
 * à mão e enxerga 19 dos 48 componentes.
 *
 * Este bundle é a mesma informação, em arquivo simples, indexada, com versão.
 *
 * ## A regra que define o desenho: DERIVADO, nunca mantido à mão
 *
 * Todo arquivo aqui é cópia ou extração de algo que já existe no repo. Nada é
 * escrito só para o bundle. Isso não é economia — é o que torna a
 * dessincronização IMPOSSÍVEL: não há segunda fonte para divergir. Componente
 * novo entra sozinho; regra alterada propaga no próximo build.
 *
 * ## Onde roda
 *
 * No `closeBundle` do `vite.lib.config.ts`, junto das outras cópias cruas.
 * ⚠️ TEM que ser ali: `dist-lib/` é gitignored, e o `lib-verify` exige que todo
 * dir declarado em `files` exista e não esteja vazio. Gerar em outro passo faria
 * qualquer PR que toque o `package.json` reprovar no CI, com erro que não aponta
 * pra causa.
 *
 * Rodar solto para inspecionar:  node scripts/build-ai-bundle.mjs --out /tmp/ai
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Raiz do repo.
 *
 * ⚠️ Não dá pra derivar só de `import.meta.url`: sob o vitest ele não é URL de
 * `file:`, e `new URL(...).pathname` estoura com ERR_INVALID_URL_SCHEME. Como o
 * gerador roda em três contextos (CLI, `closeBundle` do vite, e o teste), a
 * derivação tenta o caminho do módulo e cai pro `cwd` — que é a raiz nos três.
 */
const RAIZ = (() => {
  try {
    const daqui = path.dirname(fileURLToPath(import.meta.url));
    const candidato = path.resolve(daqui, "..");
    if (fs.existsSync(path.join(candidato, "package.json"))) return candidato;
  } catch {
    /* contexto sem file: URL — cai pro cwd */
  }
  return process.cwd();
})();

const p = (...partes) => path.join(RAIZ, ...partes);

/* ── fontes ──────────────────────────────────────────────────────────────── */

const PAYLOAD = p("cli", "templates", "default", "_claude");
const UI = p("src", "components", "ui");

/**
 * Roteiros portados nesta fase.
 *
 * Deliberadamente UM. Montar os 11 antes de medir é industrializar um formato
 * que vai mudar assim que o primeiro roteiro real rodar no consumidor. Começa
 * pelo painel — foi onde os defeitos apareceram na avaliação do OS.
 */
const ROTEIROS = [
  {
    id: "dashboard",
    origem: "dashboard-builder",
    arquivos: {
      "roteiro.md": "SKILL.md",
      "entrevista.md": "interview.md",
      "blueprint.md": "blueprint.md",
      "geracao.md": "generate.md",
    },
    exemplo: "dashboard",
  },
];

/**
 * ⚠️ NÃO existe lista de exclusão de arquivo de exemplo, e isso foi medido.
 *
 * A primeira versão pulava `dashboard-brazil-map.ts` (256 KB de TopoJSON, 40% de
 * todo `src/examples/`) com o argumento de que "dado bruto não ensina nada". O
 * argumento vale pro DADO e não vale pro ARQUIVO: `dashboard-screen.tsx:41`
 * importa `BRAZIL_PATHS`/`BRAZIL_VIEWBOX` dele e usa na linha 868. Sem ele, o
 * exemplo chega no consumidor com import quebrado — e exemplo quebrado é PIOR
 * que exemplo ausente, porque a IA copia o padrão.
 *
 * No lugar da exclusão ficou o `conferirImports` abaixo, que é a invariante de
 * verdade: nenhum import relativo de exemplo pode apontar pra fora do bundle.
 * Vale pros 10 exemplos que ainda vão entrar, sem ninguém lembrar da regra.
 */

/** Tem pasta e USAGE, mas não é exportado pelo npm — é scaffold de teste. */
const COMPONENTES_FORA = new Set(["TabelaTeste"]);

/* ── utilidades ──────────────────────────────────────────────────────────── */

const semFrontmatter = (texto) =>
  texto.startsWith("---") ? texto.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "") : texto;

/**
 * Menções a mecanismos que só existem no Claude Code.
 *
 * NÃO são reescritas por script. Reescrever prosa mecanicamente produz frase
 * errada com cara de certa — e o texto ao redor continua fazendo sentido mesmo
 * quando o leitor não pode digitar `/ds-create-dashboard`. Em vez disso: um
 * aviso no topo do roteiro explicando a tradução, e a CONTAGEM no manifesto,
 * pra o resíduo ser visível em vez de silencioso.
 */
const RESIDUO_CLAUDE_CODE = /\/ds-(create|build|replicate)-[a-z-]+|AskUserQuestion|\.claude\//g;

const AVISO_ROTEIRO = `> **Nota de portabilidade.** Este roteiro foi extraído do pipeline do iGreen DS
> para Claude Code. Menções a slash command (\`/ds-create-…\`), a \`.claude/\` e a
> ferramentas daquele ambiente descrevem **como ele é acionado lá** — aqui o
> equivalente é carregar este roteiro pelo \`indice.json\`. O conteúdo de decisão
> (entrevista, blueprint, regras de composição) vale igual.

`;

function escrever(destino, rel, conteudo) {
  const alvo = path.join(destino, rel);
  fs.mkdirSync(path.dirname(alvo), { recursive: true });
  fs.writeFileSync(alvo, conteudo);
}

function copiarArvore(origem, destino, rel) {
  let n = 0;
  for (const entrada of fs.readdirSync(origem)) {
    const de = path.join(origem, entrada);
    if (fs.statSync(de).isDirectory()) {
      n += copiarArvore(de, destino, path.join(rel, entrada));
    } else {
      escrever(destino, path.join(rel, entrada), fs.readFileSync(de));
      n++;
    }
  }
  return n;
}

/**
 * Nenhum import relativo de exemplo pode apontar pra fora do bundle.
 *
 * É a invariante que substitui a lista de exclusão (ver o comentário longo lá em
 * cima). Falha ALTO: exemplo com import quebrado é pior que exemplo ausente,
 * porque o consumidor copia o padrão achando que está certo.
 *
 * Só confere import RELATIVO — `@/...` e pacote npm resolvem no projeto de quem
 * consome, não aqui.
 */
const EXTENSOES = ["", ".ts", ".tsx", ".json", "/index.ts", "/index.tsx"];

function conferirImports(destino, raizRel) {
  const quebrados = [];
  const base = path.join(destino, raizRel);
  if (!fs.existsSync(base)) return quebrados;

  const varrer = (dir) => {
    for (const entrada of fs.readdirSync(dir)) {
      const alvo = path.join(dir, entrada);
      if (fs.statSync(alvo).isDirectory()) {
        varrer(alvo);
        continue;
      }
      if (!/\.tsx?$/.test(entrada)) continue;
      const texto = fs.readFileSync(alvo, "utf8");
      for (const m of texto.matchAll(/from\s+["'](\.[^"']+)["']/g)) {
        const destinoImport = path.resolve(path.dirname(alvo), m[1]);
        if (!EXTENSOES.some((ext) => fs.existsSync(destinoImport + ext))) {
          quebrados.push(`${path.relative(destino, alvo)} → ${m[1]}`);
        }
      }
    }
  };

  varrer(base);
  return quebrados;
}

function commitCurto() {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      cwd: RAIZ,
      encoding: "utf8",
    }).trim();
  } catch {
    return "sem-git";
  }
}

/**
 * A tabela de roteamento do `ds-kit`, virada em JSON.
 *
 * ⚠️ Parse de markdown é frágil, então ele FALHA ALTO se colher menos linhas que
 * o piso: tabela que mudou de forma tem que quebrar o build, não gerar um índice
 * vazio que ninguém percebe. É o mesmo raciocínio da consulta de controle — um
 * zero silencioso é pior que um erro.
 */
const PISO_ROTAS = 15;

function lerRoteamento() {
  const texto = fs.readFileSync(path.join(PAYLOAD, "skills", "ds-kit", "SKILL.md"), "utf8");

  /* ⚠️ Delimitar à seção do Passo 1 não é capricho: o arquivo tem OUTRAS tabelas,
     e sem o recorte a primeira "rota" colhida vinha da tabela de modo do
     `ds-config.json` — `[mode, submodule] → "já no disco"`, que não é rota
     nenhuma. Índice com lixo é pior que índice curto: o consumidor rotearia por
     ele. */
  const inicio = texto.search(/^##\s+Passo 1\b/m);
  if (inicio < 0) {
    throw new Error(
      "roteamento: não achei a seção '## Passo 1' no ds-kit. O arquivo mudou de " +
        "forma — conserte o recorte em vez de varrer o arquivo inteiro.",
    );
  }
  const depois = texto.slice(inicio + 3).search(/^##\s/m);
  const secao = texto.slice(inicio, depois > 0 ? inicio + 3 + depois : undefined);

  const linhas = secao.split(/\r?\n/);
  const rotas = [];
  for (const linha of linhas) {
    if (!linha.startsWith("|")) continue;
    const celulas = linha.split("|").map((c) => c.trim());
    if (celulas.length < 4) continue;
    const [, sinais, rota] = celulas;
    if (!sinais || !rota || /^-+$/.test(sinais) || /Sinais na fala/.test(sinais)) continue;
    const termos = [...sinais.matchAll(/"([^"]+)"/g)].map((m) => m[1].toLowerCase());
    if (!termos.length) continue;
    rotas.push({ sinais: termos, rota: rota.replace(/\*\*/g, "") });
  }
  if (rotas.length < PISO_ROTAS) {
    throw new Error(
      `roteamento: colhi ${rotas.length} rotas da tabela do ds-kit, piso é ${PISO_ROTAS}. ` +
        `A tabela mudou de forma — conserte o parse em vez de publicar um índice vazio.`,
    );
  }
  return rotas;
}

/** Extrai os blocos `ds:regras` — o payload que o consumidor injeta na hora da escrita. */
function extrairRegras() {
  const ABRE = "<!-- ds:regras";
  const porComponente = {};

  const bloco = (texto) => {
    const i = texto.indexOf(ABRE);
    if (i < 0) return null;
    const fimLinha = texto.indexOf("\n", i);
    const fim = texto.indexOf("-->", i);
    if (fimLinha < 0 || fim < 0) return null;
    return {
      rotulo: texto.slice(i + ABRE.length, fimLinha).trim().toLowerCase(),
      regras: texto
        .slice(fimLinha + 1, fim)
        .split(/\r?\n/)
        .map((l) => l.replace(/^\s*-\s*/, "").trim())
        .filter(Boolean),
    };
  };

  for (const nome of fs.readdirSync(UI)) {
    if (COMPONENTES_FORA.has(nome)) continue;
    const usage = path.join(UI, nome, "USAGE.md");
    if (!fs.existsSync(usage)) continue;
    const b = bloco(fs.readFileSync(usage, "utf8"));
    if (b?.regras.length) porComponente[nome] = b.regras;
  }

  // Primitivos: um arquivo, N blocos nomeados.
  const tabela = fs.readFileSync(p("src", "components", "shadcn", "USAGE.md"), "utf8");
  let resto = tabela;
  while (true) {
    const b = bloco(resto);
    if (!b) break;
    if (b.rotulo && b.regras.length) porComponente[b.rotulo] = b.regras;
    resto = resto.slice(resto.indexOf("-->") + 3);
  }

  return porComponente;
}

/* ── build ───────────────────────────────────────────────────────────────── */

export function montarBundle(destino = p("dist-lib", "ai")) {
  fs.rmSync(destino, { recursive: true, force: true });
  fs.mkdirSync(destino, { recursive: true });

  const pkg = JSON.parse(fs.readFileSync(p("package.json"), "utf8"));
  const avisos = [];

  /* globais e regras */
  escrever(
    destino,
    "global/composicao.md",
    fs.readFileSync(p("cli", "templates", "default", "DESIGN.md"), "utf8"),
  );
  escrever(
    destino,
    "global/componentes.md",
    semFrontmatter(fs.readFileSync(path.join(PAYLOAD, "rules", "ds-components.md"), "utf8")),
  );
  escrever(
    destino,
    "regras/design.md",
    semFrontmatter(fs.readFileSync(path.join(PAYLOAD, "rules", "ds-design.md"), "utf8")),
  );
  escrever(
    destino,
    "regras/temas.md",
    semFrontmatter(fs.readFileSync(path.join(PAYLOAD, "rules", "ds-themes.md"), "utf8")),
  );

  /* roteiros + o exemplo de cada um */
  let arquivosDeExemplo = 0;
  let residuoClaudeCode = 0;
  for (const r of ROTEIROS) {
    for (const [saida, entrada] of Object.entries(r.arquivos)) {
      const de = path.join(PAYLOAD, "skills", r.origem, entrada);
      const corpo = semFrontmatter(fs.readFileSync(de, "utf8"));
      residuoClaudeCode += (corpo.match(RESIDUO_CLAUDE_CODE) ?? []).length;
      escrever(destino, `roteiros/${r.id}/${saida}`, AVISO_ROTEIRO + corpo);
    }
    arquivosDeExemplo += copiarArvore(
      p("src", "examples", r.exemplo),
      destino,
      `exemplos/${r.exemplo}`,
    );
  }

  const quebrados = conferirImports(destino, "exemplos");
  if (quebrados.length) {
    throw new Error(
      `exemplo com import relativo que não existe no bundle:\n  ` +
        quebrados.join("\n  ") +
        `\nExemplo quebrado é pior que exemplo ausente — o consumidor copia o padrão.`,
    );
  }

  /* guias de componente */
  const componentes = {};
  for (const nome of fs.readdirSync(UI)) {
    if (COMPONENTES_FORA.has(nome)) continue;
    const usage = path.join(UI, nome, "USAGE.md");
    if (!fs.existsSync(usage)) {
      avisos.push(`${nome} não tem USAGE.md — fica fora do bundle`);
      continue;
    }
    escrever(destino, `componentes/${nome}.md`, fs.readFileSync(usage, "utf8"));
    componentes[nome] = `componentes/${nome}.md`;
  }
  escrever(
    destino,
    "componentes/_primitivos.md",
    fs.readFileSync(p("src", "components", "shadcn", "USAGE.md"), "utf8"),
  );
  escrever(destino, "componentes/indice.json", JSON.stringify(componentes, null, 2) + "\n");

  /* regras injetáveis + lint */
  const regras = extrairRegras();
  escrever(destino, "regras-por-componente.json", JSON.stringify(regras, null, 2) + "\n");
  escrever(
    destino,
    "lint/ds-lint-patterns.mjs",
    fs.readFileSync(p("scripts", "lib", "ds-lint-patterns.mjs"), "utf8"),
  );

  /* roteamento */
  const rotas = lerRoteamento();
  escrever(destino, "indice.json", JSON.stringify({ rotas }, null, 2) + "\n");

  /* manifesto — a versão fica AQUI, nunca dentro do conteúdo: carimbo por arquivo
     faz tudo "mudar" a cada build só pela data e polui o hash de quem compara. */
  const manifesto = {
    pacote: pkg.name,
    versao: pkg.version,
    commit: commitCurto(),
    gerado: new Date().toISOString().slice(0, 10),
    conteudo: {
      roteiros: ROTEIROS.map((r) => r.id),
      componentes: Object.keys(componentes).length,
      componentesComRegra: Object.keys(regras).length,
      rotas: rotas.length,
      arquivosDeExemplo,
      /* Visível de propósito: é dívida de adaptação, e dívida contada é dívida
         que alguém fecha. Zero só acontece quando os roteiros forem reescritos
         na gramática do consumidor. */
      residuoClaudeCode,
    },
  };
  escrever(destino, "manifest.json", JSON.stringify(manifesto, null, 2) + "\n");

  return { manifesto, avisos, destino };
}

/* ── CLI ─────────────────────────────────────────────────────────────────── */

const executadoDireto =
  process.argv[1] && path.resolve(process.argv[1]).endsWith("build-ai-bundle.mjs");

if (executadoDireto) {
  const i = process.argv.indexOf("--out");
  const destino = i > 0 ? path.resolve(process.argv[i + 1]) : undefined;
  const { manifesto, avisos, destino: onde } = montarBundle(destino);
  for (const a of avisos) console.warn("⚠ " + a);
  console.log(`✓ ai bundle em ${onde}`);
  console.log(JSON.stringify(manifesto, null, 2));
}
