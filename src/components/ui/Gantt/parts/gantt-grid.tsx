import { ChevronDown } from "lucide-react";
import { format } from "date-fns";
import type { Locale } from "date-fns";
import {
  ganttChevron,
  ganttGridCell,
  ganttGridHead,
  ganttGridGroupCell,
  ganttTreeColumn,
  ganttTreeRail,
  ganttTreeSegment,
  ganttGridHeadCell,
  ganttGridLabel,
  ganttGridLabelText,
  ganttGridRow,
  ganttGridSublabel,
  GANTT_HEAD_HEIGHT_PX,
} from "../gantt.styles";
import type { GanttColumn, GanttRow } from "../gantt.types";
import type { GanttFlatRow } from "../hooks/layout";

/**
 * Painel esquerdo — a grade de linhas.
 *
 * ## Grade própria, não `DataTable`
 *
 * Medido ao especificar: a `DataTable` são **12.187 linhas em 75 arquivos**, o
 * `hierarchical` dela vive na *view de lista* e não na tabela, e a altura de
 * linha dela deriva de `density`.
 *
 * Altura de linha é exatamente o que os dois painéis precisam compartilhar ao
 * pixel; deixá-la num componente que o `Gantt` não controla é a classe de
 * defeito da L-038 — default resolvido em dois render-sites que divergem.
 *
 * Aqui a altura vem de `GANTT_ROW_HEIGHT_PX`, passada por prop, e o canvas
 * consome a MESMA constante.
 *
 * ## O scroll vertical NÃO é daqui
 *
 * Este painel é `overflow-hidden` e recebe `scrollTop` por prop, espelhado do
 * canvas. Dois containers roláveis independentes dessincronizam as linhas na
 * primeira rolagem — e o desalinho entre nome e barra é o defeito mais grave
 * possível num Gantt, porque produz leitura errada sem parecer quebrado.
 */

/** Colunas default: nome (estica) + início + fim. */
export const GANTT_DEFAULT_COLUMNS: GanttColumn[] = [
  { id: "label", header: "Tarefa" },
  { id: "start", header: "Início", width: 92, align: "left" },
  { id: "end", header: "Fim", width: 92, align: "left" },
];

/**
 * Conectores de árvore da linha — o "├" / "└" que a ligam ao pai.
 *
 * ## As três medidas, e de onde vêm
 *
 *   RECUO_POR_NIVEL_PX (16)  = o `paddingLeft: depth * 16` do rótulo. Se este
 *                              número mudar num lugar e não no outro, o cotovelo
 *                              aponta pro vazio ao lado do texto (L-038).
 *   MEIO_DO_CHEVRON_PX (10)  = metade de `size-icon-md` (20px), o botão de
 *                              collapse. É a coluna por onde a vertical desce.
 *   O rail parte de `left-pad-2xl` (16px), o padding esquerdo da célula.
 *
 * ⚠️ As três estão amarradas a `pad-2xl`, `icon-md` e ao recuo do rótulo. Não há
 * tipo que expresse esse acoplamento — só este comentário e o olho.
 *
 * ## O que decide cada segmento
 *
 * `isLast` → a vertical do MEU nível para no meio da linha ("└") em vez de
 * atravessar até a base ("├").
 *
 * `ancestorHasNext[i + 1]` → nas colunas de pass-through. **`i + 1`, não `i`**: a
 * coluna `i` hospeda o cotovelo de nós em `depth i+1`, então a continuação
 * vertical dela pertence ao ancestral daquele nível. É a L-045 — com `[i]` a
 * linha sumia só no último root, e nos outros o root tinha irmão e mascarava o
 * erro. Coberto por teste que compara as duas leituras no MESMO nó.
 *
 * ⛔ Anatomia copiada do `hierarchicalLayout` do `List`, não importada: ele vive
 * em `ui/List/` e cross-import entre pastas de `ui/` gera `registryDependency`
 * pendente (L-049).
 */
const RECUO_POR_NIVEL_PX = 16;
const MEIO_DO_CHEVRON_PX = 10;

function ConectoresDeArvore({
  depth,
  isLast,
  ancestorHasNext,
}: {
  depth: number;
  isLast: boolean;
  ancestorHasNext: boolean[];
}) {
  if (depth <= 0) return null;

  return (
    <span className={ganttTreeRail()} aria-hidden>
      {Array.from({ length: depth }, (_, i) => {
        const esquerda = i * RECUO_POR_NIVEL_PX;

        // A última coluna é a MINHA — é nela que mora o cotovelo.
        if (i === depth - 1) {
          return (
            <span key={i} className={ganttTreeColumn()} style={{ left: esquerda }}>
              {/* vertical: topo → meio. Sempre — é ela que vem do pai. */}
              <span
                className={ganttTreeSegment()}
                style={{ left: MEIO_DO_CHEVRON_PX, width: 1, top: 0, height: "50%" }}
              />
              {/*
                vertical: meio → base. Só se EU tiver irmão depois — é o que
                separa o "├" (continua) do "└" (último filho).
              */}
              {!isLast ? (
                <span
                  className={ganttTreeSegment()}
                  style={{ left: MEIO_DO_CHEVRON_PX, width: 1, top: "50%", bottom: 0 }}
                />
              ) : null}
              {/* horizontal: meio → direita, na altura do texto. */}
              <span
                className={ganttTreeSegment()}
                style={{ left: MEIO_DO_CHEVRON_PX, right: 0, top: "50%", height: 1 }}
              />
            </span>
          );
        }

        /*
          Pass-through: a coluna de um ancestral. A vertical atravessa a linha
          inteira, e só existe se aquele ancestral ainda tiver irmão abaixo —
          senão o galho dele já acabou e a coluna fica vazia.
        */
        if (!ancestorHasNext[i + 1]) return null;
        return (
          <span key={i} className={ganttTreeColumn()} style={{ left: esquerda }}>
            <span
              className={ganttTreeSegment()}
              style={{ left: MEIO_DO_CHEVRON_PX, width: 1, top: 0, bottom: 0 }}
            />
          </span>
        );
      })}
    </span>
  );
}

export type GanttGridProps = {
  rows: GanttFlatRow[];
  columns: GanttColumn[];
  /**
   * Alturas de cada linha, JÁ CALCULADAS pela raiz.
   *
   * ⚠️ Era o defeito #2: esta grade usava a constante `rowHeight` pra TODA
   * linha, enquanto o canvas somava lanes. Numa linha-contêiner com 3 barras o
   * canvas dava 98px e a grade 48 — as duas metades da MESMA linha com alturas
   * diferentes, e o nome desalinhado das barras a partir dali pra baixo.
   *
   * Agora a única fonte é `rowHeights()` no núcleo, e os dois painéis a leem.
   */
  heights: readonly number[];
  /** Espelhado do canvas — ver a nota do topo. */
  scrollTop: number;
  locale?: Locale;
  /** Índice da linha selecionada (#7). */
  selectedRow?: number | null;
  /** Índice da linha sob o cursor — vem da raiz, ver #3. */
  hoveredRow?: number | null;
  onHoverRow?: (index: number | null) => void;
  onRowToggle?: (rowId: string, collapsed: boolean) => void;
  onRowClick?: (row: GanttRow, evt: React.MouseEvent) => void;
};

export function GanttGrid({
  rows,
  columns,
  heights,
  scrollTop,
  locale,
  selectedRow,
  hoveredRow,
  onHoverRow,
  onRowToggle,
  onRowClick,
}: GanttGridProps) {
  return (
    <>
      <div className={ganttGridHead()} style={{ height: GANTT_HEAD_HEIGHT_PX }}>
        {columns.map((col) => (
          <div
            key={col.id}
            className={ganttGridHeadCell({ align: col.align ?? "left" })}
            style={col.width ? { width: col.width } : { flex: 1, minWidth: 0 }}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/*
        `translateY` negativo e não `scrollTop`: o container é
        `overflow-hidden`, então ele não TEM scroll pra ajustar. Mover o
        conteúdo por transform é o que mantém as linhas casadas com o canvas
        sem introduzir um segundo scroller.
      */}
      <div
        className="min-h-0 flex-1 overflow-hidden"
        aria-hidden={false}
        role="rowgroup"
      >
        <div
          style={{ transform: `translateY(${-scrollTop}px)` }}
          onMouseLeave={() => onHoverRow?.(null)}
        >
          {rows.map(
            (
              { row, depth, hasChildren, collapsed, isLast, ancestorHasNext },
              i,
            ) => (
            <div
              key={row.id}
              role="row"
              className={ganttGridRow({
                type: row.type ?? "task",
                selected: selectedRow === i,
                hovered: hoveredRow === i,
              })}
              style={{ height: heights[i] }}
              onMouseEnter={() => onHoverRow?.(i)}
              onClick={(e) => onRowClick?.(row, e)}
            >
              {/*
                #1 — a linha `summary` é CABEÇALHO de grupo, não linha de dados:
                ela atravessa a grade inteira em vez de caber na primeira coluna.

                Confinada, "1. Descoberta e escopo" truncava em "1. Desco…" com
                as colunas de Duração e Resp. VAZIAS ao lado — texto cortado por
                falta de espaço que estava logo ali, sem uso. É o mesmo
                tratamento que linha de grupo recebe em data grid.
              */}
              {(row.type ?? "task") === "summary" ? (
                <div role="cell" className={ganttGridGroupCell()}>
                  {/*
                    Categoria aninhada também é filha de alguém — "Sistema de
                    design" está dentro de "2. Design". Deixar a guia só nas
                    folhas quebraria o eixo justamente no nó do meio.
                  */}
                  <ConectoresDeArvore
                    depth={depth}
                    isLast={isLast}
                    ancestorHasNext={ancestorHasNext}
                  />
                  <span
                    className="flex min-w-0 items-center gap-gp-sm"
                    style={{ paddingLeft: depth * 16 }}
                  >
                    <button
                      type="button"
                      className={ganttChevron({
                        open: !collapsed,
                        hidden: !hasChildren,
                      })}
                      aria-label={collapsed ? "Expandir" : "Recolher"}
                      aria-expanded={hasChildren ? !collapsed : undefined}
                      tabIndex={hasChildren ? 0 : -1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowToggle?.(row.id, !collapsed);
                      }}
                    >
                      <ChevronDown aria-hidden />
                    </button>
                    <span className="truncate">{row.label}</span>
                  </span>
                  {row.trailing ? (
                    <span className="flex shrink-0 items-center">
                      {row.trailing}
                    </span>
                  ) : null}
                </div>
              ) : (
                columns.map((col, i) => {
                const primeira = i === 0;
                return (
                  <div
                    key={col.id}
                    role="cell"
                    className={ganttGridCell({
                      align: col.align ?? "left",
                      numeric: col.id === "start" || col.id === "end",
                      /**
                       * #6 — só a PRIMEIRA coluna é informação.
                       *
                       * Data, duração e responsável são apoio: ficam em
                       * `fg-muted` e peso normal. Com as quatro em
                       * `fg-default`, a grade lia como um bloco de texto e o
                       * nome da tarefa — que é o que se procura — não
                       * ganhava nada por ser o primeiro.
                       */
                      tone: primeira ? "default" : "muted",
                    })}
                    style={
                      col.width
                        ? { width: col.width }
                        : { flex: 1, minWidth: 0 }
                    }
                  >
                    {primeira ? (
                      <>
                        <ConectoresDeArvore
                          depth={depth}
                          isLast={isLast}
                          ancestorHasNext={ancestorHasNext}
                        />
                        {/*
                          Recuo por `paddingLeft` no wrapper e não `ml` no
                          chevron: assim o alvo de clique do chevron não
                          desliza com a profundidade, e um nível 4 continua
                          com o mesmo alvo de um nível 0.
                        */}
                        {/*
                          #2 — `min-w-0` e NÃO `flex-1`.

                          Com `flex-1`, o wrapper do rótulo esticava até o fim da
                          célula e empurrava o `trailing` pra borda direita: numa
                          linha "Descoberta", o chip "Concluída" ia parar a 150px
                          do nome, e a associação entre os dois se perdia.

                          Sem o esticão, o rótulo ocupa o que precisa, o chip vem
                          logo depois, e o espaço que sobra fica DEPOIS do par —
                          onde não separa nada.
                        */}
                        <span
                          className="flex min-w-0 items-center gap-gp-sm"
                          style={{ paddingLeft: depth * 16 }}
                        >
                          <button
                            type="button"
                            className={ganttChevron({
                              open: !collapsed,
                              hidden: !hasChildren,
                            })}
                            aria-label={
                              collapsed ? "Expandir" : "Recolher"
                            }
                            aria-expanded={hasChildren ? !collapsed : undefined}
                            tabIndex={hasChildren ? 0 : -1}
                            onClick={(e) => {
                              e.stopPropagation();
                              onRowToggle?.(row.id, !collapsed);
                            }}
                          >
                            <ChevronDown aria-hidden />
                          </button>

                          {col.render ? (
                            col.render(row)
                          ) : (
                            <span className={ganttGridLabel()}>
                              <span className={ganttGridLabelText()}>
                                {row.label}
                              </span>
                              {row.sublabel ? (
                                <span className={ganttGridSublabel()}>
                                  {row.sublabel}
                                </span>
                              ) : null}
                            </span>
                          )}
                        </span>
                        {row.trailing ? (
                          <span className="flex shrink-0 items-center pl-gp-2xs">
                            {row.trailing}
                          </span>
                        ) : null}
                      </>
                    ) : (
                      (col.render?.(row) ?? celulaDefault(col.id, row, locale))
                    )}
                    </div>
                  );
                })
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * Célula das colunas default.
 *
 * `summary` sem barra própria mostra vazio em vez de "—": o intervalo dele é
 * derivado dos filhos e aparece na barra à direita; repetir travessão em coluna
 * de data é ruído que a ficha do `Scheduler` já ensinou a evitar.
 */
function celulaDefault(
  colId: string,
  row: GanttRow,
  locale?: Locale,
): React.ReactNode {
  const primeira = row.bars[0];
  if (!primeira) return null;

  if (colId === "start") return format(primeira.start, "dd/MM/yy", { locale });
  if (colId === "end") return format(primeira.end, "dd/MM/yy", { locale });
  if (colId === "duration") {
    const dias =
      Math.round(
        (primeira.end.getTime() - primeira.start.getTime()) / 86_400_000,
      ) + 1;
    return `${dias}d`;
  }
  if (colId === "progress") {
    return primeira.progress === undefined ? null : `${primeira.progress}%`;
  }
  return null;
}
