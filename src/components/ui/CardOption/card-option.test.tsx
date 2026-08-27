import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CardOption, CardOptionGroup } from "./card-option";

/**
 * Os três testes que importam aqui não são de estilo — são das DECISÕES que a spec tomou e
 * que um refactor futuro pode desfazer sem perceber:
 *
 *   1. o card é um `<label htmlFor>` nativo (L-025), nunca `<button>`;
 *   2. `orientation` e `highlightSelected` DERIVAM do `type` — switch à direita e sem
 *      destaque, porque switch é estado e não seleção;
 *   3. o anel de foco é do CARD (`has-[:focus-visible]`), não do root com `focus-visible:`,
 *      que era CSS morto no `CardCheckbox` porque label não recebe foco.
 */

describe("CardOption — semântica nativa (L-025)", () => {
  it("o card é um <label htmlFor>, não um <button>", () => {
    const { container } = render(<CardOption label="Salvar conta" />);
    const label = container.querySelector("label");
    expect(label, "o card TEM que ser label — button quebra leitor de tela e submit").not.toBeNull();
    // o label aponta pro controle real
    const controle = container.querySelector('[role="checkbox"]');
    expect(label?.getAttribute("for")).toBe(controle?.getAttribute("id"));
  });

  it("não existe onClick no card — quem propaga o clique é o label", () => {
    const { container } = render(<CardOption label="x" />);
    const label = container.querySelector("label")!;
    // um <label> com role/onclick indicaria que alguém trocou a semântica
    expect(label.getAttribute("role")).toBeNull();
    expect(label.tagName).toBe("LABEL");
  });

  it("id explícito é respeitado (liga com label externo)", () => {
    const { container } = render(<CardOption id="meu-id" label="x" />);
    expect(container.querySelector("label")?.getAttribute("for")).toBe("meu-id");
    expect(container.querySelector("#meu-id")).not.toBeNull();
  });
});

describe("CardOption — os defaults derivam do type", () => {
  const classesDoCard = (c: HTMLElement) => c.querySelector("label")!.className;

  it("checkbox: controle à esquerda e destaque quando selecionado", () => {
    const { container } = render(<CardOption type="checkbox" checked label="x" />);
    expect(classesDoCard(container)).not.toContain("flex-row-reverse");
    // o destaque é condicional ao data-state do controle, não classe fixa
    expect(classesDoCard(container)).toContain("has-[[data-state=checked]]:bg-bg-success-muted");
  });

  it("switch: controle à DIREITA e SEM destaque, mesmo marcado", () => {
    // É a decisão central da spec: switch é estado, não seleção — lista de settings toda
    // verde é ruído. Se este teste cair, o switch virou seleção sem ninguém decidir.
    const { container } = render(<CardOption type="switch" checked label="Wi-Fi" />);
    expect(classesDoCard(container)).toContain("flex-row-reverse");
    expect(classesDoCard(container)).not.toContain("has-[[data-state=checked]]:bg-bg-success-muted");
  });

  it("o default do type pode ser sobrescrito nas duas direções", () => {
    const { container: a } = render(
      <CardOption type="switch" checked highlightSelected label="x" />,
    );
    expect(classesDoCard(a)).toContain("has-[[data-state=checked]]:bg-bg-success-muted");

    const { container: b } = render(<CardOption type="checkbox" orientation="right" label="x" />);
    expect(classesDoCard(b)).toContain("flex-row-reverse");
  });
});

describe("CardOption — o anel de foco é do CARD", () => {
  it("usa has-[:focus-visible], não focus-visible: no root", () => {
    // O CardCheckbox declarava `focus-visible:ring-4` no <label>, que não recebe foco:
    // era CSS morto (medido no browser em 2026-08-27).
    const { container } = render(<CardOption label="x" />);
    const classes = container.querySelector("label")!.className;
    expect(classes).toContain("has-[:focus-visible]:ring-4");
    expect(classes).not.toMatch(/(^|\s)focus-visible:ring-4/);
  });
});

describe("CardOptionGroup", () => {
  it("type=radio vira o RadioGroup do Radix (radiogroup no DOM)", () => {
    render(
      <CardOptionGroup type="radio" defaultValue="a">
        <CardOption value="a" label="A" />
        <CardOption value="b" label="B" />
      </CardOptionGroup>,
    );
    expect(screen.getByRole("radiogroup")).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("type=checkbox NÃO vira radiogroup — é só container", () => {
    const { container } = render(
      <CardOptionGroup type="checkbox">
        <CardOption label="A" />
      </CardOptionGroup>,
    );
    expect(container.querySelector('[role="radiogroup"]')).toBeNull();
    expect(container.querySelector('[role="checkbox"]')).not.toBeNull();
  });

  it("o item herda type e size do grupo", () => {
    const { container } = render(
      <CardOptionGroup type="switch" size="lg">
        <CardOption label="Wi-Fi" />
      </CardOptionGroup>,
    );
    expect(container.querySelector('[role="switch"]')).not.toBeNull();
    expect(container.querySelector("label")!.className).toContain("p-pad-2xl");
  });

  it("layout=list: borda e cantos no GRUPO, item sem os seus", () => {
    // Se o item mantivesse a borda, a lista sairia com borda dupla entre as linhas.
    const { container } = render(
      <CardOptionGroup type="switch" layout="list">
        <CardOption label="A" />
        <CardOption label="B" />
      </CardOptionGroup>,
    );
    const grupo = container.firstElementChild as HTMLElement;
    expect(grupo.className).toContain("divide-y");
    expect(grupo.className).toContain("border");
    const item = container.querySelector("label")!;
    expect(item.className).toContain("border-0");
    expect(item.className).toContain("rounded-radius-none");
  });

  it("layout=spaced (default): item com borda e cantos próprios", () => {
    const { container } = render(
      <CardOptionGroup>
        <CardOption label="A" />
      </CardOptionGroup>,
    );
    const item = container.querySelector("label")!;
    expect(item.className).not.toContain("border-0");
    expect(item.className).toContain("rounded-radius-lg");
  });

  it("disabled no grupo desce pro item", () => {
    const { container } = render(
      <CardOptionGroup disabled>
        <CardOption label="A" />
      </CardOptionGroup>,
    );
    expect(container.querySelector("label")!.className).toContain("pointer-events-none");
  });
});

describe("CardOption — o clique chega no controle", () => {
  it("onCheckedChange dispara ao clicar no card", () => {
    const spy = vi.fn();
    const { container } = render(<CardOption label="Salvar" onCheckedChange={spy} />);
    // o label nativo propaga pro controle real — é o que o L-025 preserva
    fireEvent.click(container.querySelector('[role="checkbox"]')!);
    expect(spy).toHaveBeenCalledOnce();
  });
});
