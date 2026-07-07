/**
 * DEFAULT_COLOR_PRESETS — paleta curada para o ColorPicker (Tags / Filas).
 *
 * Mistura cores da marca iGreen (verdes) + cores vivas semânticas + neutras,
 * todas em #RRGGBB maiúsculo. Pensada para preencher um grid de 10 colunas
 * (≈ 2-3 linhas). Nenhum hex é hardcode de "estilo" — é DADO (lista de cores
 * que o usuário pode escolher), análogo a `colorHex` do Avatar.
 *
 * O grid usa `getContrastTextColor()` (L-027) para decidir a cor do checkmark
 * sobre cada swatch — por isso a paleta pode conter claros e escuros à vontade.
 */
export const DEFAULT_COLOR_PRESETS: string[] = [
  // Marca iGreen — verdes
  "#0E7C3A",
  "#16A34A",
  "#22C55E",
  "#4ADE80",
  "#86EFAC",
  // Frios
  "#0891B2",
  "#06B6D4",
  "#0EA5E9",
  "#2563EB",
  "#4F46E5",
  // Roxos / rosas
  "#7C3AED",
  "#9333EA",
  "#C026D3",
  "#DB2777",
  "#F43F5E",
  // Quentes
  "#DC2626",
  "#EA580C",
  "#F97316",
  "#F59E0B",
  "#FACC15",
  // Neutras
  "#FFFFFF",
  "#E5E7EB",
  "#9CA3AF",
  "#6B7280",
  "#374151",
  "#111827",
];
