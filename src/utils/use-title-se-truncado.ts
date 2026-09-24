import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Devolve o `title` só quando o elemento está REALMENTE cortado.
 *
 * ## Por que não `title` sempre
 *
 * A primeira versão disto punha `title={label}` incondicional. Resolve o caso do texto
 * cortado e cria outro: tooltip nativo do browser em TODO hover, inclusive nos 90% em que
 * o texto cabe inteiro. Numa grade de 8 KPIs isso é ruído constante — e ruído que o
 * consumidor não tem como desligar.
 *
 * ## Como decide
 *
 * `scrollWidth > clientWidth` pega `truncate` (uma linha); `scrollHeight > clientHeight`
 * pega `line-clamp-N` (várias). Os dois são medidas de LAYOUT, então não sofrem com
 * `transform` — diferente de `getBoundingClientRect`, que mente enquanto uma animação
 * de entrada está em curso.
 *
 * Re-mede em resize do elemento (`ResizeObserver`), porque o mesmo rótulo corta ou não
 * conforme a coluna — que é exatamente o caso do `KpiGroup`, cujo grid muda por
 * container query.
 *
 * @example
 * const { ref, title } = useTitleSeTruncado(label);
 * <h3 ref={ref} className="line-clamp-2" title={title}>{label}</h3>
 */
export function useTitleSeTruncado<T extends HTMLElement = HTMLElement>(
  texto: unknown,
): { ref: (el: T | null) => void; title: string | undefined } {
  const elRef = useRef<T | null>(null);
  const [cortado, setCortado] = useState(false);

  const medir = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    setCortado(el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight);
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (!el || typeof ResizeObserver === "undefined") {
      medir();
      return;
    }
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    medir();
    return () => ro.disconnect();
    // `texto` entra porque trocar o conteúdo muda o corte sem mudar o tamanho do box.
  }, [medir, texto]);

  const ref = useCallback(
    (el: T | null) => {
      elRef.current = el;
      if (el) medir();
    },
    [medir],
  );

  const ehTexto = typeof texto === "string" || typeof texto === "number";
  return { ref, title: cortado && ehTexto ? String(texto) : undefined };
}
