import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { DatePicker } from "./datepicker";

/**
 * Dois achados do consumidor igreen-tickets (R.8), que por causa deles manteve os 4
 * filtros de período no date-range-picker local:
 *
 * 1. o calendário abria em INGLÊS enquanto o trigger formatava pt-BR;
 * 2. `min={1}` tornava impossível um período de UM DIA — clicar o mesmo dia duas vezes
 *    limpava a seleção.
 *
 * O `min` existia por um motivo real: sem ele o RDP completa o range no PRIMEIRO clique
 * e o popover fechava antes de escolher o fim. A troca foi mover o controle do
 * fechamento pro componente (fecha no 2º clique), o que destrava o dia único sem
 * reintroduzir o fechamento precoce. Os dois caminhos estão cobertos abaixo.
 */

const hoje = new Date();
const dia = (n: number) => new Date(hoje.getFullYear(), hoje.getMonth(), n);

function Range({ aoMudar }: { aoMudar?: (r: DateRange | undefined) => void }) {
  const [v, setV] = useState<DateRange | undefined>({ from: dia(15), to: dia(15) });
  return (
    <DatePicker
      mode="range"
      value={v}
      onValueChange={(r) => { setV(r); aoMudar?.(r); }}
      aria-label="Período"
    />
  );
}

const abrir = async () => {
  await userEvent.click(screen.getAllByRole("button")[0]);
};

/**
 * O range renderiza DOIS meses (numberOfMonths ?? 2), então o mesmo número aparece em
 * dois grids. Toda busca de dia é escopada no PRIMEIRO mês — sem isso o teste casa com
 * o dia do mês seguinte e falha por ambiguidade, não por defeito.
 */
const primeiroMes = () => screen.getAllByRole("grid")[0];

const clicarDia = async (n: number) => {
  const cel = [...primeiroMes().querySelectorAll("[role=gridcell]")].find(
    (c) => c.textContent?.trim() === String(n),
  );
  if (!cel) throw new Error("dia " + n + " nao encontrado no primeiro mes");
  await userEvent.click((cel.querySelector("button") ?? cel) as Element);
};

describe("DatePicker range — período de um dia", () => {
  it("dois cliques no MESMO dia dão from === to e fecham", async () => {
    const aoMudar = vi.fn();
    render(<Range aoMudar={aoMudar} />);
    await abrir();

    await clicarDia(10);
    // 1º clique não pode fechar — senão não dá pra escolher o fim
    expect(screen.queryAllByRole("grid").length).toBeGreaterThan(0);

    await clicarDia(10);
    const ultimo = aoMudar.mock.calls[aoMudar.mock.calls.length - 1]?.[0] as DateRange | undefined;
    expect(ultimo?.from?.getDate()).toBe(10);
    expect(ultimo?.to?.getDate()).toBe(10);
  });

  it("período normal continua funcionando: 1º clique abre, 2º fecha", async () => {
    const aoMudar = vi.fn();
    render(<Range aoMudar={aoMudar} />);
    await abrir();

    await clicarDia(10);
    expect(screen.queryAllByRole("grid").length).toBeGreaterThan(0);

    await clicarDia(20);
    const ultimo = aoMudar.mock.calls[aoMudar.mock.calls.length - 1]?.[0] as DateRange | undefined;
    expect(ultimo?.from?.getDate()).toBe(10);
    expect(ultimo?.to?.getDate()).toBe(20);
  });
});

describe("DatePicker — locale", () => {
  it("o calendário vem em pt-BR por default", async () => {
    render(<DatePicker value={dia(15)} aria-label="Data" />);
    await userEvent.click(screen.getAllByRole("button")[0]);
    const meses = /janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro/i;
    expect(document.body.textContent).toMatch(meses);
  });
});
