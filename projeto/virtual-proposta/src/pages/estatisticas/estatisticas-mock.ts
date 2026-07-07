// Estatísticas PRO — espelha o endpoint `/estatisticas-pro` do legado:
// { monthlyGrowth, recurrence, graduationDistribution, businessTimeAnalysis }.
// Tudo mockado, client-side.

export type Graduacao =
  | "CONSULTOR SENIOR"
  | "GESTOR GREEN"
  | "EXECUTIVO GREEN"
  | "DIRETOR GREEN"
  | "PRESIDENTE GREEN";

export const GRADUACOES: Graduacao[] = [
  "CONSULTOR SENIOR",
  "GESTOR GREEN",
  "EXECUTIVO GREEN",
  "DIRETOR GREEN",
  "PRESIDENTE GREEN",
];

export interface MonthlyGrowthItem {
  month: string; // YYYY-MM
  total: number;
  growthPercentage: number;
}
export interface RecurrenceItem {
  consecutiveMonths: number;
  consultantCount: number;
  percentage: number;
}
export interface GraduationDistributionItem {
  graduation: Graduacao;
  total: number;
  percentage: number; // taxa de conversão PRO
}
export interface BusinessTimeItem {
  category: string;
  short: string;
  total: number;
  percentage: number;
  averageProMonths: number;
}

export const monthlyGrowth: MonthlyGrowthItem[] = [
  { month: "2026-01", total: 38, growthPercentage: 0 },
  { month: "2026-02", total: 42, growthPercentage: 10.5 },
  { month: "2026-03", total: 40, growthPercentage: -4.8 },
  { month: "2026-04", total: 48, growthPercentage: 20 },
  { month: "2026-05", total: 52, growthPercentage: 8.3 },
  { month: "2026-06", total: 55, growthPercentage: 5.8 },
  { month: "2026-07", total: 61, growthPercentage: 10.9 },
];

// Série densa (quinzenal) só pro gráfico de crescimento — 2× os pontos do
// monthlyGrowth, pra linha mais detalhada. Cada mês aparece 2×; XAxis usa
// interval={1} pra mostrar 1 rótulo por mês.
export const growthSeries: Array<{ label: string; total: number }> = [
  { label: "Jan", total: 36 },
  { label: "Jan", total: 38 },
  { label: "Fev", total: 40 },
  { label: "Fev", total: 42 },
  { label: "Mar", total: 41 },
  { label: "Mar", total: 40 },
  { label: "Abr", total: 44 },
  { label: "Abr", total: 48 },
  { label: "Mai", total: 50 },
  { label: "Mai", total: 52 },
  { label: "Jun", total: 54 },
  { label: "Jun", total: 55 },
  { label: "Jul", total: 58 },
  { label: "Jul", total: 61 },
];

const RECURRENCE_RAW: Array<[number, number]> = [
  [1, 60],
  [2, 45],
  [3, 33],
  [4, 30],
  [5, 22],
  [6, 15],
  [7, 13],
  [8, 10],
];
const RECURRENCE_TOTAL = RECURRENCE_RAW.reduce((a, [, c]) => a + c, 0);
export const recurrence: RecurrenceItem[] = RECURRENCE_RAW.map(([m, c]) => ({
  consecutiveMonths: m,
  consultantCount: c,
  percentage: +((c / RECURRENCE_TOTAL) * 100).toFixed(1),
}));

// total = nº de consultores na graduação; percentage = taxa de conversão PRO.
export const graduationDistribution: GraduationDistributionItem[] = [
  { graduation: "CONSULTOR SENIOR", total: 120, percentage: 22 },
  { graduation: "GESTOR GREEN", total: 64, percentage: 31 },
  { graduation: "EXECUTIVO GREEN", total: 38, percentage: 45 },
  { graduation: "DIRETOR GREEN", total: 18, percentage: 58 },
  { graduation: "PRESIDENTE GREEN", total: 5, percentage: 72 },
];

export const businessTimeAnalysis: BusinessTimeItem[] = [
  { category: "0–6 meses", short: "0–6m", total: 45, percentage: 18.4, averageProMonths: 2.1 },
  { category: "6–12 meses", short: "6–12m", total: 62, percentage: 31.7, averageProMonths: 4.8 },
  { category: "1–2 anos", short: "1–2a", total: 80, percentage: 52.6, averageProMonths: 9.2 },
  { category: "2+ anos", short: "2+", total: 58, percentage: 68.3, averageProMonths: 16.5 },
];

export function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-");
  return `${m}/${year.slice(2)}`;
}

export const titleCase = (s: string) =>
  s.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase());

export const RANKING_ALL = "ALL";

export function num(v: number): string {
  return v.toLocaleString("pt-BR");
}
