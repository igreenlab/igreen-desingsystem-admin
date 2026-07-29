#!/usr/bin/env bash
# ds-lint-styles — valida arquivos .styles.ts contra L-001/L-002/L-003/L-005 + import.
# Trigger: PostToolUse matcher "Edit|Write"
# Input:   JSON via stdin com tool_input.file_path
#
# Não bloqueia. Apenas escreve um aviso em stderr (Claude vê + usuário vê)
# quando detecta padrão anti-DS. Loga sempre em .ai/scratch/hook-log.txt.
#
# Detecção delegada a scripts/lib/ds-lint-patterns.mjs (via scripts/lint-styles.mjs)
# — fonte única compartilhada com o check de CI. Não reintroduza greps aqui.
#
# Lições verificadas (resumo):
#   L-001  ring-ring-*/30, /20         → token já tem alpha, modificador errado
#   L-002  gap-4, p-4, h-9, h-10, etc  → existe equivalente DS (gap-gp-md...)
#   L-003  ring-3                       → não existe no Tailwind, usar ring-4
#   L-005  bg-input/50                  → usar bg-bg-surface (token DS)
#   import de "tailwind-variants"       → usar "@/utils/tv"
#
#   L-004 (outline-none avulso) SAIU do conjunto — é semântica, não estrutural
#   (falso-positivo alto: casos legítimos de outline-none sem foco visível
#   próprio). Ver .ai/specs/pipeline-governance-ci.md §1.1 pro porquê.
#
# Pula: arquivos que não são src/components/**/*.styles.ts ou *.tsx em ui/.

set +e

# Lê JSON do stdin uma vez; tenta jq, depois python como fallback.
INPUT_JSON=$(cat)
# Tenta jq (Linux/Mac/CI), depois node (sempre disponível em projeto JS) como fallback.
if command -v jq >/dev/null 2>&1; then
  FILE=$(printf '%s' "$INPUT_JSON" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
elif command -v node >/dev/null 2>&1; then
  FILE=$(printf '%s' "$INPUT_JSON" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const j=JSON.parse(d);process.stdout.write(j?.tool_input?.file_path||'')}catch(e){}})" 2>/dev/null)
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

# Só roda em arquivos relevantes: *.styles.ts ou tsx dentro de src/components/
case "$FILE" in
  *src/components/*styles.ts|*src/components/*styles.tsx) : ;;
  *) exit 0 ;;
esac

# Arquivo precisa existir (Write pode ter falhado antes do hook)
[ ! -f "$FILE" ] && exit 0

# Detecção delegada ao módulo Node — FONTE ÚNICA compartilhada com o check de
# CI (scripts/lib/ds-lint-patterns.mjs). Não reintroduza greps aqui: duplicar a
# tabela é como ds-inventory-check e distribution-debt passaram a divergir.
if command -v node >/dev/null 2>&1; then
  # stderr do node capturado junto: se o script quebrar, queremos ver, não
  # engolir e logar OK falso.
  OUTPUT=$(node "$PROJECT_ROOT/scripts/lint-styles.mjs" --file "$FILE" 2>&1)
  if [ -n "$OUTPUT" ]; then
    echo "[$TS] ds-lint-styles: WARN $FILE" >> "$LOG_FILE" 2>/dev/null
    printf '%s\n' "$OUTPUT" >&2
  else
    echo "[$TS] ds-lint-styles: OK   $FILE" >> "$LOG_FILE" 2>/dev/null
  fi
else
  echo "[$TS] ds-lint-styles: SKIP (node ausente) $FILE" >> "$LOG_FILE" 2>/dev/null
fi

# Nunca bloqueia o Edit — só o CI decide reprovar.
exit 0
