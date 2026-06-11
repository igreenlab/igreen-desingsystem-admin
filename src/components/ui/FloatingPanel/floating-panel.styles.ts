import { tv } from "@/utils/tv";

/**
 * FloatingPanel — drawer "card flutuante" que convive com a interação
 * atrás (sem backdrop modal). Versão do `<Panel>` para casos non-modal:
 * detail panels, side info, configurações secundárias.
 *
 * Diferenças vs `<Panel>`:
 *   - Sem Sheet/Dialog (sem foco trap, sem overlay scrim)
 *   - Suporte a resize horizontal (drag handle no edge)
 *   - Suporte a maximize (toggle pra ocupar quase a tela toda)
 *   - Em max-md vira sheet bottom-up (responsive)
 */
export const floatingPanelStyles = tv({
  slots: {
    root: [
      "fixed z-50 flex flex-col overflow-hidden",
      "bg-bg-surface dark:bg-bg-canvas text-fg-default",
      "rounded-radius-xl border border-border-default outline-float shadow-sh-2xl",
      // Desktop (md+) — gutter top/bottom 24px
      "md:top-pad-4xl md:bottom-pad-4xl",
      // Mobile (max-md) — sheet bottom-up colado nas bordas do device:
      // flush nas laterais + bottom, só top arredondado, sem outline/shadow, cap 92vh
      "max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:!w-auto",
      "max-md:max-h-[92vh] max-md:rounded-b-none max-md:border-x-0 max-md:border-b-0",
      "max-md:outline-none max-md:shadow-none",
      // Entrada animada
      "ease-[cubic-bezier(0.4,0,0.2,1)] duration-[220ms]",
      "animate-in fade-in-0",
    ],
    // Backdrop suave — renderizado só em mobile (md:hidden). No desktop o
    // FloatingPanel permanece non-modal (sem scrim, página atrás interativa).
    backdrop: [
      "fixed inset-0 z-40 bg-overlay-scrim md:hidden",
      "animate-in fade-in-0 duration-[220ms]",
    ],
    handle: [
      "absolute top-0 bottom-0 w-[6px] cursor-col-resize z-10",
      // Linha 1px que aparece sutil no hover do panel + linha brand 2px no hover direto
      "after:content-[''] after:absolute after:top-[16px] after:bottom-[16px]",
      "after:left-1/2 after:-translate-x-1/2 after:w-px after:bg-border-default",
      "after:transition-all after:duration-150 after:opacity-60",
      "hover:after:bg-bg-brand hover:after:w-[2px] hover:after:top-0 hover:after:bottom-0 hover:after:opacity-100",
      "data-[dragging=true]:after:bg-bg-brand data-[dragging=true]:after:w-[2px]",
      "data-[dragging=true]:after:top-0 data-[dragging=true]:after:bottom-0 data-[dragging=true]:after:opacity-100",
      // Hide em mobile (não-resizable) e quando maximized
      "max-md:hidden",
    ],
    header: [
      "flex items-center gap-gp-md flex-none",
      "px-[18px] py-[14px] min-h-[60px]",
      "border-b border-border-default",
    ],
    headerText: "flex flex-col gap-gp-2xs min-w-0 flex-1",
    headerTitle: [
      "flex items-center gap-gp-md min-w-0",
      "text-body-lg font-bold tracking-[-0.01em] text-fg-default truncate",
    ],
    headerTitleIcon: "size-[18px] text-fg-brand shrink-0",
    headerDescription: "text-body-md text-fg-muted truncate",
    headerActions: "flex items-center gap-gp-xs flex-none",
    body: [
      // min-h-0 garante que o flex-1 encolha e o scroll ative (em vez de
      // empurrar header/footer). Scroll automático independente de viewport.
      "flex-1 min-h-0 overflow-y-auto scrollbar-thin",
    ],
    footer: [
      // Botões fluidos lado a lado; quebram pra empilhados quando não cabem.
      "flex flex-wrap items-center gap-gp-md flex-none",
      "[&>*]:flex-1 [&>*]:min-w-[140px]",
      "px-[18px] py-[14px]",
      "border-t border-border-default",
    ],
  },
  variants: {
    side: {
      right: {
        root: "md:right-pad-4xl md:slide-in-from-right-12 max-md:slide-in-from-bottom-12",
        handle: "left-0",
      },
      left: {
        root: "md:left-pad-4xl md:slide-in-from-left-12 max-md:slide-in-from-bottom-12",
        handle: "right-0",
      },
    },
    maximized: {
      true: {
        // Ocupa quase a tela inteira (16px gutter em todas as direções)
        // !important sobrescreve as positions do side e do mobile
        root: "md:!inset-pad-md md:!w-auto",
        handle: "md:hidden",
      },
    },
    // Padding interno padrão do body (gutter 18px lateral, igual header/footer).
    // Default ON — conteúdo livre já respira. Desligue (`bodyPadded={false}`)
    // quando usar `<FloatingPanelSection>` (sections gerenciam o próprio padding
    // edge-to-edge com divisórias full-width).
    bodyPadded: {
      true: { body: "px-[18px] py-pad-xl" },
      false: {},
    },
  },
  defaultVariants: {
    bodyPadded: true,
  },
});

/* ── Map de sizes pré-definidos (px) ──────────────────────────── */
export const FLOATING_PANEL_SIZE_PX: Record<
  "sm" | "md" | "lg" | "xl",
  number
> = {
  sm: 320,
  md: 400,
  lg: 560,
  xl: 720,
};
