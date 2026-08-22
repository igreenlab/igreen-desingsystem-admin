import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { useRef } from "react";
import { useGrabToScroll } from "./use-grab-to-scroll";

/**
 * `cursor: grab` prometia um gesto que não existia.
 *
 * O `grabToScroll` virou default `true` na v0.26.0, e desde então o hook aplicava a mãozinha
 * **sem condição**. A checagem de overflow existia só dentro do `pointerdown` — ou seja: o
 * cursor convidava a arrastar, o usuário arrastava, e nada acontecia. Em toda tabela que
 * cabia na tela (a maioria) a affordance estava mentindo, e affordance que mente é pior que
 * affordance ausente: ela ensina um gesto errado.
 *
 * Relatado por um consumidor em 2026-08-21, em tabela sem row-click e sem scroll.
 *
 * ⚠️ jsdom não faz layout: `scrollWidth` e `clientWidth` são 0 por padrão, então
 * `0 > 0 === false` faria o teste passar por vacuidade. As métricas são definidas à mão em
 * cada caso — é o que torna o teste sobre a REGRA, e não sobre o jsdom.
 */

function montar() {
  function Sonda() {
    const ref = useRef<HTMLDivElement>(null);
    useGrabToScroll(ref, true);
    return (
      <div ref={ref} data-testid="scroller">
        <table>
          <tbody>
            <tr>
              <td>x</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  return render(<Sonda />);
}

/** jsdom não calcula layout — a medida vem daqui. */
function medir(el: HTMLElement, scrollWidth: number, clientWidth: number) {
  Object.defineProperty(el, "scrollWidth", { value: scrollWidth, configurable: true });
  Object.defineProperty(el, "clientWidth", { value: clientWidth, configurable: true });
}

let observados: Element[] = [];
let disparar: (() => void) | null = null;

beforeEach(() => {
  observados = [];
  disparar = null;
  // ResizeObserver não existe em jsdom. O stub guarda o callback pra podermos simular a
  // mudança de largura (resize de coluna, troca de view) sem layout de verdade.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(cb: () => void) {
        disparar = cb;
      }
      observe(el: Element) {
        observados.push(el);
      }
      disconnect() {}
      unobserve() {}
    },
  );
});

describe("grab-to-scroll — o cursor só promete o que existe", () => {
  it("SEM overflow: nada de mãozinha (era o defeito)", () => {
    const { getByTestId, rerender } = montar();
    const el = getByTestId("scroller");
    medir(el, 500, 500); // conteúdo cabe
    disparar?.();
    expect(el.style.cursor, "tabela que cabe na tela não deve convidar ao arrasto").toBe("");
    rerender(<div />);
  });

  it("COM overflow: mãozinha aparece", () => {
    const { getByTestId } = montar();
    const el = getByTestId("scroller");
    medir(el, 1200, 500);
    disparar?.();
    expect(el.style.cursor).toBe("grab");
  });

  it("passa a caber depois (coluna encolheu / view trocou) → a mãozinha SAI", () => {
    const { getByTestId } = montar();
    const el = getByTestId("scroller");
    medir(el, 1200, 500);
    disparar?.();
    expect(el.style.cursor).toBe("grab");

    medir(el, 480, 500); // agora cabe
    disparar?.();
    expect(el.style.cursor, "o observer existe justamente pra este caso").toBe("");
  });

  it("passa a NÃO caber depois (coluna cresceu) → a mãozinha entra", () => {
    const { getByTestId } = montar();
    const el = getByTestId("scroller");
    medir(el, 400, 500);
    disparar?.();
    expect(el.style.cursor).toBe("");

    medir(el, 1400, 500);
    disparar?.();
    expect(el.style.cursor).toBe("grab");
  });

  it("observa o scroller E o conteúdo — largura muda dos dois lados", () => {
    montar();
    // `window.resize` não pegaria o conteúdo crescendo por dentro (autoFit, resize de
    // coluna, dados novos). Daí observar os dois.
    expect(observados.length).toBe(2);
  });

  it("desabilitado: não toca no cursor de jeito nenhum", () => {
    function Off() {
      const ref = useRef<HTMLDivElement>(null);
      useGrabToScroll(ref, false);
      return <div ref={ref} data-testid="off" />;
    }
    const { getByTestId } = render(<Off />);
    const el = getByTestId("off");
    medir(el, 1200, 500);
    expect(el.style.cursor).toBe("");
  });
});
