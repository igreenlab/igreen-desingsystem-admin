import {
  addDays,
  addHours,
  addMinutes,
  differenceInCalendarDays,
  endOfDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  type Locale,
} from "date-fns";
import type {
  LaneBox,
  MonthSegment,
  SchedulerEvent,
  SchedulerResizeEdge,
  SchedulerSnapMinutes,
} from "../scheduler.types";

/**
 * `hooks/layout.ts` é o núcleo puro do `Scheduler` — sem `import React`,
 * sem `Date.now()` implícito (o "agora" sempre entra como argumento em
 * quem consumir isto). É a condição pra ser testável sem render, e é onde
 * bug de calendário mora (spec §7/§8).
 */

/* ────────────────────────────────────────────────────────────────────────
 * buildMonthMatrix
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Constrói a grade de 6 semanas × 7 dias (sempre 42 dias) que contém
 * `date`, alinhada a `weekStartsOn`.
 *
 * Sempre 6 linhas fixas — mesmo quando o mês cabe em 5 — porque colapsar a
 * 6ª linha faria a altura da grade pular entre meses (spec §1, §7 #13).
 * Cada `Date` retornado é normalizado com `startOfDay` (meia-noite local),
 * então comparação por `.getTime()` entre dois dias da grade é segura.
 *
 * `locale` é repassado pro `startOfWeek` do date-fns por completude da
 * assinatura (spec §8) — hoje não muda o resultado porque `weekStartsOn`
 * sempre é passado explicitamente e tem precedência sobre o default do
 * locale.
 */
export function buildMonthMatrix(
  date: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  locale?: Locale,
): Date[][] {
  const monthStart = startOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn, locale });

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(startOfDay(addDays(gridStart, i)));
  }

  const weeks: Date[][] = [];
  for (let row = 0; row < 6; row++) {
    weeks.push(days.slice(row * 7, row * 7 + 7));
  }
  return weeks;
}

/* ────────────────────────────────────────────────────────────────────────
 * segmentMultiDay
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Recorta cada evento de `events` em 1 `MonthSegment` por linha de
 * `weekRows` que ele atravessa (o retorno de `buildMonthMatrix`, ou
 * qualquer subconjunto de linhas contíguas dele).
 *
 * A comparação é por **dia**, não por hora — `allDay` e evento cronometrado
 * são tratados igual aqui, porque o mês mostra datas, não horários. Um
 * evento de duração 0 (`start === end`) sempre produz exatamente 1
 * segmento de 1 coluna, em qualquer linha.
 *
 * `weekRows` pode ser só as linhas de UM mês (não a grade inteira de outro
 * mês adjacente) — por isso um evento que começa antes da 1ª linha visível
 * chega com `isStart: false` no segmento da 1ª linha (spec §7 #7), e um que
 * termina depois da última linha chega com `isEnd: false` na última (§7
 * #2/#6). "Antes"/"depois" aqui é sempre relativo às linhas recebidas, não
 * ao calendário inteiro — é o chamador (a view) quem decide o que é
 * "visível".
 */
export function segmentMultiDay(
  events: SchedulerEvent[],
  weekRows: Date[][],
): MonthSegment[] {
  const segments: MonthSegment[] = [];

  for (const event of events) {
    const dayStart = startOfDay(event.start);
    const dayEnd = startOfDay(event.end);

    weekRows.forEach((row, weekIndex) => {
      if (row.length === 0) return;
      const rowStart = row[0];
      const rowEnd = row[row.length - 1];

      if (
        dayEnd.getTime() < rowStart.getTime() ||
        dayStart.getTime() > rowEnd.getTime()
      ) {
        return; // evento não passa por esta linha
      }

      const segStart =
        dayStart.getTime() > rowStart.getTime() ? dayStart : rowStart;
      const segEnd = dayEnd.getTime() < rowEnd.getTime() ? dayEnd : rowEnd;

      const colStart = differenceInCalendarDays(segStart, rowStart);
      const colSpan = differenceInCalendarDays(segEnd, segStart) + 1;

      segments.push({
        event,
        weekIndex,
        colStart,
        colSpan,
        isStart: segStart.getTime() === dayStart.getTime(),
        isEnd: segEnd.getTime() === dayEnd.getTime(),
      });
    });
  }

  return segments;
}

/* ────────────────────────────────────────────────────────────────────────
 * packLanes
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Duração 0 (`start === end`) é tratada como se durasse `snapMinutes` **só
 * pra fins de sobreposição/agrupamento aqui dentro** — o `event.end`
 * devolvido em qualquer outro lugar nunca é alterado. Sem isso, dois
 * eventos-marco no mesmo instante exato nunca "colidiriam" e ficariam
 * empilhados na mesma lane, sobrepostos visualmente mesmo com altura
 * mínima de render.
 */
function effectiveEndMs(event: SchedulerEvent, snapMinutes: SchedulerSnapMinutes): number {
  return event.start.getTime() === event.end.getTime()
    ? event.end.getTime() + snapMinutes * 60_000
    : event.end.getTime();
}

/**
 * Lane-packing de `events` (já restritos a uma única faixa cronometrada —
 * um dia, em week/day) pra resolver sobreposição horizontal.
 *
 * Algoritmo: ordena por `start` asc, `end` desc como desempate (spec §7
 * #3). Varre em ordem e agrupa em **grupos conexos** — um evento entra no
 * grupo corrente se seu `start` for antes do maior `end` já visto no
 * grupo; caso contrário fecha o grupo e abre um novo. Dentro de cada
 * grupo, aloca cada evento na primeira lane cujo último evento já
 * terminou (`laneEnd <= event.start`), criando lane nova quando nenhuma
 * está livre.
 *
 * `laneCount` no resultado é o tamanho do grupo conexo, não do dia
 * inteiro — dois grupos disjuntos no mesmo dia (ex: manhã com 2
 * sobrepostos, tarde com 5) não compartilham `laneCount` entre si (spec
 * §7 #3, caso "grupo da manhã não herda nLanes da tarde").
 */
export function packLanes(
  events: SchedulerEvent[],
  snapMinutes: SchedulerSnapMinutes,
): LaneBox[] {
  if (events.length === 0) return [];

  const sorted = [...events].sort((a, b) => {
    const startDiff = a.start.getTime() - b.start.getTime();
    if (startDiff !== 0) return startDiff;
    return effectiveEndMs(b, snapMinutes) - effectiveEndMs(a, snapMinutes);
  });

  const result: LaneBox[] = [];
  let group: SchedulerEvent[] = [];
  let groupMaxEnd = -Infinity;

  const flushGroup = () => {
    if (group.length === 0) return;

    const laneEnds: number[] = [];
    const laneOf = new Map<SchedulerEvent, number>();

    for (const ev of group) {
      const evEnd = effectiveEndMs(ev, snapMinutes);
      const freeLane = laneEnds.findIndex((end) => end <= ev.start.getTime());
      if (freeLane === -1) {
        laneOf.set(ev, laneEnds.length);
        laneEnds.push(evEnd);
      } else {
        laneOf.set(ev, freeLane);
        laneEnds[freeLane] = evEnd;
      }
    }

    const laneCount = laneEnds.length;
    for (const ev of group) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- setado no loop acima, sempre presente
      result.push({ event: ev, laneIndex: laneOf.get(ev)!, laneCount });
    }

    group = [];
    groupMaxEnd = -Infinity;
  };

  for (const ev of sorted) {
    const evStart = ev.start.getTime();
    if (group.length > 0 && evStart >= groupMaxEnd) {
      flushGroup();
    }
    group.push(ev);
    groupMaxEnd = Math.max(groupMaxEnd, effectiveEndMs(ev, snapMinutes));
  }
  flushGroup();

  return result;
}

/* ────────────────────────────────────────────────────────────────────────
 * computeOverflow
 * ──────────────────────────────────────────────────────────────────────── */

/** Espelha `min-h-comp-2xs` (20px) — altura do pill de evento no mês (spec §1/§5.1). */
const MONTH_PILL_HEIGHT_PX = 20;
/** Espelha `gap-gp-2xs` (2px) — gap entre pills na célula do mês (spec §5.1). */
const MONTH_PILL_GAP_PX = 2;

/**
 * Decide quantos eventos de `dayEvents` cabem em `availableHeight` px
 * (a altura livre de UMA célula do mês) e quantos "sobram" pro indicador
 * "+N mais".
 *
 * `N` deriva da altura disponível, nunca de uma constante fixa (spec §7
 * #11). E a própria linha "+N mais" ocupa 1 slot do mesmo tamanho de um
 * pill — por isso, quando nem tudo cabe, o algoritmo **sempre** reserva 1
 * posição a menos do que caberia cru: célula que cabe 3 pills mostra 2 +
 * "+2 mais", nunca 3 + "+1 mais" (que estouraria a altura disponível pela
 * própria linha de overflow).
 */
export function computeOverflow(
  dayEvents: SchedulerEvent[],
  availableHeight: number,
): { visible: SchedulerEvent[]; overflowCount: number } {
  if (dayEvents.length === 0) {
    return { visible: [], overflowCount: 0 };
  }

  const rawFit = Math.max(
    0,
    Math.floor(
      (availableHeight + MONTH_PILL_GAP_PX) /
        (MONTH_PILL_HEIGHT_PX + MONTH_PILL_GAP_PX),
    ),
  );

  if (rawFit >= dayEvents.length) {
    return { visible: dayEvents, overflowCount: 0 };
  }

  const visibleCount = Math.max(0, rawFit - 1);
  return {
    visible: dayEvents.slice(0, visibleCount),
    overflowCount: dayEvents.length - visibleCount,
  };
}

/* ────────────────────────────────────────────────────────────────────────
 * snapToGrid
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Arredonda `date` pro múltiplo de `snapMinutes` mais próximo (meio exato
 * arredonda pra cima — `Math.round` nativo, sem regra especial) e clampa
 * o resultado dentro de `dayRange` e do fim do dia.
 *
 * O clamp em fim de dia existe pro caso de arrastar um evento das 23:50
 * pra baixo com `snapMinutes: 15`: sem ele, o snap geraria silenciosamente
 * um horário no dia seguinte (spec §7 #9). Clampa sempre em `endOfDay`
 * de `date`, nunca em `startOfDay` do dia seguinte — o valor clampado é o
 * que a função devolve, pra quem chamar decidir se ainda quer commitar.
 */
export function snapToGrid(
  date: Date,
  snapMinutes: SchedulerSnapMinutes,
  dayRange: [number, number],
): Date {
  const dayStart = startOfDay(date);
  const minutesSinceMidnight = (date.getTime() - dayStart.getTime()) / 60_000;
  const snappedMinutes =
    Math.round(minutesSinceMidnight / snapMinutes) * snapMinutes;

  const [rangeStartHour, rangeEndHour] = dayRange;
  const rangeStartMin = rangeStartHour * 60;
  const rangeEndMin = Math.min(rangeEndHour * 60, 24 * 60);

  const clampedMinutes = Math.min(
    Math.max(snappedMinutes, rangeStartMin),
    rangeEndMin,
  );

  const snapped = addMinutes(dayStart, clampedMinutes);
  const dayEnd = endOfDay(date);
  return snapped.getTime() > dayEnd.getTime() ? dayEnd : snapped;
}

/* ────────────────────────────────────────────────────────────────────────
 * resolveResize
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Recalcula `start`/`end` de um resize por `deltaMin` minutos na alça
 * `edge`. `deltaMin` chega bruto (não snapado) — esta função aplica o
 * snap de `snapMinutes` sobre o delta antes de somar.
 *
 * Nunca emite `start > end`: arrastar a alça de cima (`edge: "start"`)
 * abaixo da alça de baixo clampa em `end - snapMinutes`; arrastar a alça
 * de baixo (`edge: "end"`) acima da de cima clampa em `start + snapMinutes`
 * (spec §7 #10) — a duração mínima resultante é sempre 1 unidade de snap,
 * nunca 0 (duração 0 é um estado válido só na criação/drag, não como
 * resultado de resize).
 */
export function resolveResize(
  event: SchedulerEvent,
  edge: SchedulerResizeEdge,
  deltaMin: number,
  snapMinutes: SchedulerSnapMinutes,
): { start: Date; end: Date } {
  const snappedDelta = Math.round(deltaMin / snapMinutes) * snapMinutes;

  if (edge === "start") {
    const proposedStart = addMinutes(event.start, snappedDelta);
    const maxStart = addMinutes(event.end, -snapMinutes);
    const start =
      proposedStart.getTime() > maxStart.getTime() ? maxStart : proposedStart;
    return { start, end: event.end };
  }

  const proposedEnd = addMinutes(event.end, snappedDelta);
  const minEnd = addMinutes(event.start, snapMinutes);
  const end = proposedEnd.getTime() < minEnd.getTime() ? minEnd : proposedEnd;
  return { start: event.start, end };
}

/* ────────────────────────────────────────────────────────────────────────
 * minutesToOffset
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Converte `date` num offset vertical (px) a partir do topo da grade
 * (a hora `dayRange[0]`), pra `hourHeight` px por hora.
 *
 * Usa a diferença real em milissegundos entre `date` e o início da grade
 * — nunca `24 * 60` fixo — porque um dia de virada de horário de verão
 * tem 23 ou 25 horas reais, não 24 (spec §7 #8): `startOfDay`/`endOfDay`
 * do date-fns respeitam a hora local, e a diferença de timestamps entre
 * dois pontos do mesmo dia captura a hora real perdida ou ganha na
 * virada. Precisão sub-minuto (ponto flutuante, não `differenceInMinutes`
 * truncado) pro posicionamento durante drag ser pixel-perfect.
 */
export function minutesToOffset(
  date: Date,
  dayRange: [number, number],
  hourHeight: number,
): number {
  const gridStart = addHours(startOfDay(date), dayRange[0]);
  const elapsedMinutes = (date.getTime() - gridStart.getTime()) / 60_000;
  return (elapsedMinutes / 60) * hourHeight;
}
