import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

/**
 * O calendário abre no mês de HOJE, não no mês de `value` — medido: o DatePicker não
 * expõe `month`/`defaultMonth`, então o react-day-picker cai no `today`. Sem fixar o
 * relógio, os dias clicados saem de um mês diferente a cada execução e a grade muda de
 * formato junto.
 *
 * É a mesma raiz que quebrou o `datepicker-limits.test.tsx` em novembro/2026 (dois
 * gridcell com o texto "5", "Found multiple elements", `npm test` e a CI reprovados
 * o mês inteiro). Aqui nunca chegou a cobrar porque 10/15/20 estão fora do
 * alcance dos dias de fora — que vão até ~6 no fim da grade e começam em ~23 no início.
 * Era risco latente, não defeito; fechado junto.
 *
 * Maio/2026 é escolhido de propósito por ser o caso HOSTIL: o grid do mês tem 42
 * células, com dias de fora nos DOIS lados (26/abr a 6/jun).
 */
const HOJE = new Date(2026, 4, 3);
const dia = (n: number) => new Date(HOJE.getFullYear(), HOJE.getMonth(), n);

beforeEach(() => {
  // shouldAdvanceTime: o userEvent agenda timers próprios e trava com relógio parado.
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(HOJE);
});
afterEach(() => {
  vi.useRealTimers();
});

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
 * Duas ambiguidades diferentes na tela do range, cada uma com a sua defesa:
 *
 * 1. o range renderiza DOIS meses (`numberOfMonths ?? 2`), então o mesmo NÚMERO aparece
 *    nos dois grids → toda busca é escopada no PRIMEIRO mês;
 * 2. dentro de um grid, os dias de fora repetem número → a célula é buscada pelo
 *    `data-day` (ISO) que o RDP põe nela, nunca pelo texto.
 *
 * O escopo no primeiro grid continua necessário MESMO com `data-day`, porque os dois
 * grids se sobrepõem nas bordas: medido em maio/2026, o primeiro termina em 2026-06-06
 * e o segundo começa em 2026-05-31. Nem o ISO é único na tela inteira.
 */
const primeiroMes = () => screen.getAllByRole("grid")[0];

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const clicarDia = async (n: number) => {
  const cel = primeiroMes().querySelector(`[data-day="${iso(dia(n))}"]`);
  if (!cel) throw new Error(`dia ${iso(dia(n))} nao encontrado no primeiro mes`);
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
