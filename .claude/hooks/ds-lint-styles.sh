#!/usr/bin/env bash
# ds-lint-styles — valida arquivos .styles.ts contra L-001..L-007.
# Trigger: PostToolUse matcher "Edit|Write"
# Input:   JSON via stdin com tool_input.file_path
#
# Não bloqueia. Apenas escreve um aviso em stderr (Claude vê + usuário vê)
# quando detecta padrão anti-DS. Loga sempre em .ai/scratch/hook-log.txt.
#
# Lições verificadas (resumo):
#   L-001  ring-ring-*/30, /20         → token já tem alpha, modificador errado
#   L-002  gap-4, p-4, h-9, h-10, etc  → existe equivalente DS (gap-gp-md...)
#   L-003  ring-3                       → não existe no Tailwind, usar ring-4
#   L-004  outline-none avulso          → exige focus-visible:outline-none
#   L-005  bg-input/50                  → usar bg-bg-surface (token DS)
#   L-007  text-xs font-semibold avulso → usar preset text-label-xs
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

WARNINGS=""
FOUND=0

check() {
  local pattern="$1"
  local label="$2"
  local matches
  matches=$(grep -nE "$pattern" "$FILE" 2>/dev/null | head -3)
  if [ -n "$matches" ]; then
    FOUND=$((FOUND + 1))
    WARNINGS="$WARNINGS
  • $label
$(echo "$matches" | sed 's/^/      /')"
  fi
}

# L-001 — ring-ring-*/<num> (token já tem alpha)
check 'ring-ring-[a-z-]+/[0-9]+' "L-001 — ring-ring-*/N detectado (token já tem alpha; remova o /N)"

# L-002 — Tailwind literal com equivalente DS
#  gap-N (não gp-), p-N/px-N/py-N puro, h-9 h-10 h-11 h-7 h-8 fixos
check '"[^"]*\bgap-(0|1|2|3|4|5|6|7|8|10|12|16|20|24)\b[^"]*"' "L-002 — gap-N literal (use gap-gp-{xs,sm,md,lg,xl})"
check '"[^"]*\b(px|py|pt|pb|pl|pr|p)-(0|1|2|3|4|5|6|7|8|10|12|16)\b[^"]*"' "L-002 — pad/space literal (use p-sp-* ou px-pad-*)"
check '"[^"]*\b(h|min-h)-(7|8|9|10|11|12)\b[^"]*"' "L-002 — height fixo h-N (use min-h-form-{xs,sm,md,lg,xl})"
check '"[^"]*\brounded-(none|sm|md|lg|xl|2xl|3xl|full)\b[^"]*"' "L-002 — rounded-N nativo (use rounded-radius-*)"
check '"[^"]*\bshadow-(sm|md|lg|xl|2xl)\b(?!-)' "L-002 — shadow-N nativo (use shadow-sh-*)"

# L-003 — ring-3 não existe
check '"[^"]*\bring-3\b[^"]*"' "L-003 — ring-3 não existe no Tailwind (use ring-4)"

# L-004 — outline-none sem focus-visible:
#  detecta outline-none não precedido por "focus-visible:" na mesma string
check '"[^"]*(^|[ "])outline-none[^"]*"' "L-004 — outline-none sem focus-visible: (acessibilidade)"

# L-005 — bg-input/N (precisa ser bg-bg-surface)
check '"[^"]*\bbg-input/[0-9]+[^"]*"' "L-005 — bg-input/N detectado (use bg-bg-surface ou bg-bg-muted)"

# L-007 — text-xs font-semibold/medium avulso (sugerir preset)
check '"[^"]*\btext-xs\s+font-(semibold|medium|bold)\b[^"]*"' "L-007 — text-xs + font-* avulso (use text-label-xs)"

# tv import de tailwind-variants ao invés de @/utils/tv
check 'from\s+"tailwind-variants"' "import errado — use 'import { tv } from \"@/utils/tv\"'"

if [ "$FOUND" -gt 0 ]; then
  echo "[$TS] ds-lint-styles: WARN ($FOUND) $FILE" >> "$LOG_FILE" 2>/dev/null
  {
    echo ""
    echo "⚠️  ds-lint-styles — $FOUND padrão(ões) anti-DS em $(basename "$FILE"):"
    echo "$WARNINGS"
    echo ""
    echo "   Referência completa: .claude/rules/ds-standards.md (seção Anti-patterns)"
    echo "   Tokens disponíveis:  .ai/context/tokens/"
    echo ""
  } >&2
else
  echo "[$TS] ds-lint-styles: OK   $FILE" >> "$LOG_FILE" 2>/dev/null
fi

# Não bloqueia o Edit
exit 0
