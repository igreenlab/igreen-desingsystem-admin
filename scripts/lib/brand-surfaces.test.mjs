import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { checkBrandSurfaces, brandsDoCatalogo, SUPERFICIES, CATALOGO } from "./brand-surfaces.mjs";

describe("brand-surfaces — catálogo", () => {
  it("lê os ids do BRANDS do useBrand.ts", () => {
    const ids = brandsDoCatalogo();
    expect(ids[0]).toBe("default"); // fallback do hook é a 1ª entrada
    expect(ids).toEqual(expect.arrayContaining(["blue", "green", "pay", "vibrant"]));
  });

  it("lança quando não acha o array (arquivo renomeado/refatorado)", () => {
    // Devolver [] silenciosamente faria o gate passar sem checar marca nenhuma —
    // verde-permanente, que é pior que gate ausente.
    expect(() => brandsDoCatalogo("const outraCoisa = [];")).toThrow(/BRANDS/);
  });

  it("o type Brand e o catálogo BRANDS listam as MESMAS marcas", () => {
    // Divergência aqui é silenciosa: id no type sem entrada no catálogo não aparece
    // em seletor nenhum; entrada sem o type não compila, mas o inverso passa.
    const src = readFileSync(CATALOGO, "utf8");
    const type = /export type Brand\s*=\s*([^;]+);/.exec(src);
    expect(type, "type Brand não encontrado").toBeTruthy();
    const noType = [...type[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]).sort();
    expect(noType).toEqual([...brandsDoCatalogo()].sort());
  });
});

describe("brand-surfaces — as 10 superfícies", () => {
  it("são 10, e nenhuma duplicada", () => {
    expect(SUPERFICIES).toHaveLength(10);
    const nomes = SUPERFICIES.map((s) => s.nome);
    expect(new Set(nomes).size).toBe(10);
  });

  it("as marcas de hoje estão TODAS fechadas", () => {
    // É este que reprova o PR que adiciona marca e esquece uma superfície.
    const { faltando, marcas } = checkBrandSurfaces();
    expect(faltando, `superfícies abertas: ${JSON.stringify(faltando)}`).toEqual([]);
    expect(marcas.length).toBeGreaterThanOrEqual(5);
  });

  it("marca fantasma (só no catálogo) acusa as 10", () => {
    // O cenário real: alguém acrescenta o id no BRANDS e para aí.
    const { faltando } = checkBrandSurfaces(["fantasma"]);
    expect(faltando).toHaveLength(10);
    expect(faltando.every((f) => f.marca === "fantasma")).toBe(true);
  });

  it("isenta a `default` só do que ela genuinamente não tem", () => {
    // default é o tema-base: sem overlay, sem script, sem BRAND_LABELS próprio.
    // Mas TEM tokens, item de registry (`theme`), PALETAS e menção no ds-themes.
    const { faltando } = checkBrandSurfaces(["default"]);
    expect(faltando).toEqual([]);
    const isentas = SUPERFICIES.filter((s) => s.soNaoDefault).map((s) => s.nome);
    expect(isentas).toHaveLength(6);
    expect(isentas).not.toContain("item de registry");
    expect(isentas).not.toContain("PALETAS do ColorsDoc");
  });

  it("uma marca ausente não contamina o veredito das outras", () => {
    const { faltando } = checkBrandSurfaces(["vibrant", "fantasma"]);
    expect(faltando.filter((f) => f.marca === "vibrant")).toEqual([]);
    expect(faltando.filter((f) => f.marca === "fantasma")).toHaveLength(10);
  });
});
