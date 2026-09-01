import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { format } from "date-fns";
import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { schedulerPlaceholder, schedulerRoot } from "./scheduler.styles";
import { SchedulerToolbar } from "./parts/scheduler-toolbar";
import { SchedulerMonthView } from "./views/month";
import { useSchedulerFilter } from "./hooks/use-scheduler-filter";
import { useSchedulerState } from "./hooks/use-scheduler-state";
import type { SchedulerProps, SchedulerRef } from "./scheduler.types";

/**
 * `Scheduler` — calendário de eventos com 4 modos de visualização
 * (mês · semana · dia · lista), busca, filtros declarativos e detalhe por
 * callback.
 *
 * Não confundir com `Calendar` (o primitivo shadcn/react-day-picker): aquele
 * é **seletor de data** dentro de um form; este exibe **eventos ao longo do
 * tempo**. Nomes distintos porque as intenções são opostas.
 *
 * ## O componente é dumb sobre mutação
 *
 * `events` nunca é mutado. Mover ou redimensionar um evento emite
 * `onEventMove`/`onEventResize` e o consumidor decide se e como aplica — mesma
 * escolha do `onCardMove` do `Kanban`, pela mesma razão: só a tela sabe se a
 * mudança precisa de confirmação, de otimismo ou de rollback.
 *
 * ## Estado do que está pronto
 *
 * A view `month` está completa (grade, navegação, busca, filtros, overflow,
 * clique no evento e `+` de criar). `week`, `day` e `list` renderizam um aviso
 * explícito de "em construção" — o segmented mostra as 4 opções de propósito,
 * pra que a existência delas seja descoberta, mas nenhuma finge funcionar.
 * Drag & drop e navegação por teclado também não estão nesta fatia.
 */

const VIEW_LABEL = {
  month: "Mês",
  week: "Semana",
  day: "Dia",
  list: "Lista",
} as const;

export const Scheduler = forwardRef<SchedulerRef, SchedulerProps>(
  function Scheduler(
    {
      events,
      locale,
      weekStartsOn = 0,
      hourFormat = "24h",
      nowIndicator: _nowIndicator = true,
      dayRange: _dayRange = [0, 24],
      scrollToHour: _scrollToHour = 8,
      defaultDate,
      date,
      onDateChange,
      defaultView,
      view,
      onViewChange,
      onEventClick,
      onSlotClick,
      searchable = true,
      search,
      onSearchChange,
      filterFields,
      filterModel,
      onFilterModelChange,
      filterMode = "client",
      toolbarActions,
      primaryAction,
      title,
      renderEvent,
      className,
      ...rest
    },
    ref,
  ) {
    /**
     * "Agora" é capturado UMA vez por montagem, num ref — não a cada render.
     * Chamar `new Date()` no corpo do render faria "hoje" mudar de identidade
     * em todo re-render, invalidando os `useMemo` que dependem dele. O
     * calendário não precisa de relógio vivo nesta fatia; o `nowIndicator`
     * de week/day, que precisa, traz o seu próprio tick.
     */
    const nowRef = useRef<Date>(new Date());
    const now = nowRef.current;

    const state = useSchedulerState({
      defaultDate,
      date,
      onDateChange,
      defaultView,
      view,
      onViewChange,
      weekStartsOn,
      locale,
      now,
    });

    const filter = useSchedulerFilter({
      events,
      searchable,
      search,
      onSearchChange,
      filterFields,
      filterModel,
      onFilterModelChange,
      filterMode,
    });

    useImperativeHandle(
      ref,
      (): SchedulerRef => ({
        goToDate: state.goToDate,
        goToToday: state.goToToday,
        next: state.next,
        prev: state.prev,
        getVisibleRange: () => state.visibleRange,
      }),
      [state],
    );

    /**
     * Título do período. Mês e lista mostram "mês ano"; semana mostra o
     * intervalo (ele pode atravessar dois meses, e "setembro" sozinho mentiria
     * numa semana 29/set–5/out); dia mostra a data completa.
     */
    const periodTitle = useMemo(() => {
      if (title !== undefined) return title;
      const { start, end } = state.visibleRange;

      switch (state.view) {
        case "week": {
          const sameMonth = start.getMonth() === end.getMonth();
          return sameMonth
            ? `${format(start, "d", { locale })}–${format(end, "d 'de' MMMM yyyy", { locale })}`
            : `${format(start, "d MMM", { locale })} – ${format(end, "d MMM yyyy", { locale })}`;
        }
        case "day":
          return format(state.date, "EEEE, d 'de' MMMM yyyy", { locale });
        case "month":
        case "list":
        default:
          return format(state.date, "MMMM yyyy", { locale });
      }
    }, [title, state.view, state.date, state.visibleRange, locale]);

    return (
      <div className={cn(schedulerRoot(), className)} {...rest}>
        <SchedulerToolbar
          title={periodTitle}
          view={state.view}
          onViewChange={state.setView}
          onPrev={state.prev}
          onNext={state.next}
          onToday={state.goToToday}
          searchable={searchable}
          search={filter.search}
          onSearchChange={filter.setSearch}
          filterFields={filterFields}
          filterModel={filter.filterModel}
          onToggleValue={filter.toggleValue}
          onClearField={filter.clearField}
          onClearAll={filter.clearAll}
          appliedCount={filter.appliedCount}
          toolbarActions={toolbarActions}
          primaryAction={primaryAction}
        />

        {state.view === "month" ? (
          <SchedulerMonthView
            date={state.date}
            events={filter.filteredEvents}
            locale={locale}
            weekStartsOn={weekStartsOn}
            hourFormat={hourFormat}
            now={now}
            onEventClick={onEventClick}
            onSlotClick={onSlotClick}
            renderEvent={renderEvent}
          />
        ) : (
          /* Aviso honesto, não grade vazia: uma grade sem nada parece defeito,
             e esconder a opção no segmented impediria descobrir que a view vai
             existir. */
          <div className={schedulerPlaceholder()}>
            <CalendarClock
              className="size-icon-xl text-fg-subtle"
              aria-hidden="true"
            />
            <span className="text-body-md font-semibold text-fg-default">
              Visualização “{VIEW_LABEL[state.view]}” em construção
            </span>
            <span className="max-w-[42ch] text-body-sm text-fg-muted">
              A view de mês está completa. Semana, dia e lista — além de drag &
              drop e navegação por teclado — chegam nas próximas entregas deste
              componente.
            </span>
          </div>
        )}
      </div>
    );
  },
);
