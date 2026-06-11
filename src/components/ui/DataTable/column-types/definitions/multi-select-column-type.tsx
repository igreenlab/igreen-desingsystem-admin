import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "../../../../shadcn/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../shadcn/popover";
import { FILTER_FIELD_CLASS } from "../_filter-field";
import type {
  ColumnTypeDefinition,
  FastFilterInputProps,
  FilterInputProps,
} from "../column-types.types";

/**
 * Render do dropdown multiselect — lista checkboxes com toggle.
 * Usado em ambos os contextos (modal advanced + fast filter popover).
 */
/** Normaliza value pra array — aceita string/number escalar OU array.
 *  Cenário: presets/saved views podem hidratar o filterModel com `value: "active"`
 *  (escalar) + `operator: "equals"`, mas o widget renderiza igual ao multiSelect
 *  (filterType da column é "multiSelect"). Mesmo critério usado em
 *  `renderChipValue` e `matchesFilter` mais abaixo. */
const toArray = (value: unknown): Array<string | number> => {
  if (Array.isArray(value)) return value as Array<string | number>;
  if (value == null || value === "") return [];
  return [value as string | number];
};

function MultiSelectDropdown({
  value,
  onChange,
  options = [],
  renderOption,
}: FastFilterInputProps) {
  const selected = toArray(value);
  const toggle = (val: string | number) => {
    const set = new Set(selected.map(String));
    if (set.has(String(val))) set.delete(String(val));
    else set.add(String(val));
    onChange(Array.from(set));
  };

  return (
    <div className="flex flex-col gap-gp-2xs p-pad-2xs min-w-[200px]">
      {options.length === 0 && (
        <p className="text-body-xs font-normal text-fg-muted px-pad-md py-pad-sm">
          Sem opções disponíveis
        </p>
      )}
      {options.map((opt) => {
        const isChecked = selected.map(String).includes(String(opt.value));
        return (
          <label
            key={String(opt.value)}
            className={cn(
              "flex items-center gap-gp-md w-full",
              "px-pad-md py-pad-sm rounded-radius-md",
              "text-body-md text-fg-default text-left cursor-pointer",
              "hover:bg-bg-muted focus-within:bg-bg-muted",
              "transition-colors duration-100",
            )}
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={() => toggle(opt.value)}
              aria-label={opt.label}
              className="shrink-0"
            />
            <span className="flex-1 min-w-0 truncate">
              {renderOption ? renderOption(opt) : (opt.label as ReactNode)}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/** Trigger compacto + popover pra uso no modal advanced — economiza espaço
 *  comparado a renderizar a lista de checkboxes inline. */
function MultiSelectFieldDropdown(props: FilterInputProps) {
  const { value, options = [] } = props;
  const selected = toArray(value);
  const labels = selected.map((v) => {
    const opt = options.find((o) => String(o.value) === String(v));
    return opt?.label ?? String(v);
  });
  const display =
    labels.length === 0
      ? ""
      : labels.length <= 2
        ? labels.join(", ")
        : `${labels.length} selecionados`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={FILTER_FIELD_CLASS}>
          <span className={display ? "truncate" : "text-fg-muted opacity-70 truncate"}>
            {display || "Selecione..."}
          </span>
          <ChevronDown className="size-icon-xs text-fg-muted shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        // mobileSheet OFF: como select normal, o dropdown abre ancorado abaixo do
        // trigger no mobile (em vez de virar sheet bottom-up) — facilita a seleção.
        mobileSheet={false}
        className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[200px]"
      >
        <MultiSelectDropdown {...props} />
      </PopoverContent>
    </Popover>
  );
}

export const MultiSelectColumnType: ColumnTypeDefinition = {
  type: "multiSelect",
  // Labels alinhados com `DEFAULT_OP_LABELS` do ToolbarApplied — chip e popover
  // devem usar o MESMO label pra cada operator (consistência visual). "é"/"não é"
  // ao invés de "é um de"/"não é nenhum de" — mais curto e bate com o chip.
  operators: [
    { id: "isAnyOf", label: "é" },
    { id: "isNoneOf", label: "não é" },
    { id: "isEmpty", label: "está vazio" },
    { id: "isNotEmpty", label: "não está vazio" },
  ],
  /** Modal advanced: trigger + popover (compacto).
   *  isEmpty/isNotEmpty: operator se basta — não precisa de input. */
  renderFilterInput: (props) => {
    if (props.operator === "isEmpty" || props.operator === "isNotEmpty") {
      return <span className="text-fg-muted text-body-sm pl-pad-md">(sem valor)</span>;
    }
    return <MultiSelectFieldDropdown {...props} />;
  },
  /** Chip fast filter: já está dentro de um popover, renderiza inline. */
  renderFastFilterInput: (props) => <MultiSelectDropdown {...props} />,
  matchesFilter: (cellValue, filterValue, operator) => {
    const cell = cellValue == null ? "" : String(cellValue);
    if (operator === "isEmpty") return cell.length === 0;
    if (operator === "isNotEmpty") return cell.length > 0;
    const arr = Array.isArray(filterValue)
      ? filterValue.map(String)
      : filterValue == null
        ? []
        : [String(filterValue)];
    if (arr.length === 0) return true; // filtro vazio = passa tudo
    if (operator === "isAnyOf" || operator === "equals") {
      return arr.includes(cell);
    }
    if (operator === "isNoneOf" || operator === "neq") {
      return !arr.includes(cell);
    }
    return null;
  },
  renderChipValue: (value, options) => {
    const arr = Array.isArray(value)
      ? (value as Array<string | number>)
      : value == null
        ? []
        : [value as string | number];
    if (arr.length === 0) return null;
    const labelOf = (v: string | number) =>
      options?.find((o) => String(o.value) === String(v))?.label ?? String(v);
    if (arr.length === 1) return labelOf(arr[0]);
    if (arr.length === 2) return `${labelOf(arr[0])}, ${labelOf(arr[1])}`;
    return `${arr.length} selecionados`;
  },
};
