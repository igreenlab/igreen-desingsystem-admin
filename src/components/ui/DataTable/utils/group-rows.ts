import type { DataTableColumnDef } from "../data-table.types";
import { applyValueGetter } from "./resolve-value";

/** Marker symbol pra distinguir GroupRow de data row T no render branching.
 *  Pattern symbol-as-discriminator evita conflito acidental com props do T. */
export const GROUP_ROW_TYPE = Symbol("dt-group-row");

/** Marker symbol pra "slot de conteúdo customizado do grupo" — quando consumer
 *  passa renderGroupContent, esse marker substitui as N child rows por 1 row
 *  full-width que delega 100% pro render do consumer. */
export const GROUP_CONTENT_TYPE = Symbol("dt-group-content");

/** Row sintética inserida no array antes de cada grupo. */
export type DataTableGroupRow<T = unknown> = {
  __type: typeof GROUP_ROW_TYPE;
  /** Field usado pra agrupar (== props.groupBy). */
  field: string;
  /** Valor raw do grupo (ex: "active", "inactive"). */
  value: unknown;
  /** Label formatado pra display (passa por column.valueFormatter se houver). */
  label: string;
  /** Quantidade de rows nesse grupo. */
  count: number;
  /** Rows do grupo — usado pra subtotalizers + selectGroup. */
  rows: T[];
  /** Está expandido? Se false, child rows são skipped do array. */
  isExpanded: boolean;
  /** Chave unica do grupo — `${field}|${value}` */
  key: string;
};

/** "Content slot" marker — substitui as child rows quando consumer passa
 *  renderGroupContent. Carrega referência ao group pra que o consumer tenha
 *  acesso a label/count/rows no callback. */
export type DataTableGroupContent<T = unknown> = {
  __type: typeof GROUP_CONTENT_TYPE;
  /** Mesma key do group pai. */
  key: string;
  /** Referência ao group pai (label, count, rows). */
  group: DataTableGroupRow<T>;
};

/** Type guard pra GroupRow. */
export function isGroupRow<T>(
  row: T | DataTableGroupRow<T> | DataTableGroupContent<T>,
): row is DataTableGroupRow<T> {
  return (
    row != null &&
    typeof row === "object" &&
    "__type" in row &&
    (row as { __type: symbol }).__type === GROUP_ROW_TYPE
  );
}

/** Type guard pra GroupContent (slot custom). */
export function isGroupContent<T>(
  row: T | DataTableGroupRow<T> | DataTableGroupContent<T>,
): row is DataTableGroupContent<T> {
  return (
    row != null &&
    typeof row === "object" &&
    "__type" in row &&
    (row as { __type: symbol }).__type === GROUP_CONTENT_TYPE
  );
}

// resolveGroupValue agora delega pro shared `applyValueGetter` (utils/resolve-value.ts).
// Quando `col` não existe (field sem ColumnDef), usa stub minimal pra reaproveitar.

/**
 * Reshape do array de rows em (GroupRow | T)[] alternados.
 *
 * Ordem: groups aparecem na ordem da primeira ocorrencia (não sortado por label).
 * Pra ordem específica, consumer pode passar rows já ordenadas pelo group field.
 *
 * Rows com value `undefined`/`null` no field caem no grupo "(sem valor)".
 *
 * @param rows Rows já filtradas/buscadas/ordenadas (output do processor)
 * @param field Campo de agrupamento (== props.groupBy)
 * @param expandedKeys Set de keys de grupos expandidos
 * @param defaultExpanded Quando grupo NÃO está em expandedKeys, este é o estado default
 * @param col Column def do field — usada pra valueGetter e valueFormatter
 */
export function groupRows<T>(
  rows: T[],
  field: string,
  expandedKeys: Set<string>,
  defaultExpanded: boolean,
  col: DataTableColumnDef<T> | undefined,
  /** Quando true, substitui as N child rows por 1 GroupContent marker.
   *  Consumer renderiza conteúdo livre via renderGroupContent. */
  useCustomContent = false,
): Array<DataTableGroupRow<T> | DataTableGroupContent<T> | T> {
  const groupsMap = new Map<string, { value: unknown; rows: T[] }>();

  // Stub minimal pra reusar applyValueGetter quando col não existe (field órfão).
  const colOrStub = (col ?? {
    field,
    headerName: "",
  }) as DataTableColumnDef<T>;

  for (const row of rows) {
    const rawValue = applyValueGetter(row, colOrStub);
    const key = `${field}|${rawValue ?? "__null__"}`;
    if (!groupsMap.has(key)) {
      groupsMap.set(key, { value: rawValue, rows: [] });
    }
    groupsMap.get(key)!.rows.push(row);
  }

  const result: Array<DataTableGroupRow<T> | DataTableGroupContent<T> | T> = [];
  for (const [key, group] of groupsMap.entries()) {
    // Resolve label via valueFormatter da coluna, senão toString do valor
    const labelRaw =
      group.value == null || group.value === ""
        ? "(sem valor)"
        : col?.valueFormatter
          ? col.valueFormatter(group.value)
          : String(group.value);

    // Default expanded a menos que key esteja explicitamente collapsada
    // (toggle inverte do default). Tracking via Set de keys que diferem do default.
    const isExpanded = expandedKeys.has(key) ? !defaultExpanded : defaultExpanded;

    const groupRow: DataTableGroupRow<T> = {
      __type: GROUP_ROW_TYPE,
      field,
      value: group.value,
      label: labelRaw,
      count: group.rows.length,
      rows: group.rows,
      isExpanded,
      key,
    };
    result.push(groupRow);
    if (isExpanded) {
      if (useCustomContent) {
        // 1 slot custom no lugar das N rows — consumer decide o render
        result.push({
          __type: GROUP_CONTENT_TYPE,
          key,
          group: groupRow,
        });
      } else {
        // Default: N TableRows iguais a uma tabela normal
        result.push(...group.rows);
      }
    }
  }
  return result;
}
