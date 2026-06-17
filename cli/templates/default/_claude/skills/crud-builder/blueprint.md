# CRUD Builder — Blueprint [GATE]

Consolide a entrevista num preview ÚNICO e **pare** pra aprovação. Nenhuma edição
em disco antes do "aprovar".

## Apresente ao usuário

```
Entidade:        <Nome>   (tipo <NomeRow>)
Modo:            client | server (endpoint: ...)
Onde:            <PAGES_DIR>/<Arquivo>.tsx  · registro: <REGISTRO>
Colunas:         <campo:tipo[:sortable][:editável]>, ... (primária: <campo>)
Busca/Filtros:   busca=<sim/não> · filtros=<col:tipo, ...>
Ações linha:     <editar, excluir, ...>   · seleção/bulk: <...>
Views:           <preset: nome → filtro>, ...
Paginação/virt:  <pageSize / virtualize>   · totalizadores: <colunas>
Drawers:         criar/editar=<sim/não> · detalhe=<sim/não>
Kanban:          <não | campo de agrupamento>
Componentes a puxar: data-table[, example-finance p/ drawers][, ...]
```

## Pré-validações (rode ANTES de pedir aprovação)
- Todo filtro tem operador compatível com o filterType (multiSelect⇒isAnyOf, text⇒contains, date⇒between, number⇒gte/lte/between, boolean⇒equals).
- `virtualize` ⇒ paginação off + container com altura. `groupBy`/kanban ⇒ paginação off.
- Kanban: cada lane mapeia uma option do campo de agrupamento.
- Coluna `actions` se há ações por linha; cada action tem `id` único.
- Nome/rota da página sem colisão.

Liste qualquer ajuste necessário. Só depois pergunte: **"Aprovar e gerar?"**

- `aprovar` → carregue `generate.md`.
- pedir mudança → ajuste o blueprint e reapresente.
- `cancelar` → encerre (zero edições).
