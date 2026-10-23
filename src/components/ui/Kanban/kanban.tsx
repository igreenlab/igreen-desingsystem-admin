import { Fragment, useMemo, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { ChevronRight, Inbox, MoreHorizontal, Plus } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/shadcn/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import * as s from "./kanban.styles";
import {
  droppableIdForCard,
  droppableIdForColumn,
  droppableIdForLane,
  useKanbanDnD,
} from "./hooks/use-kanban-dnd";
import type {
  KanbanCardData,
  KanbanColumn,
  KanbanGroup,
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
  groups,
  ungroupedLabel = "Sem grupo",
  expandedGroupIds,
  defaultExpandedGroupIds,
  onGroupToggle,
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

  const temRaias = Boolean(groups?.length);

  /* Ordem das raias = ordem de `groups`, com a sintetizada SEMPRE por último.
     O id da não-agrupada é um Symbol-like improvável de colidir com domínio. */
  const ID_SEM_GRUPO = "__kanban_sem_grupo__";
  const raias = useMemo(() => {
    if (!temRaias) return [];
    const base = (groups ?? []).map((g) => ({ grupo: g, sintetizada: false }));
    if (ungroupedLabel === null) return base;
    const conhecidos = new Set((groups ?? []).map((g) => g.id));
    const temSolto = cards.some(
      (c) => !c.groupId || !conhecidos.has(c.groupId),
    );
    if (!temSolto) return base;
    return [
      ...base,
      {
        grupo: { id: ID_SEM_GRUPO, label: ungroupedLabel },
        sintetizada: true,
      },
    ];
  }, [temRaias, groups, cards, ungroupedLabel]);

  /* Lookup `cardId → groupId` — o hook usa pra recusar drop em raia alheia.
     Card com groupId desconhecido cai na sintetizada, igual ao render. */
  const cardGroupLookup = useMemo(() => {
    if (!temRaias) return undefined;
    const conhecidos = new Set((groups ?? []).map((g) => g.id));
    const map = new Map<string, string>();
    for (const c of cards) {
      map.set(
        c.id,
        c.groupId && conhecidos.has(c.groupId) ? c.groupId : ID_SEM_GRUPO,
      );
    }
    return map;
  }, [temRaias, groups, cards]);

  /* Expansão: controlado por `expandedGroupIds`, senão estado próprio.
     Polaridade "expandido" — Set vazio já é "tudo recolhido", que é o default
     que a tela normalmente quer. */
  const [expandidasInternas, setExpandidasInternas] = useState<Set<string>>(
    () => defaultExpandedGroupIds ?? new Set<string>(),
  );
  const expandidas = expandedGroupIds ?? expandidasInternas;
  const alternaRaia = (groupId: string) => {
    if (!expandedGroupIds) {
      setExpandidasInternas((prev) => {
        const next = new Set(prev);
        if (next.has(groupId)) next.delete(groupId);
        else next.add(groupId);
        return next;
      });
    }
    onGroupToggle?.(groupId);
  };

  const {
    sensors,
    activeCardId,
    fromColumnId,
    overColumnId,
    overCardId,
    overGroupId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useKanbanDnD({
    enabled: enableDnD,
    columns,
    cardColumnLookup,
    cardGroupLookup,
    onCardMove,
  });

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
            overGroupId={overGroupId}
            raias={raias}
            idSemGrupo={ID_SEM_GRUPO}
            cardGroupLookup={cardGroupLookup}
            expandidas={expandidas}
            onToggleRaia={alternaRaia}
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
  overGroupId: string | null;
  /** Raias do board, já ordenadas (sintetizada por último). Vazio = board plano. */
  raias: { grupo: KanbanGroup; sintetizada: boolean }[];
  idSemGrupo: string;
  cardGroupLookup?: Map<string, string>;
  expandidas: Set<string>;
  onToggleRaia: (groupId: string) => void;
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
  overGroupId,
  raias,
  idSemGrupo,
  cardGroupLookup,
  expandidas,
  onToggleRaia,
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
        {raias.length > 0 ? (
          <KanbanLanes
            raias={raias}
            idSemGrupo={idSemGrupo}
            column={column}
            cards={cards}
            cardGroupLookup={cardGroupLookup}
            expandidas={expandidas}
            onToggleRaia={onToggleRaia}
            grupoArrastado={
              activeCardId ? cardGroupLookup?.get(activeCardId) ?? null : null
            }
            overGroupId={overGroupId}
            isOverColumn={isOverColumn}
            podeSoltar={enableDnD && isDragInProgress && canReceive}
            renderCardSlot={(card) => (
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
            )}
          />
        ) : cards.length === 0 && !showAsTarget ? (
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
 * KanbanLanes — o segundo eixo: raias dentro de UMA coluna
 *
 * Uma raia aparece quando o grupo tem card nesta coluna, OU quando é o grupo
 * do card sendo arrastado — é isso que faz o alvo existir numa coluna onde a
 * Epic ainda não tinha nada. Raia vazia fora de arrasto não renderiza: seria
 * ruído em toda coluna que não participa do grupo.
 * ───────────────────────────────────────────────────────────── */

type KanbanLanesProps = {
  raias: { grupo: KanbanGroup; sintetizada: boolean }[];
  idSemGrupo: string;
  column: KanbanColumn;
  cards: KanbanCardData[];
  cardGroupLookup?: Map<string, string>;
  expandidas: Set<string>;
  onToggleRaia: (groupId: string) => void;
  /** Grupo do card em arrasto — define qual raia pode receber. */
  grupoArrastado: string | null;
  overGroupId: string | null;
  isOverColumn: boolean;
  podeSoltar: boolean;
  renderCardSlot: (card: KanbanCardData) => ReactNode;
};

function KanbanLanes({
  raias,
  idSemGrupo,
  column,
  cards,
  cardGroupLookup,
  expandidas,
  onToggleRaia,
  grupoArrastado,
  overGroupId,
  isOverColumn,
  podeSoltar,
  renderCardSlot,
}: KanbanLanesProps) {
  const grupoDoCard = (c: KanbanCardData) =>
    cardGroupLookup?.get(c.id) ?? idSemGrupo;

  return (
    <>
      {raias.map(({ grupo }) => {
        const doGrupo = cards.filter((c) => grupoDoCard(c) === grupo.id);
        const ehAlvo = podeSoltar && grupoArrastado === grupo.id;

        // Sem card e sem ser o alvo do arrasto → a raia não existe aqui.
        if (doGrupo.length === 0 && !ehAlvo) return null;

        const aberta = expandidas.has(grupo.id);
        const destacada = ehAlvo && isOverColumn && overGroupId === grupo.id;

        return (
          <KanbanLane
            key={grupo.id}
            grupo={grupo}
            columnId={column.id}
            cards={doGrupo}
            aberta={aberta}
            destacada={destacada}
            mostraPlaceholder={destacada}
            habilitaDrop={ehAlvo}
            onToggle={() => onToggleRaia(grupo.id)}
            renderCardSlot={renderCardSlot}
          />
        );
      })}
    </>
  );
}

type KanbanLaneProps = {
  grupo: KanbanGroup;
  columnId: string;
  cards: KanbanCardData[];
  aberta: boolean;
  destacada: boolean;
  mostraPlaceholder: boolean;
  habilitaDrop: boolean;
  onToggle: () => void;
  renderCardSlot: (card: KanbanCardData) => ReactNode;
};

function KanbanLane({
  grupo,
  columnId,
  cards,
  aberta,
  destacada,
  mostraPlaceholder,
  habilitaDrop,
  onToggle,
  renderCardSlot,
}: KanbanLaneProps) {
  /* Droppable próprio da raia. Registrado só quando ela pode receber — assim o
     `closestCorners` nem considera raia alheia como candidata, e a recusa no
     `handleDragEnd` vira a segunda linha de defesa, não a primeira. */
  const { setNodeRef } = useDroppable({
    id: droppableIdForLane(columnId, grupo.id),
    disabled: !habilitaDrop,
  });

  const painelId = `lane-${columnId}-${grupo.id}`;

  return (
    <div ref={setNodeRef} className={s.lane({ dropTarget: destacada })}>
      <button
        type="button"
        className={s.laneHeader()}
        onClick={onToggle}
        aria-expanded={aberta}
        aria-controls={painelId}
      >
        <ChevronRight className={s.laneChevron({ open: aberta })} aria-hidden />
        <span className={s.laneTitle()}>{grupo.label}</span>
        {grupo.code && <span className={s.laneCode()}>{grupo.code}</span>}

        <span className={s.laneMeta()}>
          {grupo.progress && (
            <span className={s.laneProgress()}>
              {grupo.progress.done}/{grupo.progress.total}
            </span>
          )}
          {/* Contagem DESTA coluna — é o que diz onde o trabalho do grupo está. */}
          <span className={s.laneCount()}>{cards.length}</span>
        </span>
      </button>

      {grupo.actions && (
        <div className="px-pad-lg pb-pad-md -mt-pad-xs">{grupo.actions}</div>
      )}

      {/* Colapso animado. O conteúdo fica MONTADO (é o que permite animar a
          altura sem medir), então o fechado vai `inert`: sem isso o Tab entraria
          numa área de altura zero e o foco sumiria — o defeito que o painel
          colapsado do MenuSidebar tem. */}
      <div
        id={painelId}
        className={s.laneCollapse({ open: aberta })}
        inert={!aberta}
      >
        <div className="overflow-hidden">
          <div className={s.laneBody()}>
            {cards.map((card) => (
              <Fragment key={card.id}>{renderCardSlot(card)}</Fragment>
            ))}
            {mostraPlaceholder && <DropPlaceholder />}
          </div>
        </div>
      </div>
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

      {/* Aviso: linha própria abaixo do footer, separada por borda. Existe pra
          acrescentar um alerta sem ter que reconstruir os 8 slots via renderCard. */}
      {card.notice && <div className={s.cardNotice()}>{card.notice}</div>}
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
