/**
 * Regressão do defeito reportado por consumidor em 2026-08-08:
 * "todo app que usa MenuSidebar com react-router recarrega a página inteira a cada
 * clique de menu."
 *
 * Não precisa de browser: se o clique num `<a href="/x">` sai com
 * `defaultPrevented === false`, o browser EXECUTA a navegação — é a definição do
 * comportamento default do anchor. No jsdom isso aparece como
 * `Not implemented: navigation to another Document`, que foi exatamente o que o repro
 * imprimiu antes da correção.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { MouseEvent, ReactNode } from "react";
import { MenuSidebar } from "./index";
import type { SidebarContext, SidebarLinkRenderProps } from "./sidebar.types";

// jsdom não implementa matchMedia; o MenuSidebar usa pro breakpoint mobile.
beforeEach(() => {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: false, // desktop
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});

const Dummy = (() => null) as unknown as SidebarContext["icon"];

const contexts: SidebarContext[] = [
  {
    id: "app",
    label: "App",
    icon: Dummy,
    items: [
      { name: "Clientes", href: "/app/clientes" }, // PATH — react-router
      { name: "Início", href: "#/app/inicio" }, // HASH — showcase
      { name: "Docs", href: "https://x.com" }, // externo
      { name: "Nova aba", href: "/rel", target: "_blank" },
      { name: "Ação" }, // sem href → <button>
    ],
  },
];

const clickOn = (label: string, init: Partial<MouseEventInit> = {}) => {
  const el = screen.getByText(label).closest("a") ?? screen.getByText(label).closest("button")!;
  const ev = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init });
  el.dispatchEvent(ev);
  return { el, ev };
};

describe("MenuSidebar — navegação SPA (regressão do reload)", () => {
  it("href de PATH + onItemClick → CANCELA a navegação nativa", () => {
    const onItemClick = vi.fn();
    render(<MenuSidebar contexts={contexts} onItemClick={onItemClick} />);

    const { el, ev } = clickOn("Clientes");
    expect(el.getAttribute("href")).toBe("/app/clientes");
    expect(onItemClick).toHaveBeenCalledTimes(1);
    // ANTES da correção isto era `false` → o browser recarregava a página.
    expect(ev.defaultPrevented, "o reload é o defeito — tem que estar cancelado").toBe(true);
  });

  it("o handler recebe o EVENTO, não só o item", () => {
    // Sem isto o consumidor não tem escape hatch — era `(item) => void`.
    const onItemClick = vi.fn();
    render(<MenuSidebar contexts={contexts} onItemClick={onItemClick} />);
    clickOn("Clientes");
    const [item, event] = onItemClick.mock.calls[0];
    expect(item).toMatchObject({ name: "Clientes" });
    expect(event, "2º argumento é o MouseEvent").toBeTruthy();
    expect(typeof event.preventDefault).toBe("function");
  });

  it("href de HASH → NÃO cancela (senão o hashchange nunca dispara)", () => {
    // Trava a exceção que protege hash router — e o example-app-shell do próprio DS.
    render(<MenuSidebar contexts={contexts} onItemClick={vi.fn()} />);
    const { ev } = clickOn("Início");
    expect(ev.defaultPrevented).toBe(false);
  });

  it("link externo → NÃO cancela", () => {
    render(<MenuSidebar contexts={contexts} onItemClick={vi.fn()} />);
    expect(clickOn("Docs").ev.defaultPrevented).toBe(false);
  });

  it('target="_blank" → NÃO cancela', () => {
    render(<MenuSidebar contexts={contexts} onItemClick={vi.fn()} />);
    expect(clickOn("Nova aba").ev.defaultPrevented).toBe(false);
  });

  it("ctrl/cmd/shift/alt e botão do meio → NÃO cancela (abrir em nova aba)", () => {
    render(<MenuSidebar contexts={contexts} onItemClick={vi.fn()} />);
    for (const mod of [
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true },
      { altKey: true },
      { button: 1 },
    ]) {
      expect(clickOn("Clientes", mod).ev.defaultPrevented, JSON.stringify(mod)).toBe(false);
    }
  });

  it("SEM onItemClick → NÃO cancela (o `<a>` é a navegação pretendida)", () => {
    render(<MenuSidebar contexts={contexts} />);
    expect(clickOn("Clientes").ev.defaultPrevented).toBe(false);
  });
});

describe("MenuSidebar — renderLink (o caminho canônico)", () => {
  it("substitui o `<a>` pelo componente do router, recebendo href e className", () => {
    const vistos: SidebarLinkRenderProps[] = [];
    const renderLink = (p: SidebarLinkRenderProps): ReactNode => {
      vistos.push(p);
      return (
        <a data-router-link="true" href={p.href} className={p.className} onClick={p.onClick}>
          {p.children}
        </a>
      );
    };

    render(<MenuSidebar contexts={contexts} renderLink={renderLink} onItemClick={vi.fn()} />);

    const el = screen.getByText("Clientes").closest("a")!;
    expect(el.getAttribute("data-router-link"), "o link do consumidor foi usado").toBe("true");
    expect(el.getAttribute("href")).toBe("/app/clientes");
    expect(el.className, "as classes do DS chegam intactas").toContain("flex");
    expect(vistos.some((p) => p.href === "/app/clientes")).toBe(true);
  });

  it("com renderLink o sidebar NÃO mexe em preventDefault — quem decide é o <Link>", () => {
    // Se o DS cancelasse aqui, o `<Link>` do router receberia um evento já cancelado
    // e a navegação client-side não aconteceria: trocaria um bug por outro.
    const renderLink = (p: SidebarLinkRenderProps): ReactNode => (
      <a href={p.href} className={p.className} onClick={p.onClick}>
        {p.children}
      </a>
    );
    render(<MenuSidebar contexts={contexts} renderLink={renderLink} onItemClick={vi.fn()} />);
    expect(clickOn("Clientes").ev.defaultPrevented).toBe(false);
  });
});

describe("MenuSidebar — brand do rail", () => {
  it('default é href="/" (comportamento preservado)', () => {
    render(<MenuSidebar contexts={contexts} />);
    expect(document.querySelector('a[aria-label="Home"]')?.getAttribute("href")).toBe("/");
  });

  it("brandHref customizável", () => {
    render(<MenuSidebar contexts={contexts} brandHref="/dashboard" />);
    expect(document.querySelector('a[aria-label="Home"]')?.getAttribute("href")).toBe(
      "/dashboard",
    );
  });

  it('brandHref="" vira <button> — não mente semântica de link', () => {
    // Screen reader anunciava "link" pra algo que não navega.
    render(<MenuSidebar contexts={contexts} brandHref="" />);
    expect(document.querySelector('a[aria-label="Home"]')).toBeNull();
    expect(document.querySelector('button[aria-label="Home"]')).not.toBeNull();
  });

  it("onBrandClick + brandHref cancela a navegação", () => {
    const onBrandClick = vi.fn((e: MouseEvent<HTMLAnchorElement>) => e);
    render(<MenuSidebar contexts={contexts} onBrandClick={onBrandClick} />);
    const el = document.querySelector('a[aria-label="Home"]')!;
    const ev = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    el.dispatchEvent(ev);
    expect(onBrandClick).toHaveBeenCalledTimes(1);
    expect(ev.defaultPrevented).toBe(true);
  });
});
