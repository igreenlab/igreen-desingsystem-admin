import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  externalSpecifiers,
  stripComments,
  packageName,
  typesPackage,
  checkDepsDeclared,
  sourceFiles,
} from "./deps-declared.mjs";

describe("deps-declared — as 3 armadilhas de parsing (todas medidas neste repo)", () => {
  it("1. NÃO conta import dentro de comentário", () => {
    // src/components/index.ts:51 tem `import { ChartContainer }` num JSDoc, e
    // tokens/transforms/to-tailwind.ts:8 documenta `from "@igreen/design-system/..."`.
    // Sem strip, o gate acusa 2 pacotes que ninguém importa.
    const jsdoc = `/**\n * import { X } from "@igreen/design-system";\n */\nimport { tv } from "tailwind-variants";`;
    expect(externalSpecifiers(jsdoc)).toEqual(["tailwind-variants"]);
    expect(externalSpecifiers(`// from "pacote-comentado"\nimport a from "real";`)).toEqual(["real"]);
  });

  it("2. NÃO conta `import` que é substring de DADO", () => {
    // src/components/ui/Icon/icons.ts:228 — `"line-file-import": "M15.98,..."`.
    // Um regex frouxo casa `import"` + `: "` e extrai `:` como nome de pacote.
    const icons = `export const icons = { "line-file-import": "M15.98,16.57c0,0" };`;
    expect(externalSpecifiers(icons)).toEqual([]);
  });

  it("3. resolve tipo que mora em @types/X", () => {
    expect(typesPackage("geojson")).toBe("@types/geojson");
    expect(typesPackage("@scope/pkg")).toBe("@types/scope__pkg");
  });

  it("pega as formas reais de import", () => {
    const t = [
      `import a from "alpha";`,
      `export { b } from "beta";`,
      `const c = await import("gamma");`,
      `const d = require("delta");`,
      `import type { E } from "epsilon";`,
    ].join("\n");
    expect(externalSpecifiers(t).sort()).toEqual(["alpha", "beta", "delta", "epsilon", "gamma"]);
  });

  it("ignora interno: relativo, alias @/, node: e absoluto", () => {
    const t = `import a from "./x";\nimport b from "@/utils/tv";\nimport c from "node:fs";\nimport d from "/abs";`;
    expect(externalSpecifiers(t)).toEqual([]);
  });

  it("reduz subpath ao nome do pacote", () => {
    expect(packageName("@radix-ui/react-dialog")).toBe("@radix-ui/react-dialog");
    expect(packageName("lucide-react/dynamic")).toBe("lucide-react");
    expect(packageName("date-fns/locale/pt-BR")).toBe("date-fns");
  });

  it("stripComments não engole código depois de comentário de bloco", () => {
    expect(stripComments(`/* x */ import a from "real";`).trim()).toBe(`import a from "real";`);
  });
});

describe("deps-declared — detecção", () => {
  const pkg = { dependencies: { react: "^19" }, peerDependencies: {} };

  it("acusa pacote importado e não declarado", () => {
    // É a L-037/L-058: a ChoroplethMap usava d3-geo/topojson-client sem declarar e
    // compilava porque o CONSUMIDOR declarava.
    const { faltando } = checkDepsDeclared({
      arquivos: ["src/components/ui/ChoroplethMap/choropleth-map.tsx"],
      pkg,
    });
    expect(faltando.map((f) => f.pacote)).toContain("d3-geo");
  });

  it("aceita quando o tipo vem de @types/X", () => {
    const comTypes = {
      dependencies: { "@types/geojson": "^7946", "@types/topojson-specification": "^1", "@types/d3-geo": "^3", "d3-geo": "^3", "topojson-client": "^3", react: "^19" },
    };
    const { faltando, viaTypes } = checkDepsDeclared({
      arquivos: ["src/components/ui/ChoroplethMap/choropleth-map.types.ts"],
      pkg: comTypes,
    });
    expect(faltando).toEqual([]);
    expect(viaTypes.map((v) => v.pacote).sort()).toEqual(["geojson", "topojson-specification"]);
  });

  it("peerDependencies conta como declarado", () => {
    const { faltando } = checkDepsDeclared({
      arquivos: ["src/utils/tv.ts"],
      pkg: { dependencies: {}, peerDependencies: { "tailwind-merge": "*", "tailwind-variants": "*" } },
    });
    expect(faltando.map((f) => f.pacote)).not.toContain("tailwind-merge");
  });
});

describe("deps-declared — o repo hoje", () => {
  it("todo pacote importado pelo código publicado está declarado", () => {
    const { faltando, conferidos, pacotes } = checkDepsDeclared();
    expect(
      faltando.map((f) => `${f.pacote} (${f.arquivo}) — declare \`${f.pacote}\` ou \`${f.viaTypes}\` em dependencies`),
      "import sem dependência declarada — o tsc/bundle do CONSUMIDOR quebra",
    ).toEqual([]);
    expect(conferidos).toBeGreaterThan(300);
    expect(pacotes).toBeGreaterThan(40);
  });

  it("os 2 tipos resolvidos via @types seguem declarados (trava a regressão)", () => {
    // Se alguém "limpar" @types/geojson de dependencies achando que é devDep, o
    // consumidor npm volta a quebrar com "Cannot find module 'geojson'".
    const { viaTypes } = checkDepsDeclared();
    expect(viaTypes.map((v) => v.pacote).sort()).toEqual(["geojson", "topojson-specification"]);
  });

  it("o gate REPROVA se @types/geojson voltar pra devDependencies (L-064)", () => {
    // Reproduz o defeito real de 2026-08-08 antes de confiar no gate.
    const p = JSON.parse(readFileSync("package.json", "utf8"));
    const semTypes = { ...p, dependencies: { ...p.dependencies } };
    delete semTypes.dependencies["@types/geojson"];

    const { faltando } = checkDepsDeclared({ arquivos: sourceFiles(), pkg: semTypes });
    expect(faltando.map((f) => f.pacote)).toContain("geojson");
  });
});
