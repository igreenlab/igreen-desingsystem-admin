import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import {
  checkLibExternals,
  lerExternals,
  subpathsImportados,
} from "./lib-externals.mjs";

const CONFIG = "vite.lib.config.ts";
/** Só o que vira pacote. `src/preview` e `src/examples` são showcase. */
const RAIZES = ["src/components", "src/lib", "src/utils", "src/hooks", "tokens"];

const arquivos = [];
const andar = (d) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (/node_modules|dist/.test(p)) continue;
    if (e.isDirectory()) andar(p);
    else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\./.test(e.name))
      arquivos.push({ path: p, codigo: readFileSync(p, "utf8") });
  }
};
for (const r of RAIZES) andar(r);

describe("lib-externals — lógica pura", () => {
  it("acusa subpath cujo pacote só tem a string exata", () => {
    const { descobertos } = checkLibExternals({
      externals: { exatos: ["date-fns"], regex: [], achou: true },
      arquivos: [{ path: "a.ts", codigo: 'import { ptBR } from "date-fns/locale";' }],
    });
    expect(descobertos).toEqual([
      { specifier: "date-fns/locale", pacote: "date-fns", arquivo: "a.ts" },
    ]);
  });

  it("o par regex resolve", () => {
    const { descobertos } = checkLibExternals({
      externals: { exatos: ["date-fns"], regex: ["date-fns"], achou: true },
      arquivos: [{ path: "a.ts", codigo: 'import { ptBR } from "date-fns/locale";' }],
    });
    expect(descobertos).toEqual([]);
  });

  it("o specifier declarado explícito também resolve", () => {
    const { descobertos } = checkLibExternals({
      externals: { exatos: ["react-dom", "react-dom/client"], regex: [], achou: true },
      arquivos: [{ path: "a.ts", codigo: 'import x from "react-dom/client";' }],
    });
    expect(descobertos).toEqual([]);
  });

  it("pacote que NÃO é external não é deste gate — é dep bundlada de propósito", () => {
    const { descobertos } = checkLibExternals({
      externals: { exatos: ["react"], regex: [], achou: true },
      arquivos: [{ path: "a.ts", codigo: 'import x from "qualquer/coisa";' }],
    });
    expect(descobertos).toEqual([]);
  });

  it("import relativo não é subpath de pacote", () => {
    expect(subpathsImportados('import x from "./a/b";')).toEqual([]);
    expect(subpathsImportados('import x from "@/components/ui/Kpi";')).toEqual([]);
  });
});

describe("lib-externals — o repo hoje", () => {
  const externals = lerExternals(readFileSync(CONFIG, "utf8"));

  it("o parser acha o bloco external de verdade", () => {
    // Sem isto, um config reorganizado devolveria listas vazias e o gate passaria
    // vazio, que é o modo de falha da L-064.
    expect(externals.achou, `bloco external não encontrado em ${CONFIG}`).toBe(true);
    expect(externals.exatos.length).toBeGreaterThan(10);
    expect(externals.regex.length).toBeGreaterThan(0);
    expect(arquivos.length).toBeGreaterThan(50);
  });

  it("nenhum subpath importado fica de fora do external", () => {
    const { descobertos } = checkLibExternals({ externals, arquivos });
    expect(
      descobertos.map((d) => `${d.arquivo}: "${d.specifier}" (external tem só "${d.pacote}")`),
      "Import de SUBPATH cujo pacote está no `external` apenas como string exata. " +
        "String casa o specifier inteiro, então o subpath é BUNDLADO e o import sai do " +
        "tarball como ../../../../node_modules/… — o build do consumidor quebra. " +
        `Acrescente /^<pacote>\\// ao external em ${CONFIG}, ao lado da string.`,
    ).toEqual([]);
  });

  it("o gate REPROVA o caso real que originou ele (L-064)", () => {
    // date-fns/locale com o external de ANTES do conserto.
    const semRegex = { ...externals, regex: externals.regex.filter((r) => r !== "date-fns") };
    const { descobertos } = checkLibExternals({ externals: semRegex, arquivos });
    expect(
      descobertos.some((d) => d.specifier === "date-fns/locale"),
      "removendo /^date-fns\\// o gate deveria acusar o DatePicker — se não acusa, " +
        "o parser ou o escopo de arquivos mudou",
    ).toBe(true);
  });
});
