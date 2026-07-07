// Pendências (Telecom) — cadastros de ativação com pendência, com motivo, prazo
// de resolução e status. Mockado. Espelha a tela Devolutivas de Energia.

export const num = (n: number) => n.toLocaleString("pt-BR");
export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
};
export const fmtDayMonth = (iso: string) => {
  const [, m, d] = iso.split("-");
  const MES = ["", "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${d} ${MES[Number(m)]}`;
};

export type PendenciaStatus = "pendente" | "reenviado" | "resolvido" | "vencida";
export type PendenciaMotivo = "Portabilidade" | "Documento" | "Ativação" | "Cobrança";

export const STATUS_LABEL: Record<PendenciaStatus, string> = {
  pendente: "Pendente",
  reenviado: "Reenviado",
  resolvido: "Resolvido",
  vencida: "Vencida",
};

export interface PendenciaRow {
  id: string;
  cliente: string;
  documento: string;
  cidade: string;
  uf: string;
  motivo: PendenciaMotivo;
  status: PendenciaStatus;
  abertura: string; // ISO
  prazo: string; // ISO — limite pra resolução
  licenciado: string;
}

/** Cor (CSS var) por motivo — paleta de chart do DS. */
export const MOTIVO_COLOR: Record<PendenciaMotivo, string> = {
  Portabilidade: "var(--color-chart-3)", // azul
  Documento: "var(--color-chart-1)", // verde
  Ativação: "var(--color-chart-4)", // âmbar
  Cobrança: "var(--color-chart-5)", // violeta
};

export const PERIODOS = [
  "Julho de 2026",
  "Junho de 2026",
  "Maio de 2026",
  "Abril de 2026",
];

// [cliente, doc, cidade, uf, motivo, status, aberturaISO, prazoISO, licenciado]
const RAW: Array<
  [string, string, string, string, PendenciaMotivo, PendenciaStatus, string, string, string]
> = [
  ["Mercado São Jorge", "12.345.678/0001-90", "São Paulo", "SP", "Portabilidade", "pendente", "2026-07-10", "2026-07-20", "Ana Beatriz Moraes"],
  ["Padaria Trigo Dourado", "987.654.321-00", "Belo Horizonte", "MG", "Documento", "reenviado", "2026-07-09", "2026-07-19", "Carlos Eduardo Lima"],
  ["Auto Posto Litoral", "23.456.789/0001-01", "Curitiba", "PR", "Ativação", "pendente", "2026-07-08", "2026-07-16", "Daniela Figueiredo"],
  ["Clínica Vida Plena", "345.678.912-11", "Porto Alegre", "RS", "Portabilidade", "resolvido", "2026-07-06", "2026-07-16", "Eduardo Santanna"],
  ["Restaurante Maré Alta", "34.567.890/0001-12", "Rio de Janeiro", "RJ", "Cobrança", "vencida", "2026-06-28", "2026-07-08", "Fernanda Rocha"],
  ["Oficina do Zé", "456.789.123-22", "Recife", "PE", "Portabilidade", "pendente", "2026-07-11", "2026-07-21", "Gustavo Pereira"],
  ["Mercadinho Bom Preço", "45.678.901/0001-23", "Salvador", "BA", "Documento", "reenviado", "2026-07-07", "2026-07-17", "Helena Carvalho"],
  ["Academia Corpo Ativo", "567.891.234-33", "Fortaleza", "CE", "Ativação", "resolvido", "2026-07-05", "2026-07-15", "Igor Nascimento"],
  ["Pet Shop Amigo Fiel", "56.789.012/0001-34", "Goiânia", "GO", "Portabilidade", "pendente", "2026-07-12", "2026-07-22", "Juliana Alves"],
  ["Lava Rápido Cristal", "678.912.345-44", "Campinas", "SP", "Documento", "vencida", "2026-06-30", "2026-07-09", "Lucas Martins"],
  ["Sorveteria Gelato", "67.890.123/0001-45", "Brasília", "DF", "Cobrança", "pendente", "2026-07-10", "2026-07-18", "Mariana Duarte"],
  ["Farmácia Saúde Já", "789.123.456-55", "Florianópolis", "SC", "Portabilidade", "reenviado", "2026-07-08", "2026-07-18", "Nelson Ribeiro"],
  ["Marcenaria Bom Corte", "78.901.234/0001-56", "Uberlândia", "MG", "Ativação", "pendente", "2026-07-09", "2026-07-17", "Otávio Cardoso"],
  ["Salão Beleza Pura", "891.234.567-66", "Londrina", "PR", "Documento", "resolvido", "2026-07-04", "2026-07-14", "Patrícia Gomes"],
  ["Hortifruti da Praça", "89.012.345/0001-67", "Maceió", "AL", "Portabilidade", "pendente", "2026-07-11", "2026-07-21", "Rafael Teixeira"],
  ["Escritório Contábil ABC", "912.345.678-77", "Posse", "GO", "Cobrança", "vencida", "2026-06-27", "2026-07-07", "Sofia Almeida"],
  ["Distribuidora Norte", "90.123.456/0001-78", "São Paulo", "SP", "Portabilidade", "reenviado", "2026-07-06", "2026-07-16", "Ana Beatriz Moraes"],
  ["Café Grão Nobre", "123.456.789-88", "Belo Horizonte", "MG", "Documento", "pendente", "2026-07-10", "2026-07-20", "Carlos Eduardo Lima"],
  ["Gráfica Impacto", "11.222.333/0001-44", "Curitiba", "PR", "Ativação", "resolvido", "2026-07-03", "2026-07-13", "Daniela Figueiredo"],
  ["Pizzaria Forno a Lenha", "222.333.444-55", "Porto Alegre", "RS", "Portabilidade", "pendente", "2026-07-09", "2026-07-15", "Eduardo Santanna"],
  ["Padaria Pão Quente", "333.444.555-66", "Recife", "PE", "Documento", "pendente", "2026-07-11", "2026-07-23", "Gustavo Pereira"],
  ["Bar do Centro", "44.555.666/0001-77", "Salvador", "BA", "Cobrança", "reenviado", "2026-07-08", "2026-07-18", "Helena Carvalho"],
];

export const pendencias: PendenciaRow[] = RAW.map(
  ([cliente, documento, cidade, uf, motivo, status, abertura, prazo, licenciado], i) => ({
    id: `PEND-${i + 1}`,
    cliente,
    documento,
    cidade,
    uf,
    motivo,
    status,
    abertura,
    prazo,
    licenciado,
  }),
);

export const totalPendencias = pendencias.length;

const abertas = pendencias.filter((d) => d.status !== "resolvido");
export const totalAbertas = abertas.length;
export const totalResolvidas = pendencias.filter((d) => d.status === "resolvido").length;
export const totalVencidas = pendencias.filter((d) => d.status === "vencida").length;

/** Split por motivo (apenas em aberto) — pra barra segmentada. */
const MOTIVOS: PendenciaMotivo[] = ["Portabilidade", "Documento", "Ativação", "Cobrança"];
export const MOTIVO_SPLIT = MOTIVOS.map((motivo) => {
  const count = abertas.filter((d) => d.motivo === motivo).length;
  return {
    motivo,
    count,
    pct: Math.round((count / totalAbertas) * 100),
    color: MOTIVO_COLOR[motivo],
  };
}).filter((s) => s.count > 0);

/** Prazo-limite mais próximo entre as pendentes (pra mensagem do alerta). */
export const proximoPrazo = abertas.map((d) => d.prazo).sort()[0];

/** Ranking de licenciados por nº de pendências (mais ocorrências primeiro). */
export interface RankingItem {
  nome: string;
  count: number;
  pct: number; // relativo ao topo
}
export const LICENCIADO_RANKING: RankingItem[] = (() => {
  const map = new Map<string, number>();
  for (const d of pendencias) map.set(d.licenciado, (map.get(d.licenciado) ?? 0) + 1);
  const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = sorted[0]?.[1] ?? 1;
  return sorted.map(([nome, count]) => ({ nome, count, pct: Math.round((count / max) * 100) }));
})();
