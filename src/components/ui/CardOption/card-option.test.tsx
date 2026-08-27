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
  const classesDoControle = (c: HTMLElement) =>
    c.querySelector('[role="checkbox"],[role="radio"],[role="switch"]')!.className;

  it("checkbox: controle à esquerda e destaque quando selecionado", () => {
    const { container } = render(<CardOption type="checkbox" checked label="x" />);
    expect(classesDoControle(container)).not.toContain("order-last");
    // o destaque é condicional ao data-state do controle, não classe fixa
    expect(classesDoCard(container)).toContain("has-[[data-state=checked]]:bg-bg-success-muted");
  });

  it("switch: controle à DIREITA e SEM destaque, mesmo marcado", () => {
    // É a decisão central da spec: switch é estado, não seleção — lista de settings toda
    // verde é ruído. Se este teste cair, o switch virou seleção sem ninguém decidir.
    const { container } = render(<CardOption type="switch" checked label="Wi-Fi" />);
    // order-last no CONTROLE, não flex-row-reverse no root: o root inverteria todos os
    // filhos e levaria o ícone pra direita junto.
    expect(classesDoControle(container)).toContain("order-last");
    expect(classesDoCard(container)).not.toContain("has-[[data-state=checked]]:bg-bg-success-muted");
  });

  it("o default do type pode ser sobrescrito nas duas direções", () => {
    const { container: a } = render(
      <CardOption type="switch" checked highlightSelected label="x" />,
    );
    expect(classesDoCard(a)).toContain("has-[[data-state=checked]]:bg-bg-success-muted");

    const { container: b } = render(<CardOption type="checkbox" orientation="right" label="x" />);
    expect(classesDoControle(b)).toContain("order-last");
  });
});

describe("CardOption — o ícone fica SEMPRE à esquerda", () => {
  /**
   * ⚠️ Estes testes leem CLASSE, não `getComputedStyle`.
   *
   * jsdom não carrega o CSS do Tailwind: `order-last` fica como nome de classe e o `order`
   * computado é sempre `0`. Uma versão anterior deste teste comparava o `order` computado e
   * passava/falhava por vacuidade. A prova de que o ícone fica de fato à esquerda é a medição
   * no browser (feita em 2026-08-27, com posição real na tela).
   */
  it("com orientation=right, só o CONTROLE recebe order-last", () => {
    // Era `flex-row-reverse` no root, que invertia TODOS os filhos e mandava o ícone pra
    // direita junto. O ícone identifica a opção e pertence ao lado do texto.
    const { container } = render(
      <CardOption type="switch" icon={<span>ic</span>} label="Wi-Fi" />,
    );
    const card = container.querySelector("label")!;
    const ctrl = card.querySelector('[role="switch"]')!;
    const icone = card.querySelector('[aria-hidden="true"]')!;
    const corpo = card.querySelector('[class*="flex-col"]')!;

    expect(ctrl.className).toContain("order-last");
    expect(icone.className).not.toContain("order-last");
    expect(corpo.className).not.toContain("order-last");
    // e o root NÃO inverte mais
    expect(card.className).not.toContain("flex-row-reverse");
  });

  it("o ícone tem piso de 20px nos dois eixos", () => {
    const { container } = render(<CardOption icon={<span>ic</span>} label="x" />);
    const wrap = container.querySelector('[aria-hidden="true"]')!;
    expect(wrap.className).toContain("min-h-comp-2xs");
    expect(wrap.className).toContain("min-w-comp-2xs");
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
    expect(grupo.className).toContain("border");
    // NÃO usa divide-y: ele põe border-top nos filhos e brigava com o reset do item —
    // resultado medido no browser era ZERO divisória.
    expect(grupo.className).not.toContain("divide-y");
    const item = container.querySelector("label")!;
    expect(item.className).toContain("rounded-radius-none");
    // a divisória é a borda de baixo do item, com o último suprimido
    expect(item.className).toContain("border-b");
    expect(item.className).toContain("last:border-b-0");
    expect(item.className).not.toMatch(/(^|s)border-0(s|$)/);
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

  it("layout=list vale pros TRÊS tipos, não só switch", () => {
    // A 1ª versão da doc só mostrava lista com switch, e o texto dizia "lista de settings" —
    // o que fazia parecer exclusivo dele. Radio em lista é seletor de linha única; checkbox
    // em lista é lista de permissões.
    for (const type of ["checkbox", "radio", "switch"] as const) {
      const { container } = render(
        <CardOptionGroup type={type} layout="list" defaultValue="a">
          <CardOption value="a" label="A" />
          <CardOption value="b" label="B" />
        </CardOptionGroup>,
      );
      const item = container.querySelector("label")!;
      expect(item.className, `type=${type} deveria ter divisória`).toContain("border-b");
      expect(item.className, `type=${type}`).toContain("rounded-radius-none");
    }
  });

  it("layout=list NÃO deixa passar o gap do RadioGroup", () => {
    // A 1ª versão tentava zerar com `grid-none`, classe que não existe no Tailwind: inerte.
    // O `grid w-full gap-gp-xl` do base do RadioGroup sobrevivia e a lista de RADIO saía com
    // 12px entre as linhas, enquanto checkbox e switch saíam com 0 (medido no browser).
    const grupoDe = (type: "checkbox" | "radio" | "switch") => {
      const { container } = render(
        <CardOptionGroup type={type} layout="list" defaultValue="a">
          <CardOption value="a" label="A" />
          <CardOption value="b" label="B" />
        </CardOptionGroup>,
      );
      return (container.firstElementChild as HTMLElement).className;
    };
    for (const type of ["checkbox", "radio", "switch"] as const) {
      expect(grupoDe(type), `type=${type} não deveria ter gap em lista`).toContain("gap-0");
      expect(grupoDe(type), "classe inventada não zera nada").not.toContain("grid-none");
    }
    // e o gap do RadioGroup não pode ter sobrado
    expect(grupoDe("radio")).not.toContain("gap-gp-xl");
  });
});

describe("CardOption — destaque em lista é OPÇÃO, com default desligado", () => {
  const classesDoItem = (ui: Parameters<typeof render>[0]) =>
    render(ui).container.querySelector("label")!.className;

  const PINTA = "has-[[data-state=checked]]:bg-bg-success-muted";
  const COLORE_BORDA = "has-[[data-state=checked]]:border-border-brand";

  it("em lista, checkbox e radio NÃO pintam por default", () => {
    // Em lista a única borda do item é a de baixo — a DIVISÓRIA. O border-brand não
    // contornava o selecionado: pintava a linha que separa ele do vizinho, e o fundo virava
    // faixa colorida. Medido no browser em 2026-08-27 antes do ajuste.
    for (const type of ["checkbox", "radio"] as const) {
      const classes = classesDoItem(
        <CardOptionGroup type={type} layout="list" defaultValue="a">
          <CardOption value="a" label="A" defaultChecked />
        </CardOptionGroup>,
      );
      expect(classes, `type=${type} não deveria pintar em lista`).not.toContain(PINTA);
      expect(classes, `type=${type} não deveria colorir a divisória`).not.toContain(COLORE_BORDA);
    }
  });

  it("card SOLTO segue pintando — o default só muda em lista", () => {
    const classes = classesDoItem(<CardOption type="checkbox" label="A" />);
    expect(classes).toContain(PINTA);
    expect(classes).toContain(COLORE_BORDA);
  });

  it("highlightSelected no GRUPO liga a pintura em lista", () => {
    const classes = classesDoItem(
      <CardOptionGroup type="radio" layout="list" highlightSelected defaultValue="a">
        <CardOption value="a" label="A" />
      </CardOptionGroup>,
    );
    expect(classes).toContain(PINTA);
    expect(classes).toContain(COLORE_BORDA);
    // dentro do overflow-hidden do grupo a sombra não eleva, só vaza
    expect(classes).toContain("has-[[data-state=checked]]:shadow-sh-none");
  });

  it("a prop do ITEM vence o grupo nas duas direções", () => {
    const ligadoNoItem = classesDoItem(
      <CardOptionGroup type="checkbox" layout="list">
        <CardOption label="A" highlightSelected />
      </CardOptionGroup>,
    );
    expect(ligadoNoItem).toContain(PINTA);

    const desligadoNoItem = classesDoItem(
      <CardOptionGroup type="checkbox" layout="list" highlightSelected>
        <CardOption label="A" highlightSelected={false} />
      </CardOptionGroup>,
    );
    expect(desligadoNoItem).not.toContain(PINTA);
  });

  it("switch em lista continua sem pintar, mesmo com o grupo ligando nada", () => {
    const classes = classesDoItem(
      <CardOptionGroup type="switch" layout="list">
        <CardOption label="Wi-Fi" defaultChecked />
      </CardOptionGroup>,
    );
    expect(classes).not.toContain(PINTA);
  });
});

describe("CardOptionGroup — herança", () => {
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
