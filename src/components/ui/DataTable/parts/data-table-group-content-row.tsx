import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { DataTableGroupRow } from "../utils/group-rows";

export type DataTableGroupContentRowProps<T> = {
  group: DataTableGroupRow<T>;
  /** Render do consumer — recebe `group` (incluindo `rows`) e devolve qualquer ReactNode. */
  render: (params: {
    group: {
      key: string;
      field: string;
      value: unknown;
      label: string;
      count: number;
      rows: T[];
    };
  }) => ReactNode;
  /** Style inline pra virtualização. */
  style?: React.CSSProperties;
};

/**
 * Slot de conteúdo livre do grupo — substitui as N child TableRows quando
 * consumer passa renderGroupContent. Ocupa row inteira (não alinhado a colunas),
 * sticky left=0 pra não ser cortado por scroll horizontal da tabela principal.
 *
 * Use cases: sub-tabela com colunas diferentes, lista compacta, cards, gráficos,
 * qualquer composição que o consumer queira dentro do grupo expandido.
 *
 * Trade-off com virtualização: tanstack/react-virtual usa `estimateRowHeight`
 * fixo. Se o conteúdo customizado tem altura variável, virtualização pode
 * sub/super estimar — passe `estimateRowHeight` adequado ao seu conteúdo,
 * ou desligue virtualize quando renderGroupContent estiver ativo.
 */
export function DataTableGroupContentRow<T>({
  group,
  render,
  style,
}: DataTableGroupContentRowProps<T>) {
  return (
    <div
      role="row"
      data-group-content="true"
      data-group-key={group.key}
      style={style}
      className={cn(
        "flex w-full min-w-full",
        "bg-bg-table",
        "border-b border-border-table",
        // Sticky horizontal: gruda no left=0 do viewport pra ocupar área visível
        // independente do scroll horizontal da tabela.
        "sticky left-0",
      )}
    >
      {render({
        group: {
          key: group.key,
          field: group.field,
          value: group.value,
          label: group.label,
          count: group.count,
          rows: group.rows,
        },
      })}
    </div>
  );
}
