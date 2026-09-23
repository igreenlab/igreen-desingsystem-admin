import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Icon } from "./icon";
import { IconSvg } from "./icon-svg";
import { icons } from "./icons";
import * as glyphs from "./icon-glyphs";
import type { IconName } from "./icon.types";

/**
 * Poda do mapa de ícones — o que mantém os 2.404 ícones (~4,3 MB) FORA do bundle de
 * quem não usa `<Icon name>`.
 *
 * Medido em 2026-09-23 num consumidor Vite do pacote npm: `import { FileUploadField }`
 * gerava 4,8 MB de JS, dos quais ~4,3 MB eram o mapa — o componente usa 3 ícones fixos,
 * mas chamava `<Icon name>`, e resolver por nome amarra o objeto inteiro (bundler não
 * poda chave de objeto). Os componentes do DS passaram a desenhar com `IconSvg` + a
 * constante de `icon-glyphs.ts`. Este arquivo trava as três coisas que fazem isso
 * continuar verdade:
 *
 *   1. o path de cada constante É o do mapa (fonte única, sem cópia divergente);
 *   2. `IconSvg glyph` e `Icon name` desenham o MESMO svg (inclusive o viewBox 18 legado);
 *   3. nenhum componente do DS volta a importar o `Icon` por nome — um único import
 *      desses recoloca o mapa no bundle de todo consumidor daquele componente, sem
 *      erro nenhum.
 */

const lista = Object.values(glyphs);

describe("icon-glyphs ↔ mapa por nome", () => {
  it("toda constante existe no mapa com o MESMO path", () => {
    expect(lista.length).toBeGreaterThan(0);
    for (const g of lista) {
      expect(icons, `"${g.name}" não está no icons.ts`).toHaveProperty(g.name);
      expect(icons[g.name as IconName], `"${g.name}": o mapa não referencia a constante`).toBe(g.d);
    }
  });

  it("IconSvg com a constante desenha o mesmo svg que Icon com o nome", () => {
    for (const g of lista) {
      const porNome = render(<Icon name={g.name as IconName} size="sm" tone="brand" title="x" />);
      const porDado = render(<IconSvg glyph={g} size="sm" tone="brand" title="x" />);
      expect(porDado.container.innerHTML, g.name).toBe(porNome.container.innerHTML);
      porNome.unmount();
      porDado.unmount();
    }
  });

  it("o viewBox legado (18) continua saindo pelo nome da constante", () => {
    const { container } = render(<IconSvg glyph={glyphs.lineBin} />);
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 18 18");
  });
});

/**
 * Quem PODE importar o `Icon` (barrel, `icon` ou `icons`) com valor:
 *   - a própria pasta `ui/Icon/`;
 *   - o barrel público `src/components/index.ts` (é a API do pacote);
 *   - `DateSeparatorChip`: a prop `icon` é um `IconName` que o CONSUMIDOR escolhe, então
 *     resolver por nome é o contrato dela — quem usa o chip paga o mapa, e isso está
 *     documentado no USAGE do Icon.
 * `import type` não conta: é apagado na compilação e não puxa módulo nenhum.
 */
const PERMITIDOS = new Set([
  "src/components/index.ts",
  "src/components/ui/DateSeparatorChip/date-separator-chip.tsx",
]);
const ALVOS = new Set([
  "src/components/ui/Icon",
  "src/components/ui/Icon/index",
  "src/components/ui/Icon/icon",
  "src/components/ui/Icon/icons",
]);

/** Fonte de todo módulo de `src/components/` fora da pasta do Icon (chave `/src/…`), sem testes. */
const FONTES = import.meta.glob<string>(
  ["/src/components/**/*.{ts,tsx}", "!**/*.test.{ts,tsx}", "!/src/components/ui/Icon/**"],
  { query: "?raw", import: "default", eager: true },
);

/** Resolve o especificador pra `src/…` sem extensão; `null` se for pacote externo. */
function alvoDoImport(de: string, spec: string): string | null {
  let partes: string[];
  if (spec.startsWith("@/")) partes = ["src", ...spec.slice(2).split("/")];
  else if (spec.startsWith(".")) partes = [...de.split("/").slice(0, -1), ...spec.split("/")];
  else return null;
  const out: string[] = [];
  for (const seg of partes) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return out.join("/").replace(/\.(tsx?|js)$/, "");
}

describe("componentes do DS não resolvem ícone por nome", () => {
  it("só a allowlist importa o Icon/mapa com valor", () => {
    const violacoes: string[] = [];
    for (const [chave, fonte] of Object.entries(FONTES)) {
      const rel = chave.replace(/^\//, "");
      if (PERMITIDOS.has(rel)) continue;
      for (const m of fonte.matchAll(/import\s+(?!type\s)[^;]*?from\s*["']([^"']+)["']/g)) {
        const alvo = alvoDoImport(rel, m[1]);
        if (alvo && ALVOS.has(alvo)) violacoes.push(`${rel} → "${m[1]}"`);
      }
    }
    expect(Object.keys(FONTES).length, "o glob não achou os fontes").toBeGreaterThan(100);
    expect(
      violacoes,
      "componente do DS importando o Icon por nome recoloca o mapa de 2.404 ícones no " +
        "bundle de quem usa esse componente. Use `IconSvg` (ui/Icon/icon-svg) + a " +
        "constante de ui/Icon/icon-glyphs — ver o USAGE do Icon, seção \"Peso no bundle\".",
    ).toEqual([]);
  });
});
