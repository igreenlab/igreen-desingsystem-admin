import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DatePicker } from "./datepicker";

/**
 * `minValue`/`maxValue` e `clearable` existem porque o DatePicker não oferecia limite
 * nem saída: "não deixar escolher data futura" virava validação DEPOIS do clique (o
 * usuário escolhia e só então via o erro), e desfazer a seleção não era possível.
 */

describe("DatePicker — limites", () => {
  it("dias fora do intervalo ficam desabilitados no calendário", async () => {
    // Janela dentro do MÊS CORRENTE de propósito: o calendário abre no mês da data
    // selecionada, e uma janela em mês fixo fazia o teste ler células de outro mês —
    // "5" e "15" existem em todo mês (a primeira versão deste teste caiu nisso).
    const hoje = new Date();
    const dia = (n: number) => new Date(hoje.getFullYear(), hoje.getMonth(), n);
    render(<DatePicker value={dia(15)} minValue={dia(10)} maxValue={dia(20)} />,);
    await userEvent.click(screen.getAllByRole("button")[0]);

    const diaFora = screen.getByRole("gridcell", { name: "5" }).querySelector("button");
    const diaDentro = screen.getByRole("gridcell", { name: "15" }).querySelector("button");
    expect(diaFora?.hasAttribute("disabled")).toBe(true);
    expect(diaDentro?.hasAttribute("disabled")).toBe(false);
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
