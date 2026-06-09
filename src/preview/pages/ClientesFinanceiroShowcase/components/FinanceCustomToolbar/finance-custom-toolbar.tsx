import { useEffect, useState, type ReactNode } from "react";
import {
  entriesToSql,
  parseSqlFilter,
} from "@/components/ui/TableToolbar/popovers/filter-sql-parser";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Filter,
  GripVertical,
  Pin,
  PinOff,
  Plus,
  Rows2,
  Rows3,
  Rows4,
  Settings2,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import {
  TableToolbar,
  TableToolbarViews,
  ToolbarSearch,
  ToolbarSegmented,
  ToolbarToolButton,
  type TableToolbarViewsItem,
  type ToolbarSegmentedItem,
} from "@/components/ui/TableToolbar";
import type { AddViewModalSubmit } from "@/components/ui/TableToolbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { Checkbox } from "@/components/shadcn/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn/tabs";
import { Button } from "@/components/ui/Button/button";
import type { TableDensity } from "@/components/ui/Table";

/* ── Tipos públicos ────────────────────────────────────────────── */

/** View salva — usa o shape canônico do DS (TableToolbarViewsItem). */
export type FinanceViewTab = TableToolbarViewsItem;

export type FinanceSortColumn = {
  key: string;
  label: ReactNode;
};

export type FinanceSortCriterion = {
  key: string;
  dir: "asc" | "desc";
};

export type FinanceColColumn = {
  key: string;
  label: ReactNode;
};

/** Coluna do query builder advanced (mesmo shape do FilterPopoverColumn). */
export type FinanceFilterColumn = {
  key: string;
  label: string;
  type?: "text" | "number" | "select";
  options?: Array<{ value: string; label: string }>;
};

/** Entrada de filtro (mesmo shape do FilterPopoverEntry). */
export type FinanceFilterEntry = {
  id: string;
  columnKey: string;
  op: string;
  value: unknown;
};

export type FinanceFilterOperator = { id: string; label: string };

const DEFAULT_FILTER_OPERATORS: FinanceFilterOperator[] = [
  { id: "eq", label: "é" },
  { id: "neq", label: "não é" },
  { id: "contains", label: "contém" },
  { id: "gt", label: "maior que" },
  { id: "lt", label: "menor que" },
  { id: "isAnyOf", label: "é um de" },
  { id: "isNoneOf", label: "não é" },
  { id: "between", label: "entre" },
  { id: "isEmpty", label: "está vazio" },
  { id: "isNotEmpty", label: "não está vazio" },
];

export type FinanceCustomToolbarProps = {
  /* Views — passa direto pro TableToolbarViews do DS. NÃO inclui Default
   * (injetado internamente). Apenas views customizadas/persistidas. */
  views: FinanceViewTab[];
  /** ID da view atualmente aplicada. `null`/`undefined` = Default ativo. */
  activeViewId: string | null;
  /** Aplicar uma view (click em tab OU item do popover). */
  onApplyView: (id: string) => void;
  /** Resetar pra Default (limpar filtros/sort/cols/density). */
  onApplyDefault: () => void;
  /** Salvar visão atual — disparado pelo AddViewModal (modal interno). */
  onSaveView: (data: AddViewModalSubmit) => void | Promise<void>;
  /** Excluir view permanentemente — disparado pelo AlertModal de confirmação. */
  onDeleteView: (id: string) => void | Promise<void>;

  /* Search */
  searchValue: string;
  onSearchChange: (v: string) => void;

  /* Filtro simples — drawer panel (icon-only) */
  onOpenSimpleFilter: () => void;
  /** Quantidade ativa pra badge no botão de filtro. */
  filterActiveCount: number;

  /* Filtros avançados — sub-view inline no dropdown (query builder) */
  filterColumns: FinanceFilterColumn[];
  filters: FinanceFilterEntry[];
  onFiltersChange: (next: FinanceFilterEntry[]) => void;

  /* Sort */
  sortColumns: FinanceSortColumn[];
  sortBy: FinanceSortCriterion[];
  onSortByChange: (next: FinanceSortCriterion[]) => void;

  /* Colunas */
  colColumns: FinanceColColumn[];
  visibleCols: Set<string>;
  onVisibleChange: (next: Set<string>) => void;
  pinnedCols: Set<string>;
  onPinnedChange: (next: Set<string>) => void;
  /** Disparado quando user arrasta coluna pra reordenar — recebe nova ordem
   *  completa de `key`s. Consumer aplica via ref.setColumnOrder() no DataTable. */
  onColsReorder?: (next: FinanceColColumn[]) => void;

  /* Densidade */
  density: TableDensity;
  onDensityChange: (d: TableDensity) => void;

  /** Signal externo (incremento) pra abrir dropdown na view "advanced".
   *  Usado quando user clica num chip de filtro aplicado fora da toolbar. */
  advancedOpenSignal?: number;
};

/* ── Sub-views do dropdown Configurações ───────────────────────── */

type DropdownView = "menu" | "sort" | "cols" | "advanced";

const DENSITY_ITEMS: ToolbarSegmentedItem<TableDensity>[] = [
  { value: "compact",     children: <Rows4 />, label: "Compacto" },
  { value: "standard",    children: <Rows3 />, label: "Padrão" },
  { value: "comfortable", children: <Rows2 />, label: "Confortável" },
];

/* ── Componente ────────────────────────────────────────────────── */

export function FinanceCustomToolbar({
  views,
  activeViewId,
  onApplyView,
  onApplyDefault,
  onSaveView,
  onDeleteView,
  searchValue,
  onSearchChange,
  onOpenSimpleFilter,
  filterActiveCount,
  filterColumns,
  filters,
  onFiltersChange,
  sortColumns,
  sortBy,
  onSortByChange,
  colColumns,
  visibleCols,
  onVisibleChange,
  pinnedCols,
  onPinnedChange,
  onColsReorder,
  density,
  onDensityChange,
  advancedOpenSignal,
}: FinanceCustomToolbarProps) {
  // State do dropdown de Configurações
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [view, setView] = useState<DropdownView>("menu");

  // Reset view ao fechar o dropdown. Delay 200ms pra esperar a animação de
  // fade-out + zoom-out do Radix completar — sem o delay, o setView("menu")
  // sincrono causa flash visual do MenuView durante o fechamento (user vê o
  // menu principal piscar antes do dropdown sumir).
  const handleOpenChange = (open: boolean) => {
    setDropdownOpen(open);
    if (!open) {
      setTimeout(() => setView("menu"), 200);
    }
  };

  // Quando consumer incrementa advancedOpenSignal, abre dropdown em view
  // "advanced" (caso: user clica em chip de filtro aplicado)
  useEffect(() => {
    if (advancedOpenSignal == null || advancedOpenSignal === 0) return;
    setView("advanced");
    setDropdownOpen(true);
  }, [advancedOpenSignal]);

  return (
    <TableToolbar
      left={
        // TableToolbarViews — compound smart do DS. Orquestra:
        //  - ToolbarTabs (Default + views pinadas, X em tab faz unpin)
        //  - ViewsPopover (lista Todos/Pessoais + search + footer "Salvar visão")
        //  - AddViewModal (criar nova view)
        //  - AlertModal danger (confirma exclusão permanente)
        // Pattern 100% igual ao master DataTable — só mudou o LUGAR onde renderiza.
        <TableToolbarViews
          views={views}
          activeViewId={activeViewId}
          onApply={onApplyView}
          onApplyDefault={onApplyDefault}
          onSave={onSaveView}
          onDelete={onDeleteView}
          hideDivider
        />
      }
      actions={
        <>
          <ToolbarSearch
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar..."
          />

          {/* Filtro simples — icon only, abre drawer panel.
           *  Badge no canto quando há filtros ativos. */}
          <ToolbarToolButton
            icon={<Filter />}
            aria-label="Filtros"
            onClick={onOpenSimpleFilter}
            isActive={filterActiveCount > 0}
            hasIndicator={filterActiveCount > 0}
          />

          {/* Configurações — icon only (engrenagem). Dropdown com sub-views
           *  inline pra Ordenação e Colunas, "Filtros avançados" abre o
           *  query builder externo, e Densidade fica como segmented inline. */}
          <DropdownMenu open={dropdownOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
              <ToolbarToolButton
                icon={<Settings2 />}
                aria-label="Configurações da tabela"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              // Largura dinâmica: 300px no menu/sort/cols, 560px no advanced
              // (query builder precisa espaço pra 3 selects + remove em row).
              // SEM `p-0` — mantemos o `p-pad-sm` (=4px) padrão do
              // DropdownMenuContent pra alinhar com o pattern visual do DS
              // (kebab menu / "With Icons" exemplo). Conteúdo das sub-views
              // herda esse padding externo + seu próprio padding interno.
              className={
                view === "advanced"
                  ? "w-[560px] max-w-[calc(100vw-32px)] overflow-hidden"
                  : "w-[300px] overflow-hidden"
              }
              // Não fechar ao clicar item interno (a gente controla via state)
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              {view === "menu" && (
                <MenuView
                  density={density}
                  onDensityChange={onDensityChange}
                  onOpenSort={() => setView("sort")}
                  onOpenCols={() => setView("cols")}
                  onOpenAdvanced={() => setView("advanced")}
                  sortCount={sortBy.length}
                />
              )}
              {view === "sort" && (
                <SortView
                  columns={sortColumns}
                  sortBy={sortBy}
                  onSortByChange={onSortByChange}
                  onBack={() => setView("menu")}
                />
              )}
              {view === "cols" && (
                <ColsView
                  columns={colColumns}
                  visibleCols={visibleCols}
                  onVisibleChange={onVisibleChange}
                  pinnedCols={pinnedCols}
                  onPinnedChange={onPinnedChange}
                  onReorder={onColsReorder}
                  onBack={() => setView("menu")}
                />
              )}
              {view === "advanced" && (
                <AdvancedView
                  columns={filterColumns}
                  filters={filters}
                  onFiltersChange={onFiltersChange}
                  onBack={() => setView("menu")}
                />
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    />
  );
}

/* ── Sub-view: Menu principal ──────────────────────────────────── */

type MenuViewProps = {
  density: TableDensity;
  onDensityChange: (d: TableDensity) => void;
  onOpenSort: () => void;
  onOpenCols: () => void;
  onOpenAdvanced: () => void;
  sortCount: number;
};

function MenuView({
  density,
  onDensityChange,
  onOpenSort,
  onOpenCols,
  onOpenAdvanced,
  sortCount,
}: MenuViewProps) {
  return (
    <div className="flex flex-col">
      <DropdownMenuLabel>Configurações da tabela</DropdownMenuLabel>
      <DropdownMenuSeparator />

      <div className="flex flex-col px-pad-xs">
        <MenuItem
          icon={<ArrowUpDown />}
          label="Ordenação"
          badge={sortCount > 0 ? String(sortCount) : undefined}
          onClick={onOpenSort}
        />
        <MenuItem
          icon={<Columns3 />}
          label="Colunas"
          onClick={onOpenCols}
        />
        <MenuItem
          icon={<SlidersHorizontal />}
          label="Filtros avançados"
          onClick={onOpenAdvanced}
        />
      </div>

      {/* Densidade — divider DS-style (mx + h-px) + MenuLabel leve.
       *  Substitui o border-t + heavy-padding anterior pra alinhar com o
       *  pattern do kebab menu de row actions. */}
      <DropdownMenuSeparator />
      {/* mb-[4px] — afasta o segmented control 4px abaixo do label
       *  (alinha o "Densidade" + control com o pattern do master). */}
      <DropdownMenuLabel className="mb-[4px]">Densidade</DropdownMenuLabel>
      <div className="px-pad-xs pb-pad-xs">
        <ToolbarSegmented
          fluid
          items={DENSITY_ITEMS}
          value={density}
          onValueChange={onDensityChange}
        />
      </div>
    </div>
  );
}

/* ── Sub-view: Ordenação ───────────────────────────────────────── */

type SortViewProps = {
  columns: FinanceSortColumn[];
  sortBy: FinanceSortCriterion[];
  onSortByChange: (next: FinanceSortCriterion[]) => void;
  onBack: () => void;
};

/**
 * SortView — replica EXATAMENTE o markup do `<SortPopover>` original do DS
 * (popovers/sort-popover.tsx) dentro do dropdown de Configurações.
 *
 * Estrutura:
 *   - Header "ORDENAÇÃO" + botão back
 *   - Section: critérios atuais (asc/desc toggle pill + remove X no hover)
 *     ou empty message "Sem critérios de ordenação"
 *   - Section: "Adicionar ordenação por" + lista de colunas disponíveis
 *     (apenas as não usadas como critério) com botão `+` no hover
 *   - Footer "Limpar" (quando há critérios)
 */
function SortView({ columns, sortBy, onSortByChange, onBack }: SortViewProps) {
  const usedKeys = new Set(sortBy.map((s) => s.key));
  const available = columns.filter((c) => !usedKeys.has(c.key));

  const toggleDir = (index: number) => {
    const next = [...sortBy];
    next[index] = {
      ...next[index],
      dir: next[index].dir === "asc" ? "desc" : "asc",
    };
    onSortByChange(next);
  };

  const removeAt = (index: number) =>
    onSortByChange(sortBy.filter((_, i) => i !== index));

  const addSort = (key: string) =>
    onSortByChange([...sortBy, { key, dir: "asc" }]);

  const clearAll = () => onSortByChange([]);

  return (
    <div className="flex flex-col min-h-0 max-h-[480px]">
      <SubViewHeader onBack={onBack}>Ordenação</SubViewHeader>
      <DropdownMenuSeparator />

      {/* Body scroll — replica do SortPopover original */}
      <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--color-border-default)_transparent] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:bg-border-default [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        {/* Critérios atuais */}
        <section className="px-pad-md py-pad-xs">
          {sortBy.length === 0 ? (
            <p className="text-body-xs font-normal text-fg-muted m-0 px-pad-sm py-pad-sm">
              Sem critérios de ordenação.
            </p>
          ) : (
            <div className="flex flex-col gap-[2px]">
              {sortBy.map((s, i) => {
                const col = columns.find((c) => c.key === s.key);
                return (
                  <div
                    key={s.key}
                    className="group/row flex items-center gap-gp-md px-pad-md py-[4px] rounded-radius-md hover:bg-bg-muted"
                  >
                    <span className="text-caption-sm text-fg-subtle shrink-0">
                      {i === 0 ? "Por" : "depois por"}
                    </span>
                    <span className="flex-1 text-body-sm font-medium text-fg-default truncate">
                      {col?.label ?? s.key}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleDir(i)}
                      className="inline-flex items-center gap-gp-xs h-[22px] px-pad-md shrink-0 rounded-radius-sm bg-bg-muted text-fg-default text-caption-sm font-medium outline-none cursor-pointer hover:bg-bg-muted focus-visible:bg-bg-muted [&_svg]:size-[12px]"
                      aria-label={
                        s.dir === "asc"
                          ? "Mudar para descendente"
                          : "Mudar para ascendente"
                      }
                    >
                      {s.dir === "asc" ? <ArrowUp /> : <ArrowDown />}
                      {s.dir === "asc" ? "asc" : "desc"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAt(i)}
                      aria-label="Remover critério"
                      className="grid place-items-center size-[22px] shrink-0 rounded-radius-sm bg-transparent text-fg-muted outline-none cursor-pointer transition-[opacity,background-color,color] duration-150 opacity-0 group-hover/row:opacity-100 hover:bg-bg-muted hover:text-fg-default focus-visible:opacity-100 focus-visible:bg-bg-muted [&_svg]:size-[12px]"
                    >
                      <X strokeWidth={2.2} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Adicionar ordenação por */}
        {available.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Adicionar ordenação por</DropdownMenuLabel>
            <div className="flex flex-col px-pad-xs pb-pad-xs">
              {available.map((col) => (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => addSort(col.key)}
                  className="group/add flex items-center gap-gp-md w-full px-pad-lg py-pad-md rounded-radius-sm bg-transparent border-0 cursor-pointer outline-none text-left text-body-sm font-medium text-fg-muted hover:bg-bg-muted hover:text-fg-default focus-visible:bg-bg-muted focus-visible:text-fg-default transition-colors duration-150"
                >
                  <span className="flex-1 truncate">{col.label}</span>
                  <Plus
                    className="size-[14px] shrink-0 opacity-50 group-hover/add:opacity-100 group-hover/add:text-fg-brand transition-[opacity,color]"
                    strokeWidth={2}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer "Limpar" quando há critérios */}
      {sortBy.length > 0 && (
        <>
          <DropdownMenuSeparator />
          <div className="flex-none flex items-center justify-start gap-gp-md px-pad-lg py-pad-sm">
            <button
              type="button"
              onClick={clearAll}
              className="text-body-xs font-medium text-fg-brand bg-transparent border-0 p-0 cursor-pointer outline-none hover:underline focus-visible:underline underline-offset-2"
            >
              Limpar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Sub-view: Colunas ─────────────────────────────────────────── */

type ColsViewProps = {
  columns: FinanceColColumn[];
  visibleCols: Set<string>;
  onVisibleChange: (next: Set<string>) => void;
  pinnedCols: Set<string>;
  onPinnedChange: (next: Set<string>) => void;
  /** Drag reorder — replica HTML5 native do ColsPopover do DS. Quando passado,
   *  habilita grip drag + emite array reordenado completo. Quando ausente,
   *  esconde affordance de drag. */
  onReorder?: (next: FinanceColColumn[]) => void;
  onBack: () => void;
};

/**
 * ColsView — replica EXATAMENTE o markup do `<ColsPopover>` original do DS
 * (popovers/cols-popover.tsx) dentro do dropdown de Configurações.
 *
 * Mesmo header "COLUNAS VISÍVEIS" + lista com grip/checkbox/pin + footer
 * split "Mostrar todas / Só fixadas". Único delta visual: o header
 * compartilha o pattern do SubviewHeader (com botão back).
 *
 * Drag reorder NÃO foi habilitado nessa branch experimental — só toggle de
 * visibility + pin. Quando precisar, adicionar `onColumnsReorder` callback
 * e reaproveitar o pattern HTML5 nativo do ColsPopover original.
 */
function ColsView({
  columns,
  visibleCols,
  onVisibleChange,
  pinnedCols,
  onPinnedChange,
  onReorder,
  onBack,
}: ColsViewProps) {
  const toggleVisible = (key: string) => {
    const next = new Set(visibleCols);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onVisibleChange(next);
  };
  const togglePin = (key: string) => {
    const next = new Set(pinnedCols);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onPinnedChange(next);
  };

  const showAll = () => onVisibleChange(new Set(columns.map((c) => c.key)));
  const onlyPinned = () => onVisibleChange(new Set([...pinnedCols]));

  /* ── HTML5 Drag-and-Drop ───────────────────────────────────────
   * Pattern idêntico ao ColsPopover do DS (popovers/cols-popover.tsx):
   *  - `grippedIndex`: row que recebeu mousedown no grip → permite drag dessa row
   *  - `dragIndex`: row sendo arrastada
   *  - `dropIndex`: row sob o cursor (target)
   *  - Visual: opacity-40 na row dragged + shadow inset 2px no target (above/below)
   * Necessário grip-first (não drag-anywhere) pra coexistir com checkbox+labels.
   */
  const reorderable = Boolean(onReorder);
  const [grippedIndex, setGrippedIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (grippedIndex !== index) {
      e.preventDefault();
      return;
    }
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (dragIndex === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dropIndex !== index) setDropIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    if (dragIndex === null) return;
    e.preventDefault();
    if (dragIndex !== index && onReorder) {
      const next = [...columns];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      onReorder(next);
    }
    setDragIndex(null);
    setDropIndex(null);
    setGrippedIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
    setGrippedIndex(null);
  };

  return (
    <div className="flex flex-col min-h-0 max-h-[480px]">
      <SubViewHeader onBack={onBack}>Colunas visíveis</SubViewHeader>
      <DropdownMenuSeparator />

      {/* List — markup replicado do ColsPopover original (incl. DnD HTML5) */}
      <div className="flex-1 min-h-0 overflow-y-auto px-pad-xs py-pad-xs flex flex-col gap-[2px] [scrollbar-width:thin] [scrollbar-color:var(--color-border-default)_transparent] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:bg-border-default [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        {columns.map((col, index) => {
          const checked = visibleCols.has(col.key);
          const isPinned = pinnedCols.has(col.key);
          const isDragging = dragIndex === index;
          const isDropTarget =
            dragIndex !== null && dropIndex === index && dragIndex !== index;
          const dropAbove = isDropTarget && dragIndex! > index;
          const dropBelow = isDropTarget && dragIndex! < index;

          return (
            <div
              key={col.key}
              draggable={reorderable && grippedIndex === index}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={[
                "group/row flex items-center gap-gp-lg px-pad-md py-[4px] rounded-radius-md",
                "transition-[opacity,box-shadow] duration-150",
                "hover:bg-bg-muted",
                isDragging ? "opacity-40" : "",
                dropAbove ? "shadow-[inset_0_2px_0_0_var(--color-border-brand)]" : "",
                dropBelow ? "shadow-[inset_0_-2px_0_0_var(--color-border-brand)]" : "",
              ].join(" ")}
            >
              {reorderable ? (
                <span
                  onMouseDown={() => setGrippedIndex(index)}
                  onMouseUp={() => {
                    if (dragIndex === null) setGrippedIndex(null);
                  }}
                  className="grid place-items-center size-[16px] shrink-0 text-fg-subtle cursor-grab active:cursor-grabbing select-none [&_svg]:size-[14px]"
                  aria-label="Arrastar pra reordenar"
                >
                  <GripVertical strokeWidth={1.8} />
                </span>
              ) : (
                <span
                  className="grid place-items-center size-[16px] shrink-0 text-fg-subtle select-none [&_svg]:size-[14px] opacity-50"
                  aria-hidden="true"
                >
                  <GripVertical strokeWidth={1.8} />
                </span>
              )}
              <Checkbox
                id={`fincol-vis-${col.key}`}
                checked={checked}
                onCheckedChange={() => toggleVisible(col.key)}
                aria-label={
                  typeof col.label === "string"
                    ? `Mostrar ${col.label}`
                    : undefined
                }
              />
              <label
                htmlFor={`fincol-vis-${col.key}`}
                className="flex-1 text-body-sm font-medium text-fg-default cursor-pointer truncate"
              >
                {col.label}
              </label>
              <button
                type="button"
                onClick={() => togglePin(col.key)}
                aria-pressed={isPinned}
                aria-label={
                  typeof col.label === "string"
                    ? isPinned
                      ? `Desfixar ${col.label}`
                      : `Fixar ${col.label}`
                    : undefined
                }
                title={isPinned ? "Desfixar coluna" : "Fixar coluna"}
                className={[
                  "grid place-items-center size-[28px] shrink-0",
                  "rounded-radius-md bg-transparent text-fg-muted",
                  "transition-[opacity,background-color,color] duration-150",
                  "outline-none focus-visible:opacity-100 focus-visible:bg-bg-muted",
                  "hover:bg-bg-muted hover:text-fg-default",
                  "[&_svg]:size-[14px]",
                  isPinned
                    ? "opacity-100 text-fg-brand bg-bg-brand-subtle hover:bg-bg-brand-subtle hover:text-fg-brand"
                    : "opacity-0 group-hover/row:opacity-100",
                ].join(" ")}
              >
                {isPinned ? (
                  <Pin strokeWidth={2.2} />
                ) : (
                  <PinOff strokeWidth={1.8} />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer split — "Mostrar todas" / "Só fixadas" */}
      <DropdownMenuSeparator />
      <div className="flex-none flex items-center justify-between gap-gp-md px-pad-lg py-pad-sm">
        <button
          type="button"
          onClick={showAll}
          className="text-body-xs font-medium text-fg-brand bg-transparent border-0 p-0 cursor-pointer outline-none hover:underline focus-visible:underline underline-offset-2"
        >
          Mostrar todas
        </button>
        <button
          type="button"
          onClick={onlyPinned}
          className="text-body-xs font-medium text-fg-brand bg-transparent border-0 p-0 cursor-pointer outline-none hover:underline focus-visible:underline underline-offset-2"
        >
          Só fixadas
        </button>
      </div>
    </div>
  );
}

/* ── Sub-view: Filtros avançados (query builder) ──────────────── */

type AdvancedViewProps = {
  columns: FinanceFilterColumn[];
  filters: FinanceFilterEntry[];
  onFiltersChange: (next: FinanceFilterEntry[]) => void;
  onBack: () => void;
};

function generateFilterId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * AdvancedView — replica EXATAMENTE o modo "visual" do `<FilterPopover>`
 * original do DS (popovers/filter-popover.tsx) dentro do dropdown de
 * Configurações.
 *
 * Estrutura:
 *   - Header "FILTROS" + botão back
 *   - Body: empty state (sem filtros) OR lista de filtros com remover
 *     + botão dashed "Adicionar condição" sticky no rodapé do body
 *   - Footer: "Limpar todos" + counter "N condições ativas"
 *
 * Cada row é: [conj label] [Campo Select] [Operador Select] [Valor input/Select] [X]
 */
function AdvancedView({
  columns,
  filters,
  onFiltersChange,
  onBack,
}: AdvancedViewProps) {
  const [mode, setMode] = useState<"visual" | "advanced">("visual");
  const [advancedText, setAdvancedText] = useState("");
  const [advancedError, setAdvancedError] = useState<string | null>(null);
  /** ID da row recém-adicionada via "Adicionar condição". Quando setado,
   *  a FilterRow correspondente auto-abre o Select de Campo no mount
   *  (ponto #2 — user vê dropdown aberto pra escolher coluna direto). */
  const [autoOpenRowId, setAutoOpenRowId] = useState<string | null>(null);

  // Ao entrar no modo avançado, hidrata textarea com SQL gerado dos
  // filtros atuais (mesmo pattern do FilterPopover original)
  useEffect(() => {
    if (mode !== "advanced") return;
    setAdvancedText(
      entriesToSql(
        filters.map((f) => ({
          field: f.columnKey,
          op: f.op as never,
          value:
            typeof f.value === "string"
              ? f.value
              : f.value == null
                ? ""
                : String(f.value),
        })),
        "AND",
      ),
    );
    setAdvancedError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const generateFid = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto)
      return crypto.randomUUID();
    return `f_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  };

  // Aplica o textarea SQL — parseia e converte em FinanceFilterEntry[]
  const applyAdvanced = () => {
    const result = parseSqlFilter(advancedText);
    if (!result.ok) {
      setAdvancedError(result.error);
      return;
    }
    setAdvancedError(null);
    const validKeys = new Set(columns.map((c) => c.key));
    const valid = result.entries.filter((e) => validKeys.has(e.field));
    const invalid = result.entries.filter((e) => !validKeys.has(e.field));
    if (invalid.length > 0) {
      setAdvancedError(
        `Campos desconhecidos: ${invalid.map((e) => e.field).join(", ")}`,
      );
      return;
    }
    onFiltersChange(
      valid.map((e) => ({
        id: generateFid(),
        columnKey: e.field,
        op: e.op,
        value: e.value,
      })),
    );
    setMode("visual");
  };

  const validCount = filters.filter((f) => {
    if (f.op === "isEmpty" || f.op === "isNotEmpty") return true;
    const v = f.value;
    if (v == null) return false;
    if (typeof v === "string") return v.length > 0;
    if (Array.isArray(v)) {
      return v.some(
        (x) => x != null && (typeof x === "string" ? x.length > 0 : true),
      );
    }
    return true;
  }).length;

  const updateRow = (id: string, next: FinanceFilterEntry) =>
    onFiltersChange(filters.map((f) => (f.id === id ? next : f)));
  const removeRow = (id: string) =>
    onFiltersChange(filters.filter((f) => f.id !== id));
  const addRow = () => {
    const firstCol = columns[0];
    if (!firstCol) return;
    const newRow: FinanceFilterEntry = {
      id: generateFilterId(),
      columnKey: firstCol.key,
      op: "eq",
      value: "",
    };
    onFiltersChange([newRow, ...filters]);
    // Sinaliza pra FilterRow auto-abrir o Select de Campo no próximo render
    setAutoOpenRowId(newRow.id);
  };
  const clearAll = () => onFiltersChange([]);

  return (
    <div className="flex flex-col min-h-0 max-h-[480px]">
      <SubViewHeader
        onBack={onBack}
        rightSlot={
          // Tabs Visual / Avançado — replica do FilterPopover (enableAdvanced).
          // Altura reduzida (h-[28px] / trigger h-[24px]) pra acomodar no header
          // leve do DS pattern (py-pad-xs em vez do py-pad-lg anterior).
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as "visual" | "advanced")}
          >
            <TabsList className="h-[28px] p-[2px] rounded-radius-sm gap-[2px]">
              <TabsTrigger
                value="visual"
                className="h-[24px] px-pad-md rounded-radius-xs text-body-xs"
              >
                Visual
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="h-[24px] px-pad-md rounded-radius-xs text-body-xs"
              >
                Avançado
              </TabsTrigger>
            </TabsList>
          </Tabs>
        }
      >
        Filtros
      </SubViewHeader>
      <DropdownMenuSeparator />

      {/* Body modo Visual: empty state ou lista de filtros */}
      {mode === "visual" ? (
      filters.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center px-pad-2xl py-pad-4xl">
          <Filter
            strokeWidth={1.6}
            className="size-[20px] text-fg-muted mb-pad-xl"
          />
          <p className="text-body-sm font-semibold text-fg-default m-0">
            Nenhuma condição
          </p>
          <p className="text-body-xs font-normal text-fg-muted m-0 mt-pad-2xs mb-pad-2xl">
            Adicione filtros pra refinar a lista.
          </p>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-gp-sm h-form-md px-pad-2xl rounded-radius-lg bg-bg-brand text-fg-on-brand text-body-sm font-semibold cursor-pointer outline-none transition-[background-color] duration-150 hover:bg-bg-brand focus-visible:shadow-sh-ring [&_svg]:size-[14px]"
          >
            <Plus strokeWidth={2.4} />
            Adicionar condição
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--color-border-default)_transparent] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-thumb]:bg-border-default [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            <div className="flex flex-col gap-gp-2xl sm:gap-gp-md p-pad-xl">
              {filters.map((f, i) => (
                <FilterRow
                  key={f.id}
                  filter={f}
                  index={i}
                  columns={columns}
                  onChange={(next) => updateRow(f.id, next)}
                  onRemove={() => removeRow(f.id)}
                  autoOpenField={autoOpenRowId === f.id}
                  onAutoOpenConsumed={() => setAutoOpenRowId(null)}
                />
              ))}
            </div>
          </div>
          {/* Add button dashed */}
          <div className="flex-none px-pad-xl pb-pad-xl pt-0">
            <button
              type="button"
              onClick={addRow}
              className="flex items-center justify-center gap-gp-sm w-full min-h-form-md px-pad-xl rounded-radius-md bg-transparent text-fg-muted border border-dashed border-border-default text-body-sm font-medium cursor-pointer outline-none transition-[background-color,color,border-color] duration-150 hover:bg-bg-muted hover:text-fg-default focus-visible:bg-bg-muted focus-visible:text-fg-default [&_svg]:size-[14px]"
            >
              <Plus strokeWidth={2.2} />
              Adicionar condição
            </button>
          </div>
        </>
      )
      ) : (
        /* Body modo Avançado — textarea SQL livre (estilo demo).
         *  Parsing real fica fora desta branch experimental; aqui apenas
         *  espelha visual do FilterPopover.tsx original (mode="advanced"). */
        <div className="flex-1 min-h-0 flex flex-col gap-gp-md p-pad-xl overflow-y-auto">
          <span className="text-caption-sm text-fg-muted">
            Editor livre — sintaxe estilo SQL. Operadores: <code>=</code>{" "}
            <code>!=</code> <code>&gt;</code> <code>&lt;</code>{" "}
            <code>contains</code>. Conectores: <code>AND</code>{" "}
            <code>OR</code>.
          </span>
          <textarea
            spellCheck={false}
            value={advancedText}
            onChange={(e) => {
              setAdvancedText(e.target.value);
              setAdvancedError(null);
            }}
            rows={8}
            placeholder={`-- Ex:\nstatus = "active"\nAND value > 1000`}
            className={[
              "w-full px-pad-xl py-pad-md rounded-radius-md bg-bg-input dark:bg-bg-muted border",
              advancedError ? "border-border-critical" : "border-border-input",
              "text-body-xs font-normal font-mono text-fg-default placeholder:text-fg-muted outline-none resize-y transition-[border-color,box-shadow] duration-150",
              advancedError
                ? "focus:border-border-critical focus:shadow-sh-ring-danger"
                : "focus:border-border-brand focus:shadow-sh-ring",
            ].join(" ")}
          />
          {advancedError && (
            <p className="text-caption-sm text-fg-critical">{advancedError}</p>
          )}
          <button
            type="button"
            onClick={applyAdvanced}
            className="self-end px-pad-xl h-form-md rounded-radius-md bg-bg-brand text-fg-on-brand text-body-xs font-semibold hover:bg-bg-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand transition-[background-color,box-shadow] duration-150"
          >
            Aplicar
          </button>
        </div>
      )}

      {/* Footer */}
      <DropdownMenuSeparator />
      <div className="flex-none flex items-center justify-between gap-gp-md px-pad-lg py-pad-sm">
        <button
          type="button"
          onClick={clearAll}
          disabled={filters.length === 0}
          className="text-body-xs font-medium text-fg-brand bg-transparent border-0 p-0 cursor-pointer outline-none hover:underline focus-visible:underline underline-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:no-underline"
        >
          Limpar todos
        </button>
        <span className="text-caption-sm text-fg-muted">
          {validCount === 0
            ? "Nenhum filtro ativo"
            : `${validCount} ${validCount > 1 ? "condições ativas" : "condição ativa"}`}
        </span>
      </div>
    </div>
  );
}

/* ── FilterRow (linha individual do query builder) ──────────────── */

type FilterRowProps = {
  filter: FinanceFilterEntry;
  index: number;
  columns: FinanceFilterColumn[];
  onChange: (next: FinanceFilterEntry) => void;
  onRemove: () => void;
  /** Quando true, abre o Select de Campo automaticamente no mount (uso:
   *  "Adicionar condição" → user vê dropdown aberto pra escolher coluna). */
  autoOpenField?: boolean;
  /** Disparado uma vez quando o autoOpen foi consumido (limpa signal no parent). */
  onAutoOpenConsumed?: () => void;
};

const FILTER_FIELD_BASE =
  "min-h-form-md h-form-md min-w-0 w-full rounded-radius-md text-body-sm font-normal";

const FILTER_INPUT =
  "min-h-form-md h-form-md min-w-0 w-full rounded-radius-md text-body-sm font-normal px-pad-xl bg-bg-input dark:bg-bg-muted border border-border-input text-fg-default placeholder:text-fg-muted outline-none transition-[border-color,box-shadow] duration-150 focus:border-border-brand focus:shadow-sh-ring";

function FilterRow({
  filter,
  index,
  columns,
  onChange,
  onRemove,
  autoOpenField,
  onAutoOpenConsumed,
}: FilterRowProps) {
  const col = columns.find((c) => c.key === filter.columnKey);
  const isSelect = col?.type === "select";
  const inputType = col?.type === "number" ? "number" : "text";
  const stringValue =
    typeof filter.value === "string"
      ? filter.value
      : filter.value == null
        ? ""
        : String(filter.value);

  /** Controla o open do Select de Campo. Inicializa com `autoOpenField` —
   *  quando true, abre no primeiro render (caso de "Adicionar condição"). */
  const [fieldOpen, setFieldOpen] = useState<boolean>(!!autoOpenField);
  /** Limpa o signal no parent UMA VEZ após o auto-open ter sido aplicado.
   *  Sem isso, re-renders subsequentes manteriam o signal ligado. */
  useEffect(() => {
    if (autoOpenField) onAutoOpenConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-gp-md">
      <span className="text-caption-sm text-fg-muted shrink-0 sm:w-[18px] sm:text-center">
        {index === 0 ? "Se" : "E"}
      </span>
      {/* Campo */}
      <div className="w-full sm:flex-[1_1_0%] sm:basis-0 min-w-0">
        <Select
          value={filter.columnKey}
          onValueChange={(v) =>
            onChange({ ...filter, columnKey: v, value: "" })
          }
          open={fieldOpen}
          onOpenChange={setFieldOpen}
        >
          <SelectTrigger
            className={`${FILTER_FIELD_BASE} px-pad-xl gap-gp-md`}
            aria-label="Campo"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {columns.map((c) => (
              <SelectItem key={c.key} value={c.key}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Operador */}
      <div className="w-full sm:flex-[0.7_1_0%] sm:basis-0 min-w-0 sm:min-w-[80px]">
        <Select
          value={filter.op}
          onValueChange={(v) => onChange({ ...filter, op: v })}
        >
          <SelectTrigger
            className={`${FILTER_FIELD_BASE} px-pad-xl gap-gp-md`}
            aria-label="Operador"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_FILTER_OPERATORS.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Valor */}
      <div className="w-full sm:flex-[1.3_1_0%] sm:basis-0 min-w-0">
        {isSelect ? (
          <Select
            value={stringValue}
            onValueChange={(v) => onChange({ ...filter, value: v })}
          >
            <SelectTrigger
              className={`${FILTER_FIELD_BASE} px-pad-xl gap-gp-md`}
              aria-label="Valor"
            >
              <SelectValue placeholder="Selecione…" />
            </SelectTrigger>
            <SelectContent>
              {col?.options?.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <input
            type={inputType}
            value={stringValue}
            onChange={(e) => onChange({ ...filter, value: e.target.value })}
            placeholder="Valor"
            aria-label="Valor"
            className={FILTER_INPUT}
          />
        )}
      </div>
      {/* Remover */}
      <Button
        color="secondary"
        variant="ghost"
        size="icon-sm"
        aria-label="Remover condição"
        onClick={onRemove}
        className="shrink-0 self-end sm:self-auto hover:bg-bg-danger-muted hover:text-fg-danger focus-visible:bg-bg-muted"
      >
        <Trash2 strokeWidth={1.8} />
      </Button>
    </div>
  );
}

/* ── Atoms ───────────────────────────────────────────────────────── */

/**
 * SubViewHeader — header de sub-view (Sort/Cols/Advanced/Filtros) com
 * botão back + label. Como o `<DropdownMenuLabel>` do DS shadcn não tem
 * affordance pra back button (é um simples label estático), criamos um
 * wrapper que combina os DOIS layouts:
 *   - back button à esquerda
 *   - DropdownMenuLabel ao lado (mesmas classes exatas do componente DS:
 *     `px-pad-lg py-pad-sm text-caption-sm font-semibold uppercase
 *      tracking-wider text-fg-subtle`)
 *   - rightSlot opcional (ex: Tabs Visual/Avançado no AdvancedView)
 *
 * NÃO usa `leading-none` — line-height natural alinha com o pattern
 * "With Icons" do DropdownMenu original (label tem respiro vertical).
 */
function SubViewHeader({
  onBack,
  children,
  rightSlot,
}: {
  onBack: () => void;
  children: ReactNode;
  rightSlot?: ReactNode;
}) {
  return (
    <div className="flex-none flex items-center gap-gp-xs px-pad-xs">
      <button
        type="button"
        onClick={onBack}
        className="grid place-items-center size-icon-md rounded-radius-sm text-fg-muted hover:bg-bg-muted hover:text-fg-default transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-brand"
        aria-label="Voltar"
      >
        <ChevronLeft className="size-icon-sm" />
      </button>
      {/* Mesmas classes EXATAS do <DropdownMenuLabel> do DS */}
      <div className="flex-1 px-pad-lg py-pad-sm text-caption-sm font-semibold uppercase tracking-wider text-fg-subtle">
        {children}
      </div>
      {rightSlot}
    </div>
  );
}

type MenuItemProps = {
  icon: ReactNode;
  label: string;
  badge?: string;
  onClick: () => void;
};

/**
 * MenuItem — usa o DropdownMenuItem do DS com styles default
 * (`text-body-sm font-medium text-fg-muted` no rest, `bg-bg-muted
 * text-fg-default` no hover; ícone segue cor do texto via [&_svg]).
 *
 * Sem className extra de cor — herda o pattern dos action menus
 * de cell da tabela (consistência visual com kebab menus).
 */
function MenuItem({ icon, label, badge, onClick }: MenuItemProps) {
  return (
    <DropdownMenuItem
      onSelect={(e) => {
        // Não fecha o dropdown — controlado pelo state interno (view)
        e.preventDefault();
        onClick();
      }}
      className="cursor-pointer"
    >
      {icon}
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className="shrink-0 text-caption-md">{badge}</span>
      )}
      <ChevronRight className="!ml-0" />
    </DropdownMenuItem>
  );
}

