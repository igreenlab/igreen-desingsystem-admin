import {
  createElement,
  isValidElement,
  type ComponentType,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/Button";
import type { LucideIcon } from "@/lib/lucide-types";

import { emptyStateStyles } from "./empty-state.styles";
import type { EmptyStateAction, EmptyStateProps } from "./empty-state.types";

/** Mapeia o size do EmptyState para o size do Button da ação. */
const ACTION_BUTTON_SIZE = {
  sm: "sm",
  md: "md",
  lg: "lg",
} as const;

/**
 * Discrimina `EmptyStateAction` (objeto `{ label, onClick }`) de um `ReactNode`
 * custom. Element React → node custom; objeto plano com `label`+`onClick` → ação.
 */
function isActionConfig(
  action: EmptyStateAction | ReactNode,
): action is EmptyStateAction {
  return (
    !isValidElement(action) &&
    typeof action === "object" &&
    action !== null &&
    "label" in action &&
    "onClick" in action
  );
}

/**
 * Renderiza o ícone: componente lucide (`LucideIcon`) → instanciado com o tamanho
 * vindo do wrapper; `ReactNode` (Icon do DS, ilustração) → renderizado direto. O
 * wrapper aplica cor (`fg-subtle`) e tamanho (`size-icon-*`) via styles.
 */
function renderIcon(icon: LucideIcon | ReactNode): ReactNode {
  // Já é um elemento (<Icon />, ilustração) → renderiza direto.
  if (icon == null || isValidElement(icon)) return icon;
  // Tipo de componente: função OU objeto forwardRef/memo (lucide-react v1 expõe
  // ícones como forwardRef → typeof "object" com $$typeof, NÃO "function").
  // Instanciar via createElement cobre os três casos.
  if (
    typeof icon === "function" ||
    (typeof icon === "object" && "$$typeof" in icon)
  ) {
    return createElement(
      icon as ComponentType<{ "aria-hidden"?: boolean }>,
      { "aria-hidden": true },
    );
  }
  return icon;
}

/**
 * EmptyState — estado vazio genérico reusável no app todo. Compõe `Icon`/lucide +
 * `Button` (do DS) num bloco centralizado vertical e horizontalmente.
 *
 * Visual 100% via tokens DS (gap-gp-*, size-icon-*, text-title-*, text-body-*,
 * text-fg-*, max-w-container-*). A ação aceita `{ label, onClick }` (vira Button)
 * ou um `ReactNode` custom. Componente declarativo de display — sem foco próprio
 * (o único interativo é o Button da ação, que já traz o Padrão 1).
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  size = "md",
  className,
}: EmptyStateProps) {
  const styles = emptyStateStyles({ size });

  return (
    <div className={styles.root({ className })}>
      {icon != null && (
        <span className={styles.icon()} aria-hidden="true">
          {renderIcon(icon)}
        </span>
      )}

      <h3 className={styles.title()}>{title}</h3>

      {description && <p className={styles.description()}>{description}</p>}

      {action != null &&
        (isActionConfig(action) ? (
          <div className={styles.action()}>
            <Button
              type="button"
              size={ACTION_BUTTON_SIZE[size]}
              color={action.color}
              variant={action.variant}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          </div>
        ) : (
          <div className={styles.action()}>{action}</div>
        ))}
    </div>
  );
}
