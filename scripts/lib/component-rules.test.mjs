import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import {
  componentesUsados,
  regrasDoUsage,
  regrasAplicaveis,
  formatar,
} from "./component-rules.mjs";

/**
 * O teste mais importante deste arquivo é o primeiro: **sem bloco, silêncio.**
 *
 * É ele que garante a propriedade "progressivo": o dia em que isto entrar, nenhum
 * consumidor vê nada mudar. Cada componente é ligado por escolha, acrescentando 3 linhas no
 * USAGE dele. Se este teste cair, o hook passou a falar sozinho — e aviso que aparece sempre
 * é aviso desligado (L-059).
 */

const USAGE_COM_BLOCO = `# FloatingPanel

<!-- ds:regras
- aba dentro dele → <Tabs fullWidth>, variante default (é redimensionável)
- bodyPadded={false} quando usar FloatingPanelSection
-->

## Quando usar
Prosa livre daqui pra baixo, do tamanho que o mantenedor quiser.
`;

describe("component-rules — sem bloco, silêncio absoluto", () => {
  it("USAGE sem `ds:regras` não gera nada", () => {
    const usage = "# Button\n\n## Quando usar\nQualquer ação.\n";
    expect(regrasDoUsage(usage)).toEqual([]);
    expect(regrasAplicaveis("<Button>ok</Button>", () => usage)).toEqual([]);
  });

  it("componente sem USAGE nenhum não gera nada", () => {
    expect(regrasAplicaveis("<Chip>x</Chip>", () => null)).toEqual([]);
  });

  it("USAGE ilegível não quebra o Write — silêncio", () => {
    const explode = () => {
      throw new Error("EACCES");
    };
    expect(regrasAplicaveis("<Panel />", explode)).toEqual([]);
  });

  it("formatar([]) devolve string vazia (o hook não escreve nada)", () => {
    expect(formatar([])).toBe("");
  });
});

describe("component-rules — detecção do que está sendo escrito", () => {
  it("acha tag PascalCase, na ordem, sem duplicar", () => {
    const c = `<Panel><Tabs><Tabs /><FloatingPanel /></Tabs></Panel>`;
    expect(componentesUsados(c)).toEqual(["Panel", "Tabs", "FloatingPanel"]);
  });

  it("ignora HTML — <div> não é componente do DS", () => {
    expect(componentesUsados("<div><span>x</span></div>")).toEqual([]);
  });

  it("ignora primitivo em minúscula (no copy-in vira `ui/badge.tsx`, sem USAGE)", () => {
    expect(componentesUsados("<badge /> <input />")).toEqual([]);
  });

  it("não confunde nome parcial: <PanelFooter> é outro componente", () => {
    expect(componentesUsados("<PanelFooter />")).toEqual(["PanelFooter"]);
  });
});

describe("component-rules — o bloco", () => {
  it("extrai as linhas, tirando o `-` e as vazias", () => {
    expect(regrasDoUsage(USAGE_COM_BLOCO)).toEqual([
      "aba dentro dele → <Tabs fullWidth>, variante default (é redimensionável)",
      "bodyPadded={false} quando usar FloatingPanelSection",
    ]);
  });

  it("bloco não fechado é ignorado — nunca vaza o arquivo inteiro", () => {
    const quebrado = "# X\n\n<!-- ds:regras\n- regra solta\n\n## Quando usar\nprosa\n";
    expect(regrasDoUsage(quebrado)).toEqual([]);
  });

  it("entrega as regras quando o componente aparece no código", () => {
    const r = regrasAplicaveis("<FloatingPanel size='lg' />", (n) =>
      n === "FloatingPanel" ? USAGE_COM_BLOCO : null,
    );
    expect(r).toHaveLength(1);
    expect(r[0].componente).toBe("FloatingPanel");
    expect(r[0].regras[0]).toContain("Tabs fullWidth");
  });
});

describe("component-rules — as travas anti-ruído", () => {
  const usage = (n) =>
    `# ${n}\n<!-- ds:regras\n- r1 de ${n}\n- r2 de ${n}\n- r3 de ${n}\n-->\n`;

  it("teto de 3 componentes por Write", () => {
    const c = "<A /><B /><C /><D /><E />";
    const r = regrasAplicaveis(c, usage);
    expect(r.map((x) => x.componente)).toEqual(["A", "B", "C"]);
  });

  it("teto de 8 linhas no total", () => {
    const total = regrasAplicaveis("<A /><B /><C />", usage).reduce(
      (a, x) => a + x.regras.length,
      0,
    );
    expect(total).toBeLessThanOrEqual(8);
  });

  it("mesma tag repetida conta uma vez", () => {
    const r = regrasAplicaveis("<A /><A /><A />", usage);
    expect(r).toHaveLength(1);
  });

  it("a mensagem diz que é informativo e que o arquivo foi escrito", () => {
    const msg = formatar(regrasAplicaveis("<A />", usage), "src/pages/X.tsx");
    expect(msg).toContain("src/pages/X.tsx");
    expect(msg).toContain("não bloqueio");
    expect(msg).toContain("FOI escrito");
  });
});

describe("component-rules — estado do repo", () => {
  it("todo bloco ds:regras declarado no repo é parseável e não-vazio", () => {
    const dirs = ["src/components/ui"];
    const vazios = [];
    for (const d of dirs) {
      if (!existsSync(d)) continue;
      for (const nome of readdirSync(d)) {
        const p = `${d}/${nome}/USAGE.md`;
        if (!existsSync(p)) continue;
        const txt = readFileSync(p, "utf8");
        if (!txt.includes("<!-- ds:regras")) continue;
        if (regrasDoUsage(txt).length === 0) vazios.push(p);
      }
    }
    expect(vazios, "bloco declarado que não produz regra é pior que não ter bloco").toEqual([]);
  });
});
