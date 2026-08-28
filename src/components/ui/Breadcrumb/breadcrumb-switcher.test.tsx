import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BreadcrumbSwitcher } from "./breadcrumb-switcher";
import { Breadcrumb } from "./breadcrumb";
import { HeaderBreadcrumb } from "../Header/header-breadcrumb";

/**
 * Testes das DECISÕES, não do estilo:
 *
 *   1. o gatilho mostra o registro ABERTO, e cai no placeholder quando o valor não está na lista;
 *   2. escolher avisa e fecha — o componente não navega sozinho;
 *   3. a busca acha por `keywords` (o código do registro, que não aparece no rótulo);
 *   4. grupos preservam a ordem de `options`, não a alfabética;
 *   5. no Header, o item só vira seletor com lista + valor + callback.
 */

const OPCOES = [
  { value: "c1", label: "Maria Silva", description: "CPF 123.456.789-00", keywords: ["12345678900"] },
  { value: "c2", label: "Comercial Andrade LTDA", description: "CNPJ 12.345.678/0001-90" },
  { value: "c3", label: "João Pedro Costa" },
];

const abrir = () => fireEvent.click(screen.getByRole("button", { name: /trocar/i }));

describe("BreadcrumbSwitcher — o gatilho é o caminho", () => {
  it("mostra o rótulo do registro aberto", () => {
    render(<BreadcrumbSwitcher value="c2" onValueChange={() => {}} options={OPCOES} />);
    expect(screen.getByRole("button").textContent).toContain("Comercial Andrade LTDA");
  });

  it("valor fora da lista cai no `placeholder` — não deixa o caminho vazio", () => {
    render(
      <BreadcrumbSwitcher
        value="sumiu"
        onValueChange={() => {}}
        options={OPCOES}
        placeholder="Carregando…"
      />,
    );
    expect(screen.getByRole("button").textContent).toContain("Carregando…");
  });

  it("sem placeholder, mostra o próprio value — pior é não mostrar nada", () => {
    render(<BreadcrumbSwitcher value="c9" onValueChange={() => {}} options={OPCOES} />);
    expect(screen.getByRole("button").textContent).toContain("c9");
  });

  it("tem rótulo acessível próprio (o texto sozinho não diz que troca)", () => {
    render(
      <BreadcrumbSwitcher
        value="c1"
        onValueChange={() => {}}
        options={OPCOES}
        aria-label="Trocar cliente"
      />,
    );
    expect(screen.getByRole("button", { name: "Trocar cliente" })).toBeTruthy();
  });
});

describe("BreadcrumbSwitcher — escolher", () => {
  it("avisa a escolha e NÃO navega sozinho", () => {
    const onValueChange = vi.fn();
    render(
      <BreadcrumbSwitcher
        value="c1"
        onValueChange={onValueChange}
        options={OPCOES}
        aria-label="Trocar cliente"
      />,
    );
    abrir();
    fireEvent.click(screen.getByText("João Pedro Costa"));
    expect(onValueChange).toHaveBeenCalledWith("c3");
    // controlado: sem o consumidor mudar `value`, o gatilho continua no anterior
    expect(screen.getByRole("button", { name: "Trocar cliente" }).textContent).toContain(
      "Maria Silva",
    );
  });

  it("fecha ao escolher", () => {
    function Controlado() {
      const [v, setV] = useState("c1");
      return (
        <BreadcrumbSwitcher value={v} onValueChange={setV} options={OPCOES} aria-label="Trocar" />
      );
    }
    render(<Controlado />);
    abrir();
    expect(screen.getByPlaceholderText("Buscar…")).toBeTruthy();
    fireEvent.click(screen.getByText("João Pedro Costa"));
    expect(screen.queryByPlaceholderText("Buscar…")).toBeNull();
  });

  it("marca a opção aberta — e só ela", () => {
    render(
      <BreadcrumbSwitcher value="c2" onValueChange={() => {}} options={OPCOES} aria-label="Trocar" />,
    );
    abrir();
    // ⚠️ buscar por texto pegaria o GATILHO junto (ele mostra o mesmo rótulo) — daí procurar
    // dentro das opções.
    // ⚠️ não dá pra procurar "o item com svg": `leading` também é svg. O componente marca o
    // registro aberto com `data-atual`, e é isso que se testa.
    const marcadas = screen.getAllByRole("option").filter((o) => o.hasAttribute("data-atual"));
    expect(marcadas).toHaveLength(1);
    expect(marcadas[0].textContent).toContain("Comercial Andrade LTDA");
  });
});

describe("BreadcrumbSwitcher — busca e grupos", () => {
  it("acha por `keywords` — o código do registro não aparece no rótulo", () => {
    render(
      <BreadcrumbSwitcher value="c2" onValueChange={() => {}} options={OPCOES} aria-label="Trocar" />,
    );
    abrir();
    fireEvent.change(screen.getByPlaceholderText("Buscar…"), {
      target: { value: "12345678900" },
    });
    // a busca do cmdk é FUZZY (por subsequência, com score) — a asserção honesta é que o
    // registro certo aparece e o que não tem nada a ver some, não que sobre um só.
    expect(screen.getByText("Maria Silva")).toBeTruthy();
    expect(screen.queryByText("João Pedro Costa")).toBeNull();
  });

  it("mostra a mensagem de vazio quando nada casa", () => {
    render(
      <BreadcrumbSwitcher
        value="c1"
        onValueChange={() => {}}
        options={OPCOES}
        emptyMessage="Nenhum cliente."
        aria-label="Trocar"
      />,
    );
    abrir();
    fireEvent.change(screen.getByPlaceholderText("Buscar…"), { target: { value: "zzzz" } });
    expect(screen.getByText("Nenhum cliente.")).toBeTruthy();
  });

  it("grupos saem na ordem de `options`, não em ordem alfabética", () => {
    render(
      <BreadcrumbSwitcher
        value="c1"
        onValueChange={() => {}}
        aria-label="Trocar"
        options={[
          { value: "a", label: "Aberto agora", group: "Recentes" },
          { value: "b", label: "Outro", group: "Todos" },
        ]}
      />,
    );
    abrir();
    const texto = screen.getByRole("listbox").textContent ?? "";
    expect(texto.indexOf("Recentes")).toBeLessThan(texto.indexOf("Todos"));
  });

  it("o rodapé fica FORA da lista que rola", () => {
    render(
      <BreadcrumbSwitcher
        value="c1"
        onValueChange={() => {}}
        options={OPCOES}
        footer={<button>Ver todos</button>}
        aria-label="Trocar"
      />,
    );
    abrir();
    const rodape = screen.getByText("Ver todos");
    expect(rodape.closest('[role="listbox"]')).toBeNull();
  });
});

describe("HeaderBreadcrumb — o item só vira seletor com os três", () => {
  const base = [{ label: "Clientes", href: "/clientes" }];

  it("com lista + valor + callback, vira seletor", () => {
    render(
      <HeaderBreadcrumb
        items={[
          ...base,
          { label: "Maria Silva", switcher: OPCOES, value: "c1", onValueChange: () => {} },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: /Trocar: Maria Silva/ })).toBeTruthy();
  });

  it("faltando o callback, continua texto — gatilho que não avisa a escolha é pior que texto", () => {
    render(
      <HeaderBreadcrumb items={[...base, { label: "Maria Silva", switcher: OPCOES, value: "c1" }]} />,
    );
    expect(screen.queryByRole("button", { name: /Trocar/ })).toBeNull();
    expect(screen.getByText("Maria Silva")).toBeTruthy();
  });

  it("lista vazia também não vira seletor", () => {
    render(
      <HeaderBreadcrumb
        items={[...base, { label: "Maria Silva", switcher: [], value: "c1", onValueChange: () => {} }]}
      />,
    );
    expect(screen.queryByRole("button", { name: /Trocar/ })).toBeNull();
  });
});

describe("Breadcrumb — os dois modos", () => {
  it("com `items`, monta a cadeia e o ÚLTIMO não é link", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Início", href: "/" },
          { label: "Clientes", href: "/clientes" },
          { label: "Maria Silva" },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "Início" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Clientes" })).toBeTruthy();
    /* ⚠️ O atual NÃO é um `<a>` — mas o `BreadcrumbPage` do shadcn o expõe como
       `role="link" aria-disabled aria-current="page"` (padrão upstream). Então "não é link"
       se afirma pela ausência de `href` e pelo `aria-current`, não por `queryByRole("link")`. */
    const atual = screen.getByText("Maria Silva");
    expect(atual.getAttribute("aria-current")).toBe("page");
    expect(atual.getAttribute("aria-disabled")).toBe("true");
    expect(atual.hasAttribute("href")).toBe(false);
  });

  it("item com `href` NA ÚLTIMA posição também não vira link — é a página atual", () => {
    render(<Breadcrumb items={[{ label: "Clientes", href: "/clientes" }]} />);
    // o `href` é ignorado: o último item é a página atual, e página atual não navega pra si
    expect(screen.getByText("Clientes").hasAttribute("href")).toBe(false);
    expect(document.querySelector("a")).toBeNull();
  });

  it("um item com `switcher` vira seletor no meio da cadeia", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Clientes", href: "/clientes" },
          { label: "Maria Silva", switcher: OPCOES, value: "c1", onValueChange: () => {} },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: "Trocar: Maria Silva" })).toBeTruthy();
  });

  it("sem `items`, renderiza os children — é o modo de composição", () => {
    render(
      <Breadcrumb>
        <span data-testid="livre">qualquer coisa</span>
      </Breadcrumb>,
    );
    expect(screen.getByTestId("livre")).toBeTruthy();
  });

  it("`items` vazio não renderiza nada (nem o nav vazio)", () => {
    const { container } = render(<Breadcrumb items={[]} />);
    expect(container.querySelector("nav")).toBeNull();
  });

  it("um item só = título da página, não cadeia — e é o que o Header usa", () => {
    const { container } = render(<Breadcrumb size="sm" items={[{ label: "Dashboard" }]} />);
    // sem separador: não há entre o que separar
    expect(container.querySelectorAll("li")).toHaveLength(1);
    expect(screen.getByText("Dashboard").className).toContain("text-body-lg");
  });
});
