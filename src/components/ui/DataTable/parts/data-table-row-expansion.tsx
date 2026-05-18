import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type DataTableRowExpansionProps<T> = {
  row: T;
  render: (params: { row: T }) => ReactNode;
  /** Style inline pra virtualização. */
  style?: React.CSSProperties;
};

/**
 * Slot expandido abaixo de uma row — full-width, sticky-left no eixo horizontal.
 *
 * Não respeita estrutura de colunas da tabela. Consumer pode renderizar:
 *  - Sub-tabela com colunas próprias
 *  - Lista compacta de campos (key/value)
 *  - Cards de detalhe
 *  - Gráficos, timeline, qualquer coisa
 *
 * `sticky left-0` garante que o conteúdo fica visível mesmo quando há scroll
 * horizontal na tabela principal (cells da row vão pra direita, mas o
 * expansion permanece ancorado no viewport).
 *
 * Trade-off com virtualize: `estimateRowHeight` é fixo. Se conteúdo expandido
 * tem altura variável grande, virtualização pode sub/super estimar — passe
 * `estimateRowHeight` adequado ou desligue virtualize.
 */
export function DataTableRowExpansion<T>({
  row,
  render,
  style,
}: DataTableRowExpansionProps<T>) {
  return (
    <div
      role="row"
      data-row-expansion="true"
      style={style}
      className={cn(
        "flex w-full min-w-full",
        "bg-bg-subtle",
        "border-b border-border-table",
        // Sticky horizontal pra ocupar viewport visível, não cortar no scroll-X
        "sticky left-0",
      )}
    >
      {render({ row })}
    </div>
  );
}
