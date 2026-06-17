import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export type DetailSectionProps = {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

/**
 * Seção colapsável da `DetailsColumn` (Contato / Atendimento / Histórico).
 * Header clicável com chevron rotativo + corpo só monta quando `open`.
 */
export function DetailSection({
  title,
  open,
  onToggle,
  children,
}: DetailSectionProps) {
  return (
    <section className="flex flex-col border-b border-border-subtle pb-pad-xl last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex items-center justify-between w-full px-pad-sm py-pad-sm -mx-pad-sm rounded-radius-md cursor-pointer text-left transition-colors duration-150 hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-brand"
      >
        <span className="text-body-sm font-semibold text-fg-default">{title}</span>
        <ChevronDown
          size={14}
          className={[
            "text-fg-muted transition-transform duration-150",
            open ? "" : "-rotate-90",
          ].join(" ")}
        />
      </button>
      {open && <div className="flex flex-col gap-gp-sm pt-pad-xs">{children}</div>}
    </section>
  );
}
