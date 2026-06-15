import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  ExternalLink,
  Globe,
  MoreVertical,
  Store,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Tabs, TabsList, TabsTrigger } from "../../components/shadcn/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../components/ui/Chart";
import { DocLayout, DocHeader, DocSeparator } from "../components";

/* ── Paleta do showcase (tokens de chart + semânticos) ──────────────── */
const C = {
  green: "var(--color-chart-1)",
  teal: "var(--color-chart-2)",
  blue: "var(--color-chart-3)",
  amber: "var(--color-chart-4)",
  violet: "var(--color-chart-5)",
  red: "var(--color-fg-danger)",
};

/* Wrapper de card (replica o Card do DS com controle de padding) */
function Panel({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-radius-lg bg-bg-surface p-pad-4xl text-body-md text-fg-default shadow-sh-lg ring-1 ring-foreground/5 dark:ring-foreground/10",
        className,
      )}
    >
      {children}
    </section>
  );
}

const TOC = [
  { id: "saas-revenue", label: "SaaS revenue metrics" },
  { id: "db-instance", label: "Database instance" },
  { id: "finance", label: "Finance + Report" },
  { id: "total-revenue", label: "Total Revenue + Growth" },
  { id: "user-activity", label: "User Activity" },
  { id: "total-income", label: "Total Income + Report" },
  { id: "total-earning", label: "Total earning" },
  { id: "anatomy", label: "Anatomy detected" },
  { id: "weekly-overview", label: "Weekly overview" },
  { id: "total-sales", label: "Total sales" },
  { id: "subscription", label: "Subscription Billing" },
  { id: "acme-uptime", label: "Uptime status" },
  { id: "system-status", label: "System Status" },
  { id: "budget", label: "Budget Breakdown" },
  { id: "crypto", label: "Crypto Portfolio" },
];

/* ════════════════════════════════════════════════════════════════════
   1 — SaaS revenue metrics (multi-line + tabela de planos)
   ════════════════════════════════════════════════════════════════════ */
const REV_DATA = Array.from({ length: 27 }, (_, i) => {
  const t = i / 26;
  return {
    day: `Feb ${i + 1}`,
    enterprise: Math.round(40 + t * 80 + 22 * Math.sin(i / 2.2)),
    pro: Math.round(55 + t * 60 + 28 * Math.sin(i / 1.7 + 1)),
    starter: Math.round(60 + t * 70 + 20 * Math.sin(i / 2.6 + 2)),
  };
});

const PLANS = [
  { plan: "Enterprise", color: C.blue, subs: 214, mrr: 21400, churn: "0.9%", churnUp: true, upgrades: "+14", ltv: 3555.56 },
  { plan: "Pro", color: C.amber, subs: 865, mrr: 12975, churn: "1.8%", churnUp: false, upgrades: "+62", ltv: 833.33 },
  { plan: "Starter", color: C.red, subs: 1240, mrr: 4650, churn: "2.4%", churnUp: false, upgrades: "+38", ltv: 193.75 },
];

const revConfig = {
  enterprise: { label: "Enterprise", color: C.blue },
  pro: { label: "Pro", color: C.amber },
  starter: { label: "Starter", color: C.red },
} satisfies ChartConfig;

const brl = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function SaaSRevenueCard() {
  return (
    <Panel id="saas-revenue" className="lg:col-span-2">
      <div className="mb-pad-3xl flex items-start justify-between">
        <div>
          <p className="text-caption-md text-fg-muted">SaaS revenue metrics</p>
          <p className="text-display-sm font-bold leading-tight text-fg-default [font-variant-numeric:tabular-nums]">
            $39,025.00
          </p>
          <p className="text-body-sm">
            <span className="font-medium text-fg-success">+$1,840.00 (4.9%)</span>{" "}
            <span className="text-fg-muted">vs last month</span>
          </p>
        </div>
        <div className="flex items-center gap-gp-lg">
          {PLANS.map((p) => (
            <span key={p.plan} className="flex items-center gap-gp-2xs text-caption-sm text-fg-muted">
              <span className="size-[8px] rounded-radius-full" style={{ background: p.color }} />
              {p.plan}
            </span>
          ))}
        </div>
      </div>

      <ChartContainer config={revConfig} className="h-[260px] w-full">
        <LineChart data={REV_DATA} margin={{ left: 4, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={28}
            interval={1}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v) => `$${v}k`}
            ticks={[0, 30, 60, 90, 120, 150]}
            domain={[0, 150]}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
          <Line dataKey="enterprise" type="monotone" stroke="var(--color-enterprise)" strokeWidth={2} dot={false} />
          <Line dataKey="pro" type="monotone" stroke="var(--color-pro)" strokeWidth={2} dot={false} />
          <Line dataKey="starter" type="monotone" stroke="var(--color-starter)" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartContainer>

      {/* Tabela de planos */}
      <table className="mt-pad-3xl w-full text-body-sm">
        <thead>
          <tr className="border-b border-border-subtle text-caption-md text-fg-muted">
            <th className="py-pad-md text-left font-medium">Plan</th>
            <th className="py-pad-md text-right font-medium">Subscribers</th>
            <th className="py-pad-md text-right font-medium">MRR</th>
            <th className="py-pad-md text-right font-medium">Churn</th>
            <th className="py-pad-md text-right font-medium">Upgrades</th>
            <th className="py-pad-md text-right font-medium">LTV</th>
          </tr>
        </thead>
        <tbody className="[font-variant-numeric:tabular-nums]">
          {PLANS.map((p) => (
            <tr key={p.plan} className="border-b border-border-subtle last:border-0">
              <td className="py-pad-lg">
                <span className="flex items-center gap-gp-md font-medium text-fg-default">
                  <span className="h-[16px] w-[3px] rounded-radius-full" style={{ background: p.color }} />
                  {p.plan}
                </span>
              </td>
              <td className="py-pad-lg text-right">{p.subs.toLocaleString("en-US")}</td>
              <td className="py-pad-lg text-right">{brl(p.mrr)}</td>
              <td className={cn("py-pad-lg text-right", p.churnUp ? "text-fg-success" : "text-fg-danger")}>
                {p.churn}
              </td>
              <td className="py-pad-lg text-right text-fg-success">{p.upgrades}</td>
              <td className="py-pad-lg text-right">{brl(p.ltv)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   2 — Database instance (stacked bars + stats + range nav)
   ════════════════════════════════════════════════════════════════════ */
const DB_DATA = Array.from({ length: 28 }, (_, i) => {
  const base = 4200 + Math.round(2600 * Math.abs(Math.sin(i / 3.1)));
  return {
    day: `Feb ${String(i + 1).padStart(2, "0")}`,
    fast: base,
    slow: Math.round(300 + 900 * Math.abs(Math.sin(i / 2.3 + 1))),
  };
});
const dbConfig = {
  fast: { label: "Normais", color: C.green },
  slow: { label: "Lentas", color: C.blue },
} satisfies ChartConfig;

function DbInstanceCard() {
  return (
    <Panel id="db-instance" className="lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-gp-lg">
        <div>
          <p className="text-title-md font-semibold text-fg-default">prod-db-primary</p>
          <p className="text-body-sm text-fg-muted">
            Instance ID: <span className="font-medium text-fg-default">db_mX4kR9p</span>
          </p>
        </div>
        <div className="flex items-center gap-pad-4xl">
          {[
            { l: "Avg Query Time", v: "42 ms" },
            { l: "Slow Queries", v: "1,243" },
            { l: "Uptime", v: "99.97%" },
          ].map((s) => (
            <div key={s.l} className="text-right">
              <p className="text-caption-sm text-fg-muted">{s.l}</p>
              <p className="text-body-lg font-semibold text-fg-default [font-variant-numeric:tabular-nums]">{s.v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="my-pad-3xl flex items-center justify-between border-t border-border-subtle pt-pad-3xl">
        <div className="flex items-center gap-gp-md">
          <Chip color="success" variant="soft" size="sm" shape="pill">Healthy</Chip>
          <span className="text-body-sm text-fg-muted">PostgreSQL 16.2 · last analyzed Feb 28, 2026</span>
        </div>
      </div>

      <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
        <div className="mb-pad-2xl flex items-center justify-between">
          <p className="text-body-md font-semibold text-fg-default">Query distribution</p>
          <div className="flex items-center gap-gp-md text-body-sm text-fg-muted">
            <ChevronLeft className="size-icon-sm" />
            <span>Feb 1 – 28, 2026</span>
            <ChevronRight className="size-icon-sm" />
          </div>
        </div>
        <ChartContainer config={dbConfig} className="h-[240px] w-full">
          <BarChart data={DB_DATA} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={36}
              tickFormatter={(v) => (v === 0 ? "0k" : `${v / 1000}k`)}
              ticks={[0, 2500, 5000, 7500, 10000]}
              domain={[0, 10000]}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="fast" stackId="q" fill="var(--color-fast)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="slow" stackId="q" fill="var(--color-slow)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   3 — Finance (stacked bars) + Report panel
   ════════════════════════════════════════════════════════════════════ */
const FIN_DATA = [
  { m: "Jan", a: 20, b: 0, c: 0 },
  { m: "Feb", a: 20, b: 8, c: 0 },
  { m: "Mar", a: 18, b: 22, c: 0 },
  { m: "Abr", a: 12, b: 13, c: 0 },
  { m: "Mai", a: 22, b: 18, c: 4 },
  { m: "Jun", a: 15, b: 22, c: 15 },
  { m: "Jul", a: 25, b: 7, c: 12 },
];
const finConfig = {
  a: { label: "Profit", color: C.green },
  b: { label: "Income", color: C.blue },
  c: { label: "Expense", color: C.violet },
} satisfies ChartConfig;

function FinanceCard() {
  return (
    <Panel id="finance" className="lg:col-span-2">
      <div className="grid gap-pad-4xl lg:grid-cols-[1fr_280px]">
        {/* Gráfico */}
        <div>
          <div className="mb-pad-2xl flex items-start justify-between">
            <div>
              <p className="text-title-md font-semibold text-fg-default">Finance</p>
              <p className="text-body-sm text-fg-muted">Yearly report overview</p>
            </div>
            <MoreVertical className="size-icon-sm text-fg-muted" />
          </div>
          <ChartContainer config={finConfig} className="h-[260px] w-full">
            <BarChart data={FIN_DATA} margin={{ left: -16 }} barCategoryGap={20}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} ticks={[0, 10, 20, 30, 40, 50]} domain={[0, 52]} />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <Bar dataKey="a" stackId="f" fill="var(--color-a)" />
              <Bar dataKey="b" stackId="f" fill="var(--color-b)" />
              <Bar dataKey="c" stackId="f" fill="var(--color-c)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Report panel */}
        <div className="flex flex-col gap-gp-lg border-border-subtle lg:border-l lg:pl-pad-4xl">
          <div className="mb-pad-md flex items-start justify-between">
            <div>
              <p className="text-title-md font-semibold text-fg-default">Report</p>
              <p className="text-body-sm text-fg-muted">Monthly Avg. $45.578k</p>
            </div>
            <MoreVertical className="size-icon-sm text-fg-muted" />
          </div>
          {[
            { icon: DollarSign, label: "Total Profit", value: "$48,568.20", bg: "bg-bg-success-muted", fg: "text-fg-success" },
            { icon: Wallet, label: "Total Income", value: "$38,453.25", bg: "bg-bg-info-muted", fg: "text-fg-info" },
            { icon: CreditCard, label: "Total Expense", value: "$2,453.45", bg: "bg-bg-brand-subtle", fg: "text-fg-brand" },
          ].map((r) => (
            <div key={r.label} className="flex items-center gap-gp-md">
              <span className={cn("flex size-[36px] items-center justify-center rounded-radius-base", r.bg)}>
                <r.icon className={cn("size-icon-sm", r.fg)} />
              </span>
              <div>
                <p className="text-body-sm text-fg-muted">{r.label}</p>
                <p className="text-body-lg font-semibold text-fg-default [font-variant-numeric:tabular-nums]">{r.value}</p>
              </div>
            </div>
          ))}
          <Button color="secondary" variant="outline" className="mt-auto w-full">
            View Report
          </Button>
        </div>
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   4 — Total Revenue (bars +/-) + radial Growth gauge
   ════════════════════════════════════════════════════════════════════ */
const TR_DATA = [
  { m: "Jan", y2024: 20, y2023: -13 },
  { m: "Feb", y2024: 10, y2023: -15 },
  { m: "Mar", y2024: 12, y2023: -14 },
  { m: "Apr", y2024: 11, y2023: -10 },
  { m: "May", y2024: 20, y2023: -17 },
  { m: "Jun", y2024: 11, y2023: -12 },
  { m: "Jul", y2024: 14, y2023: -12 },
];
const trConfig = {
  y2024: { label: "2024", color: "var(--color-fg-default)" },
  y2023: { label: "2023", color: "var(--color-bg-muted)" },
} satisfies ChartConfig;
const GROWTH = [{ k: "growth", pct: 78, fill: C.green }];

function TotalRevenueCard() {
  return (
    <Panel id="total-revenue" className="lg:col-span-2">
      <div className="grid gap-pad-4xl lg:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-pad-md flex items-center justify-between">
            <p className="text-title-md font-semibold text-fg-default">Total Revenue</p>
            <MoreVertical className="size-icon-sm text-fg-muted" />
          </div>
          <div className="mb-pad-2xl flex items-center gap-gp-lg text-caption-sm text-fg-muted">
            <span className="flex items-center gap-gp-2xs"><span className="size-[8px] rounded-radius-full bg-fg-default" />2024</span>
            <span className="flex items-center gap-gp-2xs"><span className="size-[8px] rounded-radius-full bg-bg-muted" />2023</span>
          </div>
          <ChartContainer config={trConfig} className="h-[260px] w-full">
            <BarChart data={TR_DATA} margin={{ left: -16 }} barCategoryGap={8} stackOffset="sign">
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} ticks={[-20, -10, 0, 10, 20, 30]} domain={[-20, 30]} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="y2024" fill="var(--color-fg-default)" radius={[6, 6, 0, 0]} barSize={10} />
              <Bar dataKey="y2023" fill="var(--color-bg-muted)" radius={[0, 0, 6, 6]} barSize={10} />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Growth side */}
        <div className="flex flex-col items-center gap-gp-md border-border-subtle lg:border-l lg:pl-pad-4xl">
          <div className="relative flex w-full items-center justify-center">
            <ChartContainer config={{}} className="aspect-square h-[180px]">
              <RadialBarChart data={GROWTH} startAngle={210} endAngle={-30} innerRadius={70} outerRadius={95}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
                <RadialBar dataKey="pct" cornerRadius={8} fill={C.green} background={{ fill: "var(--color-bg-muted)" }} />
              </RadialBarChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-title-lg font-bold text-fg-default">78%</span>
              <span className="text-caption-sm text-fg-muted">Growth</span>
            </div>
          </div>
          <p className="text-body-sm text-fg-muted">62% Company Growth</p>
          <div className="mt-auto flex w-full items-center justify-between gap-gp-md">
            <div className="flex items-center gap-gp-sm">
              <span className="flex size-[32px] items-center justify-center rounded-radius-base bg-bg-success-muted">
                <DollarSign className="size-icon-xs text-fg-success" />
              </span>
              <div>
                <p className="text-caption-sm text-fg-muted">2024</p>
                <p className="text-body-md font-semibold text-fg-default">$32.5K</p>
              </div>
            </div>
            <div className="flex items-center gap-gp-sm">
              <span className="flex size-[32px] items-center justify-center rounded-radius-base bg-bg-info-muted">
                <Wallet className="size-icon-xs text-fg-info" />
              </span>
              <div>
                <p className="text-caption-sm text-fg-muted">2023</p>
                <p className="text-body-md font-semibold text-fg-default">$41.2K</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   5 — User Activity (tabs + stacked bars + métricas)
   ════════════════════════════════════════════════════════════════════ */
const UA_DATA = Array.from({ length: 28 }, (_, i) => ({
  day: `Feb ${String(i + 1).padStart(2, "0")}`,
  active: Math.round(360 + 1100 * Math.abs(Math.sin(i / 2.7 + 0.5))),
  churn: Math.round(20 + 120 * Math.abs(Math.sin(i / 3.3 + 1))),
}));
const uaConfig = {
  active: { label: "Active users", color: C.green },
  churn: { label: "Churned", color: C.blue },
} satisfies ChartConfig;

function UserActivityCard() {
  return (
    <Panel id="user-activity" className="lg:col-span-2">
      <div className="mb-pad-2xl flex items-start justify-between">
        <div>
          <p className="text-title-md font-semibold text-fg-default">User Activity</p>
          <p className="text-body-sm text-fg-muted">Track your active users and churn over the month</p>
        </div>
        <MoreVertical className="size-icon-sm text-fg-muted" />
      </div>

      <div className="mb-pad-2xl flex items-center justify-between">
        <Tabs defaultValue="ratio">
          <TabsList>
            <TabsTrigger value="ratio">Ratio</TabsTrigger>
            <TabsTrigger value="source">Source</TabsTrigger>
          </TabsList>
        </Tabs>
        <span className="flex items-center gap-gp-2xs text-caption-sm text-fg-muted">
          <span className="size-[8px] rounded-radius-full bg-bg-success" /> Recently Updated
        </span>
      </div>

      <div className="mb-pad-2xl flex items-center gap-pad-4xl">
        <div>
          <p className="flex items-center gap-gp-sm text-display-xs font-bold text-fg-default [font-variant-numeric:tabular-nums]">
            <span className="size-[12px] rounded-[3px]" style={{ background: C.green }} />24,783
          </p>
          <p className="text-body-sm text-fg-muted">Active users</p>
        </div>
        <div>
          <p className="flex items-center gap-gp-sm text-display-xs font-bold text-fg-default [font-variant-numeric:tabular-nums]">
            <span className="size-[12px] rounded-[3px]" style={{ background: C.blue }} />1,397
          </p>
          <p className="text-body-sm text-fg-muted">Churned</p>
        </div>
      </div>

      <ChartContainer config={uaConfig} className="h-[260px] w-full">
        <BarChart data={UA_DATA} margin={{ left: -8 }}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} ticks={[0, 400, 800, 1200, 1600]} domain={[0, 1600]} />
          <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
          <Bar dataKey="active" stackId="u" fill="var(--color-active)" />
          <Bar dataKey="churn" stackId="u" fill="var(--color-churn)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   6 — Total earning (range bars laranja/rosa + lista)
   ════════════════════════════════════════════════════════════════════ */
const EARN_DATA = [
  { d: "1", base: 1, low: 3, high: 3 },
  { d: "2", base: 1, low: 2, high: 3 },
  { d: "3", base: 0, low: 4, high: 4 },
  { d: "4", base: 2, low: 2, high: 2 },
  { d: "5", base: 1, low: 2, high: 2 },
  { d: "6", base: 2, low: 3, high: 3 },
  { d: "7", base: 2, low: 3, high: 4 },
  { d: "8", base: 1, low: 2, high: 2 },
];
const earnConfig = {
  low: { label: "Pagamentos", color: C.amber },
  high: { label: "Vendas", color: C.red },
} satisfies ChartConfig;

function TotalEarningCard() {
  return (
    <Panel id="total-earning">
      <div className="mb-pad-md flex items-start justify-between">
        <p className="text-title-md font-semibold text-fg-default">Total earning</p>
        <MoreVertical className="size-icon-sm text-fg-muted" />
      </div>
      <p className="mb-pad-3xl flex items-center gap-gp-sm">
        <span className="text-display-sm font-bold text-fg-default [font-variant-numeric:tabular-nums]">87%</span>
        <span className="flex items-center gap-gp-2xs text-body-sm font-medium text-fg-success">
          <TrendingUp className="size-icon-xs" /> +38%
        </span>
      </p>

      <ChartContainer config={earnConfig} className="h-[160px] w-full">
        <BarChart data={EARN_DATA} margin={{ left: 0, right: 0 }} barCategoryGap={14}>
          <Bar dataKey="base" stackId="e" fill="transparent" />
          <Bar dataKey="low" stackId="e" fill="var(--color-low)" barSize={14} />
          <Bar dataKey="high" stackId="e" fill="var(--color-high)" radius={[8, 8, 0, 0]} barSize={14} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        </BarChart>
      </ChartContainer>

      <div className="mt-pad-3xl flex flex-col gap-gp-lg">
        {[
          { icon: DollarSign, t: "Total revenue", s: "Successful payments", v: "+$250" },
          { icon: Store, t: "Total sales", s: "Refund", v: "+$80" },
        ].map((r) => (
          <div key={r.t} className="flex items-center gap-gp-md">
            <span className="flex size-[36px] items-center justify-center rounded-radius-base bg-bg-muted">
              <r.icon className="size-icon-sm text-fg-muted" />
            </span>
            <div className="flex-1">
              <p className="text-body-md font-medium text-fg-default">{r.t}</p>
              <p className="text-caption-sm text-fg-muted">{r.s}</p>
            </div>
            <span className="text-body-md font-semibold text-fg-default">{r.v}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   7 — Total Income (area + Report cards)
   ════════════════════════════════════════════════════════════════════ */
const INCOME_DATA = [
  { d: "MO", v: 3 },
  { d: "TU", v: 3 },
  { d: "WE", v: 5 },
  { d: "TH", v: 5 },
  { d: "FR", v: 4 },
  { d: "SA", v: 4 },
  { d: "SU", v: 6 },
];
const incomeConfig = { v: { label: "Income", color: C.green } } satisfies ChartConfig;

function TotalIncomeCard() {
  return (
    <Panel id="total-income" className="lg:col-span-2">
      <div className="grid gap-pad-4xl lg:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-pad-2xl flex items-start justify-between">
            <div>
              <p className="text-title-md font-semibold text-fg-default">Total Income</p>
              <p className="text-body-sm text-fg-muted">Weekly report overview</p>
            </div>
            <MoreVertical className="size-icon-sm text-fg-muted" />
          </div>
          <ChartContainer config={incomeConfig} className="h-[240px] w-full">
            <AreaChart data={INCOME_DATA} margin={{ left: 4, right: 8 }}>
              <defs>
                <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-v)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--color-v)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="d" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tickFormatter={(v) => `$${v}K`}
                ticks={[1, 2, 3, 4, 5, 6]}
                domain={[1, 6]}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Area dataKey="v" type="linear" stroke="var(--color-v)" strokeWidth={2} fill="url(#fillIncome)" />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="flex flex-col justify-center gap-gp-lg border-border-subtle lg:border-l lg:pl-pad-4xl">
          <div className="mb-pad-md">
            <p className="text-title-md font-semibold text-fg-default">Report</p>
            <p className="text-body-sm text-fg-muted">Weekly activity</p>
          </div>
          {[
            { icon: Wallet, t: "Income", v: "$5,550", bg: "bg-bg-success-muted", fg: "text-fg-success" },
            { icon: CreditCard, t: "Expense", v: "$3,520", bg: "bg-bg-info-muted", fg: "text-fg-info" },
            { icon: DollarSign, t: "Profit", v: "$2,350", bg: "bg-bg-danger-muted", fg: "text-fg-danger" },
          ].map((r) => (
            <div key={r.t} className="flex items-center gap-gp-md rounded-radius-base bg-bg-muted p-pad-2xl">
              <span className={cn("flex size-[36px] items-center justify-center rounded-radius-base", r.bg)}>
                <r.icon className={cn("size-icon-sm", r.fg)} />
              </span>
              <div>
                <p className="text-body-sm text-fg-muted">{r.t}</p>
                <p className="text-body-lg font-semibold text-fg-default [font-variant-numeric:tabular-nums]">{r.v}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   8 — Anatomy detected (mini bars + 96.5%)
   ════════════════════════════════════════════════════════════════════ */
const ANATOMY = [
  { i: 0, v: 40 }, { i: 1, v: 62 }, { i: 2, v: 52 }, { i: 3, v: 96 },
  { i: 4, v: 44 }, { i: 5, v: 38 }, { i: 6, v: 70 }, { i: 7, v: 50 },
];

function AnatomyCard() {
  return (
    <Panel id="anatomy" className="bg-bg-subtle">
      <div className="mb-pad-3xl flex items-start justify-between">
        <div>
          <p className="text-title-lg font-bold text-fg-default">Anatomy detected</p>
          <p className="text-body-sm text-fg-muted">Your product reach increasing beyond our predictions.</p>
        </div>
        <span className="flex size-[40px] items-center justify-center rounded-radius-base bg-bg-muted">
          <AlertTriangle className="size-icon-sm text-fg-default" />
        </span>
      </div>
      <ChartContainer config={{}} className="h-[140px] w-full">
        <BarChart data={ANATOMY} margin={{ left: 0, right: 0 }} barCategoryGap={10}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <Bar dataKey="v" radius={[4, 4, 0, 0]}>
            {ANATOMY.map((d) => (
              <Cell key={d.i} fill={d.i === 3 ? "var(--color-fg-default)" : "var(--color-bg-muted)"} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
      <div className="mt-pad-2xl flex items-end justify-between">
        <div>
          <p className="text-display-sm font-bold text-fg-default [font-variant-numeric:tabular-nums]">96.5%</p>
          <p className="text-body-sm text-fg-muted">Prediction 78%</p>
        </div>
        <Button color="secondary" variant="outline" size="sm" shape="pill">See details</Button>
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   9 — Weekly overview (line sobre barras + 80%)
   ════════════════════════════════════════════════════════════════════ */
const WEEK_DATA = [
  { d: "Mo", line: 38, bar: 60 },
  { d: "Tu", line: 60, bar: 60 },
  { d: "We", line: 42, bar: 60 },
  { d: "Th", line: 85, bar: 85 },
  { d: "Fr", line: 62, bar: 60 },
  { d: "Sa", line: 63, bar: 60 },
  { d: "Su", line: 28, bar: 60 },
];
const weekConfig = { line: { label: "Vendas", color: C.green } } satisfies ChartConfig;

function WeeklyOverviewCard() {
  return (
    <Panel id="weekly-overview">
      <div className="mb-pad-2xl flex items-start justify-between">
        <p className="text-title-md font-semibold text-fg-default">Weekly overview</p>
        <MoreVertical className="size-icon-sm text-fg-muted" />
      </div>
      <ChartContainer config={weekConfig} className="h-[180px] w-full">
        <ComposedChart data={WEEK_DATA} margin={{ left: -16, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="d" tickLine={false} axisLine={false} tickMargin={8} hide />
          <YAxis tickLine={false} axisLine={false} ticks={[0, 30, 60, 90]} domain={[0, 95]} tickFormatter={(v) => `${v}k`} width={32} />
          <Bar dataKey="bar" radius={6} barSize={18}>
            {WEEK_DATA.map((d) => (
              <Cell key={d.d} fill={d.d === "Th" ? "var(--color-line)" : "color-mix(in oklch, var(--color-chart-1) 16%, transparent)"} />
            ))}
          </Bar>
          <Line dataKey="line" type="monotone" stroke="var(--color-line)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-line)" }} />
        </ComposedChart>
      </ChartContainer>
      <div className="mt-pad-3xl flex items-center gap-gp-lg">
        <span className="text-display-xs font-bold text-fg-default">80%</span>
        <p className="flex-1 text-body-sm text-fg-muted">Your sales performance is 60% Better compare to Last month</p>
      </div>
      <Button color="secondary" variant="outline" className="mt-pad-2xl w-full">Details</Button>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   10 — Total sales (bars + line + lojas)
   ════════════════════════════════════════════════════════════════════ */
const SALES_DATA = [
  { t: "10:00", bar: 40, line: 42 },
  { t: "11:00", bar: 40, line: 50 },
  { t: "12:00", bar: 40, line: 50 },
  { t: "13:00", bar: 40, line: 44 },
  { t: "14:00", bar: 40, line: 44 },
  { t: "15:00", bar: 40, line: 38 },
  { t: "16:00", bar: 40, line: 38 },
  { t: "17:00", bar: 40, line: 50 },
  { t: "18:00", bar: 40, line: 56 },
  { t: "19:00", bar: 40, line: 64 },
  { t: "20:00", bar: 40, line: 64 },
];
const salesConfig = { line: { label: "Vendas", color: C.green } } satisfies ChartConfig;

function TotalSalesCard() {
  return (
    <Panel id="total-sales">
      <div className="mb-pad-md flex items-center justify-between">
        <span className="flex items-center gap-gp-sm">
          <span className="flex size-[28px] items-center justify-center rounded-radius-base bg-bg-success-muted">
            <TrendingUp className="size-icon-xs text-fg-success" />
          </span>
          <span className="text-body-md font-semibold text-fg-default">Total sales</span>
        </span>
        <Button color="secondary" variant="outline" size="sm" shape="pill">Details</Button>
      </div>
      <p className="mb-pad-3xl flex items-center gap-gp-sm">
        <span className="text-display-sm font-bold text-fg-default [font-variant-numeric:tabular-nums]">$2,150.00</span>
        <Chip color="neutral" variant="soft" size="sm" shape="pill">+5%</Chip>
      </p>
      <div className="flex flex-col gap-gp-md border-b border-border-subtle pb-pad-3xl">
        {[
          { icon: Globe, t: "Online Store", v: "$20k", d: "+12.6%", up: true },
          { icon: Store, t: "Offline Store", v: "$20k", d: "-4.2%", up: false },
        ].map((r) => (
          <div key={r.t} className="flex items-center gap-gp-md">
            <r.icon className="size-icon-sm text-fg-muted" />
            <span className="flex-1 text-body-sm text-fg-default">{r.t}</span>
            <span className="text-body-sm font-medium text-fg-default">{r.v}</span>
            <span className={cn("text-body-sm font-medium", r.up ? "text-fg-success" : "text-fg-danger")}>{r.d}</span>
          </div>
        ))}
      </div>
      <ChartContainer config={salesConfig} className="mt-pad-2xl h-[120px] w-full">
        <ComposedChart data={SALES_DATA} margin={{ left: 0, right: 0, top: 8 }}>
          <Bar dataKey="bar" barSize={14} fill="color-mix(in oklch, var(--color-chart-1) 16%, transparent)" radius={4} />
          <Line dataKey="line" type="monotone" stroke="var(--color-line)" strokeWidth={2} dot={false} />
          <XAxis dataKey="t" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} fontSize={10} />
        </ComposedChart>
      </ChartContainer>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   11 — Subscription Billing (barra segmentada + tabela)
   ════════════════════════════════════════════════════════════════════ */
const PLAN_SPLIT = [
  { label: "Pro", pct: 55, color: C.blue },
  { label: "Starter", pct: 30, color: C.green },
  { label: "Free", pct: 12, color: C.amber },
  { label: "Cancelled", pct: 3, color: C.violet },
];
const INVOICES = [
  { date: "Mar 26", desc: "Pro plan – monthly renewal", customer: "Acme Corp", amount: "+$299", up: true },
  { date: "Mar 26", desc: "Starter plan – monthly renewal", customer: "Bright Labs", amount: "+$49", up: true },
  { date: "Feb 26", desc: "Pro plan – refund", customer: "Nova Systems", amount: "-$299", up: false },
  { date: "Feb 26", desc: "Pro plan – monthly renewal", customer: "Orbit Inc", amount: "+$299", up: true },
];

function SubscriptionBillingCard() {
  return (
    <Panel id="subscription" className="lg:col-span-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-title-md font-semibold text-fg-default">Subscription Billing</p>
          <p className="text-body-sm text-fg-muted">Monitor your plans, revenue, and billing activity.</p>
        </div>
        <MoreVertical className="size-icon-sm text-fg-muted" />
      </div>

      <Tabs defaultValue="summary" className="mt-pad-3xl">
        <TabsList>
          <TabsTrigger value="summary">Billing Summary</TabsTrigger>
          <TabsTrigger value="guide">Plan Guide</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-pad-3xl grid gap-pad-4xl lg:grid-cols-[1fr_320px]">
        {/* MRR + barra segmentada + alerta */}
        <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
          <p className="text-caption-md text-fg-muted">Monthly Recurring Revenue</p>
          <p className="text-display-sm font-bold text-fg-default [font-variant-numeric:tabular-nums]">$48,320</p>

          <div className="mt-pad-2xl flex h-[8px] gap-[3px] overflow-hidden rounded-radius-full">
            {PLAN_SPLIT.map((p) => (
              <span key={p.label} style={{ width: `${p.pct}%`, background: p.color }} className="first:rounded-l-radius-full last:rounded-r-radius-full" />
            ))}
          </div>
          <div className="mt-pad-md flex flex-wrap gap-gp-lg">
            {PLAN_SPLIT.map((p) => (
              <span key={p.label} className="flex items-center gap-gp-2xs text-caption-sm text-fg-muted">
                <span className="size-[8px] rounded-[2px]" style={{ background: p.color }} />
                <span className="font-semibold text-fg-default">{p.pct}%</span> {p.label}
              </span>
            ))}
          </div>

          <div className="my-pad-3xl border-t border-border-subtle" />
          <p className="text-body-md font-semibold text-fg-default">14 renewals due this week</p>
          <div className="mt-pad-md flex items-center justify-between rounded-radius-base bg-bg-muted px-pad-3xl py-pad-2xl">
            <span className="text-body-sm text-fg-muted">3 invoices pending payment – review before Mar 15.</span>
            <span className="flex items-center gap-gp-2xs text-body-sm font-medium text-fg-info">
              View invoices <ExternalLink className="size-icon-xs" />
            </span>
          </div>
        </div>

        {/* Account manager */}
        <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
          <p className="text-body-md font-semibold text-fg-default">Need help?</p>
          <p className="text-body-sm text-fg-muted">Contact your account manager</p>
          <div className="mt-pad-3xl flex items-center gap-gp-md">
            <span className="flex size-[40px] items-center justify-center rounded-radius-full bg-bg-muted text-body-sm font-semibold text-fg-default">SM</span>
            <div>
              <p className="text-body-md font-medium text-fg-default">Sara Mitchell</p>
              <p className="text-body-sm text-fg-info">sara.mitchell@example.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent invoices */}
      <p className="mb-pad-md mt-pad-4xl text-title-sm font-semibold text-fg-default">Recent Invoices</p>
      <table className="w-full text-body-sm">
        <thead>
          <tr className="border-b border-border-subtle text-caption-md text-fg-muted">
            <th className="py-pad-md text-left font-medium">Date</th>
            <th className="py-pad-md text-left font-medium">Description</th>
            <th className="py-pad-md text-left font-medium">Customer</th>
            <th className="py-pad-md text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {INVOICES.map((inv, i) => (
            <tr key={i} className="border-b border-border-subtle last:border-0">
              <td className="py-pad-lg font-medium text-fg-default">{inv.date}</td>
              <td className="py-pad-lg text-fg-muted">{inv.desc}</td>
              <td className="py-pad-lg text-fg-default">{inv.customer}</td>
              <td className={cn("py-pad-lg text-right font-medium [font-variant-numeric:tabular-nums]", inv.up ? "text-fg-success" : "text-fg-danger")}>
                {inv.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   12 / 13 — Uptime status (barras de status)
   ════════════════════════════════════════════════════════════════════ */
type Status = "ok" | "degraded" | "down" | "inactive";
const STATUS_COLOR: Record<Status, string> = {
  ok: C.green,
  degraded: C.amber,
  down: C.red,
  inactive: "var(--color-bg-muted)",
};
// gera N status mayoritariamente "ok" com alguns eventos determinísticos
function genStatuses(n: number, downAt: number[], degradedAt: number[]): Status[] {
  return Array.from({ length: n }, (_, i) =>
    downAt.includes(i) ? "down" : degradedAt.includes(i) ? "degraded" : "ok",
  );
}
function StatusBars({ statuses }: { statuses: Status[] }) {
  return (
    <div className="flex h-[36px] items-stretch gap-[2px]">
      {statuses.map((s, i) => (
        <span key={i} className="flex-1 rounded-[2px]" style={{ background: STATUS_COLOR[s] }} />
      ))}
    </div>
  );
}
function StatusLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-gp-lg">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-gp-2xs text-caption-sm text-fg-muted">
          <span className="size-[8px] rounded-radius-full" style={{ background: it.color }} /> {it.label}
        </span>
      ))}
    </div>
  );
}
const UPTIME_LEGEND = [
  { label: "Operational", color: C.green },
  { label: "Degraded", color: C.amber },
  { label: "Downtime", color: C.red },
  { label: "Inactive", color: "var(--color-bg-muted)" },
];

function AcmeUptimeCard() {
  const statuses = genStatuses(60, [22], [8, 41, 52]);
  return (
    <Panel id="acme-uptime" className="lg:col-span-2">
      <div className="mb-pad-3xl flex items-start justify-between">
        <p className="text-title-md font-semibold text-fg-default">acme-store.com</p>
        <Chip color="success" variant="outline" size="sm" shape="pill">Operational</Chip>
      </div>
      <div className="mb-pad-md flex items-center justify-between">
        <span className="flex items-center gap-gp-2xs text-body-sm text-fg-muted">
          <Globe className="size-icon-xs text-fg-brand" /> acme-store.com
        </span>
        <span className="text-body-sm text-fg-muted">
          8 incidents <span className="font-semibold text-fg-default">91.1% uptime</span>
        </span>
      </div>
      <StatusBars statuses={statuses} />
      <div className="mb-pad-3xl mt-pad-md flex items-center justify-between text-caption-sm text-fg-muted">
        <span>90 days ago</span>
        <span className="text-fg-info">Today</span>
      </div>
      <StatusLegend items={UPTIME_LEGEND} />
      <div className="mt-pad-3xl flex items-center justify-between border-t border-border-subtle pt-pad-3xl">
        <p className="text-body-md font-semibold text-fg-default">Incident overview (8)</p>
        <Button color="secondary" variant="outline" size="sm" iconRight={<ChevronDown />}>Show</Button>
      </div>
    </Panel>
  );
}

function SystemStatusCard() {
  const rows = [
    { name: "API Gateway", uptime: "99.68% uptime", statuses: genStatuses(48, [14], [6, 33]) },
    { name: "CDN & Assets", uptime: "100% uptime", statuses: genStatuses(48, [], []) },
  ];
  return (
    <Panel id="system-status" className="lg:col-span-2">
      <div className="mb-pad-3xl flex items-center justify-between">
        <p className="text-title-md font-semibold text-fg-default">System Status</p>
        <span className="flex items-center gap-gp-2xs text-body-sm text-fg-muted">
          <span className="size-[8px] rounded-radius-full bg-bg-success" /> All systems operational
        </span>
      </div>
      <div className="flex flex-col gap-pad-4xl">
        {rows.map((r) => (
          <div key={r.name}>
            <div className="mb-pad-md flex items-center justify-between">
              <span className="flex items-center gap-gp-2xs text-body-md font-medium text-fg-default">
                <span className="size-[8px] rounded-radius-full bg-bg-success" /> {r.name}
              </span>
              <span className="flex items-center gap-gp-md">
                <span className="text-body-sm text-fg-muted">{r.uptime}</span>
                <Chip color="success" variant="outline" size="sm" shape="pill">Operational</Chip>
              </span>
            </div>
            <StatusBars statuses={r.statuses} />
          </div>
        ))}
      </div>
      <div className="mt-pad-3xl border-t border-border-subtle pt-pad-3xl">
        <StatusLegend items={[
          { label: "Operational", color: C.green },
          { label: "Degraded", color: C.amber },
          { label: "Outage", color: C.red },
          { label: "Maintenance", color: "var(--color-bg-muted)" },
        ]} />
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   14 — Budget Breakdown (donut + lista por time)
   ════════════════════════════════════════════════════════════════════ */
const BUDGET = [
  { team: "Engineering", value: 950, share: "35.8%", color: C.blue },
  { team: "Marketing", value: 680, share: "25.6%", color: C.green },
  { team: "Sales", value: 520, share: "19.6%", color: C.amber },
  { team: "Operations", value: 310, share: "11.7%", color: C.violet },
  { team: "HR & Admin", value: 195, share: "7.3%", color: C.red },
];
const BUDGET_TOTAL = BUDGET.reduce((s, b) => s + b.value, 0);

function BudgetBreakdownCard() {
  return (
    <Panel id="budget">
      <p className="text-title-md font-semibold text-fg-default">Budget Breakdown</p>
      <p className="text-body-sm text-fg-muted">Spend distribution across teams and cost categories.</p>
      <Tabs defaultValue="team" className="mt-pad-3xl">
        <TabsList className="w-full">
          <TabsTrigger value="team" className="flex-1">By Team</TabsTrigger>
          <TabsTrigger value="category" className="flex-1">By Category</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative mx-auto mt-pad-3xl flex items-center justify-center">
        <ChartContainer config={{}} className="aspect-square h-[200px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="team" />} />
            <Pie data={BUDGET} dataKey="value" nameKey="team" innerRadius={62} outerRadius={88} paddingAngle={3} strokeWidth={0}>
              {BUDGET.map((b) => (
                <Cell key={b.team} fill={b.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-title-lg font-bold text-fg-default [font-variant-numeric:tabular-nums]">${BUDGET_TOTAL.toLocaleString("en-US")}</span>
          <span className="text-caption-sm text-fg-muted">total spend</span>
        </div>
      </div>

      <p className="mb-pad-md mt-pad-3xl text-caption-md text-fg-muted">
        <span className="float-left">TEAM</span>
        <span className="float-right">AMOUNT / SHARE</span>
      </p>
      <div className="clear-both flex flex-col">
        {BUDGET.map((b) => (
          <div key={b.team} className="flex items-center gap-gp-md border-b border-border-subtle py-pad-lg last:border-0">
            <span className="h-[16px] w-[3px] rounded-radius-full" style={{ background: b.color }} />
            <span className="flex-1 text-body-sm font-medium text-fg-default">{b.team}</span>
            <span className="text-body-sm font-semibold text-fg-default [font-variant-numeric:tabular-nums]">${b.value}</span>
            <Chip color="neutral" variant="soft" size="sm" shape="pill">{b.share}</Chip>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   15 — Crypto Portfolio (tabs + sparklines)
   ════════════════════════════════════════════════════════════════════ */
const spark = (vals: number[]) => vals.map((v, i) => ({ i, v }));
const COINS = [
  { name: "Bitcoin", price: "$98200", delta: "+7.68%", up: true, data: spark([20, 22, 21, 26, 30, 34, 40]) },
  { name: "Ethereum", price: "$3195", delta: "-6.57%", up: false, data: spark([40, 38, 36, 34, 30, 26, 22]) },
  { name: "Solana", price: "$199.1", delta: "+9.40%", up: true, data: spark([18, 20, 24, 28, 30, 36, 42]) },
];

function CryptoSpark({ data, up }: { data: { i: number; v: number }[]; up: boolean }) {
  const color = up ? C.green : C.red;
  const id = `cryptoFill-${up ? "up" : "down"}`;
  return (
    <ChartContainer config={{}} className="h-[44px] w-[110px]">
      <AreaChart data={data} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area dataKey="v" type="monotone" stroke={color} strokeWidth={2} fill={`url(#${id})`} dot={false} />
      </AreaChart>
    </ChartContainer>
  );
}

function CryptoPortfolioCard() {
  return (
    <Panel id="crypto">
      <p className="text-caption-md text-fg-muted">Crypto Portfolio</p>
      <p className="text-display-sm font-bold text-fg-default [font-variant-numeric:tabular-nums]">$38,452.80</p>
      <p className="mb-pad-3xl text-body-sm">
        <span className="font-medium text-fg-danger">-$612.40 (-1.57%)</span>{" "}
        <span className="text-fg-muted">Today</span>
      </p>

      <Tabs defaultValue="trending">
        <TabsList className="w-full">
          <TabsTrigger value="trending" className="flex-1">Trending</TabsTrigger>
          <TabsTrigger value="altcoins" className="flex-1">Altcoins</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-pad-2xl flex flex-col">
        {COINS.map((c) => (
          <div key={c.name} className="flex items-center justify-between gap-gp-md border-b border-border-subtle py-pad-3xl last:border-0">
            <div>
              <p className="text-body-md text-fg-muted">{c.name}</p>
              <p className="flex items-center gap-gp-sm">
                <span className="text-body-lg font-semibold text-fg-default [font-variant-numeric:tabular-nums]">{c.price}</span>
                <span className={cn("text-caption-sm font-medium", c.up ? "text-fg-success" : "text-fg-danger")}>{c.delta}</span>
              </p>
            </div>
            <CryptoSpark data={c.data} up={c.up} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
export function ChartShowcaseDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Charts"
        title="Compositions"
        description="Composições prontas de dashboard — combinando gráficos, tabelas, métricas e painéis — como inspiração para telas futuras."
        dependency="recharts"
      />
      <DocSeparator />

      <div className="grid gap-gp-2xl lg:grid-cols-2">
        <SaaSRevenueCard />
        <DbInstanceCard />
        <FinanceCard />
        <TotalRevenueCard />
        <UserActivityCard />
        <TotalIncomeCard />
        <TotalEarningCard />
        <AnatomyCard />
        <WeeklyOverviewCard />
        <TotalSalesCard />
        <SubscriptionBillingCard />
        <AcmeUptimeCard />
        <SystemStatusCard />
        <BudgetBreakdownCard />
        <CryptoPortfolioCard />
      </div>
    </DocLayout>
  );
}
