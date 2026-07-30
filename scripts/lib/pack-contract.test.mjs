import { describe, it, expect } from "vitest";
import {
  exportedPaths,
  filesDirGlobs,
  packContract,
  dtsSpecifiers,
  resolveDtsCandidates,
} from "./pack-contract.mjs";

// Estas duas funções são o que de fato pega a L-017 — a primeira versão do módulo
// olhava só entry points e passou batido num teste negativo (tirar dist-lib/src/**
// do `files` derrubou o tarball de 959 pra 123 arquivos e o check disse "ok").
describe("dtsSpecifiers", () => {
  it("pega export-from, import-from, import type e import() inline", () => {
    const s = dtsSpecifiers(`
      export * from './src/components/index';
      import { A } from "../a/b";
      import type { C } from './c';
      declare const x: import('./d').D;
    `);
    expect(s.sort()).toEqual(["../a/b", "./c", "./d", "./src/components/index"]);
  });

  it("ignora especificador de PACOTE (é dep do consumidor, não do tarball)", () => {
    expect(dtsSpecifiers(`import { X } from "react";\nexport * from "@radix-ui/x";`)).toEqual([]);
  });

  it("dedupe e conteúdo vazio/ausente não lançam", () => {
    expect(dtsSpecifiers(`from './a'\nfrom './a'`)).toEqual(["./a"]);
    expect(dtsSpecifiers(undefined)).toEqual([]);
  });
});

describe("resolveDtsCandidates", () => {
  // O caso real: dist-lib/index.d.ts é só `export * from './src/components/index'`.
  it("resolve relativo ao diretório do importador", () => {
    const c = resolveDtsCandidates("dist-lib/index.d.ts", "./src/components/index");
    expect(c).toContain("dist-lib/src/components/index.d.ts");
    expect(c).toContain("dist-lib/src/components/index/index.d.ts");
  });

  it("sobe com ..", () => {
    const c = resolveDtsCandidates("dist-lib/preview/chat.d.ts", "../src/preview/pages/ChatV2/index");
    expect(c).toContain("dist-lib/src/preview/pages/ChatV2/index.d.ts");
  });

  it("aceita especificador que já traz extensão", () => {
    expect(resolveDtsCandidates("a/b.d.ts", "./c.d.ts")).toContain("a/c.d.ts");
  });
});

describe("exportedPaths", () => {
  it("achata subpath × condição", () => {
    const r = exportedPaths({
      ".": { types: "./dist-lib/index.d.ts", import: "./dist-lib/index.mjs" },
      "./theme.css": "./dist-lib/theme.css",
    });
    expect(r).toEqual([
      { subpath: ".", condition: "types", path: "dist-lib/index.d.ts" },
      { subpath: ".", condition: "import", path: "dist-lib/index.mjs" },
      { subpath: "./theme.css", condition: "default", path: "dist-lib/theme.css" },
    ]);
  });

  it("aceita aninhamento de condições", () => {
    const r = exportedPaths({ ".": { node: { import: "./a.mjs" } } });
    expect(r.map((x) => x.path)).toEqual(["a.mjs"]);
  });

  it("exports ausente não lança", () => {
    expect(exportedPaths(undefined)).toEqual([]);
  });
});

describe("filesDirGlobs", () => {
  it("pega só entradas de diretório", () => {
    expect(filesDirGlobs(["dist-lib/index.*", "dist-lib/src/**", "README.md"])).toEqual([
      "dist-lib/src",
    ]);
  });
});

describe("packContract", () => {
  // Reproduz EXATAMENTE o bug da L-017: os .d.ts de estrutura preservada
  // referenciam dist-lib/src/**, que não estava em `files` — 4 releases quebradas.
  it("acusa entry prometido que nenhuma entrada de files cobre", () => {
    const { problems } = packContract({
      name: "x",
      types: "./dist-lib/index.d.ts",
      exports: { ".": { types: "./dist-lib/index.d.ts" } },
      files: ["dist-lib/index.mjs", "README.md"],
    });
    expect(problems.map((p) => p.id)).toContain("entry-fora-do-files");
    expect(problems.find((p) => p.id === "entry-fora-do-files").msg).toContain("L-017");
  });

  it("glob de arquivo cobre a extensão (dist-lib/index.* → .mjs/.cjs/.d.ts)", () => {
    const { problems } = packContract({
      name: "x",
      exports: {
        ".": {
          types: "./dist-lib/index.d.ts",
          import: "./dist-lib/index.mjs",
          require: "./dist-lib/index.cjs",
        },
      },
      files: ["dist-lib/index.*", "README.md"],
    });
    expect(problems.filter((p) => p.id === "entry-fora-do-files")).toEqual([]);
  });

  it("glob de diretório cobre path aninhado", () => {
    const { problems } = packContract({
      name: "x",
      exports: { "./preview/chat": "./dist-lib/preview/chat.mjs" },
      files: ["dist-lib/preview/**", "README.md"],
    });
    expect(problems.filter((p) => p.id === "entry-fora-do-files")).toEqual([]);
  });

  it("devolve os dirGlobs que a L-017 exige conferir", () => {
    const { dirGlobs } = packContract({
      name: "x",
      files: ["dist-lib/index.*", "dist-lib/src/**", "dist-lib/tokens/**"],
    });
    expect(dirGlobs).toEqual(["dist-lib/src", "dist-lib/tokens"]);
  });

  it("dedupe: mesmo path em types/import não vira 2 entradas", () => {
    const { entryPaths } = packContract({
      name: "x",
      main: "./dist-lib/index.cjs",
      exports: { ".": { require: "./dist-lib/index.cjs" } },
      files: ["dist-lib/index.*"],
    });
    expect(entryPaths).toEqual(["dist-lib/index.cjs"]);
  });

  it("pacote publicável sem files → problema (levaria o repo inteiro)", () => {
    expect(packContract({ name: "x" }).problems.map((p) => p.id)).toContain("sem-files");
  });

  it("private sem files → não reclama", () => {
    expect(packContract({ name: "x", private: true }).problems.map((p) => p.id)).not.toContain(
      "sem-files",
    );
  });

  it("files sem README → aviso", () => {
    expect(packContract({ name: "x", files: ["dist-lib/**"] }).problems.map((p) => p.id)).toContain(
      "sem-readme",
    );
  });

  // O package.json real do DS tem que passar limpo — é o teste de regressão que
  // impede a L-017 de voltar num refactor de exports/files.
  it("o package.json REAL do DS não tem problema de contrato", async () => {
    const pkg = JSON.parse(
      await import("node:fs").then((fs) => fs.readFileSync("package.json", "utf8")),
    );
    const { problems, entryPaths, dirGlobs } = packContract(pkg);
    expect(problems.filter((p) => p.id === "entry-fora-do-files")).toEqual([]);
    expect(entryPaths.length).toBeGreaterThan(3);
    // a correção da L-017 (v0.5.1) precisa continuar lá
    expect(dirGlobs).toContain("dist-lib/src");
    expect(dirGlobs).toContain("dist-lib/tokens");
  });
});
