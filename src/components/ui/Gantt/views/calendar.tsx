import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import type { Locale } from "date-fns";
import {
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfDay,
} from "date-fns";
import {
  ganttDayChip,
  ganttDayNumber,
  ganttMonthCell,
  ganttMonthFrame,
  ganttMonthGrid,
  ganttOverflowButton,
  ganttWeekdayCell,
  ganttWeekdayRow,
} from "../gantt.styles";
import { buildMonthMatrix, computeOverflow } from "../hooks/layout";
import type { GanttBar, GanttColorKey, GanttRow } from "../gantt.types";
import type { GanttFlatRow } from "../hooks/layout";

/**
 * Visão `calendar` — a grade de mês.
 *
 * ## O que esta visão responde, e que a `timeline` não responde
 *
 * A `timeline` responde *"o que depende do quê"*. Esta responde **"o que está
 * acontecendo no dia 12?"** — pergunta que num eixo horizontal exige varrer 20
 * linhas com o dedo na coluna. São perguntas diferentes sobre o mesmo dado, e é
 * por isso que as duas existem.
 *
 * ⛔ **O que ela NÃO tem, e é decisão:** setas de vínculo. Numa grade de mês, uma
 * seta entre o dia 3 e o dia 19 atravessaria três linhas de semana passando por
 * cima de 16 células que nada têm a ver com o vínculo. O grafo continua vivo
 * (`onLinkViolations` segue emitindo, o conflito segue marcado no chip); o que
 * sai é o desenho, porque nesta geometria ele não informa — atrapalha.
 *
 * ## Grade própria, não a do `Scheduler`
 *
 * A spec §5 registra a decisão e o preço. Delegar criaria acoplamento por
 * herança de propósito: necessidade nova do Gantt viraria mudança numa API
 * publicada que serve outros consumidores. O preço é haver duas grades de mês no
 * repo — e o que a duplicação não pode causar é divergência silenciosa de
 * layout, que é por que `buildMonthMatrix` e `computeOverflow` têm teste próprio
 * sobre as mesmas bordas (mês que começa no domingo, fevereiro comum, virada de
 * ano).
 *
 * ## A barra ocupa TODOS os dias que atravessa
 *
 * Uma tarefa de 10 a 15 aparece em 6 células, não só na do dia 10. É a diferença
 * entre "cronograma" e "agenda": a tarefa não acontece num instante, ela ocupa
 * um intervalo. Isso é o que faz a grade de mês de um Gantt ser diferente da de
 * um calendário de eventos.
 */

export type GanttCalendarViewProps = {
  /** Linhas JÁ filtradas e achatadas — mesma entrada da `timeline`. */
  rows: GanttFlatRow[];
  /** Mês âncora. Vem da janela, pra as duas visões falarem do mesmo período. */
  anchor: Date;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  now: Date;
  locale?: Locale;

  conflictBarIds: ReadonlySet<string>;
  criticalBarIds: ReadonlySet<string>;

  onBarClick?: (bar: GanttBar, row: GanttRow, evt: MouseEvent) => void;
};

/**
 * Altura de um chip + o respiro, em px. **Medido no browser, não estimado.**
 *
 * ⚠️ Eu tinha escrito 22, "casado com `min-h-comp-2xs`", e o chip real mede
 * **18** — o `min-h` é piso, não altura. Com o `gap-gp-2xs` de 2px, a fatia é
 * 20. O erro de 2px por chip somava o suficiente pra o corte cair de 2 pra 1.
 */
const ALTURA_DO_CHIP_PX = 20;

/**
 * O que o número do dia + os paddings consomem antes do primeiro chip.
 *
 * Medido: `p-pad-sm` = 6px em cima e embaixo, número do dia = 14px. 6+14+6 = 26.
 */
const ALTURA_DO_CABECALHO_PX = 26;

/** Piso: abaixo de 1 chip visível a célula viraria só um "+N mais". */
const MIN_CHIPS = 1;

type Entrada = { bar: GanttBar; row: GanttRow; colorKey: GanttColorKey };

export function GanttCalendarView({
  rows,
  anchor,
  weekStartsOn,
  now,
  locale,
  conflictBarIds,
  criticalBarIds,
  onBarClick,
}: GanttCalendarViewProps) {
  const semanas = useMemo(
    () => buildMonthMatrix(anchor, weekStartsOn),
    [anchor, weekStartsOn],
  );

  /**
   * Índice dia → barras que o ocupam.
   *
   * ⚠️ Chave é `yyyy-MM-dd` e não o timestamp: barras com horário diferente no
   * mesmo dia teriam timestamps diferentes e cairiam em buckets separados — a
   * tarefa apareceria duas vezes na mesma célula.
   *
   * Linha `summary` fica FORA: o intervalo dela é a união dos filhos, então ela
   * pintaria todas as células que os filhos já pintam. Numa grade de mês isso é
   * ruído puro (a hierarquia não é visível aqui pra dar sentido ao agregado).
   */
  const porDia = useMemo(() => {
    const mapa = new Map<string, Entrada[]>();
    for (const { row } of rows) {
      if ((row.type ?? "task") === "summary") continue;
      for (const bar of row.bars) {
        const ini = startOfDay(bar.start);
        const fim = startOfDay(bar.end);
        // `isWithinInterval` estoura com intervalo invertido; o clamp do gesto
        // impede isso, mas dado do consumidor pode vir torto.
        if (fim < ini) continue;
        for (const semana of semanas) {
          for (const dia of semana) {
            if (!isWithinInterval(dia, { start: ini, end: fim })) continue;
            const chave = format(dia, "yyyy-MM-dd");
            const lista = mapa.get(chave);
            const entrada: Entrada = {
              bar,
              row,
              colorKey: bar.colorKey ?? "chart-1",
            };
            if (lista) lista.push(entrada);
            else mapa.set(chave, [entrada]);
          }
        }
      }
    }
    return mapa;
  }, [rows, semanas]);

  /** Células com o "+N mais" abertos — por dia, não global. */
  const [expandidos, setExpandidos] = useState<Set<string>>(() => new Set());

  /**
   * ⚠️ `useRef` pra os rótulos de dia da semana e não um array no módulo.
   *
   * Eles dependem do `locale` e do `weekStartsOn`, e um array de módulo
   * congelaria o primeiro locale que a página usasse — o defeito só apareceria
   * numa tela com dois `Gantt` em idiomas diferentes.
   */
  const rotulosDaSemana = useMemo(() => {
    const primeira = semanas[0] ?? [];
    return primeira.map((d) => format(d, "EEEEEE", { locale }));
  }, [semanas, locale]);

  const gradeRef = useRef<HTMLDivElement>(null);

  /**
   * ## Quantos chips cabem numa célula — MEDIDO, não constante
   *
   * ⚠️ A primeira versão usava `MAX_CHIPS_POR_CELULA = 3` fixo, e o screenshot
   * mostrou o defeito: numa grade de 6 linhas em ~280px de altura, a célula tem
   * ~46px e cabe **1 chip** — os outros dois e o próprio "+N mais" eram
   * recortados pelo `overflow-hidden`. O usuário via 2 chips e nenhuma pista de
   * que havia mais.
   *
   * Pior: o JSDoc do `GanttFullPreview` já dizia que "foi ele que revelou que a
   * célula do mês precisava adaptar o corte à altura medida" — sobre o
   * `Scheduler`. A lição estava escrita e eu repeti o erro (L-060: comentário é
   * load-bearing, mas só se alguém ler o dele antes de escrever o próprio).
   *
   * `ResizeObserver` e não medição única: a grade é `flex-1`, então a altura
   * muda quando a toolbar quebra em duas linhas, quando os chips de filtro
   * aparecem, e ao redimensionar a janela.
   */
  const [maxChips, setMaxChips] = useState(MIN_CHIPS);

  useEffect(() => {
    const el = gradeRef.current;
    if (!el) return;

    const medir = () => {
      // A altura REAL da primeira célula, não a da grade dividida por 6: com
      // `minmax` + rolagem, a grade pode ser mais alta que a viewport e a
      // divisão daria um valor que nenhuma célula tem.
      const primeira = el.firstElementChild;
      const alturaDaCelula = primeira
        ? primeira.getBoundingClientRect().height
        : el.getBoundingClientRect().height / 6;
      const util = alturaDaCelula - ALTURA_DO_CABECALHO_PX;
      const cabem = Math.floor(util / ALTURA_DO_CHIP_PX);
      setMaxChips(Math.max(MIN_CHIPS, cabem));
    };

    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={ganttMonthFrame()}>
      <div className={ganttWeekdayRow()}>
        {rotulosDaSemana.map((r, i) => (
          <div key={i} className={ganttWeekdayCell()}>
            {r}
          </div>
        ))}
      </div>

      <div className={ganttMonthGrid()} ref={gradeRef}>
        {semanas.flatMap((semana) =>
          semana.map((dia) => {
            const chave = format(dia, "yyyy-MM-dd");
            const todas = porDia.get(chave) ?? [];
            const aberta = expandidos.has(chave);
            const { visible, overflowCount } = aberta
              ? { visible: todas.length, overflowCount: 0 }
              : computeOverflow(todas.length, maxChips);
            const dow = dia.getDay();

            return (
              <div
                key={chave}
                /*
                  ⚠️ A célula ABERTA solta o `overflow` e ganha z-index: sem
                  isso, expandir o "+N mais" não mostrava nada — os chips
                  extras nasciam e eram recortados pela mesma altura fixa que
                  os escondia. Aberta, ela cresce por cima das vizinhas.
                */
                style={
                  aberta
                    ? { overflow: "visible", zIndex: 2, position: "relative" }
                    : undefined
                }
                className={ganttMonthCell({
                  outside: !isSameMonth(dia, anchor),
                  today: isSameDay(dia, now),
                  weekend: dow === 0 || dow === 6,
                })}
              >
                <span className={ganttDayNumber({ today: isSameDay(dia, now) })}>
                  {format(dia, "d", { locale })}
                </span>

                {todas.slice(0, visible).map(({ bar, row, colorKey }) => {
                  const estilos = ganttDayChip({ colorKey });
                  const emConflito = conflictBarIds.has(bar.id);
                  const critica = criticalBarIds.has(bar.id);
                  return (
                    <button
                      key={`${chave}-${bar.id}`}
                      type="button"
                      /**
                       * Conflito e crítico entram por marcação NÃO-cromática
                       * somada à cor, igual na `timeline`: aqui a cor já
                       * significa CATEGORIA, então pintar o conflito de vermelho
                       * trocaria uma informação por outra.
                       */
                      className={
                        estilos.root() +
                        (emConflito ? " border-dashed !border-border-danger-muted" : "") +
                        (critica ? " ring-2 ring-bg-danger/50" : "")
                      }
                      onClick={(e) => onBarClick?.(bar, row, e)}
                      title={bar.searchText ?? undefined}
                    >
                      <span className={estilos.dot()} aria-hidden />
                      <span className={estilos.label()}>
                        {bar.label ??
                          (typeof row.label === "string" ? row.label : bar.id)}
                      </span>
                    </button>
                  );
                })}

                {overflowCount > 0 ? (
                  <button
                    type="button"
                    className={ganttOverflowButton()}
                    onClick={() =>
                      setExpandidos((prev) => {
                        const proximo = new Set(prev);
                        proximo.add(chave);
                        return proximo;
                      })
                    }
                  >
                    {`+${overflowCount} mais`}
                  </button>
                ) : null}

                {/*
                  Recolher só aparece na célula ABERTA — um botão de recolher em
                  toda célula seria 42 controles inertes na tela.
                */}
                {aberta && todas.length > maxChips ? (
                  <button
                    type="button"
                    className={ganttOverflowButton()}
                    onClick={() =>
                      setExpandidos((prev) => {
                        const proximo = new Set(prev);
                        proximo.delete(chave);
                        return proximo;
                      })
                    }
                  >
                    Recolher
                  </button>
                ) : null}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
