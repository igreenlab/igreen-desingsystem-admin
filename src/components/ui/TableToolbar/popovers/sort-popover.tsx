import type { ComponentType, ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, Plus, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import { cn } from "@/lib/utils";
import type { SortDirection } from "../table-toolbar.types";

/* ── Types ────────────────────────────────────────────────────────── */
// Re-export pra backward-compat (consumers que importavam daqui).
export type { SortDirection };

export type SortPopoverColumn = {
  key: string;
  label: ReactNode;
  /** Ícone do tipo (lucide component) */
  icon?: ComponentType<{ className?: string }>;
};

export type SortPopoverCriterion = {
  /** Key da coluna sendo ordenada */
  key: string;
  /** Direção da ordenação */
  dir: SortDirection;
};

/* ── Panel (miolo reutilizável) ──────────────────────────────────────
 * Extraído do PopoverContent pra ser reaproveitado tanto pelo `SortPopover`
 * (standalone) quanto pelo `ToolbarSettingsMenu` (drill-down). Renderiza só
 * header + body + footer (Fragment) — quem dá largura/altura é o container.
 * `onBack` opcional → mostra o chevron de voltar no header (settings menu). */
export type SortPanelProps = {
  columns: SortPopoverColumn[];
  sortBy: SortPopoverCriterion[];
  onSortByChange: (next: SortPopoverCriterion[]) => void;
  title?: ReactNode;
  emptyMessage?: ReactNode;
  addSectionLabel?: ReactNode;
  clearLabel?: ReactNode;
  /** Quando passado, renderiza o botão "voltar" no header (drill-down). */
  onBack?: () => void;
};

export function SortPanel({
  columns,
  sortBy,
  onSortByChange,
  title = "Ordenação",
  emptyMessage = "Sem critérios de ordenação.",
  addSectionLabel = "Adicionar ordenação por",
  clearLabel = "Limpar",
  onBack,
}: SortPanelProps) {
  const usedKeys = new Set(sortBy.map((s) => s.key));
  const available = columns.filter((c) => !usedKeys.has(c.key));

  const toggleDir = (index: number) => {
    const next = [...sortBy];
    next[index] = {
      ...next[index],
      dir: next[index].dir === "asc" ? "desc" : "asc",
    };
    onSortByChange(next);
  };

  const remove = (index: number) =>
    onSortByChange(sortBy.filter((_, i) => i !== index));

  const addSort = (key: string) =>
    onSortByChange([...sortBy, { key, dir: "asc" }]);

  const clearAll = () => onSortByChange([]);

  return (
    <>
      {/* Header — opcional botão voltar (drill-down) */}
      <div className="flex-none flex items-center gap-gp-md px-pad-xl py-pad-lg border-b border-border-default">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Voltar"
            className="grid place-items-center size-[20px] -ml-[2px] shrink-0 rounded-radius-sm bg-transparent text-fg-muted cursor-pointer outline-none hover:bg-bg-muted hover:text-fg-default focus-visible:bg-bg-muted [&_svg]:size-[16px]"
          >
            <ChevronLeft strokeWidth={2.2} />
          </button>
        )}
        <h3 className="text-caption-sm font-semibold text-fg-muted uppercase tracking-wide leading-none m-0">
          {title}
        </h3>
      </div>
      <div
        className={cn(
          "flex-1 min-h-0 overflow-y-auto",
          "[scrollbar-width:thin] [scrollbar-color:var(--color-border-default)_transparent]",
          "[&::-webkit-scrollbar]:w-[6px]",
          "[&::-webkit-scrollbar-thumb]:bg-border-default [&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-track]:bg-transparent",
        )}
      >
        {/* ── Section: Critérios atuais ───────────────────────── */}
        <section className="px-pad-xl py-pad-lg border-b border-border-default">
          {sortBy.length === 0 ? (
            <p className="text-body-xs font-normal text-fg-muted m-0 py-pad-sm">
              {emptyMessage}
            </p>
          ) : (
            <div className="flex flex-col gap-[2px]">
              {sortBy.map((s, i) => {
                const col = columns.find((c) => c.key === s.key);
                return (
                  <div
                    key={s.key}
                    className="group/row flex items-center gap-gp-md px-pad-md py-[4px] rounded-radius-md hover:bg-bg-muted"
                  >
                    <span className="text-caption-sm text-fg-subtle shrink-0">
                      {i === 0 ? "Por" : "depois por"}
                    </span>
                    <span className="flex-1 text-body-sm font-medium text-fg-default truncate">
                      {col?.label ?? s.key}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleDir(i)}
                      className={cn(
                        "inline-flex items-center gap-gp-xs h-[22px] px-pad-md shrink-0",
                        "rounded-radius-sm bg-bg-muted text-fg-default text-caption-sm font-medium",
                        "outline-none cursor-pointer",
                        "hover:bg-bg-muted-hover focus-visible:bg-bg-muted-hover",
                        "[&_svg]:size-[12px]",
                      )}
                      aria-label={
                        s.dir === "asc"
                          ? "Mudar para descendente"
                          : "Mudar para ascendente"
                      }
                    >
                      {s.dir === "asc" ? <ArrowUp /> : <ArrowDown />}
                      {s.dir === "asc" ? "asc" : "desc"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      aria-label="Remover critério"
                      className={cn(
                        "grid place-items-center size-[22px] shrink-0",
                        "rounded-radius-sm bg-transparent text-fg-muted",
                        "outline-none cursor-pointer",
                        "transition-[opacity,background-color,color] duration-150",
                        "opacity-0 group-hover/row:opacity-100",
                        "hover:bg-bg-muted hover:text-fg-default",
                        "focus-visible:opacity-100 focus-visible:bg-bg-muted",
                        "[&_svg]:size-[12px]",
                      )}
                    >
                      <X strokeWidth={2.2} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Section: Adicionar ─────────────────────────────── */}
        {available.length > 0 && (
          <section className="px-pad-xl py-pad-lg">
            <h4 className="text-caption-sm font-semibold text-fg-muted uppercase tracking-wide leading-none m-0 mb-pad-md">
              {addSectionLabel}
            </h4>
            <div className="flex flex-col gap-[2px]">
              {available.map((col) => {
                const Icon = col.icon;
                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => addSort(col.key)}
                    className={cn(
                      "group/add flex items-center gap-gp-md w-full",
                      "px-pad-md py-pad-sm rounded-radius-md",
                      "bg-transparent border-0 cursor-pointer outline-none text-left",
                      "hover:bg-bg-muted focus-visible:bg-bg-muted",
                      "transition-colors duration-150",
                    )}
                  >
                    {Icon && (
                      <Icon className="size-[14px] shrink-0 text-fg-muted" />
                    )}
                    <span className="flex-1 text-body-sm font-medium text-fg-default truncate">
                      {col.label}
                    </span>
                    <Plus
                      className="size-[14px] shrink-0 text-fg-muted opacity-50 group-hover/add:opacity-100 group-hover/add:text-fg-brand transition-[opacity,color]"
                      strokeWidth={2}
                    />
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* ── Footer ────────────────────────────────────────────── */}
      {sortBy.length > 0 && (
        <div className="flex-none flex items-center justify-start gap-gp-md px-pad-2xl min-h-[44px] border-t border-border-default">
          <button
            type="button"
            onClick={clearAll}
            className="text-body-xs font-medium text-fg-brand bg-transparent border-0 p-0 cursor-pointer outline-none hover:underline focus-visible:underline underline-offset-2"
          >
            {clearLabel}
          </button>
        </div>
      )}
    </>
  );
}

/* ── Popover wrapper ─────────────────────────────────────────────── */
export type SortPopoverProps = SortPanelProps & {
  /** Botão que abre o popover */
  trigger: ReactNode;
  /** Alinhamento do popover. Default "end" */
  align?: "start" | "center" | "end";
  /** Estado controlado (opcional) */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

/**
 * SortPopover — popover de ordenação multi-coluna da tabela.
 * Wrapper fino: renderiza o `<SortPanel>` dentro do PopoverContent.
 *
 * Componente dumb: `sortBy` (array de critérios) vem do consumer.
 * Use `useToolbarSort()` hook se quiser gerenciamento de estado pronto.
 */
export function SortPopover({
  trigger,
  align = "end",
  open,
  onOpenChange,
  className,
  ...panel
}: SortPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn(
          "w-[300px] max-w-[calc(100vw-32px)] max-h-[min(480px,calc(100vh-80px))] p-0 flex flex-col min-h-0 overflow-hidden",
          className,
        )}
      >
        <SortPanel {...panel} />
      </PopoverContent>
    </Popover>
  );
}
