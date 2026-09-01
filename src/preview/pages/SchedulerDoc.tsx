import { useMemo, useState } from "react";
import { ptBR } from "date-fns/locale";
import { addDays, format, startOfDay, startOfMonth } from "date-fns";
import { CalendarDays, Clock, Link2, MapPin, Pencil, Plus, Tag, Users } from "lucide-react";
import { Scheduler } from "../../components/ui/Scheduler";
import type {
  SchedulerEvent,
  SchedulerFilterField,
  SchedulerFilterModel,
  SchedulerView,
} from "../../components/ui/Scheduler";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { Avatar } from "../../components/ui/avatar-ig";
import { FloatingPanel } from "../../components/ui/FloatingPanel";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

const TOC = [
  { id: "preview", label: "Preview — mês" },
  { id: "semana", label: "View semana" },
  { id: "dia", label: "View dia" },
  { id: "lista", label: "View lista" },
  { id: "detalhe", label: "Painel de detalhe" },
  { id: "filtros", label: "Busca e filtros" },
  { id: "controlado", label: "Modo controlado" },
  { id: "tela-cheia", label: "Tela cheia" },
  { id: "falta", label: "O que falta" },
  { id: "api", label: "API Reference" },
];

/* ────────────────────────────────────────────────────────────────────────
 * Fixture
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Ancorado no mês corrente e não em datas fixas: um fixture com "setembro de
 * 2026" cravado ficaria vazio na primeira vez que alguém abrisse a página em
 * outubro, e o showcase pareceria quebrado.
 */
const MONTH_START = startOfMonth(new Date());
const d = (offset: number, hour = 9, minute = 0) => {
  const base = addDays(MONTH_START, offset);
  base.setHours(hour, minute, 0, 0);
  return base;
};

const EVENTS: SchedulerEvent[] = [
  {
    id: "e1",
    title: "Daily do time de produto",
    start: d(1, 9, 0),
    end: d(1, 9, 30),
    color: "info",
    categoryId: "interna",
    tagIds: ["time"],
    description: "Sincronização rápida de progresso e bloqueios.",
    meta: { local: "Sala Vidro / Meet", responsavel: "Aline Castro" },
  },
  {
    id: "e2",
    title: "Demo pro cliente Solaris",
    start: d(1, 14, 0),
    end: d(1, 15, 30),
    color: "brand",
    categoryId: "cliente",
    tagIds: ["comercial", "importante"],
    description: "Apresentação do novo painel de consumo.",
    meta: { local: "Zoom", responsavel: "Sérgio Vieira" },
  },
  {
    id: "e3",
    title: "Revisão de design",
    start: d(3, 10, 30),
    end: d(3, 12, 0),
    color: "warning",
    categoryId: "interna",
    tagIds: ["design"],
    description: "Fechar a hierarquia dos KPIs do dashboard.",
    meta: { local: "Sala Verde", responsavel: "Marina Duarte" },
  },
  {
    id: "e4",
    title: "Offsite do time",
    // Multi-dia de propósito: é o caso que exercita `segmentMultiDay` e o
    // truncamento de canto na virada de semana.
    start: startOfDay(addDays(MONTH_START, 8)),
    end: startOfDay(addDays(MONTH_START, 10)),
    allDay: true,
    color: "success",
    categoryId: "interna",
    tagIds: ["time"],
    description: "Três dias de planejamento fora do escritório.",
    meta: { local: "Itu / SP", responsavel: "Aline Castro" },
  },
  {
    id: "e5",
    title: "Fechamento financeiro",
    start: d(14, 8, 0),
    end: d(14, 11, 0),
    color: "danger",
    categoryId: "financeiro",
    tagIds: ["importante"],
    description: "Conciliação do mês e envio pro contador.",
    meta: { local: "Remoto", responsavel: "Davi Nogueira" },
  },
  {
    id: "e6",
    title: "1:1 com o time",
    start: d(14, 15, 0),
    end: d(14, 16, 0),
    color: "neutral",
    categoryId: "interna",
    tagIds: ["time"],
    meta: { local: "Sala pequena", responsavel: "Sérgio Vieira" },
  },
  {
    id: "e7",
    title: "Onboarding Fortaleza",
    start: d(14, 16, 30),
    end: d(14, 17, 30),
    color: "info",
    categoryId: "cliente",
    tagIds: ["comercial"],
    meta: { local: "Meet", responsavel: "Marina Duarte" },
  },
  {
    id: "e8",
    // 4 no mesmo dia pra exercitar o "+N mais" da célula.
    title: "Retrospectiva",
    start: d(14, 18, 0),
    end: d(14, 19, 0),
    color: "warning",
    categoryId: "interna",
    tagIds: ["time"],
    meta: { local: "Sala Vidro", responsavel: "Aline Castro" },
  },
  {
    id: "e9",
    title: "Visita técnica — usina",
    start: d(21, 7, 30),
    end: d(21, 13, 0),
    color: "brand",
    categoryId: "campo",
    tagIds: ["operacao"],
    description: "Inspeção trimestral dos inversores.",
    meta: { local: "Usina Norte", responsavel: "Davi Nogueira" },
  },
  {
    id: "e10",
    title: "Treinamento do time comercial",
    start: d(23, 13, 0),
    end: d(23, 17, 0),
    color: "success",
    categoryId: "interna",
    tagIds: ["comercial", "design"],
    description: "Nova esteira de proposta e simulador.",
    meta: { local: "Auditório", responsavel: "Marina Duarte" },
  },
];

/** Semana que contém o offsite (dias 9–11) — é onde a banda "Dia inteiro" aparece. */
const SEMANA_DO_OFFSITE = addDays(MONTH_START, 9);
/** Dia com 4 eventos, pra a view de dia não abrir vazia. */
const DIA_CHEIO = addDays(MONTH_START, 14);

/**
 * Os `id` dos campos são `categoryId`, `tagIds` e `color` porque são os três
 * que o motor `client` do `Scheduler` sabe casar. Um `id` fora dessa lista
 * renderiza o chip e não filtra — e o componente emite `console.warn` em DEV
 * justamente pra esse caso não passar em silêncio.
 */
const FILTER_FIELDS: SchedulerFilterField[] = [
  {
    id: "categoryId",
    label: "Categoria",
    options: [
      { value: "interna", label: "Interna" },
      { value: "cliente", label: "Cliente" },
      { value: "financeiro", label: "Financeiro" },
      { value: "campo", label: "Campo" },
    ],
  },
  {
    id: "tagIds",
    label: "Tags",
    options: [
      { value: "time", label: "Time" },
      { value: "comercial", label: "Comercial" },
      { value: "design", label: "Design" },
      { value: "operacao", label: "Operação" },
      { value: "importante", label: "Importante" },
    ],
  },
  {
    id: "color",
    label: "Cor",
    options: [
      { value: "brand", label: "Marca", color: "brand" },
      { value: "info", label: "Info", color: "info" },
      { value: "success", label: "Sucesso", color: "success" },
      { value: "warning", label: "Atenção", color: "warning" },
      { value: "danger", label: "Crítico", color: "danger" },
      { value: "neutral", label: "Neutro", color: "neutral" },
    ],
  },
];

/* ────────────────────────────────────────────────────────────────────────
 * Props tables
 * ──────────────────────────────────────────────────────────────────────── */

const SCHEDULER_PROPS = [
  { name: "events", type: "SchedulerEvent[]", defaultVal: "—" },
  { name: "view", type: '"month" | "week" | "day" | "list" (controlado)', defaultVal: "—" },
  { name: "defaultView", type: "SchedulerView (não-controlado)", defaultVal: '"month"' },
  { name: "onViewChange", type: "(view: SchedulerView) => void", defaultVal: "—" },
  { name: "date", type: "Date (controlado)", defaultVal: "—" },
  { name: "defaultDate", type: "Date (não-controlado)", defaultVal: "hoje" },
  { name: "onDateChange", type: "(date: Date) => void", defaultVal: "—" },
  { name: "locale", type: "Locale (date-fns)", defaultVal: "en-US do date-fns" },
  { name: "weekStartsOn", type: "0 | 1 | ... | 6", defaultVal: "0 (domingo)" },
  { name: "hourFormat", type: '"12h" | "24h"', defaultVal: '"24h"' },
  { name: "onEventClick", type: "(event, evt) => void", defaultVal: "—" },
  { name: "onSlotClick", type: "(start: Date, end: Date) => void — o + no hover da célula", defaultVal: "—" },
  { name: "onEventMove", type: "(change: SchedulerEventChange) => void — ⛔ ainda NÃO é chamado (dnd não implementado)", defaultVal: "—" },
  { name: "onEventResize", type: "(change: SchedulerEventChange) => void — ⛔ ainda NÃO é chamado", defaultVal: "—" },
  { name: "draggable", type: "boolean — global; event.draggable sobrepõe. Sem efeito enquanto o dnd não existe", defaultVal: "false" },
  { name: "resizable", type: "boolean — global; event.resizable sobrepõe. Idem", defaultVal: "false" },
  { name: "snapMinutes", type: "15 | 30 | 60 — usado no lane-packing de week/day; será o snap do dnd", defaultVal: "15" },
  { name: "dayRange", type: "[number, number] — recorte de horas da grade week/day (ex: [8, 18])", defaultVal: "[0, 24]" },
  { name: "scrollToHour", type: "number — hora em que a grade week/day abre rolada", defaultVal: "8" },
  { name: "nowIndicator", type: "boolean — linha do “agora” em week/day", defaultVal: "true" },
  { name: "emptyState", type: "ReactNode — só a view list tem (mês vazio é grade vazia legítima)", defaultVal: "—" },
  { name: "searchable", type: "boolean", defaultVal: "true" },
  { name: "search", type: "string (controlado)", defaultVal: "—" },
  { name: "onSearchChange", type: "(search: string) => void", defaultVal: "—" },
  { name: "filterFields", type: "SchedulerFilterField[]", defaultVal: "—" },
  { name: "filterModel", type: "Record<string, string[]> (controlado / pré-aplicado)", defaultVal: "—" },
  { name: "onFilterModelChange", type: "(model) => void", defaultVal: "—" },
  { name: "filterMode", type: '"client" | "server"', defaultVal: '"client"' },
  { name: "toolbarActions", type: "ReactNode — área custom, entre o filtro e o seletor de view", defaultVal: "—" },
  { name: "defaultFilterPanelOpen", type: "boolean — o painel-coluna de filtro já vem aberto", defaultVal: "false" },
  { name: "primaryAction", type: "ReactNode — botão primário à direita", defaultVal: "—" },
  { name: "title", type: "ReactNode — override do título do período", defaultVal: "derivado" },
  { name: "renderEvent", type: "({ event, view, selected }) => ReactNode", defaultVal: "—" },
];

const REF_PROPS = [
  { name: "goToDate", type: "(date: Date) => void — move a âncora sem trocar de view", defaultVal: "—" },
  { name: "goToToday", type: "() => void", defaultVal: "—" },
  { name: "next / prev", type: "() => void — anda 1 período (mês, semana, ou dia em day/list)", defaultVal: "—" },
  { name: "getVisibleRange", type: "() => { start, end } — o que a view mostra AGORA", defaultVal: "—" },
];

const EVENT_PROPS = [
  { name: "id", type: "string", defaultVal: "—" },
  { name: "title", type: "ReactNode", defaultVal: "—" },
  { name: "start", type: "Date", defaultVal: "—" },
  { name: "end", type: "Date — OBRIGATÓRIO (duração 0 = end === start)", defaultVal: "—" },
  { name: "allDay", type: "boolean", defaultVal: "false" },
  { name: "color", type: '"brand" | "info" | "success" | "warning" | "danger" | "neutral"', defaultVal: '"brand"' },
  { name: "categoryId", type: "string — filtrável", defaultVal: "—" },
  { name: "tagIds", type: "string[] — filtrável", defaultVal: "—" },
  { name: "description", type: "ReactNode — aparece na view list", defaultVal: "—" },
  { name: "searchText", type: "string — necessário quando title não é string", defaultVal: "—" },
  { name: "meta", type: "unknown — payload cru, devolvido em onEventClick", defaultVal: "—" },
];

/* ────────────────────────────────────────────────────────────────────────
 * Página
 * ──────────────────────────────────────────────────────────────────────── */

type EventMeta = { local: string; responsavel: string };

export function SchedulerDoc() {
  const [selected, setSelected] = useState<SchedulerEvent | null>(null);

  /** Exemplo "já vem filtrado": model pré-aplicado, controlado pela página. */
  const [filtroPreAplicado, setFiltroPreAplicado] = useState<SchedulerFilterModel>(
    { categoryId: ["cliente"] },
  );

  /** Exemplo do modo controlado — período e view vivem AQUI, não no componente. */
  const [dataControlada, setDataControlada] = useState<Date>(() => new Date());
  const [viewControlada, setViewControlada] = useState<SchedulerView>("month");

  const meta = (selected?.meta ?? null) as EventMeta | null;

  const detailFields = useMemo(() => {
    if (!selected) return [];
    const sameDay =
      selected.start.toDateString() === selected.end.toDateString();
    const quando = selected.allDay
      ? `${format(selected.start, "d MMM", { locale: ptBR })} — ${format(selected.end, "d MMM yyyy", { locale: ptBR })}`
      : sameDay
        ? `${format(selected.start, "d MMM yyyy, HH:mm", { locale: ptBR })} – ${format(selected.end, "HH:mm", { locale: ptBR })}`
        : `${format(selected.start, "d MMM, HH:mm", { locale: ptBR })} → ${format(selected.end, "d MMM, HH:mm", { locale: ptBR })}`;

    return [
      { icone: CalendarDays, label: "Quando", valor: <span className="tabular-nums">{quando}</span> },
      { icone: Clock, label: "Duração", valor: selected.allDay ? "Dia inteiro" : `${Math.round((selected.end.getTime() - selected.start.getTime()) / 60000)} min` },
      { icone: MapPin, label: "Local", valor: meta?.local ?? "—" },
      {
        icone: Tag,
        label: "Tags",
        valor: (
          <span className="flex flex-wrap items-center gap-gp-sm">
            {(selected.tagIds ?? []).map((t) => (
              <Chip key={t} color="neutral" variant="soft" size="sm">
                {t}
              </Chip>
            ))}
          </span>
        ),
      },
      {
        icone: Users,
        label: "Responsável",
        valor: (
          <span className="flex items-center gap-gp-md">
            <Avatar size="sm" colorHex="#2563EB" aria-label={meta?.responsavel ?? ""}>
              {(meta?.responsavel ?? "?")
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </Avatar>
            <span>{meta?.responsavel ?? "—"}</span>
          </span>
        ),
      },
    ];
  }, [selected, meta]);

  return (
    <DocLayout toc={TOC} wide>
      <DocHeader
        category="Data Display"
        title="Scheduler"
        description="Calendário de eventos com 4 modos de visualização (mês · semana · dia · lista), busca, filtros declarativos por categoria/tag/cor e detalhe por callback. Não confundir com Calendar, que é o seletor de data de formulário — aqui o assunto são eventos ao longo do tempo."
        dependency="date-fns"
      />

      <DocSeparator />

      <SectionH2 id="preview" title="Preview — view de mês" />
      <ExampleSection
        id="preview-month"
        title="Grade do mês, navegação, busca e filtros"
        description="Não-controlado: o componente guarda período e view. Clique num evento pra abrir o painel de detalhe; passe o mouse numa célula pra revelar o + de criar. O dia com 4 eventos mostra o “+N mais” num popover com a agenda completa do dia."
        plain
      >
        <div className="h-[720px]">
          <Scheduler
            events={EVENTS}
            locale={ptBR}
            weekStartsOn={0}
            filterFields={FILTER_FIELDS}
            onEventClick={(event) => setSelected(event)}
            onSlotClick={(start) =>
              // No app real isto abre o form de criação; aqui só demonstra
              // que o callback chega com a data certa.
              window.alert(
                `onSlotClick → ${format(start, "PPP", { locale: ptBR })}`,
              )
            }
            defaultFilterPanelOpen
            primaryAction={
              <Button variant="filled" size="sm" iconLeft={<Plus />}>
                Novo evento
              </Button>
            }
          />
        </div>
      </ExampleSection>

      <SectionH2 id="semana" title="View semana" />
      <ExampleSection
        id="view-semana"
        title="Grade de horas com banda de dia inteiro"
        description="Ancorada na semana do offsite de propósito, pra a banda “Dia inteiro” aparecer. Ela só renderiza quando HÁ evento all-day na janela — uma faixa vazia permanente roubaria altura da grade sem informar nada. Cada faixa de hora é um <button>, não um <div onClick>: é alcançável por teclado e anunciada como acionável. O rótulo da hora fica deslocado meia-linha pra cima porque ele marca a LINHA, não a faixa — centralizado, você leria a hora errada."
      >
        <div className="h-[560px]">
          <Scheduler
            events={EVENTS}
            locale={ptBR}
            defaultView="week"
            defaultDate={SEMANA_DO_OFFSITE}
            searchable={false}
            onEventClick={(event) => setSelected(event)}
          />
        </div>
      </ExampleSection>

      <SectionH2 id="dia" title="View dia" />
      <ExampleSection
        id="view-dia"
        title="A MESMA view da semana, com 1 coluna"
        description="week e day rodam o mesmo arquivo (views/time-grid.tsx). O gutter de horas, o lane-packing de sobreposição, a linha do “agora” e o alvo de clique por faixa são idênticos — o que muda é quantas colunas o map produz. Dois arquivos duplicariam cinco mecanismos pra ganhar zero. Aqui o dayRange é [7, 20]: a grade não renderiza madrugada, e o scrollToHour abre já nas 8h."
      >
        <div className="h-[560px]">
          <Scheduler
            events={EVENTS}
            locale={ptBR}
            defaultView="day"
            defaultDate={DIA_CHEIO}
            dayRange={[7, 20]}
            searchable={false}
            onEventClick={(event) => setSelected(event)}
          />
        </div>
      </ExampleSection>

      <SectionH2 id="lista" title="View lista (agenda)" />
      <ExampleSection
        id="view-lista"
        title="Só os dias que têm evento"
        description="A grade do mês mostra os 42 dias porque ali a grade É a informação — um dia vazio diz “nada marcado nesta terça”. Numa agenda, não: rolar por 22 blocos vazios pra achar 8 eventos é o oposto do que ela serve, e o salto entre datas já diz que não há nada no meio. Evento multi-dia entra em CADA dia que ocupa (quem abre no dia 10 espera ver o offsite que começou no 8), dia inteiro vem antes dos cronometrados, e marco (start === end) mostra um horário só em vez de “14:00 – 14:00”, que leria como erro de dado. O cabeçalho do dia é sticky."
      >
        <div className="h-[560px]">
          <Scheduler
            events={EVENTS}
            locale={ptBR}
            defaultView="list"
            searchable={false}
            onEventClick={(event) => setSelected(event)}
          />
        </div>
      </ExampleSection>

      <SectionH2 id="detalhe" title="Painel de detalhe — padrão dsgreen-paneldetail-2" />
      <ExampleSection
        id="detalhe-panel"
        title="O Scheduler não conhece FloatingPanel"
        description="O componente só emite onEventClick(event, evt) e devolve event.meta intacto — o payload cru do domínio. Quem monta o painel é a tela, no padrão do bloco dsgreen-paneldetail-2 (side right, size lg, titleSlot com o contexto, lista plana de propriedades). É o que mantém o detalhe adaptável ao domínio de quem consome sem arrastar FloatingPanel pras deps do item de registry. Todos os exemplos desta página compartilham o mesmo painel — clicar num evento de qualquer grade acima o abre."
      >
        <p className="text-body-sm text-fg-muted">
          Clique em qualquer evento — de qualquer uma das grades desta página.
        </p>
      </ExampleSection>

      <SectionH2 id="filtros" title="Busca e filtros" />
      <ExampleSection
        id="filtros-preaplicado"
        title="filterModel pré-aplicado + painel-coluna"
        description="Este exemplo abre JÁ FILTRADO por Cliente, via filterModel — é o caminho certo pra “a tela já vem filtrada” (L-051: nunca monte um form de filtro acima da grade; passe o model e o chip aparece aplicado, com o × pra desfazer). O botão Filtro abre uma COLUNA à direita, não um overlay: marcar uma caixa e ver a grade reagir acontece no mesmo gesto, sem fechar nada. Verde no botão = ferramenta engajada (painel aberto ou filtro aplicado); o ponto = existe filtro. AND entre campos, OR dentro do campo. Abaixo de 1024px a coluna não cabe e o botão fica desabilitado explicando por quê."
      >
        <div className="h-[560px]">
          <Scheduler
            events={EVENTS}
            locale={ptBR}
            filterFields={FILTER_FIELDS}
            filterModel={filtroPreAplicado}
            onFilterModelChange={setFiltroPreAplicado}
            toolbarActions={
              <Button variant="outline" color="secondary" size="sm">
                Ação custom
              </Button>
            }
            onEventClick={(event) => setSelected(event)}
          />
        </div>
      </ExampleSection>

      <SectionH2 id="controlado" title="Modo controlado" />
      <ExampleSection
        id="controlado-externo"
        title="Período e view dirigidos de fora"
        description="Passar date + onDateChange (e view + onViewChange) transfere o estado pro consumidor — mesma gramática do viewMode do DataTable. Passar date SEM onDateChange é erro de uso: a navegação não anda, e o componente emite console.warn em DEV dizendo exatamente isso, porque o sintoma é indistinguível de um bug do componente. Há também um ref imperativo (goToDate, goToToday, next, prev, getVisibleRange) — o getVisibleRange existe pro filterMode=&quot;server&quot;, que precisa saber qual intervalo buscar sem duplicar a regra de alinhamento de semana."
      >
        <div className="flex flex-col gap-gp-xl">
          <div className="flex flex-wrap items-center gap-gp-md">
            <span className="text-body-sm text-fg-muted">
              Controlado de fora:
            </span>
            <Button
              variant="outline"
              color="secondary"
              size="sm"
              onClick={() => setDataControlada(startOfMonth(new Date()))}
            >
              Ir pro início do mês
            </Button>
            <Button
              variant="outline"
              color="secondary"
              size="sm"
              onClick={() => setViewControlada("week")}
            >
              Forçar semana
            </Button>
            <Button
              variant="outline"
              color="secondary"
              size="sm"
              onClick={() => setViewControlada("month")}
            >
              Forçar mês
            </Button>
            <span className="text-caption-sm tabular-nums text-fg-subtle">
              view = {viewControlada} · date ={" "}
              {format(dataControlada, "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>

          <div className="h-[480px]">
            <Scheduler
              events={EVENTS}
              locale={ptBR}
              date={dataControlada}
              onDateChange={setDataControlada}
              view={viewControlada}
              onViewChange={setViewControlada}
              searchable={false}
              onEventClick={(event) => setSelected(event)}
            />
          </div>
        </div>
      </ExampleSection>

      <SectionH2 id="tela-cheia" title="Tela cheia" />
      <ExampleSection
        id="tela-cheia-nota"
        title="Não existe prop de fullscreen — a altura do pai é que manda"
        description="O componente já é h-full. Pra usar como página inteira, dê h-screen ao container e deixe o Scheduler em flex-1. E isso não é só esticar: o corte do “+N mais” da célula do mês é derivado da altura MEDIDA da linha, como as linhas da tabela. Medido no browser com o mesmo dataset — viewport 800px dá linha de 76px e 2 pills por célula; viewport 1400px dá linha de 176px e 6 pills. Pra travar num número fixo, a view de mês aceita maxPerCell, mas o default adaptativo é o que aproveita a tela."
      >
        <p className="text-body-sm text-fg-muted">
          Exemplo dedicado no menu:{" "}
          <strong>Example: Scheduler tela cheia</strong> (
          <code className="text-code-sm">#/scheduler-full</code>).
        </p>
      </ExampleSection>

      <SectionH2 id="falta" title="O que ainda não está pronto" />
      <ExampleSection
        id="falta-wip"
        title="Drag & drop e navegação por teclado"
        description="onEventMove e onEventResize existem na API e ainda NÃO são chamadas — draggable e resizable nascem false justamente por isso: dnd ligado sem handler conectado deixa o usuário arrastar e ver o evento voltar sozinho, que lê como bug do app. O núcleo puro que o dnd vai consumir (snapToGrid e resolveResize em hooks/layout.ts) já está implementado e coberto por 36 testes de borda, incluindo os clamps que impedem start > end. Distribuição também falta: o componente ainda não está no registry.json, então o consumidor não o recebe via igreen:add — fecha no /ds-release, junto com date-fns declarado como dependência do item."
      >
        <p className="text-body-sm text-fg-muted">
          A navegação por <strong>Tab</strong> funciona; o que falta é o roving
          tabindex pra andar pela grade com as setas.
        </p>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={SCHEDULER_PROPS} />

      <SectionH2 id="api-event" title="SchedulerEvent" />
      <PropsTable items={EVENT_PROPS} />

      <SectionH2 id="api-ref" title="SchedulerRef (imperativo)" />
      <PropsTable items={REF_PROPS} />

      {/* ── Painel de detalhe (padrão dsgreen-paneldetail-2) ────────── */}
      <FloatingPanel
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        side="right"
        size="lg"
        resizable
        maximizable
        resizableStorageKey="scheduler-doc.detail.width"
        titleSlot={
          <div className="flex min-w-0 items-center gap-gp-sm text-body-sm text-fg-muted">
            <span className="truncate">Agenda</span>
            <span className="opacity-50">/</span>
            <span className="truncate font-medium text-fg-default">
              {selected
                ? format(selected.start, "d 'de' MMMM", { locale: ptBR })
                : ""}
            </span>
          </div>
        }
        headerActions={
          <>
            <Button variant="soft" color="secondary" size="icon-sm" aria-label="Editar evento">
              <Pencil />
            </Button>
            <Button variant="soft" color="secondary" size="icon-sm" aria-label="Copiar link">
              <Link2 />
            </Button>
          </>
        }
        footer={
          <>
            <Button
              variant="outline"
              color="secondary"
              size="sm"
              onClick={() => setSelected(null)}
            >
              Fechar
            </Button>
            <Button variant="filled" size="sm">
              Abrir evento
            </Button>
          </>
        }
      >
        {/* Wrapper de gap OBRIGATÓRIO: o body do FloatingPanel não tem gap
            entre filhos (só padding) — sem ele o título cola na lista. É a
            mesma armadilha documentada no bloco dsgreen-paneldetail-2. */}
        <div className="flex flex-col gap-gp-2xl">
          <h2 className="text-title-lg text-balance text-fg-default">
            {selected?.title}
          </h2>

          <div className="grid grid-cols-[132px_1fr] items-center gap-x-gp-md">
            {detailFields.map((f) => (
              <div key={f.label} className="contents">
                <div className="flex min-h-form-md items-center gap-gp-md text-body-sm text-fg-muted">
                  <f.icone
                    className="size-icon-sm shrink-0 text-fg-subtle"
                    aria-hidden="true"
                  />
                  <span className="truncate">{f.label}</span>
                </div>
                <div className="flex min-h-form-md min-w-0 items-center text-body-sm text-fg-default">
                  {f.valor}
                </div>
              </div>
            ))}
          </div>

          {selected?.description ? (
            <div className="flex flex-col gap-gp-md rounded-radius-lg border border-border-default bg-bg-surface p-pad-2xl">
              <span className="text-body-xs font-semibold text-fg-muted">
                Descrição
              </span>
              <p className="text-body-sm text-fg-default">
                {selected.description}
              </p>
            </div>
          ) : null}
        </div>
      </FloatingPanel>
    </DocLayout>
  );
}
