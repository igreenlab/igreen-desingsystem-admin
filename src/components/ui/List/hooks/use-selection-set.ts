import { useCallback, useState } from "react";

type Options = {
  controlled?: Set<string>;
  defaultValue?: Set<string>;
  onChange?: (ids: Set<string>) => void;
};

/**
 * Set de IDs selecionados com idioma controlado/não-controlado.
 * - `controlled` presente → o consumer dona o estado (List vira burro).
 * - senão → estado interno semeado por `defaultValue`.
 * `onChange` sempre dispara (mesmo no modo controlado).
 */
export function useSelectionSet({ controlled, defaultValue, onChange }: Options) {
  const [internal, setInternal] = useState<Set<string>>(
    () => defaultValue ?? new Set(),
  );
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : internal;

  const commit = useCallback(
    (next: Set<string>) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(value);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      commit(next);
    },
    [value, commit],
  );

  return { selected: value, toggle, setSelected: commit };
}
