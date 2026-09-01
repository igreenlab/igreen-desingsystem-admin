import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { format, isSameDay, isSameMonth, startOfDay, type Locale } from "date-fns";
import { Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/popover";
import {
  schedulerCellEvents,
  schedulerDayHead,
  schedulerDayNumber,
  schedulerMonthCell,
  schedulerMonthFrame,
  schedulerMonthGrid,
  schedulerOverflowButton,
  schedulerOverflowPanel,
  schedulerOverflowPanelTitle,
  schedulerSlotAdd,
  schedulerWeekdayCell,
  schedulerWeekdayRow,
} from "../scheduler.styles";
import { SchedulerEventItem } from "../parts/scheduler-event";
import { buildMonthMatrix, computeOverflow, segmentMultiDay } from "../hooks/layout";
import type {
  SchedulerEvent,
  SchedulerHourFormat,
  SchedulerRenderEventParams,
} from "../scheduler.types";

/**
 * View de mês — grade 6×7 fixa.
 *
 * ## Por que os eventos são desenhados POR CÉLULA e não como barras absolutas
 *
 * A `segmentMultiDay` já devolve `colStart`/`colSpan` por linha, o que
 * permitiria posicionar cada evento multi-dia como uma barra única atravessando
 * as colunas. Esta fatia **não** faz isso: uma barra absoluta precisa reservar
 * a mesma faixa vertical em todas as células que atravessa, senão ela cobre o
 * evento de um dia vizinho. Esse reservatório é lane-packing por LINHA da
 * grade (não por dia), e é trabalho da fatia que traz o dnd — onde a posição
 * já vai ter que ser calculada em px de qualquer forma.
 *
 * O que existe aqui e é honesto: o evento multi-dia aparece em **cada dia que
 * ocupa**, com `truncateStart`/`truncateEnd` marcando a continuação, então o
 * usuário lê a extensão dele corretamente. A barra contínua é refinamento
 * visual, não informação nova.
 */

export type SchedulerMonthViewProps = {
  date: Date;
  events: SchedulerEvent[];
  locale?: Locale;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  hourFormat: SchedulerHourFormat;
  now: Date;
  /**
   * Trava quantos pills aparecem por célula. **Omita** no caso normal: sem ela,
   * o corte é DERIVADO da altura real da linha, que é o que faz o calendário
   * aproveitar a tela quando usado como página inteira — célula alta mostra 8
   * eventos, célula baixa mostra 2, sem ninguém configurar nada.
   *
   * Use só quando a tela precisa de altura de linha previsível
   * independentemente do conteúdo.
   */
  maxPerCell?: number;
  onEventClick?: (
    event: SchedulerEvent,
    evt: React.MouseEvent | React.KeyboardEvent,
  ) => void;
  onSlotClick?: (start: Date, end: Date) => void;
  renderEvent?: (params: SchedulerRenderEventParams) => React.ReactNode;
};

/**
 * Cromo da célula que NÃO é evento, em px — o que precisa sair da altura da
 * linha antes de perguntar quantos pills cabem:
 *
 *   `size-comp-xs`  24px  número do dia
 *   `p-sp-2xs` ×2    4px  padding vertical da célula
 *   `gap-gp-2xs`     2px  entre o cabeçalho do dia e a pilha de eventos
 *
 * Espelha `schedulerMonthCell` e `schedulerDayHead`. Se aqueles mudarem, este
 * número muda — é o mesmo acoplamento declarado do `HOUR_HEIGHT_PX` da
 * `time-grid`, e pela mesma razão: `computeOverflow` recebe px.
 */
const CELL_CHROME_PX = 24 + 4 + 2;

/**
 * Palpite usado só no PRIMEIRO render, antes da medição. `useLayoutEffect` mede
 * e re-renderiza antes do paint, então na prática ninguém vê este valor — ele
 * existe pra SSR e pro caso de `ResizeObserver` indisponível.
 */
const FALLBACK_ROW_HEIGHT_PX = 96;

export function SchedulerMonthView({
  date,
  events,
  locale,
  weekStartsOn,
  hourFormat,
  now,
  maxPerCell,
  onEventClick,
  onSlotClick,
  renderEvent,
}: SchedulerMonthViewProps) {
  const weeks = useMemo(
    () => buildMonthMatrix(date, weekStartsOn, locale),
    [date, weekStartsOn, locale],
  );

  /**
   * Mede a altura REAL da linha pra derivar quantos eventos cabem por célula.
   *
   * É isto que faz o calendário aproveitar a tela: num container de 720px a
   * linha tem ~110px e cabem 3 pills; numa página inteira de 1080px ela tem
   * ~170px e cabem 6. Antes o corte era a constante 3, então a versão de tela
   * cheia mostrava "+5 mais" com metade da célula vazia.
   *
   * `useLayoutEffect` + `ResizeObserver`: a medição acontece ANTES do paint, o
   * que evita o flash de "3 eventos → 6 eventos" que um `useEffect` produziria.
   * Todas as 6 linhas têm a mesma altura (`grid-rows-6`), então medir a grade
   * inteira e dividir é suficiente — e é uma observação só, não 42.
   */
  const gridRef = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState(FALLBACK_ROW_HEIGHT_PX);

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const medir = () => {
      const altura = el.getBoundingClientRect().height;
      if (altura > 0) setRowHeight(altura / weeks.length);
    };
    medir();

    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [weeks.length]);

  /** Altura livre pra pilha de eventos, depois de descontar o cromo da célula. */
  const alturaDisponivel = Math.max(0, rowHeight - CELL_CHROME_PX);

  const segments = useMemo(
    () => segmentMultiDay(events, weeks),
    [events, weeks],
  );

  /**
   * `dayKey → segmentos daquele dia`. Um segmento de `colSpan` 3 entra nos 3
   * dias que ocupa, cada um sabendo se é a ponta inicial, o meio ou a final —
   * é o que permite o `truncate` correto sem recalcular nada na célula.
   */
  const byDay = useMemo(() => {
    const map = new Map<
      number,
      { event: SchedulerEvent; truncateStart: boolean; truncateEnd: boolean }[]
    >();

    for (const seg of segments) {
      const row = weeks[seg.weekIndex];
      for (let i = 0; i < seg.colSpan; i++) {
        const day = row[seg.colStart + i];
        if (!day) continue;
        const key = day.getTime();
        const isFirstOfSegment = i === 0;
        const isLastOfSegment = i === seg.colSpan - 1;
        const list = map.get(key) ?? [];
        list.push({
          event: seg.event,
          // A ponta só é "de verdade" quando é a ponta do segmento E a ponta
          // do evento: um evento que vem da semana anterior chega com
          // `isStart: false` e nunca ganha canto arredondado à esquerda.
          truncateStart: !(isFirstOfSegment && seg.isStart),
          truncateEnd: !(isLastOfSegment && seg.isEnd),
        });
        map.set(key, list);
      }
    }

    // Ordena por início dentro do dia — sem isso a ordem é a de `events`, que
    // é a do consumidor e não tem relação com o horário.
    for (const list of map.values()) {
      list.sort((a, b) => a.event.start.getTime() - b.event.start.getTime());
    }
    return map;
  }, [segments, weeks]);

  const weekdayLabels = useMemo(
    () => weeks[0].map((day) => format(day, "EEEEEE", { locale })),
    [weeks, locale],
  );

  const timeLabelOf = (event: SchedulerEvent) => {
    if (event.allDay) return undefined;
    return format(event.start, hourFormat === "12h" ? "h:mm a" : "HH:mm", {
      locale,
    });
  };

  return (
    <div className={schedulerMonthFrame()}>
      <div className={schedulerWeekdayRow()}>
        {weekdayLabels.map((label, i) => (
          <span key={`${label}-${i}`} className={schedulerWeekdayCell()}>
            {label}
          </span>
        ))}
      </div>

      <div ref={gridRef} className={schedulerMonthGrid()}>
        {weeks.map((week, weekIndex) =>
          week.map((day) => {
            const dayEvents = byDay.get(day.getTime()) ?? [];
            const todos = dayEvents.map((d) => d.event);

            /* `maxPerCell` trava; sem ele, `computeOverflow` deriva o corte da
               altura medida — incluindo a regra de reservar 1 slot pro próprio
               "+N mais", que já é testada em `layout.test.ts`. */
            const { visible, overflowCount } =
              maxPerCell !== undefined
                ? {
                    visible: todos.slice(
                      0,
                      todos.length <= maxPerCell ? maxPerCell : Math.max(0, maxPerCell - 1),
                    ),
                    overflowCount:
                      todos.length <= maxPerCell
                        ? 0
                        : todos.length - Math.max(0, maxPerCell - 1),
                  }
                : computeOverflow(todos, alturaDisponivel);
            const outside = !isSameMonth(day, date);
            const today = isSameDay(day, now);

            return (
              <div
                key={day.getTime()}
                className={schedulerMonthCell({
                  outside,
                  lastRow: weekIndex === weeks.length - 1,
                  interactive: Boolean(onSlotClick),
                })}
              >
                <div className={schedulerDayHead()}>
                  <span className={schedulerDayNumber({ today, outside })}>
                    {format(day, "d", { locale })}
                  </span>

                  {onSlotClick ? (
                    <button
                      type="button"
                      className={schedulerSlotAdd()}
                      aria-label={`Criar evento em ${format(day, "PPP", { locale })}`}
                      onClick={() =>
                        // Dia inteiro: quem cria decide a hora no formulário.
                        // Emitir 00:00–23:59 seria inventar uma duração que o
                        // usuário não pediu.
                        onSlotClick(startOfDay(day), startOfDay(day))
                      }
                    >
                      <Plus aria-hidden="true" />
                    </button>
                  ) : null}
                </div>

                <div className={schedulerCellEvents()}>
                  {visible.map((event) => {
                    const meta = dayEvents.find((d) => d.event.id === event.id);
                    return (
                      <SchedulerEventItem
                        key={`${event.id}-${day.getTime()}`}
                        event={event}
                        view="month"
                        variant="pill"
                        truncateStart={meta?.truncateStart}
                        truncateEnd={meta?.truncateEnd}
                        timeLabel={timeLabelOf(event)}
                        onClick={(evt) => onEventClick?.(event, evt)}
                        renderContent={
                          renderEvent
                            ? () =>
                                renderEvent({
                                  event,
                                  view: "month",
                                  selected: false,
                                })
                            : undefined
                        }
                      />
                    );
                  })}

                  {overflowCount > 0 ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className={schedulerOverflowButton()}>
                          +{overflowCount} mais
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="p-0">
                        <div className={schedulerOverflowPanel()}>
                          <span className={schedulerOverflowPanelTitle()}>
                            {format(day, "EEEE, d 'de' MMMM", { locale })}
                          </span>
                          {/* No painel vão TODOS os eventos do dia, não só os
                              que sobraram: quem abre "+2 mais" quer a agenda do
                              dia, e mostrar só o resto obrigaria a cruzar com a
                              célula pra ter a lista completa. */}
                          {dayEvents.map((d) => (
                            <SchedulerEventItem
                              key={`overflow-${d.event.id}`}
                              event={d.event}
                              view="month"
                              variant="row"
                              timeLabel={timeLabelOf(d.event)}
                              onClick={(evt) => onEventClick?.(d.event, evt)}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : null}
                </div>
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
