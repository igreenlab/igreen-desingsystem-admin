import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toolbarActions, toolbarLeft, toolbarRoot } from "./table-toolbar.styles";

/**
 * TableToolbar — container root da toolbar de tabela.
 *
 * Layout default: flex justify-between em duas zonas (left + actions).
 * Dumb: recebe `left` e `actions` como slots ReactNode — o consumer monta
 * livremente cada zona com as partes (`ToolbarSearch`, `ToolbarSegmented`,
 * `ToolbarTabs`, `ToolbarToolButton`, `ToolbarDivider`).
 *
 * Modo bulk: quando `bulkBar` é passado, ele substitui o conteúdo inteiro
 * da toolbar. Use com `<BulkActionsBar count={...}>` — ele auto-some quando
 * `count === 0`, então passe-o direto na prop sem condicional externo:
 *
 *   <TableToolbar
 *     left={...}
 *     actions={...}
 *     bulkBar={<BulkActionsBar count={selected.length} onClear={...}>...</BulkActionsBar>}
 *   />
 *
 * Pra filtros aplicados (chips), use `<ToolbarApplied>` LOGO ABAIXO da toolbar.
 */
export type TableToolbarProps = {
  /** Conteúdo da zona esquerda (search, view mode, tabs, "+"). */
  left?: ReactNode;
  /** Conteúdo da zona direita (filtrar, ordenar, cols, density, exportar). */
  actions?: ReactNode;
  /**
   * Quando renderizado (não null/false), substitui left+actions pela view de
   * ações em massa. Combina com `<BulkActionsBar>` (que retorna null quando
   * count=0), assim o swap fica automático sem condicional no consumer.
   */
  bulkBar?: ReactNode;
  className?: string;
};

export function TableToolbar({
  left,
  actions,
  bulkBar,
  className,
}: TableToolbarProps) {
  if (bulkBar) {
    return <div className={cn("w-full", className)}>{bulkBar}</div>;
  }
  return (
    <div className={cn(toolbarRoot(), className)}>
      <div className={toolbarLeft()}>{left}</div>
      <div className={toolbarActions()}>{actions}</div>
    </div>
  );
}
