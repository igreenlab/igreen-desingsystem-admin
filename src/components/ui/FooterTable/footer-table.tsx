import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shadcn/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  getPaginationRange,
} from "../../shadcn/pagination";
import { cn } from "@/lib/utils";
import type { FooterTableProps } from "./footer-table.types";

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];

/**
 * FooterTable — footer completo de tabela com paginação + page-size + range.
 *
 * Compõe:
 *   - Select de "Linhas" por página (Select do shadcn)
 *   - Range "1–10 de 87 rows"
 *   - Contagem de seleção opcional ("· 1 selecionado")
 *   - Pagination (« ‹ pages › ») com ellipsis automática
 *
 * Layout: flex justify-between, mobile empilha (flex-col).
 *
 * Replica o `.tbl-footer` do design-and-table-v2.
 */
export function FooterTable({
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  selectionCount = 0,
  pageSizeLabel = "Linhas",
  rowLabel = "rows",
  locale = "pt-BR",
  hidePageSize,
  hideRange,
  hideFirstLast,
  className,
}: FooterTableProps) {
  const lastPage = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), lastPage);
  const start = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalCount);
  const pages = getPaginationRange(safePage, lastPage);

  const fmt = (n: number) => n.toLocaleString(locale);

  return (
    <footer
      className={cn(
        // Mobile: empilha vertical (left em cima, paginação embaixo)
        "flex flex-col sm:flex-row sm:items-center sm:justify-between",
        "gap-gp-2xl px-pad-xs pt-pad-xl",
        "text-body-sm font-normal text-fg-default",
        className,
      )}
    >
      {/* ── Left: pageSize + range + selection ───────────────────── */}
      <div className="flex flex-wrap items-center gap-gp-2xl">
        {!hidePageSize && (
          <label className="inline-flex items-center gap-gp-md text-fg-muted">
            <span className="font-medium">{pageSizeLabel}</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                onPageSizeChange(Number(v));
                onPageChange(1);
              }}
            >
              <SelectTrigger
                className="min-h-form-md w-auto pl-pad-2xl pr-pad-xl gap-gp-lg"
                aria-label={pageSizeLabel}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        )}

        {!hideRange && (
          <span className="text-fg-muted whitespace-nowrap">
            <strong className="font-semibold text-fg-default">
              {fmt(start)}–{fmt(end)}
            </strong>
            {" de "}
            <strong className="font-semibold text-fg-default">
              {fmt(totalCount)}
            </strong>
            {" "}{rowLabel}
          </span>
        )}

        {selectionCount > 0 && (
          <span className="text-fg-muted whitespace-nowrap">
            · {selectionCount} selecionado{selectionCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Right: Pagination ────────────────────────────────────── */}
      <Pagination>
        {!hideFirstLast && (
          <PaginationFirst
            onClick={() => onPageChange(1)}
            disabled={safePage === 1}
          />
        )}
        <PaginationPrevious
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage === 1}
        />
        <PaginationContent>
          {pages.map((p, i) =>
            p === "ellipsis" ? (
              <PaginationItem key={`e-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === safePage}
                  onClick={() => onPageChange(p)}
                  aria-label={`Página ${p}`}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
        </PaginationContent>
        <PaginationNext
          onClick={() => onPageChange(Math.min(lastPage, safePage + 1))}
          disabled={safePage === lastPage}
        />
        {!hideFirstLast && (
          <PaginationLast
            onClick={() => onPageChange(lastPage)}
            disabled={safePage === lastPage}
          />
        )}
      </Pagination>
    </footer>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────────────────── */

export type FooterTableSkeletonProps = {
  /** Quantos botões de página simular no skeleton. Default: 5. */
  pageButtonCount?: number;
  className?: string;
};

/**
 * Estado loading do FooterTable — usado pelo DataTable enquanto a primeira
 * chamada de `fetchData` não retornou totalCount.
 *
 * Mantém a mesma silhueta do footer real (page-size select + range + pagination)
 * pra evitar layout shift quando o conteúdo chega.
 */
export function FooterTableSkeleton({
  pageButtonCount = 5,
  className,
}: FooterTableSkeletonProps) {
  return (
    <footer
      aria-busy="true"
      aria-label="Carregando paginação"
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between",
        "gap-gp-2xl px-pad-xs pt-pad-xl",
        className,
      )}
    >
      {/* Left: page-size select + range */}
      <div className="flex items-center gap-gp-2xl">
        <div className="h-form-md w-[88px] rounded-radius-md bg-bg-muted animate-pulse" />
        <div className="h-[14px] w-[140px] rounded-radius-sm bg-bg-muted animate-pulse" />
      </div>
      {/* Right: prev + pages + next (mesma silhueta do <Pagination>) */}
      <div className="inline-flex items-center gap-gp-xs">
        {Array.from({ length: pageButtonCount + 4 }, (_, i) => (
          <div
            key={i}
            className="h-form-md w-form-md rounded-radius-md bg-bg-muted animate-pulse"
          />
        ))}
      </div>
    </footer>
  );
}
