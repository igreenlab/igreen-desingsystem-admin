import { cn } from "@/lib/utils";
import type { MouseEvent, ReactNode } from "react";
import { tableStyles } from "./table.styles";

const styles = tableStyles();

export type TableCardRowProps = {
  /** Conteúdo do header do card (esquerda). Normalmente checkbox + primary column. */
  header?: ReactNode;
  /** Conteúdo do canto superior direito do header. Normalmente actions/menu. */
  headerActions?: ReactNode;
  /** Itens label/value renderizados no body do card. */
  items: ReadonlyArray<{
    /** Label da coluna (mostrado acima do valor). */
    label: ReactNode;
    /** Valor renderizado. */
    value: ReactNode;
    /** Key opcional pro React. Default = index. */
    key?: string | number;
  }>;
  selected?: boolean;
  /**
   * Row está em foco pra detalhe (ex: click abriu drawer com info). Visual idêntico ao `selected`
   * (bg brand-tinted + strip lateral brand) — mas semanticamente independente: pode coexistir com `selected`.
   * Use pra padrão de "click row → abre detail panel", mantendo seleção (checkbox) separada.
   */
  open?: boolean;
  clickable?: boolean;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  className?: string;
};

/**
 * <TableCardRow> — renderização "card vertical" de uma linha pra mobile/container estreito.
 *
 * Layout:
 *   ┌─────────────────────────────────────┐
 *   │ {header}              {headerActions} │
 *   ├─────────────────────────────────────┤
 *   │ {label}: {value}                     │
 *   │ {label}: {value}                     │
 *   └─────────────────────────────────────┘
 */
export function TableCardRow({
  header,
  headerActions,
  items,
  selected = false,
  open = false,
  clickable,
  onClick,
  className,
}: TableCardRowProps) {
  const isClickable = clickable ?? !!onClick;
  const highlighted = selected || open;

  // Guard cross-device: ignora o click da row quando ele vem de um controle
  // interativo do card (kebab de ações, checkbox, link). Em touch o
  // stopPropagation do botão nem sempre impede o onClick do card — checar o
  // alvo é robusto e evita abrir o detalhe junto com o dropdown de ações.
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (
      (e.target as HTMLElement).closest(
        'button, a, input, label, [role="menu"], [role="menuitem"], [data-slot="card-actions"]',
      )
    ) {
      return;
    }
    onClick(e);
  };
  const dataState = selected && open
    ? "selected open"
    : selected
      ? "selected"
      : open
        ? "open"
        : undefined;

  return (
    <div
      role="article"
      aria-selected={selected || undefined}
      data-state={dataState}
      className={cn(
        tableStyles({ selected: highlighted, clickable: isClickable }).cardWrap(),
        className,
      )}
      onClick={handleClick}
    >
      <div className={styles.cardHeader()}>
        <div className="flex items-center gap-gp-md min-w-0">{header}</div>
        {headerActions && (
          <div
            className="flex items-center gap-gp-xs shrink-0"
            data-slot="card-actions"
          >
            {headerActions}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-gp-md">
          {items.map((item, i) => (
            <div key={item.key ?? i} className={styles.cardItem()}>
              <span className={styles.cardLabel()}>{item.label}</span>
              <span className={styles.cardValue()}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
