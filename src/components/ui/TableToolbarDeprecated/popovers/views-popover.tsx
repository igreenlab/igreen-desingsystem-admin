import { useMemo, useState, type ReactNode } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../shadcn/popover";
import { cn } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────────────── */
export type ViewsPopoverView = {
  id: string;
  name: ReactNode;
  /**
   * Quem é o dono da view. Se igual a `myOwnerKey` (default `"me"`), a view
   * é considerada "minha" — mostra o botão de delete e cai na tab "Pessoais".
   * Caso contrário, é uma view compartilhada (mostra autor).
   */
  owner: string;
  /** Nome do autor exibido quando não é "minha" */
  ownerName?: string;
};

export type ViewsPopoverProps = {
  /** Botão que abre o popover (geralmente `<ToolbarSaveButton>`) */
  trigger: ReactNode;

  /** Lista completa de views disponíveis */
  views: ViewsPopoverView[];

  /** ID da view atualmente ativa */
  activeViewId?: string;
  /** Aplicar/selecionar uma view (clique no item) */
  onApply?: (view: ViewsPopoverView) => void;
  /** Excluir uma view "minha" */
  onDelete?: (id: string) => void;
  /** Clicar em "Salvar visão atual" (footer) */
  onCreate?: () => void;

  /**
   * Key que identifica views "minhas" (default `"me"`).
   * Views com `owner === myOwnerKey` mostram delete e ficam na tab Pessoais.
   */
  myOwnerKey?: string;

  /** Esconde as tabs Todos/Pessoais (mostra todas as views direto) */
  hideTabs?: boolean;
  /** Esconde o input de busca */
  hideSearch?: boolean;
  /** Esconde o botão "Salvar visão atual" no footer */
  hideCreate?: boolean;

  /** Labels customizáveis */
  allTabLabel?: ReactNode;
  myTabLabel?: ReactNode;
  searchPlaceholder?: string;
  createLabel?: ReactNode;
  /** Mensagem de estado vazio (com search ativa) */
  emptySearchMessage?: (query: string) => ReactNode;
  /** Mensagem de estado vazio (sem search) */
  emptyMessage?: ReactNode;

  /** Alinhamento do popover. Default "start" */
  align?: "start" | "center" | "end";
  /** Estado controlado (opcional) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  className?: string;
};

/**
 * ViewsPopover — popover de visualizações salvas da tabela.
 *
 *   - Tabs `Todos` / `Pessoais` (filtra por `owner === myOwnerKey`)
 *   - Search local por nome ou autor
 *   - Lista com estado ativo + botão delete em views "minhas"
 *   - Footer "Salvar visão atual" pra criar nova
 *
 * Dumb: `views` + `activeViewId` vêm do consumer. Tabs e search são state interno.
 */
export function ViewsPopover({
  trigger,
  views,
  activeViewId,
  onApply,
  onDelete,
  onCreate,
  myOwnerKey = "me",
  hideTabs,
  hideSearch,
  hideCreate,
  allTabLabel = "Todos",
  myTabLabel = "Pessoais",
  searchPlaceholder = "Buscar",
  createLabel = "Salvar visão atual",
  emptySearchMessage = (q) => `Nenhuma visão pra "${q}".`,
  emptyMessage = "Nenhuma visão disponível.",
  align = "start",
  open,
  onOpenChange,
  className,
}: ViewsPopoverProps) {
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const baseList = hideTabs
      ? views
      : tab === "mine"
        ? views.filter((v) => v.owner === myOwnerKey)
        : views;
    const q = search.trim().toLowerCase();
    if (!q) return baseList;
    return baseList.filter((v) => {
      const name = typeof v.name === "string" ? v.name.toLowerCase() : "";
      const author = (v.ownerName ?? "").toLowerCase();
      return name.includes(q) || author.includes(q);
    });
  }, [views, tab, search, myOwnerKey, hideTabs]);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={align}
        role="dialog"
        aria-label="Visualizações"
        className={cn(
          "w-[280px] max-w-[calc(100vw-32px)] max-h-[min(480px,calc(100vh-80px))] p-0 flex flex-col min-h-0 overflow-hidden",
          className,
        )}
      >
        {/* Tabs */}
        {!hideTabs && (
          <div
            role="tablist"
            className="flex-none flex items-center gap-[2px] p-[3px] m-pad-md mb-0 bg-bg-muted rounded-radius-md"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "all"}
              onClick={() => setTab("all")}
              className={cn(
                "flex-1 h-form-sm px-pad-lg rounded-radius-sm",
                "text-body-xs font-medium cursor-pointer outline-none",
                "transition-[background-color,color,box-shadow] duration-150",
                tab === "all"
                  ? "bg-bg-accent text-fg-default font-semibold shadow-sh-sm"
                  : "bg-transparent text-fg-muted hover:text-fg-default",
              )}
            >
              {allTabLabel}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "mine"}
              onClick={() => setTab("mine")}
              className={cn(
                "flex-1 h-form-sm px-pad-lg rounded-radius-sm",
                "text-body-xs font-medium cursor-pointer outline-none",
                "transition-[background-color,color,box-shadow] duration-150",
                tab === "mine"
                  ? "bg-bg-accent text-fg-default font-semibold shadow-sh-sm"
                  : "bg-transparent text-fg-muted hover:text-fg-default",
              )}
            >
              {myTabLabel}
            </button>
          </div>
        )}

        {/* Search */}
        {!hideSearch && (
          <label className="flex-none flex items-center gap-gp-md mx-pad-md mt-pad-md h-form-md px-pad-xl rounded-radius-lg bg-bg-input dark:bg-bg-muted border border-border-input shadow-sh-sm dark:shadow-sh-none cursor-text focus-within:border-border-brand focus-within:shadow-sh-ring transition-[border-color,box-shadow] duration-150">
            <Search
              strokeWidth={1.8}
              aria-hidden="true"
              className="size-[14px] text-fg-muted shrink-0"
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="flex-1 min-w-0 bg-transparent border-0 outline-none text-body-sm font-normal text-fg-default placeholder:text-fg-muted"
            />
          </label>
        )}

        {/* List */}
        <div
          role="list"
          className={cn(
            "flex-1 min-h-0 overflow-y-auto p-pad-md flex flex-col gap-[2px]",
            "[scrollbar-width:thin] [scrollbar-color:var(--color-border-default)_transparent]",
            "[&::-webkit-scrollbar]:w-[6px]",
            "[&::-webkit-scrollbar-thumb]:bg-border-default [&::-webkit-scrollbar-thumb]:rounded-full",
            "[&::-webkit-scrollbar-track]:bg-transparent",
          )}
        >
          {filtered.length === 0 ? (
            <p className="text-body-xs font-normal text-fg-muted m-0 px-pad-md py-pad-2xl text-center">
              {search.trim() ? emptySearchMessage(search.trim()) : emptyMessage}
            </p>
          ) : (
            filtered.map((view) => {
              const isActive = view.id === activeViewId;
              const isMine = view.owner === myOwnerKey;
              return (
                <div
                  key={view.id}
                  role="listitem"
                  className={cn(
                    "group/view flex items-stretch gap-[2px] rounded-radius-md",
                    isActive && "bg-bg-brand-subtle",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onApply?.(view)}
                    className={cn(
                      "flex-1 flex items-center gap-gp-md min-w-0",
                      "px-pad-md py-pad-sm rounded-radius-md",
                      "bg-transparent border-0 cursor-pointer outline-none text-left",
                      "transition-[background-color,color] duration-150",
                      isActive
                        ? "text-fg-brand hover:bg-bg-brand-subtle-hover"
                        : "text-fg-default hover:bg-bg-muted focus-visible:bg-bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "flex-1 text-body-sm font-normal truncate",
                        isActive ? "font-semibold" : "font-medium",
                      )}
                    >
                      {view.name}
                    </span>
                    {!isMine && view.ownerName && (
                      <span className="text-caption-sm text-fg-muted shrink-0">
                        por {view.ownerName}
                      </span>
                    )}
                  </button>
                  {isMine && onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(view.id)}
                      aria-label={
                        typeof view.name === "string"
                          ? `Excluir ${view.name}`
                          : "Excluir"
                      }
                      title="Excluir"
                      className={cn(
                        "grid place-items-center size-[28px] shrink-0 self-center",
                        "mr-pad-sm",  // respiro da borda direita (= sandbox)
                        "rounded-radius-md bg-transparent text-fg-muted",
                        "outline-none cursor-pointer",
                        "transition-[opacity,background-color,color] duration-150",
                        "opacity-0 group-hover/view:opacity-100",
                        "hover:bg-bg-danger-muted hover:text-fg-danger",
                        "focus-visible:opacity-100 focus-visible:bg-bg-muted",
                        "[&_svg]:size-[14px]",
                      )}
                    >
                      <Trash2 strokeWidth={1.8} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer "Salvar visão atual" */}
        {!hideCreate && onCreate && (
          <div className="flex-none p-pad-md border-t border-border-default">
            <button
              type="button"
              onClick={onCreate}
              className={cn(
                "flex items-center justify-center gap-gp-sm w-full",
                "h-form-md px-pad-xl rounded-radius-lg",
                "bg-bg-surface dark:bg-bg-muted",
                "border border-border-subtle dark:border-border-input",
                "shadow-sh-sm dark:shadow-sh-none",
                "text-body-sm font-semibold text-fg-default dark:text-fg-muted",
                "outline-none cursor-pointer",
                "transition-[background-color,color,box-shadow] duration-150",
                "hover:bg-bg-muted-hover hover:text-fg-default",
                "focus-visible:shadow-sh-ring",
                "[&_svg]:size-[14px]",
              )}
            >
              <Plus strokeWidth={2.2} />
              {createLabel}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
