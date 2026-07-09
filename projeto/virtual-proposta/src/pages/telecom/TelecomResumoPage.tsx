import { useMemo, useState, type ReactNode } from "react";
import {
  Calendar,
  ChevronDown,
  Check,
  Signal,
  Wallet,
  BadgeDollarSign,
  Users,
  ArrowUp,
  AlertTriangle,
  ShieldAlert,
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
  rede,
  receitaPorConexao,
  geracao,
  portabilidade,
  topLicenciados,
  resumoGeral,
  PERIODOS,
  num,
  brl,
  brlMil,
  pct,
} from "./telecom-resumo-mock";

type KpiTone = "neutral" | "success" | "brand" | "info" | "warning" | "danger";
const KPI_ICON_BOX: Record<KpiTone, string> = {
  neutral: "bg-bg-muted text-fg-default",
  success: "bg-bg-success-muted text-fg-success",
  brand: "bg-bg-brand-subtle text-fg-brand",
  info: "bg-bg-info-muted text-fg-info",
  warning: "bg-bg-warning-muted text-fg-warning",
  danger: "bg-bg-danger-muted text-fg-danger",
};

/** KPI — padrão Painel do Líder (card único com divisores; label + ícone em
 *  círculo, valor 24px, hint). `tone` = toque pontual de cor no ícone; `delta`
 *  = variação +/- destacada em verde/vermelho. */
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
  hint: string;
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
      <p className="text-caption-md text-fg-muted">
        {delta && (
          <span className={cn("font-semibold", delta.trim().startsWith("-") ? "text-fg-danger" : "text-fg-success")}>
            {delta}{" "}
          </span>
        )}
        {hint}
      </p>
    </div>
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

/** Faixa de insight inline. */
function Insight({ tone, children }: { tone: "warning" | "danger" | "muted"; children: ReactNode }) {
  if (tone === "muted") {
    return <p className="text-caption-md text-fg-muted">{children}</p>;
  }
  const cls =
    tone === "danger" ? "bg-bg-danger-muted text-fg-danger" : "bg-bg-warning-muted text-fg-warning";
  const Icon = tone === "danger" ? ShieldAlert : AlertTriangle;
  return (
    <div className={cn("flex items-start gap-gp-sm rounded-radius-base px-pad-2xl py-pad-md text-caption-md", cls)}>
      <Icon className="mt-[1px] size-icon-sm shrink-0" aria-hidden />
      <span>{children}</span>
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

const donutConfig = { value: { label: "Conexões" } } satisfies ChartConfig;

export function TelecomResumoPage() {
  const [periodo, setPeriodo] = useState("Julho de 2026");

  const totalGeracao = geracao.propria + geracao.indireta;
  const gpPct = pct(geracao.propria, totalGeracao);
  const giPct = pct(geracao.indireta, totalGeracao);

  const totalPortab = portabilidade.confirmadas + portabilidade.pendentes;
  const confPct = pct(portabilidade.confirmadas, totalPortab);
  const pendPct = pct(portabilidade.pendentes, totalPortab);

  const topMax = Math.max(...topLicenciados.map((t) => t.total));

  // Composição da base cadastrada (acumulado).
  const emProcesso = Math.max(
    0,
    resumoGeral.totalCadastradas - resumoGeral.ativas - resumoGeral.canceladas,
  );
  const baseComposicao = useMemo(
    () => [
      { name: "Ativas", value: resumoGeral.ativas, color: "var(--color-chart-1)" },
      { name: "Em processo", value: emProcesso, color: "var(--color-chart-4)" },
      { name: "Canceladas", value: resumoGeral.canceladas, color: "var(--color-fg-danger)" },
    ],
    [emProcesso],
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
        description="Telecom — conexões, carteira e portabilidade da sua rede."
        actions={periodSelector}
      />

      {/* KPIs — padrão Painel do Líder (card único + divisores) */}
      <section className="rounded-radius-xl border border-border-subtle bg-bg-surface shadow-sh-sm">
        <div className="grid grid-cols-1 divide-y divide-border-subtle sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 [&>*]:border-border-subtle sm:[&>*]:border-l sm:[&>*:first-child]:border-l-0 lg:[&>*:nth-child(3)]:border-l">
          <KpiCell icon={Signal} label="Conexões ativas" value={num(resumoKpis.conexoesAtivas)} delta={`+${num(resumoKpis.novasMes)}`} hint="no mês" tone="success" />
          <KpiCell icon={Wallet} label="Carteira / mês" value={brlMil(resumoKpis.carteiraMensal)} hint="recorrente" tone="brand" />
          <KpiCell icon={BadgeDollarSign} label="Receita por conexão" value={`R$ ${num(receitaPorConexao)}`} hint="carteira ÷ ativas" />
          <KpiCell icon={Users} label="Equipe com Telecom" value={`${pct(resumoKpis.equipeCom, resumoKpis.equipeTotal)}%`} hint={`${num(resumoKpis.equipeCom)} de ${num(resumoKpis.equipeTotal)}`} />
        </div>
      </section>

      {/* Geração + Portabilidade */}
      <div className="grid grid-cols-1 gap-gp-2xl lg:grid-cols-2">
        <SectionCard title="Geração das conexões" subtitle="Própria vs indireta">
          <CompareBar
            segments={[
              { label: "Própria", value: geracao.propria, pct: gpPct, bar: "bg-bg-success", dot: "bg-bg-success" },
              { label: "Indireta", value: geracao.indireta, pct: giPct, bar: "bg-bg-info", dot: "bg-bg-info" },
            ]}
          />
          <Insight tone="muted">
            Quase toda a base é geração própria — a rede indireta ainda é pequena.
          </Insight>
        </SectionCard>

        <SectionCard title="Portabilidade" subtitle="Confirmadas vs pendentes">
          <CompareBar
            segments={[
              { label: "Confirmadas", value: portabilidade.confirmadas, pct: confPct, bar: "bg-bg-success", dot: "bg-bg-success" },
              { label: "Pendentes", value: portabilidade.pendentes, pct: pendPct, bar: "bg-bg-warning", dot: "bg-bg-warning" },
            ]}
          />
          <Insight tone="warning">
            {pendPct}% das portabilidades estão paradas — só {confPct}% confirmaram.
          </Insight>
        </SectionCard>
      </div>

      {/* Top do mês + Visão geral acumulada — 2 colunas */}
      <div className="grid grid-cols-1 items-stretch gap-gp-2xl lg:grid-cols-2">
        {/* Top do mês */}
        <SectionCard title="Top do mês" subtitle="Geração por licenciado">
          {/* Total de licenciados vinculados — estilo Estatísticas */}
          <TrendStat
            value={num(rede.vinculados)}
            subtitle="Licenciados na rede"
            delta={`+${rede.deltaPct.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`}
          />

          <div className="flex flex-1 flex-col justify-center gap-gp-lg">
            {topLicenciados.map((m, i) => {
              const share = pct(m.total, resumoKpis.conexoesAtivas);
              return (
                <div key={m.id} className="flex flex-col gap-gp-xs">
                  <div className="flex items-center gap-gp-sm">
                    <span className="w-[20px] shrink-0 text-caption-sm font-semibold tabular-nums text-fg-muted">
                      {i + 1}º
                    </span>
                    <span className="truncate text-body-sm font-semibold text-fg-default">{m.nome}</span>
                    {m.cidade && (
                      <span className="truncate text-caption-md text-fg-muted">
                        {m.cidade}/{m.uf}
                      </span>
                    )}
                    <span className="ml-auto shrink-0 text-body-sm font-bold tabular-nums text-fg-default">
                      {num(m.total)}
                      {i === 0 && <span className="font-normal text-fg-muted"> · {share}%</span>}
                    </span>
                  </div>
                  <div className="ml-[28px] h-[8px] overflow-hidden rounded-radius-full bg-bg-muted">
                    <span
                      className="block h-full rounded-radius-full bg-bg-success"
                      style={{ width: `${Math.max(2, pct(m.total, topMax))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <Insight tone="danger">
            Um único licenciado concentra {pct(geracao.propria, resumoKpis.conexoesAtivas)}% das conexões ativas. Risco
            alto se ele sair.
          </Insight>
        </SectionCard>

        {/* Visão geral acumulada — donut + lista (estilo Budget Breakdown) */}
        <SectionCard title="Visão geral acumulada" subtitle="Base total cadastrada por status">
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
                  {num(resumoGeral.totalCadastradas)}
                </span>
                <span className="text-caption-sm text-fg-muted">cadastradas</span>
              </div>
            </div>
          </div>

          {/* Cabeçalho da lista */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-pad-md text-caption-sm font-medium uppercase tracking-[0.04em] text-fg-muted">
            <span>Status</span>
            <span>Conexões / %</span>
          </div>
          {/* Lista — barra-acento + label + valor + pill de % */}
          <ul>
            {baseComposicao.map((b) => (
              <li
                key={b.name}
                className="flex items-center gap-gp-md border-b border-border-subtle py-pad-lg last:border-0"
              >
                <span className="h-[16px] w-[3px] shrink-0 rounded-radius-full" style={{ background: b.color }} />
                <span className="flex-1 truncate text-body-sm font-medium text-fg-default">{b.name}</span>
                <span className="text-body-sm font-bold tabular-nums text-fg-default">{num(b.value)}</span>
                <span className="rounded-radius-full bg-bg-muted px-pad-md py-[1px] text-caption-sm tabular-nums text-fg-muted">
                  {pct(b.value, resumoGeral.totalCadastradas)}%
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
