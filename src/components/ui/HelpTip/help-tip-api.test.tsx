import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { HelpTip } from "./help-tip";

/**
 * O que estes casos protegem — a peça saiu de dentro do `Kpi` (Task 18 / item 30),
 * e a extração só vale se ela carregar junto o que fazia o botão do KPI funcionar:
 *
 * 1. Nome acessível próprio. Ícone sem nome é "botão" no leitor de tela.
 * 2. `type="button"` — dentro de um `<form>`, botão sem type submete.
 * 3. `relative z-10` — é o que mantém o alvo clicável acima do overlay do
 *    `ClickableSurface`; sem isso o botão existe e não clica, em silêncio.
 * 4. A dica abre e mostra o conteúdo.
 *
 * ⚠️ Sem jest-dom (`toBeInTheDocument` não compila aqui — o `vitest.setup.ts` está
 * fora do `include` do tsconfig). `toBeNull()` / `getAttribute()`, como em
 * `simple-filter-controlado.test.tsx`.
 */

/**
 * O conteúdo VISÍVEL da dica do Radix.
 *
 * ⚠️ `getByRole("tooltip")` NÃO serve: o `role="tooltip"` vive num `<span>`
 * sr-only que o Radix cria só para o `aria-describedby` — ele não tem `data-side`
 * nem as classes do `TooltipContent`. Medido: assertivas feitas sobre ele saem
 * `null` e parecem "a prop não chegou". O nó real é o filho do wrapper do popper.
 */
function dicaVisivel(): HTMLElement {
  const no = document.querySelector<HTMLElement>(
    "[data-radix-popper-content-wrapper] > *",
  );
  if (!no) throw new Error("a dica não abriu");
  return no;
}

describe("HelpTip", () => {
  it("o nome acessível é 'Ajuda sobre {about}'", () => {
    render(<HelpTip about="SLA">Percentual dentro do prazo.</HelpTip>);
    expect(screen.getByRole("button", { name: "Ajuda sobre SLA" })).toBeTruthy();
  });

  it("é type=button — dentro de um form, botão sem type submete", () => {
    render(<HelpTip about="CPF">Só números.</HelpTip>);
    const botao = screen.getByRole("button", { name: "Ajuda sobre CPF" });
    expect(botao.getAttribute("type")).toBe("button");
  });

  /**
   * O `ClickableSurface` estica um alvo `inset-0 z-0` sobre o card inteiro. Sem
   * `relative z-10` no botão, o overlay fica por cima e o clique na ajuda vira
   * drill-down — sem nenhum sinal visual de que está errado.
   */
  it("carrega relative z-10 — o par que o mantém acima do ClickableSurface", () => {
    render(<HelpTip about="SLA">x</HelpTip>);
    const classes = screen
      .getByRole("button", { name: "Ajuda sobre SLA" })
      .className.split(/\s+/);
    expect(classes).toContain("relative");
    expect(classes).toContain("z-10");
  });

  it("className do consumidor soma ao botão, não substitui", () => {
    render(
      <HelpTip about="SLA" className="ml-auto">
        x
      </HelpTip>,
    );
    const classes = screen
      .getByRole("button", { name: "Ajuda sobre SLA" })
      .className.split(/\s+/);
    expect(classes).toContain("ml-auto");
    expect(classes).toContain("rounded-radius-full");
  });

  it("abre a dica no hover e mostra o conteúdo", async () => {
    const user = userEvent.setup();
    render(<HelpTip about="SLA">Percentual dentro do prazo.</HelpTip>);

    expect(screen.queryByRole("tooltip")).toBeNull();
    await user.hover(screen.getByRole("button", { name: "Ajuda sobre SLA" }));
    // O Radix portaliza; `findAllByText` porque ele duplica o texto num nó sr-only.
    const achados = await screen.findAllByText("Percentual dentro do prazo.");
    expect(achados.length).toBeGreaterThan(0);
  });

  it("contentClassName vai pro CONTEÚDO da dica, não pro botão", async () => {
    const user = userEvent.setup();
    render(
      <HelpTip about="SLA" contentClassName="max-w-page-xs">
        Percentual dentro do prazo.
      </HelpTip>,
    );
    const botao = screen.getByRole("button", { name: "Ajuda sobre SLA" });
    expect(botao.className).not.toContain("max-w-page-xs");

    await user.hover(botao);
    await screen.findAllByText("Percentual dentro do prazo.");
    expect(dicaVisivel().className).toContain("max-w-page-xs");
  });

  it("side chega no conteúdo da dica", async () => {
    const user = userEvent.setup();
    render(
      <HelpTip about="SLA" side="right">
        Percentual dentro do prazo.
      </HelpTip>,
    );
    await user.hover(screen.getByRole("button", { name: "Ajuda sobre SLA" }));
    await screen.findAllByText("Percentual dentro do prazo.");
    expect(dicaVisivel().getAttribute("data-side")).toBe("right");
  });
});
