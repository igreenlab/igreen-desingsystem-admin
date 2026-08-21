import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

/**
 * Tabs — 2 variantes + largura, tudo propagado por contexto a partir do `<Tabs>`.
 *
 * ## Qual variante
 *
 *  - **"segmented" (default)** — pill group sobre `bg-muted`. Container `h-form-lg` (40px),
 *    `p-[3px]`, `radius-lg`; tab `h-[34px] px-[14px] radius-md`; ativo = `bg-accent` +
 *    `font-semibold` + `shadow-sm`. É a variante de **trocar conteúdo dentro de uma
 *    superfície**: card, bloco, `Panel`, `FloatingPanel`, `Modal`, drawer.
 *  - **"line"** — underline, pra **navegar seções de uma página** (nível de tela) ou pro 2º
 *    nível abaixo de um `segmented`. O trilho (`border-b`) **atravessa o container**; o realce
 *    de 2px fica só na aba ativa e sobrepõe o trilho via `-mb-px`.
 *
 * ⚠️ Não empilhe a MESMA variante em dois níveis — os dois passam a ler como o mesmo nível.
 *
 * ## `fullWidth` — por que isso é prop, e não classe
 *
 * Sem ela, encher a largura exigia **três** coisas escritas na mão: `w-full` no `<Tabs>`,
 * `w-full` no `<TabsList>` e `flex-1` em **cada** `<TabsTrigger>`. Medido em 2026-08-21, no
 * próprio DS: **11** `TabsList w-full`, **20** `TabsTrigger flex-1` e **1** uso de
 * `[&>*]:flex-1` (variante arbitrária, escrita justamente pra não repetir `flex-1` por
 * trigger — `ShowcasePageV2`). Contei 3 dessas na primeira medição e estava errado: as outras
 * duas são do `alert-dialog`, no footer de botões, que é outro caso.
 *
 * E o modo de errar era silencioso: `w-full` só no List **estica o container e deixa os
 * triggers agrupados na esquerda**. Era o que 6 dos 7 usos manuais faziam. Ou seja, o DS
 * obrigava a compor na unha o que ele deveria resolver, e quem consumia — IA inclusive —
 * acertava metade das vezes.
 *
 * **Use** em superfície compacta: `Panel` (560px), `FloatingPanel` (320–720 e
 * **redimensionável**), `Modal` até `lg` (720px), card, bloco.
 *
 * **Não use** em toolbar (é um controle entre controles — o `DataTable` usa hug de propósito),
 * em página livre, nem em `Modal` `xl` (1100px): full-width ali viraria uma barra de segmented
 * control gigante e pararia de ler como aba.
 *
 * O caso que a prop resolve e a doc não resolveria: o `FloatingPanel` é **redimensionável em
 * runtime**. Nenhuma regra estática de largura acerta ali — `flex-1` nos triggers acompanha o
 * arrasto do usuário.
 */
type TabsVariant = "segmented" | "line"

/**
 * Variante + largura num contexto só. O `variant` já vinha por contexto; a largura entra pelo
 * mesmo caminho porque precisa alcançar o `TabsTrigger`, que é **neto** do `Tabs` — passar por
 * prop obrigaria a repetir em cada trigger, que é exatamente o problema que a prop resolve.
 */
type TabsCtx = { variant: TabsVariant; fullWidth: boolean }
const TabsVariantContext = React.createContext<TabsCtx>({
  variant: "segmented",
  fullWidth: false,
})

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & {
    variant?: TabsVariant
    /** Abas ocupam a largura do container e se distribuem igualmente. Ver o cabeçalho. */
    fullWidth?: boolean
  }
>(({ variant = "segmented", fullWidth = false, className, ...props }, ref) => {
  const ctx = React.useMemo(() => ({ variant, fullWidth }), [variant, fullWidth])
  return (
    <TabsVariantContext.Provider value={ctx}>
      <TabsPrimitive.Root
        ref={ref}
        className={cn(fullWidth && "w-full", className)}
        {...props}
      />
    </TabsVariantContext.Provider>
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const { variant, fullWidth } = React.useContext(TabsVariantContext)
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        variant === "line"
          ? /* O trilho atravessa o container por PADRÃO. Era `w-fit`, e aí o `border-b` parava
               onde as abas paravam — um divisor que não alcança as bordas lê como fragmento, não
               como divisória. Em toda referência (Material, Carbon, Ant) o trilho do underline é
               full-bleed e só o indicador acompanha a aba ativa. */
            "inline-flex w-full items-center gap-gp-xl border-b border-border-subtle"
          : "inline-flex h-form-lg items-center bg-bg-muted p-[3px] gap-gp-2xs rounded-radius-lg",
        variant === "segmented" && (fullWidth ? "w-full" : "w-fit"),
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const { variant, fullWidth } = React.useContext(TabsVariantContext)
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-gp-sm whitespace-nowrap text-body-sm font-medium text-fg-muted transition-colors",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary",
        "hover:text-fg-default",
        "disabled:pointer-events-none disabled:opacity-50",
        variant === "line"
          ? "-mb-px h-[38px] px-[2px] pb-[8px] border-b-2 border-transparent data-[state=active]:border-border-brand data-[state=active]:text-fg-default data-[state=active]:font-semibold"
          : "h-[34px] px-[14px] rounded-radius-md data-[state=active]:bg-bg-accent data-[state=active]:text-fg-default data-[state=active]:font-semibold data-[state=active]:shadow-sh-sm",
        /* Sem isto, `w-full` no List estica o container e agrupa os triggers na esquerda — o
           defeito que 6 dos 7 usos manuais tinham. */
        fullWidth && "flex-1",
        className
      )}
      {...props}
    />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-sp-md flex-1 text-body-md outline-none",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
