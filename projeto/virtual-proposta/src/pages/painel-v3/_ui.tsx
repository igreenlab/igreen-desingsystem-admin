import { cn } from "@/lib/utils";

/**
 * Barra de etapas — N segmentos iguais, mesma cor, separados por divisor.
 * Preenchido (bg-brand) = etapa concluída; vazio (bg-muted) = pendente.
 * Lê como um "stepper" (≠ barra de progresso contínua).
 */
export function StepBar({
  total,
  done,
  className,
}: {
  total: number;
  done: number;
  className?: string;
}) {
  return (
    <div
      className={cn("flex gap-[3px]", className)}
      role="img"
      aria-label={`${done} de ${total} etapas concluídas`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-[6px] flex-1 rounded-radius-full",
            i < done ? "bg-bg-brand" : "bg-bg-muted",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}
