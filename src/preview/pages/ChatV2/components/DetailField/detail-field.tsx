import type { ReactNode } from "react";

export type DetailFieldProps = {
  /** Label à esquerda (text-fg-muted). */
  label: string;
  /** Valor à direita — string, número ou ReactNode (Chip, link, etc). */
  value: ReactNode;
};

/**
 * Row label : value usada nas seções de detalhes (Contato, Atendimento).
 * Layout flex baseline justify-between, quebra de palavra no valor.
 */
export function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="flex items-baseline justify-between gap-gp-md py-pad-2xs">
      <span className="text-body-xs font-normal text-fg-muted shrink-0">{label}</span>
      <span className="text-body-xs font-normal text-fg-default text-right break-words min-w-0">
        {value || "—"}
      </span>
    </div>
  );
}
