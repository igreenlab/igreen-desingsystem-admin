import { useMemo, useState, type ReactNode } from "react";
import { MoreHorizontal, RefreshCw } from "lucide-react";
import {
  TableToolbar,
  ToolbarSearch,
  ToolbarTabs,
  ToolbarApplied,
  ToolbarToolButton,
  ToolbarActions,
  ToolbarFilterButton,
  ToolbarSimpleFilterDrawer,
} from "@/components/ui/TableToolbar";
import type {
  ToolbarAction,
  ToolbarActionMenuItem,
} from "@/components/ui/TableToolbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/shadcn/popover";
import { columnTypeRegistry } from "@/components/ui/DataTable/column-types";
import type { ColumnOption } from "@/components/ui/DataTable/column-types";
import {
  MULTI_VALUE_OPERATORS,
  genFilterId,
  typeOwnsMulti,
} from "@/components/ui/DataTable/utils/filter-ops";
import type {
  FilterItem,
  FilterModel,
  FilterValue,
  FilterOperator,
} from "@/components/ui/DataTable/data-table.types";
import type {
  AppliedFilter,
  FilterPopoverColumn,
  ToolbarTab,
} from "@/components/ui/TableToolbar";
import type { DataListView, FilterableField } from "../data-list.types";
import type { ListMenuItem } from "@/components/ui/List";

const ALL_VIEW_ID = "__all__";

type Props = {
  title?: ReactNode;
  count?: number;
  views: DataListView[];
  activeViewId: string | null;
  onApplyView: (v: DataListView | null) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  search: string;
  onSearch: (s: string) => void;
  filterFields?: FilterableField[];
  filterModel: FilterModel;
  onFilterModelChange: (m: FilterModel) => void;
  onRefresh?: () => void;
  toolbarActions?: ToolbarAction[];
  moreActions?: ListMenuItem[];
  loading?: boolean;
};

/** Mapeia campos filtráveis → colunas do drawer da TableToolbar. */
function toColumns(fields: FilterableField[]): FilterPopoverColumn[] {
  return fields.map((f) => ({
    key: f.id,
    label: f.label,
    filterType: f.type,
    type:
      f.type === "select" ? "select" : f.type === "number" ? "number" : "text",
    options: f.options,
  }));
}

/**
 * Converte o FilterModel (lista flat de items) → chips agrupados por
 * field+operator (mesma representação visual da TableToolbar). Versão enxuta
 * do `useFilterPopoverAdapter` da DataTable — sem ColumnDef/phantom/edit-on-click,
 * só o necessário pra exibir e remover chips no DataList.
 */
function toAppliedFilters(
  model: FilterModel,
  fieldsById: Map<string, FilterableField>,
): AppliedFilter[] {
  const grouped = new Map<string, FilterModel["items"]>();
  for (const item of model.items) {
    const isEmpty =
      item.operator !== "isEmpty" &&
      item.operator !== "isNotEmpty" &&
      (item.value == null ||
        item.value === "" ||
        (Array.isArray(item.value) && item.value.length === 0));
    if (isEmpty) continue;
    const key = `${item.field}|${item.operator}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }

  return Array.from(grouped.entries()).map(([key, items]) => {
    const field = fieldsById.get(items[0].field);
    const columnLabel = field?.label ?? items[0].field;
    const labelOf = (v: unknown): string =>
      field?.options?.find((o) => o.value === String(v))?.label ?? String(v);

    const values: string[] = [];
    for (const it of items) {
      if (Array.isArray(it.value))
        for (const v of it.value) values.push(labelOf(v));
      else if (it.value != null && it.value !== "")
        values.push(labelOf(it.value));
    }
    const value: ReactNode | ReactNode[] =
      values.length <= 2 ? values : `${values.length} selecionados`;

    return {
      id: key,
      columnLabel,
      op: items[0].operator as AppliedFilter["op"],
      value,
    };
  });
}

/**
 * Toolbar do DataList — reusa o `<TableToolbar>` (dumb, slot-based) passando só
 * os slots necessários (visões em abas/título · refresh · search · filtro→drawer ·
 * ⋯). SEM viewToggle e SEM settings/colunas. O filtro é o MESMO drawer da tabela
 * e os chips de filtro aplicado são o MESMO `<ToolbarApplied>`.
 */
export function DataListToolbar({
  title,
  count,
  views,
  activeViewId,
  onApplyView,
  searchable,
  searchPlaceholder,
  search,
  onSearch,
  filterFields,
  filterModel,
  onFilterModelChange,
  onRefresh,
  toolbarActions,
  moreActions,
  loading,
}: Props) {
  const hasActions = !!toolbarActions && toolbarActions.length > 0;
  // moreActions vira itens de menu (entram no ⋯; no mobile, dentro do ToolbarActions).
  const moreItems: ToolbarActionMenuItem[] = (moreActions ?? []).map((a) => ({
    label: a.label,
    icon: a.icon,
    onClick: a.onClick,
    destructive: a.destructive,
    disabled: a.disabled,
    separator: a.separator,
  }));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const columns = useMemo(() => toColumns(filterFields ?? []), [filterFields]);
  const fieldsById = useMemo(() => {
    const m = new Map<string, FilterableField>();
    for (const f of filterFields ?? []) m.set(f.id, f);
    return m;
  }, [filterFields]);
  const appliedFilters = useMemo(
    () => toAppliedFilters(filterModel, fieldsById),
    [filterModel, fieldsById],
  );
  const filterCount = appliedFilters.length;

  // Edição do chip in-place (igual DataTable): clicar abre popover com o
  // fast-filter do column-type; muda o valor direto no chip.
  const [openChipKey, setOpenChipKey] = useState<string | null>(null);

  const isEmptyVal = (v: unknown) =>
    v == null || v === "" || (Array.isArray(v) && v.length === 0);

  /**
   * Substitui o(s) item(ns) de um grupo field|operator no filterModel.
   *
   * Operador multi (`isAnyOf`/`isNoneOf`) grava **UM item POR VALOR** (spread). É a
   * forma canônica do `FilterModel`, declarada no `MULTI_VALUE_OPERATORS` ("o
   * FilterModel guarda 1 item por valor") e produzida por todos os outros
   * escritores: o `ToolbarSimpleFilterDrawer` que ESTE MESMO componente renderiza
   * (`updateFieldValue`), o chip do `DataTable` (`updateGroupValue`) e o painel
   * avançado (`handleFiltersChange`).
   *
   * ⚠️ Até 2026-11-03 gravava UM item com o array INTEIRO no `value`, enquanto o
   * motor (`applyFilterModel`) compara cada `value` COMO UM TODO. Com 1 valor
   * funcionava por acidente — `matchOp("equals", "ativo", ["ativo"])` coage pra
   * string e bate; com 2+ nada casava e a lista **esvaziava**. O funil ao lado, no
   * mesmo toolbar, sempre gravou certo: era o mesmo defeito de classe da Task 7b
   * (dois caminhos do mesmo componente discordando), agora no FORMATO em vez de no
   * widget. Não volte a gravar o array inteiro aqui.
   *
   * `between` (tupla) e operadores escalares seguem com UM item e o valor inteiro:
   * só os multi têm semântica de OR dentro do grupo. Espalhar um escalar viraria
   * AND no motor (`for (const g of scalar)`) e nunca casaria.
   */
  const setGroupValue = (
    field: string,
    operator: string,
    value: FilterValue,
  ) => {
    const rest = filterModel.items.filter(
      (i) => !(i.field === field && i.operator === operator),
    );
    const op = operator as FilterOperator;
    const novos: FilterItem[] = isEmptyVal(value)
      ? []
      : MULTI_VALUE_OPERATORS.has(op)
        ? (Array.isArray(value) ? (value as unknown[]) : [value])
            .filter((v) => v != null && v !== "")
            .map((v) => ({
              id: genFilterId(),
              field,
              operator: op,
              value: v as FilterValue,
            }))
        : [{ id: genFilterId(), field, operator: op, value }];
    onFilterModelChange({ ...filterModel, items: [...rest, ...novos] });
  };

  /** Chip clicável → popover de edição (fast-filter por column-type). */
  const renderEditableChip = (f: AppliedFilter, defaultChip: ReactNode) => {
    const [field, operator] = f.id.split("|");
    const fieldDef = fieldsById.get(field);
    if (!fieldDef) return defaultChip;

    const isMulti = operator === "isAnyOf" || operator === "isNoneOf";
    const isTuple = operator === "between";
    /* Tipo custom que DECLARA `ownsMulti` é dono do chip multi: a promoção pro
     * `multiSelect` built-in não o sequestra, e o widget recebe o valor como ARRAY
     * sempre (o contrato do flag é "lê e escreve lista", sem exceção por tamanho nem
     * por operador).
     *
     * ⚠️ A GUARDA é a mesma do chip do `DataTable` — ambos chamam `typeOwnsMulti`. O
     * GATILHO da promoção não é: o `DataTable` promove também por
     * `aggregateValues.length > 1` e por `filterType === "multiSelect"`
     * (`data-table.tsx:2053`), e aqui a promoção sai só do operador. Na prática isso
     * separa os dois quando um preset acumula 2+ items no mesmo campo com operador
     * ESCALAR: lá vira array, aqui fica `groupItems[0].value`. Não escreva que a
     * resolução é idêntica — ela não é.
     * Até 2026-11-03 esta linha era `isMulti ? "multiSelect" : fieldDef.type`, que
     * ignorava o flag; como o `DataListToolbar` renderiza TAMBÉM o
     * `ToolbarSimpleFilterDrawer` (que sempre respeitou o tipo), abrir o funil
     * entregava o widget do consumidor e clicar no chip que ele acabou de gerar
     * entregava o built-in — dois widgets a um clique de distância, no mesmo
     * componente. Não volte a decidir isso aqui dentro.
     *
     * ⚠️ `FilterableField` não tem `filterType`: o tipo mora só em `type`, e é a MESMA
     * chave que o `toColumns` manda pro drawer como `filterType`. Por isso os dois lados
     * convergem lendo `fieldDef.type`. */
    const ownsMulti = typeOwnsMulti(fieldDef.type);
    const regType = isMulti && !ownsMulti ? "multiSelect" : fieldDef.type;
    const def = columnTypeRegistry.get(regType);

    const groupItems = filterModel.items.filter(
      (i) => i.field === field && i.operator === operator,
    );
    const currentValue: FilterValue = isTuple
      ? (groupItems[0]?.value as FilterValue)
      : isMulti || ownsMulti
        ? (groupItems.flatMap((i) =>
            Array.isArray(i.value)
              ? (i.value as unknown[])
              : i.value != null
                ? [i.value]
                : [],
          ) as FilterValue)
        : (groupItems[0]?.value as FilterValue);

    return (
      <Popover
        open={openChipKey === f.id}
        onOpenChange={(o) => setOpenChipKey(o ? f.id : null)}
      >
        <PopoverTrigger asChild>{defaultChip}</PopoverTrigger>
        <PopoverContent align="start" className="p-0">
          {def.renderFastFilterInput({
            value: currentValue,
            onChange: (v) => setGroupValue(field, operator, v),
            options: fieldDef.options as ColumnOption[] | undefined,
            onClose: () => setOpenChipKey(null),
          })}
        </PopoverContent>
      </Popover>
    );
  };

  // Visões em ABAS (igual DataTable): 1ª aba = "Todos" (ou o título), demais = views.
  const tabs: ToolbarTab[] | undefined =
    views.length > 0
      ? [
          { id: ALL_VIEW_ID, name: title ?? "Todos" },
          ...views.map((v) => ({ id: v.id, name: v.label })),
        ]
      : undefined;

  const savedViewsSlot = tabs ? (
    <ToolbarTabs
      tabs={tabs}
      activeId={activeViewId ?? ALL_VIEW_ID}
      onSelect={(id) =>
        onApplyView(
          id === ALL_VIEW_ID ? null : (views.find((v) => v.id === id) ?? null),
        )
      }
      ariaLabel="Visões"
    />
  ) : title ? (
    <h2 className="text-title-md font-semibold text-fg-default">
      {title}
      {typeof count === "number" && (
        <span className="ml-gp-sm text-body-sm font-normal text-fg-muted">
          {count}
        </span>
      )}
    </h2>
  ) : undefined;

  const removeFilter = (groupKey: string) => {
    const [field, operator] = groupKey.split("|");
    onFilterModelChange({
      ...filterModel,
      items: filterModel.items.filter(
        (i) => !(i.field === field && i.operator === operator),
      ),
    });
  };

  return (
    <>
      <TableToolbar
        savedViews={savedViewsSlot}
        refresh={
          onRefresh ? (
            <ToolbarToolButton
              icon={
                <RefreshCw className={loading ? "animate-spin" : undefined} />
              }
              aria-label="Atualizar"
              title="Atualizar"
              onClick={onRefresh}
            />
          ) : undefined
        }
        search={
          searchable ? (
            <ToolbarSearch
              value={search}
              placeholder={searchPlaceholder ?? "Buscar..."}
              onChange={(e) => onSearch(e.target.value)}
            />
          ) : undefined
        }
        filter={
          filterFields && filterFields.length > 0 ? (
            <ToolbarFilterButton
              isActive={filterCount > 0}
              hasIndicator={filterCount > 0}
              onClick={() => setDrawerOpen(true)}
            />
          ) : undefined
        }
        actions={
          hasActions ? (
            <ToolbarActions actions={toolbarActions!} extraItems={moreItems} />
          ) : undefined
        }
        // Com toolbarActions, o ⋯ dos moreActions é absorvido pelo ToolbarActions
        // (desktop + mobile). Sem toolbarActions, mantém o ⋯ clássico.
        more={
          !hasActions && moreActions && moreActions.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ToolbarToolButton
                  icon={<MoreHorizontal />}
                  aria-label="Mais ações"
                  title="Mais ações"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={4}>
                {moreActions.map((a, i) =>
                  a.separator ? (
                    <DropdownMenuSeparator key={`s${i}`} />
                  ) : (
                    <DropdownMenuItem
                      key={a.label?.toString() ?? i}
                      variant={a.destructive ? "destructive" : "default"}
                      disabled={a.disabled}
                      onSelect={() => a.onClick?.()}
                    >
                      {a.icon}
                      {a.label}
                    </DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : undefined
        }
      />

      {/* Chips dos filtros aplicados — mesmo componente da DataTable. O wrapper
          do DataList já controla o gap (flex-col gap-gp-lg) → separator={false}. */}
      <ToolbarApplied
        filters={appliedFilters}
        onRemove={removeFilter}
        onClearAll={() => onFilterModelChange({ ...filterModel, items: [] })}
        separator={false}
        renderChip={(f, defaultChip) => renderEditableChip(f, defaultChip)}
      />

      {filterFields && filterFields.length > 0 && (
        <ToolbarSimpleFilterDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          columns={columns}
          filterModel={filterModel}
          onFilterModelChange={onFilterModelChange}
        />
      )}
    </>
  );
}
