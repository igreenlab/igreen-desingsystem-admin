import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange, Matcher } from "react-day-picker";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";

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
  /**
   * Data mínima selecionável. Dias anteriores ficam desabilitados no calendário.
   *
   * O DS não oferecia limite nenhum, então "não deixar escolher data futura" ou
   * "não passar do prazo do projeto" virava validação DEPOIS do clique — o usuário
   * escolhia, e só então recebia o erro.
   */
  minValue?: Date;
  /** Data máxima selecionável. Dias posteriores ficam desabilitados. */
  maxValue?: Date;
  /**
   * Mostra um "×" no trigger pra limpar a seleção. Default `false`.
   * Com `clearable`, limpar emite `onValueChange(undefined)`.
   */
  clearable?: boolean;
  /** Nome acessível do botão de limpar. Default: "Limpar data". */
  clearLabel?: string;
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
    const {
      placeholder,
      disabled,
      align = "start",
      minValue,
      maxValue,
      clearable,
      clearLabel,
      className,
    } = props;
    const [open, setOpen] = React.useState(false);

    // O react-day-picker recebe os limites como MATCHERS de dia desabilitado; passar
    // `fromDate`/`toDate` só moveria a navegação de mês e continuaria deixando clicar.
    const desabilitados = React.useMemo(() => {
      const m: Matcher[] = [];
      if (minValue) m.push({ before: minValue });
      if (maxValue) m.push({ after: maxValue });
      return m.length ? m : undefined;
    }, [minValue, maxValue]);

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
          disabled={desabilitados}
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
      // Plural condicional: com 1 selecionada o texto fixo dizia "1 datas
      // selecionadas". Aparece sempre que o usuário escolhe a primeira data.
      label =
        v && v.length > 0
          ? v.length === 1
            ? "1 data selecionada"
            : `${v.length} datas selecionadas`
          : null;
      calendar = (
        <Calendar
          mode="multiple"
          disabled={desabilitados}
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
          disabled={desabilitados}
          numberOfMonths={props.numberOfMonths}
          selected={v}
          onSelect={(date) => {
            props.onValueChange?.(date);
            setOpen(false);
          }}
        />
      );
    }

    const limpar = () => {
      // O union de props impede chamar `onValueChange` sem estreitar o mode antes.
      if (props.mode === "range") props.onValueChange?.(undefined);
      else if (props.mode === "multiple") props.onValueChange?.(undefined);
      else props.onValueChange?.(undefined);
    };

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
              // Trigger espelha o SelectTrigger (`shadcn/select.tsx`), que é o
              // precedente do DS pra "botão que tem que parecer input": mesmos
              // tokens de bg/border/radius/padding/gap e o mesmo tratamento de
              // foco (borda + shadow-sh-ring), em vez de `ring-4` de botão.
              // Antes divergia em 6 pontos — bg-surface (opaco) no lugar de
              // bg-input (translúcido), border-default, radius-md, pad-lg,
              // gp-sm e sem hover — e por isso não lia como campo de formulário.
              "flex min-h-form-lg w-full items-center gap-gp-md",
              "rounded-radius-lg px-pad-xl",
              "bg-bg-input dark:bg-bg-muted",
              "hover:bg-bg-input-hover dark:hover:bg-bg-muted-hover",
              "border border-border-input",
              "text-body-sm font-normal text-fg-default",
              "transition-[border-color,box-shadow,background-color] outline-none",
              "focus-visible:border-border-brand focus-visible:shadow-sh-ring",
              "data-[state=open]:border-border-brand data-[state=open]:shadow-sh-ring",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-bg-input dark:disabled:hover:bg-bg-muted",
              "data-[placeholder]:text-fg-muted",
              className,
            )}
          >
            <CalendarIcon className="size-icon-sm shrink-0 text-fg-muted" strokeWidth={1.8} />
            <span className="truncate">{text}</span>
            {clearable && label && !disabled && (
              // `<span role="button">` e não `<button>`: o trigger do Popover JÁ é um
              // button, e button dentro de button é HTML inválido — o navegador
              // desaninha e o × passa a abrir o calendário junto (mesmo motivo da
              // anatomia do Chip com onRemove).
              <span
                role="button"
                tabIndex={0}
                aria-label={clearLabel ?? "Limpar data"}
                className="-mr-[2px] ml-auto grid size-icon-md shrink-0 place-items-center rounded-radius-full text-fg-muted opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  limpar();
                }}
                onKeyDown={(e) => {
                  if (e.key !== "Enter" && e.key !== " ") return;
                  e.preventDefault();
                  e.stopPropagation();
                  limpar();
                }}
              >
                <X className="size-icon-xs" aria-hidden />
              </span>
            )}
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
