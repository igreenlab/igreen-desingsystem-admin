import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Table, TableBody } from "./table";
import { TableSpanRow } from "./table-span-row";

/**
 * O `Table` é um grid de `<div>`, não um `<table>` — não existe `colSpan` pra esticar
 * uma célula. Sem esta peça, "nenhum resultado" e "carregando" eram montados com uma
 * `TableRow` de uma célula só, que respeita a largura da PRIMEIRA coluna: o texto ficava
 * espremido num canto e o resto da linha vazio.
 */

const renderizar = (ui: React.ReactNode) =>
  render(
    <Table ariaLabel="t">
      <TableBody>{ui}</TableBody>
    </Table>,
  );

describe("TableSpanRow", () => {
  it("é uma linha com UMA célula de largura total", () => {
    renderizar(<TableSpanRow>Nenhum resultado</TableSpanRow>);
    const linha = screen.getByRole("row");
    const celulas = screen.getAllByRole("cell");
    expect(celulas).toHaveLength(1);
    expect(celulas[0].className).toContain("w-full");
    expect(linha.className).toContain("w-full");
  });

  it("o conteúdo é que gruda na rolagem, não a célula", () => {
    // A célula tem a largura TOTAL do grid, que pode ser muito maior que a tela;
    // grudá-la não adianta nada. Quem precisa acompanhar o scroll é o texto.
    renderizar(<TableSpanRow>Nenhum resultado</TableSpanRow>);
    const texto = screen.getByText("Nenhum resultado");
    expect(texto.className).toContain("sticky");
    expect(screen.getByRole("cell").className).not.toContain("sticky");
  });

  it("sticky={false} desliga", () => {
    renderizar(<TableSpanRow sticky={false}>Carregando…</TableSpanRow>);
    expect(screen.getByText("Carregando…").className).not.toContain("sticky");
  });

  it("height='auto' libera a altura de linha da densidade", () => {
    const { rerender } = renderizar(<TableSpanRow>x</TableSpanRow>);
    expect(screen.getByRole("row").className).toContain("min-h-");
    rerender(
      <Table ariaLabel="t">
        <TableBody>
          <TableSpanRow height="auto">x</TableSpanRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("row").className).not.toContain("min-h-");
  });
});
