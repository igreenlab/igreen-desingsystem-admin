// Cadastros (Clientes Green) — registros de clientes em diferentes estágios do
// fluxo (análise → ativo / devolução / cancelado). Mockado.

export const num = (n: number) => n.toLocaleString("pt-BR");
export const kwh = (n: number) => `${num(n)} kWh`;

export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
};

export type CadastroStatus =
  | "ativo"
  | "analise"
  | "aguardando"
  | "devolucao"
  | "cancelado"
  | "reprovado";

export const STATUS_LABEL: Record<CadastroStatus, string> = {
  ativo: "Ativo",
  analise: "Em análise",
  aguardando: "Aguardando",
  devolucao: "Devolução",
  cancelado: "Cancelado",
  reprovado: "Reprovado",
};

export interface CadastroRow {
  id: string;
  cliente: string;
  documento: string;
  cidade: string;
  uf: string;
  distribuidora: string;
  status: CadastroStatus;
  consumo: number; // kWh médio mensal
  data: string; // ISO — data do cadastro
  licenciado: string;
}

export const DISTRIBUIDORAS = [
  "CEMIG",
  "Enel SP",
  "Copel",
  "CPFL Paulista",
  "Light",
  "Neoenergia",
  "Equatorial",
] as const;

export const PERIODOS = [
  "Julho de 2026",
  "Junho de 2026",
  "Maio de 2026",
  "Abril de 2026",
];

// [cliente, doc, cidade, uf, distribuidora, status, consumo, dataISO, licenciado]
const RAW: Array<
  [string, string, string, string, string, CadastroStatus, number, string, string]
> = [
  ["Mercado São Jorge", "12.345.678/0001-90", "São Paulo", "SP", "Enel SP", "ativo", 1840, "2026-07-12", "Ana Beatriz Moraes"],
  ["Padaria Trigo Dourado", "987.654.321-00", "Belo Horizonte", "MG", "CEMIG", "analise", 620, "2026-07-11", "Carlos Eduardo Lima"],
  ["Auto Posto Litoral", "23.456.789/0001-01", "Curitiba", "PR", "Copel", "aguardando", 2310, "2026-07-10", "Daniela Figueiredo"],
  ["Clínica Vida Plena", "345.678.912-11", "Porto Alegre", "RS", "CPFL Paulista", "ativo", 980, "2026-07-09", "Eduardo Santanna"],
  ["Restaurante Maré Alta", "34.567.890/0001-12", "Rio de Janeiro", "RJ", "Light", "devolucao", 1450, "2026-07-08", "Fernanda Rocha"],
  ["Oficina do Zé", "456.789.123-22", "Recife", "PE", "Neoenergia", "ativo", 530, "2026-07-08", "Gustavo Pereira"],
  ["Mercadinho Bom Preço", "45.678.901/0001-23", "Salvador", "BA", "Neoenergia", "cancelado", 760, "2026-07-07", "Helena Carvalho"],
  ["Academia Corpo Ativo", "567.891.234-33", "Fortaleza", "CE", "Equatorial", "analise", 1120, "2026-07-06", "Igor Nascimento"],
  ["Pet Shop Amigo Fiel", "56.789.012/0001-34", "Goiânia", "GO", "Equatorial", "aguardando", 410, "2026-07-05", "Juliana Alves"],
  ["Lava Rápido Cristal", "678.912.345-44", "Campinas", "SP", "CPFL Paulista", "ativo", 890, "2026-07-04", "Lucas Martins"],
  ["Sorveteria Gelato", "67.890.123/0001-45", "Brasília", "DF", "Neoenergia", "reprovado", 340, "2026-07-03", "Mariana Duarte"],
  ["Farmácia Saúde Já", "789.123.456-55", "Florianópolis", "SC", "Celesc", "ativo", 1280, "2026-07-02", "Nelson Ribeiro"],
  ["Marcenaria Bom Corte", "78.901.234/0001-56", "Uberlândia", "MG", "CEMIG", "analise", 2040, "2026-07-01", "Otávio Cardoso"],
  ["Salão Beleza Pura", "891.234.567-66", "Londrina", "PR", "Copel", "devolucao", 480, "2026-06-30", "Patrícia Gomes"],
  ["Hortifruti da Praça", "89.012.345/0001-67", "Maceió", "AL", "Equatorial", "ativo", 670, "2026-06-29", "Rafael Teixeira"],
  ["Escritório Contábil ABC", "912.345.678-77", "Posse", "GO", "Equatorial", "aguardando", 290, "2026-06-28", "Sofia Almeida"],
  ["Distribuidora Norte", "90.123.456/0001-78", "São Paulo", "SP", "Enel SP", "ativo", 3120, "2026-06-27", "Ana Beatriz Moraes"],
  ["Café Grão Nobre", "123.456.789-88", "Belo Horizonte", "MG", "CEMIG", "cancelado", 520, "2026-06-26", "Carlos Eduardo Lima"],
  ["Gráfica Impacto", "11.222.333/0001-44", "Curitiba", "PR", "Copel", "ativo", 1390, "2026-06-25", "Daniela Figueiredo"],
  ["Pizzaria Forno a Lenha", "222.333.444-55", "Porto Alegre", "RS", "CPFL Paulista", "analise", 980, "2026-06-24", "Eduardo Santanna"],
];

export const cadastros: CadastroRow[] = RAW.map(
  ([cliente, documento, cidade, uf, distribuidora, status, consumo, data, licenciado], i) => ({
    id: `CAD-${i + 1}`,
    cliente,
    documento,
    cidade,
    uf,
    distribuidora,
    status,
    consumo,
    data,
    licenciado,
  }),
);

export const totalCadastros = cadastros.length;
