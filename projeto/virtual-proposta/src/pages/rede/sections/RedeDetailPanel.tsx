import { useState, type ReactNode } from "react";
import {
  ChevronDown,
  Users,
  Check,
  MessageCircle,
  Link2,
  Network,
} from "lucide-react";
import { FloatingPanel } from "@/components/ui/FloatingPanel";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";
import { redeById, kwh, num, brl } from "../rede-mock";

type SectionId =
  | "metricas"
  | "volume"
  | "bonus"
  | "pro"
  | "trajetoria"
  | "info";

const ALL: SectionId[] = [
  "metricas",
  "volume",
  "bonus",
  "pro",
  "trajetoria",
  "info",
];

/* ── Section colapsável (espelha o DetailDrawer do clientes-showcase) ── */
function Section({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: SectionId;
  title: string;
  open: boolean;
  onToggle: (id: SectionId) => void;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-border-default last:border-b-0">
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent px-[18px] py-[14px] text-left text-body-sm font-semibold text-fg-default transition-colors duration-150 hover:bg-bg-muted focus-visible:bg-bg-muted focus-visible:outline-none"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "size-[14px] text-fg-muted transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-gp-md px-[18px] pb-pad-2xl">
          {children}
        </div>
      )}
    </section>
  );
}

/* ── Field label : value ────────────────────────────────────────────── */
function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-gp-md text-body-sm font-normal">
      <span className="shrink-0 text-body-xs font-normal text-fg-muted">
        {label}
      </span>
      <span className="min-w-0 break-words text-right text-fg-default">
        {value || "—"}
      </span>
    </div>
  );
}

/* ── KPI da seção Métricas ──────────────────────────────────────────── */
function Kpi({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-radius-lg border border-border-subtle bg-bg-surface px-pad-2xl py-pad-lg">
      <span className="inline-flex items-center gap-gp-sm text-title-lg font-bold tabular-nums text-fg-success [&>svg]:size-icon-sm">
        <Users />
        {value}
      </span>
      <p className="mt-gp-2xs text-caption-md text-fg-muted">{label}</p>
    </div>
  );
}

/** Painel de detalhe do consultor — FloatingPanel + seções colapsáveis. */
export function RedeDetailPanel({
  consultorId,
  onClose,
}: {
  consultorId: string | null;
  onClose: () => void;
}) {
  const c = consultorId ? redeById[consultorId] : undefined;
  const [open, setOpen] = useState<Set<SectionId>>(() => new Set(ALL));
  const toggle = (id: SectionId) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (!c) return null;

  return (
    <FloatingPanel
      open={!!c}
      onOpenChange={(o) => !o && onClose()}
      side="right"
      size="md"
      resizable
      maximizable
      bodyPadded={false}
      resizableStorageKey="rede-visao.detail.width"
      titleSlot={
        <div className="flex min-w-0 items-center gap-gp-md">
          <span className="grid size-[40px] shrink-0 place-items-center rounded-radius-md bg-bg-brand-subtle text-fg-brand [&>svg]:size-icon-md">
            <Network />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="overflow-hidden text-ellipsis whitespace-nowrap text-body-md font-semibold text-fg-default">
              {c.nome}
            </div>
            <div className="mt-[2px] text-body-xs font-normal text-fg-muted">
              {c.graduacao} · {c.cidade} · ID {c.codigo}
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <Button
            variant="outline"
            color="secondary"
            size="sm"
            iconLeft={<Link2 />}
            onClick={() => navigator.clipboard?.writeText(`#${c.codigo}`)}
          >
            Copiar Link
          </Button>
          <Button
            variant="filled"
            color="success"
            size="sm"
            iconLeft={<MessageCircle />}
            onClick={() => window.open("https://wa.me/", "_blank")}
          >
            WhatsApp
          </Button>
        </>
      }
    >
      {/* Métricas — KPIs */}
      <Section
        id="metricas"
        title="Métricas"
        open={open.has("metricas")}
        onToggle={toggle}
      >
        <div className="grid grid-cols-2 gap-gp-md">
          <Kpi value={num(c.clientes)} label="Clientes Ativos" />
          <Kpi
            value={`${c.licGreen.atual}/${c.licGreen.meta}`}
            label="Lic. Diretos Ativos"
          />
        </div>
      </Section>

      {/* Volume kWh — lista */}
      <Section
        id="volume"
        title="Volume kWh"
        open={open.has("volume")}
        onToggle={toggle}
      >
        <Field label="GP (Geração Própria)" value={kwh(c.gp)} />
        <Field label="GI (Geração Indireta)" value={kwh(c.gi)} />
        <Field label="Bonificável" value={kwh(c.bonificavel)} />
        <Field label="Qualificável (com KML)" value={kwh(c.qualificavel)} />
      </Section>

      {/* Bonificação */}
      <Section
        id="bonus"
        title="Bonificação"
        open={open.has("bonus")}
        onToggle={toggle}
      >
        <Field
          label="Prévia de bônus"
          value={
            <span className="font-semibold text-fg-success">
              {brl(c.previaBonus)}
            </span>
          }
        />
        <Field label="Próxima graduação" value={c.proximaGrad} />
      </Section>

      {/* Construção PRO (mês) — checklist */}
      <Section
        id="pro"
        title="Construção PRO (mês)"
        open={open.has("pro")}
        onToggle={toggle}
      >
        <Chip color="warning" variant="soft" size="sm" shape="pill">
          Em construção
        </Chip>
        <ul className="flex flex-col gap-gp-sm">
          {c.proConstrucao.map((e) => (
            <li key={e.label} className="flex items-center gap-gp-md">
              <span
                className={cn(
                  "grid size-[18px] shrink-0 place-items-center rounded-radius-full border",
                  e.done
                    ? "border-transparent bg-bg-success text-fg-on-success"
                    : "border-border-default",
                )}
              >
                {e.done && <Check className="size-[11px]" strokeWidth={3} />}
              </span>
              <span
                className={cn(
                  "text-body-sm",
                  e.done ? "text-fg-default" : "text-fg-muted",
                )}
              >
                {e.label}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Trajetória PRO — chips */}
      {c.trajetoria.length > 0 && (
        <Section
          id="trajetoria"
          title={`Trajetória PRO · ${c.trajetoria.length} meses`}
          open={open.has("trajetoria")}
          onToggle={toggle}
        >
          <div className="flex flex-wrap gap-gp-sm">
            {c.trajetoria.map((m) => (
              <Chip key={m} color="warning" variant="soft" size="sm">
                {m}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {/* Informações — lista */}
      <Section
        id="info"
        title="Informações"
        open={open.has("info")}
        onToggle={toggle}
      >
        <Field label="Nível" value={String(c.nivel)} />
        <Field label="Aniversário" value={c.aniversario} />
        <Field label="Validade da licença" value={c.validade} />
      </Section>
    </FloatingPanel>
  );
}
