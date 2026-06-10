import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, Filter, Plus, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "../../../shadcn/popover";
import { parseSqlFilter, entriesToSql, type ParsedFilterEntry } from "./filter-sql-parser";
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

export const DEFAULT_FILTER_OPERATORS: FilterPopoverOperator[] = [
  { id: "equals",     label: "é" },
  { id: "neq",        label: "não é" },
  { id: "contains",   label: "contém" },
  { id: "gt",         label: "maior que" },
  { id: "lt",         label: "menor que" },
  { id: "isAnyOf",    label: "é um de" },
  { id: "isNoneOf",   label: "não é" },
  { id: "between",    label: "entre" },
  { id: "isEmpty",    label: "está vazio" },
  { id: "isNotEmpty", label: "não está vazio" },
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
export function isFilterEntryActive(entry: FilterPopoverEntry): boolean {
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
  renderValueInput?: FilterPanelProps["renderValueInput"];
  /** Quando true, o Select "Campo" abre o dropdown imediatamente no mount
   *  (usado pelo "Adicionar condição" pra o user escolher coluna sem clique
   *  extra). */
  autoOpenField?: boolean;
  /** Resolve operators do column-type da nova coluna ao trocar o Campo. */
  getOperatorsForColumn?: (column: FilterPopoverColumn) => FilterPopoverOperator[] | undefined;
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
  autoOpenField,
  getOperatorsForColumn,
}: FilterRowEditorProps) {
  const col = columns.find((c) => c.key === filter.columnKey);
  const isSelect = col?.type === "select";
  const inputType = col?.type === "number" ? "number" : "text";
  // Defensive: se filter.op não está nos operators do column atual, faz FALLBACK
  // pro primeiro operator disponível. Sem isso, o Select de operador renderiza
  // VAZIO. Também propaga a normalização via useEffect.
  const opValid = operators.some((o) => o.id === filter.op);
  const effectiveOp = opValid ? filter.op : (operators[0]?.id ?? filter.op);
  useEffect(() => {
    if (!opValid && effectiveOp !== filter.op) {
      onChange({ ...filter, op: effectiveOp });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opValid, effectiveOp, filter.id]);
  // Quando consumer passa renderValueInput, delega 100% (registry-aware).
  const customValueInput =
    renderValueInput && col
      ? renderValueInput({
          column: col,
          operator: filter.op,
          value: filter.value,
          onChange: (v) => onChange({ ...filter, value: v }),
        })
      : null;
  // Coerce pra string só pro native fallback (select/input).
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
          defaultOpen={autoOpenField}
          onValueChange={(v) => {
            const newCol = columns.find((c) => c.key === v);
            const newOperators =
              (newCol && getOperatorsForColumn?.(newCol)) ?? operators;
            const opValid = newOperators.some((o) => o.id === filter.op);
            const nextOp = opValid ? filter.op : (newOperators[0]?.id ?? filter.op);
            onChange({ ...filter, columnKey: v, op: nextOp, value: "" });
          }}
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
          value={effectiveOp}
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
      {/* Valor (flex 1.3 — maior em desktop). */}
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
      {/* Remover (Button do DS, mesma altura do input). */}
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

/* ── Panel (miolo reutilizável) ──────────────────────────────────────
 * Query builder Visual/Avançado extraído do PopoverContent pra reuso no
 * `FilterPopover` (standalone) e no `ToolbarSettingsMenu` (drill-down).
 * Mantém o state do builder (mode/advancedText/pendingOpenFieldId).
 * `onBack` opcional → chevron de voltar no header. */
export type FilterPanelProps = {
  columns: FilterPopoverColumn[];
  operators?: FilterPopoverOperator[];
  filters: FilterPopoverEntry[];
  onFiltersChange: (next: FilterPopoverEntry[]) => void;
  enableAdvanced?: boolean;
  title?: ReactNode;
  conjLabels?: { first: ReactNode; rest: ReactNode };
  renderValueInput?: (params: {
    column: FilterPopoverColumn;
    operator: string;
    value: unknown;
    onChange: (next: unknown) => void;
  }) => ReactNode;
  getOperatorsForColumn?: (column: FilterPopoverColumn) => FilterPopoverOperator[] | undefined;
  /** Quando passado, renderiza o botão "voltar" no header (drill-down). */
  onBack?: () => void;
};

export function FilterPanel({
  columns,
  operators = DEFAULT_FILTER_OPERATORS,
  filters,
  onFiltersChange,
  enableAdvanced,
  title = "Filtros",
  conjLabels = { first: "Se", rest: "E" },
  renderValueInput,
  getOperatorsForColumn,
  onBack,
}: FilterPanelProps) {
  const [mode, setMode] = useState<"visual" | "advanced">("visual");
  const [advancedText, setAdvancedText] = useState("");
  const [advancedError, setAdvancedError] = useState<string | null>(null);
  // ID do último row adicionado via "Adicionar condição" — usado pra abrir o
  // Select de Campo automaticamente. Reset após 1 render via useEffect.
  const [pendingOpenFieldId, setPendingOpenFieldId] = useState<string | null>(null);
  useEffect(() => {
    if (pendingOpenFieldId == null) return;
    const t = setTimeout(() => setPendingOpenFieldId(null), 0);
    return () => clearTimeout(t);
  }, [pendingOpenFieldId]);

  // Purge de linhas em branco ao DESMONTAR o painel — fonte única de limpeza.
  // O FilterPanel só vive enquanto o filtro avançado está aberto: fechar o
  // popover, fechar o settings menu ou voltar pro nível root desmonta o painel.
  // Aí removemos toda entry sem valor real (user clicou "+ Adicionar" e não
  // preencheu) pra não poluir o filterModel nem ativar o indicador "verde".
  // Latest-ref (L-028): lê filters/onFiltersChange no unmount-time, sem stale.
  const latestRef = useRef({ filters, onFiltersChange });
  latestRef.current = { filters, onFiltersChange };
  useEffect(() => {
    return () => {
      const { filters: cur, onFiltersChange: change } = latestRef.current;
      const active = cur.filter(isFilterEntryActive);
      if (active.length !== cur.length) change(active);
    };
  }, []);

  // Quando entra no modo advanced, hidrata textarea com filters atuais
  useEffect(() => {
    if (mode === "advanced") {
      setAdvancedText(
        entriesToSql(
          filters.map((f) => ({
            field: f.columnKey,
            op: f.op as ParsedFilterEntry["op"],
            // value bruto (string | array) — entriesToSql serializa listas/tuplas
            // como `[a, b]` pros ops estruturais (round-trip-safe).
            value: Array.isArray(f.value)
              ? (f.value as string[]).map((v) => String(v))
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
    const colOperators = getOperatorsForColumn?.(firstCol) ?? operators;
    const newRow: FilterPopoverEntry = {
      id: generateId(),
      columnKey: firstCol.key,
      op: colOperators[0]?.id ?? "equals",
      value: "",
    };
    onFiltersChange([newRow, ...filters]);
    setPendingOpenFieldId(newRow.id);
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

  return (
    <>
      {/* Header com tabs */}
      <div className="flex-none flex items-center justify-between gap-gp-md px-pad-xl py-pad-lg border-b border-border-default">
        <div className="flex items-center gap-gp-md min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Voltar"
              className="grid place-items-center size-[20px] -ml-[2px] shrink-0 rounded-radius-sm bg-transparent text-fg-muted cursor-pointer outline-none hover:bg-bg-muted hover:text-fg-default focus-visible:bg-bg-muted [&_svg]:size-[16px]"
            >
              <ChevronLeft strokeWidth={2.2} />
            </button>
          )}
          <h3 className="text-caption-sm font-semibold text-fg-muted uppercase tracking-wide leading-none m-0">
            {title}
          </h3>
        </div>
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
                "h-[30px] px-pad-lg rounded-radius-sm text-body-xs font-medium cursor-pointer outline-none focus-visible:shadow-sh-ring",
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
                "h-[30px] px-pad-lg rounded-radius-sm text-body-xs font-medium cursor-pointer outline-none focus-visible:shadow-sh-ring",
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
                {filters.map((f, i) => {
                  const col = columns.find((c) => c.key === f.columnKey);
                  const rowOperators =
                    (col && getOperatorsForColumn?.(col)) ?? operators;
                  return (
                    <FilterRowEditor
                      key={f.id}
                      filter={f}
                      index={i}
                      columns={columns}
                      operators={rowOperators}
                      conjLabels={conjLabels}
                      onChange={(next) => updateRow(f.id, next)}
                      onRemove={() => removeRow(f.id)}
                      renderValueInput={renderValueInput}
                      autoOpenField={pendingOpenFieldId === f.id}
                      getOperatorsForColumn={getOperatorsForColumn}
                    />
                  );
                })}
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
    </>
  );
}

/* ── Popover wrapper ─────────────────────────────────────────────── */
export type FilterPopoverProps = FilterPanelProps & {
  /** Botão que abre o popover. Quando `anchor` é passado, este `trigger` é
   *  ignorado — o popover é posicionado relativo ao `anchor` mas só abre
   *  via prop `open` controlled (use case: split button externo). */
  trigger: ReactNode;
  /**
   * Anchor element pra posicionar o popover SEM disparar abertura via click.
   * Quando undefined, usa `trigger` como PopoverTrigger padrão.
   */
  anchor?: ReactNode;
  align?: "start" | "center" | "end";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

/**
 * FilterPopover — popover de filtros estilo query builder.
 * Wrapper fino: renderiza o `<FilterPanel>` dentro do PopoverContent. A limpeza
 * de linhas em branco (user clicou "+ Adicionar" mas não preencheu valor) mora
 * no PRÓPRIO `FilterPanel` (unmount-purge) — fonte única que cobre este popover,
 * o drill-down do settings menu e o split button, independente de COMO fechou.
 *
 * Dumb: `filters` (array de entries) vem do consumer. Use o hook
 * `useToolbarFilters()` se quiser gerenciamento de estado pronto.
 */
export function FilterPopover({
  trigger,
  anchor,
  align = "end",
  open,
  onOpenChange,
  className,
  ...panel
}: FilterPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {anchor ? (
        // Anchor mode: posiciona o popover mas NÃO dispara abertura — consumer
        // controla via prop `open` externa (split button pattern).
        <PopoverAnchor asChild>{anchor}</PopoverAnchor>
      ) : (
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      )}
      <PopoverContent
        align={align}
        className={cn(
          "w-[560px] max-w-[calc(100vw-32px)] max-h-[min(480px,calc(100vh-80px))] p-0 flex flex-col min-h-0 overflow-hidden",
          className,
        )}
      >
        <FilterPanel {...panel} />
      </PopoverContent>
    </Popover>
  );
}
