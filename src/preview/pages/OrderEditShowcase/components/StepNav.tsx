import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Step = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

/**
 * Nav lateral (stepper) da tela de edição — itens com ícone + título +
 * descrição; o ativo ganha destaque de marca. Clicar seleciona + rola até a
 * seção. Composição local do showcase usando tokens DS.
 */
export function StepNav({
  steps,
  activeId,
  onSelect,
  className,
}: {
  steps: Step[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "flex flex-col gap-gp-xs rounded-radius-lg border border-border-subtle bg-bg-surface p-pad-md shadow-sh-sm",
        className,
      )}
      aria-label="Etapas do pedido"
    >
      {steps.map((s) => {
        const Icon = s.icon;
        const active = s.id === activeId;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            aria-current={active ? "step" : undefined}
            className={cn(
              "flex items-start gap-gp-md rounded-radius-md border p-pad-lg text-left transition-colors",
              active
                ? "border-border-brand bg-bg-brand-subtle"
                : "border-transparent hover:bg-bg-muted",
            )}
          >
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-radius-md border",
                active
                  ? "border-transparent bg-bg-brand text-fg-on-brand"
                  // bg-surface (branco no light) + borda: contrasta tanto no card
                  // quanto no hover cinza (senão o ícone funde com o hover).
                  : "border-border-subtle bg-bg-surface text-fg-muted",
              )}
            >
              <Icon className="size-icon-sm" />
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "block text-body-sm font-semibold",
                  active ? "text-fg-brand" : "text-fg-default",
                )}
              >
                {s.title}
              </span>
              <span className="mt-gp-2xs block text-caption-sm leading-snug text-fg-muted">
                {s.description}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
