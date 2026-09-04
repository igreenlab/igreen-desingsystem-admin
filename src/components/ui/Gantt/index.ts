export { Gantt } from "./gantt";

/**
 * Partes exportadas soltas — mesmo padrão do `TableToolbar` e do
 * `SchedulerFilterPanel`.
 *
 * Serve pra tela que queira posicionar a grade ou a camada de setas em outro
 * lugar do próprio layout, e pra doc page mostrar a anatomia isolada. Em uso
 * normal você não precisa delas: o `Gantt` monta e controla as suas.
 */
export { GanttGrid, GANTT_DEFAULT_COLUMNS } from "./parts/gantt-grid";
export type { GanttGridProps } from "./parts/gantt-grid";

export { GanttBarView, GANTT_BAR_MIN_WIDTH_PX } from "./parts/gantt-bar";
export type { GanttBarViewProps } from "./parts/gantt-bar";

export { GanttFilterPanel } from "./parts/gantt-filter-panel";
export type { GanttFilterPanelProps } from "./parts/gantt-filter-panel";

export { GanttLinksLayer } from "./parts/gantt-links-layer";
export type {
  GanttLinksLayerProps,
  GanttLinkGeometry,
} from "./parts/gantt-links-layer";

/**
 * Núcleo puro. Exportado porque é útil fora do render: validar um cronograma no
 * servidor, calcular caminho crítico num job, testar regra de negócio sem
 * montar React.
 */
export {
  buildTimeAxis,
  buildMonthMatrix,
  clipToWindow,
  computeOverflow,
  dateToDayOffset,
  dateToX,
  daysOfBar,
  deriveSummaryRange,
  deriveWindow,
  flattenRows,
  monthBounds,
  monthMatrixRange,
  packLanes,
  rowHeights,
  rowOffsets,
  snapDate,
  xToDate,
} from "./hooks/layout";
export type {
  GanttAxis,
  GanttClippedBar,
  GanttFlatRow,
  GanttTick,
} from "./hooks/layout";

export {
  checkAllLinks,
  checkLink,
  computeCriticalPath,
  constraintDates,
  linkPath,
  linkSides,
  topoSort,
} from "./hooks/links";
export type { LinkAnchor, TopoResult } from "./hooks/links";

export {
  GANTT_ROW_HEIGHT_PX,
  GANTT_LANE_HEIGHT_PX,
  GANTT_HEAD_HEIGHT_PX,
  GANTT_PX_PER_DAY,
} from "./gantt.styles";

export type {
  GanttProps,
  GanttRef,
  GanttRow,
  GanttRowType,
  GanttBar,
  GanttBarChange,
  GanttColorKey,
  GanttColumn,
  GanttFilterField,
  GanttFilterModel,
  GanttFilterOption,
  GanttGranularity,
  GanttLink,
  GanttLinkType,
  GanttLinkViolation,
  GanttView,
} from "./gantt.types";
