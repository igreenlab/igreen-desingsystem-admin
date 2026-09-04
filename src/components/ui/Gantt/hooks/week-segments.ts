import { differenceInCalendarDays, startOfDay } from "date-fns";

/**
 * Núcleo puro dos **segmentos de semana** da grade de mês — sem React, sem DOM.
 *
 * ## O problema que isto resolve
 *
 * A primeira versão da visão de calendário desenhava **um chip por dia**: uma
 * tarefa de 10 a 15 aparecia como 6 chips soltos, um em cada célula, cada um
 * repetindo o mesmo nome. Lê como seis tarefas de um dia, não como uma de seis —
 * o oposto do que um cronograma precisa dizer.
 *
 * Aqui cada barra vira **um segmento contínuo por semana**, atravessando as
 * colunas que ocupa. Uma tarefa que cruza a virada de semana produz dois
 * segmentos, cada um marcado com `continuesBefore`/`continuesAfter` — é o mesmo
 * vocabulário que o `clipToWindow` usa na timeline, e pela mesma razão: a ponta
 * cortada tem que parecer intencional.
 *
 * ## Por que lane e não empilhamento por ordem
 *
 * Duas barras que ocupam colunas sobrepostas na mesma semana não podem dividir a
 * mesma faixa vertical. A alocação é gulosa na primeira faixa livre, com as
 * barras ordenadas por **coluna inicial e depois por span decrescente**: barra
 * longa primeiro faz a mais comprida ficar na faixa de cima, que é como
 * calendário de verdade se lê — o "guarda-chuva" acima dos eventos curtos.
 *
 * ⛔ Não reusa o `packLanes` do `layout.ts`: aquele empacota por DATA num eixo
 * contínuo, e aqui o eixo é discreto (7 colunas) e reinicia a cada semana. Usar
 * o mesmo daria lanes coerentes no mês e incoerentes na linha.
 */

export type GanttSegmentInput = {
  id: string;
  start: Date;
  end: Date;
};

export type GanttWeekSegment = {
  barId: string;
  /** Coluna onde começa nesta semana, 0–6. */
  colStart: number;
  /** Quantas colunas ocupa nesta semana, 1–7. */
  colSpan: number;
  /** Faixa vertical dentro da linha da semana, 0 = a de cima. */
  lane: number;
  /** Começou antes do primeiro dia desta semana. */
  continuesBefore: boolean;
  /** Termina depois do último dia desta semana. */
  continuesAfter: boolean;
};

/**
 * Segmentos de UMA semana.
 *
 * `week` são os 7 dias na ordem em que a grade os mostra — vem do
 * `buildMonthMatrix`, então `weekStartsOn` já está aplicado e esta função não
 * precisa saber dele.
 */
export function buildWeekSegments(
  week: readonly Date[],
  barras: readonly GanttSegmentInput[],
): GanttWeekSegment[] {
  if (week.length === 0) return [];

  const primeiro = startOfDay(week[0]!);
  const ultimo = startOfDay(week[week.length - 1]!);

  const brutos: Omit<GanttWeekSegment, "lane">[] = [];

  for (const b of barras) {
    const ini = startOfDay(b.start);
    const fim = startOfDay(b.end);
    // Intervalo invertido: dado torto do consumidor. Descartar é melhor que
    // desenhar um segmento de span negativo, que viraria largura negativa.
    if (differenceInCalendarDays(fim, ini) < 0) continue;

    // Fora desta semana por inteiro.
    if (
      differenceInCalendarDays(fim, primeiro) < 0 ||
      differenceInCalendarDays(ini, ultimo) > 0
    ) {
      continue;
    }

    const colStart = Math.max(0, differenceInCalendarDays(ini, primeiro));
    const colEnd = Math.min(
      week.length - 1,
      differenceInCalendarDays(fim, primeiro),
    );

    brutos.push({
      barId: b.id,
      colStart,
      colSpan: colEnd - colStart + 1,
      // ⚠️ Comparado contra a BORDA da semana, não contra `colStart`: uma barra
      // que começa exatamente no domingo tem `colStart` 0 e NÃO continua antes.
      continuesBefore: differenceInCalendarDays(ini, primeiro) < 0,
      continuesAfter: differenceInCalendarDays(fim, ultimo) > 0,
    });
  }

  /**
   * Ordem: coluna inicial, e em empate o span MAIOR primeiro.
   *
   * Sem o desempate por span, duas barras que começam no mesmo dia caem em
   * lanes na ordem em que o consumidor passou `rows` — então a mesma semana
   * renderiza diferente só porque o consumidor reordenou a lista, sem nada ter
   * mudado no cronograma.
   */
  brutos.sort((a, b) =>
    a.colStart !== b.colStart
      ? a.colStart - b.colStart
      : b.colSpan - a.colSpan || a.barId.localeCompare(b.barId),
  );

  /** Última coluna ocupada em cada lane. `-1` = lane livre desde o começo. */
  const ocupacao: number[] = [];
  const saida: GanttWeekSegment[] = [];

  for (const s of brutos) {
    let lane = ocupacao.findIndex((ate) => ate < s.colStart);
    if (lane === -1) {
      lane = ocupacao.length;
      ocupacao.push(-1);
    }
    ocupacao[lane] = s.colStart + s.colSpan - 1;
    saida.push({ ...s, lane });
  }

  return saida;
}

/**
 * Quantos segmentos ficam escondidos em cada COLUNA quando só `maxLanes` faixas
 * cabem na altura da linha.
 *
 * Devolve um array de 7 contagens — é o "+N mais" de cada dia.
 *
 * ⚠️ A contagem é por COLUNA e não por semana: uma barra escondida que ocupa 3
 * dias tem que aparecer no "+N" dos três, senão o usuário que olha o dia 12 não
 * descobre que existe algo ali. Somar por semana daria um número certo no total
 * e errado em todas as células.
 */
export function hiddenPerColumn(
  segmentos: readonly GanttWeekSegment[],
  maxLanes: number,
  colunas = 7,
): number[] {
  const saida = new Array<number>(colunas).fill(0);
  if (maxLanes < 0) return saida;
  for (const s of segmentos) {
    if (s.lane < maxLanes) continue;
    for (let c = s.colStart; c < s.colStart + s.colSpan && c < colunas; c++) {
      saida[c] = (saida[c] ?? 0) + 1;
    }
  }
  return saida;
}

/** Quantas faixas a semana precisa pra mostrar tudo. */
export function laneCount(segmentos: readonly GanttWeekSegment[]): number {
  let max = -1;
  for (const s of segmentos) if (s.lane > max) max = s.lane;
  return max + 1;
}
