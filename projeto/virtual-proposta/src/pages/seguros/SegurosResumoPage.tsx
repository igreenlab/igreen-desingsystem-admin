import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  Check,
  ShieldCheck,
  FileSignature,
  ClipboardList,
  BadgeDollarSign,
  Trophy,
  TrendingUp,
  Wallet,
  ArrowUp,
  type LucideIcon,
} from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shadcn/dropdown-menu";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/Chart";
import { SectionCard } from "../painel-v2/_ui";
import {
  resumoKpis,
  geracao,
  topLicenciados,
  resumoGeral,
  rede,
  PERIODOS,
  num,
  brlMil,
  pct,
} from "./seguros-resumo-mock";

type KpiTone = "neutral" | "success" | "brand" | "info" | "warning" | "danger";
const KPI_ICON_BOX: Record<KpiTone, string> = {
  neutral: "bg-bg-muted text-fg-default",
  success: "bg-bg-success-muted text-fg-success",
  brand: "bg-bg-brand-subtle text-fg-brand",
  info: "bg-bg-info-muted text-fg-info",
  warning: "bg-bg-warning-muted text-fg-warning",
  danger: "bg-bg-danger-muted text-fg-danger",
};

/** Célula de KPI — padrão Painel do Líder (card único com divisores). `tone`
 *  dá um toque pontual de cor no ícone (positivo/dinheiro). */
function KpiCell({
  icon: Icon,
  value,
  label,
  hint,
  delta,
  tone = "neutral",
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  hint?: string;
  /** Variação +/- destacada em verde (positivo) ou vermelho (negativo). */
  delta?: string;
  tone?: KpiTone;
}) {
  return (
    <div className="flex flex-col gap-[2px] p-pad-3xl first:rounded-l-radius-xl last:rounded-r-radius-xl">
      <div className="flex items-start justify-between gap-gp-md">
        <p className="text-title-sm font-semibold text-fg-default">{label}</p>
        <span className={cn("grid size-form-lg shrink-0 place-items-center rounded-radius-full", KPI_ICON_BOX[tone])}>
          <Icon className="size-icon-sm" aria-hidden />
        </span>
      </div>
      <p className="text-stat-md font-bold leading-tight tabular-nums text-fg-default">{value}</p>
      {(delta || hint) && (
        <p className="text-caption-md text-fg-muted">
          {delta && (
            <span className={cn("font-semibold", delta.trim().startsWith("-") ? "text-fg-danger" : "text-fg-success")}>
              {delta}{" "}
            </span>
          )}
          {hint}
        </p>
      )}
    </div>
  );
}

/** Barra de comparação 2 segmentos + legenda. */
function CompareBar({
  segments,
}: {
  segments: { label: string; value: number; pct: number; bar: string; dot: string }[];
}) {
  return (
    <div className="flex flex-col gap-gp-md">
      <div className="flex h-[10px] w-full overflow-hidden rounded-radius-full bg-bg-muted">
        {segments.map((s) => (
          <span key={s.label} className={s.bar} style={{ width: `${s.pct}%` }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-gp-2xl gap-y-gp-xs">
        {segments.map((s) => (
          <span key={s.label} className="flex items-center gap-gp-sm text-body-sm text-fg-muted">
            <span className={cn("size-[10px] shrink-0 rounded-radius-full", s.dot)} />
            {s.label}
            <span className="font-semibold tabular-nums text-fg-default">
              {num(s.value)} ({s.pct}%)
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Badge de posição no ranking — 1º destacado. */
function RankBadge({ pos }: { pos: number }) {
  return (
    <span
      className={cn(
        "grid size-comp-sm shrink-0 place-items-center rounded-radius-full text-caption-md font-bold tabular-nums",
        pos === 0 ? "bg-bg-warning-muted text-fg-warning" : "bg-bg-muted text-fg-muted",
      )}
    >
      {pos + 1}
    </span>
  );
}

/** Stat de tendência — valor grande + subtítulo curto + badge de % crescente. */
function TrendStat({ value, subtitle, delta }: { value: string; subtitle: string; delta: string }) {
  return (
    <div>
      <p className="text-stat-lg font-bold leading-none tabular-nums text-fg-default">{value}</p>
      <div className="mt-gp-sm flex items-center gap-gp-sm">
        <span className="text-caption-md text-fg-muted">{subtitle}</span>
        <Chip color="success" variant="soft" size="sm" shape="pill">
          <ArrowUp className="size-[12px]" aria-hidden />
          {delta}
        </Chip>
      </div>
    </div>
  );
}

const donutConfig = { value: { label: "Apólices" } } satisfies ChartConfig;

export function SegurosResumoPage() {
  const [periodo, setPeriodo] = useState("Julho de 2026");

  const totalGer = geracao.propria + geracao.indireta;
  const gpPct = pct(geracao.propria, totalGer);
  const giPct = pct(geracao.indireta, totalGer);

  const emEmissao = Math.max(0, resumoGeral.total - resumoGeral.vigentes - resumoGeral.canceladas);
  const baseComposicao = useMemo(
    () => [
      { name: "Vigentes", value: resumoGeral.vigentes, color: "var(--color-chart-1)" },
      { name: "Em emissão", value: emEmissao, color: "var(--color-chart-4)" },
      { name: "Canceladas", value: resumoGeral.canceladas, color: "var(--color-fg-danger)" },
    ],
    [emEmissao],
  );

  const periodSelector = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button color="secondary" variant="outline" size="sm" iconLeft={<Calendar />} iconRight={<ChevronDown />}>
          {periodo}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {PERIODOS.map((p) => (
          <DropdownMenuItem
            key={p}
            onSelect={() => setPeriodo(p)}
            className={cn(periodo === p && "bg-bg-brand-subtle text-fg-brand")}
          >
            <Check className={periodo === p ? "opacity-100" : "opacity-0"} />
            {p}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex flex-col gap-gp-2xl">
      <PageHeader
        title="Resumo"
        description="Seguros — apólices, cotações e geração da sua rede."
        actions={periodSelector}
      />

      {/* KPIs — apólices / novas / cotações / pagas / carteira (padrão Painel, 5 cols) */}
      <section className="rounded-radius-xl border border-border-subtle bg-bg-surface shadow-sh-sm">
        <div className="grid grid-cols-1 divide-y divide-border-subtle lg:grid-cols-5 lg:divide-y-0 [&>*]:border-border-subtle lg:[&>*]:border-l lg:[&>*:first-child]:border-l-0">
          <KpiCell icon={ShieldCheck} label="Apólices vigentes" value={num(resumoKpis.apolicesVigentes)} delta={`+${num(resumoKpis.novasMes)}`} hint="no mês" tone="success" />
          <KpiCell icon={FileSignature} label="Novas no mês" value={num(resumoKpis.novasMes)} hint="apólices emitidas" />
          <KpiCell icon={ClipboardList} label="Cotações" value={num(resumoKpis.cotacoes)} hint="geradas no período" />
          <KpiCell icon={BadgeDollarSign} label="Cotações pagas" value={num(resumoKpis.pagas)} hint={`${pct(resumoKpis.pagas, resumoKpis.cotacoes)}% das cotações`} tone="success" />
          <KpiCell icon={Wallet} label="Carteira / mês" value={brlMil(resumoGeral.carteiraMensal)} hint="prêmio recorrente" tone="brand" />
        </div>
      </section>

      {/* Geração das apólices vigentes — barra de comparação (GP × GI) */}
      <SectionCard title="Geração das apólices" subtitle="Própria (GP) vs indireta (GI · rede)">
        <CompareBar
          segments={[
            { label: "Própria (GP)", value: geracao.propria, pct: gpPct, bar: "bg-bg-success", dot: "bg-bg-success" },
            { label: "Indireta (GI)", value: geracao.indireta, pct: giPct, bar: "bg-bg-info", dot: "bg-bg-info" },
          ]}
        />
        <p className="text-caption-md text-fg-muted">
          Geração própria responde por {gpPct}% das vigentes (+{num(geracao.propriaNovas)} no mês); a rede indireta
          complementa o restante (+{num(geracao.indiretaNovas)}).
        </p>
      </SectionCard>

      {/* Top do mês + Visão geral acumulada — 2 colunas */}
      <div className="grid grid-cols-1 items-stretch gap-gp-2xl lg:grid-cols-2">
        {/* Top do mês — ranking de licenciados */}
        <SectionCard
          title="Top do mês"
          subtitle="Licenciados que mais emitiram apólices"
          action={<Trophy className="size-icon-sm text-fg-brand" />}
        >
          <TrendStat
            value={num(rede.corretores)}
            subtitle="Corretores na rede"
            delta={`+${rede.deltaPct.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`}
          />
          <div className="mt-pad-md flex flex-1 flex-col justify-center">
            {topLicenciados.map((m, i) => (
              <div
                key={m.id}
                className="flex items-center gap-gp-md border-b border-border-subtle py-pad-md last:border-b-0"
              >
                <RankBadge pos={i} />
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-body-sm font-semibold text-fg-default">{m.nome}</span>
                  <span className="truncate text-caption-md text-fg-muted">
                    {m.cidade}/{m.uf}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-gp-md">
                  <Chip color="success" variant="soft" size="sm" shape="pill">
                    <TrendingUp className="size-[12px]" aria-hidden />+{num(m.novas)} mês
                  </Chip>
                  <span className="w-[44px] text-right text-body-sm font-bold tabular-nums text-fg-default">
                    {num(m.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Visão geral acumulada — donut + lista (estilo Budget Breakdown) */}
        <SectionCard title="Visão geral acumulada" subtitle="Base total de apólices por status">
          <div className="flex min-h-0 flex-1 items-center justify-center py-pad-md">
            <div className="relative">
              <ChartContainer config={donutConfig} className="aspect-square w-[180px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="name" hideLabel />} />
                  <Pie data={baseComposicao} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3} cornerRadius={5} strokeWidth={0}>
                    {baseComposicao.map((b) => (
                      <Cell key={b.name} fill={b.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-stat-md font-bold leading-none tabular-nums text-fg-default">
                  {num(resumoGeral.total)}
                </span>
                <span className="text-caption-sm text-fg-muted">apólices</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-border-subtle pb-pad-md text-caption-sm font-medium uppercase tracking-[0.04em] text-fg-muted">
            <span>Status</span>
            <span>Apólices / %</span>
          </div>
          <ul>
            {baseComposicao.map((b) => (
              <li
                key={b.name}
                className="flex items-center gap-gp-md border-b border-border-subtle py-pad-md last:border-0"
              >
                <span className="h-[16px] w-[3px] shrink-0 rounded-radius-full" style={{ background: b.color }} />
                <span className="flex-1 truncate text-body-sm font-medium text-fg-default">{b.name}</span>
                <span className="text-body-sm font-bold tabular-nums text-fg-default">{num(b.value)}</span>
                <span className="rounded-radius-full bg-bg-muted px-pad-md py-[1px] text-caption-sm tabular-nums text-fg-muted">
                  {pct(b.value, resumoGeral.total)}%
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div aria-hidden className="h-pad-3xl shrink-0" />
    </div>
  );
}
