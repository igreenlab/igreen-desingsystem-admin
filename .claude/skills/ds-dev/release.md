---
name: release
description: >
  Release completa do DS: atualiza Updates timeline + bump de package.json +
  branch + commit + push + abre PR via gh. Engloba o update-changelog e
  adiciona os passos de publicação git. Use pra fechar versão sem trocar
  entre múltiplos comandos.
---

# DS Dev — Release completa

> **Skill obrigatória.** Carregue este arquivo via SkillTool antes de
> processar `/ds-release` — não confie em memória de sessão anterior.

## Quando usar este skill

- Trabalho acumulado pronto pra release no remote
- Auto-pilot: timeline + bump + branch + commit + PR num único fluxo
- Mais simples que invocar `update-changelog` + git manual quando o objetivo final é PR

Pra atualizar **apenas** a timeline (sem commit/PR), use [`update-changelog.md`](./update-changelog.md) direto.

---

## Visão geral do fluxo

```
1.  Verificações iniciais (workspace, branch, gh disponível, build limpo)
1.5 AUTO-REVIEW do diff (NOVO) — bloqueia release se houver violação L-001..L-007
2.  Coletar git log + estado desde a última entry
3.  Classificar commits + sugerir bump (delega lógica do update-changelog)
4.  Montar ReleaseEntry + plano de commit + PR body
5.  [GATE] preview consolidado pro usuário (inclui resumo do auto-review)
6.  Aplicar (após aprovação):
    a. Edit updates-data.ts (insert entry no topo)
    b. Edit package.json (bump version)
    c. Validar TS (npx tsc --noEmit) — abortar se falhar
    d. Stage arquivos do escopo
    e. Commit local
    f. Criar branch release/v<X.Y.Z>
    g. Reset main local pra origin/main (se commit foi em main)
    h. Push origin/release/v<X.Y.Z>
    i. Abrir PR via gh CLI
7.  Reportar RELEASE_PUSHED com link do PR
```

---

## Passo 1 — Verificações iniciais

```
✓ src/preview/pages/updates-data.ts existe e parseia
✓ package.json.version é semver válido
✓ Branch atual = main (se não, alertar e perguntar)
✓ Origin reachable (git fetch --dry-run não falha)
✓ gh --version retorna (CLI disponível pra abrir PR)
✓ Working tree status conhecido (porcelain output)
```

Se algo falha → reportar e PARAR (não tente recuperar silenciosamente).

**Working tree sujo:** OK desde que os arquivos modificados entrem na release. Listar pro usuário e perguntar se inclui no commit ou stash antes.

---

## Passo 1.5 — Pre-commit check (DS Reviewer)

Antes de classificar commits ou montar o plano, invocar a skill
`ds-reviewer/pre-commit-check.md`. Ela faz um gate amplo do diff completo —
mapeia escopo (tokens, componentes, DocPages, pipeline, memory), valida
sincronias técnicas (twMergeConfig L-016, dark mode mirrors), valida que
USAGE.md / DocPages do showcase / pipeline-state / lessons / memory
acompanharam a mudança, e roda os greps L-001..L-007 sobre arquivos
modificados.

### Como invocar

Carregar `.claude/skills/ds-reviewer/pre-commit-check.md` via SkillTool e
seguir o checklist completo dela:

1. Mapear escopo do diff (categorias)
2. Rodar checklist por categoria
3. Capturar output: `PRE_COMMIT_OK` ou `PRE_COMMIT_BLOCKED`

### Decisão

- **PRE_COMMIT_OK** → continuar pro Passo 2 silenciosamente
- **PRE_COMMIT_BLOCKED com pendências CRÍTICAS/ALTAS** → reportar ao usuário no preview do gate (Passo 5) como bloco "🔍 Pre-commit check" e perguntar:
  - "corrigir antes de prosseguir" (default sugerido) → PAUSAR pipeline, DS Dev resolve cada pendência (USAGE.md, DocPage, sync, etc) → re-invocar pre-commit
  - "aplicar mesmo assim e abrir ticket" → continuar, registrar pendências no PR body como débito conhecido (somente MÉDIAS/BAIXAS)
  - "cancelar release" → abortar
- **PRE_COMMIT_BLOCKED com apenas pendências MÉDIAS/BAIXAS** → reportar como aviso, deixar usuário decidir

Sinal intermediário: `RELEASE_REVIEW: <escopo> / <N>pendências`

---

## Passo 2 — Coletar dados

Aplicar os **passos 1–4** do [`update-changelog.md`](./update-changelog.md):

1. Identificar baseline: `entry[0].version` e `entry[0].date` em `updates-data.ts`
2. `git log --since=<lastDate> --pretty='%h %s' --no-merges`
3. `git diff --name-status` em `git log` desde lastDate
4. Versão atual de `package.json`

---

## Passo 3 — Classificar + bump

Aplicar **passo 3** (heurística por prefixo convencional) e **passo 4** (regra de bump) do `update-changelog.md`.

Atalho de bump em 0.x:

| Condição (cumulativa) | Bump | Exemplo |
|---|---|---|
| `breaking` presente | MAJOR | 0.3.0 → 1.0.0 |
| `added` presente, sem breaking | MINOR | 0.2.0 → 0.3.0 |
| Apenas fix/improve/change/remove | PATCH | 0.3.0 → 0.3.1 |

Tag default: `preview` (em 0.x). Override aceito como argumento.

---

## Passo 4 — Montar plano

Produzir 3 artefatos:

### 4.1 `ReleaseEntry` (mesmo template do `update-changelog`)

```typescript
{
  version: "X.Y.Z",
  date: "<hoje YYYY-MM-DD>",
  tag: "<preview|release|patch|milestone>",
  title: "<resumo curto>",
  summary: "<1-2 frases>",
  changes: [{ type, items }, ...],  // ordenado: added → changed → improved → fixed → removed → deprecated → breaking
}
```

### 4.2 Commit message

Formato convencional, multiline:

```
release: v<X.Y.Z> — <título da release>

<grupo por type, com bullets dos items principais>

Bump package.json X.Y.Z (motivo, se sincroniza com baseline desalinhada).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

### 4.3 PR body

```markdown
## Summary

<parágrafo do summary da release>

### <Grupo>

- <bullet 1>
- <bullet 2>

## Bump

- `package.json`: <old> → <new>

## Test plan

- [ ] `npx tsc --noEmit` passa limpo
- [ ] <smoke tests específicos da release>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## Passo 5 — [GATE] Preview consolidado

Apresentar TUDO de uma vez em markdown:

```markdown
📋 Release v<X.Y.Z> proposta

**Baseline:** v<lastVersion> (<lastDate>)
**Bump:** <MAJOR|MINOR|PATCH> → v<X.Y.Z> (tag <tag>)

### 🔍 Pre-commit check (Passo 1.5)
  <relatório do pre-commit-check — PRE_COMMIT_OK OU lista de pendências por severidade>

### Commits considerados
  <hash>  <subject>
  ...

### Working tree status (se sujo)
  M src/...
  M src/...

### Entry a aplicar em updates-data.ts
  <preview da entry agrupada>

### Bump package.json
  <old> → <new>

### Branch + PR
  - Branch: release/v<X.Y.Z>
  - Title: "release: v<X.Y.Z> — <título>"
  - Body: <preview do PR body em ~10 linhas>

### Comando de commit (será executado após aprovação)
  git commit -m "<subject>" ...

Aprovar e aplicar tudo? Ou ajustar antes?
```

**Sinal:** `RELEASE_PROPOSED: v<X.Y.Z> — aguardando gate`

Aguardar:
- `ok` / `pode aplicar` → Passo 6
- `ajustar <X>` → re-montar e re-apresentar
- `cancelar` → abortar (zero edição no disco)

---

## Passo 6 — Aplicar

Executar **em sequência**, abortando ao primeiro erro:

### 6.1 Edit `src/preview/pages/updates-data.ts`
Insere novo objeto no TOPO do array `RELEASES`.

### 6.2 Edit `package.json`
`"version": "<old>"` → `"version": "<new>"`.

### 6.3 Validar TS
```bash
npx tsc --noEmit
```
Se exit ≠ 0 → reportar erro + abortar. Deixar edits no working tree pra debug humano.

### 6.4 Stage arquivos
`git add` apenas dos arquivos do escopo. **Nunca** `git add -A` (evita secrets/audits acidentais).

### 6.5 Commit (em `main` local)
```bash
git commit -m "$(cat <<'EOF'
<commit message multiline do Passo 4.2>
EOF
)"
```

### 6.6 Criar branch apontando pro commit
```bash
git branch release/v<X.Y.Z>
```

### 6.7 Reset main local pra origin
```bash
git reset --hard origin/main
```
**Por que:** `main` local fica == `origin/main`. O commit fica preservado apenas na branch `release/v<X.Y.Z>`. Sem isso, próximo push em `main` falha (PR review policy).

> ⚠️ `reset --hard` é destrutivo. Como o commit foi preservado na branch lateral, não há perda. Mas confirmar com usuário antes se houver arquivos não-staged que deseja manter.

### 6.8 Switch + push da branch
```bash
git checkout release/v<X.Y.Z>
git push -u origin release/v<X.Y.Z>
```

Se push for bloqueado (policy main-only ou similar) → reportar + parar (branch local preservada).

### 6.9 Abrir PR
```bash
gh pr create --title "<title>" --body "<body do Passo 4.3>"
```

Capturar URL do PR retornada.

---

## Handoff final

```
RELEASE_PUSHED: v<X.Y.Z>
- Branch: release/v<X.Y.Z>
- PR: <URL retornada pelo gh>
- Commit local: <hash>
- main local resetado pra origin/main (limpo)

Próximos passos (humanos):
1. Revisar o PR
2. Merge → trigger auto-deploy (Vercel detecta push em main)
3. Após merge, deletar branch release/v<X.Y.Z> (local + remote)
```

---

## Out of scope deste skill

- Merge automático do PR (decisão humana, gate de review)
- Deploy automático (responsabilidade do CI/Vercel)
- Edits em entries antigas do `RELEASES` (array é append-on-top)
- Bump de `package.json` sem release (use `npm version` direto)
- Delete da branch pós-merge (manual ou via gh PR auto-delete-branch setting)
- Rollback (caso de fail no Vercel build) — fazer manualmente revert do merge

---

## Erros comuns

| Sintoma | Causa provável | Ação |
|---|---|---|
| `git push` bloqueado em main | Policy do repo (branch protection) | Skill já cria branch lateral; se ainda assim falha, verificar permissions remotas |
| `gh: command not found` | CLI não instalada | Pedir pro usuário instalar (`brew install gh` / `winget install GitHub.cli`) ou abrir PR manualmente |
| TS build falha | `tsc -b` mais estrito que `tsc --noEmit` | Rodar `tsc -b` antes do passo 6.3 (CI replica `npm run build`) |
| `git reset --hard` perde mudanças | Working tree sujo não-coberto pelo commit | Stash antes ou incluir no commit do passo 6.5 |
| PR template auto-injected difere do body | Repo tem `.github/PULL_REQUEST_TEMPLATE.md` | `gh pr create --body-file` em vez de `--body` literal |

---

## Checklist final (skill aprovada se TODOS true)

- [ ] `RELEASE_PUSHED` sinal emitido com URL do PR válida
- [ ] `main` local == `origin/main` (sem commits órfãos)
- [ ] Branch `release/v<X.Y.Z>` existe local + remote
- [ ] `package.json.version` na branch == version da entry
- [ ] TS build limpo
- [ ] Working tree limpo (ou apenas `.ai/` / scratch fora do escopo)
