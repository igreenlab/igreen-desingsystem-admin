---
name: update-changelog
description: >
  Coleta git log + estado do projeto desde a última entry de Updates,
  classifica as mudanças, monta uma ReleaseEntry typed e apresenta preview
  pro usuário antes de gravar em src/preview/pages/updates-data.ts.
---

# DS Dev — Atualizar Updates timeline

> **Skill obrigatória.** Carregue este arquivo via SkillTool antes de processar
> `/ds-update` — não confie em memória de sessão anterior.

## Verificações antes de coletar

```
1. src/preview/pages/updates-data.ts existe e parseia?  Não → reportar e parar
2. Working tree git limpo (git status --porcelain)?      Não → alertar
3. Última entry tem date ISO válida (YYYY-MM-DD)?        Não → pedir ajuste manual
4. Existe pelo menos 1 commit desde a última date?       Não → nada a registrar; reportar
```

## Passo 1 — Identificar baseline

Ler `src/preview/pages/updates-data.ts` e extrair da PRIMEIRA entry do array `RELEASES` (índice 0):
- `lastVersion` = entry[0].version
- `lastDate`    = entry[0].date

## Passo 2 — Coletar dados do git

```bash
# Commits desde lastDate (exclui merges)
git log --since="<lastDate>" --pretty='%H|%s|%b%n---END---' --no-merges

# Arquivos modificados desde lastDate
git log --since="<lastDate>" --name-status --pretty=format:'' | sort -u

# Estado de version no package.json (pode ter bumpado fora do changelog)
node -e "console.log(require('./package.json').version)"
```

## Passo 3 — Classificar cada commit em ChangeType

Heurística por prefixo convencional na linha de subject:

| Prefixo | ChangeType | Notas |
|---|---|---|
| `feat:` / `feat(...)` | `added` | Feature nova |
| `fix:` / `fix(...)` | `fixed` | Bug fix |
| `perf:` / `perf(...)` | `improved` | Otimização sem API change |
| `refactor:` / `refactor(...)` | `changed` | Reescrita interna |
| `docs:` / `docs(...)` | `improved` (ou `added` se for página nova) | Documentação |
| `chore:` / `chore(...)` | `changed` | Housekeeping (config, deps, etc) |
| `revert:` | `removed` | Reverter mudança anterior |
| `BREAKING CHANGE:` no body | `breaking` | Override de qualquer outro type |

**Sem prefixo convencional?** Classifica pelo diff:
- Arquivo novo em `src/components/ui/` → `added` (componente novo)
- Arquivo novo em `src/preview/pages/` → `added` (doc page nova) ou `improved` (rewrite)
- Modificação em `tokens/` → `changed`
- Modificação em `README.md`, `.ai/`, `.claude/` → `improved`
- `package.json` (rename, deps, scripts) → `changed`
- Arquivo deletado fora de refactor convencional → `removed`

## Passo 4 — Sugerir version bump

Aplica regras em ordem (primeira que bate vence):

| Condição | Bump |
|---|---|
| `changes[]` contém `breaking` | MAJOR (1.0.0 → 2.0.0) |
| `changes[]` contém `added` (sem breaking) | MINOR (1.0.0 → 1.1.0) |
| Apenas `fixed` / `improved` / `changed` / `removed` | PATCH (1.0.0 → 1.0.1) |
| Ainda em `0.x` E tag = `preview` | Incrementa segundo grupo (0.2.0 → 0.3.0) |

Tag default = `preview` (se já em 0.x). Aceita override via argumento do command.

## Passo 5 — Montar ReleaseEntry

Template:

```typescript
{
  version: "<X.Y.Z>",                    // semver, derivado do bump
  date: "<YYYY-MM-DD>",                  // hoje em ISO
  tag: "<preview|release|patch|milestone>",
  title: "<resumo curto agregando o maior tema>",
  summary: "<opcional: 1-2 frases de contexto>",
  changes: [
    {
      type: "<ChangeType>",
      items: [
        "<descrição concisa derivada da mensagem de commit>",
        // ...
      ],
    },
    // grupos ordenados: added → changed → improved → fixed → removed → deprecated → breaking
  ],
}
```

Regras de redação dos `items`:
- Linha autocontida, sem numeração, sem trailing punctuation excessiva
- Começa com verbo no particípio passado ou substantivo ("Página Updates", "Componente Avatar v2", "Bug do Kanban no Safari")
- Sem hashes de commit no item (vão no preview, mas não no arquivo final)
- Sem repetir o mesmo item entre grupos

## Passo 6 — Checklist obrigatório (antes do gate)

- [ ] `date` em formato ISO `YYYY-MM-DD`
- [ ] `version` é semver válido (`X.Y.Z` ou `X.Y.Z-preview`)
- [ ] `tag` ∈ `{preview, release, patch, milestone}`
- [ ] Todos `changes[].type` ∈ `{added, changed, improved, fixed, removed, deprecated, breaking}`
- [ ] Cada item é uma string única, sem duplicatas no array
- [ ] Pelo menos 1 grupo com items
- [ ] `title` ≤ 80 caracteres
- [ ] `summary` se presente ≤ 280 caracteres

## Passo 7 — Gate: preview pro usuário

Apresentar em markdown formatado:

```markdown
📋 Coletando mudanças desde v<lastVersion> (<lastDate>)...

Commits considerados:
  <hash>  <subject>
  ...

Bump sugerido: <MAJOR|MINOR|PATCH> → v<X.Y.Z>
Tag sugerida: <tag>

Proposta de entry:

  version: "<X.Y.Z>"
  date: "<YYYY-MM-DD>"
  tag: "<tag>"
  title: "<title>"
  summary: "<summary>"
  changes:
    - <type> (<N> items)
        • <item 1>
        • <item 2>
    ...

Aprovar essa entry como está? Ou quer ajustes?
```

Sinal: `UPDATE_PROPOSED: v<X.Y.Z> — aguardando gate`

**Aguardar resposta. NÃO editar arquivo antes da aprovação.**

- `ok` / `aprovado` / `pode aplicar` → Passo 8
- `ajustar X` → re-montar com ajuste, re-apresentar
- `cancelar` → abortar, não tocar em nada

## Passo 8 — Apply

Editar `src/preview/pages/updates-data.ts`:
- Inserir o novo objeto no TOPO do array `RELEASES` (índice 0)
- Manter formatação do arquivo (a hook `format-on-save.sh` roda automaticamente após o Edit)
- Não tocar nas entries antigas
- Não tocar nos types (`ChangeType`, `ReleaseTag`, `ReleaseEntry` — já definidos)

Sinal final: `UPDATE_APPLIED: v<X.Y.Z>`

## Out of scope deste skill

- Bump de `package.json.version` — apenas sugerido no preview, não aplicado
- `git commit` ou `git push` — manter como decisão consciente
- Edits em entries antigas do array — append-only no topo
- Reordenar entries — array já está em ordem (mais recente primeiro)

## Quer mais que só atualizar a timeline?

Pra **release completa** (timeline + bump `package.json` + commit + branch + push + abrir PR num único fluxo), use [`release.md`](./release.md) (slash command `/ds-release`). Engloba este skill como passos 1–4 e adiciona os passos 6–9 de publicação git.
