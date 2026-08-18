import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SingleMenuItem } from "./menu-item";

/**
 * O `href` do `SingleMenuSidebar` navega — e antes não navegava porque não existia.
 *
 * ## O defeito (medido em 2026-08-18)
 *
 * `SingleMenuSubItem` declarava `href?: string`, o `USAGE.md` documentava
 * `{ id, label, href? }`, e o `menu-item.tsx` renderizava **sempre**
 * `<button type="button" onClick>`. Nada lia o `href`. Uma prop morta com documentação.
 *
 * ⚠️ **Não é o defeito que o `MenuSidebar` tinha.** Lá o `<a href>` existia e navegava
 * nativamente junto do handler → recarregava a página inteira. Aqui não havia `<a>`
 * nenhum, então o sintoma era outro: sem ctrl+clique, sem "abrir em nova aba", sem
 * "copiar link", e o leitor de tela anunciando "botão".
 *
 * ## O que este arquivo fixa
 *
 * A regra de cancelamento vem de `@/utils/nav-link`, que já tem 13 testes próprios sobre
 * as 5 exceções. Aqui o objeto é a **integração**: o componente emite o elemento certo, e
 * chama `preventDefault` só quando deve.
 */

const clique = () => userEvent.setup();

describe("SingleMenuItem — elemento emitido", () => {
  it("com href vira <a> (era <button> sempre, mesmo com href)", () => {
    render(<SingleMenuItem label="Clientes" href="/clientes" />);
    const el = screen.getByText("Clientes").closest("a, button")!;
    expect(el.tagName, "com href tem de ser âncora — é o que dá ctrl+clique e nova aba").toBe("A");
    expect(el.getAttribute("href")).toBe("/clientes");
  });

  it("sem href continua <button> — não inventa link sem destino", () => {
    render(<SingleMenuItem label="Ação" onClick={() => {}} />);
    const el = screen.getByText("Ação").closest("a, button")!;
    expect(el.tagName).toBe("BUTTON");
  });

  it("marca aria-current quando selecionado — leitor de tela anuncia a página atual", () => {
    render(<SingleMenuItem label="Atual" href="/atual" selected />);
    expect(screen.getByText("Atual").closest("a")?.getAttribute("aria-current")).toBe("page");
  });
});

describe("SingleMenuItem — quando cancela a navegação nativa", () => {
  it("href de PATH + handler → cancela (senão o app recarregaria)", async () => {
    const onClick = vi.fn((e: { defaultPrevented: boolean }) => e);
    render(<SingleMenuItem label="Clientes" href="/clientes" onClick={onClick} interceptNavigation />);
    await clique().click(screen.getByText("Clientes"));

    expect(onClick).toHaveBeenCalled();
    const evento = onClick.mock.calls[0][0] as unknown as { defaultPrevented: boolean };
    expect(evento.defaultPrevented, "path interno com handler: cancelar é o correto").toBe(true);
  });

  it("href de HASH → NÃO cancela (cancelar impediria o hashchange)", async () => {
    // A exceção mais sutil das 5: hash router escuta `hashchange`; cancelar o default
    // impede o fragmento de mudar e o evento nunca dispara. Trocaria "recarrega" por
    // "não navega" — e o exemplo canônico do DS usa href de hash.
    const onClick = vi.fn();
    render(<SingleMenuItem label="Hash" href="#/clientes" onClick={onClick} interceptNavigation />);
    await clique().click(screen.getByText("Hash"));

    const evento = onClick.mock.calls[0][0] as unknown as { defaultPrevented: boolean };
    expect(evento.defaultPrevented).toBe(false);
  });

  it("href EXTERNO → NÃO cancela (router nenhum resolve, o link ficaria morto)", async () => {
    const onClick = vi.fn();
    render(<SingleMenuItem label="Externo" href="https://igreen.com" onClick={onClick} interceptNavigation />);
    await clique().click(screen.getByText("Externo"));

    const evento = onClick.mock.calls[0][0] as unknown as { defaultPrevented: boolean };
    expect(evento.defaultPrevented).toBe(false);
  });

  it('target="_blank" → NÃO cancela (o item pediu outra aba)', async () => {
    const onClick = vi.fn();
    render(
      <SingleMenuItem label="Aba" href="/relatorio" target="_blank" onClick={onClick} interceptNavigation />,
    );
    await clique().click(screen.getByText("Aba"));

    const evento = onClick.mock.calls[0][0] as unknown as { defaultPrevented: boolean };
    expect(evento.defaultPrevented).toBe(false);
  });

  it("SEM handler → NÃO cancela, porque o <a> é a única navegação que existe", async () => {
    // `interceptNavigation` explícito em false: é o caso do consumidor que só passou
    // href e espera navegação nativa. Cancelar aqui deixaria o menu inerte.
    render(<SingleMenuItem label="Puro" href="/puro" interceptNavigation={false} />);
    const a = screen.getByText("Puro").closest("a")!;
    const ev = new MouseEvent("click", { bubbles: true, cancelable: true });
    a.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
  });
});

describe("SingleMenuItem — renderLink (integração de router)", () => {
  it("renderLink substitui o <a> e recebe href + onClick + aria-current", () => {
    const visto: Record<string, unknown>[] = [];
    render(
      <SingleMenuItem
        label="Router"
        href="/router"
        selected
        renderLink={(p) => {
          visto.push(p as unknown as Record<string, unknown>);
          return <span data-testid="link-do-router">{p.children}</span>;
        }}
      />,
    );

    expect(screen.getByTestId("link-do-router"), "o render-prop foi usado").toBeTruthy();
    expect(document.querySelector("a"), "com renderLink não deve sobrar <a> nativo").toBeNull();
    expect(visto[0].href).toBe("/router");
    expect(visto[0]["aria-current"]).toBe("page");
    expect(typeof visto[0].onClick).toBe("function");
  });

  it("com renderLink o componente NÃO chama preventDefault — quem decide é o <Link>", async () => {
    const onClick = vi.fn();
    render(
      <SingleMenuItem
        label="Deixa"
        href="/interno"
        onClick={onClick}
        interceptNavigation
        renderLink={(p) => <a {...p} data-testid="a-do-router" />}
      />,
    );
    await clique().click(screen.getByTestId("a-do-router"));

    const evento = onClick.mock.calls[0][0] as unknown as { defaultPrevented: boolean };
    expect(
      evento.defaultPrevented,
      "cancelar aqui roubaria a decisão do router do consumidor",
    ).toBe(false);
  });
});
