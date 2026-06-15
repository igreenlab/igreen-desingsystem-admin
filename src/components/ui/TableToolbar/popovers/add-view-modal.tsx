import { useEffect, useState } from "react";
import { Eye, Users, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "../../../shadcn/dialog";
import { Switch } from "../../../shadcn/switch";
import { Button } from "../../Button/button";
import { FormFieldInput } from "../../FormField/form-field-input";
import {
  dialog,
  closeBtn,
  head,
  headIcon,
  headTitleWrap,
  title,
  sub,
  body,
  toggleRow,
  toggleIcon,
  toggleText,
  toggleLabel,
  toggleDesc,
  foot,
} from "./add-view-modal.styles";

export type AddViewModalSubmit = {
  name: string;
  isPublic: boolean;
};

export type AddViewModalProps = {
  /** Controlled open. */
  open: boolean;
  /** Callback de fechamento (X, ESC, overlay click, ou apos submit). */
  onClose: () => void;
  /** Disparado quando user clica em Salvar Visao com nome valido. */
  onSubmit?: (data: AddViewModalSubmit) => void | Promise<void>;
};

/**
 * Modal "Adicionar nova visao" — replica do sandbox /design-and-table-v2.
 * Header: icon container (Eye) + titulo + sub + X custom no canto direito.
 * Body: campo "Nome da visao" + toggle card "Tornar publica".
 * Footer: Fechar (outline secondary) + Salvar Visao (primary, disabled se nome vazio).
 *
 * Reseta state ao fechar. Card toggle inteiro eh <label> — click em qualquer
 * area liga o Switch. Enter no input dispara submit.
 */
export function AddViewModal({ open, onClose, onSubmit }: AddViewModalProps) {
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setIsPublic(false);
    }
  }, [open]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await onSubmit?.({ name: trimmed, isPublic });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={dialog()} hideClose>
        <DialogClose className={closeBtn()} aria-label="Fechar">
          <X className="size-icon-sm" />
        </DialogClose>

        <header className={head()}>
          <span className={headIcon()} aria-hidden="true">
            <Eye className="size-icon-md" strokeWidth={1.7} />
          </span>
          <div className={headTitleWrap()}>
            <DialogTitle asChild>
              <h3 className={title()}>Adicionar nova visão</h3>
            </DialogTitle>
            <DialogDescription asChild>
              <p className={sub()}>
                Salve sua configuração atual de filtros e colunas
              </p>
            </DialogDescription>
          </div>
        </header>

        <div className={body()}>
          <FormFieldInput
            label="Nome da visão"
            placeholder="Ex: Royals em atendimento"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
            autoFocus
          />

          <label className={toggleRow({ on: isPublic })}>
            <span className={toggleIcon({ on: isPublic })} aria-hidden="true">
              <Users className="size-icon-sm" />
            </span>
            <span className={toggleText()}>
              <span className={toggleLabel()}>Tornar esta visão pública</span>
              <span className={toggleDesc()}>
                Outros usuários da sua equipe poderão visualizar e usar esta visão
              </span>
            </span>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </label>
        </div>

        <footer className={foot()}>
          <Button
            color="secondary"
            variant="outline"
            size="md"
            onClick={onClose}
          >
            Fechar
          </Button>
          <Button
            color="primary"
            variant="filled"
            size="md"
            onClick={handleSave}
            disabled={!name.trim()}
          >
            Salvar Visão
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
