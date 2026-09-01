export { Scheduler } from "./scheduler";

/**
 * O painel de filtro também é exportado solto — mesmo padrão do `TableToolbar`,
 * que expõe `ToolbarSearch`, `ToolbarSegmented` e as outras partes pelo barrel.
 *
 * Serve pra dois casos: uma tela que queira posicionar o painel em outro lugar
 * do próprio layout (e não como coluna do `Scheduler`), e a doc page, que o
 * renderiza isolado pra mostrar a anatomia dele. Em uso normal você não precisa
 * dele: o `Scheduler` monta e controla o seu.
 */
export { SchedulerFilterPanel } from "./parts/scheduler-filter-panel";
export type { SchedulerFilterPanelProps } from "./parts/scheduler-filter-panel";
export type {
  SchedulerProps,
  SchedulerEvent,
  SchedulerEventColor,
  SchedulerView,
  SchedulerHourFormat,
  SchedulerSnapMinutes,
  SchedulerFilterMode,
  SchedulerFilterField,
  SchedulerFilterOption,
  SchedulerFilterModel,
  SchedulerEventChange,
  SchedulerRenderEventParams,
  SchedulerRef,
} from "./scheduler.types";
