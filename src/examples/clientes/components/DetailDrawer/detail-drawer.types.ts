import type { ClientRow } from "../../_table-data";

export type DetailDrawerProps = {
  /** Cliente em exibição. Quando `null` o drawer fica desmontado. */
  row: ClientRow | null;
  /** Fecha o drawer (chamado por ESC, X do header e Cancelar). */
  onClose: () => void;
  /** Disparado pelo botão Editar (ícone Pencil no header). Opcional. */
  onEdit?: (row: ClientRow) => void;
  /** Disparado pelo botão Excluir (ícone Trash no header). Opcional. */
  onDelete?: (row: ClientRow) => void;
  /** Disparado pelo CTA "Salvar alterações" do footer. Opcional. */
  onSave?: (row: ClientRow) => void;
};
