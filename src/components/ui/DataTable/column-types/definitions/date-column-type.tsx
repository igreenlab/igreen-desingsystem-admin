import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "../../../../shadcn/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../shadcn/popover";
import { FILTER_FIELD_CLASS } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";

/* ── Helpers ─────────────────────────────────────────────────────── */

function toDateMs(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

function dayStart(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Converte qualquer valor em Date pro Calendar (ou undefined). */
function toDate(v: unknown): Date | undefined {
  const ms = toDateMs(v);
  return ms == null ? undefined : new Date(ms);
}

/** Serializa Date pra ISO string (sem hora — só "YYYY-MM-DD" estável). */
function toIsoDate(d: Date | undefined | null): string | null {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const ptBrShort = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

function formatShort(v: unknown): string {
  const d = toDate(v);
  if (!d) return "";
  return ptBrShort.format(d).replace(".", "");
}

/* ── Column type ─────────────────────────────────────────────────── */

export const DateColumnType: ColumnTypeDefinition = {
  type: "date",
  operators: [
    { id: "equals", label: "é" },
    { id: "gt", label: "depois de" },
    { id: "lt", label: "antes de" },
    { id: "gte", label: "em ou depois de" },
    { id: "lte", label: "em ou antes de" },
    { id: "between", label: "entre" },
  ],
  /** Modal Filtros (advanced): trigger compacto que abre Calendar em popover.
   *  Trigger mostra valor formatado ("15 fev" ou "15 fev → 28 fev") ou placeholder. */
  renderFilterInput: ({ value, onChange, operator }) => {
    const isRange = operator === "between";
    const displayValue = (() => {
      if (isRange && Array.isArray(value)) {
        const from = formatShort(value[0]);
        const to = formatShort(value[1]);
        if (from && to) return `${from} → ${to}`;
        if (from) return `desde ${from}`;
        if (to) return `até ${to}`;
        return "";
      }
      return formatShort(value);
    })();
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className={FILTER_FIELD_CLASS}>
            <span className={displayValue ? "truncate" : "text-fg-muted opacity-70 truncate"}>
              {displayValue || (isRange ? "Selecione período" : "Selecione data")}
            </span>
            <CalendarIcon className="size-icon-xs text-fg-muted shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-pad-md w-auto">
          {isRange ? (
            <Calendar
              mode="range"
              selected={
                Array.isArray(value)
                  ? { from: toDate(value[0]), to: toDate(value[1]) }
                  : { from: undefined, to: undefined }
              }
              onSelect={(r) => {
                onChange([
                  toIsoDate(r?.from ?? null),
                  toIsoDate(r?.to ?? null),
                ]);
              }}
            />
          ) : (
            <Calendar
              mode="single"
              selected={toDate(value)}
              onSelect={(d) => onChange(toIsoDate(d ?? null))}
            />
          )}
        </PopoverContent>
      </Popover>
    );
  },
  /** Chip popover (fast filter): mesmo Calendar. Se valor for tuple → range mode. */
  renderFastFilterInput: ({ value, onChange }) => {
    const isRange = Array.isArray(value);
    if (isRange) {
      const range = {
        from: toDate(value[0]),
        to: toDate(value[1]),
      };
      return (
        <div className="p-pad-md">
          <Calendar
            mode="range"
            selected={range}
            onSelect={(r) => {
              onChange([
                toIsoDate(r?.from ?? null),
                toIsoDate(r?.to ?? null),
              ]);
            }}
          />
        </div>
      );
    }
    return (
      <div className="p-pad-md">
        <Calendar
          mode="single"
          selected={toDate(value)}
          onSelect={(d) => onChange(toIsoDate(d ?? null))}
        />
      </div>
    );
  },
  /** Formato curto pro chip — "15 jan" ou "15 jan → 28 jan". */
  renderChipValue: (value) => {
    if (Array.isArray(value)) {
      const from = formatShort(value[0]);
      const to = formatShort(value[1]);
      if (from && to) return `${from} → ${to}`;
      if (from) return `desde ${from}`;
      if (to) return `até ${to}`;
      return "";
    }
    return formatShort(value);
  },
  /** Filtro runtime — between aceita tuple [start, end] (inclusive em ambos). */
  matchesFilter: (cellValue, filterValue, operator) => {
    const cell = toDateMs(cellValue);
    if (cell === null) return false;
    const cellDay = dayStart(cell);

    if (operator === "between") {
      if (!Array.isArray(filterValue)) return null;
      const startMs = toDateMs(filterValue[0]);
      const endMs = toDateMs(filterValue[1]);
      // Range parcial (só um lado preenchido) = comportamento gt ou lt
      if (startMs !== null && endMs !== null) {
        return cellDay >= dayStart(startMs) && cellDay <= dayStart(endMs);
      }
      if (startMs !== null) return cellDay >= dayStart(startMs);
      if (endMs !== null) return cellDay <= dayStart(endMs);
      return false;
    }

    const filter = toDateMs(filterValue);
    if (filter === null) return false;
    const filterDay = dayStart(filter);
    if (operator === "equals") return cellDay === filterDay;
    if (operator === "gt") return cellDay > filterDay;
    if (operator === "lt") return cellDay < filterDay;
    if (operator === "gte") return cellDay >= filterDay;
    if (operator === "lte") return cellDay <= filterDay;
    return null;
  },

  /* G.2 slots */
  renderCell: ({ value }) => (
    <span className="text-fg-muted tabular-nums">{formatShort(value)}</span>
  ),
  formatValue: (v) => formatShort(v),
  defaultAlign: "left",
  defaultWidth: 130,
  defaultSortable: true,
  defaultIcon: CalendarIcon,
};
