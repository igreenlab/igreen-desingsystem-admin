import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { dataTableStyles } from "../data-table.styles";

const styles = dataTableStyles();

export type DataTableFloatingBulkBarProps = {
  count: number;
  onClear: () => void;
  /** Render custom de actions a direita do count. */
  actions?: ReactNode;
};

/**
 * @deprecated DataTable usa `TableToolbar.bulkBar` slot com `<BulkActionsBar>`
 * inline desde 2026-05-12. Este componente flutuante é mantido por
 * backward-compat pra consumers standalone. Avaliar remoção em V2.
 */
export function DataTableFloatingBulkBar({
  count,
  onClear,
  actions,
}: DataTableFloatingBulkBarProps) {
  if (count === 0) return null;
  return (
    <div className={styles.bulkBar()} role="region" aria-label="Acoes em massa">
      <span className="text-body-md font-medium whitespace-nowrap">
        {count} selecionado{count > 1 ? "s" : ""}
      </span>
      {actions && <div className="flex items-center gap-gp-sm">{actions}</div>}
      <Button
        size="icon-xs"
        variant="ghost"
        color="secondary"
        aria-label="Limpar selecao"
        onClick={onClear}
      >
        <X />
      </Button>
    </div>
  );
}
