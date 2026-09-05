import { useMemo, useState } from "react";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Gantt } from "@/components/ui/Gantt";
import type {
  GanttColumn,
  GanttLink,
  GanttRow,
} from "@/components/ui/Gantt";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { DocLayout } from "../components/doc-layout";
import { SectionH2 } from "../components/doc-section";
import { ExampleSection } from "../components/doc-example";
import { PropsTable } from "../components/doc-props-table";

/**
 * Doc page do `Gantt`.
 *
 * Os dados exercitam TUDO de propósito — hierarquia de 3 níveis, `summary` sem
 * barra própria, marco, os 4 tipos de vínculo, `lag`, um conflito real e uma
 * linha-contêiner com 5 barras. Exemplo que só mostra o caso fácil não revela
 * que o componente aguenta o difícil.
 */

const TOC = [
  { id: "visao", label: "O que é" },
  { id: "cronograma", label: "Cronograma com vínculos" },
  { id: "portfolio", label: "Timeline de portfólio" },
  { id: "conflito", label: "Conflito e caminho crítico" },
  { id: "api", label: "API" },
  { id: "decisoes", label: "Decisões" },
];

const d = (dia: number, mes = 9) => new Date(2026, mes - 1, dia);

/* ── projeto: hierarquia + vínculos ─────────────────────────────── */

const PROJETO: GanttRow[] = [
  {
    id: "descoberta",
    label: "Descoberta",
    type: "summary",
    bars: [],
    trailing: (
      <Chip size="sm" variant="soft" color="success">
        Concluída
      </Chip>
    ),
  },
  {
    id: "entrevistas",
    label: "Entrevistas com operação",
    sublabel: "5 sessões",
    parent: "descoberta",
    bars: [
      {
        id: "b-entrevistas",
        label: "Entrevistas",
        start: d(1),
        end: d(5),
        colorKey: "chart-1",
        progress: 100,
      },
    ],
  },
  {
    id: "escopo",
    label: "Escopo e estimativa",
    parent: "descoberta",
    bars: [
      {
        id: "b-escopo",
        label: "Escopo",
        start: d(5),
        end: d(9),
        colorKey: "chart-1",
        progress: 100,
      },
    ],
  },
  {
    id: "aprovado",
    label: "Escopo aprovado",
    type: "milestone",
    parent: "descoberta",
    bars: [{ id: "b-aprovado", start: d(9), end: d(9), colorKey: "brand" }],
  },

  {
    id: "design",
    label: "Design",
    type: "summary",
    bars: [],
    trailing: (
      <Chip size="sm" variant="soft" color="warning">
        Em andamento
      </Chip>
    ),
  },
  {
    id: "fluxos",
    label: "Fluxos e IA",
    parent: "design",
    bars: [
      {
        id: "b-fluxos",
        label: "Fluxos",
        start: d(10),
        end: d(16),
        colorKey: "chart-5",
        progress: 80,
      },
    ],
  },
  {
    id: "ui",
    label: "Telas de alta fidelidade",
    parent: "design",
    bars: [
      {
        id: "b-ui",
        label: "Telas",
        start: d(14),
        end: d(24),
        colorKey: "chart-5",
        progress: 35,
      },
    ],
  },
  {
    id: "revisao",
    label: "Revisão com o time",
    parent: "design",
    bars: [
      {
        id: "b-revisao",
        label: "Revisão",
        start: d(23),
        end: d(25),
        colorKey: "chart-5",
        progress: 0,
      },
    ],
  },

  {
    id: "build",
    label: "Construção",
    type: "summary",
    bars: [],
    trailing: (
      <Chip size="sm" variant="soft" color="neutral">
        Planejada
      </Chip>
    ),
  },
  {
    id: "api",
    label: "API de cronograma",
    parent: "build",
    bars: [
      { id: "b-api", label: "API", start: d(25), end: d(2, 10), colorKey: "chart-3" },
    ],
  },
  {
    id: "front",
    label: "Front do painel",
    parent: "build",
    bars: [
      { id: "b-front", label: "Front", start: d(29), end: d(9, 10), colorKey: "chart-3" },
    ],
  },
  {
    id: "qa",
    label: "QA e ajustes",
    parent: "build",
    bars: [
      { id: "b-qa", label: "QA", start: d(8, 10), end: d(14, 10), colorKey: "chart-4" },
    ],
  },
  {
    id: "entrega",
    label: "Entrega",
    type: "milestone",
    bars: [{ id: "b-entrega", start: d(15, 10), end: d(15, 10), colorKey: "danger" }],
  },
];

const VINCULOS: GanttLink[] = [
  { id: "v1", source: "b-entrevistas", target: "b-escopo", type: "FS" },
  { id: "v2", source: "b-escopo", target: "b-aprovado", type: "FS" },
  { id: "v3", source: "b-aprovado", target: "b-fluxos", type: "FS" },
  // SS: as telas arrancam junto com os fluxos, com 4 dias de espera.
  { id: "v4", source: "b-fluxos", target: "b-ui", type: "SS", lag: 4 },
  // FF: a revisão tem que terminar junto com as telas.
  { id: "v5", source: "b-ui", target: "b-revisao", type: "FF", lag: 1 },
  { id: "v6", source: "b-revisao", target: "b-api", type: "FS" },
  { id: "v7", source: "b-api", target: "b-front", type: "SS", lag: 4 },
  { id: "v8", source: "b-front", target: "b-qa", type: "FS", lag: -1 },
  { id: "v9", source: "b-qa", target: "b-entrega", type: "FS" },
];

/* ── portfólio: linha-contêiner com N barras ────────────────────── */

const PORTFOLIO: GanttRow[] = [
  {
    id: "s23",
    label: "Sprint 23",
    sublabel: "Sustentação",
    lanePacking: "compact",
    bars: [
      { id: "p1", label: "Bugs P1", start: d(1), end: d(5), colorKey: "chart-4" },
      { id: "p2", label: "Débito técnico", start: d(6), end: d(12), colorKey: "chart-2" },
    ],
  },
  {
    id: "s24",
    label: "Sprint 24",
    sublabel: "5 frentes",
    lanePacking: "stack",
    bars: [
      { id: "t1", label: "API de tarefas", start: d(8), end: d(15), colorKey: "chart-1" },
      { id: "t2", label: "Board Kanban", start: d(10), end: d(20), colorKey: "chart-2" },
      { id: "t3", label: "Tabela inline", start: d(14), end: d(22), colorKey: "chart-3" },
      { id: "t4", label: "Métricas de SLA", start: d(18), end: d(30), colorKey: "chart-4" },
      { id: "t5", label: "Migração", start: d(1), end: d(9), colorKey: "chart-5" },
    ],
  },
  {
    id: "s25",
    label: "Sprint 25",
    sublabel: "Planejada",
    lanePacking: "compact",
    bars: [
      { id: "q1", label: "Relatórios", start: d(22), end: d(5, 10), colorKey: "chart-1" },
    ],
  },
];

/* ── conflito: o alvo começa antes do permitido ─────────────────── */

const CONFLITO: GanttRow[] = [
  {
    id: "c-a",
    label: "Homologação",
    bars: [
      { id: "cb-a", label: "Homologação", start: d(1), end: d(12), colorKey: "chart-1", progress: 60 },
    ],
  },
  {
    id: "c-b",
    label: "Publicação",
    sublabel: "começa antes do permitido",
    bars: [
      { id: "cb-b", label: "Publicação", start: d(8), end: d(14), colorKey: "chart-3" },
    ],
  },
  {
    id: "c-c",
    label: "Comunicado ao cliente",
    bars: [
      { id: "cb-c", label: "Comunicado", start: d(15), end: d(17), colorKey: "chart-2" },
    ],
  },
];

const CONFLITO_LINKS: GanttLink[] = [
  { id: "cv1", source: "cb-a", target: "cb-b", type: "FS" },
  { id: "cv2", source: "cb-b", target: "cb-c", type: "FS" },
];

/* ── colunas com progresso ──────────────────────────────────────── */

/**
 * Três colunas e não quatro.
 *
 * Medido na própria doc page: com `label + início + duração + %` numa coluna de
 * 691px, a coluna do NOME ficava com 127px e truncava em "Entrevist…". O nome é
 * a informação principal da grade — as outras colunas cedem espaço a ele, não o
 * contrário.
 *
 * O `%` também saiu: o preenchimento da barra JÁ comunica progresso, e repetir
 * o número numa coluna gasta 52px pra dizer o que o olho já leu. Ele volta no
 * exemplo de colunas custom, onde é o assunto.
 */
const COLUNAS: GanttColumn[] = [
  { id: "label", header: "Tarefa" },
  { id: "start", header: "Início", width: 78 },
];

const PROPS = [
  { name: "rows", type: "GanttRow[] — { id, label, type?, parent?, bars[], lanePacking?, trailing? }", defaultVal: "—" },
  { name: "links", type: "GanttLink[] — { source, target, type?, lag? }. Ausente = sem setas", defaultVal: "—" },
  {
    name: "view",
    type: '"timeline" | "calendar" | "list" — a `list` é AGENDA por dia, não tabela de tarefas',
    defaultVal: '"timeline"',
  },
  { name: "windowStart / windowEnd", type: "Date — janela visível, do CONSUMIDOR. Omitidos, derivam dos dados", defaultVal: "derivada" },
  { name: "granularity", type: '"day" | "week" | "month" | "quarter"', defaultVal: '"day"' },
  {
    name: "onViewChange / onGranularityChange / onCriticalPathChange",
    type: "os pares dos 3 estados de UI — passar SÓ o valor congela o controle (campo controlado); passar nada deixa o componente cuidar",
    defaultVal: "—",
  },
  { name: "columns", type: "GanttColumn[] — colunas da grade esquerda", defaultVal: "nome + início + fim" },
  { name: "gridWidth", type: "number — largura inicial da grade; o divisor é arrastável", defaultVal: "360" },
  { name: "draggable / resizable / linkable", type: "boolean — ligados sem handler, o usuário arrasta e vê voltar", defaultVal: "false" },
  { name: "criticalPath", type: "boolean — é CÁLCULO (ordenação topológica), não pintura", defaultVal: "false" },
  {
    name: "criticalPathToggle",
    type: "boolean — mostra o botão \"Crítico\" na toolbar; esconder NÃO desliga o realce",
    defaultVal: "true",
  },
  { name: "searchable", type: "boolean — liga a busca por tarefa na toolbar", defaultVal: "false" },
  {
    name: "filterFields",
    type: "GanttFilterField[] — { id, label, kind?, options?, accessor, searchable?, placeholder? }",
    defaultVal: "—",
  },
  {
    name: "filterFields[].kind",
    type: '"multi" | "single" | "text" | "number" | "date" | "boolean" — mesmo vocabulário da DataTable',
    defaultVal: '"multi"',
  },
  {
    name: "filterModel / onFilterModelChange",
    type: "Record<string, string[]> — os 6 kinds codificam o valor nesta MESMA forma",
    defaultVal: "não-controlado",
  },
  { name: "onBarClick", type: "(bar, row, evt) => void — abre o painel de detalhe, que é da TELA", defaultVal: "—" },
  { name: "onBarMove / onBarResize", type: "(change) => void — EMITE, não aplica", defaultVal: "—" },
  { name: "onLinkViolations", type: "(violations) => void — vínculos que as datas atuais violam", defaultVal: "—" },
  { name: "onGraphError", type: "({ kind: 'cycle', barIds }) => void — ciclo é resultado, não exceção", defaultVal: "—" },
  {
    name: "onDayAdd",
    type: "(date) => void — o "+" no hover da célula do calendário; SEM handler o botão não renderiza",
    defaultVal: "—",
  },
  { name: "onRowToggle", type: "(rowId, collapsed) => void", defaultVal: "—" },
  { name: "now / locale / weekStartsOn", type: "injetáveis pra teste e i18n", defaultVal: "new Date() · — · 0" },
];

const BAR_PROPS = [
  { name: "id", type: "string — é o que GanttLink referencia (barra, não linha)", defaultVal: "—" },
  { name: "start / end", type: "Date. `end` OBRIGATÓRIO — duração zero é `end === start`", defaultVal: "—" },
  { name: "colorKey", type: '"chart-1".."chart-5" | brand | success | warning | danger | info | neutral', defaultVal: '"chart-1"' },
  { name: "progress", type: "number 0–100. `undefined` ≠ 0: ausente não desenha trilha", defaultVal: "—" },
  { name: "continuesBefore / continuesAfter", type: "boolean — atravessa a janela; corta o canto daquele lado", defaultVal: "derivado" },
  { name: "searchText", type: "string — a busca só casa string, e `label` é ReactNode", defaultVal: "—" },
  { name: "meta", type: "unknown — payload cru, devolvido intacto nos callbacks", defaultVal: "—" },
];

export function GanttDoc() {
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [violacoes, setViolacoes] = useState(0);

  const agora = useMemo(() => d(17), []);

  return (
    <DocLayout toc={TOC}>
      <SectionH2 id="visao" title="Gantt" />

      <p className="mb-14 max-w-[80ch] text-body-sm leading-relaxed text-fg-muted">
        Cronograma de projeto: hierarquia de tarefas à esquerda, tempo à direita,
        e <strong className="text-fg-default">vínculos</strong> entre as barras. É
        o vínculo que distingue Gantt de timeline — sem ele o gráfico é uma lista
        de tarefas com datas; com ele é um modelo de <em>o que bloqueia o quê</em>.
        Não confundir com <code className="text-code-sm">Scheduler</code>, que
        mostra <strong className="text-fg-default">quando</strong> algo acontece
        (compromisso, reserva), nem com{" "}
        <code className="text-code-sm">Calendar</code>/
        <code className="text-code-sm">DatePicker</code>, que escolhem uma data
        num formulário.
      </p>

      <SectionH2 id="cronograma" title="Cronograma com vínculos" />

      <ExampleSection
        plain
        id="ex-cronograma"
        title="Hierarquia, marcos e os 4 tipos de vínculo"
        description="Três fases com summary derivando o intervalo dos filhos, dois marcos em losango, e vínculos FS, SS e FF com lag. A seta é ortogonal de propósito: com 40 vínculos, curvas de Bézier viram um emaranhado onde não se segue nenhuma. Clique numa barra pra ver o callback; arraste o divisor entre os painéis."
        code={`<Gantt
  rows={PROJETO}
  links={[
    { id: "v1", source: "b-entrevistas", target: "b-escopo", type: "FS" },
    { id: "v4", source: "b-fluxos", target: "b-ui", type: "SS", lag: 4 },
    { id: "v5", source: "b-ui", target: "b-revisao", type: "FF", lag: 1 },
  ]}
  columns={COLUNAS}
  searchable
  locale={ptBR}
  onBarClick={(bar, row) => abrirDetalhe(row.id)}
/>`}
      >
        <div className="flex h-[520px] w-full flex-col">
          <Gantt
            rows={PROJETO}
            links={VINCULOS}
            columns={COLUNAS}
            searchable
            locale={ptBR}
            now={agora}
            windowStart={d(1)}
            windowEnd={d(20, 10)}
            gridWidth={300}
            onBarClick={(bar, row) => setSelecionado(`${row.label} · ${bar.id}`)}
            primaryAction={
              <Button
                variant="filled"
                size="sm"
                iconLeft={<Plus />}
                aria-label="Nova tarefa"
                className="max-lg:size-form-xl max-lg:p-0"
              >
                <span className="hidden lg:inline">Nova tarefa</span>
              </Button>
            }
          />
        </div>
        {selecionado ? (
          <p className="mt-6 text-body-sm text-fg-muted">
            Último clique: <strong className="text-fg-default">{selecionado}</strong>
          </p>
        ) : null}
      </ExampleSection>

      <SectionH2 id="portfolio" title="Timeline de portfólio" />

      <ExampleSection
        plain
        id="ex-portfolio"
        title="A linha como contêiner, não como tarefa"
        description="Mesmo componente, outro formato de dado: sem `parent` e sem `links`, e com N barras por linha. `lanePacking: 'stack'` dá uma lane por barra — o arco-íris, onde o ponto é ver as 5 frentes; `compact` junta as que não se sobrepõem e devolve altura. A Sprint 24 usa stack, as outras duas usam compact."
        code={`<Gantt
  rows={[
    {
      id: "s24", label: "Sprint 24", sublabel: "5 frentes",
      lanePacking: "stack",
      bars: [
        { id: "t1", label: "API de tarefas", start: …, colorKey: "chart-1" },
        { id: "t2", label: "Board Kanban",   start: …, colorKey: "chart-2" },
      ],
    },
  ]}
/>`}
      >
        <div className="flex h-[320px] w-full flex-col">
          <Gantt
            rows={PORTFOLIO}
            locale={ptBR}
            now={agora}
            windowStart={d(1)}
            windowEnd={d(8, 10)}
            gridWidth={220}
            columns={[{ id: "label", header: "Frente" }]}
          />
        </div>
      </ExampleSection>

      <SectionH2 id="conflito" title="Conflito e caminho crítico" />

      <ExampleSection
        plain
        id="ex-conflito"
        title="O componente sinaliza. Não corrige."
        description="A Publicação começa no dia 8, mas o vínculo FS exige que ela só comece depois do dia 12. O componente marca a barra com borda tracejada, tinge a seta de perigo e emite onLinkViolations com o déficit em dias — e não move nada. Corrigir cronograma é decisão de negócio: mover a tarefa, cortar escopo, aceitar o atraso ou renegociar o vínculo são quatro respostas diferentes, e o componente não tem como escolher. Ligue o botão Crítico pra ver o caminho que determina a data final."
        code={`<Gantt
  rows={CONFLITO}
  links={[{ id: "cv1", source: "cb-a", target: "cb-b", type: "FS" }]}
  onLinkViolations={(v) => setConflitos(v.length)}
  onGraphError={({ barIds }) => avisar("ciclo em " + barIds.join(", "))}
/>`}
      >
        <div className="flex h-[260px] w-full flex-col">
          <Gantt
            rows={CONFLITO}
            links={CONFLITO_LINKS}
            locale={ptBR}
            now={agora}
            windowStart={d(1)}
            windowEnd={d(20)}
            gridWidth={260}
            onLinkViolations={(v) => setViolacoes(v.length)}
          />
        </div>
        <p className="mt-6 text-body-sm text-fg-muted">
          <code className="text-code-sm">onLinkViolations</code> reportou{" "}
          <strong className="text-fg-default">{violacoes}</strong> conflito(s).
        </p>
      </ExampleSection>

      <SectionH2 id="api" title="API — Gantt" />
      <PropsTable items={PROPS} />

      <SectionH2 id="api-bar" title="API — GanttBar" />
      <PropsTable items={BAR_PROPS} />

      <SectionH2 id="decisoes" title="Decisões" />

      <ExampleSection id="ex-decisoes" title="Por que a peça é assim">
        <div className="flex flex-col gap-gp-2xl">
          <div>
            <h4 className="mb-2 text-body-md font-semibold text-fg-default">
              A barra é tingida, não sólida com texto branco
            </h4>
            <p className="max-w-[80ch] text-body-sm leading-relaxed text-fg-muted">
              As referências mostram barra saturada com texto branco. O DS não
              faz isso, e a razão foi <strong>medida</strong> ao especificar o{" "}
              <code className="text-code-sm">Scheduler</code>: texto colorido ou
              branco sobre pílula tingida dá contraste de{" "}
              <strong>1.72–4.49 no light</strong> — nenhuma família passa AA, e{" "}
              <code className="text-code-sm">warning</code> chega a 1.72:1. A
              receita é fundo tingido, texto{" "}
              <code className="text-code-sm">fg-default</code>, e a cor viva no
              acento da borda esquerda e no preenchimento de progresso. A cor
              segue dizendo qual frente é; ela só não carrega o texto.
            </p>
          </div>

          <div>
            <h4 className="mb-2 text-body-md font-semibold text-fg-default">
              A cor diz CATEGORIA, não estado
            </h4>
            <p className="max-w-[80ch] text-body-sm leading-relaxed text-fg-muted">
              Por isso <code className="text-code-sm">colorKey</code> aceita a
              paleta de chart — azul incluído, que o{" "}
              <code className="text-code-sm">DESIGN.md</code> proíbe na interface
              e o <code className="text-code-sm">Chart/USAGE</code> permite como
              dado categórico. Estado viaja em{" "}
              <code className="text-code-sm">row.trailing</code> como{" "}
              <code className="text-code-sm">Chip</code>, que é o canal que o DS
              já usa pra status.
            </p>
          </div>

          <div>
            <h4 className="mb-2 text-body-md font-semibold text-fg-default">
              Uma altura de linha, consumida pelos dois painéis
            </h4>
            <p className="max-w-[80ch] text-body-sm leading-relaxed text-fg-muted">
              <code className="text-code-sm">GANTT_ROW_HEIGHT_PX</code> é
              constante e não classe utilitária. A grade da esquerda é fluxo, o
              canvas da direita é <code className="text-code-sm">top</code>{" "}
              absoluto; se as duas derivassem a altura de lugares diferentes,
              bastaria um <code className="text-code-sm">line-height</code>{" "}
              herdado pra desalinhar — e o desalinho cresce linha a linha.
              Desalinho entre nome e barra é o pior defeito possível aqui,
              porque produz leitura errada sem parecer quebrado.
            </p>
          </div>

          <div>
            <h4 className="mb-2 text-body-md font-semibold text-fg-default">
              As setas vivem numa camada SVG irmã, não dentro das células
            </h4>
            <p className="max-w-[80ch] text-body-sm leading-relaxed text-fg-muted">
              A seta vai de uma linha a outra e precisa desenhar fora dos limites
              da linha de origem. Filha da célula, ela seria recortada pelo{" "}
              <code className="text-code-sm">overflow</code> de qualquer
              ancestral — e desapareceria exatamente quando cruza pra outra
              linha, que é sempre. É o mesmo defeito que o{" "}
              <code className="text-code-sm">DragOverlay</code> resolveu no{" "}
              <code className="text-code-sm">Scheduler</code>: a primeira
              hipótese foi z-index e estava errada; era clipping, de 3
              ancestrais.
            </p>
          </div>

          <div>
            <h4 className="mb-2 text-body-md font-semibold text-fg-default">
              Caminho crítico só considera FS — e isso é declarado
            </h4>
            <p className="max-w-[80ch] text-body-sm leading-relaxed text-fg-muted">
              Os outros três tipos exigem tratar as duas pontas como nós
              independentes no grafo, e implementar isso pela metade daria
              caminho crítico <strong>plausível e errado</strong> — que é pior
              que não ter. <code className="text-code-sm">SS</code>,{" "}
              <code className="text-code-sm">FF</code> e{" "}
              <code className="text-code-sm">SF</code> continuam sendo validados
              como conflito; só não entram no cálculo de criticidade.
            </p>
          </div>
        </div>
      </ExampleSection>
    </DocLayout>
  );
}
