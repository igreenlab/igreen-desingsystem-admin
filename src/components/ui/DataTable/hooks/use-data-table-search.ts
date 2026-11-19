import { useCallback, useEffect, useRef, useState } from "react";

export type UseDataTableSearchParams = {
  /** Controlled search. */
  search?: string;
  onSearchChange?: (value: string) => void;
  /** Tempo de debounce em ms. Default 500. */
  debounceMs?: number;
  /** Estado inicial hidratado (de localStorage) — aplicado apenas no mount uncontrolled. */
  initialSearch?: string;
};

export type UseDataTableSearchResult = {
  /** Valor em tempo real (sem debounce) — pra binding do input. */
  inputValue: string;
  /** Valor debounced — usado pelo processor/query. */
  debouncedValue: string;
  /** Update — atualiza input + agenda update do debounced. */
  setInputValue: (value: string) => void;
  /**
   * Atualiza input e debounced juntos, sem debounce — troca de visão e Default.
   * Com `search` controlado e sem `onSearchChange` não faz nada: a prop manda.
   */
  setValueNow: (value: string) => void;
  /** Force apply imediato (pra Enter, blur). */
  flush: () => void;
};

const DEFAULT_DEBOUNCE = 500;

/**
 * Search com debounce — separa o input (rápido) do valor "comprometido" (lento).
 * Em client mode: debouncedValue alimenta o processor. Server mode (futuro):
 * mesma assinatura, mas aciona refetch.
 */
export function useDataTableSearch({
  search: controlledSearch,
  onSearchChange,
  debounceMs = DEFAULT_DEBOUNCE,
  initialSearch,
}: UseDataTableSearchParams = {}): UseDataTableSearchResult {
  const [uncontrolled, setUncontrolled] = useState<string>(initialSearch ?? "");
  const isControlled = controlledSearch !== undefined;
  const inputValue = isControlled ? controlledSearch : uncontrolled;

  // Quando hidrata do localStorage, debouncedValue já inicia no valor final
  // pra processor aplicar filtro no primeiro render (sem aguardar debounce).
  const [debouncedValue, setDebouncedValue] = useState<string>(inputValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Quando inputValue muda, agenda update do debounced
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, debounceMs);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [inputValue, debounceMs]);

  const setInputValue = useCallback(
    (value: string) => {
      if (!isControlled) setUncontrolled(value);
      onSearchChange?.(value);
    },
    [isControlled, onSearchChange],
  );

  const setValueNow = useCallback(
    (value: string) => {
      if (isControlled && !onSearchChange) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (!isControlled) setUncontrolled(value);
      setDebouncedValue(value);
      onSearchChange?.(value);
    },
    [isControlled, onSearchChange],
  );

  const flush = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDebouncedValue(inputValue);
  }, [inputValue]);

  return { inputValue, debouncedValue, setInputValue, setValueNow, flush };
}
