#!/usr/bin/env node
/**
 * blocks-build — gera o índice de blocos e os itens `registry:block`.
 *
 * O fluxo de crescimento do catálogo é:
 *
 *     1. cria src/blocks/<categoria>/<nome>.tsx com `export const BLOCK = {...}`
 *     2. npm run blocks:build
 *     3. PR
 *
 * A galeria do showcase não entra nessa lista porque ela **auto-descobre** por
 * `import.meta.glob` — criar o arquivo já o faz aparecer.
 *
 * Uso:
 *   node scripts/blocks-build.mjs            # gera (índice + itens no registry.json)
 *   node scripts/blocks-build.mjs --check    # não escreve; exit 1 se algo estiver fora de sync
 *
 * O `--check` é o que o gate roda: ele reprova ID malformado, duplicado, fora da pasta, sem
 * descrição — e índice/registry divergentes dos arquivos-fonte. Lógica em
 * `scripts/lib/blocks-index.mjs` (puro, com testes).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  coletarBlocos,
  renderIndice,
  itensDeRegistry,
  formatar,
} from "./lib/blocks-index.mjs";
import { especificadores, resolverImport } from "./lib/registry-imports.mjs";

const RAIZ_BLOCOS = "src/blocks";
const INDICE = "cli/templates/default/_claude/skills/ds-kit/blocks-index.md";
const REGISTRY = "registry.json";

const isCheck = process.argv.slice(2).includes("--check");

/* ── coleta ─────────────────────────────────────────────────────────────── */

function arquivosDeBloco(dir = RAIZ_BLOCOS, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name).replace(/\\/g, "/");
    // `_shared/` guarda helper compartilhado entre blocos — não é bloco, não tem BLOCK.
    if (e.isDirectory()) {
      if (e.name.startsWith("_")) continue;
      arquivosDeBloco(p, out);
    } else if (/\.tsx$/.test(e.name) && !/\.test\./.test(e.name) && !e.name.startsWith("_")) {
      out.push(p);
    }
  }
  return out;
}

const caminhos = arquivosDeBloco();
const fontes = new Map(caminhos.map((f) => [f, readFileSync(f, "utf8")]));
const { blocos, achados } = coletarBlocos(
  caminhos.map((arquivo) => ({ arquivo, fonte: fontes.get(arquivo) })),
);

if (achados.length) {
  console.error(`\n✖ ${achados.length} problema(s) em src/blocks/:\n`);
  for (const m of formatar(achados)) console.error(`  ${m}\n`);
  process.exit(1);
}

/* ── resolução de deps: a MESMA que o gate registry-imports usa ──────────── */

const registry = JSON.parse(readFileSync(REGISTRY, "utf8"));

/** path do arquivo → nome do item que o distribui. */
const donoPorPath = new Map();
for (const item of registry.items) {
  for (const f of item.files ?? []) {
    if (!donoPorPath.has(f.path)) donoPorPath.set(f.path, item.name);
  }
}

const existeArquivo = (p) => existsSync(p);
const donoDoArquivo = (arquivoBase, spec) => {
  const alvo = resolverImport(arquivoBase, spec, existeArquivo);
  return alvo ? (donoPorPath.get(alvo) ?? null) : null;
};

/**
 * `meta.stamp` de cada bloco, a preservar. O `registry:stamp` grava o carimbo
 * (`igreen-ds · <id> · <versão> · <hash> · <data>`) em todos os itens; se o gerador o descartasse,
 * cada geração apagaria o carimbo e o `--check` viveria reprovando.
 */
const metaPorId = new Map(
  registry.items
    .filter((i) => i.type === "registry:block" && i.meta)
    .map((i) => [i.name, i.meta]),
);

const itens = itensDeRegistry(blocos, donoDoArquivo, especificadores, fontes, metaPorId);

/* ── saída ──────────────────────────────────────────────────────────────── */

const indiceNovo = renderIndice(blocos);
const indiceAtual = existsSync(INDICE) ? readFileSync(INDICE, "utf8") : "";

// substitui os itens de bloco preservando a ordem dos demais
const semBlocos = registry.items.filter((i) => i.type !== "registry:block");
const registryNovo = { ...registry, items: [...semBlocos, ...itens] };
const registryTexto = JSON.stringify(registryNovo, null, 2) + "\n";
const registryAtual = readFileSync(REGISTRY, "utf8");

const normalizar = (s) => s.replace(/\r\n/g, "\n");
const indiceDefasado = normalizar(indiceAtual) !== normalizar(indiceNovo);
const registryDefasado = normalizar(registryAtual) !== normalizar(registryTexto);

if (isCheck) {
  const fora = [];
  if (indiceDefasado) fora.push(`${INDICE} está defasado`);
  if (registryDefasado) fora.push(`${REGISTRY} tem item de bloco defasado`);
  if (fora.length) {
    console.error(`\n✖ ${fora.length} artefato(s) fora de sync com src/blocks/:\n`);
    for (const f of fora) console.error(`  ${f}`);
    console.error(`\n  → rode: npm run blocks:build\n`);
    process.exit(1);
  }
  console.log(`✔ blocks: ${blocos.length} bloco(s), índice e registry em sync.`);
  process.exit(0);
}

if (indiceDefasado) writeFileSync(INDICE, indiceNovo);
if (registryDefasado) writeFileSync(REGISTRY, registryTexto);

console.log(
  `✔ blocks-build: ${blocos.length} bloco(s) — ` +
    `${indiceDefasado ? "índice reescrito" : "índice já em sync"}, ` +
    `${registryDefasado ? "registry atualizado" : "registry já em sync"}.`,
);
for (const b of blocos) {
  console.log(`   ${b.id.padEnd(24)} ${b.categoria.padEnd(10)} ${b.arquivo}`);
}
