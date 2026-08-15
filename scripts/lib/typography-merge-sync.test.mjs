import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  checkTypographyMergeSync,
  presetsDoTema,
  presetsDoMerge,
} from "./typography-merge-sync.mjs";

const TEMA = "src/styles/theme/tailwind-theme.css";
const TV = "src/utils/tv.ts";
const CN = "src/lib/utils.ts";

const lerTema = () => presetsDoTema(readFileSync(TEMA, "utf8"));
const lerMerge = (p) => presetsDoMerge(readFileSync(p, "utf8"));

describe("typography-merge-sync — lógica pura", () => {
  it("acusa preset do tema ausente de um dos merges", () => {
    const { faltando } = checkTypographyMergeSync({
      tema: ["body-sm", "stat-lg"],
      consumidores: { "tv.ts": ["body-sm", "stat-lg"], "utils.ts": ["body-sm"] },
    });
    expect(faltando).toEqual([{ arquivo: "utils.ts", preset: "stat-lg" }]);
  });

  it("acusa entrada morta — registrada no merge e ausente do tema", () => {
    const { mortos } = checkTypographyMergeSync({
      tema: ["body-sm"],
      consumidores: { "tv.ts": ["body-sm", "label-xs"] },
    });
    expect(mortos).toEqual([{ arquivo: "tv.ts", preset: "label-xs" }]);
  });

  it("em sincronia → nenhum achado", () => {
    const r = checkTypographyMergeSync({
      tema: ["body-sm", "stat-lg"],
      consumidores: { a: ["stat-lg", "body-sm"], b: ["body-sm", "stat-lg"] },
    });
    expect(r.faltando).toEqual([]);
    expect(r.mortos).toEqual([]);
  });
});

describe("typography-merge-sync — parsers", () => {
  it("extrai preset do tema por @utility", () => {
    expect(presetsDoTema("@utility text-body-sm {\n}\n@utility text-stat-lg {")).toEqual([
      "body-sm",
      "stat-lg",
    ]);
  });

  it("NÃO confunde classe de cor com preset", () => {
    // `text-fg-default` é cor, não font-size — e não é emitida como @utility.
    expect(presetsDoTema(".x { color: var(--color-fg-default) }")).toEqual([]);
  });

  it("extrai do bloco text: [ … ] ignorando comentário", () => {
    const src = `text: [
      // Displays (fluid clamp)
      "display-2xl", "display-xl",
      // Stat
      "stat-sm",
    ],`;
    expect(presetsDoMerge(src)).toEqual(["display-2xl", "display-xl", "stat-sm"]);
  });

  it("devolve vazio sem estourar quando o bloco não existe", () => {
    expect(presetsDoMerge("const x = 1;")).toEqual([]);
  });
});

describe("typography-merge-sync — o repo hoje", () => {
  // Guarda contra parser quebrado: sem isto, um regex que parasse de casar
  // devolveria listas vazias dos dois lados e o gate passaria vazio (L-064).
  it("os parsers encontram os presets de verdade", () => {
    expect(lerTema().length, `nenhum @utility text-* em ${TEMA}`).toBeGreaterThan(20);
    expect(lerMerge(TV).length, `bloco text: [] não encontrado em ${TV}`).toBeGreaterThan(20);
    expect(lerMerge(CN).length, `bloco text: [] não encontrado em ${CN}`).toBeGreaterThan(20);
  });

  it("todo preset do tema está nos DOIS merges (L-016)", () => {
    const { faltando } = checkTypographyMergeSync({
      tema: lerTema(),
      consumidores: { [TV]: lerMerge(TV), [CN]: lerMerge(CN) },
    });
    expect(
      faltando.map((f) => `${f.arquivo}: falta "${f.preset}"`),
      "preset emitido pelo tema e ausente de um merge — o tailwind-merge REMOVE a classe " +
        "em silêncio quando o elemento também tem cor (text-fg-*). Adicione o nome ao " +
        `bloco text: [] do arquivo apontado. Se o preset saiu do DS, remova-o do transform.`,
    ).toEqual([]);
  });

  it("nenhum merge registra preset que o tema não emite", () => {
    const { mortos } = checkTypographyMergeSync({
      tema: lerTema(),
      consumidores: { [TV]: lerMerge(TV), [CN]: lerMerge(CN) },
    });
    expect(
      mortos.map((m) => `${m.arquivo}: "${m.preset}" não existe no tema`),
      "entrada morta no merge — o preset não é mais emitido pelo transform",
    ).toEqual([]);
  });

  it("o gate REPROVA quando um preset sai de um merge de verdade (L-064)", () => {
    // Fixture sintética não prova nada sobre o repo: aqui eu tiro o `stat-lg` do
    // arquivo REAL — reproduzindo o defeito exatamente como ele estava — e confiro
    // que acusa, no arquivo certo.
    const real = readFileSync(CN, "utf8");
    const semStat = real.replace('"stat-lg", ', "");
    expect(semStat, "o formato da linha dos stat mudou — ajuste o teste").not.toBe(real);

    const { faltando } = checkTypographyMergeSync({
      tema: lerTema(),
      consumidores: { [TV]: lerMerge(TV), [CN]: presetsDoMerge(semStat) },
    });
    expect(faltando).toEqual([{ arquivo: CN, preset: "stat-lg" }]);
  });
});
