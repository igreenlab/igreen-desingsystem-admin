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
  },
  ref,
) {
  const color = event.color ?? "brand";

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
      ref={ref}
      type="button"
      disabled={disabled}
      style={style}
      aria-label={ariaLabel || undefined}
      onClick={(evt) => onClick?.(evt)}
      className={cn(
        schedulerEvent({
          color,
          variant,
          truncateStart,
          truncateEnd,
          dragging,
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
    </button>
  );
});
