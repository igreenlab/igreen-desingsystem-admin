import { useEffect, useMemo, useState } from "react";
import { Banknote, Check, Plus, Wallet } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FormFieldInput } from "@/components/ui/FormField";
import { Chip } from "@/components/ui/Chip";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/shadcn/tabs";
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
        {/* Saldo disponível — highlight financeiro
         *  Spacing maior entre ícone e label/valor (gap-gp-xl em vez de md).
         *  Label cor mais forte (fg-default dark:fg-muted em semibold) e valor
         *  com font-size menor (body-lg em vez de heading-md). */}
        <div className="flex items-center justify-between p-pad-2xl rounded-radius-lg bg-bg-brand-subtle border border-border-brand">
          <div className="flex items-center gap-gp-xl">
            <div className="size-form-md rounded-radius-md bg-bg-brand text-white grid place-items-center">
              <Wallet className="size-icon-sm" />
            </div>
            <div className="flex flex-col gap-gp-3xs">
              <span className="text-caption-md font-semibold text-fg-default dark:text-fg-muted">
                Saldo disponível pra saque
              </span>
              <span className="text-body-lg font-bold text-fg-brand tabular-nums leading-none">
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

        {/* Conta de destino — Tabs separando contas cadastradas vs nova */}
        <div className="flex flex-col gap-gp-md">
          <label className="text-body-sm font-semibold tracking-[0.01em] text-fg-default dark:text-fg-muted">
            Conta de destino
          </label>

          <Tabs defaultValue="cadastradas" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="cadastradas" className="flex-1">
                Contas cadastradas
              </TabsTrigger>
              <TabsTrigger value="outra" className="flex-1">
                Outra conta
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: lista de contas existentes (radio cards) */}
            <TabsContent value="cadastradas" className="mt-pad-lg">
              <div className="grid grid-cols-1 gap-gp-md">
                {SACAR_ACCOUNT_OPTIONS.map((acc, idx) => {
                  const isSelected = selectedBank === acc.bank;
                  const isRecommended = idx === 0;
                  const bankMeta = BANKS[acc.bank];
                  return (
                    <button
                      key={acc.bank}
                      type="button"
                      onClick={() => setSelectedBank(acc.bank)}
                      className={[
                        "flex items-center gap-gp-lg p-pad-xl rounded-radius-lg",
                        "border text-left",
                        "transition-[border-color,background-color,box-shadow] duration-150",
                        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
                        // Selected: bg verde claro (success-muted) + border-success
                        // Sergio pediu "verde fraco" pra reforçar visualmente o item.
                        isSelected
                          ? "border-border-success bg-bg-success-muted shadow-sh-sm"
                          : "border-border-default bg-bg-surface hover:border-border-input hover:bg-bg-muted",
                      ].join(" ")}
                    >
                      <div
                        className="size-form-md rounded-full grid place-items-center text-white text-body-sm font-bold shrink-0"
                        style={{ backgroundColor: bankMeta.color }}
                        aria-hidden="true"
                      >
                        {bankMeta.initials}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0 gap-gp-3xs">
                        <div className="flex items-center gap-gp-sm">
                          <span className="text-body-sm font-semibold text-fg-default truncate">
                            {acc.bankName}
                          </span>
                          {isRecommended && (
                            <Chip
                              color="success"
                              variant="soft"
                              size="sm"
                              shape="rounded"
                            >
                              Recomendado
                            </Chip>
                          )}
                        </div>
                        <span className="text-caption-md text-fg-muted tabular-nums">
                          Ag {acc.agency} · Conta {acc.account}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="size-icon-sm text-fg-success shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </TabsContent>

            {/* Tab 2: outra conta — placeholder pra cadastro futuro */}
            <TabsContent value="outra" className="mt-pad-lg">
              <div className="flex flex-col items-center justify-center gap-gp-md p-pad-3xl rounded-radius-lg border border-dashed border-border-default bg-bg-muted">
                <div className="size-form-lg rounded-full bg-bg-brand-subtle text-fg-brand grid place-items-center">
                  <Plus className="size-icon-md" />
                </div>
                <div className="flex flex-col items-center gap-gp-3xs text-center">
                  <span className="text-body-sm font-semibold text-fg-default">
                    Cadastrar nova conta
                  </span>
                  <span className="text-caption-md text-fg-muted">
                    Informe os dados de uma conta diferente das já cadastradas
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Modal>
  );
}

