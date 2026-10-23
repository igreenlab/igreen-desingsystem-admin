import { Fragment, useState, type ReactNode } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/shadcn/hover-card";
import {
  ganttHistoryCluster,
  ganttHistoryDot,
  ganttHistoryNotch,
  ganttHistoryTrail,
} from "../gantt.styles";
import {
  clusterHistoryMarks,
  deriveHistoryMarks,
  historyMarkOpacity,
} from "../hooks/history-marks";
import type {
  GanttBar,
  GanttColorKey,
  GanttHistoryMark,
  GanttRow,
} from "../gantt.types";

/** Abaixo disto duas marcas viram uma mancha — agrupa e mostra contador. */
const MIN_PX_ENTRE_MARCAS = 14;

/** Slots do entalhe, resolvidos uma vez — `tv()` com slots devolve funções. */
const notch = ganttHistoryNotch();

/** Geometria mínima que a camada precisa de cada barra. */
export type GanttHistoryTarget = {
  bar: GanttBar;
  row: GanttRow;
  colorKey: GanttColorKey;
  /** Borda esquerda e direita da barra ATUAL, em px do eixo. */
  left: number;
  width: number;
  /** Topo e altura da barra, pra ancorar ponto e entalhe. */
  top: number;
  height: number;
};

type Props = {
  targets: GanttHistoryTarget[];
  /** Converte uma data na posição x do eixo. */
  xOf: (date: Date) => number;
  renderHistoryCard?: (params: {
    mark: GanttHistoryMark;
    bar: GanttBar;
    row: GanttRow;
  }) => ReactNode;
  formatDate: (d: Date) => string;
};

/**
 * Camada de histórico — os prazos ANTERIORES de cada barra.
 *
 * Vem ANTES das barras no DOM mas desenha ACIMA delas (`z-[2]`), e as duas
 * coisas são necessárias: a ordem do DOM deixa a barra receber o gesto de
 * arrastar primeiro, e o z-index é o que torna a marca de dentro visível — uma
 * barra é opaca, e marca por baixo de barra é marca que não existe. O que
 * impede a marca de ler como adesivo é a FORMA, não a camada: o entalhe
 * atravessa a borda em vez de pousar no meio. Ver `Gantt/USAGE.md`
 * §Histórico de remarcações.
 *
 * Duas formas, decididas pela POSIÇÃO e não por cor:
 *
 * - **fora da barra atual** → ponto, ligado à borda por uma trilha tracejada.
 *   É a trilha que conta a história: "o fim estava aqui e foi pra lá".
 * - **dentro da barra** → entalhe atravessando as bordas de cima e de baixo.
 *   Não é losango porque no Gantt o losango já é marco.
 */
export function GanttHistoryLayer({
  targets,
  xOf,
  renderHistoryCard,
  formatDate,
}: Props) {
  return (
    <>
      {targets.map((t) => {
        const marks = deriveHistoryMarks(t.bar);
        if (!marks.length) return null;

        /* ⚠️ ENTRADAS, não marcas. `mark.index` é o índice da entrada que a
           gerou, e uma entrada que remarcou as DUAS pontas vira duas marcas
           com o mesmo índice. Medido com `marks.length`: a remarcação única de
           "Piloto em campo" saía índice 0 de 2 — o piso de opacidade — e a
           única alteração da barra aparecia apagada como se fosse antiga. */
        const total = t.bar.history?.length ?? marks.length;
        const clusters = clusterHistoryMarks(
          marks,
          (m) => xOf(m.date),
          MIN_PX_ENTRE_MARCAS,
        );

        return (
          <Fragment key={t.bar.id}>
            {clusters.map(({ x, marks: doCluster }) => (
              <MarcaHistorico
                key={`${t.bar.id}-${x}`}
                alvo={t}
                x={x}
                doCluster={doCluster}
                opacity={historyMarkOpacity(doCluster[0].index, total)}
                renderHistoryCard={renderHistoryCard}
                formatDate={formatDate}
              />
            ))}
          </Fragment>
        );
      })}
    </>
  );
}

type MarcaProps = {
  alvo: GanttHistoryTarget;
  x: number;
  doCluster: GanttHistoryMark[];
  opacity: number;
  renderHistoryCard?: Props["renderHistoryCard"];
  formatDate: Props["formatDate"];
};

/**
 * Uma marca (ou um grupo delas) com o cartão que a explica.
 *
 * O `open` é controlado em vez de deixado com o Radix porque o HoverCard, por
 * contrato, abre **só** no ponteiro que não é toque: medido, nem o foco por
 * teclado abria o cartão. Isso deixava um `<button>` com anel de foco e
 * `aria-label` que, pra quem navega no teclado ou toca na tela, não revelava
 * nada — afordância que promete e não entrega. Com `open` nosso, o hover
 * continua vindo do Radix (`onOpenChange`) e foco/clique abrem também.
 */
function MarcaHistorico({
  alvo: t,
  x,
  doCluster,
  opacity,
  renderHistoryCard,
  formatDate,
}: MarcaProps) {
  const [aberto, setAberto] = useState(false);

  const principal = doCluster[0];
  const direita = t.left + t.width;
  const dentro = x >= t.left && x <= direita;
  const meioY = t.top + t.height / 2;

  /* A trilha vai da marca até a borda que ela representa. Só fora da barra:
     dentro, a própria barra já é a ligação. */
  const bordaAlvo = principal.edge === "start" ? t.left : direita;
  const trilhaLeft = Math.min(x, bordaAlvo);
  const trilhaWidth = Math.abs(bordaAlvo - x);

  const titulo =
    doCluster.length > 1
      ? `${doCluster.length} remarcações`
      : `${principal.edge === "start" ? "Início" : "Fim"} anterior: ${formatDate(principal.date)}`;

  /**
   * Por que o `open` é nosso, e por que `onTouchStart` precisa existir.
   *
   * O `HoverCardTrigger` do Radix já compõe `onFocus`/`onBlur`, então teclado
   * funcionaria sozinho — mas ele também faz
   * `onTouchStart: composeEventHandlers(props.onTouchStart, e => e.preventDefault())`,
   * de propósito: HoverCard é afordância de ponteiro e o Radix **desliga** o
   * toque. Esse `preventDefault` mata o clique sintético junto, então em
   * celular a marca viraria um `<button>` com anel de foco que não revela
   * nada. Como o nosso handler é composto ANTES do dele, abrir no
   * `touchstart` é o único ponto em que dá pra reagir ao toque.
   *
   * ⚠️ `onClick` ABRE, não alterna. Alternar parecia certo e está errado: o
   * clique dispara `focus` antes de `click`, então o par vira abre→fecha e a
   * marca nunca mostra nada. Fechar fica com o `blur` e com o dismiss do
   * próprio Radix quando o ponteiro desce fora.
   */
  const abridores = {
    onFocus: () => setAberto(true),
    onBlur: () => setAberto(false),
    onClick: () => setAberto(true),
    onTouchStart: () => setAberto(true),
  };

  const gatilho =
    doCluster.length > 1 ? (
      <button
        type="button"
        className={ganttHistoryCluster({ colorKey: t.colorKey })}
        style={{ left: x, top: meioY, opacity }}
        aria-label={titulo}
        {...abridores}
      >
        {doCluster.length}
      </button>
    ) : dentro ? (
      <button
        type="button"
        className={notch.root({ colorKey: t.colorKey })}
        style={{ left: x, top: t.top, height: t.height, opacity }}
        aria-label={titulo}
        {...abridores}
      >
        <span
          className={notch.tick({ colorKey: t.colorKey })}
          style={{ top: -3 }}
        />
        <span
          className={notch.tick({ colorKey: t.colorKey })}
          style={{ bottom: -3 }}
        />
      </button>
    ) : (
      <button
        type="button"
        className={ganttHistoryDot({ colorKey: t.colorKey })}
        style={{ left: x, top: meioY, opacity }}
        aria-label={titulo}
        {...abridores}
      />
    );

  return (
    <>
      {!dentro && trilhaWidth > 0 && (
        <div
          className={ganttHistoryTrail({ colorKey: t.colorKey })}
          style={{
            left: trilhaLeft,
            top: meioY,
            width: trilhaWidth,
            opacity: opacity * 0.7,
          }}
          aria-hidden
        />
      )}
      <HoverCard open={aberto} onOpenChange={setAberto} openDelay={120}>
        <HoverCardTrigger asChild>{gatilho}</HoverCardTrigger>
        <HoverCardContent className="w-auto max-w-tooltip-lg">
          {renderHistoryCard ? (
            doCluster.map((m, i) => (
              <Fragment key={i}>
                {renderHistoryCard({ mark: m, bar: t.bar, row: t.row })}
              </Fragment>
            ))
          ) : (
            <div className="flex flex-col gap-gp-xs">
              {doCluster.map((m, i) => (
                <span key={i} className="text-body-sm text-fg-default">
                  {m.edge === "start" ? "Início" : "Fim"} anterior:{" "}
                  <strong className="tabular-nums">{formatDate(m.date)}</strong>
                </span>
              ))}
            </div>
          )}
        </HoverCardContent>
      </HoverCard>
    </>
  );
}
