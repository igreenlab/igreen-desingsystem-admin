import { useMemo, type MouseEvent, type RefObject, type UIEvent } from "react";
import type { Locale } from "date-fns";
import { format, isSameDay } from "date-fns";
import {
  ganttCanvas,
  ganttCanvasRow,
  ganttCanvasScroll,
  ganttGridColumn,
  ganttHead,
  ganttHeadCell,
  ganttHeadDayNumber,
  ganttHeadRow,
  ganttHeadWeekday,
  ganttNowDot,
  ganttNowLine,
  ganttNowStroke,
  GANTT_BAR_HEIGHT_PX,
  GANTT_GROUP_LABEL_MIN_PX,
  GANTT_HEAD_GROUP_PX,
  GANTT_HEAD_HEIGHT_PX,
  GANTT_HEAD_UNIT_PX,
  GANTT_LANE_HEIGHT_PX,
  GANTT_ROW_HEIGHT_PX,
  GANTT_SUMMARY_BAR_HEIGHT_PX,
} from "../gantt.styles";
import {
  buildTimeAxis,
  clipToWindow,
  dateToX,
  deriveSummaryRange,
  packLanes,
  type GanttFlatRow,
} from "../hooks/layout";
import { GanttBarView } from "../parts/gantt-bar";
import {
  GanttLinksLayer,
  type GanttLinkGeometry,
} from "../parts/gantt-links-layer";
import type {
  GanttBar,
  GanttColorKey,
  GanttGranularity,
  GanttLink,
  GanttRow,
} from "../gantt.types";

/**
 * Visão `timeline` — eixo, barras e setas.
 *
 * ## O cabeçalho vive DENTRO do scroller
 *
 * Estrutura, e a ordem importa:
 *
 *   scroller (overflow-auto nos 2 eixos)
 *     └ trilho (width = larguraTotal)
 *         ├ cabeçalho (sticky top-0)   ← rola pro LADO, prende em CIMA
 *         └ canvas (relative)
 *
 * Fora do scroller, o cabeçalho ficava imóvel na rolagem horizontal e as
 * colunas do eixo desalinhavam das do canvas — o rótulo "12" ia parar em cima
 * do dia 20. `sticky top-0` prende só na vertical, que é o que se quer.
 *
 * ## Uma passada calcula tudo
 *
 * A geometria de cada barra é calculada UMA vez e guardada num mapa por id. A
 * camada de setas lê desse mapa em vez de recalcular: duas fontes pro mesmo
 * número fariam a seta apontar pra um pixel diferente do que a barra ocupa no
 * primeiro arredondamento divergente (L-038).
 */

export type GanttTimelineViewProps = {
  rows: GanttFlatRow[];
  allRows: GanttRow[];
  links: GanttLink[];
  windowStart: Date;
  windowEnd: Date;
  granularity: GanttGranularity;
  pxPerDay: number;
  /**
   * Alturas e offsets JÁ CALCULADOS pela raiz — ver `rowHeights` no núcleo.
   *
   * A view não calcula: era o defeito #2. O canvas somava lanes e a grade
   * usava a constante, e numa linha-contêiner com 3 barras as duas metades da
   * mesma linha saíam com alturas diferentes.
   */
  heights: readonly number[];
  offsets: readonly number[];
  now: Date;
  locale?: Locale;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  conflictBarIds: ReadonlySet<string>;
  criticalBarIds: ReadonlySet<string>;

  draggable: boolean;
  resizable: boolean;
  linkable: boolean;

  /** Índice da linha sob o cursor — o hover cruzado vem do pai (#3). */
  hoveredRow: number | null;
  onHoverRow: (index: number | null) => void;
  /** Início (em dias) da coluna sob o cursor. */
  hoveredDay: number | null;
  /** Índice da linha selecionada (#7). */
  selectedRow: number | null;
  /** Offset em dias da coluna selecionada por clique (#2). */
  selectedDay: number | null;
  onSelectDay: (dayOffset: number | null) => void;
  onHoverDay: (dayOffset: number | null) => void;

  onScroll: (evt: UIEvent<HTMLDivElement>) => void;
  /**
   * O elemento que rola, exposto pra raiz.
   *
   * Ela precisa dele pra CENTRAR a viewport num instante do tempo ao trocar
   * de escala — ver a nota do `onGranularityChange`. Sem isso, mudar pra
   * trimestre deixava o usuário olhando 2024 numa janela de 5 anos cujos
   * dados vivem em 2026: canvas vazio, e nada dizendo onde estava o trabalho.
   */
  scrollRef?: RefObject<HTMLDivElement | null>;
  onBarClick?: (bar: GanttBar, row: GanttRow, evt: MouseEvent) => void;
  onLinkClick?: (link: GanttLink) => void;
};

type Geo = {
  bar: GanttBar;
  row: GanttRow;
  left: number;
  width: number;
  lane: number;
  top: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
  colorKey: GanttColorKey;
};

export function GanttTimelineView({
  rows,
  allRows,
  links,
  windowStart,
  windowEnd,
  granularity,
  pxPerDay,
  heights,
  offsets,
  now,
  locale,
  weekStartsOn,
  conflictBarIds,
  criticalBarIds,
  draggable,
  resizable,
  linkable,
  hoveredRow,
  onHoverRow,
  hoveredDay,
  onHoverDay,
  selectedRow,
  selectedDay,
  onSelectDay,
  onScroll,
  scrollRef,
  onBarClick,
  onLinkClick,
}: GanttTimelineViewProps) {
  const axis = useMemo(
    () => buildTimeAxis(windowStart, windowEnd, granularity, locale, weekStartsOn),
    [windowStart, windowEnd, granularity, locale, weekStartsOn],
  );

  const larguraTotal = axis.totalDays * pxPerDay;

  const alturas = heights;
  const tops = offsets;
  const alturaTotal = alturas.reduce((s, h) => s + h, 0);


  const geos = useMemo(() => {
    const mapa = new Map<string, Geo>();
    const lista: Geo[] = [];

    rows.forEach(({ row }, i) => {
      const tipo = row.type ?? "task";

      /**
       * `summary` sem barra própria deriva o intervalo dos descendentes.
       *
       * ⚠️ De `allRows`, não de `rows`: os filhos podem estar colapsados e fora
       * de `rows`. Derivar do visível faria a barra encolher ao colapsar — o
       * oposto do esperado, porque colapsar é quando ela passa a ser a única
       * informação.
       */
      const barras: GanttBar[] =
        tipo === "summary" && row.bars.length === 0
          ? (() => {
              const r = deriveSummaryRange(row.id, allRows);
              return r
                ? [{ id: `${row.id}__summary`, start: r.start, end: r.end }]
                : [];
            })()
          : row.bars;

      const recortadas = barras
        .map((b) => clipToWindow(b, windowStart, windowEnd))
        .filter((x): x is NonNullable<typeof x> => x !== null);

      const lanes = packLanes(recortadas, row.lanePacking ?? "stack");

      lanes.forEach((lane, laneIndex) => {
        for (const c of lane) {
          const x1 = dateToX(c.start, windowStart, pxPerDay);
          const x2 = dateToX(c.end, windowStart, pxPerDay);
          const geo: Geo = {
            bar: c.bar,
            row,
            left: x1,
            width: Math.max(0, x2 - x1),
            lane: laneIndex,
            top: tops[i] ?? 0,
            continuesBefore: c.continuesBefore,
            continuesAfter: c.continuesAfter,
            colorKey: c.bar.colorKey ?? "chart-1",
          };
          mapa.set(c.bar.id, geo);
          lista.push(geo);
        }
      });
    });

    return { mapa, lista };
  }, [rows, allRows, windowStart, windowEnd, pxPerDay, tops]);

  /**
   * `top` da barra dentro da faixa da linha — CENTRADO (#7).
   *
   * Com uma lane, a barra fica no meio dos 48px da linha. Com várias, cada lane
   * recebe `GANTT_LANE_HEIGHT_PX` e a barra é centrada dentro da sua lane.
   */
  const topDaBarra = (g: Geo, tipo: string): number => {
    const altura =
      tipo === "summary" ? GANTT_SUMMARY_BAR_HEIGHT_PX : GANTT_BAR_HEIGHT_PX;
    const alturaDaFaixa =
      alturas[rows.findIndex((r) => r.row.id === g.row.id)] ?? GANTT_ROW_HEIGHT_PX;
    const umaLaneSo = (g.row.lanePacking ?? "stack") === "stack" && g.row.bars.length <= 1;
    const faixa = umaLaneSo ? alturaDaFaixa : GANTT_LANE_HEIGHT_PX;
    const offsetLane = umaLaneSo ? 0 : g.lane * GANTT_LANE_HEIGHT_PX;
    return g.top + offsetLane + Math.max(0, (faixa - altura) / 2);
  };

  const linkGeos = useMemo<GanttLinkGeometry[]>(() => {
    const saida: GanttLinkGeometry[] = [];
    for (const link of links) {
      const de = geos.mapa.get(link.source);
      const para = geos.mapa.get(link.target);
      // Ponta fora da janela → seta omitida, não desenhada torta: uma seta que
      // sai da borda sem origem visível sugere um vínculo que não é o que existe.
      if (!de || !para) continue;

      const tipo = link.type ?? "FS";
      const saiDireita = tipo === "FS" || tipo === "FF";
      const entraEsquerda = tipo === "FS" || tipo === "SS";

      const alturaDe =
        (de.row.type ?? "task") === "summary"
          ? GANTT_SUMMARY_BAR_HEIGHT_PX
          : GANTT_BAR_HEIGHT_PX;
      const alturaPara =
        (para.row.type ?? "task") === "summary"
          ? GANTT_SUMMARY_BAR_HEIGHT_PX
          : GANTT_BAR_HEIGHT_PX;

      const yDe = topDaBarra(de, de.row.type ?? "task") + alturaDe / 2;
      const yPara = topDaBarra(para, para.row.type ?? "task") + alturaPara / 2;

      saida.push({
        link,
        from: { x: saiDireita ? de.left + de.width : de.left, y: yDe },
        to: { x: entraEsquerda ? para.left : para.left + para.width, y: yPara },
        conflict: conflictBarIds.has(link.target),
        critical:
          criticalBarIds.has(link.source) && criticalBarIds.has(link.target),
      });
    }
    return saida;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [links, geos, conflictBarIds, criticalBarIds, alturas, rows]);

  /**
   * Offset em dias do início de uma unidade do eixo.
   *
   * Derivado de `dateToX` e não de `differenceInCalendarDays` direto: assim a
   * conta é a MESMA que posiciona a coluna, e a comparação com `hoveredDay`/
   * `selectedDay` não pode divergir por arredondamento.
   */
  const diaDaUnidade = (data: Date) =>
    Math.round(dateToX(data, windowStart, pxPerDay) / pxPerDay);

  /**
   * #1 — offsets (em dias) onde um GRUPO acaba. É ali que a divisória
   * engrossa, no cabeçalho e no fundo.
   *
   * Derivado de `axis.groups` e não de `isLastDayOfMonth`: assim a virada
   * acompanha a escala sem um `if` por granularidade — em `day`/`week` o grupo
   * é o mês, em `month`/`quarter` é o ano. O último limite cai fora do
   * conjunto porque ele coincide com a borda do painel, que já é a moldura.
   */
  const limitesDeGrupo = useMemo(() => {
    const saida = new Set<number>();
    let acumulado = 0;
    for (const g of axis.groups) {
      acumulado += g.spanDays;
      if (acumulado < axis.totalDays) saida.add(acumulado);
    }
    return saida;
  }, [axis]);

  const nowX = dateToX(now, windowStart, pxPerDay);
  const nowVisivel = nowX >= 0 && nowX <= larguraTotal;

  return (
    <div className={ganttCanvasScroll()} ref={scrollRef} onScroll={onScroll}>
      {/*
        Trilho com a largura total: é ele que dá o que rolar, e é dentro dele
        que o cabeçalho fica sticky. Sem este nível, `sticky` no cabeçalho se
        resolveria contra o scroller e ele não acompanharia o eixo X.
      */}
      <div style={{ width: larguraTotal, minWidth: "100%" }}>
        <div className={ganttHead()} style={{ height: GANTT_HEAD_HEIGHT_PX }}>
          {/*
            ⛔ Aqui houve uma etiqueta com a data do dia ("17 set"), ancorada no
            cabeçalho. REMOVIDA a pedido (#2): ela cobria exatamente o par
            abreviação+número da coluna de hoje — trocava uma informação por
            outra em cima da mesma. A linha vermelha localiza o dia, e a data
            está na coluna do eixo, logo abaixo dela.
          */}
          {/*
            #5b — a faixa tem altura PRÓPRIA e as células são absolutas.

            Com as células no fluxo do flex, a posição de cada divisória saía de
            uma soma acumulada de larguras fracionárias, enquanto o canvas
            posiciona por `left` absoluto — e as duas viravam pixels diferentes
            em `week`/`month`/`quarter`. Agora as três camadas chamam `dateToX`.
          */}
          <div
            className={ganttHeadRow({ level: "group" })}
            style={{ height: GANTT_HEAD_GROUP_PX }}
          >
            {axis.groups.map((g) => {
              const largura = g.spanDays * pxPerDay;
              const cabe = largura >= GANTT_GROUP_LABEL_MIN_PX;
              return (
                <div
                  key={`g-${g.date.getTime()}`}
                  className={ganttHeadCell({
                    level: "group",
                    boundary: limitesDeGrupo.has(
                      diaDaUnidade(g.date) + g.spanDays,
                    ),
                  })}
                  style={{
                    left: dateToX(g.date, windowStart, pxPerDay),
                    width: largura,
                  }}
                  // Rótulo escondido vai pro `title`: a informação não se
                  // perde, só sai do fluxo visual.
                  title={cabe ? undefined : String(g.label)}
                >
                  {/*
                    #3 — grupo estreito NÃO renderiza rótulo.

                    Medido na tela cheia: a janela começava em 31/ago e o grupo
                    "agosto 2026" saía com 46px — um dia —, com o texto
                    transbordando por cima do vizinho. Esconder é melhor que
                    abreviar: "ago" em 46px ainda encosta nas duas bordas, e o
                    mês já está implícito no grupo seguinte, que é grande.
                  */}
                  {cabe ? g.label : null}
                </div>
              );
            })}
          </div>
          <div
            className={ganttHeadRow({ level: "unit" })}
            style={{ height: GANTT_HEAD_UNIT_PX }}
          >
            {axis.units.map((u) => {
              const hoje = isSameDay(u.date, now);
              const dia = diaDaUnidade(u.date);
              return (
                <div
                  key={`u-${u.date.getTime()}`}
                  className={ganttHeadCell({
                    level: "unit",
                    weekend: u.isWeekend,
                    today: hoje,
                    selected: selectedDay === dia,
                    boundary: limitesDeGrupo.has(dia + u.spanDays),
                  })}
                  style={{
                    left: dateToX(u.date, windowStart, pxPerDay),
                    width: u.spanDays * pxPerDay,
                    cursor: "pointer",
                  }}
                  role="columnheader"
                  aria-selected={selectedDay === dia}
                  onClick={() =>
                    // Clicar na coluna já selecionada DESSELECIONA — mesma
                    // regra da linha, senão não há volta ao estado neutro.
                    onSelectDay(selectedDay === dia ? null : dia)
                  }
                >
                  {/*
                    #10 — abreviação do dia EM CIMA, número embaixo e maior.

                    `EEEEEE` (6 letras) e não `EEEEE` (1): em pt-BR a inicial
                    sozinha é ambígua — segunda, sábado e sexta dão todas "S", e
                    quarta e quinta dão "Q". "seg"/"sáb"/"sex" resolve, e cabe
                    nos 46px da coluna.
                  */}
                  {granularity === "day" ? (
                    <>
                      <span className={ganttHeadWeekday({ weekend: u.isWeekend })}>
                        {format(u.date, "EEEEEE", { locale })}
                      </span>
                      <span className={ganttHeadDayNumber({ today: hoje })}>
                        {u.label}
                      </span>
                    </>
                  ) : (
                    <span className={ganttHeadDayNumber({ today: hoje })}>
                      {u.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={ganttCanvas()}
          style={{ width: larguraTotal, height: Math.max(alturaTotal, 1) }}
          /**
           * A coluna sob o cursor sai do X do ponteiro, e o setter só é chamado
           * QUANDO O ÍNDICE MUDA — não a cada pixel. Sem essa guarda, mover o
           * mouse dentro da mesma coluna dispararia um `setState` por evento e
           * re-renderizaria a árvore de barras dezenas de vezes por segundo.
           *
           * Alternativa descartada: `onMouseEnter` em cada coluna de fundo. As
           * barras ficam por cima, então a coluna sob uma barra nunca receberia
           * o evento — a mira apagaria justamente onde há conteúdo.
           */
          onMouseMove={(e) => {
            const x = e.clientX - e.currentTarget.getBoundingClientRect().left;
            const dia = Math.floor(x / pxPerDay);
            if (dia !== hoveredDay) onHoverDay(dia);
          }}
          onMouseLeave={() => {
            onHoverRow(null);
            onHoverDay(null);
          }}
        >
          {/* Colunas de grade — fundo. */}
          {axis.units.map((u) => {
            const dia = diaDaUnidade(u.date);
            return (
            <div
              key={`col-${u.date.getTime()}`}
              className={ganttGridColumn({
                weekend: u.isWeekend,
                hovered:
                  hoveredDay !== null &&
                  hoveredDay >= dia &&
                  hoveredDay < dia + u.spanDays,
                selected:
                  selectedDay !== null &&
                  selectedDay >= dia &&
                  selectedDay < dia + u.spanDays,
                boundary: limitesDeGrupo.has(dia + u.spanDays),
              })}
              style={{
                left: dateToX(u.date, windowStart, pxPerDay),
                width: u.spanDays * pxPerDay,
              }}
              aria-hidden
            />
            );
          })}

          {/* Faixas de linha — par visual da grade esquerda, e alvo do hover. */}
          {rows.map(({ row }, i) => (
            <div
              key={`row-${row.id}`}
              className={ganttCanvasRow({
                type: row.type ?? "task",
                hovered: hoveredRow === i,
                selected: selectedRow === i,
              })}
              style={{ top: tops[i], height: alturas[i] }}
              onMouseEnter={() => onHoverRow(i)}
              aria-hidden
            />
          ))}

          {geos.lista.map((g) => {
            const tipo = g.row.type ?? "task";
            return (
              <GanttBarView
                key={g.bar.id}
                bar={g.bar}
                left={g.left}
                width={g.width}
                lane={g.lane}
                rowType={tipo}
                colorKey={g.colorKey}
                continuesBefore={g.continuesBefore}
                continuesAfter={g.continuesAfter}
                conflict={conflictBarIds.has(g.bar.id)}
                critical={criticalBarIds.has(g.bar.id)}
                movable={draggable}
                resizable={resizable}
                linkable={linkable}
                height={
                  tipo === "summary"
                    ? GANTT_SUMMARY_BAR_HEIGHT_PX
                    : GANTT_BAR_HEIGHT_PX
                }
                style={{ top: topDaBarra(g, tipo) }}
                onClick={(e) => onBarClick?.(g.bar, g.row, e)}
              />
            );
          })}

          <GanttLinksLayer
            links={linkGeos}
            width={larguraTotal}
            height={Math.max(alturaTotal, 1)}
            onLinkClick={onLinkClick}
          />

          {nowVisivel ? (
            <div className={ganttNowLine()} style={{ left: nowX }} aria-hidden>
              <span className={ganttNowStroke()} />
              <span className={ganttNowDot()} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
