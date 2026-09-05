import { ganttSkeleton } from "../gantt.styles";
import {
  GANTT_HEAD_HEIGHT_PX,
  GANTT_ROW_HEIGHT_PX,
} from "../gantt.styles";
import type { GanttView } from "../gantt.types";

/**
 * Esqueleto de carregamento do `Gantt`.
 *
 * ## O defeito que ele existe pra evitar
 *
 * Sem `loading`, um consumidor que busca do servidor renderiza `rows={[]}`
 * enquanto espera — e o componente responde *"Nenhuma tarefa neste período"*.
 * Isso é uma **afirmação falsa**: o Gantt não sabe se não há tarefas, ele ainda
 * não recebeu nenhuma. O usuário lê que o cronograma está vazio e sai antes de o
 * dado chegar.
 *
 * ## A silhueta é a do conteúdo, e por visão
 *
 * Regra copiada do `DataTableLoading`: mesmo container, mesma altura de linha,
 * mesma moldura — pra a chegada do dado não deslocar nada. Um esqueleto de
 * silhueta diferente troca "espera" por um salto de layout, que é pior.
 *
 * Por isso são três, e não um genérico: a timeline tem painel + eixo, a grade de
 * mês é 6×7, e a agenda é uma pilha de blocos por dia. Um esqueleto só saltaria
 * em duas das três.
 *
 * ⚠️ **A toolbar não entra aqui.** Ela continua renderizada durante o
 * carregamento, porque o período, a busca e o filtro não dependem dos dados —
 * apagá-la faria a tela inteira piscar quando eles chegam. Mesmo desenho do
 * `DataTable`.
 */
export type GanttSkeletonProps = {
  view: GanttView;
  /** Largura do painel esquerdo — a MESMA do estado carregado, senão salta. */
  gridWidth: number;
  /** Quantas linhas fingir. */
  rows?: number;
};

/** Larguras dos retângulos, em %, pra não parecerem uma régua. */
const LARGURA_DO_NOME = [72, 58, 84, 64, 78, 52, 70, 60];
/** `left` e `width` das barras fingidas, em % do eixo. */
const BARRAS = [
  { left: 4, width: 26 },
  { left: 18, width: 34 },
  { left: 30, width: 20 },
  { left: 44, width: 30 },
  { left: 38, width: 42 },
  { left: 60, width: 24 },
  { left: 55, width: 33 },
  { left: 70, width: 22 },
];

export function GanttSkeleton({
  view,
  gridWidth,
  rows = 8,
}: GanttSkeletonProps) {
  const e = ganttSkeleton();
  const indices = Array.from({ length: rows }, (_, i) => i);

  /*
    `role="status"` + `aria-busy` e não um `aria-label` solto: quem usa leitor
    de tela precisa saber que a região está OCUPADA, não só que existe. É o
    mesmo par do `DataTableLoading`.
  */
  const comum = {
    role: "status" as const,
    "aria-busy": true,
    "aria-label": "Carregando cronograma",
  };

  if (view === "timeline") {
    return (
      <div className={e.root()} {...comum}>
        <div className="flex min-h-0 flex-1">
          <div className={e.pane()} style={{ width: gridWidth }}>
            <div
              className={e.head()}
              style={{ height: GANTT_HEAD_HEIGHT_PX }}
              aria-hidden
            >
              <div className={e.bar()} style={{ width: 64, height: 10 }} />
              <div className={e.bar()} style={{ width: 44, height: 10 }} />
            </div>
            {indices.map((i) => (
              <div
                key={i}
                className={e.row()}
                style={{ height: GANTT_ROW_HEIGHT_PX }}
                aria-hidden
              >
                <div
                  className={e.bar()}
                  style={{
                    width: `${LARGURA_DO_NOME[i % LARGURA_DO_NOME.length]}%`,
                    height: 10,
                  }}
                />
              </div>
            ))}
          </div>

          <div className={e.canvas()}>
            <div
              className={e.head()}
              style={{ height: GANTT_HEAD_HEIGHT_PX }}
              aria-hidden
            />
            {indices.map((i) => {
              const b = BARRAS[i % BARRAS.length];
              return (
                <div
                  key={i}
                  className={e.row()}
                  style={{ height: GANTT_ROW_HEIGHT_PX }}
                  aria-hidden
                >
                  <div className="relative h-[22px] w-full">
                    <div
                      className={e.bar()}
                      style={{
                        position: "absolute",
                        left: `${b.left}%`,
                        width: `${b.width}%`,
                        height: 22,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (view === "calendar") {
    // 42 células — o mesmo 6×7 que `buildMonthMatrix` sempre devolve.
    return (
      <div className={e.root()} {...comum}>
        <div className={e.grid()} aria-hidden>
          {Array.from({ length: 42 }, (_, i) => (
            <div key={i} className={e.cell()}>
              <div className={e.bar()} style={{ width: 16, height: 10 }} />
              {i % 3 === 0 ? (
                <div className={e.bar()} style={{ width: "80%", height: 14 }} />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // `list` — blocos de dia, cada um com cabeçalho e 1–2 cartões.
  return (
    <div className={e.root()} {...comum}>
      <div className="flex flex-col gap-gp-2xl p-pad-xl" aria-hidden>
        {indices.slice(0, 4).map((i) => (
          <div key={i} className="flex flex-col gap-gp-md">
            <div className={e.bar()} style={{ width: 140, height: 12 }} />
            {Array.from({ length: (i % 2) + 1 }, (_, j) => (
              <div key={j} className={e.bar()} style={{ height: 44 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
