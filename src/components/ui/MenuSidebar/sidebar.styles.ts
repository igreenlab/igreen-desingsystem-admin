import { tv } from "@/utils/tv";

/**
 * Sidebar styles — alinhado com /design-and-table-v2 (rail + panel).
 *
 * Dimensões preservadas do sandbox:
 *   - rail: 64px de largura
 *   - panel: 264px de largura (collapse → 0)
 *   - header: 60px de altura
 *   - panel item: 40px (h-form-lg) com font 13px e gap 11px
 *   - subitem: 32px (h-form-sm) com font 12.5px
 *
 * Cores via tokens v3:
 *   - bg-bg-sidebar + bg-bg-sidebar-accent (hover) + bg-bg-sidebar-accent-hover
 *   - bg-bg-surface + shadow-sh-sm pro active (light only — dark auto-none)
 *   - text-fg-default / text-fg-muted / text-fg-brand
 *   - border-border-sidebar / border-border-subtle
 */

/* ── Root ──────────────────────────────────────────────────────────────────── */
/**
 * `w-fit` é crítico: faz o root ocupar SÓ a largura visível (rail 64px quando
 * colapsado, rail + panel 328px quando aberto). Sem isso, o div ocuparia 100%
 * da largura do parent e o hover-to-expand dispararia em qualquer lugar do app.
 * `relative` é necessário pro panel `absolute` (floating) ancorar no root.
 *
 * Mobile: vira drawer fixed overlay sobre o conteúdo, com transform anim.
 */
export const sidebarRoot = tv({
  base: "relative flex h-screen w-fit bg-bg-sidebar text-fg-default font-sans",
  variants: {
    mobile: {
      true: "fixed inset-y-0 left-0 z-50 h-screen w-auto transition-transform duration-200 ease-out",
      false: "",
    },
    mobileOpen: {
      true: "translate-x-0",
      false: "",
    },
  },
  compoundVariants: [
    // Mobile + fechado: empurra pra fora da tela
    { mobile: true, mobileOpen: false, class: "-translate-x-full" },
  ],
});

/** Versão sem h-screen — pra usar em containers de tamanho fixo (docs, modals) */
export const sidebarRootContained = tv({
  base: "relative flex h-full w-fit bg-bg-sidebar text-fg-default font-sans",
});

/* ── Mobile-specific ──────────────────────────────────────────────────────── */
/** Backdrop escuro atrás do drawer mobile — clicável pra fechar */
export const sidebarMobileBackdrop = tv({
  base: "fixed inset-0 z-40 bg-overlay-scrim transition-opacity duration-200",
});

/** Close button (X) flutuante no canto superior direito do drawer mobile */
export const sidebarMobileCloseBtn = tv({
  base: [
    "absolute top-[14px] right-[14px] z-10",
    "w-form-sm h-form-sm rounded-radius-md grid place-items-center",
    "bg-transparent border-0 cursor-pointer",
    "text-fg-muted",
    "transition-colors duration-150",
    "hover:bg-bg-sidebar-accent-hover hover:text-fg-default",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary",
  ],
});

/* ── Rail (coluna 1 — ícones) ─────────────────────────────────────────────── */
export const sidebarRail = tv({
  base: [
    "flex flex-col items-center w-[64px] flex-none",
    "h-full sticky top-0 z-30",
    "gap-gp-sm py-pad-md",
    "bg-bg-sidebar border-r border-border-sidebar",
  ],
});

export const sidebarRailBrand = tv({
  base: [
    "w-form-lg h-form-lg rounded-radius-xl grid place-items-center",
    "bg-bg-brand text-fg-on-brand mb-pad-sm",
    "transition-opacity hover:opacity-90",
  ],
});

export const sidebarRailList = tv({
  base: "flex flex-col items-center gap-gp-sm flex-1",
});

export const sidebarRailItem = tv({
  base: [
    "group/rail-item relative w-form-lg h-form-lg rounded-radius-xl grid place-items-center",
    "bg-transparent border-0 cursor-pointer",
    "text-fg-muted",
    "transition-colors duration-150",
    "hover:bg-bg-sidebar-accent-hover hover:text-fg-default",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary",
  ],
  variants: {
    active: {
      // Light: bg sidebar-accent (= branco via token), ícone mantém cor padrão (sem brand).
      // Dark: bg sidebar-accent (alpha-8), ícone ganha fg-brand.
      true: "bg-bg-sidebar-accent dark:text-fg-brand",
    },
  },
});

/** Pílula esquerda do item ativo (3px x 24px) */
export const sidebarRailActiveBar = tv({
  base: [
    "absolute -left-pad-2xl top-pad-md bottom-pad-md w-[3px]",
    "rounded-r-radius-sm bg-bg-brand",
  ],
});

/** Tooltip CSS-only que aparece no hover do rail item */
export const sidebarRailTooltip = tv({
  base: [
    "pointer-events-none absolute left-full ml-[14px] top-1/2 -translate-y-1/2",
    "px-pad-md py-[5px] rounded-radius-sm",
    "bg-fg-default text-bg-sidebar",
    "text-caption-sm font-semibold tracking-[0.01em] whitespace-nowrap",
    "opacity-0 group-hover/rail-item:opacity-100",
    "transition-opacity duration-150 z-50",
    "shadow-sh-md",
  ],
});

export const sidebarRailAdd = tv({
  base: [
    "w-form-lg h-form-lg rounded-radius-xl grid place-items-center",
    "text-fg-muted bg-transparent border-0 cursor-pointer mt-pad-xs opacity-70",
    "transition-[opacity,background-color,color] duration-150",
    "hover:opacity-100 hover:bg-bg-sidebar-accent-hover hover:text-fg-brand",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary",
  ],
});

/**
 * Wrapper do user — apenas positioning (empurra pro bottom). O visual fica
 * no conteúdo passado via `user` prop:
 *   - Quando `user` é ReactNode custom (ex: UserMenu com DropdownMenu), o
 *     consumer controla 100% do visual.
 *   - Quando `user` é falsy/undefined, o sidebar-rail renderiza o avatar
 *     default usando `sidebarRailUserDefault` styles.
 */
export const sidebarRailUser = tv({
  base: "mt-auto",
});

/** Avatar default (string "SV") — usado quando user prop não foi passado. */
export const sidebarRailUserDefault = tv({
  base: [
    "grid place-items-center w-9 h-9 rounded-full",
    // tracking-[0.02em] preserva tracking original (preset usa +0.06em)
    "bg-bg-brand text-fg-on-brand font-bold text-caption-sm uppercase tracking-[0.02em]",
  ],
});

/* ── Panel (coluna 2 — menus) ─────────────────────────────────────────────── */
export const sidebarPanel = tv({
  base: [
    "w-[264px] flex-none h-full sticky top-0 flex flex-col overflow-hidden",
    "bg-bg-sidebar border-r border-border-sidebar",
    "transition-[width,opacity,border-color] duration-200 ease-out",
  ],
  variants: {
    collapsed: {
      true: "w-0 border-r-0 opacity-0 pointer-events-none",
    },
    /** Quando true: overlay absoluto sobre o conteúdo (hover-to-expand). */
    floating: {
      true: "absolute left-[64px] top-0 h-full z-40",
    },
  },
});

export const sidebarPanelHeader = tv({
  base: "flex items-center h-[60px] flex-none px-[14px] border-b border-border-sidebar",
});

export const sidebarPanelTitle = tv({
  base: [
    "flex-1 min-w-0 inline-flex items-center gap-gp-sm",
    "py-pad-sm px-pad-md rounded-radius-md",
    "bg-transparent border-0 cursor-pointer text-left",
    "text-body-md font-medium font-bold text-fg-default",
    "transition-colors hover:bg-bg-sidebar-accent-hover",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary",
  ],
});

export const sidebarPanelBody = tv({
  base: "flex-1 overflow-y-auto p-[14px] scrollbar-thin",
});

export const sidebarPanelGroup = tv({
  base: "flex flex-col gap-px",
});

/* ── Item (link/group/subitem) ────────────────────────────────────────────── */
export const sidebarItem = tv({
  base: [
    "flex items-center gap-[11px] h-form-lg w-full px-pad-xl rounded-radius-md",
    "text-fg-default text-body-sm font-medium text-left no-underline cursor-pointer",
    "bg-transparent border-0",
    "transition-colors duration-150",
    // Hover usa sidebar-accent-hover (mineral subtle no light, alpha-12 no dark) —
    // assim fica distinto do active (sidebar-accent = white no light).
    "hover:bg-bg-sidebar-accent-hover hover:text-fg-default",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary",
  ],
  variants: {
    active: {
      // Light: sidebar-accent (= white via token) + brand text + shadow.
      // Dark: sidebar-accent (alpha-8) + brand text + sem shadow.
      true: [
        "bg-bg-sidebar-accent text-fg-brand font-semibold shadow-sh-sm",
        "dark:shadow-sh-none",
      ],
    },
    subitem: {
      true: "h-form-sm px-pad-lg text-body-xs font-normal text-fg-muted hover:text-fg-default",
    },
  },
  compoundVariants: [
    {
      subitem: true,
      active: true,
      class: "bg-bg-sidebar-accent text-fg-default shadow-sh-none",
    },
  ],
});

export const sidebarItemIcon = tv({
  base: "flex-none w-[17px] h-[17px] text-fg-muted transition-colors",
  variants: {
    active: {
      true: "text-fg-brand",
    },
    parentActive: {
      true: "text-fg-brand",
    },
  },
});

export const sidebarItemText = tv({
  base: "flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis",
});

export const sidebarPill = tv({
  base: [
    "inline-flex items-center justify-center flex-none",
    "min-w-[22px] h-[22px] px-[7px] rounded-radius-sm",
    // tracking-[0.02em] e leading-none preservam visual original (preset usa +0.06em e lineHeight 14px)
    "text-caption-sm font-bold leading-none tracking-[0.02em] tabular-nums",
  ],
  variants: {
    kind: {
      // Light: consome border-sidebar (mineral-200, warm) — combina com sidebar mineral-100.
      // Dark: bg-muted (alpha-white subtle).
      default: "bg-border-sidebar text-fg-muted dark:bg-bg-muted",
      counter: "bg-border-sidebar text-fg-muted dark:bg-bg-brand dark:text-fg-on-brand",
      success: "bg-bg-success-muted text-fg-success dark:bg-bg-brand dark:text-fg-on-brand",
    },
    active: {
      true: "bg-bg-muted-hover text-fg-default dark:bg-bg-muted-hover dark:text-fg-default",
    },
  },
  defaultVariants: { kind: "default" },
});

/* ── Subgroup (item com subitems colapsável) ──────────────────────────────── */
export const sidebarSubgroupRoot = tv({
  base: "flex flex-col gap-px",
});

export const sidebarSubgroupChev = tv({
  base: "flex-none w-[13px] h-[13px] text-fg-muted ml-auto transition-transform duration-200",
  variants: {
    collapsed: {
      true: "-rotate-90",
    },
  },
});

export const sidebarSubgroupList = tv({
  base: [
    "flex flex-col gap-px overflow-hidden",
    "ml-pad-xl pl-[14px] py-pad-2xs",
    "border-l border-border-sidebar",
    "transition-[max-height,opacity,padding] duration-200 ease-out",
  ],
  variants: {
    collapsed: {
      true: "max-h-0 opacity-0 py-0",
      false: "max-h-[400px] opacity-100",
    },
  },
  defaultVariants: { collapsed: false },
});

/* ── Section (bookmarks / chats / listas genéricas) ───────────────────────── */
export const sidebarSection = tv({
  base: "flex flex-col gap-px pt-[18px] mt-pad-xl border-t border-border-sidebar",
});

export const sidebarSectionHeader = tv({
  base: [
    "flex items-center gap-gp-sm px-pad-lg pt-pad-sm pb-pad-md",
    "bg-transparent border-0 text-left cursor-pointer select-none w-full",
    "text-caption-xs font-bold uppercase tracking-[0.06em] text-fg-default",
    "transition-colors hover:text-fg-default",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary rounded-radius-sm",
    // Dark: enfraquecer (mais sutil)
    "dark:text-fg-muted dark:font-medium dark:opacity-70",
  ],
});

export const sidebarSectionChev = tv({
  base: "flex-none w-[12px] h-[12px] transition-transform duration-200",
  variants: {
    collapsed: {
      true: "-rotate-90",
    },
  },
});

export const sidebarSectionAdd = tv({
  base: [
    "ml-auto w-[18px] h-[18px] grid place-items-center rounded-radius-xs",
    "text-fg-muted bg-transparent border-0 cursor-pointer text-body-md leading-none",
    "transition-colors hover:bg-bg-sidebar-accent-hover hover:text-fg-default",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-secondary",
  ],
});

export const sidebarSectionList = tv({
  base: "flex flex-col gap-px overflow-hidden transition-[max-height,opacity] duration-200 ease-out",
  variants: {
    collapsed: {
      true: "max-h-0 opacity-0",
      false: "max-h-[600px] opacity-100",
    },
    variant: {
      bookmark: "",
      chat: "gap-gp-sm",
    },
  },
  defaultVariants: { collapsed: false, variant: "bookmark" },
});

/** Item das sections (bookmark/chat) — herda visual do sidebarItem subitem */
export const sidebarSectionItem = tv({
  base: [
    "flex items-center gap-[11px] h-form-sm w-full px-pad-lg rounded-radius-md",
    "text-body-xs font-medium text-fg-muted no-underline cursor-pointer",
    "bg-transparent border-0 text-left",
    "transition-colors duration-150",
    "hover:bg-bg-sidebar-accent-hover hover:text-fg-default",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary",
  ],
});

export const sidebarBookmarkDot = tv({
  base: "flex-none w-[10px] h-[10px] rounded-full",
});

export const sidebarChatAvatar = tv({
  base: [
    "flex-none grid place-items-center w-icon-lg h-icon-lg rounded-full",
    // tracking-[0.02em] preserva o tracking original (preset usa +0.06em); leading-none mantém centralização vertical
    "text-white text-caption-xs font-bold uppercase tracking-[0.02em] leading-none",
  ],
});

export const sidebarChatStatus = tv({
  base: "flex-none w-[7px] h-[7px] rounded-full ml-auto",
  variants: {
    status: {
      online: "bg-fg-success",
      offline: "bg-fg-subtle",
    },
  },
  defaultVariants: { status: "online" },
});
