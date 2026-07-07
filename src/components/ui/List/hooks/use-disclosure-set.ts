import { useCallback, useState } from "react";

type Options = {
  controlled?: Set<string>;
  defaultValue?: Set<string>;
  onChange?: (ids: Set<string>) => void;
};

/**
 * Set de IDs expandidos (colapso de grupos/hierarquia) com idioma
 * controlado/não-controlado. Mesma mecânica do useSelectionSet, mantido
 * separado por coesão semântica (expansão ≠ seleção).
 */
export function useDisclosureSet({ controlled, defaultValue, onChange }: Options) {
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

  return { expanded: value, toggle, setExpanded: commit };
}
