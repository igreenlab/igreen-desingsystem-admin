import type { ReactNode } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { schedulerResizeHandle } from "../scheduler.styles";
import { SchedulerEventItem, type SchedulerEventItemProps } from "./scheduler-event";
import {
  draggableIdForMove,
  draggableIdForResize,
  droppableIdForDay,
} from "../hooks/use-scheduler-dnd";
import type { SchedulerResizeEdge } from "../scheduler.types";

/**
 * Os wrappers que chamam os hooks do dnd-kit.
 *
 * Eles existem porque `useDraggable`/`useDroppable` são hooks: não podem ser
 * chamados dentro de um `.map()` nem condicionalmente. Cada célula e cada
 * evento precisa do SEU, então cada um precisa ser um componente.
 *
 * A alternativa — um hook no pai gerenciando 42 células — significaria
 * reimplementar o que o dnd-kit já faz por nó (medição, colisão, cleanup).
 */

/* ────────────────────────────────────────────────────────────────────────
 * Alça de resize
 * ──────────────────────────────────────────────────────────────────────── */

function ResizeHandle({
  eventId,
  edge,
  label,
}: {
  eventId: string;
  edge: SchedulerResizeEdge;
  label: string;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: draggableIdForResize(eventId, edge),
  });

  return (
    /* `<span role="button">` e não `<button>`: a alça vive DENTRO do botão do
       evento, e botão dentro de botão é HTML inválido — o navegador quebra a
       árvore e o clique do evento para de funcionar. */
    <span
      ref={setNodeRef}
      /* `attributes` ANTES dos nossos: o dnd-kit já manda `role="button"` e
         `tabIndex`, e o nosso `tabIndex={-1}` precisa vencer — a alça é
         alcançada pelo gesto ou pelo teclado do bloco, não por Tab próprio. */
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={-1}
      aria-label={label}
      className={schedulerResizeHandle({ edge })}
      /* O gesto na alça NÃO deve borbulhar pro evento: sem isso, agarrar a
         borda também dispararia o `onClick` que abre o painel de detalhe. */
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => {
        e.stopPropagation();
        // Repassa pro listener do dnd-kit, que o stopPropagation acima
        // impediria de receber por bubbling.
        (listeners?.onPointerDown as ((ev: React.PointerEvent) => void) | undefined)?.(e);
      }}
    />
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * Evento arrastável
 * ──────────────────────────────────────────────────────────────────────── */

export type DraggableEventProps = Omit<
  SchedulerEventItemProps,
  "dragAttributes" | "dragListeners" | "setDragNodeRef" | "dragTransform" | "resizeHandles"
> & {
  /** Liga o arraste de mover. Quando `false`, o item renderiza inerte. */
  movable?: boolean;
  /** Liga as alças de resize. Só faz sentido em week/day. */
  resizable?: boolean;
};

export function DraggableEvent({
  movable = false,
  resizable = false,
  ...rest
}: DraggableEventProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: draggableIdForMove(rest.event.id),
    disabled: !movable,
  });

  return (
    <SchedulerEventItem
      {...rest}
      movable={movable}
      dragging={isDragging}
      setDragNodeRef={setNodeRef}
      /**
       * ⚠️ **`dragTransform` NÃO é passado de propósito.**
       *
       * A primeira versão movia o próprio bloco com `translate3d`, e ele
       * **desaparecia** ao sair da célula: três ancestrais cortam — o frame da
       * grade (`overflow-hidden`), a pilha de eventos da célula
       * (`overflow-hidden`) e o corpo rolável de week/day (`overflow-y-auto`).
       * Elemento transformado continua sujeito ao clipping do ancestral, então
       * não havia z-index que resolvesse.
       *
       * Quem segue o cursor agora é o `DragOverlay` (em `scheduler.tsx`), que o
       * dnd-kit renderiza em portal FORA da árvore que corta. O original fica no
       * lugar, esmaecido, marcando de onde o evento saiu.
       */
      dragTransform={null}
      /* Sem `movable`, nem `attributes` nem `listeners` entram: um elemento que
         se anuncia arrastável e não arrasta é pior que um que não se anuncia. */
      dragAttributes={
        movable ? ({ ...attributes } as unknown as Record<string, unknown>) : undefined
      }
      dragListeners={
        movable ? ({ ...listeners } as unknown as Record<string, unknown>) : undefined
      }
      resizeHandles={
        resizable && !isDragging ? (
          <>
            <ResizeHandle
              eventId={rest.event.id}
              edge="start"
              label="Ajustar início"
            />
            <ResizeHandle
              eventId={rest.event.id}
              edge="end"
              label="Ajustar fim"
            />
          </>
        ) : null
      }
    />
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * Dia droppable — serve a célula do mês E a coluna de week/day
 * ──────────────────────────────────────────────────────────────────────── */

export function DroppableDay({
  day,
  disabled,
  className,
  overClassName,
  children,
  cellRef,
  ...rest
}: {
  day: Date;
  disabled?: boolean;
  className: string;
  /** Classe aplicada só quando o cursor está sobre este dia. */
  overClassName: string;
  children: ReactNode;
  /**
   * `ref` do roving tabindex, que precisa do MESMO nó que o droppable.
   *
   * ⚠️ Prop **explícita**, e não via spread: a primeira versão espalhava
   * `{...getCellProps(i)}` no `<div>`, e o `ref` que vem ali **sobrescrevia** o
   * `setNodeRef` do dnd-kit — spread depois de `ref=` ganha. O resultado era o
   * droppable nunca receber o nó, `over` sempre `null`, e o drop não persistir:
   * o overlay seguia o cursor, o usuário soltava, e nada acontecia.
   *
   * `Omit<HTMLAttributes>` não inclui `ref`, então o TypeScript não pegou.
   */
  cellRef?: (el: HTMLElement | null) => void;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "children" | "ref">) {
  const { setNodeRef, isOver } = useDroppable({
    id: droppableIdForDay(day),
    disabled,
  });

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        cellRef?.(el);
      }}
      className={cn(className, isOver && !disabled && overClassName)}
      {...rest}
    >
      {children}
    </div>
  );
}
