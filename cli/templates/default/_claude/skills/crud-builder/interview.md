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
   > pré-configurados (ex.: *Ativos*, *Alto valor*, *Atrasados*). O usuário troca de
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
- Busca global? (`enableSearch`)
- Filtros por coluna? quais colunas e tipo de filtro (text/number/date/select/multiSelect/boolean)?
- Ações por linha (editar, excluir, ...)? (coluna `actions`, `getActions`).
- Seleção + ações em massa (exportar, etc.)? (`selectionConfig` + bulk actions).

## Fase 3 — Views, paginação & densidade
- Preset views salvas? (ex.: "Ativos", "Alto valor") → `defaultViews` / `presetView`.
- Paginação (tamanho inicial, opções) ou virtualização (10k+ linhas)?
- Totalizadores no rodapé? (`showTotalizers` + `aggregate`).

## Fase 4 — Criar/editar/detalhe (drawers)
- Precisa criar/editar registro? → drawer estilo `NovoClienteDrawer` (Panel + FormField).
- Precisa ver detalhe ao clicar na linha? → `FinanceDetailPanel` (FloatingPanel).
- (Puxar `example-finance` na geração pra reusar esses padrões.)

## Fase 5 — Kanban (opcional)
- Quer alternar tabela↔kanban? Se sim: qual campo agrupa as colunas (ex.: status)?
  Cada lane = uma option desse campo. (`viewMode` controlado + `kanbanConfig`.)

Ao terminar: resuma as escolhas e siga pro `blueprint.md` (gate).
