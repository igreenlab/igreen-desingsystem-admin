import { useMemo, useState } from "react";
import { ptBR } from "date-fns/locale";
import { addDays, format, startOfDay, startOfMonth } from "date-fns";
import { CalendarDays, Clock, Link2, MapPin, Pencil, Plus, Tag, Users } from "lucide-react";
import { Scheduler } from "../../components/ui/Scheduler";
import type {
  SchedulerEvent,
  SchedulerFilterField,
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
  { id: "preview", label: "Preview" },
  { id: "detalhe", label: "Painel de detalhe" },
  { id: "filtros", label: "Busca e filtros" },
  { id: "estado", label: "Views em construção" },
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
  { name: "onEventMove", type: "(change: SchedulerEventChange) => void", defaultVal: "— (fatia futura)" },
  { name: "onEventResize", type: "(change: SchedulerEventChange) => void", defaultVal: "— (fatia futura)" },
  { name: "draggable", type: "boolean — global; event.draggable sobrepõe", defaultVal: "false" },
  { name: "resizable", type: "boolean — global; event.resizable sobrepõe", defaultVal: "false" },
  { name: "snapMinutes", type: "15 | 30 | 60", defaultVal: "15" },
  { name: "searchable", type: "boolean", defaultVal: "true" },
  { name: "search", type: "string (controlado)", defaultVal: "—" },
  { name: "onSearchChange", type: "(search: string) => void", defaultVal: "—" },
  { name: "filterFields", type: "SchedulerFilterField[]", defaultVal: "—" },
  { name: "filterModel", type: "Record<string, string[]> (controlado / pré-aplicado)", defaultVal: "—" },
  { name: "onFilterModelChange", type: "(model) => void", defaultVal: "—" },
  { name: "filterMode", type: '"client" | "server"', defaultVal: '"client"' },
  { name: "toolbarActions", type: "ReactNode — área custom da toolbar", defaultVal: "—" },
  { name: "primaryAction", type: "ReactNode — botão primário à direita", defaultVal: "—" },
  { name: "title", type: "ReactNode — override do título do período", defaultVal: "derivado" },
  { name: "renderEvent", type: "({ event, view, selected }) => ReactNode", defaultVal: "—" },
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
            toolbarActions={
              <Button variant="outline" color="secondary" size="sm">
                Exportar
              </Button>
            }
            primaryAction={
              <Button variant="filled" size="sm" iconLeft={<Plus />}>
                Novo evento
              </Button>
            }
          />
        </div>
      </ExampleSection>

      <SectionH2 id="detalhe" title="Painel de detalhe — padrão dsgreen-paneldetail-2" />
      <ExampleSection
        id="detalhe-panel"
        title="O Scheduler não conhece FloatingPanel"
        description="O componente só emite onEventClick(event, evt) e devolve event.meta intacto — o payload cru do domínio. Quem monta o painel é a tela, no padrão do bloco dsgreen-paneldetail-2 (side right, size lg, titleSlot com o contexto, lista plana de propriedades). É o que mantém o detalhe adaptável ao domínio de quem consome sem arrastar FloatingPanel pras deps do item de registry."
      >
        <p className="text-body-sm text-fg-muted">
          Clique em qualquer evento da grade acima — o painel abre à direita.
        </p>
      </ExampleSection>

      <SectionH2 id="filtros" title="Busca e filtros" />
      <ExampleSection
        id="filtros-decl"
        title="Declarativo, com área custom"
        description="filterFields declara os campos e o componente renderiza os chips E aplica o filtro (L-051: chip aplicado, nunca form solto acima da grade). AND entre campos, OR dentro do campo. No modo client o motor casa categoryId, tagIds e color; qualquer outro id renderiza chip e não filtra — e o componente avisa por console.warn em DEV. Para campo próprio, filterMode=&quot;server&quot; e o filtro fica fora. A área custom é toolbarActions (o botão Exportar acima)."
      >
        <p className="text-body-sm text-fg-muted">
          Use os chips <strong>Categoria</strong>, <strong>Tags</strong> e{" "}
          <strong>Cor</strong> na grade acima. Borda tracejada = disponível;
          sólida com fundo de marca = aplicado.
        </p>
      </ExampleSection>

      <SectionH2 id="estado" title="O que ainda não está pronto" />
      <ExampleSection
        id="estado-wip"
        title="Semana, dia, lista, drag & drop e teclado"
        description="O segmented mostra as 4 views de propósito — esconder as opções impediria descobrir que elas vão existir —, mas semana, dia e lista renderizam um aviso explícito de “em construção” em vez de uma grade vazia que pareceria defeito. Drag & drop e navegação por teclado também não entraram nesta entrega. O núcleo puro que essas views consomem (hooks/layout.ts: lane-packing, spans multi-dia, snap, resize) já está implementado e testado."
      >
        <p className="text-body-sm text-fg-muted">
          Troque pra <strong>Semana</strong>, <strong>Dia</strong> ou{" "}
          <strong>Lista</strong> na grade acima pra ver o aviso.
        </p>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={SCHEDULER_PROPS} />

      <SectionH2 id="api-event" title="SchedulerEvent" />
      <PropsTable items={EVENT_PROPS} />

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
