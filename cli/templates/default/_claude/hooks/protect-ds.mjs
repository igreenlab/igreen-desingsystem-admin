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
 *
 * Robusto por design: qualquer erro de parse → libera (exit 0). Nunca trava o fluxo
 * do consumidor por bug do próprio hook.
 */
import { readFileSync } from "node:fs";

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

process.exit(0);
