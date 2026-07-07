/* ═══════════════════════════════════════════════════════════════════
   Mock da Visão da Rede — consultores em árvore (downline aninhada).
   Consumido pelo DataList (layout hierarchical) da tela RedeVisaoPage.
   ═══════════════════════════════════════════════════════════════════ */

export type Graduacao =
  | "Executivo Green"
  | "Líder Green"
  | "Consultor"
  | "Licenciado";

export type ProEtapa = { label: string; done: boolean };

export type RedeConsultor = {
  id: string;
  nome: string;
  graduacao: Graduacao;
  tipo: "Direto" | "Indireto";
  cidade: string;
  codigo: string;
  gp: number;
  gi: number;
  bonificavel: number;
  qualificavel: number;
  clientes: number;
  licGreen: { atual: number; meta: number };
  volume: number;
  previaBonus: number;
  proximaGrad: string;
  proConstrucao: ProEtapa[];
  trajetoria: string[];
  nivel: number;
  aniversario: string;
  validade: string;
  children?: RedeConsultor[];
};

/** Formata kWh em pt-BR (ex.: 332260 → "332.260 kWh"). */
export const kwh = (n: number) => `${n.toLocaleString("pt-BR")} kWh`;
/** Inteiro pt-BR (ex.: 1312 → "1.312"). */
export const num = (n: number) => n.toLocaleString("pt-BR");
/** Moeda BRL. */
export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const PRO_PADRAO: ProEtapa[] = [
  { label: "Clientes do mês (green/telecom/seguro) (0/5)", done: false },
  { label: "Conexão livre (0/1)", done: false },
  { label: "Placa (0/1)", done: false },
  { label: "Solar (0/1)", done: false },
  { label: "Licenciados cadastrados (0/2)", done: false },
  { label: "Club (0/1)", done: false },
];

const TRAJETORIA = [
  "mai/26",
  "fev/26",
  "nov/25",
  "out/25",
  "set/25",
  "jul/25",
  "abr/25",
  "mar/25",
];

/** Downline do Joao (indiretos). */
const downlineJoao: RedeConsultor[] = [
  {
    id: "ana-paula",
    nome: "Ana Paula Ferreira",
    graduacao: "Líder Green",
    tipo: "Indireto",
    cidade: "Uberlândia/MG",
    codigo: "20114",
    gp: 42_300,
    gi: 18_900,
    bonificavel: 61_200,
    qualificavel: 58_400,
    clientes: 64,
    licGreen: { atual: 1, meta: 12 },
    volume: 61_200,
    previaBonus: 4_180,
    proximaGrad: "Líder Green",
    proConstrucao: [
      { label: "Clientes do mês (green/telecom/seguro) (3/5)", done: false },
      { label: "Conexão livre (1/1)", done: true },
      { label: "Placa (0/1)", done: false },
      { label: "Solar (1/1)", done: true },
      { label: "Licenciados cadastrados (1/2)", done: false },
      { label: "Club (0/1)", done: false },
    ],
    trajetoria: ["mai/26", "abr/26", "fev/26", "dez/25", "out/25"],
    nivel: 1,
    aniversario: "03/07/1990",
    validade: "12/09/2025",
    children: [
      {
        id: "carlos-souza",
        nome: "Carlos Souza",
        graduacao: "Consultor",
        tipo: "Indireto",
        cidade: "Araguari/MG",
        codigo: "30521",
        gp: 6_400,
        gi: 0,
        bonificavel: 6_400,
        qualificavel: 6_400,
        clientes: 8,
        licGreen: { atual: 0, meta: 0 },
        volume: 6_400,
        previaBonus: 420,
        proximaGrad: "Consultor",
        proConstrucao: PRO_PADRAO,
        trajetoria: ["mai/26", "mar/26"],
        nivel: 2,
        aniversario: "21/02/1995",
        validade: "01/03/2026",
      },
    ],
  },
  {
    id: "bruno-ramos",
    nome: "Bruno Ramos",
    graduacao: "Consultor",
    tipo: "Indireto",
    cidade: "Belo Horizonte/MG",
    codigo: "28190",
    gp: 12_800,
    gi: 0,
    bonificavel: 12_800,
    qualificavel: 12_800,
    clientes: 19,
    licGreen: { atual: 0, meta: 0 },
    volume: 12_800,
    previaBonus: 860,
    proximaGrad: "Consultor",
    proConstrucao: PRO_PADRAO,
    trajetoria: ["mai/26", "abr/26", "fev/26"],
    nivel: 1,
    aniversario: "09/05/1988",
    validade: "30/11/2025",
  },
];

/** Raiz da rede do líder. */
export const rede: RedeConsultor[] = [
  {
    id: "joao",
    nome: "Joao Mendes Rodrigues",
    graduacao: "Executivo Green",
    tipo: "Direto",
    cidade: "Uberlândia/MG",
    codigo: "2",
    gp: 146_693,
    gi: 185_567,
    bonificavel: 341_091,
    qualificavel: 304_413,
    clientes: 368,
    licGreen: { atual: 1, meta: 24 },
    volume: 332_260,
    previaBonus: 22_928,
    proximaGrad: "Executivo Green",
    proConstrucao: PRO_PADRAO,
    trajetoria: TRAJETORIA,
    nivel: 0,
    aniversario: "14/11/1986",
    validade: "30/01/2025",
    children: downlineJoao,
  },
  {
    id: "guilherme",
    nome: "Guilherme De Souza Silva",
    graduacao: "Licenciado",
    tipo: "Direto",
    cidade: "Mirassol/SP",
    codigo: "41435",
    gp: 1_110,
    gi: 0,
    bonificavel: 1_110,
    qualificavel: 1_110,
    clientes: 1,
    licGreen: { atual: 0, meta: 0 },
    volume: 1_110,
    previaBonus: 74,
    proximaGrad: "Consultor",
    proConstrucao: PRO_PADRAO,
    trajetoria: ["mai/26"],
    nivel: 0,
    aniversario: "17/08/1992",
    validade: "22/04/2026",
  },
  {
    id: "maria",
    nome: "Maria Iracilda Silva",
    graduacao: "Licenciado",
    tipo: "Direto",
    cidade: "Campina Grande/PB",
    codigo: "147198",
    gp: 400,
    gi: 0,
    bonificavel: 400,
    qualificavel: 400,
    clientes: 0,
    licGreen: { atual: 0, meta: 0 },
    volume: 400,
    previaBonus: 0,
    proximaGrad: "Consultor",
    proConstrucao: PRO_PADRAO,
    trajetoria: ["mai/26"],
    nivel: 0,
    aniversario: "02/12/1991",
    validade: "15/06/2026",
  },
  {
    id: "douglas",
    nome: "Douglas Diego de Carvalho",
    graduacao: "Licenciado",
    tipo: "Direto",
    cidade: "Uberlândia/MG",
    codigo: "97438",
    gp: 210,
    gi: 0,
    bonificavel: 210,
    qualificavel: 210,
    clientes: 1,
    licGreen: { atual: 0, meta: 0 },
    volume: 210,
    previaBonus: 0,
    proximaGrad: "Consultor",
    proConstrucao: PRO_PADRAO,
    trajetoria: ["mai/26"],
    nivel: 0,
    aniversario: "28/03/1994",
    validade: "08/10/2025",
  },
  {
    id: "caio",
    nome: "Caio Cesar Mateus Gomes",
    graduacao: "Licenciado",
    tipo: "Direto",
    cidade: "Uberlândia/MG",
    codigo: "88145",
    gp: 0,
    gi: 0,
    bonificavel: 0,
    qualificavel: 0,
    clientes: 0,
    licGreen: { atual: 0, meta: 0 },
    volume: 0,
    previaBonus: 0,
    proximaGrad: "Consultor",
    proConstrucao: PRO_PADRAO,
    trajetoria: [],
    nivel: 0,
    aniversario: "11/06/1996",
    validade: "19/02/2026",
  },
  {
    id: "joseph",
    nome: "Joseph Nascimento",
    graduacao: "Licenciado",
    tipo: "Indireto",
    cidade: "—",
    codigo: "116574",
    gp: 0,
    gi: 0,
    bonificavel: 0,
    qualificavel: 0,
    clientes: 0,
    licGreen: { atual: 0, meta: 0 },
    volume: 0,
    previaBonus: 0,
    proximaGrad: "Consultor",
    proConstrucao: PRO_PADRAO,
    trajetoria: [],
    nivel: 0,
    aniversario: "—",
    validade: "—",
  },
];

/** Index plano por id — lookup do drawer de detalhe. */
export const redeById: Record<string, RedeConsultor> = (() => {
  const map: Record<string, RedeConsultor> = {};
  const walk = (nodes: RedeConsultor[]) => {
    nodes.forEach((n) => {
      map[n.id] = n;
      if (n.children) walk(n.children);
    });
  };
  walk(rede);
  return map;
})();

export const GRADUACOES: Graduacao[] = [
  "Executivo Green",
  "Líder Green",
  "Consultor",
  "Licenciado",
];

/** Cor do Chip por graduação. */
export const gradColor: Record<
  Graduacao,
  "primary" | "info" | "success" | "warning" | "neutral"
> = {
  "Executivo Green": "success",
  "Líder Green": "info",
  Consultor: "warning",
  Licenciado: "neutral",
};

/** Total de consultores na rede (raízes + descendentes). */
export function countNetwork(nodes: RedeConsultor[] = rede): number {
  return nodes.reduce(
    (acc, n) => acc + 1 + (n.children ? countNetwork(n.children) : 0),
    0,
  );
}

/** Agrega a subárvore (descendentes) de um consultor. */
function aggregate(c: RedeConsultor): {
  consultores: number;
  clientes: number;
} {
  return (c.children ?? []).reduce(
    (acc, ch) => {
      const sub = aggregate(ch);
      return {
        consultores: acc.consultores + 1 + sub.consultores,
        clientes: acc.clientes + ch.clientes + sub.clientes,
      };
    },
    { consultores: 0, clientes: 0 },
  );
}

/** Rótulo do agregado da subárvore (qtd de descendentes). */
export function subtreeLabel(c: RedeConsultor): string {
  const a = aggregate(c);
  if (a.consultores === 0) return "sem downline";
  return `${num(a.consultores)} na rede`;
}

/* ── Flat + árvore (pro DataTable tree-data + lista hierárquica) ────── */

/** Todos os nós, achatados (rows do DataTable). */
export const redeFlat: RedeConsultor[] = (() => {
  const out: RedeConsultor[] = [];
  const walk = (nodes: RedeConsultor[]) =>
    nodes.forEach((n) => {
      out.push(n);
      if (n.children) walk(n.children);
    });
  walk(rede);
  return out;
})();

/** id → id do pai (null nas raízes). */
const parentOf: Record<string, string | null> = (() => {
  const m: Record<string, string | null> = {};
  const walk = (nodes: RedeConsultor[], parent: string | null) =>
    nodes.forEach((n) => {
      m[n.id] = parent;
      if (n.children) walk(n.children, n.id);
    });
  walk(rede, null);
  return m;
})();

/** Caminho raiz→self (tree-data do DataTable + getPath da lista). */
export function getTreeDataPath(row: RedeConsultor): string[] {
  const path: string[] = [];
  let id: string | null = row.id;
  const guard = new Set<string>();
  while (id && !guard.has(id)) {
    guard.add(id);
    path.unshift(id);
    id = parentOf[id] ?? null;
  }
  return path;
}

/** Filhos diretos de um nó. */
export function childrenOf(id: string): RedeConsultor[] {
  return redeById[id]?.children ?? [];
}

/** Total de nós da rede. */
export const totalRede = redeFlat.length;
