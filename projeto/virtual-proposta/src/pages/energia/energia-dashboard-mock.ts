// Dashboard de Energia — agregados do segmento (mockado, escala de painel).
// Números coerentes com o painel do líder (~1.8k clientes ativos) e com as
// UFs/distribuidoras já usadas no Mapa de Clientes.

export const num = (n: number) => n.toLocaleString("pt-BR");
export const dec1 = (n: number) => n.toFixed(1).replace(".", ",");

/** Economia estimada do cliente ≈ 18% do valor da energia consumida. */
const TARIFA = 0.92; // R$/kWh (média Brasil, mock)
const DESCONTO = 0.18; // 18% de economia média iGreen

export interface EnergiaKpis {
  clientesAtivos: number;
  novosNoMes: number;
  novosDeltaPct: number;
  consumoTotalKwh: number; // kWh/mês somados
}

export const energiaKpis: EnergiaKpis = {
  clientesAtivos: 1828,
  novosNoMes: 124,
  novosDeltaPct: 8.6,
  consumoTotalKwh: 742_000,
};

export const economiaEstimadaMes = Math.round(
  energiaKpis.consumoTotalKwh * TARIFA * DESCONTO,
);

/** Série densa (12 meses) de clientes ativos acumulados — pro gráfico de área. */
export const clientesGrowth: Array<{ label: string; total: number }> = [
  { label: "Ago", total: 1180 },
  { label: "Set", total: 1262 },
  { label: "Out", total: 1351 },
  { label: "Nov", total: 1428 },
  { label: "Dez", total: 1497 },
  { label: "Jan", total: 1559 },
  { label: "Fev", total: 1618 },
  { label: "Mar", total: 1671 },
  { label: "Abr", total: 1719 },
  { label: "Mai", total: 1762 },
  { label: "Jun", total: 1808 },
  { label: "Jul", total: 1828 },
];

/** Clientes ativos por UF — alimenta o mapa coroplético. */
export const clientesPorUf: Array<{ uf: string; total: number }> = [
  { uf: "SP", total: 612 },
  { uf: "MG", total: 388 },
  { uf: "PR", total: 241 },
  { uf: "RS", total: 178 },
  { uf: "BA", total: 121 },
  { uf: "PE", total: 96 },
  { uf: "CE", total: 73 },
  { uf: "GO", total: 58 },
  { uf: "SC", total: 51 },
  { uf: "PB", total: 10 },
];

/** Distribuição por distribuidora/concessionária. */
export const clientesPorDistribuidora: Array<{ name: string; total: number }> = [
  { name: "Enel SP", total: 521 },
  { name: "CEMIG", total: 402 },
  { name: "Copel", total: 268 },
  { name: "RGE", total: 196 },
  { name: "Energisa", total: 281 },
  { name: "Outras", total: 160 },
];

/** Status dos clientes do segmento. */
export const statusClientes: Array<{ status: string; total: number }> = [
  { status: "Ativo", total: 1828 },
  { status: "Pendente", total: 214 },
  { status: "Em análise", total: 132 },
  { status: "Cancelado", total: 87 },
];

/* ── Funil de cadastros do mês (Resumo original) ─────────────────────────── */

export type FunilTone = "success" | "warning" | "danger" | "info";
export interface FunilEtapa {
  key: string;
  label: string;
  n: number;
  mwh: number; // MWh contratados pelos cadastros desta etapa
  color: string;
  tone: FunilTone;
}

export const funilCadastros: FunilEtapa[] = [
  { key: "validados", label: "Validados", n: 412, mwh: 288, color: "var(--color-chart-1)", tone: "success" },
  { key: "aguardando", label: "Aguardando validação", n: 138, mwh: 96, color: "var(--color-chart-4)", tone: "warning" },
  { key: "assinatura", label: "Ag. assinatura", n: 64, mwh: 45, color: "var(--color-chart-2)", tone: "warning" },
  { key: "devolutivas", label: "Devolutivas", n: 47, mwh: 33, color: "var(--color-chart-3)", tone: "warning" },
  { key: "reprovados", label: "Reprovados", n: 23, mwh: 16, color: "var(--color-fg-danger)", tone: "danger" },
  { key: "cancelados", label: "Cancelados", n: 31, mwh: 22, color: "color-mix(in oklch, var(--color-fg-danger) 70%, black)", tone: "danger" },
];

export const totalCadastrosMes = funilCadastros.reduce((a, f) => a + f.n, 0);
export const totalMwhMes = funilCadastros.reduce((a, f) => a + f.mwh, 0);

/** Cards extras do Resumo (mês). */
export const resumoExtras = {
  licenciadosComCadastro: 96,
  comEnergiaN: 388,
  comEnergiaPct: 54,
  aniversariantesHoje: 4,
};

/* ── Cadastros por dia (mês corrente) ────────────────────────────────────── */
const CAD_DIA_RAW = [
  12, 18, 9, 22, 27, 14, 8, 31, 24, 19, 16, 28, 35, 11, 7, 21, 26, 17, 13, 29,
  33, 20, 15, 23, 30, 25, 18, 22, 19, 16,
];
export const cadastrosPorDia = CAD_DIA_RAW.map((n, i) => ({
  dia: String(i + 1).padStart(2, "0"),
  n,
}));
export const melhorDiaCadastros = CAD_DIA_RAW.reduce((m, n) => Math.max(m, n), 0);
export const mediaDiaCadastros = Math.round(
  CAD_DIA_RAW.reduce((a, n) => a + n, 0) / CAD_DIA_RAW.length,
);

/* ── Impacto ambiental (derivado dos kWh validados) ──────────────────────── */
export const kwhValidados = funilCadastros[0].mwh * 1000; // 288.000 kWh
const CO2_KG_POR_KWH = 0.0817; // grid BR (kgCO₂/kWh)
const KWH_MES_POR_PLACA = 55; // geração média de 1 placa/mês
const CO2_KG_POR_ARVORE_ANO = 22;

const co2Kg = kwhValidados * CO2_KG_POR_KWH;
export const impactoAmbiental = {
  mwh: Math.round(kwhValidados / 1000),
  co2Toneladas: +(co2Kg / 1000).toFixed(1),
  arvores: Math.round(co2Kg / CO2_KG_POR_ARVORE_ANO),
  placas: Math.round(kwhValidados / KWH_MES_POR_PLACA),
};

/* ── Resumo Geral da Operação (acumulado, todos os tempos) ───────────────── */
export const resumoGeral = {
  totalCadastros: 7240,
  mwhContratados: 5120,
  status: {
    validados: 4980,
    aguardandoValidacao: 612,
    agAssinatura: 284,
    devolutivas: 521,
    reprovados: 388,
    cancelados: 455,
  },
  licenciadosComCadastro: 312,
  aguardandoInjecao: 176,
};

export const PERIODOS = [
  "Janeiro de 2026",
  "Fevereiro de 2026",
  "Março de 2026",
  "Abril de 2026",
  "Maio de 2026",
  "Junho de 2026",
  "Julho de 2026",
];
