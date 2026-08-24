---
name: handoff-pr
description: >
  Fecha o ciclo de QUALQUER trabalho de componente (criar/alterar) ou mudança
  significativa: branch + commit descritivo + PR no remote canônico + link pro gate humano.
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
> (ou renomeado) toca **8 superfícies**. Antes de abrir o PR, percorra esta lista —
> é o que o agente tem que **prever sozinho** (não esperar o humano lembrar).
> O hook `ds-inventory-check` cobre automaticamente **2, 3, 5, 6 e o registro de
> showcase (4)** — avisa na hora da edição. A **8** é gate (`barrel-completeness`,
> no `npm test`). Restam manuais: **1** (o código, via tsc) e **7** (changelog, no
> `/ds-release`).
>
> ⚠️ **Só vale pra COMPOSTO** (`src/components/ui/<Nome>/`): o hook extrai o nome desse
> path e sai cedo se não casar. **Primitivo shadcn** é arquivo único em
> `src/components/shadcn/` → **nenhum** dos 5 eixos é coberto, e a lista inteira vira
> manual. O `impl-shadcn.md` diz isso ("aqui o CI NÃO é rede de segurança").

| #   | Superfície          | Onde                                                                                                                           | Checagem                                                       |
| --- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| 1   | **Código**          | `ui/<Nome>/` (styles+tsx+index) ou `shadcn/<nome>.tsx`                                                                         | compila, tv() de `@/utils/tv`                                  |
| 2   | **USAGE**           | `ui/<Nome>/USAGE.md` (composto) **ou** 1 linha em `shadcn/USAGE.md` se houver gotcha                                           | existe/atualizado                                              |
| 3   | **Inventory**       | `.ai/context/components/inventory.md` (+contador)                                                                              | linha presente                                                 |
| 4   | **Showcase**        | `src/preview/pages/<Nome>Doc.tsx` **+** `App.tsx` (import + render + **`DOC_PAGES`**) **+** `doc-nav-data.ts` (entrada de nav) | rota `#/<nome>` renderiza (DOC_PAGES é o passo mais esquecido) |
| 5   | **Registry**        | `registry.json` (entrada + `registry:build` + embed)                                                                           | distribuível via `@igreen/<nome>`                              |
| 6   | **Vocabulário do consumidor** | `cli/templates/default/_claude/rules/ds-components.md` (grupo de tarefa + critério de escolha) **+ bump `cli/package.json` + republicar** | a IA do consumidor sabe que o componente existe e quando usá-lo |
| 7   | **Changelog**       | `src/preview/pages/updates-data.ts` (entry da versão)                                                                          | aparece na tela Updates                                        |
| 8   | **Barrel**          | `src/components/index.ts` — `export * from "./ui/<Nome>"`                                                                      | `import { X } from "@snksergio/design-system"` resolve         |

> **Por que a 8ª existe** (entrou em 2026-08-08): o barrel define o canal npm, e era a
> única superfície sem vigilância nenhuma. `Chart`, `DataList`, `List` e `Toast` ficaram
> meses com 6 das 7 fechadas — a doc do canal npm anunciando "os 42 componentes ui/" — e
> `import { ChartContainer }` estourando "not exported" no consumidor. Hoje é gate:
> `scripts/lib/barrel-completeness.mjs`, no `npm test`. Componente que deliberadamente
> não vai pro npm (só `TabelaTeste` hoje) entra em `BARREL_EXCEPTIONS` **com motivo** —
> e essa lista **não** é a `DS_EXCEPTIONS` do registry: os 6 internos do example-chat
> são exceção de registry e **estão** no barrel.

**Cadência:** 1–3, 4 e 8 vão no **PR do componente** (mesmo commit). 5/6/7 (distribuição)
consolidam no **`/ds-release`** — mas **anote no PR body** que faltam, pra não sumirem.
No `/ds-release`, o passo 6.2b cobre 5; **6 (vocabulário do consumidor) e 7 entram junto**. Componente
distribuído (no registry) **sem** estar no vocabulário do consumidor = gap real (caso Toast v0.12.0).

## ✅ Regra de comportamento — as 3 superfícies

> Pedido do tipo *"a aba dentro de painel tem que vir `fullWidth`"*, *"`md` é o padrão, não
> passe `size`"*, *"esse componente precisa que o pai tenha altura"* **não é código**: é
> **regra**. E regra tem superfícies próprias, que não são as 8 do componente.

| # | Superfície | Onde | O que ela alcança |
|---|---|---|---|
| 1 | **Prosa** | `ui/<Nome>/USAGE.md`, seção Gotchas | quem **abre** o arquivo — é onde vive o **porquê**, sem limite de tamanho |
| 2 | **Bloco `ds:regras`** | mesmo `USAGE.md`, comentário HTML no topo | quem **escreve a tag** e não abre nada — o hook do consumidor injeta na hora |
| 3 | **Linha do vocabulário** | `cli/templates/default/_claude/rules/ds-components.md` **+ bump `cli/package.json`** | **100% das sessões** do consumidor (é `alwaysApply`) |

**A divisão de trabalho entre elas não é opcional** — cada uma tem um limite diferente:

```markdown
<!-- ds:regras
- omita `size`: `md` é o calibrado pro slot do AppShell; `lg` não é "pra dar destaque"
- omita `skeletonLayout`: `page` serve pra qualquer tela — só mude se ela tem KPIs no topo
- o pai precisa ter altura, senão a variante spinner colapsa no topo
-->
```

- **No bloco vai só o que muda uma DECISÃO DE DEFAULT**, no imperativo, ~4 linhas. O teto é
  duro: **3 componentes e 8 linhas por escrita**. O `ScreenLoader` tem 7 gotchas e só 3 são
  decisão de default — despejar os 7 faz o teto cortar em silêncio e o aviso passar a aparecer
  sempre, que é o mesmo que aviso desligado (L-059).
- **O porquê fica na prosa.** Bloco não é resumo do USAGE, é payload.
- **A linha do vocabulário é a mesma regra comprimida numa frase**, junto do critério de
  escolha do componente.

**Cadência:** 1 e 2 vão no PR do componente. 3 consolida no `/ds-release` (muda
`cli/templates/**` → força bump do CLI, que o release já sabe fazer).

**Gates que cobrem isto:**

| gate | pega | escopo |
|---|---|---|
| `distribution-debt` (`release:check`) | componente de `ui/` no registry **sem** linha no vocabulário. **Reprova** (`exit 1`) | família `ui/` |
| `rule-surfaces` (`npm test`) | primitivo com bloco NOMEADO em `shadcn/USAGE.md` sem linha no vocabulário. **Reprova** | família `shadcn/` |
| `api-doc-check` (CI) | componente **novo** cujo USAGE não declara bloco. **Avisa**, não reprova — componente pode não ter regra de default | componente novo |

> **A divisão entre os dois primeiros foi medida, não desenhada.** A 1ª versão do
> `rule-surfaces` cobrava a linha do vocabulário para **todo** componente com bloco. Rodando o
> `distribution-debt` no mesmo cenário (linha do `screen-loader` removida à mão), ele **já
> reprovava** com `exit 1` — metade do gate novo era cópia de regra que já tinha dono. O mesmo
> teste achou a fatia órfã: removendo `tabs`, o `distribution-debt` saiu **0**, porque ele
> varre só `src/components/ui/` e os primitivos shadcn ficam fora. Hoje cada caso tem
> exatamente um dono.

> **Por que estas 3 superfícies foram escritas em 2026-08-24.** O mecanismo de injeção existia
> no código, no hook do consumidor e em 24 testes desde 2026-08-21 — e **não era mencionado em
> nenhuma skill, regra ou command**. O mantenedor pediu regras de default explicitamente pro
> `ScreenLoader`; o agente escreveu prosa + vocabulário (2 de 3) e nada avisou da terceira.
> Não foi checklist ignorado: era **checklist ausente**. Mesmo modo de falha da L-042 (8
> superfícies) e da L-047 (4 superfícies de roteamento) — construir o mecanismo e não
> registrá-lo onde um agente olha.

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

# 3. push + PR no remote CANÔNICO — resolva por URL, NUNCA por nome (L-069)
#    Canônico = o remote cuja URL é igreenlab/igreen-desingsystem-admin. O NOME varia
#    por clone, e chumbar o nome erra num dos dois casos:
#       `origin`  → em clone direto do repo da empresa e no CI
#       `empresa` → em clone onde `origin` é o fork pessoal (snksergio/…, parado)
#    push em `origin` num clone-com-fork vai pro FORK e o PR nasce no repo errado;
#    push em `empresa` num clone direto morre com "does not appear to be a git repository".
#    ⚠️ Uma ÚNICA invocação: estado de shell não persiste entre chamadas de Bash.
CANON=$(git remote -v | grep -m1 'igreenlab/igreen-desingsystem-admin' | cut -f1); git push -u "$CANON" <tipo>/<escopo>
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
