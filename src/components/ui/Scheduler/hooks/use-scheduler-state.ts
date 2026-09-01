import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  type Locale,
} from "date-fns";
import type { SchedulerView } from "../scheduler.types";

/**
 * Estado de período e de view — controlado OU não-controlado, na mesma
 * gramática que `viewMode`/`defaultViewMode` do `DataTable` já usa com
 * sucesso: passar o par controlado (`date` + `onDateChange`) manda; passar só
 * `defaultDate` deixa o componente guardar.
 *
 * Passar `date` e `defaultDate` juntos é erro de uso: `date` vence e sai um
 * `console.warn` em DEV. Avisar é melhor que escolher em silêncio — o sintoma
 * (a navegação "não anda" porque o consumidor não conectou `onDateChange`) é
 * indistinguível de um bug do componente.
 */

type UseSchedulerStateParams = {
  defaultDate?: Date;
  date?: Date;
  onDateChange?: (date: Date) => void;
  defaultView?: SchedulerView;
  view?: SchedulerView;
  onViewChange?: (view: SchedulerView) => void;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale?: Locale;
  /**
   * "Agora" entra como argumento em vez de o hook chamar `new Date()` — é o
   * que torna o comportamento testável sem congelar o relógio global.
   */
  now: Date;
};

export function useSchedulerState({
  defaultDate,
  date: dateProp,
  onDateChange,
  defaultView,
  view: viewProp,
  onViewChange,
  weekStartsOn,
  locale,
  now,
}: UseSchedulerStateParams) {
  const isDateControlled = dateProp !== undefined;
  const isViewControlled = viewProp !== undefined;

  const [dateState, setDateState] = useState<Date>(
    () => defaultDate ?? startOfDay(now),
  );
  const [viewState, setViewState] = useState<SchedulerView>(
    () => defaultView ?? "month",
  );

  const date = isDateControlled ? dateProp : dateState;
  const view = isViewControlled ? viewProp : viewState;

  /* ── Avisos de uso, só em DEV e só uma vez por montagem ──────────── */
  const warned = useRef(false);
  useEffect(() => {
    if (!import.meta.env?.DEV || warned.current) return;
    if (dateProp !== undefined && defaultDate !== undefined) {
      warned.current = true;
      console.warn(
        "[Scheduler] `date` e `defaultDate` foram passados juntos. `date` vence — remova `defaultDate`.",
      );
    }
    if (viewProp !== undefined && defaultView !== undefined) {
      warned.current = true;
      console.warn(
        "[Scheduler] `view` e `defaultView` foram passados juntos. `view` vence — remova `defaultView`.",
      );
    }
    if (dateProp !== undefined && onDateChange === undefined) {
      warned.current = true;
      console.warn(
        "[Scheduler] `date` foi passado sem `onDateChange`: a navegação de período não vai andar. Use `defaultDate` para o modo não-controlado.",
      );
    }
    if (viewProp !== undefined && onViewChange === undefined) {
      warned.current = true;
      console.warn(
        "[Scheduler] `view` foi passado sem `onViewChange`: o segmented não vai trocar de view. Use `defaultView` para o modo não-controlado.",
      );
    }
  }, [dateProp, defaultDate, viewProp, defaultView, onDateChange, onViewChange]);

  /* ── Commits ────────────────────────────────────────────────────── */

  const commitDate = useCallback(
    (next: Date) => {
      if (!isDateControlled) setDateState(next);
      onDateChange?.(next);
    },
    [isDateControlled, onDateChange],
  );

  const commitView = useCallback(
    (next: SchedulerView) => {
      if (!isViewControlled) setViewState(next);
      onViewChange?.(next);
    },
    [isViewControlled, onViewChange],
  );

  /* ── Navegação ──────────────────────────────────────────────────── */

  /**
   * O passo depende da view: mês anda mês, semana anda semana, e **dia e
   * lista andam dia**. A `list` andar por dia é decisão consciente — ela
   * mostra a agenda a partir da âncora, então pular um mês inteiro por
   * clique deixaria o usuário perdido.
   */
  const shift = useCallback(
    (direction: 1 | -1) => {
      const step =
        view === "month"
          ? addMonths(date, direction)
          : view === "week"
            ? addWeeks(date, direction)
            : addDays(date, direction);
      commitDate(startOfDay(step));
    },
    [commitDate, date, view],
  );

  const next = useCallback(() => shift(1), [shift]);
  const prev = useCallback(() => shift(-1), [shift]);
  const goToToday = useCallback(
    () => commitDate(startOfDay(now)),
    [commitDate, now],
  );
  const goToDate = useCallback(
    (target: Date) => commitDate(startOfDay(target)),
    [commitDate],
  );

  /* ── Janela visível ─────────────────────────────────────────────── */

  /**
   * O intervalo que a view realmente mostra. Existe pra `filterMode="server"`:
   * o consumidor precisa saber o que buscar, e derivar isso de fora
   * duplicaria a regra de alinhamento de semana.
   *
   * ⚠️ No mês a janela é a **grade**, não o mês: ela inclui os dias vizinhos
   * das linhas de borda. Buscar só `startOfMonth`–`endOfMonth` deixaria as
   * duas pontas da grade vazias — é o caso que parece "sumiram eventos".
   */
  const visibleRange = useMemo((): { start: Date; end: Date } => {
    switch (view) {
      case "month": {
        const gridStart = startOfWeek(startOfMonth(date), {
          weekStartsOn,
          locale,
        });
        // 42 dias fixos, espelhando `buildMonthMatrix` (6 linhas sempre).
        return { start: gridStart, end: endOfDay(addDays(gridStart, 41)) };
      }
      case "week":
        return {
          start: startOfWeek(date, { weekStartsOn, locale }),
          end: endOfWeek(date, { weekStartsOn, locale }),
        };
      case "day":
        return { start: startOfDay(date), end: endOfDay(date) };
      case "list":
      default:
        // A agenda mostra o mês corrente inteiro — o recorte natural de
        // "próximos compromissos" sem inventar um horizonte arbitrário.
        return { start: startOfMonth(date), end: endOfMonth(date) };
    }
  }, [date, view, weekStartsOn, locale]);

  return {
    date,
    view,
    setDate: commitDate,
    setView: commitView,
    next,
    prev,
    goToToday,
    goToDate,
    visibleRange,
  };
}
