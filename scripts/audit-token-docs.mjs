#!/usr/bin/env node
/**
 * audit-token-docs — confere se TODO valor de token afirmado na documentação bate com
 * o CSS que o tema realmente emite.
 *
 * Por que existe: valor de token errado na doc é a classe de defeito mais silenciosa do
 * repo. Não quebra build, `tsc`, teste nem lint — e nenhum gate podia pegar, porque o
 * defeito não está no código: está no texto que ENSINA o código. Medido em 2026-08-08,
 * quando esta auditoria rodou pela primeira vez:
 *
 *   - `gap`/`space`/`pad` documentados como 3 escalas divergentes sendo UMA só
 *     (`space.lg` dizia 24px valendo 10px — erro de 2,4×)
 *   - `radius.base` documentado como 26px valendo 10px (é alias de `lg`; os 26 migraram
 *     pro `4xl`) — o degrau mais usado do DS, e a doc de extração do Figma mandava mapear
 *     um botão de 26px pra ele
 *   - 5 shadows documentados que não existem (`sh-base`, `sh-3xl`, `sh-inner`, 2 `focus-*`)
 *   - o gap pós-PageHeader anunciado como 24px em 6 arquivos do kit do consumidor,
 *     valendo 16px
 *
 * ⚠️ NÃO é gate de CI, e é deliberado. As classes citadas por doc incluem muitas
 * **citações de ausência** ("`ring-ring-primary` NÃO existe") — distinguir citação de
 * prescrição exige julgamento de intenção, que a L-059 manda deixar fora de gate
 * mecânico. Rode manualmente e TRIE os achados; a saída é candidato, não veredito.
 *
 * Uso: npm run audit:token-docs
 */
import fs from "node:fs";
import path from "node:path";

const RAIZ = process.cwd();
const CSS = fs.readFileSync(path.join(RAIZ, "src/styles/theme/tailwind-theme.css"), "utf8");

// ── verdade: as CSS vars que o tema emite (1ª ocorrência = :root/light) ────────
const VARS = new Map();
for (const m of CSS.matchAll(/^\s*(--[a-z0-9-]+):\s*([^;]+);/gm)) {
  if (!VARS.has(m[1])) VARS.set(m[1], m[2].trim());
}

/** `calc(0.625rem*2.6)` → 26 · `20px` → 20 · `1.25rem` → 20. */
function paraPx(valor) {
  const v = valor.replace(/\s+/g, "");
  let m = v.match(/^(-?[\d.]+)px$/);
  if (m) return +m[1];
  m = v.match(/^(-?[\d.]+)rem$/);
  if (m) return +m[1] * 16;
  m = v.match(/^calc\((-?[\d.]+)rem\*(-?[\d.]+)\)$/);
  if (m) return +m[1] * 16 * +m[2];
  return null;
}

/** Classe DS → nome da var no tema. */
const FAMILIAS = [
  [/^gap-gp-(.+)$/, (s) => `--spacing-gp-${s}`],
  [/^(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr)-sp-(.+)$/, (s) => `--spacing-sp-${s}`],
  [/^(?:p|px|py|pt|pb|pl|pr)-pad-(.+)$/, (s) => `--spacing-pad-${s}`],
  [/^gap-pad-(.+)$/, (s) => `--spacing-pad-${s}`],
  [/^gap-form-gap$/, () => `--spacing-form-gap`],
  [/^(?:min-)?h-form-(.+)$/, (s) => `--spacing-form-${s}`],
  [/^size-icon-(.+)$/, (s) => `--spacing-icon-${s}`],
  [/^size-comp-(.+)$/, (s) => `--spacing-comp-${s}`],
  [/^h-layout-(.+)$/, (s) => `--spacing-layout-${s}`],
  [/^rounded-radius-(.+)$/, (s) => `--radius-radius-${s}`],
  [/^shadow-sh-(.+)$/, (s) => `--shadow-sh-${s}`],
  [/^(?:bg|text|border|ring)-(bg|fg|border|ring|overlay|chart)-(.+)$/, (a, b) => `--color-${a}-${b}`],
];
const varDaClasse = (cls) => {
  for (const [re, fn] of FAMILIAS) {
    const m = cls.match(re);
    if (m) return fn(m[1], m[2]);
  }
  return null;
};

// ── escopo ────────────────────────────────────────────────────────────────────
const ESCOPOS = [
  "CLAUDE.md",
  "README.md",
  "SUBMODULE-SETUP.md",
  ".claude/rules",
  ".claude/skills",
  ".claude/commands",
  ".claude/agents",
  ".ai/context",
  ".ai/rules",
  "cli/templates/default",
];
// Registro histórico não se audita: descreve o que ERA verdade na data. Reescrevê-lo
// apaga a evidência de por que a regra existe.
const PULAR =
  /lessons(-archive)?\.md$|pipeline-state\.md$|[\\/]audits[\\/]|[\\/]archive[\\/]|[\\/]specs[\\/]|README-PIPELINE-WORKFLOW\.md$/;

const walk = (p, out = []) => {
  if (!fs.existsSync(p)) return out;
  if (fs.statSync(p).isFile()) return (out.push(p), out);
  for (const e of fs.readdirSync(p)) walk(path.join(p, e), out);
  return out;
};
const docs = ESCOPOS.flatMap((e) => walk(path.join(RAIZ, e))).filter(
  (f) => /\.mdx?$/.test(f) && !PULAR.test(f)
);

// Linha que ENSINA a ausência da classe é a correção, não o defeito.
const NEGA = /n[aã]o (?:existe|emite|há)|extint|mort[ao]|proibid|NUNCA|nunca|EXTINTA|V2|deveria/;

const RE_CLASSE =
  /(?<![\w-])((?:gap|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr)-(?:gp|sp|pad)-[a-z0-9-]+|gap-form-gap|(?:min-)?h-form-[a-z0-9]+|size-(?:icon|comp)-[a-z0-9]+|h-layout-[a-z0-9-]+|rounded-radius-[a-z0-9]+|shadow-sh-[a-z0-9-]+|(?:bg|text|border|ring)-(?:bg|fg|border|ring|overlay|chart)-[a-z0-9-]+|max-w-container-[a-z0-9-]+)(?![\w-])/g;

const mortas = new Map();
const divergentes = [];

for (const f of docs) {
  const rel = path.relative(RAIZ, f).split(path.sep).join("/");
  for (const linha of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    if (NEGA.test(linha)) continue;
    for (const m of linha.matchAll(RE_CLASSE)) {
      const cls = m[1];

      // A) classe que não emite CSS
      if (cls.startsWith("max-w-container-")) {
        const k = `${cls}  (L-057: container não dobra prefixo)`;
        (mortas.get(k) ?? mortas.set(k, new Set()).get(k)).add(rel);
        continue;
      }
      const v = varDaClasse(cls);
      if (v && !VARS.has(v)) {
        (mortas.get(cls) ?? mortas.set(cls, new Set()).get(cls)).add(rel);
        continue;
      }

      // B) valor afirmado na mesma linha que diverge do real
      if (!v) continue;
      const real = paraPx(VARS.get(v));
      if (real === null) continue;
      const nums = [...linha.matchAll(/\b(\d{1,4})\s*(?:px\b|[–\-/]\s*\d)/g)].map((x) => +x[1]);
      if (!nums.length || nums.some((n) => Math.abs(n - real) < 0.51)) continue;
      divergentes.push({ arquivo: rel, classe: cls, real, naDoc: nums, linha: linha.trim().slice(0, 110) });
    }
  }
}

console.log(`tema: ${VARS.size} CSS vars · docs auditadas: ${docs.length}\n`);

console.log(`A) CLASSES CITADAS QUE NÃO EMITEM CSS: ${mortas.size}`);
for (const [c, arqs] of mortas) console.log(`   ${c.padEnd(32)} ← ${[...arqs].slice(0, 3).join(", ")}`);

const unicos = [];
const vistos = new Set();
for (const d of divergentes) {
  const k = `${d.arquivo}|${d.classe}|${d.naDoc.join(",")}`;
  if (vistos.has(k)) continue;
  vistos.add(k);
  unicos.push(d);
}
console.log(`\nB) VALORES QUE DIVERGEM DO CSS: ${unicos.length}`);
for (const d of unicos)
  console.log(`   ${d.classe.padEnd(24)} real=${String(d.real).padEnd(5)} doc=${d.naDoc.join("/")}  ${d.arquivo}\n      ${d.linha}`);

console.log(
  `\n${mortas.size + unicos.length === 0 ? "✓ nenhum candidato" : `${mortas.size + unicos.length} candidato(s) — TRIE cada um: número de outro elemento na mesma linha é falso positivo comum`}`
);
