/**
 * scales.ts — Spatial scale (base-4 system)
 * Tier 1 de 3: valores raw. API privada.
 *
 * Princípio: todo valor espacial é múltiplo de 4px.
 *
 * Uso: importar sp() nos arquivos semantic (spacing.ts, sizing.ts, shape.ts).
 * Nunca usar sp() diretamente em componentes.
 *
 * Fórmula: sp(n) = n * 4px
 */

const BASE = 4; // px

/** Retorna valor em px como string */
export const sp = (n: number): string => `${n * BASE}px`;

/**
 * Escala completa: 0 a 80 (0px a 320px)
 * Usar sp() ao invés desta tabela nos tokens semânticos.
 * Esta tabela existe para referência e documentação.
 */
export const scale = {
  0:   sp(0),   // 0px
  0.5: sp(0.5), // 2px   ← hairline
  1:   sp(1),   // 4px   ← xs
  1.5: sp(1.5), // 6px
  2:   sp(2),   // 8px   ← sm
  2.5: sp(2.5), // 10px
  3:   sp(3),   // 12px  ← md
  3.5: sp(3.5), // 14px
  4:   sp(4),   // 16px  ← base (1 unit)
  5:   sp(5),   // 20px
  6:   sp(6),   // 24px  ← lg
  7:   sp(7),   // 28px
  8:   sp(8),   // 32px  ← xl
  9:   sp(9),   // 36px
  10:  sp(10),  // 40px
  11:  sp(11),  // 44px  ← touch target min
  12:  sp(12),  // 48px  ← touch target ideal
  14:  sp(14),  // 56px
  16:  sp(16),  // 64px
  18:  sp(18),  // 72px
  20:  sp(20),  // 80px
  24:  sp(24),  // 96px
  28:  sp(28),  // 112px
  32:  sp(32),  // 128px
  40:  sp(40),  // 160px
  48:  sp(48),  // 192px
  56:  sp(56),  // 224px
  64:  sp(64),  // 256px
  80:  sp(80),  // 320px
} as const;
