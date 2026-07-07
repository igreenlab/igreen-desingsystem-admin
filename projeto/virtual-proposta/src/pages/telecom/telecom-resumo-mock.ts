// Telecom — Resumo (espelha o SegurosPage/Telecom original + wireframe do
// usuário): KPIs, geração própria×indireta, portabilidade, top do mês. Mockado.

export const num = (n: number | undefined) => (n ?? 0).toLocaleString("pt-BR");
export const brl = (n: number | undefined) =>
  `R$ ${(n ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const brlMil = (n: number | undefined) =>
  `R$ ${((n ?? 0) / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mil`;
export const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

export const PERIODOS = [
  "Julho de 2026",
  "Junho de 2026",
  "Maio de 2026",
  "Abril de 2026",
];

export const resumoKpis = {
  conexoesAtivas: 908,
  novasMes: 34,
  carteiraMensal: 62_136.9,
  equipeCom: 11,
  equipeTotal: 26,
};

/** Licenciados vinculados à sua rede (com delta vs. mês anterior). */
export const rede = {
  vinculados: 26,
  novos: 3,
  deltaPct: 13.0,
};
export const receitaPorConexao = Math.round(resumoKpis.carteiraMensal / resumoKpis.conexoesAtivas);

/** Geração das conexões ativas (própria x indireta/rede). */
export const geracao = {
  propria: 885,
  propriaNovas: 32,
  indireta: 23,
  indiretaNovas: 2,
};

/** Portabilidade — confirmadas x pendentes. */
export const portabilidade = {
  confirmadas: 195,
  pendentes: 608,
};

export interface TopLic {
  id: string;
  nome: string;
  cidade: string;
  uf: string;
  total: number;
}
export const topLicenciados: TopLic[] = [
  { id: "1", nome: "Joao Mendes Rodrigues", cidade: "Uberlândia", uf: "MG", total: 885 },
  { id: "2", nome: "Guilherme De Souza Silva", cidade: "Mirassol", uf: "SP", total: 11 },
  { id: "3", nome: "Maria Iracilda Silva", cidade: "Campina Grande", uf: "PB", total: 5 },
  { id: "4", nome: "Douglas Diego de Carvalho", cidade: "Uberlândia", uf: "MG", total: 1 },
  { id: "5", nome: "Caio Pereira", cidade: "", uf: "", total: 1 },
];

/** Resumo geral acumulado. */
export const resumoGeral = {
  ativas: 908,
  totalCadastradas: 1082,
  canceladas: 66,
  portabConfirmada: 195,
  portabPendente: 608,
  carteiraMensal: 62_136.9,
};
