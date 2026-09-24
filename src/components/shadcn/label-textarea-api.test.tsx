import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Label } from "./label";
import { Textarea } from "./textarea";

/**
 * Duas props que existem pra tirar override do caminho do consumidor.
 *
 * O padrão que elas substituem é o mesmo nos dois casos: o componente cravava um valor
 * bom pro caso do meio, e todo caso de borda virava `className` na unha — inclusive na
 * nossa própria doc, que escrevia `font-normal` em duas linhas do CheckboxDoc.
 */

describe("Label — weight", () => {
  it("default é semibold (rótulo de CAMPO não fica mais leve por acidente)", () => {
    render(<Label data-testid="l">Nome</Label>);
    expect(screen.getByTestId("l").className).toContain("font-semibold");
  });

  it('weight="regular" para rótulo de OPÇÃO em grupo', () => {
    render(
      <Label weight="regular" data-testid="l">
        Ativo
      </Label>,
    );
    const cls = screen.getByTestId("l").className;
    expect(cls).toContain("font-normal");
    expect(cls).not.toContain("font-semibold");
  });
});

describe("Textarea — altura", () => {
  it("sem rows mantém o piso de 100px (não muda nada do que já existe)", () => {
    render(<Textarea data-testid="t" />);
    expect(screen.getByTestId("t").className).toContain("min-h-[100px]");
  });

  it("com rows o piso sai — senão rows={2} não diminui a altura", () => {
    render(<Textarea rows={2} data-testid="t" />);
    const el = screen.getByTestId("t");
    expect(el.className).not.toContain("min-h-[100px]");
    expect(el.getAttribute("rows")).toBe("2");
  });
});
