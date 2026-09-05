import type { ReactNode } from "react";
import {
  CalendarDays,
  ChartNoAxesGantt,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Filter,
  List,
  Search,
  SlidersHorizontal,
  Zap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { GanttAppliedFilters } from "./gantt-applied-filters";
import {
  ganttFilterDot,
  ganttMenuGroupFluid,
  ganttMobileMenu,
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
          O CONTROLE vem antes do RÓTULO: `‹ Hoje ›` e só depois
          "31 mai – 2 ago 2027". O período é o RESULTADO de operar estes três
          botões, e ler o resultado depois da ação é a ordem natural. De quebra o
          divisor passa a separar dois grupos de CONTROLE (visão | navegação), em
          vez de separar controle de texto.

          `soft` e não `outline`: os dois pintam `bg-bg-muted` no dark, mas o
          `outline` acrescenta `border-border-input` — e com o seletor de visão
          colado do outro lado do divisor, três botões CONTORNADOS somavam quatro
          caixas em sequência na abertura da toolbar. O `soft` mantém a superfície
          e larga a borda; a borda da base fica `transparent`, que é o padrão do
          DS pra transição suave.

          ⚠️ NÃO é `ghost`: ghost é fundo transparente, e o pedido é a superfície
          do botão secundário SEM a borda. No light a diferença também aparece —
          `outline` usa `bg-bg-surface` e `soft` usa `bg-bg-muted`, que é o mesmo
          token do trilho do seletor de visão ao lado.
        */}
        <div
          role="group"
          aria-label="Navegação de período"
          className={ganttNavGroup()}
        >
          <Button
            variant="soft"
            color="secondary"
            size="icon-md"
            onClick={onPrev}
            aria-label="Período anterior"
          >
            <ChevronLeft />
          </Button>
          <Button variant="soft" color="secondary" size="md" onClick={onToday}>
            Hoje
          </Button>
          <Button
            variant="soft"
            color="secondary"
            size="icon-md"
            onClick={onNext}
            aria-label="Próximo período"
          >
            <ChevronRight />
          </Button>
        </div>

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

        {/*
          O menu de opções fica ao lado do TÍTULO, não junto da busca.

          A maior parte do que ele guarda governa o período — `‹ Hoje ›` e a
          escala —, e o título é o resultado disso. Ficar do lado direito da
          mesma linha faz o gatilho e o que ele muda serem lidos juntos; embaixo,
          na fila de ícones da busca, ele viraria "mais um botão".
        */}
        <GanttMobileMenu
          view={view}
          onViewChange={onViewChange}
          granularity={granularity}
          onGranularityChange={onGranularityChange}
          onPrev={onPrev}
          onToday={onToday}
          onNext={onNext}
          hasLinks={hasLinks}
          showCriticalToggle={showCriticalToggle}
          criticalPath={criticalPath}
          onToggleCriticalPath={onToggleCriticalPath}
        />
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
              // `max-md:hidden` — em <md ele vira item do menu de opções.
              "shrink-0 max-md:hidden max-lg:size-form-lg max-lg:p-0",
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
              // `max-md:hidden` — em <md a escala é uma seção do menu de opções.
              className="shrink-0 max-md:hidden"
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

/**
 * O menu de opções da toolbar em telas estreitas — o `md:hidden` do Gantt.
 *
 * ## O que ele recolhe, e por quê
 *
 * Medido a 375px antes dele: cinco controles disputando 335px deixavam a barra
 * com duas linhas de 40px, o campo de busca espremido a **51px** (o ícone e
 * nada mais) e o título do período cortado no meio. `flex-wrap` só empilha esse
 * problema; a resposta da `TableToolbar` é tirar controles da barra.
 *
 * Saem em <md: **seletor de visão**, **`‹ Hoje ›`**, **escala** e **caminho
 * crítico** — e reaparecem aqui. Ficam na barra: **título**, **busca**,
 * **filtro** e a **ação primária**, que é a mesma divisão da tabela (lá a barra
 * fica com busca + ícones, e o grupo esquerdo inteiro vai pro menu de
 * Configurações).
 *
 * ## Duas decisões que valem a diferença
 *
 * **Um nível, sem drill-down.** O menu da tabela navega em níveis porque ele
 * carrega painéis inteiros (ordenação, colunas, query builder). Aqui são três
 * seções curtas — 3 + 4 opções e um par de setas. Drill-down aqui seria um
 * clique a mais pra chegar em quatro linhas.
 *
 * **A escala respeita a visão.** Ela só entra no menu quando `view` é
 * `timeline`, exatamente como o dropdown da barra: em grade de mês e agenda a
 * unidade é o dia por construção, e oferecer a escolha num menu não a torna
 * menos vazia.
 */
function GanttMobileMenu({
  view,
  onViewChange,
  granularity,
  onGranularityChange,
  onPrev,
  onToday,
  onNext,
  hasLinks,
  showCriticalToggle,
  criticalPath,
  onToggleCriticalPath,
}: Pick<
  GanttToolbarProps,
  | "view"
  | "onViewChange"
  | "granularity"
  | "onGranularityChange"
  | "onPrev"
  | "onToday"
  | "onNext"
  | "hasLinks"
  | "showCriticalToggle"
  | "criticalPath"
  | "onToggleCriticalPath"
>) {
  const estilos = ganttMobileMenu();
  const mostraCritico = hasLinks && showCriticalToggle;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          color="secondary"
          size="icon-md"
          aria-label="Opções do cronograma"
          title="Opções do cronograma"
          className={estilos.trigger()}
        >
          <SlidersHorizontal />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className={estilos.content()}>
        {/*
          Período primeiro: é o que o usuário mais mexe, e o gatilho está do
          lado do título que estas setas mudam.
        */}
        <div className={estilos.label()}>Período</div>
        <div className={estilos.field()}>
          <div className={ganttMenuGroupFluid()}>
            <div
              role="group"
              aria-label="Navegação de período"
              /*
                `!flex` vence o `max-md:hidden` do `ganttNavGroup` — o grupo é o
                MESMO controle da barra (mesma moldura, mesmas divisórias), e
                aqui ele é justamente o que a barra escondeu.
              */
              className={cn(ganttNavGroup(), "!flex w-full")}
            >
              <Button
                variant="soft"
                color="secondary"
                size="icon-md"
                onClick={onPrev}
                aria-label="Período anterior"
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="soft"
                color="secondary"
                size="md"
                onClick={onToday}
                className="flex-1"
              >
                Hoje
              </Button>
              <Button
                variant="soft"
                color="secondary"
                size="icon-md"
                onClick={onNext}
                aria-label="Próximo período"
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>

        <div className={estilos.separator()} />
        <div className={estilos.label()}>Visualização</div>
        {VIEW_ITEMS.map((v) => (
          <button
            key={v.value}
            type="button"
            role="radio"
            aria-checked={v.value === view}
            onClick={() => onViewChange(v.value)}
            className={estilos.item({ active: v.value === view })}
          >
            {v.icon}
            <span className="flex-1 truncate">{v.label}</span>
            {v.value === view ? <Check strokeWidth={2.2} /> : null}
          </button>
        ))}

        {view === "timeline" ? (
          <>
            <div className={estilos.separator()} />
            <div className={estilos.label()}>Escala</div>
            {ZOOM_ITEMS.map((z) => (
              <button
                key={z.value}
                type="button"
                role="radio"
                aria-checked={z.value === granularity}
                onClick={() => onGranularityChange(z.value)}
                className={estilos.item({ active: z.value === granularity })}
              >
                <Columns3 />
                <span className="flex-1 truncate">{z.label}</span>
                {z.value === granularity ? <Check strokeWidth={2.2} /> : null}
              </button>
            ))}
          </>
        ) : null}

        {mostraCritico ? (
          <>
            <div className={estilos.separator()} />
            <button
              type="button"
              aria-pressed={criticalPath}
              onClick={onToggleCriticalPath}
              className={estilos.item({ active: criticalPath })}
            >
              <Zap />
              <span className="flex-1 truncate">Caminho crítico</span>
              {criticalPath ? <Check strokeWidth={2.2} /> : null}
            </button>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
