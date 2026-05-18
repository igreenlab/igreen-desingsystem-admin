# `<Table>` Primitive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `<Table>` primitive component (passo 1 do design DataTable) — render em divs com densidade, sticky header, hover/selected/pin/resize/sort indicator, e responsive card mode. Usável standalone fora do `<DataTable>`.

**Architecture:** API "lego" (subcomponentes `Table`/`TableHead`/`TableHeadCell`/`TableBody`/`TableRow`/`TableCell`) totalmente controlada via props. Sem estado interno de dados — quem orquestra (consumer ou `<DataTable>` no passo 2) controla widths, sortModel, selection. Estilo via `tv()` com slots. Resize e widths/offsets calculados por hooks internos puros. Card mode via container query.

**Tech Stack:** React 19, TypeScript 5.6, Tailwind v4, `tailwind-variants` via wrapper `@/utils/tv`, tokens iGreen DS V3 (`bg-bg-table*`, `border-border-table`, etc), lucide-react ícones.

**Notas operacionais deste projeto** (diferem da skill padrão):
- ❌ **Sem framework de testes unit** — validação por showcase visual em `/Table` (porta 3100) + revisão DS Reviewer
- ❌ **Não é repo git** — "commits" são **checkpoints** lógicos (descrição de estado), sem comando `git`
- ✅ **Token check obrigatório:** antes da Task 1, garantir que `npm run tokens:tw4` foi rodado (libera `bg-bg-table-row-selected` e `bg-bg-table-row-selected-hover` no CSS)
- ✅ **Refs do código:** sempre `tv` de `@/utils/tv`, sempre classes DS antes de Tailwind literal, `disabled` por último em compoundVariants

**Spec de origem:** [docs/superpowers/specs/2026-05-12-data-table-design.md](../specs/2026-05-12-data-table-design.md)

---

## Pré-requisito obrigatório (rodar uma vez antes de começar)

```bash
npm run tokens:tw4
```

Verifica que `src/styles/theme/tailwind-theme.css` contém as 2 novas utilities:
- `bg-bg-table-row-selected`
- `bg-bg-table-row-selected-hover`

Se não contiver, rerodar até aparecer. Tasks abaixo dependem disso.

---

## File structure (locked-in)

```
src/components/ui/Table/
├── table.types.ts            # Public types (todas as Props + ColumnPinned + SortDirection)
├── table.styles.ts           # tv() slots: root, scroll, head, headCell, body, row, cell, resizeHandle, sortIcon, cardWrap, cardItem
├── use-column-widths.ts      # Hook puro: a partir de widths/pinned/order → calcula stickyOffsets
├── use-column-resize.ts      # Hook puro: drag handle (mousedown→move→up), reporta delta via callback
├── table-card-row.tsx        # Subcomponente card mode (consumido por TableBody quando container < cardBreakpoint)
├── table.tsx                 # Exporta Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell
├── USAGE.md                  # Doc de uso obrigatória (padrão do projeto)
└── index.ts                  # Barrel export

src/preview/pages/
└── TableDoc.tsx              # Showcase com 6+ exemplos (basic, densities, sticky, pin, resize, card mode)

src/preview/components/       # SE precisar registrar no router — checar App.tsx ou similar
└── (modificação se houver router central)

src/components/index.ts       # Adicionar export do Table (barrel raiz)
.ai/context/components/inventory.md  # Adicionar entry "Table | ui/Table | ✅"
.ai/status/pipeline-state.md         # Append entry "Table | iGreen ui/ | APROVADO"
```

---

## Task 1: Setup — types e styles base

**Files:**
- Create: `src/components/ui/Table/table.types.ts`
- Create: `src/components/ui/Table/table.styles.ts`

Define os contratos públicos e o esqueleto de styling. Sem JSX ainda.

- [ ] **Step 1.1: Criar `table.types.ts` com todos os types públicos**

```ts
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
  ariaLabel?: string;
  className?: string;
  children?: ReactNode;
};

/* ── <TableHead> ──────────────────────────────────────────────────── */

export type TableHeadProps = {
  /** Header sticky no topo durante scroll vertical. Default true. */
  sticky?: boolean;
  className?: string;
  children?: ReactNode;
};

/* ── <TableHeadCell> ──────────────────────────────────────────────── */

export type TableHeadCellProps = {
  /** Largura em px. Se undefined, cell expande com flex. */
  width?: number;
  pinned?: ColumnPinned;
  /** Offset em px para sticky positioning. Calculado por use-column-widths. */
  pinOffset?: number;
  align?: CellAlign;
  /** Mostra ícone de ordenação e cursor pointer. */
  sortable?: boolean;
  /** Estado visual atual do sort. null = sortable mas não ativo. */
  sortDirection?: SortDirection;
  onSortClick?: () => void;
  /** Habilita drag handle no edge direito. */
  resizable?: boolean;
  /** Chamado durante drag — delta acumulado em px desde o mousedown. */
  onResize?: (deltaPx: number) => void;
  /** Chamado no mouseup — width final em px. */
  onResizeEnd?: (finalWidthPx: number) => void;
  className?: string;
  children?: ReactNode;
};

/* ── <TableBody> ──────────────────────────────────────────────────── */

export type TableBodyProps = {
  className?: string;
  children?: ReactNode;
};

/* ── <TableRow> ───────────────────────────────────────────────────── */

export type TableRowProps = {
  selected?: boolean;
  /** Cursor pointer + onClick disponível. */
  clickable?: boolean;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  className?: string;
  children?: ReactNode;
};

/* ── <TableCell> ──────────────────────────────────────────────────── */

export type TableCellProps = {
  width?: number;
  pinned?: ColumnPinned;
  pinOffset?: number;
  align?: CellAlign;
  /** Trunca com `text-overflow: ellipsis`. Requer overflow:hidden no parent. */
  ellipsis?: boolean;
  /** Label da coluna usado no card mode (renderiza acima do valor). */
  label?: string;
  className?: string;
  children?: ReactNode;
};
```

- [ ] **Step 1.2: Criar `table.styles.ts` com slots tv vazios (estrutura)**

```ts
import { tv } from "@/utils/tv";

/**
 * Table styles — slots tv pra Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell.
 *
 * Densidade afeta: altura mínima de row + padding vertical de cell.
 * Modo card: aplicado via container query (@container) — root declara container-type.
 */
export const tableStyles = tv({
  slots: {
    /* Root grid container. Aplica container-type pra container queries. */
    root: [
      "relative w-full flex flex-col",
      "bg-bg-table border border-border-table rounded-radius-xl shadow-sh-sm",
      "overflow-hidden",
      "[container-type:inline-size]",
    ],
    /* Container que faz o scroll horizontal/vertical (envolve head + body). */
    scroll: [
      "flex-1 overflow-auto relative",
    ],
    /* Header row (flex de TableHeadCell). Sticky default. */
    head: [
      "flex w-max min-w-full",
      "bg-bg-table-head border-b border-border-table",
      "z-20",
    ],
    /* Cell do header — type, padding, alinhamento. */
    headCell: [
      "relative flex items-center shrink-0",
      "px-pad-2xl",
      "text-label-xs text-fg-muted",
      "select-none",
    ],
    /* Body container — contém as rows. */
    body: [
      "flex flex-col w-max min-w-full",
    ],
    /* Row (flex de TableCell). */
    row: [
      "flex w-full",
      "border-b border-border-table last:border-b-0",
      "bg-bg-table",
      "transition-colors duration-150",
    ],
    /* Cell — content cell padrão. */
    cell: [
      "flex items-center shrink-0",
      "px-pad-2xl",
      "text-paragraph-sm text-fg-default",
    ],
    /* Drag handle do resize — barrinha invisível no edge direito. */
    resizeHandle: [
      "absolute right-0 top-0 bottom-0 w-[6px] cursor-col-resize",
      "bg-transparent hover:bg-border-brand active:bg-border-brand",
      "transition-colors duration-100",
      "z-10",
    ],
    /* Ícone de sort no head cell. */
    sortIcon: [
      "ml-gp-xs size-icon-xs text-fg-muted",
      "transition-transform duration-150",
    ],
    /* Card mode — wrapper de cada row no modo card. */
    cardWrap: [
      "flex flex-col w-full p-pad-card-sm gap-gp-md",
      "border-b border-border-table last:border-b-0",
      "bg-bg-table",
    ],
    /* Card mode — header do card (primary + checkbox + actions). */
    cardHeader: [
      "flex items-center justify-between gap-gp-md",
    ],
    /* Card mode — body items (label/value). */
    cardItem: [
      "flex flex-col gap-gp-2xs",
    ],
    /* Card mode — label da coluna acima do valor. */
    cardLabel: [
      "text-subheading-xs text-fg-muted",
    ],
    /* Card mode — valor abaixo do label. */
    cardValue: [
      "text-paragraph-sm text-fg-default",
    ],
  },
  variants: {
    density: {
      compact:     { row: "min-h-form-sm", cell: "py-pad-sm", headCell: "py-pad-md min-h-form-md" },
      standard:    { row: "min-h-form-lg", cell: "py-pad-lg", headCell: "py-pad-lg min-h-form-lg" },
      comfortable: { row: "min-h-form-xl", cell: "py-pad-2xl", headCell: "py-pad-xl min-h-form-xl" },
    },
    sticky: {
      true:  { head: "sticky top-0" },
      false: {},
    },
    selected: {
      true:  { row: "bg-bg-table-row-selected hover:bg-bg-table-row-selected-hover" },
      false: { row: "hover:bg-bg-table-row-hover" },
    },
    clickable: {
      true:  { row: "cursor-pointer" },
      false: {},
    },
    pinned: {
      left:  { headCell: "sticky z-10 bg-bg-table-head", cell: "sticky z-[5] bg-inherit" },
      right: { headCell: "sticky z-10 bg-bg-table-head", cell: "sticky z-[5] bg-inherit" },
    },
    align: {
      left:   { cell: "justify-start text-left",     headCell: "justify-start text-left" },
      center: { cell: "justify-center text-center", headCell: "justify-center text-center" },
      right:  { cell: "justify-end text-right",     headCell: "justify-end text-right" },
    },
    sortable: {
      true:  { headCell: "cursor-pointer hover:text-fg-default" },
      false: {},
    },
    ellipsis: {
      true:  { cell: "overflow-hidden [&>*]:truncate" },
      false: {},
    },
  },
  defaultVariants: {
    density: "standard",
    sticky: true,
    selected: false,
    clickable: false,
    align: "left",
    sortable: false,
    ellipsis: false,
  },
});
```

- [ ] **Step 1.3: Verificar TypeScript compila**

Rodar:
```bash
npm run tokens:check
```
Expected: sem erros. Se reclamar de import `@/utils/tv`, esse path já existe no projeto — verificar tsconfig se for problema de resolver.

- [ ] **Step 1.4: Checkpoint**

Estado: pasta `src/components/ui/Table/` tem `table.types.ts` e `table.styles.ts`. Ainda não renderiza nada. Próximo: criar os 6 componentes JSX.

---

## Task 2: `Table` + `TableHead` + `TableBody` (esqueleto + ARIA)

**Files:**
- Create: `src/components/ui/Table/table.tsx`

Componentes wrappers — sem variants de density nem sticky ainda (só estrutura + ARIA + propaga children).

- [ ] **Step 2.1: Criar `table.tsx` com Table, TableHead, TableBody**

```tsx
import { cn } from "@/lib/utils";
import { tableStyles } from "./table.styles";
import type {
  TableProps,
  TableHeadProps,
  TableBodyProps,
} from "./table.types";

const styles = tableStyles();

/* ── <Table> root ─────────────────────────────────────────────────── */

export function Table({
  density = "standard",
  cardBreakpoint = 768,
  ariaLabel,
  className,
  children,
}: TableProps) {
  // Container queries via inline style — Tailwind v4 não tem arbitrary container query no momento da escrita
  const cardCss =
    cardBreakpoint === false
      ? undefined
      : ({ "--table-card-bp": `${cardBreakpoint}px` } as React.CSSProperties);

  return (
    <div
      role="grid"
      aria-label={ariaLabel}
      data-density={density}
      className={cn(tableStyles({ density }).root(), className)}
      style={cardCss}
    >
      <div className={styles.scroll()}>{children}</div>
    </div>
  );
}

/* ── <TableHead> ──────────────────────────────────────────────────── */

export function TableHead({
  sticky = true,
  className,
  children,
}: TableHeadProps) {
  return (
    <div
      role="rowgroup"
      className={cn(tableStyles({ sticky }).head(), className)}
    >
      <div role="row" className="flex w-full">
        {children}
      </div>
    </div>
  );
}

/* ── <TableBody> ──────────────────────────────────────────────────── */

export function TableBody({ className, children }: TableBodyProps) {
  return (
    <div role="rowgroup" className={cn(styles.body(), className)}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2.2: Adicionar export temporário pra teste**

No fim do `table.tsx`, adicionar (será removido na Task 10):

```tsx
// TEMP — placeholder pra TableRow, TableCell, TableHeadCell aparecerem no preview.
// Substituído nas Tasks 3-4.
export function TableRow({ children }: { children?: React.ReactNode }) {
  return <div role="row" className={styles.row()}>{children}</div>;
}
export function TableCell({ children }: { children?: React.ReactNode }) {
  return <div role="gridcell" className={styles.cell()}>{children}</div>;
}
export function TableHeadCell({ children }: { children?: React.ReactNode }) {
  return <div role="columnheader" className={styles.headCell()}>{children}</div>;
}
```

- [ ] **Step 2.3: Checkpoint**

Estado: `Table`, `TableHead`, `TableBody` renderizam com ARIA correto. `TableRow`/`TableCell`/`TableHeadCell` são placeholders temporários. Próximo: implementar Row + Cell + HeadCell de verdade.

---

## Task 3: `TableRow` + `TableCell` definitivos

**Files:**
- Modify: `src/components/ui/Table/table.tsx`

Substitui os placeholders temporários da Task 2 pela implementação real com variants.

- [ ] **Step 3.1: Substituir o placeholder de `TableRow` por implementação completa**

Substitui o bloco TEMP do passo 2.2 (remover `TableRow`, `TableCell`, `TableHeadCell` placeholders) e adicionar acima do `export function TableBody`:

```tsx
import type { TableRowProps, TableCellProps } from "./table.types";

/* ── <TableRow> ───────────────────────────────────────────────────── */

export function TableRow({
  selected = false,
  clickable,
  onClick,
  className,
  children,
}: TableRowProps) {
  const isClickable = clickable ?? !!onClick;
  return (
    <div
      role="row"
      aria-selected={selected || undefined}
      data-state={selected ? "selected" : undefined}
      className={cn(
        tableStyles({ selected, clickable: isClickable }).row(),
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/* ── <TableCell> ──────────────────────────────────────────────────── */

export function TableCell({
  width,
  pinned,
  pinOffset,
  align = "left",
  ellipsis = false,
  label,
  className,
  children,
}: TableCellProps) {
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
      role="gridcell"
      data-pinned={pinned}
      data-label={label}
      className={cn(
        tableStyles({ pinned, align, ellipsis }).cell(),
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3.2: Validação visual rápida**

Não precisa preview ainda — vai validar tudo de uma vez na Task 11 (showcase). Mas verifica que `npm run tokens:check` continua passando:

```bash
npm run tokens:check
```
Expected: sem erros.

- [ ] **Step 3.3: Checkpoint**

Estado: `TableRow` e `TableCell` com variants completos (selected, clickable, pinned, align, ellipsis), width controlada por prop, ARIA correto, `data-state="selected"` (compatível com Radix patterns).

---

## Task 4: `TableHeadCell` definitivo (sem resize/sort interativo ainda)

**Files:**
- Modify: `src/components/ui/Table/table.tsx`

Implementa o head cell com tudo MENOS resize handle (Task 7) e sort onClick (Task 6 visualmente, Task 6 também conecta o clique). Aqui só estrutura + ARIA + estilo.

- [ ] **Step 4.1: Remover o placeholder `TableHeadCell` da Task 2 e adicionar logo abaixo de TableCell**

```tsx
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import type { TableHeadCellProps } from "./table.types";

/* ── <TableHeadCell> ──────────────────────────────────────────────── */

export function TableHeadCell({
  width,
  pinned,
  pinOffset,
  align = "left",
  sortable = false,
  sortDirection = null,
  onSortClick,
  resizable,
  onResize,
  onResizeEnd,
  className,
  children,
}: TableHeadCellProps) {
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

  return (
    <div
      role="columnheader"
      aria-sort={ariaSort}
      data-pinned={pinned}
      data-sort={sortDirection ?? undefined}
      className={cn(
        tableStyles({ pinned, align, sortable }).headCell(),
        className,
      )}
      style={style}
      onClick={sortable ? onSortClick : undefined}
    >
      <span className="truncate">{children}</span>
      {sortable && (
        <SortIndicator direction={sortDirection} />
      )}
      {/* Resize handle entra na Task 7 */}
    </div>
  );
}

/* ── Sort indicator interno ───────────────────────────────────────── */

function SortIndicator({ direction }: { direction: SortDirection }) {
  if (direction === "asc") return <ArrowUp className={styles.sortIcon()} aria-hidden />;
  if (direction === "desc") return <ArrowDown className={styles.sortIcon()} aria-hidden />;
  return <ArrowUpDown className={styles.sortIcon({ className: "opacity-60" })} aria-hidden />;
}
```

Também adiciona o import no topo:

```tsx
import type { SortDirection } from "./table.types";
```

- [ ] **Step 4.2: Validar typecheck**

```bash
npm run tokens:check
```
Expected: sem erros.

- [ ] **Step 4.3: Checkpoint**

Estado: `TableHeadCell` completo — sortable + sortDirection visual + aria-sort + onSortClick + width/pin/align. Resize handle ainda pendente.

---

## Task 5: Hook `use-column-widths.ts`

**Files:**
- Create: `src/components/ui/Table/use-column-widths.ts`

Hook puro: recebe um array de colunas (mínimo: `field`, `width?`, `pinned?`) e retorna mapas `widths[field]` e `offsets[field]` (em px). Calcula `pinOffset` cumulativo das colunas pinned (left = soma das anteriores, right = soma das posteriores).

- [ ] **Step 5.1: Criar `use-column-widths.ts`**

```ts
import { useMemo } from "react";
import type { ColumnPinned } from "./table.types";

/** Minimal column shape this hook needs. Real ColumnDef do DataTable é superset. */
export type WidthColumnInput = {
  field: string;
  width?: number;
  /** Default width usado quando `width` undefined. */
  defaultWidth?: number;
  pinned?: ColumnPinned;
};

export type ColumnWidthsResult = {
  /** Largura efetiva por field (px). */
  widths: Record<string, number>;
  /** Offset sticky por field (px). Só faz sentido pra colunas pinned. */
  offsets: Record<string, number>;
  /** Total de largura ocupada pelas colunas pinned left. Usado pra calcular shadow lateral. */
  totalPinLeft: number;
  /** Total de largura ocupada pelas colunas pinned right. */
  totalPinRight: number;
};

const DEFAULT_COLUMN_WIDTH = 160;

/**
 * Calcula widths efetivos e offsets sticky cumulativos.
 *
 * Algoritmo:
 *   1. widths[field] = column.width ?? column.defaultWidth ?? DEFAULT_COLUMN_WIDTH
 *   2. Para colunas pinned="left": offsets[field] = soma das widths das colunas pinned=left que vêm ANTES
 *   3. Para colunas pinned="right": offsets[field] = soma das widths das colunas pinned=right que vêm DEPOIS
 *   4. Colunas não-pinned: offset = undefined
 *
 * @example
 *   useColumnWidths([{field:'a',width:50,pinned:'left'}, {field:'b',width:80,pinned:'left'}, {field:'c'}])
 *   → widths: {a:50, b:80, c:160}
 *   → offsets: {a:0, b:50}
 *   → totalPinLeft: 130, totalPinRight: 0
 */
export function useColumnWidths(
  columns: ReadonlyArray<WidthColumnInput>,
): ColumnWidthsResult {
  return useMemo(() => {
    const widths: Record<string, number> = {};
    const offsets: Record<string, number> = {};
    let totalPinLeft = 0;
    let totalPinRight = 0;

    // Passo 1: widths efetivos
    for (const col of columns) {
      widths[col.field] =
        col.width ?? col.defaultWidth ?? DEFAULT_COLUMN_WIDTH;
    }

    // Passo 2: offsets left (acumulado da esquerda pra direita)
    let leftSum = 0;
    for (const col of columns) {
      if (col.pinned === "left") {
        offsets[col.field] = leftSum;
        leftSum += widths[col.field];
      }
    }
    totalPinLeft = leftSum;

    // Passo 3: offsets right (acumulado da direita pra esquerda)
    let rightSum = 0;
    for (let i = columns.length - 1; i >= 0; i--) {
      const col = columns[i];
      if (col.pinned === "right") {
        offsets[col.field] = rightSum;
        rightSum += widths[col.field];
      }
    }
    totalPinRight = rightSum;

    return { widths, offsets, totalPinLeft, totalPinRight };
  }, [columns]);
}
```

- [ ] **Step 5.2: Validar typecheck**

```bash
npm run tokens:check
```
Expected: sem erros.

- [ ] **Step 5.3: Checkpoint**

Estado: hook puro pronto. Será exercitado no showcase (Task 11).

---

## Task 6: Hook `use-column-resize.ts`

**Files:**
- Create: `src/components/ui/Table/use-column-resize.ts`

Hook que retorna handlers de drag (mousedown/move/up). Reporta delta acumulado durante o drag e width final no mouseup. Usa refs + listeners no document (não no elemento — pra continuar trackeando se mouse sair do handle).

- [ ] **Step 6.1: Criar `use-column-resize.ts`**

```ts
import { useCallback, useEffect, useRef } from "react";

export type UseColumnResizeParams = {
  /** Largura atual da coluna em px (snapshot — não precisa reativar). */
  currentWidth: number;
  /** Largura mínima permitida. Default 60. */
  minWidth?: number;
  /** Largura máxima permitida. Default 800. */
  maxWidth?: number;
  /** Chamado durante o drag — recebe a width tentativa em px (já clampada por min/max). */
  onResize?: (widthPx: number) => void;
  /** Chamado no mouseup — recebe a width final em px. */
  onResizeEnd?: (widthPx: number) => void;
};

export type UseColumnResizeResult = {
  /** Handler pra anexar no mousedown do handle div. */
  onMouseDown: (e: React.MouseEvent) => void;
  /** True quando está em drag. Útil pra estilizar o handle (active state). */
  isDragging: boolean;
};

const DEFAULT_MIN = 60;
const DEFAULT_MAX = 800;

/**
 * Hook que gerencia o ciclo de drag de resize de coluna.
 *
 * Fluxo:
 *   1. mousedown no handle → captura startX e startWidth, anexa listeners no document
 *   2. mousemove (anywhere) → calcula delta, clampa, chama onResize(novoWidth)
 *   3. mouseup (anywhere) → chama onResizeEnd(finalWidth), remove listeners
 *
 * Listeners no document (não no handle) garantem que o drag continua mesmo
 * se o cursor sair da área do handle (cenário comum: drag rápido pra direita).
 *
 * @example
 *   const { onMouseDown, isDragging } = useColumnResize({
 *     currentWidth: 120,
 *     onResize: (w) => setLocalWidth(w),
 *     onResizeEnd: (w) => persistWidth(field, w),
 *   });
 *   <div className="resize-handle" data-dragging={isDragging} onMouseDown={onMouseDown} />
 */
export function useColumnResize({
  currentWidth,
  minWidth = DEFAULT_MIN,
  maxWidth = DEFAULT_MAX,
  onResize,
  onResizeEnd,
}: UseColumnResizeParams): UseColumnResizeResult {
  const stateRef = useRef<{
    startX: number;
    startWidth: number;
    lastWidth: number;
    dragging: boolean;
  }>({ startX: 0, startWidth: 0, lastWidth: currentWidth, dragging: false });

  // Atualiza lastWidth pra refletir mudanças externas (controlled prop)
  stateRef.current.lastWidth = currentWidth;

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!stateRef.current.dragging) return;
      const delta = e.clientX - stateRef.current.startX;
      const next = Math.min(
        maxWidth,
        Math.max(minWidth, stateRef.current.startWidth + delta),
      );
      stateRef.current.lastWidth = next;
      onResize?.(next);
    },
    [minWidth, maxWidth, onResize],
  );

  const handleMouseUp = useCallback(() => {
    if (!stateRef.current.dragging) return;
    stateRef.current.dragging = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    onResizeEnd?.(stateRef.current.lastWidth);
  }, [handleMouseMove, onResizeEnd]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      stateRef.current = {
        startX: e.clientX,
        startWidth: currentWidth,
        lastWidth: currentWidth,
        dragging: true,
      };
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [currentWidth, handleMouseMove, handleMouseUp],
  );

  // Cleanup se desmontar durante drag
  useEffect(() => {
    return () => {
      if (stateRef.current.dragging) {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    onMouseDown,
    isDragging: stateRef.current.dragging,
  };
}
```

- [ ] **Step 6.2: Validar typecheck**

```bash
npm run tokens:check
```
Expected: sem erros.

- [ ] **Step 6.3: Checkpoint**

Estado: hook resize pronto. Próxima task integra ele no `TableHeadCell`.

---

## Task 7: Integrar resize handle no `TableHeadCell`

**Files:**
- Modify: `src/components/ui/Table/table.tsx`

- [ ] **Step 7.1: Adicionar import e modificar `TableHeadCell` pra renderizar o handle**

No topo do arquivo, adicionar:
```tsx
import { useColumnResize } from "./use-column-resize";
```

Substituir o componente `TableHeadCell` adicionando o resize handle no fim do JSX (antes do `</div>` de fechamento) e usando o hook:

```tsx
export function TableHeadCell({
  width,
  pinned,
  pinOffset,
  align = "left",
  sortable = false,
  sortDirection = null,
  onSortClick,
  resizable,
  onResize,
  onResizeEnd,
  className,
  children,
}: TableHeadCellProps) {
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

  const resize = useColumnResize({
    currentWidth: width ?? 160,
    onResize,
    onResizeEnd,
  });

  return (
    <div
      role="columnheader"
      aria-sort={ariaSort}
      data-pinned={pinned}
      data-sort={sortDirection ?? undefined}
      className={cn(
        tableStyles({ pinned, align, sortable }).headCell(),
        className,
      )}
      style={style}
      onClick={sortable ? onSortClick : undefined}
    >
      <span className="truncate">{children}</span>
      {sortable && <SortIndicator direction={sortDirection} />}
      {resizable && (
        <div
          className={styles.resizeHandle()}
          data-dragging={resize.isDragging || undefined}
          onMouseDown={resize.onMouseDown}
          aria-hidden
        />
      )}
    </div>
  );
}
```

- [ ] **Step 7.2: Validar typecheck**

```bash
npm run tokens:check
```
Expected: sem erros.

- [ ] **Step 7.3: Checkpoint**

Estado: resize handle aparece no edge direito do head cell quando `resizable=true`. Cursor `col-resize` ao hover. Drag chama callbacks. Próximo: card mode.

---

## Task 8: Card mode — `table-card-row.tsx` + container query

**Files:**
- Create: `src/components/ui/Table/table-card-row.tsx`
- Modify: `src/components/ui/Table/table.tsx` (TableBody decide quando renderizar card)
- Modify: `src/components/ui/Table/table.styles.ts` (adicionar slot/responsive de card)

A estratégia: o `TableBody` **não** decide via JS o que renderizar. Em vez disso, o CSS faz: usando container query `@container (max-width: --table-card-bp)`, escondemos `TableHead` + tornamos cada `TableRow` em um card via classes. Mas isso é frágil porque o conteúdo dentro de `TableCell` (label, valor) precisa reorganizar.

**Decisão:** o consumer NÃO renderiza `<TableRow><TableCell label="X">y</TableCell>...</TableRow>` esperando duas estruturas. Em vez disso, expomos `<TableCardRow>` como **componente irmão** que o consumer renderiza quando quer card mode. No `<DataTable>` (passo 2), o `useDataTableController` decide qual renderizar baseado em `useContainerQuery`.

**Pra esta v1 do `<Table>` cru:** expor `<TableCardRow>` e deixar o consumer escolher. A mágica de "vira card automaticamente" entra no `<DataTable>`.

- [ ] **Step 8.1: Criar `table-card-row.tsx`**

```tsx
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
  clickable,
  onClick,
  className,
}: TableCardRowProps) {
  const isClickable = clickable ?? !!onClick;
  return (
    <div
      role="article"
      aria-selected={selected || undefined}
      data-state={selected ? "selected" : undefined}
      className={cn(
        tableStyles({ selected, clickable: isClickable }).cardWrap(),
        className,
      )}
      onClick={onClick}
    >
      <div className={styles.cardHeader()}>
        <div className="flex items-center gap-gp-md min-w-0">{header}</div>
        {headerActions && (
          <div className="flex items-center gap-gp-xs shrink-0">{headerActions}</div>
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
```

- [ ] **Step 8.2: Validar typecheck**

```bash
npm run tokens:check
```
Expected: sem erros.

- [ ] **Step 8.3: Checkpoint**

Estado: `<TableCardRow>` standalone. Consumer (showcase ou DataTable futuro) escolhe quando renderizar com base em container size.

---

## Task 9: `index.ts` (barrel) e `USAGE.md`

**Files:**
- Create: `src/components/ui/Table/index.ts`
- Create: `src/components/ui/Table/USAGE.md`
- Modify: `src/components/index.ts` (adicionar reexport)

- [ ] **Step 9.1: Criar `src/components/ui/Table/index.ts`**

```ts
export {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "./table";
export { TableCardRow } from "./table-card-row";
export { useColumnWidths } from "./use-column-widths";
export { useColumnResize } from "./use-column-resize";
export type {
  TableProps,
  TableHeadProps,
  TableHeadCellProps,
  TableBodyProps,
  TableRowProps,
  TableCellProps,
  TableDensity,
  SortDirection,
  ColumnPinned,
  CellAlign,
} from "./table.types";
export type { TableCardRowProps } from "./table-card-row";
export type {
  WidthColumnInput,
  ColumnWidthsResult,
} from "./use-column-widths";
export type {
  UseColumnResizeParams,
  UseColumnResizeResult,
} from "./use-column-resize";
```

- [ ] **Step 9.2: Adicionar reexport em `src/components/index.ts`**

Ler `src/components/index.ts`. Adicionar logo após a última linha de export `ui/`:

```ts
export * from "./ui/Table";
```

- [ ] **Step 9.3: Criar `src/components/ui/Table/USAGE.md`**

```markdown
# Table

Primitivo de tabela em divs. API "lego" controlada — você gerencia widths, sort, selection.

Pra tabelas feature-completas com toolbar, paginação, filtros e persist, usar `<DataTable>` (em desenvolvimento).

## Imports

\`\`\`tsx
import {
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  TableCardRow,
  useColumnWidths,
} from "@/components/ui/Table";
\`\`\`

## Uso básico

\`\`\`tsx
function MyTable({ rows }) {
  const columns = [
    { field: "name",  headerName: "Nome",  width: 200 },
    { field: "email", headerName: "Email", width: 240 },
    { field: "role",  headerName: "Cargo", width: 120 },
  ];

  const { widths, offsets } = useColumnWidths(columns);

  return (
    <Table density="standard" ariaLabel="Usuários">
      <TableHead>
        {columns.map((col) => (
          <TableHeadCell key={col.field} width={widths[col.field]}>
            {col.headerName}
          </TableHeadCell>
        ))}
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            {columns.map((col) => (
              <TableCell key={col.field} width={widths[col.field]} label={col.headerName}>
                {row[col.field]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
\`\`\`

## Pin sticky

\`\`\`tsx
const columns = [
  { field: "select", width: 48,  pinned: "left" },
  { field: "name",   width: 200, pinned: "left" },
  { field: "email",  width: 240 },
  { field: "actions", width: 80, pinned: "right" },
];
const { widths, offsets } = useColumnWidths(columns);

<TableHeadCell pinned={col.pinned} pinOffset={offsets[col.field]} width={widths[col.field]}>
  {col.headerName}
</TableHeadCell>
\`\`\`

## Resize

\`\`\`tsx
const [widthMap, setWidthMap] = useState<Record<string, number>>({});

<TableHeadCell
  width={widthMap[col.field] ?? col.width}
  resizable
  onResize={(w) => setWidthMap((m) => ({ ...m, [col.field]: w }))}
  onResizeEnd={(w) => persistColumnWidth(col.field, w)}  // opcional: persistir
>
  {col.headerName}
</TableHeadCell>
\`\`\`

## Sort indicator

\`\`\`tsx
const [sortBy, setSortBy] = useState<{ field: string; dir: SortDirection }>({ field: "", dir: null });

<TableHeadCell
  sortable
  sortDirection={sortBy.field === col.field ? sortBy.dir : null}
  onSortClick={() => setSortBy(cycleSort(sortBy, col.field))}
>
  {col.headerName}
</TableHeadCell>
\`\`\`

## Card mode (responsive)

O componente `<Table>` não muda automaticamente. Quem usa decide via container query e renderiza `<TableCardRow>` em vez de `<TableRow>`:

\`\`\`tsx
import { useEffect, useState, useRef } from "react";

function ResponsiveTable({ rows, columns, cardBreakpoint = 768 }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCard, setIsCard] = useState(false);

  useEffect(() => {
    if (!containerRef.current || cardBreakpoint === false) return;
    const obs = new ResizeObserver(([entry]) => {
      setIsCard(entry.contentRect.width < cardBreakpoint);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [cardBreakpoint]);

  return (
    <div ref={containerRef}>
      <Table cardBreakpoint={cardBreakpoint}>
        {!isCard && (
          <TableHead>
            {columns.map((col) => <TableHeadCell key={col.field}>{col.headerName}</TableHeadCell>)}
          </TableHead>
        )}
        <TableBody>
          {rows.map((row) =>
            isCard ? (
              <TableCardRow
                key={row.id}
                header={<strong>{row.name}</strong>}
                items={columns.filter((c) => c.field !== "name").map((c) => ({
                  label: c.headerName, value: row[c.field],
                }))}
              />
            ) : (
              <TableRow key={row.id}>
                {columns.map((col) => (
                  <TableCell key={col.field} label={col.headerName}>{row[col.field]}</TableCell>
                ))}
              </TableRow>
            ),
          )}
        </TableBody>
      </Table>
    </div>
  );
}
\`\`\`

> No `<DataTable>` (passo 2 do design), essa lógica fica encapsulada — o consumer não precisa fazer manualmente.

## Densidades

| Density | Row min-h | Padding y cell |
|---------|-----------|----------------|
| compact | form-sm (32px) | pad-sm (6px) |
| standard (default) | form-lg (40px) | pad-lg (12px) |
| comfortable | form-xl (44px) | pad-2xl (16px) |

## Tokens consumidos

- `bg-bg-table`, `bg-bg-table-head`, `bg-bg-table-row-hover`
- `bg-bg-table-row-selected`, `bg-bg-table-row-selected-hover` (novos — gate aprovado em 2026-05-12)
- `border-border-table`
- `text-fg-default`, `text-fg-muted`
- `rounded-radius-xl`, `shadow-sh-sm`

## ARIA

- `<Table>` → `role="grid"`
- `<TableHead>`, `<TableBody>` → `role="rowgroup"`
- `<TableRow>` → `role="row"`, `aria-selected`, `data-state="selected"`
- `<TableHeadCell>` → `role="columnheader"`, `aria-sort`
- `<TableCell>` → `role="gridcell"`
- `<TableCardRow>` → `role="article"`
```

- [ ] **Step 9.4: Checkpoint**

Estado: tudo exportado, USAGE.md cobre os 5 cenários (basic, pin, resize, sort, card). Próximo: showcase.

---

## Task 10: Showcase preview — `TableDoc.tsx`

**Files:**
- Create: `src/preview/pages/TableDoc.tsx`
- Modify: registrar no router do preview (vai descobrir qual arquivo na Task 10.1)

- [ ] **Step 10.1: Descobrir como o preview registra novas pages**

Procurar onde `TableToolbarDoc` é importado/registrado:

```bash
grep -r "TableToolbarDoc" "c:/Users/sergi/OneDrive/Área de Trabalho/igreen-crm-design/Modelo/src" --include="*.tsx" -l
```

Abrir o arquivo que aparecer (provavelmente `App.tsx` ou um `router.tsx`) e identificar o padrão de registro (rota + label).

- [ ] **Step 10.2: Criar `src/preview/pages/TableDoc.tsx`**

```tsx
import { useMemo, useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCardRow,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  useColumnWidths,
  type SortDirection,
  type TableDensity,
} from "@/components/ui/Table";
import { Badge } from "@/components/shadcn/badge";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Button } from "@/components/ui/Button/button";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
};

const SEED_USERS: User[] = [
  { id: 1, name: "Ana Souza",     email: "ana@igreen.com",     role: "Admin",    status: "active" },
  { id: 2, name: "Bruno Lima",    email: "bruno@igreen.com",   role: "Manager",  status: "active" },
  { id: 3, name: "Carla Mendes",  email: "carla@igreen.com",   role: "Analyst",  status: "pending" },
  { id: 4, name: "Diego Rocha",   email: "diego@igreen.com",   role: "Analyst",  status: "inactive" },
  { id: 5, name: "Eduarda Lima",  email: "eduarda@igreen.com", role: "Admin",    status: "active" },
  { id: 6, name: "Felipe Costa",  email: "felipe@igreen.com",  role: "Manager",  status: "active" },
  { id: 7, name: "Giovana Reis",  email: "giovana@igreen.com", role: "Analyst",  status: "active" },
  { id: 8, name: "Henrique Sá",   email: "henrique@igreen.com", role: "Viewer",  status: "pending" },
];

const statusColor: Record<User["status"], "success" | "warning" | "neutral"> = {
  active: "success",
  pending: "warning",
  inactive: "neutral",
};

export default function TableDoc() {
  return (
    <div className="flex flex-col gap-gp-3xl p-pad-page-base">
      <header className="flex flex-col gap-gp-md">
        <h1 className="text-heading-md text-fg-strong">Table</h1>
        <p className="text-paragraph-md text-fg-muted">
          Primitivo de render em divs. API controlada. Para tabelas feature-completas use <code>&lt;DataTable&gt;</code>.
        </p>
      </header>

      <Section title="Basic — densidades">
        <DensityExample />
      </Section>

      <Section title="Sticky header + scroll vertical">
        <StickyExample />
      </Section>

      <Section title="Pin left/right + sort + resize">
        <PinSortResizeExample />
      </Section>

      <Section title="Selected/hover/clickable row">
        <SelectionExample />
      </Section>

      <Section title="Card mode (responsive)">
        <CardModeExample />
      </Section>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-gp-lg">
      <h2 className="text-title-md text-fg-strong">{title}</h2>
      <div>{children}</div>
    </section>
  );
}

/* ── Example 1: density ──────────────────────────────────────────── */

function DensityExample() {
  const [density, setDensity] = useState<TableDensity>("standard");
  const columns = [
    { field: "name",   headerName: "Nome",   width: 200 },
    { field: "email",  headerName: "Email",  width: 240 },
    { field: "role",   headerName: "Cargo",  width: 120 },
    { field: "status", headerName: "Status", width: 120 },
  ];
  const { widths } = useColumnWidths(columns);

  return (
    <div className="flex flex-col gap-gp-md">
      <div className="flex gap-gp-md">
        {(["compact", "standard", "comfortable"] as const).map((d) => (
          <Button
            key={d}
            size="xs"
            variant={density === d ? "filled" : "outline"}
            color={density === d ? "primary" : "secondary"}
            onClick={() => setDensity(d)}
          >
            {d}
          </Button>
        ))}
      </div>

      <Table density={density} ariaLabel="Usuários (density example)">
        <TableHead>
          {columns.map((c) => (
            <TableHeadCell key={c.field} width={widths[c.field]}>
              {c.headerName}
            </TableHeadCell>
          ))}
        </TableHead>
        <TableBody>
          {SEED_USERS.slice(0, 4).map((row) => (
            <TableRow key={row.id}>
              <TableCell width={widths.name} label="Nome">{row.name}</TableCell>
              <TableCell width={widths.email} label="Email">{row.email}</TableCell>
              <TableCell width={widths.role} label="Cargo">{row.role}</TableCell>
              <TableCell width={widths.status} label="Status">
                <Badge color={statusColor[row.status]} variant="soft" size="sm">{row.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ── Example 2: sticky head ──────────────────────────────────────── */

function StickyExample() {
  const columns = [
    { field: "name",  headerName: "Nome",  width: 200 },
    { field: "email", headerName: "Email", width: 240 },
    { field: "role",  headerName: "Cargo", width: 120 },
  ];
  const { widths } = useColumnWidths(columns);
  const bigRows = useMemo(
    () => Array.from({ length: 40 }, (_, i) => SEED_USERS[i % SEED_USERS.length]),
    [],
  );

  return (
    <div style={{ height: 320 }}>
      <Table ariaLabel="Sticky example">
        <TableHead>
          {columns.map((c) => (
            <TableHeadCell key={c.field} width={widths[c.field]}>
              {c.headerName}
            </TableHeadCell>
          ))}
        </TableHead>
        <TableBody>
          {bigRows.map((row, i) => (
            <TableRow key={`${row.id}-${i}`}>
              <TableCell width={widths.name}>{row.name}</TableCell>
              <TableCell width={widths.email}>{row.email}</TableCell>
              <TableCell width={widths.role}>{row.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ── Example 3: pin + sort + resize ─────────────────────────────── */

function PinSortResizeExample() {
  const initialCols = useMemo(
    () => [
      { field: "select", headerName: "",       width: 48,  pinned: "left" as const,  resizable: false, sortable: false },
      { field: "name",   headerName: "Nome",   width: 200, pinned: "left" as const,  resizable: true,  sortable: true },
      { field: "email",  headerName: "Email",  width: 240,                            resizable: true,  sortable: true },
      { field: "role",   headerName: "Cargo",  width: 140,                            resizable: true,  sortable: true },
      { field: "status", headerName: "Status", width: 120,                            resizable: true,  sortable: true },
      { field: "actions", headerName: "",      width: 60,  pinned: "right" as const, resizable: false, sortable: false },
    ],
    [],
  );

  const [widthMap, setWidthMap] = useState<Record<string, number>>({});
  const cols = useMemo(
    () => initialCols.map((c) => ({ ...c, width: widthMap[c.field] ?? c.width })),
    [initialCols, widthMap],
  );
  const { widths, offsets } = useColumnWidths(cols);

  const [sort, setSort] = useState<{ field: string; dir: SortDirection }>({ field: "", dir: null });
  const onSort = (field: string) => {
    setSort((prev) => {
      if (prev.field !== field) return { field, dir: "asc" };
      if (prev.dir === "asc") return { field, dir: "desc" };
      return { field: "", dir: null };
    });
  };

  return (
    <Table ariaLabel="Pin + sort + resize example">
      <TableHead>
        {cols.map((c) => (
          <TableHeadCell
            key={c.field}
            width={widths[c.field]}
            pinned={c.pinned}
            pinOffset={offsets[c.field]}
            sortable={c.sortable}
            sortDirection={sort.field === c.field ? sort.dir : null}
            onSortClick={() => onSort(c.field)}
            resizable={c.resizable}
            onResize={(w) => setWidthMap((m) => ({ ...m, [c.field]: w }))}
          >
            {c.headerName}
          </TableHeadCell>
        ))}
      </TableHead>
      <TableBody>
        {SEED_USERS.map((row) => (
          <TableRow key={row.id}>
            <TableCell width={widths.select} pinned="left" pinOffset={offsets.select}>
              <Checkbox aria-label={`Selecionar ${row.name}`} />
            </TableCell>
            <TableCell width={widths.name} pinned="left" pinOffset={offsets.name} ellipsis>{row.name}</TableCell>
            <TableCell width={widths.email} ellipsis>{row.email}</TableCell>
            <TableCell width={widths.role}>{row.role}</TableCell>
            <TableCell width={widths.status}>
              <Badge color={statusColor[row.status]} variant="soft" size="sm">{row.status}</Badge>
            </TableCell>
            <TableCell width={widths.actions} pinned="right" pinOffset={offsets.actions} align="center">
              <Button size="icon-xs" variant="ghost" color="secondary" aria-label="Mais">
                <MoreVertical />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/* ── Example 4: selected / hover / clickable ────────────────────── */

function SelectionExample() {
  const [selected, setSelected] = useState<Set<number>>(new Set([2, 5]));
  const columns = [
    { field: "select", headerName: "",     width: 48 },
    { field: "name",   headerName: "Nome", width: 200 },
    { field: "email",  headerName: "Email", width: 240 },
  ];
  const { widths } = useColumnWidths(columns);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <Table ariaLabel="Selection example">
      <TableHead>
        {columns.map((c) => (
          <TableHeadCell key={c.field} width={widths[c.field]}>{c.headerName}</TableHeadCell>
        ))}
      </TableHead>
      <TableBody>
        {SEED_USERS.slice(0, 6).map((row) => (
          <TableRow
            key={row.id}
            selected={selected.has(row.id)}
            clickable
            onClick={() => toggle(row.id)}
          >
            <TableCell width={widths.select} align="center">
              <Checkbox
                checked={selected.has(row.id)}
                aria-label={`Selecionar ${row.name}`}
                onClick={(e) => e.stopPropagation()}
                onCheckedChange={() => toggle(row.id)}
              />
            </TableCell>
            <TableCell width={widths.name}>{row.name}</TableCell>
            <TableCell width={widths.email}>{row.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/* ── Example 5: card mode ───────────────────────────────────────── */

function CardModeExample() {
  return (
    <div className="max-w-[480px]">
      <p className="text-paragraph-sm text-fg-muted mb-pad-md">
        Container limitado a 480px — abaixo do breakpoint 768, o consumer escolhe renderizar via <code>TableCardRow</code>.
      </p>
      <Table cardBreakpoint={768} ariaLabel="Card mode example">
        <TableBody>
          {SEED_USERS.slice(0, 4).map((row) => (
            <TableCardRow
              key={row.id}
              header={
                <>
                  <Checkbox aria-label={`Selecionar ${row.name}`} />
                  <strong className="text-paragraph-md text-fg-strong">{row.name}</strong>
                </>
              }
              headerActions={
                <Button size="icon-xs" variant="ghost" color="secondary" aria-label="Editar">
                  <Pencil />
                </Button>
              }
              items={[
                { label: "Email", value: row.email },
                { label: "Cargo", value: row.role },
                {
                  label: "Status",
                  value: <Badge color={statusColor[row.status]} variant="soft" size="sm">{row.status}</Badge>,
                },
              ]}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

- [ ] **Step 10.3: Registrar no router/menu do preview**

Modificar o arquivo descoberto no 10.1 (provavelmente `App.tsx`). Pattern típico:

```tsx
// import
import TableDoc from "./pages/TableDoc";

// no array/map de rotas, adicionar entry seguindo o padrão existente
// ex: { path: "/table", label: "Table", component: TableDoc, group: "Components" }
```

> Se o padrão for diferente (router, switch, etc), seguir o padrão local exato — replicar como `TableToolbarDoc` é registrado.

- [ ] **Step 10.4: Validar visualmente no preview**

```bash
npm run dev
```

Abrir `http://localhost:3100/table` (ou navegar pelo menu do preview até "Table").

Checklist visual:
- [ ] Section "Basic — densidades": 3 botões trocam densidade; row fica menor em compact, maior em comfortable
- [ ] Section "Sticky": ao scrollar verticalmente no container de 320px, header continua visível no topo
- [ ] Section "Pin + sort + resize":
  - Colunas "select" e "Nome" ficam fixas à esquerda durante scroll horizontal
  - Coluna "actions" fica fixa à direita
  - Clicar nos headers "Nome"/"Email"/"Cargo"/"Status" cicla asc → desc → none
  - Hover no edge direito de "Email"/"Role"/"Status" mostra cursor `col-resize`; arrastar muda largura ao vivo
- [ ] Section "Selected/hover/clickable":
  - Linhas 2 e 5 começam selecionadas com bg brand-tinted
  - Hover em linha selecionada usa `bg-table-row-selected-hover`
  - Hover em linha não-selecionada usa `bg-table-row-hover`
  - Click na linha toggle a seleção (sem precisar clicar no checkbox)
- [ ] Section "Card mode": 4 cards verticais com header (checkbox + nome) + body (label:valor)
- [ ] Dark mode (toggle theme): todas as sections continuam legíveis; rows mantêm bg sólido (sem vazamento entre sticky cols)

Se algum item falhar, **anotar** e tratar como subtask antes do checkpoint.

- [ ] **Step 10.5: Checkpoint**

Estado: showcase rodando em `/table`. Todas as features validadas visualmente em light e dark mode.

---

## Task 11: Housekeeping — inventário + pipeline-state

**Files:**
- Modify: `.ai/context/components/inventory.md`
- Modify: `.ai/status/pipeline-state.md`

- [ ] **Step 11.1: Atualizar `.ai/context/components/inventory.md`**

Encontrar a seção `## Componentes — ui/ (iGreen puro)` e adicionar linha (logo após Button):

```markdown
| Table | `ui/Table/table.styles.ts` | `src/components/ui/Table/` | ✅ implementado |
```

Encontrar a seção `## Variantes e API por componente` e adicionar bloco no fim:

```markdown
### Table (ui/)
\`\`\`
Componentes:
  Table          → root grid container (role="grid")
  TableHead      → sticky header rowgroup
  TableHeadCell  → columnheader com sort + resize
  TableBody      → rowgroup
  TableRow       → row com selected/clickable
  TableCell      → gridcell com width/pin/align/ellipsis
  TableCardRow   → card mode (consumer escolhe renderizar)

Variants:
  density:  compact (32px) | standard (40px) | comfortable (44px)
  sticky:   true (default) | false
  selected: true | false
  pinned:   left | right
  align:    left | center | right
  sortable: true | false
  sortDirection: asc | desc | null

Hooks expostos:
  useColumnWidths(columns)  → { widths, offsets, totalPinLeft, totalPinRight }
  useColumnResize(params)    → { onMouseDown, isDragging }
\`\`\`
- Fonte de verdade: `src/components/ui/Table/table.styles.ts`
```

Encontrar a seção `## Componentes planejados` e **remover** se houver entry "Table" ou ajustar.

- [ ] **Step 11.2: Adicionar entry em `.ai/status/pipeline-state.md`**

No topo (após o comentário `<!-- NOVA ENTRADA AQUI -->`), adicionar:

```markdown
### [YYYY-MM-DD] | DS DEV | Table (primitivo) | CONCLUÍDO
- Input: spec docs/superpowers/specs/2026-05-12-data-table-design.md (F1+F2)
- Output:
  - 6 subcomponentes: Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell
  - 1 card variant: TableCardRow
  - 2 hooks puros: useColumnWidths, useColumnResize
  - Showcase em /table com 5 sections (densidade, sticky, pin+sort+resize, selection, card mode)
- Decisões:
  - Card mode é componente irmão (TableCardRow), não auto-switch — consumer decide via ResizeObserver
  - Resize via listeners no document (não no handle) pra suportar drag rápido
  - Sticky col bg = `bg-inherit` na cell + `bg-bg-table-head` no head → herança limpa
- Assumption: API "lego" controlada é mais flexível que <Table columns rows /> agregado — confirmação virá no uso pelo DataTable (passo 2)
- Lições novas: nenhuma (ou registrar se aparecer durante implementação)
- Pendente: DS Reviewer
```

(Substituir `YYYY-MM-DD` pela data real do dia.)

- [ ] **Step 11.3: Checkpoint**

Estado: docs atualizadas. Próximo passo é DS Reviewer (fora do escopo deste plano — invocação manual).

---

## Task 12: Handoff pro DS Reviewer

**Files:** nenhum

- [ ] **Step 12.1: Sinalizar IMPL_PRONTA pro DS Reviewer**

Mensagem ao usuário:

> Table primitivo implementado. Showcase rodando em `/table`. IMPL_PRONTA. Posso invocar o DS Reviewer (skill `ds-reviewer`) para revisão estrutural + critique genuína, ou você prefere revisar visualmente primeiro?

- [ ] **Step 12.2: Se aprovado pelo reviewer, marcar APROVADO no pipeline-state**

Substituir a entrada CONCLUÍDO da Task 11.2 por APROVADO (ou adicionar nova entrada com a aprovação).

- [ ] **Step 12.3: Plano F1+F2 encerrado**

Próximo plano: F3+F4 do `<DataTable>` (esqueleto + client mode + toolbar plugada). Será escrito separadamente.

---

## Self-Review do plano

### Spec coverage check

Verifiquei cada item da spec contra as tasks:

| Spec | Coberto em |
|---|---|
| `<Table>` API "lego" (§5.1) | Tasks 2, 3, 4 |
| Densidade compact/standard/comfortable | Task 1 (styles) + Task 10 (showcase) |
| Sticky head | Task 1 (variant) + Task 2 (default true) |
| Hover/selected visual | Task 1 (variant) + Task 3 |
| Pin left/right + sticky offsets | Task 5 (hook) + Tasks 3,4,7 (integração) |
| Resize handle | Task 6 (hook) + Task 7 (UI) |
| Sort indicator + aria-sort | Task 4 |
| Cell align + ellipsis | Tasks 1, 3 |
| Card mode | Task 8 (componente) + Task 10 (USAGE explicando que consumer decide) |
| ARIA roles | Tasks 2, 3, 4, 8 |
| 2 tokens novos consumidos | Task 1 (styles), Task 9 (USAGE), pré-requisito tokens:tw4 |
| Tipos públicos exportados | Tasks 1, 9 |
| Showcase no preview | Task 10 |
| Atualizar inventory + pipeline-state | Task 11 |
| Handoff DS Reviewer | Task 12 |

**Gaps:** nenhum identificado.

### Type consistency

- `TableProps`, `TableHeadProps`, etc — todos referenciados nos JSX correspondentes ✓
- `useColumnWidths` retorna `widths`/`offsets`/`totalPinLeft`/`totalPinRight` — showcase consome `widths` e `offsets` (totais não usados na v1, OK) ✓
- `useColumnResize` retorna `onMouseDown`/`isDragging` — TableHeadCell consome `onMouseDown` ✓
- `SortDirection` (`asc`|`desc`|`null`) consistente em todos os arquivos ✓
- `ColumnPinned` (`left`|`right`|`undefined`) consistente ✓
- `TableCardRow` props `header`/`headerActions`/`items` — showcase consome ✓

### Placeholder scan

Procurei TBD, TODO, "fill in", "etc" nas tasks. Tudo limpo. Em todo step de código, código completo está presente. Não há "similar to Task N" sem repetir.

### Escopo

Plano cobre F1+F2 da spec. F3-F8 (`<DataTable>`) ficam fora — viram plano separado depois. ✓
