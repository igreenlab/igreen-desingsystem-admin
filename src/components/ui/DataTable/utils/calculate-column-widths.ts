/**
 * calculate-column-widths.ts — 3-layer auto-width calculator.
 *
 * Inspirado no padrão de DataGrids modernos (AG Grid / TanStack / design-tabela
 * reference). Calcula widths das colunas em 3 camadas, do menos específico ao mais:
 *
 *   Layer 1 — Type Heuristics
 *     Cada `type` de coluna tem um `defaultWidth` (registry). Quando `col.width`
 *     é explícito, ele vence; caso contrário, fallback pro `defaultWidth` do tipo
 *     (ou DEFAULT_COLUMN_WIDTH se nem o tipo definir).
 *
 *   Layer 2 — Smart Content Sampling (canvas measure)
 *     Quando `autoFit: true` no DataTable, mede o texto do header + primeiros N
 *     rows e expande width pra caber o conteúdo. Aplica min/maxWidth do col como
 *     constraints. Útil pra evitar truncate desnecessário.
 *
 *   Layer 3 — Flex Space Distribution
 *     Após Layers 1+2, se a soma das widths < containerWidth, distribui o
 *     espaço sobrando entre colunas SEM `col.width` explícito do consumer.
 *     Resolve o caso "tabela com poucas colunas e espaço sobrando à direita".
 *
 * Não decide widths de coluna `type: "actions"` ou "checkbox" — essas mantêm
 * o width explícito (consumer sempre passa).
 */

import type { DataTableColumnDef } from "../data-table.types";
import { columnTypeRegistry } from "../column-types";
import { ACTIONS_COLUMN_WIDTH } from "../data-table.constants";
import { measureTextWidth } from "./measure-text";
import { applyValueGetter, applyFormatter } from "./resolve-value";

/** Largura default quando nem `col.width` nem `typeDef.defaultWidth` definem. */
export const DEFAULT_COLUMN_WIDTH = 160;
/** Padding horizontal somado ao texto medido — alinha com `px-pad-2xl` (16px×2). */
export const CELL_PADDING_PX = 32;
/** Tamanho default da amostra de rows pra Layer 2. */
export const DEFAULT_SAMPLE_SIZE = 20;

export interface CalculateColumnWidthsOptions {
  /** Largura interna do container observada via ResizeObserver. */
  containerWidth: number;
  /** Habilita Layer 2 (canvas measure) globalmente. */
  autoFit: boolean;
  /** Tamanho da amostra de rows para Layer 2. Default 20. */
  sampleSize?: number;
}

/**
 * Calcula widths das colunas em 3 camadas.
 *
 * Retorna `Record<field, number>` com widths em pixels. Apenas colunas que
 * NÃO têm `col.width` explícito do consumer recebem widths calculados.
 * Colunas com `col.width` ficam de fora do retorno — `useDataTableColumns`
 * usa `col.width` como fallback quando o autoWidth não tem entry.
 *
 * Quando `containerWidth <= 0` (mount inicial antes do ResizeObserver),
 * retorna {} — `useDataTableColumns` cai no fallback de `col.width`/typeDef.
 */
export function calculateColumnWidths<T>(
  columns: DataTableColumnDef<T>[],
  rows: T[],
  options: CalculateColumnWidthsOptions,
): Record<string, number> {
  const { containerWidth, autoFit, sampleSize = DEFAULT_SAMPLE_SIZE } = options;

  if (containerWidth <= 0) return {};

  const widths: Record<string, number> = {};
  let totalContentWidth = 0;

  // ── Layer 1 + 2 ───────────────────────────────────────────────
  for (const col of columns) {
    const field = String(col.field);

    // Coluna com width explícito do consumer respeita — não calcula.
    // (Mas conta no totalContentWidth pra Layer 3 saber quanto sobra.)
    if (col.width !== undefined) {
      totalContentWidth += col.width;
      continue;
    }

    // `actions`: largura fixa estreita (ícone/menu). Não mede conteúdo nem
    // entra no flex (Layer 3) — senão vira 160px e/ou estica.
    if (col.type === "actions") {
      const w = col.minWidth ?? ACTIONS_COLUMN_WIDTH;
      widths[field] = w;
      totalContentWidth += w;
      continue;
    }

    // Layer 1 — Type Heuristics
    const typeDef = col.type ? columnTypeRegistry.get(col.type) : undefined;
    let calculatedWidth = typeDef?.defaultWidth ?? DEFAULT_COLUMN_WIDTH;

    // Layer 2 — Smart Content Sampling (canvas measure)
    if (autoFit) {
      // Mede header
      const headerText = String(col.headerName ?? field);
      let maxWidth = measureTextWidth(headerText) + CELL_PADDING_PX;

      // Mede sample de rows usando applyFormatter (cobre valueGetter + valueFormatter)
      const sample = rows.slice(0, sampleSize);
      for (const row of sample) {
        const text = applyFormatter(row, col);
        if (!text) continue;
        const w = measureTextWidth(text) + CELL_PADDING_PX;
        if (w > maxWidth) maxWidth = w;
      }

      if (maxWidth > calculatedWidth) calculatedWidth = maxWidth;
    }

    // Min/max constraints do consumer
    if (col.minWidth !== undefined && calculatedWidth < col.minWidth) {
      calculatedWidth = col.minWidth;
    }
    if (col.maxWidth !== undefined && calculatedWidth > col.maxWidth) {
      calculatedWidth = col.maxWidth;
    }

    widths[field] = Math.round(calculatedWidth);
    totalContentWidth += calculatedWidth;
  }

  // ── Layer 3 — Flex Space Distribution ─────────────────────────
  if (totalContentWidth < containerWidth) {
    const remainingSpace = containerWidth - totalContentWidth;

    // Distribui entre colunas SEM width explícito do consumer.
    // `actions`/`checkbox` NUNCA entram no flex — são colunas de largura fixa
    // (ícone), senão "esticam" e empurram o conteúdo (bug do auto-width).
    const isFixed = (col: DataTableColumnDef<T>) =>
      col.type === "actions" || col.type === "checkbox";
    const flexibleColumns = columns.filter(
      (col) => col.width === undefined && !isFixed(col),
    );
    const targets =
      flexibleColumns.length > 0
        ? flexibleColumns
        : autoFit
          ? columns.filter((col) => !isFixed(col))
          : [];

    if (targets.length > 0) {
      const extraPerColumn = Math.floor(remainingSpace / targets.length);
      let distributed = 0;

      targets.forEach((col, index) => {
        const field = String(col.field);
        const isLast = index === targets.length - 1;
        const extra = isLast ? remainingSpace - distributed : extraPerColumn;
        const current = widths[field] ?? col.width ?? 0;

        // Respeita maxWidth do consumer mesmo durante distribuição
        let next = current + extra;
        if (col.maxWidth !== undefined && next > col.maxWidth) {
          next = col.maxWidth;
        }

        widths[field] = Math.round(next);
        distributed += extra;
      });
    }
  }

  return widths;
}
