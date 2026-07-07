// Financeiro (Clientes Telecom) — carteira de boletos de telefonia: adimplência,
// vencimentos, inadimplência e a lista de boletos. Tudo mockado, escala de painel.

export const num = (n: number) => n.toLocaleString("pt-BR");
export const dec1 = (n: number) => n.toFixed(1).replace(".", ",");
export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const dateBR = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

/* ── Status da carteira ──────────────────────────────────────────────────── */
export const carteira = {
  pagos: 1042,
  disponivel: 118,
  vencidos: 87,
};
export const emProducao = carteira.pagos + carteira.disponivel + carteira.vencidos;
export const pctAdimplencia = +((carteira.pagos / emProducao) * 100).toFixed(1);
export const pctInadimplencia = +((carteira.vencidos / emProducao) * 100).toFixed(1);

/** Valor em R$ por bucket da carteira (telefonia ~ R$ 76/boleto). */
export const carteiraValor = {
  pagos: 79_192.4,
  disponivel: 8_968.0,
  vencidos: 6_611.7,
};
export const valorTotal = carteiraValor.pagos + carteiraValor.disponivel + carteiraValor.vencidos;

/* ── Breakdown de vencimentos (sobre os vencidos) ────────────────────────── */
export const vencimentos = [
  { key: "menos30", label: "Menos de 30 dias", n: 44, tone: "warning" as const },
  { key: "d30a60", label: "30 a 60 dias", n: 24, tone: "warning" as const },
  { key: "mais60", label: "Mais de 60 dias", n: 12, tone: "danger" as const },
  { key: "mais90", label: "Mais de 90 dias", n: 7, tone: "danger" as const },
];

/* ── Tipo de conta / boleto (sobre a carteira) ───────────────────────────── */
export const tipoConta = [
  { name: "Plano pós-pago", n: 698, color: "var(--color-chart-1)" },
  { name: "Plano controle", n: 402, color: "var(--color-chart-2)" },
  { name: "Multilinha", n: 96, color: "var(--color-chart-4)" },
  { name: "Banda larga fixa", n: 51, color: "var(--color-chart-5)" },
];

/* ── Evolução mensal (cohort: pagos x vencidos) ──────────────────────────── */
export const evolucao = [
  { mes: "Fev", pagos: 742, vencidos: 71 },
  { mes: "Mar", pagos: 808, vencidos: 78 },
  { mes: "Abr", pagos: 879, vencidos: 90 },
  { mes: "Mai", pagos: 944, vencidos: 74 },
  { mes: "Jun", pagos: 1001, vencidos: 83 },
  { mes: "Jul", pagos: 1042, vencidos: 87 },
];

/* ── Top licenciados com inadimplência ───────────────────────────────────── */
export const topInadimplentes = [
  { id: 1, nome: "Rodrigo Sampaio Lima", cidade: "São Paulo", uf: "SP", vencidos: 22, pctCarteira: 13.1 },
  { id: 2, nome: "Letícia Barbosa Freitas", cidade: "Belo Horizonte", uf: "MG", vencidos: 18, pctCarteira: 10.8 },
  { id: 3, nome: "André Luiz Macedo", cidade: "Curitiba", uf: "PR", vencidos: 14, pctCarteira: 8.6 },
  { id: 4, nome: "Priscila Gomes Tavares", cidade: "Porto Alegre", uf: "RS", vencidos: 10, pctCarteira: 6.4 },
  { id: 5, nome: "Eduardo Nascimento Pires", cidade: "Recife", uf: "PE", vencidos: 7, pctCarteira: 4.7 },
];

/* ── Boletos ─────────────────────────────────────────────────────────────── */
export type BoletoStatus = "pago" | "disponivel" | "vencido";
export interface BoletoRow {
  id: string;
  nome: string;
  numero: string; // número da linha
  cidade: string;
  uf: string;
  licenciado: string;
  valor: number;
  vencimento: string; // ISO
  status: BoletoStatus;
  diasAtraso: number;
}

const LIC = [
  "Priscila Gomes Tavares",
  "Rodrigo Sampaio Lima",
  "André Luiz Macedo",
  "Letícia Barbosa Freitas",
  "Eduardo Nascimento Pires",
];
const CID: [string, string][] = [
  ["São Paulo", "SP"],
  ["Belo Horizonte", "MG"],
  ["Curitiba", "PR"],
  ["Porto Alegre", "RS"],
  ["Recife", "PE"],
];
const NOMES = [
  "Sabrina Oliveira Matos", "Vinícius Carvalho Brito", "Daniela Moreira Pinto",
  "Otávio Cardoso Lima", "Bianca Ferreira Nunes", "Murilo Santos Andrade",
  "Carolina Dias Teixeira", "Henrique Lopes Barros", "Natália Ribeiro Costa",
  "Leonardo Pires Fonseca", "Isabela Cunha Rocha", "Wesley Almeida Reis",
  "Amanda Tavares Melo", "Caio Ramos Duarte", "Jéssica Lima Cardoso",
  "Ricardo Azevedo Mota", "Luana Pinto Vieira", "Marcos Souza Antunes",
  "Bruna Rocha Gomes", "Felipe Nunes Sá", "Tatiana Lopes Cruz",
  "Diego Mendes Pires", "Aline Ribeiro Castro", "Gabriel Henrique Dias",
];

const STATUS_CYCLE: BoletoStatus[] = [
  "pago", "pago", "pago", "disponivel", "vencido", "pago",
  "pago", "vencido", "pago", "disponivel", "pago", "pago",
  "vencido", "pago", "pago", "disponivel", "pago", "vencido",
  "pago", "pago", "disponivel", "pago", "vencido", "pago",
];

export const boletos: BoletoRow[] = NOMES.map((nome, i) => {
  const status = STATUS_CYCLE[i % STATUS_CYCLE.length];
  const [cidade, uf] = CID[i % CID.length];
  const dia = String((i % 27) + 1).padStart(2, "0");
  return {
    id: `T-${5000 + i}`,
    nome,
    numero: `119${(27007370 + i * 7).toString()}`,
    cidade,
    uf,
    licenciado: LIC[i % LIC.length],
    valor: 59 + ((i * 31) % 290),
    vencimento: `2026-07-${dia}`,
    status,
    diasAtraso: status === "vencido" ? 3 + ((i * 7) % 70) : 0,
  };
});

export const totalBoletos = boletos.length;

export const PERIODOS = [
  "Janeiro de 2026",
  "Fevereiro de 2026",
  "Março de 2026",
  "Abril de 2026",
  "Maio de 2026",
  "Junho de 2026",
  "Julho de 2026",
];
