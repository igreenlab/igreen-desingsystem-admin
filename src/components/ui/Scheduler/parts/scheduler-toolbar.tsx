import type { ReactNode } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  List,
  ListFilter,
  Search,
  Square,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "../../Button";
import {
  schedulerClearLink,
  schedulerFilterChip,
  schedulerFilterChipName,
  schedulerFilterChipValue,
  schedulerFilterDot,
  schedulerFilterRow,
  schedulerNavGroup,
  schedulerSearch,
  schedulerSearchInput,
  schedulerTitle,
  schedulerToolbar,
  schedulerToolbarSide,
  schedulerViewMenuItem,
} from "../scheduler.styles";
import type {
  SchedulerFilterField,
  SchedulerFilterModel,
  SchedulerView,
} from "../scheduler.types";

/**
 * Toolbar do `Scheduler`.
 *
 * Layout: `[título] [‹ Hoje ›]` à esquerda · `[busca] [filtro] {custom}
 * [view ▾] [ação]` à direita.
 *
 * ## Duas mudanças de desenho, e o porquê
 *
 * **1. `‹ Hoje ›` é um grupo, não três controles soltos.** As três ações são o
 * mesmo assunto — "onde estou no tempo" — e "Hoje" é a posição de origem entre
 * voltar e avançar. Colado, o alvo de clique fica contíguo e a leitura é de um
 * controle só. Soltos, "Hoje" competia visualmente com o título ao lado.
 *
 * **2. A view virou dropdown, não segmented.** O segmented mostrava as 4
 * opções de uma vez, o que é uma vantagem real — mas custava ~230px numa
 * toolbar que agora também carrega o botão de filtro, e em 1280px empurrava a
 * ação primária pra segunda linha. O dropdown custa ~110px e o rótulo do
 * gatilho diz qual view está ativa, então a informação não se perde: o que se
 * perde é ver as 3 inativas sem clicar.
 *
 * ⛔ Nada aqui é importado do `TableToolbar` — só a gramática visual foi
 * copiada (ver nota no topo de `scheduler.styles.ts`, L-049).
 */

const VIEW_ITEMS: {
  value: SchedulerView;
  label: string;
  icon: ReactNode;
}[] = [
  { value: "month", label: "Mês", icon: <CalendarDays /> },
  { value: "week", label: "Semana", icon: <Columns3 /> },
  { value: "day", label: "Dia", icon: <Square /> },
  { value: "list", label: "Lista", icon: <List /> },
];

export type SchedulerToolbarProps = {
  title: ReactNode;
  view: SchedulerView;
  onViewChange: (view: SchedulerView) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;

  searchable: boolean;
  search: string;
  onSearchChange: (search: string) => void;

  filterFields?: SchedulerFilterField[];
  filterModel: SchedulerFilterModel;
  onClearField: (fieldId: string) => void;
  onClearAll: () => void;
  appliedCount: number;

  /** Estado do painel-coluna de filtro. */
  filterPanelOpen: boolean;
  onToggleFilterPanel: () => void;
  /**
   * `false` abaixo de `lg`: a coluna extra não cabe junto de uma grade de 7
   * dias legível, então o botão fica desabilitado com `title` explicando — em
   * vez de abrir um painel que o CSS esconde.
   */
  filterPanelAvailable: boolean;

  toolbarActions?: ReactNode;
  primaryAction?: ReactNode;
};

export function SchedulerToolbar({
  title,
  view,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  searchable,
  search,
  onSearchChange,
  filterFields,
  filterModel,
  onClearField,
  onClearAll,
  appliedCount,
  filterPanelOpen,
  onToggleFilterPanel,
  filterPanelAvailable,
  toolbarActions,
  primaryAction,
}: SchedulerToolbarProps) {
  const hasFilters = (filterFields?.length ?? 0) > 0;
  const activeView = VIEW_ITEMS.find((v) => v.value === view) ?? VIEW_ITEMS[0];

  /** "A ferramenta de filtro está engajada" — painel aberto OU filtro aplicado. */
  const filterEngaged = filterPanelOpen || appliedCount > 0;

  /** Só os campos COM valor aplicado viram chip — o painel é onde se escolhe. */
  const appliedFields = (filterFields ?? []).filter(
    (field) => (filterModel[field.id] ?? []).length > 0,
  );

  return (
    <div className="flex flex-col gap-gp-xl">
      <div className={schedulerToolbar()}>
        {/* ── Esquerda: período e navegação ─────────────────────────── */}
        <div className={schedulerToolbarSide()}>
          <h2 className={schedulerTitle()}>{title}</h2>

          <div role="group" aria-label="Navegação de período" className={schedulerNavGroup()}>
            <Button
              variant="outline"
              color="secondary"
              size="icon-sm"
              onClick={onPrev}
              aria-label="Período anterior"
            >
              <ChevronLeft />
            </Button>
            <Button variant="outline" color="secondary" size="sm" onClick={onToday}>
              Hoje
            </Button>
            <Button
              variant="outline"
              color="secondary"
              size="icon-sm"
              onClick={onNext}
              aria-label="Próximo período"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>

        {/* ── Direita: busca, filtro, custom, view, ação ────────────── */}
        <div className={schedulerToolbarSide()}>
          {searchable ? (
            <label className={schedulerSearch({ expanded: search !== "" })}>
              <Search aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar evento…"
                aria-label="Buscar evento"
                className={schedulerSearchInput()}
              />
            </label>
          ) : null}

          {toolbarActions}

          {/* View ANTES do filtro: os dois são controles de "como estou vendo",
              e a ordem segue do mais amplo (qual recorte de tempo) pro mais
              específico (o que dentro dele). Ambos `outline` e `size="sm"` — são
              pares, e variantes diferentes fariam um parecer mais importante.

              Dropdown de escolha ÚNICA → RadioGroup, não Item solto: `Item` não
              anuncia qual está ativa, `RadioItem` sim. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                color="secondary"
                size="sm"
                iconLeft={activeView.icon}
                iconRight={<ChevronDown />}
                aria-label={`Visualização: ${activeView.label}`}
                className="shrink-0"
              >
                {activeView.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[168px]">
              <DropdownMenuRadioGroup
                value={view}
                onValueChange={(v) => onViewChange(v as SchedulerView)}
              >
                {VIEW_ITEMS.map((item) => (
                  <DropdownMenuRadioItem key={item.value} value={item.value}>
                    <span className={schedulerViewMenuItem()}>{item.label}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {hasFilters ? (
            /* `relative` no wrapper e não no Button: o ponto é posicionado
               contra a caixa do botão, e o Button não expõe `position`. */
            <span className="relative shrink-0">
              <Button
                /* Dois sinais INDEPENDENTES, e é isso que os torna legíveis:
                 *
                 * **Verde** (`primary soft` + `border-border-brand`) = a
                 * ferramenta está engajada — painel aberto OU filtro aplicado.
                 * **Ponto** no canto = existe filtro aplicado, e só isso.
                 *
                 * As 3 combinações que aparecem na prática:
                 *   painel aberto, sem filtro   → verde, SEM ponto
                 *   filtro aplicado, fechado    → verde, COM ponto
                 *   filtro aplicado, aberto     → verde, COM ponto
                 *
                 * Cor é a mesma receita do `ToolbarToolButton` do
                 * `TableToolbar` — o precedente do DS pra "esta ferramenta tem
                 * algo ligado". O `soft` do Button não traz borda, então o
                 * brand entra por className.
                 *
                 * O ponto NÃO é redundante com a cor: ele é o que distingue
                 * "abri pra olhar" de "tem filtro mexendo no que eu vejo" — e é
                 * o portador não-cromático da informação, pra quem não
                 * distingue o verde. */
                variant={filterEngaged ? "soft" : "outline"}
                color={filterEngaged ? "primary" : "secondary"}
                size="sm"
                iconLeft={<ListFilter />}
                onClick={onToggleFilterPanel}
                disabled={!filterPanelAvailable}
                aria-expanded={filterPanelOpen}
                className={cn(
                  filterEngaged &&
                    "border-border-brand hover:border-border-brand",
                )}
                title={
                  filterPanelAvailable
                    ? undefined
                    : "O painel de filtros precisa de uma tela mais larga (1024px+)"
                }
              >
                Filtro
              </Button>
              {appliedCount > 0 ? (
                <span className={schedulerFilterDot()} aria-hidden="true" />
              ) : null}
            </span>
          ) : null}

          {primaryAction}
        </div>
      </div>

      {/* ── Resumo do que está aplicado ───────────────────────────────
          Linha própria e só com o que está LIGADO. Some inteira quando não há
          filtro aplicado — antes ela mostrava chips vazios de borda tracejada,
          que agora seriam um segundo lugar de escolher a mesma coisa que o
          painel. Continua servindo pra desligar sem reabrir o painel (L-051). */}
      {appliedFields.length > 0 ? (
        <div className={schedulerFilterRow()}>
          {appliedFields.map((field) => {
            const selected = filterModel[field.id] ?? [];
            const selectedLabels = field.options
              .filter((o) => selected.includes(o.value))
              .map((o) => o.label);

            return (
              <span key={field.id} className={schedulerFilterChip({ applied: true })}>
                <span className={schedulerFilterChipName()}>{field.label}</span>
                <span className={schedulerFilterChipValue()}>
                  {selectedLabels.length === 1
                    ? selectedLabels[0]
                    : `${selectedLabels.length} selecionados`}
                </span>
                <button
                  type="button"
                  aria-label={`Limpar filtro ${field.label}`}
                  onClick={() => onClearField(field.id)}
                  className="grid size-icon-sm shrink-0 place-items-center rounded-radius-full text-fg-subtle transition-colors duration-150 hover:text-fg-default focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
                >
                  <X aria-hidden="true" />
                </button>
              </span>
            );
          })}

          <button
            type="button"
            onClick={onClearAll}
            className={cn(schedulerClearLink(), "shrink-0")}
          >
            Limpar tudo
          </button>
        </div>
      ) : null}
    </div>
  );
}
