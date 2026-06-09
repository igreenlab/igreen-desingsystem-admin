import { forwardRef } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toolbarSearch, toolbarSearchInput } from "../table-toolbar.styles";

export type ToolbarSearchProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  /** className do wrapper (não do input) */
  wrapperClassName?: string;
  /** Largura expandida quando focus ou tem value. Default true. */
  autoExpand?: boolean;
};

/**
 * ToolbarSearch — input de busca compacto que expande no foco / quando tem valor.
 *
 * Wrapper é um `<label>` semântico — clicar em qualquer parte (ícone, espaço
 * vazio, etc) foca o input nativamente. Sem JS necessário.
 *
 * Dumb: estado vem de fora via `value` + `onChange`.
 */
export const ToolbarSearch = forwardRef<HTMLInputElement, ToolbarSearchProps>(
  (
    {
      value,
      placeholder = "Buscar...",
      className,
      wrapperClassName,
      autoExpand = true,
      "aria-label": ariaLabel = "Buscar",
      ...inputProps
    },
    ref,
  ) => {
    const hasValue = Boolean(value);
    const expanded = autoExpand ? hasValue : false;

    return (
      <label className={cn(toolbarSearch({ expanded }), wrapperClassName)}>
        <Search strokeWidth={1.8} aria-hidden="true" />
        <input
          ref={ref}
          type="text"
          value={value}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={cn(toolbarSearchInput(), className)}
          {...inputProps}
        />
      </label>
    );
  },
);
ToolbarSearch.displayName = "ToolbarSearch";
