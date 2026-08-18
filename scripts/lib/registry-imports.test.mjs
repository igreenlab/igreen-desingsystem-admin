import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, statSync } from "node:fs";
import {
  checkRegistryImports,
  formatarAchados,
  resolverImport,
  itensAlcancaveis,
  especificadores,
} from "./registry-imports.mjs";

/* ═══════════════════════════════════════════════════════════════════════════
   Leitura do estado REAL (só aqui — o módulo é puro)
   ═══════════════════════════════════════════════════════════════════════════ */

const REGISTRY = JSON.parse(readFileSync("registry.json", "utf8"));

/** true só pra ARQUIVO — diretório NÃO conta (armadilha 2 do módulo). */
const existeArquivoReal = (p) => {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
};
const lerFonteReal = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers sintéticos
   ═══════════════════════════════════════════════════════════════════════════ */

/** Monta um "disco" a partir de um mapa path → conteúdo. */
function disco(mapa) {
  return {
    lerFonte: (p) => (Object.prototype.hasOwnProperty.call(mapa, p) ? mapa[p] : null),
    existeArquivo: (p) => Object.prototype.hasOwnProperty.call(mapa, p),
  };
}

const item = (name, files, deps = []) => ({
  name,
  files: files.map((path) => ({ path })),
  registryDependencies: deps,
});

/* ═══════════════════════════════════════════════════════════════════════════
   Estado atual: tem de estar limpo
   ═══════════════════════════════════════════════════════════════════════════ */

describe("registry-imports — estado atual do repo", () => {
  const r = checkRegistryImports({
    items: REGISTRY.items,
    lerFonte: lerFonteReal,
    existeArquivo: existeArquivoReal,
  });

  it("nenhum item importa arquivo que o registry não distribui", () => {
    const msg = formatarAchados({ naoDistribuidos: r.naoDistribuidos, naoDeclarados: [] });
    expect(r.naoDistribuidos, `\n${msg.join("\n")}\n`).toEqual([]);
  });

  it("nenhum item importa de outro item sem declarar registryDependency", () => {
    const msg = formatarAchados({ naoDistribuidos: [], naoDeclarados: r.naoDeclarados });
    expect(r.naoDeclarados, `\n${msg.join("\n")}\n`).toEqual([]);
  });

  it("conferiu de fato (não passa por varredura vazia)", () => {
    // Guarda contra o gate virar no-op silencioso — se um refactor quebrar a resolução
    // de import, os dois `toEqual([])` acima ficariam verdes por vacuidade (L-061).
    // Medido em 2026-08-18: 86 itens, 444 imports CROSS-ITEM (o contador só soma o que
    // não está no `files[]` do próprio item). Os pisos são folgados de propósito.
    expect(r.itensConferidos).toBeGreaterThan(50);
    expect(r.importsConferidos).toBeGreaterThan(300);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   Os 2 defeitos REAIS de 2026-08-18 — o gate só está pronto reprovando estes
   ═══════════════════════════════════════════════════════════════════════════ */

describe("registry-imports — reprova os defeitos que existiam de verdade", () => {
  it("app-shell importando SingleMenuSidebar sem declarar (publicado na v0.42.0)", () => {
    const items = [
      item("app-shell", ["src/components/ui/AppShell/app-shell.tsx"], [
        "@igreen/menu-sidebar",
      ]),
      item("menu-sidebar", ["src/components/ui/MenuSidebar/index.ts"]),
      item("single-menu-sidebar", ["src/components/ui/SingleMenuSidebar/index.ts"]),
    ];
    const d = disco({
      "src/components/ui/AppShell/app-shell.tsx":
        'import { SingleMenuSidebar } from "@/components/ui/SingleMenuSidebar";',
      "src/components/ui/MenuSidebar/index.ts": "",
      "src/components/ui/SingleMenuSidebar/index.ts": "",
    });
    const r = checkRegistryImports({ items, ...d });
    expect(r.naoDeclarados).toHaveLength(1);
    expect(r.naoDeclarados[0]).toMatchObject({
      item: "app-shell",
      donos: ["single-menu-sidebar"],
    });
    expect(formatarAchados(r)[0]).toContain('"@igreen/single-menu-sidebar"');
  });

  it("declarar a dependência faz o achado desaparecer", () => {
    const items = [
      item("app-shell", ["src/components/ui/AppShell/app-shell.tsx"], [
        "@igreen/menu-sidebar",
        "@igreen/single-menu-sidebar",
      ]),
      item("single-menu-sidebar", ["src/components/ui/SingleMenuSidebar/index.ts"]),
    ];
    const d = disco({
      "src/components/ui/AppShell/app-shell.tsx":
        'import { SingleMenuSidebar } from "@/components/ui/SingleMenuSidebar";',
      "src/components/ui/SingleMenuSidebar/index.ts": "",
    });
    expect(checkRegistryImports({ items, ...d }).naoDeclarados).toEqual([]);
  });

  it("color-picker importando o BARREL do shadcn, que ninguém distribui", () => {
    const items = [
      item("color-picker", ["src/components/ui/ColorPicker/color-picker.tsx"]),
      item("input", ["src/components/shadcn/input.tsx"]),
    ];
    const d = disco({
      "src/components/ui/ColorPicker/color-picker.tsx":
        'import { Input } from "@/components/shadcn";',
      "src/components/shadcn/index.ts": "export * from './input';",
      "src/components/shadcn/input.tsx": "",
    });
    const r = checkRegistryImports({ items, ...d });
    expect(r.naoDistribuidos).toHaveLength(1);
    expect(r.naoDistribuidos[0].alvo).toBe("src/components/shadcn/index.ts");
    expect(formatarAchados(r)[0]).toContain("NENHUM item do registry distribui");
  });

  it("trocar o barrel pelo arquivo + declarar o item resolve", () => {
    const items = [
      item("color-picker", ["src/components/ui/ColorPicker/color-picker.tsx"], [
        "@igreen/input",
      ]),
      item("input", ["src/components/shadcn/input.tsx"]),
    ];
    const d = disco({
      "src/components/ui/ColorPicker/color-picker.tsx":
        'import { Input } from "@/components/shadcn/input";',
      "src/components/shadcn/input.tsx": "",
    });
    const r = checkRegistryImports({ items, ...d });
    expect(r.naoDistribuidos).toEqual([]);
    expect(r.naoDeclarados).toEqual([]);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   As 3 armadilhas que erraram a medição ANTES do gate existir
   ═══════════════════════════════════════════════════════════════════════════ */

describe("registry-imports — as armadilhas do instrumento", () => {
  it("1. registryDependency transitiva é legítima (não acusar o desenho do registry)", () => {
    // data-table → @igreen/table → @igreen/utils. Importar utils é OK sem declarar direto.
    const items = [
      item("data-table", ["src/components/ui/DataTable/data-table.tsx"], ["@igreen/table"]),
      item("table", ["src/components/ui/Table/index.ts"], ["@igreen/utils"]),
      item("utils", ["src/lib/utils.ts"]),
    ];
    const d = disco({
      "src/components/ui/DataTable/data-table.tsx": 'import { cn } from "@/lib/utils";',
      "src/components/ui/Table/index.ts": "",
      "src/lib/utils.ts": "",
    });
    expect(checkRegistryImports({ items, ...d }).naoDeclarados).toEqual([]);
  });

  it("2. import de PASTA resolve pro index, nunca pro diretório", () => {
    // Se o path cru viesse antes, `@/components/ui/Table` resolveria pra pasta — que
    // nenhum item lista — e viraria falso-positivo. Foi o bug dos 96 achados.
    const existeArquivo = (p) => p === "src/components/ui/Table/index.ts";
    expect(resolverImport("src/a/b.tsx", "@/components/ui/Table", existeArquivo)).toBe(
      "src/components/ui/Table/index.ts",
    );
  });

  it("3. arquivo com VÁRIOS donos: basta um alcançável", () => {
    // use-media-query.ts está em `table`, `menu-sidebar` e `data-table`. O app-shell
    // declara menu-sidebar — um mapa path→dono único acusaria "falta data-table".
    const compartilhado = "src/components/ui/MenuSidebar/use-media-query.ts";
    const items = [
      item("app-shell", ["src/components/ui/AppShell/app-shell.tsx"], ["@igreen/menu-sidebar"]),
      item("menu-sidebar", ["src/components/ui/MenuSidebar/index.ts", compartilhado]),
      item("data-table", ["src/components/ui/DataTable/data-table.tsx", compartilhado]),
    ];
    const d = disco({
      "src/components/ui/AppShell/app-shell.tsx": `import { useMediaQuery } from "@/components/ui/MenuSidebar/use-media-query";`,
      "src/components/ui/MenuSidebar/index.ts": "",
      "src/components/ui/DataTable/data-table.tsx": "",
      [compartilhado]: "",
    });
    expect(checkRegistryImports({ items, ...d }).naoDeclarados).toEqual([]);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   Fronteiras
   ═══════════════════════════════════════════════════════════════════════════ */

describe("registry-imports — fronteiras", () => {
  it("pacote npm sai do escopo (é o deps-declared que cobre)", () => {
    expect(resolverImport("src/a.tsx", "react", () => true)).toBeNull();
    expect(resolverImport("src/a.tsx", "lucide-react", () => true)).toBeNull();
  });

  it("import de arquivo inexistente devolve null em vez de acusar", () => {
    expect(resolverImport("src/a.tsx", "./nao-existe", () => false)).toBeNull();
  });

  it("import relativo sobe diretório corretamente", () => {
    const existe = (p) => p === "src/components/ui/X/y.ts";
    expect(resolverImport("src/components/ui/X/parts/z.tsx", "../y", existe)).toBe(
      "src/components/ui/X/y.ts",
    );
  });

  it("dep do shadcn oficial (sem @igreen/) não entra no fecho", () => {
    const porNome = new Map([["a", { name: "a", registryDependencies: ["button", "@igreen/b"] }]]);
    porNome.set("b", { name: "b", registryDependencies: [] });
    expect([...itensAlcancaveis("a", porNome)].sort()).toEqual(["a", "b"]);
  });

  it("ciclo de dependência não estoura a pilha", () => {
    const porNome = new Map([
      ["a", { name: "a", registryDependencies: ["@igreen/b"] }],
      ["b", { name: "b", registryDependencies: ["@igreen/a"] }],
    ]);
    expect([...itensAlcancaveis("a", porNome)].sort()).toEqual(["a", "b"]);
  });

  it("registry vazio não lança", () => {
    const r = checkRegistryImports({ items: [], lerFonte: () => null, existeArquivo: () => false });
    expect(r).toMatchObject({ itensConferidos: 0, naoDistribuidos: [], naoDeclarados: [] });
  });

  it("extrai import default, nomeado e type-only", () => {
    const specs = especificadores(`
      import React from "react";
      import { a, b } from "./x";
      import type { T } from "../y";
      export * from "./z";
    `);
    expect(specs).toEqual(expect.arrayContaining(["react", "./x", "../y", "./z"]));
  });
});
