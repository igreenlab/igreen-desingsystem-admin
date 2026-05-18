import { useCallback, useState } from "react";
import type { TableDensity } from "../../Table";

export type UseDataTableDensityParams = {
  density?: TableDensity;
  onDensityChange?: (density: TableDensity) => void;
  defaultDensity?: TableDensity;
  /** Hidratado de localStorage. Aplicado apenas no mount. */
  initialDensity?: TableDensity;
};

export type UseDataTableDensityResult = {
  density: TableDensity;
  setDensity: (density: TableDensity) => void;
};

export function useDataTableDensity({
  density: controlled,
  onDensityChange,
  defaultDensity = "standard",
  initialDensity,
}: UseDataTableDensityParams = {}): UseDataTableDensityResult {
  const [uncontrolled, setUncontrolled] = useState<TableDensity>(
    () => initialDensity ?? defaultDensity,
  );
  const isControlled = controlled !== undefined;
  const density = isControlled ? controlled : uncontrolled;

  const setDensity = useCallback(
    (next: TableDensity) => {
      if (!isControlled) setUncontrolled(next);
      onDensityChange?.(next);
    },
    [isControlled, onDensityChange],
  );

  return { density, setDensity };
}
