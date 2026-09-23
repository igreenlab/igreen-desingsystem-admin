import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  topLevelEffects,
  padraoDist,
  checkSideEffectsDeclared,
} from "./side-effects-declared.mjs";

describe("side-effects-declared — o que conta como efeito de topo", () => {
  it("chamada de registro no topo é efeito", () => {
    const t = `import { r } from "./r";\nr.registerMany([A, B]);\nexport const x = 1;`;
    expect(topLevelEffects(t).map((e) => e.linha)).toEqual([2]);
  });

  it("padrão de componente NÃO é efeito: declaração, displayName, sub-componente, diretiva", () => {
    const t = [
      `"use client";`,
      `const Button = forwardRef((p, ref) => null);`,
      `const styles = tv({ base: "x" });`,
      `Button.displayName = "Button";`,
      `Table.Row = Row;`,
      `export { Button };`,
    ].join("\n");
    expect(topLevelEffects(t)).toEqual([]);
  });

  it("atribuição em global É efeito", () => {
    expect(topLevelEffects(`window.__ds = 1;`)).toHaveLength(1);
    expect(topLevelEffects(`globalThis.x = 1;`)).toHaveLength(1);
  });

  it("mapeia o fonte pro padrão de dist-lib", () => {
    expect(padraoDist("src/components/ui/DataTable/column-types/index.ts")).toBe(
      "./dist-lib/src/components/ui/DataTable/column-types/index.*",
    );
  });
});

describe("side-effects-declared — contra o repo real", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));

  it("todo módulo publicado com efeito de topo está no sideEffects, e não sobra entrada", () => {
    const { faltando, sobrando } = checkSideEffectsDeclared({ pkg });
    expect(
      faltando.map((f) => `${f.arquivo}:${f.efeitos[0].linha} → falta "${f.padrao}" no sideEffects do package.json`),
      "módulo que roda código no import é DESCARTADO pelo bundler do consumidor npm se não estiver no " +
        "`sideEffects` — em build de produção, sem erro. Adicione o padrão indicado (e explique no //sideEffects).",
    ).toEqual([]);
    expect(sobrando, "entrada do sideEffects sem módulo com efeito correspondente — remova").toEqual([]);
  });

  it("reprova o defeito real: sem a entrada do column-types, acusa exatamente ele", () => {
    // L-064: o gate só está pronto depois de reproduzir o defeito e ver reprovar. Este é
    // o estado que, medido no consumidor, tirava o `registerMany` do bundle.
    const semColumnTypes = {
      ...pkg,
      sideEffects: pkg.sideEffects.filter((s) => !s.includes("column-types")),
    };
    const { faltando } = checkSideEffectsDeclared({ pkg: semColumnTypes });
    expect(faltando.map((f) => f.arquivo)).toEqual([
      "src/components/ui/DataTable/column-types/index.ts",
    ]);
  });
});
