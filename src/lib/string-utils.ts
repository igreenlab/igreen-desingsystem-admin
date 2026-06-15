/**
 * Normalização de texto pra comparação tolerante (busca/filtro/match de rótulo):
 * lowercase + NFD sem diacríticos. Fonte ÚNICA — reusada pelo column-type `text`
 * (match de célula) e pela resolução rótulo↔campo do filtro avançado, pra que
 * "Graduação" e "graduacao" casem.
 */
export function normalizeText(s: unknown): string {
  if (s == null) return "";
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
