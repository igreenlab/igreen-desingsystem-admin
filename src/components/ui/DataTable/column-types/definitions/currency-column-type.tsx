import { DollarSign } from "lucide-react";
import { Input } from "../../../../shadcn/input";
import { FILTER_FIELD_SIZE } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";

/** typeOptions esperadas (opcional): { currency?: "BRL" | "USD" | "EUR" | string, locale?: string } */
type CurrencyTypeOptions = {
  currency?: string;
  locale?: string;
};

function toCurrency(value: unknown, opts?: CurrencyTypeOptions): string {
  if (value == null || value === "" || Number.isNaN(Number(value))) return "";
  const num = Number(value);
  const locale = opts?.locale ?? "pt-BR";
  const currency = opts?.currency ?? "BRL";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return num.toFixed(2);
  }
}

function toNumber(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export const CurrencyColumnType: ColumnTypeDefinition = {
  type: "currency",
  operators: [
    { id: "equals", label: "é" },
    { id: "gt", label: "maior que" },
    { id: "lt", label: "menor que" },
    { id: "gte", label: "maior ou igual a" },
    { id: "lte", label: "menor ou igual a" },
    { id: "between", label: "entre" },
  ],
  renderFilterInput: ({ value, onChange, operator }) => {
    if (operator === "between") {
      const arr = Array.isArray(value) ? value : [null, null];
      const minVal = toNumber(arr[0]);
      const maxVal = toNumber(arr[1]);
      return (
        <div className="flex items-center gap-gp-md">
          <Input
            type="number"
            size="sm"
            className={FILTER_FIELD_SIZE}
            placeholder="min"
            value={minVal == null ? "" : String(minVal)}
            onChange={(e) => {
              const v = e.target.value === "" ? null : Number(e.target.value);
              onChange([v, maxVal] as [number | null, number | null]);
            }}
          />
          <span className="text-fg-muted">–</span>
          <Input
            type="number"
            size="sm"
            className={FILTER_FIELD_SIZE}
            placeholder="max"
            value={maxVal == null ? "" : String(maxVal)}
            onChange={(e) => {
              const v = e.target.value === "" ? null : Number(e.target.value);
              onChange([minVal, v] as [number | null, number | null]);
            }}
          />
        </div>
      );
    }
    return (
      <Input
        type="number"
        size="sm"
        className={FILTER_FIELD_SIZE}
        value={value == null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        placeholder="0,00"
      />
    );
  },
  renderFastFilterInput: ({ value, onChange }) => (
    <div className="p-pad-md">
      <Input
        type="number"
        value={value == null ? "" : String(value)}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        placeholder="0,00"
        autoFocus
      />
    </div>
  ),
  matchesFilter: (cellValue, filterValue, operator) => {
    const cell = toNumber(cellValue);
    if (cell === null) return false;
    if (operator === "between") {
      if (!Array.isArray(filterValue)) return null;
      const min = toNumber(filterValue[0]);
      const max = toNumber(filterValue[1]);
      if (min !== null && max !== null) return cell >= min && cell <= max;
      if (min !== null) return cell >= min;
      if (max !== null) return cell <= max;
      return false;
    }
    const filter = toNumber(filterValue);
    if (filter === null) return false;
    if (operator === "equals") return cell === filter;
    if (operator === "gt") return cell > filter;
    if (operator === "lt") return cell < filter;
    if (operator === "gte") return cell >= filter;
    if (operator === "lte") return cell <= filter;
    return null;
  },
  renderChipValue: (value) => {
    if (Array.isArray(value)) {
      const from = toNumber(value[0]);
      const to = toNumber(value[1]);
      if (from != null && to != null) return `${toCurrency(from)} → ${toCurrency(to)}`;
      if (from != null) return `≥ ${toCurrency(from)}`;
      if (to != null) return `≤ ${toCurrency(to)}`;
      return "";
    }
    return toCurrency(value);
  },

  /* G.2 slots */
  renderCell: ({ value, column }) => {
    const opts = column?.typeOptions as CurrencyTypeOptions | undefined;
    return (
      <span className="font-semibold tabular-nums">{toCurrency(value, opts)}</span>
    );
  },
  formatValue: (v) => toCurrency(v),
  defaultAlign: "right",
  defaultWidth: 130,
  defaultSortable: true,
  defaultIcon: DollarSign,
};
