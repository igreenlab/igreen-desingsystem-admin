import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  breadcrumbRoot,
  breadcrumbItem,
  breadcrumbSeparator,
} from "./header.styles";
import type { HeaderBreadcrumbItem } from "./header.types";

export type HeaderBreadcrumbProps = {
  items: HeaderBreadcrumbItem[];
  /**
   * Quando true, em mobile (< md) mostra apenas o último item (título da seção
   * atual). Em desktop continua mostrando a cadeia completa.
   */
  mobileShowLastOnly?: boolean;
  className?: string;
};

/**
 * Breadcrumb / title — auto-renderiza como string única quando 1 item,
 * ou como cadeia "Item / Item / Item" quando 2+. Último item nunca é link
 * (representa página atual).
 */
export function HeaderBreadcrumb({
  items,
  mobileShowLastOnly,
  className,
}: HeaderBreadcrumbProps) {
  if (items.length === 0) return null;

  /** Quando há 1 só item, renderiza como título (15px). 2+ → cadeia breadcrumb (13px). */
  const isStandalone = items.length === 1;
  const lastItem = items[items.length - 1];

  return (
    <>
      {/* Desktop: cadeia completa */}
      <nav
        className={cn(
          breadcrumbRoot(),
          mobileShowLastOnly && "hidden md:flex",
          className,
        )}
        aria-label="Breadcrumb"
      >
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const isClickable =
            !isLast && (item.href !== undefined || item.onClick !== undefined);

          return (
            <Fragment key={`${item.label}-${idx}`}>
              {idx > 0 && (
                <ChevronRight
                  size={14}
                  strokeWidth={1.7}
                  className={breadcrumbSeparator()}
                  aria-hidden="true"
                />
              )}
              {isClickable ? (
                <a
                  href={item.href ?? "#"}
                  className={breadcrumbItem({
                    current: false,
                    standalone: isStandalone,
                  })}
                  onClick={(e) => {
                    if (!item.href) e.preventDefault();
                    item.onClick?.(e);
                  }}
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={breadcrumbItem({
                    current: isLast,
                    standalone: isStandalone,
                  })}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </Fragment>
          );
        })}
      </nav>

      {/* Mobile: só o último item (título da seção atual) */}
      {mobileShowLastOnly && (
        <nav
          className={cn(breadcrumbRoot(), "md:hidden", className)}
          aria-label="Seção atual"
        >
          <span
            className={breadcrumbItem({ current: true, standalone: true })}
            aria-current="page"
          >
            {lastItem.label}
          </span>
        </nav>
      )}
    </>
  );
}
