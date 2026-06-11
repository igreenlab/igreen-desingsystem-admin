import { useState, type ComponentType, type ReactNode } from "react";
import { ArrowUpDown, Check, ChevronLeft, ChevronRight, Columns, Eye, SlidersHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../shadcn/popover";
import { cn } from "@/lib/utils";

/**
 * ToolbarSettingsMenu — menu "Configurações da tabela" com navegação em níveis
 * (drill-down) num único painel.
 *
 * Visual inspirado fielmente no `DropdownMenu` (mesma respiração): container
 * `p-pad-sm` com `gap-px`, items `px-pad-lg py-pad-md gap-pad-lg` (texto muted →
 * default no hover), labels `text-fg-subtle uppercase`, separadores `h-px`.
 *
 * Nível 0: lista de seções (Ordenação ›, Colunas ›, Filtros avançados ›) +
 *          seção Densidade inline.
 * Nível 1: o miolo (`SortPanel` / `ColsPanel` / `FilterPanel`) com botão voltar.
 *
 * Extras só-mobile (não mudam nada no desktop): `mobileViewToggle` (Kanban/Lista,
 * seção inline) e `mobileViews` (entrada "Visões ›" drill-down listando só as
 * visões pré-definidas, com a selecionada exibida à direita).
 */
type SettingsView = "root" | "sort" | "cols" | "filter" | "views";

type NavEntry = {
  view: Exclude<SettingsView, "root">;
  label: ReactNode;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  render: (onBack: () => void) => ReactNode;
  /** Texto à direita (cor fraca) — ex: a visão atualmente selecionada. */
  rightHint?: ReactNode;
  /** Entrada só aparece em <md (CSS `md:hidden`). */
  mobileOnly?: boolean;
};

export type ToolbarSettingsMenuView = {
  id: string;
  name: ReactNode;
};

export type ToolbarSettingsMenuProps = {
  /** Botão que abre o menu (ícone sliders). */
  trigger: ReactNode;

  /** Painel de ordenação (recebe `onBack`). Omitir → não mostra a seção. */
  sortPanel?: (onBack: () => void) => ReactNode;
  /** Painel de colunas (recebe `onBack`). */
  colsPanel?: (onBack: () => void) => ReactNode;
  /** Painel de filtros avançados (recebe `onBack`). */
  filterPanel?: (onBack: () => void) => ReactNode;

  /** Controle de densidade (segmented) renderizado inline no nível 0. */
  density?: ReactNode;

  /**
   * Toggle de visualização (Kanban/Lista) — seção inline só-mobile (`md:hidden`).
   * Passe o `<ToolbarSegmented fluid>` aqui pra ele aparecer no menu em <md.
   */
  mobileViewToggle?: ReactNode;
  /**
   * Toggle de EXIBIÇÃO da tabela no mobile (Linhas/Cards) — seção inline
   * só-mobile (`md:hidden`). Eixo independente do `mobileViewToggle`
   * (table/kanban): controla se a tabela renderiza como linhas ou cards.
   */
  mobileDisplayToggle?: ReactNode;
  /**
   * Visões pré-definidas — entrada drill-down só-mobile (`md:hidden`). Lista só
   * as views default da montagem (sem salvas, sem adicionar). A selecionada
   * aparece à direita da entrada.
   */
  mobileViews?: {
    items: ToolbarSettingsMenuView[];
    activeId?: string;
    onSelect: (id: string) => void;
  };

  /** Título do nível 0. Default "Configurações da tabela". */
  title?: ReactNode;
  /** Labels das seções. */
  densityLabel?: ReactNode;
  sortLabel?: ReactNode;
  colsLabel?: ReactNode;
  filterLabel?: ReactNode;
  viewToggleLabel?: ReactNode;
  mobileDisplayLabel?: ReactNode;
  viewsLabel?: ReactNode;

  align?: "start" | "center" | "end";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

/* ── Estilos espelhados do DropdownMenu ──────────────────────────── */
const MENU_ITEM = cn(
  "group/row relative flex items-center gap-pad-lg w-full",
  "px-pad-lg py-pad-md rounded-radius-sm",
  "bg-transparent border-0 cursor-pointer outline-none text-left",
  "text-body-sm font-medium text-fg-muted [&_svg]:text-fg-muted",
  "transition-colors duration-150",
  "hover:bg-bg-muted hover:text-fg-default hover:[&_svg]:text-fg-default",
  "focus-visible:bg-bg-muted focus-visible:text-fg-default",
  "[&_svg]:size-4 [&_svg]:shrink-0",
);
const MENU_LABEL =
  "px-pad-lg py-pad-sm text-caption-sm font-semibold uppercase tracking-wider text-fg-subtle";
const MENU_SEP = "mx-pad-xs my-pad-xs h-px bg-border-default";
const MENU_FIELD = "px-pad-lg pb-pad-sm"; // wrapper do control (segmented) alinhado aos items

/* Header com botão voltar — usado pelos níveis drill-down internos. */
function LevelHeader({ label, onBack }: { label: ReactNode; onBack: () => void }) {
  return (
    <div className="flex-none flex items-center gap-gp-md px-pad-xl py-pad-lg border-b border-border-default">
      <button
        type="button"
        onClick={onBack}
        aria-label="Voltar"
        className="grid place-items-center size-[20px] -ml-[2px] shrink-0 rounded-radius-sm bg-transparent text-fg-muted cursor-pointer outline-none hover:bg-bg-muted hover:text-fg-default focus-visible:bg-bg-muted [&_svg]:size-[16px]"
      >
        <ChevronLeft strokeWidth={2.2} />
      </button>
      <h3 className="text-caption-sm font-semibold text-fg-subtle uppercase tracking-wider leading-none m-0">
        {label}
      </h3>
    </div>
  );
}

export function ToolbarSettingsMenu({
  trigger,
  sortPanel,
  colsPanel,
  filterPanel,
  density,
  mobileViewToggle,
  mobileDisplayToggle,
  mobileViews,
  title = "Configurações da tabela",
  densityLabel = "Densidade",
  sortLabel = "Ordenação",
  colsLabel = "Colunas",
  filterLabel = "Filtros avançados",
  viewToggleLabel = "Visualização",
  mobileDisplayLabel = "Exibição",
  viewsLabel = "Visões",
  align = "end",
  open,
  onOpenChange,
  className,
}: ToolbarSettingsMenuProps) {
  const [view, setView] = useState<SettingsView>("root");

  // Reset pro nível 0 ao ABRIR (não ao fechar). Resetar no fechar fazia o painel
  // "voltar pro root" durante a animação de close-out (flicker visível por alguns
  // ms). Como o conteúdo desmonta ao fechar, resetar no próximo open é limpo.
  const handleOpenChange = (next: boolean) => {
    if (next) setView("root");
    onOpenChange?.(next);
  };

  const selectedViewName = mobileViews?.items.find((v) => v.id === mobileViews.activeId)?.name;

  const entries: NavEntry[] = [];
  if (sortPanel) entries.push({ view: "sort", label: sortLabel, icon: ArrowUpDown, render: sortPanel });
  if (colsPanel) entries.push({ view: "cols", label: colsLabel, icon: Columns, render: colsPanel });
  if (filterPanel) entries.push({ view: "filter", label: filterLabel, icon: SlidersHorizontal, render: filterPanel });
  if (mobileViews) {
    entries.push({
      view: "views",
      label: viewsLabel,
      icon: Eye,
      mobileOnly: true,
      rightHint: selectedViewName,
      render: (onBack) => (
        <>
          <LevelHeader label={viewsLabel} onBack={onBack} />
          <div className="flex-1 min-h-0 overflow-y-auto p-pad-sm flex flex-col gap-px">
            {mobileViews.items.map((item) => {
              const isActive = mobileViews.activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    mobileViews.onSelect(item.id);
                    onBack();
                  }}
                  className={cn(
                    MENU_ITEM,
                    isActive &&
                      "bg-bg-brand-subtle text-fg-brand [&_svg]:text-fg-brand hover:bg-bg-brand-subtle hover:text-fg-brand",
                  )}
                >
                  <span className="flex-1 truncate">{item.name}</span>
                  {isActive && <Check strokeWidth={2.2} />}
                </button>
              );
            })}
          </div>
        </>
      ),
    });
  }

  const active = entries.find((e) => e.view === view);
  // Filtros avançados precisa de mais largura (query builder). Só desktop —
  // no mobile o sheet já ocupa a largura toda.
  const wide = view === "filter";

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn(
          "w-[320px] max-w-[calc(100vw-32px)] max-h-[min(520px,calc(100vh-80px))] p-0 flex flex-col min-h-0 overflow-hidden",
          wide && "md:w-[550px]",
          className,
        )}
      >
        {active ? (
          // Nível 1 — painel reaproveitado com voltar injetado.
          active.render(() => setView("root"))
        ) : (
          // Nível 0 — lista flat estilo DropdownMenu (label + items + seções).
          <div className="flex-1 min-h-0 overflow-y-auto p-pad-sm flex flex-col gap-px">
            <div className={MENU_LABEL}>{title}</div>

            {entries.map((e) => {
              const Icon = e.icon;
              return (
                <button
                  key={e.view}
                  type="button"
                  onClick={() => setView(e.view)}
                  className={cn(MENU_ITEM, e.mobileOnly && "md:hidden")}
                >
                  <Icon strokeWidth={1.8} />
                  <span className="flex-1 truncate">{e.label}</span>
                  {e.rightHint && (
                    <span className="text-caption-sm text-fg-subtle truncate max-w-[120px]">
                      {e.rightHint}
                    </span>
                  )}
                  <ChevronRight strokeWidth={2} />
                </button>
              );
            })}

            {/* Visualização (Kanban/Lista) — só-mobile, inline igual Densidade. */}
            {mobileViewToggle && (
              <div className="md:hidden flex flex-col">
                <div className={MENU_SEP} />
                <div className={cn(MENU_LABEL, "pb-pad-lg")}>{viewToggleLabel}</div>
                <div className={MENU_FIELD}>{mobileViewToggle}</div>
              </div>
            )}

            {/* Exibição (Linhas/Cards) — só-mobile, inline igual Densidade. */}
            {mobileDisplayToggle && (
              <div className="md:hidden flex flex-col">
                <div className={MENU_SEP} />
                <div className={cn(MENU_LABEL, "pb-pad-lg")}>{mobileDisplayLabel}</div>
                <div className={MENU_FIELD}>{mobileDisplayToggle}</div>
              </div>
            )}

            {density && (
              <div className="flex flex-col">
                <div className={MENU_SEP} />
                <div className={cn(MENU_LABEL, "pb-pad-lg")}>{densityLabel}</div>
                <div className={MENU_FIELD}>{density}</div>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
