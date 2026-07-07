// Licenciados Telecom (Clientes Green do Telecom) — base de licenciados com status
// de licença, validade, base de linhas e volume de dados. Mockado.

export const num = (n: number) => n.toLocaleString("pt-BR");
export const gb = (n: number) => `${num(n)} GB`;

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
  linhas: number;
  linhasAnterior: number;
  volumeGb: number; // GB de dados no mês
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

export const GRADUACOES = ["Executivo", "Diretor", "Gerente", "Consultor"] as const;
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

// [nome, cidade, uf, graduacao, linhas, linhasAnterior, volumeGb, vencimentoISO]
const RAW: Array<[string, string, string, string, number, number, number, string]> = [
  ["Ana Beatriz Moraes", "São Paulo", "SP", "Executivo", 342, 298, 1840, "2027-02-10"],
  ["Carlos Eduardo Lima", "Belo Horizonte", "MG", "Diretor", 276, 241, 1264, "2026-09-02"],
  ["Daniela Figueiredo", "Curitiba", "PR", "Diretor", 218, 233, 987, "2026-08-08"],
  ["Eduardo Santanna", "Porto Alegre", "RS", "Gerente", 184, 152, 812, "2027-05-21"],
  ["Fernanda Rocha", "Rio de Janeiro", "RJ", "Gerente", 167, 139, 746, "2026-07-30"],
  ["Gustavo Pereira", "Recife", "PE", "Consultor", 138, 121, 598, "2026-12-15"],
  ["Helena Carvalho", "Salvador", "BA", "Consultor", 124, 108, 541, "2026-06-20"],
  ["Igor Nascimento", "Fortaleza", "CE", "Gerente", 112, 90, 488, "2027-03-05"],
  ["Juliana Alves", "Goiânia", "GO", "Consultor", 98, 104, 423, "2026-08-28"],
  ["Lucas Martins", "Campinas", "SP", "Consultor", 87, 71, 392, "2027-01-18"],
  ["Mariana Duarte", "Brasília", "DF", "Diretor", 79, 64, 354, "2026-05-30"],
  ["Nelson Ribeiro", "Florianópolis", "SC", "Gerente", 68, 52, 311, "2026-09-19"],
  ["Otávio Cardoso", "Uberlândia", "MG", "Consultor", 57, 63, 268, "2027-04-12"],
  ["Patrícia Gomes", "Londrina", "PR", "Consultor", 48, 34, 224, "2026-07-22"],
  ["Rafael Teixeira", "Maceió", "AL", "Consultor", 39, 28, 187, "2026-06-05"],
  ["Sofia Almeida", "Posse", "GO", "Consultor", 24, 17, 112, "2027-06-01"],
];

function statusFromDias(dias: number): LicencaStatus {
  if (dias < 0) return "vencida";
  if (dias <= 60) return "a-vencer";
  return "ativa";
}

export const licenciados: LicenciadoRow[] = RAW.map(
  ([nome, cidade, uf, graduacao, linhas, linhasAnterior, volumeGb, vencimento], i) => {
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
      linhas,
      linhasAnterior,
      volumeGb,
    };
  },
);

export const totalLicenciados = licenciados.length;
export const totalAtivas = licenciados.filter((l) => l.status === "ativa").length;
export const totalAVencer = licenciados.filter((l) => l.status === "a-vencer").length;
export const totalVencidas = licenciados.filter((l) => l.status === "vencida").length;

export const kpis: KpiCard[] = [
  {
    title: "Licenciados",
    value: num(totalLicenciados),
    delta: "+3",
    bars: [9, 11, 10, 13, 12, 14, 16],
    hl: 6,
    note: "Base de licenciados Telecom vinculados a você.",
  },
  {
    title: "Licenças ativas",
    value: num(totalAtivas),
    delta: "+2",
    bars: [7, 8, 9, 9, 10, 11, totalAtivas],
    hl: 6,
    note: "Dentro da validade neste mês.",
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
