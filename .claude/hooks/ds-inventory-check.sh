#!/usr/bin/env bash
# ds-inventory-check — alerta quando componente em src/components/ui/<Nome>/
# tem .styles.ts mas falta USAGE.md OU não consta em .ai/context/components/inventory.md.
#
# Trigger: PostToolUse matcher "Edit|Write"
# Input:   JSON via stdin com tool_input.file_path
#
# Não bloqueia. Fecha L-016 automaticamente: avisa enquanto Claude está editando,
# em vez de descobrir só na auditoria retroativa.

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
INVENTORY="$PROJECT_ROOT/.ai/context/components/inventory.md"
mkdir -p "$LOG_DIR" 2>/dev/null
TS="$(date '+%Y-%m-%d %H:%M:%S')"

[ -z "$FILE" ] && exit 0

# Só dispara em src/components/ui/<Nome>/<algo>.{ts,tsx}
# Captura o nome do componente (pasta dentro de ui/)
COMP_NAME=$(echo "$FILE" | sed -nE 's|.*src/components/ui/([^/]+)/.*|\1|p')

# Fora de ui/<Nome>/, ignora
[ -z "$COMP_NAME" ] && exit 0

COMP_DIR="$PROJECT_ROOT/src/components/ui/$COMP_NAME"
[ ! -d "$COMP_DIR" ] && exit 0

MISSING=""

# 1. USAGE.md ausente
if [ ! -f "$COMP_DIR/USAGE.md" ]; then
  MISSING="$MISSING
  • USAGE.md ausente em src/components/ui/$COMP_NAME/
       → crie um arquivo curto: O que é + Quando usar + Props essenciais + Exemplo mínimo + Gotchas"
fi

# 2. Não consta no inventory.md (busca case-insensitive pelo nome do componente)
if [ -f "$INVENTORY" ]; then
  if ! grep -qiE "\b$COMP_NAME\b" "$INVENTORY" 2>/dev/null; then
    MISSING="$MISSING
  • $COMP_NAME não consta em .ai/context/components/inventory.md
       → adicione uma linha na tabela de componentes ui/ (L-016)"
  fi
fi

if [ -n "$MISSING" ]; then
  echo "[$TS] ds-inventory-check: WARN $COMP_NAME ($FILE)" >> "$LOG_FILE" 2>/dev/null
  {
    echo ""
    echo "⚠️  ds-inventory-check — '$COMP_NAME' tem pendências de documentação:"
    echo "$MISSING"
    echo ""
    echo "   L-016: USAGE.md + inventory.md devem ser atualizados no MESMO commit do componente."
    echo ""
  } >&2
else
  echo "[$TS] ds-inventory-check: OK   $COMP_NAME" >> "$LOG_FILE" 2>/dev/null
fi

exit 0
