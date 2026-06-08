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

/** Cliente com dados financeiros — estende ClientRow. */
export type FinanceClientRow = ClientRow & {
  /** Saldo disponível pra saque (BRL). */
  availableBalance: number;
  /** Dados bancários do cliente. */
  bankAccount: BankAccount;
  /** CNPJ do cliente (formato XX.XXX.XXX/0001-XX). */
  cnpj: string;
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
