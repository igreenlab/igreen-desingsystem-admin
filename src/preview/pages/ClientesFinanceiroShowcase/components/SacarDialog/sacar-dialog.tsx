import { useEffect, useMemo, useState } from "react";
import { Banknote, Check, Wallet } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FormFieldInput } from "@/components/ui/FormField";
import {
  BANKS,
  SACAR_ACCOUNT_OPTIONS,
  formatBRL,
} from "../../clientes-financeiro-mocks";
import type {
  BankAccount,
  BankId,
  FinanceClientRow,
} from "../../clientes-financeiro.types";

export type SacarDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Cliente origem do saque (define o limite via availableBalance). */
  client: FinanceClientRow | null;
  /** Disparado ao confirmar — mocado, só feedback visual. */
  onConfirm?: (data: {
    clientId: string;
    amount: number;
    account: BankAccount;
  }) => void;
};

/**
 * SacarDialog — modal financeiro pra ação "Sacar" da action column da tabela.
 *
 * Layout (top → bottom):
 *   1. Saldo disponível do cliente (highlight visual)
 *   2. Input "Valor do saque" (BRL) + helper com limite
 *   3. Cards de conta de destino (radio cards com banco + agência + conta)
 *   4. Footer: Cancelar + Confirmar saque (disabled se valor inválido)
 *
 * Tudo mocado — `onConfirm` apenas dispara feedback no console.
 * Validation visual:
 *   - amount > 0
 *   - amount <= availableBalance (caso contrário, helper red)
 *   - alguma conta selecionada
 */
export function SacarDialog({
  open,
  onOpenChange,
  client,
  onConfirm,
}: SacarDialogProps) {
  const [amountStr, setAmountStr] = useState("");
  const [selectedBank, setSelectedBank] = useState<BankId | null>(null);

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      setAmountStr("");
      setSelectedBank(SACAR_ACCOUNT_OPTIONS[0]?.bank ?? null);
    }
  }, [open]);

  const limit = client?.availableBalance ?? 0;
  const amount = useMemo(() => {
    const parsed = Number(amountStr.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amountStr]);

  const overLimit = amount > limit;
  const canSubmit = !!client && amount > 0 && !overLimit && !!selectedBank;

  const handleConfirm = () => {
    if (!canSubmit || !client || !selectedBank) return;
    const account = SACAR_ACCOUNT_OPTIONS.find((a) => a.bank === selectedBank);
    if (!account) return;
    onConfirm?.({
      clientId: client.id,
      amount,
      account,
    });
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      size="md"
      icon={<Banknote className="size-icon-md" strokeWidth={1.7} />}
      title="Realizar saque"
      description={
        client
          ? `Saque do cliente ${client.name} (${client.id})`
          : "Selecione um cliente"
      }
      secondaryAction={{
        label: "Cancelar",
        onClick: () => onOpenChange(false),
      }}
      primaryAction={{
        label: "Confirmar saque",
        onClick: handleConfirm,
        disabled: !canSubmit,
      }}
    >
      <div className="flex flex-col gap-gp-2xl">
          {/* Saldo disponível — highlight financeiro */}
          <div className="flex items-center justify-between p-pad-2xl rounded-radius-lg bg-bg-brand-subtle border border-border-brand">
            <div className="flex items-center gap-gp-md">
              <div className="size-form-md rounded-radius-md bg-bg-brand text-fg-on-brand grid place-items-center">
                <Wallet className="size-icon-sm" />
              </div>
              <div className="flex flex-col">
                <span className="text-caption-md font-medium text-fg-muted">
                  Saldo disponível pra saque
                </span>
                <span className="text-heading-md font-bold text-fg-brand tabular-nums">
                  {formatBRL(limit)}
                </span>
              </div>
            </div>
          </div>

          {/* Valor do saque */}
          <FormFieldInput
            label="Valor do saque"
            required
            type="number"
            placeholder="0,00"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            state={overLimit ? "error" : "default"}
            helperText={
              overLimit
                ? `Valor acima do limite (${formatBRL(limit)})`
                : `Limite: ${formatBRL(limit)}`
            }
            errorMessage={
              overLimit ? `Valor acima do limite (${formatBRL(limit)})` : undefined
            }
          />

          {/* Cards de conta — radio group estilo card */}
          <div className="flex flex-col gap-gp-md">
            <label className="text-body-sm font-semibold tracking-[0.01em] text-fg-default dark:text-fg-muted">
              Conta de destino
            </label>
            <div className="grid grid-cols-1 gap-gp-md">
              {SACAR_ACCOUNT_OPTIONS.map((acc) => {
                const isSelected = selectedBank === acc.bank;
                const bankMeta = BANKS[acc.bank];
                return (
                  <button
                    key={acc.bank}
                    type="button"
                    onClick={() => setSelectedBank(acc.bank)}
                    className={[
                      "flex items-center gap-gp-lg p-pad-xl rounded-radius-lg",
                      "border bg-bg-surface text-left",
                      "transition-[border-color,background-color,box-shadow] duration-150",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
                      isSelected
                        ? "border-border-brand bg-bg-brand-subtle shadow-sh-sm"
                        : "border-border-default hover:border-border-input hover:bg-bg-muted",
                    ].join(" ")}
                  >
                    {/* Bank avatar — circulo com initials + cor do banco */}
                    <div
                      className="size-form-md rounded-full grid place-items-center text-fg-on-brand text-body-sm font-bold shrink-0"
                      style={{ backgroundColor: bankMeta.color }}
                      aria-hidden="true"
                    >
                      {bankMeta.initials}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-body-sm font-semibold text-fg-default truncate">
                        {acc.bankName}
                      </span>
                      <span className="text-caption-md text-fg-muted tabular-nums">
                        Ag {acc.agency} · Conta {acc.account}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="size-icon-sm text-fg-brand shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
    </Modal>
  );
}

