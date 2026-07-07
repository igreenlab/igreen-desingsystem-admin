import type { ReactNode } from "react";

/** Valor do picker — sempre `"YYYY-MM"` (ex.: `"2026-07"` = julho/2026). */
export type MonthYearValue = string;

export interface MonthYearPickerProps {
  /** Valor selecionado (controlado), no formato `"YYYY-MM"`. */
  value?: MonthYearValue;
  /** Disparado ao escolher um mês — recebe `"YYYY-MM"`. */
  onValueChange?: (value: MonthYearValue) => void;
  /** Texto do trigger quando nada está selecionado. Default `"Selecione o mês"`. */
  placeholder?: ReactNode;
  /** Limite inferior selecionável (inclusive), `"YYYY-MM"`. Meses abaixo ficam desabilitados. */
  min?: MonthYearValue;
  /** Limite superior selecionável (inclusive), `"YYYY-MM"`. Meses acima ficam desabilitados. */
  max?: MonthYearValue;
  /** Locale usado para os rótulos de mês (Intl). Default `"pt-BR"`. */
  locale?: string;
  /** Desabilita o trigger. */
  disabled?: boolean;
  /** Abertura controlada do dropdown. */
  open?: boolean;
  /** Abertura inicial (não-controlada). */
  defaultOpen?: boolean;
  /** Notifica mudança de abertura. */
  onOpenChange?: (open: boolean) => void;
  /** Alinhamento do dropdown em relação ao trigger. Default `"start"`. */
  align?: "start" | "center" | "end";
  /** className aplicada ao trigger (mesmos overrides de um `SelectTrigger`). */
  className?: string;
  /** className aplicada ao dropdown (PopoverContent). */
  contentClassName?: string;
  /** Rótulo acessível do trigger. */
  "aria-label"?: string;
}
