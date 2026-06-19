---
name: handoff-pr
description: >
  Fecha o ciclo de QUALQUER trabalho de componente (criar/alterar) ou mudança
  significativa: branch + commit descritivo + PR no mirror + link pro gate humano.
  Regra 8 / L-041. Carregar ao terminar uma implementação, antes de "concluir".
---

# Handoff via PR — gate humano (OBRIGATÓRIO)

> ⛔ Não encerre uma implementação em `IMPL_PRONTA`/"feito". Todo componente
> criado/alterado e toda mudança significativa fecha por PR + link. A IA faz a
> parte mecânica; **para no merge** (humano aprova).

## Quando aplicar
- Criou/alterou componente (`ds-add-shadcn`, `ds-create-component`, `ds-create-composite`, edição de `.styles.ts`).
- Fix de comportamento/visual, refactor amplo, mudança de skill/regra/pipeline.
- Em dúvida: **aplique**. O custo de um PR é baixo; o de um commit órfão em `main` é alto.

## Sequência (após DS Reviewer aprovar)

```bash
# 1. branch própria (NUNCA commitar em main)
git checkout -b <tipo>/<escopo>           # feat/fix/refactor/docs

# 2. commit DESCRITIVO — o quê + por quê (não deixar a diff falar sozinha)
git add <arquivos do escopo>              # nunca git add -A (evita secrets/audits)
git commit -F - <<'EOF'
<tipo>(<escopo>): <resumo>

<o que mudou e por quê — decisões, tokens usados, validação>

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF

# 3. push + PR no mirror (snksergio HOJE — ver L-007/release p/ migração)
git push -u mirror <tipo>/<escopo>
gh pr create --repo snksergio/igreen-admin-desingsystem --base main \
  --head <tipo>/<escopo> --title "<title>" --body-file <body.md>
```

## O PR body deve conter
- **O que foi feito** (resumo + bullets por arquivo/área).
- **Validação**: `tsc 0`, `registry-check`, render (screenshot quando visual).
- **Distribuição pendente** (se componente novo): "registrar no registry.json + build no `/ds-release`".

## Gate
- Reportar **o link do PR** e PARAR. Aguardar o humano aprovar.
- **Merge / `npm publish` / deploy**: só com autorização EXPLÍCITA do usuário na mesma sessão (L-020). Sem isso → nunca mergear/publicar sozinho.

## Distribuição (registry) — NÃO por-PR-de-componente
Registrar no `registry.json` + embed + bump consolida no `/ds-release` ao fechar o
conjunto (evita churn de embed/stamp a cada PR). Vários componentes? Trabalhe em
**batches** (1 PR por batch), e ao final UM `/ds-release` registra todos + bump +
changelog. Anotar no PR de componente: "falta registrar no registry (no release)".

## Handoff final
`PR_ABERTO: <comp> — <URL do PR> (aguardando aprovação humana)`
