import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import type { Locale } from "date-fns";
import { format, isSameDay, isSameMonth, startOfDay } from "date-fns";
import { Plus } from "lucide-react";
import {
  ganttDayAdd,
  ganttDayNumber,
  ganttDaySegment,
  ganttMonthCell,
  ganttMonthFrame,
  ganttMonthGrid,
  ganttOverflowButton,
  ganttWeekDays,
  ganttWeekRow,
  ganttWeekSegments,
  ganttWeekdayCell,
  ganttWeekdayRow,
} from "../gantt.styles";
import { buildMonthMatrix } from "../hooks/layout";
import {
  buildWeekSegments,
  hiddenPerColumn,
  laneCount,
} from "../hooks/week-segments";
import type { GanttBar, GanttColorKey, GanttRow } from "../gantt.types";
import type { GanttFlatRow } from "../hooks/layout";

/**
 * Visão `calendar` — a grade de mês.
 *
 * ## O que esta visão responde, e que a `timeline` não responde
 *
 * A `timeline` responde *"o que depende do quê"*. Esta responde **"o que está
 * acontecendo no dia 12?"** — pergunta que num eixo horizontal exige varrer 20
 * linhas com o dedo na coluna. São perguntas diferentes sobre o mesmo dado.
 *
 * ## A barra é UM segmento contínuo, não um chip por dia
 *
 * ⚠️ A primeira versão desenhava um chip por dia: uma tarefa de 10 a 15 virava
 * **6 chips soltos**, um em cada célula, cada um repetindo o mesmo nome. Lê como
 * seis tarefas de um dia em vez de uma de seis — o oposto do que um cronograma
 * precisa dizer. Foi o motivo de a estrutura da grade mudar: 42 células soltas
 * num `grid` não permitem que um elemento atravesse colunas.
 *
 * Agora cada semana é uma linha com duas camadas — as 7 células de fundo e uma
 * camada absoluta de segmentos. Uma tarefa que cruza a virada de semana produz
 * dois segmentos, cada um com a ponta cortada marcada
 * (`continuesBefore`/`continuesAfter`), no mesmo vocabulário da timeline.
 *
 * Geometria e lanes vivem em `hooks/week-segments.ts`, com 24 testes — inclusive
 * a borda que me corrigiu (barra que começa no primeiro dia da semana **não** é
 * `continuesBefore`).
 *
 * ⛔ **Sem setas de vínculo, e é decisão.** Numa grade de mês uma seta do dia 3
 * ao 19 atravessaria três linhas de semana passando por cima de 16 células que
 * nada têm a ver com o vínculo. O grafo continua vivo (`onLinkViolations` segue
 * emitindo, o conflito segue marcado no segmento); sai o desenho, porque nesta
 * geometria ele não informa.
 *
 * ## Grade própria, não a do `Scheduler`
 *
 * A spec §5 registra a decisão e o preço. Delegar criaria acoplamento por
 * herança de propósito. O que a duplicação não pode causar é divergência
 * silenciosa de layout, e é por isso que `buildMonthMatrix` tem teste próprio
 * sobre as mesmas bordas (mês que começa no domingo, fevereiro comum, virada de
 * ano).
 */

export type GanttCalendarViewProps = {
  /** Linhas JÁ filtradas e achatadas — mesma entrada da `timeline`. */
  rows: GanttFlatRow[];
  /** Mês âncora. Vem do MEIO da janela — ver a nota no `gantt.tsx`. */
  anchor: Date;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  now: Date;
  locale?: Locale;

  conflictBarIds: ReadonlySet<string>;
  criticalBarIds: ReadonlySet<string>;

  onBarClick?: (bar: GanttBar, row: GanttRow, evt: MouseEvent) => void;
  /**
   * Adicionar no dia. **Sem isto o "+" não é renderizado** — um botão que não
   * adiciona nada é pior que a ausência dele, mesma regra do toggle de caminho
   * crítico sem vínculo.
   */
  onDayAdd?: (date: Date) => void;
};

/**
 * Altura de uma faixa de segmento (18px do segmento + 2 de respiro).
 *
 * ⚠️ Medido, não estimado. Na versão de chips eu escrevi 22, "casado com
 * `min-h-comp-2xs`", e o elemento media **18** — o `min-h` é piso, não altura. O
 * erro de 2px por faixa somava o suficiente pra o corte cair de 2 pra 1.
 */
const ALTURA_DA_FAIXA_PX = 20;

/** O que o número do dia + os paddings consomem antes da primeira faixa. */
const ALTURA_DO_CABECALHO_PX = 26;

/** Piso: com 0 faixas visíveis a semana viraria só uma fileira de "+N mais". */
const MIN_FAIXAS = 1;

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
  onDayAdd,
}: GanttCalendarViewProps) {
  const semanas = useMemo(
    () => buildMonthMatrix(anchor, weekStartsOn),
    [anchor, weekStartsOn],
  );

  /**
   * As barras que entram na grade, indexadas por id.
   *
   * Linha `summary` fica FORA: o intervalo dela é a união dos filhos, então ela
   * pintaria exatamente as células que os filhos já pintam. Numa grade de mês
   * isso é ruído puro — a hierarquia não é visível aqui pra dar sentido ao
   * agregado.
   */
  const entradas = useMemo(() => {
    const mapa = new Map<string, Entrada>();
    for (const { row } of rows) {
      if ((row.type ?? "task") === "summary") continue;
      for (const bar of row.bars) {
        mapa.set(bar.id, { bar, row, colorKey: bar.colorKey ?? "chart-1" });
      }
    }
    return mapa;
  }, [rows]);

  const barrasParaSegmentar = useMemo(
    () =>
      [...entradas.values()].map(({ bar }) => ({
        id: bar.id,
        start: startOfDay(bar.start),
        end: startOfDay(bar.end),
      })),
    [entradas],
  );

  /** Segmentos por semana — índice do array = índice da semana. */
  const porSemana = useMemo(
    () =>
      semanas.map((semana) => buildWeekSegments(semana, barrasParaSegmentar)),
    [semanas, barrasParaSegmentar],
  );

  /** Semanas com o "+N mais" aberto. Por semana, não global. */
  const [expandidas, setExpandidas] = useState<Set<number>>(() => new Set());

  const gradeRef = useRef<HTMLDivElement>(null);

  /**
   * ## Quantas faixas cabem numa linha de semana — MEDIDO, não constante
   *
   * ⚠️ A primeira versão usava um máximo fixo e o defeito foi medido: numa
   * viewport curta a linha saía com 68px, que depois do número do dia (14) e dos
   * paddings (12) deixa 42px — 2 faixas. Os segmentos extras e o próprio "+N
   * mais" eram recortados pelo `overflow-hidden`: o usuário via 2 tarefas e
   * nenhuma pista de que havia 4.
   *
   * Pior: o JSDoc do `GanttFullPreview` já dizia que "foi ele que revelou que a
   * célula do mês precisava adaptar o corte à altura medida" — sobre o
   * `Scheduler`. A lição estava escrita neste repo e eu repeti o erro.
   *
   * `ResizeObserver` e não medição única: a linha é `flex-1`, então a altura muda
   * quando a toolbar quebra em duas, quando os chips de filtro aparecem, e ao
   * redimensionar a janela.
   */
  const [maxFaixas, setMaxFaixas] = useState(3);

  useEffect(() => {
    const el = gradeRef.current;
    if (!el) return;

    const medir = () => {
      // A altura REAL da primeira linha, não a da grade dividida por 6: a grade
      // rola, então pode ser mais alta que a viewport e a divisão daria um valor
      // que nenhuma linha tem.
      const primeira = el.firstElementChild;
      const altura = primeira
        ? primeira.getBoundingClientRect().height
        : el.getBoundingClientRect().height / 6;
      const util = altura - ALTURA_DO_CABECALHO_PX;
      setMaxFaixas(Math.max(MIN_FAIXAS, Math.floor(util / ALTURA_DA_FAIXA_PX)));
    };

    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /**
   * ⚠️ Os rótulos de dia da semana saem da PRIMEIRA semana da matriz, não de um
   * array de módulo. Um array congelaria o primeiro `locale`/`weekStartsOn` que
   * a página usasse — o defeito só apareceria numa tela com dois `Gantt` em
   * idiomas diferentes.
   */
  const rotulosDaSemana = useMemo(
    () => (semanas[0] ?? []).map((d) => format(d, "EEEEEE", { locale })),
    [semanas, locale],
  );

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
        {semanas.map((semana, iSemana) => {
          const segmentos = porSemana[iSemana] ?? [];
          const aberta = expandidas.has(iSemana);
          const total = laneCount(segmentos);
          /**
           * ⚠️ A linha do "+N mais" ocupa **uma fatia do mesmo tamanho de uma
           * faixa** — então quando há estouro, cabe uma faixa MENOS.
           *
           * É a regra que o `computeOverflow` do núcleo já implementava e que eu
           * contornei ao trocar chips por lanes. O resultado medido: com
           * `maxFaixas = 3` numa linha de 88px, o botão ia pra `top: 86` e era
           * recortado pela própria linha — 12 botões existindo no DOM e nenhum
           * na tela, que é pior que não ter estouro nenhum.
           *
           * Piso de 1: com `maxFaixas = 1` a conta daria zero faixas, e a semana
           * viraria uma fileira de "+N mais" sem nenhuma tarefa visível.
           */
          const visiveis = aberta
            ? total
            : total > maxFaixas
              ? Math.max(1, maxFaixas - 1)
              : total;
          const escondidosPorColuna = hiddenPerColumn(segmentos, visiveis);

          return (
            <div
              key={iSemana}
              className={ganttWeekRow()}
              /*
                A linha ABERTA cresce pra caber todas as faixas. Sem isto,
                expandir criava segmentos que nasciam e eram recortados pela
                mesma altura que os escondia.
              */
              style={
                aberta
                  ? {
                      minHeight:
                        ALTURA_DO_CABECALHO_PX + total * ALTURA_DA_FAIXA_PX + 24,
                    }
                  : undefined
              }
            >
              <div className={ganttWeekDays()}>
                {semana.map((dia, iCol) => {
                  const escondidos = escondidosPorColuna[iCol] ?? 0;
                  return (
                    <div
                      key={dia.getTime()}
                      className={ganttMonthCell({
                        outside: !isSameMonth(dia, anchor),
                        today: isSameDay(dia, now),
                        weekend: dia.getDay() === 0 || dia.getDay() === 6,
                      })}
                    >
                      <span
                        className={ganttDayNumber({
                          today: isSameDay(dia, now),
                        })}
                      >
                        {format(dia, "d", { locale })}
                      </span>

                      {/*
                        O "+N mais" mora na CÉLULA, embaixo das faixas visíveis, e
                        a contagem é por COLUNA: uma barra escondida de 3 dias
                        aparece no "+N" dos três. Somar por semana daria o total
                        certo e a célula errada.
                      */}
                      {escondidos > 0 && !aberta ? (
                        <button
                          type="button"
                          className={ganttOverflowButton()}
                          /*
                            Logo abaixo da última faixa visível. O
                            `ALTURA_DO_CABECALHO_PX` é de onde a camada de
                            segmentos parte e cada faixa ocupa
                            `ALTURA_DA_FAIXA_PX` — a mesma conta dos dois
                            lados, senão o botão flutua no meio das barras.
                          */
                          style={{
                            top:
                              ALTURA_DO_CABECALHO_PX +
                              visiveis * ALTURA_DA_FAIXA_PX,
                          }}
                          onClick={() =>
                            setExpandidas((prev) => new Set(prev).add(iSemana))
                          }
                        >
                          {`+${escondidos} mais`}
                        </button>
                      ) : null}

                      {onDayAdd ? (
                        <button
                          type="button"
                          className={ganttDayAdd()}
                          aria-label={`Adicionar em ${format(dia, "d 'de' MMMM", { locale })}`}
                          title="Adicionar"
                          onClick={() => onDayAdd(dia)}
                        >
                          <Plus aria-hidden />
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/*
                Camada dos segmentos, deslocada pra baixo do número do dia. Ela é
                `pointer-events-none` e cada segmento reativa — senão a camada
                cobriria as células e o hover do "+" nunca disparava.
              */}
              <div
                className={ganttWeekSegments()}
                style={{ top: ALTURA_DO_CABECALHO_PX }}
              >
                {segmentos
                  .filter((seg) => seg.lane < visiveis)
                  .map((seg) => {
                    const entrada = entradas.get(seg.barId);
                    if (!entrada) return null;
                    const { bar, row, colorKey } = entrada;
                    const estilos = ganttDaySegment({
                      colorKey,
                      continuesBefore: seg.continuesBefore,
                      continuesAfter: seg.continuesAfter,
                      conflict: conflictBarIds.has(bar.id),
                      critical: criticalBarIds.has(bar.id),
                    });
                    return (
                      <button
                        key={`${iSemana}-${seg.barId}`}
                        type="button"
                        className={estilos.root()}
                        /*
                          Percentual e não px: a coluna é 1/7 da largura da linha,
                          que muda com o container. Em px exigiria medir e
                          re-medir a cada resize, por nada.

                          O recuo de 2px de cada lado dá o respiro entre
                          segmentos vizinhos sem quebrar a conta das colunas.
                        */
                        style={{
                          left: `calc(${(seg.colStart / 7) * 100}% + 2px)`,
                          width: `calc(${(seg.colSpan / 7) * 100}% - 4px)`,
                          top: seg.lane * ALTURA_DA_FAIXA_PX,
                        }}
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
              </div>

              {/*
                Recolher fica FORA das células, no fim da linha aberta — dentro da
                célula ele apareceria 7 vezes na mesma semana.
              */}
              {aberta && total > maxFaixas ? (
                <button
                  type="button"
                  className={`${ganttOverflowButton()} bottom-pad-2xs top-auto z-[3]`}
                  onClick={() =>
                    setExpandidas((prev) => {
                      const proximo = new Set(prev);
                      proximo.delete(iSemana);
                      return proximo;
                    })
                  }
                >
                  Recolher
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
