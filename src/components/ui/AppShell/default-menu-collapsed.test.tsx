import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useState } from "react";
import appShellSrc from "./app-shell.tsx?raw";

/**
 * Regra do default responsivo de `defaultMenuCollapsed` do AppShell.
 *
 * Testa a REGRA, não o componente inteiro: montar o AppShell exigiria mocks de
 * contexts/commands/breadcrumb e testaria sobretudo os filhos. O que pode quebrar em
 * silêncio aqui é a precedência — `undefined` cai no viewport, valor explícito vence
 * INCLUSIVE quando é `false`. Um `defaultMenuCollapsed = false` na desestruturação
 * (como era antes) apaga essa distinção e nada acusa: o menu só deixa de colapsar.
 *
 * A expressão abaixo é a MESMA do `app-shell.tsx`. Se alguém mudar lá e não aqui, o
 * teste passa achando que cobre — então o `it` final compara com o código-fonte.
 */
function initialCollapsed(defaultMenuCollapsed: boolean | undefined): boolean {
  if (defaultMenuCollapsed !== undefined) return defaultMenuCollapsed;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 1535px)").matches;
}

/** Finge um viewport de largura `w` pro `matchMedia` do jsdom. */
function viewport(w: number) {
  vi.stubGlobal("matchMedia", (q: string) => {
    const m = /max-width:\s*(\d+)px/.exec(q);
    return {
      matches: m ? w <= Number(m[1]) : false,
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
    } as unknown as MediaQueryList;
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("AppShell — default responsivo do collapse", () => {
  it("nasce COLAPSADO na faixa notebook (768–1535)", () => {
    for (const w of [768, 1366, 1440, 1535]) {
      viewport(w);
      expect(initialCollapsed(undefined), `${w}px`).toBe(true);
    }
  });

  it("nasce EXPANDIDO no desktop (≥1536)", () => {
    for (const w of [1536, 1920, 2560]) {
      viewport(w);
      expect(initialCollapsed(undefined), `${w}px`).toBe(false);
    }
  });

  it("a fronteira é 1535/1536, não 'perto de 1536'", () => {
    viewport(1535);
    expect(initialCollapsed(undefined)).toBe(true);
    viewport(1536);
    expect(initialCollapsed(undefined)).toBe(false);
  });

  it("`false` explícito VENCE o viewport — é a razão de a prop não ter default", () => {
    // Regressão direta: com `defaultMenuCollapsed = false` na desestruturação, o
    // `undefined` virava `false` e a regra responsiva nunca rodava.
    viewport(1366);
    expect(initialCollapsed(false)).toBe(false);
  });

  it("`true` explícito vence no desktop", () => {
    viewport(1920);
    expect(initialCollapsed(true)).toBe(true);
  });

  it("SSR (sem window) cai em expandido, sem lançar", () => {
    vi.stubGlobal("window", undefined);
    expect(() => initialCollapsed(undefined)).not.toThrow();
  });
});

describe("AppShell — o teste cobre o código de produção", () => {
  it("a query do app-shell.tsx é a mesma testada aqui", () => {
    // Sem isto, mudar o breakpoint no componente deixa este arquivo verde e
    // desatualizado — teste que concorda consigo mesmo não é evidência (L-064).
    // `?raw` (Vite) em vez de node:fs: o tsconfig de src/ não tem tipos do Node.
    expect(appShellSrc).toContain('matchMedia("(max-width: 1535px)")');
    expect(appShellSrc).toContain("defaultMenuCollapsed !== undefined");
  });
});

describe("useState com initializer — o default só age no mount", () => {
  it("re-render com outro default NÃO troca o estado", () => {
    // Garante a decisão de não ser reativo: depois que o usuário mexe no menu,
    // nada re-colapsa sozinho.
    viewport(1366);
    const { result, rerender } = renderHook(
      ({ d }: { d: boolean | undefined }) => useState(() => initialCollapsed(d))[0],
      { initialProps: { d: undefined as boolean | undefined } },
    );
    expect(result.current).toBe(true);
    viewport(1920);
    rerender({ d: undefined });
    expect(result.current, "mudar o viewport não pode alterar o estado já montado").toBe(true);
  });
});
