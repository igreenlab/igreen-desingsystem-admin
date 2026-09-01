import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Roving tabindex pra uma grade — o padrão WAI-ARIA de `grid`.
 *
 * ## O problema que ele resolve
 *
 * Sem isso, cada célula é um `tabIndex=0` e a grade do mês custa **42 `Tab`**
 * pra atravessar; a de semana custa 168. Um teclado só consegue chegar ao
 * conteúdo abaixo da grade desistindo.
 *
 * Com roving tabindex, a grade inteira é **uma** parada de `Tab`: a célula ativa
 * tem `tabIndex=0`, todas as outras `-1`, e as setas movem o foco por dentro.
 * É a razão de `tabIndex` ser calculado por índice em vez de fixo.
 *
 * ## Por que o foco é aplicado num efeito, e não no `onKeyDown`
 *
 * A tecla muda o `ativo` (estado); quem chama `.focus()` é o efeito que roda
 * depois do render. Chamar `.focus()` dentro do handler focaria o nó da
 * renderização ANTERIOR — que em grade que troca de mês é outro elemento, ou
 * nenhum.
 *
 * O efeito só age quando `moveuPorTeclado` está ligado: sem essa guarda, a
 * grade roubaria o foco na montagem e ao receber um `ativo` novo por clique,
 * arrancando o foco de onde o usuário estava.
 */

type UseSchedulerKeyboardParams = {
  /** Total de células navegáveis. */
  count: number;
  /** Quantas por linha — define o passo do ↑/↓. */
  columns: number;
  /**
   * Chamado no Enter/Space da célula ativa. É o "abrir/criar" da grade — o
   * componente decide o que isso significa (criar evento no dia, na hora…).
   */
  onActivate?: (index: number) => void;
  enabled?: boolean;
};

export function useSchedulerKeyboard({
  count,
  columns,
  onActivate,
  enabled = true,
}: UseSchedulerKeyboardParams) {
  const [ativo, setAtivo] = useState(0);
  const [moveuPorTeclado, setMoveuPorTeclado] = useState(false);
  const refs = useRef<(HTMLElement | null)[]>([]);

  /**
   * Se a grade encolher (mês com menos células, `dayRange` mais curto), o índice
   * ativo pode passar a apontar pra fora. Clampar aqui evita `tabIndex=0` em
   * ninguém — o que tornaria a grade inalcançável por `Tab`.
   */
  useEffect(() => {
    if (ativo > count - 1) setAtivo(Math.max(0, count - 1));
  }, [count, ativo]);

  useEffect(() => {
    if (!moveuPorTeclado) return;
    refs.current[ativo]?.focus();
    setMoveuPorTeclado(false);
  }, [ativo, moveuPorTeclado]);

  const registrarRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      refs.current[index] = el;
    },
    [],
  );

  const handleKeyDown = useCallback(
    (index: number) => (e: React.KeyboardEvent) => {
      if (!enabled) return;

      const irPara = (proximo: number) => {
        e.preventDefault();
        setAtivo(Math.min(count - 1, Math.max(0, proximo)));
        setMoveuPorTeclado(true);
      };

      switch (e.key) {
        case "ArrowRight":
          return irPara(index + 1);
        case "ArrowLeft":
          return irPara(index - 1);
        case "ArrowDown":
          return irPara(index + columns);
        case "ArrowUp":
          return irPara(index - columns);
        case "Home":
          // Início da LINHA, não da grade — é o que o padrão de grid define, e o
          // que o usuário espera num calendário (começo da semana).
          return irPara(index - (index % columns));
        case "End":
          return irPara(index - (index % columns) + (columns - 1));
        case "PageUp":
          return irPara(0);
        case "PageDown":
          return irPara(count - 1);
        case "Enter":
        case " ":
          e.preventDefault();
          onActivate?.(index);
          return;
        default:
          return;
      }
    },
    [enabled, count, columns, onActivate],
  );

  /**
   * Espalhe em cada célula. O `onFocus` sincroniza o `ativo` quando o foco chega
   * por clique ou por `Tab` de fora — sem ele, a primeira seta depois de um
   * clique saltaria a partir da célula errada.
   */
  const getCellProps = useCallback(
    (index: number) => ({
      ref: registrarRef(index),
      tabIndex: enabled && index === ativo ? 0 : -1,
      onKeyDown: handleKeyDown(index),
      onFocus: () => setAtivo(index),
    }),
    [registrarRef, enabled, ativo, handleKeyDown],
  );

  return { activeIndex: ativo, getCellProps };
}
