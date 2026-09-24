import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Card, CardContent } from "./card";
import { ClickableSurface } from "./clickable-surface";

/**
 * Reportado pelo consumidor igreen-tickets: 19 superfícies (card de lote, pipeline,
 * ranking, nav de categoria) viraram `ClickableSurface`, e a **seleção ficou só
 * visual** — o alvo não carregava estado nenhum. Quem usa leitor de tela não sabia
 * qual card estava escolhido.
 *
 * O anel de foco também é externo (`ring`) e some em container com `overflow-hidden`;
 * sem `surfaceClassName` no Card não havia como alcançar o alvo pra trocar por
 * `ring-inset`.
 */
describe("ClickableSurface — estado ARIA", () => {
  it.each([
    ["aria-pressed", true, "true"],
    ["aria-current", "page", "page"],
    ["aria-expanded", false, "false"],
  ] as const)("repassa %s", (attr, valor, esperado) => {
    render(<ClickableSurface label="Abrir" onClick={() => {}} {...{ [attr]: valor }} />);
    expect(screen.getByRole("button").getAttribute(attr)).toBe(esperado);
  });

  it("disabled: no <button> é atributo; no <a> vira aria-disabled + fora do Tab", () => {
    const { rerender } = render(<ClickableSurface label="Abrir" onClick={() => {}} disabled />);
    expect(screen.getByRole("button")).toHaveProperty("disabled", true);

    rerender(<ClickableSurface label="Abrir" href="/x" disabled />);
    // `<a>` não tem `disabled` — a forma correta é aria-disabled + tirar do foco.
    const link = screen.getByRole("link");
    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(link.getAttribute("tabindex")).toBe("-1");
    expect(link.className).toContain("pointer-events-none");
  });
});

describe("Card — repassa estado e alcança o alvo", () => {
  it("aria-current chega no alvo, não no card", () => {
    const { container } = render(
      <Card onClick={() => {}} surfaceLabel="Abrir lote" aria-current="page">
        <CardContent>x</CardContent>
      </Card>,
    );
    expect(screen.getByRole("button").getAttribute("aria-current")).toBe("page");
    expect(container.firstElementChild!.getAttribute("aria-current")).toBeNull();
  });

  it("surfaceClassName vai pro alvo — o anel some em overflow-hidden sem ring-inset", () => {
    render(
      <Card onClick={() => {}} surfaceLabel="Abrir lote" surfaceClassName="ring-inset">
        <CardContent>x</CardContent>
      </Card>,
    );
    expect(screen.getByRole("button").className).toContain("ring-inset");
  });
});
