import type { IconName } from "@/components/ui/Icon";
import type { DateSeparatorChipVariantProps } from "./date-separator-chip.styles";

/** Variante visual do separador. */
export type DateSeparatorChipVariant = NonNullable<
  DateSeparatorChipVariantProps["variant"]
>;

export interface DateSeparatorChipProps {
  /** Texto centralizado da pílula (ex: "Hoje", "Conversa encerrada"). Obrigatório. */
  label: string;
  /**
   * `date` (default) → só o chip pílula neutra centralizado (separador de data).
   * `boundary` → chip entre 2 réguas finas (conversa encerrada/iniciada).
   */
  variant?: DateSeparatorChipVariant;
  /**
   * Ícone opcional à esquerda do label. Útil em `boundary`
   * (ex: `line-check-circle` pra "conversa encerrada").
   */
  icon?: IconName;
  /** className do container (root). */
  className?: string;
}
