import type { ReactNode } from "react";
import type {
  DataTableColumnDef,
  DataTableActionItem,
} from "../data-table.types";
import { ACTIONS_COLUMN_WIDTH } from "../data-table.constants";

/**
 * Column builders — reduzem boilerplate de `DataTableColumnDef` em casos comuns.
 *
 * Todos retornam um `DataTableColumnDef<T>` válido. Você pode spread extra props:
 *
 *   const cols = [
 *     textColumn<Client>("id", "ID", { width: 120 }),
 *     currencyColumn<Client>("value", "Valor", { sortable: true }),
 *     actionColumn<Client>({ getActions: ({ row }) => [...] }),
 *   ];
 *
 * Para casos custom, declare `DataTableColumnDef<T>` diretamente — builders são
 * conveniência, não substituem a API completa.
 */

type CommonOverrides<T> = Partial<DataTableColumnDef<T>>;

/** Coluna de texto simples. `type: "text"` ativa render auto via registry. */
export function textColumn<T>(
  field: keyof T | string,
  headerName: string,
  overrides?: CommonOverrides<T>,
): DataTableColumnDef<T> {
  return { field, headerName, type: "text", ...overrides };
}

/** Coluna numérica. `type: "number"` aplica tabular-nums + align right + locale format. */
export function numberColumn<T>(
  field: keyof T | string,
  headerName: string,
  overrides?: CommonOverrides<T>,
): DataTableColumnDef<T> {
  return { field, headerName, type: "number", sortable: true, ...overrides };
}

/** Coluna de moeda — `typeOptions: { currency, locale }` opcional. */
export function currencyColumn<T>(
  field: keyof T | string,
  headerName: string,
  overrides?: CommonOverrides<T> & { currency?: string; locale?: string },
): DataTableColumnDef<T> {
  const { currency, locale, ...rest } = overrides ?? {};
  return {
    field,
    headerName,
    type: "currency",
    sortable: true,
    ...(currency || locale
      ? { typeOptions: { currency, locale } }
      : {}),
    ...rest,
  };
}

/** Coluna de email — mailto link automático via registry. */
export function emailColumn<T>(
  field: keyof T | string,
  headerName: string = "Email",
  overrides?: CommonOverrides<T>,
): DataTableColumnDef<T> {
  return { field, headerName, type: "email", ...overrides };
}

/** Coluna de telefone — tel link + máscara automática. */
export function phoneColumn<T>(
  field: keyof T | string,
  headerName: string = "Telefone",
  overrides?: CommonOverrides<T>,
): DataTableColumnDef<T> {
  return { field, headerName, type: "phone", ...overrides };
}

/** Coluna de data — Calendar picker no filter, formato pt-BR no display. */
export function dateColumn<T>(
  field: keyof T | string,
  headerName: string,
  overrides?: CommonOverrides<T>,
): DataTableColumnDef<T> {
  return { field, headerName, type: "date", sortable: true, ...overrides };
}

/** Coluna de status — Chip colorido via `filterOptions: [{ value, label, color }]`. */
export function statusColumn<T>(
  field: keyof T | string,
  headerName: string,
  options: Array<{ value: string | number; label: string; color?: string }>,
  overrides?: CommonOverrides<T>,
): DataTableColumnDef<T> {
  return {
    field,
    headerName,
    type: "status",
    filterType: "select",
    filterOptions: options,
    enableColumnFilter: true,
    ...overrides,
  };
}

/** Coluna de actions — pinned right, sem sort/resize, auto-renderiza dropdown. */
export function actionColumn<T>(opts: {
  getActions: (params: { row: T }) => DataTableActionItem<T>[];
  width?: number;
}): DataTableColumnDef<T> {
  return {
    field: "_actions",
    headerName: "",
    type: "actions",
    width: opts.width ?? ACTIONS_COLUMN_WIDTH,
    pinned: "right",
    getActions: opts.getActions,
  };
}

/** Coluna custom — render livre. Atalho pra quando consumer quer override total. */
export function customColumn<T>(
  field: keyof T | string,
  headerName: string,
  render: (params: { row: T; value: unknown }) => ReactNode,
  overrides?: CommonOverrides<T>,
): DataTableColumnDef<T> {
  return { field, headerName, render, ...overrides };
}
