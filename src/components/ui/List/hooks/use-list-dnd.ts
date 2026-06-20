import { useCallback, useMemo, useState } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

const ITEM_PREFIX = "list-item:";
const GROUP_PREFIX = "list-group:";

export const droppableIdForItem = (id: string) => `${ITEM_PREFIX}${id}`;
export const droppableIdForGroup = (id: string) => `${GROUP_PREFIX}${id}`;

type UseListDnDOptions = {
  enabled: boolean;
  /** ids ordenados por grupo (no "standard", uma única chave implícita). */
  itemsByGroup: Map<string, string[]>;
  /** itemId → groupId. */
  itemGroupLookup: Map<string, string>;
  /** groupId → aceita drop? (default true). */
  canReceive?: Map<string, boolean>;
  /** Commit: consumer reposiciona. `toIndex` = posição no grupo destino
   *  (já descontando a remoção do item arrastado quando mesmo grupo). */
  onDrop?: (id: string, fromGroupId: string, toGroupId: string, toIndex: number) => void;
};

type DragData = { itemId: string; fromGroupId: string };

export function useListDnD({
  enabled,
  itemsByGroup,
  itemGroupLookup,
  canReceive,
  onDrop,
}: UseListDnDOptions) {
  const [drag, setDrag] = useState<DragData | null>(null);
  const [overGroupId, setOverGroupId] = useState<string | null>(null);
  const [overItemId, setOverItemId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const resolveOver = useCallback(
    (overId: string | null): { groupId: string | null; itemId: string | null } => {
      if (!overId) return { groupId: null, itemId: null };
      if (overId.startsWith(GROUP_PREFIX)) {
        return { groupId: overId.slice(GROUP_PREFIX.length), itemId: null };
      }
      if (overId.startsWith(ITEM_PREFIX)) {
        const itemId = overId.slice(ITEM_PREFIX.length);
        return { groupId: itemGroupLookup.get(itemId) ?? null, itemId };
      }
      return { groupId: null, itemId: null };
    },
    [itemGroupLookup],
  );

  const handleDragStart = useCallback(
    (e: DragStartEvent) => {
      if (!enabled) return;
      const data = e.active.data.current as DragData | undefined;
      if (data) setDrag(data);
    },
    [enabled],
  );

  const handleDragOver = useCallback(
    (e: DragOverEvent) => {
      if (!enabled) return;
      const { groupId, itemId } = resolveOver(e.over ? String(e.over.id) : null);
      setOverGroupId(groupId);
      setOverItemId(itemId);
    },
    [enabled, resolveOver],
  );

  const reset = useCallback(() => {
    setDrag(null);
    setOverGroupId(null);
    setOverItemId(null);
  }, []);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      const active = drag;
      reset();
      if (!enabled || !active || !e.over) return;

      const { groupId: toGroupId, itemId: overId } = resolveOver(String(e.over.id));
      if (!toGroupId) return;
      if (canReceive && canReceive.get(toGroupId) === false) return;

      // lista destino sem o item arrastado (evita índice deslocado no mesmo grupo)
      const dest = (itemsByGroup.get(toGroupId) ?? []).filter((id) => id !== active.itemId);
      let toIndex: number;
      if (overId && overId !== active.itemId) {
        const i = dest.indexOf(overId);
        toIndex = i === -1 ? dest.length : i;
      } else {
        toIndex = dest.length;
      }

      // no-op se posição não muda
      const current = itemsByGroup.get(active.fromGroupId) ?? [];
      const currentIndex = current.indexOf(active.itemId);
      if (toGroupId === active.fromGroupId && currentIndex === toIndex) return;

      onDrop?.(active.itemId, active.fromGroupId, toGroupId, toIndex);
    },
    [enabled, drag, reset, resolveOver, canReceive, itemsByGroup, onDrop],
  );

  const activeItemId = drag?.itemId ?? null;
  const fromGroupId = drag?.fromGroupId ?? null;

  return useMemo(
    () => ({
      sensors,
      activeItemId,
      fromGroupId,
      overGroupId,
      overItemId,
      handleDragStart,
      handleDragOver,
      handleDragEnd,
      handleDragCancel: reset,
    }),
    [sensors, activeItemId, fromGroupId, overGroupId, overItemId, handleDragStart, handleDragOver, handleDragEnd, reset],
  );
}
