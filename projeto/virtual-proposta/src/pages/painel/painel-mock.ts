/**
 * Mock do Painel do Líder — fiel aos prints do Virtual Office atual.
 * Sem API/banco; shapes espelham o que a tela legada exibe.
 */

export type OnboardingStep = {
  label: string;
  /** Progresso textual (ex.: "0/2", "5/5"). Opcional. */
  progress?: string;
  /** Recompensa (ex.: "R$ 100", "1000 pontos"). */
  reward: string;
  done: boolean;
};

export type OnboardingPerson = {
  id: string;
  initials: string;
  name: string;
  tipo: "Direto" | "Indireto";
  cidade: string;
  /** Linha ascendente (patrocinador). */
  linha: string;
  etapasDone: number;
  etapasTotal: number;
  comissaoAcumulada: number;
  topUp: number;
  steps: OnboardingStep[];
  /** Dias desde que entrou na rede (janela de onboarding = 45 dias). */
  diasNaRede?: number;
};

export type InativoRow = {
  id: string;
  initials: string;
  name: string;
  categoria: string;
  cidade: string;
  linha: string;
  diasParado: number;
};

export const leader = {
  name: "Joao",
  initials: "J",
  graduation: "Executivo Green",
  bonusPreview: 22878,
  volumes: {
    gpBonificavel: 153047,
    qualificavel: 304313,
    giBonificavel: 188245,
  },
  kpis: {
    clientesAtivos: { total: 1312, green: 447, tel: 865, seg: 0 },
    licGreen: { atual: 1, meta: 24 },
    diretosProMes: 0,
    gpMes: "1.1k",
    giMes: "7.2k",
  },
};

/** Evolução de GP/GI nos últimos 6 meses (mock) — pro mini gráfico do header. */
export const growthSeries = [
  { mes: "Jan", gp: 0.7, gi: 4.1 },
  { mes: "Fev", gp: 0.8, gi: 5.0 },
  { mes: "Mar", gp: 0.6, gi: 4.6 },
  { mes: "Abr", gp: 0.9, gi: 5.8 },
  { mes: "Mai", gp: 1.0, gi: 6.5 },
  { mes: "Jun", gp: 1.1, gi: 7.2 },
];

export const onboarding: OnboardingPerson[] = [
  {
    id: "emerson",
    initials: "EF",
    name: "Emerson Moraes D Faria",
    tipo: "Direto",
    cidade: "Uberlândia/MG",
    linha: "Você",
    etapasDone: 0,
    etapasTotal: 4,
    comissaoAcumulada: 0,
    topUp: 1000,
    steps: [
      { label: "Conectou o 1º cliente", reward: "R$ 100", done: false },
      {
        label: "Recrutou 2 licenciados",
        progress: "0/2",
        reward: "R$ 600",
        done: false,
      },
      {
        label: "Virou Licenciado Green",
        progress: "0/5",
        reward: "1000 pontos",
        done: false,
      },
      {
        label: "Ajudou 2 a virarem Green",
        progress: "0/2",
        reward: "2000 pontos",
        done: false,
      },
    ],
  },
  {
    id: "maria",
    initials: "MS",
    name: "Maria Iracilda Silva",
    tipo: "Direto",
    cidade: "Campina Grande/PB",
    linha: "Você",
    etapasDone: 2,
    etapasTotal: 4,
    comissaoAcumulada: 7,
    topUp: 1000,
    steps: [
      { label: "Conectou o 1º cliente", reward: "R$ 100", done: true },
      {
        label: "Recrutou 2 licenciados",
        progress: "0/2",
        reward: "R$ 600",
        done: false,
      },
      {
        label: "Virou Licenciado Green",
        progress: "5/5",
        reward: "1000 pontos",
        done: true,
      },
      {
        label: "Ajudou 2 a virarem Green",
        progress: "0/2",
        reward: "2000 pontos",
        done: false,
      },
    ],
  },
];

export const proMaker = {
  totalPro: 0,
  redeTotal: 26,
  tiers: [
    {
      id: "construcao",
      label: "Em construção",
      value: 0,
      tone: "warning" as const,
    },
    { id: "3pro", label: "3 PRO", value: 0, tone: "neutral" as const },
    { id: "6pro", label: "6 PRO", value: 0, tone: "neutral" as const },
    { id: "9pro", label: "9 PRO", value: 0, tone: "neutral" as const },
    { id: "12pro", label: "12 PRO", value: 0, tone: "neutral" as const },
  ],
};

export const alerts = {
  inativos: { count: 14, hint: "+90 dias parados" },
  licencas: { count: 0, hint: "Vencendo ou vencidas (60d)" },
  quedasRanking: { count: 0, hint: "Este mês" },
};

export const recognition = {
  avancosRanking: 0,
  novosDoDia: 0,
  aniversariantes: 0,
  topExpansao: {
    mesAtual: [
      {
        id: "joaomr",
        initials: "JM",
        name: "Joao Mendes Rodrigues",
        cidade: "Uberlândia/MG",
        novos: 1,
      },
    ],
    todosOsTempos: [
      {
        id: "joaomr",
        initials: "JM",
        name: "Joao Mendes Rodrigues",
        cidade: "Uberlândia/MG",
        novos: 8,
      },
    ],
  },
};

export const events = {
  nome: "iGreen Expert 4.0",
  terminaEmDias: 12,
  /** Total de convidados (rede). */
  convidados: 34,
  /** Quantos compraram ingresso. */
  ingressosVendidos: 8,
  /** Valor arrecadado em ingressos (R$). */
  valorIngressos: 1040,
  /** Confirmaram presença (subconjunto dos com ingresso). */
  confirmados: 6,
  /** Check-ins no evento (só durante o evento). */
  checkins: 0,
  /** Convidados sem ingresso (= convidados − ingressosVendidos). */
  semIngresso: 26,
};

/** Lista mockada dos 14 inativos (drill-down do alerta). */
export const inativosList: InativoRow[] = [
  {
    id: "1",
    initials: "AC",
    name: "Ana Clara Souza",
    categoria: "Licenciado",
    cidade: "Goiânia/GO",
    linha: "Você › Maria",
    diasParado: 132,
  },
  {
    id: "2",
    initials: "BR",
    name: "Bruno Ramos",
    categoria: "Licenciado",
    cidade: "Belo Horizonte/MG",
    linha: "Você › Emerson",
    diasParado: 121,
  },
  {
    id: "3",
    initials: "CL",
    name: "Carla Lima",
    categoria: "Cliente",
    cidade: "Recife/PE",
    linha: "Você › Maria",
    diasParado: 118,
  },
  {
    id: "4",
    initials: "DF",
    name: "Diego Farias",
    categoria: "Licenciado",
    cidade: "Curitiba/PR",
    linha: "Você",
    diasParado: 110,
  },
  {
    id: "5",
    initials: "EM",
    name: "Eduarda Martins",
    categoria: "Licenciado",
    cidade: "Fortaleza/CE",
    linha: "Você › Emerson",
    diasParado: 104,
  },
  {
    id: "6",
    initials: "FN",
    name: "Felipe Nunes",
    categoria: "Cliente",
    cidade: "Salvador/BA",
    linha: "Você",
    diasParado: 99,
  },
  {
    id: "7",
    initials: "GA",
    name: "Gabriela Alves",
    categoria: "Licenciado",
    cidade: "Campinas/SP",
    linha: "Você › Maria",
    diasParado: 98,
  },
  {
    id: "8",
    initials: "HC",
    name: "Hugo Cardoso",
    categoria: "Licenciado",
    cidade: "Manaus/AM",
    linha: "Você",
    diasParado: 97,
  },
  {
    id: "9",
    initials: "IS",
    name: "Isabela Santos",
    categoria: "Cliente",
    cidade: "Porto Alegre/RS",
    linha: "Você › Emerson",
    diasParado: 95,
  },
  {
    id: "10",
    initials: "JP",
    name: "João Paulo Reis",
    categoria: "Licenciado",
    cidade: "Natal/RN",
    linha: "Você",
    diasParado: 94,
  },
  {
    id: "11",
    initials: "KO",
    name: "Karina Oliveira",
    categoria: "Licenciado",
    cidade: "Belém/PA",
    linha: "Você › Maria",
    diasParado: 93,
  },
  {
    id: "12",
    initials: "LM",
    name: "Lucas Moura",
    categoria: "Cliente",
    cidade: "Vitória/ES",
    linha: "Você",
    diasParado: 92,
  },
  {
    id: "13",
    initials: "MR",
    name: "Mariana Rocha",
    categoria: "Licenciado",
    cidade: "Florianópolis/SC",
    linha: "Você › Emerson",
    diasParado: 91,
  },
  {
    id: "14",
    initials: "NS",
    name: "Natália Silva",
    categoria: "Licenciado",
    cidade: "São Luís/MA",
    linha: "Você",
    diasParado: 90,
  },
];

/** Formata número no padrão pt-BR (sem casas decimais). */
export const fmt = (n: number) => n.toLocaleString("pt-BR");
/** Formata moeda BRL. */
export const brl = (n: number) =>
  n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
