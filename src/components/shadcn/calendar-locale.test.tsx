import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { enUS } from "date-fns/locale";

import { Calendar } from "./calendar";

/**
 * O `Calendar` nunca recebeu `locale` — o `DatePicker` ganhou o seu (pt-BR) e os outros
 * consumidores ficaram de fora: os filtros de data do `DataTable` (`date-column-type` e
 * `datetime-column-type`) abriam o calendário em INGLÊS dentro de uma tela em português.
 *
 * A correção mora no componente, não nos call-sites: passar `locale` em cada um deixaria
 * o próximo call-site esquecer — foi assim que o sexto saiu em inglês.
 *
 * Os dois testes travam os dois lados: o default novo, e o caminho antigo (quem já passa
 * `locale` explícito continua vencendo).
 */

const mes = new Date(2026, 5, 15);

/** Cabeçalhos de dia da semana, na ordem em que a grade os desenha. */
const diasDaSemana = () =>
  [...document.querySelectorAll("th[scope=col]")].map((c) => c.textContent?.trim());

describe("Calendar — locale", () => {
  it("sem prop, os dias da semana saem em pt-BR", () => {
    render(<Calendar mode="single" defaultMonth={mes} />);
    const dias = diasDaSemana();
    expect(dias).toContain("dom");
    expect(dias).not.toContain("Su");
  });

  it("sem prop, o nome do mês também sai em pt-BR", () => {
    render(<Calendar mode="single" defaultMonth={mes} />);
    expect(document.body.textContent).toMatch(/junho/i);
    expect(document.body.textContent).not.toMatch(/june/i);
  });

  it("locale explicito ainda vence o default", () => {
    render(<Calendar mode="single" defaultMonth={mes} locale={enUS} />);
    const dias = diasDaSemana();
    expect(dias).toContain("Su");
    expect(dias).not.toContain("dom");
    expect(document.body.textContent).toMatch(/june/i);
  });
});
