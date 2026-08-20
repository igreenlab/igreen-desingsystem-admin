#!/usr/bin/env bash
# ds-blocks-check — avisa quando um arquivo de bloco (src/blocks/**/*.tsx) é criado ou editado.
#
# Trigger: PostToolUse matcher "Edit|Write"
# Input:   JSON via stdin com tool_input.file_path
#
# Não bloqueia. Fecha o loop "criei o bloco → esqueci de gerar", que é o único passo manual
# do fluxo de crescimento do catálogo:
#
#     1. criar src/blocks/<categoria>/<nome>.tsx com `export const BLOCK = {...}`
#     2. npm run blocks:build     ← este hook existe por causa deste passo
#
# Sem o passo 2, o bloco fica INVISÍVEL pro consumidor: o índice que o Passo 0 do `ds-kit` lê
# (`_claude/skills/ds-kit/blocks-index.md`) e o item `registry:block` do `igreen:add` são
# gerados. A galeria do showcase auto-descobre por `import.meta.glob`, então ele APARECE no
# showcase mesmo sem gerar — e é justamente isso que torna o esquecimento fácil de não notar:
# você vê o bloco na tela e conclui que está pronto.
#
# O `npm test` reprova (o teste "o índice do consumidor está em sync") e o `release:check`
# também. Mas os dois acontecem depois — este hook avisa no momento em que o arquivo é escrito.

set +e

INPUT_JSON=$(cat)
if command -v jq >/dev/null 2>&1; then
  FILE=$(printf '%s' "$INPUT_JSON" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
elif command -v node >/dev/null 2>&1; then
  FILE=$(printf '%s' "$INPUT_JSON" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const j=JSON.parse(d);process.stdout.write(j?.tool_input?.file_path||'')}catch(e){}})" 2>/dev/null)
else
  FILE=""
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_DIR="$PROJECT_ROOT/.ai/scratch"
LOG_FILE="$LOG_DIR/hook-log.txt"
mkdir -p "$LOG_DIR" 2>/dev/null
TS="$(date '+%Y-%m-%d %H:%M:%S')"

[ -z "$FILE" ] && exit 0

# ⚠️ Normaliza `\` antes de qualquer matching: o harness manda path do Windows com
# backslash, e sem isto o case NUNCA casa — a rede de segurança fica no-op em silêncio
# (L-044, medido: uma sessão inteira com os hooks inertes por isso).
NORM=$(printf '%s' "$FILE" | tr '\\' '/')

# Só dispara em .tsx de bloco. `_shared/` e arquivos com `_` são helpers, não blocos.
case "$NORM" in
  */src/blocks/*.tsx|src/blocks/*.tsx) ;;
  *) exit 0 ;;
esac
case "$NORM" in
  */src/blocks/_*|src/blocks/_*) exit 0 ;;
esac
BASENAME="${NORM##*/}"
case "$BASENAME" in
  _*|*.test.tsx) exit 0 ;;
esac

# Se o índice já cita este arquivo E está em sync, não há o que avisar.
INDICE="$PROJECT_ROOT/cli/templates/default/_claude/skills/ds-kit/blocks-index.md"
REL="${NORM#*/src/blocks/}"
if [ -f "$INDICE" ] && grep -q "src/blocks/$REL" "$INDICE" 2>/dev/null; then
  if (cd "$PROJECT_ROOT" && node scripts/blocks-build.mjs --check >/dev/null 2>&1); then
    echo "[$TS] ds-blocks-check: OK   $BASENAME (índice em sync)" >> "$LOG_FILE" 2>/dev/null
    exit 0
  fi
fi

echo "[$TS] ds-blocks-check: WARN $FILE" >> "$LOG_FILE" 2>/dev/null
{
  echo ""
  echo "⚠️  ds-blocks-check — bloco criado/alterado: $FILE"
  echo ""
  echo "  • Gere os artefatos:   npm run blocks:build"
  echo ""
  echo "    Sai daí: o índice que a IA do consumidor lê"
  echo "    (_claude/skills/ds-kit/blocks-index.md, via Passo 0 do ds-kit) e o item"
  echo "    registry:block que faz o \`igreen:add -- <id>\` funcionar no copy-in."
  echo ""
  echo "  ⚠️  A galeria do showcase auto-descobre por import.meta.glob, então o bloco"
  echo "     APARECE na tela mesmo sem gerar. É por isso que esquecer é fácil: você vê"
  echo "     o bloco e conclui que está pronto — mas o consumidor não o alcança."
  echo ""
  echo "  • Se mexeu no registry.json: rode também npm run registry:build + o copy do embed."
  echo ""
  echo "  ℹ️  O arquivo FOI escrito — este hook é PostToolUse e não desfaz nada."
  echo "     Não repita o Edit: siga e rode o comando acima."
  echo ""
} >&2

# ⛔ `exit 2`, não 0 — MEDIDO em 2026-08-17 e reconfirmado em 2026-08-20. Com `exit 0` a
# saída deste hook NÃO chega no agente (nem stderr, nem stdout): fica só no hook-log.txt,
# que ninguém abre sem motivo. Com `exit 2` chega, rotulada pelo harness como "blocking
# error", e o arquivo continua escrito porque PostToolUse roda DEPOIS da tool. Foi
# exatamente assim que o ds-tokens-check me fez rodar o `tokens:tw4` na hora, nesta sessão.
exit 2
