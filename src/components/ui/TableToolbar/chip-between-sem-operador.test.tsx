import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { ToolbarApplied } from "./parts/toolbar-applied";
import type { AppliedFilter } from "./table-toolbar.types";

/**
 * O chip de faixa dizia o intervalo DUAS vezes: a palavra "entre", vinda do
 * operador, e o valor, que já é auto-descritivo em todos os tipos que têm
 * `between` —
 *
 *   number    `100 – 500`        · `≥ 100`        · `≤ 500`
 *   currency  `R$ 10,00 → R$ 500,00` · `≥ R$ 10,00` · `≤ R$ 500,00`
 *   date      `01/01 → 31/01`    · `desde 01/01`  · `até 31/01`
 *
 * Lido inteiro saía "entre 100 – 500" e, no lado aberto, "entre desde 01/01".
 * Agora o chip de `between` não imprime o rótulo do operador.
 *
 * ⚠️ Isto é um DEFAULT novo, não uma prop: `opLabels.between` explícito traz a
 * palavra de volta, e é a saída pra quem quiser o texto antigo.
 *
 * ⚠️ Por que não dava pra resolver sem mexer no default (a saída que a análise
 * supunha existir): `filterValueLabel` é `(value: string | number) => string`
 * — resolve o rótulo de UMA opção e nem é consultado pelo `renderChipValue`
 * do `number`/`currency`. E a palavra do operador não sai do valor: ela é
 * renderizada à parte, a partir de `opLabel`, que vem do registry do tipo e
 * **vence** o `opLabels` do consumidor. Nem `DataTable` nem `DataList`
 * repassam `opLabels`.
 */

const chip = (over: Partial<AppliedFilter> = {}): AppliedFilter => ({
  id: "consumo",
  columnLabel: "Consumo",
  op: "between",
  opLabel: "entre", // é o que o registry do number/currency/date entrega
  value: "100 – 500",
  ...over,
});

/** O `<span>` do operador — `toolbarAppliedChipOp` é o único com este par. */
const spanDoOperador = () =>
  [...document.querySelectorAll("span")].find((s) => {
    const c = s.getAttribute("class") ?? "";
    return c.includes("text-fg-muted") && c.includes("text-caption-sm");
  }) ?? null;

const textoDoChip = () =>
  (
    [...document.querySelectorAll("span")].find((s) =>
      (s.getAttribute("class") ?? "").includes("rounded-radius-lg"),
    )?.textContent ?? ""
  ).trim();

describe("ToolbarApplied — chip de faixa não repete o operador", () => {
  it("between não imprime 'entre' — o valor já lê como faixa", () => {
    render(<ToolbarApplied filters={[chip()]} onRemove={() => {}} />);

    expect(spanDoOperador()).toBeNull();
    expect(textoDoChip()).toBe("Consumo100 – 500");
  });

  it("o lado aberto também perde a palavra ('entre desde 01/01' era o pior caso)", () => {
    render(
      <ToolbarApplied
        filters={[chip({ columnLabel: "Vencimento", value: "desde 01/01" })]}
        onRemove={() => {}}
      />,
    );

    expect(spanDoOperador()).toBeNull();
    expect(textoDoChip()).toBe("Vencimentodesde 01/01");
  });

  it("saída explícita: opLabels.between traz a palavra de volta", () => {
    render(
      <ToolbarApplied
        filters={[chip()]}
        onRemove={() => {}}
        opLabels={{ between: "entre" }}
      />,
    );

    expect(spanDoOperador()?.textContent).toBe("entre");
    expect(textoDoChip()).toBe("Consumoentre100 – 500");
  });

  it("caminho antigo: operador de qualquer OUTRO tipo continua impresso", () => {
    render(
      <ToolbarApplied
        filters={[
          chip({ id: "status", columnLabel: "Status", op: "isAnyOf", opLabel: undefined, value: "Ativo" }),
        ]}
        onRemove={() => {}}
      />,
    );

    expect(spanDoOperador()?.textContent).toBe("é");
    expect(textoDoChip()).toBe("StatuséAtivo");
  });

  it("caminho antigo: o opLabel do registry continua vencendo fora do between", () => {
    render(
      <ToolbarApplied
        filters={[
          chip({ id: "saldo", columnLabel: "Saldo", op: "gt", opLabel: "maior que", value: "500" }),
        ]}
        onRemove={() => {}}
      />,
    );

    expect(spanDoOperador()?.textContent).toBe("maior que");
  });

  it("caminho antigo: chip isEmpty continua só com o nome da coluna", () => {
    render(
      <ToolbarApplied
        filters={[chip({ isEmpty: true, value: [] })]}
        onRemove={() => {}}
      />,
    );

    expect(spanDoOperador()).toBeNull();
    expect(textoDoChip()).toBe("Consumo");
  });
});
