import type { OnboardingPerson } from "../painel/painel-mock";

/* ── Drill-down da Saúde da rede ─────────────────────────────────────────── */

export type DrillRow = {
  id: string;
  initials: string;
  name: string;
  sub: string;
  value?: string;
};

export type DrillData = {
  title: string;
  description?: string;
  rows: DrillRow[];
  emptyHint?: string;
};

export const healthDrill: Record<string, DrillData> = {
  "lic-green": {
    title: "Licenciados Green",
    description: "1 de 24 na meta de ativação",
    rows: [
      {
        id: "1",
        initials: "MS",
        name: "Maria Iracilda Silva",
        sub: "Campina Grande/PB · Green",
        value: "ativo",
      },
    ],
    emptyHint: "Nenhum licenciado Green ativo ainda.",
  },
  "diretos-pro": {
    title: "Diretos PRO (mês)",
    description: "diretos que viraram PRO este mês",
    rows: [],
    emptyHint: "Nenhum direto virou PRO este mês.",
  },
  "rede-total": {
    title: "Rede total",
    description: "156 descendentes (142 ativos · 14 inativos)",
    rows: [
      {
        id: "1",
        initials: "EF",
        name: "Emerson Moraes D Faria",
        sub: "Uberlândia/MG · Licenciado",
        value: "ativo",
      },
      {
        id: "2",
        initials: "MS",
        name: "Maria Iracilda Silva",
        sub: "Campina Grande/PB · Green",
        value: "ativo",
      },
      {
        id: "3",
        initials: "JM",
        name: "Joao Mendes Rodrigues",
        sub: "Uberlândia/MG · Licenciado",
        value: "ativo",
      },
      {
        id: "4",
        initials: "AC",
        name: "Ana Clara Souza",
        sub: "Goiânia/GO · Licenciado",
        value: "inativo",
      },
      {
        id: "5",
        initials: "BR",
        name: "Bruno Ramos",
        sub: "Belo Horizonte/MG · Licenciado",
        value: "inativo",
      },
    ],
  },
  "seg-energia": {
    title: "Clientes · Energia",
    description: "447 clientes ativos",
    rows: [
      {
        id: "1",
        initials: "RC",
        name: "Residência Carvalho",
        sub: "São Paulo/SP",
        value: "1.2 MWh",
      },
      {
        id: "2",
        initials: "PM",
        name: "Padaria Monte Alto",
        sub: "Campinas/SP",
        value: "0.8 MWh",
      },
      {
        id: "3",
        initials: "CF",
        name: "Clínica Faria",
        sub: "Uberlândia/MG",
        value: "0.6 MWh",
      },
    ],
  },
  "seg-telecom": {
    title: "Clientes · Telecom",
    description: "865 linhas ativas",
    rows: [
      {
        id: "1",
        initials: "JS",
        name: "João Santos",
        sub: "Recife/PE",
        value: "2 linhas",
      },
      {
        id: "2",
        initials: "LP",
        name: "Lúcia Pereira",
        sub: "Natal/RN",
        value: "1 linha",
      },
    ],
  },
  "seg-seguros": {
    title: "Clientes · Seguros",
    description: "0 apólices ativas",
    rows: [],
    emptyHint: "Nenhuma apólice ativa neste segmento.",
  },
  licencas: {
    title: "Licenças a vencer",
    description: "vencendo ou vencidas nos próximos 60 dias",
    rows: [],
    emptyHint: "Nenhuma licença vencendo nos próximos 60 dias.",
  },
  quedas: {
    title: "Quedas de ranking",
    description: "licenciados que caíram de graduação este mês",
    rows: [],
    emptyHint: "Nenhuma queda de ranking este mês.",
  },
  novos: {
    title: "Novos cadastros hoje",
    description: "entraram na rede hoje",
    rows: [
      {
        id: "1",
        initials: "TL",
        name: "Tiago Lima",
        sub: "Sorocaba/SP · Licenciado",
        value: "novo",
      },
      {
        id: "2",
        initials: "BV",
        name: "Bianca Vargas",
        sub: "Londrina/PR · Cliente",
        value: "novo",
      },
      {
        id: "3",
        initials: "RM",
        name: "Renato Maia",
        sub: "Niterói/RJ · Licenciado",
        value: "novo",
      },
    ],
  },
  saidas: {
    title: "Saídas no mês",
    description: "licenciados que cancelaram este mês",
    rows: [
      {
        id: "1",
        initials: "GO",
        name: "Gabriel Oliveira",
        sub: "Salvador/BA · Licenciado",
        value: "cancelado",
      },
      {
        id: "2",
        initials: "PT",
        name: "Patrícia Teixeira",
        sub: "Fortaleza/CE · Licenciado",
        value: "cancelado",
      },
    ],
  },
};

/** Total de licenciados vinculados à rede do líder (descendentes). */
export const licenciadosNaRede = 156;

/** Novos cadastros entrando na rede hoje. */
export const novosHoje = 3;

/** Licenciados que saíram da rede neste mês (cancelamentos/churn). */
export const saidasMes = 2;

/** Novos licenciados que entraram na rede neste mês. */
export const novosMes = 18;

/**
 * Evolução da rede — aba "Evolução": total acumulado de licenciados por mês.
 * Clicar numa barra seleciona o mês de referência (atualiza total + ganho).
 * `total` = acumulado no fim do mês · `entradas`/`saidas` = movimento do mês.
 */
export const redeEvolucaoMeses = [
  {
    mes: "Jan",
    nome: "Janeiro",
    total: 106,
    entradas: 14,
    saidas: 3,
    ganho: 11,
  },
  {
    mes: "Fev",
    nome: "Fevereiro",
    total: 112,
    entradas: 10,
    saidas: 4,
    ganho: 6,
  },
  { mes: "Mar", nome: "Março", total: 125, entradas: 16, saidas: 3, ganho: 13 },
  { mes: "Abr", nome: "Abril", total: 133, entradas: 13, saidas: 5, ganho: 8 },
  { mes: "Mai", nome: "Maio", total: 147, entradas: 17, saidas: 3, ganho: 14 },
  { mes: "Jun", nome: "Junho", total: 156, entradas: 11, saidas: 2, ganho: 9 },
  { mes: "Jul", nome: "Julho", total: 168, entradas: 15, saidas: 3, ganho: 12 },
  { mes: "Ago", nome: "Agosto", total: 173, entradas: 9, saidas: 4, ganho: 5 },
  {
    mes: "Set",
    nome: "Setembro",
    total: 185,
    entradas: 15,
    saidas: 3,
    ganho: 12,
  },
  {
    mes: "Out",
    nome: "Outubro",
    total: 198,
    entradas: 17,
    saidas: 4,
    ganho: 13,
  },
  {
    mes: "Nov",
    nome: "Novembro",
    total: 213,
    entradas: 18,
    saidas: 3,
    ganho: 15,
  },
  {
    mes: "Dez",
    nome: "Dezembro",
    total: 226,
    entradas: 16,
    saidas: 3,
    ganho: 13,
  },
];

/** Índice do mês corrente (Junho) — seleção default da aba Evolução. */
export const mesAtualIndex = 5;

/**
 * Aba "Performance" — taxa de ativação da rede (% ativos) por mês.
 * Mesma estrutura visual (headline + gráfico + 2 legendas), altura igual.
 */
export const redePerformance = {
  taxaAtual: 91,
  deltaPts: 4,
  ativos: 142,
  inativos: 14,
  serie: [
    { mes: "Jan", taxa: 82 },
    { mes: "Fev", taxa: 84 },
    { mes: "Mar", taxa: 85 },
    { mes: "Abr", taxa: 88 },
    { mes: "Mai", taxa: 87 },
    { mes: "Jun", taxa: 91 },
    { mes: "Jul", taxa: 90 },
    { mes: "Ago", taxa: 92 },
    { mes: "Set", taxa: 93 },
    { mes: "Out", taxa: 92 },
    { mes: "Nov", taxa: 94 },
    { mes: "Dez", taxa: 95 },
  ],
};

/* ── Reconhecimento — ranking de expansão ────────────────────────────────── */

export type RankMove = "up" | "down" | "same";
export type RankRow = {
  id: string;
  initials: string;
  name: string;
  cidade: string;
  /** Valor da aba: novos no mês OU total adquirido (tudo). */
  value: number;
  move: RankMove;
  /** Posições ganhas/perdidas (só no mês). */
  delta?: number;
  /** Aniversariante do dia — destaca com ícone de bolo. */
  aniversariante?: boolean;
};

/** Ranking do mês — novos clientes + movimento vs mês anterior. */
export const rankingMes: RankRow[] = [
  {
    id: "joaomr",
    initials: "JM",
    name: "Joao Mendes Rodrigues",
    cidade: "Uberlândia/MG",
    value: 8,
    move: "up",
    delta: 2,
  },
  {
    id: "maria",
    initials: "MS",
    name: "Maria Iracilda Silva",
    cidade: "Campina Grande/PB",
    value: 6,
    move: "up",
    delta: 1,
    aniversariante: true,
  },
  {
    id: "pedro",
    initials: "PA",
    name: "Pedro Alves",
    cidade: "Curitiba/PR",
    value: 5,
    move: "same",
  },
  {
    id: "ana",
    initials: "AC",
    name: "Ana Clara Souza",
    cidade: "Goiânia/GO",
    value: 4,
    move: "down",
    delta: 1,
  },
  {
    id: "carla",
    initials: "CN",
    name: "Carla Nunes",
    cidade: "Manaus/AM",
    value: 3,
    move: "up",
    delta: 3,
  },
  {
    id: "rafael",
    initials: "RS",
    name: "Rafael Souza",
    cidade: "Fortaleza/CE",
    value: 2,
    move: "down",
    delta: 2,
  },
  {
    id: "bruno",
    initials: "BR",
    name: "Bruno Ramos",
    cidade: "Belo Horizonte/MG",
    value: 2,
    move: "up",
    delta: 1,
  },
  {
    id: "lucia",
    initials: "LP",
    name: "Lúcia Pereira",
    cidade: "Natal/RN",
    value: 2,
    move: "same",
  },
  {
    id: "tiago",
    initials: "TL",
    name: "Tiago Lima",
    cidade: "Sorocaba/SP",
    value: 1,
    move: "down",
    delta: 1,
  },
  {
    id: "bianca",
    initials: "BV",
    name: "Bianca Vargas",
    cidade: "Londrina/PR",
    value: 1,
    move: "up",
    delta: 4,
  },
];

/** Ranking de todos os tempos — total de clientes adquiridos (sem movimento). */
export const rankingTudo: RankRow[] = [
  {
    id: "joaomr",
    initials: "JM",
    name: "Joao Mendes Rodrigues",
    cidade: "Uberlândia/MG",
    value: 142,
    move: "same",
  },
  {
    id: "maria",
    initials: "MS",
    name: "Maria Iracilda Silva",
    cidade: "Campina Grande/PB",
    value: 98,
    move: "same",
  },
  {
    id: "ana",
    initials: "AC",
    name: "Ana Clara Souza",
    cidade: "Goiânia/GO",
    value: 76,
    move: "same",
  },
  {
    id: "pedro",
    initials: "PA",
    name: "Pedro Alves",
    cidade: "Curitiba/PR",
    value: 64,
    move: "same",
  },
  {
    id: "carla",
    initials: "CN",
    name: "Carla Nunes",
    cidade: "Manaus/AM",
    value: 51,
    move: "same",
  },
  {
    id: "rafael",
    initials: "RS",
    name: "Rafael Souza",
    cidade: "Fortaleza/CE",
    value: 39,
    move: "same",
  },
  {
    id: "bruno",
    initials: "BR",
    name: "Bruno Ramos",
    cidade: "Belo Horizonte/MG",
    value: 32,
    move: "same",
  },
  {
    id: "lucia",
    initials: "LP",
    name: "Lúcia Pereira",
    cidade: "Natal/RN",
    value: 28,
    move: "same",
  },
  {
    id: "tiago",
    initials: "TL",
    name: "Tiago Lima",
    cidade: "Sorocaba/SP",
    value: 21,
    move: "same",
  },
  {
    id: "bianca",
    initials: "BV",
    name: "Bianca Vargas",
    cidade: "Londrina/PR",
    value: 15,
    move: "same",
  },
];

/* ── Construção PRO — funil de progressão ────────────────────────────────── */

export const proFunnel = {
  totalPro: 8,
  redeTotal: 26,
  stages: [
    {
      id: "construcao",
      label: "Em construção",
      value: 18,
      tone: "warning" as const,
    },
    { id: "3pro", label: "3 PRO", value: 5, tone: "brand" as const },
    { id: "6pro", label: "6 PRO", value: 2, tone: "brand" as const },
    { id: "9pro", label: "9 PRO", value: 1, tone: "brand" as const },
    { id: "12pro", label: "12 PRO", value: 0, tone: "brand" as const },
  ],
};

/* ── Onboarding (lista rica pra demonstrar escala) ───────────────────────── */

/**
 * Gera as 4 etapas. `done` = nº de etapas concluídas; `partialNext` = progresso
 * parcial da PRÓXIMA etapa (a primeira não concluída), pra demonstrar status
 * "em progresso" (ex.: 2/5 → o 2 fica verde). Concluída = total/total.
 */
function steps(done: number, partialNext = 0): OnboardingPerson["steps"] {
  const base = [
    { label: "Conectou o 1º cliente", total: 1, reward: "R$ 100" },
    { label: "Recrutou 2 licenciados", total: 2, reward: "R$ 600" },
    { label: "Virou Licenciado Green", total: 5, reward: "1000 pontos" },
    { label: "Ajudou 2 a virarem Green", total: 2, reward: "2000 pontos" },
  ];
  return base.map((s, i) => {
    const isDone = i < done;
    const current = isDone ? s.total : i === done ? partialNext : 0;
    return {
      label: s.label,
      reward: s.reward,
      done: isDone,
      // só mostra fração quando a etapa tem mais de 1 unidade
      progress: s.total > 1 ? `${current}/${s.total}` : undefined,
    };
  });
}

export const onboardingV3: OnboardingPerson[] = [
  {
    id: "emerson",
    initials: "EF",
    name: "Emerson Moraes D Faria",
    tipo: "Direto",
    cidade: "Uberlândia/MG",
    linha: "Você",
    diasNaRede: 8,
    etapasDone: 2,
    etapasTotal: 4,
    comissaoAcumulada: 700,
    topUp: 1000,
    steps: steps(2, 3),
  },
  {
    id: "maria",
    initials: "MS",
    name: "Maria Iracilda Silva",
    tipo: "Direto",
    cidade: "Campina Grande/PB",
    linha: "Você",
    diasNaRede: 21,
    etapasDone: 0,
    etapasTotal: 4,
    comissaoAcumulada: 0,
    topUp: 1000,
    steps: steps(0),
  },
  {
    id: "pedro",
    initials: "PA",
    name: "Pedro Alves",
    tipo: "Direto",
    cidade: "Curitiba/PR",
    linha: "Você",
    diasNaRede: 16,
    etapasDone: 1,
    etapasTotal: 4,
    comissaoAcumulada: 100,
    topUp: 1000,
    steps: steps(1, 1),
  },
  {
    id: "juliana",
    initials: "JC",
    name: "Juliana Castro",
    tipo: "Direto",
    cidade: "Salvador/BA",
    linha: "Você",
    diasNaRede: 34,
    etapasDone: 3,
    etapasTotal: 4,
    comissaoAcumulada: 1700,
    topUp: 1000,
    steps: steps(3, 1),
  },
  {
    id: "rafael",
    initials: "RS",
    name: "Rafael Souza",
    tipo: "Indireto",
    cidade: "Fortaleza/CE",
    linha: "João Silva",
    diasNaRede: 3,
    etapasDone: 0,
    etapasTotal: 4,
    comissaoAcumulada: 0,
    topUp: 1000,
    steps: steps(0),
  },
  {
    id: "carla",
    initials: "CN",
    name: "Carla Nunes",
    tipo: "Indireto",
    cidade: "Manaus/AM",
    linha: "Maria Silva",
    diasNaRede: 12,
    etapasDone: 1,
    etapasTotal: 4,
    comissaoAcumulada: 100,
    topUp: 1000,
    steps: steps(1, 1),
  },
  {
    id: "lucas",
    initials: "LM",
    name: "Lucas Martins",
    tipo: "Direto",
    cidade: "Porto Alegre/RS",
    linha: "Você",
    diasNaRede: 40,
    etapasDone: 4,
    etapasTotal: 4,
    comissaoAcumulada: 2700,
    topUp: 1000,
    steps: steps(4),
  },
];

/* ── Status derivado das etapas ──────────────────────────────────────────── */

export type OnbStatusId = "nao-iniciado" | "em-andamento" | "concluido";
export type OnbStatus = {
  id: OnbStatusId;
  label: string;
  chip: "neutral" | "warning" | "success";
};

export function statusOf(p: OnboardingPerson): OnbStatus {
  if (p.etapasDone <= 0)
    return { id: "nao-iniciado", label: "Não iniciado", chip: "neutral" };
  if (p.etapasDone >= p.etapasTotal)
    return { id: "concluido", label: "Concluído", chip: "success" };
  return { id: "em-andamento", label: "Em andamento", chip: "warning" };
}

/* ── Campanha + agregados ────────────────────────────────────────────────── */

export const campaign = {
  nome: "Missão Pré-Sênior",
  janelaDias: 45,
  terminaEmDias: 12,
  totalRecompensas: 14200,
};

/** Total de missões (etapas) ainda pendentes na rede em onboarding. */
export const pendingMissions = onboardingV3.reduce(
  (sum, p) => sum + (p.etapasTotal - p.etapasDone),
  0,
);

/** Quantos concluíram todas as etapas. */
export const concluiramCount = onboardingV3.filter(
  (p) => p.etapasDone >= p.etapasTotal,
).length;

/** Progresso médio (% de etapas concluídas na rede). */
export const progressoMedio = Math.round(
  (onboardingV3.reduce((s, p) => s + p.etapasDone / p.etapasTotal, 0) /
    onboardingV3.length) *
    100,
);

/** Comissão total acumulada na linha de onboarding. */
export const comissaoTotal = onboardingV3.reduce(
  (s, p) => s + p.comissaoAcumulada,
  0,
);
