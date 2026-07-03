import { forwardRef, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import {
  monthYearStyles,
  monthYearMonthButton,
} from "./month-year-picker.styles";
import type { MonthYearPickerProps } from "./month-year-picker.types";

/** `"YYYY-MM"` → `{ year, month }` (month 1-12) ou `null` se inválido. */
function parseValue(value?: string): { year: number; month: number } | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

/** `{year, month}` → índice comparável `year*12 + (month-1)`. */
function toOrdinal(year: number, monthIndex: number): number {
  return year * 12 + monthIndex;
}

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * MonthYearPicker — seleciona um período mês+ano. `value`/`onValueChange` usam
 * `"YYYY-MM"`. Rótulos de mês vêm do `Intl` no `locale` (default pt-BR).
 *
 * UX: trigger espelha um `Select` (mostra "Julho de 2026"); ao abrir, um popover
 * traz navegação de ano (‹ 2026 ›) + grade 3×4 de meses. Meses fora de
 * `[min, max]` ficam desabilitados.
 */
export const MonthYearPicker = forwardRef<
  HTMLButtonElement,
  MonthYearPickerProps
>(function MonthYearPicker(
  {
    value,
    onValueChange,
    placeholder = "Selecione o mês",
    min,
    max,
    locale = "pt-BR",
    disabled,
    open: openProp,
    defaultOpen,
    onOpenChange,
    align = "start",
    className,
    contentClassName,
    "aria-label": ariaLabel,
  },
  ref,
) {
  const parsed = parseValue(value);
  const now = new Date();

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  const [viewYear, setViewYear] = useState<number>(
    parsed?.year ?? now.getFullYear(),
  );

  // Rótulos curtos ("Jan", "Fev", …) — memoizados por locale.
  const monthLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { month: "short" });
    return Array.from({ length: 12 }, (_, i) =>
      capitalizeFirst(fmt.format(new Date(2020, i, 1)).replace(/\.$/, "")),
    );
  }, [locale]);

  const triggerLabel = useMemo(() => {
    if (!parsed) return null;
    const fmt = new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
    });
    return capitalizeFirst(fmt.format(new Date(parsed.year, parsed.month - 1, 1)));
  }, [parsed, locale]);

  const styles = monthYearStyles();

  const minParsed = parseValue(min);
  const maxParsed = parseValue(max);
  const minOrdinal = minParsed
    ? toOrdinal(minParsed.year, minParsed.month - 1)
    : -Infinity;
  const maxOrdinal = maxParsed
    ? toOrdinal(maxParsed.year, maxParsed.month - 1)
    : Infinity;

  const isMonthDisabled = (monthIndex: number) => {
    const ord = toOrdinal(viewYear, monthIndex);
    return ord < minOrdinal || ord > maxOrdinal;
  };

  // Ano anterior/seguinte navegável enquanto sobrepuser o intervalo permitido.
  const prevYearDisabled = toOrdinal(viewYear - 1, 11) < minOrdinal;
  const nextYearDisabled = toOrdinal(viewYear + 1, 0) > maxOrdinal;

  const selectMonth = (monthIndex: number) => {
    const next = `${viewYear}-${String(monthIndex + 1).padStart(2, "0")}`;
    onValueChange?.(next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          disabled={disabled}
          data-placeholder={parsed ? undefined : ""}
          className={styles.trigger({ className })}
        >
          <CalendarDays
            className={styles.triggerLeadingIcon()}
            aria-hidden="true"
          />
          <span className={styles.value()}>
            {triggerLabel ?? placeholder}
          </span>
          <ChevronDown className={styles.triggerIcon()} aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className={styles.content({ className: contentClassName })}
      >
        <div className={styles.header()}>
          <button
            type="button"
            className={styles.navButton()}
            onClick={() => setViewYear((y) => y - 1)}
            disabled={prevYearDisabled}
            aria-label="Ano anterior"
          >
            <ChevronLeft className="size-icon-sm" aria-hidden="true" />
          </button>
          <span className={styles.yearLabel()} aria-live="polite">
            {viewYear}
          </span>
          <button
            type="button"
            className={styles.navButton()}
            onClick={() => setViewYear((y) => y + 1)}
            disabled={nextYearDisabled}
            aria-label="Próximo ano"
          >
            <ChevronRight className="size-icon-sm" aria-hidden="true" />
          </button>
        </div>
        <div className={styles.grid()} role="grid">
          {monthLabels.map((label, i) => {
            const monthDisabled = isMonthDisabled(i);
            const isSelected =
              parsed?.year === viewYear && parsed?.month === i + 1;
            return (
              <button
                key={label}
                type="button"
                role="gridcell"
                aria-pressed={isSelected}
                disabled={monthDisabled}
                onClick={() => selectMonth(i)}
                className={monthYearMonthButton({
                  selected: isSelected,
                  disabled: monthDisabled,
                })}
              >
                {label}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
});
MonthYearPicker.displayName = "MonthYearPicker";
