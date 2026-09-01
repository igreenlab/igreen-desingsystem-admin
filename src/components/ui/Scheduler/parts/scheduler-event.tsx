import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  schedulerEvent,
  schedulerEventDescription,
  schedulerEventDot,
  schedulerEventTime,
  schedulerEventTitle,
} from "../scheduler.styles";
import type { SchedulerEvent, SchedulerView } from "../scheduler.types";

/**
 * Um evento renderizado. A MESMA peça serve as 3 formas (`pill` no mês,
 * `block` em week/day, `row` na lista) porque o que muda entre elas é
 * dimensão e densidade — não semântica. Três componentes separados
 * triplicariam a superfície de foco, dnd e cor pra ganhar nada.
 *
 * `forwardRef` é obrigatório aqui, não decorativo: o wrapper precisa ser
 * alcançável como nó DOM pelo dnd (`setNodeRef` do dnd-kit, fatia seguinte) e
 * como âncora de popover/painel de detalhe. Compound component sem
 * `forwardRef` foi exatamente o que ancorou o popover em `top=-506` na
 * L-021.
 */

export type SchedulerEventItemProps = {
  event: SchedulerEvent;
  view: SchedulerView;
  variant: "pill" | "block" | "row";
  /** Continuação truncada de evento multi-dia — perde o canto desse lado. */
  truncateStart?: boolean;
  truncateEnd?: boolean;
  dragging?: boolean;
  disabled?: boolean;
  /** Rótulo de horário já formatado pelo chamador (que conhece `hourFormat`). */
  timeLabel?: string;
  /** Posicionamento absoluto do `block` (top/height/left/width em %/px). */
  style?: CSSProperties;
  /** Substitui o miolo; o wrapper (foco, cor, dnd) permanece do componente. */
  renderContent?: () => ReactNode;
  onClick?: (evt: React.MouseEvent | React.KeyboardEvent) => void;
  className?: string;

  /* ── Drag & drop (opcional; a view liga quando o gesto existe) ──────── */
  /**
   * `attributes` + `listeners` do `useDraggable`. Vêm juntos de propósito: o
   * `role`/`aria-*` de `attributes` descreve o que os `listeners` fazem, e
   * aplicar um sem o outro produz um elemento que arrasta sem se anunciar — ou
   * que se anuncia arrastável e não arrasta.
   */
  dragAttributes?: Record<string, unknown>;
  dragListeners?: Record<string, unknown>;
  /** `setNodeRef` do dnd-kit — combinado com o `ref` externo. */
  setDragNodeRef?: (el: HTMLElement | null) => void;
  /** `transform` do dnd-kit; vira `translate3d` enquanto o gesto acontece. */
  dragTransform?: { x: number; y: number } | null;
  /** Marca "arrastável e em repouso" — cursor de mão + transição de assentamento. */
  movable?: boolean;
  /** Alças de resize, já ligadas ao `useDraggable` pela view. */
  resizeHandles?: ReactNode;
};

export const SchedulerEventItem = forwardRef<
  HTMLButtonElement,
  SchedulerEventItemProps
>(function SchedulerEventItem(
  {
    event,
    view,
    variant,
    truncateStart = false,
    truncateEnd = false,
    dragging = false,
    disabled = false,
    timeLabel,
    style,
    renderContent,
    onClick,
    className,
    dragAttributes,
    dragListeners,
    setDragNodeRef,
    dragTransform,
    movable = false,
    resizeHandles,
  },
  ref,
) {
  const color = event.color ?? "brand";

  /**
   * Combina o ref externo (âncora de popover/painel) com o `setNodeRef` do
   * dnd-kit. Os dois precisam do MESMO nó: sem isso, ou o dnd não mede o
   * elemento, ou o popover ancora em lugar nenhum — a armadilha da L-021.
   */
  const mergeRefs = (el: HTMLButtonElement | null) => {
    setDragNodeRef?.(el);
    if (typeof ref === "function") ref(el);
    else if (ref) {
      (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
    }
  };

  /**
   * O transform do dnd-kit entra como `translate3d` — composto na GPU, sem
   * recalcular layout a cada movimento do ponteiro.
   *
   * Ele SOMA ao `style` posicional (o top/left/height do bloco), que continua
   * sendo a verdade de onde o evento está: o transform é só o deslocamento
   * visual do gesto em andamento. Trocar `top` durante o arraste, em vez de
   * transformar, forçaria reflow a cada frame.
   */
  const estilo: CSSProperties = {
    ...style,
    ...(dragTransform
      ? { transform: `translate3d(${dragTransform.x}px, ${dragTransform.y}px, 0)` }
      : null),
  };

  /**
   * `aria-label` explícito e não só o texto visível: o pill do mês trunca com
   * `...` no CSS e mostra o horário em separado, então quem usa leitor de tela
   * receberia um fragmento. Aqui o rótulo é sempre "título, horário".
   */
  const ariaLabel = [
    typeof event.title === "string" ? event.title : event.searchText,
    timeLabel,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <button
      ref={mergeRefs}
      type="button"
      disabled={disabled}
      style={estilo}
      aria-label={ariaLabel || undefined}
      onClick={(evt) => onClick?.(evt)}
      {...dragAttributes}
      {...dragListeners}
      className={cn(
        schedulerEvent({
          color,
          variant,
          truncateStart,
          truncateEnd,
          dragging,
          // `movable` só pinta em REPOUSO: durante o arraste o `dragging` manda,
          // e ele desliga a transição de propósito (ver nota no styles).
          movable: movable && !dragging,
          disabled,
        }),
        className,
      )}
    >
      {renderContent ? (
        renderContent()
      ) : variant === "row" ? (
        /* `row` é a única forma com espaço pra 2 linhas — a descrição só
           aparece aqui. No pill de 20px ela não caberia, e no block ela
           competiria com o título quando a duração é curta. */
        <>
          <span
            className={schedulerEventDot({ color, size: "md" })}
            aria-hidden="true"
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className={schedulerEventTitle()}>{event.title}</span>
            {event.description ? (
              <span className={schedulerEventDescription()}>
                {event.description}
              </span>
            ) : null}
          </span>
          {timeLabel ? (
            <span className={schedulerEventTime()}>{timeLabel}</span>
          ) : null}
        </>
      ) : variant === "block" ? (
        /* No block o horário vem ANTES do título e em linha própria: o bloco
           tem altura proporcional à duração, e num evento longo o título
           sozinho no topo deixaria o horário fora do campo de leitura. */
        <>
          {timeLabel ? (
            <span className={cn(schedulerEventTime(), "text-caption-xs")}>
              {timeLabel}
            </span>
          ) : null}
          <span className={cn(schedulerEventTitle(), "w-full")}>
            {event.title}
          </span>
        </>
      ) : (
        <>
          {/* O dot só aparece quando NÃO é continuação truncada: no meio de
              uma barra multi-dia ele leria como um novo evento começando. */}
          {!truncateStart ? (
            <span
              className={schedulerEventDot({ color, size: "sm" })}
              aria-hidden="true"
            />
          ) : null}
          <span className={schedulerEventTitle()}>{event.title}</span>
          {timeLabel && view === "month" ? (
            <span className={schedulerEventTime()}>{timeLabel}</span>
          ) : null}
        </>
      )}

      {/* Alças de resize por último, pra ficarem por cima do miolo na ordem de
          pintura. Vêm prontas da view (já ligadas ao `useDraggable`) — este
          componente não sabe redimensionar, só onde a alça mora. */}
      {resizeHandles}
    </button>
  );
});
