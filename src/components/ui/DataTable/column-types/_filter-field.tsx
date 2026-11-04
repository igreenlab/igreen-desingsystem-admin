import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Helpers compartilhados pelos triggers/inputs do modal Filtros (advanced).
 *
 * Sincronizados com `FIELD_BASE` + `INPUT_FIELD` do FilterPopover pra que
 * Campo/Operador/Valor tenham altura, padding, radius, bg, border e tipografia
 * IDÊNTICOS — sem diferença visual entre tipos (date, text, select, etc).
 *
 * Altura: form-md (36px). Radius: md. Padding: pad-xl. Text: 13px.
 *
 * Use:
 *  - `FILTER_FIELD_CLASS` em `<button>` ou divs construídos from-scratch
 *    (date/tags/multiSelect triggers que precisam estrutura própria).
 *  - `FILTER_FIELD_SIZE` em primitives DS (`<Input>`, `<SelectTrigger>`) que
 *    já têm bg/border próprios — só sobrescreve altura+radius pra match.
 */

/** Trigger completo from-scratch — bg, border, foco, tudo. */
export const FILTER_FIELD_CLASS = cn(
  // Box-model
  "flex min-h-form-md h-form-md w-full items-center justify-between gap-gp-md",
  "rounded-radius-md px-pad-xl",
  // Tipografia
  "text-body-sm font-normal",
  // Visual
  "bg-bg-input dark:bg-bg-muted",
  "border border-border-input text-fg-default",
  // Estado
  "outline-none transition-[border-color,box-shadow,background-color]",
  "focus-visible:border-border-brand focus-visible:shadow-sh-ring",
  "data-[state=open]:border-border-brand data-[state=open]:shadow-sh-ring",
);

/** Só sizing override — usado em primitives shadcn que já têm visual próprio
 *  mas vêm com altura default form-lg (40px). Garante match com FIELD_BASE. */
export const FILTER_FIELD_SIZE = cn(
  "min-h-form-md h-form-md rounded-radius-md",
);

/**
 * Unidade ao lado do campo de filtro — `typeOptions.prefix`/`suffix` dos tipos
 * numéricos (item 9a do Sólis).
 *
 * Por que ao LADO e não dentro do valor: o campo é `<input type="number">`; "1234 kWh"
 * não é um número e o navegador recusaria. A unidade é adorno estático, e quem digita
 * segue digitando só o número — que é o que o filtro compara.
 *
 * **Sem `prefix` nem `suffix` o componente devolve o filho CRU**, sem wrapper nenhum:
 * o campo de quem não declarou unidade tem exatamente o DOM de antes. É a diferença
 * entre "não mudou" e "quase não mudou".
 *
 * A unidade entra UMA vez por campo — numa faixa (`between`, dois inputs) ela adorna o
 * par, não cada lado: "100 [–] 500 kWh", não "100 kWh – 500 kWh".
 */
export function FieldAffix({
  affix,
  children,
}: {
  affix?: { prefix?: string; suffix?: string };
  children: ReactNode;
}) {
  if (!affix?.prefix && !affix?.suffix) return <>{children}</>;
  return (
    <div className="flex min-w-0 items-center gap-gp-xs">
      {affix.prefix ? (
        <span className="shrink-0 whitespace-nowrap text-body-sm text-fg-muted">
          {affix.prefix.trim()}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">{children}</div>
      {affix.suffix ? (
        <span className="shrink-0 whitespace-nowrap text-body-sm text-fg-muted">
          {affix.suffix.trim()}
        </span>
      ) : null}
    </div>
  );
}

export type FastSingleOption = { value: string; label: ReactNode };

/**
 * Lista single-select pro fast filter de chips (boolean/select).
 *
 * ⚠️ NÃO usar `<Select open>` aninhado dentro do PopoverContent do chip: o
 * listbox do Radix Select ancora no seu próprio trigger (sr-only, ~0px) → o
 * popover aparece deslocado pra baixo e o layer sempre-aberto trava o dismiss
 * por clique-fora (bug do item 8). Renderizar a lista DIRETO no PopoverContent
 * — como o MultiSelectDropdown — posiciona certo e fecha no clique-fora.
 */
export function FastSingleSelectList({
  options,
  selected,
  onSelect,
}: {
  options: FastSingleOption[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div role="listbox" className="flex flex-col gap-gp-2xs p-pad-2xs min-w-[180px]">
      {options.length === 0 && (
        <p className="text-body-xs font-normal text-fg-muted px-pad-md py-pad-sm">
          Sem opções disponíveis
        </p>
      )}
      {options.map((opt) => {
        const isSel = String(opt.value) === selected;
        return (
          <button
            key={opt.value}
            type="button"
            role="option"
            aria-selected={isSel}
            onClick={() => onSelect(opt.value)}
            className={cn(
              "flex items-center gap-gp-md w-full px-pad-md py-pad-sm rounded-radius-md",
              "text-body-md text-fg-default text-left cursor-pointer",
              "hover:bg-bg-muted focus-visible:bg-bg-muted focus-visible:outline-none",
              "transition-colors duration-100",
            )}
          >
            <Check
              className={cn(
                "size-icon-sm shrink-0 text-fg-brand",
                isSel ? "opacity-100" : "opacity-0",
              )}
              aria-hidden="true"
            />
            <span className="flex-1 min-w-0 truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
