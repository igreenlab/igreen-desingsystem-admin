import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "igreen-ds-theme";
const CHANGE_EVENT = "igreen-ds-theme-change";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isTheme(stored) ? stored : "system";
}

function getEffectiveDark(theme: Theme): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Hook único de tema do app.
 *
 *   - 3 valores: `"light"` | `"dark"` | `"system"` (segue prefers-color-scheme).
 *   - Persiste em `localStorage["igreen-ds-theme"]`.
 *   - Sincroniza múltiplas instâncias na mesma tab via `CustomEvent` e entre
 *     tabs via `storage` event. Pode ser chamado em qualquer page/component
 *     sem precisar de Context Provider.
 *   - Aplica `.dark` no `<html>` com observador de `prefers-color-scheme`
 *     quando theme=`"system"`.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());

  // Aplica .dark no <html> + observa prefers-color-scheme quando theme="system"
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const apply = () => root.classList.toggle("dark", getEffectiveDark(theme));
    apply();

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [theme]);

  // setTheme — persiste no localStorage + broadcast pra outras instâncias do hook
  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: next }));
  }, []);

  // Listener — recebe broadcast de outras instâncias (mesma tab + cross-tab)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onCustom = (e: Event) => {
      const next = (e as CustomEvent).detail;
      if (isTheme(next)) setThemeState(next);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      if (isTheme(e.newValue)) setThemeState(e.newValue);
    };
    window.addEventListener(CHANGE_EVENT, onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const isDark = getEffectiveDark(theme);

  // Backwards-compat: alterna apenas entre light/dark (ignora system).
  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, isDark, toggle } as const;
}
