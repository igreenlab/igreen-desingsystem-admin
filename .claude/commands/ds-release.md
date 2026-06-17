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
                  git reset --hard origin/main (main local limpo)
                                │
                                ▼
                  git push -u origin release/v<X.Y.Z>
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
4. Origin reachable (git fetch --dry-run não falha)
5. gh CLI disponível (gh --version)
6. Working tree status conhecido (porcelain)
```

## Passo 1 — DS Dev carrega skill

Carregar `.claude/skills/ds-dev/release.md` via SkillTool. NUNCA confiar em memória da sessão.

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
3. `npx tsc --noEmit` (abort se falhar)
4. `git add <arquivos do escopo>` + `git commit`
5. `git branch release/v<X.Y.Z>` + `git reset --hard origin/main`
6. `git checkout release/v<X.Y.Z>` + `git push -u origin release/v<X.Y.Z>`
7. `gh pr create --title ... --body ...`

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
