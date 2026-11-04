import { Hash } from "lucide-react";
import { Input } from "@/components/shadcn/input";
import { FieldAffix, FILTER_FIELD_SIZE } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";
import { applyAffix, readAffix, toNumber } from "../_shared";

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
  // A unidade (`typeOptions.prefix`/`suffix`) adorna o campo INTEIRO, uma vez — numa
  // faixa ela vale pro par, não pra cada lado. Sem unidade o `FieldAffix` devolve o
  // input cru, sem wrapper: o campo de quem não declarou nada não mudou.
  renderFilterInput: ({ value, onChange, placeholder, operator, typeOptions }) => (
    <FieldAffix affix={readAffix(typeOptions)}>
      {operator === "between" ? (
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
      )}
    </FieldAffix>
  ),
  // between chega aqui como TUPLA (caminho isTupleOperator do chip).
  renderFastFilterInput: ({ value, onChange, operator, typeOptions }) =>
    operator === "between" || Array.isArray(value) ? (
      <div className="p-pad-md">
        <FieldAffix affix={readAffix(typeOptions)}>
          <RangeInputs value={value} onChange={onChange} autoFocus />
        </FieldAffix>
      </div>
    ) : (
      <FieldAffix affix={readAffix(typeOptions)}>
        <Input
          type="number"
          value={(value as number) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder="0"
          autoFocus
        />
      </FieldAffix>
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
  //
  // A unidade entra UMA vez, no fim da leitura inteira — "100 – 500 kWh", não
  // "100 kWh – 500 kWh". Era o pedido literal do item 9a: o chip sem unidade não diz
  // de que grandeza é a faixa, e repeti-la nos dois lados só ocupa o chip.
  renderChipValue: (value, _options, typeOptions) => {
    const affix = readAffix(typeOptions);
    if (!Array.isArray(value)) {
      const n = toNumber(value);
      return applyAffix(
        n === null ? String(value ?? "") : n.toLocaleString("pt-BR"),
        affix,
      );
    }
    const [min, max] = value as [unknown, unknown];
    const lo = toNumber(min);
    const hi = toNumber(max);
    const f = (n: number) => n.toLocaleString("pt-BR");
    if (lo !== null && hi !== null) return applyAffix(`${f(lo)} – ${f(hi)}`, affix);
    if (lo !== null) return applyAffix(`≥ ${f(lo)}`, affix);
    if (hi !== null) return applyAffix(`≤ ${f(hi)}`, affix);
    return "";
  },

  /* G.2 — number alinhado à direita, formato locale-aware */
  // `column.valueFormatter` vence o formato do tipo — mesmo escape hatch do `date`/`datetime`.
  //
  // A precedência é por EXISTÊNCIA do formatter, não pelo que ele devolve: um formatter que
  // responde "" quer a célula vazia, e cair no formato do tipo aí mostraria o número cru.
  // O valor chega ao formatter sem passar pelo `toNumber` — é o dado da linha, e decidir o
  // que fazer com null/inválido é do formatter (mesmo contrato do `date`).
  //
  // Sem `valueFormatter` nada mudou: `toLocaleString("pt-BR")`, e valor vazio/inválido
  // segue sem render.
  // `typeOptions.prefix`/`suffix` (item 9a) adornam o texto do TIPO e ficam ABAIXO do
  // formatter na precedência: o formatter é o escape hatch inteiro, e grudar " kWh" no
  // "1,2 mil" dele seria um texto que ninguém pediu e que não dá pra desligar.
  // Valor vazio/inválido segue sem render — nunca a unidade sozinha.
  renderCell: ({ value, column }) => {
    if (column?.valueFormatter) {
      return <span className="tabular-nums">{column.valueFormatter(value)}</span>;
    }
    const n = toNumber(value);
    if (n === null) return null;
    return (
      <span className="tabular-nums">
        {applyAffix(n.toLocaleString("pt-BR"), readAffix(column?.typeOptions))}
      </span>
    );
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
