// Cidades (Clientes Green) — ranking de cidades por cadastros + breakdown de
// status. Tudo mockado.

export const num = (n: number) => n.toLocaleString("pt-BR");

export interface CidadeRow {
  id: string;
  rank: number; // posição no ranking (1 = mais cadastros)
  cidade: string;
  uf: string;
  total: number; // cadastros no mês
  totalAnterior: number;
  ativos: number;
  licenc: number;
  aguard: number;
  devol: number;
  cancel: number;
  reprov: number;
}

const RAW: Array<[string, string, number, number]> = [
  ["São Paulo", "SP", 142, 121],
  ["Belo Horizonte", "MG", 98, 88],
  ["Curitiba", "PR", 76, 81],
  ["Porto Alegre", "RS", 64, 52],
  ["Rio de Janeiro", "RJ", 58, 49],
  ["Recife", "PE", 47, 41],
  ["Salvador", "BA", 43, 38],
  ["Fortaleza", "CE", 39, 30],
  ["Goiânia", "GO", 34, 36],
  ["Campinas", "SP", 31, 24],
  ["Brasília", "DF", 28, 22],
  ["Florianópolis", "SC", 25, 19],
  ["Uberlândia", "MG", 21, 23],
  ["Londrina", "PR", 18, 12],
  ["Maceió", "AL", 15, 11],
  ["Posse", "GO", 2, 0],
];

export const cidades: CidadeRow[] = RAW.map(([cidade, uf, total, totalAnterior], i) => {
  const ativos = Math.round(total * 0.62);
  const licenc = Math.max(1, Math.round(total * 0.18));
  const aguard = Math.round(total * 0.1);
  const devol = Math.round(total * 0.05);
  const cancel = Math.round(total * 0.03);
  const reprov = Math.max(0, total - ativos - licenc - aguard - devol - cancel);
  return {
    id: `C-${i + 1}`,
    rank: i + 1,
    cidade,
    uf,
    total,
    totalAnterior,
    ativos,
    licenc,
    aguard,
    devol,
    cancel,
    reprov,
  };
});

export const totalCidades = cidades.length;
export const cadastrosMes = cidades.reduce((a, c) => a + c.total, 0);
export const emCrescimento = cidades.filter((c) => c.total > c.totalAnterior).length;

/* ── KPIs (design kpi/leads — valor + delta + sparkbars + nota) ───────────── */
export type KpiCard = {
  title: string;
  value: string;
  delta: string;
  down: boolean;
  note: string;
  bars: number[];
  hl: number;
};

export const kpis: KpiCard[] = [
  {
    title: "Cidades atendidas",
    value: num(totalCidades),
    delta: "+4",
    down: false,
    note: "Maior cobertura geográfica registrada no trimestre.",
    bars: [9, 11, 12, 14, 16],
    hl: 4,
  },
  {
    title: "Cadastros no mês",
    value: num(cadastrosMes),
    delta: "+12%",
    down: false,
    note: "Volume de novos cadastros nas cidades ativas.",
    bars: [38, 44, 41, 52, 61],
    hl: 4,
  },
  {
    title: "Concentração top 5",
    value: "58%",
    delta: "-3%",
    down: true,
    note: "Participação das 5 maiores cidades — desconcentrando.",
    bars: [64, 62, 61, 60, 58],
    hl: 4,
  },
];

export const PERIODOS = [
  "Janeiro de 2026",
  "Fevereiro de 2026",
  "Março de 2026",
  "Abril de 2026",
  "Maio de 2026",
  "Junho de 2026",
  "Julho de 2026",
];
