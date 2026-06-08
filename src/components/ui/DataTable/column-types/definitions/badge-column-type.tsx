import { Tag, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../shadcn/select";
import { Chip } from "../../../Chip/chip";
import { FILTER_FIELD_SIZE } from "../_filter-field";
import type { ColumnTypeDefinition, ColumnOption } from "../column-types.types";

/** Mapeia option.color → Chip color variant.
 *  Aceita preset names (primary/neutral/danger/warning/success/info) OU
 *  qualquer string custom (ex: "blue", "purple") que cai em `neutral` default. */
type ChipColor = "primary" | "neutral" | "danger" | "warning" | "success" | "info";
const VALID_COLORS: ReadonlyArray<ChipColor> = [
  "primary",
  "neutral",
  "danger",
  "warning",
  "success",
  "info",
];

function resolveChipColor(raw: string | undefined): ChipColor {
  if (!raw) return "neutral";
  if (VALID_COLORS.includes(raw as ChipColor)) return raw as ChipColor;
  // Mapeamentos comuns
  const aliases: Record<string, ChipColor> = {
    green: "success",
    red: "danger",
    yellow: "warning",
    blue: "info",
    gray: "neutral",
    grey: "neutral",
  };
  return aliases[raw.toLowerCase()] ?? "neutral";
}

function findOption(value: unknown, options?: ColumnOption[]): ColumnOption | null {
  if (value == null) return null;
  return options?.find((o) => String(o.value) === String(value)) ?? null;
}

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
