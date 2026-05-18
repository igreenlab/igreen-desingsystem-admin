import { useState, useCallback } from "react";

/**
 * Hook genérico controlled/uncontrolled.
 * - Se `controlledValue` for fornecido, opera em modo controlled.
 * - Caso contrário, usa o `defaultValue` como inicial e gerencia internamente.
 */
export function useControllable<T>(
  controlledValue: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void
): [T, (value: T) => void] {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<T>(defaultValue);
  const value = isControlled ? (controlledValue as T) : internalValue;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  return [value, setValue];
}
