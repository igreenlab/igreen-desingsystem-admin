import type { DataTableActionItem } from "../data-table.types";

/**
 * Regra de distribuição das ações de uma row entre ícones inline e o menu "…",
 * e a largura que a coluna `type: "actions"` precisa pra caber o resultado.
 *
 * ## Por que isto é um módulo próprio
 *
 * A célula (`parts/data-table-actions-cell.tsx`) decide o que renderiza; o
 * `calculate-column-widths.ts` decide quanto espaço reservar. Se cada um aplicasse a
 * regra por conta, os dois divergiriam no primeiro ajuste — foi exatamente o defeito da
 * L-038, onde header e footer liam `col.align` cru e discordavam do body. Aqui a regra
 * mora num lugar e os dois a chamam.
 *
 * ## A geometria, MEDIDA NO BROWSER (e a versão errada que ela substituiu)
 *
 * A célula é `flex items-center gap-gp-2xs justify-end` dentro de uma `TableCell` que, na
 * variante `actions`, usa **`px-pad-md`** — a variante sobrescreve o `px-pad-2xl` default
 * das outras células (`Table/table.styles.ts`, bloco `variants.actions`). Com os tokens:
 *
 *   padding    = `pad-md` × 2    = 16px
 *   ícone      = `icon-2xs` → `size-form-xs` = 28px
 *   gap        = `gp-2xs`        = 2px
 *
 *   largura(n) = 16 + 28n + 2(n−1) = **30n + 14**
 *
 * Donde 1→44, 2→74, 3→104, 4→134.
 *
 * ⚠️ A primeira versão deste módulo usava `pad-2xl` (32px de padding) e chegava a
 * `30n + 30` — 1→60, 3→120 — com a conclusão elegante de que o `ACTIONS_COLUMN_WIDTH`
 * legado (120) "era exatamente 3 slots". **Falso**: 3 slots são 104, e 120 fica entre 3 e
 * 4. O teste concordava porque derivava da mesma fórmula errada; quem pegou foi a medição
 * no browser (`width: 64px` inline, `padding: 8px/8px`, botão 28px, folga 8px). É a L-064
 * literal — teste escrito do mesmo modelo mental do código concorda por construção.
 *
 * ## O limite de 3 não é preferência estética
 *
 * É a capacidade da coluna que o componente já usava: dentro dos 120px legados sobram
 * 104 úteis, e 4 ícones pedem 118. Ou a coluna cresce, ou o excedente vai pro menu. O
 * default aqui é **mandar tudo pro menu**, porque coluna de ação larga empurra o conteúdo
 * de dados e derrota o motivo de ela estar ancorada à direita.
 */

/** Quantos ícones cabem inline nos 120px que a coluna sempre usou. */
export const ACTIONS_INLINE_MAX = 3;

/** Largura da coluna pra `n` slots renderizados (ícones + o "…" quando existe). */
export function actionsWidthForSlots(slots: number): number {
  return 30 * Math.max(1, slots) + 14;
}

/** Uma ação está oculta nesta row? `hidden` aceita boolean ou predicado. */
function oculta<T>(a: DataTableActionItem<T>, row: T): boolean {
  return typeof a.hidden === "function" ? a.hidden(row) : !!a.hidden;
}

/**
 * Divide as ações visíveis de uma row entre inline e menu.
 *
 * Precedência — e a primeira regra existe pra não passar por cima de decisão explícita:
 *
 * 1. **Algum item marca `showInMenu`** → o consumer já decidiu o split; respeitado
 *    integralmente, sem limite de quantidade. Quem quer 5 ícones inline consegue.
 * 2. Até `ACTIONS_INLINE_MAX` (3) itens → todos inline, sem "…". Uma ação só = um ícone
 *    só, que é o caso comum de "editar".
 * 3. Mais de 3 → **todos** vão pro menu, e a coluna renderiza só o "…".
 */
export function splitActionSlots<T>(
  actions: DataTableActionItem<T>[],
  row: T,
): { inline: DataTableActionItem<T>[]; menu: DataTableActionItem<T>[] } {
  const visiveis = actions.filter((a) => !oculta(a, row));
  if (visiveis.length === 0) return { inline: [], menu: [] };

  // (1) split explícito do consumer manda.
  if (visiveis.some((a) => a.showInMenu)) {
    return {
      inline: visiveis.filter((a) => !a.showInMenu),
      menu: visiveis.filter((a) => a.showInMenu),
    };
  }
  // (2) cabe inline.
  if (visiveis.length <= ACTIONS_INLINE_MAX) return { inline: visiveis, menu: [] };
  // (3) não cabe: tudo pro menu.
  return { inline: [], menu: visiveis };
}

/** Slots renderizados: um por ícone inline, mais um pro "…" quando há menu. */
export function countActionSlots<T>(split: {
  inline: DataTableActionItem<T>[];
  menu: DataTableActionItem<T>[];
}): number {
  return split.inline.length + (split.menu.length > 0 ? 1 : 0);
}

/**
 * Largura necessária pra uma coluna de ações, olhando as rows amostradas.
 *
 * Usa o **máximo** entre as rows: `hidden` pode variar por row (ex.: "cancelar" só em
 * pedido aberto), e reservar pelo menor cortaria a row mais completa. Sem `getActions`
 * ou sem rows, devolve `null` — quem chama decide o fallback.
 */
export function measureActionsWidth<T>(
  getActions: ((params: { row: T }) => DataTableActionItem<T>[]) | undefined,
  rows: T[],
): number | null {
  if (!getActions || rows.length === 0) return null;
  let maxSlots = 0;
  for (const row of rows) {
    const slots = countActionSlots(splitActionSlots(getActions({ row }), row));
    if (slots > maxSlots) maxSlots = slots;
  }
  if (maxSlots === 0) return null;
  return actionsWidthForSlots(maxSlots);
}
