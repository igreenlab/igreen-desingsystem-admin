import { tv } from "@/utils/tv";

/**
 * PageHeader styles — bloco de título de página colocado dentro do body
 * do `<AppShell>`.
 *
 * Layout desktop:
 *   ┌──────────────────────────────────────────────────────────┐
 *   │ [title] [badge]              [action1] [action2] [CTA]   │
 *   │ description                                              │
 *   ├──────────────────────────────────────────────────────────┤
 *   │ {children — ex: <Tabs />}                                │
 *   └──────────────────────────────────────────────────────────┘
 *
 * Mobile:
 *   - Text section sai (hideTextOnMobile, default true)
 *   - Actions ocupam toda a largura; último botão vira fluid (CTA primary)
 */
export const pageHeaderStyles = tv({
  slots: {
    root: "shrink-0 flex flex-col gap-gp-md",
    topRow: "flex items-center justify-between gap-gp-2xl",
    textCol: "flex flex-col gap-gp-xs min-w-0 flex-1",
    titleRow: "flex items-center gap-gp-md",
    title: "m-0 text-title-lg font-bold tracking-[-0.01em] text-fg-default",
    description: [
      "m-0 text-body-md text-fg-subtle leading-[1.5]",
      "whitespace-nowrap overflow-hidden text-ellipsis",
    ],
    actionsRow: "flex items-center gap-gp-sm shrink-0",
    extraRow: "w-full",
  },
  variants: {
    hideTextOnMobile: {
      true: { textCol: "max-md:hidden" },
      false: {},
    },
    /**
     * Mobile: actions ocupa o espaço (text hidden) + último filho vira fluid.
     * Off = mantém actions square e shrink-0 (mesmo comportamento desktop).
     */
    mobileFluid: {
      true: {
        actionsRow: [
          "max-md:shrink max-md:flex-1 max-md:justify-end",
          "max-md:[&>:last-child]:flex-1",
        ],
      },
      false: {},
    },
  },
  defaultVariants: {
    hideTextOnMobile: true,
    mobileFluid: true,
  },
});
