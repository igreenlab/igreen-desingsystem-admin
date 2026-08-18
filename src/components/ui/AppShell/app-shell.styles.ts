import { tv } from "@/utils/tv";

/**
 * Slots do `<AppShell>` template.
 *
 * Layout 2-column: sidebar à esquerda (fixa, full-height) + main area
 * à direita (Header sticky no topo + body abaixo).
 *
 * Body recebe `gap-gp-4xl` (24px) fixo e padding responsivo em 3 patamares
 * (18 / 24 / 32px — ver `bodyInner`) por design — slot "padronizado" pra todas
 * as telas. Consumer customiza só os filhos.
 */

/**
 * Raiz do shell. A altura é o ponto sensível aqui.
 *
 * ## Por que `fillHeight` existe (medido em 2026-08-18)
 *
 * `h-screen` é 100vh **sempre**, ignorando a altura do container pai. Consequência
 * medida na própria página de doc do AppShell, que o renderiza dentro de
 * `<div class="h-[640px] … overflow-hidden">`:
 *
 *   container do exemplo   640px
 *   <main> do shell        660px  (60 do header + 660 = 720 = 100vh)
 *   → o shell termina 56px ABAIXO da borda, e o overflow-hidden do wrapper
 *     corta esse pedaço — levando os 24px de padding-bottom do body junto
 *
 * O sintoma que aparece é "o conteúdo está colado na borda de baixo", e a leitura
 * natural é "falta padding-bottom". **Não falta**: o padding existe e é simétrico
 * (medido: 24px em cima e 24px embaixo). Ele está sendo *clipado*. Acrescentar mais
 * padding não consertaria nada — só mudaria o quanto se perde.
 *
 * Vale para qualquer consumidor que embuta o shell em algo com altura definida:
 * um layout com footer próprio, um painel de aba, um card de preview.
 *
 *   fillHeight=false (default)  h-screen  — o shell É a página. Comportamento atual,
 *                                           preservado pra não mexer em quem já usa.
 *   fillHeight=true             h-full    — o shell obedece o pai. **Exige que o pai
 *                                           tenha altura**: `h-full` sem pai medido
 *                                           colapsa pra zero, que é o modo de falhar
 *                                           deste modo.
 */
export const root = tv({
  base: [
    "flex w-full bg-bg-canvas",
    "overflow-hidden", // garante que sidebar + main não vazem o container
  ],
  variants: {
    fillHeight: {
      false: "h-screen",
      true: "h-full",
    },
  },
  defaultVariants: { fillHeight: false },
});

/** Wrapper da área principal (Header + Body). Ocupa o resto do flex row. */
export const main = tv({
  base: [
    "flex flex-col flex-1 min-w-0",
    "overflow-hidden",
  ],
});

/**
 * Body slot — wrapper externo do conteúdo da tela. Gerencia scroll.
 * `min-h-0` permite o body shrink dentro do flex pai pra scroll interno
 * funcionar (children podem ter `overflow-auto` ou `flex-1 min-h-0` próprio).
 *
 * O padding + gap + max-width ficam no `bodyInner` (slot interno) — assim
 * o scroll continua na viewport inteira mesmo em layout=compact.
 */
export const body = tv({
  base: [
    "flex flex-col flex-1 min-h-0",
    "overflow-auto scrollbar-thin",
  ],
});

/**
 * Wrapper interno do body — controla padding, gap entre filhos e o max-width
 * conforme `layout`.
 *
 *   - `fluid`   (default): ocupa 100% da largura disponível (atual)
 *   - `compact`: max-width 1368px (`--container-main-content-max`), centralizado
 *
 * Padding por faixa de viewport — 3 patamares, não 2:
 *
 *   < 768px   (max-md)   18px  — telas pequenas precisam respiro mínimo mas não
 *                               zero (chat/navegação por overlays usam o
 *                               bodyInner cheio).
 *   768–1535  (max-2xl)  24px  — NOTEBOOK. Até 2026-08-04 esta faixa herdava os
 *                               32px do desktop: um 1366×768 gastava a mesma
 *                               moldura de um 4K, com muito menos área útil.
 *                               O corte é em `2xl` (1536) e não em `xl` (1280)
 *                               porque 1366 e 1536 são as duas resoluções de
 *                               notebook dominantes — cortar em `xl` deixaria a
 *                               1536 de fora justamente onde aperta.
 *   ≥ 1536px             32px  — desktop, valor original preservado.
 *
 * ⚠️ `max-md:` tem que vencer `max-2xl:` abaixo de 768px. Vence por ordem de
 * fonte: o Tailwind emite as variantes `max-*` em breakpoint DECRESCENTE, então
 * a regra `max-md` sai depois da `max-2xl` com a mesma especificidade. Medido no
 * browser nos 3 patamares, não deduzido — é a classe de erro da L-066.
 */
export const bodyInner = tv({
  base: [
    "flex flex-col flex-1 min-h-0 w-full mx-auto",
    "gap-gp-4xl p-pad-6xl max-2xl:p-pad-4xl",
  ],
  variants: {
    layout: {
      fluid: "max-w-full",
      compact: "max-w-[var(--container-main-content-max)]",
    },
    /**
     * Em mobile (<md):
     *   - `false` (default): padding reduzido pra 18px (telas pequenas
     *     precisam respiro mínimo).
     *   - `true`: padding zero — útil pra patterns "app feel" (chat,
     *     navegação por overlays fullscreen) onde a page controla o
     *     próprio padding interno.
     */
    mobileEdgeToEdge: {
      true: "max-md:p-0",
      false: "max-md:p-[18px]",
    },
  },
  defaultVariants: {
    layout: "fluid",
    mobileEdgeToEdge: false,
  },
});
