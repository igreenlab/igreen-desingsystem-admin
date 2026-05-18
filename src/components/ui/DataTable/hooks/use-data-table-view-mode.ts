import { useMemo } from "react";
import type { KanbanCardData, KanbanColumn } from "../../Kanban";
import { getFieldValue } from "../utils/resolve-value";
import type {
  DataTableKanbanConfig,
  GridRowId,
} from "../data-table.types";

type UseDataTableViewModeOptions<T> = {
  /** Rows processadas (já com filter+search+sort aplicados pelo processor). */
  rows: T[];
  config: DataTableKanbanConfig<T> | undefined;
  /** Resolve id da row (default: row.id). */
  getRowId: (row: T) => GridRowId;
};

type UseDataTableViewModeResult = {
  columns: KanbanColumn[];
  cards: KanbanCardData[];
};

/**
 * Transformer DataTable → Kanban.
 *
 * Recebe as rows já processadas pelo `useDataTableProcessor` (filter + search +
 * sort + selection aplicados) e produz `{ columns, cards }` no formato que o
 * `<Kanban>` primitive consome.
 *
 * Colunas:
 * - Quando `config.columns` é fornecido, usa diretamente (consumer controla ordem,
 *   labels, dotColor, canReceiveDrop, canDragFrom).
 * - Caso contrário, deriva automaticamente: extrai valores únicos de
 *   `groupByField` na ordem de primeira aparição, gera `KanbanColumn` com
 *   `id = String(value)`, `label = String(value)` — sem dotColor.
 *
 * Cards:
 * - Cada row vira 1 `KanbanCardData` com:
 *   - `id = getRowId(row)` convertido pra string (KanbanCardData.id é string)
 *   - `columnId = String(row[groupByField])`
 *   - Demais slots de `config.renderCard({ row })`
 * - Rows com `groupByField` resolvendo pra null/undefined são silenciosamente
 *   omitidas (não há coluna fantasma "sem categoria"). Consumer pode declarar
 *   uma coluna explícita com canReceiveDrop:false se quiser tratar esse caso.
 *
 * Performance: memoizado em `rows` + `config`. Não recomputa quando paginação
 * ou outros estados não-relevantes pra board mudam.
 */
export function useDataTableViewMode<T>({
  rows,
  config,
  getRowId,
}: UseDataTableViewModeOptions<T>): UseDataTableViewModeResult {
  return useMemo(() => {
    if (!config) return { columns: [], cards: [] };

    const { groupByField, columns: explicitColumns, renderCard } = config;
    const field = String(groupByField);

    // Build cards primeiro — precisamos dos columnIds pra derivar colunas
    const cards: KanbanCardData[] = [];
    const seenColumnIds = new Set<string>();
    const orderedColumnIds: string[] = [];

    for (const row of rows) {
      const rawColumnValue = getFieldValue(row as Record<string, unknown>, field);
      if (rawColumnValue === null || rawColumnValue === undefined) continue;

      const columnId = String(rawColumnValue);
      const slots = renderCard({ row });

      cards.push({
        id: String(getRowId(row)),
        columnId,
        ...slots,
      });

      if (!seenColumnIds.has(columnId)) {
        seenColumnIds.add(columnId);
        orderedColumnIds.push(columnId);
      }
    }

    // Resolve colunas: explícitas (consumer controla) OU derivadas (ordem de aparição)
    const columns: KanbanColumn[] = explicitColumns
      ? explicitColumns
      : orderedColumnIds.map((id) => ({ id, label: id }));

    return { columns, cards };
  }, [rows, config, getRowId]);
}
