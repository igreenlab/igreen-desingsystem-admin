import { createContext, forwardRef, useContext, type ReactNode } from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";
import { chipVariants, type ChipVariantProps } from "./chip.styles";

type ChipColor = NonNullable<ChipVariantProps["color"]>;
type ChipVariant = NonNullable<ChipVariantProps["variant"]>;
type ChipSize = NonNullable<ChipVariantProps["size"]>;
type ChipShape = NonNullable<ChipVariantProps["shape"]>;

/* ── Classes do estado SELECTED (data-state=on) por color × variant ── */
/**
 * Mapeamento color × variant → classes aplicadas em items selecionados
 * (Radix dá `data-state="on"` quando ativo).
 *
 * Inclui todas as 4 variants × 6 cores = 24 combos.
 */
const SELECTED_CLASSES: Record<ChipColor, Record<ChipVariant, string>> = {
  primary: {
    solid:         "data-[state=on]:bg-bg-brand data-[state=on]:text-fg-on-brand data-[state=on]:border-transparent",
    outline:       "data-[state=on]:border-border-brand data-[state=on]:text-fg-brand data-[state=on]:bg-transparent",
    soft:          "data-[state=on]:bg-bg-brand-subtle data-[state=on]:text-fg-brand data-[state=on]:border-transparent",
    "soft-outline":"data-[state=on]:bg-bg-brand-subtle data-[state=on]:border-border-brand data-[state=on]:text-fg-brand",
  },
  neutral: {
    solid:         "data-[state=on]:bg-bg-muted data-[state=on]:text-fg-default data-[state=on]:border-transparent",
    outline:       "data-[state=on]:border-border-default data-[state=on]:text-fg-default data-[state=on]:bg-transparent",
    soft:          "data-[state=on]:bg-bg-accent data-[state=on]:text-fg-default data-[state=on]:border-transparent data-[state=on]:shadow-sh-sm",
    "soft-outline":"data-[state=on]:bg-bg-muted data-[state=on]:border-border-default data-[state=on]:text-fg-default",
  },
  danger: {
    solid:         "data-[state=on]:bg-bg-danger data-[state=on]:text-fg-on-danger data-[state=on]:border-transparent",
    outline:       "data-[state=on]:border-border-danger-muted data-[state=on]:text-fg-danger data-[state=on]:bg-transparent",
    soft:          "data-[state=on]:bg-bg-danger-muted data-[state=on]:text-fg-danger data-[state=on]:border-transparent",
    "soft-outline":"data-[state=on]:bg-bg-danger-muted data-[state=on]:border-border-danger-muted data-[state=on]:text-fg-danger",
  },
  warning: {
    solid:         "data-[state=on]:bg-bg-warning data-[state=on]:text-fg-on-warning data-[state=on]:border-transparent",
    outline:       "data-[state=on]:border-border-warning-muted data-[state=on]:text-fg-warning data-[state=on]:bg-transparent",
    soft:          "data-[state=on]:bg-bg-warning-muted data-[state=on]:text-fg-warning data-[state=on]:border-transparent",
    "soft-outline":"data-[state=on]:bg-bg-warning-muted data-[state=on]:border-border-warning-muted data-[state=on]:text-fg-warning",
  },
  success: {
    solid:         "data-[state=on]:bg-bg-success data-[state=on]:text-fg-on-success data-[state=on]:border-transparent",
    outline:       "data-[state=on]:border-border-success-muted data-[state=on]:text-fg-success data-[state=on]:bg-transparent",
    soft:          "data-[state=on]:bg-bg-success-muted data-[state=on]:text-fg-success data-[state=on]:border-transparent",
    "soft-outline":"data-[state=on]:bg-bg-success-muted data-[state=on]:border-border-success-muted data-[state=on]:text-fg-success",
  },
  info: {
    solid:         "data-[state=on]:bg-bg-info data-[state=on]:text-fg-on-info data-[state=on]:border-transparent",
    outline:       "data-[state=on]:border-border-info-muted data-[state=on]:text-fg-info data-[state=on]:bg-transparent",
    soft:          "data-[state=on]:bg-bg-info-muted data-[state=on]:text-fg-info data-[state=on]:border-transparent",
    "soft-outline":"data-[state=on]:bg-bg-info-muted data-[state=on]:border-border-info-muted data-[state=on]:text-fg-info",
  },
};

/* ── ChipGroup root ──────────────────────────────────────────────── */

type CommonProps = {
  /** Cor do estado INATIVO (default `"neutral"`) */
  inactiveColor?: ChipColor;
  /** Variant do estado INATIVO (default `"outline"`) */
  inactiveVariant?: ChipVariant;
  /** Cor do estado ATIVO (default `"primary"`) */
  activeColor?: ChipColor;
  /** Variant do estado ATIVO (default `"soft-outline"`) */
  activeVariant?: ChipVariant;
  /** Size aplicado em todos os chips do grupo */
  size?: ChipSize;
  /** Shape aplicado em todos os chips (default `"pill"`) */
  shape?: ChipShape;
  /** Direção do grupo */
  orientation?: "horizontal" | "vertical";
  /** Aria-label do grupo */
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
};

type SingleProps = CommonProps & {
  type: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type MultipleProps = CommonProps & {
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

export type ChipGroupProps = SingleProps | MultipleProps;

/**
 * ChipGroup — agrupa chips com seleção controlada.
 *
 *   - `type="single"`: escolha única (radio-like)
 *   - `type="multiple"`: escolha múltipla (checkbox-like)
 *
 * **Estado visual configurável independentemente:**
 *   - `inactiveColor` + `inactiveVariant` → estilo dos items NÃO selecionados
 *     (default: `neutral` + `outline`)
 *   - `activeColor` + `activeVariant` → estilo dos items SELECIONADOS
 *     (default: `primary` + `soft-outline`)
 *
 * Usa `@radix-ui/react-toggle-group` por baixo.
 */
export const ChipGroup = forwardRef<HTMLDivElement, ChipGroupProps>(
  function ChipGroup(props, ref) {
    const {
      inactiveColor = "neutral",
      inactiveVariant = "outline",
      activeColor = "primary",
      activeVariant = "soft-outline",
      size = "md",
      shape = "pill",
      orientation = "horizontal",
      ariaLabel,
      className,
      children,
    } = props;

    const contextValue = {
      inactiveColor,
      inactiveVariant,
      activeColor,
      activeVariant,
      size,
      shape,
    };

    if (props.type === "single") {
      return (
        <ChipGroupContext.Provider value={contextValue}>
          <ToggleGroupPrimitive.Root
            ref={ref}
            type="single"
            value={props.value}
            defaultValue={props.defaultValue}
            onValueChange={props.onValueChange as (v: string) => void}
            orientation={orientation}
            aria-label={ariaLabel}
            className={cn(
              "inline-flex items-center gap-gp-sm",
              orientation === "vertical" && "flex-col",
              className,
            )}
          >
            {children}
          </ToggleGroupPrimitive.Root>
        </ChipGroupContext.Provider>
      );
    }

    return (
      <ChipGroupContext.Provider value={contextValue}>
        <ToggleGroupPrimitive.Root
          ref={ref}
          type="multiple"
          value={props.value}
          defaultValue={props.defaultValue}
          onValueChange={props.onValueChange as (v: string[]) => void}
          orientation={orientation}
          aria-label={ariaLabel}
          className={cn(
            "inline-flex items-center gap-gp-sm",
            orientation === "vertical" && "flex-col",
            className,
          )}
        >
          {children}
        </ToggleGroupPrimitive.Root>
      </ChipGroupContext.Provider>
    );
  },
);

/* ── Context ─────────────────────────────────────────────────────── */
type ChipGroupContextValue = {
  inactiveColor: ChipColor;
  inactiveVariant: ChipVariant;
  activeColor: ChipColor;
  activeVariant: ChipVariant;
  size: ChipSize;
  shape: ChipShape;
};

const ChipGroupContext = createContext<ChipGroupContextValue>({
  inactiveColor: "neutral",
  inactiveVariant: "outline",
  activeColor: "primary",
  activeVariant: "soft-outline",
  size: "md",
  shape: "pill",
});

/* ── ChipGroupItem ───────────────────────────────────────────────── */

export type ChipGroupItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>,
  "color"
>;

/**
 * ChipGroupItem — item dentro do `<ChipGroup>`. Visual gerenciado pelo
 * grupo via context: estilo `inactive*` quando OFF e `active*` quando ON.
 *
 *   <ChipGroup type="single" inactiveVariant="outline" activeVariant="soft-outline">
 *     <ChipGroupItem value="all">Todas</ChipGroupItem>
 *     <ChipGroupItem value="unread">Não lidas</ChipGroupItem>
 *   </ChipGroup>
 */
export const ChipGroupItem = forwardRef<HTMLButtonElement, ChipGroupItemProps>(
  function ChipGroupItem({ className, children, ...rest }, ref) {
    const {
      inactiveColor,
      inactiveVariant,
      activeColor,
      activeVariant,
      size,
      shape,
    } = useContext(ChipGroupContext);

    return (
      <ToggleGroupPrimitive.Item
        ref={ref}
        className={cn(
          // Estado OFF — visual inativo (passa pelo chipVariants normal)
          chipVariants({
            color: inactiveColor,
            variant: inactiveVariant,
            size,
            shape,
            interactive: true,
          }),
          // Estado ON — override via data-state=on com classes do active*
          SELECTED_CLASSES[activeColor][activeVariant],
          className,
        )}
        {...rest}
      >
        {children}
      </ToggleGroupPrimitive.Item>
    );
  },
);
