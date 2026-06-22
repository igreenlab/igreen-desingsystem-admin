import { cn } from "@/lib/utils";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Separator } from "@/components/shadcn/separator";
import { dateSeparatorChipStyles } from "./date-separator-chip.styles";
import type { DateSeparatorChipProps } from "./date-separator-chip.types";

/**
 * DateSeparatorChip — separador centralizado na thread do chat/atendimento.
 *
 * Compõe `Chip` (pílula neutra `soft`) + `Icon` (opcional) + `Separator`
 * (réguas finas, só em `boundary`). Marcador estático — não interativo.
 *
 * Variantes:
 *   - `date` (default): só o chip pílula neutra centralizado (separador de data
 *     da MessagesList — "Hoje", "Ontem", "22 jun").
 *   - `boundary`: chip entre 2 réguas finas — "conversa encerrada/iniciada".
 *
 * @example
 * <DateSeparatorChip label="Hoje" />
 * <DateSeparatorChip variant="boundary" icon="line-check-circle" label="Conversa encerrada" />
 */
export function DateSeparatorChip({
  label,
  variant = "date",
  icon,
  className,
}: DateSeparatorChipProps) {
  const styles = dateSeparatorChipStyles({ variant });
  const isBoundary = variant === "boundary";

  const chip = (
    <Chip color="neutral" variant="soft" size="sm" className={styles.chip()}>
      {icon ? <Icon name={icon} size="xs" /> : null}
      {label}
    </Chip>
  );

  return (
    <div role="separator" aria-label={label} className={cn(styles.root(), className)}>
      {isBoundary ? (
        <>
          <Separator decorative className={styles.rule()} />
          {chip}
          <Separator decorative className={styles.rule()} />
        </>
      ) : (
        chip
      )}
    </div>
  );
}
