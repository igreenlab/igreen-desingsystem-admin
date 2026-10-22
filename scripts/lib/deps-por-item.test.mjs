import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";

import { checkDepsPorItem, nomeDoPacote, pacotesImportados } from "./deps-por-item.mjs";

const registry = JSON.parse(readFileSync("registry.json", "utf8"));
const lerFonte = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);

/**
 * `react` e `react-dom` são peer do projeto inteiro e nenhum item os declara — é o
 * desenho, não débito. O scaffold já os traz.
 */
const IGNORAR = new Set(["react", "react-dom"]);

describe("deps-por-item — lógica pura", () => {
  it("subpath vira o pacote; escopado mantém os dois segmentos", () => {
    expect(nomeDoPacote("date-fns/locale")).toBe("date-fns");
    expect(nomeDoPacote("@tanstack/react-virtual")).toBe("@tanstack/react-virtual");
    expect(nomeDoPacote("lucide-react")).toBe("lucide-react");
  });

  it("relativo e alias não são pacote npm", () => {
    expect(pacotesImportados('import a from "./x"; import b from "@/components/y";')).toEqual([]);
  });

  it("import dentro de COMENTÁRIO não conta — JSDoc que ensina não é dependência", () => {
    // 3 itens do registry caíram nisto na 1ª versão deste gate: `app-shell` e
    // `menu-sidebar` mostram `import { Link } from "react-router-dom"` num exemplo,
    // e `lucide-types.ts` cita o lucide numa frase explicando pra que serve.
    const fonte = [
      '/** Exemplo: import { Link } from "react-router-dom"; */',
      '// import { X } from "nunca-instalado";',
      'import real from "lucide-react";',
    ].join("\n");
    expect(pacotesImportados(fonte)).toEqual(["lucide-react"]);
  });

  it("@types/X satisfaz import type de X", () => {
    // `choropleth-map` faz `import type { Feature } from "geojson"` e declara
    // `@types/geojson` — resolve, e não é débito.
    const { faltando } = checkDepsPorItem({
      items: [
        {
          name: "m",
          files: [{ path: "a.ts" }],
          dependencies: ["@types/geojson@^7946.0.14"],
        },
      ],
      lerFonte: () => 'import type { Feature } from "geojson";',
    });
    expect(faltando).toEqual([]);
  });

  it("acusa pacote importado e não declarado — o caso `input-otp`", () => {
    const { faltando } = checkDepsPorItem({
      items: [{ name: "input-otp", files: [{ path: "a.tsx" }], dependencies: ["input-otp@^1.4.2"] }],
      lerFonte: () => 'import { cva } from "class-variance-authority";',
    });
    expect(faltando).toEqual([
      { item: "input-otp", pacote: "class-variance-authority", arquivo: "a.tsx" },
    ]);
  });

  it("dep declarada por um registryDependency conta — o copy-in instala o conjunto", () => {
    const { faltando } = checkDepsPorItem({
      items: [
        {
          name: "filho",
          files: [{ path: "a.tsx" }],
          registryDependencies: ["@igreen/pai"],
        },
        { name: "pai", files: [], dependencies: ["lucide-react@^1.7.0"] },
      ],
      lerFonte: () => 'import { X } from "lucide-react";',
    });
    expect(faltando).toEqual([]);
  });
});

describe("deps-por-item — o registry hoje", () => {
  it("todo pacote importado por um item é instalado pelo copy-in dele", () => {
    const { faltando, conferidos } = checkDepsPorItem({
      items: registry.items,
      lerFonte,
      ignorar: IGNORAR,
    });
    // Sem isto, um leitor quebrado devolveria lista vazia e o gate passaria vazio (L-064).
    expect(conferidos).toBeGreaterThan(200);
    expect(
      [...new Set(faltando.map((f) => `${f.item} importa "${f.pacote}" (${f.arquivo})`))],
      "Item do registry importa pacote npm que nem ele nem suas `registryDependencies` " +
        "declaram. O `igreen:add` instala só o que está declarado — no projeto do " +
        "consumidor o import não resolve. Acrescente ao `dependencies[]` do item, com a " +
        "mesma versão do package.json do DS.",
    ).toEqual([]);
  });
});
