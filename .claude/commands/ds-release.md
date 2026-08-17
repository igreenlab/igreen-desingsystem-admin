---
name: ds-release
description: >
  Release completa do DS num único fluxo — timeline + bump package.json +
  branch + commit + push + PR via gh. Engloba `/ds-update` e adiciona os
  passos de publicação git.
---

# Release completa — iGreen DS

## Fluxo

```
/ds-release [tag]   →   DS Dev carrega skill `release`
                                │
                                ▼
                  git log + scan + classifica + bump + monta plano
                  (entry + commit message + PR body)
                                │
                                ▼
                       [GATE]  preview consolidado pra usuário
                                │
                                ▼
                  edit updates-data.ts + bump package.json
                                │
                                ▼
              DISTRIBUIÇÃO (se tocou componente/token/foundational):
              registry:build + embed · cli:rebake+bump se foundational
              (deploy do registry = automático no merge; CLI publish = manual)
                                │
                                ▼
                       npx tsc --noEmit (abort se falhar)
                                │
                                ▼
                  git add (arquivos do escopo) + commit
                                │
                                ▼
                  git branch release/v<X.Y.Z>
                                │
                                ▼
                  git reset --hard empresa/main (main local limpo)
                                │
                                ▼
                  git push -u empresa release/v<X.Y.Z>
                                │
                                ▼
                  gh pr create (PR aberto pra revisão)
                                │
                                ▼
                  RELEASE_PUSHED: v<X.Y.Z> — <PR URL>
```

## Argumento opcional

- `tag` ∈ `{preview, release, patch, milestone}` — override da tag default da skill
- Sem arg: skill infere a tag a partir do bump sugerido (`preview` em 0.x)

## ⛔ Verificações antes de qualquer ação

```
1. updates-data.ts parseia
2. package.json.version é semver válido
3. Branch atual = main (alertar + perguntar se outra)
4. Remote canônico alcançável — `git remote -v` e escolha pela URL igreenlab/…, não pelo
   nome (`origin` em clone direto, `empresa` onde `origin` é fork pessoal — L-069)
5. gh CLI disponível (gh --version)
6. Working tree status conhecido (porcelain)
```

## Passo 1 — DS Dev carrega skill

**Ler** `.claude/skills/ds-dev/release.md` com a tool **Read** (é sub-arquivo da skill
`ds-dev`, não uma skill própria — o Skill tool só aceita nome de skill, isto é, pasta com
`SKILL.md`). NUNCA confiar em memória da sessão.

A skill executa:
1. Verificações iniciais
2. Coleta git log + status (reusa lógica do `update-changelog`)
3. Classifica commits + sugere bump
4. Monta 3 artefatos: ReleaseEntry, commit message, PR body
5. Apresenta preview consolidado pro gate

Sinal: `RELEASE_PROPOSED: v<X.Y.Z>` (aguardando gate)

## Passo 2 — Gate: aprovação do usuário

Apresentar o plano em uma só tela (commits + entry + bump + branch + PR title/body). Aguardar:

- `ok` / `aprovado` / `pode aplicar` → Passo 3
- `ajustar X, Y` → re-montar com ajustes
- `cancelar` → abortar (zero edits no disco)

**Não tocar em arquivo nem em git antes da aprovação.**

## Passo 3 — Aplicar

Executar em sequência, abortando ao primeiro erro. Detalhes dos sub-passos (6.1–6.9) em `.claude/skills/ds-dev/release.md`:

1. Edit `updates-data.ts` (entry no topo)
2. Edit `package.json` (bump version)
3. **DISTRIBUIÇÃO** (se tocou componente/token/foundational — passo 6.2b da skill):
   `npm run registry:build` · `(cd registry-app && node scripts/copy-registry.mjs)` ·
   `npm run cli:rebake` + bump de `cli/package.json` se `cli/templates/**` mudou.
   Roda **depois** do bump, pra carimbar a versão nova.
4. **VALIDAR** (passo 6.3 da skill) — abortar ao primeiro erro:
   `npx tsc --noEmit` · `npm test` · `npm run release:check`
5. `git add <arquivos do escopo>` + `git commit`
6. `git branch release/v<X.Y.Z>` + `git reset --hard empresa/main`
7. `git checkout release/v<X.Y.Z>` + `git push -u empresa release/v<X.Y.Z>`
8. `gh pr create --title ... --body ...`

⚠️ Esta lista já omitiu os passos 3 e 4 — quem seguisse o command publicava release sem
rodar `npm test`, sem `release:check` e sem recarimbar o registry. E o **Passo 1.5**
(`ds-reviewer/pre-commit-check.md`) e o **Passo 7** (publish no npm, com `lib:verify` e o
gate de 2FA — esta conta **recusa token clássico**) vivem só na skill: o command sozinho
**não** é o fluxo completo. Carregue
`.claude/skills/ds-dev/release.md`.

## Comparação com `/ds-update`

| | `/ds-update` | `/ds-release` |
|---|---|---|
| Atualiza `updates-data.ts` | ✅ | ✅ |
| Bump `package.json` | ❌ (manual depois) | ✅ |
| Build check | ❌ | ✅ (`tsc --noEmit`) |
| Commit | ❌ | ✅ |
| Branch + push | ❌ | ✅ |
| Abre PR | ❌ | ✅ |
| Quando usar | Só registrar mudanças (preview, sem deploy) | Fechar versão pronta pra merge |

## Out of scope deste command

- Merge do PR (decisão humana com revisão)
- Deploy (responsabilidade do CI/Vercel após merge)
- Delete da branch pós-merge (gh setting `--delete-branch` ou manual)
- Rollback de release problemática (revert manual do merge)

## Handoff final

`RELEASE_PUSHED: v<X.Y.Z> — branch release/v<X.Y.Z> + PR <URL>`

Próximo: humano revisa o PR e faz merge.
