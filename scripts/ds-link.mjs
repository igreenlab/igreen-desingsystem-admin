#!/usr/bin/env node
/**
 * ds-link — projeta o kit de skills/commands/rules do iGreen DS para dentro do
 * `.claude/` do repositório PAI quando o DS é consumido como SUBMÓDULO.
 *
 * Por quê: o Claude Code só auto-descobre `.claude/` na raiz do cwd (+ ~/.claude).
 * Ele NÃO desce para `<submodulo>/.claude/`. Como submódulo é só um apontamento
 * numa subpasta, todo o kit fica invisível. Este script copia o payload
 * consumidor (`cli/templates/default/_claude`) — o mesmo que o CLI npm usa — para
 * o `.claude/` do pai, tornando `/ds-create-crud`, `/ds-create-dashboard`, etc.
 * descobríveis nativamente. Idempotente: re-rode após `git pull --recurse-submodules`.
 *
 * Uso (a partir da RAIZ do repo pai):
 *   node <submodulo>/scripts/ds-link.mjs [opções]
 *   npm --prefix <submodulo> run ds:link          (INIT_CWD = raiz do pai)
 *
 * Opções:
 *   --alias <@ds>     alias de import que aponta pra <submodulo>/src (default: auto-detect → @ds)
 *   --target <path>   raiz do repo pai (default: $INIT_CWD || cwd)
 *   --force           sobrescreve arquivos do consumidor que colidem (default: pula + avisa)
 *   --unlink          remove tudo que o ds-link instalou (usa o manifest)
 *   --dry             mostra o que faria, sem escrever nada
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  copyFileSync,
  rmSync,
} from "node:fs";
import { join, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DS_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PAYLOAD = join(DS_ROOT, "cli", "templates", "default", "_claude");
const START = "<!-- ds:link:start -->";
const END = "<!-- ds:link:end -->";

// ── args ──────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name, def) => {
  const i = argv.indexOf(name);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : def;
};
const DRY = flag("--dry");
const FORCE = flag("--force");
const UNLINK = flag("--unlink");
const TARGET = resolve(opt("--target", process.env.INIT_CWD || process.cwd()));
const DEST = join(TARGET, ".claude");
const MANIFEST = join(DEST, ".ds-linked.json");
const CONFIG = join(DEST, "ds-config.json");
const CLAUDE_MD = join(TARGET, "CLAUDE.md");

const log = (...a) => console.log(...a);
const warn = (...a) => console.warn("  ⚠ ", ...a);

// ── guards ────────────────────────────────────────────────────────
if (!existsSync(PAYLOAD)) {
  console.error(`✗ payload não encontrado: ${PAYLOAD}\n  Este script deve rodar de dentro do repo do DS.`);
  process.exit(1);
}
if (resolve(TARGET) === DS_ROOT) {
  console.error(
    `✗ target === raiz do DS (${DS_ROOT}).\n` +
      `  Rode a partir da raiz do repo PAI (que contém o DS como submódulo),\n` +
      `  ex.:  node ${relative(TARGET, join(DS_ROOT, "scripts/ds-link.mjs")) || "<submodulo>/scripts/ds-link.mjs"}`
  );
  process.exit(1);
}

const dsVersion = (() => {
  try {
    return JSON.parse(readFileSync(join(DS_ROOT, "package.json"), "utf8")).version || "?";
  } catch {
    return "?";
  }
})();

// ── helpers ───────────────────────────────────────────────────────
function walk(dir, base = dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, base, out);
    else out.push(relative(base, full).split("\\").join("/"));
  }
  return out;
}

function readJSON(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

/** Detecta um alias no tsconfig/vite/jsconfig do pai que aponte pra <dsPath>/src. */
function detectAlias(dsPathRel) {
  const candidates = [
    "tsconfig.json",
    "tsconfig.app.json",
    "jsconfig.json",
    "vite.config.ts",
    "vite.config.js",
    "vite.config.mjs",
  ];
  const srcTarget = `${dsPathRel}/src`;
  for (const file of candidates) {
    const p = join(TARGET, file);
    if (!existsSync(p)) continue;
    const raw = readFileSync(p, "utf8");
    // tsconfig paths: "@ds/*": ["design-system/src/*"]
    const re = /["'`]([@~][^"'`*]*)\/\*?["'`]\s*:\s*\[?\s*["'`]([^"'`]*?)\/\*?["'`]/g;
    let m;
    while ((m = re.exec(raw))) {
      const [, key, val] = m;
      if (val.replace(/^\.\//, "").includes(srcTarget) || val.includes(`${dsPathRel}/src`)) {
        return key.replace(/\/$/, "");
      }
    }
  }
  return null;
}

/**
 * O DS importa entre si por `@/...` (700 imports: components/lib/utils/hooks/config).
 * Esse `@` significa "a src do DS". Copy-in e npm resolvem sozinhos; **submódulo não** —
 * sem o mapeamento o build do pai quebra no 1º componente com
 * `Cannot find module '@/utils/tv'`. Medido num smoke test de submódulo real em 2026-08-08,
 * quando nem esta doc nem este script mencionavam o assunto.
 *
 * Aqui só DETECTAMOS e avisamos: escrever no tsconfig/vite do consumidor é invasivo e a
 * decisão certa depende de ele já usar `@/` pro próprio código (aí há colisão real).
 */
function detectaAliasInternoDoDs(dsPathRel) {
  const candidates = [
    "tsconfig.json",
    "tsconfig.app.json",
    "jsconfig.json",
    "vite.config.ts",
    "vite.config.js",
    "vite.config.mjs",
  ];
  const srcTarget = `${dsPathRel}/src`;
  for (const file of candidates) {
    const p = join(TARGET, file);
    if (!existsSync(p)) continue;
    const raw = readFileSync(p, "utf8");
    // procura uma chave "@" ou "@/*" cujo valor aponte pra src do DS
    const re = /["'`](@\/?\*?)["'`]\s*:\s*\[?\s*["'`]([^"'`]*?)["'`]/g;
    let m;
    while ((m = re.exec(raw))) {
      const val = m[2];
      if (val.replace(/^\.\//, "").includes(srcTarget)) return true;
    }
    // forma do vite com path.resolve: "@": path.resolve(__dirname, "design-system/src")
    const reVite = new RegExp(
      `["'\`]@["'\`]\\s*:\\s*[^,}]*${dsPathRel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/src`
    );
    if (reVite.test(raw)) return true;
  }
  return false;
}

// ── unlink ────────────────────────────────────────────────────────
if (UNLINK) {
  const manifest = readJSON(MANIFEST, null);
  if (!manifest) {
    console.error(`✗ nada pra desfazer — manifest ausente (${MANIFEST}).`);
    process.exit(1);
  }
  log(`ds-link --unlink  (target: ${TARGET})`);
  for (const rel of manifest.files || []) {
    const p = join(DEST, rel);
    if (existsSync(p)) {
      if (!DRY) rmSync(p, { force: true });
      log(`  - ${rel}`);
    }
  }
  // prune diretórios que ficaram vazios (inclui ancestrais, fundo → topo)
  if (!DRY) {
    const dirSet = new Set();
    for (const r of manifest.files || []) {
      let d = dirname(join(DEST, r));
      while (d.length > DEST.length) {
        dirSet.add(d);
        d = dirname(d);
      }
    }
    for (const d of [...dirSet].sort((a, b) => b.length - a.length)) {
      try {
        if (existsSync(d) && readdirSync(d).length === 0) rmSync(d, { recursive: true, force: true });
      } catch {}
    }
  }
  for (const extra of [CONFIG, MANIFEST]) {
    if (existsSync(extra) && !DRY) rmSync(extra, { force: true });
  }
  // remove bloco gerenciado do CLAUDE.md
  if (existsSync(CLAUDE_MD)) {
    const md = readFileSync(CLAUDE_MD, "utf8");
    if (md.includes(START)) {
      const cleaned = md.replace(new RegExp(`\\n?${START}[\\s\\S]*?${END}\\n?`), "\n").trimEnd() + "\n";
      if (!DRY) writeFileSync(CLAUDE_MD, cleaned);
      log("  - bloco ds:link removido do CLAUDE.md");
    }
  }
  log(DRY ? "\n(dry-run) nada foi escrito." : "\n✓ ds-link desfeito.");
  process.exit(0);
}

// ── link (copy-in) ────────────────────────────────────────────────
const dsPathRel = relative(TARGET, DS_ROOT).split("\\").join("/") || ".";
const detected = detectAlias(dsPathRel);
const alias = opt("--alias", detected || "@ds");
const importBase = `${alias}/components/ui`;

const aliasInternoOk = detectaAliasInternoDoDs(dsPathRel);

log(`ds-link  →  ${DEST}`);
log(`  DS: v${dsVersion}  em  ${dsPathRel}`);
log(`  alias: ${alias}${detected ? " (auto-detectado)" : " (default — confirme no seu tsconfig/vite)"}`);
log(
  `  alias interno do DS ("@"): ${
    aliasInternoOk ? "mapeado ✓" : "NÃO MAPEADO — o build vai quebrar (ver aviso abaixo)"
  }`
);
log("");

// hooks/ + settings.json do payload são específicos de copy-in (protect-ds / ds-lint
// miram `src/components/**`, layout que o submódulo não tem) → não projetar no submódulo.
// Aproveita-se só o que é path-agnóstico: commands, skills, rules.
const EXCLUDE = (rel) => rel === "settings.json" || rel.startsWith("hooks/");
const files = walk(PAYLOAD).filter((rel) => !EXCLUDE(rel));
const prev = readJSON(MANIFEST, { files: [] });
const prevSet = new Set(prev.files || []);
const written = [];
let skipped = 0;

for (const rel of files) {
  const src = join(PAYLOAD, rel);
  const dst = join(DEST, rel);
  const exists = existsSync(dst);
  const ours = prevSet.has(rel); // instalado por nós numa rodada anterior
  if (exists && !ours && !FORCE) {
    warn(`colisão (arquivo do consumidor) — pulado: .claude/${rel}`);
    skipped++;
    continue;
  }
  if (!DRY) {
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
  }
  written.push(rel);
}

// remove arquivos que ESTAVAM no manifest mas sumiram do payload (skill removida upstream)
const nowSet = new Set(files);
const removed = (prev.files || []).filter((r) => !nowSet.has(r));
for (const rel of removed) {
  const p = join(DEST, rel);
  if (existsSync(p) && !DRY) rmSync(p, { force: true });
}

// ── config lido pelas skills (modo submódulo) ─────────────────────
const config = {
  mode: "submodule",
  dsPath: dsPathRel,
  alias,
  importBase,
  examplesBase: `${alias}/examples`,
  dsVersion,
};
if (!DRY) {
  mkdirSync(DEST, { recursive: true });
  writeFileSync(CONFIG, JSON.stringify(config, null, 2) + "\n");
  writeFileSync(
    MANIFEST,
    JSON.stringify({ dsVersion, alias, files: written }, null, 2) + "\n"
  );
}

// ── bloco gerenciado no CLAUDE.md do pai ──────────────────────────
const block =
  `${START}\n` +
  `## iGreen Design System (submódulo)\n\n` +
  `Este projeto consome o iGreen DS como **submódulo** em \`${dsPathRel}\`. O kit de\n` +
  `skills/commands/rules foi projetado em \`.claude/\` por \`ds-link\` (v${dsVersion}).\n\n` +
  `- **Import**: componentes ficam em \`${dsPathRel}/src\` — importe via \`${importBase}/<Nome>\`\n` +
  `  (o alias \`${alias}\` deve apontar pra \`${dsPathRel}/src\` no seu tsconfig/vite).\n` +
  `- **Criar telas**: \`/ds-create-crud\` (tabela), \`/ds-create-list\` (cards),\n` +
  `  \`/ds-create-dashboard\` (painel), \`/ds-create-screen\` (2+ peças que conversam),\n` +
  `  \`/ds-create-app\` (app inteiro), \`/ds-create-login\`. As skills leem\n` +
  `  \`.claude/ds-config.json\` (modo submódulo) e leem os componentes/exemplos direto do\n` +
  `  disco — **não** rodam \`igreen:add\`.\n` +
  `- **Regras DS** auto-carregadas em \`.claude/rules/\`: \`ds-components.md\` (qual\n` +
  `  componente usar pra cada tarefa), \`ds-design.md\` (como estilizar — tokens, spacing, foco),\n` +
  `  \`ds-themes.md\` (trocar/adicionar tema de marca — em submódulo é só importar o\n` +
  `  overlay do disco + \`data-theme\` no \`<html>\`, sem \`igreen:add\`) e \`ds-channels.md\`\n` +
  `  (os 4 canais de consumo do DS e o que cada um entrega).\n\n` +
  `### ⚠️ Dois passos que o submódulo NÃO faz por você\n\n` +
  `O submódulo entrega **código-fonte**, não um pacote:\n\n` +
  `1. **O alias INTERNO do DS (\`@\`).** Os arquivos do DS importam entre si por\n` +
  `   \`@/components/…\`, \`@/lib/utils\`, \`@/utils/tv\` — 700 imports. Esse \`@\` significa "a\n` +
  `   \`src\` do DS". Copy-in e npm resolvem sozinhos; **submódulo não**. Sem mapear, o build\n` +
  `   quebra no 1º componente com \`Cannot find module '@/utils/tv'\`. Além do \`${alias}\`:\n\n` +
  `   \`\`\`jsonc\n` +
  `   // tsconfig.json\n` +
  `   "paths": { "${alias}/*": ["${dsPathRel}/src/*"], "@/*": ["${dsPathRel}/src/*"] }\n` +
  `   \`\`\`\n` +
  `   \`\`\`ts\n` +
  `   // vite.config.ts\n` +
  `   resolve: { alias: {\n` +
  `     "${alias}": path.resolve(__dirname, "${dsPathRel}/src"),\n` +
  `     "@":   path.resolve(__dirname, "${dsPathRel}/src"),\n` +
  `   } }\n` +
  `   \`\`\`\n` +
  `   Já usa \`@/\` pro seu próprio código? Renomeie o seu (\`@app/*\`) — é o caminho de menor\n` +
  `   surpresa. Detalhe e a alternativa por-prefixo em \`${dsPathRel}/SUBMODULE-SETUP.md\`.\n` +
  `2. **Dependências.** Não vêm junto. O mínimo pra \`Button\` + \`Modal\`:\n` +
  `   \`npm i tailwind-variants tailwind-merge clsx lucide-react @radix-ui/react-dialog @radix-ui/react-slot\`.\n` +
  `   Componente novo pede mais (\`@tanstack/react-virtual\` no DataTable, \`recharts\` no Chart,\n` +
  `   \`cmdk\` no Combobox…). O erro do bundler diz exatamente qual falta — essa falha é **alta**.\n` +
  `3. **Fonte Geist.** O \`@font-face\` viaja no tema, mas aponta pra \`/fonts/*.woff2\` —\n` +
  `   raiz do **site**, não do submódulo. Rode \`cp ${dsPathRel}/public/fonts/*.woff2 public/fonts/\`.\n` +
  `   Sem isso **não há erro**: o navegador recebe o \`index.html\` no lugar do arquivo e os 27\n` +
  `   presets caem em system-ui. Confira com \`document.fonts.check("16px Geist")\` → \`true\`.\n\n` +
  `E importe o tema no seu CSS de entrada (o overlay de marca, se usar, **depois** dele):\n\n` +
  `\`\`\`css\n` +
  `@import "tailwindcss";\n` +
  `@import "${dsPathRel}/src/styles/theme/tailwind-theme.css";\n` +
  `\`\`\`\n\n` +
  `Você **não** precisa de \`@source\`: o submódulo fica dentro da raiz do projeto, então o\n` +
  `Tailwind v4 já escaneia as classes do DS (ao contrário do canal npm, onde \`node_modules\`\n` +
  `é excluído do scan de propósito).\n\n` +
  `- **Ressincronizar** após atualizar o submódulo: \`node ${dsPathRel}/scripts/ds-link.mjs\`.\n` +
  `${END}`;

if (!DRY) {
  let md = existsSync(CLAUDE_MD) ? readFileSync(CLAUDE_MD, "utf8") : "";
  if (md.includes(START)) {
    md = md.replace(new RegExp(`${START}[\\s\\S]*?${END}`), block);
  } else {
    md = (md.trimEnd() + "\n\n" + block + "\n").replace(/^\n+/, "");
  }
  writeFileSync(CLAUDE_MD, md);
}

// ── summary ───────────────────────────────────────────────────────
log(`  ✓ ${written.length} arquivos projetados em .claude/`);
if (removed.length) log(`  ✓ ${removed.length} obsoletos removidos`);
if (skipped) warn(`${skipped} colisão(ões) puladas — use --force pra sobrescrever`);
log(`  ✓ .claude/ds-config.json  (modo submódulo, alias ${alias})`);
log(`  ✓ bloco ds:link no CLAUDE.md`);
log(
  DRY
    ? "\n(dry-run) nada foi escrito."
    : `\n✓ Pronto. Abra o Claude Code na raiz e use /ds-create-crud, /ds-create-dashboard, etc.` +
        (detected ? "" : `\n  ⚠ Confirme que o alias '${alias}' aponta pra ${dsPathRel}/src no seu tsconfig/vite.`)
);

/*
 * Aviso do alias interno — POR ÚLTIMO, porque é o único que quebra o build de verdade
 * e não pode rolar pra fora da tela. Só detecta e avisa: escrever no tsconfig/vite do
 * consumidor é invasivo, e a decisão certa depende de ele já usar `@/` pro próprio código.
 */
if (!aliasInternoOk) {
  warn(
    `O alias interno do DS ("@") NÃO está mapeado no seu tsconfig/vite.\n` +
      `    Os arquivos do DS importam entre si por "@/components/…", "@/lib/utils", "@/utils/tv"\n` +
      `    (700 imports). Sem o mapeamento, o build quebra no 1º componente:\n` +
      `        Cannot find module '@/utils/tv'\n\n` +
      `    Adicione, ALÉM do "${alias}":\n` +
      `        tsconfig: "@/*": ["${dsPathRel}/src/*"]\n` +
      `        vite:     "@": path.resolve(__dirname, "${dsPathRel}/src")\n\n` +
      `    Já usa "@/" pro seu código? Renomeie o seu (ex.: "@app/*") — menor surpresa.\n` +
      `    Detalhe e alternativa por-prefixo: ${dsPathRel}/SUBMODULE-SETUP.md`
  );
}
