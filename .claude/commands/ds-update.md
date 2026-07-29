---
name: ds-update
description: >
  Atualizar a timeline de Updates do DS. Lê git log + estado do projeto desde
  a última entry, classifica as mudanças, propõe uma ReleaseEntry typed,
  apresenta preview pro usuário e (após aprovação) grava no topo do array
  RELEASES em src/preview/pages/updates-data.ts.
---

# Atualizar Updates timeline — iGreen DS

## Fluxo

```
/ds-update [tag]   →   DS Dev carrega skill update-changelog
                                │
                                ▼
                  git log + scan + classifica + monta ReleaseEntry
                                │
                                ▼
                       [GATE]  preview pra usuário
                                │
                                ▼
                  edita updates-data.ts (insere no topo)
                                │
                                ▼
                        UPDATE_APPLIED: v<X.Y.Z>
```

## Argumento opcional

- `tag` ∈ `{preview, release, patch, milestone}` — default: `preview`
- Sem arg: skill infere a tag a partir do tipo do bump sugerido

## ⛔ Verificações antes de qualquer ação

```
1. Arquivo src/preview/pages/updates-data.ts existe e parseia?
   Não → reportar erro e parar
2. Working tree está limpo?
   Não → alertar usuário (dirty changes podem virar entry incorreta)
3. Última entry tem date ISO válida?
   Não → reportar e pedir ajuste manual antes de prosseguir
```

## Passo 1 — DS Dev carrega skill

Carregar `.claude/skills/ds-dev/update-changelog.md` via SkillTool. NUNCA confiar em memória da sessão — o skill traz o procedure completo e o checklist.

A skill executa:
1. Lê `updates-data.ts` → identifica `version` + `date` da entry no topo
2. `git log --since=<last-date> --pretty='%H|%s|%b' --no-merges`
3. `git diff --name-status` para classificar adições/modificações/remoções
4. Classifica cada commit em ChangeType usando heurística por prefixo convencional
5. Sugere version bump (MAJOR / MINOR / PATCH) baseado nos types
6. Monta ReleaseEntry typed completo
7. Roda checklist obrigatório (date ISO, version semver válido, types válidos, items concisos)

Output: ReleaseEntry proposto em markdown formatado
Sinal: `UPDATE_PROPOSED: v<X.Y.Z>` (aguardando gate)

## Passo 2 — Gate: aprovação do usuário

Apresentar a entry proposta com:
- Lista de commits considerados (hash + subject)
- Bump sugerido + tag
- ReleaseEntry montado, agrupado por type

Aguardar do usuário:
- `ok` / `aprovado` → seguir para Passo 3
- `ajustar X, Y` → re-montar com ajustes e re-apresentar
- `cancelar` → abortar sem editar arquivo

**Não editar updates-data.ts antes da aprovação.**

## Passo 3 — Apply

Após aprovação:
- Inserir o objeto novo NO TOPO do array `RELEASES` em `src/preview/pages/updates-data.ts`
- Não tocar em entries antigas (array é append-on-top)
- Formatação é manual — não há formatador automático (espelhe as entries vizinhas)
- Registrar `UPDATE_APPLIED: v<X.Y.Z>` como handoff

## Out of scope deste command

- Bump de `package.json.version` (separado — decisão manual)
- `git commit` ou `git push` (separado — decisão consciente do usuário)
- Edits em entries antigas do array (manter manual)
- Auto-trigger via hook PostCommit (decidido NÃO no plano)

## Handoff final

`UPDATE_APPLIED: v<X.Y.Z> — entry adicionada em updates-data.ts. Veja em preview app → Get Started → Updates.`
