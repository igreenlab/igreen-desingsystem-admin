import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Card — superfície de conteúdo, com `size` que escala o padding interno de TODAS as
 * partes e um `variant` de header em faixa.
 *
 * ## `size` — 3 densidades, propagadas por contexto
 *
 *     lg  →  24px  (pad-4xl)
 *     md  →  20px  (pad-3xl)   ← DEFAULT
 *     sm  →  16px  (pad-2xl)
 *
 * O valor é declarado **uma vez no `<Card>`** e chega em `CardHeader`/`CardContent`/
 * `CardFooter` por `CardSizeContext` — o mesmo mecanismo que o `Tabs` usa pro
 * `variant`. Repetir `size` nas partes é o erro que deixa uma seção com densidade
 * diferente do resto do card.
 *
 * ⚠️ **`md` (20px) é o default, e antes era 24px.** Mudança deliberada de 2026-08-19:
 * 24 virou o `lg`. Card que dependia dos 24px passa `size="lg"`.
 *
 * ⚠️ Não existe 18px na escala de `pad` (vai 16 → 20 → 24), então `sm` é **16px**.
 *
 * ## O padding é dividido entre o Card e as partes — e é de propósito
 *
 * O `Card` carrega o padding **vertical** (`py-*`); cada parte carrega o
 * **horizontal** (`px-*`). Assim o `gap` do Card controla o respiro ENTRE seções sem
 * somar com padding de cada uma, e uma parte pode ser full-bleed (tabela que encosta
 * nas bordas, imagem de topo) só zerando o próprio `px`.
 *
 * ## `CardHeader variant="banded"` — header em faixa
 *
 * Fundo `bg-subtle` + borda embaixo, encostado nas bordas do card. Espelha o padrão
 * das seções de `#/order-detail` e `?app=edit-page`, que era composição local do
 * showcase e agora é variante do componente.
 *
 * Mecânica: a faixa precisa **cancelar o padding vertical do Card** pra encostar no
 * topo (`-mt-*` do mesmo tamanho do `size`) e arredondar as quinas de cima
 * (`rounded-t-*`) — em vez de `overflow-hidden` no Card, que clipa qualquer coisa que
 * precise vazar. Ela também troca o `px-*` por padding nos 4 lados, senão o texto
 * cola na borda de cima.
 */

/* ── size: contexto ──────────────────────────────────────────────────────── */

type CardSize = "sm" | "md" | "lg"

const CardSizeContext = React.createContext<CardSize>("md")

/**
 * Padding interno por size — via `pad-card-*`, a família de token **dedicada a
 * padding de card** (`tokens/.../components/spacing.ts`), não a escala genérica
 * `pad-*`. Os valores são iguais (16/20/24), mas o semântico existe pra isto: mudar
 * a densidade de card no futuro é mexer em `padCard`, num lugar, sem caçar
 * `pad-3xl` espalhado.
 *
 * A família é simétrica desde 2026-08-19 (`sm`/`md`/`lg`). O nome antigo `pad-card-base`
 * continua existindo como **alias de `md`**, só pra não quebrar quem já o consome — não
 * usar aqui nem em código novo. Ver o cabeçalho de `components/spacing.ts`.
 */
const PAD_X: Record<CardSize, string> = {
  sm: "px-pad-card-sm",
  md: "px-pad-card-md",
  lg: "px-pad-card-lg",
}
const PAD_Y: Record<CardSize, string> = {
  sm: "py-pad-card-sm",
  md: "py-pad-card-md",
  lg: "py-pad-card-lg",
}
const PAD_ALL: Record<CardSize, string> = {
  sm: "p-pad-card-sm",
  md: "p-pad-card-md",
  lg: "p-pad-card-lg",
}
/** Cancela o `py` do Card, pra faixa encostar no topo. */
const PULL_TOP: Record<CardSize, string> = {
  sm: "-mt-pad-card-sm",
  md: "-mt-pad-card-md",
  lg: "-mt-pad-card-lg",
}

/* ── Card ────────────────────────────────────────────────────────────────── */

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { size?: CardSize }
>(({ className, size = "md", ...props }, ref) => (
  <CardSizeContext.Provider value={size}>
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-gp-4xl rounded-radius-base bg-bg-surface text-body-md text-fg-default shadow-sh-lg ring-1 ring-fg-default/5 dark:ring-fg-default/10",
        PAD_Y[size],
        className
      )}
      {...props}
    />
  </CardSizeContext.Provider>
))
Card.displayName = "Card"

/* ── CardHeader ──────────────────────────────────────────────────────────── */

type CardHeaderVariant = "plain" | "banded"

/**
 * Não há contexto de variante aqui de propósito. Houve um, por ~20 minutos em
 * 2026-08-19, pra a faixa deixar o título semibold enquanto o header plano ficava
 * medium — até descobrir que o preset `text-title-md` **já é 600** e que o `medium`
 * era um override indevido no `CardTitle`. Removido o override, o peso é o mesmo nas
 * duas variantes e o contexto virou código morto.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: CardHeaderVariant }
>(({ className, variant = "plain", ...props }, ref) => {
  const size = React.useContext(CardSizeContext)
  return (
    <div
      ref={ref}
      className={cn(
        // `gap-gp-2xs` (2px) e não `gp-sm` (6px): título e subtítulo de card são UMA
        // unidade de leitura, não dois blocos. Com 6px o subtítulo lê como parágrafo
        // solto sob o título; com 2px lê como legenda dele. É o valor que o showcase
        // já aplicava no helper local dos cards de gráfico — a diferença apareceu ao
        // comparar o mesmo card montado com o helper e com este componente, e o
        // mantenedor escolheu o compacto como padrão (2026-08-19).
        //
        // ⚠️ Divergência DELIBERADA do shadcn upstream, que usa 6px: ao re-sincronizar
        // este primitivo, não reverter (mesma classe de cuidado da L-040).
        "grid auto-rows-min items-start gap-gp-2xs",
        variant === "banded"
          ? cn(
              // Faixa: padding nos 4 lados (o `px` sozinho deixaria o texto colado no
              // topo), fundo, divisória, e o `-mt` que cancela o `py` do Card pra
              // encostar na borda. `rounded-t` em vez de `overflow-hidden` no Card —
              // clipar o Card quebraria qualquer coisa que precise vazar dele.
              PAD_ALL[size],
              PULL_TOP[size],
              // `bg-subtle` + `border-subtle`: os mesmos tokens da referência
              // (`SectionCard` do order-detail / `?app=edit-page`), escolhidos pelo
              // mantenedor em 2026-08-19.
              //
              // ⚠️ Medido, pra quem for mexer não achar que é descuido: no **dark** o
              // `bg-subtle` é 1% de branco sobre um surface de 0.225 — ~0,8pp de
              // diferença, uma faixa **muito** discreta. No light são 0.973 sobre
              // 1.0, que lê normalmente. É restrição intencional, não bug: a decisão
              // veio de quem desenhou a tela de referência. Se um dia o dark precisar
              // de mais presença, `bg-muted` é 3× (e no light é idêntico ao subtle).
              "rounded-t-radius-base border-b border-border-subtle bg-bg-subtle"
            )
          : PAD_X[size],
        className
      )}
      {...props}
    />
  )
})
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // SEM `font-*`: o peso vem do preset. `text-title-md` já emite `font-weight: 600`
    // (conferido no tema gerado), o token declara *"title: 600 (semibold) — mais usado
    // no projeto"*, e o `DESIGN.md` lista `title-md · 600 · Card title (default)`.
    //
    // Aqui havia um `font-medium` que **anulava o próprio preset** e derrubava o título
    // pra 500 — sem estar documentado em lugar nenhum, e contra o spec do DS. Foi achado
    // em 2026-08-19 comparando o mesmo card montado com o helper local do showcase (que
    // acertava, `font-semibold`) e com este componente. Não reintroduzir: quem quer outro
    // peso passa `font-*` no `className`, que é o caminho de exceção.
    className={cn("text-title-md text-fg-default", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // `caption-md` (12px/400) e não `body-md` (14/400) — decisão do mantenedor
    // 2026-08-19: 14 competia com o conteúdo do card.
    //
    // Entre os dois presets de 12px, `caption-md` e não `body-xs`, por PESO: `body-xs`
    // é 12/**500**, o que deixaria o subtítulo mais pesado que os 400 de hoje e pediria
    // um `font-normal` por cima — reintroduzindo o override de preset que acabou de sair
    // do `CardTitle`. `caption-md` é 12/400: só o tamanho muda. E é o que o
    // `CardCheckbox.description` já usa, que é o análogo mais próximo no DS.
    className={cn("text-caption-md text-fg-muted", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/* ── CardContent · CardFooter ────────────────────────────────────────────── */

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const size = React.useContext(CardSizeContext)
  return <div ref={ref} className={cn(PAD_X[size], className)} {...props} />
})
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const size = React.useContext(CardSizeContext)
  return (
    <div
      ref={ref}
      className={cn("flex items-center", PAD_X[size], className)}
      {...props}
    />
  )
})
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
export type { CardSize, CardHeaderVariant }
