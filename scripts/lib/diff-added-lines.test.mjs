import { describe, expect, it } from "vitest";
import { parseAddedLines } from "./diff-added-lines.mjs";

/* Parser de `git diff -U0`. Com -U0 não há linha de contexto,
   então toda linha `+` é adição real. */

describe("parseAddedLines", () => {
  it("extrai linha adicionada com o número real no arquivo novo", () => {
    const diff = [
      "diff --git a/a.ts b/a.ts",
      "--- a/a.ts",
      "+++ b/a.ts",
      "@@ -10,0 +11 @@",
      '+  base: "gap-4",',
    ].join("\n");
    expect(parseAddedLines(diff).get("a.ts")).toEqual([
      { n: 11, text: '  base: "gap-4",' },
    ]);
  });

  it("incrementa o número em adições consecutivas", () => {
    const diff = ["+++ b/a.ts", "@@ -0,0 +5,3 @@", "+l5", "+l6", "+l7"].join("\n");
    expect(parseAddedLines(diff).get("a.ts").map((l) => l.n)).toEqual([5, 6, 7]);
  });

  it("reinicia a contagem em cada hunk novo", () => {
    const diff = [
      "+++ b/a.ts",
      "@@ -1,0 +2 @@",
      "+dois",
      "@@ -50,0 +80,2 @@",
      "+oitenta",
      "+oitentaeum",
    ].join("\n");
    expect(parseAddedLines(diff).get("a.ts")).toEqual([
      { n: 2, text: "dois" },
      { n: 80, text: "oitenta" },
      { n: 81, text: "oitentaeum" },
    ]);
  });

  it("aceita o sufixo de function-context do hunk (forma real do git)", () => {
    // git emite: @@ -1,2 +3,4 @@ export const foo = tv({
    const diff = [
      "+++ b/a.ts",
      "@@ -1,0 +7 @@ export const card = tv({",
      "+  base: \"gap-4\",",
    ].join("\n");
    expect(parseAddedLines(diff).get("a.ts")).toEqual([
      { n: 7, text: '  base: "gap-4",' },
    ]);
  });

  it("separa por arquivo", () => {
    const diff = [
      "+++ b/a.ts",
      "@@ -0,0 +1 @@",
      "+do a",
      "diff --git a/b.ts b/b.ts",
      "+++ b/b.ts",
      "@@ -0,0 +1 @@",
      "+do b",
    ].join("\n");
    const out = parseAddedLines(diff);
    expect(out.get("a.ts")).toEqual([{ n: 1, text: "do a" }]);
    expect(out.get("b.ts")).toEqual([{ n: 1, text: "do b" }]);
  });

  it("ignora linhas removidas (deleção pura não gera entrada)", () => {
    const diff = ["+++ b/a.ts", "@@ -3,2 +2,0 @@", "-foi", "-embora"].join("\n");
    expect(parseAddedLines(diff).get("a.ts")).toEqual([]);
  });

  it("em hunk misto, conta só as linhas adicionadas", () => {
    const diff = [
      "+++ b/a.ts",
      "@@ -5,1 +5,2 @@",
      '-  base: "gap-gp-md",',
      '+  base: "gap-4",',
      '+  extra: "p-sp-md",',
    ].join("\n");
    expect(parseAddedLines(diff).get("a.ts")).toEqual([
      { n: 5, text: '  base: "gap-4",' },
      { n: 6, text: '  extra: "p-sp-md",' },
    ]);
  });

  it("arquivo deletado (+++ /dev/null) não entra no resultado", () => {
    const diff = ["--- a/a.ts", "+++ /dev/null", "@@ -1,1 +0,0 @@", "-adeus"].join("\n");
    expect(parseAddedLines(diff).size).toBe(0);
  });

  it("não confunde o header +++ com uma linha adicionada", () => {
    const diff = ["+++ b/a.ts", "@@ -0,0 +1 @@", "+conteudo"].join("\n");
    const lines = parseAddedLines(diff).get("a.ts");
    expect(lines).toHaveLength(1);
    expect(lines[0].text).toBe("conteudo");
  });

  it("devolve Map vazio pra diff vazio", () => {
    expect(parseAddedLines("").size).toBe(0);
  });
});
