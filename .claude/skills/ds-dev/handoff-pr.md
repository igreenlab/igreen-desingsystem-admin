---
name: handoff-pr
description: >
  Fecha o ciclo de QUALQUER trabalho de componente (criar/alterar) ou mudança
  significativa: branch + commit descritivo + PR no origin + link pro gate humano.
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

## ✅ Definição de Pronto — TODAS as superfícies de um componente (L-042)

> ⛔ Componente **NÃO** está pronto só com o código + USAGE. Um componente novo
> (ou renomeado) toca **7 superfícies**. Antes de abrir o PR, percorra esta lista —
> é o que o agente tem que **prever sozinho** (não esperar o humano lembrar).
> O hook `ds-inventory-check` cobre automaticamente **2, 3, 5, 6 e o registro de
> showcase (4)** — avisa na hora da edição. Restam manuais: **1** (o código, via tsc)
> e **7** (changelog, no `/ds-release`).

| #   | Superfície          | Onde                                                                                                                           | Checagem                                                       |
| --- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| 1   | **Código**          | `ui/<Nome>/` (styles+tsx+index) ou `shadcn/<nome>.tsx`                                                                         | compila, tv() de `@/utils/tv`                                  |
| 2   | **USAGE**           | `ui/<Nome>/USAGE.md` (composto) **ou** 1 linha em `shadcn/USAGE.md` se houver gotcha                                           | existe/atualizado                                              |
| 3   | **Inventory**       | `.ai/context/components/inventory.md` (+contador)                                                                              | linha presente                                                 |
| 4   | **Showcase**        | `src/preview/pages/<Nome>Doc.tsx` **+** `App.tsx` (import + render + **`DOC_PAGES`**) **+** `doc-nav-data.ts` (entrada de nav) | rota `#/<nome>` renderiza (DOC_PAGES é o passo mais esquecido) |
| 5   | **Registry**        | `registry.json` (entrada + `registry:build` + embed)                                                                           | distribuível via `@igreen/<nome>`                              |
| 6   | **Catálogo do CLI** | `cli/templates/default/CLAUDE.md` (lista de componentes) **+ bump `cli/package.json` + republicar**                            | scaffolds novos conhecem o componente                          |
| 7   | **Changelog**       | `src/preview/pages/updates-data.ts` (entry da versão)                                                                          | aparece na tela Updates                                        |

**Cadência:** 1–3 e 4 vão no **PR do componente** (mesmo commit). 5/6/7 (distribuição)
consolidam no **`/ds-release`** — mas **anote no PR body** que faltam, pra não sumirem.
No `/ds-release`, o passo 6.2b cobre 5; **6 (catálogo CLI) e 7 entram junto**. Componente
distribuído (no registry) **sem** estar no catálogo do CLI = gap real (caso Toast v0.12.0).

## Fechar o loop do pipeline (OBRIGATÓRIO — vai no MESMO commit)

Antes do commit, atualize o audit/aprendizado — senão a próxima sessão começa cega
(o closing-checklist do CLAUDE.md costuma ser pulado):

1. **`.ai/status/pipeline-state.md`** — anexe uma entrada (append-only) com data ·
   agente · escopo · decisões · **Assumption** central · validação. `CONCLUÍDO` se
   fechou, `PAUSADO (gate)` se aguarda algo. É o que torna a decisão reversível depois.
2. **`.ai/status/lessons.md`** — se um padrão de erro novo apareceu (bug não-óbvio,
   gotcha de infra, armadilha que te mordeu), registre `L-NNN` + resuma a 1-linha em
   `.claude/rules/ds-standards.md` (seção de lições). Loop fechado pra próxima sessão.
3. Inclua esses arquivos no `git add` do commit (fazem parte do trabalho, não são extra).

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

# 3. push + PR no origin (igreenlab/igreen-desingsystem-admin — repo canônico)
git push -u origin <tipo>/<escopo>
gh pr create --repo igreenlab/igreen-desingsystem-admin --base main \
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
