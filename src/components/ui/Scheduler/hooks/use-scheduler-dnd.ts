import { useCallback, useMemo, useState } from "react";
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { differenceInCalendarDays, startOfDay } from "date-fns";
import {
  pixelsToMinutes,
  resolveMonthDrop,
  resolveResize,
  resolveTimeGridMove,
} from "./layout";
import type {
  SchedulerEvent,
  SchedulerEventChange,
  SchedulerResizeEdge,
  SchedulerSnapMinutes,
  SchedulerView,
} from "../scheduler.types";

/**
 * Drag & drop do `Scheduler` — `@dnd-kit/core`, mesma base do `Kanban`.
 *
 * ## O que é arrastável, e por quê são gestos diferentes
 *
 * | gesto | id do draggable | resolve com |
 * |---|---|---|
 * | mover no mês | `move:<id>` | `resolveMonthDrop` — muda a data, preserva hora e duração |
 * | mover em week/day | `move:<id>` | `resolveTimeGridMove` — combina coluna (dia) + delta.y (minutos) |
 * | redimensionar | `resize:<id>:<start\|end>` | `resolveResize` — muda a duração, uma ponta só |
 *
 * Mover e redimensionar são **draggables separados** de propósito: o alvo do
 * resize são 6px na borda do bloco, e se ele fosse o mesmo draggable do mover
 * qualquer arrasto começado ali viraria movimento. Ids distintos também deixam o
 * `onDragEnd` decidir sem inferir intenção a partir da geometria.
 *
 * ## Por que `distance: 6` no PointerSensor
 *
 * Sem constraint, o `pointerdown` já ativa o drag e o **clique morre** — e
 * clicar num evento é o que abre o painel de detalhe, ou seja a ação mais comum.
 * 6px é o mesmo threshold que o `grabToScroll` do `DataTable` usa.
 *
 * ## Não muta nada
 *
 * Emite `onEventMove`/`onEventResize` e para. Quem aplica em `events` é o
 * consumidor — mesma escolha do `onCardMove` do `Kanban`, pela mesma razão: só a
 * tela sabe se a mudança precisa de confirmação, otimismo ou rollback.
 */

const MOVE_PREFIX = "move:";
const RESIZE_PREFIX = "resize:";
const DAY_PREFIX = "day:";

export const draggableIdForMove = (eventId: string) => `${MOVE_PREFIX}${eventId}`;
export const draggableIdForResize = (
  eventId: string,
  edge: SchedulerResizeEdge,
) => `${RESIZE_PREFIX}${eventId}:${edge}`;
export const droppableIdForDay = (day: Date) =>
  `${DAY_PREFIX}${startOfDay(day).getTime()}`;

/** `day:<ms>` → `Date`, ou `null` se o `over` não for uma célula/coluna de dia. */
function parseDayDroppable(overId: string | null): Date | null {
  if (!overId || !overId.startsWith(DAY_PREFIX)) return null;
  const ms = Number(overId.slice(DAY_PREFIX.length));
  return Number.isFinite(ms) ? new Date(ms) : null;
}

type DragKind =
  | { kind: "move"; eventId: string }
  | { kind: "resize"; eventId: string; edge: SchedulerResizeEdge };

function parseDraggable(activeId: string): DragKind | null {
  if (activeId.startsWith(MOVE_PREFIX)) {
    return { kind: "move", eventId: activeId.slice(MOVE_PREFIX.length) };
  }
  if (activeId.startsWith(RESIZE_PREFIX)) {
    const resto = activeId.slice(RESIZE_PREFIX.length);
    const corte = resto.lastIndexOf(":");
    if (corte < 0) return null;
    const edge = resto.slice(corte + 1);
    if (edge !== "start" && edge !== "end") return null;
    return { kind: "resize", eventId: resto.slice(0, corte), edge };
  }
  return null;
}

type UseSchedulerDndParams = {
  enabled: boolean;
  view: SchedulerView;
  events: SchedulerEvent[];
  snapMinutes: SchedulerSnapMinutes;
  dayRange: [number, number];
  /** Altura da hora em px — converte `delta.y` em minutos. */
  hourHeight: number;
  draggable: boolean;
  resizable: boolean;
  onEventMove?: (change: SchedulerEventChange) => void;
  onEventResize?: (change: SchedulerEventChange) => void;
};

export function useSchedulerDnd({
  enabled,
  view,
  events,
  snapMinutes,
  dayRange,
  hourHeight,
  draggable,
  resizable,
  onEventMove,
  onEventResize,
}: UseSchedulerDndParams) {
  const [ativo, setAtivo] = useState<DragKind | null>(null);
  const [diaSobreposto, setDiaSobreposto] = useState<number | null>(null);

  /**
   * **Só `PointerSensor`. O `KeyboardSensor` foi deliberadamente NÃO registrado.**
   *
   * O evento é um `<button>` cuja ação primária é abrir o detalhe, e o
   * `KeyboardSensor` do dnd-kit reivindica `Space`/`Enter` pra iniciar arraste.
   * As duas coisas brigam: com o default, o arraste começava, o `click` nativo
   * do botão disparava junto, o painel abria, o foco saía e o dnd-kit cancelava
   * — medido na live region dele, *"Dragging was cancelled."*
   *
   * Tentei separar (`Space` arrasta, `Enter` abre, com `preventDefault` no
   * Space). O arraste passava a iniciar e o droppable era detectado, mas eu
   * **não consegui completar o gesto** neste ambiente: a segunda seta cancelava.
   * E este browser de teste já provou não simular entrada de forma confiável
   * (sem `ResizeObserver`, sem `MediaQueryList.change`, sem `window.resize`, sem
   * pointer capture), então não sei dizer se o defeito é meu ou do harness.
   *
   * Enviar arraste-por-teclado meio funcionando é pior que não ter: o usuário
   * entra num estado de arraste que não consegue terminar, e perde o `Space`
   * como "ativar". Então: **dnd é por ponteiro**, e `Space`/`Enter` abrem o
   * detalhe, que é onde a data e a hora podem ser editadas em campo de
   * formulário — a rota acessível pra reagendar.
   *
   * Pra reabrir: precisa de um browser onde o gesto de teclado seja verificável
   * ponta a ponta. ⚠️ O `Kanban` registra `useSensor(KeyboardSensor)` e tem
   * `onOpenCard` no clique do card — o mesmo conflito latente, não verificado.
   */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const porId = useMemo(() => {
    const m = new Map<string, SchedulerEvent>();
    for (const e of events) m.set(e.id, e);
    return m;
  }, [events]);

  /**
   * Um evento é arrastável quando o gesto está ligado globalmente **e** o evento
   * não desliga (`event.draggable === false`). O override por evento existe pra
   * "esta reunião é fixa" sem desligar o board todo.
   */
  const podeMover = useCallback(
    (e: SchedulerEvent) => enabled && (e.draggable ?? draggable),
    [enabled, draggable],
  );
  const podeRedimensionar = useCallback(
    (e: SchedulerEvent) =>
      // Resize só existe onde há eixo de tempo. No mês a altura da pílula não
      // representa duração, então arrastar a borda não teria o que significar.
      enabled &&
      view !== "month" &&
      view !== "list" &&
      (e.resizable ?? resizable) &&
      !e.allDay,
    [enabled, view, resizable],
  );

  const handleDragStart = useCallback((evt: DragStartEvent) => {
    const parsed = parseDraggable(String(evt.active.id));
    if (parsed) setAtivo(parsed);
  }, []);

  const handleDragOver = useCallback((evt: DragOverEvent) => {
    const dia = parseDayDroppable(evt.over ? String(evt.over.id) : null);
    setDiaSobreposto(dia ? dia.getTime() : null);
  }, []);

  const handleDragCancel = useCallback(() => {
    setAtivo(null);
    setDiaSobreposto(null);
  }, []);

  const handleDragEnd = useCallback(
    (evt: DragEndEvent) => {
      setAtivo(null);
      setDiaSobreposto(null);

      /**
       * A intenção é lida do `evt.active.id`, **não** do estado `ativo`.
       *
       * O estado existe só pra PINTAR o gesto em andamento. Se `handleDragEnd`
       * dependesse dele, um start e um end no mesmo lote de render (gesto que
       * passa o threshold e solta no mesmo frame) leriam `ativo` ainda `null` e
       * o movimento seria descartado em silêncio. O `active.id` está sempre
       * presente e é a fonte da verdade — o teste do hook pegou isso.
       */
      const atual = parseDraggable(String(evt.active.id));
      if (!atual) return;
      if (!enabled) return;

      const evento = porId.get(atual.eventId);
      if (!evento) return;

      /* ── Resize: só o eixo vertical importa, e não precisa de droppable ── */
      if (atual.kind === "resize") {
        if (!podeRedimensionar(evento)) return;
        const minutos = pixelsToMinutes(evt.delta.y, hourHeight);
        if (Math.abs(minutos) < 1) return; // gesto sem efeito
        const r = resolveResize(evento, atual.edge, minutos, snapMinutes);
        if (
          r.start.getTime() === evento.start.getTime() &&
          r.end.getTime() === evento.end.getTime()
        ) {
          return; // clampou pro mesmo lugar — nada a emitir
        }
        onEventResize?.({ id: evento.id, start: r.start, end: r.end });
        return;
      }

      /* ── Move ─────────────────────────────────────────────────────────── */
      if (!podeMover(evento)) return;
      const diaAlvo = parseDayDroppable(evt.over ? String(evt.over.id) : null);

      if (view === "month") {
        // No mês o dia vem SÓ do droppable: a grade não tem eixo de tempo, e
        // usar delta.y aqui inventaria uma mudança de horário que ninguém pediu.
        if (!diaAlvo) return;
        const r = resolveMonthDrop(evento, diaAlvo);
        if (r.start.getTime() === evento.start.getTime()) return;
        onEventMove?.({ id: evento.id, start: r.start, end: r.end });
        return;
      }

      if (view === "week" || view === "day") {
        // Sem droppable resolvido (soltou fora de qualquer coluna) o gesto ainda
        // vale como movimento vertical no MESMO dia — é o caso comum de
        // reagendar de 10h pra 14h sem sair da coluna.
        const deslocamentoDeDias = diaAlvo
          ? differenceInCalendarDays(diaAlvo, startOfDay(evento.start))
          : 0;
        const minutos = evento.allDay
          ? 0 // all-day mora na banda, não na grade de horas: só muda de dia
          : pixelsToMinutes(evt.delta.y, hourHeight);

        if (deslocamentoDeDias === 0 && Math.abs(minutos) < 1) return;

        const r = resolveTimeGridMove(
          evento,
          deslocamentoDeDias,
          minutos,
          snapMinutes,
          dayRange,
        );
        if (
          r.start.getTime() === evento.start.getTime() &&
          r.end.getTime() === evento.end.getTime()
        ) {
          return;
        }
        onEventMove?.({ id: evento.id, start: r.start, end: r.end });
      }
      // `list` não tem dnd: arrastar uma agenda não tem semântica de tempo.
    },
    [
      enabled,
      porId,
      view,
      hourHeight,
      snapMinutes,
      dayRange,
      podeMover,
      podeRedimensionar,
      onEventMove,
      onEventResize,
    ],
  );

  return {
    sensors,
    /** `move:<id>` ou `resize:<id>:<edge>` em andamento, pra pintar o estado. */
    dragAtivo: ativo,
    /** `getTime()` do dia sob o cursor — a célula/coluna se pinta com isso. */
    diaSobreposto,
    podeMover,
    podeRedimensionar,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
