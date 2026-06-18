---
name: crud-builder-blueprint
description: >
  Estágio 2 do CRUD Builder — consolida a entrevista num blueprint único,
  roda pré-validações automáticas e apresenta o GATE. Zero edição antes do
  "aprovar".
---

# CRUD Builder — Blueprint [GATE]

## Pré-validações automáticas (ANTES de exibir)

Rodar e corrigir silenciosamente (ou reportar no blueprint se exigir decisão):

1. **Operador × filterType** — todo item de filtro pré-aplicado usa operador
   válido pro filterType da coluna (tabela em `DataTable/USAGE.md`
   §"filterModel controlado"). Inválido → corrigir pro default do tipo e
   anotar `← corrigido` no preview.
2. **Colisão de page id** — id não pode existir em `DOC_PAGES`
   (`src/App.tsx`). Colisão → propor sufixo.
3. **Kanban íntegro** — `groupByField` é select/status com `filterOptions`
   completas; toda lane mapeia uma option (e vice-versa, ou lane "outros").
4. **Excludências** — `virtualize` ⇒ pagination off; `groupBy` e
   `renderRowExpansion` não coexistem (groupBy vence); kanban ⇒ `viewMode`
   controlado.
5. **Memoização** — plano de geração marca `columns` useMemo + `fetchData`
   useCallback (server).
6. **Excluir confirma** — toda action `destructive` tem `AlertModal` no plano.
7. **Estados definidos** — loading/vazio/sem-resultado presentes (ainda que default).

## Formato do blueprint (apresentar TUDO de uma vez)

```markdown
## Blueprint — CRUD <Entidade>

**Página**: <Título> · id `<page-id>` · wrapper <ExamplePageLayout|AppShell|puro> · nav "<seção>"
**Dados**: <client|server> mode · fonte: <sample|interface|endpoint|manual> · ~<N> rows · getRowId: `<campo>`

### Colunas (<N>)
| # | field | headerName | type | filtro | flags |
|---|-------|------------|------|--------|-------|
| 1 | id    | ID         | text | —      | width 90 |
| 2 | name  | Nome       | text | text   | isPrimary |
| ... |
| N | _actions | —       | actions | —   | Editar · Excluir |

### Filtros iniciais
- `statusId` isAnyOf ["active"]            ← operador validado (multiSelect) ✅
- showEmptyFilterChips: [<fields>|nenhum]

### Comportamento
pagination <N> · selection+bulk [<actions>] · persistId "<page-id>" ·
totalizers [<cols>] · inline edit [<cols>] · virtualize <on|off> ·
groupBy <field|off> · expansion <on|off> · export <on|off|escopo> ·
views presets [<...>] · views usuário <on|off> (savedViewsService)

### Estados
loading <skeleton> · vazio <msg + CTA Adicionar> · sem-resultado <msg + limpar>

### Form criar/editar (se houver drawer)
campos: <campo:obrigatório?:máscara?>, ... (via FormField · gap-form-gap) ·
excluir: confirma via AlertModal

### Kanban
<não | groupByField `<campo>` · lanes: <id(dotColor)>... · card: title=<f>,
chip=<f>, value=<f> · DnD <on|off>>

### Arquivos
- CRIAR  <PAGES_DIR><Nome>Preview.tsx (~<N> linhas)        [ou pasta <Nome>Showcase/]
- EDITAR src/App.tsx (import + DOC_PAGES + render)
- EDITAR src/preview/components/doc-nav-data.ts (item "<label>")

### Referências canônicas que serão lidas antes de gerar
<lista da matriz do generate.md, só os cenários presentes>

⛔ Nenhum arquivo será tocado antes da aprovação.
Responda **aprovar** · **ajustar <o quê>** · **cancelar**.
```

## Protocolo do gate

- Registrar `PAUSADO (gate)` em `.ai/status/pipeline-state.md` com campo
  **Assumption** (ex: "o sample JSON é representativo do payload real;
  `statusId` tem exatamente os N valores mapeados").
- `aprovar` → carregar `generate.md` e executar.
- `ajustar X` → re-montar o blueprint com o ajuste → re-apresentar (novo gate).
- `cancelar` → abortar; pipeline-state recebe nota de cancelamento. Zero disco.

Sinal emitido junto com o preview: `BLUEPRINT_PRONTO: <Entidade> — aguardando gate`
