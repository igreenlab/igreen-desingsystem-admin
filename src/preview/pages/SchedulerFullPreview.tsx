import { useMemo, useState } from "react";
import { ptBR } from "date-fns/locale";
import { addDays, format, startOfDay, startOfMonth } from "date-fns";
import { CalendarDays, Clock, Link2, MapPin, Pencil, Plus, Tag, Users } from "lucide-react";
import { Scheduler } from "@/components/ui/Scheduler";
import type {
  SchedulerEvent,
  SchedulerEventColor,
  SchedulerFilterField,
} from "@/components/ui/Scheduler";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/avatar-ig";
import { FloatingPanel } from "@/components/ui/FloatingPanel";
import { ExamplePageLayout } from "../components/example-page-layout";

/**
 * Exemplo de TELA CHEIA — o `Scheduler` como página do app, não como demo
 * dentro de um card de documentação.
 *
 * É a mesma diferença que separa `KanbanDoc` de `ClientsKanbanPreview`: aqui o
 * componente recebe a altura real da janela, e é isso que muda o comportamento
 * que interessa — **a célula do mês passa a caber mais eventos**.
 *
 * O corte do "+N mais" é DERIVADO da altura medida da linha, não de uma
 * constante. Num card de 720px a linha tem ~110px e cabem ~3 pills; aqui, com a
 * janela inteira, ela passa de 150px e cabem 6 ou mais. É o mesmo componente,
 * sem prop de densidade — quem decide é o espaço disponível, exatamente como a
 * tabela faz com as linhas dela.
 *
 * O dataset é MAIOR que o da doc page de propósito: com 3 eventos por dia não
 * dá pra ver a diferença entre 720px e tela cheia. Aqui há dias com 6 e 7.
 */

/* ── Dataset ───────────────────────────────────────────────────── */

const MONTH_START = startOfMonth(new Date());
const at = (offset: number, hour: number, minute = 0) => {
  const d = addDays(MONTH_START, offset);
  d.setHours(hour, minute, 0, 0);
  return d;
};

type Modelo = {
  titulo: string;
  cor: SchedulerEventColor;
  categoria: string;
  tags: string[];
  descricao?: string;
  local: string;
  responsavel: string;
};

const MODELOS: Modelo[] = [
  { titulo: "Daily do time", cor: "info", categoria: "interna", tags: ["time"], descricao: "Progresso e bloqueios.", local: "Meet", responsavel: "Aline Castro" },
  { titulo: "Demo pro cliente", cor: "brand", categoria: "cliente", tags: ["comercial", "importante"], descricao: "Painel de consumo.", local: "Zoom", responsavel: "Sérgio Vieira" },
  { titulo: "Revisão de design", cor: "warning", categoria: "interna", tags: ["design"], descricao: "Hierarquia dos KPIs.", local: "Sala Verde", responsavel: "Marina Duarte" },
  { titulo: "Fechamento financeiro", cor: "danger", categoria: "financeiro", tags: ["importante"], descricao: "Conciliação do mês.", local: "Remoto", responsavel: "Davi Nogueira" },
  { titulo: "1:1", cor: "neutral", categoria: "interna", tags: ["time"], local: "Sala pequena", responsavel: "Sérgio Vieira" },
  { titulo: "Onboarding", cor: "info", categoria: "cliente", tags: ["comercial"], local: "Meet", responsavel: "Marina Duarte" },
  { titulo: "Visita técnica", cor: "brand", categoria: "campo", tags: ["operacao"], descricao: "Inspeção dos inversores.", local: "Usina Norte", responsavel: "Davi Nogueira" },
  { titulo: "Treinamento comercial", cor: "success", categoria: "interna", tags: ["comercial"], local: "Auditório", responsavel: "Marina Duarte" },
];

/**
 * Distribuição determinística — **sem `Math.random()`**. Um dataset aleatório
 * mudaria a cada render, e "quantos eventos cabem na célula" é justamente o que
 * esta tela existe pra mostrar: precisa ser o mesmo número duas vezes seguidas.
 */
const EVENTS: SchedulerEvent[] = (() => {
  const out: SchedulerEvent[] = [];

  for (let dia = 0; dia < 28; dia++) {
    // 0 a 7 eventos por dia, num padrão que se repete e cria dias cheios.
    const quantos = [1, 3, 0, 2, 6, 1, 0, 7, 2, 4, 0, 1, 3, 5][dia % 14];
    for (let i = 0; i < quantos; i++) {
      const m = MODELOS[(dia + i) % MODELOS.length];
      const hora = 8 + ((i * 2 + dia) % 10);
      out.push({
        id: `e-${dia}-${i}`,
        title: m.titulo,
        start: at(dia, hora, 0),
        end: at(dia, hora + 1, 30),
        color: m.cor,
        categoryId: m.categoria,
        tagIds: m.tags,
        description: m.descricao,
        meta: { local: m.local, responsavel: m.responsavel },
      });
    }
  }

  // Um multi-dia de dia inteiro, pra exercitar a banda da view de semana e o
  // truncamento das pontas na grade do mês.
  out.push({
    id: "offsite",
    title: "Offsite do time",
    start: startOfDay(addDays(MONTH_START, 8)),
    end: startOfDay(addDays(MONTH_START, 10)),
    allDay: true,
    color: "success",
    categoryId: "interna",
    tagIds: ["time"],
    description: "Três dias de planejamento fora do escritório.",
    meta: { local: "Itu / SP", responsavel: "Aline Castro" },
  });

  return out;
})();

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

const CODE = `// Tela cheia: dê altura real ao pai e deixe o Scheduler em flex-1.
// O componente já é h-full — não há prop de "fullscreen" a ligar.
<div className="flex h-screen flex-col">
  <AppHeader />
  <main className="flex min-h-0 flex-1 flex-col p-sp-2xl">
    <Scheduler
      events={eventos}
      locale={ptBR}
      filterFields={FILTER_FIELDS}
      defaultFilterPanelOpen
      onEventClick={(ev) => setSelecionado(ev)}
      onSlotClick={(inicio) => abrirFormulario(inicio)}
      primaryAction={<Button variant="filled" size="sm" iconLeft={<Plus />}>Novo evento</Button>}
    />
  </main>
</div>

// O "+N mais" da célula do mês é DERIVADO da altura medida da linha:
// container de 720px -> ~3 pills; tela cheia -> 6 ou mais.
// Pra travar num número fixo (altura de linha previsível), o month view
// aceita maxPerCell — mas o default adaptativo é o que aproveita a tela.`;

type EventMeta = { local: string; responsavel: string };

export function SchedulerFullPreview() {
  const [selected, setSelected] = useState<SchedulerEvent | null>(null);
  const meta = (selected?.meta ?? null) as EventMeta | null;

  const detailFields = useMemo(() => {
    if (!selected) return [];
    const mesmoDia = selected.start.toDateString() === selected.end.toDateString();
    const quando = selected.allDay
      ? `${format(selected.start, "d MMM", { locale: ptBR })} — ${format(selected.end, "d MMM yyyy", { locale: ptBR })}`
      : mesmoDia
        ? `${format(selected.start, "d MMM yyyy, HH:mm", { locale: ptBR })} – ${format(selected.end, "HH:mm", { locale: ptBR })}`
        : `${format(selected.start, "d MMM, HH:mm", { locale: ptBR })} → ${format(selected.end, "d MMM, HH:mm", { locale: ptBR })}`;

    return [
      { icone: CalendarDays, label: "Quando", valor: <span className="tabular-nums">{quando}</span> },
      {
        icone: Clock,
        label: "Duração",
        valor: selected.allDay
          ? "Dia inteiro"
          : `${Math.round((selected.end.getTime() - selected.start.getTime()) / 60000)} min`,
      },
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
    <ExamplePageLayout
      category="Scheduler"
      title="Tela cheia"
      description="O mesmo Scheduler ocupando a janela inteira. Não há prop de fullscreen: o componente já é h-full, e é a altura do pai que manda. O que muda de verdade é a célula do mês — o corte do “+N mais” é derivado da altura medida da linha, então aqui cabem 6+ eventos onde num card de 720px cabiam 3. Mesmo comportamento adaptativo das linhas da tabela."
      code={CODE}
    >
      <Scheduler
        events={EVENTS}
        locale={ptBR}
        weekStartsOn={0}
        filterFields={FILTER_FIELDS}
        defaultFilterPanelOpen
        onEventClick={(event) => setSelected(event)}
        onSlotClick={(start) =>
          window.alert(`onSlotClick → ${format(start, "PPP p", { locale: ptBR })}`)
        }
        primaryAction={
          <Button variant="filled" size="sm" iconLeft={<Plus />}>
            Novo evento
          </Button>
        }
      />

      <FloatingPanel
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        side="right"
        size="lg"
        resizable
        maximizable
        resizableStorageKey="scheduler-full.detail.width"
        titleSlot={
          <div className="flex min-w-0 items-center gap-gp-sm text-body-sm text-fg-muted">
            <span className="truncate">Agenda</span>
            <span className="opacity-50">/</span>
            <span className="truncate font-medium text-fg-default">
              {selected ? format(selected.start, "d 'de' MMMM", { locale: ptBR }) : ""}
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
            <Button variant="outline" color="secondary" size="sm" onClick={() => setSelected(null)}>
              Fechar
            </Button>
            <Button variant="filled" size="sm">
              Abrir evento
            </Button>
          </>
        }
      >
        {/* Wrapper de gap obrigatório — o body do FloatingPanel não tem gap
            entre filhos (armadilha documentada no dsgreen-paneldetail-2). */}
        <div className="flex flex-col gap-gp-2xl">
          <h2 className="text-title-lg text-balance text-fg-default">{selected?.title}</h2>

          <div className="grid grid-cols-[132px_1fr] items-center gap-x-gp-md">
            {detailFields.map((f) => (
              <div key={f.label} className="contents">
                <div className="flex min-h-form-md items-center gap-gp-md text-body-sm text-fg-muted">
                  <f.icone className="size-icon-sm shrink-0 text-fg-subtle" aria-hidden="true" />
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
              <span className="text-body-xs font-semibold text-fg-muted">Descrição</span>
              <p className="text-body-sm text-fg-default">{selected.description}</p>
            </div>
          ) : null}
        </div>
      </FloatingPanel>
    </ExamplePageLayout>
  );
}
