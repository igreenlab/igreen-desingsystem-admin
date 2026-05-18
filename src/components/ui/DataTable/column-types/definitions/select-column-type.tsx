import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../shadcn/select";
import { FILTER_FIELD_SIZE } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";

export const SelectColumnType: ColumnTypeDefinition = {
  type: "select",
  operators: [
    { id: "equals", label: "é" },
    { id: "neq", label: "não é" },
  ],
  renderFilterInput: ({ value, onChange, options }) => (
    <Select
      value={(value as string) ?? ""}
      onValueChange={(v) => onChange(v)}
    >
      <SelectTrigger className={FILTER_FIELD_SIZE}>
        <SelectValue placeholder="Selecionar..." />
      </SelectTrigger>
      <SelectContent>
        {options?.map((opt) => (
          <SelectItem key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
  renderFastFilterInput: ({ value, onChange, options, onClose }) => (
    <Select
      value={(value as string) ?? ""}
      onValueChange={(v) => {
        onChange(v);
        onClose?.();
      }}
      open
    >
      <SelectTrigger className="sr-only">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options?.map((opt) => (
          <SelectItem key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
  matchesFilter: (cellValue, filterValue, operator) => {
    const cell = cellValue == null ? "" : String(cellValue);
    const filter = filterValue == null ? "" : String(filterValue);
    if (operator === "equals") return cell === filter;
    if (operator === "neq") return cell !== filter;
    return null;
  },
};
