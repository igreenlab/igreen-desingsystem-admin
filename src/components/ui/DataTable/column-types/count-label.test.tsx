/**
 * Item 27 do Sólis — o rótulo de contagem do contexto de filtro ("3 selecionados").
 *
 * O texto era literal, em português, **com gênero fixo**, em seis lugares. Isso não é
 * personalização e sim defeito de i18n: qualquer coluna de substantivo feminino já nasce
 * errada ("3 usinas selecionadas", "3 propostas selecionadas"), e não havia porta nenhuma
 * pra corrigir — nem traduzindo, nem concordando o gênero.
 *
 * **O desenho é o do `selectionConfig.countLabel`** da barra de seleção de linhas
 * (`data-table.types.ts` → `TableToolbar/parts/bulk-actions-bar.tsx`), que resolve o MESMO
 * problema no MESMO componente: `(count: number) => ReactNode`, recebendo a contagem e
 * devolvendo o rótulo INTEIRO — não um sufixo, não um par singular/plural, porque idioma
 * nenhum garante que a contagem fique na frente.
 *
 * **A rota é `column.typeOptions`** — a bag POR COLUNA que o item 9a já usou pra levar
 * `prefix`/`suffix` até o campo e o chip, e que já chega nos quatro renderers
 * (`renderCell`, `renderFilterInput`, `renderFastFilterInput`, `renderChipValue`) e no
 * adapter de chips. O substantivo é da COLUNA, não da tabela: uma tabela com "clientes" e
 * "usinas" precisa dos dois ao mesmo tempo, e uma prop no `DataTable` só saberia dizer um.
 *
 * **O default é o texto de hoje, byte por byte** — `${n} selecionados`. Sem configurar,
 * nada muda; é o que os `it` de "caminho antigo" travam.
 *
 * Os seis lugares (todos cobertos abaixo):
 *   1. `multi-select-column-type` → `MultiSelectFieldDropdown` (campo do avançado/funil)
 *   2. `multi-select-column-type` → `renderChipValue`
 *   3. `tags-column-type`         → `renderFilterInput` (campo)
 *   4. `tags-column-type`         → `renderChipValue`
 *   5. `use-filter-popover-adapter` → chip de tipo COM `renderChipValue` (3+ items)
 *   6. `use-filter-popover-adapter` → chip de tipo SEM `renderChipValue` (`select`, `text`)
 *
 * ⚠️ 5 e 6 não estavam no pedido e são justamente o caminho que o usuário VÊ: num chip
 * aplicado de `multiSelect`, os valores chegam como N items de 1 valor cada, então quem
 * colapsa em "3 selecionados" é o adapter — o `renderChipValue` do tipo (2) só colapsa
 * quando um item sozinho carrega um array de 3+. Consertar 4 de 6 deixaria a prop quase
 * inerte no caminho principal.
 *
 * Sem jest-dom (derruba a suíte no `tsc` antes de rodar teste nenhum).
 */
import { describe, expect, it, beforeAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MultiSelectColumnType } from "./definitions/multi-select-column-type";
import { TagsColumnType } from "./definitions/tags-column-type";
import type { ColumnTypeDefinition } from "./column-types.types";
import { DataTable } from "../data-table";
import type { DataTableColumnDef, FilterModel } from "../data-table.types";

/** Rótulo feminino concordado — o caso que motivou o item. */
const USINAS = {
  countLabel: (n: number) => `${n} usinas selecionadas`,
};

const OPCOES = [
  { value: "a", label: "Alfa" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gama" },
];

function textoDoChip(
  tipo: ColumnTypeDefinition,
  valor: unknown,
  typeOptions?: Record<string, unknown>,
) {
  const node = tipo.renderChipValue?.(valor as never, OPCOES, typeOptions);
  const { container } = render(<>{node}</>);
  return container.textContent ?? "";
}

function textoDoCampo(
  tipo: ColumnTypeDefinition,
  props: Record<string, unknown>,
): string {
  const node = tipo.renderFilterInput({
    value: null,
    onChange: () => {},
    operator: "isAnyOf",
    options: OPCOES,
    ...props,
  } as never);
  const { container } = render(<>{node}</>);
  return container.textContent ?? "";
}

describe("renderChipValue — a contagem passa pelo countLabel da coluna", () => {
  it("multiSelect: com countLabel, o rótulo é o que a função devolve", () => {
    expect(textoDoChip(MultiSelectColumnType, ["a", "b", "c"], USINAS)).toBe(
      "3 usinas selecionadas",
    );
  });

  it("tags: com countLabel, o rótulo é o que a função devolve", () => {
    expect(textoDoChip(TagsColumnType, ["a", "b", "c"], USINAS)).toBe(
      "3 usinas selecionadas",
    );
  });

  it("a função recebe a CONTAGEM (não a lista, não o índice)", () => {
    const recebidos: unknown[] = [];
    textoDoChip(MultiSelectColumnType, ["a", "b", "c"], {
      countLabel: (...args: unknown[]) => {
        recebidos.push(args);
        return "x";
      },
    });
    expect(recebidos).toEqual([[3]]);
  });

  /* CAMINHO ANTIGO — sem countLabel, o texto de hoje, byte por byte. */
  it("sem countLabel, o texto é o de hoje", () => {
    expect(textoDoChip(MultiSelectColumnType, ["a", "b", "c"])).toBe(
      "3 selecionados",
    );
    expect(textoDoChip(TagsColumnType, ["a", "b", "c"])).toBe("3 selecionados");
    expect(textoDoChip(MultiSelectColumnType, ["a", "b", "c"], {})).toBe(
      "3 selecionados",
    );
  });

  it("1 e 2 valores continuam listando os labels — não passam pelo countLabel", () => {
    expect(textoDoChip(MultiSelectColumnType, ["a"], USINAS)).toBe("Alfa");
    expect(textoDoChip(MultiSelectColumnType, ["a", "b"], USINAS)).toBe(
      "Alfa, Beta",
    );
    expect(textoDoChip(TagsColumnType, ["a", "b"], USINAS)).toBe("Alfa, Beta");
  });

  /* `typeOptions` é `Record<string, unknown>` — vem sem checagem de tipo do TS.
     Lê-se defensivo, como o `readAffix` faz com `prefix`/`suffix`. */
  it("countLabel que não é função é ignorado (volta ao default)", () => {
    expect(
      textoDoChip(MultiSelectColumnType, ["a", "b", "c"], {
        countLabel: "3 usinas",
      }),
    ).toBe("3 selecionados");
  });
});

describe("campo de filtro — o mesmo rótulo no avançado e no funil", () => {
  it("multiSelect: o trigger do campo usa o countLabel", () => {
    expect(
      textoDoCampo(MultiSelectColumnType, {
        value: ["a", "b", "c"],
        typeOptions: USINAS,
      }),
    ).toBe("3 usinas selecionadas");
  });

  it("tags: o trigger do campo usa o countLabel", () => {
    expect(
      textoDoCampo(TagsColumnType, {
        value: ["a", "b", "c"],
        typeOptions: USINAS,
      }),
    ).toBe("3 usinas selecionadas");
  });

  /* CAMINHO ANTIGO */
  it("sem countLabel, o campo mostra o texto de hoje", () => {
    expect(
      textoDoCampo(MultiSelectColumnType, { value: ["a", "b", "c"] }),
    ).toBe("3 selecionados");
    expect(textoDoCampo(TagsColumnType, { value: ["a", "b", "c"] })).toBe(
      "3 selecionados",
    );
  });
});

/* Os unitários acima provam os renderers; este prova o CAMINHO que o usuário vê —
   coluna declarada no DataTable real → adapter → chip da toolbar. É onde a contagem
   realmente é colapsada no uso normal, e onde um refactor do adapter reabriria o item. */
describe("pelo DataTable real — o chip aplicado", () => {
  beforeAll(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    window.ResizeObserver ??= vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  type Row = { id: string; usina: string };
  const ROWS: Row[] = [
    { id: "1", usina: "a" },
    { id: "2", usina: "b" },
    { id: "3", usina: "c" },
  ];

  /** 3 valores = 3 items `isAnyOf` — é a forma que o DataTable produz de verdade. */
  const TRES_VALORES: FilterModel = {
    logicOperator: "AND",
    items: [
      { id: "f1", field: "usina", operator: "isAnyOf", value: "a" },
      { id: "f2", field: "usina", operator: "isAnyOf", value: "b" },
      { id: "f3", field: "usina", operator: "isAnyOf", value: "c" },
    ],
  };

  function monta(
    filterType: "multiSelect" | "select",
    typeOptions?: Record<string, unknown>,
  ) {
    const colunas: DataTableColumnDef<Row>[] = [
      {
        field: "usina",
        headerName: "Usina",
        filterType,
        enableColumnFilter: true,
        filterOptions: OPCOES,
        typeOptions,
      },
    ];
    return render(
      <DataTable<Row>
        rows={ROWS}
        columns={colunas}
        getRowId={(r) => r.id}
        toolbar={{ enableFilters: true }}
        filterModel={TRES_VALORES}
        onFilterModelChange={() => {}}
      />,
    );
  }

  it("multiSelect (tipo COM renderChipValue): o chip usa o countLabel", () => {
    monta("multiSelect", USINAS);
    expect(screen.getByText("3 usinas selecionadas")).toBeTruthy();
    expect(screen.queryByText("3 selecionados")).toBeNull();
  });

  it("select (tipo SEM renderChipValue): o chip usa o countLabel igual", () => {
    monta("select", USINAS);
    expect(screen.getByText("3 usinas selecionadas")).toBeTruthy();
    expect(screen.queryByText("3 selecionados")).toBeNull();
  });

  /* CAMINHO ANTIGO */
  it("sem countLabel, os dois caminhos mostram o texto de hoje", () => {
    const a = monta("multiSelect");
    expect(screen.getByText("3 selecionados")).toBeTruthy();
    a.unmount();

    monta("select");
    expect(screen.getByText("3 selecionados")).toBeTruthy();
  });
});
