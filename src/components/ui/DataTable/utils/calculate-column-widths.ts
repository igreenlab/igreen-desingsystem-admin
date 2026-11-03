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
 * Coluna `type: "actions"` fica **fora das 3 layers** (não mede texto, não entra no
 * flex), mas a largura dela SIM é decidida aqui: `col.width` > `col.minWidth` >
 * derivada do nº de ações que a célula vai renderizar (`utils/action-slots.ts`) >
 * `ACTIONS_COLUMN_WIDTH`. Até 2026-08-18 este cabeçalho dizia *"essas mantêm o width
 * explícito (consumer sempre passa)"* — errado nos dois pedaços: o ramo lia só
 * `minWidth`, ignorando o `col.width` que o consumer passava, e o builder
 * `actionColumn` nem sempre passa width.
 */

import type { DataTableColumnDef } from "../data-table.types";
import { columnTypeRegistry } from "../column-types";
import { ACTIONS_COLUMN_WIDTH } from "../data-table.constants";
import { measureTextWidth } from "./measure-text";
import { measureActionsWidth } from "./action-slots";
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

/*
 * Medidas do `headRightStack` — o conjunto de ações que o head cell mostra no HOVER
 * (`Table/table.styles.ts`). Cada número é uma classe/token, e o teste
 * `scripts/lib/header-widths-sync.test.mjs` os confere contra o tema gerado e as classes:
 * trocar o token sem trocar a constante reprova lá, em vez de reaparecer como botão pra
 * fora da célula.
 */
/** Botão do funil e do menu: `Button size="icon-2xs"` = `size-form-xs`. */
export const HEADER_ACTION_BUTTON_PX = 28;
/** Ícone de sort (hint/indicador): `size-icon-xs`. */
export const HEADER_SORT_ICON_PX = 12;
/** Espaço entre o ícone de sort e o grupo funil+menu: `gap-gp-xs`. */
export const HEADER_STACK_GAP_PX = 4;
/** Folga do stack: `right-pad-md` (8, borda direita) + `pl-pad-xs` (4, máscara à esquerda). */
export const HEADER_STACK_INSET_PX = 12;

/**
 * Largura do `headRightStack` com as ações VISÍVEIS da coluna — a mesma lista que o
 * `data-table.tsx` e o `TableHeadCell` montam: ícone de sort (coluna ordenável), funil
 * (`enableColumnFilter` e não `enableHeaderFilter: false`) e menu (`enableColumnMenu`).
 * Funil e menu são vizinhos sem espaço entre si (moram no mesmo wrapper); o sort fica a
 * um `gap` deles. Coluna sem nenhuma ação não tem stack e devolve 0.
 *
 * Conta o sort como UM ícone de 12px. Coluna ordenada troca o hint pela seta do sort, que
 * tem a MESMA largura — então com um sort só o stack não muda. Só o multi-sort (2+ critérios)
 * acrescenta o badge de índice (`min-w-[18px]` + um `gap` de 4px ≈ 22px), e isso é estado de
 * runtime que o cálculo — que só vê colunas e rows — não tem: fica de fora, e a coluna
 * ordenada em multi-sort pode ter o stack ~22px mais largo que o piso.
 */
function measureHeaderActionsWidth<T>(
  col: DataTableColumnDef<T>,
  typeDef: { defaultSortable?: boolean } | undefined,
): number {
  // Mesma resolução do render: `sortable` efetivo = col ?? default do tipo, e só `false`
  // desliga (coluna sem nada declarado é ordenável).
  const isSortable = (col.sortable ?? typeDef?.defaultSortable) !== false;
  const hasFilter = !!col.enableColumnFilter && col.enableHeaderFilter !== false;
  const hasMenu = col.enableColumnMenu !== false;
  const buttons = (hasFilter ? 1 : 0) + (hasMenu ? 1 : 0);

  const parts: number[] = [];
  if (isSortable) parts.push(HEADER_SORT_ICON_PX);
  if (buttons > 0) parts.push(buttons * HEADER_ACTION_BUTTON_PX);
  if (parts.length === 0) return 0;

  return (
    HEADER_STACK_INSET_PX +
    parts.reduce((sum, part) => sum + part, 0) +
    HEADER_STACK_GAP_PX * (parts.length - 1)
  );
}

/**
 * Largura MÍNIMA que o head cell precisa — o MAIOR de dois pisos:
 *
 *  1. **O título** (o piso de sempre): texto medido + padding horizontal + ícone de tipo
 *     (se houver e `showTypeIcons` não o desligou) + reserva de sort/funil. Pra mostrar o
 *     `headerName` inteiro, sem truncar ("...").
 *  2. **As ações visíveis**: o stack de sort + funil + menu que aparece no hover tem de
 *     caber DENTRO da célula. Sem isto, coluna estreita (`width: 64` com funil + menu)
 *     fazia o stack, de 84px, transbordar pra fora da coluna.
 *
 * É um `max`, NÃO uma soma, de propósito: o stack aparece por cima do título no hover
 * (com fundo, mascarando o fim do texto — comportamento antigo e aceito), então ele não
 * precisa de espaço PRÓPRIO além do título. Somar (título + 84px) alargaria toda coluna
 * com header de tamanho normal, em toda tabela — `autoFit` é default `true`. Com `max`,
 * só mexe em coluna cujo piso do título é menor que o stack, ou seja, a estreita.
 *
 * É o piso que toda coluna respeita — INCLUSIVE as com `col.width` explícito menor que o
 * header (o título é informação importante e tem que caber).
 */
function measureHeaderMinWidth<T>(
  col: DataTableColumnDef<T>,
  typeDef: { defaultIcon?: unknown; defaultSortable?: boolean } | undefined,
  showTypeIcons: boolean,
): number {
  const headerText = String(col.headerName ?? String(col.field));
  const hasHeaderIcon =
    showTypeIcons &&
    (col.icon !== undefined || typeDef?.defaultIcon !== undefined);
  const isSortable = col.sortable ?? typeDef?.defaultSortable ?? false;
  const hasHeadMenu = !!col.enableColumnFilter && col.enableHeaderFilter !== false;
  const overhead =
    CELL_PADDING_PX +
    (hasHeaderIcon ? HEADER_ICON_PX : 0) +
    (isSortable || hasHeadMenu ? HEADER_SORT_AFFORDANCE_PX : 0);

  // Medição inválida (NaN/Infinity) vale 0: `undefined + 32` é NaN, e NaN em `width`
  // contamina a célula e todo `Math.max` que a toca. Pode vir de um mock parcial de canvas
  // (`measureText` devolvendo um objeto sem `width`).
  const measured = measureTextWidth(headerText);
  const textWidth = Number.isFinite(measured) ? measured : 0;

  return Math.max(
    textWidth + overhead,
    measureHeaderActionsWidth(col, typeDef),
  );
}

export interface CalculateColumnWidthsOptions {
  /** Largura interna do container observada via ResizeObserver. */
  containerWidth: number;
  /** Habilita Layer 2 (canvas measure) globalmente. */
  autoFit: boolean;
  /** Tamanho da amostra de rows para Layer 2. Default 20. */
  sampleSize?: number;
  /**
   * O header mostra o ícone do tipo? Default `true`. `false` (prop `showTypeIcons` do
   * DataTable) tira do piso do título os 21px que o ícone ocuparia.
   */
  showTypeIcons?: boolean;
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
  const {
    containerWidth,
    autoFit,
    sampleSize = DEFAULT_SAMPLE_SIZE,
    showTypeIcons = true,
  } = options;

  if (containerWidth <= 0) return {};

  const widths: Record<string, number> = {};
  let totalContentWidth = 0;

  // ── Layer 1 + 2 ───────────────────────────────────────────────
  for (const col of columns) {
    const field = String(col.field);

    // `actions`: largura fixa estreita (ícone/menu). Não mede conteúdo textual nem
    // entra no flex (Layer 3) — senão vira 160px e/ou estica.
    //
    // Precedência, e as duas primeiras são correções de defeito MEDIDO:
    //
    //   1. `col.width` — antes era IGNORADO aqui: o ramo lia só `col.minWidth`, então
    //      `actionColumn({ width: 64 })` devolvia 120 em silêncio. As duas skills
    //      `crud-builder` (repo e payload) instruíam justamente `width: 64` como "seguro".
    //   2. `col.minWidth` — segue funcionando (era a única saída que funcionava).
    //   3. Largura DERIVADA do número de slots que a célula vai renderizar, via o mesmo
    //      `splitActionSlots` que ela usa. Antes era 120 fixo pra qualquer quantidade:
    //      1 ação reservava espaço pra 3, e 4 ícones vazavam a coluna em 30px.
    //   4. `ACTIONS_COLUMN_WIDTH` (120 = 3 slots) quando não há `getActions` ou rows
    //      pra medir.
    if (col.type === "actions") {
      const w =
        col.width ??
        col.minWidth ??
        measureActionsWidth(col.getActions, rows.slice(0, sampleSize)) ??
        ACTIONS_COLUMN_WIDTH;
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
      let w = Math.max(
        col.width,
        measureHeaderMinWidth(col, typeDef, showTypeIcons),
      );
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
      let maxWidth = measureHeaderMinWidth(col, typeDef, showTypeIcons);

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
      //
      // ⚠️ O alvo do snap é `containerWidth` MENOS as colunas fixas. `roundedTotal`
      // soma apenas os `targets`, e `actions`/`checkbox` foram excluídos deles 60 linhas
      // acima — então comparar direto com o container faz os targets preencherem a tela
      // inteira e as fixas sobrarem POR CIMA, produzindo scroll horizontal com a largura
      // exata delas. Medido em 2026-08-19 no `#/clientes-showcase`: 13 colunas somando
      // 1950px num container de 1906 → 44px de scroll, e a coluna de ações mede 44px.
      //
      // A coluna de SELEÇÃO já era tratada certo, por outro caminho: ela não está em
      // `columns` e é descontada antes do cálculo, via `reservedWidth` em
      // `use-data-table-controller.ts`. Aqui fazemos o equivalente pras que ESTÃO em
      // `columns` mas ficaram fora do rateio.
      const larguraFixa = columns
        .filter(isFixed)
        .reduce((soma, col) => soma + (widths[String(col.field)] ?? 0), 0);

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
        const residue = Math.round(containerWidth) - larguraFixa - roundedTotal;
        if (residue !== 0) {
          widths[lastFlexField] = Math.max(0, widths[lastFlexField] + residue);
        }
      }
    }
  }

  return widths;
}
