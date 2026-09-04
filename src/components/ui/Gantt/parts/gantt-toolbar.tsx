import type { ReactNode } from "react";
import {
  CalendarDays,
  ChartNoAxesGantt,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Filter,
  List,
  Search,
  Zap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { GanttAppliedFilters } from "./gantt-applied-filters";
import {
  ganttFilterDot,
  ganttNavGroup,
  ganttSearch,
  ganttSearchInput,
  ganttTitle,
  ganttTitleText,
  ganttToolbarDivider,
  ganttViewSwitch,
  ganttViewSwitchButton,
  ganttToolbar,
  ganttToolbarSide,
} from "../gantt.styles";
import type {
  GanttFilterField,
  GanttFilterModel,
  GanttGranularity,
  GanttView,
} from "../gantt.types";

/**
 * Toolbar do `Gantt`.
 *
 * ## Tamanhos vêm do `TableToolbar`, medidos e não estimados
 *
 * Todos os controles ficam em **40px**: busca `h-form-lg`, botões `icon-md`
 * (40×40) ou `md` com rótulo. A primeira versão misturou `size="sm"` (36px) nos
 * botões com `h-form-lg` (40px) na busca, e a diferença de 4px numa fileira de
 * 5 controles lê como desalinho, não como hierarquia.
 *
 * ## Ordem
 *
 *   Esquerda:  [▤|▦|☰ visão] │ [📅 período] [‹ Hoje ›]
 *   Direita:   [busca] [Crítico] [▦ Escala ▾] [⧩] [ação]
 *   Abaixo:    [chips do que está aplicado] [Limpar tudo]
 *
 * ⚠️ A VISÃO vem primeiro, à esquerda, com divisor — igual à `DataTable`, onde
 * o toggle Tabela/Lista/Kanban abre a toolbar. A razão é hierárquica: a visão
 * decide o que TODO o resto da toolbar significa (o período passa a ser um mês
 * no calendário, a escala desaparece), então ela não pode estar depois do que
 * ela governa. Ficava à direita, entre a busca e a escala, como se fosse mais
 * uma ferramenta.
 *
 * Espelha a orientação do `TableToolbar`: contexto à esquerda, busca à direita,
 * ação primária no fim. A busca **expande no foco** (200 → 300px), com a mesma
 * curva e duração de lá.
 *
 * O filtro abre um **painel lateral**, e por isso NÃO tem seta: seta promete
 * dropdown, e mentir sobre o que vai acontecer é pior que não sinalizar.
 *
 * ## A segunda linha não é decoração
 *
 * O que está filtrado aparece em chips abaixo da toolbar, com `×` em cada um.
 * É a L-051: o estado filtrado tem que ser visível e desfazível sem procurar o
 * controle que o produziu. Com o filtro num painel que fecha, sem essa linha o
 * usuário volta pra uma grade com metade das tarefas e nada na tela dizendo o
 * porquê — o que lê como bug, não como filtro.
 *
 * A linha SOME inteira quando nada está aplicado. Chip vazio seria um segundo
 * lugar de escolher a mesma coisa que o painel.
 *
 * ⛔ Nada importado do `Scheduler` nem do `TableToolbar` — só a gramática visual
 * (L-049). Cross-import entre pastas de `ui/` gera `registryDependency` pendente
 * e o `igreen:add` estreia quebrado.
 */

/**
 * As duas visões — **icon-only**, no controle segmentado do `TableToolbar`.
 *
 * Ícone sem rótulo, com `aria-label` + `title`, exatamente como o toggle
 * Tabela/Lista/Kanban da `DataTable` faz. É o mesmo gesto, então é o mesmo
 * controle: 36px por segmento em vez de ~200px de dois botões com texto, e a
 * largura devolvida ao eixo.
 *
 * ⚠️ Aqui `CalendarDays` repete o ícone do título do período, e eu tinha
 * recusado isso na versão anterior. Reverti: naquele caso era um botão COM
 * rótulo, onde o ícone é ornamento e a redundância confunde. Num controle
 * icon-only o ícone **é** o rótulo, então ele tem que ser o óbvio — e o óbvio
 * de "Calendário" é um calendário. Os contextos são diferentes.
 */
const VIEW_ITEMS: {
  value: GanttView;
  label: string;
  icon: ReactNode;
}[] = [
  { value: "timeline", label: "Cronograma", icon: <ChartNoAxesGantt /> },
  { value: "calendar", label: "Calendário", icon: <CalendarDays /> },
  { value: "list", label: "Lista", icon: <List /> },
];

const ZOOM_ITEMS: { value: GanttGranularity; label: string }[] = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
  { value: "quarter", label: "Trimestre" },
];

export type GanttToolbarProps = {
  title: ReactNode;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;

  view: GanttView;
  onViewChange: (v: GanttView) => void;

  granularity: GanttGranularity;
  onGranularityChange: (g: GanttGranularity) => void;

  searchable: boolean;
  search: string;
  onSearchChange: (s: string) => void;

  filterFields?: GanttFilterField[];
  onOpenFilterPanel: () => void;
  appliedCount: number;
  /** O que está marcado — a linha de chips lê daqui. */
  filterModel: GanttFilterModel;
  /** Desliga UM campo inteiro (o `×` do chip). */
  onClearField: (fieldId: string) => void;
  /** Desliga todos ("Limpar todos"). */
  onClearAll: () => void;
  /** Marca/desmarca um valor — o popover do chip edita por aqui. */
  onToggleFilterValue: (fieldId: string, value: string) => void;
  /** Contagem por opção, sobre TODAS as linhas. */
  filterCounts: Record<string, Record<string, number>>;
  /** Formata o ISO de um filtro `date` pro chip — o `locale` mora na raiz. */
  formatFilterDate: (iso: string) => string;

  /**
   * Só aparece quando há vínculo E o consumidor não escondeu o botão.
   *
   * Sem grafo não existe caminho crítico; e `criticalPathToggle={false}`
   * esconde o controle quando o estado é decisão da tela.
   */
  hasLinks: boolean;
  showCriticalToggle: boolean;
  criticalPath: boolean;
  onToggleCriticalPath: () => void;

  toolbarActions?: ReactNode;
  primaryAction?: ReactNode;
};

export function GanttToolbar({
  title,
  onPrev,
  onNext,
  onToday,
  view,
  onViewChange,
  granularity,
  onGranularityChange,
  searchable,
  search,
  onSearchChange,
  filterFields,
  onOpenFilterPanel,
  appliedCount,
  filterModel,
  onClearField,
  onClearAll,
  onToggleFilterValue,
  filterCounts,
  formatFilterDate,
  hasLinks,
  showCriticalToggle,
  criticalPath,
  onToggleCriticalPath,
  toolbarActions,
  primaryAction,
}: GanttToolbarProps) {
  const zoomAtivo = ZOOM_ITEMS.find((z) => z.value === granularity) ?? ZOOM_ITEMS[0];
  const temFiltros = (filterFields?.length ?? 0) > 0;
  const filtroEngajado = appliedCount > 0;


  /*
    A coluna externa NÃO tem `gap`: quem paga o espaçamento entre a toolbar e os
    chips é a própria linha de chips (`mt`/`pt` em `ganttFilterRow`). Ela só
    existe quando há filtro aplicado, e um `gap` aqui cobraria margem por uma
    linha ausente na maior parte do tempo.
  */
  return (
    <div className="flex flex-col">
      <div className={ganttToolbar()}>
      {/* ── esquerda: período (o contexto) ───────────────────────── */}
      <div className={ganttToolbarSide({ slot: "leading" })}>
        {/*
          Visão — o controle segmentado do `TableToolbar`, e o PRIMEIRO item.

          `role="radiogroup"` + `role="radio"` + `aria-checked`, como lá: são
          opções mutuamente exclusivas de um conjunto, não toggles
          independentes.
        */}
        <div
          role="radiogroup"
          aria-label="Visualização"
          className={ganttViewSwitch()}
        >
          {VIEW_ITEMS.map((v) => {
            const ativa = v.value === view;
            return (
              <button
                key={v.value}
                type="button"
                role="radio"
                aria-checked={ativa}
                aria-label={v.label}
                title={v.label}
                onClick={() => onViewChange(v.value)}
                className={ganttViewSwitchButton({ isActive: ativa })}
              >
                {v.icon}
              </button>
            );
          })}
        </div>

        <span className={ganttToolbarDivider()} aria-hidden />

        {/*
          Ícone de calendário à esquerda do período: ele diz que aquele texto é
          um INTERVALO de datas, não um título de tela. `aria-hidden` porque o
          texto ao lado já diz tudo — ícone decorativo anunciado é ruído no
          leitor de tela.
        */}
        <span className={ganttTitle()}>
          <CalendarDays aria-hidden />
          <span className={ganttTitleText()}>{title}</span>
        </span>

        <div
          role="group"
          aria-label="Navegação de período"
          className={ganttNavGroup()}
        >
          <Button
            variant="outline"
            color="secondary"
            size="icon-md"
            onClick={onPrev}
            aria-label="Período anterior"
          >
            <ChevronLeft />
          </Button>
          <Button variant="outline" color="secondary" size="md" onClick={onToday}>
            Hoje
          </Button>
          <Button
            variant="outline"
            color="secondary"
            size="icon-md"
            onClick={onNext}
            aria-label="Próximo período"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      {/* ── direita: busca, ferramentas, ação ────────────────────── */}
      <div className={ganttToolbarSide({ slot: "trailing" })}>
        {searchable ? (
          <label className={ganttSearch()}>
            <Search aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar tarefa…"
              aria-label="Buscar tarefa"
              className={ganttSearchInput()}
            />
          </label>
        ) : null}

        {toolbarActions}

        {/*
          Caminho crítico só existe com vínculo. Um toggle que nunca muda nada é
          pior que a ausência dele: o usuário clica, nada acontece, e conclui que
          está quebrado.
        */}
        {hasLinks && showCriticalToggle ? (
          <Button
            variant={criticalPath ? "soft" : "outline"}
            color={criticalPath ? "primary" : "secondary"}
            size="md"
            iconLeft={<Zap />}
            onClick={onToggleCriticalPath}
            aria-pressed={criticalPath}
            aria-label="Caminho crítico"
            className={cn(
              "shrink-0 max-lg:size-form-lg max-lg:p-0",
              criticalPath && "border-border-brand hover:border-border-brand",
            )}
          >
            <span className="hidden lg:inline">Crítico</span>
          </Button>
        ) : null}


        {/*
          ⛔ A ESCALA SÓ EXISTE NA TIMELINE.

          "Dia / Semana / Mês / Trimestre" é a densidade do EIXO HORIZONTAL.
          Na grade de mês a unidade é o dia por construção e as 6 linhas são
          semanas; na agenda não há eixo nenhum — o agrupamento é por dia
          sempre. Nas duas, o controle ofereceria uma escolha que não muda
          nada: mesma classe de defeito do toggle de crítico sem vínculo.

          ⚠️ O estado NÃO é resetado ao esconder: voltando pra timeline, a
          escala que estava selecionada continua. Zerar faria trocar de visão e
          voltar perder o zoom, que é trabalho do usuário jogado fora.
        */}
        {view === "timeline" ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              color="secondary"
              size="md"
              /*
                `Columns3` porque é O QUE O CONTROLE FAZ: ele troca a densidade
                das colunas do eixo — dia, semana, mês, trimestre são larguras
                de coluna, não datas.

                Passei por `Ruler` (régua = "escala") e ficou ruim: a metáfora é
                de MEDIR comprimento, e ninguém mede nada aqui. E de propósito
                não é calendário — o calendário já rotula o período do lado
                esquerdo, e dois calendários na mesma toolbar significando
                coisas diferentes (que intervalo eu vejo × em que unidade eu
                vejo) é pior que ícone nenhum.
              */
              iconLeft={<Columns3 />}
              iconRight={<ChevronDown />}
              aria-label={`Escala: ${zoomAtivo.label}`}
              className="shrink-0"
            >
              {zoomAtivo.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[168px]">
            <DropdownMenuRadioGroup
              value={granularity}
              onValueChange={(v) => onGranularityChange(v as GanttGranularity)}
            >
              {ZOOM_ITEMS.map((z) => (
                <DropdownMenuRadioItem key={z.value} value={z.value}>
                  {z.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        ) : null}

        {/*
          #4 — o filtro abre PAINEL, não dropdown.

          Um cronograma real filtra por frente, responsável, status,
          prioridade e tag — cinco grupos com muitas opções. Dropdown com 40
          linhas rola dentro de uma caixa de 240px e fecha ao clicar fora sem
          querer. O painel é o mesmo veículo do filtro do `DataTable`.

          #8 — SEM `iconRight`: a seta prometia dropdown, e o que abre é um
          painel lateral. Seta que mente sobre o que vai acontecer é pior que
          seta ausente.

          ⚠️ O ícone é `Filter` (funil) porque é EXATAMENTE o do
          `ToolbarFilterButton`, que é a fonte única do botão de filtro do
          `DataTable` e do `DataList`. Era `ListFilter` (as barras
          decrescentes) — outro desenho pra a mesma ação, na mesma tela, é o
          usuário aprendendo duas vezes.

          ⛔ E é ícone copiado, não componente importado: `ToolbarFilterButton`
          vive em `ui/TableToolbar/`, e cross-import entre pastas de `ui/`
          gera `registryDependency` pendente e quebra o `igreen:add` (L-049).

          E é **icon-only**, igual ao de lá. O rótulo "Filtro" era redundante:
          o funil já é o vocabulário universal, e o que o usuário precisa saber
          não é que existe um filtro — é QUAL filtro está ligado, que agora
          está nos chips abaixo, onde a informação é específica em vez de
          genérica. Os 62px de rótulo voltaram pro eixo.
        */}
        {temFiltros ? (
          <span className="relative shrink-0">
            <Button
              variant={filtroEngajado ? "soft" : "outline"}
              color={filtroEngajado ? "primary" : "secondary"}
              size="icon-md"
              onClick={onOpenFilterPanel}
              aria-label="Filtro"
              title="Filtro"
              className={cn(
                filtroEngajado &&
                  "border-border-brand hover:border-border-brand",
              )}
            >
              <Filter />
            </Button>
            {appliedCount > 0 ? (
              <span className={ganttFilterDot()} aria-hidden />
            ) : null}
          </span>
        ) : null}
        {primaryAction}
        </div>
      </div>

      {/*
        Resumo do que está APLICADO — ver a nota do topo (L-051).

        Componente próprio e não JSX inline aqui: a anatomia do chip da tabela
        tem 5 peças, um popover de edição e regra de colapso de valores. Inline
        isso somava ~70 linhas no meio da toolbar, e a toolbar deixava de ser
        legível de uma passada.
      */}
      {temFiltros ? (
        <GanttAppliedFilters
          fields={filterFields ?? []}
          model={filterModel}
          counts={filterCounts}
          onToggleValue={onToggleFilterValue}
          onClearField={onClearField}
          onClearAll={onClearAll}
          formatDate={formatFilterDate}
        />
      ) : null}
    </div>
  );
}
