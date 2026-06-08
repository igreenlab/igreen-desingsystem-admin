import { useState, type ReactNode } from "react";
import { ChevronDown, Pencil, Banknote } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import { FloatingPanel } from "@/components/ui/FloatingPanel";
import { tv } from "@/utils/tv";
import {
  BANKS,
  formatBRL,
} from "../../clientes-financeiro-mocks";
import {
  FINANCE_STATUS_META,
  type FinanceClientRow,
} from "../../clientes-financeiro.types";

/* ── Styles (replicados do DetailDrawer ClientesShowcase) ──────────── */

const drawerStyles = tv({
  slots: {
    section: "border-b border-border-default last:border-b-0",
    sectionHead: [
      "flex items-center justify-between w-full",
      "px-[18px] py-[14px]",
      "bg-transparent border-0 cursor-pointer text-left",
      "text-body-sm font-semibold text-fg-default",
      "transition-colors duration-150",
      "hover:bg-bg-muted",
      "focus-visible:outline-none focus-visible:bg-bg-muted",
    ],
    sectionChev: "size-[14px] text-fg-muted transition-transform duration-200",
    sectionChevOpen: "rotate-180",
    sectionBody: "flex flex-col gap-gp-md px-[18px] pb-pad-2xl",

    field: "flex items-baseline justify-between gap-gp-md text-body-sm font-normal",
    fieldLabel: "text-body-xs font-normal text-fg-muted shrink-0",
    fieldValue: "text-fg-default text-right break-words min-w-0",
  },
});

/* ── Helpers ───────────────────────────────────────────────────────── */

function formatLongDate(ms: number): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type SectionId = "contact" | "finance" | "company" | "meta";

type FieldProps = {
  label: string;
  value: ReactNode;
  s: ReturnType<typeof drawerStyles>;
};

function Field({ label, value, s }: FieldProps) {
  return (
    <div className={s.field()}>
      <span className={s.fieldLabel()}>{label}</span>
      <span className={s.fieldValue()}>{value || "—"}</span>
    </div>
  );
}

type SectionProps = {
  id: SectionId;
  title: string;
  open: boolean;
  onToggle: (id: SectionId) => void;
  children: ReactNode;
  s: ReturnType<typeof drawerStyles>;
};

function Section({ id, title, open, onToggle, children, s }: SectionProps) {
  return (
    <section className={s.section()}>
      <button
        type="button"
        className={s.sectionHead()}
        onClick={() => onToggle(id)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown
          className={[s.sectionChev(), open ? s.sectionChevOpen() : ""].join(" ")}
        />
      </button>
      {open && <div className={s.sectionBody()}>{children}</div>}
    </section>
  );
}

/* ── Props públicas ────────────────────────────────────────────────── */

export type FinanceDetailDrawerProps = {
  row: FinanceClientRow | null;
  onClose: () => void;
  /** Editar — dispara abertura do drawer de edição (NovoClienteDrawer). */
  onEdit?: (row: FinanceClientRow) => void;
  /** Sacar — dispara abertura do SacarDialog. */
  onSacar?: (row: FinanceClientRow) => void;
};

/* ── FinanceDetailDrawer ───────────────────────────────────────────── */

/**
 * Drawer "Detalhes do licenciado" — variante financeira do DetailDrawer.
 *
 * Replica visual do `DetailDrawer` da ClientesShowcase (FloatingPanel +
 * sections collapsibles) mas com seções financeiras: status + saldo +
 * conta bancária + razão social + CNPJ.
 */
export function FinanceDetailDrawer({
  row,
  onClose,
  onEdit,
  onSacar,
}: FinanceDetailDrawerProps) {
  const s = drawerStyles();
  const [openSections, setOpenSections] = useState<Set<SectionId>>(
    () => new Set(["contact", "finance", "company"]),
  );

  const toggle = (id: SectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!row) return null;

  const statusMeta = FINANCE_STATUS_META[row.financeStatus];
  const bankMeta = BANKS[row.bankAccount.bank];
  const nameInitials = row.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
      resizableStorageKey="clientes-financeiro.detail-drawer.width"
      titleSlot={
        <div className="flex items-center gap-gp-md min-w-0">
          <Avatar
            size="xl"
            colorHex={row.avatarColor}
            className="shrink-0 text-body-md font-bold"
          >
            {row.initials || nameInitials}
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="text-body-md font-semibold text-fg-default whitespace-nowrap overflow-hidden text-ellipsis">
              {row.name}
            </div>
            <div className="flex items-center gap-gp-xs mt-[2px] text-body-xs font-normal text-fg-muted">
              <span>{row.id}</span>
              <span className="opacity-50">·</span>
              <Chip
                color={statusMeta.color}
                variant="soft"
                size="sm"
                shape="rounded"
              >
                {statusMeta.label}
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
            aria-label="Editar"
            onClick={() => onEdit?.(row)}
          >
            <Pencil />
          </Button>
          <Button
            variant="soft"
            color="primary"
            size="icon-sm"
            aria-label="Realizar saque"
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
            iconLeft={<Banknote />}
            onClick={() => onSacar?.(row)}
          >
            Realizar saque
          </Button>
        </>
      }
    >
      {/* Contato — email + tel + localização */}
      <Section
        id="contact"
        title="Contato"
        open={openSections.has("contact")}
        onToggle={toggle}
        s={s}
      >
        <Field
          label="Email"
          value={
            <a
              href={`mailto:${row.email}`}
              className="text-fg-brand hover:underline"
            >
              {row.email}
            </a>
          }
          s={s}
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
          s={s}
        />
        <Field label="Localização" value={row.location} s={s} />
      </Section>

      {/* Financeiro — saldo disponível + conta bancária + status */}
      <Section
        id="finance"
        title="Financeiro"
        open={openSections.has("finance")}
        onToggle={toggle}
        s={s}
      >
        <Field
          label="Status"
          value={
            <Chip
              color={statusMeta.color}
              variant="soft"
              size="sm"
              shape="rounded"
            >
              {statusMeta.label}
            </Chip>
          }
          s={s}
        />
        <Field
          label="Saldo disponível"
          value={
            <span className="font-semibold tabular-nums text-fg-success">
              {formatBRL(row.availableBalance)}
            </span>
          }
          s={s}
        />
        <Field
          label="Banco"
          value={
            <span className="inline-flex items-center gap-gp-sm">
              <Avatar
                size="sm"
                colorHex={bankMeta.color}
                className="text-caption-xs font-bold"
              >
                {bankMeta.initials}
              </Avatar>
              {row.bankAccount.bankName}
            </span>
          }
          s={s}
        />
        <Field
          label="Agência"
          value={
            <span className="tabular-nums">{row.bankAccount.agency}</span>
          }
          s={s}
        />
        <Field
          label="Conta"
          value={
            <span className="tabular-nums">{row.bankAccount.account}</span>
          }
          s={s}
        />
      </Section>

      {/* Empresa — razão social + CNPJ */}
      <Section
        id="company"
        title="Empresa"
        open={openSections.has("company")}
        onToggle={toggle}
        s={s}
      >
        <Field label="Razão Social" value={row.companyName} s={s} />
        <Field
          label="CNPJ"
          value={<span className="tabular-nums">{row.cnpj}</span>}
          s={s}
        />
      </Section>

      {/* Atendimento — datas + ID */}
      <Section
        id="meta"
        title="Atendimento"
        open={openSections.has("meta")}
        onToggle={toggle}
        s={s}
      >
        <Field label="ID" value={row.id} s={s} />
        <Field
          label="Cliente desde"
          value={formatLongDate(row.createdAt)}
          s={s}
        />
      </Section>
    </FloatingPanel>
  );
}
