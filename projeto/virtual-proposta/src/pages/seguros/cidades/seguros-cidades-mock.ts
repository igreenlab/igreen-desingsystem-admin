// Cidades (Seguros) — ranking de cidades por apólices ativas + breakdown de
// status da carteira. Tudo mockado.

export const num = (n: number) => n.toLocaleString("pt-BR");

export interface SegurosCidadeRow {
  id: string;
  rank: number; // posição no ranking (1 = mais apólices)
  cidade: string;
  uf: string;
  total: number; // apólices no mês
  totalAnterior: number;
  ativas: number;
  emissao: number;
  renovacao: number;
  suspensas: number;
  canceladas: number;
  sinistro: number;
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

export const cidadesSeguros: SegurosCidadeRow[] = RAW.map(
  ([cidade, uf, total, totalAnterior], i) => {
    const ativas = Math.round(total * 0.64);
    const emissao = Math.round(total * 0.1);
    const renovacao = Math.round(total * 0.08);
    const suspensas = Math.round(total * 0.05);
    const canceladas = Math.round(total * 0.03);
    const sinistro = Math.max(
      0,
      total - ativas - emissao - renovacao - suspensas - canceladas,
    );
    return {
      id: `SC-${i + 1}`,
      rank: i + 1,
      cidade,
      uf,
      total,
      totalAnterior,
      ativas,
      emissao,
      renovacao,
      suspensas,
      canceladas,
      sinistro,
    };
  },
);

export const totalCidades = cidadesSeguros.length;
export const apolicesMes = cidadesSeguros.reduce((a, c) => a + c.total, 0);
export const emCrescimento = cidadesSeguros.filter(
  (c) => c.total > c.totalAnterior,
).length;

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
    title: "Apólices no mês",
    value: num(apolicesMes),
    delta: "+12%",
    down: false,
    note: "Volume de novas apólices ativas nas cidades atendidas.",
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
