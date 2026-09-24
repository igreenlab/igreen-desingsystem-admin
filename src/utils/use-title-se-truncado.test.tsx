import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { useTitleSeTruncado } from "./use-title-se-truncado";

/**
 * O `title` do Kpi nasceu INCONDICIONAL — resolvia "ler o texto cortado" e criava
 * tooltip nativo em todo hover, inclusive onde o texto cabe. Numa grade de 8 KPIs isso
 * é ruído constante, e o consumidor não tem como desligar.
 *
 * jsdom não faz layout: `scrollWidth`/`clientWidth` são sempre 0, então o hook decide
 * "não cortado" — que é justamente o caso que este arquivo trava. O caminho "cortado"
 * é forçado por stub das duas propriedades, porque é a única forma de exercitá-lo aqui.
 */
function Alvo({ texto }: { texto: string }) {
  const { ref, title } = useTitleSeTruncado<HTMLSpanElement>(texto);
  return (
    <span ref={ref} data-testid="alvo" title={title}>
      {texto}
    </span>
  );
}

describe("useTitleSeTruncado", () => {
  it("SEM corte não põe title — é o caso comum, e era o ruído", () => {
    render(<Alvo texto="Abertos" />);
    expect(screen.getByTestId("alvo").hasAttribute("title")).toBe(false);
  });

  it("COM corte põe o title", () => {
    // jsdom não mede layout; forçamos overflow horizontal como o browser reportaria.
    const scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollWidth");
    const client = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", { configurable: true, value: 300 });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, value: 100 });

    render(<Alvo texto="Tempo médio de primeira resposta no turno" />);
    expect(screen.getByTestId("alvo").getAttribute("title")).toBe(
      "Tempo médio de primeira resposta no turno",
    );

    if (scroll) Object.defineProperty(HTMLElement.prototype, "scrollWidth", scroll);
    if (client) Object.defineProperty(HTMLElement.prototype, "clientWidth", client);
  });
});
