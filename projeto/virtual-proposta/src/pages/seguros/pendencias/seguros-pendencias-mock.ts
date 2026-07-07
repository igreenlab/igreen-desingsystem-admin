// Pendências (Seguros) — cotações/apólices que ainda não viraram vigentes.
// No seguros TUDO aqui é pendência: o status é "Em andamento" ou "Recusada"
// (não há resolvido/vencido). Espelha o SegurosPage original. Mockado.

export const num = (n: number) => n.toLocaleString("pt-BR");
export const brl = (n: number) =>
  `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
};

/** Status de pendência no seguros — tudo é pendência. */
export type PendenciaStatus = "andamento" | "recusada";
export const STATUS_LABEL: Record<PendenciaStatus, string> = {
  andamento: "Em andamento",
  recusada: "Recusada",
};

export interface PendenciaRow {
  id: string;
  cliente: string;
  documento: string;
  cidade: string;
  uf: string;
  ramo: string;
  status: PendenciaStatus;
  mensal: number; // prêmio mensal estimado da cotação
  abertura: string; // ISO
  corretor: string;
}

export const RAMOS = ["Auto", "Vida", "Residencial", "Saúde", "Empresarial"] as const;

export const PERIODOS = [
  "Julho de 2026",
  "Junho de 2026",
  "Maio de 2026",
  "Abril de 2026",
];

// [cliente, doc, cidade, uf, ramo, status, mensal, aberturaISO, corretor]
const RAW: Array<
  [string, string, string, string, string, PendenciaStatus, number, string, string]
> = [
  ["Mercado São Jorge", "12.345.678/0001-90", "São Paulo", "SP", "Empresarial", "andamento", 320, "2026-07-11", "Ana Beatriz Moraes"],
  ["Roberto Queiroz", "987.654.321-00", "Belo Horizonte", "MG", "Auto", "andamento", 180, "2026-07-10", "Carlos Eduardo Lima"],
  ["Auto Posto Litoral", "23.456.789/0001-01", "Curitiba", "PR", "Empresarial", "recusada", 410, "2026-07-09", "Daniela Figueiredo"],
  ["Clínica Vida Plena", "345.678.912-11", "Porto Alegre", "RS", "Saúde", "andamento", 260, "2026-07-09", "Eduardo Santanna"],
  ["Marina Telles", "456.789.123-22", "Rio de Janeiro", "RJ", "Vida", "andamento", 95, "2026-07-08", "Fernanda Rocha"],
  ["Oficina do Zé", "567.891.234-33", "Recife", "PE", "Auto", "recusada", 210, "2026-07-08", "Gustavo Pereira"],
  ["Mercadinho Bom Preço", "45.678.901/0001-23", "Salvador", "BA", "Residencial", "andamento", 130, "2026-07-07", "Helena Carvalho"],
  ["Academia Corpo Ativo", "678.912.345-44", "Fortaleza", "CE", "Empresarial", "andamento", 350, "2026-07-06", "Igor Nascimento"],
  ["Patrícia Gomes", "789.123.456-55", "Goiânia", "GO", "Vida", "andamento", 110, "2026-07-06", "Juliana Alves"],
  ["Lava Rápido Cristal", "891.234.567-66", "Campinas", "SP", "Auto", "recusada", 175, "2026-07-05", "Lucas Martins"],
  ["Sorveteria Gelato", "67.890.123/0001-45", "Brasília", "DF", "Residencial", "andamento", 140, "2026-07-05", "Mariana Duarte"],
  ["Farmácia Saúde Já", "912.345.678-77", "Florianópolis", "SC", "Saúde", "andamento", 240, "2026-07-04", "Nelson Ribeiro"],
  ["Marcenaria Bom Corte", "78.901.234/0001-56", "Uberlândia", "MG", "Empresarial", "andamento", 300, "2026-07-04", "Otávio Cardoso"],
  ["Salão Beleza Pura", "11.222.333/0001-44", "Londrina", "PR", "Residencial", "recusada", 120, "2026-07-03", "Patrícia Gomes"],
  ["Hortifruti da Praça", "22.333.444-55", "Maceió", "AL", "Auto", "andamento", 165, "2026-07-03", "Rafael Teixeira"],
  ["Eduarda Nunes", "33.444.555-66", "São Paulo", "SP", "Vida", "andamento", 88, "2026-07-02", "Ana Beatriz Moraes"],
  ["Distribuidora Norte", "90.123.456/0001-78", "São Paulo", "SP", "Empresarial", "andamento", 520, "2026-07-02", "Ana Beatriz Moraes"],
  ["Café Grão Nobre", "44.555.666-77", "Belo Horizonte", "MG", "Residencial", "recusada", 135, "2026-07-01", "Carlos Eduardo Lima"],
  ["Gráfica Impacto", "11.222.555/0001-99", "Curitiba", "PR", "Auto", "andamento", 190, "2026-07-01", "Daniela Figueiredo"],
  ["Bruno Carvalho", "55.666.777-88", "Porto Alegre", "RS", "Saúde", "andamento", 270, "2026-06-30", "Eduardo Santanna"],
];

export const pendencias: PendenciaRow[] = RAW.map(
  ([cliente, documento, cidade, uf, ramo, status, mensal, abertura, corretor], i) => ({
    id: `SEG-PEND-${i + 1}`,
    cliente,
    documento,
    cidade,
    uf,
    ramo,
    status,
    mensal,
    abertura,
    corretor,
  }),
);

export const totalPendencias = pendencias.length;
export const totalAndamento = pendencias.filter((p) => p.status === "andamento").length;
export const totalRecusadas = pendencias.filter((p) => p.status === "recusada").length;
