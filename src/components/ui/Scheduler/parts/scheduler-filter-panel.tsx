import { useMemo, useState } from "react";
import type { Locale } from "date-fns";
import { ChevronDown, X } from "lucide-react";
import { Checkbox } from "@/components/shadcn/checkbox";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  schedulerAsideHead,
  schedulerAsideSection,
  schedulerAsideTitle,
  schedulerClearLink,
  schedulerFilterAside,
  schedulerGroup,
  schedulerGroupChevron,
  schedulerGroupHead,
  schedulerOption,
  schedulerOptionBox,
  schedulerOptionCount,
  schedulerOptionLabel,
} from "../scheduler.styles";
import { MiniMonth } from "./mini-month";
import type {
  SchedulerEvent,
  SchedulerFilterField,
  SchedulerFilterModel,
} from "../scheduler.types";

/**
 * Painel de filtro — uma **coluna** à direita da grade, não um overlay.
 *
 * Por que coluna: filtro é o controle cujo resultado você quer ver *enquanto*
 * mexe. Num popover ou sheet por cima, marcar uma caixa e conferir o efeito na
 * grade são dois gestos (marcar → fechar → olhar → reabrir). Como coluna, é um.
 *
 * A estrutura segue a barra lateral de calendário que o usuário passou como
 * referência: mini-calendário no topo pra saltar de data, e abaixo os grupos de
 * filtro como listas de caixas coloridas — a cor da caixa é a cor com que o
 * evento aparece na grade, o que dispensa legenda separada.
 *
 * ⚠️ **Semântica de "nada marcado".** Num calendário de verdade, desmarcar
 * todas as agendas esconde tudo. Aqui, campo sem nenhuma opção marcada
 * significa **"sem filtro"** (mostra tudo), não "esconde tudo" — é a convenção
 * do `filterModel` do DS, onde `fieldId` ausente = sem restrição, e a que o
 * resto do sistema (DataTable, DataList) já usa. Trocar isso só neste
 * componente faria o mesmo `filterModel` significar coisas opostas em telas
 * diferentes. O cabeçalho do grupo diz "Todas" quando está nesse estado, pra
 * não parecer que a marcação foi perdida.
 */

export type SchedulerFilterPanelProps = {
  filterFields: SchedulerFilterField[];
  filterModel: SchedulerFilterModel;
  onToggleValue: (fieldId: string, value: string) => void;
  onClearAll: () => void;
  appliedCount: number;
  onClose: () => void;

  /** Contagem por opção — vem dos eventos ANTES do filtro daquele campo. */
  counts: Record<string, Record<string, number>>;

  /* Mini-calendário */
  date: Date;
  now: Date;
  locale?: Locale;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  events: SchedulerEvent[];
  onDateSelect: (date: Date) => void;
};

export function SchedulerFilterPanel({
  filterFields,
  filterModel,
  onToggleValue,
  onClearAll,
  appliedCount,
  onClose,
  counts,
  date,
  now,
  locale,
  weekStartsOn,
  events,
  onDateSelect,
}: SchedulerFilterPanelProps) {
  /**
   * Grupos abertos por default. Colapsar tudo economizaria altura mas
   * esconderia justamente o que o painel existe pra mostrar; quem tem muitos
   * campos fecha os que não usa, e a preferência vive só nesta sessão de tela.
   */
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  const toggleGroup = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <aside className={schedulerFilterAside()} aria-label="Filtros do calendário">
      <div className={schedulerAsideSection({ compact: true, sticky: true })}>
        <div className={schedulerAsideHead()}>
          <span className={schedulerAsideTitle()}>Filtros</span>
          <div className="flex shrink-0 items-center gap-gp-sm">
            {appliedCount > 0 ? (
              <button type="button" onClick={onClearAll} className={schedulerClearLink()}>
                Limpar
              </button>
            ) : null}
            <Button
              variant="ghost"
              color="secondary"
              size="icon-2xs"
              aria-label="Fechar painel de filtros"
              onClick={onClose}
            >
              <X />
            </Button>
          </div>
        </div>
      </div>

      <div className={schedulerAsideSection()}>
        <MiniMonth
          selected={date}
          now={now}
          locale={locale}
          weekStartsOn={weekStartsOn}
          events={events}
          onSelect={onDateSelect}
        />
      </div>

      {filterFields.map((field) => {
        const selected = filterModel[field.id] ?? [];
        const isOpen = !collapsed.has(field.id);
        const fieldCounts = counts[field.id] ?? {};

        return (
          <div
            key={field.id}
            className={cn(schedulerAsideSection(), schedulerGroup())}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggleGroup(field.id)}
              className={schedulerGroupHead()}
            >
              <span className="flex min-w-0 items-baseline gap-gp-sm">
                <span className="truncate">{field.label}</span>
                {/* "Todas" quando nada está marcado — deixa explícito que o
                    estado é "sem filtro", não "perdi a seleção". */}
                <span className={schedulerOptionCount()}>
                  {selected.length === 0 ? "Todas" : selected.length}
                </span>
              </span>
              <ChevronDown
                className={schedulerGroupChevron({ open: isOpen })}
                aria-hidden="true"
              />
            </button>

            {isOpen ? (
              <div className="flex flex-col">
                {field.options.map((option) => {
                  const id = `scheduler-filter-${field.id}-${option.value}`;
                  const isOn = selected.includes(option.value);
                  const count = fieldCounts[option.value];

                  return (
                    <label key={option.value} htmlFor={id} className={schedulerOption()}>
                      <Checkbox
                        id={id}
                        checked={isOn}
                        onCheckedChange={() => onToggleValue(field.id, option.value)}
                        className={schedulerOptionBox({
                          color: option.color ?? "brand",
                        })}
                      />
                      <span className={schedulerOptionLabel()}>{option.label}</span>
                      {count !== undefined ? (
                        <span className={schedulerOptionCount()}>{count}</span>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </aside>
  );
}
