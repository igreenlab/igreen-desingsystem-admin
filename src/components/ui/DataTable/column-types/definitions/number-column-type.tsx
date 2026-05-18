import { Hash } from "lucide-react";
import { Input } from "../../../../shadcn/input";
import { FILTER_FIELD_SIZE } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";

function toNum(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export const NumberColumnType: ColumnTypeDefinition = {
  type: "number",
  operators: [
    { id: "equals", label: "=" },
    { id: "gt", label: ">" },
    { id: "lt", label: "<" },
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
    const cell = toNum(cellValue);
    const filter = toNum(filterValue);
    if (cell === null || filter === null) return false;
    if (operator === "equals") return cell === filter;
    if (operator === "neq") return cell !== filter;
    if (operator === "gt") return cell > filter;
    if (operator === "lt") return cell < filter;
    return null;
  },

  /* G.2 — number alinhado à direita, formato locale-aware */
  renderCell: ({ value }) => {
    const n = toNum(value);
    if (n === null) return null;
    return <span className="tabular-nums">{n.toLocaleString("pt-BR")}</span>;
  },
  formatValue: (v) => {
    const n = toNum(v);
    return n === null ? "" : n.toLocaleString("pt-BR");
  },
  defaultAlign: "right",
  defaultWidth: 110,
  defaultSortable: true,
  defaultIcon: Hash,
};
