import { useCallback, useEffect, useState } from "react";

/**
 * Marcas disponíveis. "default" = tema-base (verde iGreen, sem data-theme).
 * "blue" = overlay de teste multi-tema (src/styles/theme/brand-blue.css).
 *
 * Novas marcas: gere o overlay (`npm run tokens:brand:<x>`), importe no
 * globals.css e acrescente o id aqui.
 */
export type Brand = "default" | "blue" | "green" | "pay";

/**
 * Catálogo de marcas — fonte única p/ o seletor (dropdown) e swatches.
 * Nova marca: gere o overlay, importe no globals.css, acrescente aqui e no type.
 */
export const BRANDS: { id: Brand; label: string; swatch: string }[] = [
  { id: "default", label: "iGreen", swatch: "oklch(0.5248 0.1415 150.9)" },
  { id: "blue", label: "Azul", swatch: "oklch(0.52 0.180 264)" },
  { id: "green", label: "Verde", swatch: "oklch(0.58 0.170 142)" },
  { id: "pay", label: "Pay", swatch: "#00a859" },
];

const STORAGE_KEY = "igreen-ds-brand";
const CHANGE_EVENT = "igreen-ds-brand-change";
const ATTR = "data-theme";

function isBrand(value: unknown): value is Brand {
  return value === "default" || value === "blue" || value === "green" || value === "pay";
}

function getStoredBrand(): Brand {
  if (typeof window === "undefined") return "default";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isBrand(stored) ? stored : "default";
}

/**
 * Hook de MARCA — eixo ortogonal ao dark/light (useTheme).
 *
 *   - Aplica `data-theme="<marca>"` no `<html>` ("default" remove o atributo).
 *   - O CSS overlay ([data-theme="blue"]) sobrescreve só a família `brand`;
 *     dark/light continua via `.dark`, então os dois eixos combinam livremente.
 *   - Persiste em localStorage + sincroniza instâncias (CustomEvent + storage).
 */
export function useBrand() {
  const [brand, setBrandState] = useState<Brand>(() => getStoredBrand());

  // Aplica/remove data-theme no <html>
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (brand === "default") root.removeAttribute(ATTR);
    else root.setAttribute(ATTR, brand);
  }, [brand]);

  const setBrand = useCallback((next: Brand) => {
    setBrandState(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: next }));
  }, []);

  // Listener — broadcast na mesma tab + cross-tab
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onCustom = (e: Event) => {
      const next = (e as CustomEvent).detail;
      if (isBrand(next)) setBrandState(next);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      if (isBrand(e.newValue)) setBrandState(e.newValue);
    };
    window.addEventListener(CHANGE_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Alterna entre default ↔ blue
  const toggle = useCallback(() => {
    setBrand(brand === "blue" ? "default" : "blue");
  }, [brand, setBrand]);

  return { brand, setBrand, toggle } as const;
}
