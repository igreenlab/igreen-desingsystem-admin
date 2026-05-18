#!/usr/bin/env bash
# format-on-save — roda prettier em arquivos .ts/.tsx editados pelo Claude.
# Idempotente: sempre retorna 0, mesmo se prettier falhar (não bloqueia Edit).
#
# Trigger: PostToolUse matcher "Edit|Write"
# Input: JSON via stdin com tool_input.file_path
# Log:   .ai/scratch/hook-log.txt  (debug; criado on-demand, append-only)

set +e  # não abortar em erro

# Lê file_path do stdin (JSON)
FILE=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)

# Resolve raiz do projeto a partir da localização do script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
LOG_DIR="$PROJECT_ROOT/.ai/scratch"
LOG_FILE="$LOG_DIR/hook-log.txt"

mkdir -p "$LOG_DIR" 2>/dev/null
TS="$(date '+%Y-%m-%d %H:%M:%S')"

# Sai silenciosamente se não houver file_path (mas loga)
if [ -z "$FILE" ]; then
  echo "[$TS] format-on-save: skip (no file_path)" >> "$LOG_FILE" 2>/dev/null
  exit 0
fi

# Só formata .ts/.tsx/.js/.jsx/.json/.md
case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.md)
    if command -v npx >/dev/null 2>&1; then
      if npx --no-install prettier --write "$FILE" >/dev/null 2>&1; then
        echo "[$TS] format-on-save: OK  $FILE" >> "$LOG_FILE" 2>/dev/null
      else
        echo "[$TS] format-on-save: FAIL $FILE (prettier exit non-zero)" >> "$LOG_FILE" 2>/dev/null
      fi
    else
      echo "[$TS] format-on-save: skip (npx not found) $FILE" >> "$LOG_FILE" 2>/dev/null
    fi
    ;;
  *)
    echo "[$TS] format-on-save: skip (ext not handled) $FILE" >> "$LOG_FILE" 2>/dev/null
    ;;
esac

# Sempre sucesso — não bloquear o Edit do Claude
exit 0
