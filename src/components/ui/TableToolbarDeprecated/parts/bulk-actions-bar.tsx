import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../../Button/button";
import {
  bulkBarRoot,
  bulkBarCount,
  bulkBarActions,
  bulkBarClear,
} from "../table-toolbar.styles";

/**
 * BulkActionsBar — barra de ações em massa (versão da toolbar quando há
 * itens selecionados na tabela).
 *
 * Visual alinhado com `.tbl-bulk-bar` do design-and-table-v2:
 *   - fundo brand-subtle, borda brand, radius xl
 *   - contagem à esquerda (ícone Check + label dinâmica)
 *   - ações no meio (botões outline primary; danger usa soft critical)
 *   - link "Cancelar seleção" no final
 *
 * Renderização condicional: quando `count === 0`, retorna `null`.
 * Use como `bulkBar` prop do `<TableToolbar>` pra trocar a view inteira,
 * ou renderize solto onde precisar.
 */
export type BulkActionsBarProps = {
  /** Quantidade de itens selecionados. Quando 0, o componente não renderiza. */
  count: number;
  /**
   * Label da contagem. Default: `${count} selecionado(s)`.
   * Recebe `count` pra você customizar singular/plural.
   */
  countLabel?: (count: number) => ReactNode;
  /** Callback do link "Cancelar seleção". */
  onClear?: () => void;
  /** Texto do link de limpar. Default: "Cancelar seleção". */
  clearLabel?: ReactNode;
  /** Ações da barra — use `<BulkActionButton>` ou compose como quiser. */
  children?: ReactNode;
  className?: string;
};

export function BulkActionsBar({
  count,
  countLabel,
  onClear,
  clearLabel = "Cancelar seleção",
  children,
  className,
}: BulkActionsBarProps) {
  if (count <= 0) return null;

  const label =
    typeof countLabel === "function"
      ? countLabel(count)
      : `${count} selecionado${count > 1 ? "s" : ""}`;

  return (
    <div
      role="toolbar"
      aria-label="Ações em massa"
      className={cn(bulkBarRoot(), className)}
    >
      <div className={bulkBarCount()}>
        <Check strokeWidth={2.4} />
        {label}
      </div>
      <div className={bulkBarActions()}>{children}</div>
      {onClear ? (
        <button type="button" onClick={onClear} className={bulkBarClear()}>
          {clearLabel}
        </button>
      ) : null}
    </div>
  );
}

/* ── BulkActionButton ──────────────────────────────────────────────── */

export type BulkActionButtonProps = {
  icon?: ReactNode;
  children?: ReactNode;
  /** "default" usa primary outline; "danger" usa critical soft. */
  variant?: "default" | "danger";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
  /** aria-label quando só ícone. */
  "aria-label"?: string;
};

/**
 * Helper que padroniza o botão de ação dentro da bulk bar.
 * Usa `<Button>` do DS por baixo, com shape="pill":
 *
 *   default → primary outline pill xs
 *     - light: bg-surface + border-brand + fg-brand
 *     - dark : bg transparente + border + fg-brand (verde brilhante)
 *
 *   danger  → critical soft pill xs
 *     - light/dark: bg-danger-muted + fg-danger (sem overrides)
 */
export function BulkActionButton({
  icon,
  children,
  variant = "default",
  onClick,
  disabled,
  className,
  ...rest
}: BulkActionButtonProps) {
  // No dark, default vira transparente (sem bg-surface) e perde a shadow.
  // Danger ganha border-danger-muted pra destacar o botão destrutivo.
  const darkOverrides =
    variant === "danger"
      ? "border border-border-danger-muted"
      : "dark:bg-transparent dark:shadow-sh-none";

  return (
    <Button
      color={variant === "danger" ? "critical" : "primary"}
      variant={variant === "danger" ? "soft" : "outline"}
      size="xs"
      shape="pill"
      iconLeft={icon}
      onClick={onClick}
      disabled={disabled}
      className={cn(darkOverrides, className)}
      {...rest}
    >
      {children}
    </Button>
  );
}
