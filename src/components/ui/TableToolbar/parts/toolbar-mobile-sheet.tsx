import { useId, useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../../Button/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../../../shadcn/dialog";
import { cn } from "@/lib/utils";

export type ToolbarMobileDialogProps = {
  /**
   * Conteúdo do dialog — geralmente uma stack vertical com `ToolbarMobileSection`,
   * segmented groups, e botões outline fullWidth.
   */
  children: ReactNode;
  /** Trigger custom. Se omitido, usa um Button outline icon-md com ícone Sliders. */
  trigger?: ReactNode;
  /**
   * Título (acessibilidade — fica visually-hidden por default pra não competir
   * com o conteúdo). Default "Filtros e ações".
   */
  title?: string;
  /** Estado controlado. Se omitido, gerencia internamente. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Breakpoint acima do qual o trigger fica escondido (= "desktop").
   * Default: `"md"` (≥768px esconde). Use `"xl"` (≥1280px) pra colapsar mais
   * cedo em laptops onde a toolbar começa a quebrar em multi-linha.
   */
  desktopBreakpoint?: "md" | "lg" | "xl" | "2xl";
  /**
   * className aplicada no trigger wrapper. Default vem com `{breakpoint}:hidden`
   * (só aparece abaixo do breakpoint). Passe override se precisar.
   */
  className?: string;
  /** className do DialogContent (caso queira ajustar largura ou padding) */
  contentClassName?: string;
};

/** Mapa breakpoint → classe Tailwind literal (JIT detecta cada uma). */
const HIDDEN_AT: Record<
  NonNullable<ToolbarMobileDialogProps["desktopBreakpoint"]>,
  string
> = {
  md: "md:hidden",
  lg: "lg:hidden",
  xl: "xl:hidden",
  "2xl": "2xl:hidden",
};

/**
 * ToolbarMobileDialog — modal centralizado pra colapsar actions da toolbar em mobile.
 *
 * Visual alinhado com o `<CommandDialog>` do shadcn: 384px, radius 12px,
 * border-default + outline-float (halo), sem header visível, conteúdo direto.
 *
 * Padrão de uso:
 *
 *   <TableToolbar
 *     actions={
 *       <>
 *         <div className="hidden md:flex ...">{...desktop...}</div>
 *         <ToolbarMobileDialog>
 *           <ToolbarMobileSection title="Densidade">
 *             <ToolbarSegmented fluid ... />
 *           </ToolbarMobileSection>
 *           ...
 *         </ToolbarMobileDialog>
 *       </>
 *     }
 *   />
 *
 * Fecha com ESC ou click no overlay (default do Radix Dialog). Não tem botão X
 * pra manter o visual limpo do Command.
 */
export function ToolbarMobileDialog({
  children,
  trigger,
  title = "Filtros e ações",
  open: openProp,
  onOpenChange,
  desktopBreakpoint = "md",
  className,
  contentClassName,
}: ToolbarMobileDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const titleId = useId();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            color="secondary"
            variant="outline"
            size="icon-md"
            aria-label="Mais opções"
            className={cn(HIDDEN_AT[desktopBreakpoint], className)}
          >
            <MoreHorizontal />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        hideClose
        aria-labelledby={titleId}
        className={cn(
          // Visual alinhado com CommandDialog
          "overflow-hidden p-0 gap-0 sm:max-w-[384px]",
          "rounded-[12px] border border-border-default outline-float",
          contentClassName,
        )}
      >
        <DialogTitle id={titleId} className="sr-only">
          {title}
        </DialogTitle>
        <div className="flex flex-col gap-gp-3xl p-pad-2xl max-h-[85vh] overflow-y-auto">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Alias legado — usar `ToolbarMobileDialog`. */
export const ToolbarMobileSheet = ToolbarMobileDialog;
export type ToolbarMobileSheetProps = ToolbarMobileDialogProps;

/**
 * ToolbarMobileSection — grupo lógico dentro do `ToolbarMobileDialog`.
 * Title sutil (peso medium, sem caps), conteúdo empilhado.
 *
 *   <ToolbarMobileSection title="Densidade">
 *     <ToolbarSegmented fluid ... />
 *   </ToolbarMobileSection>
 *
 *   <ToolbarMobileSection title="Ações">
 *     <Button color="secondary" variant="outline" iconLeft={<Filter />} fullWidth
 *             className="justify-start">
 *       Filtrar
 *     </Button>
 *   </ToolbarMobileSection>
 */
export type ToolbarMobileSectionProps = {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ToolbarMobileSection({
  title,
  children,
  className,
}: ToolbarMobileSectionProps) {
  return (
    <section className={cn("flex flex-col gap-gp-md", className)}>
      {title && (
        <h3 className="text-body-xs font-medium text-fg-muted">{title}</h3>
      )}
      <div className="flex flex-col gap-gp-md">{children}</div>
    </section>
  );
}
