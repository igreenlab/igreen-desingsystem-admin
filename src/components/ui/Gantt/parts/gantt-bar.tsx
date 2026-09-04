import { forwardRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import {
  ganttBar,
  ganttLinkPort,
  ganttMilestone,
  ganttResizeHandle,
} from "../gantt.styles";
import type { GanttBar, GanttColorKey, GanttRowType } from "../gantt.types";

/**
 * A barra — e o losango do marco, que é a mesma peça noutro formato.
 *
 * ## Posicionada em px absoluto, não em grid
 *
 * `left`/`width` vêm de `dateToX`. Grid de N colunas parece mais limpo até a
 * primeira barra que começa às 14h de um dia: ela não cai em limite de coluna, e
 * a alternativa (arredondar pro dia) apaga informação que o consumidor passou.
 *
 * ## Largura mínima, e por que não é estética
 *
 * Uma barra de 1 dia em granularidade `quarter` tem **1,6px**. Sem piso, ela
 * some — e "some" é indistinguível de "não existe", que é o pior modo de falha
 * pra quem está conferindo se a tarefa entrou no plano. O piso de 6px mantém a
 * barra clicável e visível, ao custo de exagerar a duração nessa escala.
 */

export const GANTT_BAR_MIN_WIDTH_PX = 6;

export type GanttBarViewProps = {
  bar: GanttBar;
  /** Posição já calculada pela view — a barra não sabe converter data. */
  left: number;
  width: number;
  /** Índice da lane dentro da linha (0 na maioria dos casos). */
  lane: number;
  rowType: GanttRowType;
  colorKey: GanttColorKey;
  continuesBefore: boolean;
  continuesAfter: boolean;

  conflict?: boolean;
  critical?: boolean;

  /**
   * Altura em px, decidida pela VIEW e não aqui.
   *
   * A view é quem sabe se a linha tem uma lane ou cinco, e portanto quanto
   * espaço a barra pode ocupar. Deixar a barra escolher faria ela precisar
   * conhecer o `lanePacking` da linha — informação que não é dela.
   */
  height: number;

  movable?: boolean;
  resizable?: boolean;
  linkable?: boolean;
  dragging?: boolean;

  onClick?: (evt: MouseEvent) => void;
  /**
   * Início do gesto de MOVER — `pointerdown` no corpo da barra.
   *
   * ⚠️ Só no corpo: os punhos de resize e as portas de vínculo dão
   * `stopPropagation`, senão um `pointerdown` no punho iniciaria os dois
   * gestos ao mesmo tempo e a barra moveria enquanto redimensiona.
   */
  onMoveStart?: (evt: MouseEvent) => void;
  /** Início do gesto de resize. `side` diz qual ponta. */
  onResizeStart?: (side: "start" | "end", evt: MouseEvent) => void;
  /** Início do gesto de criar vínculo. */
  onLinkStart?: (side: "start" | "end", evt: MouseEvent) => void;

  /** Render custom do conteúdo — substitui o rótulo default. */
  children?: ReactNode;
  style?: CSSProperties;
};

/**
 * ⚠️ `forwardRef` porque o dnd-kit precisa do nó DOM (`setNodeRef`), e porque a
 * barra é âncora de `Tooltip`/`Popover` — sem ref, `asChild` do Radix não obtém
 * o nó e o flutuante ancora fora do viewport (L-021, medido).
 */
export const GanttBarView = forwardRef<HTMLDivElement, GanttBarViewProps>(
  function GanttBarView(
    {
      bar,
      left,
      width,
      lane,
      rowType,
      colorKey,
      continuesBefore,
      continuesAfter,
      height,
      conflict = false,
      critical = false,
      movable = false,
      resizable = false,
      linkable = false,
      dragging = false,
      onClick,
      onMoveStart,
      onResizeStart,
      onLinkStart,
      children,
      style,
    },
    ref,
  ) {

    /* ── marco: ponto no tempo, não intervalo ────────────────────── */
    if (rowType === "milestone") {
      return (
        <button
          type="button"
          // Centrado NO INÍCIO e não no meio da duração: um marco é uma data, e
          // centrá-lo no meio de um intervalo o desloca da data que ele marca.
          className={ganttMilestone({ colorKey })}
          style={{ left: left - 7, width: 14, height: 14, ...style }}
          onClick={onClick}
          aria-label={bar.searchText ?? String(bar.id)}
        >
          <span />
        </button>
      );
    }

    /* ── barra ───────────────────────────────────────────────────── */
    const estilos = ganttBar({
      colorKey,
      type: rowType,
      continuesBefore,
      continuesAfter,
      conflict,
      critical,
      dragging,
      movable,
    });

    const larguraFinal = Math.max(GANTT_BAR_MIN_WIDTH_PX, width);

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-label={bar.searchText ?? undefined}
        /**
         * ⚠️ `data-gantt-bar` NÃO é decoração: é como o gesto de vínculo
         * descobre em qual barra o ponteiro soltou.
         *
         * O alvo do drop não é um droppable registrado — é um
         * `elementFromPoint` + `closest("[data-gantt-bar]")`. Sem o atributo,
         * criar vínculo exigiria acertar uma porta de 9px, o que não é
         * afordância. Com ele, meia barra é alvo (ver `sideFromPointer`).
         */
        data-gantt-bar={bar.id}
        className={estilos.root()}
        style={{
          left,
          width: larguraFinal,
          height,
          ...style,
        }}
        // `pointerdown` no CORPO inicia o move. Os punhos e as portas param a
        // propagação, senão um gesto iniciaria dois ao mesmo tempo.
        onPointerDown={(e) => onMoveStart?.(e as unknown as MouseEvent)}
        onClick={onClick}
        onKeyDown={(e) => {
          // Enter e Space ativam — o nó é `div` com `role="button"`, então o
          // browser não faz isso sozinho.
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.(e as unknown as MouseEvent);
          }
        }}
      >
        {/* Progresso ANTES do acento no DOM: os dois são absolutos, e o acento
            tem que ficar por cima quando o progresso é 100%. */}
        {bar.progress !== undefined ? (
          <span
            className={estilos.progress()}
            style={{ width: `${Math.min(100, Math.max(0, bar.progress))}%` }}
            aria-hidden
          />
        ) : null}

        <span className={estilos.accent()} aria-hidden />

        {children ?? (
          bar.label ? <span className={estilos.label()}>{bar.label}</span> : null
        )}

        {resizable ? (
          <>
            <span
              role="separator"
              aria-label="Mudar início"
              tabIndex={-1}
              className={ganttResizeHandle({ side: "start" })}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeStart?.("start", e as unknown as MouseEvent);
              }}
            />
            <span
              role="separator"
              aria-label="Mudar fim"
              tabIndex={-1}
              className={ganttResizeHandle({ side: "end" })}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeStart?.("end", e as unknown as MouseEvent);
              }}
            />
          </>
        ) : null}

        {linkable ? (
          <>
            <span
              role="button"
              aria-label="Criar vínculo a partir do início"
              tabIndex={-1}
              className={ganttLinkPort({ side: "start" })}
              onPointerDown={(e) => {
                e.stopPropagation();
                onLinkStart?.("start", e as unknown as MouseEvent);
              }}
            />
            <span
              role="button"
              aria-label="Criar vínculo a partir do fim"
              tabIndex={-1}
              className={ganttLinkPort({ side: "end" })}
              onPointerDown={(e) => {
                e.stopPropagation();
                onLinkStart?.("end", e as unknown as MouseEvent);
              }}
            />
          </>
        ) : null}
      </div>
    );
  },
);
