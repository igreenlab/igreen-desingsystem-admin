import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";

import {
  checkCopyinResolve,
  destinoNoConsumidor,
  importsRelativos,
} from "./copyin-resolve.mjs";

const registry = JSON.parse(readFileSync("registry.json", "utf8"));
const lerFonte = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);

describe("copyin-resolve — lógica pura", () => {
  it("target sem src/ ganha o prefixo (é o que o igreen-add faz)", () => {
    expect(destinoNoConsumidor({ target: "components/ui/card.tsx" })).toBe(
      "src/components/ui/card.tsx",
    );
    expect(destinoNoConsumidor({ target: "src/components/shadcn/x.tsx" })).toBe(
      "src/components/shadcn/x.tsx",
    );
  });

  it("só pega import relativo — alias e pacote não são deste gate", () => {
    const fonte = `
      import a from "./vizinho";
      import b from "../irmao/coisa";
      import c from "@/components/shadcn/x";
      import d from "lucide-react";
    `;
    expect(importsRelativos(fonte)).toEqual(["./vizinho", "../irmao/coisa"]);
  });

  it("acusa relativo que muda de pasta no destino — o caso `card`", () => {
    const { quebrados } = checkCopyinResolve({
      items: [
        {
          name: "card",
          files: [
            { path: "src/components/shadcn/card.tsx", target: "components/ui/card.tsx" },
            {
              path: "src/components/shadcn/clickable-surface.tsx",
              target: "src/components/shadcn/clickable-surface.tsx",
            },
          ],
        },
      ],
      lerFonte: (p) =>
        p.endsWith("card.tsx") ? 'import { X } from "./clickable-surface";' : "",
    });
    expect(quebrados).toEqual([
      {
        item: "card",
        arquivo: "src/components/shadcn/card.tsx",
        spec: "./clickable-surface",
        aponta: "src/components/ui/clickable-surface",
      },
    ]);
  });

  it("aceita relativo quando os dois caem na MESMA pasta", () => {
    const { quebrados } = checkCopyinResolve({
      items: [
        {
          name: "x",
          files: [
            { path: "a/um.tsx", target: "components/ui/um.tsx" },
            { path: "a/dois.tsx", target: "components/ui/dois.tsx" },
          ],
        },
      ],
      lerFonte: (p) => (p.endsWith("um.tsx") ? 'import y from "./dois";' : ""),
    });
    expect(quebrados).toEqual([]);
  });

  it("aceita relativo que aponta pro index de uma pasta entregue", () => {
    const { quebrados } = checkCopyinResolve({
      items: [
        {
          name: "x",
          files: [
            { path: "a/um.tsx", target: "components/ui/um.tsx" },
            { path: "a/sub/index.ts", target: "components/ui/sub/index.ts" },
          ],
        },
      ],
      lerFonte: (p) => (p.endsWith("um.tsx") ? 'import y from "./sub";' : ""),
    });
    expect(quebrados).toEqual([]);
  });
});

describe("copyin-resolve — o registry hoje", () => {
  it("todo import relativo alcança o arquivo no destino do consumidor", () => {
    const { quebrados, conferidos } = checkCopyinResolve({
      items: registry.items,
      lerFonte,
    });
    // Sem isto, um registry vazio ou um leitor quebrado passaria vazio (L-064).
    expect(conferidos).toBeGreaterThan(100);
    expect(
      quebrados.map(
        (q) =>
          `${q.item} · ${q.arquivo}: "${q.spec}" cairia em ${q.aponta}, que o item não entrega`,
      ),
      "Import RELATIVO entre arquivos cujos `target` mandam pra pastas diferentes. " +
        "O shadcn só reescreve specifier que começa com `@/` — relativo passa verbatim " +
        "e aponta pra um arquivo que não existe no projeto do consumidor. " +
        "Use o alias `@/components/...` (é o que o `kpi` faz).",
    ).toEqual([]);
  });
});
