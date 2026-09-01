import { useMemo, useState } from "react";
import {
  addMonths,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  type Locale,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  schedulerMiniDay,
  schedulerMiniGrid,
  schedulerMiniHead,
  schedulerMiniTitle,
  schedulerMiniWeekday,
} from "../scheduler.styles";
import { buildMonthMatrix } from "../hooks/layout";
import type { SchedulerEvent } from "../scheduler.types";

/**
 * Mini-calendário do painel de filtro — o mesmo papel que ele tem na barra
 * lateral do Google Calendar: **saltar de data**, não filtrar.
 *
 * Reusa `buildMonthMatrix` de `hooks/layout.ts`, a mesma função da grade
 * grande. Não é economia de linhas: é o que garante que os dois concordem
 * sobre onde a semana começa e sobre a grade ter 6 linhas fixas. Uma segunda
 * implementação aqui divergiria na virada de mês, e o usuário veria o
 * mini-calendário marcar um dia e a grade abrir outro.
 *
 * O mês do mini navega **independente** da grade (estado próprio): procurar
 * "aquela semana de dezembro" não deve arrastar a view principal a cada
 * clique na seta. Clicar num dia é que move as duas — e ressincroniza o mini.
 */

export type MiniMonthProps = {
  /** Data-âncora da view principal — é o dia pintado como selecionado. */
  selected: Date;
  now: Date;
  locale?: Locale;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Eventos já filtrados: o ponto de "tem coisa nesse dia" segue o filtro. */
  events: SchedulerEvent[];
  onSelect: (date: Date) => void;
};

export function MiniMonth({
  selected,
  now,
  locale,
  weekStartsOn,
  events,
  onSelect,
}: MiniMonthProps) {
  /**
   * `offset` em MESES em vez de guardar uma `Date`: assim, quando a view
   * principal muda de período por fora (setas da toolbar, "Hoje", `goToDate`
   * do ref), o mini reancora sozinho em `selected` sem precisar de `useEffect`
   * de sincronização — que é a fonte clássica de estado duplicado divergindo.
   */
  const [offset, setOffset] = useState(0);
  const cursor = useMemo(
    () => addMonths(startOfDay(selected), offset),
    [selected, offset],
  );

  const weeks = useMemo(
    () => buildMonthMatrix(cursor, weekStartsOn, locale),
    [cursor, weekStartsOn, locale],
  );

  /** Set de dias que têm evento, pra destacar sem varrer a lista por célula. */
  const daysWithEvents = useMemo(() => {
    const set = new Set<number>();
    for (const ev of events) {
      // Marca cada dia do intervalo, não só o início: um offsite de 3 dias
      // deve destacar os 3.
      let cur = startOfDay(ev.start);
      const last = startOfDay(ev.end);
      let guard = 0;
      while (cur.getTime() <= last.getTime() && guard < 400) {
        set.add(cur.getTime());
        cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
        guard++;
      }
    }
    return set;
  }, [events]);

  const weekdayLabels = useMemo(
    () => weeks[0].map((day) => format(day, "EEEEE", { locale })),
    [weeks, locale],
  );

  return (
    <div className="flex flex-col gap-gp-md">
      <div className={schedulerMiniHead()}>
        <span className={schedulerMiniTitle()}>
          {format(cursor, "MMMM yyyy", { locale })}
        </span>
        <div className="flex shrink-0 items-center">
          <Button
            variant="ghost"
            color="secondary"
            size="icon-2xs"
            aria-label="Mês anterior"
            onClick={() => setOffset((o) => o - 1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            color="secondary"
            size="icon-2xs"
            aria-label="Próximo mês"
            onClick={() => setOffset((o) => o + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className={schedulerMiniGrid()}>
        {weekdayLabels.map((label, i) => (
          <span key={`${label}-${i}`} className={schedulerMiniWeekday()}>
            {label}
          </span>
        ))}

        {weeks.flat().map((day) => (
          <button
            key={day.getTime()}
            type="button"
            onClick={() => {
              onSelect(day);
              // Volta o cursor pro mês do dia escolhido: o `offset` é relativo
              // a `selected`, que acabou de mudar pra este dia.
              setOffset(0);
            }}
            aria-label={format(day, "PPPP", { locale })}
            aria-current={isSameDay(day, selected) ? "date" : undefined}
            className={schedulerMiniDay({
              outside: !isSameMonth(day, cursor),
              hasEvents: daysWithEvents.has(day.getTime()),
              today: isSameDay(day, now),
              selected: isSameDay(day, selected),
            })}
          >
            {format(day, "d", { locale })}
          </button>
        ))}
      </div>
    </div>
  );
}
