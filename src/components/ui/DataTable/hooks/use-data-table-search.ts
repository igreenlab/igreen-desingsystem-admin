import { useCallback, useEffect, useRef, useState } from "react";

export type UseDataTableSearchParams = {
  /** Controlled search. */
  search?: string;
  onSearchChange?: (value: string) => void;
  /** Tempo de debounce em ms. Default 500. */
  debounceMs?: number;
};

export type UseDataTableSearchResult = {
  /** Valor em tempo real (sem debounce) — pra binding do input. */
  inputValue: string;
  /** Valor debounced — usado pelo processor/query. */
  debouncedValue: string;
  /** Update — atualiza input + agenda update do debounced. */
  setInputValue: (value: string) => void;
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
}: UseDataTableSearchParams = {}): UseDataTableSearchResult {
  const [uncontrolled, setUncontrolled] = useState<string>("");
  const isControlled = controlledSearch !== undefined;
  const inputValue = isControlled ? controlledSearch : uncontrolled;

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

  const flush = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDebouncedValue(inputValue);
  }, [inputValue]);

  return { inputValue, debouncedValue, setInputValue, flush };
}
