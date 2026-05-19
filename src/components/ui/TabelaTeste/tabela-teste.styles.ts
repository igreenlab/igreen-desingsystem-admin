import { tv } from "@/utils/tv";

/**
 * TabelaTeste — réplica visual da tabela do sandbox /design-and-table-v2.
 *
 * Componente de referência hardcoded: sem props, sem variants, sem flexibility.
 * Serve pra fixar como tokens DS mapeiam pra esse visual específico — outros
 * componentes (Table) podem usar essas classes como guia.
 *
 * Os estilos abaixo são literais — cada key corresponde a uma classe do
 * sandbox. Densidade default = comfortable (56px), cellBorders ON.
 */

export const tabelaStyles = {
  /* ── Wrap (container externo) ─────────────────────────────────────── */
  wrap: tv({
    base: [
      "flex-1 overflow-auto min-h-0",
      "bg-bg-table border border-border-table rounded-radius-xl",
      "scrollbar-default",
    ],
  }),

  /* tbl-table — inner container, min-width: max-content pra scroll horizontal */
  table: tv({
    base: "block min-w-max",
  }),

  /* ── Head ─────────────────────────────────────────────────────────── */
  thead: tv({
    base: [
      "sticky top-0 z-[5]",
      "bg-bg-table-head",
      "border-b border-border-table",
    ],
  }),

  trHead: tv({
    base: "flex bg-bg-table-head",
  }),

  /* tbl-th base — 42px sempre, padding-right reserva espaço pro menu absoluto */
  th: tv({
    base: [
      "relative flex items-center gap-gp-sm",
      "py-0 pl-[14px] pr-[38px]",
      "h-[42px] text-body-sm font-semibold leading-none",
      "text-fg-muted cursor-pointer select-none",
      "[flex:1_0_auto]",
      "hover:text-fg-default",
      // hover do th faz menu aparecer (ver thMenu)
      // hover do th faz sort-hint aparecer (ver sortHint)
    ],
    variants: {
      sorted: { true: "text-fg-default" },
    },
    defaultVariants: { sorted: false },
  }),

  /* Coluna select — 44px, sem hover, justify-center, sem padding right pro menu */
  thSelect: tv({
    base: [
      "relative flex items-center justify-center",
      "w-[44px] [flex:0_0_44px] px-[12px] py-0",
      "h-[42px] cursor-default select-none",
      "bg-bg-table-head",
    ],
  }),

  /* Coluna actions — 44px sticky right */
  thActions: tv({
    base: [
      "relative flex items-center justify-center",
      "w-[44px] [flex:0_0_44px] p-0",
      "h-[42px] cursor-default select-none",
      "sticky right-0 z-[3]",
      "bg-bg-table-head",
    ],
  }),

  /* Label da coluna — elipsa */
  thLabel: tv({
    base: "flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis text-left",
  }),

  /* Ícone de tipo — opacity 0.7 rest, 1 no hover do th OU quando sorted */
  thTypeIcon: tv({
    base: [
      "shrink-0 size-[13px] text-fg-muted opacity-70",
      "group-hover/th:opacity-100",
    ],
    variants: {
      sorted: { true: "opacity-100" },
    },
    defaultVariants: { sorted: false },
  }),

  /* Sort badge "1" (chip brand) + arrow */
  thSort: tv({
    base: "inline-flex items-center gap-[4px] shrink-0 text-fg-default",
  }),
  thSortIndex: tv({
    base: [
      "grid place-items-center",
      "min-w-[18px] h-[18px] px-[5px]",
      "rounded-radius-sm",
      "bg-bg-brand text-fg-on-brand",
      "text-caption-xs font-bold leading-none",
      "[font-variant-numeric:tabular-nums]",
    ],
  }),

  /* Hint atenuado em hover de col não-sorted (sinaliza clicável) */
  thSortHint: tv({
    base: [
      "inline-flex items-center shrink-0 text-fg-muted",
      "opacity-0 transition-opacity duration-150",
      "group-hover/th:opacity-50",
    ],
  }),

  /* Menu "..." absolute, aparece só no hover */
  thMenu: tv({
    base: [
      "absolute right-[6px] top-1/2 -translate-y-1/2 z-[1]",
      "grid place-items-center size-[28px]",
      "border-0 bg-transparent text-fg-muted rounded-radius-md cursor-pointer",
      "opacity-0 transition-all duration-150",
      "group-hover/th:opacity-100",
      "hover:bg-bg-muted hover:text-fg-default",
    ],
  }),

  /* Resize handle (6px) — linha que vira brand e projeta pra baixo no hover */
  thResize: tv({
    base: [
      "absolute right-0 top-0 bottom-0 w-[6px] z-[2]",
      "bg-transparent cursor-col-resize",
      // ::before linha vertical dentro do header
      "before:content-[''] before:absolute before:left-1/2 before:-translate-x-1/2",
      "before:top-[8px] before:bottom-[8px] before:w-px before:bg-transparent",
      "before:transition-all before:duration-150",
      "group-hover/th:before:bg-fg-muted",
      // hover direto no handle → brand 2px + altura total
      "hover:before:bg-bg-brand hover:before:w-[2px] hover:before:top-0 hover:before:bottom-0",
      // ::after projeção 100vh pra baixo cobrindo body
      "after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2",
      "after:top-full after:w-[2px] after:h-screen after:bg-transparent after:pointer-events-none",
      "after:transition-colors after:duration-150",
      "hover:after:bg-bg-brand",
    ],
  }),

  /* ── Body ─────────────────────────────────────────────────────────── */
  tbody: tv({
    base: "bg-bg-surface",
  }),

  /* tbl-tr — flex row, altura por densidade. Default comfortable (56px). */
  tr: tv({
    base: [
      "relative flex",
      "border-b border-border-table bg-bg-surface",
      "cursor-pointer transition-colors duration-150",
      "hover:bg-bg-table-row-hover",
      "focus-visible:outline-2 focus-visible:outline-bg-brand focus-visible:-outline-offset-2",
    ],
    variants: {
      density: {
        compact:     "h-[40px]",
        comfortable: "h-[56px]",
        spacious:    "h-[64px]",
      },
      // Selected (checkbox) e Open (detail panel) — mesmo visual brand-tinted
      // + strip lateral 3px brand via ::before
      selected: {
        true: [
          "bg-bg-table-row-selected hover:bg-bg-table-row-selected-hover",
          "before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0",
          "before:w-[3px] before:bg-bg-brand before:z-[5] before:pointer-events-none",
        ].join(" "),
      },
    },
    defaultVariants: { density: "comfortable", selected: false },
  }),

  /* Cells base — height/font-size variam por densidade */
  td: tv({
    base: [
      "flex items-center px-[14px] py-0",
      "text-fg-default",
      "[flex:1_0_auto] overflow-hidden whitespace-nowrap",
    ],
    variants: {
      density: {
        compact:     "h-[40px] text-body-xs font-normal",
        comfortable: "h-[56px] text-body-sm font-normal",
        spacious:    "h-[64px] text-body-sm font-normal",
      },
    },
    defaultVariants: { density: "comfortable" },
  }),

  tdSelect: tv({
    base: [
      "flex items-center justify-center",
      "w-[44px] [flex:0_0_44px] px-[12px] py-0",
    ],
    variants: {
      density: {
        compact:     "h-[40px]",
        comfortable: "h-[56px]",
        spacious:    "h-[64px]",
      },
    },
    defaultVariants: { density: "comfortable" },
  }),

  /* tdActions — sticky right, bg adapta ao estado da row */
  tdActions: tv({
    base: [
      "flex items-center justify-center",
      "w-[44px] [flex:0_0_44px] p-0",
      "sticky right-0 z-[2]",
      "bg-bg-surface",
      // bg adapta ao estado da row pai
      "group-hover/tr:bg-bg-table-row-hover",
    ],
    variants: {
      density: {
        compact:     "h-[40px]",
        comfortable: "h-[56px]",
        spacious:    "h-[64px]",
      },
      selected: {
        true: "!bg-bg-table-row-selected group-hover/tr:!bg-bg-table-row-selected-hover",
      },
    },
    defaultVariants: { density: "comfortable", selected: false },
  }),

  /* Botão "..." da row — opacity 0 → 1 no hover */
  rowMenuBtn: tv({
    base: [
      "grid place-items-center size-[28px]",
      "border-0 bg-transparent text-fg-muted rounded-radius-md cursor-pointer",
      "opacity-0 transition-all duration-150",
      "group-hover/tr:opacity-100",
      "hover:bg-bg-muted hover:text-fg-default",
    ],
  }),

  /* ── Cell borders verticais (sempre on neste componente) ──────────── */
  cellBorderTh: tv({
    base: "border-r border-border-table",
  }),
  cellBorderTd: tv({
    base: "border-r border-border-table",
  }),

  /* ── Cells específicas ────────────────────────────────────────────── */
  cellId: tv({
    base: "text-body-sm font-normal text-fg-muted [font-variant-numeric:tabular-nums]",
  }),
  cellCurrency: tv({
    base: "[font-variant-numeric:tabular-nums] font-semibold",
  }),
  cellDate: tv({
    base: "[font-variant-numeric:tabular-nums] text-fg-muted",
  }),
  cellStatus: tv({
    base: "inline-flex items-center gap-gp-md text-body-sm font-normal text-fg-default dark:text-fg-muted",
  }),
  dot: tv({
    base: "size-[8px] rounded-radius-full shrink-0",
  }),
  cellPerson: tv({
    base: "inline-flex items-center gap-gp-md whitespace-nowrap overflow-hidden",
  }),
  cellPersonName: tv({
    base: "whitespace-nowrap overflow-hidden text-ellipsis font-medium",
  }),
  cellAgent: tv({
    base: "inline-flex items-center gap-gp-md whitespace-nowrap overflow-hidden",
  }),

  /* Avatar 28px (sm 22px) — bg via inline style (cor por entidade) */
  avatar: tv({
    base: [
      "grid place-items-center shrink-0",
      "size-[28px] rounded-radius-full",
      "text-white text-caption-sm font-bold",
    ],
  }),
  avatarSm: tv({
    base: [
      "grid place-items-center shrink-0",
      "size-[22px] rounded-radius-full",
      "text-white text-caption-xs font-bold",
    ],
  }),

  cellLink: tv({
    base: "text-fg-brand no-underline hover:underline",
  }),
  cellMuted: tv({
    base: "text-fg-muted",
  }),

  /* ── Checkbox custom (16px com check rotacionado) ─────────────────── */
  checkbox: tv({
    base: [
      "appearance-none size-[16px] cursor-pointer relative",
      "border-[1.5px] border-border-input bg-bg-input rounded-radius-sm",
      "transition-[background,border-color] duration-100",
      "checked:bg-bg-brand checked:border-border-brand",
      "indeterminate:bg-bg-brand indeterminate:border-border-brand",
      // Check mark via ::after — retângulo rotacionado 45deg
      "checked:after:content-[''] checked:after:absolute",
      "checked:after:left-1/2 checked:after:top-1/2",
      "checked:after:w-[4px] checked:after:h-[8px]",
      "checked:after:border-solid checked:after:border-fg-on-brand",
      "checked:after:[border-width:0_2px_2px_0]",
      "checked:after:[transform:translate(-50%,-55%)_rotate(45deg)]",
      // Barra indeterminate
      "indeterminate:after:content-[''] indeterminate:after:absolute",
      "indeterminate:after:left-1/2 indeterminate:after:top-1/2",
      "indeterminate:after:w-[8px] indeterminate:after:h-[2px]",
      "indeterminate:after:bg-fg-on-brand indeterminate:after:rounded-[1px]",
      "indeterminate:after:[transform:translate(-50%,-50%)]",
    ],
  }),

  /* ── Chip de categoria (pílula soft com kind) ─────────────────────── */
  chip: tv({
    base: [
      "inline-flex items-center gap-[4px]",
      "h-[22px] px-[8px] rounded-radius-full",
      "text-caption-sm font-semibold leading-none whitespace-nowrap",
    ],
    variants: {
      kind: {
        success: "bg-bg-success-muted text-fg-success",
        warning: "bg-bg-warning-muted text-fg-warning",
        info:    "bg-bg-info-muted    text-fg-info",
        danger:  "bg-bg-danger-muted  text-fg-danger",
      },
    },
    defaultVariants: { kind: "info" },
  }),
};
