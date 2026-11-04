import { DollarSign } from "lucide-react";
import { Input } from "@/components/shadcn/input";
import { FieldAffix, FILTER_FIELD_SIZE } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";
import { applyAffix, readAffix, toNumber } from "../_shared";

/**
 * typeOptions esperadas (todas opcionais):
 *   { currency?: "BRL" | "USD" | "EUR" | string, locale?: string,
 *     prefix?: string, suffix?: string }
 *
 * `prefix`/`suffix` (item 9a) são INDEPENDENTES de `currency`/`locale` e convivem com
 * eles: o Intl formata o valor ("R$ 1.234,56") e o afixo adorna o resultado
 * ("R$ 1.234,56 /mês"). Quem quer trocar o símbolo da moeda usa `currency`, não
 * `prefix`.
 */
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

/**
 * Faixa [mín, máx] do operador `between` — o MESMO widget no campo (builder
 * avançado + funil) e no popover do chip (item 9b do Sólis).
 *
 * O `number` já era assim: um `RangeInputs` só, usado pelas duas superfícies. O
 * `currency` tinha a faixa só no campo — o chip ignorava o operador e renderizava um
 * `<input>` único, onde a tupla `[10, 500]` virava o texto `10,500`. Compartilhar o
 * widget é o que impede a divergência de voltar: quem mexer na faixa mexe nas duas.
 *
 * `variant` é a única diferença entre elas, e é a que já existia: no **campo** os
 * inputs acompanham a altura do FilterField (36px via `FILTER_FIELD_SIZE`, para
 * Campo/Operador/Valor terem a mesma linha); no **chip** valem o Input padrão, como o
 * campo único que o popover já renderizava.
 */
function RangeInputs({
  value,
  onChange,
  variant,
  autoFocus,
}: {
  value: unknown;
  onChange: (v: [number | null, number | null]) => void;
  variant: "field" | "chip";
  autoFocus?: boolean;
}) {
  const arr = Array.isArray(value) ? value : [null, null];
  const minVal = toNumber(arr[0]);
  const maxVal = toNumber(arr[1]);
  const box =
    variant === "field"
      ? ({ size: "sm", className: FILTER_FIELD_SIZE } as const)
      : ({ className: "w-[110px]" } as const);
  /** Lado vazio emite `null`, nunca `0` — zero é um filtro de verdade. */
  const set = (side: 0 | 1, raw: string) => {
    const v = raw === "" ? null : Number(raw);
    onChange(
      (side === 0 ? [v, maxVal] : [minVal, v]) as [number | null, number | null],
    );
  };
  return (
    <div className="flex items-center gap-gp-md">
      <Input
        type="number"
        {...box}
        placeholder="min"
        aria-label="Mínimo"
        autoFocus={autoFocus}
        value={minVal == null ? "" : String(minVal)}
        onChange={(e) => set(0, e.target.value)}
      />
      <span className="text-fg-muted">–</span>
      <Input
        type="number"
        {...box}
        placeholder="max"
        aria-label="Máximo"
        value={maxVal == null ? "" : String(maxVal)}
        onChange={(e) => set(1, e.target.value)}
      />
    </div>
  );
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
  renderFilterInput: ({ value, onChange, operator, typeOptions }) => (
    <FieldAffix affix={readAffix(typeOptions)}>
      {operator === "between" ? (
        <RangeInputs variant="field" value={value} onChange={onChange} />
      ) : (
        <Input
          type="number"
          size="sm"
          className={FILTER_FIELD_SIZE}
          value={value == null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          placeholder="0,00"
        />
      )}
    </FieldAffix>
  ),
  // `between` chega aqui como TUPLA (caminho isTupleOperator do chip). Mesma guarda
  // do `number`: o operador manda, e o valor em array cobre a visão salva/preset que
  // traz a tupla antes de o operador alcançar o widget. Sem isto a tupla caía no campo
  // único e `String([10, 500])` pintava "10,500" na tela (item 9b).
  renderFastFilterInput: ({ value, onChange, operator, typeOptions }) =>
    operator === "between" || Array.isArray(value) ? (
      <div className="p-pad-md">
        <FieldAffix affix={readAffix(typeOptions)}>
          <RangeInputs variant="chip" value={value} onChange={onChange} autoFocus />
        </FieldAffix>
      </div>
    ) : (
      <div className="p-pad-md">
        <FieldAffix affix={readAffix(typeOptions)}>
          <Input
            type="number"
            value={value == null ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            placeholder="0,00"
            autoFocus
          />
        </FieldAffix>
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
  // A unidade entra UMA vez, no fim da leitura inteira: "R$ 10,00 → R$ 500,00 /mês".
  // ⚠️ `currency`/`locale` NÃO chegam aqui — o chip sempre leu em BRL, e ligá-los junto
  // mudaria o rótulo de quem já usa USD sem ter pedido nada. É a mesma fronteira do
  // `formatValue`; o item 9a é só o afixo.
  renderChipValue: (value, _options, typeOptions) => {
    const affix = readAffix(typeOptions);
    if (Array.isArray(value)) {
      const from = toNumber(value[0]);
      const to = toNumber(value[1]);
      if (from != null && to != null)
        return applyAffix(`${toCurrency(from)} → ${toCurrency(to)}`, affix);
      if (from != null) return applyAffix(`≥ ${toCurrency(from)}`, affix);
      if (to != null) return applyAffix(`≤ ${toCurrency(to)}`, affix);
      return "";
    }
    return applyAffix(toCurrency(value), affix);
  },

  /* G.2 slots */
  // `column.valueFormatter` vence o formato do tipo — mesmo escape hatch do `date`/`datetime`.
  //
  // Vence também `typeOptions` (moeda/locale): o formatter é o escape hatch inteiro, quem o
  // passa já decidiu o texto. A precedência é por EXISTÊNCIA do formatter, não pelo que ele
  // devolve — "" quer a célula vazia, não o valor formatado pelo tipo.
  renderCell: ({ value, column }) => {
    const opts = column?.typeOptions as CurrencyTypeOptions | undefined;
    return (
      <span className="font-semibold tabular-nums">
        {column?.valueFormatter
          ? column.valueFormatter(value)
          : applyAffix(toCurrency(value, opts), readAffix(column?.typeOptions))}
      </span>
    );
  },
  formatValue: (v) => toCurrency(v),
  defaultAlign: "right",
  defaultWidth: 130,
  defaultSortable: true,
  defaultIcon: DollarSign,
};
