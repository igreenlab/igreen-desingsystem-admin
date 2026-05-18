import { useCallback, useMemo, useState } from "react";
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { KanbanColumn } from "../kanban.types";

type UseKanbanDnDOptions = {
  enabled: boolean;
  columns: KanbanColumn[];
  /** Lookup `cardId → columnId` pra resolver drop em cima de card específico. */
  cardColumnLookup: Map<string, string>;
  onCardMove?: (cardId: string, from: string, to: string) => void | Promise<unknown>;
};

type DragStartData = {
  cardId: string;
  fromColumnId: string;
};

/** Prefixos pra distinguir tipo de droppable no `over.id`. */
const COL_PREFIX = "column:";
const CARD_PREFIX = "card:";

export const droppableIdForColumn = (id: string) => `${COL_PREFIX}${id}`;
export const droppableIdForCard = (id: string) => `${CARD_PREFIX}${id}`;

/**
 * Encapsula sensors + handlers do `@dnd-kit/core` pro Kanban.
 *
 * - PointerSensor com `distance: 5` evita ativar drag em cliques curtos
 *   (preserva click-to-open do card).
 * - Tracks `activeCardId` + `fromColumnId` durante drag.
 * - Tracks `overColumnId` e `overCardId` em `onDragOver` — quando o cursor está
 *   exatamente sobre outro card, `overCardId` aponta pra ele e `overColumnId`
 *   resolve pra coluna desse card. Quando está na área vazia da coluna,
 *   `overColumnId` aponta pra coluna e `overCardId` é null.
 * - Drop pode resolver pra `column:{id}` (fim da coluna) ou `card:{id}` (antes
 *   do card hovered) — em ambos os casos, o `to` é a coluna resultante.
 *
 * Quando `enabled === false`, retorna estado inerte (handlers no-op).
 */
export function useKanbanDnD({
  enabled,
  columns,
  cardColumnLookup,
  onCardMove,
}: UseKanbanDnDOptions) {
  const [dragState, setDragState] = useState<DragStartData | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [overCardId, setOverCardId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const columnsById = useMemo(() => {
    const map = new Map<string, KanbanColumn>();
    for (const c of columns) map.set(c.id, c);
    return map;
  }, [columns]);

  /** Resolve `over.id` (namespaced) → columnId resultante + cardId opcional. */
  const resolveOver = useCallback(
    (overId: string | null): { columnId: string | null; cardId: string | null } => {
      if (!overId) return { columnId: null, cardId: null };
      if (overId.startsWith(COL_PREFIX)) {
        return { columnId: overId.slice(COL_PREFIX.length), cardId: null };
      }
      if (overId.startsWith(CARD_PREFIX)) {
        const cardId = overId.slice(CARD_PREFIX.length);
        return { columnId: cardColumnLookup.get(cardId) ?? null, cardId };
      }
      return { columnId: null, cardId: null };
    },
    [cardColumnLookup],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (!enabled) return;
    const data = event.active.data.current as DragStartData | undefined;
    if (!data) return;
    setDragState(data);
  }, [enabled]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (!enabled) return;
    const overId = event.over ? String(event.over.id) : null;
    const { columnId, cardId } = resolveOver(overId);
    setOverColumnId(columnId);
    setOverCardId(cardId);
  }, [enabled, resolveOver]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const active = dragState;
    setDragState(null);
    setOverColumnId(null);
    setOverCardId(null);
    if (!enabled || !active || !event.over) return;

    const { columnId: toColumnId } = resolveOver(String(event.over.id));
    if (!toColumnId || toColumnId === active.fromColumnId) return;

    const dest = columnsById.get(toColumnId);
    if (dest?.canReceiveDrop === false) return;

    onCardMove?.(active.cardId, active.fromColumnId, toColumnId);
  }, [enabled, dragState, columnsById, onCardMove, resolveOver]);

  const handleDragCancel = useCallback(() => {
    setDragState(null);
    setOverColumnId(null);
    setOverCardId(null);
  }, []);

  return {
    sensors,
    activeCardId: dragState?.cardId ?? null,
    fromColumnId: dragState?.fromColumnId ?? null,
    overColumnId,
    overCardId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
