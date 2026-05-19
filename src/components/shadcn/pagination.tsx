import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Pagination — primitives baixo nível pra paginação.
 *
 * Visual alinhado com `.tbl-footer-right` do design-and-table-v2:
 *   - Nav buttons (« ‹ › »): 36×36 com border, radius-lg
 *   - Pages container: bg-muted, radius-lg, padding 3px (segmented look)
 *   - Page item: 30×30 transparente; active = bg-accent + shadow-sm + font-semibold
 *
 * Pra um wrapper "one-shot" com pageSize + range + nav → use <FooterTable>.
 */

/* ── Root nav ────────────────────────────────────────────────────────── */
const Pagination = ({
  className,
  ...props
}: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="Paginação"
    className={cn("inline-flex items-center gap-gp-xs", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

/* ── Content (container das page items — visual segmented) ──────────── */
const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn(
      "inline-flex items-center gap-[2px]",
      "bg-bg-muted rounded-radius-lg p-[3px] mx-gp-sm h-form-md",
      className,
    )}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

/* ── Item wrapper (li) ───────────────────────────────────────────────── */
const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

/* ── Link (número) — dentro do PaginationContent ──────────────────── */
const paginationLinkVariants = cva(
  [
    "inline-flex items-center justify-center",
    "min-w-[30px] h-[30px] px-pad-md",
    "rounded-radius-md text-body-sm font-medium tabular-nums",
    "outline-none cursor-pointer transition-[background-color,color,box-shadow]",
    "focus-visible:shadow-sh-ring",
    "disabled:opacity-50 disabled:pointer-events-none",
  ],
  {
    variants: {
      isActive: {
        true:  "bg-bg-accent text-fg-default font-semibold shadow-sh-sm",
        false: "bg-transparent text-fg-muted hover:text-fg-default",
      },
    },
    defaultVariants: { isActive: false },
  },
);

export type PaginationLinkProps = {
  isActive?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof paginationLinkVariants>;

const PaginationLink = React.forwardRef<
  HTMLButtonElement,
  PaginationLinkProps
>(({ className, isActive, type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    aria-current={isActive ? "page" : undefined}
    className={cn(paginationLinkVariants({ isActive }), className)}
    {...props}
  />
));
PaginationLink.displayName = "PaginationLink";

/* ── Nav buttons (« ‹ › ») — fora do Content, com border individual ── */
const paginationNavVariants = cva([
  "inline-flex items-center justify-center shrink-0",
  "size-form-md rounded-radius-lg",
  "border border-border-default bg-transparent text-fg-default",
  "outline-none cursor-pointer transition-[background-color,color,opacity,border-color,box-shadow]",
  "hover:bg-bg-muted",
  "focus-visible:shadow-sh-ring",
  "disabled:opacity-35 disabled:pointer-events-none",
  "[&_svg]:size-4",
]);

type NavBtnProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const PaginationPrevious = React.forwardRef<HTMLButtonElement, NavBtnProps>(
  ({ className, type = "button", "aria-label": ariaLabel, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={ariaLabel ?? "Página anterior"}
      className={cn(paginationNavVariants(), className)}
      {...props}
    >
      <ChevronLeft />
    </button>
  ),
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = React.forwardRef<HTMLButtonElement, NavBtnProps>(
  ({ className, type = "button", "aria-label": ariaLabel, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={ariaLabel ?? "Próxima página"}
      className={cn(paginationNavVariants(), className)}
      {...props}
    >
      <ChevronRight />
    </button>
  ),
);
PaginationNext.displayName = "PaginationNext";

const PaginationFirst = React.forwardRef<HTMLButtonElement, NavBtnProps>(
  ({ className, type = "button", "aria-label": ariaLabel, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={ariaLabel ?? "Primeira página"}
      className={cn(paginationNavVariants(), className)}
      {...props}
    >
      <ChevronsLeft />
    </button>
  ),
);
PaginationFirst.displayName = "PaginationFirst";

const PaginationLast = React.forwardRef<HTMLButtonElement, NavBtnProps>(
  ({ className, type = "button", "aria-label": ariaLabel, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={ariaLabel ?? "Última página"}
      className={cn(paginationNavVariants(), className)}
      {...props}
    >
      <ChevronsRight />
    </button>
  ),
);
PaginationLast.displayName = "PaginationLast";

/* ── Ellipsis ────────────────────────────────────────────────────────── */
const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden="true"
    className={cn(
      "inline-flex items-center justify-center min-w-[22px] h-[30px]",
      "text-body-sm font-normal text-fg-muted tracking-wider select-none",
      className,
    )}
    {...props}
  >
    <MoreHorizontal className="size-4" />
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

/**
 * Helper — gera array de páginas com ellipsis.
 *
 * Regras:
 *   - Total ≤ 7 páginas → mostra todas
 *   - Senão → [1, 2, …, page-1, page, page+1, …, last-1, last]
 *
 * Retorna `number[]` com `"ellipsis"` como string nos gaps.
 *
 * Ex (page=5, total=20): [1, 2, "ellipsis", 4, 5, 6, "ellipsis", 19, 20]
 */
export function getPaginationRange(page: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, 2, total - 1, total, page - 1, page, page + 1]);
  const sorted = [...set]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push("ellipsis");
    out.push(n);
  });
  return out;
}

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
  paginationLinkVariants,
  paginationNavVariants,
};
