/**
 * Regressão do achado CRÍTICO do review 2026-10-22 (padrão L-060/L-064):
 * `filterOptions.pinned` era declarado nos types, no USAGE e na demo, mas os
 * DOIS adapters internos reconstruíam as opções descartando o campo — o
 * widget multiSelect recebia sempre `pinned: undefined` e a seção fixa nunca
 * existia de verdade (a demo mascarava porque "Sem BU" era o 1º do array).
 *
 * O teste monta as opções PELO CAMINHO DE PRODUÇÃO (useFilterPopoverAdapter),
 * não por fixture própria — teste que remonta a entrada à mão concorda com o
 * bug por construção (L-064).
 */
import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFilterPopoverAdapter } from "./use-filter-popover-adapter";
import type { DataTableColumnDef, FilterModel } from "../data-table.types";

type Row = { id: string; bu: string };

const COLUMNS: DataTableColumnDef<Row>[] = [
  {
    field: "bu",
    headerName: "BU",
    enableColumnFilter: true,
    filterType: "multiSelect",
    filterOptions: [
      { value: "sem-bu", label: "Sem BU", pinned: true },
      { value: "bu-01", label: "BU 01" },
      { value: "bu-02", label: "BU 02" },
    ],
  },
];

const ROWS: Row[] = [
  { id: "1", bu: "bu-01" },
  { id: "2", bu: "sem-bu" },
];

function montaAdapter(filterModel: FilterModel) {
  const colsByField = new Map(COLUMNS.map((c) => [String(c.field), c]));
  return renderHook(() =>
    useFilterPopoverAdapter<Row>({
      effectiveColumns: COLUMNS,
      allColumns: COLUMNS,
      rows: ROWS,
      filterModel,
      setFilterModel: () => {},
      colsByField,
      colLabelMap: { bu: "BU" },
      pendingOpenChipKey: null,
      openChipKey: null,
    }),
  ).result.current;
}

describe("filterOptions.pinned atravessa os adapters (caminho de produção)", () => {
  it("getGroupOptions (chip) preserva pinned", () => {
    const adapter = montaAdapter({
      items: [{ id: "f1", field: "bu", operator: "isAnyOf", value: "bu-01" }],
      logicOperator: "AND",
    });
    const group = adapter.appliedGroups[0];
    expect(group).toBeDefined();
    const options = adapter.getGroupOptions(group.key);
    const fixa = options.find((o) => String(o.value) === "sem-bu");
    expect(fixa?.pinned).toBe(true);
    // e as não-fixas NÃO viram fixas por acidente
    expect(options.find((o) => String(o.value) === "bu-01")?.pinned).toBeFalsy();
  });

  it("filterPopoverColumns (builder avançado/funil) preserva pinned", () => {
    const adapter = montaAdapter({ items: [], logicOperator: "AND" });
    const colBU = adapter.filterPopoverColumns.find((c) => c.key === "bu");
    const fixa = colBU?.options?.find((o) => o.value === "sem-bu");
    expect(fixa?.pinned).toBe(true);
  });
});
