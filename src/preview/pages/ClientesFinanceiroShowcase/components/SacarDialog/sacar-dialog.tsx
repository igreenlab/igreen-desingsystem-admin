import { useEffect, useMemo, useState } from "react";
import { Banknote, Check, Wallet } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  FormField,
  FormFieldInput,
  FormFieldSelect,
} from "@/components/ui/FormField";
import { CardCheckbox } from "@/components/ui/CardCheckbox";
import { Avatar } from "@/components/ui/Avatar";
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
/** Aba ativa no seletor de "Conta de destino". */
type AccountTab = "cadastradas" | "outra";

/** Form da aba "Outra conta" — cadastro de nova conta bancária. */
type NewAccountForm = {
  bank: BankId | "";
  agency: string;
  account: string;
  saveForLater: boolean;
};

const EMPTY_NEW_ACCOUNT: NewAccountForm = {
  bank: "",
  agency: "",
  account: "",
  saveForLater: true,
};

const BANK_SELECT_OPTIONS = (Object.keys(BANKS) as BankId[]).map((id) => ({
  value: id,
  label: BANKS[id].name,
}));

export function SacarDialog({
  open,
  onOpenChange,
  client,
  onConfirm,
}: SacarDialogProps) {
  const [amountStr, setAmountStr] = useState("");
  const [selectedBank, setSelectedBank] = useState<BankId | null>(null);
  const [activeTab, setActiveTab] = useState<AccountTab>("cadastradas");
  const [newAccount, setNewAccount] =
    useState<NewAccountForm>(EMPTY_NEW_ACCOUNT);

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      setAmountStr("");
      setSelectedBank(SACAR_ACCOUNT_OPTIONS[0]?.bank ?? null);
      setActiveTab("cadastradas");
      setNewAccount(EMPTY_NEW_ACCOUNT);
    }
  }, [open]);

  const limit = client?.availableBalance ?? 0;
  const amount = useMemo(() => {
    const parsed = Number(amountStr.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amountStr]);

  const overLimit = amount > limit;

  // Form da nova conta: válido quando bank + agency + account preenchidos
  const newAccountValid = !!(
    newAccount.bank &&
    newAccount.agency.trim() &&
    newAccount.account.trim()
  );

  // canSubmit depende da aba ativa
  const canSubmit =
    !!client &&
    amount > 0 &&
    !overLimit &&
    (activeTab === "cadastradas" ? !!selectedBank : newAccountValid);

  const handleConfirm = () => {
    if (!canSubmit || !client) return;

    let account: BankAccount | undefined;
    if (activeTab === "cadastradas" && selectedBank) {
      account = SACAR_ACCOUNT_OPTIONS.find((a) => a.bank === selectedBank);
    } else if (activeTab === "outra" && newAccountValid && newAccount.bank) {
      account = {
        bank: newAccount.bank,
        bankName: BANKS[newAccount.bank].name,
        agency: newAccount.agency.trim(),
        account: newAccount.account.trim(),
      };
    }
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
         *  - Label `text-fg-strong` (preto light / branco dark, sem fade).
         *  - Gap label↔valor = 4px (gp-xs) pra dar respiro.
         *  - Valor agora text-body-xl (18px, +2px do anterior body-lg=16px). */}
        <div className="flex items-center justify-between p-pad-2xl rounded-radius-lg bg-bg-brand-subtle border border-border-brand">
          <div className="flex items-center gap-gp-xl">
            <div className="size-form-md rounded-radius-md bg-bg-brand text-white grid place-items-center">
              <Wallet className="size-icon-sm" />
            </div>
            <div className="flex flex-col gap-gp-xs">
              <span className="text-caption-md font-semibold text-fg-strong">
                Saldo disponível pra saque
              </span>
              <span className="text-body-xl font-bold text-fg-brand tabular-nums leading-none">
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
            overLimit
              ? `Valor acima do limite (${formatBRL(limit)})`
              : undefined
          }
        />

        {/* Conta de destino — Tabs separando contas cadastradas vs nova.
         *  FormField com children render-prop (L-023) — widget custom (Tabs)
         *  herda o label padrão do DS sem replicar classes na unha. */}
        <FormField label="Conta de destino">
          {() => (
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as AccountTab)}
              className="w-full"
            >
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
                          // Selected: bg verde fraco (success-muted) + border-brand
                          // (padrão igual ao card do Saldo disponível) — antes
                          // border-success deixava a borda branca no dark mode.
                          isSelected
                            ? "border-border-brand bg-bg-success-muted shadow-sh-sm"
                            : "border-border-default bg-bg-surface hover:border-border-input hover:bg-bg-muted",
                        ].join(" ")}
                      >
                        <Avatar
                          size="lg"
                          colorHex={bankMeta.color}
                          className="text-body-sm font-bold"
                        >
                          {bankMeta.initials}
                        </Avatar>
                        <div className="flex flex-col flex-1 min-w-0 gap-gp-2xs">
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

              {/* Tab 2: outra conta — formulário pra cadastrar nova conta.
               *  Campos: banco (select), agência, conta + CardCheckbox "salvar".
               *  `gap-form-gap` (20px) = token DS pra spacing entre fields. */}
              <TabsContent value="outra" className="mt-pad-lg">
                <div className="flex flex-col gap-form-gap">
                  <FormFieldSelect
                    label="Banco"
                    required
                    placeholder="Selecione o banco"
                    options={BANK_SELECT_OPTIONS}
                    value={newAccount.bank || undefined}
                    onValueChange={(v) =>
                      setNewAccount((s) => ({ ...s, bank: v as BankId }))
                    }
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-form-gap">
                    <FormFieldInput
                      label="Agência"
                      required
                      placeholder="0000"
                      value={newAccount.agency}
                      onChange={(e) =>
                        setNewAccount((s) => ({ ...s, agency: e.target.value }))
                      }
                    />
                    <FormFieldInput
                      label="Conta"
                      required
                      placeholder="00000-0"
                      value={newAccount.account}
                      onChange={(e) =>
                        setNewAccount((s) => ({
                          ...s,
                          account: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <CardCheckbox
                    label="Salvar essa conta pra usar depois"
                    description="A conta aparecerá nas próximas vezes em 'Contas cadastradas'."
                    checked={newAccount.saveForLater}
                    onCheckedChange={(v) =>
                      setNewAccount((s) => ({ ...s, saveForLater: v === true }))
                    }
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </FormField>
      </div>
    </Modal>
  );
}
