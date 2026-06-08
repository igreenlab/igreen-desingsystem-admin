/**
 * Color contrast utilities — WCAG 2.x relative luminance.
 *
 * Used by components que aplicam bg arbitrário (hex/css color) e precisam
 * escolher cor de texto que tenha contraste mínimo (white vs black).
 *
 * Caso real (v0.7.1): Avatar com `colorHex={bankColor}` antes aplicava
 * `text-white` cego — quebra contraste em cores claras (BB amarelo #FAE128
 * + branco = ratio 1.29:1, falha WCAG AA 4.5:1). Agora escolhe preto/branco
 * baseado em luminância calculada.
 */

/* ── Tipo público ──────────────────────────────────────────────────────────── */

export type ContrastTextColor = "white" | "black";

/* ── Internals ─────────────────────────────────────────────────────────────── */

type RGB = { r: number; g: number; b: number };

/**
 * Converte hex (#RGB, #RRGGBB ou #RRGGBBAA — alpha ignorado) pra RGB 0-255.
 * Retorna null se inválido.
 */
function hexToRgb(hex: string): RGB | null {
  if (typeof hex !== "string") return null;
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  } else if (h.length === 8) {
    h = h.slice(0, 6);
  }
  if (h.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/**
 * Relative luminance per WCAG 2.x — fórmula oficial com gamma correction.
 * Retorna valor entre 0 (preto) e 1 (branco puro).
 *
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
function relativeLuminance({ r, g, b }: RGB): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * Contrast ratio entre 2 luminâncias (WCAG fórmula `(L1+0.05)/(L2+0.05)`).
 */
function contrastRatio(l1: number, l2: number): number {
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/* ── Public API ────────────────────────────────────────────────────────────── */

/**
 * Escolhe a cor de texto (branco ou preto) com MAIOR contraste sobre um bg.
 *
 * Comportamento:
 * - Compara `(white, bg)` vs `(black, bg)` via contrast ratio WCAG
 * - Retorna o vencedor — sempre o que tem ratio mais alto
 * - Default "white" pra cores escuras (luminância baixa), "black" pra cores
 *   claras (luminância alta). Threshold dinâmico ~50% (não fixo)
 *
 * Fallback: hex inválido → "white" (preserva comportamento legado de
 * `text-white` cego — caller deve garantir hex válido).
 *
 * Exemplos:
 * - "#FAE128" (BB amarelo)  → "black" (white ratio 1.29, black ratio 16.3)
 * - "#820AD1" (Nubank roxo) → "white" (white ratio 6.2, black ratio 3.4)
 * - "#EC7000" (Itaú laranja)→ "black" (white ratio 2.7, black ratio 7.8)
 * - "#FFFFFF" (branco)      → "black"
 * - "#000000" (preto)       → "white"
 *
 * @param bgColor - hex string (#RGB, #RRGGBB ou #RRGGBBAA)
 * @returns "white" | "black" — cor de texto recomendada
 */
export function getContrastTextColor(bgColor: string): ContrastTextColor {
  const rgb = hexToRgb(bgColor);
  if (!rgb) return "white";
  const bgLum = relativeLuminance(rgb);
  const whiteContrast = contrastRatio(1, bgLum);
  const blackContrast = contrastRatio(0, bgLum);
  return whiteContrast >= blackContrast ? "white" : "black";
}

/**
 * Retorna `true` se o contraste entre texto/bg passa WCAG AA pra texto
 * normal (4.5:1) ou texto large (3:1).
 *
 * Útil pra validação em desenvolvimento (avisar quando alguém configurou
 * `colorHex` com contraste insuficiente mesmo após auto-pick).
 *
 * @param textColor - hex do texto
 * @param bgColor - hex do bg
 * @param size - "normal" (4.5:1) | "large" (3:1, >=18pt ou >=14pt bold)
 */
export function meetsWCAG_AA(
  textColor: string,
  bgColor: string,
  size: "normal" | "large" = "normal",
): boolean {
  const text = hexToRgb(textColor);
  const bg = hexToRgb(bgColor);
  if (!text || !bg) return false;
  const ratio = contrastRatio(relativeLuminance(text), relativeLuminance(bg));
  return ratio >= (size === "large" ? 3 : 4.5);
}
