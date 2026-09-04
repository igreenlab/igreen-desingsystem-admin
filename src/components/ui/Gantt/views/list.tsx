import { useMemo, type MouseEvent, type ReactNode } from "react";
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  isSameDay,
  startOfDay,
  type Locale,
} from "date-fns";
import { CalendarSearch } from "lucide-react";
import {
  ganttEmpty,
  ganttEmptyText,
  ganttListDay,
  ganttListDayHead,
  ganttListDayName,
  ganttListDayNumber,
  ganttListFrame,
  ganttListItem,
  ganttListItems,
} from "../gantt.styles";
import type { GanttBar, GanttColorKey, GanttRow } from "../gantt.types";
import type { GanttFlatRow } from "../hooks/layout";

/**
 * Visão `list` — a agenda.
 *
 * ## A pergunta que ela responde
 *
 * `timeline` responde *"o que depende do quê"*. `calendar` responde *"o que
 * acontece no dia 12"*. Esta responde **"o que estou fazendo hoje, e amanhã"** —
 * a leitura sequencial, sem eixo pra varrer nem grade pra achar a célula.
 *
 * ⚠️ **Não é uma tabela de tarefas.** Tabela de tarefas com hierarquia e filtro
 * é o `DataTable` (view lista, `hierarchical`), e reimplementá-lo aqui seria a
 * terceira cópia da mesma coisa no DS. O que faz esta visão diferente é o
 * agrupamento por **DIA**: a mesma tarefa aparece em cada dia que ela ocupa.
 *
 * ## Só os dias QUE TÊM tarefa
 *
 * A grade do mês mostra 42 dias porque a grade *é* a informação — um dia vazio
 * ali diz "nada neste terça". Aqui não: uma agenda que lista 60 dias pra mostrar
 * 20 tarefas obriga a rolar por 40 blocos vazios. Dia sem tarefa não aparece, e
 * o salto entre datas é o próprio sinal de que não há nada no meio.
 *
 * Regra copiada do `SchedulerListView`, que chegou nela pelo mesmo raciocínio.
 *
 * ## O metadado da direita é a POSIÇÃO no intervalo
 *
 * Uma agenda de eventos mostra a hora ali. Um cronograma não tem hora — mostra
 * `dia 2 de 6`. E isso não é enfeite: numa tarefa repetida em 6 blocos
 * consecutivos, o intervalo (`18/09 – 23/09`) seria idêntico nos seis e não diria
 * nada de novo; a posição diz **onde no trabalho aquele dia está**, que é
 * informação que nenhuma das outras duas visões dá sem contar colunas.
 */

export type GanttListViewProps = {
  /** Linhas JÁ filtradas e achatadas — mesma entrada das outras views. */
  rows: GanttFlatRow[];
  /**
   * O período a listar — o MÊS visível, não a janela do eixo (ver a nota do
   * `mesVisivel` no `gantt.tsx`). A agenda lista os dias DELE que têm tarefa.
   */
  windowStart: Date;
  windowEnd: Date;
  now: Date;
  locale?: Locale;

  conflictBarIds: ReadonlySet<string>;
  criticalBarIds: ReadonlySet<string>;

  onBarClick?: (bar: GanttBar, row: GanttRow, evt: MouseEvent) => void;
  emptyState?: ReactNode;
};

type Item = {
  bar: GanttBar;
  row: GanttRow;
  colorKey: GanttColorKey;
  /** Qual dia do intervalo é este (1-based) e quantos são no total. */
  diaDoIntervalo: number;
  totalDeDias: number;
};

export function GanttListView({
  rows,
  windowStart,
  windowEnd,
  now,
  locale,
  conflictBarIds,
  criticalBarIds,
  onBarClick,
  emptyState,
}: GanttListViewProps) {
  /**
   * Dias com tarefa, na ordem, cada um com as tarefas que o ocupam.
   *
   * ⚠️ Linha `summary` fica FORA, como na grade de mês: o intervalo dela é a
   * união dos filhos, então ela apareceria em todos os dias que os filhos já
   * ocupam — 20 linhas viram 40 sem uma informação nova.
   */
  const dias = useMemo(() => {
    const jIni = startOfDay(windowStart);
    const jFim = startOfDay(windowEnd);
    if (differenceInCalendarDays(jFim, jIni) < 0) return [];

    const mapa = new Map<string, { dia: Date; itens: Item[] }>();

    for (const { row } of rows) {
      if ((row.type ?? "task") === "summary") continue;
      for (const bar of row.bars) {
        const bIni = startOfDay(bar.start);
        const bFim = startOfDay(bar.end);
        // Intervalo invertido é dado torto do consumidor; `eachDayOfInterval`
        // lança com ele em vez de devolver lista vazia.
        if (differenceInCalendarDays(bFim, bIni) < 0) continue;

        const totalDeDias = differenceInCalendarDays(bFim, bIni) + 1;

        // Recorta na janela ANTES de expandir: uma barra de 2 anos fora da
        // janela geraria 730 iterações pra nada.
        const de = differenceInCalendarDays(bIni, jIni) < 0 ? jIni : bIni;
        const ate = differenceInCalendarDays(bFim, jFim) > 0 ? jFim : bFim;
        if (differenceInCalendarDays(ate, de) < 0) continue;

        for (const dia of eachDayOfInterval({ start: de, end: ate })) {
          // Chave `yyyy-MM-dd` e não o timestamp: barras com horário diferente
          // no mesmo dia cairiam em buckets separados e o dia apareceria duas
          // vezes na agenda.
          const chave = format(dia, "yyyy-MM-dd");
          const balde = mapa.get(chave) ?? { dia, itens: [] };
          balde.itens.push({
            bar,
            row,
            colorKey: bar.colorKey ?? "chart-1",
            diaDoIntervalo: differenceInCalendarDays(dia, bIni) + 1,
            totalDeDias,
          });
          mapa.set(chave, balde);
        }
      }
    }

    return [...mapa.entries()]
      // Ordena pela CHAVE (`yyyy-MM-dd` é lexicograficamente cronológica), não
      // pela ordem de inserção — que é a ordem das linhas, não a das datas.
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [rows, windowStart, windowEnd]);

  if (dias.length === 0) {
    return (
      <div className={ganttListFrame()}>
        <div className={ganttEmpty()}>
          {emptyState ?? (
            <>
              <CalendarSearch className="size-icon-xl text-fg-subtle" aria-hidden />
              <span className={ganttEmptyText()}>
                Nenhuma tarefa neste período.
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={ganttListFrame()}>
      {dias.map(({ dia, itens }) => {
        const hoje = isSameDay(dia, now);
        return (
          <div key={format(dia, "yyyy-MM-dd")} className={ganttListDay()}>
            <div className={ganttListDayHead()}>
              <span className={ganttListDayNumber({ today: hoje })}>
                {format(dia, "d", { locale })}
              </span>
              <span className={ganttListDayName()}>
                {format(dia, "EEEE, MMMM", { locale })}
              </span>
            </div>

            <div className={ganttListItems()}>
              {itens.map(({ bar, row, colorKey, diaDoIntervalo, totalDeDias }) => {
                const estilos = ganttListItem({
                  colorKey,
                  conflict: conflictBarIds.has(bar.id),
                  critical: criticalBarIds.has(bar.id),
                });
                return (
                  <button
                    key={`${format(dia, "yyyy-MM-dd")}-${bar.id}`}
                    type="button"
                    className={estilos.root()}
                    onClick={(e) => onBarClick?.(bar, row, e)}
                  >
                    <span className={estilos.dot()} aria-hidden />
                    <span className={estilos.body()}>
                      <span className={estilos.title()}>
                        {typeof row.label === "string" ? row.label : bar.id}
                      </span>
                      {/*
                        ⚠️ Numa linha com VÁRIAS barras, a sublinha é o rótulo da
                        BARRA — não o `sublabel` da linha.

                        Medido no exemplo: a linha "Sustentação (paralelo)" tem 3
                        barras, e mostrando só `row.label` + `row.sublabel` ela
                        aparecia TRÊS VEZES no mesmo dia, com título e sublinha
                        idênticos e só o "dia N de M" diferente. Três cartões
                        indistinguíveis é pior que um cartão errado: o usuário
                        não tem como saber qual frente é qual.

                        Com uma barra só, o `sublabel` da linha é a informação
                        certa ("5 sessões · Ana") e o rótulo da barra seria
                        redundante com o título.
                      */}
                      {row.bars.length > 1 && bar.label ? (
                        <span className={estilos.sub()}>{bar.label}</span>
                      ) : row.sublabel ? (
                        <span className={estilos.sub()}>{row.sublabel}</span>
                      ) : null}
                    </span>
                    <span className={estilos.meta()}>
                      {totalDeDias === 1
                        ? "dia único"
                        : `dia ${diaDoIntervalo} de ${totalDeDias}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
