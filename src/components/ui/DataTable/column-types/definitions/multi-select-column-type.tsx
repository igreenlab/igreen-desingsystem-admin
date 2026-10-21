import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/ui/Button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
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

/** A partir de quantas opções a lista ganha campo de busca. Abaixo disso a
 *  busca só adiciona altura (status com 3 valores não precisa filtrar). */
const BUSCA_A_PARTIR_DE = 10;

function MultiSelectDropdown({
  value,
  onChange,
  options = [],
  renderOption,
}: FastFilterInputProps) {
  const selected = toArray(value);
  const [busca, setBusca] = useState("");
  const visiveis = busca
    ? options.filter((o) =>
        o.label.toLowerCase().includes(busca.toLowerCase()),
      )
    : options;
  const selectedSet = new Set(selected.map(String));
  const toggle = (val: string | number) => {
    const set = new Set(selected.map(String));
    if (set.has(String(val))) set.delete(String(val));
    else set.add(String(val));
    onChange(Array.from(set));
  };
  // "Selecionar todos" é ADITIVO sobre os VISÍVEIS: com busca ativa seleciona
  // só o resultado filtrado, sem perder o que já estava marcado fora dele.
  const selecionarVisiveis = () => {
    const set = new Set(selected.map(String));
    for (const o of visiveis) set.add(String(o.value));
    onChange(Array.from(set));
  };
  const todosVisiveisMarcados =
    visiveis.length > 0 &&
    visiveis.every((o) => selectedSet.has(String(o.value)));

  return (
    <div className="flex flex-col gap-gp-2xs p-pad-2xs min-w-[200px]">
      {options.length >= BUSCA_A_PARTIR_DE && (
        <Input
          autoFocus
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar..."
          aria-label="Buscar opção"
        />
      )}
      <div className="flex max-h-[240px] flex-col gap-gp-2xs overflow-y-auto scrollbar-thin pr-pad-2xs">
        {options.length === 0 && (
          <p className="text-body-xs font-normal text-fg-muted px-pad-md py-pad-sm">
            Sem opções disponíveis
          </p>
        )}
        {options.length > 0 && visiveis.length === 0 && (
          <p className="text-body-xs font-normal text-fg-muted px-pad-md py-pad-sm">
            Nenhuma opção encontrada
          </p>
        )}
        {visiveis.map((opt) => {
          const isChecked = selectedSet.has(String(opt.value));
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
      {options.length > 1 && (
        <div className="flex items-center justify-between gap-gp-md border-t border-border-subtle pt-pad-sm">
          <div className="flex items-center gap-gp-xs">
            <Button
              color="secondary"
              variant="ghost"
              size="2xs"
              onClick={selecionarVisiveis}
              disabled={todosVisiveisMarcados}
            >
              {busca ? "Selecionar visíveis" : "Selecionar todos"}
            </Button>
            <Button
              color="secondary"
              variant="ghost"
              size="2xs"
              onClick={() => onChange([])}
              disabled={selected.length === 0}
            >
              Limpar
            </Button>
          </div>
          <span className="text-caption-xs text-fg-subtle tabular-nums pr-pad-sm">
            {selected.length}/{options.length}
          </span>
        </div>
      )}
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
