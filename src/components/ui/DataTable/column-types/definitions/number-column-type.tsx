import { Hash } from "lucide-react";
import { Input } from "../../../../shadcn/input";
import { FILTER_FIELD_SIZE } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";
import { toNumber } from "../_shared";

export const NumberColumnType: ColumnTypeDefinition = {
  type: "number",
  operators: [
    { id: "equals", label: "=" },
    { id: "gt", label: ">" },
    { id: "lt", label: "<" },
    { id: "gte", label: "≥" },
    { id: "lte", label: "≤" },
    { id: "neq", label: "≠" },
  ],
  renderFilterInput: ({ value, onChange, placeholder }) => (
    <Input
      type="number"
      size="sm"
      className={FILTER_FIELD_SIZE}
      value={(value as number) ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
      placeholder={placeholder ?? "0"}
    />
  ),
  renderFastFilterInput: ({ value, onChange }) => (
    <Input
      type="number"
      value={(value as number) ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
      placeholder="0"
      autoFocus
    />
  ),
  matchesFilter: (cellValue, filterValue, operator) => {
    const cell = toNumber(cellValue);
    const filter = toNumber(filterValue);
    if (cell === null || filter === null) return false;
    if (operator === "equals") return cell === filter;
    if (operator === "neq") return cell !== filter;
    if (operator === "gt") return cell > filter;
    if (operator === "lt") return cell < filter;
    if (operator === "gte") return cell >= filter;
    if (operator === "lte") return cell <= filter;
    return null;
  },

  /* G.2 — number alinhado à direita, formato locale-aware */
  renderCell: ({ value }) => {
    const n = toNumber(value);
    if (n === null) return null;
    return <span className="tabular-nums">{n.toLocaleString("pt-BR")}</span>;
  },
  formatValue: (v) => {
    const n = toNumber(v);
    return n === null ? "" : n.toLocaleString("pt-BR");
  },
  defaultAlign: "right",
  defaultWidth: 110,
  defaultSortable: true,
  defaultIcon: Hash,
};
