#!/usr/bin/env bash
# ds-inventory-check — alerta quando componente em src/components/ui/<Nome>/
# tem pendência de superfície: USAGE.md, inventory.md, registry.json,
# (se já distribuído) catálogo do CLI (cli/templates/default/CLAUDE.md), OU
# (se a DocPage existe) registro de showcase no App.tsx/DOC_PAGES + nav.
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
FILE=$(printf '%s' "$FILE" | tr '\\' '/')  # normaliza paths Windows pro matching

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

# Nome kebab do registry/showcase (PascalCase → kebab): Toast→toast, DatePicker→date-picker
KEBAB=$(echo "$COMP_NAME" | sed -E 's/([a-z0-9])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]')

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

# 3. Não consta no registry.json → NÃO será distribuído via @igreen/* (gap de distribuição)
#    registry.json referencia os arquivos por path src/components/ui/<Nome>/...
#    (TabelaTeste é demo interno intencional — não avisa)
REGISTRY="$PROJECT_ROOT/registry.json"
IN_REGISTRY=0
if [ -f "$REGISTRY" ] && [ "$COMP_NAME" != "TabelaTeste" ]; then
  if grep -q "src/components/ui/$COMP_NAME/" "$REGISTRY" 2>/dev/null; then
    IN_REGISTRY=1
  else
    MISSING="$MISSING
  • $COMP_NAME não consta em registry.json → NÃO será distribuído (consumidor não recebe via @igreen/*)
       → node scripts/registry-add-item.mjs $COMP_NAME → revisar/adicionar ao registry.json → npm run registry:build
       (mudança em componente já distribuído também exige registry:build + bump de versão via /ds-release)"
  fi
fi

# 4. Distribuído mas FORA do catálogo do CLI → scaffolds novos não conhecem o componente
#    (catálogo usa nome kebab do registry: Toast→toast, DatePicker→date-picker)
CLI_CATALOG="$PROJECT_ROOT/cli/templates/default/CLAUDE.md"
if [ "$IN_REGISTRY" = "1" ] && [ -f "$CLI_CATALOG" ]; then
  if ! grep -qiE "\`$KEBAB\`|\b$KEBAB\b" "$CLI_CATALOG" 2>/dev/null; then
    MISSING="$MISSING
  • $COMP_NAME (kebab: $KEBAB) está no registry mas NÃO no catálogo do CLI (cli/templates/default/CLAUDE.md)
       → adicione ao catálogo (composites/feedback/etc) + bump cli/package.json + republicar CLI
       (sem isso, projetos novos scaffoldados não sabem que o componente existe)"
  fi
fi

# 5. Showcase — se existe a DocPage padrão <Nome>Doc.tsx, ela TEM que estar roteada
#    no App.tsx (DOC_PAGES + activePage) E ter entrada na nav. Pega o caso clássico
#    de DocPage criada mas não registrada (render em branco — bug do Toast/DOC_PAGES).
#    Precisão > recall: só dispara quando há intenção clara de showcase (a DocPage existe).
DOCPAGE="$PROJECT_ROOT/src/preview/pages/${COMP_NAME}Doc.tsx"
APP_TSX="$PROJECT_ROOT/src/App.tsx"
NAV_DATA="$PROJECT_ROOT/src/preview/components/doc-nav-data.ts"
if [ -f "$DOCPAGE" ]; then
  SHOWCASE_GAP=""
  if [ -f "$APP_TSX" ] && ! grep -q "\"$KEBAB\"" "$APP_TSX" 2>/dev/null; then
    SHOWCASE_GAP="$SHOWCASE_GAP
       → id \"$KEBAB\" não está em src/App.tsx (DOC_PAGES + activePage===) → a rota #/$KEBAB renderiza EM BRANCO"
  fi
  if [ -f "$NAV_DATA" ] && ! grep -q "\"$KEBAB\"" "$NAV_DATA" 2>/dev/null; then
    SHOWCASE_GAP="$SHOWCASE_GAP
       → sem entrada de nav em src/preview/components/doc-nav-data.ts (href: \"$KEBAB\")"
  fi
  if [ -n "$SHOWCASE_GAP" ]; then
    MISSING="$MISSING
  • ${COMP_NAME}Doc.tsx existe mas o showcase não está totalmente registrado:$SHOWCASE_GAP"
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
