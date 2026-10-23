import { useMemo } from "react";
import type { KanbanCardData, KanbanColumn, KanbanGroup } from "../../Kanban";
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
  /**
   * Field do SEGUNDO eixo — vira `KanbanCardData.groupId` (as raias dentro das
   * colunas). O `DataTable` passa o `groupBy` aqui.
   *
   * Por que o `groupBy` e não um field próprio do `kanbanConfig`: `groupBy` já é
   * estado do COMPONENTE — persistido, aplicável por saved view, e sobrevive à
   * troca de view. Um field paralelo seria um quarto conceito de agrupamento
   * num componente que já tem três (`groupBy` > `getTreeDataPath` >
   * `renderRowExpansion`), com estado de colapso próprio e fora das saved views.
   * Reusando, o mesmo eixo vira grupo de linha na tabela e raia no board.
   */
  laneField?: string;
};

type UseDataTableViewModeResult = {
  columns: KanbanColumn[];
  cards: KanbanCardData[];
  /** Raias derivadas do `laneField`, na ordem de aparição. Vazio sem eixo. */
  groups: KanbanGroup[];
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
  laneField,
}: UseDataTableViewModeOptions<T>): UseDataTableViewModeResult {
  return useMemo(() => {
    if (!config) return { columns: [], cards: [], groups: [] };

    const { groupByField, columns: explicitColumns, renderCard } = config;
    const field = String(groupByField);
    /* O eixo da raia não pode ser o mesmo da coluna: daria uma raia por coluna,
       cada uma com todos os cards dela — ruído puro. Igual, ignora. */
    const laneFieldReal = laneField && laneField !== field ? laneField : undefined;

    // Build cards primeiro — precisamos dos columnIds pra derivar colunas
    const cards: KanbanCardData[] = [];
    const seenColumnIds = new Set<string>();
    const orderedColumnIds: string[] = [];
    /** Raias na ordem de aparição, com o rótulo tirado do valor do field. */
    const lanesVistas = new Map<string, KanbanGroup>();

    for (const row of rows) {
      const rawColumnValue = getFieldValue(row as Record<string, unknown>, field);
      if (rawColumnValue === null || rawColumnValue === undefined) continue;

      const columnId = String(rawColumnValue);
      const slots = renderCard({ row });

      /* Raia: mesmo tratamento da coluna — valor do field vira o id, e o
         rótulo nasce dele. Row sem valor fica sem `groupId` e o `<Kanban>`
         a manda pra raia sintetizada de não-agrupados. */
      let groupId: string | undefined;
      if (laneFieldReal) {
        const bruto = getFieldValue(row as Record<string, unknown>, laneFieldReal);
        if (bruto !== null && bruto !== undefined && bruto !== "") {
          groupId = String(bruto);
          if (!lanesVistas.has(groupId)) {
            lanesVistas.set(groupId, { id: groupId, label: groupId });
          }
        }
      }

      cards.push({
        id: String(getRowId(row)),
        columnId,
        ...(groupId ? { groupId } : {}),
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

    return { columns, cards, groups: [...lanesVistas.values()] };
  }, [rows, config, getRowId, laneField]);
}
