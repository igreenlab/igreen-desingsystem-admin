import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DatePicker } from "./datepicker";

/**
 * `minValue`/`maxValue` e `clearable` existem porque o DatePicker não oferecia limite
 * nem saída: "não deixar escolher data futura" virava validação DEPOIS do clique (o
 * usuário escolhia e só então via o erro), e desfazer a seleção não era possível.
 */

describe("DatePicker — limites", () => {
  /**
   * O calendário abre no mês de HOJE, não no da data selecionada (react-day-picker v9,
   * `getInitialMonth`: `month || defaultMonth || today`), e o DatePicker não expõe
   * `defaultMonth`/`today` — então a janela precisa ser montada sobre o mês que o
   * calendário de fato abre, e esse mês vinha do relógio do CI.
   *
   * Isso fazia o teste depender do dia em que rodava: a grade de alguns meses repete
   * número de dia. A de novembro/2026 termina em 5 de dezembro, então existiam dois
   * `gridcell` "5" e a query por texto estourava ("Found multiple elements"). Reprovava
   * `npm test`, e com ele o CI de todo PR, sem nenhuma mudança no código.
   *
   * Por isso o relógio é fixado — nos dois formatos de grade, para o teste não voltar a
   * depender de um deles. Só `Date` é falsificado: setTimeout/rAF seguem reais, que é o
   * que o userEvent e o Popover precisam.
   */
  const MESES = [
    // 1/nov é domingo e 30/nov é segunda: a grade fecha a semana em 5/dez → "5" repete.
    { nome: "novembro/2026 (grade repete o 5)", hoje: new Date(2026, 10, 15), celulasCom5: 2 },
    // 1/fev é domingo e o mês tem 28 dias: 4 semanas exatas, sem dia de fora.
    { nome: "fevereiro/2026 (grade não repete)", hoje: new Date(2026, 1, 15), celulasCom5: 1 },
  ];

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(MESES)(
    "dias fora do intervalo ficam desabilitados no calendário — $nome",
    async ({ hoje, celulasCom5 }) => {
      vi.setSystemTime(hoje);
      const dia = (n: number) => new Date(hoje.getFullYear(), hoje.getMonth(), n);
      render(<DatePicker value={dia(15)} minValue={dia(10)} maxValue={dia(20)} />);
      await userEvent.click(screen.getAllByRole("button")[0]);

      // Guarda do próprio caso: se a grade deixar de ter o formato descrito acima, este
      // teste deixa de exercitar o que o nome promete — melhor reprovar aqui, dizendo
      // por quê, do que passar sem cobrir a colisão.
      expect(screen.getAllByRole("gridcell", { name: "5" })).toHaveLength(celulasCom5);

      // O "5" de dezembro é dia de fora do mês exibido; a pergunta do teste é sobre o
      // dia 5 do mês em que o calendário abriu.
      const botaoDoMes = (n: string) => {
        const doMes = screen
          .getAllByRole("gridcell", { name: n })
          .filter((c) => !c.hasAttribute("data-outside"));
        expect(doMes).toHaveLength(1);
        return doMes[0].querySelector("button");
      };

      expect(botaoDoMes("5")?.hasAttribute("disabled")).toBe(true);
      expect(botaoDoMes("15")?.hasAttribute("disabled")).toBe(false);
    },
  );
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
