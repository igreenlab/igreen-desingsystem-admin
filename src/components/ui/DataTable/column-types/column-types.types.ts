import type { ReactNode } from "react";
import type { FilterOperator, FilterValue } from "../data-table.types";

/** ID conhecido de tipo de coluna. Strings livres tambem aceitas (Registry fallback "text"). */
export type ColumnTypeId =
  | "text"
  | "number"
  | "date"
  | "select"
  | "multiSelect"
  | "boolean"
  | (string & {});

/** Opcao de valor pra tipos select/multiSelect. */
export type ColumnOption = {
  label: string;
  value: string | number;
  color?: string;
};

/** Props que o renderer de filtro avancado (modal) recebe. */
export type FilterInputProps = {
  /** Valor atual no input. */
  value: FilterValue;
  /** Disparado quando user muda. */
  onChange: (value: FilterValue) => void;
  /** Operador atual selecionado (pode afetar UI). */
  operator: FilterOperator;
  /** Opcoes da coluna (select/multiSelect). */
  options?: ColumnOption[];
  /** Placeholder do input. */
  placeholder?: string;
};

/** Props que o chip rapido (fast filter popover) recebe. */
export type FastFilterInputProps = {
  /** Valor atual — single ou array dependendo do tipo. */
  value: FilterValue;
  /** Disparado quando muda. */
  onChange: (value: FilterValue) => void;
  /** Opcoes auto-extraidas ou estaticas. */
  options?: ColumnOption[];
  /** Render custom de opcao (pra colorir status etc). */
  renderOption?: (option: ColumnOption) => ReactNode;
  /** Fechar popover (usado em single-select onde click fecha automatico). */
  onClose?: () => void;
};

/** Operador disponivel pra um tipo. */
export type ColumnTypeOperator = {
  id: FilterOperator;
  label: string;
  /** Se true, o operador nao precisa de valor (ex: isEmpty). */
  noValue?: boolean;
};

/** Props que `renderCell` recebe pra render default. */
export type CellRenderProps = {
  /** Valor extraído via valueGetter ou dot-path. */
  value: unknown;
  /** Row completa (qualquer T). */
  row: unknown;
  /** Opções da coluna (filterOptions) — útil pra resolver labels em select/badge/status. */
  options?: ColumnOption[];
  /** ColumnDef parcial — campos auxiliares como valueFormatter, etc. */
  column?: {
    field?: string;
    headerName?: string;
    valueFormatter?: (v: unknown) => string;
    typeOptions?: Record<string, unknown>;
  };
};

/** Props que `renderEdit` recebe pra editor inline. */
export type CellEditRenderProps = {
  value: unknown;
  row: unknown;
  onChange: (next: unknown) => void;
  onCommit: () => void;
  onCancel: () => void;
  options?: ColumnOption[];
};

/** Alinhamento default sugerido pelo tipo. */
export type ColumnTypeAlign = "left" | "center" | "right";

/** Definicao completa de um tipo de coluna. */
export type ColumnTypeDefinition = {
  /** ID unico do tipo. */
  type: ColumnTypeId;
  /** Operadores suportados — ordem importa (primeiro = default). */
  operators: ColumnTypeOperator[];
  /** Renderiza input no modal Filtros (advanced builder). */
  renderFilterInput: (props: FilterInputProps) => ReactNode;
  /** Renderiza input no popover do chip rapido (fast filter). */
  renderFastFilterInput: (props: FastFilterInputProps) => ReactNode;
  /**
   * Match runtime: dado o valor da celula + filter item, retorna se row passa.
   * Retornar `null` = "operador nao reconhecido, ignore esse filtro".
   */
  matchesFilter: (cellValue: unknown, filterValue: FilterValue, operator: FilterOperator) => boolean | null;
  /**
   * Render do chip de filtro (label visual). Recebe valor + options + columnLabel.
   * Default: "{columnLabel}: {value}". MultiSelect mostra "{N} selecionados" se > 2.
   */
  renderChipValue?: (value: FilterValue, options?: ColumnOption[]) => ReactNode;

  /* ── Fase G.2 — slots de cell + edit + defaults ─────────────────── */

  /** Render default da célula. Usado quando consumer não passa `column.render`.
   *  Fallback chain: column.render > renderCell > valueFormatter > raw value. */
  renderCell?: (props: CellRenderProps) => ReactNode;
  /** Editor inline default. Usado quando consumer não passa `column.renderEdit`
   *  E `editable: true`. Fallback chain: column.renderEdit > renderEdit do tipo > InputEditor por editType. */
  renderEdit?: (props: CellEditRenderProps) => ReactNode;
  /** Formatter default — string output pra accessibility, tooltip, export, etc.
   *  Aplicado quando consumer não passa `column.valueFormatter`. */
  formatValue?: (value: unknown) => string;
  /** Alinhamento default. Consumer pode override via `column.align`. */
  defaultAlign?: ColumnTypeAlign;
  /** Ellipsis (truncate com `...`) default. Consumer pode override. */
  defaultEllipsis?: boolean;
  /** Largura default em px. Consumer pode override via `column.width`. */
  defaultWidth?: number;
  /** Sortable default — alguns tipos (badge custom, actions) podem ser false. */
  defaultSortable?: boolean;
  /** Ícone default no header (lucide component). Consumer pode override via
   *  `column.icon`. Indicador visual rápido do tipo da coluna. */
  defaultIcon?: React.ComponentType<{
    className?: string;
    size?: number;
    strokeWidth?: number;
    "aria-hidden"?: boolean;
  }>;
};
