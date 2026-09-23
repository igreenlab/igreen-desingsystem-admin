import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Kpi } from "./kpi";
import { KpiGroup } from "./kpi-group";

/**
 * O que estes casos protegem — todos vieram de uso real ao lado de uma sidebar:
 *
 * 1. O grid quebra pelo CONTAINER, não pela janela. Com `sm:`/`lg:`, oito KPIs num
 *    espaço de ~700px recebiam 6 colunas porque o VIEWPORT tinha 1280.
 * 2. Rótulo e valor não estouram o card (`line-clamp-2`, `truncate`, `min-w-0`).
 * 3. Drill-down existe sem quebrar a semântica do card.
 *
 * jsdom não avalia container query, então (1) é assertiva de CLASSE — a resposta em
 * pixel foi medida no browser (400px→1, 500px→2, 800px→4 colunas).
 */

describe("KpiGroup — responsividade por container", () => {
  it("o @container fica no WRAPPER, não no grid (elemento não consulta a si mesmo)", () => {
    const { container } = render(
      <KpiGroup columns={4}>
        <Kpi label="a" value="1" />
      </KpiGroup>,
    );
    const wrapper = container.firstElementChild!;
    const grid = wrapper.firstElementChild!;
    expect(wrapper.className).toContain("@container");
    expect(grid.className).not.toContain("@container");
    expect(grid.className).toContain("@md:grid-cols-2");
  });

  it("nenhum breakpoint de VIEWPORT sobrou no grid", () => {
    const { container } = render(
      <KpiGroup columns={6}>
        <Kpi label="a" value="1" />
      </KpiGroup>,
    );
    const grid = container.firstElementChild!.firstElementChild!;
    expect(grid.className).not.toMatch(/(?<!@)\b(sm|md|lg|xl):grid-cols-/);
  });

  it("teto de 4 por linha até o container ficar largo", () => {
    const { container } = render(
      <KpiGroup columns={8}>
        <Kpi label="a" value="1" />
      </KpiGroup>,
    );
    const cls = container.firstElementChild!.firstElementChild!.className;
    expect(cls).toContain("@3xl:grid-cols-4");
    expect(cls).toContain("@5xl:grid-cols-8");
  });
});

describe("Kpi — à prova de estouro", () => {
  it("rótulo tem line-clamp e valor tem truncate", () => {
    render(<Kpi label="Tempo médio de primeira resposta no turno" value="1.234.567" />);
    expect(screen.getByRole("heading").className).toContain("line-clamp-2");
    expect(screen.getByText("1.234.567").className).toContain("truncate");
  });
});

describe("Kpi — drill-down", () => {
  it("sem onClick/href não há alvo clicável", () => {
    render(<Kpi label="Abertos" value="12" />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("onClick vira <button> esticado, com o label como nome acessível", async () => {
    const aoClicar = vi.fn();
    render(<Kpi label="Abertos" value="12" onClick={aoClicar} />);
    const alvo = screen.getByRole("button", { name: "Abertos" });
    expect(alvo.className).toContain("absolute");
    await userEvent.click(alvo);
    expect(aoClicar).toHaveBeenCalledTimes(1);
  });

  it("href vira <a> — ctrl+clique e 'abrir em nova aba' continuam existindo", () => {
    render(<Kpi label="Abertos" value="12" href="/tickets?status=open" />);
    const alvo = screen.getByRole("link", { name: "Abertos" });
    expect(alvo.getAttribute("href")).toBe("/tickets?status=open");
  });

  it("a raiz continua <article> — <h3> dentro de <button> seria HTML inválido", () => {
    const { container } = render(<Kpi label="Abertos" value="12" onClick={() => {}} />);
    expect(container.firstElementChild!.tagName).toBe("ARTICLE");
    expect(screen.getByRole("heading", { name: "Abertos" })).toBeTruthy();
  });

  it("renderLink substitui o <a> interno (L-068)", () => {
    render(
      <Kpi
        label="Abertos"
        value="12"
        href="/tickets"
        renderLink={(p) => <a {...p} data-router="sim" />}
      />,
    );
    expect(screen.getByRole("link", { name: "Abertos" }).getAttribute("data-router")).toBe("sim");
  });
});

describe("Kpi — helperText", () => {
  it("vira botão de ajuda ao lado do rótulo", () => {
    render(<Kpi label="SLA" value="98%" helperText="Percentual dentro do prazo." />);
    expect(screen.getByRole("button", { name: "Ajuda sobre SLA" })).toBeTruthy();
  });

  it("sem helperText não renderiza o botão", () => {
    render(<Kpi label="SLA" value="98%" />);
    expect(screen.queryByRole("button", { name: /Ajuda sobre/ })).toBeNull();
  });
});
