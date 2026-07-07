// Seguros — Resumo (espelha o SegurosPage original: KPIs de apólices/cotações,
// geração GP/GI, top do mês e resumo geral acumulado). Mockado.

export const num = (n: number | undefined) => (n ?? 0).toLocaleString("pt-BR");
export const brl = (n: number | undefined) =>
  `R$ ${(n ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const brlMil = (n: number | undefined) =>
  `R$ ${((n ?? 0) / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
export const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

export const PERIODOS = [
  "Julho de 2026",
  "Junho de 2026",
  "Maio de 2026",
  "Abril de 2026",
];

export const resumoKpis = {
  apolicesVigentes: 6240,
  novasMes: 458,
  cotacoes: 1120,
  pagas: 742,
};

/** Geração das apólices vigentes (própria x indireta/rede). */
export const geracao = {
  propria: 3870,
  propriaNovas: 280,
  indireta: 2370,
  indiretaNovas: 178,
};

export interface TopLic {
  id: string;
  nome: string;
  cidade: string;
  uf: string;
  novas: number;
  total: number;
}
export const topLicenciados: TopLic[] = [
  { id: "1", nome: "Ana Beatriz Moraes", cidade: "São Paulo", uf: "SP", novas: 42, total: 318 },
  { id: "2", nome: "Carlos Eduardo Lima", cidade: "Belo Horizonte", uf: "MG", novas: 31, total: 264 },
  { id: "3", nome: "Daniela Figueiredo", cidade: "Curitiba", uf: "PR", novas: 27, total: 221 },
  { id: "4", nome: "Eduardo Santanna", cidade: "Porto Alegre", uf: "RS", novas: 18, total: 176 },
  { id: "5", nome: "Fernanda Rocha", cidade: "Rio de Janeiro", uf: "RJ", novas: 14, total: 152 },
];

/** Corretores vinculados à sua rede (com delta vs. mês anterior). */
export const rede = {
  corretores: 48,
  novos: 5,
  deltaPct: 11.6,
};

/** Resumo geral acumulado (collapsible no original). */
export const resumoGeral = {
  vigentes: 6240,
  total: 7480,
  canceladas: 640,
  carteiraMensal: 1_185_000,
};
