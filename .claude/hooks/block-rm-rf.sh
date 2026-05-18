#!/usr/bin/env bash
# block-rm-rf — bloqueia `rm -rf` perigoso em comandos Bash.
# Permite `rm -rf node_modules`, `rm -rf .next`, `rm -rf dist` (dirs canônicos).
# Bloqueia `rm -rf /`, `rm -rf ~`, `rm -rf .`, `rm -rf *`, `rm -rf src/`.
#
# Trigger: PreToolUse matcher "Bash"
# Input: JSON via stdin com tool_input.command
# Output: exit 0 = permite; exit 2 = bloqueia (com mensagem em stderr)

set +e

CMD=$(jq -r '.tool_input.command // empty' 2>/dev/null)
[ -z "$CMD" ] && exit 0

# Whitelist de paths seguros pra rm -rf
SAFE_PATTERN='rm[[:space:]]+-rf?[[:space:]]+(node_modules|\.next|dist|build|coverage|\.turbo|\.cache|\.parcel-cache|out)(/[^[:space:]]*)?[[:space:]]*$'

# Detecta rm -rf
if echo "$CMD" | grep -qE 'rm[[:space:]]+(-[a-z]*r[a-z]*|--recursive)'; then
  # Se bater whitelist, permite
  if echo "$CMD" | grep -qE "$SAFE_PATTERN"; then
    exit 0
  fi
  # Senão, bloqueia com mensagem
  echo "🛑 Bloqueado: rm -rf perigoso detectado." >&2
  echo "   Comando: $CMD" >&2
  echo "   Whitelist: node_modules, .next, dist, build, coverage, .turbo, .cache, .parcel-cache, out" >&2
  echo "   Se intencional, rodar diretamente no terminal sem o hook." >&2
  exit 2
fi

# Detecta git push --force pra main/master (sem o user pedir explicitamente)
if echo "$CMD" | grep -qE 'git[[:space:]]+push[[:space:]]+.*(--force|\-f)([[:space:]]+|$).*(main|master)'; then
  echo "🛑 Bloqueado: force push em main/master detectado." >&2
  echo "   Comando: $CMD" >&2
  exit 2
fi

exit 0
