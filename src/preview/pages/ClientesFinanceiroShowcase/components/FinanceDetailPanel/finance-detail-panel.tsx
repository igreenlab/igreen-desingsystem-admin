import { Banknote, Pencil } from "lucide-react";
import {
  FloatingPanel,
  FloatingPanelSection,
  FloatingPanelField,
} from "@/components/ui/FloatingPanel";
import { Avatar } from "@/components/ui/avatar-ig";
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
      // Sections gerenciam o próprio padding edge-to-edge (divisórias full-width).
      bodyPadded={false}
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
      {/* Saldo em destaque — gutter próprio (body não tem padding). */}
      <div className="px-[18px] pt-pad-xl pb-pad-md">
        <div className="flex flex-col gap-gp-2xs p-pad-2xl bg-bg-success-muted rounded-radius-lg">
          <span className="text-caption-sm text-fg-muted">Saldo disponível</span>
          <span className="text-body-2xl font-bold text-fg-success leading-none tabular-nums">
            {formatBRL(row.availableBalance)}
          </span>
        </div>
      </div>

      <FloatingPanelSection title="Empresa">
        <FloatingPanelField label="Razão Social" value={row.companyName} />
        <FloatingPanelField
          label="CNPJ"
          value={<span className="tabular-nums">{row.cnpj}</span>}
        />
      </FloatingPanelSection>

      <FloatingPanelSection title="Conta bancária">
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
      </FloatingPanelSection>

      <FloatingPanelSection title="Financeiro">
        <FloatingPanelField
          label="Volume mensal"
          value={<span className="tabular-nums">{formatBRL(row.monthlyVolume)}</span>}
        />
        <FloatingPanelField
          label="Comissão"
          value={
            <span className="tabular-nums">
              {row.commissionRate.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}%
            </span>
          }
        />
        <FloatingPanelField
          label="Saque automático"
          value={row.autoWithdraw ? "Ativado" : "Desativado"}
        />
        <FloatingPanelField
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
      </FloatingPanelSection>

      <FloatingPanelSection title="Contato">
        <FloatingPanelField
          label="Email"
          value={
            <a href={`mailto:${row.email}`} className="text-fg-brand hover:underline">
              {row.email}
            </a>
          }
        />
        <FloatingPanelField
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
        <FloatingPanelField label="Localização" value={row.location} />
      </FloatingPanelSection>

      <FloatingPanelSection title="Gestão">
        <FloatingPanelField
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
        <FloatingPanelField label="Cliente desde" value={formatLongDate(row.createdAt)} />
        <FloatingPanelField
          label="Última movimentação"
          value={formatRelativeDays(row.lastMovement)}
        />
      </FloatingPanelSection>
    </FloatingPanel>
  );
}
