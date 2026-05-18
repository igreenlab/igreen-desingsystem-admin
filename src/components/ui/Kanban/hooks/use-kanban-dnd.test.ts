import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  droppableIdForCard,
  droppableIdForColumn,
  useKanbanDnD,
} from "./use-kanban-dnd";
import type { KanbanColumn } from "../kanban.types";

/**
 * Tests do hook `useKanbanDnD`.
 *
 * Foco: comportamento de tracking de estado durante drag (start/over/end) e
 * regras de bloqueio (`canReceiveDrop`). Sensors NÃO são testados aqui — o
 * `useSensor` do `@dnd-kit/core` é black-box; o que importa é o estado que
 * exporto após cada event handler.
 */

const COLUMNS_BASIC: KanbanColumn[] = [
  { id: "todo",  label: "A fazer" },
  { id: "doing", label: "Em andamento" },
  { id: "done",  label: "Concluído", canReceiveDrop: false },
];

const CARD_COLUMN_LOOKUP = new Map<string, string>([
  ["c1", "todo"],
  ["c2", "todo"],
  ["c3", "doing"],
]);

/** Cria DragStartEvent minimal — só os campos que o hook lê. */
function makeStartEvent(cardId: string, fromColumnId: string): DragStartEvent {
  return {
    active: {
      id: cardId,
      data: { current: { cardId, fromColumnId } },
    },
  } as unknown as DragStartEvent;
}

/** Cria DragOverEvent minimal — só os campos que o hook lê. */
function makeOverEvent(overId: string | null): DragOverEvent {
  return {
    active: { id: "any", data: { current: undefined } },
    over: overId ? { id: overId } : null,
  } as unknown as DragOverEvent;
}

/** Cria DragEndEvent minimal. */
function makeEndEvent(overId: string | null): DragEndEvent {
  return {
    active: { id: "any", data: { current: undefined } },
    over: overId ? { id: overId } : null,
  } as unknown as DragEndEvent;
}

describe("droppableId helpers", () => {
  it("droppableIdForColumn prefixa com 'column:'", () => {
    expect(droppableIdForColumn("todo")).toBe("column:todo");
  });

  it("droppableIdForCard prefixa com 'card:'", () => {
    expect(droppableIdForCard("c1")).toBe("card:c1");
  });
});

describe("useKanbanDnD — estado inicial", () => {
  it("retorna estado inerte quando disabled", () => {
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: false,
        columns: COLUMNS_BASIC,
        cardColumnLookup: CARD_COLUMN_LOOKUP,
      }),
    );

    expect(result.current.activeCardId).toBeNull();
    expect(result.current.fromColumnId).toBeNull();
    expect(result.current.overColumnId).toBeNull();
    expect(result.current.overCardId).toBeNull();
    expect(result.current.sensors).toBeDefined();
  });

  it("retorna estado inerte quando enabled mas sem drag em progresso", () => {
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: true,
        columns: COLUMNS_BASIC,
        cardColumnLookup: CARD_COLUMN_LOOKUP,
      }),
    );

    expect(result.current.activeCardId).toBeNull();
    expect(result.current.fromColumnId).toBeNull();
  });
});

describe("useKanbanDnD — handleDragStart", () => {
  it("seta activeCardId e fromColumnId quando event tem data.current válido", () => {
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: true,
        columns: COLUMNS_BASIC,
        cardColumnLookup: CARD_COLUMN_LOOKUP,
      }),
    );

    act(() => {
      result.current.handleDragStart(makeStartEvent("c1", "todo"));
    });

    expect(result.current.activeCardId).toBe("c1");
    expect(result.current.fromColumnId).toBe("todo");
  });

  it("não muta estado quando enabled é false", () => {
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: false,
        columns: COLUMNS_BASIC,
        cardColumnLookup: CARD_COLUMN_LOOKUP,
      }),
    );

    act(() => {
      result.current.handleDragStart(makeStartEvent("c1", "todo"));
    });

    expect(result.current.activeCardId).toBeNull();
  });

  it("não muta estado quando data.current está ausente", () => {
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: true,
        columns: COLUMNS_BASIC,
        cardColumnLookup: CARD_COLUMN_LOOKUP,
      }),
    );

    const badEvent = {
      active: { id: "x", data: { current: undefined } },
    } as unknown as DragStartEvent;

    act(() => {
      result.current.handleDragStart(badEvent);
    });

    expect(result.current.activeCardId).toBeNull();
  });
});

describe("useKanbanDnD — handleDragOver (parsing namespaced ids)", () => {
  it("resolve 'column:doing' para columnId=doing + cardId=null", () => {
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: true,
        columns: COLUMNS_BASIC,
        cardColumnLookup: CARD_COLUMN_LOOKUP,
      }),
    );

    act(() => {
      result.current.handleDragOver(makeOverEvent(droppableIdForColumn("doing")));
    });

    expect(result.current.overColumnId).toBe("doing");
    expect(result.current.overCardId).toBeNull();
  });

  it("resolve 'card:c3' para cardId=c3 + columnId=doing (via lookup)", () => {
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: true,
        columns: COLUMNS_BASIC,
        cardColumnLookup: CARD_COLUMN_LOOKUP,
      }),
    );

    act(() => {
      result.current.handleDragOver(makeOverEvent(droppableIdForCard("c3")));
    });

    expect(result.current.overCardId).toBe("c3");
    expect(result.current.overColumnId).toBe("doing");
  });

  it("resolve 'card:inexistente' para cardId=inexistente + columnId=null", () => {
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: true,
        columns: COLUMNS_BASIC,
        cardColumnLookup: CARD_COLUMN_LOOKUP,
      }),
    );

    act(() => {
      result.current.handleDragOver(makeOverEvent("card:zzz"));
    });

    // cardId vem do split do prefixo, mas o lookup não tem → columnId fica null
    expect(result.current.overCardId).toBe("zzz");
    expect(result.current.overColumnId).toBeNull();
  });

  it("limpa overColumnId/overCardId quando over é null", () => {
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: true,
        columns: COLUMNS_BASIC,
        cardColumnLookup: CARD_COLUMN_LOOKUP,
      }),
    );

    act(() => {
      result.current.handleDragOver(makeOverEvent(droppableIdForColumn("doing")));
    });
    expect(result.current.overColumnId).toBe("doing");

    act(() => {
      result.current.handleDragOver(makeOverEvent(null));
    });
    expect(result.current.overColumnId).toBeNull();
    expect(result.current.overCardId).toBeNull();
  });

  it("ignora id sem prefixo (não namespaced) — columnId e cardId ficam null", () => {
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: true,
        columns: COLUMNS_BASIC,
        cardColumnLookup: CARD_COLUMN_LOOKUP,
      }),
    );

    act(() => {
      result.current.handleDragOver(makeOverEvent("legacy-id-without-prefix"));
    });

    expect(result.current.overColumnId).toBeNull();
    expect(result.current.overCardId).toBeNull();
  });
});

describe("useKanbanDnD — handleDragEnd (commit + bloqueio canReceiveDrop)", () => {
  it("chama onCardMove quando drop em coluna válida", () => {
    const onCardMove = vi.fn();
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: true,
        columns: COLUMNS_BASIC,
        cardColumnLookup: CARD_COLUMN_LOOKUP,
        onCardMove,
      }),
    );

    act(() => {
      result.current.handleDragStart(makeStartEvent("c1", "todo"));
    });
    act(() => {
      result.current.handleDragEnd(makeEndEvent(droppableIdForColumn("doing")));
    });

    expect(onCardMove).toHaveBeenCalledOnce();
    expect(onCardMove).toHaveBeenCalledWith("c1", "todo", "doing");
  });

  it("chama onCardMove quando drop sobre um card específico (resolve via lookup)", () => {
    const onCardMove = vi.fn();
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: true,
        columns: COLUMNS_BASIC,
        cardColumnLookup: CARD_COLUMN_LOOKUP,
        onCardMove,
      }),
    );

    act(() => {
      result.current.handleDragStart(makeStartEvent("c1", "todo"));
    });
    act(() => {
      // Solta sobre card c3 (que está em "doing")
      result.current.handleDragEnd(makeEndEvent(droppableIdForCard("c3")));
    });

    expect(onCardMove).toHaveBeenCalledWith("c1", "todo", "doing");
  });

  it("NÃO chama onCardMove quando coluna destino tem canReceiveDrop=false", () => {
    const onCardMove = vi.fn();
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: true,
        columns: COLUMNS_BASIC, // "done" tem canReceiveDrop: false
        cardColumnLookup: CARD_COLUMN_LOOKUP,
        onCardMove,
      }),
    );

    act(() => {
      result.current.handleDragStart(makeStartEvent("c1", "todo"));
    });
    act(() => {
      result.current.handleDragEnd(makeEndEvent(droppableIdForColumn("done")));
    });

    expect(onCardMove).not.toHaveBeenCalled();
  });

  it("NÃO chama onCardMove quando destino === origem (no-op)", () => {
    const onCardMove = vi.fn();
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: true,
        columns: COLUMNS_BASIC,
        cardColumnLookup: CARD_COLUMN_LOOKUP,
        onCardMove,
      }),
    );

    act(() => {
      result.current.handleDragStart(makeStartEvent("c1", "todo"));
    });
    act(() => {
      result.current.handleDragEnd(makeEndEvent(droppableIdForColumn("todo")));
    });

    expect(onCardMove).not.toHaveBeenCalled();
  });

  it("NÃO chama onCardMove quando over é null (drop fora de drop zone)", () => {
    const onCardMove = vi.fn();
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: true,
        columns: COLUMNS_BASIC,
        cardColumnLookup: CARD_COLUMN_LOOKUP,
        onCardMove,
      }),
    );

    act(() => {
      result.current.handleDragStart(makeStartEvent("c1", "todo"));
    });
    act(() => {
      result.current.handleDragEnd(makeEndEvent(null));
    });

    expect(onCardMove).not.toHaveBeenCalled();
  });

  it("NÃO chama onCardMove quando enabled=false (sem tracking inicial)", () => {
    const onCardMove = vi.fn();
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: false,
        columns: COLUMNS_BASIC,
        cardColumnLookup: CARD_COLUMN_LOOKUP,
        onCardMove,
      }),
    );

    // start não registra estado quando disabled, então end nunca tem dragState
    act(() => {
      result.current.handleDragStart(makeStartEvent("c1", "todo"));
    });
    act(() => {
      result.current.handleDragEnd(makeEndEvent(droppableIdForColumn("doing")));
    });

    expect(onCardMove).not.toHaveBeenCalled();
  });

  it("limpa dragState após handleDragEnd (não persiste entre drags)", () => {
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: true,
        columns: COLUMNS_BASIC,
        cardColumnLookup: CARD_COLUMN_LOOKUP,
      }),
    );

    act(() => {
      result.current.handleDragStart(makeStartEvent("c1", "todo"));
    });
    expect(result.current.activeCardId).toBe("c1");

    act(() => {
      result.current.handleDragEnd(makeEndEvent(droppableIdForColumn("doing")));
    });

    expect(result.current.activeCardId).toBeNull();
    expect(result.current.fromColumnId).toBeNull();
    expect(result.current.overColumnId).toBeNull();
    expect(result.current.overCardId).toBeNull();
  });
});

describe("useKanbanDnD — handleDragCancel", () => {
  it("limpa todo o estado quando cancelado (ex: tecla Escape)", () => {
    const onCardMove = vi.fn();
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: true,
        columns: COLUMNS_BASIC,
        cardColumnLookup: CARD_COLUMN_LOOKUP,
        onCardMove,
      }),
    );

    act(() => {
      result.current.handleDragStart(makeStartEvent("c1", "todo"));
      result.current.handleDragOver(makeOverEvent(droppableIdForColumn("doing")));
    });

    expect(result.current.activeCardId).toBe("c1");
    expect(result.current.overColumnId).toBe("doing");

    act(() => {
      result.current.handleDragCancel();
    });

    expect(result.current.activeCardId).toBeNull();
    expect(result.current.fromColumnId).toBeNull();
    expect(result.current.overColumnId).toBeNull();
    expect(result.current.overCardId).toBeNull();
    expect(onCardMove).not.toHaveBeenCalled();
  });
});

describe("useKanbanDnD — assumptions documentadas (regression guard)", () => {
  it("primitive NÃO faz revert: onCardMove é chamado uma vez, sem rollback automático", () => {
    const onCardMove = vi.fn(() => Promise.reject(new Error("backend rejected")));
    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: true,
        columns: COLUMNS_BASIC,
        cardColumnLookup: CARD_COLUMN_LOOKUP,
        onCardMove,
      }),
    );

    act(() => {
      result.current.handleDragStart(makeStartEvent("c1", "todo"));
    });
    act(() => {
      result.current.handleDragEnd(makeEndEvent(droppableIdForColumn("doing")));
    });

    // Hook fire-and-forget — Promise rejection é responsabilidade do consumer
    expect(onCardMove).toHaveBeenCalledOnce();
  });

  it("canReceiveDrop default true: coluna sem o campo aceita drop", () => {
    const onCardMove = vi.fn();
    const columnsWithoutFlag: KanbanColumn[] = [
      { id: "a", label: "A" }, // sem canReceiveDrop → default true
      { id: "b", label: "B" },
    ];
    const lookup = new Map([["x", "a"]]);

    const { result } = renderHook(() =>
      useKanbanDnD({
        enabled: true,
        columns: columnsWithoutFlag,
        cardColumnLookup: lookup,
        onCardMove,
      }),
    );

    act(() => {
      result.current.handleDragStart(makeStartEvent("x", "a"));
    });
    act(() => {
      result.current.handleDragEnd(makeEndEvent(droppableIdForColumn("b")));
    });

    expect(onCardMove).toHaveBeenCalledWith("x", "a", "b");
  });
});
