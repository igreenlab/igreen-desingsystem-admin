import { describe, it, expect } from "vitest";
import { readdirSync, existsSync } from "node:fs";
import {
  foundationalPairs,
  brandOverlays,
  orphanBakedOverlays,
  FIXOS,
  THEME_DIR,
  TEMPLATE_THEME_DIR,
} from "./foundational-pairs.mjs";

describe("foundational-pairs — descoberta dos overlays de marca", () => {
  it("descobre um overlay por brand-*.css presente na fonte", () => {
    const naPasta = readdirSync(THEME_DIR).filter((f) => /^brand-.+\.css$/.test(f));
    expect(brandOverlays().sort()).toEqual(naPasta.sort());
  });

  it("descobre as marcas de hoje, e nenhuma delas está enumerada no código", () => {
    // Se alguém trocar descoberta por lista fixa, este teste continua verde —
    // mas o de baixo ("nada de brand-* nos FIXOS") é o que trava a regressão.
    expect(brandOverlays()).toContain("brand-vibrant.css");
    expect(brandOverlays().length).toBeGreaterThanOrEqual(4);
  });

  it("não enumera marca nos FIXOS — marca nova não pode depender de editar lista", () => {
    const fixosComMarca = FIXOS.filter(([src]) => /brand-/.test(src));
    expect(fixosComMarca).toEqual([]);
  });

  it("é ordenado e estável entre chamadas (senão o diff do rebake vira ruído)", () => {
    expect(brandOverlays()).toEqual([...brandOverlays()].sort());
    expect(foundationalPairs()).toEqual(foundationalPairs());
  });
});

describe("foundational-pairs — pares fonte ↔ baked", () => {
  it("mapeia cada overlay pro caminho correspondente no template", () => {
    for (const f of brandOverlays()) {
      const par = foundationalPairs().find(([src]) => src === `${THEME_DIR}/${f}`);
      expect(par, `par de ${f}`).toBeDefined();
      expect(par[1]).toBe(`${TEMPLATE_THEME_DIR}/${f}`);
    }
  });

  it("inclui os fixos + os overlays, sem duplicar", () => {
    const pares = foundationalPairs();
    expect(pares).toHaveLength(FIXOS.length + brandOverlays().length);
    const fontes = pares.map(([src]) => src);
    expect(new Set(fontes).size).toBe(fontes.length);
  });

  it("todo caminho de fonte existe no disco", () => {
    // Um par apontando pra arquivo inexistente faria o rebake lançar ENOENT no meio
    // da cópia, deixando o template metade novo e metade velho.
    for (const [src] of foundationalPairs()) {
      expect(existsSync(src), src).toBe(true);
    }
  });
});

describe("foundational-pairs — órfãos no baked", () => {
  it("hoje não há overlay no template sem fonte no DS", () => {
    expect(orphanBakedOverlays()).toEqual([]);
  });

  it("órfão é o que está no baked e NÃO na fonte (só a direção que o rebake não cobre)", () => {
    // `cli:rebake` copia; não remove. Então a única assimetria possível é baked→fonte,
    // e é ela que a função tem que enxergar.
    const naFonte = new Set(brandOverlays());
    const noBaked = existsSync(TEMPLATE_THEME_DIR)
      ? readdirSync(TEMPLATE_THEME_DIR).filter((f) => /^brand-.+\.css$/.test(f))
      : [];
    const esperado = noBaked.filter((f) => !naFonte.has(f)).sort();
    expect(orphanBakedOverlays()).toEqual(esperado);
  });
});
