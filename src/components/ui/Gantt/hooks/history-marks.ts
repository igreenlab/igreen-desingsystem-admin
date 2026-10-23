import type { GanttBar, GanttHistoryMark } from "../gantt.types";

/**
 * Deriva as marcas de histórico de uma barra.
 *
 * ## Uma regra no lugar de seis situações
 *
 * O pedido original listava 6 casos (início/fim/tarefa inteira × adiada/
 * antecipada). Desenhar seis é seis chances de divergir. A regra que os cobre:
 *
 *   **cada data anterior que não é a data atual vira uma marca no dia em que
 *   estava** — e a ponta (`start` ou `end`) diz qual era.
 *
 * "Adiou o fim" e "antecipou o fim" ficam iguais no modelo e diferentes só na
 * posição: a marca cai antes ou depois da borda atual, e a leitura é visual.
 *
 * ## Data repetida
 *
 * Um prazo que volta ao valor que já teve ficaria com duas marcas no mesmo
 * pixel. Fica só a **mais recente** — é ela que conta a história de onde o
 * prazo estava por último.
 *
 * ## O índice importa
 *
 * `index` é a posição no histórico (0 = mais antigo) e é o que o render usa pra
 * escolher o tom: mais claro é mais antigo. Cor por SITUAÇÃO contrariaria a
 * regra do Gantt de que cor = categoria.
 */
export function deriveHistoryMarks(bar: GanttBar): GanttHistoryMark[] {
  const hist = bar.history;
  if (!hist?.length) return [];

  const atualStart = bar.start.getTime();
  const atualEnd = bar.end.getTime();

  /* Chave = ponta + dia. O Map preserva a ordem de inserção e sobrescreve o
     valor: percorrendo do mais antigo pro mais novo, a última gravação de uma
     data repetida é a mais recente, que é a que deve ficar. */
  const porChave = new Map<string, GanttHistoryMark>();

  hist.forEach((entry, index) => {
    const pontas: { edge: "start" | "end"; date: Date; atual: number }[] = [
      { edge: "start", date: entry.start, atual: atualStart },
      { edge: "end", date: entry.end, atual: atualEnd },
    ];

    for (const { edge, date, atual } of pontas) {
      if (!(date instanceof Date) || Number.isNaN(date.getTime())) continue;
      // Ponta que não mudou não é remarcação — não vira marca.
      if (date.getTime() === atual) continue;
      porChave.set(`${edge}:${date.getTime()}`, { edge, date, entry, index });
    }
  });

  return [...porChave.values()].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
}

/**
 * Opacidade da marca pelo quão antiga ela é: mais clara = mais antiga.
 *
 * Piso em 0.35 porque abaixo disso a marca some contra o fundo da linha — e
 * uma marca invisível é pior que marca nenhuma: ela ocupa o lugar de uma
 * informação que a pessoa acha que não existe.
 */
export function historyMarkOpacity(index: number, total: number): number {
  if (total <= 1) return 1;
  const t = index / (total - 1);
  return 0.35 + t * 0.65;
}

/**
 * Agrupa marcas que cairiam a menos de `minPx` uma da outra.
 *
 * Na escala "semana" ou acima, um dia vale poucos pixels e seis remarcações
 * viram uma mancha. Agrupadas, viram uma marca só com contador — que é o
 * comportamento pedido e o único legível nessa escala.
 *
 * Devolve clusters na ordem do eixo; `marks[0]` é a representante (a mais
 * antiga do grupo, pra posição ficar onde a história começou).
 */
export function clusterHistoryMarks(
  marks: GanttHistoryMark[],
  xOf: (m: GanttHistoryMark) => number,
  minPx: number,
): { x: number; marks: GanttHistoryMark[] }[] {
  const out: { x: number; marks: GanttHistoryMark[] }[] = [];
  for (const m of marks) {
    const x = xOf(m);
    const ultimo = out[out.length - 1];
    if (ultimo && Math.abs(x - ultimo.x) < minPx) {
      ultimo.marks.push(m);
      continue;
    }
    out.push({ x, marks: [m] });
  }
  return out;
}
