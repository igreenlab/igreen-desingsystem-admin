import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { PageHeader } from "./page-header";

/**
 * `titleWrap` e `descriptionLines` foram acrescentados porque o consumidor não tinha
 * como soltar o título nem dar altura à descrição. O que este arquivo trava é que as
 * props novas NÃO mudaram o default: a primeira versão delas vinha com
 * `titleWrap: false`, o que teria truncado todo título longo já existente — mudança que
 * ninguém pediu, dentro de um PR que já carrega uma quebra deliberada.
 */

describe("PageHeader — o default é o comportamento de sempre", () => {
  it("título quebra, não trunca", () => {
    render(<PageHeader title="Relatório de atendimento por operador e turno" />);
    const titulo = screen.getByRole("heading", { level: 1 });
    expect(titulo.className).not.toContain("truncate");
  });

  it("descrição em uma linha com reticências — as classes ORIGINAIS", () => {
    // Não é `line-clamp-1`: ele troca o `display` pra `-webkit-box`, e trocar o display
    // de um filho de flex por uma equivalência "visualmente igual" só aparece numa tela
    // específica.
    render(<PageHeader title="t" description="Uma descrição bem longa que não cabe." />);
    const d = screen.getByText(/Uma descrição/);
    expect(d.className).toContain("whitespace-nowrap");
    expect(d.className).toContain("text-ellipsis");
    expect(d.className).not.toContain("line-clamp");
  });
});

describe("PageHeader — o que as props novas destravam", () => {
  it("titleWrap={false} trunca em uma linha", () => {
    render(<PageHeader title="Título longo" titleWrap={false} />);
    expect(screen.getByRole("heading", { level: 1 }).className).toContain("truncate");
  });

  it.each([2, 3] as const)("descriptionLines={%i} dá altura à descrição", (n) => {
    render(<PageHeader title="t" description="Descrição." descriptionLines={n} />);
    const d = screen.getByText("Descrição.");
    expect(d.className).toContain(`line-clamp-${n}`);
    expect(d.className).not.toContain("whitespace-nowrap");
  });
});
