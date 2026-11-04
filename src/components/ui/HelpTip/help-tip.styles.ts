import { tv } from "@/utils/tv";

/* ══════════════════════════════════════════════════════════════════════════
   HelpTip — estilos (tv). 100% sobre tokens do DS, theme-aware.

   Extraído do slot `helpButton` do `Kpi` (Task 18 / item 30 do lote Sólis) sem
   mudar uma classe: a string abaixo é byte-a-byte a que o `Kpi` emitia, e é o
   que o teste de identidade de DOM (`kpi-help-tip-dom.test.tsx`) trava.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Botão-alvo da dica. Um quadrado de `size-icon-md` com o glifo em `size-icon-xs`
 * — a caixa é maior que o ícone de propósito: o alvo de clique não pode ser do
 * tamanho do desenho.
 *
 * ⚠️ `relative z-10` na BASE, não no consumidor. O `ClickableSurface` do DS
 * estica um `<button>`/`<a>` com `inset-0 z-0` sobre o card inteiro, e o próprio
 * cabeçalho dele nomeia o caso: *"controle que fica ACIMA do card (um menu, um
 * botão de ajuda) precisa de `relative z-10`"*. Deixar isso a cargo de quem
 * compõe significa que o botão **existe e não clica** no primeiro card de
 * drill-down em que alguém o puser — falha silenciosa, porque o hover e o foco
 * continuam parecendo certos. Fora de um card clicável o par é inerte (sem
 * offsets, `relative` não desloca nada).
 */
export const helpTipStyles = tv({
  base: "relative z-10 grid size-icon-md shrink-0 place-items-center rounded-radius-full text-fg-subtle transition-colors hover:text-fg-default focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand [&>svg]:size-icon-xs",
});
