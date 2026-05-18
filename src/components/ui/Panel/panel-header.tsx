import { X } from "lucide-react";
import { SheetClose, SheetTitle, SheetDescription } from "../../shadcn/sheet";
import { cn } from "@/lib/utils";
import {
  panelHeader,
  panelHeaderText,
  panelTitle,
  panelTitleIcon,
  panelDescription,
  panelClose,
} from "./panel.styles";
import type { LucideIcon } from "lucide-react";

export type PanelHeaderProps = {
  title?: string;
  description?: string;
  titleIcon?: LucideIcon;
  /** Esconde o botão X de fechar */
  hideClose?: boolean;
  /** className do container do header */
  className?: string;
};

export function PanelHeader({
  title,
  description,
  titleIcon: TitleIcon,
  hideClose,
  className,
}: PanelHeaderProps) {
  return (
    <header className={cn(panelHeader(), className)}>
      <div className={panelHeaderText()}>
        {title && (
          <SheetTitle asChild>
            <h2 className={panelTitle()}>
              {TitleIcon && <TitleIcon className={panelTitleIcon()} strokeWidth={1.8} />}
              <span className="truncate">{title}</span>
            </h2>
          </SheetTitle>
        )}
        {description && (
          <SheetDescription asChild>
            <p className={panelDescription()}>{description}</p>
          </SheetDescription>
        )}
      </div>
      {!hideClose && (
        <SheetClose className={panelClose()} aria-label="Fechar">
          <X size={18} strokeWidth={1.7} />
        </SheetClose>
      )}
    </header>
  );
}
