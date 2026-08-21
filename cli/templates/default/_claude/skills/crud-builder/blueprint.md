> **Modo submódulo (`ds-link`).** Existe `.claude/ds-config.json` com `"mode": "submodule"`?
> Então **NÃO rode `igreen:add`** — esse script não existe no seu projeto. Os componentes e
> exemplos já estão no disco em `<dsPath>/src`: importe pelo `importBase` do config
> (compostos) e pelo `primitivesBase` (primitivos shadcn), e **leia** o exemplo direto de
> `<dsPath>/src/examples/`.

# CRUD Builder — Blueprint [GATE]

Consolide a entrevista num preview ÚNICO e **pare** pra aprovação. Nenhuma edição
em disco antes do "aprovar".

## Apresente ao usuário

```
Entidade:        <Nome>   (tipo <NomeRow>)
Modo:            client | server (endpoint: ...)
Onde:            <PAGES_DIR>/<Arquivo>.tsx  · registro: <REGISTRO>
Wrapper:         AppShell + PageHeader | puro   (chrome do print entregue? sim/não)
Colunas:         <campo:tipo[:sortable][:editável]>, ... (primária: <campo>)
Busca/Filtros:   busca=<sim/não> · filtros=<col:tipo, ...>
Ações linha:     <editar, excluir(confirm AlertModal), ...>   · seleção/bulk: <...>
Export:          <não | escopo tudo/filtrado/selecionado · csv>
Views:           presets=<nome → filtro>, ...   · do usuário=<sim/não · savedViewsService+persistId>
Paginação/virt:  <pageSize / virtualize>   · totalizadores: <colunas>
Drawers:         criar/editar=<sim/não> · campos=<campo:obrigatório?:máscara?> · detalhe=<sim/não>
Estados:         loading=<skeleton> · vazio=<msg + CTA> · sem-resultado=<msg + limpar>
Kanban:          <não | campo de agrupamento>
Componentes a puxar: data-table[, example-finance p/ drawers][, alert-modal p/ excluir][, ...]
```

## ⚠️ Decisões inferidas — vete se discordar

Depois do bloco acima, liste **só** o que o usuário não disse e você decidiu sozinho —
uma linha cada, com o que muda se ele vetar. Sem inferência → `nenhuma`; não apague a
seção: é a ausência dela que faz a decisão passar aprovada em pacote.

```
⚠️ Inferido (não perguntei):
  • wrapper = puro       → a tela nasce SEM rail/menu/header
  • tema = light         → a referência mostrava dark
  • <coluna> = <tipo>    → confiança baixa (inferido só pelo nome do campo)
```

## Pré-validações (rode ANTES de pedir aprovação)
- Todo filtro tem operador compatível com o filterType (multiSelect⇒isAnyOf, text⇒contains, date⇒between, number⇒gte/lte/between, boolean⇒equals).
- `virtualize` ⇒ paginação off + container com altura. `groupBy`/kanban ⇒ paginação off.
- Kanban: cada lane mapeia uma option do campo de agrupamento.
- Coluna `actions` se há ações por linha; cada action tem `id` único.
- **Ação `destructive` (excluir) ⇒ tem `AlertModal` de confirmação no plano.**
- **Os 3 estados (loading/vazio/sem-resultado) estão definidos** (mesmo que com default).
- Nome/rota da página sem colisão.

Liste qualquer ajuste necessário. Só depois pergunte: **"Aprovar e gerar?"**

- `aprovar` → carregue `generate.md`.
- pedir mudança → ajuste o blueprint e reapresente.
- `cancelar` → encerre (zero edições).
