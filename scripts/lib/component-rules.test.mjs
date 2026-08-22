import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import {
  componentesUsados,
  regrasDoUsage,
  regrasAplicaveis,
  regrasDoPrimitivo,
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

describe("component-rules — primitivo shadcn, pela tabela global", () => {
  /*
   * Esta família ficou de fora da 1ª versão — e o furo era grave: o `<Tabs>` é o componente
   * que MOTIVOU o mecanismo, e o hook ficava calado pra ele. Motivo estrutural: primitivo no
   * copy-in cai como arquivo solto (`ui/tabs.tsx`), sem pasta e sem USAGE próprio.
   */
  const GLOBAL = [
    "# Shadcn — índice de gotchas",
    "",
    "| `tabs` | doc longa pra humano, 800+ chars, com tudo detalhado… |",
    "",
    "<!-- ds:regras tabs",
    "- variante default (segmented) dentro de superfície; `line` só pra seção de página",
    "- `fullWidth` em superfície compacta; nunca `w-full`/`flex-1` na mão",
    "-->",
    "",
    "<!-- ds:regras tab",
    "- regra de um componente chamado `tab`, que NÃO deve casar com `tabs`",
    "-->",
    "",
    "<!-- ds:regras input-otp",
    "- regra do input-otp",
    "-->",
  ].join("\n");

  it("acha o bloco nomeado do primitivo", () => {
    expect(regrasDoPrimitivo(GLOBAL, "Tabs")).toEqual([
      "variante default (segmented) dentro de superfície; `line` só pra seção de página",
      "`fullWidth` em superfície compacta; nunca `w-full`/`flex-1` na mão",
    ]);
  });

  it("fronteira de nome: `tab` não pega o bloco de `tabs`", () => {
    // Sem a fronteira, `indexOf` casaria o prefixo e entregaria a regra errada — silencioso.
    expect(regrasDoPrimitivo(GLOBAL, "Tab")).toEqual([
      "regra de um componente chamado `tab`, que NÃO deve casar com `tabs`",
    ]);
  });

  it("PascalCase vira o id do registry (InputOTP → input-otp)", () => {
    expect(regrasDoPrimitivo(GLOBAL, "InputOTP")).toEqual(["regra do input-otp"]);
  });

  it("primitivo sem bloco → silêncio (não despeja a célula da tabela)", () => {
    expect(regrasDoPrimitivo(GLOBAL, "Select")).toEqual([]);
  });

  it("tabela ausente → silêncio", () => {
    expect(regrasDoPrimitivo(null, "Tabs")).toEqual([]);
  });

  it("no fluxo completo: componente sem USAGE cai na tabela", () => {
    const r = regrasAplicaveis("<Tabs variant='line' />", () => null, GLOBAL);
    expect(r).toHaveLength(1);
    expect(r[0].componente).toBe("Tabs");
    expect(r[0].regras[1]).toContain("fullWidth");
  });

  it("USAGE do composto GANHA da tabela quando os dois existem", () => {
    const usage = "# Tabs\n<!-- ds:regras\n- regra do composto\n-->\n";
    const r = regrasAplicaveis("<Tabs />", () => usage, GLOBAL);
    expect(r[0].regras).toEqual(["regra do composto"]);
  });

  it("bloco anônimo não é confundido com nomeado, e vice-versa", () => {
    const anon = "# X\n<!-- ds:regras\n- do composto\n-->\n";
    expect(regrasDoUsage(anon)).toEqual(["do composto"]);
    expect(regrasDoUsage(anon, "tabs")).toEqual([]);
    expect(regrasDoUsage(GLOBAL)).toEqual([]); // global não tem bloco anônimo
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
