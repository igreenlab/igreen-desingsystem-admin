import { Fragment, useMemo, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { Inbox, MoreHorizontal, Plus } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Button } from "../Button";
import { Checkbox } from "../../shadcn/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../shadcn/dropdown-menu";
import * as s from "./kanban.styles";
import {
  droppableIdForCard,
  droppableIdForColumn,
  useKanbanDnD,
} from "./hooks/use-kanban-dnd";
import type {
  KanbanCardData,
  KanbanColumn,
  KanbanMenuItem,
  KanbanProps,
  KanbanRenderCardParams,
} from "./kanban.types";

/**
 * Kanban — board com colunas verticais (estágios) e cards distribuídos.
 *
 * **Dumb primitive**: recebe `columns` + `cards` e callbacks de interação.
 * Não gerencia state de seleção / detail panel / menus / cards — tudo controlado.
 *
 * **Features**:
 * - Layout default do card (avatar/title/subtitle/description/chip/value/footer)
 *   OU custom via `renderCard` (consumer fornece o miolo, primitive controla
 *   wrapper/focus/checkbox/menu positioning).
 * - Menus padronizados via `getCardMenuItems` / `getColumnMenuItems` (items →
 *   `<DropdownMenu>` automático) OU callbacks manuais (`onCardMenu` / `onColumnMenu`).
 * - DnD entre colunas via `enableDnD` + `onCardMove`. Constraints por coluna
 *   (`canReceiveDrop`, `canDragFrom`). Primitive **não faz revert** automático;
 *   consumer commita atualizando `cards` props.
 *
 * Visual alinhado com TblKanban do sandbox `/design-and-table-v2`, consumindo
 * tokens DS estritamente.
 */
export function Kanban({
  columns,
  cards,
  selectedIds,
  onToggleSelect,
  openCardId,
  onOpenCard,
  onAddCard,
  onColumnMenu,
  getColumnMenuItems,
  onAddInFooter,
  hideFooterAdd = false,
  onCardMenu,
  getCardMenuItems,
  renderCard,
  enableDnD = false,
  onCardMove,
  emptyLabel = "Nenhum item neste estágio",
  addLabel = "Adicionar",
  className,
}: KanbanProps) {
  // Lookup `cardId → columnId` pro hook resolver drop em cima de card específico.
  const cardColumnLookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of cards) map.set(c.id, c.columnId);
    return map;
  }, [cards]);

  const {
    sensors,
    activeCardId,
    fromColumnId,
    overColumnId,
    overCardId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useKanbanDnD({ enabled: enableDnD, columns, cardColumnLookup, onCardMove });

  const activeCard = activeCardId ? cards.find((c) => c.id === activeCardId) ?? null : null;

  const boardContent = (
    <div className={s.board()}>
      {columns.map((col) => {
        const colCards = cards.filter((c) => c.columnId === col.id);
        const count = col.count ?? colCards.length;
        return (
          <KanbanColumnInner
            key={col.id}
            column={col}
            count={count}
            cards={colCards}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
            openCardId={openCardId}
            onOpenCard={onOpenCard}
            onAddCard={onAddCard}
            onColumnMenu={onColumnMenu}
            getColumnMenuItems={getColumnMenuItems}
            onAddInFooter={onAddInFooter}
            hideFooterAdd={hideFooterAdd}
            onCardMenu={onCardMenu}
            getCardMenuItems={getCardMenuItems}
            renderCard={renderCard}
            emptyLabel={emptyLabel}
            addLabel={addLabel}
            enableDnD={enableDnD}
            activeCardId={activeCardId}
            fromColumnId={fromColumnId}
            overColumnId={overColumnId}
            overCardId={overCardId}
          />
        );
      })}
    </div>
  );

  return (
    <div className={cn(s.root(), className)} role="region" aria-label="Quadro Kanban">
      {enableDnD ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {boardContent}
          <DragOverlay dropAnimation={null}>
            {activeCard && (
              <div className={cn(s.card({ selected: false, open: false }), "rotate-2 opacity-90 shadow-sh-lg")}>
                <KanbanCardContent
                  card={activeCard}
                  selected={false}
                  open={false}
                  renderCard={renderCard}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        boardContent
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * KanbanColumnInner — uma coluna do board
 * ───────────────────────────────────────────────────────────── */

type KanbanColumnInnerProps = {
  column: KanbanColumn;
  count: number;
  cards: KanbanCardData[];
  enableDnD: boolean;
  activeCardId: string | null;
  fromColumnId: string | null;
  overColumnId: string | null;
  overCardId: string | null;
} & Pick<
  KanbanProps,
  | "selectedIds"
  | "onToggleSelect"
  | "openCardId"
  | "onOpenCard"
  | "onAddCard"
  | "onColumnMenu"
  | "getColumnMenuItems"
  | "onAddInFooter"
  | "hideFooterAdd"
  | "onCardMenu"
  | "getCardMenuItems"
  | "renderCard"
  | "emptyLabel"
  | "addLabel"
>;

function KanbanColumnInner({
  column,
  count,
  cards,
  selectedIds,
  onToggleSelect,
  openCardId,
  onOpenCard,
  onAddCard,
  onColumnMenu,
  getColumnMenuItems,
  onAddInFooter,
  hideFooterAdd,
  onCardMenu,
  getCardMenuItems,
  renderCard,
  emptyLabel,
  addLabel,
  enableDnD,
  activeCardId,
  fromColumnId,
  overColumnId,
  overCardId,
}: KanbanColumnInnerProps) {
  const canReceive = column.canReceiveDrop !== false;
  // Coluna body é droppable pra capturar drop em área vazia (fora de qualquer
  // card específico). Registrada mesmo quando inválida — captura `over` pra
  // cursor not-allowed; drop em si é bloqueado no hook via canReceiveDrop.
  const { setNodeRef } = useDroppable({
    id: droppableIdForColumn(column.id),
    disabled: !enableDnD,
  });

  const isDragInProgress = activeCardId !== null && fromColumnId !== column.id;
  const isOverColumn = overColumnId === column.id;

  // Feedback visual em 3 estados:
  // - Coluna inválida, drag em progresso: sempre dim (atenuada — está "fora do jogo")
  // - Coluna inválida + over: extra cursor not-allowed
  // - Coluna válida + over: highlight outline brand + placeholder localizado
  const showInvalidDim = enableDnD && isDragInProgress && !canReceive;
  const showInvalidOver = showInvalidDim && isOverColumn;
  const showAsTarget = enableDnD && isDragInProgress && isOverColumn && canReceive;

  // Posição do placeholder dentro da lista de cards:
  // - Se hover sobre card específico desta coluna → antes desse card
  // - Senão, se hover na área vazia da coluna válida → no fim
  const placeholderBeforeCardId =
    showAsTarget && overCardId && cards.some((c) => c.id === overCardId) ? overCardId : null;
  const showPlaceholderAtEnd = showAsTarget && !placeholderBeforeCardId;

  return (
    <section
      className={cn(
        s.column(),
        showInvalidDim && s.columnDropInvalidDimmed(),
        showInvalidOver && s.columnDropInvalidOver(),
        showAsTarget && s.columnDropTarget(),
      )}
      data-column-id={column.id}
    >
      {/* HEAD: dot + título + badge ←—— spacer ——→ + ⋯ */}
      <header className={s.columnHead()}>
        <span
          className={s.columnDot()}
          style={{ background: column.dotColor ?? "var(--color-fg-muted)" }}
          aria-hidden
        />
        <h3 className={s.columnTitle()}>{column.label}</h3>
        <span className={s.columnCount()}>{count}</span>

        <div className={s.columnActionsSpacer()}>
          {onAddCard && (
            <Button
              variant="ghost"
              color="secondary"
              size="icon-2xs"
              aria-label={`Adicionar em ${column.label}`}
              title="Adicionar"
              onClick={() => onAddCard(column.id)}
            >
              <Plus />
            </Button>
          )}
          {renderColumnMenu({ column, getColumnMenuItems, onColumnMenu })}
        </div>
      </header>

      {/* BODY: lista de cards (ou empty state) — droppable */}
      <div ref={setNodeRef} className={s.columnBody()}>
        {cards.length === 0 && !showAsTarget ? (
          <div className={s.columnEmpty()}>
            <Inbox className={s.columnEmptyIcon()} aria-hidden />
            <span>{emptyLabel}</span>
          </div>
        ) : (
          <>
            {cards.map((card) => (
              <Fragment key={card.id}>
                {/* Placeholder antes deste card se for o card hovered durante drag */}
                {placeholderBeforeCardId === card.id && <DropPlaceholder />}
                <KanbanCardOuter
                  card={card}
                  selected={selectedIds?.has(card.id) ?? false}
                  open={openCardId === card.id}
                  showCheckbox={Boolean(onToggleSelect)}
                  onToggleSelect={onToggleSelect}
                  onOpenCard={onOpenCard}
                  onCardMenu={onCardMenu}
                  getCardMenuItems={getCardMenuItems}
                  renderCard={renderCard}
                  enableDnD={enableDnD && column.canDragFrom !== false}
                  isBeingDragged={activeCardId === card.id}
                />
              </Fragment>
            ))}
            {/* Placeholder no fim quando hover em área vazia da coluna válida */}
            {showPlaceholderAtEnd && <DropPlaceholder />}
          </>
        )}
      </div>

      {/* FOOTER: botão "+ Adicionar" dashed centered */}
      {!hideFooterAdd && onAddInFooter && (
        <button
          type="button"
          className={s.columnAdd()}
          onClick={() => onAddInFooter(column.id)}
        >
          <Plus size={14} strokeWidth={2} /> {addLabel}
        </button>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Column menu trigger — auto via items OU callback manual
 * ───────────────────────────────────────────────────────────── */

function renderColumnMenu({
  column,
  getColumnMenuItems,
  onColumnMenu,
}: {
  column: KanbanColumn;
  getColumnMenuItems?: (column: KanbanColumn) => KanbanMenuItem[];
  onColumnMenu?: (columnId: string, anchor: HTMLElement) => void;
}): ReactNode {
  if (getColumnMenuItems) {
    const items = getColumnMenuItems(column);
    if (items.length === 0) return null;
    return (
      <KanbanAutoMenu
        items={items}
        ariaLabel={`Menu de ${column.label}`}
        title="Mais ações"
      />
    );
  }
  if (onColumnMenu) {
    return (
      <Button
        variant="ghost"
        color="secondary"
        size="icon-2xs"
        aria-label={`Menu de ${column.label}`}
        title="Mais ações"
        onClick={(e) => onColumnMenu(column.id, e.currentTarget)}
      >
        <MoreHorizontal />
      </Button>
    );
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────
 * DropPlaceholder — indicador visual sutil de posição de inserção
 * ───────────────────────────────────────────────────────────── */

function DropPlaceholder() {
  return (
    <div className={s.dropPlaceholder()} aria-hidden>
      <Plus />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * KanbanCardOuter — wrapper draggable + droppable + estrutura visual
 * ───────────────────────────────────────────────────────────── */

type KanbanCardOuterProps = {
  card: KanbanCardData;
  selected: boolean;
  open: boolean;
  showCheckbox: boolean;
  enableDnD: boolean;
  isBeingDragged: boolean;
  onToggleSelect?: (cardId: string) => void;
  onOpenCard?: (cardId: string) => void;
  onCardMenu?: (cardId: string, anchor: HTMLElement) => void;
  getCardMenuItems?: (card: KanbanCardData) => KanbanMenuItem[];
  renderCard?: (params: KanbanRenderCardParams) => ReactNode;
};

function KanbanCardOuter({
  card,
  selected,
  open,
  showCheckbox,
  enableDnD,
  isBeingDragged,
  onToggleSelect,
  onOpenCard,
  onCardMenu,
  getCardMenuItems,
  renderCard,
}: KanbanCardOuterProps) {
  const {
    setNodeRef: setDraggableRef,
    attributes,
    listeners,
  } = useDraggable({
    id: card.id,
    disabled: !enableDnD,
    data: { cardId: card.id, fromColumnId: card.columnId },
  });

  // Card também é droppable — necessário pra hook saber em qual card específico
  // o cursor está sobre durante drag (placeholder localizado antes deste card).
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: droppableIdForCard(card.id),
    disabled: !enableDnD,
  });

  // Combina os 2 refs do dnd-kit num único callback ref aplicável ao DOM node
  const setNodeRef = (node: HTMLElement | null) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };

  // NOTA: não aplicamos `transform` no card source — o `<DragOverlay>` no root
  // renderiza um clone flutuante seguindo o cursor. O source permanece no lugar
  // (com opacity baixa via `cardDragging`), evitando scroll horizontal indesejado
  // na coluna quando o card seria translatado pra fora do overflow-y-auto.

  const handleClick = () => onOpenCard?.(card.id);
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenCard?.(card.id);
    }
  };
  const handleStop = (e: MouseEvent) => e.stopPropagation();

  // `useDraggable.attributes` já fornece role + tabIndex próprios — quando
  // DnD está ativo, usamos esses; quando inativo, fornecemos os nossos pra
  // manter o card focável e operável por teclado (Enter/Space abre detalhe).
  const a11yProps = enableDnD
    ? { ...attributes, ...listeners }
    : onOpenCard
      ? { role: "button" as const, tabIndex: 0 }
      : {};

  return (
    <article
      ref={enableDnD ? setNodeRef : undefined}
      className={cn(
        s.card({ selected, open, reserveCheck: showCheckbox }),
        isBeingDragged && s.cardDragging(),
        enableDnD && "cursor-grab active:cursor-grabbing",
      )}
      onClick={onOpenCard ? handleClick : undefined}
      onKeyDown={onOpenCard ? handleKey : undefined}
      data-card-id={card.id}
      {...a11yProps}
    >
      {showCheckbox && (
        <div className={s.cardCheck({ selected })} onClick={handleStop} onPointerDown={handleStop}>
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect?.(card.id)}
            aria-label="Selecionar card"
          />
        </div>
      )}

      {renderCardMenu({ card, getCardMenuItems, onCardMenu })}

      <KanbanCardContent card={card} selected={selected} open={open} renderCard={renderCard} />
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
 * KanbanCardContent — miolo do card (default ou custom)
 * ───────────────────────────────────────────────────────────── */

function KanbanCardContent({
  card,
  selected,
  open,
  renderCard,
}: {
  card: KanbanCardData;
  selected: boolean;
  open: boolean;
  renderCard?: (params: KanbanRenderCardParams) => ReactNode;
}) {
  if (renderCard) {
    return <Fragment>{renderCard({ card, selected, open })}</Fragment>;
  }

  return (
    <Fragment>
      {/* HEAD: avatar + título/subtítulo */}
      {(card.avatar || card.title || card.subtitle) && (
        <header className={s.cardHead()}>
          {card.avatar}
          <div className={s.cardTitleWrap()}>
            {card.title && <div className={s.cardTitle()}>{card.title}</div>}
            {card.subtitle && <div className={s.cardSubtitle()}>{card.subtitle}</div>}
          </div>
        </header>
      )}

      {card.description && <p className={s.cardDesc()}>{card.description}</p>}

      {(card.chip || card.value) && (
        <div className={s.cardMeta()}>
          {card.chip ?? <span />}
          {card.value && <span className={s.cardValue()}>{card.value}</span>}
        </div>
      )}

      {(card.footerLeft || card.footerRight) && (
        <footer className={s.cardFoot()}>
          {card.footerLeft ?? <span />}
          {card.footerRight ?? <span />}
        </footer>
      )}
    </Fragment>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Card menu trigger — auto via items OU callback manual
 * ───────────────────────────────────────────────────────────── */

function renderCardMenu({
  card,
  getCardMenuItems,
  onCardMenu,
}: {
  card: KanbanCardData;
  getCardMenuItems?: (card: KanbanCardData) => KanbanMenuItem[];
  onCardMenu?: (cardId: string, anchor: HTMLElement) => void;
}): ReactNode {
  const handleStop = (e: MouseEvent) => e.stopPropagation();

  if (getCardMenuItems) {
    const items = getCardMenuItems(card);
    if (items.length === 0) return null;
    return (
      <div className={s.cardMenuSlot()} onClick={handleStop} onPointerDown={handleStop}>
        <KanbanAutoMenu items={items} ariaLabel="Ações do card" title="Ações" />
      </div>
    );
  }
  if (onCardMenu) {
    return (
      <div className={s.cardMenuSlot()} onClick={handleStop} onPointerDown={handleStop}>
        <Button
          variant="ghost"
          color="secondary"
          size="icon-2xs"
          aria-label="Ações do card"
          title="Ações"
          onClick={(e) => {
            e.stopPropagation();
            onCardMenu(card.id, e.currentTarget);
          }}
        >
          <MoreHorizontal />
        </Button>
      </div>
    );
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────
 * KanbanAutoMenu — renderiza items padronizados via DropdownMenu DS
 * ───────────────────────────────────────────────────────────── */

function KanbanAutoMenu({
  items,
  ariaLabel,
  title,
}: {
  items: KanbanMenuItem[];
  ariaLabel: string;
  title: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          color="secondary"
          size="icon-2xs"
          aria-label={ariaLabel}
          title={title}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4}>
        {items.map((item, idx) => {
          if (item.separator) {
            return <DropdownMenuSeparator key={`sep-${idx}`} />;
          }
          return (
            <DropdownMenuItem
              key={item.label ?? idx}
              variant={item.destructive ? "destructive" : "default"}
              disabled={item.disabled}
              onSelect={() => item.onClick?.()}
            >
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
