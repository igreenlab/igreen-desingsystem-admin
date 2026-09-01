import type { ReactNode } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Columns3, List, Search, Square, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/popover";
import { cn } from "@/lib/utils";
import { Button } from "../../Button";
import {
  schedulerClearLink,
  schedulerFilterChip,
  schedulerFilterChipName,
  schedulerFilterChipValue,
  schedulerFilterOption,
  schedulerFilterPanel,
  schedulerFilterRow,
  schedulerSearch,
  schedulerSearchInput,
  schedulerSegmented,
  schedulerSegmentedButton,
  schedulerTitle,
  schedulerToolbar,
  schedulerToolbarSide,
} from "../scheduler.styles";
import type {
  SchedulerEventColor,
  SchedulerFilterField,
  SchedulerFilterModel,
  SchedulerView,
} from "../scheduler.types";
import { schedulerEventDot } from "../scheduler.styles";

/**
 * Toolbar do `Scheduler` — uma linha em desktop, duas abaixo de ~1024px.
 *
 * Layout: `[título] [Hoje] [‹][›]` à esquerda · `[busca] [chips] {custom}
 * [segmented] [ação]` à direita.
 *
 * O **segmented** (e não um dropdown "Month view") pra trocar de view: são 4
 * opções, e segmented mostra as 4 de uma vez com 1 clique cada, enquanto o
 * dropdown esconde todas atrás de um clique. É também o que o `viewMode` do
 * `DataTable` já faz — divergir aqui criaria duas gramáticas pra mesma
 * decisão dentro do mesmo DS.
 *
 * ⛔ Nada aqui é importado do `TableToolbar` — só a gramática visual foi
 * copiada (ver nota no topo de `scheduler.styles.ts`, spec §4.1, L-049).
 */

const VIEW_ITEMS: { value: SchedulerView; label: string; icon: ReactNode }[] = [
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
  onToggleValue: (fieldId: string, value: string) => void;
  onClearField: (fieldId: string) => void;
  onClearAll: () => void;
  appliedCount: number;

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
  onToggleValue,
  onClearField,
  onClearAll,
  appliedCount,
  toolbarActions,
  primaryAction,
}: SchedulerToolbarProps) {
  const hasFilters = (filterFields?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-gp-xl">
      <div className={schedulerToolbar()}>
        {/* ── Esquerda: período e navegação ─────────────────────────── */}
        <div className={schedulerToolbarSide()}>
          <h2 className={schedulerTitle()}>{title}</h2>

          <Button variant="outline" color="secondary" size="sm" onClick={onToday}>
            Hoje
          </Button>

          {/* Dois botões de ícone separados, não um ButtonGroup: o grupo daria
              a leitura de "uma ação com opções", e aqui são duas ações
              simétricas e independentes. */}
          <div className="flex shrink-0 items-center gap-gp-2xs">
            <Button
              variant="outline"
              color="secondary"
              size="icon-sm"
              onClick={onPrev}
              aria-label="Período anterior"
            >
              <ChevronLeft />
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

        {/* ── Direita: busca, filtros, custom, views, ação ──────────── */}
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

          {/* `role="radiogroup"` e não `tablist`: o segmented escolhe UM valor
              entre alternativas e não hospeda painéis — `tab` prometeria ao
              leitor de tela uma relação com `tabpanel` que não existe. */}
          <div
            role="radiogroup"
            aria-label="Modo de visualização"
            className={schedulerSegmented()}
          >
            {VIEW_ITEMS.map((item) => {
              const isActive = item.value === view;
              return (
                <button
                  key={item.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  title={item.label}
                  onClick={() => onViewChange(item.value)}
                  className={schedulerSegmentedButton({ isActive })}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {primaryAction}
        </div>
      </div>

      {/* ── Linha de chips de filtro ──────────────────────────────────
          Fica em linha PRÓPRIA, abaixo da toolbar, e não junto da busca: com
          3 campos aplicados os chips crescem e empurrariam o segmento de
          views pra fora da tela em 1280px. */}
      {hasFilters ? (
        <div className={schedulerFilterRow()}>
          {filterFields?.map((field) => {
            const selected = filterModel[field.id] ?? [];
            const applied = selected.length > 0;
            const selectedLabels = field.options
              .filter((o) => selected.includes(o.value))
              .map((o) => o.label);

            return (
              <Popover key={field.id}>
                <PopoverTrigger asChild>
                  <button type="button" className={schedulerFilterChip({ applied })}>
                    <span className={schedulerFilterChipName()}>{field.label}</span>
                    {applied ? (
                      <>
                        <span className={schedulerFilterChipValue()}>
                          {/* 1 valor mostra o rótulo; 2+ mostra a contagem —
                              listar 4 rótulos faria o chip virar a linha
                              inteira. */}
                          {selectedLabels.length === 1
                            ? selectedLabels[0]
                            : `${selectedLabels.length} selecionados`}
                        </span>
                        {/* `<span role="button">` e não `<button>`: botão
                            dentro de botão é HTML inválido e o Radix já
                            transformou o chip num trigger clicável. */}
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label={`Limpar filtro ${field.label}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onClearField(field.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key !== "Enter" && e.key !== " ") return;
                            e.stopPropagation();
                            e.preventDefault();
                            onClearField(field.id);
                          }}
                          className="grid size-icon-sm shrink-0 place-items-center rounded-radius-full text-fg-subtle transition-colors duration-150 hover:text-fg-default focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
                        >
                          <X aria-hidden="true" />
                        </span>
                      </>
                    ) : null}
                  </button>
                </PopoverTrigger>

                <PopoverContent align="start" className="p-0">
                  <div className={schedulerFilterPanel()}>
                    {field.options.map((option) => {
                      const isOn = selected.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={isOn}
                          onClick={() => onToggleValue(field.id, option.value)}
                          className={schedulerFilterOption({ selected: isOn })}
                        >
                          {option.color ? (
                            <span
                              className={schedulerEventDot({
                                color: option.color as SchedulerEventColor,
                                size: "md",
                              })}
                              aria-hidden="true"
                            />
                          ) : null}
                          <span className="min-w-0 flex-1 truncate">
                            {option.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}

          {appliedCount > 0 || search !== "" ? (
            <button
              type="button"
              onClick={onClearAll}
              className={cn(schedulerClearLink(), "shrink-0")}
            >
              Limpar tudo
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
