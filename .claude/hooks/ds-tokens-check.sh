#!/usr/bin/env bash
# ds-tokens-check — avisa quando um token-fonte (tokens/**/*.ts) é editado.
#
# Trigger: PostToolUse matcher "Edit|Write"
# Input:   JSON via stdin com tool_input.file_path
#
# Não bloqueia. Fecha o loop "editei token → esqueci de regenerar/distribuir":
# token alterado precisa de tokens:tw4 (regenera o CSS) e, pra chegar no
# consumidor, de registry:build + bump de versão (/ds-release). Tokens/theme são
# versionados via meta.stamp = package.json.version no item @igreen/theme.

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

# Só dispara em tokens/**/*.ts (ignora os .md de doc dos tokens e os transforms)
NORM=$(printf '%s' "$FILE" | tr '\\' '/')
case "$NORM" in
  */tokens/*.ts|tokens/*.ts) ;;
  *) exit 0 ;;
esac
# Ignora os transforms (não são tokens-fonte)
case "$NORM" in
  */tokens/transforms/*|tokens/transforms/*) exit 0 ;;
esac

echo "[$TS] ds-tokens-check: WARN $FILE" >> "$LOG_FILE" 2>/dev/null
{
  echo ""
  echo "⚠️  ds-tokens-check — token-fonte alterado: $FILE"
  echo "  • Regenere o CSS:   npm run tokens:tw4   (→ src/styles/theme/tailwind-theme.css)"
  echo "  • Pra o consumidor receber: o tema (@igreen/theme) e os componentes só atualizam"
  echo "    via registry:build + bump de versão → use /ds-release (re-carimba o stamp na"
  echo "    versão nova + embed + deploy). Tokens/theme são versionados pelo stamp ="
  echo "    package.json.version. Se mexeu em cn/tv/theme: rode npm run cli:rebake + bump do CLI."
  echo ""
} >&2

exit 0
