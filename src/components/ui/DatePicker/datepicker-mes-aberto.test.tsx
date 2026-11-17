import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import { DatePicker } from "./datepicker";

/**
 * SOLIS-395 — o calendário abre no mês da data MARCADA, não no mês de hoje.
 *
 * Antes nenhum modo passava `defaultMonth` ao Calendar, então ele abria sempre no mês
 * de hoje. No Sólis, com o vencimento em 10/10 e hoje em novembro, abrir o campo e
 * clicar no 22 sem navegar gravava 22/11 — a data certa no mês errado, sem aviso.
 *
 * O relógio é fixado em novembro/2026 e as datas de teste ficam em OUTROS meses
 * (outubro/2026 e janeiro/2027): se o calendário abrisse em "hoje", o mês lido e o dia
 * clicado seriam outros, e o teste cai. O mês é lido do `aria-label` do grid (o RDP
 * escreve "outubro 2026") e o dia é buscado pelo `data-day` ISO, único na grade.
 */
const HOJE = new Date(2026, 10, 17); // 17/nov/2026
const OUT_10 = new Date(2026, 9, 10);
const OUT_20 = new Date(2026, 9, 20);
const JAN_15 = new Date(2027, 0, 15);

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

beforeEach(() => {
  // shouldAdvanceTime: o userEvent agenda timers próprios e trava com relógio parado.
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(HOJE);
});
afterEach(() => {
  vi.useRealTimers();
});

const abrir = async () => {
  await userEvent.click(screen.getAllByRole("button")[0]);
};

/** Meses exibidos, na ordem da tela (o range mostra dois). */
const mesesAbertos = () =>
  screen.getAllByRole("grid").map((g) => (g.getAttribute("aria-label") ?? "").toLowerCase());

const clicarDia = async (d: Date, grid = 0) => {
  const cel = screen.getAllByRole("grid")[grid].querySelector(`[data-day="${iso(d)}"]`);
  if (!cel) throw new Error(`dia ${iso(d)} não está na grade ${grid}`);
  await userEvent.click((cel.querySelector("button") ?? cel) as Element);
};

describe("DatePicker — abre no mês da data marcada", () => {
  it("single: abre em outubro com o valor em 10/10 e hoje em novembro", async () => {
    render(<DatePicker value={OUT_10} />);
    await abrir();
    expect(mesesAbertos()).toEqual(["outubro 2026"]);
  });

  it("single: clicar o 22 sem navegar grava 22/10, e não 22/11 (o defeito do Sólis)", async () => {
    const aoMudar = vi.fn();
    render(<DatePicker value={OUT_10} onValueChange={aoMudar} />);
    await abrir();
    await clicarDia(new Date(2026, 9, 22));
    expect(aoMudar).toHaveBeenCalledTimes(1);
    expect(iso(aoMudar.mock.calls[0][0] as Date)).toBe("2026-10-22");
  });

  it("single: sem data abre no mês de hoje", async () => {
    render(<DatePicker />);
    await abrir();
    expect(mesesAbertos()).toEqual(["novembro 2026"]);
  });

  it("range: abre no mês de `from`, com o mês seguinte ao lado", async () => {
    render(<DatePicker mode="range" value={{ from: OUT_10, to: OUT_20 }} />);
    await abrir();
    expect(mesesAbertos()).toEqual(["outubro 2026", "novembro 2026"]);
  });

  it("range: só com `from` também abre no mês dele", async () => {
    render(<DatePicker mode="range" value={{ from: OUT_10, to: undefined }} />);
    await abrir();
    expect(mesesAbertos()[0]).toBe("outubro 2026");
  });

  it("range: sem data abre no mês de hoje", async () => {
    render(<DatePicker mode="range" />);
    await abrir();
    expect(mesesAbertos()).toEqual(["novembro 2026", "dezembro 2026"]);
  });

  it("multiple: abre no mês da primeira data", async () => {
    render(<DatePicker mode="multiple" value={[OUT_10, JAN_15]} />);
    await abrir();
    expect(mesesAbertos()).toEqual(["outubro 2026"]);
  });

  it("multiple: sem data abre no mês de hoje", async () => {
    render(<DatePicker mode="multiple" />);
    await abrir();
    expect(mesesAbertos()).toEqual(["novembro 2026"]);
  });
});

describe("DatePicker — reabrir depois de trocar a data", () => {
  // `defaultMonth` só vale na montagem do calendário. O que garante o mês certo a cada
  // abertura é o PopoverContent desmontar o conteúdo ao fechar; estes testes pegam o dia
  // em que isso deixar de ser verdade.
  function Single() {
    const [v, setV] = useState<Date | undefined>(OUT_10);
    return (
      <>
        <DatePicker value={v} onValueChange={setV} />
        <button type="button" onClick={() => setV(JAN_15)}>
          trocar para janeiro
        </button>
      </>
    );
  }

  function Range() {
    const [v, setV] = useState<DateRange | undefined>({ from: OUT_10, to: OUT_20 });
    return (
      <>
        <DatePicker mode="range" value={v} onValueChange={setV} />
        <button type="button" onClick={() => setV({ from: JAN_15, to: JAN_15 })}>
          trocar para janeiro
        </button>
      </>
    );
  }

  it("single: abre, fecha, troca a data e reabre no mês da data nova", async () => {
    render(<Single />);
    await abrir();
    expect(mesesAbertos()).toEqual(["outubro 2026"]);

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("grid")).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "trocar para janeiro" }));
    await abrir();
    expect(mesesAbertos()).toEqual(["janeiro 2027"]);
  });

  it("single: navegar para outro mês e fechar sem escolher não prende o mês navegado", async () => {
    render(<Single />);
    await abrir();
    await userEvent.click(screen.getByRole("button", { name: /next|próximo|seguinte/i }));
    expect(mesesAbertos()).toEqual(["novembro 2026"]);

    await userEvent.keyboard("{Escape}");
    await abrir();
    expect(mesesAbertos()).toEqual(["outubro 2026"]);
  });

  it("range: abre, fecha, troca o período e reabre no mês de `from` novo", async () => {
    render(<Range />);
    await abrir();
    expect(mesesAbertos()[0]).toBe("outubro 2026");

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("grid")).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "trocar para janeiro" }));
    await abrir();
    expect(mesesAbertos()).toEqual(["janeiro 2027", "fevereiro 2027"]);
  });
});
