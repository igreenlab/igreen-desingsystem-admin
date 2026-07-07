// Cadastros Seguros — propostas de apólice em diferentes estágios do fluxo de
// emissão (análise → vistoria → emitida / recusada / cancelada). Mockado.

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
};

export type CadastroStatus =
  | "emitida"
  | "analise"
  | "vistoria"
  | "aguardando"
  | "recusada"
  | "cancelada";

export const STATUS_LABEL: Record<CadastroStatus, string> = {
  emitida: "Emitida",
  analise: "Em análise",
  vistoria: "Em vistoria",
  aguardando: "Aguardando",
  recusada: "Recusada",
  cancelada: "Cancelada",
};

export interface CadastroRow {
  id: string;
  cliente: string;
  documento: string;
  cidade: string;
  uf: string;
  ramo: string;
  seguradora: string;
  status: CadastroStatus;
  premio: number; // prêmio da apólice em R$
  data: string; // ISO — data do cadastro
  corretor: string;
}

export const RAMOS = ["Auto", "Vida", "Residencial", "Saúde", "Empresarial"] as const;

export const SEGURADORAS = [
  "Porto Seguro",
  "Bradesco Seg",
  "SulAmérica",
  "Allianz",
  "Azul Seguros",
] as const;

export const PERIODOS = [
  "Julho de 2026",
  "Junho de 2026",
  "Maio de 2026",
  "Abril de 2026",
];

// [cliente, doc, cidade, uf, ramo, seguradora, status, premio, dataISO, corretor]
const RAW: Array<
  [string, string, string, string, string, string, CadastroStatus, number, string, string]
> = [
  ["Mariana Souza Lima", "123.456.789-00", "São Paulo", "SP", "Auto", "Porto Seguro", "emitida", 3240.0, "2026-07-12", "Ana Beatriz Moraes"],
  ["Padaria Trigo Dourado", "12.345.678/0001-90", "Belo Horizonte", "MG", "Empresarial", "Bradesco Seg", "analise", 8750.5, "2026-07-11", "Carlos Eduardo Lima"],
  ["Roberto Carvalho", "234.567.891-11", "Curitiba", "PR", "Residencial", "SulAmérica", "vistoria", 1890.0, "2026-07-10", "Daniela Figueiredo"],
  ["Clínica Vida Plena", "23.456.789/0001-01", "Porto Alegre", "RS", "Empresarial", "Allianz", "emitida", 12400.0, "2026-07-09", "Eduardo Santanna"],
  ["Fernanda Ribeiro", "345.678.912-22", "Rio de Janeiro", "RJ", "Vida", "Azul Seguros", "aguardando", 980.0, "2026-07-08", "Fernanda Rocha"],
  ["Oficina do Zé", "34.567.890/0001-12", "Recife", "PE", "Auto", "Porto Seguro", "emitida", 2760.0, "2026-07-08", "Gustavo Pereira"],
  ["Mercadinho Bom Preço", "45.678.901/0001-23", "Salvador", "BA", "Residencial", "Bradesco Seg", "cancelada", 1450.0, "2026-07-07", "Helena Carvalho"],
  ["Igor Nascimento Dias", "456.789.123-33", "Fortaleza", "CE", "Saúde", "SulAmérica", "analise", 5320.0, "2026-07-06", "Igor Nascimento"],
  ["Pet Shop Amigo Fiel", "56.789.012/0001-34", "Goiânia", "GO", "Empresarial", "Allianz", "aguardando", 4180.0, "2026-07-05", "Juliana Alves"],
  ["Lucas Martins Pinto", "567.891.234-44", "Campinas", "SP", "Auto", "Azul Seguros", "emitida", 3590.0, "2026-07-04", "Lucas Martins"],
  ["Sorveteria Gelato", "67.890.123/0001-45", "Brasília", "DF", "Residencial", "Porto Seguro", "recusada", 1230.0, "2026-07-03", "Mariana Duarte"],
  ["Nelson Ribeiro Souza", "789.123.456-55", "Florianópolis", "SC", "Vida", "Bradesco Seg", "emitida", 1120.0, "2026-07-02", "Nelson Ribeiro"],
  ["Marcenaria Bom Corte", "78.901.234/0001-56", "Uberlândia", "MG", "Empresarial", "SulAmérica", "analise", 7640.0, "2026-07-01", "Otávio Cardoso"],
  ["Patrícia Gomes Alves", "891.234.567-66", "Londrina", "PR", "Saúde", "Allianz", "vistoria", 4870.0, "2026-06-30", "Patrícia Gomes"],
  ["Hortifruti da Praça", "89.012.345/0001-67", "Maceió", "AL", "Residencial", "Azul Seguros", "emitida", 1680.0, "2026-06-29", "Rafael Teixeira"],
  ["Sofia Almeida Costa", "912.345.678-77", "Posse", "GO", "Auto", "Porto Seguro", "aguardando", 2980.0, "2026-06-28", "Sofia Almeida"],
  ["Distribuidora Norte", "90.123.456/0001-78", "São Paulo", "SP", "Empresarial", "Bradesco Seg", "emitida", 15200.0, "2026-06-27", "Ana Beatriz Moraes"],
  ["Café Grão Nobre", "11.222.333/0001-44", "Belo Horizonte", "MG", "Residencial", "SulAmérica", "cancelada", 2100.0, "2026-06-26", "Carlos Eduardo Lima"],
  ["Gráfica Impacto", "22.333.444/0001-55", "Curitiba", "PR", "Auto", "Allianz", "emitida", 3410.0, "2026-06-25", "Daniela Figueiredo"],
  ["Eduardo Santanna Reis", "333.444.555-66", "Porto Alegre", "RS", "Vida", "Azul Seguros", "analise", 1340.0, "2026-06-24", "Eduardo Santanna"],
];

export const cadastros: CadastroRow[] = RAW.map(
  ([cliente, documento, cidade, uf, ramo, seguradora, status, premio, data, corretor], i) => ({
    id: `SEG-CAD-${i + 1}`,
    cliente,
    documento,
    cidade,
    uf,
    ramo,
    seguradora,
    status,
    premio,
    data,
    corretor,
  }),
);

export const totalCadastros = cadastros.length;
