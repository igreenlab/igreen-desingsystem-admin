import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToolbarActions, type ToolbarAction } from "./toolbar-actions";
import { ToolbarFilterButton } from "./toolbar-filter-button";

/* Smoke do slot de ações custom do toolbar + botão de filtro padrão. */

describe("ToolbarActions (smoke)", () => {
  it("renderiza ação `button` e dispara onClick", () => {
    const onClick = vi.fn();
    const actions: ToolbarAction[] = [
      { kind: "button", id: "novo", label: "Novo", onClick },
    ];
    render(<ToolbarActions actions={actions} />);

    const btn = screen.getByText("Novo");
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renderiza `dropdown` (label) e `input` controlado", () => {
    const onChange = vi.fn();
    const actions: ToolbarAction[] = [
      {
        kind: "dropdown",
        id: "periodo",
        label: "Junho de 2026",
        items: [{ label: "Maio de 2026", onClick: () => {} }],
      },
      {
        kind: "input",
        id: "q",
        label: "Busca rápida",
        value: "",
        onChange,
        placeholder: "Filtro",
      },
    ];
    render(<ToolbarActions actions={actions} />);

    expect(screen.getByText("Junho de 2026")).toBeTruthy();

    const input = screen.getByPlaceholderText("Filtro");
    fireEvent.change(input, { target: { value: "abc" } });
    expect(onChange).toHaveBeenCalledWith("abc");
  });

  it("sem actions nem extraItems → não renderiza nada", () => {
    const { container } = render(<ToolbarActions actions={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("expõe o ⋯ mobile (trigger 'Mais ações')", () => {
    render(
      <ToolbarActions
        actions={[{ kind: "button", id: "a", label: "A", onClick: () => {} }]}
      />,
    );
    // O trigger do menu mobile existe sempre que há ações (mesmo escondido por CSS).
    expect(
      screen.getAllByRole("button", { name: "Mais ações" }).length,
    ).toBeGreaterThan(0);
  });
});

describe("ToolbarFilterButton (smoke)", () => {
  it("é icon-only com aria-label 'Filtros' e dispara onClick", () => {
    const onClick = vi.fn();
    render(<ToolbarFilterButton onClick={onClick} />);

    const btn = screen.getByRole("button", { name: "Filtros" });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
