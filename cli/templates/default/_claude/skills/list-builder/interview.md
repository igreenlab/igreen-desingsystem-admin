---
name: list-builder-interview
description: >
  Estágio 1 do List Builder — entrevista em 7 fases (0-6). Acumula escolhas pro
  blueprint. ZERO edição em disco neste estágio.
---

# List Builder — Entrevista

## ⛔ Perguntas obrigatórias (NUNCA pular, mesmo inferindo)

1. **Shape do card (Fase 2)** — mesmo inferindo, APRESENTAR o mapa de slots
   (leading/title/subtitle/meta/...) e **confirmar em lote**. Nunca gerar com o
   card só inferido sem o usuário ver/confirmar.
2. **Views (Fase 4)** — **OFERECER e explicar o valor**: _"abas com filtros
   pré-configurados (ex.: Admins, Ativos) — troca de recorte num clique. Quer
   alguma?"_ Default = nenhuma, mas só após perguntar.

Princípios:

- **Fases agrupadas com defaults explícitos** — cada pergunta mostra o default;
  "ok/Enter" aceita.
- **Modo expresso** — o usuário pode dizer "aceita os defaults daqui pra frente".
- **Dados podem ser incompletos** — fonte sem payload → slots viram hipóteses a
  confirmar (nunca gerar silenciosamente).
- `AskUserQuestion` quando enumerável; prosa quando aberto.

---

## Fase 0 — Entidade + fonte de dados (obrigatória)

1. **Entidade**: singular/plural (ex: "Membro/Membros") + 1 frase de domínio.
2. **Fonte de dados** — uma de:
   - **(a) Sample JSON colado** ← preferido (inferência valor+nome).
   - **(b) Interface TypeScript** (inferência nome+tipo).
   - **(c) Descrição de endpoint** (inferência só por nome → confiança baixa).
   - **(d) Listagem manual** (`campo: tipo`).
3. **Client vs server mode**:
   - API pagina/filtra no servidor e devolve `total`? → **server**
     (`mode="server"` + `onQueryChange` + `total`; DataList NÃO filtra local).
   - Dataset completo de uma vez (ou mock)? → **client** (default).
4. **Volume estimado** (decide proposta de escala na Fase 6). Default "< 1.000".
5. **Campo id único** — todo item precisa `id`. Default `id`.

---

## Fase 1 — Página e shell (agrupada)

| Pergunta               | Default                                                                |
| ---------------------- | ---------------------------------------------------------------------- |
| Título da página       | plural da entidade                                                     |
| Descrição (1-2 frases) | gerada do domínio, confirmar                                           |
| **Wrapper**            | ver abaixo                                                             |
| Page id (kebab-case)   | derivado do nome — **verificar colisão com `DOC_PAGES` (src/App.tsx)** |
| Seção da nav           | "List Components" (prefixo `Example:`)                                 |

**Wrapper — 3 opções:**

- **(a) `ExamplePageLayout`** (default neste repo) — standalone, padrão dos
  `List*Preview`. Props `category/title/description/code/children`. Dá altura
  definida pro preview (pré-requisito de `fillHeight`/virtualização).
- **(b) `AppShell` + `PageHeader`** — tela "real". Perguntar drawer de criação /
  DetailDrawer no item click. Forms seguem L-023 (`FormField`) + L-024 (`gap-form-gap`).
- **(c) Componente puro** — consumer (PAGES_DIR/REGISTRO do ambiente).

---

## Fase 2 — Card (shape) — confirmação em lote

O DataList passa cada item pro `List`, que monta o card por **slots** OU por
**`renderItem`** (card rico). Decidir qual:

### 2a. Slots (caso comum) — mapear campos → slots

Apresentar UM mapa e confirmar em lote:

```
| slot       | campo / conteúdo            | nota |
|------------|-----------------------------|------|
| leading    | <avatar/ícone>              | opcional |
| title      | <campo>                     | OBRIGATÓRIO |
| subtitle   | <campo>                     | opcional (ex: email) |
| description | <campo>                    | opcional (line-clamp 2) |
| meta[]     | <label:campo (align)>, ...  | colunas à direita (ROLE/STATUS/VISTO) |
| trailing   | <badge/chip/contagem>       | opcional |
```

Inferência de slot por nome (PT+EN): `name/nome/title` → title · `email` →
subtitle · `status/role/papel` → meta (com dot ou chip) · `avatar/photo/foto` →
leading. `meta[].value` pode ser texto ou um chip/StatusDot — confirmar.

### 2b. renderItem (card rico) — quando MUITOS campos / layout custom

Se o item tem layout próprio (ex: pedido com header+meta+footer, progresso,
avatar-stack) → `renderItem={(item) => <Card .../>}`. Espelhar
`ListRichPreview.tsx`. O wrapper (card/hover/click/menu) continua do List.

| Item                           | Default                                       |
| ------------------------------ | --------------------------------------------- |
| Densidade                      | `comfortable` (ou `compact`)                  |
| Menu por card (`getMenuItems`) | oferecer Editar/Excluir (Excluir destructive) |

---

## Fase 3 — Layout (agrupada)

| Layout                 | Quando                      | Extras a perguntar                                                                                                                                                      |
| ---------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **standard** (default) | lista plana                 | —                                                                                                                                                                       |
| **grouped**            | seções por status/categoria | `groups` (id/label/color) · `enableDnD` (arrastar entre/dentro → `onMove`/`onReorder`) · `groupSurface`                                                                 |
| **hierarchical**       | árvore (pai→filho)          | itens com `children` · `defaultExpandedIds` · **`branchHighlight`**: `none` (conectores) / `block` (painéis) / `active` (ramo do último aberto) · lazy `onLoadChildren` |

`branchHighlight` só em hierarchical. DnD só em standard/grouped (excludente com virtualização).

---

## Fase 4 — Toolbar (agrupada)

A toolbar do DataList é enxuta (reusa o TableToolbar): visões(abas)/título ·
refresh · busca · filtro(drawer) · ⋯. Sem colunas/toggle de visão.

> ⛔ **Anti-pattern — NUNCA gerar form/selects soltos ACIMA da lista.** Intenção de
> "adicionar filtro" (select de status em cima, campo de período, "filtrar por X") →
> **sugira o padrão certo** (o DataList já filtra reativo, com chips clicáveis/editáveis):
>
> - **Filtro por campo** (status/categoria/tipo/data…) → declare em `filterFields`. Quer
>   abrir já filtrado? **pré-aplique** via `views` ou `filterModel` → abre com o **chip
>   aplicado**, editável, reativo. Pode pré-setar **vários** de uma vez.
> - **Controle que NÃO é campo** (período/mês, escopo) e **1–2 no máx** → `toolbarActions`
>   (dropdown/button no toolbar). Nunca um form.
> - **Muitos filtros** → sempre os nativos (drawer "Filtros" + chips). Nunca empilhar selects.
>
> Regra de ouro: **filtro é recurso do DataList (reativo), não UI montada na unha.**

| Item               | Pergunta                                                                                                                                                                                            | Default                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Título OU views    | título à esquerda, ou abas de visão?                                                                                                                                                                | título (plural)                             |
| Busca              | `searchable` (cobre title/subtitle/description + accessors)                                                                                                                                         | on                                          |
| **filterFields**   | quais campos filtram? cada um: `{ id, label, type, accessor, options? }`                                                                                                                            | inferir dos campos select/status; confirmar |
| **Views (abas)**   | presets `{ id, label, query:{search, filterModel} }` — OFERECER (ver obrigatória)                                                                                                                   | nenhuma                                     |
| Refresh            | `onRefresh`                                                                                                                                                                                         | on                                          |
| **toolbarActions** | ações custom no toolbar (`button`/`dropdown`/`input`, ex.: seletor de período/mês). Inline no desktop; **colapsam no ⋯ no mobile**. Oferecer quando o usuário pedir um seletor/botão extra na barra | off                                         |
| moreActions (⋯)    | itens extras?                                                                                                                                                                                       | off                                         |

`filterFields.type` ∈ text/select/boolean/number/date. Chips de filtro aplicado
aparecem automaticamente (ToolbarApplied). Filtro abre o MESMO drawer da tabela.

---

## Fase 5 — Seleção, bulk e click

| Item          | Pergunta                                                                       | Default           |
| ------------- | ------------------------------------------------------------------------------ | ----------------- |
| `selectable`  | checkbox por card + bulk bar                                                   | off               |
| `bulkActions` | `{ label, icon?, onClick(ids), destructive? }[]` (ex: Editar/Arquivar/Excluir) | se selectable on  |
| `onItemClick` | nada / abrir detalhe / navegar                                                 | nada (standalone) |

Excluir (destructive) em drawer/form ⇒ confirmação via `AlertModal`.

---

## Fase 6 — Escala (excludentes)

| Opção               | Quando                                       | Props                                                            |
| ------------------- | -------------------------------------------- | ---------------------------------------------------------------- |
| Nenhuma (default)   | < ~1.000 itens                               | —                                                                |
| **Virtualização**   | listas grandes (só `standard`) — desliga DnD | `virtualized` (+ `estimateItemSize`)                             |
| **Infinite scroll** | paginar ao rolar                             | `onLoadMore` + `hasMore` + `loadingMore` (+ skeleton automático) |

Em tela dedicada (`ExamplePageLayout`), propor `fillHeight` + `className="flex-1
min-h-0"` (toolbar fixa, só a lista rola). Não combinar `fillHeight` com `virtualized`.

---

## Encerramento

Consolidar TODAS as escolhas num objeto de decisões (em memória — nada em disco),
carregar `blueprint.md` e montar o preview do gate.

Sinal: `BLUEPRINT_PRONTO: <Entidade> (lista) — aguardando gate`
