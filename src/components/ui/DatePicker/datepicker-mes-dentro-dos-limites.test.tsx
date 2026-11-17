import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DatePicker } from "./datepicker";

/**
 * O mês de abertura é preso dentro de `minValue`/`maxValue`.
 *
 * O SOLIS-395 (PR #375) consertou um bug real: o calendário abria sempre no mês de HOJE,
 * então com o vencimento em outubro e hoje em novembro, clicar um dia sem navegar gravava
 * a data certa no mês errado. A correção — `defaultMonth` = a data marcada — resolveu isso.
 *
 * E gerou um segundo defeito, no caso em que a data marcada **contradiz os limites que o
 * próprio consumidor declarou**. Medido A/B, com limite `1–30/nov`:
 *
 *   | caso                          | ANTES do #375      | DEPOIS do #375     |
 *   |-------------------------------|--------------------|--------------------|
 *   | valor 10/nov · hoje nov       | novembro · 30 dias | novembro · 30 dias |
 *   | valor 10/nov · hoje dez       | dezembro ·  2 dias | novembro · 30 dias | ← o #375 melhorou
 *   | valor 15/jan · hoje nov       | novembro · 30 dias | janeiro  ·  0 dias | ← regressão
 *   | valor 15/jan · hoje dez       | dezembro ·  2 dias | janeiro  ·  0 dias | ← regressão
 *
 * Zero dia clicável é a tela que não tem saída: o usuário precisa navegar dois meses à mão
 * sem nada explicando por quê. O clamp abre no limite mais próximo.
 *
 * ⚠️ O clamp move a JANELA, nunca o VALOR. O dia marcado continua fora do alcance e
 * continua não-selecionável — é isso que mantém a validação honesta, e há caso cobrindo.
 */

const NOV_01 = new Date(2026, 10, 1);
const NOV_30 = new Date(2026, 10, 30);
const NOV_10 = new Date(2026, 10, 10);
const JAN_15 = new Date(2026, 0, 15);
const DEZ_20 = new Date(2026, 11, 20);

/** Hoje FORA da janela permitida, de propósito: separa "abriu no limite" de "abriu em hoje". */
const HOJE = new Date(2026, 11, 5); // 05/dez/2026

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

/** Rótulo do mês exibido — o react-day-picker escreve "novembro 2026" no aria-label do grid. */
const mesAberto = () =>
  document.querySelector('[role="grid"]')?.getAttribute("aria-label") ?? null;

/** Dias que o usuário consegue clicar na grade aberta. */
const diasClicaveis = () =>
  [...document.querySelectorAll<HTMLButtonElement>("table button")].filter(
    (b) => !b.disabled && b.getAttribute("aria-disabled") !== "true",
  ).length;

describe("DatePicker — o mês de abertura respeita minValue/maxValue", () => {
  it("valor ANTES do minValue: abre no mês do minValue, não no do valor", async () => {
    render(
      <DatePicker
        mode="single"
        value={JAN_15}
        onValueChange={() => {}}
        minValue={NOV_01}
        maxValue={NOV_30}
      />,
    );
    await abrir();

    expect(mesAberto()).toBe("novembro 2026");
    expect(diasClicaveis()).toBeGreaterThan(0);
  });

  it("valor DEPOIS do maxValue: abre no mês do maxValue", async () => {
    render(
      <DatePicker
        mode="single"
        value={DEZ_20}
        onValueChange={() => {}}
        minValue={NOV_01}
        maxValue={NOV_30}
      />,
    );
    await abrir();

    expect(mesAberto()).toBe("novembro 2026");
    expect(diasClicaveis()).toBeGreaterThan(0);
  });

  it("o clamp move a JANELA e não o valor: o dia marcado segue fora e não-clicável", async () => {
    render(
      <DatePicker
        mode="single"
        value={JAN_15}
        onValueChange={() => {}}
        minValue={NOV_01}
        maxValue={NOV_30}
      />,
    );
    await abrir();

    // A grade é a de novembro, então 15/jan nem aparece — e nenhum dia de janeiro é
    // alcançável sem navegar. O valor não foi reescrito para caber.
    expect(mesAberto()).toBe("novembro 2026");
    expect(screen.queryByLabelText(/15 de janeiro de 2026/)).toBeNull();
  });

  it("CAMINHO ANTIGO — valor DENTRO dos limites: nada muda, abre no mês do valor", async () => {
    render(
      <DatePicker
        mode="single"
        value={NOV_10}
        onValueChange={() => {}}
        minValue={NOV_01}
        maxValue={NOV_30}
      />,
    );
    await abrir();

    // Hoje é dezembro: se o clamp tivesse atrapalhado, ou se o #375 não valesse, o mês
    // aberto seria outro.
    expect(mesAberto()).toBe("novembro 2026");
  });

  it("CAMINHO ANTIGO — SEM limites: o valor manda, como o #375 definiu", async () => {
    render(<DatePicker mode="single" value={JAN_15} onValueChange={() => {}} />);
    await abrir();

    expect(mesAberto()).toBe("janeiro 2026");
  });

  it("CAMINHO ANTIGO — SEM valor: abre no mês de hoje", async () => {
    render(
      <DatePicker
        mode="single"
        value={undefined}
        onValueChange={() => {}}
        minValue={NOV_01}
        maxValue={NOV_30}
      />,
    );
    await abrir();

    // Dezembro é hoje. O clamp NÃO age sem data — seria mudar o comportamento de quem
    // abre o campo vazio, que é a maioria.
    expect(mesAberto()).toBe("dezembro 2026");
  });

  it("range: o clamp vale para o `from`", async () => {
    render(
      <DatePicker
        mode="range"
        value={{ from: JAN_15, to: undefined }}
        onValueChange={() => {}}
        minValue={NOV_01}
        maxValue={NOV_30}
        numberOfMonths={1}
      />,
    );
    await abrir();

    expect(mesAberto()).toBe("novembro 2026");
  });

  it("multiple: o clamp vale para a primeira data do array", async () => {
    render(
      <DatePicker
        mode="multiple"
        value={[JAN_15, NOV_10]}
        onValueChange={() => {}}
        minValue={NOV_01}
        maxValue={NOV_30}
      />,
    );
    await abrir();

    expect(mesAberto()).toBe("novembro 2026");
  });

  it("só minValue, sem maxValue: valor acima do mínimo não é mexido", async () => {
    render(
      <DatePicker
        mode="single"
        value={DEZ_20}
        onValueChange={() => {}}
        minValue={NOV_01}
      />,
    );
    await abrir();

    expect(mesAberto()).toBe("dezembro 2026");
  });

  it("só maxValue, sem minValue: valor abaixo do máximo não é mexido", async () => {
    render(
      <DatePicker
        mode="single"
        value={JAN_15}
        onValueChange={() => {}}
        maxValue={NOV_30}
      />,
    );
    await abrir();

    expect(mesAberto()).toBe("janeiro 2026");
  });
});
