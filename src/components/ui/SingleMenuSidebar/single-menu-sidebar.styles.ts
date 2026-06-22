import { tv } from "@/utils/tv";

/* ══════════════════════════════════════════════════════════════════════════
   SingleMenuSidebar — estilos (tv() + objeto estático)

   100% tokens do DS. Sem palette própria, sem hardcode de cor.
   Valores literais `[Npx]` remanescentes são alinhamento fino calibrado
   (logo, indent do sub-item, faixa de seleção 3px, largura do container) —
   exceção visual válida (L-014), não há token DS equivalente.
   ══════════════════════════════════════════════════════════════════════════ */

// ── Container ──
export const sidebarRoot = tv({
  base: [
    "relative flex h-full flex-col overflow-x-hidden",
    "border-r border-border-sidebar bg-bg-sidebar",
    "transition-[width] duration-300 ease-in-out",
  ],
  variants: {
    expanded: {
      true: "w-[280px]",
      false: "w-20",
    },
  },
  defaultVariants: {
    expanded: true,
  },
});

// ── Categoria (botão + texto/ícone/chevron por estado) ──
export const category = tv({
  slots: {
    root: "flex items-center rounded-radius-lg cursor-pointer transition-all",
    text: "flex-1 text-left text-body-sm whitespace-nowrap overflow-hidden text-ellipsis",
    // SVG do consumidor (ícone bare do lucide vem 24px) dimensionado no slot → 18px
    icon: "grid size-[18px] shrink-0 place-items-center [&>svg]:size-[18px]",
    chevron: "size-icon-sm shrink-0 transition-transform",
  },
  variants: {
    active: {
      true: {
        root: "bg-bg-sidebar-accent shadow-sh-sm",
        text: "font-bold text-fg-brand",
        icon: "text-fg-brand",
        chevron: "text-fg-brand",
      },
      false: {
        root: "hover:bg-bg-sidebar-accent",
        text: "font-medium text-fg-default",
        icon: "text-fg-muted",
        chevron: "text-fg-subtle",
      },
    },
    collapsed: {
      true: { root: "justify-center px-0 size-form-xl" },
      false: { root: "w-full gap-gp-lg px-pad-2xl py-pad-xl" },
    },
  },
  defaultVariants: {
    active: false,
    collapsed: false,
  },
});

// ── Sub-item (item de menu dentro de uma categoria) ──
export const menuItem = tv({
  slots: {
    root: "flex h-[38px] items-center gap-[18px] pl-[18px] pr-pad-2xl cursor-pointer transition-colors hover:bg-bg-sidebar-accent",
    border: "h-full w-0 shrink-0",
    text: "text-body-sm text-left",
  },
  variants: {
    selected: {
      true: {
        border: "border-l-[3px] border-border-brand",
        text: "font-semibold text-fg-default",
      },
      false: {
        border: "border-l border-border-subtle",
        text: "font-medium text-fg-muted",
      },
    },
  },
  defaultVariants: {
    selected: false,
  },
});

// ── Estilos estáticos (sem variante) ──
export const styles = {
  // Header
  header: {
    wrapper:
      "flex h-16 items-center overflow-hidden px-pad-4xl py-pad-md shrink-0",
    wrapperCollapsed: "justify-center px-0",
    inner: "flex items-center gap-gp-md",
    logo: "shrink-0",
    title: "text-title-sm font-bold text-fg-default whitespace-nowrap",
    collapseBtn:
      "ml-auto shrink-0 cursor-pointer rounded-radius-md p-pad-xs text-fg-subtle hover:bg-bg-sidebar-accent hover:text-fg-muted transition-colors",
    expandBtn:
      "absolute right-0 top-16 translate-x-1/2 z-10 cursor-pointer rounded-radius-full bg-bg-surface border border-border-default p-pad-xs shadow-sh-sm text-fg-subtle hover:text-fg-muted transition-colors",
    expandBtnIcon: "size-icon-sm",
  },

  // Module selector
  module: {
    trigger:
      "flex w-full cursor-pointer items-center gap-gp-lg rounded-radius-md bg-bg-sidebar-accent py-pad-md pl-pad-md pr-pad-2xl shadow-sh-sm transition-colors hover:bg-bg-sidebar-accent-hover",
    iconContainer:
      "flex size-icon-xl shrink-0 items-center justify-center rounded-radius-md bg-bg-brand text-fg-on-brand",
    textContainer: "flex flex-col items-start gap-gp-xs overflow-hidden",
    title:
      "text-body-md font-bold leading-4 text-fg-default truncate text-left",
    subtitle: "text-caption-sm font-semibold text-fg-subtle text-left",
    chevron: "ml-auto shrink-0 size-icon-sm text-fg-subtle",
    dropdownItem: "flex items-center gap-gp-lg cursor-pointer",
    // selecionado: realça a linha (bg-brand-subtle) + label/check em fg-brand
    dropdownItemSelected: "bg-bg-brand-subtle text-fg-brand",
    dropdownItemIcon:
      "flex size-icon-lg shrink-0 items-center justify-center rounded-radius-sm bg-bg-brand text-white [&>svg]:size-icon-sm",
    dropdownItemLabel: "flex-1 text-body-md font-medium",
    dropdownItemCheck: "ml-auto shrink-0 size-icon-sm text-fg-brand",
  },

  // Search
  search: {
    wrapper:
      "flex w-full items-center justify-between rounded-radius-lg bg-bg-muted py-pad-sm pl-pad-lg pr-pad-sm transition-all focus-within:bg-bg-surface focus-within:ring-4 focus-within:ring-ring-brand",
    inner:
      "flex flex-1 items-center gap-gp-md opacity-60 focus-within:opacity-100",
    icon: "shrink-0 size-icon-sm text-fg-muted",
    text: "text-body-sm font-medium text-fg-default placeholder:text-fg-subtle",
    shortcutBadge:
      "shrink-0 flex items-center justify-center rounded-radius-md bg-bg-surface px-pad-md py-pad-xs shadow-sh-sm",
    shortcutText: "text-body-sm font-medium text-fg-muted",
  },

  // Footer
  footer: {
    wrapper: "px-pad-lg py-pad-xl",
    button:
      "flex w-full cursor-pointer items-center gap-gp-lg rounded-radius-lg bg-bg-sidebar-accent px-pad-2xl py-pad-xl transition-colors hover:bg-bg-sidebar-accent-hover",
    avatar:
      "flex size-form-sm shrink-0 items-center justify-center rounded-radius-full bg-bg-muted overflow-hidden",
    avatarIcon: "shrink-0 size-icon-sm text-fg-muted",
    textContainer: "flex flex-col items-start gap-gp-2xs overflow-hidden",
    name: "text-body-sm font-semibold text-fg-default truncate w-full text-left",
    email:
      "text-caption-sm font-medium text-fg-muted truncate w-full text-left",
    chevron: "ml-auto shrink-0 size-icon-sm text-fg-subtle",
    dropdownLabel:
      "flex flex-col gap-gp-2xs px-pad-sm py-pad-xs normal-case tracking-normal",
    dropdownLabelName: "text-body-md font-semibold",
    dropdownLabelEmail: "text-caption-md font-normal text-fg-muted",
    dropdownItem: "flex items-center gap-gp-md cursor-pointer",
    dropdownItemIcon: "size-icon-sm shrink-0",
  },

  // Layout
  // Fade do conteúdo textual durante a transição de largura (evita wrap visível)
  textFadeIn: "animate-in fade-in-0 duration-200",
  divider: "mx-pad-3xl h-px bg-border-sidebar",
  sectionPadding:
    "flex flex-col gap-gp-2xl px-pad-3xl py-pad-4xl shrink-0 overflow-hidden",
  navContainer:
    "scrollbar-thin flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-pad-4xl",
  navContainerExpanded: "px-pad-3xl",
  navContainerCollapsed: "items-center",
  navList: "flex flex-col",
  subItemList: "flex flex-col py-pad-lg",
} as const;
