import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { Calendar } from "./calendar";

/**
 * "Hoje" e "selecionado" tinham a MESMA aparência: os dois saíam
 * `bg-bg-brand text-fg-on-brand`, discos verdes idênticos. O usuário via dois
 * dias pintados e não tinha como saber qual era qual — dois estados, uma pele.
 *
 * O DS já tinha resolvido isso **uma vez**, no mini-calendário do `Scheduler`
 * (`schedulerMiniDay`): *"`today` é o anel; `selected` é o preenchido"*, com o
 * anel sumindo quando os dois coincidem. O `Calendar` do shadcn não seguia essa
 * regra — era o DS discordando de si mesmo, e o `Calendar` é quem alimenta o
 * `DatePicker` e os filtros de data.
 *
 * Os testes travam os DOIS lados: o anel novo do "hoje" e o preenchido do
 * "selecionado", que não pode ter mudado.
 *
 * ⚠️ As classes do selecionado vivem no atributo `class` o tempo TODO, com o
 * prefixo `data-[selected-single=true]:` — procurar a substring `bg-bg-brand`
 * acusaria presença em qualquer dia. Por isso a comparação é por **token exato**
 * da lista de classes, nunca por `includes` na string inteira.
 */

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

const botaoDoDia = (d: Date) =>
  document.querySelector<HTMLButtonElement>(`td[data-day="${iso(d)}"] button`);

const classesDoDia = (d: Date) =>
  (botaoDoDia(d)?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);

const hoje = new Date();
/** Um dia do MESMO mês que não é hoje — serve de "selecionado" sem colidir. */
const outroDia = new Date(
  hoje.getFullYear(),
  hoje.getMonth(),
  hoje.getDate() === 1 ? 2 : 1,
);

describe("Calendar — 'hoje' não imita o 'selecionado'", () => {
  it("hoje não usa o preenchimento de marca", () => {
    render(<Calendar mode="single" defaultMonth={hoje} />);
    const classes = classesDoDia(hoje);

    expect(classes).not.toContain("bg-bg-brand");
    expect(classes).not.toContain("text-fg-on-brand");
  });

  it("hoje é o ANEL — a mesma distinção do mini-calendário do Scheduler", () => {
    render(<Calendar mode="single" defaultMonth={hoje} />);
    const classes = classesDoDia(hoje);

    expect(classes).toContain("ring-1");
    expect(classes).toContain("ring-border-brand");
  });

  it("caminho antigo: o dia SELECIONADO continua preenchido de marca", () => {
    render(
      <Calendar mode="single" defaultMonth={hoje} selected={outroDia} />,
    );
    const classes = classesDoDia(outroDia);

    expect(botaoDoDia(outroDia)?.getAttribute("data-selected-single")).toBe(
      "true",
    );
    expect(classes).toContain("data-[selected-single=true]:bg-bg-brand");
    expect(classes).toContain("data-[selected-single=true]:text-fg-on-brand");
    // e o anel de "hoje" não vaza pra um dia que não é hoje
    expect(classes).not.toContain("ring-border-brand");
  });

  it("quando hoje É o selecionado, o preenchido vence e o anel some", () => {
    render(<Calendar mode="single" defaultMonth={hoje} selected={hoje} />);
    const classes = classesDoDia(hoje);

    expect(botaoDoDia(hoje)?.getAttribute("data-selected-single")).toBe("true");
    expect(classes).not.toContain("ring-1");
    expect(classes).not.toContain("ring-border-brand");
  });

  it("dia comum não ganha anel nem preenchimento solto", () => {
    render(<Calendar mode="single" defaultMonth={hoje} />);
    const classes = classesDoDia(outroDia);

    expect(classes).not.toContain("ring-border-brand");
    expect(classes).not.toContain("bg-bg-brand");
  });
});
