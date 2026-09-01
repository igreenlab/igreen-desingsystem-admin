import { useMemo } from "react";
import {
  endOfMonth,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  type Locale,
} from "date-fns";
import { CalendarSearch } from "lucide-react";
import {
  schedulerListDay,
  schedulerListDayHead,
  schedulerListDayName,
  schedulerListDayNumber,
  schedulerListEvents,
  schedulerListFrame,
  schedulerPlaceholder,
} from "../scheduler.styles";
import { SchedulerEventItem } from "../parts/scheduler-event";
import type {
  SchedulerEvent,
  SchedulerHourFormat,
  SchedulerRenderEventParams,
} from "../scheduler.types";

/**
 * View `list` — a agenda.
 *
 * ## Só os dias QUE TÊM evento
 *
 * A grade do mês mostra os 42 dias porque a grade *é* a informação: um dia vazio
 * ali diz "nada marcado nesta terça". Aqui não — uma agenda que lista 30 dias
 * pra mostrar 8 eventos obriga a rolar por 22 blocos vazios. Dia sem evento
 * simplesmente não aparece, e o salto entre datas é o próprio sinal de que não
 * há nada no meio.
 *
 * ## A janela é o MÊS da âncora
 *
 * Mesmo recorte que `useSchedulerState.visibleRange` calcula pra `list`, e
 * recalculado aqui a partir de `date` pelas mesmas regras — não recebido por
 * prop, pra que a view não dependa da ordem em que o pai monta as coisas. As
 * setas da toolbar andam de DIA nesta view (decisão registrada no hook), então o
 * usuário navega dentro do mês sem que a lista salte de mês a cada clique.
 */

export type SchedulerListViewProps = {
  date: Date;
  events: SchedulerEvent[];
  locale?: Locale;
  hourFormat: SchedulerHourFormat;
  now: Date;
  onEventClick?: (
    event: SchedulerEvent,
    evt: React.MouseEvent | React.KeyboardEvent,
  ) => void;
  renderEvent?: (params: SchedulerRenderEventParams) => React.ReactNode;
  emptyState?: React.ReactNode;
};

export function SchedulerListView({
  date,
  events,
  locale,
  hourFormat,
  now,
  onEventClick,
  renderEvent,
  emptyState,
}: SchedulerListViewProps) {
  const grupos = useMemo(() => {
    const inicio = startOfMonth(date).getTime();
    const fim = endOfMonth(date).getTime();

    /** `dia (ms) → eventos`. Multi-dia entra em CADA dia que ocupa dentro da
     *  janela: quem abre a agenda no dia 10 espera ver o offsite que começou no
     *  dia 8 e ainda está rolando. */
    const map = new Map<number, SchedulerEvent[]>();

    for (const ev of events) {
      let cursor = startOfDay(ev.start);
      const ultimo = startOfDay(ev.end);
      let guard = 0;
      while (cursor.getTime() <= ultimo.getTime() && guard < 400) {
        const t = cursor.getTime();
        if (t >= inicio && t <= fim) {
          const lista = map.get(t) ?? [];
          lista.push(ev);
          map.set(t, lista);
        }
        cursor = new Date(
          cursor.getFullYear(),
          cursor.getMonth(),
          cursor.getDate() + 1,
        );
        guard++;
      }
    }

    return [...map.entries()]
      .sort(([a], [b]) => a - b)
      .map(([t, lista]) => ({
        dia: new Date(t),
        // Dia inteiro primeiro, depois por horário — é a ordem em que o dia
        // acontece: o que vale pro dia todo emoldura o resto.
        eventos: lista.sort((x, y) => {
          if (!!x.allDay !== !!y.allDay) return x.allDay ? -1 : 1;
          return x.start.getTime() - y.start.getTime();
        }),
      }));
  }, [events, date]);

  const fmtTime = (d: Date) =>
    format(d, hourFormat === "12h" ? "h:mm a" : "HH:mm", { locale });

  const rotuloHorario = (ev: SchedulerEvent) => {
    if (ev.allDay) return "Dia inteiro";
    // Mesmo instante nas duas pontas = marco, não intervalo: mostrar
    // "14:00 – 14:00" leria como erro de dado.
    if (ev.start.getTime() === ev.end.getTime()) return fmtTime(ev.start);
    return `${fmtTime(ev.start)} – ${fmtTime(ev.end)}`;
  };

  if (grupos.length === 0) {
    return (
      <div className={schedulerPlaceholder()}>
        {emptyState ?? (
          <>
            <CalendarSearch
              className="size-icon-xl text-fg-subtle"
              aria-hidden="true"
            />
            <span className="text-body-md font-semibold text-fg-default">
              Nenhum evento em {format(date, "MMMM 'de' yyyy", { locale })}
            </span>
            <span className="max-w-[42ch] text-body-sm text-fg-muted">
              Ajuste a busca ou os filtros, ou navegue pra outro mês.
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={schedulerListFrame()}>
      {grupos.map(({ dia, eventos }) => (
        <div key={dia.getTime()} className={schedulerListDay()}>
          <div className={schedulerListDayHead()}>
            <span className={schedulerListDayNumber({ today: isSameDay(dia, now) })}>
              {format(dia, "d", { locale })}
            </span>
            <span className={schedulerListDayName()}>
              {format(dia, "EEEE, MMMM", { locale })}
            </span>
          </div>

          <div className={schedulerListEvents()}>
            {eventos.map((ev) => (
              <SchedulerEventItem
                key={`${ev.id}-${dia.getTime()}`}
                event={ev}
                view="list"
                variant="row"
                timeLabel={rotuloHorario(ev)}
                onClick={(evt) => onEventClick?.(ev, evt)}
                renderContent={
                  renderEvent
                    ? () => renderEvent({ event: ev, view: "list", selected: false })
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
