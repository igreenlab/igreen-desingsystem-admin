import { useEffect, useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button/button";
import {
  FormField,
  FormFieldInput,
  FormFieldSelect,
} from "@/components/ui/FormField";
import { ChipGroup, ChipGroupItem } from "@/components/ui/Chip";
import { Switch } from "@/components/shadcn/switch";
import { AGENTS } from "../../../TableDoc";
import { ACCOUNT_STATUS, BANKS } from "../../clientes-financeiro-mocks";
import type {
  AccountStatus,
  BankId,
  FinanceClientRow,
  PaymentMethod,
} from "../../clientes-financeiro.types";

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "pix", label: "PIX" },
  { value: "ted", label: "TED" },
  { value: "boleto", label: "Boleto" },
];

const BANK_OPTIONS = (Object.keys(BANKS) as BankId[]).map((id) => ({
  value: id,
  label: BANKS[id].name,
}));

const AGENT_OPTIONS = Object.entries(AGENTS).map(([id, a]) => ({
  value: id,
  label: a.name,
}));

const STATUS_OPTIONS = (
  Object.entries(ACCOUNT_STATUS) as [AccountStatus, (typeof ACCOUNT_STATUS)[AccountStatus]][]
).map(([value, m]) => ({ value, label: m.label, color: m.color }));

/** Campos editáveis da row financeira. */
export type FinanceEditPatch = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  cnpj: string;
  accountStatus: AccountStatus;
  bank: BankId;
  commissionRate: number;
  autoWithdraw: boolean;
  paymentMethods: PaymentMethod[];
  agentId: string;
};

export type EditarFinanceDrawerProps = {
  /** Row em edição — null fecha o drawer. */
  client: FinanceClientRow | null;
  onOpenChange: (open: boolean) => void;
  /** Salva as alterações (mock no showcase). */
  onSave?: (id: string, patch: FinanceEditPatch) => void;
};

/**
 * Drawer "Editar licenciado" — campos REAIS da row financeira (não o form
 * genérico de criação). Panel + FormField (Input/Select) + ChipGroup + Switch.
 */
export function EditarFinanceDrawer({
  client,
  onOpenChange,
  onSave,
}: EditarFinanceDrawerProps) {
  const [form, setForm] = useState<FinanceEditPatch | null>(null);

  // (Re)hidrata o form ao abrir/trocar de cliente.
  useEffect(() => {
    if (!client) return;
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      companyName: client.companyName,
      cnpj: client.cnpj,
      accountStatus: client.accountStatus,
      bank: client.bankAccount.bank,
      commissionRate: client.commissionRate,
      autoWithdraw: client.autoWithdraw,
      paymentMethods: client.paymentMethods,
      agentId: client.agentId as string,
    });
  }, [client]);

  const patch = (p: Partial<FinanceEditPatch>) =>
    setForm((f) => (f ? { ...f, ...p } : f));

  const canSave = !!form && form.name.trim().length > 0;

  const handleSave = () => {
    if (!client || !form || !canSave) return;
    onSave?.(client.id, form);
    onOpenChange(false);
  };

  return (
    <Panel
      open={client !== null}
      onOpenChange={onOpenChange}
      title={client ? `Editar — ${client.name}` : "Editar licenciado"}
      side="right"
      size="md"
      footer={
        <>
          <Button variant="outline" color="secondary" size="md" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="filled"
            color="primary"
            size="md"
            disabled={!canSave}
            onClick={handleSave}
          >
            Salvar alterações
          </Button>
        </>
      }
    >
      {form && (
        <>
          <FormFieldInput
            label="Licenciado"
            required
            value={form.name}
            onChange={(e) => patch({ name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-form-gap">
            <FormFieldInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => patch({ email: e.target.value })}
            />
            <FormFieldInput
              label="Telefone"
              type="tel"
              value={form.phone}
              onChange={(e) => patch({ phone: e.target.value })}
            />
          </div>

          <FormFieldInput
            label="Razão Social"
            value={form.companyName}
            onChange={(e) => patch({ companyName: e.target.value })}
          />
          <FormFieldInput
            label="CNPJ"
            value={form.cnpj}
            onChange={(e) => patch({ cnpj: e.target.value })}
          />

          <FormField label="Situação">
            {() => (
              <ChipGroup
                type="single"
                value={form.accountStatus}
                onValueChange={(v) => v && patch({ accountStatus: v as AccountStatus })}
                size="md"
                shape="pill"
                ariaLabel="Situação da conta"
              >
                {STATUS_OPTIONS.map((o) => (
                  <ChipGroupItem key={o.value} value={o.value}>
                    {o.label}
                  </ChipGroupItem>
                ))}
              </ChipGroup>
            )}
          </FormField>

          <div className="grid grid-cols-2 gap-form-gap">
            <FormFieldSelect
              label="Banco"
              value={form.bank}
              onValueChange={(v) => patch({ bank: v as BankId })}
              options={BANK_OPTIONS}
            />
            <FormFieldInput
              label="Comissão (%)"
              type="number"
              value={String(form.commissionRate)}
              onChange={(e) => patch({ commissionRate: Number(e.target.value) })}
              min={0}
              max={100}
              step={0.1}
            />
          </div>

          <FormFieldSelect
            label="Gestor da conta"
            value={form.agentId}
            onValueChange={(v) => patch({ agentId: v })}
            options={AGENT_OPTIONS}
          />

          <FormField label="Métodos de recebimento">
            {() => (
              <ChipGroup
                type="multiple"
                value={form.paymentMethods}
                onValueChange={(v) => patch({ paymentMethods: v as PaymentMethod[] })}
                size="md"
                shape="rounded"
                ariaLabel="Métodos de recebimento"
              >
                {PAYMENT_METHODS.map((m) => (
                  <ChipGroupItem key={m.value} value={m.value}>
                    {m.label}
                  </ChipGroupItem>
                ))}
              </ChipGroup>
            )}
          </FormField>

          <FormField
            label="Saque automático"
            helperText="Quando ligado, saques são processados automaticamente."
          >
            {() => (
              <Switch
                checked={form.autoWithdraw}
                onCheckedChange={(next) => patch({ autoWithdraw: next })}
                aria-label="Saque automático"
              />
            )}
          </FormField>
        </>
      )}
    </Panel>
  );
}
