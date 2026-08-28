import { useEffect, useRef, type RefObject } from "react";

/**
 * `useArrastarParaRolar` — segurar e arrastar a tira pra rolar horizontalmente.
 *
 * ## Por que não importei o `useGrabToScroll` do DataTable
 *
 * Ele existe (`ui/DataTable/hooks/use-grab-to-scroll.ts`) e resolve o mesmo gesto, mas está
 * dentro do item `data-table` do registry: importá-lo faria o `tabs-navigation` **depender da
 * tabela inteira** no copy-in — o consumidor puxaria DataTable + TableToolbar + virtual pra
 * ter aba. Metade daquele hook também é específica de tabela (pula célula editável,
 * expansível, de seleção), coisas que não existem aqui. Esta versão é o mesmo comportamento
 * sem a parte que não se aplica.
 *
 * ## O que ele faz, e o que deliberadamente NÃO faz
 *
 * - **Só mouse/pen.** Em `pointer: coarse` (celular, tablet) o navegador já rola a tira no
 *   swipe, nativamente e com inércia. Interceptar ali seria trocar um gesto bom por um pior.
 * - **Limiar de 6px** antes de virar arrasto: abaixo disso o gesto continua sendo um clique, e
 *   selecionar aba arrastando 2px por acidente não acontece.
 * - **Engole o clique seguinte** ao arrasto (fase de captura) — senão soltar o ponteiro em
 *   cima de uma aba a selecionaria no fim de todo arrasto.
 * - **Não toca em alvo interativo** (botão, link, menu): ali o gesto é do controle, não da
 *   tira. Sem isso, arrastar 6px começando no `×` fecharia a aba errada ou nenhuma.
 */
export function useArrastarParaRolar(
  trilho: RefObject<HTMLElement | null>,
  ativo = true,
  limiarPx = 6,
): void {
  /** Persiste entre renders: avisa o click-capture que o último gesto foi arrasto. */
  const engolirClique = useRef(false);

  useEffect(() => {
    if (!ativo) return;
    const el = trilho.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    // touch já rola sozinho — e melhor
    if (window.matchMedia?.("(pointer: coarse)").matches) return;

    let arrastando = false;
    let passouLimiar = false;
    let xInicial = 0;
    let scrollInicial = 0;

    /**
     * O gesto não é da tira quando começa num controle — nem quando começa dentro de algo
     * FLUTUANTE aberto a partir dela.
     *
     * ⚠️ O segundo caso não é teórico: o `HoverCardContent` do DS não usa Portal, então o
     * resumo da aba é renderizado **dentro do trilho** no DOM (com `position: fixed`, por isso
     * não é clipado). Sem esta guarda, tentar SELECIONAR O TEXTO do resumo arrastava a fila de
     * abas — o pointerdown do card borbulhava até aqui. Vale pro dropdown de opções pela mesma
     * razão.
     */
    const ehInterativo = (alvo: EventTarget | null) =>
      alvo instanceof Element &&
      !!alvo.closest(
        'button, a, input, select, textarea, [role="button"], [role="menuitem"], ' +
          '[data-radix-popper-content-wrapper], [role="dialog"], [role="menu"], [role="tooltip"]',
      );

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 || ehInterativo(e.target)) return;
      arrastando = true;
      passouLimiar = false;
      xInicial = e.clientX;
      scrollInicial = el.scrollLeft;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!arrastando) return;
      const delta = e.clientX - xInicial;
      if (!passouLimiar) {
        if (Math.abs(delta) < limiarPx) return;
        passouLimiar = true;
        engolirClique.current = true;
        el.setPointerCapture?.(e.pointerId);
        el.style.cursor = "grabbing";
        // sem isto o arrasto seleciona o texto dos títulos enquanto rola
        el.style.userSelect = "none";
      }
      el.scrollLeft = scrollInicial - delta;
    };

    const encerrar = (e: PointerEvent) => {
      if (!arrastando) return;
      arrastando = false;
      el.releasePointerCapture?.(e.pointerId);
      el.style.cursor = "";
      el.style.userSelect = "";
      // o clique só é engolido se houve arrasto de verdade; o flag zera no próprio handler
    };

    const onClickCapture = (e: MouseEvent) => {
      if (!engolirClique.current) return;
      engolirClique.current = false;
      e.stopPropagation();
      e.preventDefault();
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", encerrar);
    el.addEventListener("pointercancel", encerrar);
    el.addEventListener("click", onClickCapture, true);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", encerrar);
      el.removeEventListener("pointercancel", encerrar);
      el.removeEventListener("click", onClickCapture, true);
      el.style.cursor = "";
      el.style.userSelect = "";
    };
  }, [trilho, ativo, limiarPx]);
}
