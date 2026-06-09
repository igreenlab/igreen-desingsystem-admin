import { forwardRef, type ReactNode } from "react";
import { Button } from "../../Button/button";
import { cn } from "@/lib/utils";
import { toolbarToolDot } from "../table-toolbar.styles";

export type ToolbarToolButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "color"
> & {
  /** Ícone à esquerda */
  icon?: ReactNode;
  /** Label do botão. Se omitido, vira icon-only (40×40). */
  label?: ReactNode;
  /** Borda+texto em brand (estado "tem filtros aplicados") */
  isActive?: boolean;
  /** Mostra dot indicator no canto superior direito (filtros aplicados) */
  hasIndicator?: boolean;
};

/**
 * ToolbarToolButton — botão usado nas actions da toolbar (Filtrar/Exportar/Ordenar/Cols/More).
 *
 * **Implementação:** usa `<Button>` do DS por baixo. Visual vem direto do Button
 * (`secondary outline` no rest, `primary soft` em isActive). Só adicionamos
 * `border-border-brand` no isActive (variant soft não tem border) e wrapper
 * `relative` pra ancorar o dot indicator.
 *
 * Variantes:
 *   - Com label → size="md"
 *   - Sem label → size="icon-md" (40×40)
 *   - isActive → primary soft com border-brand
 *   - hasIndicator → dot brand absoluto no canto
 */
export const ToolbarToolButton = forwardRef<
  HTMLButtonElement,
  ToolbarToolButtonProps
>(
  (
    {
      icon,
      label,
      isActive,
      hasIndicator,
      className,
      ...rest
    },
    ref,
  ) => {
    const iconOnly = !label;
    return (
      <Button
        ref={ref}
        color={isActive ? "primary" : "secondary"}
        variant={isActive ? "soft" : "outline"}
        size={iconOnly ? "icon-md" : "md"}
        iconLeft={iconOnly ? undefined : icon}
        className={cn(
          "relative",
          // Active: Button primary soft não tem border — adicionamos brand
          isActive && "border-border-brand hover:border-border-brand",
          className,
        )}
        {...rest}
      >
        {iconOnly ? icon : label}
        {hasIndicator && (
          <span className={toolbarToolDot()} aria-hidden="true" />
        )}
      </Button>
    );
  },
);
ToolbarToolButton.displayName = "ToolbarToolButton";

/* ── Save button "+" — Button ghost icon-only ─────────────────── */

export type ToolbarSaveButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "color"
> & {
  isOpen?: boolean;
};

/**
 * ToolbarSaveButton — botão "+" pra abrir o popover de visões salvas.
 * Usa `<Button>` do DS (variant=ghost, size=icon-md). Quando `isOpen`,
 * aplica o visual de hover persistente.
 */
export const ToolbarSaveButton = forwardRef<
  HTMLButtonElement,
  ToolbarSaveButtonProps
>(({ className, isOpen, children, ...rest }, ref) => (
  <Button
    ref={ref}
    color="secondary"
    variant="ghost"
    size="icon-md"
    className={cn(
      isOpen && "bg-bg-muted text-fg-default",
      className,
    )}
    {...rest}
  >
    {children}
  </Button>
));
ToolbarSaveButton.displayName = "ToolbarSaveButton";
