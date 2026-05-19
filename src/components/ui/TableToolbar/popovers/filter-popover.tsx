import { useEffect, useRef, useState, type ReactNode } from "react";
import { Filter, Plus, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../shadcn/popover";
import { parseSqlFilter, entriesToSql } from "./filter-sql-parser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shadcn/select";
import { Button } from "../../Button/button";
import { cn } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────────────── */
export type FilterPopoverColumn = {
  key: string;
  /** Label da coluna (exibido no select) */
  label: string;
  /** Tipo do valor — define o input renderizado. Default `"text"`. */
  type?: "text" | "number" | "select";
  /** Opções pro select (quando `type="select"`) */
  options?: Array<{ value: string; label: string }>;
  /** Tipo original do ColumnTypeRegistry (date, currency, etc) — opcional,
   *  passado pelo DataTable pra `renderValueInput` resolver o input correto. */
  filterType?: string;
};

export type FilterPopoverOperator = {
  id: string;
  label: string;
};

export type FilterPopoverEntry = {
  id: string;
  columnKey: string;
  op: string;
  /** Valor do filtro — `unknown` pra carregar string, array (multiSelect/tags),
   *  tupla (between/date range), número, etc. Native fallback rendering coage
   *  pra string via toString; `renderValueInput` recebe o valor puro. */
  value: unknown;
};

export type FilterPopoverProps = {
  /** Botão que abre o popover */
  trigger: ReactNode;

  /** Lista de colunas filtráveis */
  columns: FilterPopoverColumn[];
  /** Lista de operadores. Default `DEFAULT_FILTER_OPERATORS` (eq/neq/contains/gt/lt) */
  operators?: FilterPopoverOperator[];

  /** Array de filtros atuais */
  filters: FilterPopoverEntry[];
  onFiltersChange: (next: FilterPopoverEntry[]) => void;

  /** Habilita a tab "Avançado" com textarea livre. Default `false`. */
  enableAdvanced?: boolean;

  /** Título (default "Filtros") */
  title?: ReactNode;
  /** Label do conjuntor — primeiro item / demais */
  conjLabels?: { first: ReactNode; rest: ReactNode };

  /** Override do input de valor — Fase G.1.
   *  Quando passado, FilterPopover delega o render do input pro consumer
   *  (que conhece o tipo da coluna e usa ColumnTypeRegistry). Sem este prop,
   *  cai no fallback nativo (select/number/text por `column.type`).
   *  `value` e `onChange` são `unknown` pra suportar arrays (multiSelect/tags),
   *  tuplas (between), datas, etc — sem perder shape via stringify. */
  renderValueInput?: (params: {
    column: FilterPopoverColumn;
    operator: string;
    value: unknown;
    onChange: (next: unknown) => void;
  }) => ReactNode;

  /** Alinhamento */
  align?: "start" | "center" | "end";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export const DEFAULT_FILTER_OPERATORS: FilterPopoverOperator[] = [
  { id: "eq",       label: "é" },
  { id: "neq",      label: "não é" },
  { id: "contains", label: "contém" },
  { id: "gt",       label: "maior que" },
  { id: "lt",       label: "menor que" },
];

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Filter row tem valor real preenchido?
 *  - String vazia, null, array vazio/só nulls = vazio (pula)
 *  - Operadores isEmpty/isNotEmpty não precisam de valor (sempre ativos) */
function isFilterEntryActive(entry: FilterPopoverEntry): boolean {
  if (entry.op === "isEmpty" || entry.op === "isNotEmpty") return true;
  const v = entry.value;
  if (v == null) return false;
  if (typeof v === "string") return v.length > 0;
  if (Array.isArray(v)) {
    return v.some((x) => x != null && (typeof x === "string" ? x.length > 0 : true));
  }
  return true;
}

/* ── Filter Row Editor ───────────────────────────────────────────── */
type FilterRowEditorProps = {
  filter: FilterPopoverEntry;
  index: number;
  columns: FilterPopoverColumn[];
  operators: FilterPopoverOperator[];
  conjLabels: { first: ReactNode; rest: ReactNode };
  onChange: (next: FilterPopoverEntry) => void;
  onRemove: () => void;
  /** Override do input de valor — passado da prop top-level pra delegar
   *  ao consumer (que conhece o tipo via registry). Quando undefined, usa
   *  fallback nativo (select/number/text). */
  renderValueInput?: FilterPopoverProps["renderValueInput"];
};

/**
 * Classes compartilhadas pra trigger/input — mesma altura, padding e box-sizing
 * pra evitar resize visual entre os campos.
 */
const FIELD_BASE = cn(
  "min-h-form-md h-form-md min-w-0 w-full",
  "rounded-radius-md",
  "text-body-sm font-normal",
);

const INPUT_FIELD = cn(
  FIELD_BASE,
  "px-pad-xl",
  "bg-bg-input dark:bg-bg-muted",
  "border border-border-input text-fg-default",
  "placeholder:text-fg-muted outline-none",
  "transition-[border-color,box-shadow] duration-150",
  "focus:border-border-brand focus:shadow-sh-ring",
);

function FilterRowEditor({
  filter,
  index,
  columns,
  operators,
  conjLabels,
  onChange,
  onRemove,
  renderValueInput,
}: FilterRowEditorProps) {
  const col = columns.find((c) => c.key === filter.columnKey);
  const isSelect = col?.type === "select";
  const inputType = col?.type === "number" ? "number" : "text";
  // Quando consumer passa renderValueInput, delega 100% (registry-aware).
  // Senão, usa fallback nativo (select/number/text).
  const customValueInput =
    renderValueInput && col
      ? renderValueInput({
          column: col,
          operator: filter.op,
          value: filter.value,
          onChange: (v) => onChange({ ...filter, value: v }),
        })
      : null;
  // Coerce pra string só pro native fallback (select/input). renderValueInput
  // recebe o valor puro (unknown) pra preservar shapes (arrays/tuplas/etc).
  const stringValue =
    typeof filter.value === "string"
      ? filter.value
      : filter.value == null
        ? ""
        : String(filter.value);

  return (
    <div
      className={cn(
        // Mobile: vertical (1 select por linha). sm+: horizontal alinhado.
        "flex flex-col sm:flex-row sm:items-center gap-gp-md",
      )}
    >
      <span className="text-caption-sm text-fg-muted shrink-0 sm:w-[18px] sm:text-center">
        {index === 0 ? conjLabels.first : conjLabels.rest}
      </span>
      {/* Campo (flex 1) */}
      <div className="w-full sm:flex-[1_1_0%] sm:basis-0 min-w-0">
        <Select
          value={filter.columnKey}
          onValueChange={(v) =>
            onChange({ ...filter, columnKey: v, value: "" })
          }
        >
          <SelectTrigger
            className={cn(FIELD_BASE, "px-pad-xl gap-gp-md")}
            aria-label="Campo"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {columns.map((c) => (
              <SelectItem key={c.key} value={c.key}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Operador (flex 0.7 em desktop — menor, dá mais espaço pro valor) */}
      <div className="w-full sm:flex-[0.7_1_0%] sm:basis-0 min-w-0 sm:min-w-[80px]">
        <Select
          value={filter.op}
          onValueChange={(v) => onChange({ ...filter, op: v })}
        >
          <SelectTrigger
            className={cn(FIELD_BASE, "px-pad-xl gap-gp-md")}
            aria-label="Operador"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {operators.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Valor (flex 1.3 — maior em desktop). Em mobile ocupa linha inteira.
          Quando `renderValueInput` passado (DataTable usa registry-aware),
          delega ao consumer. Fallback: select/number/text nativo. */}
      <div className="w-full sm:flex-[1.3_1_0%] sm:basis-0 min-w-0">
        {customValueInput ? (
          customValueInput
        ) : isSelect ? (
          <Select
            value={stringValue}
            onValueChange={(v) => onChange({ ...filter, value: v })}
          >
            <SelectTrigger
              className={cn(FIELD_BASE, "px-pad-xl gap-gp-md")}
              aria-label="Valor"
            >
              <SelectValue placeholder="Selecione…" />
            </SelectTrigger>
            <SelectContent>
              {col!.options?.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <input
            type={inputType}
            value={stringValue}
            onChange={(e) => onChange({ ...filter, value: e.target.value })}
            placeholder="Valor"
            aria-label="Valor"
            className={INPUT_FIELD}
          />
        )}
      </div>
      {/* Remover (Button do DS, mesma altura do input). Em mobile alinha à direita. */}
      <Button
        color="secondary"
        variant="ghost"
        size="icon-sm"
        aria-label="Remover condição"
        onClick={onRemove}
        className="shrink-0 self-end sm:self-auto hover:bg-bg-danger-muted hover:text-fg-danger focus-visible:bg-bg-muted"
      >
        <Trash2 strokeWidth={1.8} />
      </Button>
    </div>
  );
}

/**
 * FilterPopover — popover de filtros estilo query builder.
 *
 * Modo Visual (default):
 *   - Lista de condições com campo/operador/valor
 *   - Botão pra adicionar condição (sticky no rodapé do body, fora do scroll)
 *   - Empty state com CTA
 *
 * Modo Avançado (opt-in via `enableAdvanced`):
 *   - Textarea livre estilo SQL (sem parser real — apenas demo)
 *
 * Dumb: `filters` (array de entries) vem do consumer. Use o hook
 * `useToolbarFilters()` se quiser gerenciamento de estado pronto.
 */
export function FilterPopover({
  trigger,
  columns,
  operators = DEFAULT_FILTER_OPERATORS,
  filters,
  onFiltersChange,
  enableAdvanced,
  title = "Filtros",
  conjLabels = { first: "Se", rest: "E" },
  renderValueInput,
  align = "end",
  open,
  onOpenChange,
  className,
}: FilterPopoverProps) {
  const [mode, setMode] = useState<"visual" | "advanced">("visual");
  const [advancedText, setAdvancedText] = useState("");
  const [advancedError, setAdvancedError] = useState<string | null>(null);

  // Quando entra no modo advanced, hidrata textarea com filters atuais
  useEffect(() => {
    if (mode === "advanced") {
      setAdvancedText(
        entriesToSql(
          filters.map((f) => ({
            field: f.columnKey,
            op: f.op as any,
            // Coerce pra string só pro modo SQL (arrays/tuplas viram representação flat)
            value:
              typeof f.value === "string"
                ? f.value
                : f.value == null
                  ? ""
                  : String(f.value),
          })),
          "AND",
        ),
      );
      setAdvancedError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const validCount = filters.filter((f) => f.value).length;

  const updateRow = (id: string, next: FilterPopoverEntry) =>
    onFiltersChange(filters.map((f) => (f.id === id ? next : f)));

  const removeRow = (id: string) =>
    onFiltersChange(filters.filter((f) => f.id !== id));

  const addRow = () => {
    const firstCol = columns[0];
    if (!firstCol) return;
    onFiltersChange([
      ...filters,
      {
        id: generateId(),
        columnKey: firstCol.key,
        op: operators[0]?.id ?? "eq",
        value: "",
      },
    ]);
  };

  const clearAll = () => onFiltersChange([]);

  /** Aplica o textarea SQL — parseia e converte em FilterPopoverEntry[]. */
  const applyAdvanced = () => {
    const result = parseSqlFilter(advancedText);
    if (!result.ok) {
      setAdvancedError(result.error);
      return;
    }
    setAdvancedError(null);
    // Valida que campos existem nas colunas
    const validKeys = new Set(columns.map((c) => c.key));
    const valid = result.entries.filter((e) => validKeys.has(e.field));
    const invalid = result.entries.filter((e) => !validKeys.has(e.field));
    if (invalid.length > 0) {
      setAdvancedError(
        `Campos desconhecidos: ${invalid.map((e) => e.field).join(", ")}`,
      );
      return;
    }
    onFiltersChange(
      valid.map((e) => ({
        id: generateId(),
        columnKey: e.field,
        op: e.op,
        value: e.value,
      })),
    );
    setMode("visual");
  };

  // Ao fechar o popover, remove linhas em branco (user clicou "+ Adicionar"
  // mas não preencheu valor). Delay de 500ms pra evitar piscada — durante a
  // animação de close-out a UI já está sumindo, fazer mutação no estado
  // causaria flash visível (rows removendo enquanto popover fade-out).
  // Se user reabrir antes do timeout, cancela cleanup (preserva linhas).
  const cleanupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleOpenChange = (next: boolean) => {
    // Cancela cleanup pendente em qualquer transição
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }
    if (!next) {
      cleanupTimeoutRef.current = setTimeout(() => {
        const active = filters.filter(isFilterEntryActive);
        if (active.length !== filters.length) {
          onFiltersChange(active);
        }
        cleanupTimeoutRef.current = null;
      }, 500);
    }
    onOpenChange?.(next);
  };

  // Cleanup no unmount — evita memory leak se componente desmontar com timer ativo
  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn(
          "w-[560px] max-w-[calc(100vw-32px)] max-h-[min(480px,calc(100vh-80px))] p-0 flex flex-col min-h-0 overflow-hidden",
          className,
        )}
      >
        {/* Header com tabs */}
        <div className="flex-none flex items-center justify-between gap-gp-md px-pad-xl py-pad-lg border-b border-border-default">
          <h3 className="text-caption-sm font-semibold text-fg-muted uppercase tracking-wide leading-none m-0">
            {title}
          </h3>
          {enableAdvanced && (
            <div
              role="tablist"
              className="inline-flex items-center gap-[2px] p-[2px] bg-bg-muted rounded-radius-md h-[34px]"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "visual"}
                onClick={() => setMode("visual")}
                className={cn(
                  "h-[30px] px-pad-lg rounded-radius-sm text-body-xs font-medium cursor-pointer outline-none",
                  "transition-[background-color,color,box-shadow] duration-150",
                  mode === "visual"
                    ? "bg-bg-accent text-fg-default font-semibold shadow-sh-sm"
                    : "bg-transparent text-fg-muted hover:text-fg-default",
                )}
              >
                Visual
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "advanced"}
                onClick={() => setMode("advanced")}
                className={cn(
                  "h-[30px] px-pad-lg rounded-radius-sm text-body-xs font-medium cursor-pointer outline-none",
                  "transition-[background-color,color,box-shadow] duration-150",
                  mode === "advanced"
                    ? "bg-bg-accent text-fg-default font-semibold shadow-sh-sm"
                    : "bg-transparent text-fg-muted hover:text-fg-default",
                )}
              >
                Avançado
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        {mode === "visual" ? (
          filters.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center px-pad-2xl py-pad-4xl">
              <Filter
                strokeWidth={1.6}
                className="size-[20px] text-fg-muted mb-pad-xl"
              />
              <p className="text-body-sm font-semibold text-fg-default m-0">
                Nenhuma condição
              </p>
              <p className="text-body-xs font-normal text-fg-muted m-0 mt-pad-2xs mb-pad-2xl">
                Adicione filtros pra refinar a lista.
              </p>
              <button
                type="button"
                onClick={addRow}
                className={cn(
                  "inline-flex items-center gap-gp-sm h-form-md px-pad-2xl rounded-radius-lg",
                  "bg-bg-brand text-fg-on-brand",
                  "text-body-sm font-semibold cursor-pointer outline-none",
                  "transition-[background-color] duration-150",
                  "hover:bg-bg-brand-hover focus-visible:shadow-sh-ring",
                  "[&_svg]:size-[14px]",
                )}
              >
                <Plus strokeWidth={2.4} />
                Adicionar condição
              </button>
            </div>
          ) : (
            <>
              {/* List scrollable */}
              <div
                className={cn(
                  "flex-1 min-h-0 overflow-y-auto",
                  "[scrollbar-width:thin] [scrollbar-color:var(--color-border-default)_transparent]",
                  "[&::-webkit-scrollbar]:w-[6px]",
                  "[&::-webkit-scrollbar-thumb]:bg-border-default [&::-webkit-scrollbar-thumb]:rounded-full",
                  "[&::-webkit-scrollbar-track]:bg-transparent",
                )}
              >
                <div className="flex flex-col gap-gp-2xl sm:gap-gp-md p-pad-xl">
                  {filters.map((f, i) => (
                    <FilterRowEditor
                      key={f.id}
                      filter={f}
                      index={i}
                      columns={columns}
                      operators={operators}
                      conjLabels={conjLabels}
                      onChange={(next) => updateRow(f.id, next)}
                      onRemove={() => removeRow(f.id)}
                      renderValueInput={renderValueInput}
                    />
                  ))}
                </div>
              </div>
              {/* Add button — fora do scroll, full-width, dashed */}
              <div className="flex-none px-pad-xl pb-pad-xl pt-0">
                <button
                  type="button"
                  onClick={addRow}
                  className={cn(
                    "flex items-center justify-center gap-gp-sm w-full",
                    "min-h-form-md px-pad-xl rounded-radius-md",
                    "bg-transparent text-fg-muted",
                    "border border-dashed border-border-default",
                    "text-body-sm font-medium cursor-pointer outline-none",
                    "transition-[background-color,color,border-color] duration-150",
                    "hover:bg-bg-muted hover:text-fg-default hover:border-border-default",
                    "focus-visible:bg-bg-muted focus-visible:text-fg-default",
                    "[&_svg]:size-[14px]",
                  )}
                >
                  <Plus strokeWidth={2.2} />
                  Adicionar condição
                </button>
              </div>
            </>
          )
        ) : (
          <div className="flex-1 min-h-0 flex flex-col gap-gp-md p-pad-xl overflow-y-auto">
            <span className="text-caption-sm text-fg-muted">
              Editor livre — sintaxe estilo SQL. Operadores: <code>=</code>{" "}
              <code>!=</code> <code>&gt;</code> <code>&lt;</code>{" "}
              <code>contains</code>. Conectores: <code>AND</code>{" "}
              <code>OR</code>.
            </span>
            <textarea
              spellCheck={false}
              value={advancedText}
              onChange={(e) => {
                setAdvancedText(e.target.value);
                setAdvancedError(null);
              }}
              rows={8}
              placeholder={`-- Ex:\nstatus = "active"\nAND value > 1000`}
              className={cn(
                "w-full px-pad-xl py-pad-md rounded-radius-md",
                "bg-bg-input dark:bg-bg-muted",
                "border",
                advancedError ? "border-border-critical" : "border-border-input",
                "text-body-xs font-normal font-mono text-fg-default placeholder:text-fg-muted",
                "outline-none resize-y",
                "transition-[border-color,box-shadow] duration-150",
                advancedError
                  ? "focus:border-border-critical focus:shadow-sh-ring-danger"
                  : "focus:border-border-brand focus:shadow-sh-ring",
              )}
            />
            {advancedError && (
              <p className="text-caption-sm text-fg-critical">
                {advancedError}
              </p>
            )}
            <button
              type="button"
              onClick={applyAdvanced}
              className={cn(
                "self-end px-pad-xl h-form-md rounded-radius-md",
                "bg-bg-brand text-fg-on-brand",
                "text-body-xs font-semibold",
                "hover:bg-bg-brand-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
                "transition-[background-color,box-shadow] duration-150",
              )}
            >
              Aplicar
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex-none flex items-center justify-between gap-gp-md px-pad-xl min-h-[44px] border-t border-border-default">
          <button
            type="button"
            onClick={clearAll}
            disabled={filters.length === 0}
            className={cn(
              "text-body-xs font-medium text-fg-brand bg-transparent border-0 p-0 cursor-pointer outline-none",
              "hover:underline focus-visible:underline underline-offset-2",
              "disabled:opacity-50 disabled:pointer-events-none disabled:no-underline",
            )}
          >
            Limpar todos
          </button>
          <span className="text-caption-sm text-fg-muted">
            {validCount === 0
              ? "Nenhum filtro ativo"
              : `${validCount} ${
                  validCount > 1 ? "condições ativas" : "condição ativa"
                }`}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
