import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../shadcn/select";
import { FILTER_FIELD_SIZE, FastSingleSelectList } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";

/** Normaliza value pra string — aceita escalar OU array (extrai 1º elemento).
 *  Defensive: presets/saved views podem hidratar filterModel com array mesmo
 *  pra column.filterType=select; sem isso o Select fica vazio. */
const toScalar = (v: unknown): string => {
  if (v == null) return "";
  if (Array.isArray(v)) return v.length > 0 ? String(v[0] ?? "") : "";
  return String(v);
};

export const SelectColumnType: ColumnTypeDefinition = {
  type: "select",
  operators: [
    { id: "equals", label: "é" },
    { id: "neq", label: "não é" },
    { id: "isEmpty", label: "está vazio" },
    { id: "isNotEmpty", label: "não está vazio" },
  ],
  renderFilterInput: ({ value, onChange, options, operator }) => {
    if (operator === "isEmpty" || operator === "isNotEmpty") {
      return <span className="text-fg-muted text-body-sm pl-pad-md">(sem valor)</span>;
    }
    return (
      <Select value={toScalar(value)} onValueChange={(v) => onChange(v)}>
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
    );
  },
  renderFastFilterInput: ({ value, onChange, options, onClose }) => (
    <FastSingleSelectList
      options={(options ?? []).map((opt) => ({
        value: String(opt.value),
        label: opt.label,
      }))}
      selected={toScalar(value)}
      onSelect={(v) => {
        onChange(v);
        onClose?.();
      }}
    />
  ),
  matchesFilter: (cellValue, filterValue, operator) => {
    const cell = cellValue == null ? "" : String(cellValue);
    if (operator === "isEmpty") return cell.length === 0;
    if (operator === "isNotEmpty") return cell.length > 0;
    const filter = toScalar(filterValue);
    if (operator === "equals") return cell === filter;
    if (operator === "neq") return cell !== filter;
    return null;
  },
};
