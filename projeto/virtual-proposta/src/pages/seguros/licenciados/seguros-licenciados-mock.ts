// Licenciados Seguros (Corretores licenciados com licença SUSEP) — base de
// corretores com status de licença, validade, carteira de apólices e prêmio
// mensal. Mockado.

export const num = (n: number) => n.toLocaleString("pt-BR");
export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** Formata ISO (YYYY-MM-DD) → dd/mm/aa. */
export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
};

export type LicencaStatus = "ativa" | "a-vencer" | "vencida";

export interface LicenciadoRow {
  id: string;
  nome: string;
  codigo: string;
  cidade: string;
  uf: string;
  graduacao: string;
  status: LicencaStatus;
  ativacao: string; // ISO
  vencimento: string; // ISO
  diasRestantes: number; // até vencer (negativo = vencida)
  apolices: number;
  apolicesAnterior: number;
  premioMensal: number; // R$ de prêmio no mês
}

export interface KpiCard {
  title: string;
  value: string;
  delta: string;
  down?: boolean;
  bars: number[];
  hl: number;
  note: string;
}

export const GRADUACOES = ["Master", "Sênior", "Pleno", "Júnior"] as const;
export const STATUS_LABEL: Record<LicencaStatus, string> = {
  ativa: "Ativa",
  "a-vencer": "A vencer",
  vencida: "Vencida",
};

export const PERIODOS = [
  "Julho de 2026",
  "Junho de 2026",
  "Maio de 2026",
  "Abril de 2026",
];

// Data de referência fixa pra derivar dias/validade (determinístico no mock).
const REF = new Date("2026-07-15");
const DIA = 86_400_000;

// [nome, cidade, uf, graduacao, apolices, apolicesAnterior, premioMensal, vencimentoISO]
const RAW: Array<[string, string, string, string, number, number, number, string]> = [
  ["Ana Beatriz Moraes", "São Paulo", "SP", "Master", 184, 162, 92400, "2027-02-10"],
  ["Carlos Eduardo Lima", "Belo Horizonte", "MG", "Sênior", 142, 128, 71800, "2026-09-02"],
  ["Daniela Figueiredo", "Curitiba", "PR", "Sênior", 121, 130, 58300, "2026-08-08"],
  ["Eduardo Santanna", "Porto Alegre", "RS", "Pleno", 98, 84, 47600, "2027-05-21"],
  ["Fernanda Rocha", "Rio de Janeiro", "RJ", "Pleno", 87, 73, 41200, "2026-07-30"],
  ["Gustavo Pereira", "Recife", "PE", "Júnior", 72, 64, 33800, "2026-12-15"],
  ["Helena Carvalho", "Salvador", "BA", "Júnior", 64, 56, 29700, "2026-06-20"],
  ["Igor Nascimento", "Fortaleza", "CE", "Pleno", 58, 47, 26400, "2027-03-05"],
  ["Juliana Alves", "Goiânia", "GO", "Júnior", 51, 54, 23100, "2026-08-28"],
  ["Lucas Martins", "Campinas", "SP", "Júnior", 46, 38, 20800, "2027-01-18"],
  ["Mariana Duarte", "Brasília", "DF", "Sênior", 41, 33, 19200, "2026-05-30"],
  ["Nelson Ribeiro", "Florianópolis", "SC", "Pleno", 36, 27, 16500, "2026-09-19"],
  ["Otávio Cardoso", "Uberlândia", "MG", "Júnior", 30, 34, 13900, "2027-04-12"],
  ["Patrícia Gomes", "Londrina", "PR", "Júnior", 25, 18, 11400, "2026-07-22"],
  ["Rafael Teixeira", "Maceió", "AL", "Júnior", 21, 15, 9600, "2026-06-05"],
  ["Sofia Almeida", "Posse", "GO", "Júnior", 13, 9, 5800, "2027-06-01"],
];

function statusFromDias(dias: number): LicencaStatus {
  if (dias < 0) return "vencida";
  if (dias <= 60) return "a-vencer";
  return "ativa";
}

export const licenciados: LicenciadoRow[] = RAW.map(
  ([nome, cidade, uf, graduacao, apolices, apolicesAnterior, premioMensal, vencimento], i) => {
    const dias = Math.round((new Date(vencimento).getTime() - REF.getTime()) / DIA);
    // ativação = vencimento - 12 meses
    const venc = new Date(vencimento);
    const ativacao = new Date(venc.getFullYear() - 1, venc.getMonth(), venc.getDate())
      .toISOString()
      .slice(0, 10);
    return {
      id: `L-${i + 1}`,
      nome,
      codigo: String(10240 + i * 7),
      cidade,
      uf,
      graduacao,
      status: statusFromDias(dias),
      ativacao,
      vencimento,
      diasRestantes: dias,
      apolices,
      apolicesAnterior,
      premioMensal,
    };
  },
);

export const totalLicenciados = licenciados.length;
export const totalAtivas = licenciados.filter((l) => l.status === "ativa").length;
export const totalAVencer = licenciados.filter((l) => l.status === "a-vencer").length;
export const totalVencidas = licenciados.filter((l) => l.status === "vencida").length;

export const kpis: KpiCard[] = [
  {
    title: "Corretores",
    value: num(totalLicenciados),
    delta: "+3",
    bars: [9, 11, 10, 13, 12, 14, 16],
    hl: 6,
    note: "Corretores licenciados Seguros vinculados a você.",
  },
  {
    title: "Licenças ativas",
    value: num(totalAtivas),
    delta: "+2",
    bars: [7, 8, 9, 9, 10, 11, totalAtivas],
    hl: 6,
    note: "Com licença SUSEP dentro da validade neste mês.",
  },
  {
    title: "A vencer / vencidas",
    value: num(totalAVencer + totalVencidas),
    delta: `+${totalVencidas}`,
    down: true,
    bars: [2, 3, 2, 4, 3, 5, totalAVencer + totalVencidas],
    hl: 6,
    note: "Renovar nos próximos 60 dias — evite quedas.",
  },
];
