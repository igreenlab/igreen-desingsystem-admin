import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { BRANDS, useBrand, type BrandOption } from "./useBrand";

/**
 * O que estes testes existem pra pegar — todos modos de falha SILENCIOSOS, que é o
 * padrão desta área: escrever `data-theme` errado não lança erro, só não estiliza.
 *
 *   1. Catálogo injetável de verdade — subconjunto valida e cicla só o que recebeu.
 *   2. Valor persistido FORA do catálogo cai no fallback em vez de virar
 *      `data-theme` que não existe no bundle.
 *   3. `default` = ausência de atributo (o tema-base não tem overlay). Escrever
 *      `data-theme="default"` seria um seletor que nenhum CSS casa.
 *   4. `toggle()` percorre o catálogo — antes era `default↔blue` cravado, e com 5
 *      marcas o botão mobile do showcase mentia.
 */

const chave = "igreen-ds-brand";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});
afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("useBrand — catálogo default (as 5 do DS)", () => {
  it("começa na primeira entrada do catálogo e NÃO escreve data-theme pra default", () => {
    const { result } = renderHook(() => useBrand());
    expect(result.current.brand).toBe("default");
    // `default` é o tema-base: atributo ausente, não `data-theme="default"`
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("escreve o atributo pra marca não-default e remove ao voltar pra default", () => {
    const { result } = renderHook(() => useBrand());
    act(() => result.current.setBrand("vibrant"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("vibrant");
    act(() => result.current.setBrand("default"));
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("expõe `current` com label e swatch da marca ativa", () => {
    const { result } = renderHook(() => useBrand());
    act(() => result.current.setBrand("pay"));
    expect(result.current.current.label).toBe("Pay");
    expect(result.current.current.swatch).toBe("#00a859");
  });

  it("toggle percorre TODAS as 5, circular — não alterna default↔blue", () => {
    const { result } = renderHook(() => useBrand());
    const visitadas: string[] = [result.current.brand];
    for (let i = 0; i < BRANDS.length; i++) {
      act(() => result.current.toggle());
      visitadas.push(result.current.brand);
    }
    // passou por todas e voltou ao início
    expect(new Set(visitadas).size).toBe(BRANDS.length);
    expect(visitadas[visitadas.length - 1]).toBe(visitadas[0]);
  });

  it("restaura do localStorage", () => {
    localStorage.setItem(chave, "green");
    const { result } = renderHook(() => useBrand());
    expect(result.current.brand).toBe("green");
    expect(document.documentElement.getAttribute("data-theme")).toBe("green");
  });
});

describe("useBrand — catálogo INJETADO (consumidor que instalou só alguns temas)", () => {
  const soVibrant: BrandOption[] = [
    { id: "default", label: "Padrão", swatch: "#000" },
    { id: "vibrant", label: "Vibrant", swatch: "#0fff00" },
  ];

  it("`brands` devolve o catálogo recebido, não os 5 do DS", () => {
    const { result } = renderHook(() => useBrand({ brands: soVibrant }));
    expect(result.current.brands.map((b) => b.id)).toEqual(["default", "vibrant"]);
  });

  it("toggle cicla SÓ o catálogo recebido", () => {
    const { result } = renderHook(() => useBrand({ brands: soVibrant }));
    act(() => result.current.toggle());
    expect(result.current.brand).toBe("vibrant");
    act(() => result.current.toggle());
    expect(result.current.brand).toBe("default");
  });

  it("valor persistido FORA do catálogo cai no fallback — não vira data-theme órfão", () => {
    // cenário real: usuário usou o showcase (salvou "pay"), depois abre um app que
    // só importou o overlay da vibrant. Escrever data-theme="pay" seria no-op mudo.
    localStorage.setItem(chave, "pay");
    const { result } = renderHook(() => useBrand({ brands: soVibrant }));
    expect(result.current.brand).toBe("default");
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });

  it("o fallback é a PRIMEIRA entrada, mesmo que não seja `default`", () => {
    localStorage.setItem(chave, "blue");
    const { result } = renderHook(() =>
      useBrand({ brands: [{ id: "vibrant", label: "V", swatch: "#0fff00" }] }),
    );
    expect(result.current.brand).toBe("vibrant");
    expect(document.documentElement.getAttribute("data-theme")).toBe("vibrant");
  });

  it("isBrand valida contra o catálogo ativo, não contra a união de tipos", () => {
    const { result } = renderHook(() => useBrand({ brands: soVibrant }));
    expect(result.current.isBrand("vibrant")).toBe(true);
    expect(result.current.isBrand("pay")).toBe(false); // existe no DS, não neste catálogo
    expect(result.current.isBrand("inexistente")).toBe(false);
  });
});

describe("useBrand — sincronia entre instâncias", () => {
  it("duas instâncias com o mesmo catálogo se sincronizam", () => {
    const a = renderHook(() => useBrand());
    const b = renderHook(() => useBrand());
    act(() => a.result.current.setBrand("blue"));
    expect(b.result.current.brand).toBe("blue");
  });

  it("instância com catálogo restrito IGNORA broadcast de marca que ela não tem", () => {
    const showcase = renderHook(() => useBrand());
    const app = renderHook(() =>
      useBrand({ brands: [{ id: "default", label: "P", swatch: "#000" }] }),
    );
    act(() => showcase.result.current.setBrand("vibrant"));
    expect(showcase.result.current.brand).toBe("vibrant");
    // a instância restrita não pode aplicar um tema cujo CSS não está no bundle dela
    expect(app.result.current.brand).toBe("default");
  });
});
