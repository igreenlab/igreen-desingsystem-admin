import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/shadcn/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";

export type { DateRange };

interface BaseDatePickerProps {
  /** Texto do trigger quando nada está selecionado. */
  placeholder?: string;
  /** Desabilita o trigger. */
  disabled?: boolean;
  /** Alinhamento do popover. Default `"start"`. */
  align?: "start" | "center" | "end";
  /** Nº de meses no calendário. Default: 1 (single/multiple), 2 (range). */
  numberOfMonths?: number;
  /** className do trigger (mesmos overrides de um input/SelectTrigger). */
  className?: string;
}

interface SingleDatePickerProps extends BaseDatePickerProps {
  /** Seleção única (default). */
  mode?: "single";
  value?: Date;
  onValueChange?: (value: Date | undefined) => void;
}

interface RangeDatePickerProps extends BaseDatePickerProps {
  /** Seleção de intervalo (início–fim), com o realce de range do DS. */
  mode: "range";
  value?: DateRange;
  onValueChange?: (value: DateRange | undefined) => void;
}

interface MultipleDatePickerProps extends BaseDatePickerProps {
  /** Seleção de múltiplas datas. */
  mode: "multiple";
  value?: Date[];
  onValueChange?: (value: Date[] | undefined) => void;
}

export type DatePickerProps =
  | SingleDatePickerProps
  | RangeDatePickerProps
  | MultipleDatePickerProps;

const formatFull = (date: Date) =>
  date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const formatShort = (date: Date) =>
  date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/**
 * DatePicker — seletor de data(s) num trigger no estilo input do DS + Popover.
 * Suporta os modos do Calendar via `mode` (default `"single"`):
 *  - `"single"`: uma data. `value: Date`.
 *  - `"range"`: intervalo início–fim (com o realce de range do DS). `value: DateRange`.
 *  - `"multiple"`: várias datas. `value: Date[]`.
 * Controlado via `value` / `onValueChange`. Fecha ao completar a seleção
 * (single: no clique; range: quando início E fim escolhidos).
 */
export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (props, ref) => {
    const { placeholder, disabled, align = "start", className } = props;
    const [open, setOpen] = React.useState(false);

    let label: string | null = null;
    let calendar: React.ReactNode;

    if (props.mode === "range") {
      const v = props.value;
      label = v?.from
        ? v.to
          ? `${formatShort(v.from)} – ${formatShort(v.to)}`
          : formatShort(v.from)
        : null;
      calendar = (
        <Calendar
          mode="range"
          // min=1: sem isso o RDP completa o range no PRIMEIRO clique
          // ({from,to} iguais), fechando o popover e impedindo escolher o fim.
          min={1}
          numberOfMonths={props.numberOfMonths ?? 2}
          selected={v}
          onSelect={(range) => {
            props.onValueChange?.(range);
            if (range?.from && range?.to) setOpen(false);
          }}
          autoFocus
        />
      );
    } else if (props.mode === "multiple") {
      const v = props.value;
      label = v && v.length > 0 ? `${v.length} datas selecionadas` : null;
      calendar = (
        <Calendar
          mode="multiple"
          numberOfMonths={props.numberOfMonths}
          selected={v}
          onSelect={(dates) => props.onValueChange?.(dates)}
          autoFocus
        />
      );
    } else {
      const v = props.value;
      label = v ? formatFull(v) : null;
      calendar = (
        <Calendar
          mode="single"
          numberOfMonths={props.numberOfMonths}
          selected={v}
          onSelect={(date) => {
            props.onValueChange?.(date);
            setOpen(false);
          }}
        />
      );
    }

    const text =
      label ??
      placeholder ??
      (props.mode === "range" ? "Selecione o período" : "Selecione a data");

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            data-placeholder={label ? undefined : ""}
            className={cn(
              "flex min-h-form-lg w-full items-center gap-gp-sm rounded-radius-md border border-border-default bg-bg-surface px-pad-lg text-body-sm text-fg-default",
              "transition-[color,box-shadow,background-color] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "data-[placeholder]:text-fg-muted",
              className,
            )}
          >
            <CalendarIcon className="size-icon-sm shrink-0 text-fg-muted" strokeWidth={1.8} />
            <span className="truncate">{text}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align={align} className="w-auto p-pad-xl">
          {calendar}
        </PopoverContent>
      </Popover>
    );
  },
);

DatePicker.displayName = "DatePicker";
