import { createContext, forwardRef, useContext } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../Button";
import type { ButtonProps } from "../Button/button.types";
import {
  buttonGroupVariants,
  buttonGroupSlot,
  buttonGroupChevronSize,
} from "./button-group.styles";
import type {
  ButtonGroupProps,
  ButtonGroupPrimaryProps,
  ButtonGroupChevronProps,
  ButtonGroupSharedProps,
} from "./button-group.types";

/**
 * Context interno — propaga color/variant/size/disabled do group pros slots
 * sem prop drilling. Filhos podem dar override passando essas props explicitamente.
 */
const ButtonGroupContext = createContext<ButtonGroupSharedProps | null>(null);

/**
 * ButtonGroup — split button pattern.
 *
 * @example
 * ```tsx
 * <ButtonGroup color="primary" variant="outline" size="md">
 *   <ButtonGroup.Primary onClick={handleSimpleFilter} iconLeft={<Filter />}>
 *     Filtrar
 *   </ButtonGroup.Primary>
 *   <ButtonGroup.Chevron
 *     onClick={handleAdvancedOpen}
 *     aria-label="Filtros avançados"
 *   />
 * </ButtonGroup>
 * ```
 *
 * Props color/variant/size propagam aos slots via context. Cada slot pode
 * dar override passando essas props explicitamente.
 */
function ButtonGroupRoot({
  color,
  variant,
  size,
  disabled,
  children,
  className,
}: ButtonGroupProps) {
  return (
    <ButtonGroupContext.Provider value={{ color, variant, size, disabled }}>
      <div
        role="group"
        className={cn(buttonGroupVariants(), className)}
      >
        {children}
      </div>
    </ButtonGroupContext.Provider>
  );
}

/**
 * Slot Primary — botão da ação principal. Aceita todas as props do Button.
 * Color/variant/size vêm do ButtonGroup pai por default; override permitido.
 */
const ButtonGroupPrimary = forwardRef<HTMLButtonElement, ButtonGroupPrimaryProps>(
  function ButtonGroupPrimary({ className, ...props }, ref) {
    const ctx = useContext(ButtonGroupContext);
    const merged = mergeWithContext(ctx, props);
    return (
      <Button
        ref={ref}
        {...merged}
        className={cn(buttonGroupSlot({ position: "primary" }), className)}
      />
    );
  },
);

/**
 * Slot Chevron — icon button compacto com chevron-down default.
 * Mais estreito que um icon button size-* normal (pra parecer um "split" do primary).
 * `aria-label` obrigatório (icon-only requer descrição pra leitor de tela).
 */
const ButtonGroupChevron = forwardRef<HTMLButtonElement, ButtonGroupChevronProps>(
  function ButtonGroupChevron({ icon, className, ...props }, ref) {
    const ctx = useContext(ButtonGroupContext);
    // Não passa `size` (icon button) pro Button — usamos size com label vazio e
    // override de width via buttonGroupChevronSize pra fazer o chevron mais estreito.
    const merged = mergeWithContext(ctx, props);
    const effectiveSize = (merged.size ?? "md") as NonNullable<ButtonProps["size"]>;
    return (
      <Button
        ref={ref}
        {...merged}
        // Override pad/width sem tocar height — alinha com primary mas estreito.
        className={cn(
          buttonGroupSlot({ position: "chevron" }),
          buttonGroupChevronSize({ size: effectiveSize as "2xs" | "xs" | "sm" | "md" | "lg" }),
          // Anula gap do Button (não tem children) + reset svg size pra default 14px
          "!px-0",
          className,
        )}
      >
        {icon ?? <ChevronDown />}
      </Button>
    );
  },
);

/**
 * Merge defensivo das props do slot com o context do group.
 * Slot pode dar OVERRIDE — se passou color/variant/size explicitamente, ganha do context.
 */
function mergeWithContext<T extends ButtonGroupSharedProps>(
  ctx: ButtonGroupSharedProps | null,
  props: T,
): T {
  if (!ctx) return props;
  return {
    ...props,
    color: props.color ?? ctx.color,
    variant: props.variant ?? ctx.variant,
    size: props.size ?? ctx.size,
    disabled: props.disabled ?? ctx.disabled,
  };
}

/**
 * Export como compound component — `<ButtonGroup>` é a raiz, e os slots
 * `<ButtonGroup.Primary>` / `<ButtonGroup.Chevron>` são namespaced.
 */
export const ButtonGroup = Object.assign(ButtonGroupRoot, {
  Primary: ButtonGroupPrimary,
  Chevron: ButtonGroupChevron,
});
