import type { LucideIcon } from "@/lib/lucide-types";
import { UserX, TriangleAlert, TrendingDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { alerts, fmt } from "../../painel/painel-mock";
import { licenciadosNaRede } from "../v3-mock";

type QuadItem = {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  /** destaque vermelho (só Inativos) */
  highlight?: boolean;
  onClick: () => void;
};

/** Mesmos dados da faixa de ação — em formato Quad 2×2 (kpi/quad), pra validação. */
export function QuadStats({
  onInativos,
  onDrill,
}: {
  onInativos: () => void;
  onDrill: (id: string) => void;
}) {
  const items: QuadItem[] = [
    {
      label: "Inativos",
      value: alerts.inativos.count,
      hint: "+90 dias parados",
      icon: UserX,
      highlight: true,
      onClick: onInativos,
    },
    {
      label: "Licenças",
      value: alerts.licencas.count,
      hint: "a vencer (60d)",
      icon: TriangleAlert,
      onClick: () => onDrill("licencas"),
    },
    {
      label: "Quedas",
      value: alerts.quedasRanking.count,
      hint: "ranking este mês",
      icon: TrendingDown,
      onClick: () => onDrill("quedas"),
    },
    {
      label: "Licenciados",
      value: licenciadosNaRede,
      hint: "na rede",
      icon: Users,
      onClick: () => onDrill("rede-total"),
    },
  ];

  return (
    <section className="overflow-hidden rounded-radius-xl border border-border-subtle bg-bg-surface shadow-sh-sm">
      <div className="grid grid-cols-2 divide-x divide-y divide-border-subtle [&>button:nth-child(-n+2)]:border-t-0 [&>button:nth-child(odd)]:border-l-0">
        {items.map((q) => {
          const Icon = q.icon;
          const iconBox = q.highlight
            ? "bg-bg-danger-muted text-fg-danger"
            : "bg-bg-muted text-fg-default";
          const valueColor = q.highlight ? "text-fg-danger" : "text-fg-default";
          return (
            <button
              key={q.label}
              type="button"
              onClick={q.onClick}
              className="flex flex-col gap-gp-sm p-pad-2xl text-left transition-colors hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-ring-brand"
            >
              <div className="flex items-start justify-between gap-gp-sm">
                <p className="text-body-sm text-fg-muted">{q.label}</p>
                <span
                  className={cn(
                    "grid size-comp-md shrink-0 place-items-center rounded-radius-full",
                    iconBox,
                  )}
                >
                  <Icon className="size-icon-xs" aria-hidden />
                </span>
              </div>
              <p
                className={cn(
                  "text-[22px] font-bold leading-none tabular-nums",
                  valueColor,
                )}
              >
                {fmt(q.value)}
              </p>
              <p className="text-caption-sm text-fg-subtle">{q.hint}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
