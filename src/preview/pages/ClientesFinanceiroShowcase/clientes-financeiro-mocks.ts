import { CLIENTS_87 } from "../ClientesShowcase/clientes-showcase-mocks";
import type {
  BankAccount,
  BankId,
  FinanceClientRow,
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

/* ── Dataset financeiro — 87 clientes com banco + saldo ─────────── */

export const FINANCE_CLIENTS: FinanceClientRow[] = CLIENTS_87.map((c, idx) => ({
  ...c,
  // Force categoria "licenciado" pra tema financeiro (afiliados/parceiros PJ)
  categoryId: "licenciado",
  bankAccount: makeAccount(idx),
  availableBalance: makeBalance(idx),
  cnpj: makeCNPJ(idx),
  companyName: makeCompanyName(idx, c.name),
}));

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
};
FINANCE_KPIS.averageBalance =
  FINANCE_KPIS.totalAvailable / FINANCE_CLIENTS.length;
