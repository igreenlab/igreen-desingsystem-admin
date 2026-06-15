import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  Globe,
  MoreVertical,
  Store,
  Tag,
  TrendingUp,
  Truck,
  Upload,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/shadcn/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "../../components/ui/Chart";
import { DocLayout, DocHeader, DocSeparator } from "../components";

/* ── Paleta do showcase ─────────────────────────────────────────────── */
const C = {
  green: "var(--color-chart-1)",
  teal: "var(--color-chart-2)",
  blue: "var(--color-chart-3)",
  amber: "var(--color-chart-4)",
  violet: "var(--color-chart-5)",
  red: "var(--color-fg-danger)",
};

/* Wrapper de card */
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
        "w-full rounded-radius-lg bg-bg-surface p-pad-4xl text-body-md text-fg-default shadow-sh-lg ring-1 ring-foreground/5 dark:ring-foreground/10",
        className,
      )}
    >
      {children}
    </section>
  );
}

/* Cabeçalho padrão (título + subtítulo + ação) — referência: "Total Income" */
function CardHead({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-gp-md", className)}>
      <div className="flex flex-col gap-gp-2xs">
        <p className="text-title-md font-semibold leading-tight text-fg-default">{title}</p>
        {subtitle && <p className="text-body-sm text-fg-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const moreBtn = <MoreVertical className="size-icon-sm shrink-0 text-fg-muted" />;
const brl = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

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
  { id: "product-growth", label: "Product Growth Metrics" },
  { id: "revenue-performance", label: "Revenue Performance" },
  { id: "cicd", label: "CI/CD Pipeline" },
  { id: "infra-cost", label: "Infrastructure cost" },
  { id: "email-campaign", label: "Email Campaign" },
  { id: "sales-lead", label: "Sales Lead" },
  { id: "release-timeline", label: "Release timeline" },
  { id: "vehicle", label: "Vehicle overview" },
  { id: "support-tickets", label: "Support Tickets" },
  { id: "traffic", label: "Traffic Sources" },
  { id: "user-acquisition", label: "User Acquisition" },
  { id: "pnl", label: "P&L" },
  { id: "indices", label: "Indices Alerts" },
];

/* ════════════════════════════════════════════════════════════════════
   1 — SaaS revenue metrics
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

function SaaSRevenueCard() {
  return (
    <Panel id="saas-revenue">
      <div className="mb-pad-3xl flex flex-wrap items-start justify-between gap-gp-lg">
        <div>
          <p className="text-caption-md text-fg-muted">SaaS revenue metrics</p>
          <p className="text-display-md font-bold leading-tight text-fg-default [font-variant-numeric:tabular-nums]">
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

      <ChartContainer config={revConfig} className="h-[280px] w-full">
        <LineChart data={REV_DATA} margin={{ left: 4, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} interval={1} />
          <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v) => `$${v}k`} ticks={[0, 30, 60, 90, 120, 150]} domain={[0, 150]} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
          <Line dataKey="enterprise" type="monotone" stroke="var(--color-enterprise)" strokeWidth={2} dot={false} />
          <Line dataKey="pro" type="monotone" stroke="var(--color-pro)" strokeWidth={2} dot={false} />
          <Line dataKey="starter" type="monotone" stroke="var(--color-starter)" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartContainer>

      <div className="mt-pad-3xl overflow-x-auto">
        <table className="w-full min-w-[640px] text-body-sm">
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
                <td className={cn("py-pad-lg text-right", p.churnUp ? "text-fg-success" : "text-fg-danger")}>{p.churn}</td>
                <td className="py-pad-lg text-right text-fg-success">{p.upgrades}</td>
                <td className="py-pad-lg text-right">{brl(p.ltv)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   2 — Database instance
   ════════════════════════════════════════════════════════════════════ */
const DB_DATA = Array.from({ length: 28 }, (_, i) => ({
  day: `Feb ${String(i + 1).padStart(2, "0")}`,
  fast: 4200 + Math.round(2600 * Math.abs(Math.sin(i / 3.1))),
  slow: Math.round(300 + 900 * Math.abs(Math.sin(i / 2.3 + 1))),
}));
const dbConfig = {
  fast: { label: "Normais", color: C.green },
  slow: { label: "Lentas", color: C.blue },
} satisfies ChartConfig;

function DbInstanceCard() {
  return (
    <Panel id="db-instance">
      <div className="flex flex-wrap items-start justify-between gap-gp-lg">
        <div className="flex flex-col gap-gp-2xs">
          <p className="text-title-md font-semibold leading-tight text-fg-default">prod-db-primary</p>
          <p className="text-body-sm text-fg-muted">
            Instance ID: <span className="font-medium text-fg-default">db_mX4kR9p</span>
          </p>
        </div>
        <div className="flex items-center divide-x divide-border-subtle">
          {[
            { l: "Avg Query Time", v: "42 ms" },
            { l: "Slow Queries", v: "1,243" },
            { l: "Uptime", v: "99.97%" },
          ].map((s) => (
            <div key={s.l} className="px-pad-4xl text-right first:pl-0 last:pr-0">
              <p className="text-caption-sm text-fg-muted">{s.l}</p>
              <p className="text-body-lg font-semibold text-fg-default [font-variant-numeric:tabular-nums]">{s.v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="my-pad-3xl flex items-center gap-gp-md border-t border-border-subtle pt-pad-3xl">
        <Chip color="success" variant="soft" size="sm" shape="pill">Healthy</Chip>
        <span className="text-body-sm text-fg-muted">PostgreSQL 16.2 · last analyzed Feb 28, 2026</span>
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
        <ChartContainer config={dbConfig} className="h-[260px] w-full">
          <BarChart data={DB_DATA} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
            <YAxis tickLine={false} axisLine={false} width={36} tickFormatter={(v) => (v === 0 ? "0k" : `${v / 1000}k`)} ticks={[0, 2500, 5000, 7500, 10000]} domain={[0, 10000]} />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="fast" stackId="q" fill="var(--color-fast)" />
            <Bar dataKey="slow" stackId="q" fill="var(--color-slow)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   3 — Finance + Report
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
    <Panel id="finance">
      <div className="grid gap-pad-4xl lg:grid-cols-[1fr_300px]">
        <div>
          <CardHead title="Finance" subtitle="Yearly report overview" action={moreBtn} className="mb-pad-2xl" />
          <ChartContainer config={finConfig} className="h-[280px] w-full">
            <BarChart data={FIN_DATA} margin={{ left: -16 }} barCategoryGap={20}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} ticks={[0, 20, 40, 60]} domain={[0, 60]} />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <Bar dataKey="a" stackId="f" fill="var(--color-a)" />
              <Bar dataKey="b" stackId="f" fill="var(--color-b)" />
              <Bar dataKey="c" stackId="f" fill="var(--color-c)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="flex flex-col gap-gp-lg border-border-subtle lg:border-l lg:pl-pad-4xl">
          <CardHead title="Report" subtitle="Monthly Avg. $45.578k" action={moreBtn} className="mb-pad-md" />
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
          <Button color="secondary" variant="outline" className="mt-auto w-full">View Report</Button>
        </div>
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   4 — Total Revenue + Growth
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
    <Panel id="total-revenue" className="mx-auto w-full max-w-[900px]">
      <div className="grid gap-pad-4xl lg:grid-cols-[1fr_320px]">
        <div>
          <CardHead title="Total Revenue" action={moreBtn} className="mb-pad-md" />
          <div className="mb-pad-2xl flex items-center gap-gp-lg text-caption-sm text-fg-muted">
            <span className="flex items-center gap-gp-2xs"><span className="size-[8px] rounded-radius-full bg-fg-default" />2024</span>
            <span className="flex items-center gap-gp-2xs"><span className="size-[8px] rounded-radius-full bg-bg-muted" />2023</span>
          </div>
          <ChartContainer config={trConfig} className="h-[280px] w-full">
            <BarChart data={TR_DATA} margin={{ left: -16 }} barCategoryGap={8} stackOffset="sign">
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} ticks={[-20, -10, 0, 10, 20, 30]} domain={[-20, 30]} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="y2024" stackId="rev" fill="var(--color-fg-default)" radius={[6, 6, 0, 0]} barSize={12} />
              <Bar dataKey="y2023" stackId="rev" fill="var(--color-bg-muted)" radius={[0, 0, 6, 6]} barSize={12} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="flex flex-col border-border-subtle lg:border-l lg:pl-pad-4xl">
          <Select defaultValue="report">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="report">Report</SelectItem>
              <SelectItem value="forecast">Forecast</SelectItem>
              <SelectItem value="actuals">Actuals</SelectItem>
            </SelectContent>
          </Select>

          {/* Gauge opticamente centrado (o -mb absorve o vazio inferior do arco)
              + legenda colada */}
          <div className="flex flex-1 flex-col items-center justify-center gap-gp-md">
            <div className="relative -mb-[44px] flex w-full items-center justify-center">
              <ChartContainer config={{}} className="aspect-square h-[200px]">
                <RadialBarChart data={GROWTH} startAngle={210} endAngle={-30} innerRadius={74} outerRadius={98}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
                  <RadialBar dataKey="pct" cornerRadius={8} fill={C.green} background={{ fill: "var(--color-bg-muted)" }} />
                </RadialBarChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 bottom-[44px] flex flex-col items-center justify-center">
                <span className="text-heading-xs font-bold leading-none text-fg-default">78%</span>
                <span className="text-caption-sm text-fg-muted">Growth</span>
              </div>
            </div>
            <p className="text-body-sm text-fg-muted">62% Company Growth</p>
          </div>

          <div className="flex w-full items-center justify-between gap-gp-md pt-pad-3xl">
            <div className="flex items-center gap-gp-md">
              <span className="flex size-[44px] items-center justify-center rounded-radius-base bg-bg-success-muted">
                <DollarSign className="size-icon-md text-fg-success" />
              </span>
              <div>
                <p className="text-caption-sm text-fg-muted">2024</p>
                <p className="text-body-lg font-semibold text-fg-default">$32.5K</p>
              </div>
            </div>
            <div className="flex items-center gap-gp-md">
              <span className="flex size-[44px] items-center justify-center rounded-radius-base bg-bg-info-muted">
                <Wallet className="size-icon-md text-fg-info" />
              </span>
              <div>
                <p className="text-caption-sm text-fg-muted">2023</p>
                <p className="text-body-lg font-semibold text-fg-default">$41.2K</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   5 — User Activity
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
    <Panel id="user-activity">
      <CardHead title="User Activity" subtitle="Track your active users and churn over the month" action={moreBtn} className="mb-pad-2xl" />
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
          <p className="flex items-center gap-gp-sm text-heading-xs font-bold text-fg-default [font-variant-numeric:tabular-nums]">
            <span className="size-[12px] rounded-[3px]" style={{ background: C.green }} />24,783
          </p>
          <p className="text-body-sm text-fg-muted">Active users</p>
        </div>
        <div>
          <p className="flex items-center gap-gp-sm text-heading-xs font-bold text-fg-default [font-variant-numeric:tabular-nums]">
            <span className="size-[12px] rounded-[3px]" style={{ background: C.blue }} />1,397
          </p>
          <p className="text-body-sm text-fg-muted">Churned</p>
        </div>
      </div>
      <ChartContainer config={uaConfig} className="h-[280px] w-full">
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
   6 — Total Income + Report
   ════════════════════════════════════════════════════════════════════ */
const INCOME_DATA = [
  { d: "MO", v: 3 }, { d: "TU", v: 3 }, { d: "WE", v: 5 }, { d: "TH", v: 5 },
  { d: "FR", v: 4 }, { d: "SA", v: 4 }, { d: "SU", v: 6 },
];
const incomeConfig = { v: { label: "Income", color: C.green } } satisfies ChartConfig;

function TotalIncomeCard() {
  return (
    <Panel id="total-income">
      <div className="grid gap-pad-4xl lg:grid-cols-[1fr_300px]">
        <div>
          <CardHead title="Total Income" subtitle="Weekly report overview" action={moreBtn} className="mb-pad-2xl" />
          <ChartContainer config={incomeConfig} className="h-[260px] w-full">
            <AreaChart data={INCOME_DATA} margin={{ left: 4, right: 8 }}>
              <defs>
                <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-v)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--color-v)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="d" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={40} tickFormatter={(v) => `$${v}K`} ticks={[1, 2, 3, 4, 5, 6]} domain={[1, 6]} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Area dataKey="v" type="linear" stroke="var(--color-v)" strokeWidth={2} fill="url(#fillIncome)" />
            </AreaChart>
          </ChartContainer>
        </div>
        <div className="flex flex-col justify-center gap-gp-lg border-border-subtle lg:border-l lg:pl-pad-4xl">
          <CardHead title="Report" subtitle="Weekly activity" className="mb-pad-md" />
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
   7 — Total earning
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
    <Panel id="total-earning" className="max-w-[460px]">
      <CardHead title="Total earning" action={moreBtn} />
      <p className="mt-pad-md flex items-center gap-gp-sm">
        <span className="text-heading-sm font-bold text-fg-default [font-variant-numeric:tabular-nums]">87%</span>
        <span className="flex items-center gap-gp-2xs text-body-sm font-medium text-fg-success">
          <TrendingUp className="size-icon-xs" /> +38%
        </span>
      </p>
      <ChartContainer config={earnConfig} className="mt-pad-3xl h-[180px] w-full">
        <BarChart data={EARN_DATA} margin={{ left: 0, right: 0 }} barCategoryGap={16}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <Bar dataKey="base" stackId="e" fill="transparent" />
          <Bar dataKey="low" stackId="e" fill="var(--color-low)" barSize={16} />
          <Bar dataKey="high" stackId="e" fill="var(--color-high)" radius={[8, 8, 0, 0]} barSize={16} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        </BarChart>
      </ChartContainer>
      <div className="mt-pad-3xl flex flex-col gap-gp-lg">
        {[
          { icon: DollarSign, t: "Total revenue", s: "Successful payments", v: "+$250" },
          { icon: Store, t: "Total sales", s: "Refund", v: "+$80" },
        ].map((r) => (
          <div key={r.t} className="flex items-center gap-gp-md">
            <span className="flex size-[40px] items-center justify-center rounded-radius-base bg-bg-muted">
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
   8 — Anatomy detected
   ════════════════════════════════════════════════════════════════════ */
const ANATOMY = [
  { i: 0, v: 40 }, { i: 1, v: 62 }, { i: 2, v: 52 }, { i: 3, v: 96 },
  { i: 4, v: 44 }, { i: 5, v: 38 }, { i: 6, v: 70 }, { i: 7, v: 50 },
];

function AnatomyCard() {
  return (
    <Panel id="anatomy" className="max-w-[420px]">
      <div className="flex items-start justify-between gap-gp-md">
        <div className="flex flex-col gap-gp-2xs">
          <p className="text-title-lg font-bold text-fg-default">Anatomy detected</p>
          <p className="text-body-sm text-fg-muted">Your product reach increasing beyond our predictions.</p>
        </div>
        <span className="flex size-[40px] shrink-0 items-center justify-center rounded-radius-base bg-bg-muted">
          <AlertTriangle className="size-icon-sm text-fg-default" />
        </span>
      </div>
      <ChartContainer config={{}} className="mt-pad-3xl h-[150px] w-full">
        <BarChart data={ANATOMY} margin={{ left: 0, right: 0 }} barCategoryGap={10}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <Bar dataKey="v" radius={[4, 4, 0, 0]}>
            {ANATOMY.map((d) => (
              <Cell key={d.i} fill={d.i === 3 ? "var(--color-fg-default)" : "var(--color-border-default)"} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
      <div className="mt-pad-3xl flex items-end justify-between">
        <div>
          <p className="text-heading-sm font-bold text-fg-default [font-variant-numeric:tabular-nums]">96.5%</p>
          <p className="text-body-sm text-fg-muted">Prediction 78%</p>
        </div>
        <Button color="secondary" variant="outline" size="sm" shape="pill">See details</Button>
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   9 — Weekly overview
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
    <Panel id="weekly-overview" className="max-w-[400px]">
      <CardHead title="Weekly overview" action={moreBtn} className="mb-pad-2xl" />
      <ChartContainer config={weekConfig} className="h-[200px] w-full">
        <ComposedChart data={WEEK_DATA} margin={{ left: 4, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="d" tickLine={false} axisLine={false} tickMargin={8} hide />
          <YAxis tickLine={false} axisLine={false} ticks={[0, 30, 60, 90]} domain={[0, 90]} interval={0} tickFormatter={(v) => `${v}k`} width={40} />
          <Bar dataKey="bar" radius={6} barSize={22}>
            {WEEK_DATA.map((d) => (
              <Cell key={d.d} fill={d.d === "Th" ? "var(--color-line)" : "color-mix(in oklch, var(--color-chart-1) 16%, transparent)"} />
            ))}
          </Bar>
          <Line dataKey="line" type="monotone" stroke="var(--color-line)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-line)" }} />
        </ComposedChart>
      </ChartContainer>
      <div className="mt-pad-3xl flex items-center gap-gp-lg">
        <span className="text-heading-xs font-bold text-fg-default">80%</span>
        <p className="flex-1 text-body-sm text-fg-muted">Your sales performance is 60% Better compare to Last month</p>
      </div>
      <Button color="secondary" variant="outline" className="mt-pad-2xl w-full">Details</Button>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   10 — Total sales
   ════════════════════════════════════════════════════════════════════ */
const SALES_DATA = [
  { t: "10:00", bar: 40, line: 42 }, { t: "11:00", bar: 40, line: 50 },
  { t: "12:00", bar: 40, line: 50 }, { t: "13:00", bar: 40, line: 44 },
  { t: "14:00", bar: 40, line: 44 }, { t: "15:00", bar: 40, line: 38 },
  { t: "16:00", bar: 40, line: 38 }, { t: "17:00", bar: 40, line: 50 },
  { t: "18:00", bar: 40, line: 56 }, { t: "19:00", bar: 40, line: 64 },
  { t: "20:00", bar: 40, line: 64 },
];
const salesConfig = { line: { label: "Vendas", color: C.green } } satisfies ChartConfig;

function TotalSalesCard() {
  return (
    <Panel id="total-sales" className="max-w-[400px]">
      <div className="mb-pad-md flex items-center justify-between">
        <span className="flex items-center gap-gp-sm">
          <span className="flex size-[28px] items-center justify-center rounded-radius-base bg-bg-success-muted">
            <TrendingUp className="size-icon-xs text-fg-success" />
          </span>
          <span className="text-title-md font-semibold text-fg-default">Total sales</span>
        </span>
        <Button color="secondary" variant="outline" size="sm" shape="pill">Details</Button>
      </div>
      <p className="flex items-center gap-gp-sm">
        <span className="text-heading-sm font-bold text-fg-default [font-variant-numeric:tabular-nums]">$2,150.00</span>
        <Chip color="neutral" variant="soft" size="sm" shape="pill">+5%</Chip>
      </p>
      <div className="my-pad-3xl flex flex-col gap-gp-md border-y border-border-subtle py-pad-3xl">
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
      <ChartContainer config={salesConfig} className="h-[140px] w-full">
        <ComposedChart data={SALES_DATA} margin={{ left: 0, right: 0, top: 8 }}>
          <Bar dataKey="bar" barSize={16} fill="color-mix(in oklch, var(--color-chart-1) 16%, transparent)" radius={4} />
          <Line dataKey="line" type="monotone" stroke="var(--color-line)" strokeWidth={2} dot={false} />
          <XAxis dataKey="t" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} fontSize={10} />
        </ComposedChart>
      </ChartContainer>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   11 — Subscription Billing
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
    <Panel id="subscription">
      <CardHead title="Subscription Billing" subtitle="Monitor your plans, revenue, and billing activity." action={moreBtn} />

      <Tabs defaultValue="summary" className="mt-pad-3xl">
        <TabsList>
          <TabsTrigger value="summary">Billing Summary</TabsTrigger>
          <TabsTrigger value="guide">Plan Guide</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-pad-3xl rounded-radius-base border border-border-subtle p-pad-3xl">
        <p className="text-caption-md text-fg-muted">Monthly Recurring Revenue</p>
        <p className="text-heading-sm font-bold text-fg-default [font-variant-numeric:tabular-nums]">$48,320</p>
        <div className="mt-pad-2xl flex h-[8px] gap-[3px] overflow-hidden rounded-radius-full">
          {PLAN_SPLIT.map((p) => (
            <span key={p.label} style={{ width: `${p.pct}%`, background: p.color }} />
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
        <div className="mt-pad-md flex items-center justify-between gap-gp-md rounded-radius-base bg-bg-muted px-pad-3xl py-pad-2xl">
          <span className="text-body-sm text-fg-muted">3 invoices pending payment – review before Mar 15.</span>
          <span className="flex shrink-0 items-center gap-gp-2xs text-body-sm font-medium text-fg-info">
            View invoices <ExternalLink className="size-icon-xs" />
          </span>
        </div>
      </div>

      <p className="mb-pad-md mt-pad-4xl text-title-sm font-semibold text-fg-default">Recent Invoices</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-body-sm">
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
                <td className={cn("py-pad-lg text-right font-medium [font-variant-numeric:tabular-nums]", inv.up ? "text-fg-success" : "text-fg-danger")}>{inv.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   12 / 13 — Uptime status
   ════════════════════════════════════════════════════════════════════ */
type Status = "ok" | "degraded" | "down" | "inactive";
const STATUS_COLOR: Record<Status, string> = {
  ok: C.green,
  degraded: C.amber,
  down: C.red,
  inactive: "var(--color-bg-muted)",
};
function genStatuses(n: number, downAt: number[], degradedAt: number[]): Status[] {
  return Array.from({ length: n }, (_, i) =>
    downAt.includes(i) ? "down" : degradedAt.includes(i) ? "degraded" : "ok",
  );
}
function StatusBars({ statuses }: { statuses: Status[] }) {
  return (
    <div className="flex h-[40px] items-stretch gap-[3px]">
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
  const statuses = genStatuses(72, [26], [9, 48, 61]);
  return (
    <Panel id="acme-uptime">
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
    { name: "API Gateway", uptime: "99.68% uptime", statuses: genStatuses(60, [18], [7, 41]) },
    { name: "CDN & Assets", uptime: "100% uptime", statuses: genStatuses(60, [], []) },
  ];
  return (
    <Panel id="system-status">
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
   14 — Budget Breakdown
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
    <Panel id="budget" className="max-w-[450px]">
      <CardHead title="Budget Breakdown" subtitle="Spend distribution across teams and cost categories." />
      <Tabs defaultValue="team" className="mt-pad-3xl">
        <TabsList className="w-full">
          <TabsTrigger value="team" className="flex-1">By Team</TabsTrigger>
          <TabsTrigger value="category" className="flex-1">By Category</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative mx-auto mt-pad-3xl flex items-center justify-center">
        <ChartContainer config={{}} className="aspect-square h-[210px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="team" />} />
            <Pie data={BUDGET} dataKey="value" nameKey="team" innerRadius={64} outerRadius={92} paddingAngle={3} strokeWidth={0}>
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

      <div className="mb-pad-md mt-pad-3xl flex items-center justify-between text-caption-md text-fg-muted">
        <span>TEAM</span>
        <span>AMOUNT / SHARE</span>
      </div>
      <div className="flex flex-col">
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
   15 — Crypto Portfolio
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
    <ChartContainer config={{}} className="h-[48px] w-[140px]">
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
    <Panel id="crypto" className="max-w-[512px]">
      <p className="text-caption-md text-fg-muted">Crypto Portfolio</p>
      <p className="text-heading-sm font-bold text-fg-default [font-variant-numeric:tabular-nums]">$38,452.80</p>
      <p className="text-body-sm">
        <span className="font-medium text-fg-danger">-$612.40 (-1.57%)</span>{" "}
        <span className="text-fg-muted">Today</span>
      </p>
      <Tabs defaultValue="trending" className="mt-pad-3xl">
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

/* ════════════════════════════════════════════════════════════════════
   16 — Vehicle overview (barra segmentada neutra + lista)
   ════════════════════════════════════════════════════════════════════ */
const VEHICLE = [
  { label: "On the way", icon: Truck, time: "2hr 10min", pct: 33.3, shade: "var(--color-bg-emphasis)" },
  { label: "Unloading", icon: Download, time: "3hr 15min", pct: 23.5, shade: "var(--color-bg-muted-hover)" },
  { label: "Loading", icon: Upload, time: "1hr 24min", pct: 23.1, shade: "var(--color-bg-accent)" },
  { label: "Waiting", icon: Clock, time: "5hr 19min", pct: 20.1, shade: "var(--color-fg-muted)" },
];

function VehicleOverviewCard() {
  return (
    <Panel id="vehicle" className="max-w-[520px]">
      <CardHead title="Vehicle overview" action={moreBtn} className="mb-pad-3xl" />
      <div className="mb-pad-md flex gap-gp-2xs text-caption-sm text-fg-muted">
        {VEHICLE.map((v) => (
          <div key={v.label} className="flex flex-col gap-gp-2xs" style={{ width: `${v.pct}%` }}>
            <span className="truncate">{v.label}</span>
            <span className="h-[10px] w-[2px] bg-border-default" />
          </div>
        ))}
      </div>
      <div className="flex h-[52px] gap-gp-2xs overflow-hidden rounded-radius-base">
        {VEHICLE.map((v) => (
          <div
            key={v.label}
            className="flex items-center px-pad-2xl text-body-md font-semibold text-fg-default"
            style={{ width: `${v.pct}%`, background: v.shade }}
          >
            {v.pct}%
          </div>
        ))}
      </div>
      <div className="mt-pad-2xl flex flex-col">
        {VEHICLE.map((v) => (
          <div key={v.label} className="flex items-center gap-gp-md border-b border-border-subtle py-pad-lg last:border-0">
            <v.icon className="size-icon-sm text-fg-muted" />
            <span className="flex-1 text-body-md text-fg-default">{v.label}</span>
            <span className="text-body-md font-semibold text-fg-default [font-variant-numeric:tabular-nums]">{v.time}</span>
            <span className="w-[44px] text-right text-body-sm text-fg-muted [font-variant-numeric:tabular-nums]">{v.pct}%</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   17 — Product Growth Metrics (KPIs + multi-line + date range)
   ════════════════════════════════════════════════════════════════════ */
const PG_DATA = Array.from({ length: 30 }, (_, i) => {
  const t = i / 29;
  return {
    d: `02-${String(i + 1).padStart(2, "0")}`,
    mrr: Math.round(8000 + t * 9000),
    active: Math.round(1500 + t * 4500),
    churn: Math.round(120 - t * 80),
  };
});
const pgConfig = {
  active: { label: "Active Users", color: C.green },
  churn: { label: "Churned Users", color: C.amber },
  mrr: { label: "MRR ($)", color: C.blue },
} satisfies ChartConfig;

function ProductGrowthCard() {
  const kpis = [
    { label: "Monthly Revenue", value: "$17,200", delta: "2.4%", up: true, color: C.blue },
    { label: "Active Users", value: "6,200", delta: "6.9%", up: true, color: C.green },
    { label: "Churned Users", value: "33", delta: "10.8%", up: false, color: C.amber },
  ];
  return (
    <Panel id="product-growth">
      <div className="flex flex-wrap items-start justify-between gap-gp-lg">
        <CardHead title="Product Growth Metrics" subtitle="Track MRR, active users, and churn across a custom date window." />
        <Chip color="neutral" variant="outline" size="sm">
          <CalendarDays className="size-icon-xs" /> 31 Dec – 28 Feb, 2024
        </Chip>
      </div>
      <div className="my-pad-3xl grid gap-gp-lg sm:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="flex items-center gap-gp-2xs text-caption-sm text-fg-muted">
              <span className="size-[8px] rounded-radius-full" style={{ background: k.color }} /> {k.label}
            </p>
            <p className="mt-pad-xs flex items-end justify-between gap-gp-md">
              <span className="text-heading-xs font-bold text-fg-default [font-variant-numeric:tabular-nums]">{k.value}</span>
              <span className={cn("text-body-sm font-medium", k.up ? "text-fg-success" : "text-fg-danger")}>
                {k.up ? "↑" : "↓"} {k.delta}
              </span>
            </p>
          </div>
        ))}
      </div>
      <ChartContainer config={pgConfig} className="h-[300px] w-full">
        <LineChart data={PG_DATA} margin={{ left: 4, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="d" tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} />
          <YAxis tickLine={false} axisLine={false} width={44} ticks={[0, 4500, 9000, 13500, 18000]} domain={[0, 18000]} interval={0} tickFormatter={(v) => (v === 0 ? "0" : `${v / 1000}k`)} />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Line dataKey="mrr" type="monotone" stroke="var(--color-mrr)" strokeWidth={2} dot={false} />
          <Line dataKey="active" type="monotone" stroke="var(--color-active)" strokeWidth={2} dot={false} />
          <Line dataKey="churn" type="monotone" stroke="var(--color-churn)" strokeWidth={2} dot={false} />
          <ChartLegend content={<ChartLegendContent />} />
        </LineChart>
      </ChartContainer>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   18 — Revenue Performance (multi-line + summary grid)
   ════════════════════════════════════════════════════════════════════ */
const RP_DATA = Array.from({ length: 7 }, (_, i) => ({
  d: `Sep ${20 + i}`,
  product: Math.round(125 + 12 * Math.sin(i / 1.5) + i * 2),
  service: Math.round(82 + 8 * Math.sin(i / 1.8 + 1) + i * 3),
}));
const rpConfig = {
  product: { label: "Product Sales", color: C.red },
  service: { label: "Service Revenue", color: C.amber },
} satisfies ChartConfig;

function RevenuePerformanceCard() {
  const summary = [
    { l: "Total Revenue", v: "$285,420.75" },
    { l: "Operating Costs", v: "$142,680.25" },
    { l: "Net Income", v: "$142,740.50" },
    { l: "Growth Rate", v: "+12.5%", trend: true },
    { l: "Profit Margin", v: "+50.0%", trend: true },
    { l: "ROI", v: "+18.9%", trend: true },
  ];
  return (
    <Panel id="revenue-performance">
      <p className="text-title-md font-semibold text-fg-default">Revenue Performance</p>
      <p className="text-heading-sm font-bold leading-tight text-fg-default [font-variant-numeric:tabular-nums]">$285,420.75</p>
      <p className="mb-pad-3xl text-body-sm">
        <span className="font-medium text-fg-success">+$12,840.50 (4.7%)</span> <span className="text-fg-muted">Past 30 days</span>
      </p>
      <Tabs defaultValue="7d" className="mb-pad-3xl">
        <TabsList>
          <TabsTrigger value="7d">Last 7d</TabsTrigger>
          <TabsTrigger value="30d">Last 30d</TabsTrigger>
          <TabsTrigger value="max">Max</TabsTrigger>
        </TabsList>
      </Tabs>
      <ChartContainer config={rpConfig} className="h-[260px] w-full">
        <LineChart data={RP_DATA} margin={{ left: 4, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="d" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={44} ticks={[0, 40, 80, 120, 160]} domain={[0, 160]} interval={0} tickFormatter={(v) => `$${v}k`} />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Line dataKey="product" type="monotone" stroke="var(--color-product)" strokeWidth={2} dot={false} />
          <Line dataKey="service" type="monotone" stroke="var(--color-service)" strokeWidth={2} dot={false} />
          <ChartLegend content={<ChartLegendContent />} />
        </LineChart>
      </ChartContainer>
      <p className="mb-pad-md mt-pad-3xl text-title-sm font-semibold text-fg-default">Revenue Summary</p>
      <div className="grid gap-gp-lg sm:grid-cols-3">
        {summary.map((s) => (
          <div key={s.l} className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-caption-sm text-fg-muted">{s.l}</p>
            <p className="mt-pad-2xs flex items-center gap-gp-sm text-body-lg font-semibold text-fg-default [font-variant-numeric:tabular-nums]">
              {s.v}
              {s.trend && (
                <span className="flex size-[24px] items-center justify-center rounded-radius-full bg-bg-success-muted">
                  <TrendingUp className="size-icon-xs text-fg-success" />
                </span>
              )}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   19 — CI/CD Pipeline Performance (barras + tooltip)
   ════════════════════════════════════════════════════════════════════ */
const CICD_DATA = [
  { m: "Jan", runs: 310 }, { m: "Feb", runs: 280 }, { m: "Mar", runs: 395 },
  { m: "Apr", runs: 335 }, { m: "May", runs: 410 }, { m: "Jun", runs: 350 },
  { m: "Jul", runs: 445 }, { m: "Aug", runs: 400 }, { m: "Sep", runs: 355 },
  { m: "Oct", runs: 470 }, { m: "Nov", runs: 510 }, { m: "Dec", runs: 490 },
];
const cicdConfig = { runs: { label: "Pipeline runs", color: C.green } } satisfies ChartConfig;

function CicdCard() {
  return (
    <Panel id="cicd">
      <CardHead title="CI/CD Pipeline Performance" subtitle="Monthly Build & Deployment Runs" action={moreBtn} className="mb-pad-3xl border-b border-border-subtle pb-pad-3xl" />
      <ChartContainer config={cicdConfig} className="h-[300px] w-full">
        <BarChart data={CICD_DATA} margin={{ left: 4, right: 4, top: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} width={36} ticks={[0, 150, 300, 450, 600]} domain={[0, 600]} interval={0} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="runs" fill="var(--color-runs)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   20 — Support Tickets (stacked bars)
   ════════════════════════════════════════════════════════════════════ */
const TICKETS = Array.from({ length: 10 }, (_, i) => {
  const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"][i];
  const base = 400 + Math.round(500 * Math.abs(Math.sin(i / 1.7)));
  return { m, resolved: base, pending: Math.round(base * 0.5), escalated: Math.round(base * 0.12) };
});
const ticketsConfig = {
  resolved: { label: "Resolved", color: C.green },
  pending: { label: "Pending", color: C.violet },
  escalated: { label: "Escalated", color: C.blue },
} satisfies ChartConfig;

function SupportTicketsCard() {
  return (
    <Panel id="support-tickets" className="max-w-[440px]">
      <CardHead title="Support Tickets" subtitle="Monthly Ticket Resolution" action={moreBtn} className="mb-pad-3xl" />
      <ChartContainer config={ticketsConfig} className="h-[240px] w-full">
        <BarChart data={TICKETS} margin={{ left: -16, right: 4 }}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} hide />
          <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
          <Bar dataKey="resolved" stackId="t" fill="var(--color-resolved)" />
          <Bar dataKey="pending" stackId="t" fill="var(--color-pending)" />
          <Bar dataKey="escalated" stackId="t" fill="var(--color-escalated)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   21 — Traffic Sources (barras horizontais)
   ════════════════════════════════════════════════════════════════════ */
const TRAFFIC = [
  { label: "Organic", value: 18500 },
  { label: "Direct", value: 12400 },
  { label: "Social", value: 9800 },
  { label: "Referral", value: 7200 },
  { label: "Paid", value: 5300 },
  { label: "Email", value: 3100 },
];
const TRAFFIC_MAX = Math.max(...TRAFFIC.map((t) => t.value));

function TrafficSourcesCard() {
  return (
    <Panel id="traffic" className="max-w-[440px]">
      <div className="mb-pad-3xl flex items-center justify-between">
        <p className="text-title-md font-semibold text-fg-default">Traffic Sources</p>
        <Tabs defaultValue="week">
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex flex-col gap-gp-md">
        {TRAFFIC.map((t) => (
          <div key={t.label} className="flex items-center gap-gp-md">
            <div
              className="flex h-[36px] items-center rounded-radius-base px-pad-2xl text-body-sm font-medium text-fg-on-brand"
              style={{ width: `${(t.value / TRAFFIC_MAX) * 100}%`, background: C.violet, minWidth: 72 }}
            >
              {t.label}
            </div>
            <span className="ml-auto text-body-sm font-semibold text-fg-default [font-variant-numeric:tabular-nums]">
              {t.value.toLocaleString("en-US").replace(",", " ")}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   22 — Infrastructure cost by service (KPIs + barras)
   ════════════════════════════════════════════════════════════════════ */
const INFRA = Array.from({ length: 28 }, (_, i) => ({
  d: `Feb ${String(i + 1).padStart(2, "0")}`,
  cost: 28000 + Math.round(60000 * Math.abs(Math.sin(i / 2.2 + 0.6))),
}));
const infraConfig = { cost: { label: "Cost", color: C.green } } satisfies ChartConfig;

function InfraCostCard() {
  const kpis = [
    { l: "Compute", v: "$0.9M", active: true },
    { l: "Storage", v: "$0.4M" },
    { l: "Network", v: "$0.3M" },
  ];
  return (
    <Panel id="infra-cost">
      <CardHead title="Infrastructure cost by service" subtitle="Monthly cloud spending breakdown across service types" />
      <div className="my-pad-3xl grid gap-gp-lg sm:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.l} className={cn("rounded-radius-base border p-pad-3xl", k.active ? "border-border-default" : "border-border-subtle")}>
            <p className="text-caption-sm text-fg-muted">{k.l}</p>
            <p className="text-heading-xs font-bold text-fg-default [font-variant-numeric:tabular-nums]">{k.v}</p>
          </div>
        ))}
      </div>
      <ChartContainer config={infraConfig} className="h-[280px] w-full">
        <BarChart data={INFRA} margin={{ left: 4, right: 4 }}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="d" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} width={48} ticks={[0, 25000, 50000, 75000, 100000]} domain={[0, 100000]} interval={0} tickFormatter={(v) => `$${v / 1000}K`} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="cost" fill="var(--color-cost)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   23 — User Acquisition by Channel (tabs + stacked bars + lista)
   ════════════════════════════════════════════════════════════════════ */
const ACQ = Array.from({ length: 10 }, (_, i) => {
  const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"][i];
  const base = 700 + Math.round(900 * Math.abs(Math.sin(i / 1.9 + 0.4)));
  return { m, novos: base, returning: Math.round(base * 0.55), churned: Math.round(base * 0.18) };
});
const acqConfig = {
  novos: { label: "New Users", color: C.amber },
  returning: { label: "Returning", color: C.violet },
  churned: { label: "Churned", color: C.red },
} satisfies ChartConfig;

function UserAcquisitionCard() {
  const totals = [
    { label: "New Users", value: "12,390", color: C.amber },
    { label: "Returning", value: "6,450", color: C.violet },
    { label: "Churned", value: "1,390", color: C.red },
  ];
  return (
    <Panel id="user-acquisition" className="max-w-[440px]">
      <CardHead title="User Acquisition by Channel" action={moreBtn} className="mb-pad-2xl" />
      <Tabs defaultValue="organic" className="mb-pad-2xl">
        <TabsList className="w-full">
          <TabsTrigger value="organic" className="flex-1">Organic</TabsTrigger>
          <TabsTrigger value="paid" className="flex-1">Paid</TabsTrigger>
          <TabsTrigger value="referral" className="flex-1">Referral</TabsTrigger>
        </TabsList>
      </Tabs>
      <ChartContainer config={acqConfig} className="h-[220px] w-full">
        <BarChart data={ACQ} margin={{ left: -16, right: 4 }}>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} hide />
          <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
          <Bar dataKey="novos" stackId="a" fill="var(--color-novos)" />
          <Bar dataKey="returning" stackId="a" fill="var(--color-returning)" />
          <Bar dataKey="churned" stackId="a" fill="var(--color-churned)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
      <div className="mt-pad-2xl flex flex-col">
        {totals.map((t) => (
          <div key={t.label} className="flex items-center gap-gp-md border-b border-border-subtle py-pad-lg last:border-0">
            <span className="h-[3px] w-[16px] rounded-radius-full" style={{ background: t.color }} />
            <span className="flex-1 text-body-md text-fg-default">{t.label}</span>
            <span className="text-body-md font-semibold text-fg-default [font-variant-numeric:tabular-nums]">{t.value}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   24 — Email Campaign (tabs + area + linha)
   ════════════════════════════════════════════════════════════════════ */
const EMAIL = Array.from({ length: 12 }, (_, i) => {
  const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i];
  return { m, delivered: Math.round(3000 + i * 650 + 800 * Math.sin(i / 1.5)), bounced: Math.round(120 + i * 8) };
});
const emailConfig = {
  delivered: { label: "Delivered", color: C.green },
  bounced: { label: "Bounced", color: C.blue },
} satisfies ChartConfig;

function EmailCampaignCard() {
  return (
    <Panel id="email-campaign">
      <CardHead title="Email Campaign" subtitle="Campaign performance metrics" action={moreBtn} className="mb-pad-3xl" />
      <Tabs defaultValue="delivery" className="mb-pad-3xl border-b border-border-subtle">
        <TabsList>
          <TabsTrigger value="delivery">Delivery stats</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="mb-pad-2xl flex flex-wrap items-center justify-between gap-gp-lg">
        <div className="flex items-center gap-pad-4xl">
          <div className="border-l-2 pl-pad-md" style={{ borderColor: C.green }}>
            <p className="text-heading-xs font-bold text-fg-default [font-variant-numeric:tabular-nums]">79,600</p>
            <p className="text-body-sm text-fg-muted">Emails delivered</p>
          </div>
          <div className="border-l-2 pl-pad-md" style={{ borderColor: C.blue }}>
            <p className="text-heading-xs font-bold text-fg-default [font-variant-numeric:tabular-nums]">1,965</p>
            <p className="text-body-sm text-fg-muted">Bounced</p>
          </div>
        </div>
        <Chip color="success" variant="soft" size="sm" shape="pill">Delivery rate · 97.6%</Chip>
      </div>
      <ChartContainer config={emailConfig} className="h-[260px] w-full">
        <ComposedChart data={EMAIL} margin={{ left: -16, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="fillEmail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-delivered)" stopOpacity={0.6} />
              <stop offset="95%" stopColor="var(--color-delivered)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} hide />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Area dataKey="delivered" type="natural" stroke="var(--color-delivered)" strokeWidth={2} fill="url(#fillEmail)" />
          <Line dataKey="bounced" type="natural" stroke="var(--color-bounced)" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ChartContainer>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   25 — Sales Lead (KPIs + stacked area)
   ════════════════════════════════════════════════════════════════════ */
const LEADS = Array.from({ length: 12 }, (_, i) => {
  const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i];
  return {
    m,
    success: Math.round(300 + i * 90 + 220 * Math.sin(i / 1.4)),
    failed: Math.round(60 + (i > 6 ? (i - 6) * 60 : 0)),
  };
});
const leadsConfig = {
  success: { label: "Successful", color: C.green },
  failed: { label: "Failed", color: C.blue },
} satisfies ChartConfig;

function SalesLeadCard() {
  const kpis = [
    { l: "Successful Sales", v: "6276", color: C.green },
    { l: "Failed Sales", v: "1080", color: C.blue },
    { l: "Total", v: "7356", color: C.amber },
  ];
  return (
    <Panel id="sales-lead">
      <CardHead title="Sales Lead" subtitle="Sales leads performance chart" action={moreBtn} className="mb-pad-3xl" />
      <div className="mb-pad-3xl grid gap-gp-lg sm:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.l} className="border-l-2 pl-pad-md" style={{ borderColor: k.color }}>
            <p className="text-heading-xs font-bold text-fg-default [font-variant-numeric:tabular-nums]">{k.v}</p>
            <p className="text-body-sm text-fg-muted">{k.l}</p>
          </div>
        ))}
      </div>
      <ChartContainer config={leadsConfig} className="h-[280px] w-full">
        <AreaChart data={LEADS} margin={{ left: -16, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="fillSuccess" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.6} />
              <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="fillFailed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-failed)" stopOpacity={0.6} />
              <stop offset="95%" stopColor="var(--color-failed)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} hide />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Area dataKey="failed" type="natural" stackId="l" stroke="var(--color-failed)" strokeWidth={2} fill="url(#fillFailed)" />
          <Area dataKey="success" type="natural" stackId="l" stroke="var(--color-success)" strokeWidth={2} fill="url(#fillSuccess)" />
        </AreaChart>
      </ChartContainer>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   26 — P&L (area mini + holdings)
   ════════════════════════════════════════════════════════════════════ */
const PL_DATA = [
  { m: "Feb", v: 38 }, { m: "Apr", v: 34 }, { m: "Jun", v: 46 },
  { m: "Aug", v: 40 }, { m: "Oct", v: 47 }, { m: "Dec", v: 52 },
];
const plConfig = { v: { label: "P&L", color: C.green } } satisfies ChartConfig;
const HOLDINGS = [
  { name: "Alience", shares: 130, delta: "-37.5%", up: false, value: "$41000" },
  { name: "Foogle", shares: 80, delta: "+25.4%", up: true, value: "$32000" },
  { name: "Mike", shares: 15, delta: "+130.4%", up: true, value: "$35000" },
];

function PnlCard() {
  return (
    <Panel id="pnl" className="max-w-[440px]">
      <p className="text-caption-md text-fg-muted">P&amp;L</p>
      <p className="mb-pad-md text-heading-sm font-bold text-fg-default [font-variant-numeric:tabular-nums]">$50,232</p>
      <ChartContainer config={plConfig} className="h-[180px] w-full">
        <AreaChart data={PL_DATA} margin={{ left: 0, right: 0, top: 4 }}>
          <defs>
            <linearGradient id="fillPnl" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-v)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-v)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
          <Area dataKey="v" type="monotone" stroke="var(--color-v)" strokeWidth={2} fill="url(#fillPnl)" />
        </AreaChart>
      </ChartContainer>
      <Tabs defaultValue="stocks" className="mb-pad-2xs mt-pad-2xl">
        <TabsList>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="funds">Mutual Funds</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="flex flex-col">
        {HOLDINGS.map((h) => (
          <div key={h.name} className="flex items-center justify-between gap-gp-md border-b border-border-subtle py-pad-lg last:border-0">
            <div>
              <p className="text-body-md font-semibold text-fg-default">{h.name}</p>
              <p className="text-caption-sm text-fg-muted">{h.shares} shares</p>
            </div>
            <div className="text-right">
              <p className={cn("text-body-sm font-medium", h.up ? "text-fg-success" : "text-fg-danger")}>{h.delta}</p>
              <p className="text-body-md font-semibold text-fg-default [font-variant-numeric:tabular-nums]">{h.value}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   27 — Indices Alerts (tabs + area + artigos)
   ════════════════════════════════════════════════════════════════════ */
const INDICES = [
  { m: "Jan", v: 30 }, { m: "Feb", v: 42 }, { m: "Mar", v: 52 },
  { m: "Apr", v: 64 }, { m: "May", v: 58 }, { m: "Jun", v: 60 },
];
const indicesConfig = { v: { label: "Nifty 50", color: C.green } } satisfies ChartConfig;
const ARTICLES = [
  { t: "FII selling in Nifty 50, should you be worried?", d: "Foreign Institutional Investors (FII) have been selling off their holdings in the Nifty 50 index, which has raised concerns among investors." },
  { t: "Nifty 50 hits new high, what does it mean for investors?", d: "The Nifty 50 index has recently hit a new high, signaling strong market performance, driven by positive corporate results." },
];

function IndicesAlertsCard() {
  return (
    <Panel id="indices" className="max-w-[450px]">
      <CardHead title="Indices Alerts" subtitle="Check this week's performance of your selected indices and take necessary actions." className="mb-pad-3xl" />
      <Tabs defaultValue="nifty" className="mb-pad-3xl">
        <TabsList>
          <TabsTrigger value="nifty">Nifty 50</TabsTrigger>
          <TabsTrigger value="nasdaq">NASDAQ</TabsTrigger>
          <TabsTrigger value="nikkei">NIKKEI</TabsTrigger>
        </TabsList>
      </Tabs>
      <ChartContainer config={indicesConfig} className="h-[160px] w-full">
        <AreaChart data={INDICES} margin={{ left: 0, right: 0, top: 4 }}>
          <defs>
            <linearGradient id="fillIndices" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-v)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-v)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
          <Area dataKey="v" type="natural" stroke="var(--color-v)" strokeWidth={2} fill="url(#fillIndices)" />
        </AreaChart>
      </ChartContainer>
      <div className="mt-pad-3xl flex flex-col gap-gp-md">
        {ARTICLES.map((a) => (
          <div key={a.t} className="rounded-radius-base bg-bg-muted p-pad-3xl">
            <p className="text-body-md font-semibold text-fg-default">{a.t}</p>
            <p className="mt-pad-2xs line-clamp-2 text-body-sm text-fg-muted">{a.d}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   28 — Release timeline (overview + recent + per month)
   ════════════════════════════════════════════════════════════════════ */
const REL_MONTH = [
  { m: "Aug", n: 2 }, { m: "Sep", n: 3 }, { m: "Oct", n: 1 },
  { m: "Nov", n: 4 }, { m: "Dec", n: 2 }, { m: "Jan", n: 1 },
];
const relConfig = { n: { label: "Releases", color: C.green } } satisfies ChartConfig;
const RELEASES = [
  { v: "v2.4.0", date: "Jan 28, 2024", add: "+1,240", rem: "-380" },
  { v: "v2.3.1", date: "Jan 14, 2024", add: "+94", rem: "-22" },
  { v: "v2.3.0", date: "Dec 30, 2023", add: "+870", rem: "-210" },
  { v: "v2.2.2", date: "Dec 12, 2023", add: "+55", rem: "-18" },
];

function ReleaseTimelineCard() {
  const stats = [
    { icon: Tag, v: "13", l: "Total Releases", c: C.green },
    { icon: Clock, v: "12d", l: "Avg Interval", c: C.amber },
    { icon: Code2, v: "+4.2k", l: "Lines Added", c: C.red },
    { icon: CalendarDays, v: "3/mo", l: "Avg Cadence", c: C.green },
  ];
  return (
    <Panel id="release-timeline">
      <div className="mb-pad-3xl flex flex-wrap items-center justify-between gap-gp-lg">
        <p className="text-title-md font-semibold text-fg-default">Aug 2023 – Jan 2024</p>
        <Select defaultValue="6m">
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="12m">Last 12 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-radius-base border border-border-subtle">
        <p className="border-b border-border-subtle px-pad-3xl py-pad-2xl text-body-md font-semibold text-fg-default">Overview</p>
        <div className="grid gap-pad-4xl p-pad-3xl sm:grid-cols-2">
          <div>
            <div className="h-[6px] overflow-hidden rounded-radius-full" style={{ background: C.green }} />
            <p className="mt-pad-md text-body-sm"><span className="font-semibold text-fg-default">13</span> <span className="text-fg-muted">Total Releases</span></p>
          </div>
          <div>
            <div className="flex h-[6px] gap-[3px] overflow-hidden rounded-radius-full">
              <span style={{ width: "23%", background: C.amber }} />
              <span style={{ width: "77%", background: C.red }} />
            </div>
            <p className="mt-pad-md text-body-sm"><span className="font-semibold text-fg-default">3</span> <span className="text-fg-muted">Major</span> <span className="font-semibold text-fg-default">10</span> <span className="text-fg-muted">Minor</span></p>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="flex flex-col items-center gap-gp-2xs px-pad-2xl py-pad-3xl text-center">
              <s.icon className="size-icon-sm" style={{ color: s.c }} />
              <span className="text-title-md font-bold text-fg-default [font-variant-numeric:tabular-nums]">{s.v}</span>
              <span className="text-caption-sm text-fg-muted">{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-pad-4xl grid items-stretch gap-pad-4xl lg:grid-cols-2">
        <div>
          <p className="mb-pad-md text-title-sm font-semibold text-fg-default">Recent Releases</p>
          <div className="flex flex-col gap-gp-md">
            {RELEASES.map((r) => (
              <div key={r.v} className="flex items-center justify-between gap-gp-md rounded-radius-base border border-border-subtle px-pad-3xl py-pad-2xl">
                <span className="flex items-center gap-gp-sm text-body-md font-semibold text-fg-default">
                  <Tag className="size-icon-xs text-fg-muted" /> {r.v}
                </span>
                <div className="text-right">
                  <p className="text-caption-sm text-fg-muted">{r.date}</p>
                  <p className="text-caption-sm [font-variant-numeric:tabular-nums]">
                    <span className="text-fg-success">{r.add}</span> <span className="text-fg-danger">{r.rem}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <p className="mb-pad-md text-title-sm font-semibold text-fg-default">Releases per Month</p>
          <ChartContainer config={relConfig} className="h-[220px] w-full">
            <BarChart data={REL_MONTH} margin={{ left: -24, right: 4 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis dataKey="m" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} ticks={[0, 1, 2, 3, 4]} domain={[0, 4]} interval={0} width={28} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="n" fill="var(--color-n)" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
export function ChartShowcaseDoc() {
  return (
    <DocLayout toc={TOC} wide>
      <DocHeader
        category="Charts"
        title="Compositions"
        description="Composições prontas de dashboard — combinando gráficos, tabelas, métricas e painéis — como inspiração para telas futuras."
        dependency="recharts"
      />
      <DocSeparator />

      <div className="flex flex-col items-center gap-gp-6xl">
        <SaaSRevenueCard />
        <DbInstanceCard />
        <FinanceCard />
        <TotalRevenueCard />
        <UserActivityCard />
        <TotalIncomeCard />

        {/* Cards estreitos — cada um na própria row, largura fixa */}
        <TotalEarningCard />
        <AnatomyCard />
        <WeeklyOverviewCard />
        <TotalSalesCard />
        <BudgetBreakdownCard />
        <CryptoPortfolioCard />

        <SubscriptionBillingCard />
        <AcmeUptimeCard />
        <SystemStatusCard />

        {/* Lote 2 de composições */}
        <ProductGrowthCard />
        <RevenuePerformanceCard />
        <CicdCard />
        <InfraCostCard />
        <EmailCampaignCard />
        <SalesLeadCard />
        <ReleaseTimelineCard />

        {/* Estreitos — cada um na própria row, largura fixa */}
        <VehicleOverviewCard />
        <SupportTicketsCard />
        <TrafficSourcesCard />
        <UserAcquisitionCard />
        <PnlCard />
        <IndicesAlertsCard />
      </div>
    </DocLayout>
  );
}
