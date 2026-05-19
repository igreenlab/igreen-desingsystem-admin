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
