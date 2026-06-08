import { SlidersHorizontal } from "lucide-react";
import { ButtonGroup } from "../../ButtonGroup";
import { FilterPopover } from "../popovers/filter-popover";
import type {
  FilterPopoverColumn,
  FilterPopoverEntry,
  FilterPopoverOperator,
  FilterPopoverProps,
} from "../popovers/filter-popover";
import { ToolbarToolButton } from "./toolbar-tool-button";
import { ToolbarSimpleFilterDrawer } from "./toolbar-simple-filter-drawer";
import {
  useToolbarFilterControl,
  type UseToolbarFilterControlReturn,
} from "../hooks/use-toolbar-filter-control";
// Types do DataTable — coupling-aceita pra type safety. Mesmo pattern do
// FilterPopover. Coupling reverso (DataTable → TableToolbar) continua proibido.
import type { FilterModel } from "../../DataTable/data-table.types";

/**
 * ToolbarFilterControl — controle de filtros nativo da TableToolbar.
 *
 * Encapsula o pattern "split button + drawer + advanced popover" como
 * único componente plug-and-play. Quando `enabled !== false` (default true),
 * renderiza:
 *   - **Primary** do ButtonGroup → abre `<ToolbarSimpleFilterDrawer>` lateral
 *     (lista vertical de todos os campos filtráveis, aplicação LIVE, operator
 *     inferido do filterType).
 *   - **Chevron** do ButtonGroup → abre o `<FilterPopover>` (query builder
 *     advanced com AND/OR, operadores explícitos, Adicionar condição).
 *
 * Quando `enabled === false`, renderiza apenas o `<FilterPopover>` legacy
 * (botão único = abre o query builder direto). Útil pra reverter ao
 * comportamento pré-v0.7 ou pra tabelas onde drawer não faz sentido.
 *
 * Não tem state interno — usa o hook `useToolbarFilterControl()` internamente.
 * Se o consumer precisa controlar abertura externamente (ex: deep-link),
 * passe `controlState` explicitamente.
 */
export type ToolbarFilterControlProps = {
  /** Colunas filtráveis — vem do `useFilterPopoverAdapter` do DataTable. */
  columns: FilterPopoverColumn[];

  /** Entries atuais (filtros aplicados) — pra contagem e advanced popover. */
  entries: FilterPopoverEntry[];
  /** Handler de mudança das entries (consumer aplica no filterModel). */
  onEntriesChange: (next: FilterPopoverEntry[]) => void;

  /** FilterModel atual + setter — usado pelo drawer simple (aplicação LIVE). */
  filterModel: FilterModel;
  onFilterModelChange: (model: FilterModel) => void;

  /**
   * Liga o split button + drawer. **Default true** (a partir de v0.7.0).
   * `false` reverte ao legado (botão único = query builder direto).
   */
  enabled?: boolean;

  /**
   * Fields que NÃO aparecem no drawer (mesmo sendo filtráveis). Default [].
   */
  hiddenFields?: string[];
  /** Override do título do drawer. Default "Filtros". */
  drawerTitle?: string;
  /** Tamanho do drawer. Default "md" (400px). */
  drawerSize?: "sm" | "md" | "lg" | "xl";

  /**
   * Operators column-aware — restringe o dropdown do query builder aos
   * operators do column-type. DataTable passa via `ColumnTypeRegistry`.
   */
  getOperatorsForColumn?: (
    column: FilterPopoverColumn,
  ) => FilterPopoverOperator[] | undefined;

  /** Override do render do input de valor (registry-aware no DataTable). */
  renderValueInput?: FilterPopoverProps["renderValueInput"];

  /**
   * State control externo (opcional). Se omitido, hook interno gerencia
   * tudo automaticamente. Útil quando consumer precisa abrir drawer
   * programaticamente (ex: query-param `?filters=true` → openSimple()).
   */
  controlState?: UseToolbarFilterControlReturn;
};

export function ToolbarFilterControl({
  columns,
  entries,
  onEntriesChange,
  filterModel,
  onFilterModelChange,
  enabled = true,
  hiddenFields,
  drawerTitle,
  drawerSize,
  getOperatorsForColumn,
  renderValueInput,
  controlState,
}: ToolbarFilterControlProps) {
  // State interno via hook — só usa se consumer NÃO passou controlState.
  const internalCtl = useToolbarFilterControl();
  const ctl = controlState ?? internalCtl;

  const filterCount = entries.length;

  // Modo legado: botão único = abre query builder direto (uncontrolled).
  if (!enabled) {
    return (
      <FilterPopover
        columns={columns}
        filters={entries}
        onFiltersChange={onEntriesChange}
        enableAdvanced
        renderValueInput={renderValueInput}
        getOperatorsForColumn={getOperatorsForColumn}
        trigger={
          <ToolbarToolButton
            icon={<SlidersHorizontal />}
            label="Filtrar"
            isActive={filterCount > 0}
            hasIndicator={filterCount > 0}
          />
        }
      />
    );
  }

  // Modo split button (default): Primary=drawer | Chevron=advanced.
  return (
    <>
      <FilterPopover
        columns={columns}
        filters={entries}
        onFiltersChange={onEntriesChange}
        enableAdvanced
        // Controlled — chevron gerencia.
        open={ctl.advancedPopoverOpen}
        onOpenChange={ctl.setAdvancedPopoverOpen}
        renderValueInput={renderValueInput}
        getOperatorsForColumn={getOperatorsForColumn}
        // Anchor mode: ButtonGroup só posiciona o popover, não dispara.
        anchor={
          <ButtonGroup color="secondary" variant="outline" size="md">
            <ButtonGroup.Primary
              iconLeft={<SlidersHorizontal />}
              onClick={ctl.openSimple}
            >
              Filtrar
              {filterCount > 0 && (
                <span className="ml-pad-xs inline-flex items-center justify-center min-w-[18px] h-[18px] px-pad-xs rounded-radius-full text-caption-md font-semibold bg-bg-brand text-fg-on-brand">
                  {filterCount}
                </span>
              )}
            </ButtonGroup.Primary>
            <ButtonGroup.Chevron
              aria-label="Filtros avançados (query builder)"
              onClick={ctl.toggleAdvanced}
            />
          </ButtonGroup>
        }
        trigger={null}
      />

      <ToolbarSimpleFilterDrawer
        open={ctl.simpleDrawerOpen}
        onOpenChange={ctl.setSimpleDrawerOpen}
        columns={columns}
        filterModel={filterModel}
        onFilterModelChange={onFilterModelChange}
        hiddenFields={hiddenFields}
        title={drawerTitle}
        size={drawerSize}
      />
    </>
  );
}
