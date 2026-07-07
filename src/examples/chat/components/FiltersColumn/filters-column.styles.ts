import { tv } from "@/utils/tv";

export const filtersColumnStyles = tv({
  slots: {
    /** Aside raiz da versão expandida (280px). */
    root: "flex flex-col w-[280px] shrink-0 bg-bg-surface border border-border-subtle rounded-radius-xl overflow-hidden",
    /** Aside raiz da versão rail (64px). */
    rail: "flex flex-col w-[64px] shrink-0 bg-bg-surface border border-border-subtle rounded-radius-xl overflow-hidden",
    /** Container scrollável das seções (expandida). */
    scroll: "flex-1 min-h-0 overflow-y-auto px-pad-md py-pad-md flex flex-col gap-gp-lg",
    /** Container scrollável (rail). */
    railScroll:
      "flex-1 min-h-0 overflow-y-auto py-pad-md flex flex-col items-center gap-gp-sm",
    /** Section wrapper (expandida). */
    section: "flex flex-col gap-gp-2xs",
    /** Header de section (título all-caps). Combo: `caption-xs` (10/400)
        + override `font-bold uppercase tracking-[0.06em]` pra pattern strong. */
    sectionTitle:
      "px-pad-md pt-pad-2xs pb-pad-2xs text-caption-xs font-bold tracking-[0.06em] text-fg-subtle uppercase",
    /** Group wrapper (rail) — divider entre grupos. */
    railGroup: "w-full flex flex-col items-center gap-gp-xs px-pad-md",
    /** Modifier de divisor pros grupos não-primeiros (rail). */
    railGroupDivider: "pt-pad-sm border-t border-border-subtle",
    /** Modifier de divisor pras sections não-primeiras (expandida). */
    sectionDivider: "pt-pad-lg border-t border-border-subtle",
  },
});
