import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/shadcn/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import { FILTER_FIELD_CLASS } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";
import { toDateMs, dayStart, toDate, toIsoDate } from "../_shared";

/* ── Helpers ─────────────────────────────────────────────────────── */

/**
 * Formato da CÉLULA e do export — **com ano**.
 *
 * Até 2026-08-19 era `{ day: "2-digit", month: "short" }` → "14 de mar", **sem ano**, e
 * sem nenhuma forma de mudar. Numa tabela de registros que atravessa anos isso não é
 * densidade, é perda de informação: uma usina conectada em 2015 e outra em 2024 apareciam
 * idênticas. Foi achado por um agente consumidor, que escreveu `render` próprio pra
 * recuperar o ano — e o defeito não estava documentado em lugar nenhum.
 *
 * Numérico em vez de mês abreviado porque **caiba o ano sem crescer**: "14/03/2023" tem
 * 10 caracteres contra os 9 de "14 de mar", enquanto "14 de mar. de 2023" teria 18.
 */
const ptBrData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/**
 * Formato COMPACTO, só pro trigger do filtro — sem ano, de propósito.
 *
 * Ali o valor é um período que o usuário acabou de escolher no calendário, e o trigger
 * mostra os dois lados ("14 mar → 28 mar") num campo estreito com `truncate`. Pôr o ano
 * dobraria o texto e truncaria justamente o segundo lado do período.
 */
const ptBrCompacto = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

/** Célula / export / clipboard — com ano. */
function formatData(v: unknown): string {
  const d = toDate(v);
  if (!d) return "";
  return ptBrData.format(d);
}

/** Trigger de filtro — compacto. */
function formatShort(v: unknown): string {
  const d = toDate(v);
  if (!d) return "";
  return ptBrCompacto.format(d).replace(".", "");
}

/* ── Column type ─────────────────────────────────────────────────── */

export const DateColumnType: ColumnTypeDefinition = {
  type: "date",
  // `between` (período) é o operador DEFAULT pra datas (operators[0]) — preset
  // mais útil e alinhado com o shortcut do header.
  operators: [
    { id: "between", label: "entre" },
    { id: "equals", label: "é" },
    { id: "gt", label: "depois de" },
    { id: "lt", label: "antes de" },
    { id: "gte", label: "em ou depois de" },
    { id: "lte", label: "em ou antes de" },
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
  // `column.valueFormatter` vence o formato do tipo — é o escape hatch pra quem quer
  // outro formato (mês escrito, ISO, relativo) sem escrever `render` inteiro.
  //
  // Isso é o que o próprio `CellRenderProps` já prometia: o campo `column` existe ali
  // com o comentário "campos auxiliares como valueFormatter", e o JSDoc de `formatValue`
  // diz "aplicado quando consumer não passa `column.valueFormatter`". Nenhum column-type
  // lia esse campo, então na prática `valueFormatter` num `type: "date"` mudava export,
  // totalizador e clipboard e **não mudava a célula** — a doc afirmava o contrário.
  renderCell: ({ value, column }) => (
    <span className="text-fg-muted tabular-nums">
      {column?.valueFormatter ? column.valueFormatter(value) : formatData(value)}
    </span>
  ),
  formatValue: (v) => formatData(v),
  defaultAlign: "left",
  defaultWidth: 130,
  defaultSortable: true,
  defaultIcon: CalendarIcon,
};
