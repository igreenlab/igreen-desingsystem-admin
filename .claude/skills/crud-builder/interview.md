---
name: crud-builder-interview
description: >
  Estágio 1 do CRUD Builder — entrevista híbrida em 6 fases. Acumula escolhas
  pro blueprint. ZERO edição em disco neste estágio.
---

# CRUD Builder — Entrevista

## ⛔ Perguntas obrigatórias (NUNCA pular, mesmo que dê pra inferir)

Modo expresso e inferência NÃO valem pra estas duas — sempre explícitas:

1. **Colunas (Fase 2)** — mesmo inferindo, APRESENTAR a tabela de colunas e
   **confirmar em lote** + perguntar particularidades. Nunca gerar com colunas só
   inferidas sem o usuário ver/confirmar.
2. **Views salvas (Fase 4)** — **OFERECER e explicar o valor**, não tratar como
   "off" silencioso: _"abas com filtros + ordenação + colunas pré-configurados
   (ex.: Ativos, Alto valor) — o usuário troca de recorte num clique, sem tela nova
   pra cada um. Quer alguma?"_ Default = nenhuma, mas só após perguntar.

**Guardrails sempre aplicados** (não precisam pergunta, mas o plano DEVE conter):

- Excluir (action destructive) ⇒ confirmação via `AlertModal` — nunca deletar direto.
- Os 3 estados sempre wirados: `renderLoading` (skeleton) · `renderEmpty` (+ CTA) ·
  `renderNoResults` (+ limpar filtros). Tabela sem estados = incompleta.

Princípios:

- **Fases agrupadas com defaults explícitos** — cada pergunta mostra o default;
  "Enter/ok" aceita.
- **Drill-down só em exceções** — confirmação de colunas é em LOTE (tabela);
  pergunta individual só onde o usuário quer customizar.
- **Modo expresso** — a qualquer momento o usuário pode dizer "aceita os
  defaults daqui pra frente"; pule pro blueprint com o que tiver.
- **Dados podem ser incompletos** — se a fonte é uma API ainda sem payload, as
  colunas viram hipóteses a confirmar (nunca gerar silenciosamente).
- Use `AskUserQuestion` quando as opções forem enumeráveis; prosa quando aberto.

---

## Fase 0 — Entidade + fonte de dados (obrigatória, drill-down)

1. **Entidade**: nome singular/plural (ex: "Pedido/Pedidos") + 1 frase de domínio.
2. **Fonte de dados** — uma de:
   - **(a) Sample JSON colado** ← preferido. Ativa inferência valor+nome.
   - **(b) Interface TypeScript** (colada ou path). Inferência nome+tipo TS.
   - **(c) Descrição de endpoint** (URL/shape em prosa). Inferência só por nome
     → TODAS as colunas marcadas confiança baixa → confirmação integral.
   - **(d) Listagem manual** (`campo: tipo`). Só normalizar.
3. **Client vs server mode** — heurística a apresentar:
   - API pagina/ordena/filtra no servidor e retorna `total`? → **server**
     (`fetchData` em `useCallback`, retorna `{ data, total }`).
   - Dataset completo chega de uma vez (ou mock)? → **client** (`rows`).
   - Default: **client**.
4. **Volume estimado de linhas** (decide proposta de virtualização na Fase 4).
   Default: "< 1.000".
5. **`getRowId`** — campo id único. Default: `id`. Server mode → confirmar
   explicitamente (exemplo canônico usa `getRowId`).

### Inferência de tipos (determinística)

Ordem: **valor (se houver sample) → nome do campo → fallback `text`**.
Regex case-insensitive, PT+EN:

| Sinal                                     | Tipo inferido                                           | Confiança   |
| ----------------------------------------- | ------------------------------------------------------- | ----------- | ----------------------------------------------- | ------------ | ----------- | -------------------- | ----------------- | ---------------- | ----- |
| valor `boolean`                           | `boolean`                                               | alta        |
| valor string `YYYY-MM-DD`                 | `date`                                                  | alta        |
| valor string ISO com `T`+hora             | `datetime`                                              | alta        |
| valor array de strings                    | `tags` (filtro `multiSelect`)                           | média       |
| valor objeto com `name`/`avatar`          | `user` (+ `typeOptions.users` ou dot-path)              | média       |
| valor string com ≤8 distintos em ≥10 rows | `select` ou `status` → perguntar qual + `filterOptions` | média       |
| nome `/email/`                            | `email`                                                 | alta        |
| nome `/(phone                             | telefone                                                | celular     | fone)/`                                         | `phone`      | alta        |
| nome `/(url                               | link                                                    | site)/`     | `url`                                           | alta         |
| nome `/(valor                             | price                                                   | amount      | total                                           | custo        | receita     | salario              | saldo)/` + number | `currency` (BRL) | média |
| nome `/(percent                           | taxa                                                    | rate        | margem)/` + number                              | `percentage` | média       |
| nome `/(status                            | estado                                                  | situacao)/` | `status` → pedir options+cores                  | média        |
| nome `/(\_at                              | At                                                      | date        | data                                            | created      | updated)$/` | `date` ou `datetime` | média             |
| nome `/^(is                               | has)[A-Z]                                               | ativo       | enabled/`                                       | `boolean`    | média       |
| nome `/^id$                               | \_id$                                                   | Id$/`       | `text` estreito, sem filtro, sem sort relevante | alta         |
| number sem sinal monetário                | `number`                                                | alta        |
| resto                                     | `text`                                                  | alta        |

Tipos válidos = os registrados no `columnTypeRegistry`
(`src/components/ui/DataTable/column-types/`): text, number, currency,
percentage, date, datetime, email, phone, url, status, badge, boolean, select,
multiSelect, user, tags, actions. Na dúvida entre dois, pergunte.

---

## Fase 1 — Página e shell (agrupada)

| Pergunta                       | Default                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| Título da página               | plural da entidade                                                                 |
| Descrição (1-2 frases)         | gerada do domínio, confirmar                                                       |
| Badge (contagem de registros)? | sim quando AppShell                                                                |
| **Wrapper**                    | ver abaixo                                                                         |
| Page id (kebab-case)           | derivado do nome — **verificar colisão com `DOC_PAGES` em `src/App.tsx`**          |
| Seção da nav                   | "Data Table Components" (prefixo `Example:`) p/ standalone; "Examples" p/ AppShell |

**Wrapper — 3 opções:**

- **(a) `ExamplePageLayout`** (default neste repo) — standalone, padrão dos
  `Clients*Preview`. Props: `category/title/description/code/children`. O
  layout já dá altura definida pro preview (`h-screen` + `min-h-0`) —
  pré-requisito de virtualização.
- **(b) `AppShell` + `PageHeader`** — tela "real", padrão `ClientesShowcase/`
  (pasta com `components/`, mocks, types, index). Perguntar: drawer de criação
  (estilo NovoClienteDrawer) e/ou DetailDrawer no row click? Forms nesses
  drawers seguem L-023 (`FormField`) e L-024 (`gap-form-gap`).
- **(c) Componente puro sem wrapper** — consumer app (PAGES_DIR/REGISTRO do
  ambiente).

---

## Fase 2 — Colunas (confirmação em lote + drill-down)

1. Apresentar UMA tabela com TODAS as colunas inferidas:

```
| # | field | headerName | type | filtro | flags |
|---|-------|------------|------|--------|-------|
| 1 | id        | ID         | text     | —           | width estreito |
| 2 | name      | Nome       | text ?   | text        | isPrimary      |
| 3 | valor     | Valor      | currency?| number      | align right    |
...
```

`?` marca confiança média/baixa. Usuário corrige **em lote**
("3 é currency confirmado, 7 remove, 9 vira datetime").

2. Defaults aplicados sem perguntar (informar na tabela):
   - `isPrimary` na primeira coluna "nome-like" (vira título do card mobile).
   - `align: "right"` em currency/number/percentage (o registry já faz — só
     declarar se override).
   - `sortable: true` geral (registry/DataTable default), exceto actions.
   - **`enableColumnFilter: true` + `filterType` em TODAS as colunas de dados**
     (exceto `actions`/render-custom sem valor) — o funil só lista colunas com
     isso; marcar só badge/status = bug "filtra só 2 colunas". Ver `generate.md`
     §Regras de coluna.
   - **`width` NÃO setado** nas colunas de dados — `autoFit` (default ON) distribui
     pra preencher (sem 1ª coluna esticada). Fixar só id/código curto.
   - Coluna **`actions`** oferecida por default (Editar / Excluir destructive)
     via `actionColumn`/`getActions` — padrão `ClientsCRUDServerPreview`. Vai por
     **último**; o DataTable ancora à direita e estreita sozinho (sem `pinned`/`width`).
     **Excluir (destructive) ⇒ confirmação OBRIGATÓRIA via `AlertModal`** (nunca direto).

3. Drill-down individual SÓ nas colunas que o usuário citar:
   `pinned` ("left"/"right") · `width` fixo (senão autoFit resolve) ·
   `editable` (+`editType`) · `ellipsis` · `aggregate` (+`aggregateFormatter`) ·
   `valueGetter` (dot-path/lookup) · `render` custom (último recurso — preferir
   type do registry).

---

## Fase 3 — Filtros e busca (agrupada)

| Item                      | Pergunta                                                                             | Default                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Colunas filtráveis        | "Todas filtram, exceto...?"                                                          | todas com `enableColumnFilter: true`, exceto `actions` e render-custom sem valor filtrável |
| `filterType`              | derivado do `type` — confirmar só onde inferência foi `?`                            | = type                                                                                     |
| `filterOptions`           | p/ select/multiSelect/status: extrair do sample; senão pedir `{label, value, color}` | extraídas                                                                                  |
| **Filtros pré-aplicados** | quer a tela abrir já filtrada?                                                       | não                                                                                        |
| `showEmptyFilterChips`    | chips placeholder visíveis mesmo vazios (quais fields)?                              | nenhum                                                                                     |
| `simpleFilter`            | `hiddenFields` / `title` / `size` do drawer funil                                    | omitir                                                                                     |
| Search global             | `toolbar.enableSearch`                                                               | on                                                                                         |

**Filtros pré-aplicados — REGRA CRÍTICA:** o usuário escolhe **campo + valores**;
o operador é montado AUTOMATICAMENTE pela tabela de
`DataTable/USAGE.md` §"filterModel controlado" (multiSelect⇒`isAnyOf`,
select⇒`equals`, text⇒`contains`, number⇒`equals`, date⇒`between`,
boolean⇒`equals`). NUNCA aceitar operador solto do usuário sem validar.
Oferecer a alternativa: se não precisa de controle externo do filterModel,
`defaultViews={[presetView({...})]}` uncontrolled normaliza sozinho
(referências: `ClientsPreFilteredPreview.tsx` controlled vs
`ClientsCRUDPreview.tsx` presets).

---

## Fase 4 — Comportamento (agrupada, tabela de defaults)

| Item                  | Pergunta                                                                                                                                                                           | Default                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Pagination            | pageSize inicial + options                                                                                                                                                         | 25 · [10, 25, 50, 100]                      |
| **Virtualização**     | auto-propor se volume > ~1.000 client-mode: "ativar `virtualize` + pagination off?"                                                                                                | off                                         |
| Selection + bulk      | habilitar? quais bulk actions (`selectionConfig.actions`)? `enableGlobal`?                                                                                                         | off                                         |
| Row click             | nada / DetailDrawer / navegação                                                                                                                                                    | nada (standalone) · DetailDrawer (AppShell) |
| Inline edit           | quais colunas `editable` + `onCellEditCommit` async                                                                                                                                | off                                         |
| Totalizers            | `showTotalizers` + `aggregate` por coluna                                                                                                                                          | off                                         |
| Grouping              | `groupBy`? (avisar: pagination auto-off; default column-aligned, free-form via overrides)                                                                                          | off                                         |
| Row expansion         | coluna `expandable` + `renderRowExpansion` + `singleExpand`? (excludente com groupBy)                                                                                              | off                                         |
| Export                | `toolbar.enableExport` + escopo (tudo/filtrado/selecionado)                                                                                                                        | off                                         |
| Density               | `toolbar.enableDensity`                                                                                                                                                            | on                                          |
| `persistId`           | persistir workspace (localStorage v4)?                                                                                                                                             | on, valor = page id                         |
| Views (presets)       | abas pré-definidas (`defaultViews` + `presetView`)? quais (nome + filtros + sort)?                                                                                                 | off                                         |
| Views (usuário)       | usuário cria/salva/persiste as próprias? (`savedViewsService` + `persistId`)                                                                                                       | off                                         |
| Refresh               | `toolbar.enableRefresh`                                                                                                                                                            | on (default da API)                         |
| **toolbar.actions**   | ações custom no toolbar (`button`/`dropdown`/`input`, ex.: seletor de período). Inline no desktop; **colapsam no ⋯ no mobile**. Oferecer quando pedir botão/seletor extra na barra | off                                         |
| moreMenu              | items extras (⋯)?                                                                                                                                                                  | off                                         |
| **Estados**           | loading (`renderLoading` skeleton) · vazio (`renderEmpty` + CTA _Adicionar_) · sem-resultado (`renderNoResults` + limpar) — **sempre definir os 3**                                | defaults sensatos                           |
| **Form criar/editar** | campos (default = colunas editáveis) · obrigatório? · máscara (CNPJ/tel/CEP/moeda)? · validação? — via `FormField` (L-023) + `gap-form-gap` (L-024)                                | espelha colunas                             |

---

## Fase 5 — Kanban (opcional)

"Esta tela precisa de visão kanban (board) além da tabela?"

- **Não** (default) → entrevista termina.
- **Sim** → carregar `kanban-design.md` e seguir o sub-fluxo guiado. Pré-requisito:
  existir coluna select/status com `filterOptions` completas (Fase 2) pra ser o
  `groupByField`.

---

## Encerramento

Consolidar TODAS as escolhas num objeto de decisões (em memória — nada em disco),
carregar `blueprint.md` e montar o preview do gate.

Sinal: `BLUEPRINT_PRONTO: <Entidade> — aguardando gate`
