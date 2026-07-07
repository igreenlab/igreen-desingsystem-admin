// Financeiro (Seguros) — seguro NÃO tem parcela recorrente vencível na base
// iGreen. Então aqui mostramos a CARTEIRA MENSAL (vigentes) e o status da
// 1ª PARCELA (paga/pendente). Não há "vencido" mês a mês. Mockado.

export const num = (n: number) => n.toLocaleString("pt-BR");
export const brl = (n: number) =>
  `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const brlMil = (n: number) =>
  `R$ ${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
};

export type ParcelaStatus = "paga" | "pendente";
export const STATUS_LABEL: Record<ParcelaStatus, string> = {
  paga: "1ª paga",
  pendente: "1ª pendente",
};

export const RAMOS = ["Auto", "Vida", "Residencial", "Saúde", "Empresarial"] as const;

export const PERIODOS = [
  "Julho de 2026",
  "Junho de 2026",
  "Maio de 2026",
  "Abril de 2026",
];

export interface ApoliceRow {
  id: string;
  cliente: string;
  documento: string;
  cidade: string;
  uf: string;
  ramo: string;
  parcela: ParcelaStatus;
  mensal: number; // prêmio mensal
  emissao: string; // ISO
  corretor: string;
}

// [cliente, doc, cidade, uf, ramo, parcela, mensal, emissaoISO, corretor]
const RAW: Array<
  [string, string, string, string, string, ParcelaStatus, number, string, string]
> = [
  ["Mercado São Jorge", "12.345.678/0001-90", "São Paulo", "SP", "Empresarial", "paga", 520, "2026-07-01", "Ana Beatriz Moraes"],
  ["Roberto Queiroz", "987.654.321-00", "Belo Horizonte", "MG", "Auto", "paga", 180, "2026-07-02", "Carlos Eduardo Lima"],
  ["Auto Posto Litoral", "23.456.789/0001-01", "Curitiba", "PR", "Empresarial", "pendente", 410, "2026-07-03", "Daniela Figueiredo"],
  ["Clínica Vida Plena", "345.678.912-11", "Porto Alegre", "RS", "Saúde", "paga", 260, "2026-07-04", "Eduardo Santanna"],
  ["Marina Telles", "456.789.123-22", "Rio de Janeiro", "RJ", "Vida", "paga", 95, "2026-07-05", "Fernanda Rocha"],
  ["Oficina do Zé", "567.891.234-33", "Recife", "PE", "Auto", "pendente", 210, "2026-07-06", "Gustavo Pereira"],
  ["Mercadinho Bom Preço", "45.678.901/0001-23", "Salvador", "BA", "Residencial", "paga", 130, "2026-07-07", "Helena Carvalho"],
  ["Academia Corpo Ativo", "678.912.345-44", "Fortaleza", "CE", "Empresarial", "paga", 350, "2026-07-08", "Igor Nascimento"],
  ["Patrícia Gomes", "789.123.456-55", "Goiânia", "GO", "Vida", "pendente", 110, "2026-07-09", "Juliana Alves"],
  ["Lava Rápido Cristal", "891.234.567-66", "Campinas", "SP", "Auto", "paga", 175, "2026-07-10", "Lucas Martins"],
  ["Sorveteria Gelato", "67.890.123/0001-45", "Brasília", "DF", "Residencial", "paga", 140, "2026-07-11", "Mariana Duarte"],
  ["Farmácia Saúde Já", "912.345.678-77", "Florianópolis", "SC", "Saúde", "pendente", 240, "2026-07-12", "Nelson Ribeiro"],
  ["Marcenaria Bom Corte", "78.901.234/0001-56", "Uberlândia", "MG", "Empresarial", "paga", 300, "2026-07-12", "Otávio Cardoso"],
  ["Distribuidora Norte", "90.123.456/0001-78", "São Paulo", "SP", "Empresarial", "paga", 480, "2026-07-13", "Ana Beatriz Moraes"],
  ["Café Grão Nobre", "44.555.666-77", "Belo Horizonte", "MG", "Residencial", "pendente", 135, "2026-07-13", "Carlos Eduardo Lima"],
  ["Gráfica Impacto", "11.222.555/0001-99", "Curitiba", "PR", "Auto", "paga", 190, "2026-07-14", "Daniela Figueiredo"],
  ["Bruno Carvalho", "55.666.777-88", "Porto Alegre", "RS", "Saúde", "paga", 270, "2026-07-14", "Eduardo Santanna"],
  ["Pizzaria Forno a Lenha", "66.777.888-99", "Rio de Janeiro", "RJ", "Empresarial", "pendente", 360, "2026-07-15", "Fernanda Rocha"],
];

export const apolices: ApoliceRow[] = RAW.map(
  ([cliente, documento, cidade, uf, ramo, parcela, mensal, emissao, corretor], i) => ({
    id: `SEG-AP-${i + 1}`,
    cliente,
    documento,
    cidade,
    uf,
    ramo,
    parcela,
    mensal,
    emissao,
    corretor,
  }),
);

export const totalApolices = apolices.length;
const pagas = apolices.filter((a) => a.parcela === "paga");
const pendentes = apolices.filter((a) => a.parcela === "pendente");

/** KPIs da carteira. */
export const financeiro = {
  carteiraMensal: apolices.reduce((s, a) => s + a.mensal, 0),
  vigentes: totalApolices,
  primeiraPaga: { n: pagas.length, valor: pagas.reduce((s, a) => s + a.mensal, 0) },
  primeiraPendente: { n: pendentes.length, valor: pendentes.reduce((s, a) => s + a.mensal, 0) },
};
