import { useMemo, useRef, useState } from "react";
import { ptBR } from "date-fns/locale";
import { addDays, format, startOfDay } from "date-fns";
import { Plus } from "lucide-react";
import { Gantt } from "@/components/ui/Gantt";
import type {
  GanttBarChange,
  GanttColumn,
  GanttFilterField,
  GanttLink,
  GanttLinkViolation,
  GanttRef,
  GanttRow,
} from "@/components/ui/Gantt";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/avatar-ig";
import { FloatingPanel } from "@/components/ui/FloatingPanel";

/**
 * `Gantt` em tela cheia — o exemplo que valida o componente a fundo.
 *
 * A doc page mostra o componente em ~430px de coluna, onde ele rola
 * horizontalmente e as setas mal caben. Aqui ele recebe a largura toda, que é
 * como um cronograma é usado de verdade: 20 linhas, 4 níveis de hierarquia, 16
 * vínculos dos 4 tipos, 2 conflitos de prazo, filtros por frente e por
 * responsável, e o painel de detalhe abrindo no clique.
 *
 * ## O gesto é exercitado de verdade aqui
 *
 * `draggable`/`resizable`/`linkable` ligados **com handlers que aplicam**: as
 * linhas e os vínculos são estado da tela. Arrastar move a barra e ela FICA;
 * arrastar de uma porta pra outra barra cria o vínculo; clicar numa seta a
 * remove. O componente só emite — e é isso que esta tela prova.
 *
 * ⚠️ O par mais interessante de olhar é conflito + caminho crítico: mover uma
 * barra faz o contador de conflito e o realce de crítico recalcularem no mesmo
 * gesto, porque os dois saem do grafo e não de estado guardado.
 *
 * ⚠️ Um dos dois conflitos eu não plantei — escrevi as datas e o componente
 * achou (front termina 1 dia depois de o QA começar). Ficou, porque é o caso
 * mais comum em cronograma real e mostra o contador somando déficits de
 * vínculos diferentes.
 *
 * É o mesmo papel que o `SchedulerFullPreview` cumpre pro `Scheduler` — e foi
 * ele que revelou que a célula do mês precisava adaptar o corte à altura medida.
 *
 * ⚠️ `criticalPathToggle={false}` com `criticalPath` ligado: nesta tela o
 * caminho crítico é decisão DA TELA, sempre visível, então o botão da toolbar
 * só ocuparia espaço oferecendo desligar algo que a tela quer ligado. As duas
 * props são independentes — esconder o controle não desliga o realce.
 */

const hoje = startOfDay(new Date(2026, 8, 17));
const d = (offset: number) => addDays(hoje, offset);

type Meta = {
  responsavel: string;
  frente: string;
  descricao: string;
};

/** Iniciais pro avatar. O `avatar-ig` recebe iniciais como children. */
const iniciais = (nome: string) =>
  nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

/**
 * Oito pessoas, e o número importa: o painel de filtro liga a busca a partir de
 * **7 opções**. Com 4 o campo não aparecia — e é justamente no grupo de
 * responsável que procurar por nome ganha da varredura visual.
 *
 * Não usei `searchable: true` no campo pra forçar: deixar o limiar natural
 * disparar é o que prova que ele funciona.
 */
const PESSOAS: Record<string, string> = {
  ana: "Ana Ribeiro",
  bruno: "Bruno Camargo",
  carla: "Carla Menezes",
  diego: "Diego Sato",
  elisa: "Elisa Nakamura",
  fabio: "Fábio Queiroz",
  gabriela: "Gabriela Prado",
  henrique: "Henrique Vilela",
};

const ROWS_SEMENTE: GanttRow[] = [
  /* ── Fase 1 ──────────────────────────────────────────────────── */
  {
    id: "f1",
    label: "1. Descoberta e escopo",
    type: "summary",
    bars: [],
    trailing: <Chip size="sm" variant="soft" color="success">Concluída</Chip>,
  },
  {
    id: "f1-a",
    label: "Entrevistas com a operação",
    sublabel: "5 sessões · Ana",
    parent: "f1",
    bars: [{ id: "b1", label: "Entrevistas", start: d(-16), end: d(-11), colorKey: "chart-1", progress: 100, meta: { responsavel: "ana", frente: "produto", descricao: "Levantamento com o time de atendimento e a supervisão." } satisfies Meta }],
  },
  {
    id: "f1-b",
    label: "Mapa de processos",
    sublabel: "Bruno",
    parent: "f1",
    bars: [{ id: "b2", label: "Mapa", start: d(-13), end: d(-8), colorKey: "chart-1", progress: 100, meta: { responsavel: "bruno", frente: "produto", descricao: "Fluxo atual documentado, com os 4 pontos de retrabalho." } satisfies Meta }],
  },
  {
    id: "f1-c",
    label: "Escopo e estimativa",
    sublabel: "Ana",
    parent: "f1",
    bars: [{ id: "b3", label: "Escopo", start: d(-8), end: d(-4), colorKey: "chart-1", progress: 100, meta: { responsavel: "ana", frente: "produto", descricao: "Três fases, 22 entregas, marco de aprovação." } satisfies Meta }],
  },
  {
    id: "f1-m",
    label: "Escopo aprovado",
    type: "milestone",
    parent: "f1",
    bars: [{ id: "m1", start: d(-4), end: d(-4), colorKey: "brand", meta: { responsavel: "ana", frente: "produto", descricao: "Aprovado em comitê." } satisfies Meta }],
  },

  /* ── Fase 2 ──────────────────────────────────────────────────── */
  {
    id: "f2",
    label: "2. Design",
    type: "summary",
    bars: [],
    trailing: <Chip size="sm" variant="soft" color="warning">Em andamento</Chip>,
  },
  {
    id: "f2-a",
    label: "Fluxos e arquitetura de informação",
    sublabel: "Carla",
    parent: "f2",
    bars: [{ id: "b4", label: "Fluxos e IA", start: d(-3), end: d(3), colorKey: "chart-5", progress: 100, meta: { responsavel: "carla", frente: "design", descricao: "12 fluxos, incluindo os 3 de exceção." } satisfies Meta }],
  },
  {
    id: "f2-b",
    label: "Sistema de design",
    type: "summary",
    parent: "f2",
    bars: [],
  },
  {
    id: "f2-b1",
    label: "Tokens e fundações",
    sublabel: "Elisa",
    parent: "f2-b",
    bars: [{ id: "b5", label: "Tokens", start: d(1), end: d(6), colorKey: "chart-5", progress: 70, meta: { responsavel: "elisa", frente: "design", descricao: "Cor, tipografia e espaçamento em 3 tiers." } satisfies Meta }],
  },
  {
    id: "f2-b2",
    label: "Componentes de formulário",
    sublabel: "Fábio",
    parent: "f2-b",
    bars: [{ id: "b6", label: "Formulário", start: d(4), end: d(11), colorKey: "chart-5", progress: 30, meta: { responsavel: "fabio", frente: "design", descricao: "Input, select, date picker e validação." } satisfies Meta }],
  },
  {
    id: "f2-c",
    label: "Telas de alta fidelidade",
    sublabel: "Carla · Diego",
    parent: "f2",
    bars: [{ id: "b7", label: "Telas", start: d(6), end: d(17), colorKey: "chart-5", progress: 15, meta: { responsavel: "carla", frente: "design", descricao: "18 telas, 2 estados cada." } satisfies Meta }],
  },
  {
    id: "f2-d",
    label: "Revisão com o time",
    sublabel: "todos",
    parent: "f2",
    bars: [{ id: "b8", label: "Revisão", start: d(16), end: d(19), colorKey: "chart-5", progress: 0, meta: { responsavel: "ana", frente: "design", descricao: "Sessão de crítica com engenharia e operação." } satisfies Meta }],
  },

  /* ── Fase 3 ──────────────────────────────────────────────────── */
  {
    id: "f3",
    label: "3. Construção",
    type: "summary",
    bars: [],
    trailing: <Chip size="sm" variant="soft" color="neutral">Planejada</Chip>,
  },
  {
    id: "f3-a",
    label: "API de cronograma",
    sublabel: "Bruno",
    parent: "f3",
    bars: [{ id: "b9", label: "API", start: d(19), end: d(30), colorKey: "chart-3", meta: { responsavel: "bruno", frente: "engenharia", descricao: "CRUD de tarefa, vínculo e recálculo." } satisfies Meta }],
  },
  {
    id: "f3-b",
    label: "Front do painel",
    sublabel: "Diego",
    parent: "f3",
    bars: [{ id: "b10", label: "Front", start: d(23), end: d(37), colorKey: "chart-3", meta: { responsavel: "diego", frente: "engenharia", descricao: "Consome o Gantt do DS." } satisfies Meta }],
  },
  {
    id: "f3-c",
    label: "Integração com o ERP",
    sublabel: "Bruno",
    parent: "f3",
    // ⚠️ CONFLITO PLANTADO: começa antes de a API terminar, e o vínculo é FS.
    bars: [{ id: "b11", label: "Integração", start: d(26), end: d(35), colorKey: "chart-2", meta: { responsavel: "bruno", frente: "engenharia", descricao: "Começa antes do permitido — o componente sinaliza." } satisfies Meta }],
  },
  {
    id: "f3-d",
    label: "QA e correções",
    sublabel: "todos",
    parent: "f3",
    bars: [{ id: "b12", label: "QA", start: d(36), end: d(43), colorKey: "chart-4", meta: { responsavel: "gabriela", frente: "qa", descricao: "Regressão e acessibilidade." } satisfies Meta }],
  },
  {
    id: "f3-e",
    label: "Documentação",
    sublabel: "Ana",
    parent: "f3",
    bars: [{ id: "b13", label: "Docs", start: d(38), end: d(44), colorKey: "chart-1", meta: { responsavel: "ana", frente: "produto", descricao: "USAGE, doc page e vocabulário do consumidor." } satisfies Meta }],
  },

  /* ── Portfólio: a linha como contêiner ───────────────────────── */
  {
    id: "sustentacao",
    label: "Sustentação (paralelo)",
    sublabel: "3 frentes simultâneas",
    lanePacking: "stack",
    bars: [
      { id: "s1", label: "Bugs P1", start: d(-10), end: d(5), colorKey: "chart-4", meta: { responsavel: "diego", frente: "engenharia", descricao: "Fila contínua." } satisfies Meta },
      { id: "s2", label: "Débito técnico", start: d(0), end: d(20), colorKey: "chart-2", meta: { responsavel: "bruno", frente: "engenharia", descricao: "Refatoração do módulo de faturamento." } satisfies Meta },
      { id: "s3", label: "Observabilidade", start: d(12), end: d(34), colorKey: "chart-3", meta: { responsavel: "henrique", frente: "engenharia", descricao: "Métricas e alertas." } satisfies Meta },
    ],
  },

  {
    id: "entrega",
    label: "Entrega em produção",
    type: "milestone",
    bars: [{ id: "m2", start: d(45), end: d(45), colorKey: "danger", meta: { responsavel: "ana", frente: "produto", descricao: "Go-live com o piloto de 3 filiais." } satisfies Meta }],
  },
];

const LINKS_SEMENTE: GanttLink[] = [
  { id: "l1", source: "b1", target: "b2", type: "SS", lag: 3 },
  { id: "l2", source: "b2", target: "b3", type: "FS" },
  { id: "l3", source: "b3", target: "m1", type: "FS" },
  { id: "l4", source: "m1", target: "b4", type: "FS" },
  { id: "l5", source: "b4", target: "b5", type: "SS", lag: 4 },
  { id: "l6", source: "b5", target: "b6", type: "SS", lag: 3 },
  { id: "l7", source: "b6", target: "b7", type: "SS", lag: 2 },
  { id: "l8", source: "b7", target: "b8", type: "FF", lag: 2 },
  { id: "l9", source: "b8", target: "b9", type: "FS" },
  { id: "l10", source: "b9", target: "b10", type: "SS", lag: 4 },
  // Este é o conflito: a integração começa antes de a API terminar.
  { id: "l11", source: "b9", target: "b11", type: "FS" },
  /**
   * SEGUNDO conflito, e ele foi acidental — eu escrevi as datas e o componente
   * achou: o front termina em d(37) e o QA começa em d(36), 1 dia antes.
   *
   * Ficou de propósito. É o caso mais comum em cronograma real (duas frentes
   * convergindo no mesmo marco, uma delas escorregando) e é o que mostra o
   * contador somando déficit de vínculos diferentes: 4d + 1d = 5d.
   */
  { id: "l12", source: "b10", target: "b12", type: "FS" },
  { id: "l13", source: "b11", target: "b12", type: "FS", lag: 1 },
  { id: "l14", source: "b12", target: "b13", type: "SS", lag: 2 },
  { id: "l15", source: "b12", target: "m2", type: "FS", lag: 2 },
  { id: "l16", source: "b13", target: "m2", type: "FS" },
];

/** Duração em dias da primeira barra — o mesmo número da coluna "Duração". */
const duracaoEmDias = (row: GanttRow): number | undefined => {
  const b = row.bars[0];
  if (!b) return undefined;
  return Math.round((b.end.getTime() - b.start.getTime()) / 86_400_000) + 1;
};

/**
 * Os **6 tipos** de filtro, um de cada — e é de propósito.
 *
 * Até a v0.59 o `Gantt` só aceitava `multi`, então o exemplo só exercitava
 * `multi`. Um exemplo que cobre 1 de 6 caminhos não prova que os outros 5
 * funcionam: prova que existem no tipo. Aqui cada `kind` aparece com dado real,
 * e é isso que faz a tela ser gate e não vitrine.
 *
 * A ordem importa pra leitura do painel: os dois de opções primeiro (que é o
 * caso comum), depois os de valor.
 */
const FILTROS: GanttFilterField[] = [
  {
    id: "frente",
    label: "Frente",
    kind: "multi",
    options: [
      { value: "produto", label: "Produto", colorKey: "chart-1" },
      { value: "design", label: "Design", colorKey: "chart-5" },
      { value: "engenharia", label: "Engenharia", colorKey: "chart-3" },
      { value: "qa", label: "QA", colorKey: "chart-4" },
    ],
    accessor: (row) =>
      row.bars.map((b) => (b.meta as Meta | undefined)?.frente ?? "").filter(Boolean),
  },
  {
    id: "responsavel",
    label: "Responsável",
    options: Object.entries(PESSOAS).map(([value, label]) => ({ value, label })),
    accessor: (row) =>
      row.bars
        .map((b) => (b.meta as Meta | undefined)?.responsavel ?? "")
        .filter(Boolean),
  },

  /**
   * `single` — uma frente só. Radio, não checkbox.
   *
   * Convive com o `multi` de "Frente" no mesmo painel de propósito: é o par
   * que mostra que a diferença entre os dois é de CONTROLE (checkbox × radio),
   * não de dado — os dois leem o mesmo campo.
   */
  {
    id: "frenteUnica",
    label: "Frente (só uma)",
    kind: "single",
    options: [
      { value: "produto", label: "Produto", colorKey: "chart-1" },
      { value: "design", label: "Design", colorKey: "chart-5" },
      { value: "engenharia", label: "Engenharia", colorKey: "chart-3" },
      { value: "qa", label: "QA", colorKey: "chart-4" },
    ],
    accessor: (row) => (row.bars[0]?.meta as Meta | undefined)?.frente,
  },

  /** `text` — busca na descrição, que não é nenhuma das colunas visíveis. */
  {
    id: "descricao",
    label: "Descrição",
    kind: "text",
    placeholder: "Ex.: retrabalho, comitê…",
    accessor: (row) => (row.bars[0]?.meta as Meta | undefined)?.descricao,
  },

  /**
   * `number` — faixa de duração.
   *
   * O acessor devolve **número**, não string: é o caminho que o núcleo trata
   * sem conversão, e o que um consumidor real teria.
   */
  {
    id: "duracao",
    label: "Duração (dias)",
    kind: "number",
    accessor: duracaoEmDias,
  },

  /**
   * `date` — período de início.
   *
   * O acessor devolve um `Date` de verdade. É este campo que exercita o
   * `parseDiaISO`: o input emite `YYYY-MM-DD` e o dado é `Date` local, dois
   * lados que só casam porque o parser não passa pelo `new Date(iso)` (que
   * seria UTC e voltaria um dia em UTC−3).
   */
  {
    id: "inicio",
    label: "Início",
    kind: "date",
    accessor: (row) => row.bars[0]?.start,
  },

  /**
   * `boolean` — concluída ou não.
   *
   * `options` presente pra o chip dizer "Concluída"/"Em aberto" em vez do par
   * universal "Sim"/"Não" — que é o que aparece quando o consumidor omite.
   */
  {
    id: "concluida",
    label: "Concluída",
    kind: "boolean",
    options: [
      { value: "true", label: "Concluída", colorKey: "success" },
      { value: "false", label: "Em aberto", colorKey: "neutral" },
    ],
    accessor: (row) => (row.bars[0]?.progress ?? 0) >= 100,
  },
];

const COLUNAS: GanttColumn[] = [
  { id: "label", header: "Tarefa" },
  { id: "start", header: "Início", width: 82 },
  { id: "duration", header: "Duração", width: 74, align: "right" },
  {
    id: "resp",
    header: "Resp.",
    width: 56,
    align: "center",
    render: (row) => {
      const r = (row.bars[0]?.meta as Meta | undefined)?.responsavel;
      if (!r) return null;
      const nome = PESSOAS[r] ?? r;
      return (
        <Avatar size="xs" color="brand" aria-label={nome}>
          {iniciais(nome)}
        </Avatar>
      );
    },
  },
];

export function GanttFullPreview() {
  const ganttRef = useRef<GanttRef>(null);

  /**
   * ⚠️ As linhas e os vínculos são ESTADO DA TELA, e isso é o ponto do exemplo.
   *
   * O `Gantt` é dumb sobre mutação: arrastar emite `onBarMove`, e quem reescreve
   * as datas é o consumidor. Um exemplo com `rows` constante ligaria
   * `draggable` e o usuário arrastaria pra ver a barra **voltar** — que é
   * exatamente o que o JSDoc de `draggable` avisa que acontece sem handler.
   *
   * Aqui a tela aplica de verdade, e é por isso que o gesto pode ser verificado.
   */
  const [rows, setRows] = useState<GanttRow[]>(ROWS_SEMENTE);
  const [links, setLinks] = useState<GanttLink[]>(LINKS_SEMENTE);

  /** Reescreve as datas de UMA barra, preservando o resto da linha. */
  const aplicarMudanca = ({ bar, start, end }: GanttBarChange) =>
    setRows((atuais) =>
      atuais.map((r) =>
        r.bars.some((b) => b.id === bar.id)
          ? {
              ...r,
              bars: r.bars.map((b) =>
                b.id === bar.id ? { ...b, start, end } : b,
              ),
            }
          : r,
      ),
    );
  const [detalhe, setDetalhe] = useState<{
    titulo: string;
    meta: Meta;
    inicio: Date;
    fim: Date;
  } | null>(null);
  const [violacoes, setViolacoes] = useState<GanttLinkViolation[]>([]);

  const rodape = useMemo(() => {
    if (violacoes.length === 0) return null;
    const total = violacoes.reduce((s, v) => s + v.deficitDays, 0);
    return `${violacoes.length} vínculo(s) em conflito · ${total} dia(s) de déficit`;
  }, [violacoes]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-gp-xl p-pad-3xl">
      <div className="flex flex-wrap items-end justify-between gap-gp-xl">
        <div>
          <h1 className="text-heading-sm font-semibold text-fg-default">
            Implantação do portal de operação
          </h1>
          <p className="mt-1 text-body-sm text-fg-muted">
            20 linhas · 4 níveis · 16 vínculos dos 4 tipos · 2 conflitos de prazo
          </p>
        </div>
        <div className="flex items-center gap-gp-md">
          {rodape ? (
            <Chip size="md" variant="soft" color="danger">
              {rodape}
            </Chip>
          ) : null}
          <Button
            variant="outline"
            color="secondary"
            size="md"
            onClick={() => ganttRef.current?.collapseAll()}
          >
            Recolher tudo
          </Button>
          <Button
            variant="outline"
            color="secondary"
            size="md"
            onClick={() => ganttRef.current?.expandAll()}
          >
            Expandir tudo
          </Button>
        </div>
      </div>

      {/*
        `min-h-0` no wrapper é o que faz o Gantt receber a altura restante em vez
        de estourar a página. Sem isso, `h-full` num filho de flex-col resolve
        contra `auto` e o componente cresce indefinidamente.
      */}
      <div className="flex min-h-0 flex-1 flex-col">
        <Gantt
          ref={ganttRef}
          rows={rows}
          links={links}
          draggable
          resizable
          linkable
          onBarMove={aplicarMudanca}
          onBarResize={aplicarMudanca}
          onLinkCreate={(novo) =>
            setLinks((atuais) => [
              ...atuais,
              // O id é do CONSUMIDOR — o componente emite a intenção sem id
              // justamente porque não sabe como você os gera.
              { ...novo, id: `l-${novo.source}-${novo.target}-${atuais.length}` },
            ])
          }
          /*
            O "+" da célula do calendário. A tela cria a tarefa de verdade —
            sem handler o "+" nem renderiza, e um exemplo com o botão inerte
            ensinaria que ele não faz nada.
          */
          onDayAdd={(dia) =>
            setRows((atuais) => [
              ...atuais,
              {
                id: `nova-${dia.getTime()}`,
                label: `Nova tarefa ${format(dia, "dd/MM")}`,
                parent: "f3",
                bars: [
                  {
                    id: `nova-b-${dia.getTime()}`,
                    label: "Nova",
                    start: dia,
                    end: addDays(dia, 2),
                    colorKey: "chart-2",
                    meta: {
                      responsavel: "ana",
                      frente: "engenharia",
                      descricao: "Criada pelo + da grade de mês.",
                    } satisfies Meta,
                  },
                ],
              },
            ])
          }
          onLinkDelete={(alvo) =>
            setLinks((atuais) => atuais.filter((l) => l.id !== alvo.id))
          }
          columns={COLUNAS}
          filterFields={FILTROS}
          searchable
          criticalPath
          criticalPathToggle={false}
          locale={ptBR}
          now={hoje}
          gridWidth={460}
          onLinkViolations={setViolacoes}
          onGraphError={({ barIds }) =>
            window.alert(`Ciclo no grafo: ${barIds.join(", ")}`)
          }
          onBarClick={(bar, row) => {
            const meta = bar.meta as Meta | undefined;
            if (!meta) return;
            setDetalhe({
              titulo: typeof row.label === "string" ? row.label : bar.id,
              meta,
              inicio: bar.start,
              fim: bar.end,
            });
          }}
          primaryAction={
            <Button variant="filled" size="md" iconLeft={<Plus />}>
              Nova tarefa
            </Button>
          }
        />
      </div>

      {/*
        O painel de detalhe é da TELA, não do componente — o `Gantt` só emite
        `onBarClick` e devolve `bar.meta` intacto. Mesma divisão do `Scheduler`.
      */}
      <FloatingPanel
        open={detalhe !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setDetalhe(null);
        }}
        side="right"
        size="md"
        title={detalhe?.titulo ?? ""}
        description={
          detalhe
            ? `${format(detalhe.inicio, "dd/MM/yyyy", { locale: ptBR })} → ${format(detalhe.fim, "dd/MM/yyyy", { locale: ptBR })}`
            : undefined
        }
      >
        {detalhe ? (
          <div className="flex flex-col gap-gp-2xl">
            <div className="flex flex-col gap-gp-sm">
              <span className="text-caption-md font-semibold uppercase text-fg-subtle">
                Responsável
              </span>
              <div className="flex items-center gap-gp-md">
                <Avatar
                  size="sm"
                  color="brand"
                  aria-label={PESSOAS[detalhe.meta.responsavel]}
                >
                  {iniciais(PESSOAS[detalhe.meta.responsavel])}
                </Avatar>
                <span className="text-body-sm text-fg-default">
                  {PESSOAS[detalhe.meta.responsavel]}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-gp-sm">
              <span className="text-caption-md font-semibold uppercase text-fg-subtle">
                Frente
              </span>
              <span className="text-body-sm text-fg-default">
                {detalhe.meta.frente}
              </span>
            </div>

            <div className="flex flex-col gap-gp-sm">
              <span className="text-caption-md font-semibold uppercase text-fg-subtle">
                Descrição
              </span>
              <p className="text-body-sm leading-relaxed text-fg-muted">
                {detalhe.meta.descricao}
              </p>
            </div>
          </div>
        ) : null}
      </FloatingPanel>
    </div>
  );
}
