import { useEffect, useMemo, useRef } from "react";
import {
  addDays,
  endOfDay,
  format,
  isSameDay,
  startOfDay,
  startOfWeek,
  type Locale,
} from "date-fns";
import {
  schedulerAllDayCell,
  schedulerAllDayLabel,
  schedulerAllDayRow,
  schedulerHourLabel,
  schedulerHourLabelText,
  schedulerHourSlot,
  schedulerNowDot,
  schedulerNowLabel,
  schedulerNowLine,
  schedulerNowStroke,
  schedulerTimeBody,
  schedulerTimeCanvas,
  schedulerTimeColumn,
  schedulerTimeFrame,
  schedulerTimeGutter,
  schedulerTimeHead,
  schedulerTimeHeadDay,
  schedulerTimeHeadWeekday,
  schedulerDayNumber,
  schedulerDropTarget,
} from "../scheduler.styles";
import { DraggableEvent, DroppableDay } from "../parts/draggable-event";
import { SchedulerEventItem } from "../parts/scheduler-event";
import { useSchedulerKeyboard } from "../hooks/use-scheduler-keyboard";
import { minutesToOffset, packLanes } from "../hooks/layout";
import type {
  SchedulerEvent,
  SchedulerHourFormat,
  SchedulerRenderEventParams,
  SchedulerSnapMinutes,
  SchedulerView,
} from "../scheduler.types";

/**
 * Grade de horas — serve `week` (7 colunas) e `day` (1 coluna).
 *
 * Uma view só, não duas: o gutter de horas, a banda de dia inteiro, o
 * lane-packing de sobreposição, a linha do "agora" e o alvo de clique por faixa
 * são idênticos; o que muda é quantas colunas o `.map` produz. Dois arquivos
 * duplicariam cinco mecanismos pra ganhar zero.
 *
 * ## O acoplamento com o token, declarado
 *
 * `HOUR_HEIGHT_PX` espelha `h-comp-3xl` (48px). Posicionamento absoluto exige a
 * altura como NÚMERO em JS — `minutesToOffset()` devolve px. Não há como derivar
 * isso do CSS sem medir o DOM, e medir antes do primeiro paint produziria um
 * salto visível. A nota inversa está em `scheduler.styles.ts`, no
 * `schedulerTimeFrame`.
 */

/**
 * Espelha `h-comp-3xl` — ver nota acima.
 *
 * Exportado porque o `use-scheduler-dnd` precisa do MESMO número pra converter
 * `delta.y` em minutos. Duas constantes iguais em arquivos diferentes é como o
 * arraste passa a mover o evento pra uma hora que não é a que o cursor aponta.
 */
export const HOUR_HEIGHT_PX = 48;

/**
 * Altura mínima do bloco de evento. Um evento de 10min a 48px/hora renderiza
 * 8px — menos que a altura de uma linha de texto, então o título não apareceria
 * e o bloco leria como um risco. 22px é o piso que ainda mostra uma linha.
 */
const MIN_BLOCK_PX = 22;

export type SchedulerTimeGridProps = {
  date: Date;
  view: Extract<SchedulerView, "week" | "day">;
  events: SchedulerEvent[];
  locale?: Locale;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  hourFormat: SchedulerHourFormat;
  dayRange: [number, number];
  scrollToHour: number;
  nowIndicator: boolean;
  now: Date;
  snapMinutes: SchedulerSnapMinutes;
  onEventClick?: (
    event: SchedulerEvent,
    evt: React.MouseEvent | React.KeyboardEvent,
  ) => void;
  onSlotClick?: (start: Date, end: Date) => void;
  renderEvent?: (params: SchedulerRenderEventParams) => React.ReactNode;
  /** Liga os droppables das colunas. */
  dndAtivo?: boolean;
  podeMover?: (event: SchedulerEvent) => boolean;
  podeRedimensionar?: (event: SchedulerEvent) => boolean;
};

export function SchedulerTimeGrid({
  date,
  view,
  events,
  locale,
  weekStartsOn,
  hourFormat,
  dayRange,
  scrollToHour,
  nowIndicator,
  now,
  snapMinutes,
  onEventClick,
  onSlotClick,
  renderEvent,
  dndAtivo = false,
  podeMover,
  podeRedimensionar,
}: SchedulerTimeGridProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  /** `day` = 1 coluna; `week` = os 7 dias da semana que contém `date`. */
  const days = useMemo(() => {
    if (view === "day") return [startOfDay(date)];
    const first = startOfWeek(date, { weekStartsOn, locale });
    return Array.from({ length: 7 }, (_, i) => startOfDay(addDays(first, i)));
  }, [date, view, weekStartsOn, locale]);

  const [rangeStart, rangeEnd] = dayRange;
  const hours = useMemo(
    () =>
      Array.from({ length: Math.max(1, rangeEnd - rangeStart) }, (_, i) => rangeStart + i),
    [rangeStart, rangeEnd],
  );

  /**
   * Roving tabindex nas faixas de hora. `columns` é a quantidade de **dias**,
   * então ↑/↓ anda uma hora no mesmo dia e ←/→ troca de dia na mesma hora — o
   * mapeamento espacial da grade, não o da ordem do DOM.
   *
   * Sem isso a semana custa **168 `Tab`**. O `enabled` segue `onSlotClick`: sem
   * handler as faixas já vêm `disabled`, e dar foco a elas seria oferecer uma
   * ação que não existe.
   */
  const teclado = useSchedulerKeyboard({
    count: hours.length * days.length,
    columns: days.length,
    onActivate: (index) => {
      const hora = hours[Math.floor(index / days.length)];
      const dia = days[index % days.length];
      if (hora === undefined || !dia) return;
      const start = new Date(dia);
      start.setHours(hora, 0, 0, 0);
      const end = new Date(start);
      end.setHours(hora + 1, 0, 0, 0);
      onSlotClick?.(start, end);
    },
    enabled: Boolean(onSlotClick),
  });

  /**
   * Ancora o scroll em `scrollToHour` na montagem e quando a hora-âncora muda —
   * **não** a cada troca de dia. Reancorar a cada navegação jogaria o usuário de
   * volta pras 8h depois de ele ter rolado até a tarde pra comparar dois dias.
   */
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const target = (scrollToHour - rangeStart) * HOUR_HEIGHT_PX;
    el.scrollTop = Math.max(0, target);
  }, [scrollToHour, rangeStart]);

  const fmtHour = (hour: number) => {
    const d = new Date(2000, 0, 1, hour % 24, 0);
    return format(d, hourFormat === "12h" ? "h a" : "HH:mm", { locale });
  };

  const fmtTime = (d: Date) =>
    format(d, hourFormat === "12h" ? "h:mm a" : "HH:mm", { locale });

  /** Eventos de dia inteiro por dia — vão na banda, nunca na grade de horas. */
  const allDayByDay = useMemo(() => {
    const map = new Map<number, SchedulerEvent[]>();
    for (const day of days) map.set(day.getTime(), []);
    for (const ev of events) {
      if (!ev.allDay) continue;
      for (const day of days) {
        // Um evento de dia inteiro de 3 dias aparece nos 3 dias visíveis.
        if (
          startOfDay(ev.start).getTime() <= day.getTime() &&
          startOfDay(ev.end).getTime() >= day.getTime()
        ) {
          map.get(day.getTime())?.push(ev);
        }
      }
    }
    return map;
  }, [events, days]);

  const hasAllDay = useMemo(
    () => [...allDayByDay.values()].some((list) => list.length > 0),
    [allDayByDay],
  );

  /**
   * Blocos posicionados por dia. Um evento que atravessa a meia-noite é
   * **recortado** no dia visível (`clampedStart`/`clampedEnd`) — sem isso, um
   * evento de 22h às 2h renderizaria 4h de altura pra baixo, invadindo o
   * rodapé da coluna e aparecendo só uma vez em vez de nos dois dias.
   */
  const blocksByDay = useMemo(() => {
    const map = new Map<
      number,
      { event: SchedulerEvent; top: number; height: number; left: string; width: string; label: string }[]
    >();

    for (const day of days) {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      const gridTop = new Date(dayStart.getTime() + rangeStart * 3_600_000);
      const gridBottom = new Date(dayStart.getTime() + rangeEnd * 3_600_000);

      const doDia = events.filter(
        (ev) =>
          !ev.allDay &&
          ev.start.getTime() < gridBottom.getTime() &&
          ev.end.getTime() > gridTop.getTime() &&
          ev.start.getTime() <= dayEnd.getTime() &&
          ev.end.getTime() >= dayStart.getTime(),
      );

      // Recorta ANTES do packLanes: a sobreposição que importa é a visível.
      const recortados = doDia.map((ev) => ({
        original: ev,
        clamped: {
          ...ev,
          start: ev.start.getTime() < gridTop.getTime() ? gridTop : ev.start,
          end: ev.end.getTime() > gridBottom.getTime() ? gridBottom : ev.end,
        } as SchedulerEvent,
      }));

      const lanes = packLanes(
        recortados.map((r) => r.clamped),
        snapMinutes,
      );

      map.set(
        day.getTime(),
        lanes.map((box) => {
          const original =
            recortados.find((r) => r.clamped.id === box.event.id)?.original ??
            box.event;
          const top = minutesToOffset(box.event.start, dayRange, HOUR_HEIGHT_PX);
          const rawHeight =
            ((box.event.end.getTime() - box.event.start.getTime()) / 3_600_000) *
            HOUR_HEIGHT_PX;
          return {
            event: original,
            top,
            height: Math.max(MIN_BLOCK_PX, rawHeight),
            left: `${(box.laneIndex / box.laneCount) * 100}%`,
            width: `${(1 / box.laneCount) * 100}%`,
            // O rótulo mostra o horário REAL do evento, não o recortado — quem
            // vê "22:00" num bloco que começa no topo da grade entende que ele
            // vem de antes; ver "00:00" seria mentira.
            label: `${fmtTime(original.start)}`,
          };
        }),
      );
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fmtTime deriva de hourFormat/locale, já nas deps
  }, [events, days, dayRange, rangeStart, rangeEnd, snapMinutes, hourFormat, locale]);

  /** Offset da linha do "agora", ou `null` se estiver fora da grade visível. */
  const nowOffset = useMemo(() => {
    if (!nowIndicator) return null;
    const visivel = days.some((d) => isSameDay(d, now));
    if (!visivel) return null;
    const offset = minutesToOffset(now, dayRange, HOUR_HEIGHT_PX);
    const total = hours.length * HOUR_HEIGHT_PX;
    if (offset < 0 || offset > total) return null;
    return offset;
  }, [nowIndicator, days, now, dayRange, hours.length]);

  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

  return (
    <div className={schedulerTimeFrame()}>
      {/* ── Cabeçalho de dias ────────────────────────────────────────── */}
      <div className={schedulerTimeHead()}>
        <div className={schedulerTimeGutter()} />
        {days.map((day) => (
          <div
            key={day.getTime()}
            className={schedulerTimeHeadDay({ weekend: isWeekend(day) })}
          >
            <span className={schedulerTimeHeadWeekday()}>
              {format(day, view === "day" ? "EEEE" : "EEEEEE", { locale })}
            </span>
            <span
              className={schedulerDayNumber({ today: isSameDay(day, now) })}
            >
              {format(day, "d", { locale })}
            </span>
          </div>
        ))}
      </div>

      {/* ── Banda de dia inteiro ─────────────────────────────────────────
          Só renderiza quando HÁ evento de dia inteiro na janela. Uma faixa
          vazia permanente rouba altura da grade sem informar nada. */}
      {hasAllDay ? (
        <div className={schedulerAllDayRow()}>
          <span className={schedulerAllDayLabel()}>Dia inteiro</span>
          {days.map((day) => (
            <div key={day.getTime()} className={schedulerAllDayCell()}>
              {(allDayByDay.get(day.getTime()) ?? []).map((ev) => (
                <DraggableEvent
                  key={`${ev.id}-${day.getTime()}`}
                  event={ev}
                  view={view}
                  variant="pill"
                  movable={podeMover?.(ev) ?? false}
                  truncateStart={
                    startOfDay(ev.start).getTime() < day.getTime()
                  }
                  truncateEnd={startOfDay(ev.end).getTime() > day.getTime()}
                  onClick={(evt) => onEventClick?.(ev, evt)}
                  renderContent={
                    renderEvent
                      ? () => renderEvent({ event: ev, view, selected: false })
                      : undefined
                  }
                />
              ))}
            </div>
          ))}
        </div>
      ) : null}

      {/* ── Grade rolável ───────────────────────────────────────────────── */}
      <div ref={bodyRef} className={schedulerTimeBody()}>
        <div className={schedulerTimeCanvas()}>
          {/* Gutter de horas */}
          <div className={`${schedulerTimeGutter()} relative`}>
            {hours.map((h) => (
              <div key={h} className={schedulerHourLabel()}>
                <span className={schedulerHourLabelText()}>{fmtHour(h)}</span>
              </div>
            ))}
            {nowOffset !== null ? (
              <span className={schedulerNowLabel()} style={{ top: nowOffset }}>
                {fmtTime(now)}
              </span>
            ) : null}
          </div>

          {/* Colunas de dia */}
          {days.map((day, indiceDaColuna) => (
            <DroppableDay
              key={day.getTime()}
              day={day}
              disabled={!dndAtivo}
              className={schedulerTimeColumn({ weekend: isWeekend(day) })}
              overClassName={schedulerDropTarget()}
            >
              {hours.map((h, indiceHora) => (
                <button
                  key={h}
                  type="button"
                  className={schedulerHourSlot()}
                  aria-label={`Criar evento em ${format(day, "PPP", { locale })} às ${fmtHour(h)}`}
                  onClick={() => {
                    const start = new Date(day);
                    start.setHours(h, 0, 0, 0);
                    const end = new Date(start);
                    end.setHours(h + 1, 0, 0, 0);
                    onSlotClick?.(start, end);
                  }}
                  // Sem `onSlotClick` a faixa não é acionável — `disabled` em vez
                  // de `pointer-events-none` pra sair também da ordem de foco.
                  disabled={!onSlotClick}
                  /* Índice em ordem de LINHA (hora × dias + dia), que é o que o
                     hook assume pra ←/→ trocar de dia e ↑/↓ trocar de hora. O
                     DOM percorre coluna-a-coluna, então este índice não é a
                     ordem de montagem — é a ordem espacial, de propósito. */
                  {...teclado.getCellProps(
                    indiceHora * days.length + indiceDaColuna,
                  )}
                />
              ))}

              {(blocksByDay.get(day.getTime()) ?? []).map((b) => (
                <DraggableEvent
                  key={b.event.id}
                  event={b.event}
                  view={view}
                  variant="block"
                  movable={podeMover?.(b.event) ?? false}
                  resizable={podeRedimensionar?.(b.event) ?? false}
                  timeLabel={b.label}
                  style={{
                    top: b.top,
                    height: b.height,
                    left: b.left,
                    width: b.width,
                    // 2px de folga à direita pra dois blocos vizinhos não
                    // encostarem; `width` já é a fração da lane.
                    paddingRight: undefined,
                  }}
                  className="mr-[2px]"
                  onClick={(evt) => onEventClick?.(b.event, evt)}
                  renderContent={
                    renderEvent
                      ? () =>
                          renderEvent({ event: b.event, view, selected: false })
                      : undefined
                  }
                />
              ))}

              {nowOffset !== null && isSameDay(day, now) ? (
                <span className={schedulerNowLine()} style={{ top: nowOffset }}>
                  <span className={schedulerNowDot()} aria-hidden="true" />
                  <span className={schedulerNowStroke()} aria-hidden="true" />
                </span>
              ) : null}
            </DroppableDay>
          ))}
        </div>
      </div>
    </div>
  );
}
