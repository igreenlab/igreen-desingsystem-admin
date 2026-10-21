import { Hash } from "lucide-react";
import { Input } from "@/components/shadcn/input";
import { FILTER_FIELD_SIZE } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";
import { toNumber } from "../_shared";

/** Parse pt-BR-friendly: aceita vírgula como decimal ("10,5"). */
function parseNum(raw: string): number | "" {
  if (raw.trim() === "") return "";
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : "";
}

/** Range [min, max] — tupla do operador `between` (item 12 Sólis). */
function RangeInputs({
  value,
  onChange,
  autoFocus,
}: {
  value: unknown;
  onChange: (v: [number | null, number | null]) => void;
  autoFocus?: boolean;
}) {
  const [min, max] = Array.isArray(value)
    ? (value as [number | null, number | null])
    : [null, null];
  const set = (side: 0 | 1, raw: string) => {
    const parsed = parseNum(raw);
    const next: [number | null, number | null] = [min ?? null, max ?? null];
    next[side] = parsed === "" ? null : parsed;
    onChange(next);
  };
  return (
    <div className="flex items-center gap-gp-xs">
      <Input
        type="text"
        inputMode="decimal"
        value={min ?? ""}
        onChange={(e) => set(0, e.target.value)}
        placeholder="mín"
        aria-label="Mínimo"
        autoFocus={autoFocus}
        className="w-[90px]"
      />
      <span className="text-fg-subtle">–</span>
      <Input
        type="text"
        inputMode="decimal"
        value={max ?? ""}
        onChange={(e) => set(1, e.target.value)}
        placeholder="máx"
        aria-label="Máximo"
        className="w-[90px]"
      />
    </div>
  );
}

export const NumberColumnType: ColumnTypeDefinition = {
  type: "number",
  operators: [
    { id: "equals", label: "=" },
    { id: "between", label: "entre" },
    { id: "gt", label: ">" },
    { id: "lt", label: "<" },
    { id: "gte", label: "≥" },
    { id: "lte", label: "≤" },
    { id: "neq", label: "≠" },
  ],
  renderFilterInput: ({ value, onChange, placeholder, operator }) =>
    operator === "between" ? (
      <RangeInputs value={value} onChange={onChange} />
    ) : (
      <Input
        type="number"
        size="sm"
        className={FILTER_FIELD_SIZE}
        value={(value as number) ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        placeholder={placeholder ?? "0"}
      />
    ),
  // between chega aqui como TUPLA (caminho isTupleOperator do chip).
  renderFastFilterInput: ({ value, onChange, operator }) =>
    operator === "between" || Array.isArray(value) ? (
      <div className="p-pad-md">
        <RangeInputs value={value} onChange={onChange} autoFocus />
      </div>
    ) : (
      <Input
        type="number"
        value={(value as number) ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        placeholder="0"
        autoFocus
      />
    ),
  matchesFilter: (cellValue, filterValue, operator) => {
    const cell = toNumber(cellValue);
    if (operator === "between") {
      if (cell === null) return false;
      const [min, max] = Array.isArray(filterValue)
        ? (filterValue as [unknown, unknown])
        : [null, null];
      const lo = toNumber(min);
      const hi = toNumber(max);
      if (lo === null && hi === null) return true; // range vazio = sem efeito
      if (lo !== null && cell < lo) return false;
      if (hi !== null && cell > hi) return false;
      return true;
    }
    const filter = toNumber(filterValue);
    if (cell === null || filter === null) return false;
    if (operator === "equals") return cell === filter;
    if (operator === "neq") return cell !== filter;
    if (operator === "gt") return cell > filter;
    if (operator === "lt") return cell < filter;
    if (operator === "gte") return cell >= filter;
    if (operator === "lte") return cell <= filter;
    return null;
  },
  // Chip da faixa num chip SÓ: "10 – 500" (lado aberto vira ≥/≤).
  renderChipValue: (value) => {
    if (!Array.isArray(value)) {
      const n = toNumber(value);
      return n === null ? String(value ?? "") : n.toLocaleString("pt-BR");
    }
    const [min, max] = value as [unknown, unknown];
    const lo = toNumber(min);
    const hi = toNumber(max);
    const f = (n: number) => n.toLocaleString("pt-BR");
    if (lo !== null && hi !== null) return `${f(lo)} – ${f(hi)}`;
    if (lo !== null) return `≥ ${f(lo)}`;
    if (hi !== null) return `≤ ${f(hi)}`;
    return "";
  },

  /* G.2 — number alinhado à direita, formato locale-aware */
  renderCell: ({ value }) => {
    const n = toNumber(value);
    if (n === null) return null;
    return <span className="tabular-nums">{n.toLocaleString("pt-BR")}</span>;
  },
  formatValue: (v) => {
    const n = toNumber(v);
    return n === null ? "" : n.toLocaleString("pt-BR");
  },
  defaultAlign: "right",
  defaultWidth: 110,
  defaultSortable: true,
  defaultIcon: Hash,
};
