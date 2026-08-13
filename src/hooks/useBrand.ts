import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Marcas disponíveis. `default` = tema-base (verde iGreen, sem `data-theme`); as
 * outras 4 são overlays de cor escopados em `[data-theme="<id>"]`.
 *
 * Marca nova: gere o overlay (`npm run tokens:brand:<x>`), importe no `globals.css`
 * e acrescente aqui **e** no `BRANDS` abaixo. As 10 superfícies completas estão em
 * `.claude/rules/ds-standards.md` §"Sistema multi-marca".
 */
export type Brand = "default" | "blue" | "green" | "pay" | "vibrant";

/** Uma entrada de catálogo: o que o seletor precisa pra renderizar a opção. */
export type BrandOption = {
  id: Brand;
  label: string;
  /** Cor do swatch no seletor. Aceita qualquer valor CSS de cor. */
  swatch: string;
};

/**
 * Catálogo COMPLETO — as 5 marcas que o DS publica. É a fonte única do seletor do
 * showcase e o default do hook.
 *
 * ⚠️ Consumidor: só passe este catálogo inteiro se você importou os 5 overlays. Marca
 * cujo CSS não está no bundle **não faz nada** quando selecionada — `data-theme` com id
 * sem CSS é no-op silencioso. Se você instalou só um tema, passe um catálogo com ele:
 * `useBrand({ brands: [{ id: "vibrant", label: "…", swatch: "…" }] })`.
 */
export const BRANDS: BrandOption[] = [
  { id: "default", label: "iGreen", swatch: "oklch(0.5248 0.1415 150.9)" },
  { id: "blue", label: "Azul", swatch: "oklch(0.52 0.180 264)" },
  { id: "green", label: "Verde", swatch: "oklch(0.58 0.170 142)" },
  { id: "pay", label: "Pay", swatch: "#00a859" },
  { id: "vibrant", label: "iGreen Vibrant", swatch: "oklch(0.866993 0.294055 142.3546)" },
];

const STORAGE_KEY = "igreen-ds-brand";
const CHANGE_EVENT = "igreen-ds-brand-change";
const ATTR = "data-theme";

export type UseBrandOptions = {
  /**
   * Catálogo que o hook valida e percorre. Default: `BRANDS` (as 5 do DS).
   *
   * Passe um subconjunto quando o projeto importou só alguns overlays — o hook usa esta
   * lista pra validar o valor persistido e pra ciclar no `toggle()`, então id fora dela
   * é ignorado e cai no fallback. A **primeira** entrada é o fallback.
   */
  brands?: BrandOption[];
};

/**
 * Hook de MARCA — eixo ortogonal ao dark/light (`useTheme`).
 *
 *   - Aplica `data-theme="<marca>"` no `<html>`. A primeira entrada do catálogo é
 *     tratada como padrão: se ela for `default`, o atributo é REMOVIDO (o tema-base
 *     não tem overlay, então `default` = ausência de `data-theme`).
 *   - Persiste em `localStorage` e sincroniza instâncias (CustomEvent + storage).
 *   - Marca e dark/light são independentes: o overlay declara os 2 blocos
 *     (`[data-theme]:not(.dark)` e `.dark[data-theme]`), então os eixos combinam.
 *
 * ```tsx
 * const { brand, brands, setBrand } = useBrand();          // as 5 do DS
 * const { brand, setBrand } = useBrand({ brands: meus });  // só o que instalei
 * ```
 *
 * ⚠️ Selecionar marca cujo CSS não está no bundle é **no-op silencioso** — o atributo
 * entra no `<html>` e nenhuma regra casa. Mantenha o catálogo alinhado com os
 * `@import` do seu CSS de entrada.
 */
export function useBrand(options?: UseBrandOptions) {
  // `brands` sai de props e pode ser recriado a cada render do consumidor; a
  // identidade não pode ser dependência de effect, senão o listener remonta sempre.
  const brands = options?.brands ?? BRANDS;
  const ids = useMemo(() => brands.map((b) => b.id).join(","), [brands]);

  // Valida contra o CATÁLOGO ATIVO, não contra a união de tipos. Antes isto era uma
  // cadeia literal (`v === "default" || v === "blue" || …`) que precisava de edição
  // manual a cada marca nova — e um esquecimento fazia o valor persistido cair
  // silenciosamente no default.
  const isBrand = useCallback(
    (value: unknown): value is Brand =>
      typeof value === "string" && ids.split(",").includes(value),
    [ids],
  );

  const fallback = brands[0]?.id ?? "default";

  const [brand, setBrandState] = useState<Brand>(() => {
    if (typeof window === "undefined") return fallback;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return typeof stored === "string" && ids.split(",").includes(stored)
      ? (stored as Brand)
      : fallback;
  });

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
    const valido = (v: unknown): v is Brand =>
      typeof v === "string" && ids.split(",").includes(v);
    const onCustom = (e: Event) => {
      const next = (e as CustomEvent).detail;
      if (valido(next)) setBrandState(next);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      if (valido(e.newValue)) setBrandState(e.newValue);
    };
    window.addEventListener(CHANGE_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, [ids]);

  /**
   * Avança pra próxima marca do catálogo, circular.
   *
   * ⚠️ Mudou de comportamento em v0.33.0: antes alternava `default↔blue` cravado —
   * legado de quando `blue` era a única marca extra. Com 5 marcas aquilo enganava, e o
   * botão mobile do showcase (que usa este toggle) mostrava "Marca: iGreen" mesmo com
   * `pay` ou `vibrant` ativas. Agora percorre o catálogo, então marca nova entra sozinha.
   */
  const toggle = useCallback(() => {
    const lista = ids.split(",") as Brand[];
    const i = lista.indexOf(brand);
    setBrand(lista[(i + 1) % lista.length] ?? fallback);
  }, [brand, ids, setBrand, fallback]);

  /** A entrada de catálogo da marca ativa — pra label e swatch, sem `find()` no consumidor. */
  const current = useMemo(
    () => brands.find((b) => b.id === brand) ?? brands[0],
    [brands, brand],
  );

  return { brand, brands, current, setBrand, toggle, isBrand } as const;
}
