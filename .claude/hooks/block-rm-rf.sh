#!/usr/bin/env bash
# block-rm-rf — bloqueia `rm -rf` perigoso em comandos Bash.
# Permite `rm -rf node_modules`, `rm -rf .next`, `rm -rf dist` (dirs canônicos).
# Bloqueia `rm -rf /`, `rm -rf ~`, `rm -rf .`, `rm -rf *`, `rm -rf src/`.
#
# Trigger: PreToolUse matcher "Bash"
# Input: JSON via stdin com tool_input.command
# Output: exit 0 = permite; exit 2 = bloqueia (com mensagem em stderr)

set +e

# jq não existe em todo ambiente (Git Bash/Windows) → fallback pra node.
INPUT_JSON=$(cat)
if command -v jq >/dev/null 2>&1; then
  CMD=$(printf '%s' "$INPUT_JSON" | jq -r '.tool_input.command // empty' 2>/dev/null)
elif command -v node >/dev/null 2>&1; then
  CMD=$(printf '%s' "$INPUT_JSON" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const j=JSON.parse(d);process.stdout.write(j?.tool_input?.command||'')}catch(e){}})" 2>/dev/null)
else
  CMD=""
fi
[ -z "$CMD" ] && exit 0

# Whitelist de paths seguros pra rm -rf
SAFE_PATTERN='rm[[:space:]]+-rf?[[:space:]]+(node_modules|\.next|dist|build|coverage|\.turbo|\.cache|\.parcel-cache|out)(/[^[:space:]]*)?[[:space:]]*$'

# Achata o comando numa linha só (evita que `^` case o início de cada linha de
# uma mensagem de commit multi-linha) e só considera `rm`/`git push` quando estão
# num BOUNDARY de comando (início, ou após ; & | ( ). Assim "rm -rf src" DENTRO de
# uma mensagem de commit (precedido por texto/espaço, não por separador) NÃO
# dispara — L-048 (o hook bloqueava o próprio `git commit` cuja msg citava rm -rf).
CMD_FLAT=$(printf '%s' "$CMD" | tr '\n' ' ')

# Detecta rm -rf (só em boundary de comando)
if echo "$CMD_FLAT" | grep -qE '(^|[;&|(])[[:space:]]*rm[[:space:]]+(-[a-z]*r[a-z]*|--recursive)'; then
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

# Detecta git push --force pra main/master (só em boundary de comando)
if echo "$CMD_FLAT" | grep -qE '(^|[;&|(])[[:space:]]*git[[:space:]]+push[[:space:]]+.*(--force|\-f)([[:space:]]+|$).*(main|master)'; then
  echo "🛑 Bloqueado: force push em main/master detectado." >&2
  echo "   Comando: $CMD" >&2
  exit 2
fi

exit 0
