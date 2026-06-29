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

/**
 * Overhead horizontal do ÍCONE DE TIPO no header (`<Icon size=13>` + `gap-gp-md`
 * de 8px). Somado SÓ à medição do header (o ícone vive só no head cell, não nas
 * células do corpo). Garante que o título não seja truncado quando a coluna tem
 * ícone (`col.icon` ou `typeDef.defaultIcon`).
 */
export const HEADER_ICON_PX = 13 + 8;

/**
 * Reserva horizontal pras affordances de sort/menu no header (`headRightStack`
 * absolute na borda direita). Quando a coluna é sortável ou tem headMenu, o
 * stack pode aparecer (no hover) ou ficar fixo (`pr-[60px]` quando sort ATIVO).
 * Reservamos o suficiente pra que o `headerName` continue legível sem "..." mesmo
 * com a coluna ordenada. Mantido conservador (≈ ícone + respiro) pra não inflar
 * demais cada coluna — o objetivo é não-truncar, não reservar os 60px de hover.
 */
export const HEADER_SORT_AFFORDANCE_PX = 24;

/**
 * Largura MÍNIMA que o head cell precisa pra mostrar o `headerName` inteiro, sem
 * truncar ("..."). Soma ao texto medido: padding horizontal + ícone de tipo (se
 * houver) + reserva de sort/menu (se sortável ou com headMenu/filtro). É o piso
 * que toda coluna respeita — INCLUSIVE as com `col.width` explícito menor que o
 * header (o título é informação importante e tem que caber).
 */
function measureHeaderMinWidth<T>(
  col: DataTableColumnDef<T>,
  typeDef: { defaultIcon?: unknown; defaultSortable?: boolean } | undefined,
): number {
  const headerText = String(col.headerName ?? String(col.field));
  const hasHeaderIcon =
    col.icon !== undefined || typeDef?.defaultIcon !== undefined;
  const isSortable = col.sortable ?? typeDef?.defaultSortable ?? false;
  const hasHeadMenu = col.enableColumnFilter === true;
  const overhead =
    CELL_PADDING_PX +
    (hasHeaderIcon ? HEADER_ICON_PX : 0) +
    (isSortable || hasHeadMenu ? HEADER_SORT_AFFORDANCE_PX : 0);
  return measureTextWidth(headerText) + overhead;
}

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

    // `actions`: largura fixa estreita (ícone/menu). Não mede conteúdo nem
    // entra no flex (Layer 3) — senão vira 160px e/ou estica.
    if (col.type === "actions") {
      const w = col.minWidth ?? ACTIONS_COLUMN_WIDTH;
      widths[field] = w;
      totalContentWidth += w;
      continue;
    }

    const typeDef = col.type ? columnTypeRegistry.get(col.type) : undefined;

    // Coluna com width explícito do consumer: respeita como BASE (mínimo).
    // Registra no output e na base da flex distribution — cresce proporcional
    // junto das demais, mas nunca abaixo do width pedido. PISO adicional: o
    // header nunca trunca — se o `width` pedido é menor que o que cabe o título,
    // sobe pro mínimo do header (a width do consumer não pode esconder o
    // headerName). maxWidth ainda limita o topo (header > maxWidth = truncamento
    // assumido pelo consumer).
    if (col.width !== undefined) {
      let w = Math.max(col.width, measureHeaderMinWidth(col, typeDef));
      if (col.maxWidth !== undefined && w > col.maxWidth) w = col.maxWidth;
      widths[field] = Math.round(w);
      totalContentWidth += w;
      continue;
    }

    // Layer 1 — Type Heuristics
    let calculatedWidth = typeDef?.defaultWidth ?? DEFAULT_COLUMN_WIDTH;

    // Layer 2 — Smart Content Sampling (canvas measure)
    if (autoFit) {
      // Mede header (com affordances — ver measureHeaderMinWidth) pra o título
      // nunca truncar, e depois a amostra de células; fica com o maior.
      let maxWidth = measureHeaderMinWidth(col, typeDef);

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

  // ── Layer 3 — Flex Space Distribution (proporcional) ──────────
  // Quando a soma das larguras é MENOR que o container, distribui o espaço que
  // sobra PROPORCIONALMENTE à largura de cada coluna (flex-fill, como uma tabela
  // faz naturalmente) — em vez de dividir igualmente OU jogar tudo na única
  // coluna sem `width`. O peso de cada coluna é a própria largura-base, então
  // colunas pequenas crescem pouco e largas crescem mais, sem "coluna gigante".
  // Resultado independe da quantidade de colunas (4 grandes OU 6 pequenas).
  //
  // Colunas com `col.width` ENTRAM no rateio (a width é o piso) — mas só quando
  // há ao menos uma coluna SEM width pra "puxar" o fill; se TODAS têm width
  // explícito, respeitamos o layout fixo do consumer e deixamos o vazio à direita
  // (não inflar larguras que o consumer travou de propósito).
  if (totalContentWidth < containerWidth) {
    // `actions`/`checkbox` NUNCA entram no flex — são colunas de largura fixa
    // (ícone), senão "esticam" e empurram o conteúdo (bug do auto-width).
    const isFixed = (col: DataTableColumnDef<T>) =>
      col.type === "actions" || col.type === "checkbox";
    const nonFixed = columns.filter((col) => !isFixed(col));
    const hasFlexible = nonFixed.some((col) => col.width === undefined);
    // Se existe coluna fluida, TODAS as não-fixas crescem proporcional (a width
    // explícita vira piso). Se não há nenhuma fluida, só distribui quando autoFit
    // está ligado — senão mantém o layout 100% fixo do consumer.
    const targets = hasFlexible || autoFit ? nonFixed : [];

    if (targets.length > 0) {
      // Distribuição proporcional com clamp por maxWidth e REDISTRIBUIÇÃO do
      // resíduo. Itera enquanto sobra espaço E há colunas que ainda podem crescer:
      //  - cada coluna recebe espaço ∝ sua largura atual (peso = largura)
      //  - coluna que bate no maxWidth sai do rateio; o resto é redividido entre
      //    as restantes (senão o espaço sobraria à direita).
      const baseWidth = (col: DataTableColumnDef<T>) =>
        widths[String(col.field)] ?? col.width ?? DEFAULT_COLUMN_WIDTH;

      // Colunas ainda "elásticas" (não atingiram maxWidth).
      let growable = targets.filter((col) => {
        const f = String(col.field);
        return col.maxWidth === undefined || (widths[f] ?? 0) < col.maxWidth;
      });

      let remaining = containerWidth - totalContentWidth;
      // Loop de redistribuição — em cada passada, rateia `remaining` por peso.
      // Para quando: nada sobra (<1px), ou nenhuma coluna pode mais crescer.
      let guard = 0;
      while (remaining >= 1 && growable.length > 0 && guard < 16) {
        guard += 1;
        const totalWeight = growable.reduce((sum, col) => sum + baseWidth(col), 0);
        if (totalWeight <= 0) break;

        let consumedThisPass = 0;
        const stillGrowable: DataTableColumnDef<T>[] = [];

        for (const col of growable) {
          const f = String(col.field);
          const current = widths[f] ?? col.width ?? 0;
          const share = (baseWidth(col) / totalWeight) * remaining;
          const next = current + share;

          if (col.maxWidth !== undefined && next >= col.maxWidth) {
            // Bate no teto — consome só até o max e sai do rateio.
            consumedThisPass += col.maxWidth - current;
            widths[f] = col.maxWidth;
          } else {
            consumedThisPass += share;
            widths[f] = next;
            stillGrowable.push(col);
          }
        }

        remaining -= consumedThisPass;
        growable = stillGrowable;
        // Se a passada não consumiu nada relevante, evita loop infinito.
        if (consumedThisPass < 0.5) break;
      }

      // Arredonda no fim (evita acúmulo de erro de fração durante o rateio).
      // O resíduo (sub-pixel × nº de colunas) é absorvido pela ÚLTIMA coluna que
      // ainda pode crescer (sem maxWidth ou abaixo dele), pra a soma casar com o
      // container — preenchimento exato, sem 1-2px de vazio à direita.
      let lastFlexField: string | undefined;
      let roundedTotal = 0;
      for (const col of targets) {
        const f = String(col.field);
        widths[f] = Math.round(widths[f] ?? col.width ?? 0);
        roundedTotal += widths[f];
        const maxed = col.maxWidth !== undefined && widths[f] >= col.maxWidth;
        if (!maxed) lastFlexField = f;
      }
      if (lastFlexField !== undefined) {
        const residue = Math.round(containerWidth) - roundedTotal;
        if (residue !== 0) {
          widths[lastFlexField] = Math.max(0, widths[lastFlexField] + residue);
        }
      }
    }
  }

  return widths;
}
