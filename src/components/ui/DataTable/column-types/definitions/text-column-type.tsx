import { Type } from "lucide-react";
import { Input } from "../../../../shadcn/input";
import { FILTER_FIELD_SIZE } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";

function normalize(s: unknown): string {
  if (s == null) return "";
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export const TextColumnType: ColumnTypeDefinition = {
  type: "text",
  operators: [
    { id: "contains", label: "contém" },
    { id: "equals", label: "é" },
    { id: "neq", label: "não é" },
  ],
  renderFilterInput: ({ value, onChange, placeholder }) => (
    <Input
      type="text"
      size="sm"
      className={FILTER_FIELD_SIZE}
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Valor..."}
    />
  ),
  renderFastFilterInput: ({ value, onChange, options }) => (
    <Input
      type="text"
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={options?.[0]?.label ?? "Buscar..."}
      autoFocus
    />
  ),
  matchesFilter: (cellValue, filterValue, operator) => {
    const cell = normalize(cellValue);
    const filter = normalize(filterValue);
    if (operator === "contains") return cell.includes(filter);
    if (operator === "equals") return cell === filter;
    if (operator === "neq") return cell !== filter;
    return null;
  },

  /* G.2 slots — text não precisa renderCell custom (raw value já basta). */
  formatValue: (v) => (v == null ? "" : String(v)),
  defaultAlign: "left",
  defaultSortable: true,
  defaultIcon: Type,
};
