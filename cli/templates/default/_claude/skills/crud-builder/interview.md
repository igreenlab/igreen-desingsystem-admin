# CRUD Builder — Entrevista

Pergunte em fases, **uma pergunta de cada vez quando possível**, acumulando as
escolhas. NÃO edite arquivo nenhum aqui. Ao fim, vá pro `blueprint.md`.

## ⛔ Perguntas obrigatórias (NUNCA pular, mesmo que dê pra inferir)

A IA tende a inferir tudo e ir direto pro blueprint — **não faça isso**. Estas duas
são sempre explícitas:

1. **Colunas** — mesmo que dê pra inferir do nome da entidade, **LISTE** as colunas
   inferidas (campo · rótulo · tipo) e **confirme** (adicionar/remover/reordenar) +
   pergunte se **alguma tem particularidade** (ordenável, editável inline, alinhamento,
   fixar/pin, largura, filtro, totalizador). Nunca gere com colunas só inferidas.
2. **Views salvas** — **sempre OFEREÇA e explique** (não trate como "off" silencioso):

   > "Quer **views salvas**? São abas com filtros + ordenação + colunas/densidade
   > pré-configurados (ex.: _Ativos_, _Alto valor_, _Atrasados_). O usuário troca de
   > recorte num clique — sem precisar de uma tela nova pra cada um."

   Pergunte quais (nome + filtro + sort). Default = nenhuma, **mas só depois de perguntar**.

## Fase 0 — Entidade & origem dos dados

- Qual entidade? (ex.: Clientes, Pedidos, Faturas) → vira o nome da tela/tipo.
- Dados **client-side** (array em memória/mock) ou **server-side** (fetch paginado da API)?
  - Server: qual o endpoint/forma de buscar? (vira `fetchData` em `useCallback`).
- Onde a página vai morar e como registra a rota? (`PAGES_DIR`/`REGISTRO`).

## Fase 1 — Colunas

Pra cada coluna: campo, rótulo, **tipo** (text, number, currency, percentage, date,
datetime, email, phone, url, status/badge, boolean, user, tags, actions), e se é
sortable / editável (inline). Pergunte quais colunas o usuário quer e em que ordem.
Marque a coluna "primária" (a que abre detalhe / leva avatar).

## Fase 2 — Busca, filtros & ações

> ⛔ **Anti-pattern — NUNCA gerar form/selects soltos ACIMA da tabela.** Intenção de
> "adicionar filtro" (select de status em cima, campo de período, "filtrar por X") →
> **sugira o padrão certo** (a tabela já filtra reativo, com chips clicáveis/editáveis):
>
> - **Filtro por COLUNA** (status/categoria/tipo/data…) → `enableColumnFilter` +
>   `filterType`. Quer abrir já filtrado? **pré-aplique** (`defaultViews`/`presetView`
>   ou `filterModel`) → abre com o **chip aplicado**, editável, reativo. Pode pré-setar
>   **vários** (id/período/status/…), sem campos.
> - **Controle que NÃO é coluna** (período/mês, escopo) e **1–2 no máx** → `toolbar.actions`
>   (dropdown/button no toolbar). Nunca um form.
> - **Muitos filtros** → sempre os nativos (drawer "Filtros" + chips). Nunca empilhar selects.
>
> Regra de ouro: **filtro é recurso da tabela (reativo), não UI montada na unha.**

- Busca global? (`enableSearch`)
- Filtros por coluna? **Default = TODAS as colunas de dados filtram** (`enableColumnFilter: true` + `filterType` por tipo) — pergunte só "alguma NÃO deve filtrar?". O funil/drawer só lista colunas com `enableColumnFilter`; marcar só 2 = bug. (Ver §Regras de coluna em `generate.md`.)
- Ações por linha (editar, excluir, ...)? (coluna `actions`, `getActions`) — vai por **último**; o DataTable ancora à direita/estreita sozinho (sem `pinned`/`width`). NÃO setar `width` nas demais (autoFit distribui).
  **Toda ação destrutiva (Excluir) → confirmação OBRIGATÓRIA via `AlertModal`** (nunca
  deletar direto). Pergunte o texto do confirm.
- Seleção + ações em massa (exportar, etc.)? (`selectionConfig` + bulk actions).
- Export: escopo (tudo / filtrado / selecionado) + formato (csv)? (`toolbar.enableExport`).
- Ação custom no toolbar (ex.: seletor de período/mês, botão extra)? `toolbar.actions: ToolbarAction[]` (`button`/`dropdown`/`input`) — inline no desktop, colapsa no ⋯ no mobile. Oferecer só se o usuário pedir.

## Fase 3 — Views, paginação & densidade

- Views (ver bloco obrigatório). Dois sabores, pergunte os dois:
  - **Presets fixos** que VOCÊ define (`defaultViews`/`presetView`, ex.: "Ativos", "Alto valor").
  - **Views do usuário**: ele cria/salva/persiste as próprias (`savedViewsService` + `persistId`).
- Paginação (tamanho inicial, opções) ou virtualização (10k+ linhas)?
- Totalizadores no rodapé? (`showTotalizers` + `aggregate`).

## Fase 4 — Criar/editar/detalhe (drawers)

- Precisa criar/editar registro? → drawer estilo `NovoClienteDrawer` (Panel + FormField).
  - **Quais campos no form?** (default: espelha as colunas editáveis). Pra cada campo:
    **obrigatório?** **máscara** (CNPJ / telefone / CEP / moeda)? **validação** (formato,
    min/max)? Todo label via `<FormField>` (nunca `<label>` cru) + `gap-form-gap`.
- Precisa ver detalhe ao clicar na linha? → `FinanceDetailPanel` (FloatingPanel).
- (Puxar `example-finance` na geração pra reusar esses padrões.)

## Fase 5 — Kanban (opcional)

- Quer alternar tabela↔kanban? Se sim: qual campo agrupa as colunas (ex.: status)?
  Cada lane = uma option desse campo. (`viewMode` controlado + `kanbanConfig`.)

## Fase 6 — Estados (SEMPRE perguntar — sai faltando se não)

- **Loading** (`loading` + `renderLoading`): skeleton enquanto carrega — obrigatório em server mode.
- **Vazio** (`renderEmpty`): sem nenhum registro → "Nenhuma `<entidade>` ainda" + CTA _Adicionar_.
- **Sem resultado** (`renderNoResults`): filtro/busca sem match → "Nenhum resultado" + _Limpar filtros_.
- (Aceite defaults sensatos se o usuário não quiser customizar — mas **sempre wire os três**.)

Ao terminar: resuma as escolhas e siga pro `blueprint.md` (gate).
