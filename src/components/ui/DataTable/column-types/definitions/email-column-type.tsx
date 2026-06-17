import { AtSign } from "lucide-react";
import { Input } from "@/components/shadcn/input";
import { FILTER_FIELD_SIZE } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";

export const EmailColumnType: ColumnTypeDefinition = {
  type: "email",
  operators: [
    { id: "contains", label: "contém" },
    { id: "equals", label: "é" },
    { id: "neq", label: "não é" },
  ],
  renderFilterInput: ({ value, onChange }) => (
    <Input
      type="email"
      size="sm"
      className={FILTER_FIELD_SIZE}
      value={value == null ? "" : String(value)}
      onChange={(e) => onChange(e.target.value)}
      placeholder="usuario@exemplo.com"
    />
  ),
  renderFastFilterInput: ({ value, onChange }) => (
    <div className="p-pad-md">
      <Input
        type="email"
        value={value == null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value)}
        placeholder="usuario@exemplo.com"
        autoFocus
      />
    </div>
  ),
  matchesFilter: (cellValue, filterValue, operator) => {
    const cell = cellValue == null ? "" : String(cellValue).toLowerCase();
    const filter = filterValue == null ? "" : String(filterValue).toLowerCase();
    if (operator === "contains") return cell.includes(filter);
    if (operator === "equals") return cell === filter;
    if (operator === "neq") return cell !== filter;
    return null;
  },

  renderCell: ({ value }) => {
    const email = value == null ? "" : String(value);
    if (!email) return null;
    return (
      <a
        href={`mailto:${email}`}
        className="text-fg-brand hover:underline truncate"
        onClick={(e) => e.stopPropagation()}
      >
        {email}
      </a>
    );
  },
  formatValue: (v) => (v == null ? "" : String(v)),
  defaultAlign: "left",
  defaultWidth: 240,
  defaultEllipsis: true,
  defaultSortable: true,
  defaultIcon: AtSign,
};
