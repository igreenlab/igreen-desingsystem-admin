import { Type } from "lucide-react";
import { Input } from "../../../../shadcn/input";
import { normalizeText as normalize } from "../../../../../lib/string-utils";
import { FILTER_FIELD_SIZE } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";

export const TextColumnType: ColumnTypeDefinition = {
  type: "text",
  // Operadores típicos de query builder para text — contém / não contém /
  // começa com / termina com / é / não é / vazio / não vazio. Labels alinhados
  // com DEFAULT_OP_LABELS pra consistência chip ↔ popover.
  operators: [
    { id: "contains", label: "contém" },
    { id: "notContains", label: "não contém" },
    { id: "equals", label: "é" },
    { id: "neq", label: "não é" },
    { id: "startsWith", label: "começa com" },
    { id: "endsWith", label: "termina com" },
    { id: "isEmpty", label: "está vazio" },
    { id: "isNotEmpty", label: "não está vazio" },
  ],
  renderFilterInput: ({ value, onChange, placeholder, operator }) => {
    // isEmpty/isNotEmpty não precisa de input — operator se basta
    if (operator === "isEmpty" || operator === "isNotEmpty") {
      return <span className="text-fg-muted text-body-sm pl-pad-md">(sem valor)</span>;
    }
    return (
      <Input
        type="text"
        size="sm"
        className={FILTER_FIELD_SIZE}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Valor..."}
      />
    );
  },
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
    if (operator === "isEmpty") return cell.length === 0;
    if (operator === "isNotEmpty") return cell.length > 0;
    const filter = normalize(filterValue);
    if (operator === "contains") return cell.includes(filter);
    if (operator === "notContains") return !cell.includes(filter);
    if (operator === "equals") return cell === filter;
    if (operator === "neq") return cell !== filter;
    if (operator === "startsWith") return cell.startsWith(filter);
    if (operator === "endsWith") return cell.endsWith(filter);
    return null;
  },

  /* G.2 slots — text não precisa renderCell custom (raw value já basta). */
  formatValue: (v) => (v == null ? "" : String(v)),
  defaultAlign: "left",
  defaultSortable: true,
  defaultIcon: Type,
};
