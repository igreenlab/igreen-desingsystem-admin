/**
 * Constants compartilhadas do Table primitivo.
 *
 * Use estes valores em vez de duplicar literais — fonte única de verdade pra
 * larguras especiais, breakpoints, e identificadores de roles dentro do grid.
 */

/** Largura padrão da coluna de seleção (checkbox header + body cells).
 *  56px = 28px checkbox + 14px padding lateral × 2. Calibrado pra hit area
 *  WCAG mobile (44×44) com folga visual. */
export const SELECTION_COLUMN_WIDTH = 56;

/** Altura do header de uma linha de tabela. Usada por skeleton, totalizer,
 *  group header e quick filter row pra alinhar visualmente com a header bar. */
export const TABLE_HEADER_HEIGHT = 42;
