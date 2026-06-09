import type React from "react";
import { createContext, forwardRef, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { tableStyles } from "./table.styles";
import { useColumnResize } from "./use-column-resize";
import type {
  TableProps,
  TableHeadProps,
  TableBodyProps,
  TableRowProps,
  TableCellProps,
  TableHeadCellProps,
  TableDensity,
  SortDirection,
} from "./table.types";

/* ── Context interno (privado) — propaga density + cellBorders pros subcomponentes ─ */

type TableContextValue = {
  density: TableDensity;
  cellBorders: boolean;
  /**
   * Field da coluna com resize handle ATIVO — drag em curso OU hover sobre o handle.
   * Aplica linha brand em todas as cells da coluna. Null quando nenhum.
   */
  resizingField: string | null;
  setResizingField: (field: string | null) => void;
  /** True quando body scrollou pra baixo (scrollTop > 0) — header ganha shadow. */
  isScrolled: boolean;
};

const TableContext = createContext<TableContextValue>({
  density: "standard",
  cellBorders: true,
  resizingField: null,
  setResizingField: () => {},
  isScrolled: false,
});

function useTableContext(): TableContextValue {
  return useContext(TableContext);
}

const styles = tableStyles();

/* ── <Table> root ─────────────────────────────────────────────────── */

export function Table({
  density = "standard",
  cardBreakpoint = 768,
  cellBorders = true,
  ariaLabel,
  className,
  scrollRef: externalScrollRef,
  children,
}: TableProps) {
  // Container queries via inline style — Tailwind v4 não tem arbitrary container query no momento da escrita
  const cardCss =
    cardBreakpoint === false
      ? undefined
      : ({ "--table-card-bp": `${cardBreakpoint}px` } as React.CSSProperties);

  // State pra tracking de coluna em drag ativo (resize) — aplica data-resizing-col no root,
  // CSS estiliza todas as cells com data-field correspondente (full-height line).
  const [resizingField, setResizingField] = useState<string | null>(null);

  // Detecta scroll vertical pra mostrar shadow no sticky header
  const [isScrolled, setIsScrolled] = useState(false);
  const internalScrollRef = useRef<HTMLDivElement>(null);
  // Usa ref externa se passada (DataTable virtualization), senao a interna.
  const scrollRef = externalScrollRef ?? internalScrollRef;
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setIsScrolled(el.scrollTop > 0);
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  return (
    <TableContext.Provider
      value={{ density, cellBorders, resizingField, setResizingField, isScrolled }}
    >
      <div
        role="grid"
        aria-label={ariaLabel}
        data-density={density}
        data-resizing-col={resizingField ?? undefined}
        className={cn(styles.root(), className)}
        style={cardCss}
      >
        <div ref={scrollRef} className={styles.scroll()}>{children}</div>
      </div>
    </TableContext.Provider>
  );
}

/* ── <TableHead> ──────────────────────────────────────────────────── */

export function TableHead({
  sticky = true,
  className,
  rootProps,
  children,
}: TableHeadProps) {
  const { isScrolled } = useTableContext();
  return (
    <div
      {...rootProps}
      role="rowgroup"
      data-scrolled={isScrolled ? "true" : undefined}
      className={cn(tableStyles({ sticky }).head(), className)}
    >
      <div role="row" className="flex w-full">
        {children}
      </div>
    </div>
  );
}

/* ── <TableBody> ──────────────────────────────────────────────────── */

export function TableBody({
  className,
  style,
  rootProps,
  virtualized,
  children,
}: TableBodyProps) {
  // Em modo virtualizado: body vira block + position relative + height total
  // pra que rows absolute-positioned (do @tanstack/react-virtual) renderizem
  // corretamente. Override do flex-col default via className `!block`.
  const virtualStyle: React.CSSProperties | undefined = virtualized
    ? {
        height: virtualized.totalHeight,
        position: "relative",
        minWidth: "100%",
        ...style,
      }
    : style;
  return (
    <div
      {...rootProps}
      role="rowgroup"
      className={cn(
        styles.body(),
        virtualized && "!block",
        className,
      )}
      style={virtualStyle}
    >
      {children}
    </div>
  );
}

/* ── <TableRow> ───────────────────────────────────────────────────── */

export const TableRow = forwardRef<HTMLDivElement, TableRowProps>(function TableRow({
  selected = false,
  open = false,
  focused = false,
  clickable,
  onClick,
  className,
  rootProps,
  children,
}, ref) {
  const { density } = useTableContext();
  const isClickable = clickable ?? !!onClick;
  const highlighted = selected || open;
  const dataState = selected && open
    ? "selected open"
    : selected
      ? "selected"
      : open
        ? "open"
        : undefined;

  return (
    <div
      {...rootProps}
      ref={ref}
      role="row"
      aria-selected={selected || undefined}
      data-state={dataState}
      data-focused={focused || undefined}
      tabIndex={focused ? 0 : -1}
      className={cn(
        tableStyles({ selected: highlighted, clickable: isClickable, density }).row(),
        // Focus visual — bg tinted (match checkbox selected) + outline brand interno.
        // Outline em vez de ring/border pra não interferir com sticky/bordas.
        focused &&
          "bg-bg-table-row-selected hover:bg-bg-table-row-selected-hover outline outline-2 outline-offset-[-2px] outline-bg-brand z-[6] relative",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
});

/* ── <TableCell> ──────────────────────────────────────────────────── */

export const TableCell = forwardRef<HTMLDivElement, TableCellProps>(function TableCell({
  field,
  tooltip,
  width,
  pinned,
  pinOffset,
  align = "left",
  ellipsis = false,
  label,
  className,
  rootProps,
  purpose = "default",
  children,
}, ref) {
  const { density, cellBorders, resizingField } = useTableContext();
  const isResizingThisCol = field !== undefined && resizingField === field;
  const style: React.CSSProperties = {};
  if (width !== undefined) {
    style.width = width;
    style.minWidth = width;
    style.maxWidth = width;
  }
  if (pinned === "left" && pinOffset !== undefined) style.left = pinOffset;
  if (pinned === "right" && pinOffset !== undefined) style.right = pinOffset;

  return (
    <div
      {...rootProps}
      ref={ref}
      role="gridcell"
      data-pinned={pinned}
      data-label={label}
      data-field={field}
      data-purpose={purpose}
      data-resize-active={isResizingThisCol ? "true" : undefined}
      title={tooltip}
      className={cn(
        tableStyles({ pinned, align, ellipsis, density, cellBorders, purpose }).cell(),
        // Linha brand 2px alinhada com o centro do resize handle do header (~2px do edge)
        isResizingThisCol &&
          "relative after:absolute after:right-[2px] after:top-0 after:bottom-0 after:w-[2px] after:bg-bg-brand after:pointer-events-none",
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
});

/* ── <TableHeadCell> ──────────────────────────────────────────────── */

export const TableHeadCell = forwardRef<HTMLDivElement, TableHeadCellProps>(function TableHeadCell({
  field,
  width,
  pinned,
  pinOffset,
  align = "left",
  sortable = false,
  sortDirection = null,
  sortIndex = 1,
  onSortClick,
  icon: Icon,
  headMenu,
  resizable,
  onResize,
  onResizeEnd,
  className,
  style: extraStyle,
  rootProps,
  purpose = "default",
  children,
}, forwardedRef) {
  const { density, cellBorders, setResizingField } = useTableContext();
  const headCellRef = useRef<HTMLDivElement | null>(null);
  // Merge forwardedRef com headCellRef interno (usado pelo resize live-DOM).
  const setRefs = useCallback((el: HTMLDivElement | null) => {
    headCellRef.current = el;
    if (typeof forwardedRef === "function") forwardedRef(el);
    else if (forwardedRef) forwardedRef.current = el;
  }, [forwardedRef]);

  const resize = useColumnResize({
    currentWidth: width ?? 160,
    // Live DOM update — escreve `style.width` direto nas cells com `data-field`
    // correspondente, escopado ao `[role="grid"]` ancestral. Síncrono, sem React,
    // zero re-render durante o drag. Documented hook API via `onResizeLiveDOM`
    // (vs `onResize` que vai pro state externo, normalmente debounced ao mouseup).
    onResizeLiveDOM: field
      ? (w) => {
          const grid = headCellRef.current?.closest('[role="grid"]');
          grid?.querySelectorAll<HTMLElement>(`[data-field="${field}"]`).forEach((el) => {
            el.style.width = `${w}px`;
            el.style.minWidth = `${w}px`;
            el.style.maxWidth = `${w}px`;
          });
        }
      : undefined,
    onResize,
    onResizeEnd,
  });

  // Propaga isDragging do header pro Table root via context (CSS highlight column-wide)
  useEffect(() => {
    if (resize.isDragging && field) {
      setResizingField(field);
      return () => setResizingField(null);
    }
  }, [resize.isDragging, field, setResizingField]);

  const style: React.CSSProperties = {};
  if (width !== undefined) {
    style.width = width;
    style.minWidth = width;
    style.maxWidth = width;
  }
  if (pinned === "left" && pinOffset !== undefined) style.left = pinOffset;
  if (pinned === "right" && pinOffset !== undefined) style.right = pinOffset;

  const ariaSort: React.AriaAttributes["aria-sort"] = sortable
    ? sortDirection === "asc"
      ? "ascending"
      : sortDirection === "desc"
        ? "descending"
        : "none"
    : undefined;

  const isSorted = sortDirection === "asc" || sortDirection === "desc";

  return (
    <div
      {...rootProps}
      ref={setRefs}
      role="columnheader"
      aria-sort={ariaSort}
      data-pinned={pinned}
      data-sort={sortDirection ?? undefined}
      data-field={field}
      data-purpose={purpose}
      className={cn(
        "group/headcell",
        tableStyles({ pinned, align, sortable, density, cellBorders, purpose }).headCell(),
        className,
      )}
      style={{ ...style, ...extraStyle }}
      onClick={sortable ? onSortClick : undefined}
    >
      {Icon && <Icon className={styles.typeIcon()} size={13} strokeWidth={1.7} aria-hidden />}
      <span
        className={cn(
          "flex-1 min-w-0",
          // Coluna de seleção (checkbox) centraliza por padrão — sem precisar
          // de align="center" no consumer (alinha com o purpose="selection").
          align === "center" || purpose === "selection"
            ? "flex items-center justify-center"
            : align === "right"
              ? cn(
                  "truncate text-right",
                  // Reserva espaço pro headRightStack APENAS quando sort está
                  // ATIVO (sort badge + indicator visíveis permanentemente).
                  // Para hover-only icons (sortable hint sem sort + headMenu),
                  // NÃO reserva espaço — headRightStack tem `bg-bg-table-head`
                  // que mascara o texto durante hover. Texto right-aligned
                  // encosta corretamente na borda quando sem hover (antes
                  // ficava com ~60px de "vazio" reservado pros ícones invisíveis).
                  isSorted && "pr-[60px]",
                )
              : "truncate text-left",
        )}
      >
        {children}
      </span>
      {/* Right stack absolute: sort + headMenu agrupados, larguras dinâmicas via hidden/flex.
          Renderiza só se houver algo pra mostrar (sortable ou headMenu). */}
      {(sortable || headMenu) && (
        <span className={styles.headRightStack()}>
          {isSorted && (
            <span className={styles.headSortActive()}>
              {sortIndex !== undefined && (
                <span className={styles.sortBadge()}>{sortIndex}</span>
              )}
              <SortIndicator direction={sortDirection} />
            </span>
          )}
          {sortable && !isSorted && (
            <span className={styles.headSortHint()}>
              <SortIndicator direction={null} />
            </span>
          )}
          {headMenu && (
            <span className={styles.headMenuItem()}>{headMenu}</span>
          )}
        </span>
      )}
      {resizable && (
        <div
          className={styles.resizeHandle()}
          data-dragging={resize.isDragging}
          // dnd-kit PointerSensor escuta onPointerDown (dispara ANTES de mousedown).
          // Sem este stopPropagation, dragging do resize handle ativa o sortable
          // do header em paralelo — coluna começa a "voar" enquanto o usuário
          // tenta apenas redimensionar.
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={resize.onMouseDown}
          // click dispara depois de mouseup quando o cursor não andou muito —
          // sem stopPropagation aqui, click no handle borbulha pro header e
          // ativa onSortClick. mousedown/pointerdown stopPropagation NÃO
          // impedem o click subsequente (são eventos separados).
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => field && setResizingField(field)}
          onMouseLeave={() => {
            // So limpa se nao estiver em drag — drag continua marcado via useEffect
            if (!resize.isDragging) setResizingField(null);
          }}
          aria-hidden
        />
      )}
    </div>
  );
});

/* ── Sort indicator interno ───────────────────────────────────────── */

function SortIndicator({ direction }: { direction: SortDirection }) {
  if (direction === "asc") return <ArrowUp className={styles.sortIcon()} aria-hidden />;
  if (direction === "desc") return <ArrowDown className={styles.sortIcon()} aria-hidden />;
  // Hint quando sortable && null — controlado por display no slot headSortHint (hidden → inline-flex no hover)
  return <ArrowUpDown className={styles.sortIcon()} aria-hidden />;
}
