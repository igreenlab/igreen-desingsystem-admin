import { CLIENTS_87 } from "./clientes-showcase-mocks";
import type {
  AccountStatus,
  BankAccount,
  BankId,
  FinanceClientRow,
  FinanceTransaction,
  PaymentMethod,
} from "./clientes-financeiro.types";

/* ── Banks (lookup com nome + cor temática) ─────────────────────── */

export const BANKS: Record<BankId, { name: string; color: string; initials: string }> = {
  bb:         { name: "Banco do Brasil", color: "#FAE128", initials: "BB" },
  itau:       { name: "Itaú",            color: "#EC7000", initials: "IT" },
  nubank:     { name: "Nubank",          color: "#820AD1", initials: "NU" },
  santander:  { name: "Santander",       color: "#EC0000", initials: "SA" },
  bradesco:   { name: "Bradesco",        color: "#CC092F", initials: "BR" },
};

const BANK_IDS: BankId[] = ["bb", "itau", "nubank", "santander", "bradesco"];

/** Contas mocadas pra o modal Sacar — opções fixas. */
export const SACAR_ACCOUNT_OPTIONS: BankAccount[] = [
  { bank: "bb",        bankName: "Banco do Brasil", agency: "0001", account: "12345-6" },
  { bank: "nubank",    bankName: "Nubank",          agency: "0001", account: "98765-4" },
  { bank: "itau",      bankName: "Itaú",            agency: "1234", account: "55555-1" },
];

/* ── Helpers de geração ─────────────────────────────────────────── */

/** Gera dado bancário pseudo-determinístico baseado no índice do cliente. */
function makeAccount(idx: number): BankAccount {
  const bank = BANK_IDS[idx % BANK_IDS.length];
  const agency = String(1000 + (idx * 37) % 9000).padStart(4, "0");
  const accountSeq = String(10000 + (idx * 113) % 89999).padStart(5, "0");
  const dv = (idx * 7) % 10;
  return {
    bank,
    bankName: BANKS[bank].name,
    agency,
    account: `${accountSeq}-${dv}`,
  };
}

/** Saldo pseudo-determinístico — varia entre R$ 150 e R$ 25.000. */
function makeBalance(idx: number): number {
  const base = 150 + (idx * 317) % 24850;
  // arredonda pra 2 casas
  return Math.round(base * 100) / 100;
}

/** Razão social pseudo-determinística — combina nome do contato + sufixo. */
const COMPANY_SUFFIXES = [
  "Solar Energy LTDA",
  "Energia Renovável ME",
  "Eco Solutions S.A.",
  "Green Power LTDA",
  "Solar Tech ME",
  "Energy Brasil S.A.",
];
function makeCompanyName(idx: number, contactName: string): string {
  // Pega o primeiro nome do contato e combina com sufixo PJ
  const firstName = contactName.split(" ")[0];
  const suffix = COMPANY_SUFFIXES[idx % COMPANY_SUFFIXES.length];
  return `${firstName} ${suffix}`;
}

/** CNPJ pseudo-determinístico — gera formato XX.XXX.XXX/0001-XX baseado no idx. */
function makeCNPJ(idx: number): string {
  // Bloco 1: 2 dígitos
  const b1 = String(10 + (idx * 13) % 89).padStart(2, "0");
  // Bloco 2: 3 dígitos
  const b2 = String(100 + (idx * 71) % 899).padStart(3, "0");
  // Bloco 3: 3 dígitos
  const b3 = String(100 + (idx * 127) % 899).padStart(3, "0");
  // DV: 2 dígitos
  const dv = String(10 + (idx * 53) % 89).padStart(2, "0");
  return `${b1}.${b2}.${b3}/0001-${dv}`;
}

/* ── Situação da conta (badge + eixo do Kanban) ─────────────────── */

export const ACCOUNT_STATUS: Record<
  AccountStatus,
  { label: string; color: "warning" | "success" | "info" | "danger" }
> = {
  pendente:   { label: "Pendente",      color: "warning" },
  ativo:      { label: "Ativo",         color: "success" },
  negociacao: { label: "Em negociação", color: "info" },
  bloqueado:  { label: "Bloqueado",     color: "danger" },
};

const ACCOUNT_STATUS_IDS: AccountStatus[] = [
  "ativo",
  "ativo",
  "pendente",
  "ativo",
  "negociacao",
  "ativo",
  "bloqueado",
]; // distribuição enviesada p/ "ativo" (realista) via módulo do índice

const PAYMENT_METHOD_SETS: PaymentMethod[][] = [
  ["pix"],
  ["pix", "ted"],
  ["pix", "boleto"],
  ["pix", "ted", "boleto"],
  ["ted", "boleto"],
];

const TRANSACTION_DESCRIPTIONS: Record<"in" | "out", string[]> = {
  in: ["Comissão de venda", "Bônus de meta", "Repasse de royalty", "Estorno"],
  out: ["Saque para conta", "Taxa de serviço", "Antecipação", "Ajuste de saldo"],
};

const NOW = new Date("2026-06-10T12:00:00Z").getTime();
const DAY = 86400000;

/** Status pseudo-determinístico baseado no índice. */
function makeAccountStatus(idx: number): AccountStatus {
  return ACCOUNT_STATUS_IDS[idx % ACCOUNT_STATUS_IDS.length];
}

/** Volume mensal pseudo-determinístico — R$ 2k a R$ 80k. */
function makeMonthlyVolume(idx: number): number {
  return Math.round((2000 + ((idx * 911) % 78000)) * 100) / 100;
}

/** Taxa de comissão 4%–14% (1 casa). */
function makeCommissionRate(idx: number): number {
  return Math.round((4 + ((idx * 37) % 100) / 10) * 10) / 10;
}

/** Última movimentação — entre 0 e ~45 dias atrás. */
function makeLastMovement(idx: number): number {
  return NOW - ((idx * 53) % 45) * DAY - ((idx * 17) % 24) * 3600000;
}

/** Extrato pseudo-determinístico — 4 a 6 movimentações recentes. */
function makeTransactions(idx: number, lastMovement: number): FinanceTransaction[] {
  const count = 4 + (idx % 3);
  return Array.from({ length: count }, (_, i) => {
    const type: "in" | "out" = (idx + i) % 3 === 0 ? "out" : "in";
    const pool = TRANSACTION_DESCRIPTIONS[type];
    return {
      id: `TX-${idx}-${i}`,
      date: lastMovement - i * (2 * DAY + ((idx * 7) % 5) * DAY),
      type,
      amount: Math.round((120 + ((idx * 211 + i * 67) % 9800)) * 100) / 100,
      description: pool[(idx + i) % pool.length],
    };
  });
}

/* ── Dataset financeiro — 87 clientes com banco + saldo ─────────── */

export const FINANCE_CLIENTS: FinanceClientRow[] = CLIENTS_87.map((c, idx) => {
  const lastMovement = makeLastMovement(idx);
  return {
    ...c,
    // Force categoria "licenciado" pra tema financeiro (afiliados/parceiros PJ)
    categoryId: "licenciado",
    bankAccount: makeAccount(idx),
    availableBalance: makeBalance(idx),
    monthlyVolume: makeMonthlyVolume(idx),
    commissionRate: makeCommissionRate(idx),
    accountStatus: makeAccountStatus(idx),
    autoWithdraw: idx % 3 !== 0, // ~2/3 com saque automático
    paymentMethods: PAYMENT_METHOD_SETS[idx % PAYMENT_METHOD_SETS.length],
    lastMovement,
    transactions: makeTransactions(idx, lastMovement),
    cnpj: makeCNPJ(idx),
    companyName: makeCompanyName(idx, c.name),
  };
});

/* ── Formatters ─────────────────────────────────────────────────── */

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatBankAccountShort(acc: BankAccount): string {
  // Ex: "BB · Ag 0001 · 12345-6"
  return `${BANKS[acc.bank].initials} · Ag ${acc.agency} · ${acc.account}`;
}

/* ── Estatísticas agregadas (KPIs do header da página) ──────────── */

export const FINANCE_KPIS = {
  /** Total disponível pra saque em todos os clientes. */
  totalAvailable: FINANCE_CLIENTS.reduce((sum, c) => sum + c.availableBalance, 0),
  /** Quantidade de clientes com saldo > R$ 5.000 (pra destacar high-value). */
  highValueCount: FINANCE_CLIENTS.filter((c) => c.availableBalance > 5000).length,
  /** Saldo médio. */
  averageBalance: 0,
  /** Contas em risco (negociação + bloqueado) — alinha com a preset "Inadimplentes". */
  atRiskCount: FINANCE_CLIENTS.filter(
    (c) => c.accountStatus === "negociacao" || c.accountStatus === "bloqueado",
  ).length,
};
FINANCE_KPIS.averageBalance =
  FINANCE_KPIS.totalAvailable / FINANCE_CLIENTS.length;

/** Label curto pra movimentação relativa ("hoje", "há 3 dias"). */
export function formatRelativeDays(ts: number): string {
  const days = Math.floor((NOW - ts) / DAY);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  if (days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30);
  return months === 1 ? "há 1 mês" : `há ${months} meses`;
}

/** Data curta "09 fev" / "09 fev, 14:30" pro extrato. */
export function formatDateTimeShort(ts: number): string {
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
