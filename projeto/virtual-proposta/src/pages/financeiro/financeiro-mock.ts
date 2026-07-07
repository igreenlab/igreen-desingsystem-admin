// Financeiro (Clientes Green) — carteira de boletos: adimplência, vencimentos,
// inadimplência e a lista de boletos. Tudo mockado, escala de painel.

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
  pagos: 1388,
  disponivel: 142,
  vencidos: 112,
};
export const emProducao = carteira.pagos + carteira.disponivel + carteira.vencidos;
export const pctAdimplencia = +((carteira.pagos / emProducao) * 100).toFixed(1);
export const pctInadimplencia = +((carteira.vencidos / emProducao) * 100).toFixed(1);

/* ── Breakdown de vencimentos (sobre os vencidos) ────────────────────────── */
export const vencimentos = [
  { key: "menos30", label: "Menos de 30 dias", n: 58, tone: "warning" as const },
  { key: "d30a60", label: "30 a 60 dias", n: 31, tone: "warning" as const },
  { key: "mais60", label: "Mais de 60 dias", n: 14, tone: "danger" as const },
  { key: "mais90", label: "Mais de 90 dias", n: 9, tone: "danger" as const },
];

/* ── Tipo de conta / boleto (sobre a carteira) ───────────────────────────── */
export const tipoConta = [
  { name: "Conta unificada", n: 920, color: "var(--color-chart-1)" },
  { name: "Boletos separados", n: 512, color: "var(--color-chart-2)" },
  { name: "Boleto duplo+", n: 138, color: "var(--color-chart-4)" },
  { name: "Rateio", n: 72, color: "var(--color-chart-5)" },
];

/* ── Evolução mensal (cohort: pagos x vencidos) ──────────────────────────── */
export const evolucao = [
  { mes: "Fev", pagos: 980, vencidos: 92 },
  { mes: "Mar", pagos: 1064, vencidos: 101 },
  { mes: "Abr", pagos: 1152, vencidos: 118 },
  { mes: "Mai", pagos: 1248, vencidos: 96 },
  { mes: "Jun", pagos: 1321, vencidos: 108 },
  { mes: "Jul", pagos: 1388, vencidos: 112 },
];

/* ── Top licenciados com inadimplência ───────────────────────────────────── */
export const topInadimplentes = [
  { id: 1, nome: "Camila Fontes Andrade", cidade: "São Paulo", uf: "SP", vencidos: 28, pctCarteira: 14.2 },
  { id: 2, nome: "Bruno Henrique Vasconcelos", cidade: "Belo Horizonte", uf: "MG", vencidos: 21, pctCarteira: 11.6 },
  { id: 3, nome: "Mariana Castro Teixeira", cidade: "Curitiba", uf: "PR", vencidos: 17, pctCarteira: 9.4 },
  { id: 4, nome: "Ana Beatriz Carvalho", cidade: "Porto Alegre", uf: "RS", vencidos: 12, pctCarteira: 7.1 },
  { id: 5, nome: "Fernanda Rocha Alves", cidade: "Recife", uf: "PE", vencidos: 9, pctCarteira: 5.3 },
];

/* ── Boletos ─────────────────────────────────────────────────────────────── */
export type BoletoStatus = "pago" | "disponivel" | "vencido";
export interface BoletoRow {
  id: string;
  nome: string;
  cidade: string;
  uf: string;
  licenciado: string;
  valor: number;
  vencimento: string; // ISO
  status: BoletoStatus;
  diasAtraso: number;
}

const LIC = [
  "Ana Beatriz Carvalho",
  "Camila Fontes Andrade",
  "Mariana Castro Teixeira",
  "Bruno Henrique Vasconcelos",
  "Fernanda Rocha Alves",
];
const CID: [string, string][] = [
  ["São Paulo", "SP"],
  ["Belo Horizonte", "MG"],
  ["Curitiba", "PR"],
  ["Porto Alegre", "RS"],
  ["Recife", "PE"],
];
const NOMES = [
  "Mariana Alves Costa", "Pedro Henrique Souza", "Juliana Ferreira Lima",
  "Carlos Eduardo Pinto", "Fernanda Rocha Dias", "Rafael Moura Santos",
  "Patrícia Mendes Gomes", "Lucas Pereira Cruz", "Beatriz Cardoso Melo",
  "Gabriel Nunes Barros", "Helena Castro Reis", "Igor Almeida Teixeira",
  "Camila Duarte Pires", "Thiago Ramos Lopes", "Vanessa Lima Fonseca",
  "Bruno Azevedo Cunha", "Larissa Pinto Rocha", "Felipe Tavares Mota",
  "Aline Souza Cardoso", "Diego Ferreira Nunes", "Renata Lopes Vieira",
  "Marcelo Dias Antunes", "Tatiane Ribeiro Sá", "Gustavo Henrique Pires",
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
    id: `B-${4000 + i}`,
    nome,
    cidade,
    uf,
    licenciado: LIC[i % LIC.length],
    valor: 89 + ((i * 37) % 420),
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
