import { Check, X, ToggleLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../shadcn/select";
import { FILTER_FIELD_SIZE } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";

function toBool(v: unknown): boolean | null {
  if (v === true || v === "true" || v === 1 || v === "1") return true;
  if (v === false || v === "false" || v === 0 || v === "0") return false;
  return null;
}

export const BooleanColumnType: ColumnTypeDefinition = {
  type: "boolean",
  operators: [{ id: "equals", label: "é" }],
  renderFilterInput: ({ value, onChange }) => (
    <Select
      value={(value as string) ?? ""}
      onValueChange={(v) => onChange(v === "true")}
    >
      <SelectTrigger className={FILTER_FIELD_SIZE}>
        <SelectValue placeholder="Selecionar..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="true">Sim</SelectItem>
        <SelectItem value="false">Não</SelectItem>
      </SelectContent>
    </Select>
  ),
  renderFastFilterInput: ({ value, onChange, onClose }) => (
    <Select
      value={(value as string) ?? ""}
      onValueChange={(v) => {
        onChange(v === "true");
        onClose?.();
      }}
      open
    >
      <SelectTrigger className="sr-only">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="true">Sim</SelectItem>
        <SelectItem value="false">Não</SelectItem>
      </SelectContent>
    </Select>
  ),
  matchesFilter: (cellValue, filterValue, operator) => {
    const cell = toBool(cellValue);
    const filter = toBool(filterValue);
    if (cell === null || filter === null) return false;
    if (operator === "equals") return cell === filter;
    return null;
  },
  renderChipValue: (value) => (value ? "Sim" : "Não"),

  /* G.2 — render como ícone Check (verde) ou X (cinza). */
  renderCell: ({ value }) => {
    const b = toBool(value);
    if (b === null) return null;
    return b ? (
      <Check className="size-icon-sm text-fg-success" aria-label="Sim" />
    ) : (
      <X className="size-icon-sm text-fg-muted" aria-label="Não" />
    );
  },
  formatValue: (v) => {
    const b = toBool(v);
    if (b === null) return "";
    return b ? "Sim" : "Não";
  },
  defaultAlign: "center",
  defaultWidth: 80,
  defaultSortable: true,
  defaultIcon: ToggleLeft,
};
