#!/usr/bin/env node
/**
 * protect-ds.mjs — PreToolUse hook (Edit|Write) que protege a integridade do
 * iGreen DS no projeto consumidor.
 *
 * - BLOQUEIA (exit 2) edição de arquivos GERENCIADOS que quebram o sistema todo:
 *   tema/tokens (src/styles/theme/**) e a fundação (cn em src/lib/utils.ts,
 *   tv em src/utils/tv.ts, src/lib/lucide-types.ts). Esses NÃO se editam à mão —
 *   customize na composição ou re-sincronize com o DS (`npm run igreen:add -- theme`).
 * - AVISA (exit 1, não bloqueia) edição de um componente do DS (src/components/ui/**):
 *   é código seu, mas vira "edição local" (drift). Prefira customizar na composição.
 * - AVISA (exit 1) quando o CONTEÚDO sendo escrito tem anti-pattern de estilo:
 *   hex cru, `gap-4`, `h-10`, `rounded-lg`, alpha em ring-ring… Ver abaixo.
 *
 * ## O lint de conteúdo (entrou em 2026-08-08)
 *
 * Até então este hook inspecionava **só o `file_path`**. Consequência medida na
 * auditoria: `bg-[#0fff00]` ou `gap-13` numa tela nova (`src/pages/Foo.tsx`) passava
 * **100% limpo** — o consumidor não tinha lint de estilo em canal nenhum, enquanto o
 * repo do DS tem `ds-lint-styles` + ratchet no CI desde sempre. A orientação existia
 * (`.claude/rules/ds-design.md`), mas era **só texto**, e texto é o que falha.
 *
 * A tabela de padrões é **a mesma do CI do DS** (`scripts/lib/ds-lint-patterns.mjs`),
 * bakeada aqui como foundational — `check-foundationals` reprova se divergirem. Nunca
 * reescreva os regexes neste arquivo: edite a fonte no DS e rode `npm run cli:rebake`.
 *
 * ⚠️ **AVISA, não bloqueia**, e isso é deliberado: o consumidor é dono do código dele,
 * e a decisão de usar um valor fora do sistema pode ser legítima (marca de terceiro,
 * embed, print). O que não pode é ser **silencioso**. Bloquear aqui transformaria o
 * kit num obstáculo e o primeiro reflexo seria desligar o hook.
 *
 * Robusto por design: qualquer erro de parse → libera (exit 0). Nunca trava o fluxo
 * do consumidor por bug do próprio hook.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

let payload;
try {
  payload = JSON.parse(readStdin() || "{}");
} catch {
  process.exit(0);
}

const input = payload.tool_input || payload.toolInput || {};

// ── Bash: o caminho que escapava do hook ─────────────────────────────────────
// O matcher era só `Edit|Write`, então `sed -i`, `cp`, `>` e `node -e fs.writeFileSync`
// escreviam nos arquivos gerenciados sem passar por aqui. Evidência real do dogfood:
// o `my-app/src/styles/theme/tailwind-theme.css` ficou modificado — arquivo que este
// hook deveria bloquear — porque a escrita veio por shell.
//
// ⚠️ AVISA, não bloqueia. Parsear shell pra decidir "isto escreve?" é heurística, e
// heurística que BLOQUEIA vira obstáculo no primeiro falso-positivo — e o reflexo
// seguinte é desligar o hook. O objetivo aqui é não ser silencioso.
const cmd = String(input.command ?? "");
if (cmd) {
  const escreve = />>?\s|(^|\s)(sed\s+-i|tee|cp|mv|rm)\s|writeFileSync|truncate/.test(cmd);
  const tocaGerenciado = /src[\\/](styles[\\/]theme|lib[\\/](utils|lucide-types)\.ts|utils[\\/]tv\.ts)/.test(cmd);
  if (escreve && tocaGerenciado) {
    process.stderr.write(
      "⚠ Este comando parece ESCREVER num arquivo gerenciado pelo iGreen DS.\n" +
        `   ${cmd.slice(0, 200)}\n` +
        "   Tema/tokens e cn/tv somem no próximo update — customize na composição\n" +
        "   ou re-sincronize com `npm run igreen:add -- theme`.\n" +
        "   (aviso, não bloqueio: shell não dá pra classificar com certeza.)\n",
    );
    process.exit(1);
  }
  process.exit(0);
}

const raw = input.file_path || input.path || input.filePath || "";
if (!raw) process.exit(0);

const p = String(raw).replace(/\\/g, "/");

// Caminhos gerenciados pelo DS — bloquear edição manual.
const BLOCK = [
  "/src/styles/theme/",
  "src/styles/theme/",
  "/src/lib/utils.ts",
  "src/lib/utils.ts",
  "/src/utils/tv.ts",
  "src/utils/tv.ts",
  "/src/lib/lucide-types.ts",
  "src/lib/lucide-types.ts",
];
const isBlocked = BLOCK.some((b) => p.includes(b));

// Componente do DS — permitido, mas avisar (drift).
const isComponentEdit = /\/src\/components\/ui\//.test(p) || /^src\/components\/ui\//.test(p);

if (isBlocked) {
  process.stderr.write(
    "⛔ Arquivo GERENCIADO pelo iGreen DS — não edite à mão.\n" +
      `   ${raw}\n` +
      "   Tema/tokens e cn/tv são a fundação visual; editar aqui quebra o sistema todo\n" +
      "   e some no próximo update. Em vez disso:\n" +
      "   • Customize na COMPOSIÇÃO da sua tela (props + classes DS), não no token.\n" +
      "   • Pra mudar o tema, re-sincronize com o DS (ex.: npm run igreen:add -- theme).\n" +
      "   Veja DESIGN.md + .claude/rules/ds-design.md.\n",
  );
  process.exit(2); // bloqueia
}

if (isComponentEdit) {
  process.stderr.write(
    "⚠ Você está editando um COMPONENTE do iGreen DS (vira edição local / drift).\n" +
      `   ${raw}\n` +
      "   Prefira customizar na COMPOSIÇÃO (props/variantes + classes na sua tela).\n" +
      "   Se a mudança é intencional e específica do seu projeto, pode seguir —\n" +
      "   mas o `npm run igreen:update` vai pular este arquivo pra não sobrescrever.\n",
  );
  process.exit(1); // avisa, não bloqueia
}

// ── Lint de conteúdo ─────────────────────────────────────────────────────────
// Só em arquivo de UI. `.css`/`.json`/`.md` ficam de fora: hex em CSS é legítimo
// (é onde o token é DEFINIDO) e falso-positivo em massa mata a credibilidade do aviso.
if (!/\.(tsx|jsx)$/.test(p)) process.exit(0);

// `content` (Write) ou `new_string` (Edit) — só o que está ENTRANDO, nunca o arquivo
// inteiro: avisar sobre linha que o usuário não tocou é ruído (é o mesmo princípio do
// ratchet do CI do DS, que só olha linha adicionada pelo diff).
const novo = input.content ?? input.new_string ?? input.newString ?? "";
if (!novo) process.exit(0);

// ⚠️ `scanLines` recebe `Array<{n, text}>`, NÃO array de string. Passar string crua
// faz o destructuring devolver `undefined` e o scan retorna [] — sem erro, sem aviso.
// Aconteceu na 1ª versão deste hook: presumi o shape em vez de ler a assinatura, e o
// lint ficou mudo (L-064 — "monte a entrada pela função de produção que a gera").
const linhasNum = String(novo)
  .split("\n")
  .map((text, i) => ({ n: i + 1, text }));

let achados = [];
try {
  const aqui = dirname(fileURLToPath(import.meta.url));
  // ⚠️ `pathToFileURL` é OBRIGATÓRIO. No Windows, `import()` com path absoluto
  // (`D:\...\ds-lint-patterns.mjs`) lança ERR_UNSUPPORTED_ESM_URL_SCHEME — o Node lê
  // `D:` como esquema de URL. Como o catch abaixo libera em silêncio, o lint ficava
  // MUDO exatamente na plataforma em que o DS é desenvolvido. É a L-044 na forma
  // moderna: hook que depende de detalhe de path some sem avisar no Windows.
  const { scanLines } = await import(pathToFileURL(join(aqui, "ds-lint-patterns.mjs")).href);
  achados = scanLines(linhasNum);
} catch {
  process.exit(0); // tabela ausente/ilegível → libera, nunca trava por bug do hook
}

// Hex cru não está na tabela do DS (lá, `dead-theme-classes` cobre o eixo de cor de
// outro jeito). Aqui é o anti-pattern nº 1 do consumidor, então entra à parte.
for (const { n, text } of linhasNum) {
  if (/(?:bg|text|border|ring|fill|stroke)-\[#[0-9a-fA-F]{3,8}\]/.test(text)) {
    achados.push({
      id: "HEX",
      n,
      text: text.trim(),
      msg: "cor hex crua → use token DS (bg-bg-*, text-fg-*, border-border-*). Se a cor vem de dado externo (marca de terceiro), passe por prop/style inline, não por classe.",
    });
  }
}

if (achados.length) {
  const linhas = achados
    .slice(0, 6)
    .map((a) => `   • [${a.id}] linha ${a.n}: ${a.msg}\n     ${a.text.slice(0, 100)}`)
    .join("\n");
  process.stderr.write(
    `⚠ ${achados.length} anti-pattern(s) de estilo no que você está escrevendo:\n` +
      `   ${raw}\n${linhas}\n` +
      (achados.length > 6 ? `   … e mais ${achados.length - 6}.\n` : "") +
      "   Tabela: .claude/rules/ds-design.md · DESIGN.md · .claude/rules/ds-components.md\n" +
      "   (aviso, não bloqueio — se o valor fora do sistema é intencional, siga.)\n",
  );
  process.exit(1);
}

process.exit(0);
