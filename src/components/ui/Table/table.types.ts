import type React from "react";
import type { ReactNode, MouseEvent } from "react";

/** Densidade vertical do grid. Afeta altura de row e padding de cell. */
export type TableDensity = "compact" | "standard" | "comfortable";

/** Direção de ordenação aplicada. null = sem ordenação. */
export type SortDirection = "asc" | "desc" | null;

/** Lado em que a coluna está fixa (sticky). undefined = fluida. */
export type ColumnPinned = "left" | "right" | undefined;

/** Alinhamento horizontal do conteúdo da cell. */
export type CellAlign = "left" | "center" | "right";

/* ── <Table> root ─────────────────────────────────────────────────── */

export type TableProps = {
  density?: TableDensity;
  /** Em px. Largura abaixo da qual o container vira card mode. `false` desativa. Default 768. */
  cardBreakpoint?: number | false;
  /** Renderiza bordas verticais entre colunas. Default true. */
  cellBorders?: boolean;
  ariaLabel?: string;
  className?: string;
  /** Ref externa pro scroll container interno — necessário pra virtualização
   *  (DataTable Fase F.3). Quando omitido, Table usa ref interna. */
  scrollRef?: React.MutableRefObject<HTMLDivElement | null>;
  children?: ReactNode;
};

/* ── <TableHead> ──────────────────────────────────────────────────── */

export type TableHeadProps = {
  /** Header sticky no topo durante scroll vertical. Default true. */
  sticky?: boolean;
  className?: string;
  /** Props HTML extras spread no rowgroup root — `onScroll`, `data-*`, `aria-*`, etc. */
  rootProps?: React.HTMLAttributes<HTMLDivElement>;
  children?: ReactNode;
};

/* ── <TableHeadCell> ──────────────────────────────────────────────── */

/**
 * Propósito da cell — modifica padding/border conforme contexto especial:
 *  - `"selection"`: remove padding pra acomodar Checkbox em width fixa
 *    (SELECTION_COLUMN_WIDTH).
 *  - `"actions"`: header em branco (sem texto/menu), border-right removida,
 *    padding horizontal mínimo. Usado quando `type: "actions"` na ColumnDef.
 *  Default: `"default"`.
 */
export type CellPurpose = "default" | "selection" | "actions";

export type TableHeadCellProps = {
  /** Field da coluna — usado pra data-field (resize highlight, etc). */
  field?: string;
  /** Largura em px. Se undefined, cell expande com flex. */
  width?: number;
  pinned?: ColumnPinned;
  /** Propósito da cell — controla padding interno. Default "default". */
  purpose?: CellPurpose;
  /** Offset em px para sticky positioning. Calculado por use-column-widths. */
  pinOffset?: number;
  align?: CellAlign;
  /** Mostra ícone de ordenação e cursor pointer. */
  sortable?: boolean;
  /** Estado visual atual do sort. null = sortable mas não ativo. */
  sortDirection?: SortDirection;
  /** Índice do sort (1, 2, 3) — renderiza chip brand com o número quando sortDirection != null. Default 1. */
  sortIndex?: number;
  onSortClick?: () => void;
  /** Ícone do tipo de coluna renderizado à esquerda do label (Hash, User, AtSign…). */
  icon?: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number; "aria-hidden"?: boolean }>;
  /** Conteúdo do menu "..." no canto direito do header (aparece no hover). Renderize um Button DS aqui. */
  headMenu?: React.ReactNode;
  /** Habilita drag handle no edge direito. */
  resizable?: boolean;
  /** Chamado durante drag — delta acumulado em px desde o mousedown. */
  onResize?: (deltaPx: number) => void;
  /** Chamado no mouseup — width final em px. */
  onResizeEnd?: (finalWidthPx: number) => void;
  className?: string;
  /** Style extra mesclado com o style interno (width/sticky offsets). Usado pra dnd transform. */
  style?: React.CSSProperties;
  /** Props HTML extras spread no root div — usado por wrappers (ex: dnd-kit attributes+listeners). */
  rootProps?: React.HTMLAttributes<HTMLDivElement>;
  children?: ReactNode;
};

/* ── <TableBody> ──────────────────────────────────────────────────── */

export type TableBodyProps = {
  className?: string;
  /** Style inline — usado pra virtualization (height total + position relative).
   *  Quando `virtualized={ totalHeight: N }`, body aplica height + position interna. */
  style?: React.CSSProperties;
  /** Props HTML extras spread no rowgroup root — `data-*`, `aria-*`, etc.
   *  Útil pra interceptores de scroll/wheel ou attributes custom. */
  rootProps?: React.HTMLAttributes<HTMLDivElement>;
  /** Modo virtualizado — quando definido, body usa `position: relative + block`
   *  com `height: totalHeight` pra acomodar rows absolutas do `@tanstack/react-virtual`.
   *  Passe `totalHeight = virtualizer.getTotalSize()`. */
  virtualized?: { totalHeight: number };
  children?: ReactNode;
};

/* ── <TableRow> ───────────────────────────────────────────────────── */

export type TableRowProps = {
  selected?: boolean;
  /**
   * Row está em foco pra detalhe (ex: click abriu drawer com info). Visual idêntico ao `selected`
   * (bg brand-tinted + strip lateral brand) — mas semanticamente independente: pode coexistir com `selected`.
   * Use pra padrão de "click row → abre detail panel", mantendo seleção (checkbox) separada.
   */
  open?: boolean;
  /**
   * Row tem foco de teclado (Fase E.1). Adiciona ring brand + outline visual + tabIndex=0.
   * Quando false, tabIndex=-1 (fora da ordem de tab). Quando ANY row tem focused=true,
   * só ela é tab-focusable — entrar via Tab vai pra essa linha.
   */
  focused?: boolean;
  /** Cursor pointer + onClick disponível. */
  clickable?: boolean;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  className?: string;
  /** Props HTML extras spread no root div — usado por consumers (ex: onKeyDown pra keyboard nav). */
  rootProps?: React.HTMLAttributes<HTMLDivElement>;
  children?: ReactNode;
};

/* ── <TableCell> ──────────────────────────────────────────────────── */

export type TableCellProps = {
  /** Field da coluna — usado pra data-field (resize highlight, tooltip lookup, etc). */
  field?: string;
  /** Tooltip nativo (HTML title) — mostrado no hover. Util quando ellipsis=true e texto pode estar truncado. */
  tooltip?: string;
  width?: number;
  pinned?: ColumnPinned;
  pinOffset?: number;
  align?: CellAlign;
  /** Propósito da cell — controla padding interno. Default "default". */
  purpose?: CellPurpose;
  /** Trunca com `text-overflow: ellipsis`. Requer overflow:hidden no parent. */
  ellipsis?: boolean;
  /** Label da coluna usado no card mode (renderiza acima do valor). */
  label?: string;
  className?: string;
  /** Props HTML extras spread no root div — usado por consumers (ex: onDoubleClick pra inline edit). */
  rootProps?: React.HTMLAttributes<HTMLDivElement>;
  children?: ReactNode;
};
