import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DatePicker } from "./datepicker";

/**
 * `minValue`/`maxValue` e `clearable` existem porque o DatePicker não oferecia limite
 * nem saída: "não deixar escolher data futura" virava validação DEPOIS do clique (o
 * usuário escolhia e só então via o erro), e desfazer a seleção não era possível.
 */

/**
 * O calendário abre no mês de HOJE, não no mês de `value` — medido: o DatePicker não
 * expõe `month`/`defaultMonth`, então o react-day-picker cai no `today`. Era por isso
 * que a versão anterior montava a janela com `new Date()`: sem fixar a data não havia
 * como saber que mês ia abrir.
 *
 * O preço era depender do calendário real, e ele cobrou em 2026-11: a grade de
 * novembro/2026 termina com 1–5 de dezembro como dias de fora, então passaram a
 * existir DOIS gridcell com o texto "5" e a busca por texto quebrou com "Found
 * multiple elements" — reprovando `npm test` e, com ele, a CI (`ci.yml`) e o
 * `npm run pronto`, o mês inteiro. (O `release:check` sozinho NÃO roda teste: são os
 * 7 gates de distribuição. Quem junta os dois é o `pronto`. Esta frase já afirmou o
 * contrário — L-060.) Não era defeito do componente nem azar raro: medido de 2024 a
 * 2034, a grade repete o "5" em 38 dos 132 meses — ~1 a cada 3,5.
 *
 * Duas mudanças fecham isso:
 *  - `vi.setSystemTime` fixa o mês que abre, em vez de herdar o relógio da máquina;
 *  - o dia é buscado pelo `data-day` (ISO) que o RDP põe em cada célula, que é único
 *    na grade inclusive entre meses vizinhos — texto "5" não é.
 *
 * O `describe.each` roda nos dois formatos de grade de propósito: o mês que repete o
 * número (o caso que quebrou) e o que não repete.
 */
const MESES = [
  { rotulo: "novembro/2026 — a grade fecha em 5/dez, o 5 aparece duas vezes", hoje: new Date(2026, 10, 3) },
  { rotulo: "março/2026 — a grade fecha em 4/abr, o 5 aparece uma vez", hoje: new Date(2026, 2, 3) },
];

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const botaoDoDia = (d: Date) => {
  const cel = screen.getByRole("grid").querySelector(`[data-day="${iso(d)}"]`);
  if (!cel) throw new Error(`dia ${iso(d)} não está na grade aberta`);
  return cel.querySelector("button") as HTMLButtonElement;
};

describe.each(MESES)("DatePicker — limites ($rotulo)", ({ hoje }) => {
  beforeEach(() => {
    // shouldAdvanceTime: o userEvent agenda timers próprios e trava com relógio parado.
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(hoje);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("dias fora do intervalo ficam desabilitados no calendário", async () => {
    const dia = (n: number) => new Date(hoje.getFullYear(), hoje.getMonth(), n);
    render(<DatePicker value={dia(15)} minValue={dia(10)} maxValue={dia(20)} />);
    await userEvent.click(screen.getAllByRole("button")[0]);

    expect(botaoDoDia(dia(5)).hasAttribute("disabled")).toBe(true);
    expect(botaoDoDia(dia(15)).hasAttribute("disabled")).toBe(false);
  });
});

describe("DatePicker — clearable", () => {
  it("sem clearable não há botão de limpar", () => {
    render(<DatePicker value={new Date(2026, 2, 15)} />);
    expect(screen.queryByRole("button", { name: "Limpar data" })).toBeNull();
  });

  it("só aparece quando há valor", () => {
    const { rerender } = render(<DatePicker clearable />);
    expect(screen.queryByRole("button", { name: "Limpar data" })).toBeNull();
    rerender(<DatePicker clearable value={new Date(2026, 2, 15)} />);
    expect(screen.getByRole("button", { name: "Limpar data" })).toBeTruthy();
  });

  it("limpar emite undefined e NÃO abre o calendário", async () => {
    const aoMudar = vi.fn();
    render(<DatePicker clearable value={new Date(2026, 2, 15)} onValueChange={aoMudar} />);
    await userEvent.click(screen.getByRole("button", { name: "Limpar data" }));
    expect(aoMudar).toHaveBeenCalledWith(undefined);
    // o × vive DENTRO do trigger do popover: sem stopPropagation, limpar abriria o mês
    expect(screen.queryByRole("grid")).toBeNull();
  });

  it("o × não é <button> — button dentro de button é HTML inválido", () => {
    const { container } = render(<DatePicker clearable value={new Date(2026, 2, 15)} />);
    const limpar = screen.getByRole("button", { name: "Limpar data" });
    expect(limpar.tagName).toBe("SPAN");
    expect(container.querySelectorAll("button button")).toHaveLength(0);
  });
});
