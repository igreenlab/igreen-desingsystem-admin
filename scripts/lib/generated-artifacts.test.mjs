import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  generatedArtifacts,
  uncoveredThemeFiles,
  compareGenerated,
  checkGeneratedArtifacts,
  regenerate,
  norm,
  THEME_DIR,
} from "./generated-artifacts.mjs";

describe("generated-artifacts — comparação", () => {
  it("iguala ignorando CRLF e BOM (variam por checkout no Windows)", () => {
    expect(compareGenerated("a\nb\n", "a\r\nb\r\n")).toEqual({ equal: true });
    expect(compareGenerated("﻿a\n", "a\n")).toEqual({ equal: true });
  });

  it("aponta a PRIMEIRA linha divergente, não só 'difere'", () => {
    // O tema tem 712 linhas: "difere" sem posição não diz se foi um token ou o header.
    const r = compareGenerated("h\n--a: 1px;\n--b: 2px;\n", "h\n--a: 1px;\n--b: 9px;\n");
    expect(r).toMatchObject({ equal: false, linha: 3, esperado: "--b: 2px;", atual: "--b: 9px;" });
  });

  it("trata linha faltante como divergência, rotulando o fim do arquivo", () => {
    // `"a\nb\n".split` deixa um "" final, então truncar por 1 linha compara `b` com
    // string vazia — divergência real, sem rótulo especial.
    expect(compareGenerated("a\nb\n", "a\n")).toMatchObject({ equal: false, linha: 2, esperado: "b" });
    // Fora do alcance do array é que vira "(fim do arquivo)".
    expect(compareGenerated("a\nb\nc", "a")).toMatchObject({
      equal: false,
      linha: 2,
      esperado: "b",
      atual: "(fim do arquivo)",
    });
  });
});

describe("generated-artifacts — catálogo", () => {
  it("deriva um artefato por marca do catálogo, isentando a default", () => {
    const arts = generatedArtifacts(["default", "blue", "roxo"]);
    expect(arts.map((a) => a.out)).toEqual([
      "src/styles/theme/tailwind-theme.css",
      "src/styles/theme/brand-blue.css",
      "src/styles/theme/brand-roxo.css",
    ]);
    // `default` não tem overlay — é o tema-base. Mesma isenção do brand-surfaces.
    expect(arts.some((a) => a.out.includes("brand-default"))).toBe(false);
  });

  it("cada artefato carrega o comando npm que o regenera", () => {
    // Sem isso a mensagem de erro não diz o que rodar — e o gate vira enigma.
    const arts = generatedArtifacts(["default", "pay"]);
    expect(arts[0].npm).toBe("npm run tokens:tw4");
    expect(arts[1].npm).toBe("npm run tokens:brand:pay");
  });

  it("acusa .css do tema que nenhum gerador produz", () => {
    // Cobertura por omissão é o modo de falha: uma 6ª marca entraria sem conferência
    // e o resumo diria "✓ N em sync" sobre um conjunto incompleto.
    const semBlue = generatedArtifacts(["default", "green", "pay", "vibrant"]);
    expect(uncoveredThemeFiles(semBlue)).toContain(`${THEME_DIR}/brand-blue.css`);
  });
});

describe("generated-artifacts — o repo hoje", () => {
  it("todo .css de src/styles/theme tem gerador conhecido", () => {
    expect(
      uncoveredThemeFiles(),
      "arquivo de tema sem gerador — acrescente o transform em generatedArtifacts()",
    ).toEqual([]);
  });

  it(
    "o CSS commitado bate com os tokens-fonte",
    () => {
      // ESTE é o gate. Editar tokens/**/*.ts sem `npm run tokens:tw4` passava verde
      // em TODOS os checks — e todos os gates de cor (dead-theme-classes,
      // shadcn-vocab, orphan-utilities, runtime-base) leem justamente este CSS.
      const { defasados, ausentes, conferidos } = checkGeneratedArtifacts();
      expect(ausentes, "artefato gerado ausente do disco").toEqual([]);
      expect(
        defasados.map((d) => `${d.out}:${d.linha} — esperado \`${d.esperado}\`, achei \`${d.atual}\` (rode: ${d.npm})`),
        "CSS commitado DEFASADO em relação aos tokens",
      ).toEqual([]);
      expect(conferidos).toBeGreaterThanOrEqual(5);
    },
    30_000, // ~0,6 s por transform × 5
  );

  it("o gate REPROVA um tema adulterado (L-064: veja falhar antes de confiar)", () => {
    // Gate novo só vale depois de reproduzir o defeito que ele existe pra pegar.
    // Aqui o defeito é literal: alguém edita o token, o CSS fica pro trás.
    const art = generatedArtifacts()[0];
    const real = readFileSync(art.out, "utf8");
    const adulterado = norm(real).replace("--color-bg-brand:", "--color-bg-brandX:");
    expect(adulterado, "a var de controle sumiu do tema — ajuste o teste").not.toBe(norm(real));

    const r = compareGenerated(regenerate(art), adulterado);
    expect(r.equal).toBe(false);
    expect(r.esperado).toContain("--color-bg-brand:");
  }, 15_000);
});
