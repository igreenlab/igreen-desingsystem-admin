import type { TableDensity } from "../Table";

/**
 * Constantes default do DataTable — centralizadas pra evitar magic numbers
 * repetidos e drift silencioso entre arquivos.
 */

/** Breakpoint (px) abaixo do qual a tabela entra em card mode (quando habilitado). */
export const DEFAULT_CARD_BREAKPOINT = 768;

/** Linhas extra renderizadas acima/abaixo do viewport na virtualização. */
export const DEFAULT_OVERSCAN = 10;

/** Largura default da coluna `actions` (icon-only kebab + respiro). */
export const ACTIONS_COLUMN_WIDTH = 120;

/** Tempo mínimo (ms) que o spinner de refresh fica visível (feedback de UX). */
export const MIN_REFRESH_SPINNER_MS = 400;

/**
 * Altura estimada da row por densidade (px) — usada pela virtualização
 * (`estimateSize`). ⚠️ DEVE casar com as classes de altura em
 * `Table/table.styles.ts` (`tableRow` density variants). Se mudar uma altura
 * lá, atualizar aqui (e vice-versa) — senão o scroll virtual desalinha.
 */
export const DENSITY_ROW_HEIGHT: Record<TableDensity, number> = {
  compact: 40,
  standard: 56,
  comfortable: 64,
};
