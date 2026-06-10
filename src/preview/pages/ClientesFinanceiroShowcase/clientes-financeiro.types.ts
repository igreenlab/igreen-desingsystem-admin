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

/**
 * Situação financeira da conta (pipeline) — vira coluna `badge` (chip colorido)
 * E o eixo do board Kanban. Fluxo: pendente → ativo → negociação → bloqueado.
 */
export type AccountStatus = "pendente" | "ativo" | "negociacao" | "bloqueado";

/** Método de recebimento aceito pelo licenciado (coluna `tags`). */
export type PaymentMethod = "pix" | "ted" | "boleto";

/** Movimentação financeira — usada no extrato da row expansion. */
export type FinanceTransaction = {
  id: string;
  /** Timestamp (ms) da movimentação. */
  date: number;
  /** Entrada (crédito) ou saída (saque/débito). */
  type: "in" | "out";
  /** Valor em BRL (sempre positivo; `type` define o sinal). */
  amount: number;
  description: string;
};

/** Cliente com dados financeiros — estende ClientRow. */
export type FinanceClientRow = ClientRow & {
  /** Saldo disponível pra saque (BRL). */
  availableBalance: number;
  /** Volume financeiro movimentado no mês (BRL). */
  monthlyVolume: number;
  /** Taxa de comissão do licenciado (0–100, editável inline). */
  commissionRate: number;
  /** Situação da conta — chip + eixo do Kanban. */
  accountStatus: AccountStatus;
  /** Saque automático habilitado (boolean editável inline). */
  autoWithdraw: boolean;
  /** Métodos de recebimento aceitos (tags). */
  paymentMethods: PaymentMethod[];
  /** Timestamp (ms) da última movimentação financeira. */
  lastMovement: number;
  /** Extrato das últimas movimentações (row expansion). */
  transactions: FinanceTransaction[];
  /** Dados bancários do cliente. */
  bankAccount: BankAccount;
  /** CNPJ do cliente (formato XX.XXX.XXX/0001-XX). */
  cnpj: string;
  /** Razão social da empresa (nome PJ). */
  companyName: string;
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
