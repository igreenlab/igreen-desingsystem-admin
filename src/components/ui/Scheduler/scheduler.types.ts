import type { Locale } from "date-fns";
import type { ReactNode } from "react";

/* ────────────────────────────────────────────────────────────────────────
 * Cor de evento — spec §2 (gate aprovado 2026-09-01, opção A)
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * União fechada sobre as 6 famílias semânticas existentes do DS. `brand`,
 * não `primary` — `primary` é a nomenclatura V2 extinta que só o `Chip`
 * ainda carrega por herança; componente novo não herda essa dívida
 * (CLAUDE.md §Nomenclatura de cores). Default visual: `"brand"`.
 *
 * Teto real são ~5 categorias visualmente separáveis, não 6: `brand` e
 * `success` são ambos verdes (10° de matiz) e não devem ser usados como
 * duas categorias adjacentes no mesmo calendário — documentado em detalhe
 * no `USAGE.md` (fatia de showcase).
 *
 * Gatilho de reabertura pra uma paleta categórica própria (spec §2.4): um
 * consumidor real precisando de 6+ categorias simultâneas no mesmo
 * calendário. Até lá esta união de 6 nomes é a fronteira; ampliá-la depois
 * é aditivo, não breaking.
 */
export type SchedulerEventColor =
  | "brand"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

/* ────────────────────────────────────────────────────────────────────────
 * Modelo de dado — spec §3.1
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Um evento do calendário. O `Scheduler` nunca muta este objeto nem o
 * array `events` — toda mudança (mover, redimensionar) é emitida via
 * callback (`onEventMove`/`onEventResize`) e o consumidor decide se e
 * como aplica.
 */
export type SchedulerEvent = {
  /** Identificador único — usado em lane-packing, dnd e `aria-label`. */
  id: string;
  /** Título visível. `ReactNode` pra permitir markup rico no pill/bloco. */
  title: ReactNode;
  /** Início. */
  start: Date;
  /**
   * Fim — **obrigatório**, nunca opcional. `end` opcional obrigaria cada
   * função de `hooks/layout.ts` a inventar uma duração default; duração
   * zero é caso legítimo (`start === end` — ver `packLanes` e
   * `computeOverflow`) e deve ser dita como igualdade, não como ausência.
   *
   * Invariante `end >= start` é responsabilidade de quem monta o evento
   * nesta fatia — `hooks/layout.ts` é puro e não normaliza entrada
   * inválida (a normalização com `console.warn` em DEV é da fatia 2, em
   * `use-scheduler-state.ts`).
   */
  end: Date;
  /**
   * Evento de dia inteiro. Quando `true`, a hora de `start`/`end` é
   * ignorada — a faixa considerada é `[startOfDay(start), endOfDay(end)]`.
   */
  allDay?: boolean;
  /** Categoria de cor do pill/bloco/dot. Default visual: `"brand"`. */
  color?: SchedulerEventColor;
  /** Id de categoria livre do consumidor — não interpretado pelo componente. */
  categoryId?: string;
  /** Ids de tags livres do consumidor — não interpretados pelo componente. */
  tagIds?: string[];
  /** Descrição — aparece na view `list` e no `aria-label` estendido. */
  description?: ReactNode;
  /** Sobrepõe o `draggable` global (prop do `<Scheduler>`) só pra este evento. */
  draggable?: boolean;
  /** Sobrepõe o `resizable` global só pra este evento. */
  resizable?: boolean;
  /**
   * Payload cru do domínio do consumidor, devolvido intacto em
   * `onEventClick`. É o que impede o `Scheduler` de conhecer o domínio —
   * mesma escolha do `meta` de card do `Kanban`.
   */
  meta?: unknown;
  /**
   * Texto pra busca quando `title` não é uma string simples. O motor de
   * busca (`searchable`) casa **só string**: varrer a árvore de um
   * `ReactNode` pra extrair texto é caro e frágil. Sem `searchText`, um
   * evento com `title` rico (ex: `<b>Reunião</b> — Cliente X`) não é
   * encontrado pela busca — silenciosamente. Documentar isso é melhor do
   * que fingir que a busca "sempre funciona".
   */
  searchText?: string;
};

/* ────────────────────────────────────────────────────────────────────────
 * Enumeráveis — spec §3.2
 * ──────────────────────────────────────────────────────────────────────── */

export type SchedulerView = "month" | "week" | "day" | "list";

export type SchedulerHourFormat = "12h" | "24h";

/**
 * União fechada, não `number`: `snapMinutes: 7` produziria uma grade que
 * não fecha na hora.
 */
export type SchedulerSnapMinutes = 15 | 30 | 60;

/** Em `"server"` o componente só emite `onFilterModelChange`; não filtra. */
export type SchedulerFilterMode = "client" | "server";

/** Qual alça de resize está sendo arrastada. */
export type SchedulerResizeEdge = "start" | "end";

/* ────────────────────────────────────────────────────────────────────────
 * Filtros — declarativo (L-051: nunca form solto acima da grade)
 * ──────────────────────────────────────────────────────────────────────── */

/** Uma opção de um `SchedulerFilterField` — vira 1 chip quando aplicada. */
export type SchedulerFilterOption = {
  value: string;
  label: string;
  /** Cor do dot do chip, quando o filtro espelha a paleta de evento. */
  color?: SchedulerEventColor;
};

/**
 * Campo de filtro declarativo. O `Scheduler` renderiza os chips **e**
 * filtra sozinho (modo `"client"`) — nunca um form solto acima da grade
 * (L-051).
 */
export type SchedulerFilterField = {
  id: string;
  label: string;
  options: SchedulerFilterOption[];
};

/**
 * Valores selecionados por campo de filtro — `fieldId → values[]`. Um
 * `fieldId` ausente do model equivale a "sem filtro aplicado naquele
 * campo" (não a "todas as opções selecionadas").
 */
export type SchedulerFilterModel = Record<string, string[]>;

/* ────────────────────────────────────────────────────────────────────────
 * Ref imperativo e callbacks compostos
 * ──────────────────────────────────────────────────────────────────────── */

export type SchedulerRef = {
  /** Move a data-âncora do período pra `date` (sem trocar de view). */
  goToDate: (date: Date) => void;
  /** Atalho pra `goToDate(new Date())`. */
  goToToday: () => void;
  /** Avança 1 período (dia/semana/mês, conforme a view ativa). */
  next: () => void;
  /** Volta 1 período. */
  prev: () => void;
  /**
   * Janela de datas atualmente visível. Existe pra `filterMode="server"`:
   * o consumidor precisa saber qual intervalo buscar, e derivar isso de
   * fora duplicaria a lógica de `hooks/layout.ts`.
   */
  getVisibleRange: () => { start: Date; end: Date };
};

/** Parâmetros passados pro callback `renderEvent`. */
export type SchedulerRenderEventParams = {
  event: SchedulerEvent;
  view: SchedulerView;
  selected: boolean;
};

/**
 * Payload emitido por `onEventMove`/`onEventResize`. O componente
 * **emite**, nunca muta `events` — o consumidor decide se e como aplica
 * (mesma gramática do `onCardMove` do `Kanban`).
 */
export type SchedulerEventChange = {
  id: string;
  start: Date;
  end: Date;
};

/* ────────────────────────────────────────────────────────────────────────
 * Props do `<Scheduler>` — spec §3.2
 * ──────────────────────────────────────────────────────────────────────── */

export type SchedulerProps = {
  /* ── Dados ──────────────────────────────────────────────────────── */
  /** Única fonte de eventos. O componente nunca muta este array. */
  events: SchedulerEvent[];
  /** Locale do date-fns — nome de mês/dia e 1ª letra do weekday saem daqui. */
  locale?: Locale;
  /** Primeiro dia da semana. Default `0` (domingo) — convenção BR fechada. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Formato de hora do gutter/pill. `"12h"` muda a largura do gutter. */
  hourFormat?: SchedulerHourFormat;
  /**
   * Recorte de horas visíveis na grade de week/day. Não é scroll — é o
   * que existe na grade (ex: `[8, 18]` não renderiza madrugada).
   */
  dayRange?: [number, number];
  /**
   * Âncora inicial do scroll, separada de `dayRange` porque "mostrar
   * 0–24 mas começar às 8" é o caso comum.
   */
  scrollToHour?: number;
  /** Linha do "agora" em week/day. Default `true`. */
  nowIndicator?: boolean;

  /* ── Estado — data (controlado ou não, gramática do DataTable) ────
   * Passar `date` e `defaultDate` juntos é erro de uso — `console.warn`
   * em DEV, `date` vence (mesmo par que `viewMode`/`defaultViewMode` do
   * DataTable já vive com sucesso).
   */
  defaultDate?: Date;
  date?: Date;
  onDateChange?: (date: Date) => void;

  /* ── Estado — view (controlado ou não) ─────────────────────────── */
  defaultView?: SchedulerView;
  view?: SchedulerView;
  onViewChange?: (view: SchedulerView) => void;

  /* ── Interação — o componente é dumb sobre mutação ─────────────── */
  /**
   * O 2º argumento entrega o alvo pro consumidor ancorar painel/popover.
   * Tipado com `KeyboardEvent` também porque `Enter`/`Space` abrem o
   * evento focado (§6.2 da spec).
   */
  onEventClick?: (
    event: SchedulerEvent,
    evt: React.MouseEvent | React.KeyboardEvent,
  ) => void;
  /** `+` revelado no hover da célula, e clique em faixa vazia. */
  onSlotClick?: (start: Date, end: Date) => void;
  /** Emite. Não muta — o consumidor aplica em `events`. */
  onEventMove?: (change: SchedulerEventChange) => void;
  /**
   * Separado de `onEventMove` porque a intenção de negócio difere
   * (reagendar × mudar duração) e frequentemente tem permissão diferente.
   */
  onEventResize?: (change: SchedulerEventChange) => void;
  /**
   * Global; `event.draggable` sobrepõe. Default **`false`** — dnd ligado
   * sem `onEventMove` conectado deixa o usuário arrastar e ver o evento
   * voltar sozinho (o pior estado possível: parece bug do app). Em DEV,
   * `draggable && !onEventMove` deve emitir `console.warn` — mesma razão
   * do `enableDnD` do `Kanban`.
   */
  draggable?: boolean;
  /** Global; `event.resizable` sobrepõe. Default `false`. */
  resizable?: boolean;
  /** Default `15`. */
  snapMinutes?: SchedulerSnapMinutes;
  /**
   * Preview local durante o gesto de dnd. Opt-in porque, ligado, o
   * componente passa a ter um estado que pode divergir de `events`.
   */
  optimistic?: boolean;

  /* ── Toolbar, busca e filtros ───────────────────────────────────── */
  /** Casa `title` (ou `searchText`), `description` e labels de `tagIds`. */
  searchable?: boolean;
  search?: string;
  onSearchChange?: (search: string) => void;
  /** Declarativo: o componente renderiza os chips e filtra sozinho. */
  filterFields?: SchedulerFilterField[];
  filterModel?: SchedulerFilterModel;
  onFilterModelChange?: (model: SchedulerFilterModel) => void;
  /** Default `"client"`. */
  filterMode?: SchedulerFilterMode;
  /** Área custom, entre os chips e o segmented Mês/Semana/Dia/Lista. */
  toolbarActions?: ReactNode;
  /**
   * Slot do botão primário à direita. `ReactNode`, não `{ label, onClick }`,
   * porque o consumidor já tem `Button` do DS e pode querer split button
   * ou botão só de ícone.
   */
  primaryAction?: ReactNode;
  /** Override do título do período (default derivado de `date`+`view`+`locale`). */
  title?: ReactNode;

  /* ── Escape hatches ─────────────────────────────────────────────── */
  /**
   * Substitui só o miolo do pill/bloco/linha — o wrapper (posicionamento,
   * foco, dnd, borda) permanece do componente. Mesma divisão do
   * `renderCard` do `Kanban`, pela mesma razão: garante consistência
   * entre calendários.
   */
  renderEvent?: (params: SchedulerRenderEventParams) => ReactNode;
  /** Só a view `list` tem empty state — mês vazio é grade vazia legítima. */
  emptyState?: ReactNode;
  /** ClassName extra no root. */
  className?: string;
};

/* ────────────────────────────────────────────────────────────────────────
 * Tipos de suporte a `hooks/layout.ts` — spec §8, contrato puro
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Um recorte de evento multi-dia dentro de UMA linha (semana) da grade do
 * mês. Um evento que atravessa 2 semanas vira 2 `MonthSegment`s — um por
 * linha da grade (spec §7 #1).
 */
export type MonthSegment = {
  event: SchedulerEvent;
  /** Índice da linha (0–5) em `Date[][]`, o retorno de `buildMonthMatrix`. */
  weekIndex: number;
  /** Coluna inicial do segmento nesta linha (0–6). */
  colStart: number;
  /** Quantas colunas o segmento ocupa nesta linha. */
  colSpan: number;
  /**
   * `true` quando este segmento contém o dia real de início do evento.
   * `false` quando o segmento é a continuação truncada de uma linha ou de
   * um mês anterior — nesse caso a barra não deve ter canto arredondado
   * nem "ponta" desse lado (spec §5.1, §7 #2/#6/#7).
   */
  isStart: boolean;
  /** Espelho de `isStart` para o fim do evento. */
  isEnd: boolean;
};

/** Posição de um evento numa "lane" horizontal, após `packLanes`. */
export type LaneBox = {
  event: SchedulerEvent;
  /** Índice da lane (0-based) dentro do grupo conexo de colisão. */
  laneIndex: number;
  /**
   * Total de lanes do grupo conexo — **não** do dia inteiro (spec §7 #3).
   * Largura de render = `1 / laneCount`; `left = laneIndex / laneCount`.
   */
  laneCount: number;
};
