import { useEffect, useRef } from "react";
import { savePersistedState, type LoadedPersistedState } from "./state-persistence-utils";

export type UseDataTableStatePersistenceParams = {
  persistId: string | undefined;
  /** Snapshot completo a ser salvo. O hook detecta mudanças via deep-compare leve. */
  state: LoadedPersistedState;
  /** Delay antes de salvar (debounce). Default 400ms. */
  debounceMs?: number;
};

/**
 * Persiste estado da tabela no localStorage com debounce.
 * Hidratacao acontece no controller (loadPersistedState passado como initial state pros hooks).
 * Este hook so cuida do save.
 */
export function useDataTableStatePersistence({
  persistId,
  state,
  debounceMs = 400,
}: UseDataTableStatePersistenceParams): void {
  const isMountedRef = useRef(false);

  useEffect(() => {
    // Evita salvar no primeiro render (re-salvar o que acabou de hidratar)
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (!persistId) return;

    const timer = setTimeout(() => {
      savePersistedState(persistId, state);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [persistId, state, debounceMs]);
}
