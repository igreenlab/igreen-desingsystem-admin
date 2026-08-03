import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { contrastRatio, toHex } from "./brand-contrast.mjs";

/**
 * Os fixtures aqui NÃO foram escritos a partir do meu modelo mental da conversão —
 * são lidos de `tokens/brands/vibrant/primitives/color-palette.ts`, onde cada shade
 * carrega, em comentário, o hex e o ratio medidos quando a marca foi calibrada.
 *
 * Isso é deliberado (L-064): teste montado pelo mesmo raciocínio que gerou o código
 * concorda por construção e não é evidência. O comentário da paleta é registro
 * independente — se a matriz de conversão daqui estiver errada, o número bate com o
 * que eu inventei agora e briga com o que está gravado no repo.
 */
const PALETA = readFileSync(
  "tokens/brands/vibrant/primitives/color-palette.ts",
  "utf8",
);

/** Extrai `oklch(...)` + hex do comentário da linha do shade pedido. */
function shadeDaPaleta(shade) {
  const re = new RegExp(`^\\s+${shade}: "(oklch\\([^"]+\\))",\\s*//\\s*(#[0-9a-f]{6})`, "im");
  const m = re.exec(PALETA);
  if (!m) throw new Error(`shade ${shade} não encontrado com hex em comentário`);
  return { oklch: m[1], hexDocumentado: m[2] };
}

describe("brand-contrast — conversão OKLCH→sRGB", () => {
  it("reproduz o hex que a paleta da vibrant documenta em cada shade", () => {
    // 500/700/800 são os 3 shades com papel semântico e hex no comentário.
    for (const shade of [500, 700, 800]) {
      const { oklch, hexDocumentado } = shadeDaPaleta(shade);
      expect(toHex(oklch), `shade ${shade}`).toBe(hexDocumentado);
    }
  });

  it("round-trip do hex da marca: #0fff00 volta como #0fff00", () => {
    expect(toHex("oklch(0.866993 0.294055 142.3546)")).toBe("#0fff00");
  });
});

describe("brand-contrast — ratio WCAG", () => {
  it("bate com o 4.47:1 que a paleta registra pro brand[700] no branco", () => {
    // Esse número é o que motivou mover `border.brand` de 500 pra 700: reprova AA
    // de texto (4.5) e passa o limiar de UI (3.0). Se a matriz derivar, quebra aqui.
    const { oklch } = shadeDaPaleta(700);
    expect(contrastRatio(oklch, "#ffffff")).toBeCloseTo(4.47, 1);
  });

  it("bate com o 6.56:1 do brand[800] — o 1º shade com AA folgado no branco", () => {
    const { oklch } = shadeDaPaleta(800);
    expect(contrastRatio(oklch, "#ffffff")).toBeCloseTo(6.56, 1);
  });

  it("preto sobre a marca fluorescente dá 15.32:1 (o que decidiu fg.on-brand no dark)", () => {
    expect(contrastRatio("#000000", "#0fff00")).toBeCloseTo(15.32, 1);
  });

  it("branco sobre a marca fluorescente reprova — é por isso que on-brand não é branco", () => {
    expect(contrastRatio("#ffffff", "#0fff00")).toBeLessThan(1.5);
  });

  it("é simétrico e vale 1:1 pra cor consigo mesma", () => {
    expect(contrastRatio("#0fff00", "#000000")).toBeCloseTo(contrastRatio("#000000", "#0fff00"), 5);
    expect(contrastRatio("#767676", "#767676")).toBeCloseTo(1, 5);
  });

  it("aceita as palavras white/black e hex de 3 dígitos", () => {
    expect(contrastRatio("white", "black")).toBeCloseTo(21, 1);
    expect(contrastRatio("#fff", "#000")).toBeCloseTo(21, 1);
  });

  it("rejeita cor não reconhecida em vez de devolver número silencioso", () => {
    // Devolver 1:1 pra entrada inválida faria a medição "passar" sem medir nada.
    expect(() => contrastRatio("verde-limão", "#fff")).toThrow(/não reconhecida/);
  });
});
