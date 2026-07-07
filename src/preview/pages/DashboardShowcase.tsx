import { useState } from "react";
import { useTheme, type Theme } from "@/hooks/useTheme";
import type { LucideIcon } from "@/lib/lucide-types";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Headphones,
  Mail,
  MessageSquare,
  MoreVertical,
  Phone,
  Search,
  Send,
  Star,
  Sun,
  Timer,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { BRAZIL_PATHS, BRAZIL_VIEWBOX } from "./_dashboard-brazil-map";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/ui/PageHeader";
import { Kpi, KpiGroup, KpiDelta } from "@/components/ui/Kpi";
import { Avatar, AvatarFallback } from "@/components/shadcn/avatar";
import {
  APP_SHELL_CONTEXTS,
  APP_SHELL_COMMANDS,
  APP_SHELL_NOTIFICATIONS,
  APP_SHELL_MESSAGES,
  APP_SHELL_THEME_OPTIONS,
} from "../mocks/app-shell-mocks";

/* ─────────────────────────────────────────────────────────────
 * Tipos + mock data — call center + analytics
 * ───────────────────────────────────────────────────────────── */

type KpiTone = "brand" | "success" | "warning" | "info" | "danger" | "neutral";

type KpiCardData = {
  id: string;
  title: string;
  value: string;
  delta?: { value: string; direction: "up" | "down"; positive: boolean; label: string };
  icon: LucideIcon;
  tone: KpiTone;
};

const KPIS_PRIMARY: KpiCardData[] = [
  { id: "in-conv",   title: "Em atendimento", value: "12",
    delta: { value: "+3",  direction: "up",   positive: true,  label: "vs ontem" },
    icon: Phone,        tone: "success" },
  { id: "waiting",   title: "Em espera", value: "4",
    delta: { value: "+1",  direction: "up",   positive: false, label: "vs ontem" },
    icon: Timer,        tone: "warning" },
  { id: "finished",  title: "Resolvidos hoje", value: "87",
    delta: { value: "+12%", direction: "up",  positive: true,  label: "vs semana" },
    icon: CheckCircle2, tone: "info" },
  { id: "new",       title: "Novos contatos", value: "260",
    delta: { value: "+24", direction: "up",   positive: true,  label: "vs ontem" },
    icon: UserPlus,     tone: "brand" },
  { id: "talk",      title: "Tempo médio atend.", value: "4m 32s",
    delta: { value: "-12s", direction: "down", positive: true, label: "melhorou" },
    icon: Clock,        tone: "neutral" },
  { id: "wait",      title: "Tempo médio espera", value: "1m 18s",
    delta: { value: "-8s", direction: "down",  positive: true, label: "melhorou" },
    icon: Timer,        tone: "neutral" },
];

const KPIS_QUALITY: KpiCardData[] = [
  { id: "frt",  title: "First Response Time", value: "42s",
    delta: { value: "-5s", direction: "down", positive: true, label: "melhorou" },
    icon: TrendingUp, tone: "info" },
  { id: "csat", title: "CSAT", value: "4.7",
    delta: { value: "+0.2", direction: "up", positive: true, label: "vs semana" },
    icon: Star, tone: "warning" },
  { id: "nps",  title: "NPS", value: "68",
    delta: { value: "+5", direction: "up", positive: true, label: "vs mês" },
    icon: Headphones, tone: "success" },
  { id: "ai",   title: "Resolvido por IA", value: "32%",
    delta: { value: "+4%", direction: "up", positive: true, label: "vs semana" },
    icon: Bot, tone: "brand" },
];

/* Volume — stacked bars (2 séries: humano + IA) */
const VOLUME_BY_MONTH = [
  { m: "Jan", human: 2400, ai: 1200 },
  { m: "Feb", human: 4000, ai: 2800 },
  { m: "Mar", human: 3500, ai: 2200 },
  { m: "Apr", human: 3800, ai: 2900 },
  { m: "May", human: 2700, ai: 2300 },
  { m: "Jun", human: 3200, ai: 2700 },
  { m: "Jul", human: 2600, ai: 2700 },
  { m: "Aug", human: 4500, ai: 3200 },
  { m: "Sep", human: 2800, ai: 2700 },
  { m: "Oct", human: 4200, ai: 2300 },
  { m: "Nov", human: 2600, ai: 2700 },
  { m: "Dec", human: 3000, ai: 4000 },
];

/* Current Visits — origem dos atendimentos (regiões/cidades) */
const REGIONS = [
  { name: "São Paulo",      value: 1650, color: "var(--color-fg-brand)",    delta: "+4.7%", positive: true },
  { name: "Rio de Janeiro", value: 350,  color: "var(--color-fg-warning)",  delta: "+2.1%", positive: true },
  { name: "Belo Horizonte", value: 498,  color: "var(--color-fg-info)",     delta: "-1.7%", positive: false },
];

/* Channels — lista estilo Campaign Performance */
type ChannelKind = "whatsapp" | "telegram" | "instagram" | "email" | "webchat";

const CHANNELS: { id: ChannelKind; name: string; volume: string; color: string; icon: LucideIcon; status: "active" | "paused" | "off" }[] = [
  { id: "whatsapp",  name: "WhatsApp",  volume: "8.49k", color: "#25d366", icon: MessageSquare, status: "active" },
  { id: "instagram", name: "Instagram", volume: "6.98k", color: "#e1306c", icon: MessageSquare, status: "active" },
  { id: "telegram",  name: "Telegram",  volume: "3.21k", color: "#0088cc", icon: Send,          status: "paused" },
  { id: "email",     name: "Email",     volume: "2.14k", color: "#8754ec", icon: Mail,          status: "active" },
  { id: "webchat",   name: "Web Chat",  volume: "1.50k", color: "#0a3a2e", icon: MessageSquare, status: "off"    },
];

const CHANNEL_STATUS_LABEL: Record<"active" | "paused" | "off", string> = {
  active: "Ativo",
  paused: "Pausado",
  off:    "Desligado",
};

const CHANNEL_STATUS_TONE: Record<"active" | "paused" | "off", "success" | "warning" | "neutral"> = {
  active: "success",
  paused: "warning",
  off:    "neutral",
};

/* Open conversations — atendimentos ativos */
type OpenConv = {
  id: string;
  name: string;
  initials: string;
  hex: string;
  channel: ChannelKind;
  status: "attending" | "waiting" | "ai";
  waitTime: string;
  agent?: { initials: string; name: string; hex: string };
};

const OPEN_CONVS: OpenConv[] = [
  { id: "#A-2453", name: "Maria Hernandez", initials: "MH", hex: "#f59e0b", channel: "whatsapp",  status: "attending", waitTime: "2m",  agent: { initials: "AC", name: "Aline Castro",  hex: "#f59e0b" } },
  { id: "#A-2455", name: "James Johnson",   initials: "JJ", hex: "#0a3a2e", channel: "telegram",  status: "waiting",   waitTime: "8m" },
  { id: "#A-2458", name: "Camila Ribeiro",  initials: "CR", hex: "#8754ec", channel: "instagram", status: "attending", waitTime: "1m",  agent: { initials: "VC", name: "Você",          hex: "#0a3a2e" } },
  { id: "#A-2461", name: "Roberto Souza",   initials: "RS", hex: "#0088cc", channel: "whatsapp",  status: "ai",        waitTime: "3m" },
  { id: "#A-2466", name: "Ana Costa",       initials: "AC", hex: "#1cb280", channel: "email",     status: "waiting",   waitTime: "14m" },
];

const STATUS_LABEL: Record<OpenConv["status"], string> = {
  attending: "Em atendimento",
  waiting:   "Em espera",
  ai:        "IA",
};

const STATUS_TONE: Record<OpenConv["status"], "success" | "warning" | "info"> = {
  attending: "success",
  waiting:   "warning",
  ai:        "info",
};

/* Agents */
type AgentRow = {
  id: string;
  name: string;
  initials: string;
  hex: string;
  active: boolean;
  resolved: number;
  avgTime: string;
  csat: number;
};

const AGENTS: AgentRow[] = [
  { id: "aline",  name: "Aline Castro", initials: "AC", hex: "#f59e0b", active: true,  resolved: 24, avgTime: "3m 12s", csat: 4.9 },
  { id: "carlos", name: "Carlos Souza", initials: "CS", hex: "#8754ec", active: true,  resolved: 19, avgTime: "4m 45s", csat: 4.7 },
  { id: "maria",  name: "Maria Lima",   initials: "ML", hex: "#ef4444", active: false, resolved: 17, avgTime: "5m 03s", csat: 4.5 },
  { id: "joao",   name: "João Pereira", initials: "JP", hex: "#1cb280", active: true,  resolved: 15, avgTime: "3m 58s", csat: 4.8 },
  { id: "you",    name: "Você",         initials: "VC", hex: "#0a3a2e", active: true,  resolved: 12, avgTime: "4m 11s", csat: 4.6 },
];

/* Traffic Data — origem das conversas (tabela) */
type TrafficRow = {
  source: string;
  visits: string;
  bounce: string;
  goal: number;
  goalColor: string;
};

const TRAFFIC_ROWS: TrafficRow[] = [
  { source: "Direct",            visits: "1.300", bounce: "30%", goal: 80, goalColor: "var(--color-fg-warning)" },
  { source: "Email Campaign",    visits: "5.000", bounce: "45%", goal: 40, goalColor: "var(--color-fg-success)" },
  { source: "Organic",           visits: "3.000", bounce: "10%", goal: 55, goalColor: "var(--color-fg-warning)" },
  { source: "Paid Search",       visits: "2.450", bounce: "22%", goal: 68, goalColor: "var(--color-fg-success)" },
  { source: "Social",            visits: "1.870", bounce: "55%", goal: 25, goalColor: "var(--color-fg-danger)" },
  { source: "Referral",          visits: "940",   bounce: "18%", goal: 72, goalColor: "var(--color-fg-success)" },
];

/* ─────────────────────────────────────────────────────────────
 * Atoms
 * ───────────────────────────────────────────────────────────── */

const TONE_CLASSES: Record<KpiTone, { bg: string; fg: string }> = {
  brand:   { bg: "bg-bg-brand-subtle",   fg: "text-fg-brand" },
  success: { bg: "bg-bg-success-muted",  fg: "text-fg-success" },
  warning: { bg: "bg-bg-warning-muted",  fg: "text-fg-warning" },
  info:    { bg: "bg-bg-info-muted",     fg: "text-fg-info" },
  danger:  { bg: "bg-bg-danger-muted",   fg: "text-fg-danger" },
  neutral: { bg: "bg-bg-muted",          fg: "text-fg-muted" },
};

/** KpiCard — title no topo + icon container + value + Chip delta (padronizado). */
function KpiCard({ kpi }: { kpi: KpiCardData }) {
  const Icon = kpi.icon;
  const cls = TONE_CLASSES[kpi.tone];
  return (
    <article className="flex flex-col gap-gp-lg p-pad-3xl bg-bg-surface border border-border-subtle rounded-radius-xl shadow-sh-sm">
      <header className="flex items-start justify-between gap-gp-md">
        <h3 className="m-0 text-body-md font-semibold text-fg-default">{kpi.title}</h3>
        <span
          className={cn(
            "grid place-items-center size-form-lg rounded-radius-lg shrink-0",
            cls.bg, cls.fg,
          )}
          aria-hidden
        >
          <Icon className="size-icon-md" strokeWidth={1.8} />
        </span>
      </header>
      <div className="flex flex-col gap-gp-xs">
        <div className="flex items-center gap-gp-md flex-wrap">
          <span className="text-body-2xl font-bold text-fg-default leading-none [font-variant-numeric:tabular-nums]">
            {kpi.value}
          </span>
          {kpi.delta && (
            <Chip
              color={kpi.delta.positive ? "success" : "danger"}
              variant="soft"
              size="sm"
              shape="pill"
            >
              {kpi.delta.value}
            </Chip>
          )}
        </div>
        {kpi.delta && (
          <span className="text-caption-sm text-fg-subtle">{kpi.delta.label}</span>
        )}
      </div>
    </article>
  );
}

/** Welcome banner — brand gradient, ilustração SVG, CTA. */
function WelcomeBanner() {
  return (
    <article className="relative overflow-hidden bg-bg-brand rounded-radius-xl p-pad-4xl flex items-center gap-gp-2xl flex-1 w-full">
      {/* Texto à esquerda */}
      <div className="flex flex-col gap-gp-md flex-1 min-w-0 z-[1]">
        <h2 className="m-0 flex items-center gap-gp-md text-body-2xl font-bold text-fg-on-brand">
          Boa tarde, Sergio
          <Sun className="size-icon-md text-fg-warning" fill="currentColor" />
        </h2>
        <p className="m-0 text-body-md text-fg-on-brand opacity-80 max-w-[480px]">
          Acompanhe a performance da sua equipe hoje.<br />
          Snapshot rápido das principais métricas do atendimento.
        </p>
        <div>
          <Button
            color="secondary"
            variant="filled"
            size="md"
            iconRight={<ArrowRight />}
            className="bg-bg-surface text-fg-default hover:bg-bg-muted"
          >
            Ver relatório completo
          </Button>
        </div>
      </div>

    </article>
  );
}

/** Key Insights — all-time revenue + stacked bar + legend (legend no footer via mt-auto). */
function KeyInsightsCard() {
  return (
    <article className="flex flex-col gap-gp-md p-pad-3xl bg-bg-surface border border-border-subtle rounded-radius-xl shadow-sh-sm h-full">
      <header className="flex items-center justify-between gap-gp-md">
        <h3 className="m-0 text-body-md font-medium text-fg-default">Key Insights</h3>
        <Button color="secondary" variant="ghost" size="icon-sm" aria-label="Mais opções">
          <MoreVertical />
        </Button>
      </header>
      <p className="m-0 text-body-xs font-normal text-fg-muted">Receita acumulada (anual)</p>
      <div className="flex items-center gap-gp-md flex-wrap">
        <span className="text-body-2xl font-bold text-fg-default leading-none [font-variant-numeric:tabular-nums]">
          R$ 395.7k
        </span>
        <Chip color="success" variant="soft" size="sm" shape="pill">
          +2.7%
        </Chip>
      </div>
      {/* Spacer empurra bar + legend pro bottom do card */}
      <div className="mt-auto flex flex-col gap-gp-md">
        {/* Stacked bar 3 segmentos */}
        <div className="flex h-[8px] gap-[2px] rounded-radius-full overflow-hidden">
          <span className="bg-bg-brand"    style={{ flex: 4 }} aria-hidden />
          <span className="bg-bg-warning"  style={{ flex: 3 }} aria-hidden />
          <span className="bg-bg-info"     style={{ flex: 4 }} aria-hidden />
        </div>
        <div className="flex items-center gap-gp-lg flex-wrap text-caption-sm text-fg-muted">
          <span className="inline-flex items-center gap-[5px]">
            <span className="size-[8px] rounded-radius-full bg-bg-brand" aria-hidden />
            São Paulo
          </span>
          <span className="inline-flex items-center gap-[5px]">
            <span className="size-[8px] rounded-radius-full bg-bg-warning" aria-hidden />
            Rio
          </span>
          <span className="inline-flex items-center gap-[5px]">
            <span className="size-[8px] rounded-radius-full bg-bg-info" aria-hidden />
            MG
          </span>
        </div>
      </div>
    </article>
  );
}

function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-gp-2xl p-pad-3xl bg-bg-surface border border-border-subtle rounded-radius-xl shadow-sh-sm",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-gp-md">
        <div className="flex flex-col gap-[2px] min-w-0">
          <h3 className="m-0 text-body-md font-medium text-fg-default">{title}</h3>
          {subtitle && (
            <p className="m-0 text-body-xs font-normal text-fg-muted">{subtitle}</p>
          )}
        </div>
        {action ?? (
          <Button color="secondary" variant="ghost" size="icon-sm" aria-label="Mais opções">
            <MoreVertical />
          </Button>
        )}
      </header>
      {children}
    </section>
  );
}

/** Tooltip estilizado pros charts — consome tokens DS. */
const CHART_TOOLTIP_STYLE: React.CSSProperties = {
  borderRadius: 10,
  border: "1px solid var(--color-border-default)",
  background: "var(--color-bg-surface-elevated)",
  color: "var(--color-fg-default)",
  fontSize: 12,
  boxShadow: "rgba(0,0,0,0.18) 0 12px 24px -4px",
  padding: "8px 12px",
};

const CHART_TOOLTIP_LABEL_STYLE: React.CSSProperties = {
  color: "var(--color-fg-muted)",
  fontSize: 11,
  marginBottom: 4,
};

/** Stacked bar chart (humano + IA) com Recharts — tooltip + hover + responsivo. */
function VolumeStackedChart() {
  return (
    <div className="flex flex-col gap-gp-lg">
      {/* Header com valor + chip delta + legend + selector ano */}
      <div className="flex items-center gap-gp-md flex-wrap">
        <div className="flex items-baseline gap-gp-md flex-wrap">
          <span className="text-body-2xl font-bold text-fg-default leading-none [font-variant-numeric:tabular-nums]">
            R$ 395.7k
          </span>
          <Chip color="success" variant="soft" size="sm" shape="pill">
            +18%
          </Chip>
          <span className="text-body-xs font-normal text-fg-muted">vs ano passado</span>
        </div>
        <div className="ml-auto flex items-center gap-gp-md">
          <span className="inline-flex items-center gap-[4px] text-caption-sm text-fg-muted">
            <span className="size-[8px] rounded-radius-full bg-bg-brand" aria-hidden /> Humano
          </span>
          <span className="inline-flex items-center gap-[4px] text-caption-sm text-fg-muted">
            <span className="size-[8px] rounded-radius-full bg-bg-brand-subtle" aria-hidden /> IA
          </span>
          <Button color="secondary" variant="outline" size="sm" iconRight={<ChevronDown />}>
            2026
          </Button>
        </div>
      </div>

      {/* Recharts: ResponsiveContainer + BarChart stacked + Tooltip + grid dashed */}
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <BarChart
            data={VOLUME_BY_MONTH}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            barCategoryGap={18}
          >
            <CartesianGrid
              stroke="var(--color-border-subtle)"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="m"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              stroke="var(--color-fg-subtle)"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              stroke="var(--color-fg-subtle)"
              tickFormatter={(v) => (v === 0 ? "0k" : `${v / 1000}k`)}
              ticks={[0, 2000, 4000, 6000, 8000, 10000]}
              domain={[0, 10000]}
            />
            <Tooltip
              cursor={{ fill: "var(--color-bg-muted)", opacity: 0.5 }}
              contentStyle={CHART_TOOLTIP_STYLE}
              labelStyle={CHART_TOOLTIP_LABEL_STYLE}
              formatter={(value, name) => {
                const label = name === "human" ? "Humano" : "IA";
                return [Number(value).toLocaleString("pt-BR"), label];
              }}
            />
            <Bar dataKey="human" stackId="x" fill="var(--color-bg-brand)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="ai"    stackId="x" fill="var(--color-bg-brand-subtle)"  radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Donut com Recharts PieChart — tooltip + hover + total no centro. */
function CurrentVisitsCard() {
  const total = REGIONS.reduce((s, r) => s + r.value, 0);
  return (
    <SectionCard title="Origem dos atendimentos" subtitle="Por região" className="h-full">
      {/* Donut — wrapper relativo ancora o center dentro do círculo */}
      <div className="relative flex items-center justify-center" style={{ height: 210 }}>
        <ResponsiveContainer width="100%" height={210}>
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={REGIONS}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={92}
              paddingAngle={3}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive
            >
              {REGIONS.map((r) => (
                <Cell key={r.name} fill={r.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              labelStyle={CHART_TOOLTIP_LABEL_STYLE}
              formatter={(value) => Number(value).toLocaleString("pt-BR")}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Total absolute no centro do donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-caption-sm text-fg-muted">Total</span>
          <span className="text-body-2xl font-bold text-fg-default leading-none [font-variant-numeric:tabular-nums]">
            {total.toLocaleString("pt-BR")}
          </span>
        </div>
      </div>
      {/* Lista de regiões — mt-auto empurra pro bottom do card */}
      <div className="mt-auto flex flex-col gap-gp-md">
        {REGIONS.map((r) => (
          <div key={r.name} className="flex items-center gap-gp-md">
            <span
              className="size-[10px] rounded-radius-full shrink-0"
              style={{ background: r.color }}
              aria-hidden
            />
            <span className="flex-1 text-body-xs text-fg-default">{r.name}</span>
            <span className="text-body-xs font-normal text-fg-default [font-variant-numeric:tabular-nums]">
              {r.value.toLocaleString("pt-BR")}
            </span>
            <Chip
              color={r.positive ? "success" : "danger"}
              variant="soft"
              size="sm"
              shape="pill"
            >
              {r.delta}
            </Chip>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function PersonAvatar({ initials, hex, size = "md" }: { initials: string; hex: string; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "size-[24px] text-caption-xs" : "size-[32px] text-body-xs font-normal";
  return (
    <Avatar className={cls} style={{ background: hex }}>
      <AvatarFallback className="bg-transparent text-white font-bold">{initials}</AvatarFallback>
    </Avatar>
  );
}

function OpenConversationsList() {
  return (
    <ul className="m-0 p-0 list-none flex flex-col">
      {OPEN_CONVS.map((c) => {
        const ChIcon = CHANNELS.find((ch) => ch.id === c.channel)?.icon ?? MessageSquare;
        return (
          <li
            key={c.id}
            className="flex items-center gap-gp-md py-pad-lg border-b border-border-subtle last:border-b-0 cursor-pointer hover:[&>*]:opacity-90 transition-opacity"
          >
            <PersonAvatar initials={c.initials} hex={c.hex} size="md" />
            <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
              <div className="flex items-center gap-gp-sm">
                <span className="text-body-sm font-semibold text-fg-default whitespace-nowrap overflow-hidden text-ellipsis">
                  {c.name}
                </span>
                <span className="text-caption-sm text-fg-subtle [font-variant-numeric:tabular-nums] shrink-0">
                  {c.id}
                </span>
              </div>
              <div className="flex items-center gap-gp-sm flex-wrap text-caption-sm text-fg-muted">
                <span className="inline-flex items-center gap-[3px]">
                  <ChIcon size={11} strokeWidth={1.8} aria-hidden />
                  {CHANNELS.find((ch) => ch.id === c.channel)?.name ?? c.channel}
                </span>
                {c.agent && (
                  <>
                    <span aria-hidden>·</span>
                    <span>{c.agent.name}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-[4px] shrink-0">
              <Chip color={STATUS_TONE[c.status]} variant="soft" size="sm" shape="pill">
                {STATUS_LABEL[c.status]}
              </Chip>
              <span className="inline-flex items-center gap-[3px] text-caption-sm text-fg-muted [font-variant-numeric:tabular-nums]">
                <Clock size={10} strokeWidth={1.8} aria-hidden />
                {c.waitTime}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function AgentPerformanceList() {
  return (
    <ul className="m-0 p-0 list-none flex flex-col">
      {AGENTS.map((a, i) => (
        <li
          key={a.id}
          className="flex items-center gap-gp-md py-pad-lg border-b border-border-subtle last:border-b-0"
        >
          <span className="grid place-items-center size-[20px] rounded-radius-full bg-bg-muted text-caption-sm font-bold text-fg-muted shrink-0 [font-variant-numeric:tabular-nums]">
            {i + 1}
          </span>
          <div className="relative shrink-0">
            <PersonAvatar initials={a.initials} hex={a.hex} size="md" />
            <span
              className={cn(
                "absolute -bottom-[1px] -right-[1px] size-[8px] rounded-radius-full border border-bg-surface",
                a.active ? "bg-bg-success" : "bg-bg-muted",
              )}
              aria-label={a.active ? "online" : "offline"}
            />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
            <span className="text-body-sm font-semibold text-fg-default whitespace-nowrap overflow-hidden text-ellipsis">
              {a.name}
            </span>
            <span className="text-caption-sm text-fg-muted">
              {a.resolved} resolvidos · {a.avgTime} médio
            </span>
          </div>
          <div className="flex items-center gap-[3px] shrink-0 text-body-xs font-semibold text-fg-default">
            <Star size={11} strokeWidth={2} className="text-fg-warning fill-current" aria-hidden />
            <span className="[font-variant-numeric:tabular-nums]">{a.csat.toFixed(1)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Canais com volume + status — estilo Campaign Performance. */
function ChannelPerformanceList() {
  return (
    <ul className="m-0 p-0 list-none flex flex-col">
      {CHANNELS.map((c) => {
        const Icon = c.icon;
        return (
          <li
            key={c.id}
            className="flex items-center gap-gp-lg py-pad-lg border-b border-border-subtle last:border-b-0"
          >
            <span
              className="grid place-items-center size-[36px] rounded-radius-full shrink-0 text-white"
              style={{ background: c.color }}
              aria-hidden
            >
              <Icon size={16} strokeWidth={1.8} />
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
              <span className="text-body-sm font-semibold text-fg-default">{c.name}</span>
              <span className="text-caption-sm text-fg-muted">
                {c.volume} mensagens
              </span>
            </div>
            <Chip color={CHANNEL_STATUS_TONE[c.status]} variant="soft" size="sm" shape="pill">
              {CHANNEL_STATUS_LABEL[c.status]}
            </Chip>
          </li>
        );
      })}
    </ul>
  );
}

/** Traffic Data — tabela com source/visits/bounce/goal. */
function TrafficDataTable() {
  return (
    <SectionCard
      title="Origem do tráfego"
      subtitle="Fontes de aquisição"
      className="flex-1 h-full"
      action={
        <div className="relative max-w-[200px]">
          <Search
            size={14}
            strokeWidth={1.8}
            className="absolute left-pad-lg top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none"
          />
          <input
            type="search"
            placeholder="Buscar..."
            className="h-form-md pl-[34px] pr-pad-md w-full rounded-radius-md bg-bg-muted border border-border-input text-body-md text-fg-default placeholder:text-fg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand focus-visible:border-border-brand"
          />
        </div>
      }
    >
      <div className="overflow-x-auto -mx-pad-2xl px-pad-2xl">
        <table className="w-full text-body-md border-separate border-spacing-0">
          <thead>
            <tr className="text-caption-sm font-bold tracking-[0.04em] text-fg-subtle uppercase">
              <th className="text-left pb-pad-md border-b border-border-subtle font-bold">Fonte</th>
              <th className="text-right pb-pad-md border-b border-border-subtle font-bold">Visitas</th>
              <th className="text-left pb-pad-md pl-pad-2xl border-b border-border-subtle font-bold">Bounce</th>
              <th className="text-left pb-pad-md pl-pad-2xl border-b border-border-subtle font-bold">Meta (%)</th>
            </tr>
          </thead>
          <tbody>
            {TRAFFIC_ROWS.map((r) => (
              <tr key={r.source} className="text-body-xs font-normal">
                <td className="py-pad-lg border-b border-border-subtle text-fg-default font-medium">
                  {r.source}
                </td>
                <td className="py-pad-lg border-b border-border-subtle text-right text-fg-default [font-variant-numeric:tabular-nums]">
                  {r.visits}
                </td>
                <td className="py-pad-sm pl-pad-2xl border-b border-border-subtle text-fg-muted [font-variant-numeric:tabular-nums]">
                  {r.bounce}
                </td>
                <td className="py-pad-sm pl-pad-2xl border-b border-border-subtle">
                  <div className="flex items-center gap-gp-md">
                    <div className="flex-1 h-[6px] bg-bg-muted rounded-radius-full overflow-hidden min-w-[80px]">
                      <div
                        className="h-full rounded-radius-full"
                        style={{ width: `${r.goal}%`, background: r.goalColor }}
                      />
                    </div>
                    <span className="text-caption-sm font-semibold text-fg-default [font-variant-numeric:tabular-nums] shrink-0 min-w-[32px] text-right">
                      {r.goal}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

/* ─────────────────────────────────────────────────────────────
 * KPI evolutivo (LeadKpiCard) — título + valor grande + delta + sparkline.
 * Padrão dashboard-patterns.md §3 (LeadKpiCard).
 * ───────────────────────────────────────────────────────────── */

type LeadKpi = {
  title: string;
  value: string;
  delta: string;
  down?: boolean;
  note: string;
  footer: string;
  bars: number[];
  hl: number;
};

const LEAD_KPIS: LeadKpi[] = [
  { title: "Receita recorrente", value: "R$ 42,8k", delta: "+12%", note: "vs mês anterior",
    footer: "Maior receita recorrente registrada no trimestre.", bars: [28, 34, 30, 38, 42, 40, 48], hl: 6 },
  { title: "Novos clientes", value: "318", delta: "+8%", note: "vs mês anterior",
    footer: "Volume de novos clientes ativos no período.", bars: [22, 26, 31, 28, 34, 30, 36], hl: 6 },
];

/** KPI evolutivo — valor + delta + sparkline + FOOTER descritivo (divisória). §3 */
function LeadKpiCard({ kpi }: { kpi: LeadKpi }) {
  const accent = kpi.down ? "var(--color-fg-danger)" : "var(--color-chart-1)";
  const data = kpi.bars.map((v, i) => ({ i, v }));
  return (
    <article className="flex flex-col rounded-radius-xl border border-border-subtle bg-bg-surface p-pad-3xl shadow-sh-sm">
      <div className="flex items-center justify-between">
        <p className="text-title-md font-semibold text-fg-default">{kpi.title}</p>
        <MoreVertical className="size-icon-sm text-fg-muted" />
      </div>
      <div className="mt-pad-3xl flex items-end justify-between gap-gp-lg">
        <div>
          <div className="flex items-center gap-gp-md">
            <span className="text-[30px] font-bold leading-tight tabular-nums text-fg-default">{kpi.value}</span>
            <KpiDelta value={kpi.delta} signed />
          </div>
          <p className="mt-gp-xs text-body-sm text-fg-muted">{kpi.note}</p>
        </div>
        <div className="h-[64px] w-[150px]">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Bar dataKey="v" radius={4}>
                {data.map((b) => (
                  <Cell key={b.i} fill={b.i === kpi.hl ? accent : "var(--color-bg-muted)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* footer descritivo sob divisória */}
      <div className="mt-auto border-t border-border-subtle pt-pad-lg">
        <p className="text-caption-md text-fg-muted">{kpi.footer}</p>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Card radial (gauge de meta) — RadialBar + PolarAngleAxis domain (L-032).
 * ───────────────────────────────────────────────────────────── */

const META_PCT = 78;

function RadialGoalCard() {
  return (
    <SectionCard title="Meta do mês" subtitle="Resoluções vs objetivo" className="h-full">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="relative">
          <div className="h-[180px] w-[180px]">
            <ResponsiveContainer>
              <RadialBarChart
                data={[{ v: META_PCT }]}
                innerRadius="72%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
                <RadialBar dataKey="v" cornerRadius={8} fill="var(--color-chart-1)" background={{ fill: "var(--color-bg-muted)" }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[30px] font-bold leading-none tabular-nums text-fg-default">{META_PCT}%</span>
            <span className="text-caption-sm text-fg-muted">da meta</span>
          </div>
        </div>
        <p className="mt-gp-lg text-center text-body-sm text-fg-muted">
          <span className="font-semibold text-fg-success">+6%</span> acima do ritmo esperado
        </p>
      </div>
    </SectionCard>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Card dividido em 2 (dados | mapa) — dashboard-patterns.md §4.
 * ───────────────────────────────────────────────────────────── */

const UF_TICKETS = [
  { uf: "SP", value: 214 }, { uf: "RJ", value: 138 }, { uf: "MG", value: 96 },
  { uf: "PR", value: 74 }, { uf: "BA", value: 61 }, { uf: "RS", value: 52 },
];
// Rampa VERDE monocromática (chart-1 escurecendo) — rankeada por valor (§4).
const MAP_RAMP = [
  "var(--color-chart-1)",
  "color-mix(in oklch, var(--color-chart-1) 80%, black)",
  "color-mix(in oklch, var(--color-chart-1) 62%, black)",
  "color-mix(in oklch, var(--color-chart-1) 46%, black)",
  "color-mix(in oklch, var(--color-chart-1) 34%, black)",
];
const ufTotal = UF_TICKETS.reduce((s, u) => s + u.value, 0);
const rankedUf = [...UF_TICKETS].sort((a, b) => b.value - a.value);
const fillByUf: Record<string, string> = {};
rankedUf.forEach((u, i) => { fillByUf[u.uf] = MAP_RAMP[Math.min(i, MAP_RAMP.length - 1)]; });

/** Card "por UF" — mapa centralizado + legenda 2-col (dots na rampa) embaixo. §4 */
function RegionMapCard() {
  return (
    <SectionCard title="Tickets por UF" subtitle={`${UF_TICKETS.length} estados · ${ufTotal} no total`} className="h-full">
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <svg viewBox={BRAZIL_VIEWBOX} className="h-full max-h-[300px] w-full" role="img" aria-label="Mapa de tickets por estado">
          {BRAZIL_PATHS.map((p) => (
            <path key={p.uf} d={p.d} fill={fillByUf[p.uf] ?? "var(--color-bg-muted)"} stroke="var(--color-bg-surface)" strokeWidth={1} />
          ))}
        </svg>
      </div>
      <ul className="grid grid-cols-2 gap-x-gp-xl gap-y-gp-xs">
        {rankedUf.map((u, i) => (
          <li key={u.uf} className="flex items-center gap-gp-sm">
            <span className="size-[10px] shrink-0 rounded-radius-full" style={{ background: MAP_RAMP[Math.min(i, MAP_RAMP.length - 1)] }} aria-hidden />
            <span className="flex-1 text-body-sm text-fg-default">{u.uf}</span>
            <span className="text-body-sm font-semibold tabular-nums text-fg-default">{u.value}</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

/* ─────────────────────────────────────────────────────────────
 * KPI interno no footer (MetricKpi mini-card) + card de crescimento
 * (área + header de KPI grande + footer de 3 KPIs). §2/§3.
 * ───────────────────────────────────────────────────────────── */

function MetricKpi({ label, value, sub, tone = "neutral" }: { label: string; value: string; sub?: string; tone?: "up" | "warn" | "neutral" }) {
  return (
    <div className="rounded-radius-lg border border-border-subtle bg-bg-muted px-pad-xl py-pad-lg">
      <p className="truncate text-caption-md text-fg-muted">{label}</p>
      <p className="mt-gp-2xs text-[22px] font-bold leading-tight tabular-nums text-fg-default">{value}</p>
      {sub && (
        <p className={cn("mt-gp-2xs text-caption-sm font-medium",
          tone === "up" ? "text-fg-success" : tone === "warn" ? "text-fg-warning" : "text-fg-muted")}>
          {sub}
        </p>
      )}
    </div>
  );
}

const GROWTH = [
  { m: "Ago", v: 1180 }, { m: "Set", v: 1290 }, { m: "Out", v: 1360 }, { m: "Nov", v: 1440 },
  { m: "Dez", v: 1510 }, { m: "Jan", v: 1560 }, { m: "Fev", v: 1620 }, { m: "Mar", v: 1690 },
  { m: "Abr", v: 1720 }, { m: "Mai", v: 1770 }, { m: "Jun", v: 1804 }, { m: "Jul", v: 1828 },
];

/** Crescimento da carteira — área + KPI grande interno no topo + 3 KPIs no footer. */
function GrowthCard() {
  return (
    <SectionCard title="Crescimento da carteira" subtitle="Clientes ativos do segmento ao longo do tempo">
      <div>
        <p className="text-caption-md text-fg-muted">Clientes ativos no segmento</p>
        <p className="text-[34px] font-bold leading-none tabular-nums text-fg-default">1.828</p>
        <p className="mt-gp-2xs text-body-sm font-medium text-fg-success">
          ↑ +124 clientes (8,6%) <span className="font-normal text-fg-muted">no último mês</span>
        </p>
      </div>
      <div className="h-[220px] w-full">
        <ResponsiveContainer>
          <AreaChart data={GROWTH} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="var(--color-border-subtle)" />
            <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} width={36} tickMargin={2} allowDecimals={false} tick={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="v" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#fillGrowth)" dot={{ r: 3, fill: "var(--color-chart-1)" }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 gap-gp-lg sm:grid-cols-3">
        <MetricKpi label="Volume total" value="742 MWh" sub="por mês" />
        <MetricKpi label="Economia estimada" value="R$ 122,9 mil" sub="gerada/mês" tone="warn" />
        <MetricKpi label="Ticket médio" value="406 kWh" sub="por cliente" />
      </div>
    </SectionCard>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Page
 * ───────────────────────────────────────────────────────────── */

export default function DashboardShowcase() {
  const { theme, setTheme } = useTheme();
  const [period, setPeriod] = useState<string>("Últimos 7 dias");

  return (
    <AppShell
      contexts={APP_SHELL_CONTEXTS}
      defaultActiveContextId="inbox"
      defaultActiveItemHref="#dashboard"
      breadcrumb={[{ label: "Dashboard" }]}
      commandGroups={APP_SHELL_COMMANDS}
      notifications={{
        items: APP_SHELL_NOTIFICATIONS,
        onMarkAllRead: () => alert("Marcar todas como lidas"),
        onMoreActions: () => alert("Mais ações"),
        onViewAll: () => alert("Ver todas"),
      }}
      messages={{
        items: APP_SHELL_MESSAGES,
        onNewMessage: () => alert("Nova mensagem"),
        onExpand: () => alert("Expandir"),
        onViewAll: () => alert("Ver todas"),
      }}
      theme={theme}
      onThemeChange={(id) => setTheme(id as Theme)}
      themeOptions={APP_SHELL_THEME_OPTIONS}
    >
      <PageHeader
        title="Dashboard"
        description="Visão geral do atendimento em tempo real — KPIs, volume, canais e performance da equipe."
        badge={
          <Chip color="primary" variant="soft" size="sm" shape="pill">
            Hoje
          </Chip>
        }
        actions={
          <>
            <Button
              color="secondary"
              variant="outline"
              size="icon-md"
              aria-label="Mais ações"
            >
              <MoreVertical />
            </Button>
            <Button
              color="secondary"
              variant="outline"
              size="md"
              iconLeft={<Calendar />}
              iconRight={<ChevronDown />}
              onClick={() => {
                const next = period === "Últimos 7 dias" ? "Últimos 30 dias" : "Últimos 7 dias";
                setPeriod(next);
              }}
            >
              {period}
            </Button>
          </>
        }
      />

      {/* Row 1 — Welcome (2/3) + KeyInsights (1/3) — alturas iguais */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gp-2xl items-stretch">
        <div className="lg:col-span-2 flex">
          <WelcomeBanner />
        </div>
        <KeyInsightsCard />
      </section>

      {/* Row 2 — KPIs primários (6) — padrão "Painel do Líder": card único com
          divisores via KpiGroup divided + Kpi + KpiDelta (primitivos DS).
          `tone` colore só o ícone; delta honra `positive` (sinal ≠ bom/ruim aqui:
          "-12s" é melhora) — por isso tone explícito, não `signed`. */}
      <section aria-label="KPIs principais">
        <KpiGroup columns={6} divided>
          {KPIS_PRIMARY.map((kpi) => (
            <Kpi
              key={kpi.id}
              label={kpi.title}
              value={kpi.value}
              icon={<kpi.icon />}
              tone={kpi.tone}
              hint={kpi.delta?.label}
              delta={
                kpi.delta && (
                  <KpiDelta
                    value={kpi.delta.value}
                    tone={kpi.delta.positive ? "success" : "danger"}
                    direction={kpi.delta.direction}
                  />
                )
              }
            />
          ))}
        </KpiGroup>
      </section>

      {/* Row 3 — Volume stacked (2/3) + Current visits donut (1/3) — alturas iguais */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gp-2xl items-stretch">
        <SectionCard
          title="Volume de atendimentos"
          subtitle="Humano vs IA — ano corrente"
          className="lg:col-span-2 h-full"
        >
          <VolumeStackedChart />
        </SectionCard>
        <CurrentVisitsCard />
      </section>

      {/* Row 4 — KPIs qualidade (4) — APÓS os charts */}
      <section
        aria-label="Qualidade do atendimento"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gp-2xl"
      >
        {KPIS_QUALITY.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </section>

      {/* Row 4.5 — 2 KPIs evolutivos (LeadKpiCard §3) + card radial de meta (§2) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gp-2xl items-stretch">
        {LEAD_KPIS.map((k) => (
          <LeadKpiCard key={k.title} kpi={k} />
        ))}
        <RadialGoalCard />
      </section>

      {/* Row 4.6 — Crescimento da carteira (área + KPI interno + footer KPIs) (2/3) + mapa por UF (1/3) */}
      <section className="grid grid-cols-1 gap-gp-2xl lg:grid-cols-3 items-stretch">
        <div className="lg:col-span-2 flex">
          <div className="flex-1">
            <GrowthCard />
          </div>
        </div>
        <RegionMapCard />
      </section>

      {/* Row 5 — Open + Agents */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-gp-2xl">
        <SectionCard
          title="Atendimentos em aberto"
          subtitle="5 ativos agora"
          action={
            <Button color="secondary" variant="ghost" size="sm">
              Ver todos
            </Button>
          }
        >
          <OpenConversationsList />
        </SectionCard>
        <SectionCard
          title="Performance da equipe"
          subtitle="Ranking de hoje"
          action={
            <Button color="secondary" variant="ghost" size="sm">
              Ver equipe
            </Button>
          }
        >
          <AgentPerformanceList />
        </SectionCard>
      </section>

      {/* Row 6 — Channels (1/3) + Traffic Data (2/3). Ambos h-full pra
          alturas se igualarem dentro da row do grid. */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gp-2xl items-stretch">
        <SectionCard title="Canais" subtitle="Volume e status" className="h-full">
          <ChannelPerformanceList />
        </SectionCard>
        <div className="lg:col-span-2 flex">
          <TrafficDataTable />
        </div>
      </section>
    </AppShell>
  );
}
