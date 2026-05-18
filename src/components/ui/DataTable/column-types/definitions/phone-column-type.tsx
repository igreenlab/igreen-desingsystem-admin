import { Phone } from "lucide-react";
import { Input } from "../../../../shadcn/input";
import { FILTER_FIELD_SIZE } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";

export const PhoneColumnType: ColumnTypeDefinition = {
  type: "phone",
  operators: [
    { id: "contains", label: "contém" },
    { id: "equals", label: "é" },
  ],
  renderFilterInput: ({ value, onChange }) => (
    <Input
      type="tel"
      size="sm"
      className={FILTER_FIELD_SIZE}
      value={value == null ? "" : String(value)}
      onChange={(e) => onChange(e.target.value)}
      placeholder="+55 ..."
    />
  ),
  renderFastFilterInput: ({ value, onChange }) => (
    <div className="p-pad-md">
      <Input
        type="tel"
        value={value == null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value)}
        placeholder="+55 ..."
        autoFocus
      />
    </div>
  ),
  matchesFilter: (cellValue, filterValue, operator) => {
    const normalize = (s: unknown) =>
      s == null ? "" : String(s).replace(/\D/g, "").toLowerCase();
    const cell = normalize(cellValue);
    const filter = normalize(filterValue);
    if (operator === "contains") return cell.includes(filter);
    if (operator === "equals") return cell === filter;
    return null;
  },

  renderCell: ({ value }) => {
    const phone = value == null ? "" : String(value);
    if (!phone) return null;
    const digits = phone.replace(/\D/g, "");
    return (
      <a
        href={`tel:${digits}`}
        className="text-fg-brand hover:underline tabular-nums"
        onClick={(e) => e.stopPropagation()}
      >
        {phone}
      </a>
    );
  },
  formatValue: (v) => (v == null ? "" : String(v)),
  defaultAlign: "left",
  defaultWidth: 170,
  defaultSortable: false,
  defaultIcon: Phone,
};
