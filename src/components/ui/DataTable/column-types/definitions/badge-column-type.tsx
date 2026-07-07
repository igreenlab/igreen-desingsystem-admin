import { Tag, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { Chip } from "../../../Chip/chip";
import { FILTER_FIELD_SIZE } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";
import { resolveChipColor, findOption } from "../_shared";

export const BadgeColumnType: ColumnTypeDefinition = {
  type: "badge",
  operators: [
    { id: "equals", label: "é" },
    { id: "neq", label: "não é" },
    { id: "isAnyOf", label: "é um de" },
  ],
  renderFilterInput: ({ value, onChange, options }) => (
    <Select
      value={value == null ? "" : String(value)}
      onValueChange={(v) => onChange(v)}
    >
      <SelectTrigger className={FILTER_FIELD_SIZE}>
        <SelectValue placeholder="Selecione..." />
      </SelectTrigger>
      <SelectContent>
        {(options ?? []).map((o) => (
          <SelectItem key={String(o.value)} value={String(o.value)}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
  renderFastFilterInput: ({ value, onChange, options }) => (
    <div className="p-pad-md">
      <Select
        defaultOpen
        value={value == null ? "" : String(value)}
        onValueChange={(v) => onChange(v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          {(options ?? []).map((o) => (
            <SelectItem key={String(o.value)} value={String(o.value)}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
  matchesFilter: (cellValue, filterValue, operator) => {
    const cell = cellValue == null ? "" : String(cellValue);
    if (operator === "equals") return cell === String(filterValue ?? "");
    if (operator === "neq") return cell !== String(filterValue ?? "");
    if (operator === "isAnyOf") {
      // Aceita escalar (do preset) ou array — normaliza pra array.
      const arr = Array.isArray(filterValue)
        ? filterValue.map(String)
        : filterValue == null
          ? []
          : [String(filterValue)];
      return arr.includes(cell);
    }
    return null;
  },
  renderChipValue: (value, options) => {
    if (value == null) return "";
    const opt = findOption(value, options);
    return opt?.label ?? String(value);
  },

  renderCell: ({ value, options }) => {
    const opt = findOption(value, options);
    if (!opt) {
      if (value == null) return null;
      return <Chip size="sm">{String(value)}</Chip>;
    }
    return (
      <Chip size="sm" color={resolveChipColor(opt.color)}>
        {opt.label}
      </Chip>
    );
  },
  formatValue: (v) => (v == null ? "" : String(v)),
  defaultAlign: "left",
  defaultWidth: 140,
  defaultSortable: true,
  defaultIcon: Tag,
};

/** Alias `status` = `badge`. Status é um conceito semântico (active/pending/etc)
 *  mas o render é o mesmo de badge. Registramos ambos pra DX. */
export const StatusColumnType: ColumnTypeDefinition = {
  ...BadgeColumnType,
  type: "status",
  defaultIcon: CheckCircle2,
};
