import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";
import type { GanttLinkType } from "../gantt.types";

/**
 * Núcleo puro do gesto — sem React, sem DOM.
 *
 * ## Por que pointer events nativos e não `@dnd-kit`
 *
 * O dnd-kit **está** no DS (o `Scheduler` e o `Kanban` usam), então isto não é
 * sobre dependência. É sobre o gesto ser de natureza diferente:
 *
 * - dnd-kit resolve **"em qual ZONA eu soltei"**. Aqui o alvo não é uma zona, é
 *   uma **coordenada contínua** no eixo do tempo — não há droppable pra colidir.
 * - O gesto é 1-D com snap em dia inteiro. Toda a maquinaria de colisão do
 *   dnd-kit seria peso morto, e o `transform` dele em px teria que ser
 *   reconvertido em data de qualquer forma.
 * - O `ganttSplitter` deste mesmo componente já usa `pointerdown` + listeners
 *   de `window`. Duas mecânicas de arraste no mesmo arquivo seria pior.
 *
 * ⚠️ Consequência de teste, e ela é a favor: o `PointerSensor` do dnd-kit
 * **recusa evento sintético** (medido nesta sessão), então um gesto por dnd-kit
 * não seria verificável no browser de teste. `pointerdown`/`pointermove`
 * nativos são.
 *
 * ## Snap em dia inteiro, e por que `addDays`
 *
 * ⛔ Nunca `new Date(t + dias * 86_400_000)`. Em fuso com horário de verão o dia
 * tem 23 ou 25 horas, e a soma em milissegundos desloca a barra em 1 hora — o
 * que, com snap, vira **um dia inteiro** de erro. `addDays` do date-fns é
 * calendário, não aritmética de timestamp. Mesma razão pela qual o resto do
 * componente usa `differenceInCalendarDays`.
 */

export type GanttDragMode = "move" | "resize-start" | "resize-end";

/**
 * Onde a barra fica depois de arrastar `deltaPx`.
 *
 * Devolve SEMPRE um par válido (`start <= end`) — ver a nota do clamp abaixo.
 * Não muta nada e não decide se a mudança é aceitável: quem aplica é o
 * consumidor, e o `Gantt` é dumb sobre mutação.
 */
export function dragToDates(
  bar: { start: Date; end: Date },
  deltaPx: number,
  pxPerDay: number,
  mode: GanttDragMode,
): { start: Date; end: Date } {
  const inicio = startOfDay(bar.start);
  const fim = startOfDay(bar.end);

  // `pxPerDay <= 0` seria divisão por zero → `Infinity` dias. Acontece em
  // largura zero (container ainda não medido), e devolver a barra intacta é
  // melhor que devolver uma data em 275760.
  if (!Number.isFinite(pxPerDay) || pxPerDay <= 0) {
    return { start: inicio, end: fim };
  }

  const dias = Math.round(deltaPx / pxPerDay);
  if (dias === 0) return { start: inicio, end: fim };

  if (mode === "move") {
    // Move preserva a duração — é a diferença entre mover e redimensionar.
    return { start: addDays(inicio, dias), end: addDays(fim, dias) };
  }

  if (mode === "resize-start") {
    const novo = addDays(inicio, dias);
    /**
     * ⚠️ **Clamp, não inversão.** Arrastar o punho inicial para depois do fim
     * seria uma barra de duração negativa — e como o `left`/`width` saem de
     * `dateToX`, a largura viraria negativa e a barra **desapareceria** no meio
     * do gesto, sem erro nenhum.
     *
     * O piso é 1 dia (`start === end`), que é como o componente representa
     * duração zero em todo o resto (`GanttBar.end` é obrigatório justamente
     * por isso). Coberto por teste.
     */
    return {
      start: differenceInCalendarDays(novo, fim) > 0 ? fim : novo,
      end: fim,
    };
  }

  const novo = addDays(fim, dias);
  return {
    start: inicio,
    // Mesmo clamp, pela mesma razão, na outra ponta.
    end: differenceInCalendarDays(novo, inicio) < 0 ? inicio : novo,
  };
}

/**
 * Que tipo de vínculo nasce ao ligar a ponta `de` de uma barra na ponta `para`
 * de outra.
 *
 * As 4 combinações cobrem os 4 tipos — não há caso descartado:
 *
 *   fim   → início   FS   finish-to-start   (o comum: "só começa quando aquela acabar")
 *   início→ início   SS   start-to-start    ("começam juntas")
 *   fim   → fim      FF   finish-to-finish  ("acabam juntas")
 *   início→ fim      SF   start-to-finish   (raro, existe em turno/handover)
 *
 * ⚠️ A ponta de DESTINO é decidida pela metade da barra em que o ponteiro
 * soltou, não por acertar a portinha de 9px. Exigir o port como alvo tornaria
 * FF e SF inalcançáveis na prática — 9px não é uma afordância, é uma punição.
 * Meia barra é alvo de verdade e ainda distingue as 4 combinações.
 */
export function linkTypeFromSides(
  de: "start" | "end",
  para: "start" | "end",
): GanttLinkType {
  if (de === "end") return para === "start" ? "FS" : "FF";
  return para === "start" ? "SS" : "SF";
}

/**
 * Em qual metade da barra o ponteiro está — decide a ponta de destino.
 *
 * `left`/`width` são os da barra na tela; `x` é relativo ao mesmo sistema de
 * coordenadas (o canvas). Barra de largura zero devolve `"start"`: sem largura
 * não há duas metades, e `start` é a ponta do caso comum (FS).
 */
export function sideFromPointer(
  x: number,
  left: number,
  width: number,
): "start" | "end" {
  if (width <= 0) return "start";
  return x < left + width / 2 ? "start" : "end";
}
