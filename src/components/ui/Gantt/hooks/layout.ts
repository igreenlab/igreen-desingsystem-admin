import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  max as maxDate,
  min as minDate,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  type Locale,
} from "date-fns";
import type {
  GanttBar,
  GanttGranularity,
  GanttRow,
} from "../gantt.types";

/**
 * Núcleo geométrico do `Gantt` — **puro**: sem React, sem DOM, sem estilo.
 *
 * É o que torna as bordas testáveis sem montar componente: virada de mês,
 * barra que cruza a janela, lane packing com sobreposição parcial, `summary`
 * derivado de filhos colapsados.
 *
 * ## A unidade é o DIA, e isso é decisão
 *
 * Todo cálculo interno converte data → **dias desde `windowStart`** e só depois
 * multiplica por `pxPerDay`. A alternativa (converter direto pra pixel em cada
 * lugar) espalha o arredondamento e faz duas barras com a mesma data cair em
 * pixels diferentes dependendo de quem calculou.
 *
 * ⚠️ Usa `differenceInCalendarDays`, **não** subtração de timestamp: um
 * intervalo que cruza mudança de horário de verão tem 23 ou 25 horas, e
 * `(b - a) / 86400000` devolve 0,96 dia. O cálculo por calendário devolve 1.
 */

/* ─────────────────────────────────────────────────── eixo de tempo ── */

export type GanttTick = {
  /** Início do tick. */
  date: Date;
  /** Largura em dias — varia: mês tem 28–31, trimestre 90–92. */
  spanDays: number;
  label: string;
  /** Fim de semana, pra sombrear a coluna. Só em `granularity: "day"`. */
  isWeekend: boolean;
};

export type GanttAxis = {
  /** Linha de cima — agrupa (mês sobre dias, ano sobre meses). */
  groups: GanttTick[];
  /** Linha de baixo — a unidade da grade. */
  units: GanttTick[];
  totalDays: number;
};

/**
 * Eixo em DOIS níveis, porque uma linha só não situa.
 *
 * Todas as 13 referências fazem isso: "March | April | May" em cima e
 * "01.03–07.03 | 08.03–14.03" embaixo. Sem o nível de cima, uma coluna "12" não
 * diz de que mês — e o usuário precisa contar colunas pra descobrir.
 */
export function buildTimeAxis(
  windowStart: Date,
  windowEnd: Date,
  granularity: GanttGranularity,
  locale?: Locale,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0,
): GanttAxis {
  const inicio = startOfDay(windowStart);
  const fim = startOfDay(windowEnd);
  const totalDays = Math.max(1, differenceInCalendarDays(fim, inicio) + 1);

  const units: GanttTick[] = [];
  const groups: GanttTick[] = [];

  if (granularity === "day") {
    for (const dia of eachDayOfInterval({ start: inicio, end: fim })) {
      const dow = dia.getDay();
      units.push({
        date: dia,
        spanDays: 1,
        label: format(dia, "d", { locale }),
        isWeekend: dow === 0 || dow === 6,
      });
    }
    empilharGrupos(groups, inicio, fim, "MMMM yyyy", startOfMonth, locale);
  } else if (granularity === "week") {
    let cursor = startOfWeek(inicio, { weekStartsOn });
    while (cursor <= fim) {
      /**
       * ⚠️ `startOfDay` no `endOfWeek` NÃO é redundante.
       *
       * `endOfWeek` devolve 23:59:59.999 de sábado, e esse resto de tempo
       * viaja pro `cursor` da iteração seguinte. Na última volta a comparação
       * vira `20/09 23:59 <= 20/09 00:00` — falsa — e a semana parcial final é
       * **descartada em silêncio**: o eixo fica 1 dia mais curto que
       * `totalDays` e todas as barras deslizam.
       *
       * Medido: janela 10–20/09 somava 10 de 11 dias. É a L-045 — defeito que
       * só aparece no último item, mascarado porque as semanas do meio têm 7
       * dias de qualquer jeito.
       */
      const semanaFim = startOfDay(endOfWeek(cursor, { weekStartsOn }));
      // Recorta na janela: a primeira e a última semana quase sempre entram
      // parciais, e reservar largura de 7 dias pra elas desalinharia as barras.
      const de = maxDate([startOfDay(cursor), inicio]);
      const ate = minDate([semanaFim, fim]);
      units.push({
        date: de,
        spanDays: differenceInCalendarDays(ate, de) + 1,
        label: `${format(de, "dd/MM", { locale })}`,
        isWeekend: false,
      });
      cursor = addDays(semanaFim, 1);
    }
    empilharGrupos(groups, inicio, fim, "MMMM yyyy", startOfMonth, locale);
  } else if (granularity === "month") {
    empilharGrupos(units, inicio, fim, "MMM", startOfMonth, locale);
    empilharGrupos(groups, inicio, fim, "yyyy", (d) => new Date(d.getFullYear(), 0, 1), locale);
  } else {
    empilharGrupos(units, inicio, fim, "QQQ", startOfQuarter, locale);
    empilharGrupos(groups, inicio, fim, "yyyy", (d) => new Date(d.getFullYear(), 0, 1), locale);
  }

  return { groups, units, totalDays };
}

/** Fatia [inicio, fim] pelos limites de um período, recortando as pontas. */
function empilharGrupos(
  saida: GanttTick[],
  inicio: Date,
  fim: Date,
  formato: string,
  inicioDoPeriodo: (d: Date) => Date,
  locale?: Locale,
): void {
  let cursor = inicio;
  let guarda = 0;
  while (cursor <= fim && guarda < 600) {
    const dentroDoPeriodo = inicioDoPeriodo(cursor);
    // Fim do período: 1 dia antes do início do próximo. Vale pra mês, trimestre
    // e ano sem precisar de três funções `endOf*`.
    const proximo = inicioDoPeriodo(addDays(dentroDoPeriodo, diasDoPeriodo(formato)));
    const periodoFim = addDays(proximo, -1);
    const ate = minDate([periodoFim, fim]);
    saida.push({
      date: cursor,
      spanDays: differenceInCalendarDays(ate, cursor) + 1,
      label: format(cursor, formato, { locale }),
      isWeekend: false,
    });
    cursor = addDays(ate, 1);
    guarda++;
  }
}

/** Passo seguro pra pular pro período seguinte sem depender de `endOf*`. */
function diasDoPeriodo(formato: string): number {
  if (formato === "yyyy") return 366;
  if (formato === "QQQ") return 93;
  return 32;
}

/* ───────────────────────────────────────────────── data ↔ pixel ── */

/** Dias desde o início da janela. Fracionário: a hora do dia conta. */
export function dateToDayOffset(date: Date, windowStart: Date): number {
  const base = startOfDay(windowStart);
  const dias = differenceInCalendarDays(startOfDay(date), base);
  const fracao = (date.getTime() - startOfDay(date).getTime()) / 86_400_000;
  return dias + fracao;
}

export function dateToX(date: Date, windowStart: Date, pxPerDay: number): number {
  return dateToDayOffset(date, windowStart) * pxPerDay;
}

export function xToDate(x: number, windowStart: Date, pxPerDay: number): Date {
  if (pxPerDay <= 0) return startOfDay(windowStart);
  const dias = x / pxPerDay;
  const inteiros = Math.floor(dias);
  const resto = dias - inteiros;
  const base = addDays(startOfDay(windowStart), inteiros);
  return new Date(base.getTime() + Math.round(resto * 86_400_000));
}

/**
 * Arredonda pro início do período — o snap do arraste.
 *
 * Sem snap, arrastar 3px muda a data em 4 horas e a barra nunca alinha com a
 * grade. Com snap por granularidade, ela cai sempre num limite visível.
 */
export function snapDate(date: Date, granularity: GanttGranularity, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0): Date {
  if (granularity === "day") return startOfDay(date);
  if (granularity === "week") return startOfWeek(date, { weekStartsOn });
  if (granularity === "month") return startOfMonth(date);
  return startOfQuarter(date);
}

/* ────────────────────────────────────────────── recorte na janela ── */

export type GanttClippedBar = {
  bar: GanttBar;
  /** Início efetivo desenhado — pode ser a borda da janela. */
  start: Date;
  end: Date;
  continuesBefore: boolean;
  continuesAfter: boolean;
};

/**
 * Recorta a barra na janela visível.
 *
 * Devolve `null` quando a barra está **inteiramente fora** — e é o que evita
 * desenhar centenas de nós com `left` negativo fora da viewport.
 *
 * ⚠️ A comparação é por DIA, não por instante: uma barra que termina às 08:00 do
 * `windowStart` ainda toca a janela e deve aparecer. Comparar timestamps a
 * descartaria.
 */
export function clipToWindow(
  bar: GanttBar,
  windowStart: Date,
  windowEnd: Date,
): GanttClippedBar | null {
  const jIni = startOfDay(windowStart);
  const jFim = startOfDay(windowEnd);
  const bIni = startOfDay(bar.start);
  const bFim = startOfDay(bar.end);

  if (bFim < jIni || bIni > jFim) return null;

  const antes = bIni < jIni;
  const depois = bFim > jFim;

  return {
    bar,
    start: antes ? jIni : bar.start,
    end: depois ? addDays(jFim, 1) : bar.end,
    // O flag informado pelo consumidor VENCE o derivado: quem pagina no
    // servidor sabe que continua fora, e o componente não tem como saber.
    continuesBefore: bar.continuesBefore ?? antes,
    continuesAfter: bar.continuesAfter ?? depois,
  };
}

/* ──────────────────────────────────────────────────── lane packing ── */

/**
 * Distribui barras em lanes dentro da MESMA linha.
 *
 * - `stack`: uma lane por barra, na ordem recebida. Todas visíveis — é o
 *   "arco-íris" do portfólio, onde o ponto é justamente ver as 5 frentes.
 * - `compact`: barras que não se sobrepõem dividem lane. Linha mais baixa, e o
 *   preço é que duas frentes podem cair na mesma faixa horizontal.
 *
 * ⚠️ Sobreposição é `<` e não `<=`: uma barra que termina no dia 5 e outra que
 * começa no dia 5 **não** se sobrepõem — são consecutivas. Usar `<=` empurraria
 * toda cadeia sequencial pra lanes separadas, que é o oposto de "compact".
 */
export function packLanes(
  bars: GanttClippedBar[],
  mode: "stack" | "compact" = "stack",
): GanttClippedBar[][] {
  if (mode === "stack") return bars.map((b) => [b]);

  const lanes: GanttClippedBar[][] = [];
  const ordenadas = [...bars].sort((a, b) => a.start.getTime() - b.start.getTime());

  for (const barra of ordenadas) {
    const lane = lanes.find((l) => {
      const ultima = l[l.length - 1];
      return ultima.end.getTime() <= barra.start.getTime();
    });
    if (lane) lane.push(barra);
    else lanes.push([barra]);
  }
  return lanes;
}

/* ────────────────────────────────────────────────────── hierarquia ── */

export type GanttFlatRow = {
  row: GanttRow;
  depth: number;
  /** Tem filhos — é o que decide se o chevron aparece. */
  hasChildren: boolean;
  collapsed: boolean;

  /**
   * É o ÚLTIMO filho do seu pai — define se a vertical do conector para no meio
   * da linha (formando o "└") ou atravessa até a base (formando o "├").
   */
  isLast: boolean;

  /**
   * Por nível ancestral (índice = `depth` do ancestral): aquele ancestral ainda
   * tem irmão depois dele? Controla se a guia vertical continua descendo naquela
   * coluna de recuo.
   *
   * ⚠️ **A coluna `i` hospeda o cotovelo de nós em `depth i+1`**, então quem
   * decide a continuação vertical dela é `ancestorHasNext[i + 1]`, NÃO `[i]`.
   * Esse off-by-one é a **L-045**, e ela nasceu deste mesmo conector no `List`:
   * com `[i]` a guia sumia no último root (`ancestorHasNext[0]` é `false`) e nos
   * demais o root tinha irmão, o que mascarava o bug em tudo menos na borda.
   *
   * A forma deste campo é copiada do `flattenTree` do `List` de propósito — é a
   * implementação que já pagou o preço de acertar.
   */
  ancestorHasNext: boolean[];
};

/**
 * Achata a árvore na ordem de exibição, respeitando collapse.
 *
 * Filho de linha colapsada não entra — nem os netos. É por isso que a recursão
 * para no `collapsed` em vez de filtrar depois: filtrar deixaria neto órfão
 * visível quando o pai colapsa e o avô não.
 *
 * ## Dado sujo do consumidor nunca vira tarefa invisível
 *
 * Duas formas de `parent` quebrado, e as DUAS terminam com a linha na tela:
 *
 * 1. **`parent` aponta pra id inexistente** → tratada como raiz.
 * 2. **Ciclo em `parent`** (A pai de B, B pai de A) → o grupo inteiro é
 *    promovido a raiz, no fim da lista.
 *
 * ⚠️ O caso 2 **não funcionava** até este teste existir. A guarda `visitados`
 * impedia o estouro de pilha, mas a varredura partia de `porPai.get(null)` — e
 * num ciclo puro NENHUMA linha tem pai nulo, então o balde raiz vem vazio e a
 * função devolvia `[]`. O Gantt renderizava **em branco**, sem erro, com todas
 * as tarefas no `rows`.
 *
 * Era a L-060 na prática: este bloco de comentário já prometia "não deve virar
 * tarefa invisível", e quem leu (eu, duas rodadas atrás) parou de investigar.
 * Comentário que afirma garantia tem que ter a garantia verificada.
 */
export function flattenRows(
  rows: GanttRow[],
  collapsedIds: ReadonlySet<string>,
): GanttFlatRow[] {
  const porPai = new Map<string | null, GanttRow[]>();
  const ids = new Set(rows.map((r) => r.id));

  for (const row of rows) {
    const pai = row.parent && ids.has(row.parent) ? row.parent : null;
    const lista = porPai.get(pai);
    if (lista) lista.push(row);
    else porPai.set(pai, [row]);
  }

  const saida: GanttFlatRow[] = [];
  const visitados = new Set<string>();

  const visitarIrmaos = (
    irmaos: GanttRow[],
    depth: number,
    ancestorHasNext: boolean[],
  ): void => {
    irmaos.forEach((row, idx) => {
      // Guarda contra ciclo em `parent` (A pai de B, B pai de A). Sem ela, a
      // recursão estoura a pilha e o app morre em branco.
      if (visitados.has(row.id)) return;
      visitados.add(row.id);

      const filhos = porPai.get(row.id) ?? [];
      const colapsada = collapsedIds.has(row.id) || (row.collapsed ?? false);
      /**
       * ⚠️ `isLast` mede a posição entre os IRMÃOS da lista de entrada, não
       * entre as linhas visíveis. É o mesmo nó, colapsado ou não — o conector
       * do último filho tem que ser "└" independentemente de o pai dele estar
       * aberto.
       */
      const isLast = idx === irmaos.length - 1;

      saida.push({
        row,
        depth,
        hasChildren: filhos.length > 0,
        collapsed: colapsada,
        isLast,
        ancestorHasNext,
      });

      // O filho herda a pilha do pai MAIS "eu ainda tenho irmão?" — que é o
      // que faz a vertical do meu nível continuar descendo por baixo dele.
      if (!colapsada) {
        visitarIrmaos(porPai.get(row.id) ?? [], depth + 1, [
          ...ancestorHasNext,
          !isLast,
        ]);
      }
    });
  };

  visitarIrmaos(porPai.get(null) ?? [], 0, []);

  /**
   * Segunda passada: quem não foi alcançado por nenhuma raiz.
   *
   * Só acontece com ciclo em `parent` — sem ciclo, todo nó tem um caminho até
   * uma raiz. Promover a raiz é a escolha menos ruim: a hierarquia daquele
   * grupo está mentindo de qualquer jeito, e mostrar as tarefas achatadas no
   * fim da lista é melhor que um cronograma em branco.
   *
   * ⚠️ `visitarIrmaos` é chamada com o grupo INTEIRO de órfãos como irmãos, e
   * não uma vez por órfão: assim `isLast` sai correto (só o último recebe
   * `true`) em vez de todos receberem, que desenharia um "└" em cada linha.
   */
  /**
   * ⚠️ Alcançabilidade é medida IGNORANDO o collapse, e não pelo `visitados`.
   *
   * Filho de nó colapsado também está fora do `visitados` — de propósito. Usar
   * `visitados` aqui promovia esses filhos a raiz, e colapsar uma fase passava a
   * MOSTRAR as tarefas dela no fim da lista em vez de esconder. Três testes de
   * collapse reprovaram na hora; sem eles, o defeito seria "colapsar não
   * funciona", reportado dias depois.
   */
  const alcancaveis = new Set<string>();
  const alcancar = (paiId: string | null): void => {
    for (const row of porPai.get(paiId) ?? []) {
      if (alcancaveis.has(row.id)) continue;
      alcancaveis.add(row.id);
      alcancar(row.id);
    }
  };
  alcancar(null);

  const orfaos = rows.filter((r) => !alcancaveis.has(r.id));
  if (orfaos.length > 0) visitarIrmaos(orfaos, 0, []);

  return saida;
}

/**
 * Intervalo de um `summary`, derivado dos descendentes.
 *
 * Devolve `null` quando não há descendente com barra — e aí o `summary` não
 * desenha nada, em vez de desenhar uma barra de duração zero em 1970.
 *
 * ⚠️ Percorre TODA a descendência, não só os filhos diretos: um `summary` de
 * fase cujos filhos são outros `summary` teria intervalo vazio se olhasse um
 * nível só.
 */
export function deriveSummaryRange(
  rowId: string,
  rows: GanttRow[],
): { start: Date; end: Date } | null {
  const porPai = new Map<string, GanttRow[]>();
  for (const r of rows) {
    if (!r.parent) continue;
    const l = porPai.get(r.parent);
    if (l) l.push(r);
    else porPai.set(r.parent, [r]);
  }

  const datas: Date[] = [];
  const vistos = new Set<string>();
  const coletar = (id: string): void => {
    if (vistos.has(id)) return;
    vistos.add(id);
    for (const filho of porPai.get(id) ?? []) {
      for (const b of filho.bars) {
        datas.push(b.start, b.end);
      }
      coletar(filho.id);
    }
  };
  coletar(rowId);

  if (datas.length === 0) return null;
  return { start: minDate(datas), end: maxDate(datas) };
}

/* ──────────────────────────────────────────────── janela derivada ── */

/**
 * Janela a partir dos dados, pro caso em que o consumidor não passa uma.
 *
 * A folga de 1 unidade em cada ponta não é estética: sem ela, a primeira e a
 * última barra encostam na borda e ficam indistinguíveis de barras que
 * atravessam a janela (que é o que `continuesBefore/After` sinaliza).
 */
export function deriveWindow(
  rows: GanttRow[],
  granularity: GanttGranularity = "day",
): { start: Date; end: Date } {
  const datas: Date[] = [];
  for (const r of rows) for (const b of r.bars) datas.push(b.start, b.end);

  if (datas.length === 0) {
    const hoje = startOfDay(new Date());
    return { start: hoje, end: addDays(hoje, 29) };
  }

  const folga = granularity === "day" ? 1 : granularity === "week" ? 7 : 31;
  return {
    start: addDays(startOfDay(minDate(datas)), -folga),
    end: addDays(startOfDay(maxDate(datas)), folga),
  };
}

/* ──────────────────────────────────────── altura das linhas ── */

/**
 * Altura de cada linha visível — **a fonte ÚNICA, consumida pelos dois painéis**.
 *
 * ⚠️ Isto existe porque a primeira versão calculava a altura em DOIS lugares: o
 * canvas somava lanes (`n * LANE + 8`) e a grade usava a constante fixa. Numa
 * linha-contêiner com 3 barras, o canvas dava 98px e a grade 44 — e as duas
 * metades da MESMA linha ficavam com alturas diferentes, com o nome desalinhado
 * das barras a partir dali pra baixo.
 *
 * É exatamente a L-038: default resolvido em dois render-sites que divergem. A
 * correção é resolver na fonte, não em cada lugar.
 */
export function rowHeights(
  rows: readonly GanttFlatRow[],
  baseHeight: number,
  laneHeight: number,
): number[] {
  return rows.map(({ row }) => {
    const modo = row.lanePacking ?? "stack";
    const n = modo === "stack" ? Math.max(1, row.bars.length) : 1;
    // Nunca MENOR que a base: encolher desalinharia com o alvo de toque.
    return Math.max(baseHeight, n * laneHeight + 8);
  });
}

/** `top` acumulado de cada linha, a partir das alturas. */
export function rowOffsets(heights: readonly number[]): number[] {
  const saida: number[] = [];
  let acc = 0;
  for (const h of heights) {
    saida.push(acc);
    acc += h;
  }
  return saida;
}

/* ───────────────────────────────── grade de mês (visão calendar) ── */

/**
 * Matriz do mês — 6 linhas × 7 colunas, SEMPRE.
 *
 * ⚠️ **Duplicado de propósito do `Scheduler`.** A spec (§5) registra a decisão:
 * o `Gantt` é dono das suas visões porque delegar criaria acoplamento por
 * herança de propósito — necessidade nova do Gantt viraria mudança numa API
 * publicada que serve outros consumidores.
 *
 * O que a duplicação NÃO pode causar é divergência silenciosa de layout, e é
 * por isso que esta função tem teste próprio sobre as mesmas bordas: mês que
 * começa no domingo, fevereiro de ano comum, virada de ano.
 *
 * 6 linhas fixas e não "as que precisar": grade que muda de altura ao navegar
 * de mês faz o conteúdo abaixo pular.
 */
export function buildMonthMatrix(
  anchor: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0,
): Date[][] {
  const primeiro = startOfMonth(anchor);
  const inicio = startOfWeek(primeiro, { weekStartsOn });
  const semanas: Date[][] = [];
  for (let s = 0; s < 6; s++) {
    const semana: Date[] = [];
    for (let d = 0; d < 7; d++) semana.push(addDays(inicio, s * 7 + d));
    semanas.push(semana);
  }
  return semanas;
}

/**
 * Quantos chips cabem numa célula do mês, e quantos sobram.
 *
 * ⚠️ Duplicado do `Scheduler` pelo mesmo motivo acima.
 *
 * A linha "+N mais" ocupa **um slot do mesmo tamanho de um chip** — por isso
 * `visible` é `max - 1` quando há estouro. Ignorar isso faz o último chip ser
 * empurrado pra fora da célula pela própria linha de estouro.
 *
 * E o estouro só existe a partir de `total > max`: com exatamente `max` itens,
 * mostrar `max - 1` + "+1 mais" seria trocar um chip por um aviso.
 */
export function computeOverflow(
  total: number,
  max: number,
): { visible: number; overflowCount: number } {
  if (max <= 0) return { visible: 0, overflowCount: total };
  if (total <= max) return { visible: total, overflowCount: 0 };
  const visible = Math.max(0, max - 1);
  return { visible, overflowCount: total - visible };
}

/**
 * Dias que uma barra ocupa dentro de um mês — pra virar chip em cada dia.
 *
 * ⚠️ Duplicado do `segmentMultiDay` do `Scheduler`, mesmo motivo.
 *
 * A guarda de 400 iterações existe porque `end` anterior a `start` (dado sujo)
 * faria o `while` nunca terminar. Devolve vazio nesse caso, não loop infinito.
 */
export function daysOfBar(bar: GanttBar): Date[] {
  const saida: Date[] = [];
  let cursor = startOfDay(bar.start);
  const fim = startOfDay(bar.end);
  if (fim < cursor) return saida;
  let guarda = 0;
  while (cursor.getTime() <= fim.getTime() && guarda < 400) {
    saida.push(cursor);
    cursor = addDays(cursor, 1);
    guarda++;
  }
  return saida;
}

/** Último dia visível da matriz, pra recortar barras na visão de mês. */
export function monthMatrixRange(weeks: Date[][]): { start: Date; end: Date } {
  return { start: weeks[0][0], end: endOfMonthMatrix(weeks) };
}

function endOfMonthMatrix(weeks: Date[][]): Date {
  const ultima = weeks[weeks.length - 1];
  return ultima[ultima.length - 1];
}

/** Fim do mês âncora — pra distinguir dia "de fora" na grade. */
export function monthBounds(anchor: Date): { start: Date; end: Date } {
  return { start: startOfMonth(anchor), end: endOfMonth(anchor) };
}
