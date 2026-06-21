#!/usr/bin/env bash
# block-sensitive-edit — bloqueia Edit/Write em arquivos sensíveis.
# Trigger: PreToolUse matcher "Edit|Write"
# Input: JSON via stdin com tool_input.file_path
#
# Exit 0 = libera; Exit 2 = BLOQUEIA + msg no stderr (Claude vê). (exit 1 NÃO bloqueia
# no Claude Code — é só warning não-bloqueante.)
# Log: .ai/scratch/hook-log.txt

set +e

INPUT_JSON=$(cat)
if command -v jq >/dev/null 2>&1; then
  FILE=$(printf '%s' "$INPUT_JSON" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
elif command -v node >/dev/null 2>&1; then
  FILE=$(printf '%s' "$INPUT_JSON" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{process.stdout.write(JSON.parse(d)?.tool_input?.file_path||'')}catch(e){}})" 2>/dev/null)
else
  FILE=""
fi
FILE=$(printf '%s' "$FILE" | tr '\\' '/')  # normaliza paths Windows pro matching

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_DIR="$PROJECT_ROOT/.ai/scratch"
LOG_FILE="$LOG_DIR/hook-log.txt"
mkdir -p "$LOG_DIR" 2>/dev/null
TS="$(date '+%Y-%m-%d %H:%M:%S')"

[ -z "$FILE" ] && exit 0

# Lista de padrões protegidos
case "$FILE" in
  *.env|*.env.*|*/.env|*/.env.*)
    echo "[$TS] block-sensitive: BLOCK env  $FILE" >> "$LOG_FILE" 2>/dev/null
    echo "BLOQUEADO: edição em arquivo .env não permitida. Confirme com o usuário antes." >&2
    exit 2
    ;;
  */secrets/*|*/credentials/*|*credentials.json|*.pem|*.key|*id_rsa*|*_rsa)
    echo "[$TS] block-sensitive: BLOCK secret $FILE" >> "$LOG_FILE" 2>/dev/null
    echo "BLOQUEADO: edição em credencial/segredo não permitida." >&2
    exit 2
    ;;
  */migrations/*)
    echo "[$TS] block-sensitive: BLOCK migration $FILE" >> "$LOG_FILE" 2>/dev/null
    echo "BLOQUEADO: edição em migrations não permitida. Confirme com o usuário antes." >&2
    exit 2
    ;;
  */.git/*)
    echo "[$TS] block-sensitive: BLOCK .git $FILE" >> "$LOG_FILE" 2>/dev/null
    echo "BLOQUEADO: edição direta em .git/ não permitida — use comandos git." >&2
    exit 2
    ;;
esac

# Libera (sem log de allow pra não poluir)
exit 0
