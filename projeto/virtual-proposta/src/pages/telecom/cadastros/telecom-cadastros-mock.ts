// Cadastros Telecom — registros de ativação de linhas em diferentes estágios do
// fluxo (análise → ativo / portabilidade / cancelado). Mockado.

export const num = (n: number) => n.toLocaleString("pt-BR");

export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
};

export type CadastroStatus =
  | "ativo"
  | "analise"
  | "aguardando"
  | "portabilidade"
  | "cancelado"
  | "reprovado";

export const STATUS_LABEL: Record<CadastroStatus, string> = {
  ativo: "Ativo",
  analise: "Em análise",
  aguardando: "Aguardando",
  portabilidade: "Portabilidade",
  cancelado: "Cancelado",
  reprovado: "Reprovado",
};

export interface CadastroRow {
  id: string;
  cliente: string;
  documento: string;
  cidade: string;
  uf: string;
  plano: string;
  status: CadastroStatus;
  dadosGb: number; // franquia de dados em GB
  data: string; // ISO — data do cadastro
  licenciado: string;
}

export const PLANOS = [
  "Pós 40GB",
  "Controle 20GB",
  "Pré-pago",
  "Família 100GB",
  "Dados 10GB",
] as const;

export const PERIODOS = [
  "Julho de 2026",
  "Junho de 2026",
  "Maio de 2026",
  "Abril de 2026",
];

// [cliente, doc, cidade, uf, plano, status, dadosGb, dataISO, licenciado]
const RAW: Array<
  [string, string, string, string, string, CadastroStatus, number, string, string]
> = [
  ["Mariana Souza Lima", "123.456.789-00", "São Paulo", "SP", "Pós 40GB", "ativo", 40, "2026-07-12", "Ana Beatriz Moraes"],
  ["Padaria Trigo Dourado", "12.345.678/0001-90", "Belo Horizonte", "MG", "Controle 20GB", "analise", 20, "2026-07-11", "Carlos Eduardo Lima"],
  ["Roberto Carvalho", "234.567.891-11", "Curitiba", "PR", "Família 100GB", "aguardando", 100, "2026-07-10", "Daniela Figueiredo"],
  ["Clínica Vida Plena", "23.456.789/0001-01", "Porto Alegre", "RS", "Pós 40GB", "ativo", 40, "2026-07-09", "Eduardo Santanna"],
  ["Fernanda Ribeiro", "345.678.912-22", "Rio de Janeiro", "RJ", "Pré-pago", "portabilidade", 8, "2026-07-08", "Fernanda Rocha"],
  ["Oficina do Zé", "34.567.890/0001-12", "Recife", "PE", "Dados 10GB", "ativo", 10, "2026-07-08", "Gustavo Pereira"],
  ["Mercadinho Bom Preço", "45.678.901/0001-23", "Salvador", "BA", "Controle 20GB", "cancelado", 20, "2026-07-07", "Helena Carvalho"],
  ["Igor Nascimento Dias", "456.789.123-33", "Fortaleza", "CE", "Família 100GB", "analise", 100, "2026-07-06", "Igor Nascimento"],
  ["Pet Shop Amigo Fiel", "56.789.012/0001-34", "Goiânia", "GO", "Pré-pago", "aguardando", 8, "2026-07-05", "Juliana Alves"],
  ["Lucas Martins Pinto", "567.891.234-44", "Campinas", "SP", "Pós 40GB", "ativo", 40, "2026-07-04", "Lucas Martins"],
  ["Sorveteria Gelato", "67.890.123/0001-45", "Brasília", "DF", "Dados 10GB", "reprovado", 10, "2026-07-03", "Mariana Duarte"],
  ["Nelson Ribeiro Souza", "789.123.456-55", "Florianópolis", "SC", "Controle 20GB", "ativo", 20, "2026-07-02", "Nelson Ribeiro"],
  ["Marcenaria Bom Corte", "78.901.234/0001-56", "Uberlândia", "MG", "Família 100GB", "analise", 100, "2026-07-01", "Otávio Cardoso"],
  ["Patrícia Gomes Alves", "891.234.567-66", "Londrina", "PR", "Pré-pago", "portabilidade", 8, "2026-06-30", "Patrícia Gomes"],
  ["Hortifruti da Praça", "89.012.345/0001-67", "Maceió", "AL", "Dados 10GB", "ativo", 10, "2026-06-29", "Rafael Teixeira"],
  ["Sofia Almeida Costa", "912.345.678-77", "Posse", "GO", "Controle 20GB", "aguardando", 20, "2026-06-28", "Sofia Almeida"],
  ["Distribuidora Norte", "90.123.456/0001-78", "São Paulo", "SP", "Família 100GB", "ativo", 100, "2026-06-27", "Ana Beatriz Moraes"],
  ["Café Grão Nobre", "11.222.333/0001-44", "Belo Horizonte", "MG", "Pós 40GB", "cancelado", 40, "2026-06-26", "Carlos Eduardo Lima"],
  ["Gráfica Impacto", "22.333.444/0001-55", "Curitiba", "PR", "Pós 40GB", "ativo", 40, "2026-06-25", "Daniela Figueiredo"],
  ["Eduardo Santanna Reis", "333.444.555-66", "Porto Alegre", "RS", "Dados 10GB", "analise", 10, "2026-06-24", "Eduardo Santanna"],
];

export const cadastros: CadastroRow[] = RAW.map(
  ([cliente, documento, cidade, uf, plano, status, dadosGb, data, licenciado], i) => ({
    id: `TEL-CAD-${i + 1}`,
    cliente,
    documento,
    cidade,
    uf,
    plano,
    status,
    dadosGb,
    data,
    licenciado,
  }),
);

export const totalCadastros = cadastros.length;
