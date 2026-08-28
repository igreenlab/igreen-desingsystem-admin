import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "./avatar";
import { AvatarGroup } from "./avatar-group";

/**
 * Os testes aqui são das DECISÕES da spec, não de estilo — são elas que um refactor futuro
 * desfaz sem perceber:
 *
 *   1. o `size` do grupo chega nos filhos, e o do filho VENCE;
 *   2. `max` corta e o `+N` conta pelo `total` (a contagem do servidor), não pelo renderizado;
 *   3. o PRIMEIRO fica por cima (z-index decrescente);
 *   4. o grupo fala e os avatares calam — `role="group"` + label, `+N` `aria-hidden`.
 *
 * ⚠️ Leem CLASSE onde o valor é do Tailwind: jsdom não carrega o CSS, então `size-comp-xs`
 * existe como nome de classe e o `width` computado é sempre 0.
 */

const classesDo = (el: HTMLElement | null) => String(el?.className ?? "");

describe("AvatarGroup — propagação de size", () => {
  it("o size do grupo chega no filho", () => {
    const { container } = render(
      <AvatarGroup size="xs" aria-label="dois">
        <Avatar aria-label="A">A</Avatar>
      </AvatarGroup>,
    );
    // xs = size-comp-2xs (20px)
    expect(classesDo(screen.getByLabelText("A"))).toContain("size-comp-2xs");
  });

  it("o size do FILHO vence o do grupo — é o escape hatch da spec", () => {
    render(
      <AvatarGroup size="xs" aria-label="grupo">
        <Avatar aria-label="grande" size="xl">
          G
        </Avatar>
      </AvatarGroup>,
    );
    // xl = size-comp-xl (40px), não o xs do grupo
    expect(classesDo(screen.getByLabelText("grande"))).toContain("size-comp-xl");
  });

  it("Avatar FORA de grupo mantém o default md — contexto ausente não muda nada", () => {
    render(<Avatar aria-label="solto">S</Avatar>);
    expect(classesDo(screen.getByLabelText("solto"))).toContain("size-comp-sm");
  });
});

describe("AvatarGroup — max e excedente", () => {
  const quatro = ["A", "B", "C", "D"].map((n) => (
    <Avatar key={n} aria-label={n}>
      {n}
    </Avatar>
  ));

  it("sem max, mostra todos e não há +N", () => {
    render(<AvatarGroup aria-label="quatro">{quatro}</AvatarGroup>);
    expect(screen.getByLabelText("D")).toBeTruthy();
    expect(screen.queryByText(/^\+/)).toBeNull();
  });

  it("com max, corta e mostra o excedente", () => {
    render(
      <AvatarGroup max={2} aria-label="quatro">
        {quatro}
      </AvatarGroup>,
    );
    expect(screen.getByLabelText("B")).toBeTruthy();
    expect(screen.queryByLabelText("C")).toBeNull();
    expect(screen.getByText("+2")).toBeTruthy();
  });

  it("`total` manda no +N — é a contagem do SERVIDOR, não a do renderizado", () => {
    // O caso real: lista paginada em 4, mas são 40 pessoas. Sem `total` mostraria +2.
    render(
      <AvatarGroup max={2} total={40} aria-label="quarenta">
        {quatro}
      </AvatarGroup>,
    );
    expect(screen.getByText("+38")).toBeTruthy();
  });

  it("não renderiza +0 quando max é maior que o número de filhos", () => {
    render(
      <AvatarGroup max={10} aria-label="quatro">
        {quatro}
      </AvatarGroup>,
    );
    expect(screen.queryByText(/^\+/)).toBeNull();
  });
});

describe("AvatarGroup — empilhamento", () => {
  it("o PRIMEIRO fica por cima: z-index decrescente", () => {
    // Empilhamento natural do DOM poria o último por cima; a spec inverte porque a leitura
    // é da esquerda pra direita e o primeiro é o principal.
    const { container } = render(
      <AvatarGroup aria-label="três">
        <Avatar aria-label="A">A</Avatar>
        <Avatar aria-label="B">B</Avatar>
        <Avatar aria-label="C">C</Avatar>
      </AvatarGroup>,
    );
    const zs = [...container.querySelectorAll<HTMLElement>(":scope > div > span")].map((s) =>
      Number(s.style.zIndex),
    );
    expect(zs).toEqual([3, 2, 1]);
  });

  it("só o primeiro não desloca — senão a pilha sai da margem", () => {
    const { container } = render(
      <AvatarGroup size="lg" aria-label="dois">
        <Avatar aria-label="A">A</Avatar>
        <Avatar aria-label="B">B</Avatar>
      </AvatarGroup>,
    );
    const spans = [...container.querySelectorAll<HTMLElement>(":scope > div > span")];
    expect(classesDo(spans[0])).toContain("ml-0");
    // lg desloca -sp-md (8px) — a sobreposição escala com o tamanho, não é constante
    expect(classesDo(spans[1])).toContain("-ml-sp-md");
    expect(classesDo(spans[1])).not.toContain("ml-0");
  });

  it("a sobreposição muda com o size — 25% do diâmetro em toda a escala", () => {
    const desloc = (size: "xs" | "xl") => {
      const { container } = render(
        <AvatarGroup size={size} aria-label="dois">
          <Avatar aria-label="A">A</Avatar>
          <Avatar aria-label="B">B</Avatar>
        </AvatarGroup>,
      );
      return classesDo(
        [...container.querySelectorAll<HTMLElement>(":scope > div > span")][1],
      );
    };
    expect(desloc("xs")).toContain("-ml-sp-xs"); // 20px → 4
    expect(desloc("xl")).toContain("-ml-sp-lg"); // 40px → 10
  });
});

describe("AvatarGroup — anel da superfície de trás", () => {
  it("default é `surface`", () => {
    const { container } = render(
      <AvatarGroup aria-label="um">
        <Avatar aria-label="A">A</Avatar>
      </AvatarGroup>,
    );
    expect(classesDo(container.querySelector("span"))).toContain("ring-bg-surface");
  });

  it("`surface` troca o token do anel", () => {
    // ⚠️ `table` e `surface` têm o MESMO valor hoje — o teste checa a CLASSE, que é o que o
    // componente controla. A diferença visível está em canvas/subtle/muted.
    const { container } = render(
      <AvatarGroup surface="table" aria-label="um">
        <Avatar aria-label="A">A</Avatar>
      </AvatarGroup>,
    );
    const cls = classesDo(container.querySelector("span"));
    expect(cls).toContain("ring-bg-table");
    expect(cls).not.toContain("ring-bg-surface");
  });

  it("o anel mora no WRAPPER arredondado, não no Avatar", () => {
    // `ring` acompanha o border-radius do elemento: num wrapper quadrado traçaria um quadrado.
    const { container } = render(
      <AvatarGroup aria-label="um">
        <Avatar aria-label="A">A</Avatar>
      </AvatarGroup>,
    );
    const wrapper = container.querySelector("span")!;
    expect(classesDo(wrapper)).toContain("rounded-radius-full");
    expect(classesDo(wrapper)).toContain("ring-2");
    // e o Avatar solto continua sem anel
    expect(classesDo(screen.getByLabelText("A"))).not.toContain("ring-2");
  });
});

describe("AvatarGroup — acessibilidade", () => {
  it("o grupo fala: role=group + aria-label", () => {
    render(
      <AvatarGroup aria-label="3 responsáveis">
        <Avatar aria-label="A">A</Avatar>
      </AvatarGroup>,
    );
    expect(screen.getByRole("group", { name: "3 responsáveis" })).toBeTruthy();
  });

  it("o +N é aria-hidden — a contagem real já está no rótulo do grupo", () => {
    render(
      <AvatarGroup max={1} total={12} aria-label="12 responsáveis">
        <Avatar aria-label="A">A</Avatar>
        <Avatar aria-label="B">B</Avatar>
      </AvatarGroup>,
    );
    const mais = screen.getByText("+11");
    expect(mais.closest("[aria-hidden]")).not.toBeNull();
  });
});
