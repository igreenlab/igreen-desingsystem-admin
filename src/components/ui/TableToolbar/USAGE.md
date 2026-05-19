# TableToolbar — toolbar dumb e estilizável

Toolbar de barra horizontal pra tabelas / listas / qualquer surface que precise de busca, filtros, ordenação, controles de view, e bulk actions. **Dumb**: não armazena state de dados, recebe slots e props.

## Princípio dumb

`TableToolbar` aceita 3 slots:

```tsx
<TableToolbar
  left={/* ToolbarSearch + ToolbarDivider + Refresh + Views */}
  actions={/* FilterPopover + SortPopover + ColsPopover + Density + Export */}
  bulkBar={/* BulkActionsBar quando selectedCount > 0 */}
/>
```

Cada part é independente. Você compõe a **ordem visual** — toolbar não força layout fixo. Se mudar a ordem dos elementos em `left` ou `actions`, o resultado visual reflete imediatamente.

## Parts disponíveis

### Inputs / triggers visuais
| Part | Função |
|---|---|
| `ToolbarSearch` | Input de busca expansível no foco. Dumb — recebe `value`+`onChange`. |
| `ToolbarToolButton` | Botão de ícone com state visual `isActive`/`hasIndicator` (badge). |
| `ToolbarSaveButton` | Variante "+" pra criar nova view. |
| `ToolbarDivider` | Linha vertical de separação. |
| `ToolbarSegmented` | Grupo de botões (single-select). Ex: density toggle (compact/standard/comfortable). |
| `ToolbarTabs` | Tabs custom (com X opcional no hover). Ex: views salvas. |
| `ToolbarApplied` | Chips de filtros aplicados (abaixo da toolbar). Slot `renderChip` pra customizar. |
| `BulkActionsBar` | Barra de "X selecionados" + ações em massa. Auto-hide quando count=0. |
| `ToolbarMobileDialog` | Icon-button (default `md:hidden`) que abre um dialog centralizado pra agrupar controles colapsados no mobile. Consumido pelo `<DataTable>` por default. |
| `ToolbarMobileSection` | Grupo lógico (title + stack vertical) dentro do `ToolbarMobileDialog`. Use múltiplas seções pra categorizar (Visualização / Organizar / Mais ações). |

### Popovers (estado interno OK, mas conteúdo controlado)
| Part | Função |
|---|---|
| `FilterPopover` | Query builder visual. Aceita `renderValueInput` callback pra delegar inputs por tipo. |
| `SortPopover` | Multi-sort com dropdowns por coluna. |
| `ColsPopover` | Visibility + pin + drag reorder. |
| `ViewsPopover` | Lista de views salvas com lixinho + footer "Salvar". |
| `AddViewModal` | Modal pra criar nova view. |
| `MoreMenu` | Dropdown genérico pra "..." (mais opções). Use também pra Export, etc. |

### Compound
| Part | Função | Smart? |
|---|---|---|
| `TableToolbarViews` | Saved Views completo (Tabs + Popover + AddModal + DeleteAlert). | **Smart** — orquestra 4 filhos com state interno. Documentado. |

## Hooks opcionais

```ts
import { useToolbarFilters, useToolbarSort } from "@/components/ui/TableToolbar";

// Filtros — opcional. Você pode usar useState direto.
const filters = useToolbarFilters({ initial: [{ id, columnKey, op, value }] });
filters.add({ columnKey, op, value });

// Sort — mesma ideia
const sort = useToolbarSort({ initial: [] });
sort.add({ columnKey: "name", direction: "asc" });
```

## Patterns

### 1. Composição mínima

```tsx
<TableToolbar
  left={
    <ToolbarSearch
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
    />
  }
  actions={
    <FilterPopover
      columns={cols}
      filters={filterEntries}
      onFiltersChange={setFilterEntries}
      trigger={<ToolbarToolButton icon={<SlidersHorizontal />} label="Filtrar" />}
    />
  }
/>

<ToolbarApplied
  filters={appliedChips}
  onRemove={removeFilter}
/>
```

### 2. Filter shortcut do header (controlled `pendingOpenId`)

Pattern usado pelo DataTable: clicar num ícone no header abre o popover do chip do filtro automaticamente.

```tsx
const [pendingId, setPendingId] = useState<string | null>(null);

// Trigger externo (ex: ícone no header da coluna)
<button onClick={() => {
  addFilter({ id: "filter-status-eq", ... });
  setTimeout(() => setPendingId("filter-status-eq"), 0);
}}>
  Filtrar Status
</button>

// ToolbarApplied controla open via `pendingOpenId`
<ToolbarApplied
  filters={appliedChips}
  onRemove={removeFilter}
  pendingOpenId={pendingId}
  onPendingOpenIdChange={setPendingId}
  renderChip={(filter, defaultChip, isPendingOpen) => (
    <Popover open={isPendingOpen || undefined} onOpenChange={(o) => {
      if (!o) setPendingId(null);
    }}>
      <PopoverTrigger asChild>{defaultChip}</PopoverTrigger>
      <PopoverContent>{/* input do tipo certo */}</PopoverContent>
    </Popover>
  )}
/>
```

### 3. FilterPopover com inputs custom por tipo (callback)

```tsx
<FilterPopover
  columns={[{ key: "createdAt", label: "Criado em", filterType: "date" }]}
  renderValueInput={({ column, operator, value, onChange }) => {
    if (column.filterType === "date") {
      return <DatePicker value={value as string} onChange={onChange} />;
    }
    if (column.filterType === "multiSelect") {
      return <MultiSelectDropdown value={value as string[]} onChange={onChange} />;
    }
    // fallback nativo: text/number/select
    return undefined;
  }}
/>
```

O FilterPopover passa `value` como `unknown` — preserva arrays/tuplas/dates sem stringify.

### 4. Export dropdown via MoreMenu

```tsx
<MoreMenu
  trigger={<ToolbarToolButton icon={<Download />} label="Exportar" />}
>
  <MoreMenuItem onClick={() => exportCsv("all")}>
    <FileText /> CSV — Todos
  </MoreMenuItem>
  <MoreMenuItem onClick={() => exportCsv("selected")}>
    <FileText /> CSV — Selecionados
  </MoreMenuItem>
</MoreMenu>
```

`MoreMenu` cobre o caso "dropdown genérico do toolbar" — não precisa criar part específico pra Export.

### 5. Mobile collapse (controles secundários num dropdown)

Pattern adotado pelo `<DataTable>`: em viewports `<md`, controles secundários colapsam num `ToolbarMobileDialog` (icon button + dialog 384px). Search e Filter ficam sempre visíveis.

```tsx
<TableToolbar
  left={
    <>
      <ToolbarSearch value={q} onChange={setQ} />
      {/* Desktop only — display:contents preserva flex layout */}
      <div className="hidden md:contents">
        <ToolbarDivider />
        <ToolbarToolButton icon={<RefreshCw />} onClick={refresh} />
      </div>
    </>
  }
  actions={
    <>
      {/* Sempre visível */}
      <FilterPopover trigger={<ToolbarToolButton icon={<SlidersHorizontal />} />} />

      {/* Desktop only */}
      <div className="hidden md:contents">
        <SortPopover trigger={<ToolbarToolButton icon={<ArrowUpDown />} />} />
        <ColsPopover trigger={<ToolbarToolButton icon={<Columns />} />} />
      </div>

      {/* Mobile only — trigger md:hidden built-in */}
      <ToolbarMobileDialog>
        <ToolbarMobileSection title="Organizar">
          <SortPopover trigger={
            <Button variant="outline" fullWidth iconLeft={<ArrowUpDown />}>Ordenar</Button>
          } />
          <ColsPopover trigger={
            <Button variant="outline" fullWidth iconLeft={<Columns />}>Colunas</Button>
          } />
        </ToolbarMobileSection>
      </ToolbarMobileDialog>
    </>
  }
/>
```

**Pontos críticos:**
- **2 triggers, 1 estado**: cada popover (`Sort`/`Cols`/`Filter`) aceita `trigger` prop. Renderiza 2 triggers diferentes (icon-md desktop / fullWidth button mobile) — popover funciona via portal acima do dialog (Radix gerencia stacking)
- **`display:contents`** preserva flex layout do parent — filhos do `hidden md:contents` se comportam como diretos do toolbar flex
- **Dialog não bloqueia o conteúdo atrás** quando popover de sort/cols abre por cima (z-index do portal stacked depois)

### 6. TableToolbarViews vs composição manual

```tsx
{/* OPÇÃO A: compound pronto (fluxo padrão) */}
<TableToolbarViews
  views={savedViews}
  activeViewId={currentViewId}
  onApply={applyView}
  onApplyDefault={resetToDefault}
  onDelete={deleteView}
  onSave={saveCurrent}
/>

{/* OPÇÃO B: composição manual (quando precisar customizar interação) */}
<>
  <ToolbarTabs tabs={...} activeId={...} onSelect={...} onClose={...} />
  <ViewsPopover trigger={<ToolbarSaveButton />} views={...} onPin={...} onDelete={openConfirm} />
  <AddViewModal open={modalOpen} onSubmit={onSave} />
  <AlertModal open={!!deletingView} onConfirm={...} variant="danger" />
</>
```

## Acoplamento DataTable ↔ TableToolbar

**Regra de ouro**: o DataTable consome parts do TableToolbar via composição. Se você mudar a ordem dos itens no toolbar do DataTable amanhã, é uma edição **no DataTable**, não no TableToolbar — porque o toolbar não força nenhuma ordem.

Parts são **estáveis em isolamento**: cada um pode ser usado fora do DataTable em qualquer surface (drawer com toolbar, modal com filtros, header de seção, etc).

## Sincronia visual

Tokens de design propagam automaticamente — toolbar usa `bg-bg-input`, `border-border-input`, `min-h-form-md`, `px-pad-xl`, `text-body-sm font-normal`. Se mudar esses tokens no DS, toolbar acompanha sem código novo.

Custom styling de toolbar root: passe `className` que merge via `cn` (tw-merge resolve conflitos).
