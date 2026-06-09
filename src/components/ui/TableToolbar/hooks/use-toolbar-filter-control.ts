import { useCallback, useState } from "react";

/**
 * useToolbarFilterControl — encapsula o state dos 2 modos de filtragem do
 * split button da toolbar:
 *   - SimpleFilter drawer (lateral direito, default UX)
 *   - Advanced query builder popover (chevron do split, power users)
 *
 * Retorna state + handlers prontos pra plugar no `<ToolbarFilterControl>` ou
 * em wire manual. Não tem dependência do filterModel — só gerencia abertura
 * dos 2 paineis.
 *
 * @example
 * ```tsx
 * const ctl = useToolbarFilterControl();
 *
 * <ToolbarFilterControl
 *   {...ctl}
 *   columns={filterPopoverColumns}
 *   filterModel={filterModel}
 *   onFilterModelChange={setFilterModel}
 * />
 * ```
 */
export type UseToolbarFilterControlResult = {
  /** Estado: drawer simples aberto. */
  simpleDrawerOpen: boolean;
  /** Estado: popover avançado aberto. */
  advancedPopoverOpen: boolean;
  /** Setter direto do drawer simples. */
  setSimpleDrawerOpen: (open: boolean) => void;
  /** Setter direto do popover avançado. */
  setAdvancedPopoverOpen: (open: boolean) => void;
  /** Abre o drawer simples. Fecha o advanced se estiver aberto. */
  openSimple: () => void;
  /** Toggle do advanced (fecha simple se estiver aberto). */
  toggleAdvanced: () => void;
  /** Fecha ambos. */
  closeAll: () => void;
};

export function useToolbarFilterControl(): UseToolbarFilterControlResult {
  const [simpleDrawerOpen, setSimpleDrawerOpen] = useState(false);
  const [advancedPopoverOpen, setAdvancedPopoverOpen] = useState(false);

  const openSimple = useCallback(() => {
    setAdvancedPopoverOpen(false);
    setSimpleDrawerOpen(true);
  }, []);

  const toggleAdvanced = useCallback(() => {
    setSimpleDrawerOpen(false);
    setAdvancedPopoverOpen((o) => !o);
  }, []);

  const closeAll = useCallback(() => {
    setSimpleDrawerOpen(false);
    setAdvancedPopoverOpen(false);
  }, []);

  return {
    simpleDrawerOpen,
    advancedPopoverOpen,
    setSimpleDrawerOpen,
    setAdvancedPopoverOpen,
    openSimple,
    toggleAdvanced,
    closeAll,
  };
}
