import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { ToolbarApplied } from "./parts/toolbar-applied";
import type { AppliedFilter } from "./table-toolbar.types";

/**
 * O chip COM valor e o chip VAZIO (placeholder de `showEmptyFilterChips`) eram
 * o mesmo pixel: mesma borda tracejada, mesma superfície. A única diferença era
 * o conteúdo — e o ícone (`+` no vazio, `X` no preenchido), que é 14px.
 *
 * Agora a borda e o fundo carregam o estado: tracejado neutro = slot a
 * preencher; sólido de marca sobre `bg-brand-subtle` = filtro aplicado, com o
 * valor em `text-fg-brand`.
 *
 * ⚠️ O default do chip (`active`) é derivado de `isEmpty`, não de uma prop nova
 * do consumidor — senão o `DataList` e o `DataTable`, que renderizam ESTE mesmo
 * componente, precisariam cada um passar a sua.
 *
 * ⚠️ Classe condicional de `tv()` sai na lista de classes, então a comparação é
 * por **token exato**, nunca por `includes` na string (um `includes("bg-bg-brand")`
 * casaria dentro de `bg-bg-brand-subtle` e aprovaria o chip errado).
 */

const chip = (over: Partial<AppliedFilter> = {}): AppliedFilter => ({
  id: "status",
  columnLabel: "Status",
  op: "isAnyOf",
  value: "Ativo",
  ...over,
});

const classesDoChip = (i = 0) => {
  const spans = [...document.querySelectorAll("span")].filter((s) =>
    (s.getAttribute("class") ?? "").includes("rounded-radius-lg"),
  );
  return (spans[i]?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
};

/** A tag do valor — a pílula interna com o conteúdo formatado. */
const classesDoValor = () => {
  const el = [...document.querySelectorAll("span")].find(
    (s) => s.textContent === "Ativo" && (s.getAttribute("class") ?? "").includes("rounded-radius-sm"),
  );
  return (el?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
};

describe("ToolbarApplied — o chip aplicado se distingue do vazio", () => {
  it("chip COM valor usa borda sólida de marca sobre bg-brand-subtle", () => {
    render(<ToolbarApplied filters={[chip()]} onRemove={() => {}} />);
    const classes = classesDoChip();

    expect(classes).toContain("border-solid");
    expect(classes).toContain("border-border-brand");
    expect(classes).toContain("bg-bg-brand-subtle");
    expect(classes).not.toContain("border-dashed");
  });

  it("o valor do chip aplicado lê em text-fg-brand no claro", () => {
    render(<ToolbarApplied filters={[chip()]} onRemove={() => {}} />);
    const classes = classesDoValor();
    expect(classes).toContain("text-fg-brand");
    expect(classes).not.toContain("text-fg-default");
  });

  it("no ESCURO o valor volta ao neutro — medido, o verde reprova o AA lá", () => {
    // `brandContrast` sobre superfície escura dá 4,36:1 (AA de texto pede 4,5).
    // No escuro quem carrega o estado é a borda do chip: 7,99:1 contra a barra,
    // onde o chip vazio mede 1,24. Mesma saída do `bulkBarCount`.
    render(<ToolbarApplied filters={[chip()]} onRemove={() => {}} />);
    expect(classesDoValor()).toContain("dark:text-fg-default");
  });

  it("o FUNDO da pílula do valor não é tingido — o verde precisa de neutro atrás", () => {
    // Medido: pílula em `bg-brand-subtle-hover` derrubava o texto pra 3,14:1 no
    // claro (AA de texto pede 4,5). A cor de marca mora na borda e no fundo do
    // CHIP; embaixo do texto fica o neutro de sempre.
    render(<ToolbarApplied filters={[chip()]} onRemove={() => {}} />);
    const classes = classesDoValor();
    expect(classes).toContain("bg-bg-muted");
    expect(classes).not.toContain("bg-bg-brand-subtle-hover");
  });

  it("caminho antigo: chip VAZIO continua tracejado e neutro", () => {
    render(
      <ToolbarApplied
        filters={[chip({ isEmpty: true, value: [] })]}
        onRemove={() => {}}
      />,
    );
    const classes = classesDoChip();

    expect(classes).toContain("border-dashed");
    expect(classes).toContain("border-border-input");
    expect(classes).toContain("bg-bg-surface");
    expect(classes).not.toContain("border-border-brand");
    expect(classes).not.toContain("bg-bg-brand-subtle");
  });

  it("os dois estados coexistem na MESMA barra sem se contaminar", () => {
    render(
      <ToolbarApplied
        filters={[chip(), chip({ id: "uf", columnLabel: "UF", isEmpty: true, value: [] })]}
        onRemove={() => {}}
      />,
    );
    expect(classesDoChip(0)).toContain("bg-bg-brand-subtle");
    expect(classesDoChip(1)).toContain("border-dashed");
    expect(classesDoChip(1)).not.toContain("bg-bg-brand-subtle");
  });

  it("interactive mantém foco e hover — e o hover do aplicado é de marca", () => {
    render(
      <ToolbarApplied
        filters={[chip()]}
        onRemove={() => {}}
        renderChip={(_f, d) => d}
      />,
    );
    const classes = classesDoChip();

    expect(classes).toContain("cursor-pointer");
    expect(classes).toContain("focus-visible:ring-ring-brand");
    expect(classes).toContain("hover:bg-bg-brand-subtle-hover");
    // o hover neutro NÃO pode sobrar junto: duas classes de bg-hover no mesmo
    // elemento não são conflito pro tailwind-merge (prefixo DS, L-072) e quem
    // decidiria seria a ordem do CSS
    expect(classes).not.toContain("hover:bg-bg-muted-hover");
  });

  it("caminho antigo: chip VAZIO interativo mantém o hover neutro de sempre", () => {
    render(
      <ToolbarApplied
        filters={[chip({ isEmpty: true, value: [] })]}
        onRemove={() => {}}
        renderChip={(_f, d) => d}
      />,
    );
    const classes = classesDoChip();

    expect(classes).toContain("hover:bg-bg-muted-hover");
    expect(classes).toContain("hover:border-border-default");
    expect(classes).not.toContain("hover:bg-bg-brand-subtle-hover");
  });
});
