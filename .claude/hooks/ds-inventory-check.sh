#!/usr/bin/env bash
# ds-inventory-check — alerta quando componente em src/components/ui/<Nome>/
# tem pendência de superfície: USAGE.md, inventory.md, registry.json,
# (se já distribuído) vocabulário do consumidor
# (`cli/templates/default/_claude/rules/ds-components.md` ∪ o `CLAUDE.md` do template), OU
# (se a DocPage existe) registro de showcase no App.tsx/DOC_PAGES + nav.
#
# Trigger: PostToolUse matcher "Edit|Write"
# Input:   JSON via stdin com tool_input.file_path
#
# Não bloqueia. Fecha L-016 automaticamente: avisa enquanto Claude está editando,
# em vez de descobrir só na auditoria retroativa.
#
# Terceiro consumidor das FONTES ÚNICAS compartilhadas com o CI (ver o probe
# abaixo): `scripts/lib/ds-exceptions.mjs` (o que é exceção deliberada) e
# `scripts/lib/showcase-registration.mjs` (o que "showcase registrado" significa).
# Nunca reimplemente essas duas regras aqui — foi assim que hook e CI divergiram.

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

DOCPAGE="$PROJECT_ROOT/src/preview/pages/${COMP_NAME}Doc.tsx"

# ─── Probe: as duas perguntas que o hook NÃO responde mais na unha ────────────
#
# 1. "é exceção deliberada?" — era `[ "$COMP_NAME" != "TabelaTeste" ]` cravado
#    aqui: SEGUNDA cópia da lista de exceção, em PascalCase, cobrindo só o eixo
#    registry. Consequência viva: editar qualquer interno do example-chat avisava
#    "não consta em registry.json → NÃO será distribuído" enquanto
#    `ds-exceptions.mjs` declarava isso deliberado.
# 2. "o showcase está registrado?" — era `grep -q "\"$KEBAB\"" App.tsx`, que passa
#    com o id SÓ no `DOC_PAGES`. E nesse caso a rota AINDA abre em branco, porque
#    falta o render: hook aprovava o que o CI reprova, na regra principal.
#
# As duas respostas agora vêm dos MESMOS módulos puros que o `showcase-check.mjs`
# do CI consome — hook e CI não conseguem mais divergir. UMA invocação de node.
#
# Fail-open (o oposto dos scripts de CI, que são fail-closed de propósito): se o
# node não existir ou falhar, `PROBE_OK` não vem, os dois eixos são PULADOS
# (registrado no log) e o hook segue. Nunca inventa aviso, nunca bloqueia o Edit.
PROBE_OK=0
IS_EXCEPTION=0
SKIP_SHOWCASE=0
SHOWCASE_GAP=""
if command -v node >/dev/null 2>&1; then
  DOC_EXISTS=0
  [ -f "$DOCPAGE" ] && DOC_EXISTS=1
  PROBE=$(node --input-type=module -e '
const [root, name, kebab, docExists] = process.argv.slice(1);
const { pathToFileURL } = await import("node:url");
const { join } = await import("node:path");
const { readFileSync } = await import("node:fs");
const lib = (f) => import(pathToFileURL(join(root, "scripts", "lib", f)).href);
const { isException } = await lib("ds-exceptions.mjs");
const { checkRegistration, isPascalCase } = await lib("showcase-registration.mjs");
const out = ["PROBE_OK=1"];
if (isException(kebab)) {
  out.push("EXCECAO=1");
} else if (docExists === "1") {
  // toKebab assume PascalCase; pasta fora do padrão (hoje só `avatar-ig`) geraria
  // id errado — então pula, igual ao CI, em vez de avisar besteira.
  if (!isPascalCase(name)) {
    out.push("SKIP_SHOWCASE=1");
  } else {
    const ler = (p) => { try { return readFileSync(join(root, p), "utf8"); } catch { return ""; } };
    const faltas = checkRegistration({
      name,
      docExists: true, // o shell já confirmou que a DocPage existe
      appTsx: ler("src/App.tsx"),
      navData: ler("src/preview/components/doc-nav-data.ts"),
    });
    for (const f of faltas) out.push("FALTA=" + f.what + " → " + f.fix);
  }
}
process.stdout.write(out.join("\n") + "\n");
' "$PROJECT_ROOT" "$COMP_NAME" "$KEBAB" "$DOC_EXISTS" 2>/dev/null)

  while IFS= read -r LINHA; do
    case "$LINHA" in
      PROBE_OK=1) PROBE_OK=1 ;;
      EXCECAO=1) IS_EXCEPTION=1 ;;
      SKIP_SHOWCASE=1) SKIP_SHOWCASE=1 ;;
      FALTA=*) SHOWCASE_GAP="$SHOWCASE_GAP
       → ${LINHA#FALTA=}" ;;
    esac
  done <<< "$PROBE"
fi

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
#    Exceção deliberada (fonte única `scripts/lib/ds-exceptions.mjs`, via probe
#    acima) não é cobrada aqui — é o caso do TabelaTeste e dos internos do
#    example-chat, distribuídos junto do exemplo.
#    Probe caído → eixo PULADO (não dá pra afirmar "falta no registry" sem saber
#    se é exceção; aviso inventado é pior que aviso ausente num hook informativo).
REGISTRY="$PROJECT_ROOT/registry.json"
IN_REGISTRY=0
if [ -f "$REGISTRY" ] && [ "$PROBE_OK" = "1" ] && [ "$IS_EXCEPTION" != "1" ]; then
  if grep -q "src/components/ui/$COMP_NAME/" "$REGISTRY" 2>/dev/null; then
    IN_REGISTRY=1
  else
    MISSING="$MISSING
  • $COMP_NAME não consta em registry.json → NÃO será distribuído (consumidor não recebe via @igreen/*)
       → node scripts/registry-add-item.mjs $COMP_NAME → revisar/adicionar ao registry.json → npm run registry:build
       (mudança em componente já distribuído também exige registry:build + bump de versão via /ds-release)"
  fi
fi

# 4. Distribuído mas FORA do vocabulário do consumidor → a IA do consumidor não sabe
#    que o componente existe (usa kebab do registry: Toast→toast, DatePicker→date-picker).
#    Duas superfícies, medidas em UNIÃO — o vocabulário por tarefa mora na rule
#    auto-carregada; o CLAUDE.md ainda cita nomes (mapa de intenção, example-*).
#    Mesma lista que o `distribution-debt.mjs` do CI (CATALOG_FILES) — não divergir.
CLI_VOCAB="$PROJECT_ROOT/cli/templates/default/_claude/rules/ds-components.md"
CLI_CATALOG="$PROJECT_ROOT/cli/templates/default/CLAUDE.md"
if [ "$IN_REGISTRY" = "1" ] && { [ -f "$CLI_VOCAB" ] || [ -f "$CLI_CATALOG" ]; }; then
  if ! grep -qiE "\`$KEBAB\`|\b$KEBAB\b" "$CLI_VOCAB" "$CLI_CATALOG" 2>/dev/null; then
    MISSING="$MISSING
  • $COMP_NAME (kebab: $KEBAB) está no registry mas NÃO no vocabulário do consumidor
       → adicione em cli/templates/default/_claude/rules/ds-components.md, no grupo de tarefa
         a que ele serve, com o critério de escolha (quando usar ELE e não o vizinho)
       → + bump cli/package.json + republicar CLI
       (sem isso, a IA do consumidor não sabe que o componente existe e compõe na unha)"
  fi
fi

# 5. Showcase — se existe a DocPage padrão <Nome>Doc.tsx, ela TEM que estar roteada
#    no App.tsx (DOC_PAGES + activePage) E ter entrada na nav. Pega o caso clássico
#    de DocPage criada mas não registrada (render em branco — bug do Toast/DOC_PAGES).
#    Precisão > recall: só dispara quando há intenção clara de showcase (a DocPage existe).
#    As faltas vêm do probe (checkRegistration, o mesmo módulo do CI) — o grep
#    ingênuo daqui aprovava id presente só no DOC_PAGES, com a rota em branco.
if [ -n "$SHOWCASE_GAP" ]; then
  MISSING="$MISSING
  • ${COMP_NAME}Doc.tsx existe mas o showcase não está totalmente registrado:$SHOWCASE_GAP"
elif [ "$SKIP_SHOWCASE" = "1" ]; then
  MISSING="$MISSING
  • ${COMP_NAME}Doc.tsx existe, mas a pasta está fora do padrão PascalCase — não consigo
       derivar o id da rota com segurança, então NÃO verifiquei o showcase
       → renomeie a pasta pra PascalCase, ou declare em scripts/lib/ds-exceptions.mjs com o motivo"
fi

# Probe caído = eixos registry/showcase não avaliados. Não avisa na tela (aviso
# inventado é pior que aviso ausente num hook informativo), mas fica no log.
if [ "$PROBE_OK" != "1" ]; then
  echo "[$TS] ds-inventory-check: PROBE FAIL $COMP_NAME — eixos registry/showcase PULADOS (fail-open)" >> "$LOG_FILE" 2>/dev/null
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
