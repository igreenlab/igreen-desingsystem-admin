import { forwardRef, useId, type ReactNode } from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Checkbox } from "@/components/shadcn/checkbox";
import { cardCheckbox, type CardCheckboxVariants } from "./card-checkbox.styles";

export type CardCheckboxProps = Omit<
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
  "id" | "className"
> & {
  /** Label principal — chamada do card */
  label: ReactNode;
  /** Texto secundário abaixo do label */
  description?: ReactNode;
  /** ReactNode opcional renderizado à esquerda (antes do checkbox) — ex: <Save /> */
  icon?: ReactNode;
  /** className aplicado ao card root (sobrescreve background/border se necessário) */
  className?: string;
} & Omit<CardCheckboxVariants, "selected">;

/**
 * CardCheckbox — checkbox apresentado como card clicável.
 *
 * Mesma estética dos radio cards (bg-bg-success-muted + border-brand no
 * selected). Diferente do FormFieldCheckbox que é layout horizontal compact —
 * CardCheckbox é UI de "opção destacada" com label + description visíveis.
 *
 * Uso:
 *   <CardCheckbox
 *     label="Salvar essa conta pra usar depois"
 *     description="A conta aparecerá nas próximas vezes em 'Contas cadastradas'."
 *     checked={save}
 *     onCheckedChange={(v) => setSave(v === true)}
 *   />
 *
 * O card inteiro é clicável (não só o checkbox) — toggle dispara
 * onCheckedChange via clique no <label> wrapper.
 */
export const CardCheckbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  CardCheckboxProps
>(
  (
    {
      label,
      description,
      icon,
      checked,
      disabled,
      className,
      ...checkboxProps
    },
    ref,
  ) => {
    const autoId = useId();
    const isSelected = checked === true;
    const styles = cardCheckbox({
      selected: isSelected,
      disabled: disabled ? true : undefined,
    });

    return (
      <label
        htmlFor={autoId}
        className={[styles.root(), className].filter(Boolean).join(" ")}
      >
        <Checkbox
          ref={ref}
          id={autoId}
          checked={checked}
          disabled={disabled}
          {...checkboxProps}
        />
        {icon && (
          <span className="grid place-items-center shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        <div className={styles.body()}>
          <span className={styles.label()}>{label}</span>
          {description && (
            <span className={styles.description()}>{description}</span>
          )}
        </div>
      </label>
    );
  },
);
CardCheckbox.displayName = "CardCheckbox";
