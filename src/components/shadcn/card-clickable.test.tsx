import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Card, CardHeader, CardTitle, CardContent } from "./card";

/**
 * O pedido era "card inteiro como botão ou link, com foco, hover e teclado". O que o
 * consumidor escrevia era `<div onClick>`: sem foco, sem Enter/Space, sem papel de
 * controle — invisível pra quem navega por teclado e pra leitor de tela.
 *
 * O que estes casos travam é que a solução NÃO seja trocar a raiz por `<button>`:
 * o conteúdo de button é phrasing content, e o `<h3>` do CardTitle some da árvore
 * de headings se ficar lá dentro.
 */

const cardComTitulo = (props: Record<string, unknown> = {}) => (
  <Card {...props}>
    <CardHeader>
      <CardTitle>Lote 42</CardTitle>
    </CardHeader>
    <CardContent>120 unidades</CardContent>
  </Card>
);

describe("Card clicável", () => {
  it("sem onClick/href continua uma div, sem alvo nenhum", () => {
    const { container } = render(cardComTitulo());
    expect(container.firstElementChild!.tagName).toBe("DIV");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("onClick cria <button> esticado com o surfaceLabel como nome", async () => {
    const aoClicar = vi.fn();
    render(cardComTitulo({ onClick: aoClicar, surfaceLabel: "Abrir lote 42" }));
    const alvo = screen.getByRole("button", { name: "Abrir lote 42" });
    expect(alvo.className).toContain("absolute");
    await userEvent.click(alvo);
    expect(aoClicar).toHaveBeenCalledTimes(1);
  });

  it("o conteúdo do card fica FORA do button — e o nome do alvo não engole o card", () => {
    render(cardComTitulo({ onClick: () => {}, surfaceLabel: "Abrir lote 42" }));
    const alvo = screen.getByRole("button", { name: "Abrir lote 42" });
    // O alvo é vazio: se o conteúdo estivesse dentro dele, o nome acessível viraria
    // "Lote 42 120 unidades" e a estrutura do card sumiria pro leitor de tela.
    expect(alvo.textContent).toBe("");
    expect(screen.getByText("Lote 42").closest("button")).toBeNull();
    expect(screen.getByText("120 unidades").closest("button")).toBeNull();
  });

  it("href vira <a> navegável", () => {
    render(cardComTitulo({ href: "/lotes/42", surfaceLabel: "Abrir lote 42" }));
    expect(screen.getByRole("link", { name: "Abrir lote 42" }).getAttribute("href")).toBe(
      "/lotes/42",
    );
  });

  it("é alcançável por teclado (o que o <div onClick> não era)", async () => {
    const aoClicar = vi.fn();
    render(cardComTitulo({ onClick: aoClicar, surfaceLabel: "Abrir lote 42" }));
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Abrir lote 42" })).toBe(
      document.activeElement,
    );
    await userEvent.keyboard("{Enter}");
    expect(aoClicar).toHaveBeenCalled();
  });

  it("renderLink substitui o <a> interno (L-068)", () => {
    render(
      cardComTitulo({
        href: "/lotes/42",
        surfaceLabel: "Abrir lote 42",
        renderLink: (p: Record<string, unknown>) => <a {...p} data-router="sim" />,
      }),
    );
    expect(
      screen.getByRole("link", { name: "Abrir lote 42" }).getAttribute("data-router"),
    ).toBe("sim");
  });
});
