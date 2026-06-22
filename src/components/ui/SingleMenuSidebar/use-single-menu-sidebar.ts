import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

/* ══════════════════════════════════════════════════════════════════════════
   SingleMenuSidebar — hooks de UI (sem business logic, sem fetch, sem store)
   ══════════════════════════════════════════════════════════════════════════ */

interface SingleMenuSidebarContextValue {
  expanded: boolean;
  /** Se o estado expandido veio de hover (temporário) ou toggle (travado) */
  isHoverExpand: boolean;
  toggle: () => void;
  /** Categoria aberta no accordion (apenas 1 por vez) */
  openCategoryId: string | null;
  setOpenCategoryId: (id: string | null) => void;
}

export const SingleMenuSidebarContext =
  createContext<SingleMenuSidebarContextValue>({
    expanded: true,
    isHoverExpand: false,
    toggle: () => {},
    openCategoryId: null,
    setOpenCategoryId: () => {},
  });

export function useSingleMenuSidebar() {
  return useContext(SingleMenuSidebarContext);
}

// ── Estado expandido controlado/não-controlado + suporte a hover ──
export function useSingleMenuSidebarState(
  defaultExpanded: boolean,
  controlledExpanded?: boolean,
  onExpandedChange?: (v: boolean) => void,
) {
  const [internal, setInternal] = useState(defaultExpanded);
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internal;

  // "Travado" aberto (via toggle) vs "hover" aberto (temporário)
  const [lockedOpen, setLockedOpen] = useState(defaultExpanded);
  const [hoverOpen, setHoverOpen] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Suprime o hover-expand logo após colapsar manualmente — senão, com o mouse
  // ainda por cima, ele re-expande na hora ("pisca e cresce de novo").
  const suppressHoverRef = useRef(false);
  const suppressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setExpanded = useCallback(
    (v: boolean) => {
      if (!isControlled) setInternal(v);
      onExpandedChange?.(v);
    },
    [isControlled, onExpandedChange],
  );

  // Toggle: trava/destrava a sidebar
  const toggle = useCallback(() => {
    const next = !lockedOpen;
    setLockedOpen(next);
    setHoverOpen(false);
    // Colapsou manualmente → bloqueia hover-expand por um instante (e até o
    // mouse sair) pra retrair de fato mesmo com o cursor ainda por cima.
    if (!next) {
      suppressHoverRef.current = true;
      if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
      suppressTimerRef.current = setTimeout(() => {
        suppressHoverRef.current = false;
      }, 500);
    }
    setExpanded(next);
  }, [lockedOpen, setExpanded]);

  // Hover enter: se travada fechada, expande temporariamente
  const onMouseEnter = useCallback(() => {
    if (lockedOpen) return; // já aberta, hover desnecessário
    if (suppressHoverRef.current) return; // recém-colapsada: ignora o hover
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoverOpen(true);
    setExpanded(true);
  }, [lockedOpen, setExpanded]);

  // Hover leave: se expandida por hover, recolhe após breve delay
  const onMouseLeave = useCallback(() => {
    if (lockedOpen) return; // travada aberta, não recolhe
    hoverTimeoutRef.current = setTimeout(() => {
      setHoverOpen(false);
      setExpanded(false);
    }, 200);
  }, [lockedOpen, setExpanded]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
    };
  }, []);

  const isHoverExpand = hoverOpen && !lockedOpen;

  // Accordion: apenas 1 categoria aberta por vez
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  return {
    expanded,
    isHoverExpand,
    toggle,
    onMouseEnter,
    onMouseLeave,
    openCategoryId,
    setOpenCategoryId,
  };
}
