import {
  ArrowUpRight,
  Bookmark,
  Box,
  CalendarDays,
  Flame,
  LayoutGrid,
  LineChart as LineChartIcon,
  MoreVertical,
  Package,
  ShoppingBag,
  Star,
  TrendingUp,
  UserPlus,
  Users,
  Clock,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ChartContainer, type ChartConfig } from "../../components/ui/Chart";
import { DocLayout, DocHeader, DocSeparator } from "../components";

/* ══════════════════════════════════════════════════════════════════════════
   KPI Pack — galeria de modelos de cards de KPI/estatística

   Modelos copy-paste, 100% sobre tokens do DS (theme-aware). Espelha o padrão
   do ChartShowcase (Panel / KPI_LABEL / KPI_VALUE / SectionLabel). Sparklines
   via ChartContainer; delta via Chip (success/danger). Sem componente novo.
   ══════════════════════════════════════════════════════════════════════════ */

/* Paleta de chart (CSS vars — flipam por tema) */
const C = {
  green: "var(--color-chart-1)",
  teal: "var(--color-chart-2)",
  blue: "var(--color-chart-3)",
  amber: "var(--color-chart-4)",
  violet: "var(--color-chart-5)",
};

/* ── Helpers (espelham ChartShowcaseDoc) ──────────────────────────────── */
function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-radius-lg bg-bg-surface p-pad-4xl text-body-md text-fg-default shadow-sh-lg ring-1 ring-foreground/5 dark:ring-foreground/10",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full pt-pad-3xl">
      <p className="text-caption-md font-semibold uppercase tracking-[0.06em] text-fg-muted">
        {children}
      </p>
      <div className="mt-pad-md border-b border-border-subtle" />
    </div>
  );
}

const KPI_LABEL = "text-caption-md text-fg-muted";
const KPI_VALUE =
  "text-[30px] font-bold leading-tight text-fg-default [font-variant-numeric:tabular-nums]";

/** Delta pill (+18% / -5%) via Chip semântico. */
function Delta({
  value,
  down = false,
  arrow = false,
}: {
  value: string;
  down?: boolean;
  arrow?: boolean;
}) {
  return (
    <Chip color={down ? "danger" : "success"} variant="soft" size="sm">
      {arrow && (
        <TrendingUp
          className={cn("size-[12px]", down && "rotate-180")}
          aria-hidden
        />
      )}
      {value}
    </Chip>
  );
}

/** Ícone num círculo neutro (top-right dos cards). */
function IconCircle({
  icon: Icon,
  className,
}: {
  icon: typeof Box;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-form-lg place-items-center rounded-radius-full bg-bg-muted text-fg-default",
        className,
      )}
    >
      <Icon className="size-icon-sm" aria-hidden />
    </span>
  );
}

const sine = (n: number, base: number, amp: number, p = 0) =>
  Array.from({ length: n }, (_, i) => ({
    x: i,
    v: Math.round(base + amp * Math.abs(Math.sin(i / 2.2 + p))),
  }));

/* ════════════════════════════════════════════════════════════════════════
   1 — Feature + split + CTA (ref: statistics-01)
   ════════════════════════════════════════════════════════════════════════ */
function FeatureSplitModel() {
  return (
    <div className="grid w-full grid-cols-1 gap-gp-2xl lg:grid-cols-4">
      {/* Card largo */}
      <Panel className="lg:col-span-2">
        <p className="text-title-md font-semibold text-fg-default">
          Analytics Dashboard
        </p>
        <p className="mt-gp-2xs text-body-sm text-fg-muted">
          Check all the statistics
        </p>
        <div className="mt-pad-4xl grid grid-cols-2 divide-x divide-border-subtle">
          <div className="pr-pad-4xl">
            <p className={KPI_LABEL}>Earnings</p>
            <div className="mt-gp-xs flex items-center gap-gp-md">
              <span className={KPI_VALUE}>$27,850</span>
              <Delta value="+18%" />
            </div>
          </div>
          <div className="pl-pad-4xl">
            <p className={KPI_LABEL}>Expense</p>
            <div className="mt-gp-xs flex items-center gap-gp-md">
              <span className={KPI_VALUE}>$18,453</span>
              <Delta value="-5%" down />
            </div>
          </div>
        </div>
      </Panel>

      {/* 2 cards compactos com CTA */}
      {[
        { label: "Weekly Sales", value: "$4,587", icon: CalendarDays },
        { label: "Purchase Orders", value: "230", icon: ShoppingBag },
      ].map((c) => (
        <Panel key={c.label} className="flex flex-col">
          <div className="flex items-start justify-between">
            <p className="text-title-md font-semibold text-fg-default">
              {c.label}
            </p>
            <IconCircle icon={c.icon} />
          </div>
          <div className="mt-pad-md flex items-center gap-gp-md">
            <span className={KPI_VALUE}>{c.value}</span>
            <Delta value="+18%" />
          </div>
          <div className="mt-auto pt-pad-4xl">
            <Button
              variant="outline"
              color="secondary"
              size="sm"
              iconRight={<ArrowUpRight className="size-icon-sm" />}
            >
              See Report
            </Button>
          </div>
        </Panel>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   2 — KPI row + ícone (ref: statistics-02)
   ════════════════════════════════════════════════════════════════════════ */
const ROW_KPIS = [
  {
    label: "Orders",
    value: "5868",
    icon: ShoppingBag,
    delta: "+18%",
    down: false,
  },
  { label: "Sales", value: "$96,850", icon: Package, delta: "-5%", down: true },
  {
    label: "Profit",
    value: "$82,906",
    icon: LineChartIcon,
    delta: "+18%",
    down: false,
  },
  {
    label: "Expense",
    value: "$14,653",
    icon: Star,
    delta: "+18%",
    down: false,
  },
];
function KpiRowModel() {
  return (
    <Panel className="w-full !p-0">
      <div className="grid grid-cols-1 divide-y divide-border-subtle sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 [&>div]:border-border-subtle sm:[&>div]:border-l sm:[&>div:first-child]:border-l-0 lg:[&>div:nth-child(3)]:border-l">
        {ROW_KPIS.map((k) => (
          <div key={k.label} className="p-pad-3xl">
            <div className="flex items-start justify-between">
              <p className="text-title-sm font-semibold text-fg-default">
                {k.label}
              </p>
              <IconCircle icon={k.icon} />
            </div>
            <p className="mt-gp-xs text-[24px] font-bold leading-tight text-fg-default [font-variant-numeric:tabular-nums]">
              {k.value}
            </p>
            <div className="mt-gp-2xs flex items-center gap-gp-md">
              <span className="text-caption-md text-fg-muted">Last 7 days</span>
              <Delta value={k.delta} down={k.down} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   3 — KPI + sparkline (ref: statistics-03)
   ════════════════════════════════════════════════════════════════════════ */
const SPARK_BARS = sine(6, 20, 60, 0.4);
const SPARK_LINE = sine(14, 30, 40, 1.1);
const DONUT = [
  { k: "a", v: 68, fill: C.teal },
  { k: "b", v: 32, fill: "var(--color-bg-muted)" },
];
const sparkCfg = { v: { label: "v", color: C.blue } } satisfies ChartConfig;

function SparkHeader({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: typeof Box;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-gp-md">
        <IconCircle icon={Icon} />
        <p className="text-title-md font-semibold text-fg-default">{label}</p>
        <span className="ml-auto">
          <MoreVertical className="size-icon-sm text-fg-muted" />
        </span>
      </div>
      <p className={cn(KPI_VALUE, "mt-pad-3xl")}>{value}</p>
      <div className="mt-gp-xs">
        <Delta value={delta} />
      </div>
    </div>
  );
}

function KpiSparklineModel() {
  return (
    <div className="grid w-full grid-cols-1 gap-gp-2xl md:grid-cols-3">
      {/* bars */}
      <Panel>
        <SparkHeader
          icon={Bookmark}
          label="Total Followers"
          value="4,562"
          delta="+23%"
        />
        <ChartContainer config={sparkCfg} className="mt-pad-lg h-[64px] w-full">
          <BarChart data={SPARK_BARS}>
            <Bar dataKey="v" radius={4} fill={C.blue} />
          </BarChart>
        </ChartContainer>
      </Panel>
      {/* line */}
      <Panel>
        <SparkHeader
          icon={Box}
          label="Total Income"
          value="$6,280"
          delta="+18%"
        />
        <ChartContainer config={sparkCfg} className="mt-pad-lg h-[64px] w-full">
          <LineChart data={SPARK_LINE} margin={{ top: 6, bottom: 6 }}>
            <Line
              dataKey="v"
              type="monotone"
              stroke={C.teal}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </Panel>
      {/* donut */}
      <Panel>
        <SparkHeader
          icon={Star}
          label="Current Balance"
          value="$2,529"
          delta="+42%"
        />
        <ChartContainer config={sparkCfg} className="mt-pad-lg h-[64px] w-full">
          <PieChart>
            <Pie
              data={DONUT}
              dataKey="v"
              nameKey="k"
              innerRadius={22}
              outerRadius={32}
              strokeWidth={0}
            >
              {DONUT.map((d) => (
                <Cell key={d.k} fill={d.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </Panel>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   4 — Destaque brand / area (ref: statistics-05)
   ════════════════════════════════════════════════════════════════════════ */
const AREA = sine(16, 40, 50, 0.6);
const BARS2 = sine(5, 30, 50, 1.4);
const areaCfg = { v: { label: "v", color: C.blue } } satisfies ChartConfig;
const barsBrandCfg = {
  v: { label: "v", color: "var(--color-fg-on-brand)" },
} satisfies ChartConfig;

function HighlightModel() {
  return (
    <div className="grid w-full grid-cols-1 gap-gp-2xl md:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr]">
      {/* Total Sales — valor à esquerda, area sparkline AO LADO */}
      <Panel className="flex items-center justify-between gap-gp-2xl overflow-hidden p-pad-3xl">
        <div className="min-w-0">
          <p className={KPI_LABEL}>Total Sales</p>
          <p className="text-title-sm font-semibold text-fg-default">
            WrapPixel Store
          </p>
          <p className="mt-gp-md text-[26px] font-bold leading-tight text-fg-default [font-variant-numeric:tabular-nums]">
            $98,452.76
          </p>
          <div className="mt-gp-xs flex items-center gap-gp-xs text-fg-success">
            <TrendingUp className="size-icon-sm" />
            <span className="text-body-sm font-medium">+32.8%</span>
          </div>
        </div>
        <ChartContainer
          config={areaCfg}
          className="pointer-events-none h-[88px] w-[44%] shrink-0"
        >
          <AreaChart
            data={AREA}
            margin={{ top: 4, left: 0, right: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="kpiArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.blue} stopOpacity={0.35} />
                <stop offset="100%" stopColor={C.blue} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              dataKey="v"
              type="monotone"
              stroke={C.blue}
              strokeWidth={2}
              fill="url(#kpiArea)"
            />
          </AreaChart>
        </ChartContainer>
      </Panel>

      {/* Monthly Sales — card de marca preenchido */}
      <Panel className="border-0 bg-bg-brand p-pad-3xl text-fg-on-brand shadow-sh-md ring-0">
        <p className="text-title-sm font-semibold">Monthly Sales</p>
        <p className="mt-pad-md text-[26px] font-bold leading-tight [font-variant-numeric:tabular-nums]">
          $36,890
        </p>
        <div className="mt-gp-md flex items-end justify-between gap-gp-lg">
          <span className="inline-flex items-center gap-gp-xs rounded-radius-full bg-bg-surface/20 px-pad-md py-pad-2xs text-caption-md">
            vs last month <span className="font-semibold">↑ +18.4%</span>
          </span>
          <ChartContainer config={barsBrandCfg} className="h-[44px] w-[110px]">
            <BarChart data={BARS2}>
              <Bar
                dataKey="v"
                radius={3}
                fill="var(--color-fg-on-brand)"
                fillOpacity={0.85}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </Panel>

      {/* Revenue Growth — card de marca subtle */}
      <Panel className="border-0 bg-bg-brand-subtle p-pad-3xl ring-0">
        <div className="flex items-start justify-between">
          <p className="text-title-sm font-semibold text-fg-default">
            Revenue Growth
          </p>
          <span className="grid size-form-lg place-items-center rounded-radius-full bg-bg-brand text-fg-on-brand">
            <LineChartIcon className="size-icon-sm" />
          </span>
        </div>
        <p className="mt-pad-3xl text-[26px] font-bold leading-tight text-fg-default [font-variant-numeric:tabular-nums]">
          +24%
        </p>
        <p className="mt-gp-xs text-body-sm text-fg-muted">
          Compared to Last Month
        </p>
      </Panel>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   5 — KPI + bars + nota (ref: 1.png — New Leads Generated)
   ════════════════════════════════════════════════════════════════════════ */
const LEAD_BARS = [
  { x: 0, v: 30, hl: false },
  { x: 1, v: 42, hl: false },
  { x: 2, v: 36, hl: false },
  { x: 3, v: 64, hl: true },
  { x: 4, v: 44, hl: false },
];
function LeadsModel() {
  return (
    <Panel className="w-full max-w-[460px]">
      <div className="flex items-center justify-between">
        <p className="text-title-md font-semibold text-fg-default">
          New Leads Generated
        </p>
        <MoreVertical className="size-icon-sm text-fg-muted" />
      </div>
      <div className="mt-pad-3xl flex items-end justify-between gap-gp-lg">
        <div>
          <div className="flex items-center gap-gp-md">
            <span className={KPI_VALUE}>1,560</span>
            <Delta value="+25%" arrow />
          </div>
          <p className="mt-gp-xs text-body-sm text-fg-muted">
            Compare from last month
          </p>
        </div>
        <ChartContainer config={sparkCfg} className="h-[64px] w-[160px]">
          <BarChart data={LEAD_BARS}>
            <Bar dataKey="v" radius={4}>
              {LEAD_BARS.map((b) => (
                <Cell
                  key={b.x}
                  fill={b.hl ? C.green : "var(--color-bg-muted)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
      <div className="mt-pad-4xl border-t border-border-subtle pt-pad-lg">
        <p className="text-caption-md text-fg-muted">
          Highest lead volume recorded this quarter from all channels.
        </p>
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   6 — Faixa de métricas (ref: 2.png — Performance summary)
   ════════════════════════════════════════════════════════════════════════ */
const PERF = [
  { label: "Total Engagement", value: "27,840", delta: "7.4%", down: false },
  { label: "Follower Growth", value: "2,859", delta: "4.9%", down: false },
  { label: "Posts Engagement", value: "21,948", delta: "11.7%", down: false },
  { label: "Posts impressions", value: "33,950", delta: "7.5%", down: true },
  { label: "Profile views", value: "4,291", delta: "19.4%", down: false },
];
function PerfStripModel() {
  return (
    <Panel className="w-full">
      <p className="text-title-md font-semibold text-fg-default">
        Performance summary
      </p>
      <p className="mt-gp-2xs text-body-sm text-fg-muted">
        View your key performance metrics
      </p>
      <div className="mt-pad-4xl grid grid-cols-2 gap-x-gp-2xl gap-y-pad-4xl sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-0 lg:divide-x lg:divide-border-subtle">
        {PERF.map((m) => (
          <div
            key={m.label}
            className="lg:px-pad-2xl lg:first:pl-0 lg:last:pr-0"
          >
            <p className="text-caption-md text-fg-muted">{m.label}</p>
            <div className="mt-gp-2xs flex items-center justify-between gap-gp-md">
              <span className="text-[22px] font-bold leading-tight text-fg-default [font-variant-numeric:tabular-nums]">
                {m.value}
              </span>
              <ChartContainer config={sparkCfg} className="h-[28px] w-[56px]">
                <LineChart
                  data={m.down ? SPARK_LINE.slice().reverse() : SPARK_LINE}
                >
                  <Line
                    dataKey="v"
                    type="monotone"
                    stroke={m.down ? "var(--color-fg-danger)" : C.green}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </div>
            <p
              className={cn(
                "mt-gp-2xs text-caption-sm font-medium",
                m.down ? "text-fg-danger" : "text-fg-success",
              )}
            >
              {m.down ? "↓" : "↑"} {m.delta} than last month
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   7 — Detail strip (ref: 3.png — Company Details)
   ════════════════════════════════════════════════════════════════════════ */
const FIELDS = [
  { label: "TOTAL PROJECTS", value: "10 projects", color: C.blue },
  { label: "ACTIVE PROJECTS", value: "5 projects", color: C.amber },
  { label: "TAX ID / EIN", value: "12-3456789", color: C.teal },
  { label: "TOTAL REVENUE", value: "$450K", color: C.violet },
  { label: "TEAM MEMBERS", value: "12 Members", color: C.green },
];
function DetailStripModel() {
  return (
    <Panel className="w-full">
      <div className="flex items-center gap-gp-md">
        <LayoutGrid className="size-icon-sm text-fg-muted" />
        <p className="text-title-md font-semibold text-fg-default">
          Company Details
        </p>
      </div>
      <div className="mt-pad-4xl grid grid-cols-2 gap-y-pad-4xl sm:grid-cols-3 lg:grid-cols-6">
        {FIELDS.map((f) => (
          <div key={f.label} className="flex flex-col gap-gp-2xs pl-pad-md">
            <p className="text-caption-sm uppercase tracking-[0.04em] text-fg-subtle">
              {f.label}
            </p>
            <span className="flex items-center gap-gp-md">
              <span
                className="h-[16px] w-[3px] shrink-0 rounded-radius-full"
                style={{ background: f.color }}
              />
              <span className="text-body-md font-semibold text-fg-default">
                {f.value}
              </span>
            </span>
          </div>
        ))}
        <div className="flex flex-col gap-gp-2xs">
          <p className="text-caption-sm uppercase tracking-[0.04em] text-fg-subtle">
            Client Status
          </p>
          <span>
            <Delta value="Active" />
          </span>
        </div>
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   8 — Quad 2×2 (ref: 4.png — Product analytics)
   ════════════════════════════════════════════════════════════════════════ */
const QUAD = [
  {
    label: "New Users",
    value: "1.39K",
    delta: "147%",
    down: false,
    icon: UserPlus,
    color: "var(--color-fg-danger)",
  },
  {
    label: "Unique Users",
    value: "1.52K",
    delta: "53%",
    down: false,
    icon: Star,
    color: C.green,
  },
  {
    label: "Week 1 Retention",
    value: "4.53%",
    delta: "10.7%",
    down: true,
    icon: Flame,
    color: C.blue,
  },
  {
    label: "Session",
    value: "0.9 sec",
    delta: "29%",
    down: false,
    icon: Clock,
    color: C.amber,
  },
];
function QuadModel() {
  return (
    <Panel className="w-full max-w-[560px] !p-0">
      <div className="grid grid-cols-2 divide-x divide-y divide-border-subtle [&>div:nth-child(-n+2)]:border-t-0 [&>div:nth-child(odd)]:border-l-0">
        {QUAD.map((q) => (
          <div key={q.label} className="flex flex-col gap-gp-md p-pad-4xl">
            <div className="flex items-start justify-between">
              <p className="text-body-md text-fg-muted">{q.label}</p>
              <span
                className="grid size-form-md place-items-center rounded-radius-full text-white"
                style={{ background: q.color }}
              >
                <q.icon className="size-icon-sm" aria-hidden />
              </span>
            </div>
            <p className="text-[26px] font-bold leading-none text-fg-default [font-variant-numeric:tabular-nums]">
              {q.value}
            </p>
            <p
              className={cn(
                "flex items-center gap-gp-xs text-caption-md font-medium",
                q.down ? "text-fg-danger" : "text-fg-success",
              )}
            >
              {q.down ? "↘" : "↗"} {q.delta}{" "}
              <span className="font-normal text-fg-subtle">
                VS PREV. 28 DAYS
              </span>
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   9 — Trading row (ref: dashboard.html)
   ════════════════════════════════════════════════════════════════════════ */
const TRADE = [
  {
    label: "Total Volume",
    value: "$2.84M",
    sub: "+$340K",
    delta: "+14.2%",
    kind: "bars" as const,
  },
  {
    label: "Active Trades",
    value: "1,247",
    sub: "+104",
    delta: "+8.3%",
    kind: "bars" as const,
  },
  {
    label: "Portfolio Return",
    value: "+18.7%",
    sub: "+2.3 pts",
    delta: "+34.2% yr",
    kind: "area" as const,
    accent: true,
  },
  {
    label: "Net P&L",
    value: "+$24,891",
    sub: "+$1,493",
    delta: "+6.4%",
    kind: "area" as const,
    accent: true,
  },
];
const TBARS = sine(7, 14, 26, 0.7);
const TAREA = sine(14, 20, 30, 1.5);
function TradingModel() {
  return (
    <div className="grid w-full grid-cols-1 gap-gp-2xl sm:grid-cols-2 lg:grid-cols-4">
      {TRADE.map((t, i) => (
        <Panel key={t.label} className="flex flex-col gap-gp-md">
          <p className="text-caption-md text-fg-muted">{t.label}</p>
          <p
            className={cn(
              "text-[26px] font-bold leading-none [font-variant-numeric:tabular-nums]",
              t.accent ? "text-fg-success" : "text-fg-default",
            )}
          >
            {t.value}
          </p>
          <div className="flex items-center gap-gp-md">
            <span className="text-caption-md text-fg-muted">{t.sub}</span>
            <Delta value={t.delta} />
          </div>
          <ChartContainer config={sparkCfg} className="mt-auto h-[40px] w-full">
            {t.kind === "bars" ? (
              <BarChart data={TBARS}>
                <Bar dataKey="v" radius={2} fill={C.green} />
              </BarChart>
            ) : (
              <AreaChart
                data={TAREA}
                margin={{ top: 4, left: 0, right: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={`tArea-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.green} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="v"
                  type="monotone"
                  stroke={C.green}
                  strokeWidth={2}
                  fill={`url(#tArea-${i})`}
                />
              </AreaChart>
            )}
          </ChartContainer>
        </Panel>
      ))}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */
const TOC = [
  { id: "simples", label: "Simples & ícone" },
  { id: "row", label: "KPI row + ícone" },
  { id: "quad", label: "Quad 2×2" },
  { id: "sparkline", label: "Com sparkline" },
  { id: "spark-cards", label: "KPI + sparkline" },
  { id: "leads", label: "KPI + bars + nota" },
  { id: "perf", label: "Faixa de métricas" },
  { id: "trading", label: "Trading row" },
  { id: "destaque", label: "Destaque & detalhe" },
  { id: "feature", label: "Feature + split + CTA" },
  { id: "highlight", label: "Destaque brand / area" },
  { id: "detail", label: "Detail strip" },
];

export function KpiPackDoc() {
  return (
    <DocLayout toc={TOC} wide>
      <DocHeader
        category="Templates"
        title="KPI Pack"
        description="Galeria de modelos de cards de KPI/estatística — para inspirar e copiar. 100% sobre tokens do DS (theme-aware), sparklines via Chart e delta via Chip. Não é um componente: são padrões prontos pra compor dashboards."
        dependency="recharts"
      />
      <DocSeparator />

      <div className="flex flex-col gap-gp-4xl">
        <SectionLabel>Simples &amp; ícone</SectionLabel>
        <div id="row">
          <KpiRowModel />
        </div>
        <div id="quad" className="flex justify-center">
          <QuadModel />
        </div>

        <SectionLabel>Com sparkline</SectionLabel>
        <div id="spark-cards">
          <KpiSparklineModel />
        </div>
        <div id="leads" className="flex justify-center">
          <LeadsModel />
        </div>
        <div id="perf">
          <PerfStripModel />
        </div>
        <div id="trading">
          <TradingModel />
        </div>

        <SectionLabel>Destaque &amp; detalhe</SectionLabel>
        <div id="feature">
          <FeatureSplitModel />
        </div>
        <div id="highlight">
          <HighlightModel />
        </div>
        <div id="detail">
          <DetailStripModel />
        </div>
      </div>
    </DocLayout>
  );
}
