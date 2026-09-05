import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";
import type {
  GanttBar,
  GanttLink,
  GanttLinkType,
  GanttLinkViolation,
} from "../gantt.types";

/**
 * Grafo de vínculos do `Gantt` — **puro**: sem React, sem DOM.
 *
 * É a parte que distingue Gantt de timeline. Sem isto o componente mostra
 * tarefas com datas; com isto mostra um modelo de como o projeto funciona.
 *
 * ## O componente VALIDA e SINALIZA. Não corrige.
 *
 * Nenhuma função aqui devolve datas novas. Vínculo violado vira
 * `GanttLinkViolation`, que a raiz emite em `onLinkViolations` e a barra pinta
 * com marcação de conflito.
 *
 * Corrigir cronograma é decisão de negócio: mover a tarefa que atrasou, cortar
 * escopo, aceitar o atraso ou renegociar o vínculo são quatro respostas
 * diferentes pro mesmo conflito, e o componente não tem como escolher. É a
 * mesma posição do `onEventMove` do `Scheduler` e do `onCardMove` do `Kanban` —
 * o DS é dumb sobre mutação por princípio, e aqui isso vale em dobro porque o
 * erro seria invisível: datas reescritas sozinhas parecem dados.
 */

/* ────────────────────────────────────────────────────── restrições ── */

/**
 * A borda de cada tipo de vínculo — a data que o `target` não pode violar.
 *
 * | Tipo | Restrição                           |
 * |------|-------------------------------------|
 * | `FS` | `target.start ≥ source.end   + lag` |
 * | `SS` | `target.start ≥ source.start + lag` |
 * | `FF` | `target.end   ≥ source.end   + lag` |
 * | `SF` | `target.end   ≥ source.start + lag` |
 *
 * A primeira letra diz de qual ponta do `source` sai; a segunda, qual ponta do
 * `target` é restringida. `FS` = sai do Finish, restringe o Start.
 */
export function constraintDates(
  tipo: GanttLinkType,
  source: GanttBar,
  target: GanttBar,
  lag = 0,
): { limite: Date; pontaAlvo: Date } {
  const de = tipo === "FS" || tipo === "FF" ? source.end : source.start;
  const pontaAlvo = tipo === "FS" || tipo === "SS" ? target.start : target.end;
  return { limite: addDays(startOfDay(de), lag), pontaAlvo: startOfDay(pontaAlvo) };
}

/**
 * Confere um vínculo contra as datas atuais.
 *
 * `null` = satisfeito. Caso contrário, `deficitDays` é o quanto o alvo teria que
 * andar pra frente — número que a mensagem de erro usa e que o consumidor pode
 * aplicar se quiser corrigir.
 *
 * ⚠️ Vínculo cujo `source` ou `target` não existe no conjunto de barras é
 * **ignorado**, não reportado como violação. Referência pendente acontece
 * durante paginação e durante edição otimista; tratar como conflito encheria a
 * tela de falso positivo em estado transitório.
 */
export function checkLink(
  link: GanttLink,
  bars: ReadonlyMap<string, GanttBar>,
): GanttLinkViolation | null {
  const source = bars.get(link.source);
  const target = bars.get(link.target);
  if (!source || !target) return null;

  const { limite, pontaAlvo } = constraintDates(
    link.type ?? "FS",
    source,
    target,
    link.lag ?? 0,
  );

  const deficitDays = differenceInCalendarDays(limite, pontaAlvo);
  if (deficitDays <= 0) return null;
  return { link, deficitDays };
}

export function checkAllLinks(
  links: readonly GanttLink[],
  bars: ReadonlyMap<string, GanttBar>,
): GanttLinkViolation[] {
  const saida: GanttLinkViolation[] = [];
  for (const l of links) {
    const v = checkLink(l, bars);
    if (v) saida.push(v);
  }
  return saida;
}

/* ─────────────────────────────────────────── ordenação topológica ── */

export type TopoResult =
  | { ok: true; order: string[] }
  | { ok: false; cycle: string[] };

/**
 * Kahn sobre o grafo de barras. Base do caminho crítico.
 *
 * Devolve `ok: false` com os ids que sobraram quando há ciclo — e isso é
 * **resultado**, não exceção. Ciclo é dado do consumidor, não bug do
 * componente; lançar mataria a tela inteira por causa de dois vínculos
 * invertidos. A raiz encaminha pra `onGraphError` e simplesmente não pinta
 * caminho crítico.
 *
 * ⚠️ Auto-vínculo (`source === target`) conta como ciclo de um nó. Parece
 * pedante, mas acontece: duplicar uma tarefa junto com seus vínculos produz
 * exatamente isso, e sem a checagem o nó ficaria com grau de entrada 1 pra
 * sempre e o algoritmo devolveria ordem incompleta em silêncio.
 */
export function topoSort(
  barIds: readonly string[],
  links: readonly GanttLink[],
): TopoResult {
  const existe = new Set(barIds);
  const grauEntrada = new Map<string, number>();
  const saintes = new Map<string, string[]>();

  for (const id of barIds) {
    grauEntrada.set(id, 0);
    saintes.set(id, []);
  }

  for (const l of links) {
    if (!existe.has(l.source) || !existe.has(l.target)) continue;
    saintes.get(l.source)!.push(l.target);
    grauEntrada.set(l.target, (grauEntrada.get(l.target) ?? 0) + 1);
  }

  const fila = barIds.filter((id) => (grauEntrada.get(id) ?? 0) === 0);
  const order: string[] = [];

  while (fila.length > 0) {
    const atual = fila.shift()!;
    order.push(atual);
    for (const proximo of saintes.get(atual) ?? []) {
      const g = (grauEntrada.get(proximo) ?? 0) - 1;
      grauEntrada.set(proximo, g);
      if (g === 0) fila.push(proximo);
    }
  }

  if (order.length !== barIds.length) {
    return { ok: false, cycle: barIds.filter((id) => !order.includes(id)) };
  }
  return { ok: true, order };
}

/* ────────────────────────────────────────────────── caminho crítico ── */

/**
 * Barras no caminho crítico — a sequência que determina a data final.
 *
 * Método: passagem pra frente calcula o começo mais cedo (`earlyStart`) de cada
 * barra respeitando os vínculos; passagem pra trás calcula o mais tarde
 * (`lateStart`) sem atrasar o projeto. Folga zero (`lateStart − earlyStart`) =
 * crítica.
 *
 * ⚠️ **Só considera `FS`.** Os outros três tipos exigem tratar as duas pontas
 * como nós independentes no grafo (o CPM clássico é sobre *atividade-em-nó* com
 * início e fim separados), e implementar isso pela metade daria caminho crítico
 * *plausível e errado* — que é pior que não ter. `SS`/`FF`/`SF` continuam sendo
 * validados por `checkAllLinks`; só não entram no cálculo de criticidade.
 *
 * Registrado como limite conhecido na USAGE, não escondido.
 */
export function computeCriticalPath(
  bars: readonly GanttBar[],
  links: readonly GanttLink[],
): { critical: Set<string> } | { cycle: string[] } {
  const ids = bars.map((b) => b.id);
  const topo = topoSort(ids, links);
  if (!topo.ok) return { cycle: topo.cycle };

  const porId = new Map(bars.map((b) => [b.id, b]));
  const fsEntrando = new Map<string, GanttLink[]>();
  const fsSaindo = new Map<string, GanttLink[]>();
  for (const l of links) {
    if ((l.type ?? "FS") !== "FS") continue;
    if (!porId.has(l.source) || !porId.has(l.target)) continue;
    empurrar(fsEntrando, l.target, l);
    empurrar(fsSaindo, l.source, l);
  }

  const duracao = (id: string): number => {
    const b = porId.get(id)!;
    return Math.max(0, differenceInCalendarDays(startOfDay(b.end), startOfDay(b.start)));
  };

  // Origem comum: o menor start do conjunto. Medir em dias relativos evita
  // aritmética de Date dentro do laço e mantém o cálculo inteiro em números.
  const base = startOfDay(
    bars.reduce((min, b) => (b.start < min ? b.start : min), bars[0]?.start ?? new Date()),
  );
  const inicioRelativo = (id: string): number =>
    differenceInCalendarDays(startOfDay(porId.get(id)!.start), base);

  const early = new Map<string, number>();
  for (const id of topo.order) {
    const entradas = fsEntrando.get(id) ?? [];
    const porVinculo = entradas.map(
      (l) => (early.get(l.source) ?? 0) + duracao(l.source) + (l.lag ?? 0),
    );
    // Sem predecessor, o mais cedo é a própria data informada — o componente não
    // reagenda nada (ver a nota do topo). Com predecessor, é o mais restritivo
    // entre a data informada e o que os vínculos exigem.
    early.set(id, Math.max(inicioRelativo(id), ...porVinculo));
  }

  const fimProjeto = Math.max(
    0,
    ...topo.order.map((id) => (early.get(id) ?? 0) + duracao(id)),
  );

  const late = new Map<string, number>();
  for (const id of [...topo.order].reverse()) {
    const saidas = fsSaindo.get(id) ?? [];
    if (saidas.length === 0) {
      late.set(id, fimProjeto - duracao(id));
    } else {
      late.set(
        id,
        Math.min(
          ...saidas.map((l) => (late.get(l.target) ?? fimProjeto) - duracao(id) - (l.lag ?? 0)),
        ),
      );
    }
  }

  const critical = new Set<string>();
  for (const id of ids) {
    const folga = (late.get(id) ?? 0) - (early.get(id) ?? 0);
    if (folga <= 0) critical.add(id);
  }
  return { critical };
}

/** `map[chave].push(valor)`, criando a lista na primeira vez. */
function empurrar<T>(map: Map<string, T[]>, chave: string, valor: T): void {
  const lista = map.get(chave);
  if (lista) lista.push(valor);
  else map.set(chave, [valor]);
}

/* ─────────────────────────────────────────────── geometria da seta ── */

export type LinkAnchor = { x: number; y: number };

/**
 * Path SVG entre duas barras, em ortogonal (só segmentos retos).
 *
 * Ortogonal e não curva de Bézier porque com 40 vínculos as curvas viram um
 * emaranhado onde não se segue nenhuma; segmentos retos com cotovelo se leem
 * mesmo cruzados. É o que todas as referências com muitos vínculos fazem.
 *
 * `saiDireita`/`entraEsquerda` derivam do TIPO: um `FS` sai da ponta direita do
 * source e entra na esquerda do target; um `SS` sai da esquerda e entra na
 * esquerda. Sem isso a seta de um `SS` sairia do lado errado e sugeriria FS.
 */
export function linkPath(
  de: LinkAnchor,
  para: LinkAnchor,
  opts: { saiDireita: boolean; entraEsquerda: boolean; recuo?: number },
): string {
  const recuo = opts.recuo ?? 12;
  const x1 = de.x + (opts.saiDireita ? recuo : -recuo);
  const x2 = para.x + (opts.entraEsquerda ? -recuo : recuo);

  // Meio vertical entre as duas linhas — o cotovelo. Quando as barras estão na
  // mesma linha, degenera num segmento reto, que é o desejado.
  const meioY = de.y === para.y ? de.y : (de.y + para.y) / 2;

  return [
    `M ${de.x} ${de.y}`,
    `L ${x1} ${de.y}`,
    `L ${x1} ${meioY}`,
    `L ${x2} ${meioY}`,
    `L ${x2} ${para.y}`,
    `L ${para.x} ${para.y}`,
  ].join(" ");
}

/** Qual ponta de cada barra o vínculo conecta. */
export function linkSides(tipo: GanttLinkType): {
  saiDireita: boolean;
  entraEsquerda: boolean;
} {
  return {
    saiDireita: tipo === "FS" || tipo === "FF",
    entraEsquerda: tipo === "FS" || tipo === "SS",
  };
}
