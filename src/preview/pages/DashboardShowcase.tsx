import { useState } from "react";
import { useTheme, type Theme } from "@/hooks/useTheme";
import type { LucideIcon } from "lucide-react";
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
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import { PageHeader } from "@/components/ui/PageHeader";
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
        <h3 className="m-0 text-body-md font-medium font-bold text-fg-default">Key Insights</h3>
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
          <h3 className="m-0 text-body-md font-medium font-bold text-fg-default">{title}</h3>
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

      {/* Row 2 — KPIs primários (6) */}
      <section
        aria-label="KPIs principais"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-gp-2xl"
      >
        {KPIS_PRIMARY.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
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
