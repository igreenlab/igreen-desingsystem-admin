import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { tv } from "@/utils/tv";

/**
 * Building blocks padrão pro conteúdo estruturado de um `<FloatingPanel>` —
 * seções colapsáveis (edge-to-edge, divisória full-width) + campos label/valor.
 *
 * Use com `<FloatingPanel bodyPadded={false}>` (as sections gerenciam o próprio
 * padding interno). É o pattern canônico de "painel de detalhe" do DS — espelha
 * o DetailDrawer da showcase de Clientes. Preferir estes compounds a remontar
 * sections na unha garante padding/tipografia/divisórias consistentes.
 */
const partStyles = tv({
  slots: {
    section: "border-b border-border-default last:border-b-0",
    head: [
      "flex items-center justify-between w-full",
      "px-[18px] py-[14px]",
      "bg-transparent border-0 cursor-pointer text-left",
      "text-body-sm font-semibold text-fg-default",
      "transition-colors duration-150",
      "hover:bg-bg-muted focus-visible:outline-none focus-visible:bg-bg-muted",
    ],
    headStatic: "px-[18px] pt-pad-xl pb-pad-md text-body-sm font-semibold text-fg-default",
    chev: "size-[14px] text-fg-muted transition-transform duration-200 shrink-0",
    body: "flex flex-col gap-gp-md px-[18px] pb-pad-2xl",
    field: "flex items-baseline justify-between gap-gp-md text-body-sm",
    fieldLabel: "text-body-xs font-normal text-fg-muted shrink-0",
    fieldValue: "text-fg-default font-medium text-right break-words min-w-0",
  },
});

export type FloatingPanelSectionProps = {
  /** Título da seção (header). */
  title: ReactNode;
  /** Conteúdo (geralmente `<FloatingPanelField>`). */
  children: ReactNode;
  /** Colapsável (header clicável + chevron). Default: true. */
  collapsible?: boolean;
  /** Estado inicial quando colapsável. Default: true (aberta). */
  defaultOpen?: boolean;
};

export function FloatingPanelSection({
  title,
  children,
  collapsible = true,
  defaultOpen = true,
}: FloatingPanelSectionProps) {
  const s = partStyles();
  const [open, setOpen] = useState(defaultOpen);

  if (!collapsible) {
    return (
      <section className={s.section()}>
        <div className={s.headStatic()}>{title}</div>
        <div className={s.body()}>{children}</div>
      </section>
    );
  }

  return (
    <section className={s.section()}>
      <button
        type="button"
        className={s.head()}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown className={cn(s.chev(), open && "rotate-180")} />
      </button>
      {open && <div className={s.body()}>{children}</div>}
    </section>
  );
}

export type FloatingPanelFieldProps = {
  label: ReactNode;
  value: ReactNode;
};

export function FloatingPanelField({ label, value }: FloatingPanelFieldProps) {
  const s = partStyles();
  return (
    <div className={s.field()}>
      <span className={s.fieldLabel()}>{label}</span>
      <span className={s.fieldValue()}>{value || "—"}</span>
    </div>
  );
}
