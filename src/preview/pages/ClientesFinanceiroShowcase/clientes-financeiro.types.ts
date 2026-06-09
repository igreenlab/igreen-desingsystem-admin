/**
 * Types do ClientesFinanceiroShowcase — extensão financeira do ClientesShowcase.
 *
 * Reaproveita estrutura de cliente mas adiciona dados bancários + saldo
 * disponível pra suportar a action de Saque.
 */

import type { ClientRow } from "../TableDoc";

/** Banco suportado nos mocks (com logo/cor próprios). */
export type BankId = "bb" | "itau" | "nubank" | "santander" | "bradesco";

export type BankAccount = {
  bank: BankId;
  bankName: string;
  agency: string;   // ex: "1234"
  account: string;  // ex: "98765-4"
};

/** Status financeiro do licenciado. */
export type FinanceStatus = "pending_withdrawal" | "active" | "inactive";

/** Meta visual de cada status — usado pra render do Chip. */
export const FINANCE_STATUS_META: Record<
  FinanceStatus,
  { label: string; color: "warning" | "success" | "neutral" }
> = {
  pending_withdrawal: { label: "Saque pendente", color: "warning" },
  active:             { label: "Ativo",          color: "success" },
  inactive:           { label: "Inativo",        color: "neutral" },
};

/** Cliente com dados financeiros — estende ClientRow. */
export type FinanceClientRow = ClientRow & {
  /** Saldo disponível pra saque (BRL). */
  availableBalance: number;
  /** Dados bancários do cliente. */
  bankAccount: BankAccount;
  /** CNPJ do cliente (formato XX.XXX.XXX/0001-XX). */
  cnpj: string;
  /** Razão social da empresa (nome PJ). */
  companyName: string;
  /** Status financeiro pra ações/filtros (saques pendentes, ativo, inativo). */
  financeStatus: FinanceStatus;
};

/**
 * Form data do modal Sacar — usuário escolhe valor + conta destino.
 * `clientId` é injetado pelo trigger (row da action).
 */
export type SacarFormData = {
  clientId: string;
  amount: number;
  selectedAccountBank: BankId;
};
