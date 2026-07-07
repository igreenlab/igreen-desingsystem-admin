// Extrato de Bônus — espelha a view real `V_EXTRATOBONUS` (5 colunas:
// dtlancamento · bonificacoes · saques · historico · idconsultor[oculto]).
// Tela legada: DefaultListingPage viewName="EXTRATOBONUS". Tudo mockado.

export type ExtratoBonusTipo = "Bonificação" | "Saque";

export interface ExtratoBonusRow {
  id: string;
  dtlancamento: string; // ISO yyyy-mm-dd
  historico: string;
  bonificacoes: number;
  saques: number;
  idconsultor: number;
  tipo: ExtratoBonusTipo; // derivado (qual lado tem valor)
}

const IDCONSULTOR = 48213;

// Lançamentos brutos (data, histórico, crédito, débito). Ordem cronológica desc.
const RAW: Array<[string, string, number, number]> = [
  ["2026-06-24", "Bônus de indicação — João Pereira", 180.0, 0],
  ["2026-06-23", "Bônus residual de energia — junho/2026", 642.35, 0],
  ["2026-06-22", "Saque solicitado — PIX", 0, 1500.0],
  ["2026-06-21", "Bônus de equipe — nível 1", 415.9, 0],
  ["2026-06-20", "Bônus de ativação — Maria Santos", 120.0, 0],
  ["2026-06-19", "Bônus de indicação — Carlos Lima", 180.0, 0],
  ["2026-06-18", "Bônus de equipe — nível 2", 287.45, 0],
  ["2026-06-17", "Estorno de saque — falha bancária", 0, -350.0],
  ["2026-06-16", "Bônus residual de energia — ajuste", 98.7, 0],
  ["2026-06-15", "Saque solicitado — TED", 0, 800.0],
  ["2026-06-14", "Bônus de ativação — Pedro Alves", 120.0, 0],
  ["2026-06-13", "Bônus de indicação — Ana Costa", 180.0, 0],
  ["2026-06-12", "Bônus de equipe — nível 1", 362.1, 0],
  ["2026-06-11", "Bônus de performance PRO — junho", 950.0, 0],
  ["2026-06-10", "Saque solicitado — PIX", 0, 1200.0],
  ["2026-06-09", "Bônus residual de energia — maio/2026", 588.2, 0],
  ["2026-06-08", "Bônus de ativação — Lucas Rocha", 120.0, 0],
  ["2026-06-07", "Bônus de indicação — Fernanda Dias", 180.0, 0],
  ["2026-06-06", "Bônus de equipe — nível 3", 175.6, 0],
  ["2026-06-05", "Saque solicitado — TED", 0, 600.0],
  ["2026-06-04", "Bônus de ativação — Rafael Souza", 120.0, 0],
  ["2026-06-03", "Bônus residual de energia — ajuste retroativo", 312.85, 0],
  ["2026-06-02", "Bônus de indicação — Beatriz Melo", 180.0, 0],
  ["2026-06-01", "Bônus de equipe — nível 1", 398.4, 0],
  ["2026-05-31", "Saque solicitado — PIX", 0, 2000.0],
  ["2026-05-30", "Bônus de performance PRO — maio", 875.0, 0],
  ["2026-05-29", "Bônus de ativação — Gustavo Nunes", 120.0, 0],
  ["2026-05-28", "Bônus residual de energia — maio/2026", 521.15, 0],
];

export const extratoBonus: ExtratoBonusRow[] = RAW.map(
  ([dtlancamento, historico, bonificacoes, saques], i) => ({
    id: `eb-${String(i + 1).padStart(3, "0")}`,
    dtlancamento,
    historico,
    bonificacoes,
    saques,
    idconsultor: IDCONSULTOR,
    tipo: bonificacoes !== 0 ? "Bonificação" : "Saque",
  }),
);

export const totalLancamentos = extratoBonus.length;

export function extratoKpis() {
  const bonificacoes = extratoBonus.reduce((a, r) => a + r.bonificacoes, 0);
  const saques = extratoBonus.reduce((a, r) => a + r.saques, 0);
  return {
    bonificacoes,
    saques,
    saldo: bonificacoes - saques,
    lancamentos: extratoBonus.length,
  };
}

// pt-BR currency (BRL)
export function brl(v: number): string {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// dd/mm/yyyy a partir do ISO
export function dateBR(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
