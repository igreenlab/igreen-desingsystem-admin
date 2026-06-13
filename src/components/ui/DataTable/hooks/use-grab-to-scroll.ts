import { useEffect, useRef, type RefObject } from "react";

/**
 * `useGrabToScroll` — arrastar o corpo da tabela ("grab") pra rolar
 * horizontalmente, equivalente ao hook legado do DataGrid MUI.
 *
 * Anexa pointer listeners ao elemento de scroll (`scrollContainerRef`). Um
 * arrasto só começa após o ponteiro passar de `thresholdPx` (default 6px) —
 * abaixo disso o gesto é tratado como clique normal (seleção/click de célula
 * preservados). Quando um arrasto de fato acontece, o `click` subsequente é
 * suprimido (capture-phase) pra não disparar `onRowClick` ou seleção acidental.
 *
 * Não interfere no scroll por roda (wheel) — apenas posiciona `scrollLeft` via
 * pointermove. Pula:
 *   - dispositivos touch (`pointer: coarse`) — lá o scroll nativo já funciona;
 *   - alvos interativos (button/input/a/checkbox/[role=button]/etc) e células
 *     editáveis/expansíveis/de seleção, pra não roubar o gesto deles.
 *
 * @param scrollContainerRef ref ao elemento com `overflow-x` (o mesmo
 *   `scrollRef` passado ao `<Table>`).
 * @param enabled liga/desliga o comportamento sem desmontar o hook.
 * @param thresholdPx distância mínima (px) pra um movimento virar arrasto.
 */
export function useGrabToScroll(
  scrollContainerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  thresholdPx = 6,
): void {
  // Persiste entre renders: sinaliza ao click-capture que o último gesto foi
  // um arrasto e o clique deve ser engolido.
  const suppressClickRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const scroller = scrollContainerRef.current;
    if (!scroller) return;

    // Touch já rola nativamente — grab-to-scroll é só desktop (mouse/pen).
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    // Alvos que NÃO devem iniciar um arrasto (têm gesto próprio).
    const INTERACTIVE_SELECTOR = [
      "a",
      "button",
      "input",
      "textarea",
      "select",
      '[role="button"]',
      '[role="menuitem"]',
      '[role="checkbox"]',
      '[role="switch"]',
      '[contenteditable="true"]',
      "[data-editable]",
      "[data-expandable]",
      '[data-purpose="selection"]',
      '[data-purpose="actions"]',
    ].join(",");

    const prevCursor = scroller.style.cursor;
    const prevUserSelect = scroller.style.userSelect;
    scroller.style.cursor = "grab";

    let isPointerDown = false;
    let isDragging = false;
    let activePointerId: number | null = null;
    let startClientX = 0;
    let startScrollLeft = 0;

    const shouldIgnoreTarget = (target: EventTarget | null): boolean => {
      const el = target instanceof Element ? target : null;
      if (!el) return true;
      return el.closest(INTERACTIVE_SELECTOR) != null;
    };

    const onClickCapture = (event: MouseEvent) => {
      if (!suppressClickRef.current) return;
      suppressClickRef.current = false;
      event.preventDefault();
      event.stopPropagation();
    };

    const onPointerDown = (event: PointerEvent) => {
      // Só botão primário do mouse; ignora touch (já tratado pelo skip acima,
      // mas defensivo) — pen é permitido.
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (event.pointerType === "touch") return;
      if (shouldIgnoreTarget(event.target)) return;
      // Nada a rolar — não inicia.
      if (scroller.scrollWidth <= scroller.clientWidth) return;

      isPointerDown = true;
      isDragging = false;
      activePointerId = event.pointerId;
      startClientX = event.clientX;
      startScrollLeft = scroller.scrollLeft;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isPointerDown || activePointerId !== event.pointerId) return;
      const deltaX = event.clientX - startClientX;
      if (!isDragging) {
        if (Math.abs(deltaX) < thresholdPx) return;
        // Cruzou o threshold → vira arrasto de verdade.
        isDragging = true;
        scroller.style.cursor = "grabbing";
        scroller.style.userSelect = "none";
        try {
          scroller.setPointerCapture(event.pointerId);
        } catch {
          /* setPointerCapture pode falhar em alguns browsers — no-op */
        }
      }
      scroller.scrollLeft = startScrollLeft - deltaX;
      event.preventDefault();
    };

    const finish = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) return;
      if (isDragging) {
        // Suprime o `click` que o browser dispara após o pointerup do arrasto.
        suppressClickRef.current = true;
      }
      isPointerDown = false;
      isDragging = false;
      activePointerId = null;
      scroller.style.cursor = "grab";
      scroller.style.userSelect = prevUserSelect;
      try {
        scroller.releasePointerCapture(event.pointerId);
      } catch {
        /* releasePointerCapture pode falhar se já liberado — no-op */
      }
    };

    scroller.addEventListener("click", onClickCapture, true);
    scroller.addEventListener("pointerdown", onPointerDown);
    scroller.addEventListener("pointermove", onPointerMove, { passive: false });
    scroller.addEventListener("pointerup", finish);
    scroller.addEventListener("pointercancel", finish);

    return () => {
      scroller.removeEventListener("click", onClickCapture, true);
      scroller.removeEventListener("pointerdown", onPointerDown);
      scroller.removeEventListener("pointermove", onPointerMove);
      scroller.removeEventListener("pointerup", finish);
      scroller.removeEventListener("pointercancel", finish);
      scroller.style.cursor = prevCursor;
      scroller.style.userSelect = prevUserSelect;
    };
  }, [scrollContainerRef, enabled, thresholdPx]);
}
