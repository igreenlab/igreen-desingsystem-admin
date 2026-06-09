import type { ReactNode } from "react";

/** Direção de ordenação compartilhada pelos popovers/hooks do toolbar.
 *  Fonte única de verdade — re-exportado por `sort-popover` e `use-toolbar-sort`. */
export type SortDirection = "asc" | "desc";

/** Item segmentado (usado por density-toggle, view-mode-toggle) */
export type ToolbarSegmentedItem<TValue extends string = string> = {
  value: TValue;
  /** Conteúdo do botão (geralmente ícone). Texto opcional via aria-label */
  children: ReactNode;
  label?: string;
  disabled?: boolean;
};

/** View tab (Todos/Meus/Ativos…) */
export type ToolbarTab = {
  id: string;
  name: ReactNode;
  /** Tabs custom mostram X de close no hover */
  custom?: boolean;
};

/** Operador de filtro suportado pelo applied chips (ids longos do FilterModel) */
export type AppliedFilterOp =
  | "equals"
  | "neq"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "isAnyOf"
  | "isNoneOf"
  | "between"
  | "isEmpty"
  | "isNotEmpty"
  | string; // permite custom

/** Filtro aplicado (chip individual) */
export type AppliedFilter = {
  id: string;
  /** Label legível da coluna (ex "Status") */
  columnLabel: ReactNode;
  /** Operador (resolvido pra símbolo via DEFAULT_OP_LABELS quando `opLabel` ausente). */
  op: AppliedFilterOp;
  /**
   * Label do operador já resolvido (ex: do registry do column-type). Quando
   * presente, vence o DEFAULT_OP_LABELS — garante que o chip mostre o mesmo
   * texto do popover (ex: currency `gt` = "maior que", não ">").
   */
  opLabel?: ReactNode;
  /**
   * Valor já formatado pra exibição. String/ReactNode = 1 tag. Array de
   * ReactNode = múltiplas tags lado a lado (ex: "Ativo" "Pendente" "Pausado").
   */
  value: ReactNode | ReactNode[];
  /**
   * Quando true, o chip renderiza apenas o `columnLabel` (sem operador, sem
   * valor). Usado pra chips "placeholder" pré-ativos vazios que aguardam o
   * usuário escolher um valor (use case `showEmptyFilterChips` do DataTable).
   * Default false.
   */
  isEmpty?: boolean;
};
