import {
  ArrowDownLeft,
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
  Wallet,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar-ig";
import { Chip } from "@/components/ui/Chip";
import {
  ACCOUNT_STATUS,
  BANKS,
  formatBRL,
  formatDateTimeShort,
} from "../../clientes-financeiro-mocks";
import type { FinanceClientRow } from "../../clientes-financeiro.types";

/* ── Linha do extrato ───────────────────────────────────────────── */

function TransactionRow({
  date,
  type,
  amount,
  description,
}: FinanceClientRow["transactions"][number]) {
  const isIn = type === "in";
  return (
    <li className="flex items-center gap-gp-md py-pad-sm">
      <span
        className={`grid place-items-center size-form-md shrink-0 rounded-radius-md ${
          isIn
            ? "bg-bg-success-muted text-fg-success"
            : "bg-bg-danger-muted text-fg-danger"
        }`}
        aria-hidden="true"
      >
        {isIn ? (
          <ArrowDownLeft className="size-icon-sm" strokeWidth={2} />
        ) : (
          <ArrowUpRight className="size-icon-sm" strokeWidth={2} />
        )}
      </span>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-body-sm font-medium text-fg-default truncate">
          {description}
        </span>
        <span className="text-caption-md text-fg-muted tabular-nums">
          {formatDateTimeShort(date)}
        </span>
      </div>
      <span
        className={`text-body-sm font-semibold tabular-nums shrink-0 ${
          isIn ? "text-fg-success" : "text-fg-danger"
        }`}
      >
        {isIn ? "+" : "−"} {formatBRL(amount)}
      </span>
    </li>
  );
}

/* ── Item label/valor das colunas laterais ─────────────────────── */

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-gp-sm">
      <Icon className="size-icon-sm text-fg-muted mt-[2px] shrink-0" strokeWidth={1.8} />
      <div className="flex flex-col gap-gp-2xs min-w-0">
        <span className="text-body-sm text-fg-strong break-words">{children}</span>
        <span className="text-body-xs font-normal text-fg-muted">{label}</span>
      </div>
    </div>
  );
}

/* ── Painel de expansão da row ──────────────────────────────────── */

export function ExtratoExpansion({ row }: { row: FinanceClientRow }) {
  const status = ACCOUNT_STATUS[row.accountStatus];
  const bank = BANKS[row.bankAccount.bank];
  // Extrato exibe as 5 movimentações mais recentes (transactions já vem ordenado desc).
  const recent = row.transactions.slice(0, 5);

  return (
    <div className="w-full p-pad-4xl bg-bg-subtle">
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-gp-4xl lg:gap-gp-6xl max-w-[1100px]">
        {/* Extrato */}
        <section className="flex flex-col gap-gp-lg">
          <header className="flex items-center justify-between gap-gp-md">
            <h4 className="m-0 text-body-md font-semibold text-fg-muted uppercase tracking-wider">
              Extrato recente
            </h4>
            <Chip color={status.color} variant="soft" size="sm" shape="pill">
              {status.label}
            </Chip>
          </header>
          <ul className="flex flex-col divide-y divide-border-subtle m-0 p-0 list-none">
            {recent.map((tx) => (
              <TransactionRow key={tx.id} {...tx} />
            ))}
          </ul>
        </section>

        {/* Dados bancários + contato + resumo — separados do extrato por
            divisória sutil + respiro (evita poluição visual de "grudado"). */}
        <div className="flex flex-col gap-gp-3xl lg:pl-gp-6xl lg:border-l lg:border-border-subtle">
          <section className="flex flex-col gap-gp-md">
            <h4 className="m-0 text-body-md font-semibold text-fg-muted uppercase tracking-wider">
              Conta bancária
            </h4>
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
          </section>

          <section className="flex flex-col gap-gp-md">
            <h4 className="m-0 text-body-md font-semibold text-fg-muted uppercase tracking-wider">
              Contato
            </h4>
            <InfoRow icon={Mail} label="Email">{row.email}</InfoRow>
            <InfoRow icon={Phone} label="Telefone">{row.phone}</InfoRow>
            <InfoRow icon={MapPin} label="Localização">{row.location}</InfoRow>
          </section>

          <section className="flex flex-col gap-gp-md">
            <h4 className="m-0 text-body-md font-semibold text-fg-muted uppercase tracking-wider">
              Resumo financeiro
            </h4>
            <InfoRow icon={Wallet} label="Saldo disponível">
              <span className="font-semibold tabular-nums text-fg-success">
                {formatBRL(row.availableBalance)}
              </span>
            </InfoRow>
            <div className="flex gap-gp-2xl">
              <div className="flex flex-col gap-gp-2xs">
                <span className="text-body-sm font-medium text-fg-default tabular-nums">
                  {formatBRL(row.monthlyVolume)}
                </span>
                <span className="text-body-xs font-normal text-fg-muted">Volume mensal</span>
              </div>
              <div className="flex flex-col gap-gp-2xs">
                <span className="text-body-sm font-medium text-fg-default tabular-nums">
                  {row.commissionRate.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}%
                </span>
                <span className="text-body-xs font-normal text-fg-muted">Comissão</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
