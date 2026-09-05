/**
 * Dados de exemplo do cronograma — o que você troca PRIMEIRO.
 *
 * Extraído 1:1 do showcase `GanttFullPreview` do DS (L-034): não é toy, é o
 * mesmo dado que a página de exemplo exercita — 20 linhas, 4 níveis de
 * hierarquia, 16 vínculos dos 4 tipos e 2 conflitos de prazo.
 *
 * ⚠️ **Um dos dois conflitos não foi plantado.** As datas foram escritas e o
 * componente achou (o front termina 1 dia depois de o QA começar). Ficou de
 * propósito: é o caso mais comum em cronograma real, e mostra o contador
 * somando déficits de vínculos diferentes.
 *
 * ⚠️ `hoje` é uma data FIXA (17/09/2026), não `new Date()`. O exemplo precisa
 * ser estável: com data corrente, o `now` andaria e o cronograma sairia da
 * janela em algumas semanas. Ao ligar em dado real, troque por `new Date()`.
 */

import { addDays, startOfDay } from "date-fns";
import type {
  GanttColumn,
  GanttFilterField,
  GanttLink,
  GanttRow,
} from "@/components/ui/Gantt";
import { Avatar } from "@/components/ui/avatar-ig";
import { Chip } from "@/components/ui/Chip";

export const hoje = startOfDay(new Date(2026, 8, 17));
export const d = (offset: number) => addDays(hoje, offset);

export type Meta = {
  responsavel: string;
  frente: string;
  descricao: string;
};

/** Iniciais pro avatar. O `avatar-ig` recebe iniciais como children. */
export const iniciais = (nome: string) =>
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
export const PESSOAS: Record<string, string> = {
  ana: "Ana Ribeiro",
  bruno: "Bruno Camargo",
  carla: "Carla Menezes",
  diego: "Diego Sato",
  elisa: "Elisa Nakamura",
  fabio: "Fábio Queiroz",
  gabriela: "Gabriela Prado",
  henrique: "Henrique Vilela",
};

/**
 * As cores que o drawer oferece.
 *
 * ⚠️ São as **chaves de chart** do DS, não hex. A cor da barra diz CATEGORIA
 * (qual frente), e o rótulo aqui é o nome da frente — não "verde", "roxo". Um
 * seletor de cor por nome de cor convidaria o usuário a usar cor como STATUS,
 * que é exatamente a assumption que a spec declara e que status em
 * `row.trailing` resolve.
 */
export const CORES_DISPONIVEIS = [
  { value: "chart-1", label: "Produto" },
  { value: "chart-5", label: "Design" },
  { value: "chart-3", label: "Engenharia" },
  { value: "chart-4", label: "QA" },
  { value: "chart-2", label: "Integração" },
] as const;

export const ROWS_SEMENTE: GanttRow[] = [
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

export const LINKS_SEMENTE: GanttLink[] = [
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
export const duracaoEmDias = (row: GanttRow): number | undefined => {
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
export const FILTROS: GanttFilterField[] = [
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

export const COLUNAS: GanttColumn[] = [
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
