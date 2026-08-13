import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  barrelExports,
  uiFolders,
  checkBarrelCompleteness,
  BARREL_EXCEPTIONS,
  BARREL,
} from "./barrel-completeness.mjs";
import { DS_EXCEPTIONS } from "./ds-exceptions.mjs";

describe("barrel-completeness — parsing", () => {
  it("lê `export * from \"./ui/X\"`", () => {
    expect(barrelExports('export * from "./ui/Button";\nexport * from "./ui/Chip";')).toEqual([
      "Button",
      "Chip",
    ]);
  });

  it("lê TAMBÉM export nomeado — TableToolbar entra por essa forma", () => {
    // Um parser que só entendesse `export *` acusaria falso positivo no TableToolbar,
    // que é exportado nomeadamente pra renomear SortDirection (colide com Table).
    const txt = 'export {\n  TableToolbar,\n  MoreMenu,\n} from "./ui/TableToolbar";';
    expect(barrelExports(txt)).toEqual(["TableToolbar"]);
  });

  it("ignora import que não é de ./ui/", () => {
    expect(barrelExports('export { Badge } from "./shadcn";\nexport { useBrand } from "../hooks/useBrand";')).toEqual([]);
  });
});

describe("barrel-completeness — detecção", () => {
  it("acusa pasta de ui/ ausente do barrel", () => {
    // É EXATAMENTE o defeito da 0.37.0: Chart/DataList/List/Toast existiam, tinham
    // 6 das 7 superfícies fechadas, e `import { ChartContainer }` estourava
    // "not exported" no consumidor npm por meses.
    const { faltando } = checkBarrelCompleteness({
      pastas: ["Button", "Chart", "DataList"],
      exportadas: ["Button"],
    });
    expect(faltando.map((f) => f.pasta)).toEqual(["Chart", "DataList"]);
  });

  it("NÃO acusa exceção declarada", () => {
    const { faltando } = checkBarrelCompleteness({
      pastas: ["Button", "TabelaTeste"],
      exportadas: ["Button"],
    });
    expect(faltando).toEqual([]);
  });

  it("acusa exceção MORTA — pasta que não existe mais", () => {
    // Lista de exceção que ninguém poda mente sobre o que está protegendo.
    const { exceçõesMortas } = checkBarrelCompleteness({ pastas: ["Button"], exportadas: ["Button"] });
    expect(exceçõesMortas).toContain("TabelaTeste");
  });

  it("acusa exceção morta — pasta isenta que JÁ está no barrel", () => {
    const { exceçõesMortas } = checkBarrelCompleteness({
      pastas: ["TabelaTeste"],
      exportadas: ["TabelaTeste"],
    });
    expect(exceçõesMortas).toContain("TabelaTeste");
  });
});

describe("barrel-completeness — o repo hoje", () => {
  it("toda pasta de ui/ está no barrel (ou tem exceção declarada)", () => {
    const { faltando, conferidos } = checkBarrelCompleteness();
    expect(
      faltando.map((f) => f.pasta),
      'adicione `export * from "./ui/<Nome>"` em src/components/index.ts, ou declare a exceção com motivo em BARREL_EXCEPTIONS',
    ).toEqual([]);
    expect(conferidos).toBeGreaterThanOrEqual(40);
  });

  it("não há exceção de barrel morta", () => {
    expect(checkBarrelCompleteness().exceçõesMortas).toEqual([]);
  });

  it("toda exceção tem motivo não-vazio", () => {
    for (const [pasta, motivo] of BARREL_EXCEPTIONS) {
      expect(String(motivo).length, `${pasta} sem motivo`).toBeGreaterThan(20);
    }
  });

  it("BARREL_EXCEPTIONS é um eixo DIFERENTE de DS_EXCEPTIONS", () => {
    // Confundir as duas reintroduz o bug: os 6 internos do example-chat são exceção
    // de REGISTRY (DS_EXCEPTIONS) mas ESTÃO no barrel — viajam pelo npm junto do
    // exemplo. Usar a lista errada aqui isentaria 6 componentes hoje corretos.
    const exportadas = new Set(barrelExports());
    const chat = ["MessageBubble", "MessageComposer", "MessageAck", "ConversationListItem"];
    for (const c of chat) {
      expect(exportadas.has(c), `${c} deve estar no barrel`).toBe(true);
      expect(DS_EXCEPTIONS.has(c.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase())).toBe(true);
      expect(BARREL_EXCEPTIONS.has(c), `${c} NÃO pode ser exceção de barrel`).toBe(false);
    }
  });

  it("o gate REPROVA se um componente sair do barrel de verdade (L-064)", () => {
    // Fixture sintética não prova nada sobre o repo. Aqui eu tiro o `Chart` do barrel
    // REAL — reproduzindo o defeito da 0.37.0 exatamente como ele foi — e confirmo
    // que a combinação (pastas reais × barrel adulterado) acusa.
    const real = readFileSync(BARREL, "utf8");
    const semChart = real.replace('export * from "./ui/Chart";', "");
    expect(semChart, "a linha de export do Chart mudou — ajuste o teste").not.toBe(real);

    const { faltando } = checkBarrelCompleteness({ exportadas: barrelExports(semChart) });
    expect(faltando.map((f) => f.pasta)).toEqual(["Chart"]);
  });

  it("o barrel não referencia pasta de ui/ que não existe", () => {
    // Verificação positiva: sem ela, o teste de completude passaria se o parser
    // quebrasse e devolvesse lista vazia dos dois lados.
    const pastas = new Set(uiFolders());
    const fantasmas = barrelExports(readFileSync(BARREL, "utf8")).filter((n) => !pastas.has(n));
    expect(fantasmas, "barrel exporta pasta inexistente").toEqual([]);
  });
});
