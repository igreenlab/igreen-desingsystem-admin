import { useState, type ReactNode } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/shadcn/avatar";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import { FloatingPanel } from "@/components/ui/FloatingPanel";
import { STATUSES, CATEGORIES, AGENTS } from "../../../TableDoc";
import {
  CATEGORY_KIND,
  STATUS_DOT,
  formatBRL,
  formatShortDate,
} from "../../clientes-showcase-mocks";
import { detailDrawerStyles } from "./detail-drawer.styles";
import type { DetailDrawerProps } from "./detail-drawer.types";

/* ── Helpers internos ────────────────────────────────────────────── */

function formatLongDate(ms: number): string {
  if (!ms) return "—";
  const d = new Date(ms);
  return d.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type SectionId = "contact" | "meta" | "notes";

/* ── DetailField (label : value) ────────────────────────────────── */

type DetailFieldProps = {
  label: string;
  value: ReactNode;
  s: ReturnType<typeof detailDrawerStyles>;
};

function DetailField({ label, value, s }: DetailFieldProps) {
  return (
    <div className={s.field()}>
      <span className={s.fieldLabel()}>{label}</span>
      <span className={s.fieldValue()}>{value || "—"}</span>
    </div>
  );
}

/* ── DetailSection (collapsible) ─────────────────────────────────── */

type DetailSectionProps = {
  id: SectionId;
  title: string;
  open: boolean;
  onToggle: (id: SectionId) => void;
  children: ReactNode;
  s: ReturnType<typeof detailDrawerStyles>;
};

function DetailSection({
  id,
  title,
  open,
  onToggle,
  children,
  s,
}: DetailSectionProps) {
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

/* ── DetailDrawer ────────────────────────────────────────────────── */

/**
 * Drawer "Detalhes do cliente" — usa `<FloatingPanel>` do DS (non-modal,
 * resizable, maximizable, responsive). Replica visual do `TblDetailsPanel`
 * do sandbox /design-and-table-v2.
 */
export function DetailDrawer({
  row,
  onClose,
  onEdit,
  onDelete,
  onSave,
}: DetailDrawerProps) {
  const s = detailDrawerStyles();
  const [openSections, setOpenSections] = useState<Set<SectionId>>(
    () => new Set(["contact", "meta", "notes"]),
  );

  const toggle = (id: SectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Mantém ordem dos hooks estável independente de `row` — depois do toggle.
  if (!row) return null;

  const status = STATUSES[row.statusId];
  const cat = CATEGORIES[row.categoryId as keyof typeof CATEGORIES];
  const agent = AGENTS[row.agentId as keyof typeof AGENTS];
  const agentInitials =
    agent?.name.split(" ").map((p) => p[0]).join("").slice(0, 2) ?? "?";

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
      resizableStorageKey="clientes-showcase.detail-drawer.width"
      titleSlot={
        <div className="flex items-center gap-gp-md min-w-0">
          <Avatar
            className="size-[40px] shrink-0"
            style={{ background: row.avatarColor }}
          >
            <AvatarFallback className="bg-transparent text-white text-body-md font-bold">
              {row.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="text-body-md font-semibold text-fg-default whitespace-nowrap overflow-hidden text-ellipsis">
              {row.name}
            </div>
            <div className="flex items-center gap-[6px] mt-[2px] text-body-xs font-normal text-fg-muted">
              <span>{row.id}</span>
              <span className="opacity-50">·</span>
              <span className="inline-flex items-center gap-[6px]">
                <span
                  className="inline-block size-[8px] rounded-radius-full shrink-0"
                  style={{ background: STATUS_DOT[row.statusId] ?? status?.color }}
                  aria-hidden
                />
                {status?.label}
              </span>
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
            color="critical"
            size="icon-sm"
            aria-label="Excluir"
            onClick={() => onDelete?.(row)}
          >
            <Trash2 />
          </Button>
        </>
      }
      footer={
        <>
          <Button variant="outline" color="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="filled"
            color="primary"
            size="sm"
            onClick={() => onSave?.(row)}
          >
            Salvar alterações
          </Button>
        </>
      }
    >
      <DetailSection
        id="contact"
        title="Contato"
        open={openSections.has("contact")}
        onToggle={toggle}
        s={s}
      >
        <DetailField
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
        <DetailField
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
        <DetailField label="Localização" value={row.location} s={s} />
      </DetailSection>

      <DetailSection
        id="meta"
        title="Atendimento"
        open={openSections.has("meta")}
        onToggle={toggle}
        s={s}
      >
        <DetailField label="ID" value={row.id} s={s} />
        <DetailField
          label="Categoria"
          value={
            cat ? (
              <Chip
                color={CATEGORY_KIND[row.categoryId] ?? "info"}
                variant="soft"
                size="sm"
                shape="pill"
              >
                {cat.label}
              </Chip>
            ) : (
              "—"
            )
          }
          s={s}
        />
        <DetailField
          label="Atribuído a"
          value={
            agent ? (
              <span className="inline-flex items-center gap-gp-sm">
                <Avatar
                  className="size-[22px]"
                  style={{ background: agent.color }}
                >
                  <AvatarFallback className="bg-transparent text-white text-caption-xs font-bold">
                    {agentInitials}
                  </AvatarFallback>
                </Avatar>
                {agent.name}
              </span>
            ) : (
              "—"
            )
          }
          s={s}
        />
        <DetailField label="Valor" value={formatBRL(row.value)} s={s} />
        <DetailField label="Criado em" value={formatLongDate(row.createdAt)} s={s} />
        <DetailField
          label="Último contato"
          value={formatShortDate(row.lastContact)}
          s={s}
        />
      </DetailSection>

      <DetailSection
        id="notes"
        title="Anotações"
        open={openSections.has("notes")}
        onToggle={toggle}
        s={s}
      >
        <p className="text-body-xs font-normal text-fg-muted">Sem anotações.</p>
      </DetailSection>
    </FloatingPanel>
  );
}
