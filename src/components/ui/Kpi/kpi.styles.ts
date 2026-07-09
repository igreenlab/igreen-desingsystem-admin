import { tv } from "@/utils/tv";

/* ══════════════════════════════════════════════════════════════════════════
   Kpi — estilos (tv). 100% sobre tokens do DS, theme-aware.
   ══════════════════════════════════════════════════════════════════════════ */

export const kpi = tv({
  slots: {
    root: "flex flex-col gap-gp-lg",
    header: "flex items-start justify-between gap-gp-md",
    label: "m-0 text-body-md font-semibold text-fg-default",
    iconBox:
      "grid size-form-lg shrink-0 place-items-center rounded-radius-lg [&>svg]:size-icon-md",
    main: "flex flex-col gap-gp-xs",
    valueRow: "flex flex-wrap items-center gap-gp-md",
    value:
      "leading-none text-fg-default [font-variant-numeric:tabular-nums]",
    hint: "text-caption-sm text-fg-subtle",
    chart: "mt-gp-xs",
    footnote:
      "mt-pad-md border-t border-border-subtle pt-pad-lg text-caption-md text-fg-muted",
  },
  variants: {
    // Tamanho do valor de destaque — presets `stat-*` (número de métrica).
    // Default `md` (24px) = idêntico ao antigo `body-2xl`. Weight/leading tight
    // vêm do preset + slot; pareado com tabular-nums.
    size: {
      sm: { value: "text-stat-sm" },
      md: { value: "text-stat-md" },
      lg: { value: "text-stat-lg" },
      xl: { value: "text-stat-xl" },
    },
    surface: {
      card: {
        root: "rounded-radius-xl border border-border-subtle bg-bg-surface p-pad-3xl shadow-sh-sm",
      },
      plain: { root: "p-pad-3xl" },
    },
    tone: {
      brand: { iconBox: "bg-bg-brand-subtle text-fg-brand" },
      success: { iconBox: "bg-bg-success-muted text-fg-success" },
      warning: { iconBox: "bg-bg-warning-muted text-fg-warning" },
      info: { iconBox: "bg-bg-info-muted text-fg-info" },
      danger: { iconBox: "bg-bg-danger-muted text-fg-danger" },
      neutral: { iconBox: "bg-bg-muted text-fg-muted" },
    },
  },
  defaultVariants: {
    size: "md",
    surface: "card",
    tone: "neutral",
  },
});

export const kpiGroup = tv({
  base: "grid w-full",
  variants: {
    columns: {
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
      6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
    },
    divided: {
      // 1 card único com divisórias (linha no mobile, coluna no sm+)
      true: "overflow-hidden rounded-radius-xl border border-border-subtle bg-bg-surface shadow-sh-sm divide-y divide-border-subtle sm:divide-y-0 sm:divide-x",
      false: "gap-gp-2xl",
    },
  },
  defaultVariants: {
    columns: 4,
    divided: false,
  },
});
