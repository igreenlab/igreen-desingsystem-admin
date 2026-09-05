import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Gantt } from "./gantt";
import type { GanttLink, GanttRow } from "./gantt.types";

/**
 * Os três estados que a UI do próprio componente mexe — `view`, `granularity`
 * e `criticalPath` — seguem o MESMO par valor + callback.
 *
 * ## O defeito que estes testes reproduzem
 *
 * `view` sempre teve o par: `viewProp ?? viewLocal` e `onViewChange` disparando
 * nos dois casos. Os outros dois não. `granularity` resolvia igual
 * (`granProp ?? granLocal`) mas **não tinha callback**: passar
 * `granularity="week"` — que a doc do componente ensinava como valor INICIAL,
 * inclusive num exemplo copiável — deixava o dropdown de escala morto. O clique
 * chamava `setGranLocal`, a prop mascarava o resultado, e nada acontecia na
 * tela. Sem erro, sem aviso, `tsc` verde.
 *
 * `criticalPath` tinha o espelho do mesmo problema: a prop era só SEMENTE
 * (`useState(criticalProp)`), então mudá-la depois de montado não fazia nada —
 * enquanto o JSDoc do `criticalPathToggle` afirmava, ao lado, que "quem manda no
 * realce é `criticalPath`".
 *
 * ⚠️ Estes testes falham no código anterior à correção: o de escala porque
 * `onGranularityChange` não existia no tipo, e o de caminho crítico porque a
 * prop não vencia o estado local. É por isso que eles existem — gate escrito a
 * partir do mesmo modelo mental que gerou o código concorda por construção
 * (L-064).
 */

const D = (dia: number) => new Date(2026, 8, dia);

const ROWS: GanttRow[] = [
  { id: "a", label: "Alfa", bars: [{ id: "a1", start: D(1), end: D(5) }] },
  { id: "b", label: "Beta", bars: [{ id: "b1", start: D(6), end: D(9) }] },
];

const LINKS: GanttLink[] = [
  { id: "l1", source: "a1", target: "b1", type: "FS" },
];

/** O gatilho da escala mostra o rótulo da escala corrente. */
const gatilhoDaEscala = () =>
  screen.getByRole("button", { name: /dia|semana|mês|trimestre/i });

/**
 * Abre o dropdown e escolhe uma escala pelo rótulo.
 *
 * `userEvent` e não `fireEvent`: o Radix abre menu no `pointerdown`, e
 * `fireEvent.click` dispara só o `click` — o menu nunca abre, e o teste falharia
 * por defeito da plataforma de teste, não do componente.
 */
const escolherEscala = async (rotulo: RegExp) => {
  const user = userEvent.setup({ pointerEventsCheck: 0 });
  await user.click(gatilhoDaEscala());
  const menu = await screen.findByRole("menu");
  await user.click(within(menu).getByText(rotulo));
};

describe("Gantt — escala: valor + callback", () => {
  it("sem a prop, o dropdown muda a escala sozinho", async () => {
    render(<Gantt rows={ROWS} />);
    expect(gatilhoDaEscala().textContent).toMatch(/dia/i);

    await escolherEscala(/^mês$/i);
    expect(gatilhoDaEscala().textContent).toMatch(/mês/i);
  });

  it("com a prop, quem manda é ela — e o callback avisa da intenção", async () => {
    const aoMudar = vi.fn();
    const { rerender } = render(
      <Gantt rows={ROWS} granularity="week" onGranularityChange={aoMudar} />,
    );
    expect(gatilhoDaEscala().textContent).toMatch(/semana/i);

    await escolherEscala(/^mês$/i);

    // O componente NÃO se auto-aplica: a prop continua mandando.
    expect(aoMudar).toHaveBeenCalledWith("month");
    expect(gatilhoDaEscala().textContent).toMatch(/semana/i);

    // …e quando o consumidor aplica, a tela segue.
    rerender(
      <Gantt rows={ROWS} granularity="month" onGranularityChange={aoMudar} />,
    );
    expect(gatilhoDaEscala().textContent).toMatch(/mês/i);
  });
});

/**
 * `views` recorta o que EXISTE; `view` diz qual está aberta.
 *
 * Sem isto não havia como pedir "só o cronograma": as três visões eram fixas no
 * `VIEW_ITEMS` da toolbar, e a única saída do consumidor era passar `view` — que
 * escolhe a inicial e deixa o seletor lá, oferecendo as outras duas.
 */
describe("Gantt — `views` recorta o que existe", () => {
  const seletor = () => screen.queryByRole("radiogroup", { name: /visualiza/i });

  it("omitido, as três aparecem", () => {
    render(<Gantt rows={ROWS} />);
    expect(within(seletor()!).getAllByRole("radio")).toHaveLength(3);
  });

  it("com duas, só as duas — e o seletor continua", () => {
    render(<Gantt rows={ROWS} views={["timeline", "calendar"]} />);
    const opcoes = within(seletor()!).getAllByRole("radio");
    expect(opcoes.map((o) => o.getAttribute("aria-label"))).toEqual([
      "Cronograma",
      "Calendário",
    ]);
  });

  it("com UMA, o seletor não é renderizado — não há escolha a oferecer", () => {
    render(<Gantt rows={ROWS} views={["timeline"]} />);
    expect(seletor()).toBeNull();
  });

  it("`views` vence `view`: pedir a excluída abre a primeira permitida", () => {
    render(<Gantt rows={ROWS} view="list" views={["timeline"]} />);
    // A escala só existe na timeline — se abriu nela, o dropdown está lá.
    expect(gatilhoDaEscala()).toBeTruthy();
    expect(seletor()).toBeNull();
  });

  it("lista vazia é tratada como omitida — zero visões não renderiza nada", () => {
    render(<Gantt rows={ROWS} views={[]} />);
    expect(within(seletor()!).getAllByRole("radio")).toHaveLength(3);
  });
});

describe("Gantt — caminho crítico: valor + callback", () => {
  const alvo = () => screen.getByRole("button", { name: /crítico/i });

  it("sem a prop, o botão liga e desliga o realce sozinho", () => {
    render(<Gantt rows={ROWS} links={LINKS} criticalPathToggle />);
    expect(alvo().getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(alvo());
    expect(alvo().getAttribute("aria-pressed")).toBe("true");
  });

  it("com a prop, ela vence o clique — e o callback avisa", () => {
    const aoMudar = vi.fn();
    const { rerender } = render(
      <Gantt
        rows={ROWS}
        links={LINKS}
        criticalPathToggle
        criticalPath={false}
        onCriticalPathChange={aoMudar}
      />,
    );

    fireEvent.click(alvo());
    expect(aoMudar).toHaveBeenCalledWith(true);
    expect(alvo().getAttribute("aria-pressed")).toBe("false");

    rerender(
      <Gantt
        rows={ROWS}
        links={LINKS}
        criticalPathToggle
        criticalPath
        onCriticalPathChange={aoMudar}
      />,
    );
    expect(alvo().getAttribute("aria-pressed")).toBe("true");
  });

  it("a prop MUDANDO depois de montado muda o realce — era só semente antes", () => {
    const { rerender } = render(
      <Gantt rows={ROWS} links={LINKS} criticalPathToggle criticalPath={false} />,
    );
    expect(alvo().getAttribute("aria-pressed")).toBe("false");

    rerender(<Gantt rows={ROWS} links={LINKS} criticalPathToggle criticalPath />);
    expect(alvo().getAttribute("aria-pressed")).toBe("true");
  });
});
