import { describe, it, expect } from "vitest";
import {
  shouldPreventNavigation,
  isExternalHref,
  isHashHref,
  isModifiedClick,
} from "./nav-link";

/** Evento simples de botão principal, sem modificador. */
const plain = { button: 0, defaultPrevented: false } as never;

describe("nav-link — classificação de href", () => {
  it("externo: protocolo ou `//host`", () => {
    for (const h of ["https://x.com", "http://x", "mailto:a@b.c", "tel:+5511", "//cdn.x"]) {
      expect(isExternalHref(h), h).toBe(true);
    }
  });

  it("interno: path, relativo, hash", () => {
    for (const h of ["/app/clientes", "app/clientes", "#/app", "#", "", undefined]) {
      expect(isExternalHref(h), String(h)).toBe(false);
    }
  });

  it("hash com `:` dentro NÃO é externo", () => {
    // `#/filtro:ativo` tem `:` mas é fragmento — um regex de protocolo frouxo erraria.
    expect(isExternalHref("#/filtro:ativo")).toBe(false);
  });

  it("modificador e botão", () => {
    expect(isModifiedClick({ button: 0 })).toBe(false);
    expect(isModifiedClick({ button: 1 }), "botão do meio").toBe(true);
    for (const k of ["metaKey", "ctrlKey", "shiftKey", "altKey"] as const) {
      expect(isModifiedClick({ button: 0, [k]: true }), k).toBe(true);
    }
  });

  it("isHashHref", () => {
    expect(isHashHref("#/a")).toBe(true);
    expect(isHashHref("#")).toBe(true);
    expect(isHashHref("/a")).toBe(false);
    expect(isHashHref(undefined)).toBe(false);
  });
});

describe("nav-link — shouldPreventNavigation: o caso que o bug era", () => {
  it("CANCELA em href de path + handler + clique simples", () => {
    // Este é o defeito relatado: `<a href="/app/clientes">` sem preventDefault fazia o
    // browser recarregar a página inteira a cada clique de menu.
    expect(
      shouldPreventNavigation({
        href: "/app/clientes",
        hasHandler: true,
        event: plain,
      }),
    ).toBe(true);
  });
});

describe("nav-link — as 5 exceções, cada uma quebraria algo real", () => {
  it("NÃO cancela sem handler — ninguém trataria, o `<a>` é a navegação", () => {
    expect(
      shouldPreventNavigation({ href: "/app", hasHandler: false, event: plain }),
    ).toBe(false);
  });

  it("NÃO cancela href de HASH — cancelar impede o `hashchange` de disparar", () => {
    // A exceção mais importante: cancelar aqui trocaria "recarrega" por "NÃO NAVEGA"
    // em todo consumidor de hash router — e no `example-app-shell` do próprio DS,
    // cujo nav-data usa `#/app/...` em todos os itens.
    expect(
      shouldPreventNavigation({ href: "#/app/clientes", hasHandler: true, event: plain }),
    ).toBe(false);
    expect(shouldPreventNavigation({ href: "#", hasHandler: true, event: plain })).toBe(false);
  });

  it("NÃO cancela link externo — router nenhum resolve, e o link morreria", () => {
    for (const h of ["https://x.com", "mailto:a@b.c", "tel:+55", "//cdn.x"]) {
      expect(
        shouldPreventNavigation({ href: h, hasHandler: true, event: plain }),
        h,
      ).toBe(false);
    }
  });

  it("NÃO cancela clique modificado — é como o usuário abre em nova aba", () => {
    for (const mod of [
      { button: 1 },
      { metaKey: true },
      { ctrlKey: true },
      { shiftKey: true },
      { altKey: true },
    ]) {
      expect(
        shouldPreventNavigation({
          href: "/app",
          hasHandler: true,
          event: { button: 0, defaultPrevented: false, ...mod } as never,
        }),
        JSON.stringify(mod),
      ).toBe(false);
    }
  });

  it("NÃO cancela com target que não é _self", () => {
    expect(
      shouldPreventNavigation({ href: "/app", hasHandler: true, target: "_blank", event: plain }),
    ).toBe(false);
    expect(
      shouldPreventNavigation({ href: "/app", hasHandler: true, target: "_self", event: plain }),
    ).toBe(true);
  });

  it("NÃO cancela se alguém já cancelou antes", () => {
    expect(
      shouldPreventNavigation({
        href: "/app",
        hasHandler: true,
        event: { button: 0, defaultPrevented: true } as never,
      }),
    ).toBe(false);
  });

  it("NÃO cancela sem href — é `<button>`, não há navegação", () => {
    expect(shouldPreventNavigation({ hasHandler: true, event: plain })).toBe(false);
  });
});
