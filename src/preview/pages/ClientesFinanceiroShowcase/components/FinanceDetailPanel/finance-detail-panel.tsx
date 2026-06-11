import type { ReactNode } from "react";
import { Banknote, Pencil } from "lucide-react";
import { FloatingPanel } from "@/components/ui/FloatingPanel";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import { AGENTS } from "../../../TableDoc";
import {
  ACCOUNT_STATUS,
  BANKS,
  formatBRL,
  formatRelativeDays,
} from "../../clientes-financeiro-mocks";
import type {
  FinanceClientRow,
  PaymentMethod,
} from "../../clientes-financeiro.types";

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  pix: "PIX",
  ted: "TED",
  boleto: "Boleto",
};

function formatLongDate(ms: number): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ── Field + Section ────────────────────────────────────────────── */

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-gp-md">
      <span className="text-body-sm text-fg-muted shrink-0">{label}</span>
      <span className="text-body-sm font-medium text-fg-default text-right min-w-0">
        {value || "—"}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-gp-md">
      <h4 className="m-0 text-caption-sm font-semibold text-fg-subtle uppercase tracking-wider">
        {title}
      </h4>
      <div className="flex flex-col gap-gp-md">{children}</div>
    </section>
  );
}

/* ── FinanceDetailPanel ─────────────────────────────────────────── */

export type FinanceDetailPanelProps = {
  row: FinanceClientRow | null;
  onClose: () => void;
  onEdit?: (row: FinanceClientRow) => void;
  onSacar?: (row: FinanceClientRow) => void;
};

export function FinanceDetailPanel({
  row,
  onClose,
  onEdit,
  onSacar,
}: FinanceDetailPanelProps) {
  if (!row) return null;

  const status = ACCOUNT_STATUS[row.accountStatus];
  const bank = BANKS[row.bankAccount.bank];
  const agent = AGENTS[row.agentId as keyof typeof AGENTS];
  const blocked = row.accountStatus === "bloqueado";

  return (
    <FloatingPanel
      open={row !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      side="right"
      size="md"
      resizable
      maximizable
      resizableStorageKey="clientes-financeiro.detail-panel.width"
      titleSlot={
        <div className="flex items-center gap-gp-md min-w-0">
          <Avatar size="lg" colorHex={row.avatarColor} className="shrink-0">
            {row.initials}
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="text-body-md font-semibold text-fg-default truncate">
              {row.name}
            </div>
            <div className="flex items-center gap-gp-sm mt-[2px] text-body-xs font-normal text-fg-muted">
              <span className="tabular-nums">{row.id}</span>
              <span className="opacity-50">·</span>
              <Chip color={status.color} variant="soft" size="sm" shape="pill">
                {status.label}
              </Chip>
            </div>
          </div>
        </div>
      }
      headerActions={
        <>
          <Button
            variant="soft"
            color="secondary"
            size="icon-sm"
            aria-label="Editar dados"
            onClick={() => onEdit?.(row)}
          >
            <Pencil />
          </Button>
          <Button
            variant="soft"
            color="primary"
            size="icon-sm"
            aria-label="Realizar saque"
            disabled={blocked}
            onClick={() => onSacar?.(row)}
          >
            <Banknote />
          </Button>
        </>
      }
      footer={
        <>
          <Button variant="outline" color="secondary" size="sm" onClick={onClose}>
            Fechar
          </Button>
          <Button
            variant="filled"
            color="primary"
            size="sm"
            disabled={blocked}
            onClick={() => onSacar?.(row)}
          >
            Realizar saque
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-gp-3xl">
        {/* Saldo em destaque */}
        <div className="flex flex-col gap-gp-2xs p-pad-2xl bg-bg-success-muted rounded-radius-lg">
          <span className="text-caption-sm text-fg-muted">Saldo disponível</span>
          <span className="text-body-2xl font-bold text-fg-success leading-none tabular-nums">
            {formatBRL(row.availableBalance)}
          </span>
        </div>

        <Section title="Empresa">
          <Field label="Razão Social" value={row.companyName} />
          <Field
            label="CNPJ"
            value={<span className="tabular-nums">{row.cnpj}</span>}
          />
        </Section>

        <Section title="Conta bancária">
          <div className="flex items-center gap-gp-md">
            <Avatar size="lg" colorHex={bank.color} className="text-caption-md font-bold">
              {bank.initials}
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-body-sm font-medium text-fg-default truncate">
                {row.bankAccount.bankName}
              </span>
              <span className="text-caption-md text-fg-muted tabular-nums">
                Ag {row.bankAccount.agency} · {row.bankAccount.account}
              </span>
            </div>
          </div>
        </Section>

        <Section title="Financeiro">
          <Field
            label="Volume mensal"
            value={<span className="tabular-nums">{formatBRL(row.monthlyVolume)}</span>}
          />
          <Field
            label="Comissão"
            value={
              <span className="tabular-nums">
                {row.commissionRate.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}%
              </span>
            }
          />
          <Field
            label="Saque automático"
            value={row.autoWithdraw ? "Ativado" : "Desativado"}
          />
          <Field
            label="Métodos"
            value={
              <span className="inline-flex flex-wrap gap-gp-2xs justify-end">
                {row.paymentMethods.map((m) => (
                  <Chip key={m} color="neutral" variant="soft" size="sm" shape="rounded">
                    {PAYMENT_METHOD_LABEL[m]}
                  </Chip>
                ))}
              </span>
            }
          />
        </Section>

        <Section title="Contato">
          <Field
            label="Email"
            value={
              <a href={`mailto:${row.email}`} className="text-fg-brand hover:underline">
                {row.email}
              </a>
            }
          />
          <Field
            label="Telefone"
            value={
              <a
                href={`tel:${row.phone.replace(/\D/g, "")}`}
                className="text-fg-brand hover:underline"
              >
                {row.phone}
              </a>
            }
          />
          <Field label="Localização" value={row.location} />
        </Section>

        <Section title="Gestão">
          <Field
            label="Gestor da conta"
            value={
              agent ? (
                <span className="inline-flex items-center gap-gp-sm">
                  <Avatar size="xs" colorHex={agent.color}>
                    {agent.initials}
                  </Avatar>
                  {agent.name}
                </span>
              ) : (
                "—"
              )
            }
          />
          <Field label="Cliente desde" value={formatLongDate(row.createdAt)} />
          <Field label="Última movimentação" value={formatRelativeDays(row.lastMovement)} />
        </Section>
      </div>
    </FloatingPanel>
  );
}
