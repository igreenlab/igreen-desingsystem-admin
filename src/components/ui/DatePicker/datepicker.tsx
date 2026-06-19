import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/shadcn/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";

export interface DatePickerProps {
  /** Data selecionada (controlado). */
  value?: Date;
  /** Disparado ao escolher uma data (ou limpar → undefined). */
  onValueChange?: (date: Date | undefined) => void;
  /** Texto do trigger quando nada está selecionado. */
  placeholder?: string;
  /** Desabilita o trigger. */
  disabled?: boolean;
  /** Alinhamento do popover. Default `"start"`. */
  align?: "start" | "center" | "end";
  /** className do trigger (mesmos overrides de um input/SelectTrigger). */
  className?: string;
}

const formatDate = (date: Date) =>
  date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

/**
 * DatePicker — seletor de data único. Composto sobre Popover + Calendar, com
 * trigger no estilo input do DS (ícone + data formatada / placeholder).
 * Controlado via `value` / `onValueChange`. Fecha ao escolher a data.
 */
export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    { value, onValueChange, placeholder = "Selecione a data", disabled, align = "start", className },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            data-placeholder={value ? undefined : ""}
            className={cn(
              "flex min-h-form-lg w-full items-center gap-gp-sm rounded-radius-md border border-border-default bg-bg-surface px-pad-lg text-body-sm text-fg-default",
              "transition-[color,box-shadow,background-color] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "data-[placeholder]:text-fg-muted",
              className,
            )}
          >
            <CalendarIcon className="size-icon-sm shrink-0 text-fg-muted" strokeWidth={1.8} />
            <span className="truncate">{value ? formatDate(value) : placeholder}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align={align} className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onValueChange?.(date);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    );
  },
);

DatePicker.displayName = "DatePicker";
