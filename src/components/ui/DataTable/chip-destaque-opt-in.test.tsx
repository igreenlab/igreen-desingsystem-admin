/**
 * `highlightAppliedFilterChips` — a porta do `DataTable` pro destaque do item 16.
 *
 * O alvo aqui é o `DataTable` REAL, não o `ToolbarApplied` isolado (esse tem os
 * seus em `TableToolbar/chip-filtro-ativo.test.tsx`). A diferença importa: uma
 * prop pode existir no tipo, estar documentada em três superfícies e **não ser
 * lida por ninguém** — foi o que aconteceu com `toolbar.customLeft`, declarada e
 * inerte até a v0.64.0 (L-051). O `tsc` aceita e nada renderiza.
 *
 * Então são só duas asserções, e as duas sobre o pixel que chega na tela:
 *   1. sem a prop, o chip com valor é o tracejado neutro de antes do item 16;
 *   2. com a prop, o mesmo chip é o sólido de marca.
 *
 * ⚠️ Sem jest-dom (`tsc --noEmit` roda antes do vitest e o `vitest.setup.ts`
 * está fora do `include`): `toBeNull()` / `getAttribute()`.
 */
import { describe, expect, it, beforeAll, afterEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { DataTable } from "./data-table";
import type {
  DataTableColumnDef,
  DataTableProps,
  FilterModel,
} from "./data-table.types";

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

afterEach(() => {
  vi.restoreAllMocks();
});

type Row = { id: string; nome: string };

const LOTE: Row[] = [
  { id: "1", nome: "Ana" },
  { id: "2", nome: "Bruno" },
];

const COLUNAS: DataTableColumnDef<Row>[] = [
  { field: "id", headerName: "ID" },
  { field: "nome", headerName: "Nome", enableColumnFilter: true },
];

/** Filtro COM valor → chip aplicado na barra. */
const FILTRO_COM_VALOR: FilterModel = {
  items: [{ id: "f1", field: "nome", operator: "contains", value: "Ana" }],
  logicOperator: "AND",
};

function montar(props: Partial<DataTableProps<Row>> = {}) {
  return render(
    <DataTable<Row>
      rows={LOTE}
      columns={COLUNAS}
      getRowId={(r) => r.id}
      filterModel={FILTRO_COM_VALOR}
      paginationConfig={{ enabled: true, initialPageSize: 10 }}
      {...props}
    />,
  );
}

/** Classes do primeiro chip da barra de filtros aplicados. */
function classesDoChip(): string[] {
  const el = [...document.querySelectorAll("span")].find((s) =>
    (s.getAttribute("class") ?? "").includes("rounded-radius-lg"),
  );
  return (el?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
}

describe("DataTable — `highlightAppliedFilterChips` chega no chip", () => {
  it("sem a prop, o chip com valor é o tracejado neutro de antes do item 16", () => {
    montar();
    const classes = classesDoChip();

    expect(classes).toContain("border-dashed");
    expect(classes).toContain("border-border-input");
    expect(classes).not.toContain("border-border-brand");
    expect(classes).not.toContain("bg-bg-brand-subtle");
  });

  it("com a prop, o MESMO chip vira sólido de marca", () => {
    montar({ highlightAppliedFilterChips: true });
    const classes = classesDoChip();

    expect(classes).toContain("border-solid");
    expect(classes).toContain("border-border-brand");
    expect(classes).toContain("bg-bg-brand-subtle");
    expect(classes).not.toContain("border-dashed");
  });
});
