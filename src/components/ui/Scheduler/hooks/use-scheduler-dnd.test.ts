import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  draggableIdForMove,
  draggableIdForResize,
  droppableIdForDay,
  useSchedulerDnd,
} from "./use-scheduler-dnd";
import type { SchedulerEvent, SchedulerView } from "../scheduler.types";

/**
 * Testes do `useSchedulerDnd`.
 *
 * **Os sensores NÃO são testados aqui**, e isso é deliberado — mesma decisão do
 * `use-kanban-dnd.test.ts`: `useSensor`/`PointerSensor` são black-box do
 * `@dnd-kit/core`. O que este arquivo verifica é o que o componente OWNA: a
 * resolução de `handleDragEnd` em payload de `onEventMove`/`onEventResize`.
 *
 * ⚠️ Isto existe porque o gesto real **não é verificável** no browser de teste:
 * o `PointerSensor` do dnd-kit usa `setPointerCapture` com `pointerId` real, e
 * nem `left_click_drag` nem uma sequência de `PointerEvent` sintéticos ativam o
 * arraste — medido, o evento não sai do lugar. Sem estes testes, a resolução do
 * drop não teria nenhuma verificação.
 */

const HOUR_HEIGHT = 48;

const at = (y: number, m: number, d: number, h = 0, min = 0) =>
  new Date(y, m, d, h, min, 0, 0);

function ev(
  id: string,
  start: Date,
  end: Date,
  extra: Partial<SchedulerEvent> = {},
): SchedulerEvent {
  return { id, title: id, start, end, ...extra };
}

const EVENTO = ev("e1", at(2026, 8, 2, 10, 0), at(2026, 8, 2, 11, 0));
const ALL_DAY = ev("ad", at(2026, 8, 9), at(2026, 8, 11), { allDay: true });

function montar(
  view: SchedulerView,
  overrides: Partial<Parameters<typeof useSchedulerDnd>[0]> = {},
) {
  const onEventMove = vi.fn();
  const onEventResize = vi.fn();
  const hook = renderHook(() =>
    useSchedulerDnd({
      enabled: true,
      view,
      events: [EVENTO, ALL_DAY],
      snapMinutes: 15,
      dayRange: [0, 24],
      hourHeight: HOUR_HEIGHT,
      draggable: true,
      resizable: true,
      onEventMove,
      onEventResize,
      ...overrides,
    }),
  );
  return { hook, onEventMove, onEventResize };
}

/** Fabrica os eventos do dnd-kit com só o que o hook realmente lê. */
const dragStart = (id: string) =>
  ({ active: { id } }) as unknown as DragStartEvent;

const dragEnd = (id: string, overId: string | null, deltaY = 0) =>
  ({
    active: { id },
    over: overId ? { id: overId } : null,
    delta: { x: 0, y: deltaY },
  }) as unknown as DragEndEvent;

/* ────────────────────────────────────────────────────────────────────────
 * Mover no mês
 * ──────────────────────────────────────────────────────────────────────── */

describe("useSchedulerDnd — mover no mês", () => {
  it("emite onEventMove preservando a HORA ao soltar em outro dia", () => {
    const { hook, onEventMove } = montar("month");

    act(() => {
      hook.result.current.handleDragStart(dragStart(draggableIdForMove("e1")));
      hook.result.current.handleDragEnd(
        dragEnd(draggableIdForMove("e1"), droppableIdForDay(at(2026, 8, 5))),
      );
    });

    expect(onEventMove).toHaveBeenCalledTimes(1);
    const arg = onEventMove.mock.calls[0][0];
    expect(arg.id).toBe("e1");
    expect(arg.start.getDate()).toBe(5);
    expect(arg.start.getHours()).toBe(10); // hora preservada
    expect(arg.end.getHours()).toBe(11);
  });

  it("soltar no MESMO dia não emite nada", () => {
    const { hook, onEventMove } = montar("month");
    act(() => {
      hook.result.current.handleDragStart(dragStart(draggableIdForMove("e1")));
      hook.result.current.handleDragEnd(
        dragEnd(draggableIdForMove("e1"), droppableIdForDay(at(2026, 8, 2))),
      );
    });
    expect(onEventMove).not.toHaveBeenCalled();
  });

  it("soltar FORA de qualquer célula não emite nada no mês", () => {
    // No mês o dia vem só do droppable — sem ele não há o que resolver.
    const { hook, onEventMove } = montar("month");
    act(() => {
      hook.result.current.handleDragStart(dragStart(draggableIdForMove("e1")));
      hook.result.current.handleDragEnd(
        dragEnd(draggableIdForMove("e1"), null, 200),
      );
    });
    expect(onEventMove).not.toHaveBeenCalled();
  });

  it("delta vertical NÃO muda o horário no mês", () => {
    // A grade do mês não tem eixo de tempo: usar delta.y aqui inventaria uma
    // mudança de hora que o usuário não pediu.
    const { hook, onEventMove } = montar("month");
    act(() => {
      hook.result.current.handleDragStart(dragStart(draggableIdForMove("e1")));
      hook.result.current.handleDragEnd(
        dragEnd(draggableIdForMove("e1"), droppableIdForDay(at(2026, 8, 5)), 500),
      );
    });
    expect(onEventMove.mock.calls[0][0].start.getHours()).toBe(10);
  });
});

/* ────────────────────────────────────────────────────────────────────────
 * Mover em week/day
 * ──────────────────────────────────────────────────────────────────────── */

describe("useSchedulerDnd — mover na grade de horas", () => {
  it("delta de 1 hora (48px) desce o evento 1 hora, no mesmo dia", () => {
    const { hook, onEventMove } = montar("week");
    act(() => {
      hook.result.current.handleDragStart(dragStart(draggableIdForMove("e1")));
      hook.result.current.handleDragEnd(
        dragEnd(
          draggableIdForMove("e1"),
          droppableIdForDay(at(2026, 8, 2)),
          HOUR_HEIGHT,
        ),
      );
    });
    const arg = onEventMove.mock.calls[0][0];
    expect(arg.start.getHours()).toBe(11);
    expect(arg.end.getHours()).toBe(12); // duração de 1h preservada
  });

  it("combina troca de coluna com delta vertical", () => {
    const { hook, onEventMove } = montar("week");
    act(() => {
      hook.result.current.handleDragStart(dragStart(draggableIdForMove("e1")));
      hook.result.current.handleDragEnd(
        dragEnd(
          draggableIdForMove("e1"),
          droppableIdForDay(at(2026, 8, 4)),
          -HOUR_HEIGHT,
        ),
      );
    });
    const arg = onEventMove.mock.calls[0][0];
    expect(arg.start.getDate()).toBe(4);
    expect(arg.start.getHours()).toBe(9);
  });

  it("sem droppable, o movimento vertical ainda vale no MESMO dia", () => {
    // É o caso comum: reagendar de 10h pra 14h sem sair da coluna.
    const { hook, onEventMove } = montar("day");
    act(() => {
      hook.result.current.handleDragStart(dragStart(draggableIdForMove("e1")));
      hook.result.current.handleDragEnd(
        dragEnd(draggableIdForMove("e1"), null, HOUR_HEIGHT * 2),
      );
    });
    const arg = onEventMove.mock.calls[0][0];
    expect(arg.start.getDate()).toBe(2);
    expect(arg.start.getHours()).toBe(12);
  });

  it("gesto sem deslocamento não emite nada", () => {
    const { hook, onEventMove } = montar("week");
    act(() => {
      hook.result.current.handleDragStart(dragStart(draggableIdForMove("e1")));
      hook.result.current.handleDragEnd(
        dragEnd(draggableIdForMove("e1"), droppableIdForDay(at(2026, 8, 2)), 0),
      );
    });
    expect(onEventMove).not.toHaveBeenCalled();
  });

  it("evento all-day ignora o delta vertical e só troca de dia", () => {
    // All-day mora na banda, não na grade de horas — mover pra baixo ali não
    // tem hora pra onde ir.
    const { hook, onEventMove } = montar("week");
    act(() => {
      hook.result.current.handleDragStart(dragStart(draggableIdForMove("ad")));
      hook.result.current.handleDragEnd(
        dragEnd(
          draggableIdForMove("ad"),
          droppableIdForDay(at(2026, 8, 10)),
          HOUR_HEIGHT * 3,
        ),
      );
    });
    const arg = onEventMove.mock.calls[0][0];
    expect(arg.start.getDate()).toBe(10);
    expect(arg.start.getHours()).toBe(0);
  });
});

/* ────────────────────────────────────────────────────────────────────────
 * Resize
 * ──────────────────────────────────────────────────────────────────────── */

describe("useSchedulerDnd — resize", () => {
  it("alça de fim estende a duração", () => {
    const { hook, onEventResize } = montar("week");
    act(() => {
      hook.result.current.handleDragStart(
        dragStart(draggableIdForResize("e1", "end")),
      );
      hook.result.current.handleDragEnd(
        dragEnd(draggableIdForResize("e1", "end"), null, HOUR_HEIGHT / 2),
      );
    });
    const arg = onEventResize.mock.calls[0][0];
    expect(arg.start.getHours()).toBe(10); // início intacto
    expect(arg.end.getHours()).toBe(11);
    expect(arg.end.getMinutes()).toBe(30);
  });

  it("alça de início encurta pela frente", () => {
    const { hook, onEventResize } = montar("week");
    act(() => {
      hook.result.current.handleDragStart(
        dragStart(draggableIdForResize("e1", "start")),
      );
      hook.result.current.handleDragEnd(
        dragEnd(draggableIdForResize("e1", "start"), null, HOUR_HEIGHT / 2),
      );
    });
    const arg = onEventResize.mock.calls[0][0];
    expect(arg.start.getMinutes()).toBe(30);
    expect(arg.end.getHours()).toBe(11); // fim intacto
  });

  it("resize NÃO existe no mês — a altura da pílula não é duração", () => {
    const { hook, onEventResize } = montar("month");
    act(() => {
      hook.result.current.handleDragStart(
        dragStart(draggableIdForResize("e1", "end")),
      );
      hook.result.current.handleDragEnd(
        dragEnd(draggableIdForResize("e1", "end"), null, HOUR_HEIGHT),
      );
    });
    expect(onEventResize).not.toHaveBeenCalled();
  });

  it("evento all-day não redimensiona", () => {
    const { hook, onEventResize } = montar("week");
    act(() => {
      hook.result.current.handleDragStart(
        dragStart(draggableIdForResize("ad", "end")),
      );
      hook.result.current.handleDragEnd(
        dragEnd(draggableIdForResize("ad", "end"), null, HOUR_HEIGHT),
      );
    });
    expect(onEventResize).not.toHaveBeenCalled();
  });

  it("gesto menor que 1 minuto é descartado", () => {
    const { hook, onEventResize } = montar("week");
    act(() => {
      hook.result.current.handleDragStart(
        dragStart(draggableIdForResize("e1", "end")),
      );
      hook.result.current.handleDragEnd(
        dragEnd(draggableIdForResize("e1", "end"), null, 0.5),
      );
    });
    expect(onEventResize).not.toHaveBeenCalled();
  });
});

/* ────────────────────────────────────────────────────────────────────────
 * Permissões e estado inerte
 * ──────────────────────────────────────────────────────────────────────── */

describe("useSchedulerDnd — permissões", () => {
  it("`enabled: false` não emite nada", () => {
    const { hook, onEventMove } = montar("month", { enabled: false });
    act(() => {
      hook.result.current.handleDragStart(dragStart(draggableIdForMove("e1")));
      hook.result.current.handleDragEnd(
        dragEnd(draggableIdForMove("e1"), droppableIdForDay(at(2026, 8, 5))),
      );
    });
    expect(onEventMove).not.toHaveBeenCalled();
  });

  it("`event.draggable === false` sobrepõe o global e bloqueia só aquele", () => {
    const fixo = ev("fixo", at(2026, 8, 2, 10), at(2026, 8, 2, 11), {
      draggable: false,
    });
    const { hook, onEventMove } = montar("month", { events: [fixo, EVENTO] });

    act(() => {
      hook.result.current.handleDragStart(dragStart(draggableIdForMove("fixo")));
      hook.result.current.handleDragEnd(
        dragEnd(draggableIdForMove("fixo"), droppableIdForDay(at(2026, 8, 5))),
      );
    });
    expect(onEventMove).not.toHaveBeenCalled();

    // O outro evento, no mesmo board, continua arrastável.
    act(() => {
      hook.result.current.handleDragStart(dragStart(draggableIdForMove("e1")));
      hook.result.current.handleDragEnd(
        dragEnd(draggableIdForMove("e1"), droppableIdForDay(at(2026, 8, 5))),
      );
    });
    expect(onEventMove).toHaveBeenCalledTimes(1);
  });

  it("id de evento inexistente não quebra", () => {
    const { hook, onEventMove } = montar("month");
    act(() => {
      hook.result.current.handleDragStart(dragStart(draggableIdForMove("zzz")));
      hook.result.current.handleDragEnd(
        dragEnd(draggableIdForMove("zzz"), droppableIdForDay(at(2026, 8, 5))),
      );
    });
    expect(onEventMove).not.toHaveBeenCalled();
  });

  it("`list` não tem dnd", () => {
    const { hook, onEventMove } = montar("list");
    act(() => {
      hook.result.current.handleDragStart(dragStart(draggableIdForMove("e1")));
      hook.result.current.handleDragEnd(
        dragEnd(draggableIdForMove("e1"), droppableIdForDay(at(2026, 8, 5))),
      );
    });
    expect(onEventMove).not.toHaveBeenCalled();
  });

  it("handleDragCancel limpa o estado sem emitir", () => {
    const { hook, onEventMove } = montar("month");
    act(() => {
      hook.result.current.handleDragStart(dragStart(draggableIdForMove("e1")));
      hook.result.current.handleDragCancel();
    });
    expect(hook.result.current.dragAtivo).toBeNull();
    expect(onEventMove).not.toHaveBeenCalled();
  });
});
