import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { DndContext } from "@dnd-kit/core";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { schedulerBody, schedulerMain, schedulerRoot } from "./scheduler.styles";
import { SchedulerToolbar } from "./parts/scheduler-toolbar";
import { SchedulerFilterPanel } from "./parts/scheduler-filter-panel";
import { SchedulerMonthView } from "./views/month";
import { HOUR_HEIGHT_PX, SchedulerTimeGrid } from "./views/time-grid";
import { SchedulerListView } from "./views/list";
import { useSchedulerFilter } from "./hooks/use-scheduler-filter";
import { useSchedulerState } from "./hooks/use-scheduler-state";
import { useMediaQuery } from "./hooks/use-media-query";
import { useSchedulerDnd } from "./hooks/use-scheduler-dnd";
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
 * ## As 4 views
 *
 * - `month`: grade 6×7 fixa, evento multi-dia com pontas truncadas, "+N mais"
 *   em popover, `+` de criar no hover da célula.
 * - `week` / `day`: a MESMA view (`views/time-grid.tsx`) com 7 ou 1 coluna —
 *   gutter de horas, banda de dia inteiro, lane-packing de sobreposição, linha
 *   do "agora" e faixa de hora clicável.
 * - `list`: agenda agrupada por dia, só os dias QUE TÊM evento.
 *
 * ## Drag & drop e teclado
 *
 * **Arrastar** move o evento: no mês muda a data preservando hora e duração; em
 * week/day combina a coluna (dia) com o `delta.y` (minutos, snapado). **A borda
 * do bloco** redimensiona em week/day — alça separada, pra agarrar a borda não
 * virar movimento. `@dnd-kit/core`, mesma base do `Kanban`.
 *
 * O dnd só liga quando há `onEventMove`/`onEventResize` conectado: arrastar e
 * ver o evento voltar sozinho lê como bug do app, e é o que `draggable: false`
 * por default protege. Em DEV, ligar sem handler avisa por `console.warn`.
 *
 * **Teclado:** cada grade é uma ÚNICA parada de `Tab` (roving tabindex) —
 * as setas movem dentro dela, `Home`/`End` vão às pontas da linha, `Enter`
 * cria no slot focado. Sem isso a grade do mês custava 42 `Tab` e a da semana
 * 168.
 */

export const Scheduler = forwardRef<SchedulerRef, SchedulerProps>(
  function Scheduler(
    {
      events,
      locale,
      weekStartsOn = 0,
      hourFormat = "24h",
      nowIndicator = true,
      dayRange = [0, 24],
      scrollToHour = 8,
      snapMinutes = 15,
      defaultDate,
      date,
      onDateChange,
      defaultView,
      view,
      onViewChange,
      onEventClick,
      onSlotClick,
      onEventMove,
      onEventResize,
      draggable = false,
      resizable = false,
      searchable = true,
      search,
      onSearchChange,
      filterFields,
      filterModel,
      onFilterModelChange,
      filterMode = "client",
      defaultFilterPanelOpen = false,
      toolbarActions,
      primaryAction,
      title,
      renderEvent,
      emptyState,
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

    /**
     * O painel de filtro é uma COLUNA, não um overlay — ele empurra a grade.
     * Abaixo de 1024px essa coluna não cabe junto de uma grade de 7 dias
     * legível, então nessa faixa ela não é montada e o botão fica desabilitado
     * com `title` explicando.
     *
     * ⚠️ **Esta linha é a ÚNICA fonte do breakpoint.** `schedulerFilterAside`
     * não tem media query: a primeira versão tinha `hidden lg:flex` no CSS
     * *mais* este `matchMedia`, e medido no browser dava pra chegar num estado
     * em que o botão se diz aberto e o painel está `display: none` — um
     * controle que não faz nada visível. Com uma fonte só, painel montado ⟺
     * botão aberto, sempre.
     *
     * ⚠️ **Limite conhecido de verificação:** a emulação de viewport por CDP
     * (o `resize_window` do browser de teste) **não dispara**
     * `MediaQueryList.change` — medido: `matches` vira, zero eventos chegam.
     * Então a reação a um resize AO VIVO não foi verificada aqui; o que foi
     * verificado é a montagem correta ao carregar em cada largura, porque o
     * `useState` inicial lê `matchMedia` direto. Num browser real o listener é
     * o mesmo do `MenuSidebar`, que está em produção.
     *
     * (Este bloco documenta o `useMediaQuery` algumas linhas abaixo — o dnd, que
     * vem primeiro, tem a sua própria nota.)
     */

    /**
     * O dnd só existe onde há gesto pra fazer: sem `onEventMove` nem
     * `onEventResize` conectado, arrastar não teria efeito nenhum — e é
     * exatamente o estado que o default `draggable: false` protege (arrastar e
     * ver o evento voltar sozinho lê como bug do app).
     *
     * Em DEV, ligar `draggable` sem `onEventMove` avisa por `console.warn`.
     */
    const dndAtivo = Boolean(
      (draggable || resizable || events.some((e) => e.draggable || e.resizable)) &&
        (onEventMove || onEventResize),
    );

    const dnd = useSchedulerDnd({
      enabled: dndAtivo,
      view: state.view,
      events: filter.filteredEvents,
      snapMinutes,
      dayRange,
      hourHeight: HOUR_HEIGHT_PX,
      draggable,
      resizable,
      onEventMove,
      onEventResize,
    });

    const avisouDnd = useRef(false);
    useEffect(() => {
      if (!import.meta.env?.DEV || avisouDnd.current) return;
      if (draggable && !onEventMove) {
        avisouDnd.current = true;
        console.warn(
          "[Scheduler] `draggable` está ligado sem `onEventMove`: o usuário vai arrastar e o evento vai voltar pro lugar, o que lê como bug do app. Conecte `onEventMove` ou deixe `draggable` desligado.",
        );
      }
      if (resizable && !onEventResize) {
        avisouDnd.current = true;
        console.warn(
          "[Scheduler] `resizable` está ligado sem `onEventResize`: o resize não vai persistir. Conecte `onEventResize` ou deixe `resizable` desligado.",
        );
      }
    }, [draggable, resizable, onEventMove, onEventResize]);

    const filterPanelAvailable = useMediaQuery("(min-width: 1024px)");
    const [filterPanelOpen, setFilterPanelOpen] = useState(defaultFilterPanelOpen);
    const showFilterPanel =
      filterPanelOpen && filterPanelAvailable && (filterFields?.length ?? 0) > 0;

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
      /* `role="region"` + `aria-label` com o período: é o que dá ao leitor de
         tela um ponto de navegação ("Calendário, setembro 2026") sem que o
         título do período precise se declarar `<h2>` e entrar no outline da
         página. O rótulo só é montado quando o título é string — com um
         `ReactNode` custom não dá pra derivar texto sem varrer a árvore. */
      <div
        role="region"
        aria-label={
          typeof periodTitle === "string"
            ? `Calendário, ${periodTitle}`
            : "Calendário"
        }
        className={cn(schedulerRoot(), className)}
        {...rest}
      >
        {/* O `DndContext` embrulha a TOOLBAR também, e não só a grade: o
            `KeyboardSensor` precisa que o foco esteja dentro do contexto pra
            cancelar um arraste com Esc, e o foco pode estar na toolbar quando o
            usuário desiste do gesto.

            `dndAtivo === false` monta o contexto sem sensores úteis em vez de
            desmontá-lo: alternar a árvore entre com/sem contexto remontaria
            todas as células a cada vez que o consumidor ligasse o dnd, e o
            custo de um contexto inerte é uma closure. */}
        <DndContext
          sensors={dnd.sensors}
          onDragStart={dnd.handleDragStart}
          onDragOver={dnd.handleDragOver}
          onDragEnd={dnd.handleDragEnd}
          onDragCancel={dnd.handleDragCancel}
        >
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
          onClearField={filter.clearField}
          onClearAll={filter.clearAll}
          appliedCount={filter.appliedCount}
          filterPanelOpen={showFilterPanel}
          onToggleFilterPanel={() => setFilterPanelOpen((o) => !o)}
          filterPanelAvailable={filterPanelAvailable}
          toolbarActions={toolbarActions}
          primaryAction={primaryAction}
        />

        <div className={schedulerBody()}>
          <div className={schedulerMain()}>
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
                dndAtivo={dndAtivo}
                podeMover={dnd.podeMover}
              />
            ) : state.view === "list" ? (
              <SchedulerListView
                date={state.date}
                events={filter.filteredEvents}
                locale={locale}
                hourFormat={hourFormat}
                now={now}
                onEventClick={onEventClick}
                renderEvent={renderEvent}
                emptyState={emptyState}
              />
            ) : (
              /* `week` e `day` são a MESMA view, com 7 ou 1 coluna. */
              <SchedulerTimeGrid
                date={state.date}
                view={state.view}
                events={filter.filteredEvents}
                locale={locale}
                weekStartsOn={weekStartsOn}
                hourFormat={hourFormat}
                dayRange={dayRange}
                scrollToHour={scrollToHour}
                nowIndicator={nowIndicator}
                now={now}
                snapMinutes={snapMinutes}
                onEventClick={onEventClick}
                onSlotClick={onSlotClick}
                renderEvent={renderEvent}
                dndAtivo={dndAtivo}
                podeMover={dnd.podeMover}
                podeRedimensionar={dnd.podeRedimensionar}
              />
            )}
          </div>

          {showFilterPanel && filterFields ? (
            <SchedulerFilterPanel
              filterFields={filterFields}
              filterModel={filter.filterModel}
              onToggleValue={filter.toggleValue}
              onClearAll={filter.clearAll}
              appliedCount={filter.appliedCount}
              onClose={() => setFilterPanelOpen(false)}
              counts={filter.optionCounts}
              date={state.date}
              now={now}
              locale={locale}
              weekStartsOn={weekStartsOn}
              events={filter.filteredEvents}
              onDateSelect={state.goToDate}
            />
          ) : null}
        </div>
        </DndContext>
      </div>
    );
  },
);
