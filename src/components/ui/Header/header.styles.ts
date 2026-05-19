import { tv } from "@/utils/tv";

/**
 * Header styles — alinhado com `.header` do design-and-table-v2.
 *
 * Layout:
 *   - height 60px, padding-x 16px, border-bottom subtle
 *   - left: collapse btn + divider + breadcrumb
 *   - right: search + theme + messages + notifications (gap 4)
 *
 * Position é responsabilidade do consumer (template). Componente só define
 * altura/layout/cores.
 */

/* ── Root ─────────────────────────────────────────────────────────────────── */
export const headerRoot = tv({
  base: [
    "flex items-center justify-between gap-gp-lg",
    "h-[60px] flex-none px-pad-2xl",
    "bg-bg-canvas border-b border-border-subtle",
    "text-fg-default font-sans",
  ],
});

export const headerLeft = tv({
  base: "flex items-center gap-gp-md min-w-0 flex-1",
});

export const headerRight = tv({
  base: "flex items-center gap-gp-sm shrink-0",
});

export const headerDivider = tv({
  base: "h-[24px] w-px bg-border-default shrink-0 mx-pad-xs",
});

/* ── Icon button (header-level) ───────────────────────────────────────────── */
/**
 * Os icon-buttons "trigger" do header (theme/notifications/messages) agora usam
 * `<Button>` do DS. Este `headerIconBtn` é mantido APENAS pro botão de collapse
 * do menu — que tem visual ghost específico do header (radius menor, hover sutil).
 */
export const headerIconBtn = tv({
  base: [
    "relative inline-flex items-center justify-center",
    "w-form-md h-form-md rounded-radius-md",
    "cursor-pointer text-fg-default",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary",
  ],
  variants: {
    variant: {
      ghost: "bg-transparent border-0 hover:bg-bg-muted",
    },
  },
  defaultVariants: { variant: "ghost" },
});

/**
 * Badge dot (indicador de unread) no canto do icon-button do header.
 * Variantes seguem o sandbox: brand (mensagens) / danger (notificações alerta).
 */
export const headerIconBtnBadge = tv({
  base: "absolute top-[4px] right-[4px] w-[8px] h-[8px] rounded-full ring-2 ring-bg-canvas",
  variants: {
    kind: {
      brand: "bg-bg-brand",
      danger: "bg-bg-danger",
    },
  },
  defaultVariants: { kind: "brand" },
});

/* ── Breadcrumb ───────────────────────────────────────────────────────────── */
export const breadcrumbRoot = tv({
  base: "flex items-center gap-gp-sm min-w-0",
});

export const breadcrumbItem = tv({
  base: "font-medium truncate transition-colors leading-none",
  variants: {
    current: {
      true: "text-fg-default font-semibold",
      false: "text-fg-muted hover:text-fg-default cursor-pointer",
    },
    /** Quando único item no breadcrumb (= título da página), font-size sobe pra 16px */
    standalone: {
      true: "text-body-lg",
      false: "text-body-sm font-normal",
    },
  },
  defaultVariants: { current: false, standalone: false },
});

export const breadcrumbSeparator = tv({
  base: "text-fg-subtle shrink-0",
});

/* ── Search (fake input) ──────────────────────────────────────────────────── */
export const searchFakeInput = tv({
  base: [
    "inline-flex items-center gap-gp-md h-form-md w-[180px]",
    "px-pad-xl rounded-radius-md",
    "bg-bg-subtle border border-border-subtle cursor-pointer",
    "text-fg-subtle text-body-sm font-normal",
    "transition-colors duration-150",
    "hover:bg-bg-muted hover:border-border-default",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary",
  ],
});

export const searchFakeInputIcon = tv({
  base: "size-[14px] text-fg-subtle shrink-0",
});

export const searchFakeInputText = tv({
  base: "flex-1 text-left truncate",
});

export const searchFakeInputKbd = tv({
  base: [
    "ml-auto inline-flex items-center justify-center",
    "h-[20px] px-pad-xs rounded-radius-xs",
    "bg-bg-canvas border border-border-subtle dark:bg-bg-muted",
    "text-caption-xs font-semibold text-fg-muted tabular-nums shrink-0",
  ],
});

/* ── Dropdown chrome (notifications, messages) ────────────────────────────── */
/**
 * Pattern compartilhado: bell/msg → click → dropdown ancorado abaixo direita.
 * Reusa o token bg-dropdown (frosted-glass) e os mesmos padrões do DropdownMenu.
 */
export const hdWrap = tv({
  base: "relative inline-flex",
});

export const hdDropdown = tv({
  base: [
    "absolute top-[calc(100%+8px)] right-0 z-50",
    "w-[380px] max-w-[calc(100vw-32px)] max-h-[520px] flex flex-col",
    "rounded-[12px] bg-bg-dropdown",
    "border border-border-default shadow-sh-lg outline-float",
    "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:backdrop-blur-2xl before:backdrop-saturate-150",
    "overflow-hidden",
    // Animation
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  ],
});

export const hdTop = tv({
  base: "flex flex-col gap-gp-md p-pad-xl border-b border-border-subtle bg-bg-canvas/40",
});

export const hdHeader = tv({
  base: "flex items-center justify-between",
});

export const hdTitle = tv({
  base: "flex items-center gap-gp-sm text-body-lg font-semibold text-fg-default",
});

export const hdTitleCount = tv({
  base: [
    "inline-flex items-center justify-center min-w-[20px] h-[20px] px-pad-xs",
    "rounded-radius-xs bg-bg-brand text-fg-on-brand",
    "text-caption-sm font-bold tabular-nums",
  ],
});

export const hdHeaderActions = tv({
  base: "flex items-center gap-gp-xs",
});

/* ── Search interno (msgs) ────────────────────────────────────────────────── */
export const hdSearch = tv({
  base: [
    "inline-flex items-center gap-gp-sm h-form-sm w-full",
    "px-pad-lg rounded-radius-md",
    "bg-bg-input border border-border-input",
    "transition-colors duration-150",
    "focus-within:border-border-brand focus-within:ring-4 focus-within:ring-ring-brand",
  ],
});

export const hdSearchIcon = tv({
  base: "size-[14px] text-fg-muted shrink-0",
});

export const hdSearchInput = tv({
  base: "flex-1 min-w-0 bg-transparent border-0 outline-none text-body-sm font-normal text-fg-default placeholder:text-fg-subtle",
});

/* ── Tabs (filtros internos) ──────────────────────────────────────────────── */
export const hdTabs = tv({
  base: "flex items-center gap-gp-2xs p-[3px] rounded-radius-lg bg-bg-muted",
});

export const hdTab = tv({
  base: [
    "inline-flex items-center justify-center gap-gp-xs",
    "h-[28px] px-[10px] rounded-radius-sm",
    "text-body-xs font-medium text-fg-muted cursor-pointer",
    "bg-transparent border-0",
    "transition-colors duration-150",
    "hover:text-fg-default",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-secondary",
  ],
  variants: {
    active: {
      true: "bg-bg-accent text-fg-default font-semibold shadow-sh-sm dark:shadow-sh-none",
    },
  },
});

export const hdTabCount = tv({
  base: "text-caption-xs font-bold tabular-nums opacity-70",
});

/* ── Body (lista scrollável) ──────────────────────────────────────────────── */
export const hdBody = tv({
  base: "flex-1 overflow-y-auto p-pad-sm flex flex-col gap-px",
});

/* ── Empty state ──────────────────────────────────────────────────────────── */
export const hdEmpty = tv({
  base: "flex flex-col items-center justify-center gap-gp-md py-pad-7xl text-fg-subtle",
});

export const hdEmptyText = tv({
  base: "text-body-md",
});

/* ── Notification item ────────────────────────────────────────────────────── */
export const hdNotif = tv({
  base: [
    "relative flex items-start gap-gp-lg p-pad-lg rounded-radius-md text-left w-full",
    "bg-transparent border-0 cursor-pointer",
    "transition-colors duration-150",
    "hover:bg-bg-muted",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-secondary",
  ],
});

export const hdNotifIcon = tv({
  base: "flex-none w-[28px] h-[28px] rounded-radius-md grid place-items-center",
});

export const hdNotifBody = tv({
  base: "flex-1 min-w-0 flex flex-col gap-gp-2xs",
});

export const hdNotifTitle = tv({
  base: "text-body-sm font-semibold text-fg-default leading-tight",
});

export const hdNotifText = tv({
  base: "text-body-xs font-normal text-fg-muted leading-snug line-clamp-2",
});

export const hdNotifTime = tv({
  base: "text-caption-sm text-fg-subtle",
});

export const hdNotifDot = tv({
  base: "shrink-0 mt-pad-xs w-[8px] h-[8px] rounded-full bg-bg-brand",
});

/* ── Message item ─────────────────────────────────────────────────────────── */
export const hdMsg = tv({
  base: [
    "relative flex items-center gap-gp-lg p-pad-lg rounded-radius-md text-left w-full",
    "bg-transparent border-0 cursor-pointer",
    "transition-colors duration-150",
    "hover:bg-bg-muted",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-secondary",
  ],
});

export const hdMsgAvatar = tv({
  base: [
    "flex-none grid place-items-center w-icon-lg h-icon-lg rounded-full",
    "text-white text-caption-sm font-bold uppercase tracking-[0.02em] leading-none",
  ],
});

export const hdMsgBody = tv({
  base: "flex-1 min-w-0 flex flex-col gap-gp-2xs",
});

export const hdMsgRow = tv({
  base: "flex items-center justify-between gap-gp-sm",
});

export const hdMsgName = tv({
  base: "text-body-sm font-semibold text-fg-default truncate",
});

export const hdMsgTime = tv({
  base: "text-caption-sm text-fg-subtle shrink-0",
});

export const hdMsgPreviewRow = tv({
  base: "flex items-center gap-gp-sm",
});

export const hdMsgPreview = tv({
  base: "flex-1 min-w-0 text-body-xs font-normal text-fg-muted truncate",
});

export const hdMsgDot = tv({
  base: "shrink-0 w-[8px] h-[8px] rounded-full bg-bg-brand",
});

/* ── Footer ───────────────────────────────────────────────────────────────── */
export const hdFooter = tv({
  base: "flex-none p-pad-md border-t border-border-subtle text-center",
});

export const hdFooterLink = tv({
  base: [
    "inline-flex items-center justify-center gap-gp-sm",
    "h-form-sm px-pad-lg rounded-radius-md w-full",
    "text-body-sm font-medium text-fg-brand no-underline",
    "transition-colors duration-150",
    "hover:bg-bg-brand-subtle",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-brand",
  ],
});
