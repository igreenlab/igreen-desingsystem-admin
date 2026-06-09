import { Percent } from "lucide-react";
import { Input } from "../../../../shadcn/input";
import { FILTER_FIELD_SIZE } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";
import { toNumber } from "../_shared";

/** typeOptions esperadas (opcional): { decimals?: number, locale?: string } */
type PercentageTypeOptions = {
  decimals?: number;
  locale?: string;
};

function toPercent(value: unknown, opts?: PercentageTypeOptions): string {
  if (value == null || value === "" || Number.isNaN(Number(value))) return "";
  const num = Number(value);
  const decimals = opts?.decimals ?? 0;
  const locale = opts?.locale ?? "pt-BR";
  try {
    return new Intl.NumberFormat(locale, {
      style: "percent",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num / 100);
  } catch {
    return `${num.toFixed(decimals)}%`;
  }
}

export const PercentageColumnType: ColumnTypeDefinition = {
  type: "percentage",
  operators: [
    { id: "equals", label: "é" },
    { id: "gt", label: "maior que" },
    { id: "lt", label: "menor que" },
    { id: "gte", label: "maior ou igual a" },
    { id: "lte", label: "menor ou igual a" },
  ],
  renderFilterInput: ({ value, onChange }) => (
    <Input
      type="number"
      size="sm"
      className={FILTER_FIELD_SIZE}
      value={value == null ? "" : String(value)}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      placeholder="0"
      max={100}
      min={0}
    />
  ),
  renderFastFilterInput: ({ value, onChange }) => (
    <div className="p-pad-md">
      <Input
        type="number"
        value={value == null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        placeholder="0"
        max={100}
        min={0}
        autoFocus
      />
    </div>
  ),
  matchesFilter: (cellValue, filterValue, operator) => {
    const cell = toNumber(cellValue);
    const filter = toNumber(filterValue);
    if (cell === null || filter === null) return false;
    if (operator === "equals") return cell === filter;
    if (operator === "gt") return cell > filter;
    if (operator === "lt") return cell < filter;
    if (operator === "gte") return cell >= filter;
    if (operator === "lte") return cell <= filter;
    return null;
  },
  renderChipValue: (value) => toPercent(value),

  renderCell: ({ value, column }) => {
    const opts = column?.typeOptions as PercentageTypeOptions | undefined;
    return <span className="tabular-nums">{toPercent(value, opts)}</span>;
  },
  formatValue: (v) => toPercent(v),
  defaultAlign: "right",
  defaultWidth: 110,
  defaultSortable: true,
  defaultIcon: Percent,
};
