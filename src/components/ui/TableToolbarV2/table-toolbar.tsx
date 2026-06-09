import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toolbarActions, toolbarLeft, toolbarRoot } from "./table-toolbar.styles";
import { ToolbarDivider } from "./parts/toolbar-divider";

/**
 * TableToolbarV2 — toolbar de tabela com layout OPINATIVO.
 *
 * Diferente do `<TableToolbar>` (dumb, slots `left`/`actions` que o consumer
 * ordena livremente), a v2 recebe slots SEMÂNTICOS e renderiza numa ordem fixa.
 * O consumer não monta a ordem — impossível montar errado.
 *
 * Ordem renderizada:
 *   Esquerda:  viewToggle · ⟨divider⟩ · savedViews
 *   Direita:   refresh · search · filter · settings · more
 *
 * A v2 consolida os controles secundários: Ordenação, Colunas, Filtros avançados
 * e Densidade vivem dentro do `settings` (`<ToolbarSettingsMenu>`, drill-down);
 * o filtro simples fica no `filter` (funil → drawer); export + ações ficam no
 * `more` (⋯). Reaproveita 100% os parts/popovers — só muda a orquestração.
 *
 * Modo bulk: quando `bulkBar` é passado (não null/false), substitui a toolbar
 * inteira. Combine com `<BulkActionsBar>` (auto-some quando count=0).
 *
 * Pra filtros aplicados (chips), use `<ToolbarApplied>` LOGO ABAIXO da toolbar.
 */
export type TableToolbarV2Props = {
  /* ── Esquerda — navegação/visões ─────────────────────────────── */
  /** Toggle de modo de visualização (Kanban / Lista). */
  viewToggle?: ReactNode;
  /** Saved Views — abas + botão adicionar (geralmente `<TableToolbarViews>`). */
  savedViews?: ReactNode;

  /* ── Direita — ações ─────────────────────────────────────────── */
  /** Botão de atualizar (refresh). */
  refresh?: ReactNode;
  /** Campo de busca (`<ToolbarSearch>`). */
  search?: ReactNode;
  /** Filtro simples — icon button funil → drawer (`<ToolbarSimpleFilterDrawer>`). */
  filter?: ReactNode;
  /** Configurações da tabela — icon button sliders → `<ToolbarSettingsMenu>`
   *  (drill-down com Ordenação · Colunas · Filtros avançados · Densidade). */
  settings?: ReactNode;
  /** Menu de opções "⋯" (`<MoreMenu>`) — export + ações. */
  more?: ReactNode;

  /* ── Extras ──────────────────────────────────────────────────── */
  /** Substitui a toolbar inteira pela barra de ações em massa. */
  bulkBar?: ReactNode;
  className?: string;
};

export function TableToolbarV2({
  viewToggle,
  savedViews,
  refresh,
  search,
  filter,
  settings,
  more,
  bulkBar,
  className,
}: TableToolbarV2Props) {
  if (bulkBar) {
    return <div className={cn("w-full", className)}>{bulkBar}</div>;
  }

  return (
    <div className={cn(toolbarRoot(), className)}>
      {/* Esquerda — navegação/visões */}
      <div className={toolbarLeft()}>
        {viewToggle}
        {viewToggle && savedViews && <ToolbarDivider />}
        {savedViews}
      </div>

      {/* Direita — ações (sem dividers: busca + icon buttons limpos).
          Refresh some em <md (o menu de Configurações cobre o resto). */}
      <div className={toolbarActions()}>
        {refresh && <span className="hidden md:contents">{refresh}</span>}
        {search}
        {filter}
        {settings}
        {more}
      </div>
    </div>
  );
}
