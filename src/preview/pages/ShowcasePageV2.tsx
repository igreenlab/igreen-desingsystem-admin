import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/shadcn/card";
import { Button } from "../../components/ui/Button/button";
import { Input } from "../../components/shadcn/input";
import { Label } from "../../components/shadcn/label";
import { Separator } from "../../components/shadcn/separator";
import { Textarea } from "../../components/shadcn/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/shadcn/select";
import { Switch } from "../../components/shadcn/switch";
import { Checkbox } from "../../components/shadcn/checkbox";
import { RadioGroup, RadioGroupItem } from "../../components/shadcn/radio-group";
import { Slider } from "../../components/shadcn/slider";
import { Progress } from "../../components/shadcn/progress";
import { Badge } from "../../components/shadcn/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/shadcn/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../../components/shadcn/accordion";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage, BreadcrumbEllipsis } from "../../components/shadcn/breadcrumb";
import { Calendar } from "../../components/shadcn/calendar";
import { Avatar, AvatarFallback } from "../../components/shadcn/avatar";
import { LayoutDashboard, CreditCard, TrendingUp, Target, ClipboardList, FileText, FolderOpen, User, Receipt, Bell, Lock, HelpCircle, Mail, Activity, Coffee, ShoppingCart, Banknote, Car, Tv, RotateCcw, CalendarDays, RefreshCw, ChevronRight, CircleAlert, Volume2 } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   Showcase V2 — mesmo conteúdo do Showcase original, agora consumindo os
   tokens DS e patterns alinhados com nossas showcases atuais (CRUD/Chat/
   Dashboard). Sem alterar funcionalidade ou layout — só refinar visual:
     - Radius: 2xl/3xl → xl/lg (mais discreto, condizente com cards das showcases)
     - Padding cards: p-10 outer → p-pad-6xl; cards internos p-pad-3xl
     - bg-bg-muted → bg-bg-muted (sem alpha modifier)
     - bg-[#hex] → tokens (bg-bg-warning / bg-bg-success / etc)
     - Cards ganham `shadow-sh-sm` + `border-border-subtle` padronizado
     - Títulos `text-[15px] font-bold`, sub `text-body-xs font-normal text-fg-muted`
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Mini Bar Chart (divs) ──────────────────────────────────────────────── */
function BarChart({ data, color = "bg-primary", className = "h-20", barGap = "gap-gp-md", barRadius = "rounded-t-radius-sm" }: { data: number[]; color?: string; className?: string; barGap?: string; barRadius?: string }) {
  const max = Math.max(...data);
  return (
    <div className={`flex items-end ${barGap} ${className}`}>
      {data.map((v, i) => (
        <div key={i} className={`flex-1 ${color} ${barRadius}`} style={{ height: `${(v / max) * 100}%` }} />
      ))}
    </div>
  );
}


/* ── Stat Row ───────────────────────────────────────────────────────────── */
function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-body-md text-fg-muted">{label}</span>
      <span className="text-body-md font-medium tabular-nums">{value}</span>
    </div>
  );
}

/* ── Transaction Item ───────────────────────────────────────────────────── */
function TransactionItem({ icon, title, sub, date, amount, positive }: {
  icon: React.ReactNode; title: string; sub: string; date: string; amount: string; positive?: boolean;
}) {
  return (
    <div className="flex items-center gap-gp-xl py-pad-xl">
      <Avatar className="size-10"><AvatarFallback className="bg-bg-muted">{icon}</AvatarFallback></Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-body-md font-medium">{title}</p>
        <p className="text-body-md text-fg-muted">{sub}</p>
      </div>
      <div className="text-right">
        <p className={`text-body-md font-medium tabular-nums ${positive ? "text-fg-success" : ""}`}>{amount}</p>
        <p className="text-body-md text-fg-subtle">{date}</p>
      </div>
    </div>
  );
}


export function ShowcasePageV2() {
  return (
    <div
      className={[
        // Masonry via CSS `columns-*` — cards de alturas diferentes se acomodam
        // sem gap vertical (estilo Pinterest). `[&>*]:break-inside-avoid` evita
        // que um card quebre entre colunas. `[&>*]:mb-gp-2xl` substitui o gap
        // vertical (columns só suporta column-gap, não row-gap).
        // `min-w-0` + `overflow-x-hidden` no root: barrier contra overflow
        // horizontal de filhos com conteúdo wide (text longo, code block, etc).
        "p-pad-6xl",
        "w-full mx-auto max-w-[1660px] min-w-0 overflow-x-hidden",
        "columns-1 sm:columns-2 xl:columns-3 2xl:columns-4",
        "gap-gp-2xl",
        "[&>*]:break-inside-avoid [&>*]:mb-gp-2xl [&>*]:w-full",
      ].join(" ")}
    >

      {/* ── 1. Contribution History ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-gp-lg">
              <CardTitle>Contribution History</CardTitle>
              <CardDescription>Last 6 months of activity</CardDescription>
            </div>
            <Badge color="secondary" variant="soft" size="md">+12% vs last month</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-gp-4xl">
          {/* Chart area — 200px do Figma, barras com gap 14px e radius maior */}
          <div className="h-[200px] flex flex-col">
            <BarChart data={[30, 50, 35, 70, 45, 60]} color="bg-bg-warning" className="flex-1" barGap="gap-[14px]" barRadius="rounded-t-radius-md" />
            <div className="flex text-caption-sm text-fg-subtle mt-gp-xs">
              {["Dec", "Jan", "Feb", "Mar", "Apr", "May"].map(m => (
                <span key={m} className="flex-1 text-center">{m}</span>
              ))}
            </div>
          </div>
          {/* Info boxes — gap-xl (12px), rounded-2xl, pad-2xl (16px), gap-xs (4px) interno */}
          <div className="grid grid-cols-2 gap-gp-xl">
            <div className="bg-bg-muted border border-transparent rounded-radius-lg p-pad-2xl flex flex-col gap-gp-xs">
              <p className="text-body-xs text-fg-muted uppercase tracking-wider">Upcoming</p>
              <p className="text-body-md font-medium font-semibold text-fg-default">May 25, 2024</p>
              <p className="text-body-xs font-normal text-fg-muted">$1,000 scheduled</p>
            </div>
            <div className="bg-bg-muted border border-transparent rounded-radius-lg p-pad-2xl flex flex-col gap-gp-xs">
              <p className="text-body-xs text-fg-muted uppercase tracking-wider">Auto-Save Plan</p>
              <p className="text-body-md font-medium font-semibold text-fg-default">Accelerated</p>
              <p className="text-body-xs font-normal text-fg-muted">Recurring weekly</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button color="primary" variant="filled" size="sm" fullWidth>View Full Report</Button>
        </CardFooter>
      </Card>

      {/* ── 2. Payout Threshold ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payout Threshold</CardTitle>
            <Button color="secondary" variant="soft" size="icon-xs">✕</Button>
          </div>
          <CardDescription>Set the minimum balance required before a payout is triggered.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-gp-4xl">
          <div className="flex flex-col gap-gp-lg">
            <Label>Preferred Currency</Label>
            <Select defaultValue="usd">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD — United States Dollar</SelectItem>
                <SelectItem value="gbp">GBP — British Pound</SelectItem>
                <SelectItem value="eur">EUR — Euro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-gp-lg">
            <div className="flex items-center justify-between">
              <Label>Minimum Payout Amount</Label>
              <span className="text-heading-xs font-semibold tabular-nums">$2500.00</span>
            </div>
            <Slider defaultValue={[2500]} min={50} max={10000} />
            <div className="flex justify-between text-body-md text-fg-subtle">
              <span>$50 (MIN)</span><span>$10,000 (MAX)</span>
            </div>
          </div>
          <div className="flex flex-col gap-gp-lg">
            <Label>Notes</Label>
            <Textarea placeholder="Add any notes for this payout configuration..." className="min-h-[112px]" />
          </div>
        </CardContent>
        <CardFooter>
          <Button color="primary" variant="filled" size="sm" fullWidth>Save Threshold</Button>
        </CardFooter>
      </Card>

      {/* ── 3. Savings Targets ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Savings Targets</CardTitle>
            <Button color="secondary" variant="outline" size="xs">New Goal</Button>
          </div>
          <CardDescription>Active milestones for 2024</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-gp-4xl">
          {/* Target boxes — bg-muted/50, rounded-2xl, gap-xl (12px) entre eles */}
          <div className="flex flex-col gap-gp-xl">
            <div className="bg-bg-muted border border-transparent rounded-radius-lg p-pad-2xl flex flex-col gap-gp-xl">
              <p className="text-body-xs text-fg-muted uppercase tracking-wider">Retirement</p>
              <p className="text-heading-xs font-semibold">$420,000</p>
              <Progress value={65} />
              <div className="flex justify-between text-body-md text-fg-muted">
                <span>65% achieved</span><span className="tabular-nums">$273,000</span>
              </div>
            </div>
            <div className="bg-bg-muted border border-transparent rounded-radius-lg p-pad-2xl flex flex-col gap-gp-xl">
              <p className="text-body-xs text-fg-muted uppercase tracking-wider">Real Estate</p>
              <p className="text-heading-xs font-semibold">$85,000</p>
              <Progress value={32} />
              <div className="flex justify-between text-body-md text-fg-muted">
                <span>32% achieved</span><span className="tabular-nums">$27,200</span>
              </div>
            </div>
          </div>
          <p className="text-body-md text-fg-muted">You have not met your targets for this year.</p>
        </CardContent>
      </Card>

      {/* ── 4. Buy Investment ───────────────────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle>Buy Investment</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-gp-5xl">
          <div className="flex flex-col gap-gp-lg">
            <Label>Amount to Invest</Label>
            <Input size="sm" defaultValue="1,000.00" />
          </div>
          <div className="flex flex-col gap-gp-lg">
            <Label>Order Type</Label>
            <Select defaultValue="market">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market Order</SelectItem>
                <SelectItem value="limit">Limit Order</SelectItem>
                <SelectItem value="stop">Stop Order</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-body-md text-fg-muted">Market orders execute at the current price.</p>
          </div>
          <div className="flex flex-col gap-gp-lg">
            <StatRow label="Estimated Shares" value="1.95" />
            <StatRow label="Buying Power" value="$12,450.00" />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-gp-2xl">
          <Button color="primary" variant="filled" size="sm" fullWidth>Review Order</Button>
          <p className="text-body-md text-fg-muted text-center">Trades are typically executed within minutes during market hours.</p>
        </CardFooter>
      </Card>

      {/* ── 5. Account Access ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Account Access</CardTitle>
          <CardDescription>Update your credentials or re-authenticate.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-gp-4xl">
          {/* Fields — gap-28px (Figma) entre email e password */}
          <div className="flex flex-col gap-gp-5xl">
            <div className="flex flex-col gap-gp-lg">
              <Label>Email Address</Label>
              <Input size="sm" defaultValue="artist@studio.inc" />
            </div>
            <div className="flex flex-col gap-gp-lg">
              <div className="flex items-center justify-between">
                <Label>Current Password</Label>
                <a href="#" className="text-body-xs text-fg-muted uppercase tracking-wider">Forgot?</a>
              </div>
              <Input size="sm" type="password" defaultValue="password123" />
            </div>
          </div>
          {/* Button + Danger Zone — gap-[17px] do Figma */}
          <div className="flex flex-col gap-gp-2xl">
            <Button color="primary" variant="filled" size="sm" fullWidth>Update Security</Button>
            <a href="#" className="flex items-start gap-gp-xl bg-bg-muted border border-transparent rounded-radius-lg px-pad-2xl py-pad-2xl">
              <CircleAlert className="size-4 text-fg-danger shrink-0 mt-sp-2xs" />
              <div className="flex flex-col gap-gp-sm flex-1">
                <span className="text-body-md font-medium text-fg-default">Danger Zone</span>
                <span className="text-body-md text-fg-muted">Archive account and remove catalog</span>
              </div>
              <span className="text-fg-muted shrink-0 self-center">→</span>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* ── 6. Distribute Track ─────────────────────────────────────────── */}
      <Card>
        <CardContent className="flex flex-col items-center text-center">
          <div className="size-form-lg rounded-radius-full bg-bg-muted flex items-center justify-center text-body-xl text-fg-muted">+</div>
          <p className="text-title-md font-medium mt-gp-4xl">Distribute Track</p>
          <p className="text-body-md text-fg-muted mt-gp-lg">Upload your first master to start reaching listeners on Spotify, Apple Music, and more.</p>
          <div className="mt-gp-3xl"><Button color="primary" variant="filled" size="sm">Create Release</Button></div>
        </CardContent>
      </Card>

      {/* ── 7. Claimable Balance ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-gp-xs">
            <CardDescription>Claimable Balance</CardDescription>
            <p className="text-heading-sm font-semibold text-fg-default">$0.00</p>
          </div>
          <div><Badge color="secondary" variant="outline" size="md"><span className="text-fg-warning">●</span> Pending Setup</Badge></div>
        </CardHeader>
        <CardContent className="flex flex-col gap-gp-4xl">
          {/* Stat box — bg-muted, rounded, com separadores internos */}
          <div className="bg-bg-muted border border-transparent rounded-radius-lg overflow-hidden">
            <div className="flex justify-between px-pad-2xl py-pad-xl">
              <span className="text-body-md text-fg-muted">Net Royalties</span>
              <span className="text-body-md font-medium tabular-nums">$0.00</span>
            </div>
            <Separator className="bg-border-default dark:bg-border-subtle" />
            <div className="flex justify-between px-pad-2xl py-pad-xl">
              <span className="text-body-md text-fg-muted">Processing Fee</span>
              <span className="text-body-md font-medium tabular-nums">-$0.00</span>
            </div>
            <Separator className="bg-border-default dark:bg-border-subtle" />
            <div className="flex justify-between px-pad-2xl py-pad-xl">
              <span className="text-body-md text-fg-default font-medium">Total Ready to Claim</span>
              <span className="text-body-md font-medium font-semibold tabular-nums">$0.00 USD</span>
            </div>
          </div>
          <p className="text-body-md text-fg-muted">Once your bank is connected, balances over $10.00 are automatically eligible for monthly distribution on the 15th of each month.</p>
        </CardContent>
      </Card>

      {/* ── 8. Recent Transactions ──────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button color="secondary" variant="outline" size="xs">View All</Button>
          </div>
          <CardDescription>Your latest account activity.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-gp-xs">
          <TransactionItem icon={<Coffee className="size-4 text-fg-muted" />} title="Blue Bottle Coffee" sub="Food & Drink" date="Today, 10:24 AM" amount="-$6.50" />
          <Separator />
          <TransactionItem icon={<ShoppingCart className="size-4 text-fg-muted" />} title="Whole Foods Market" sub="Groceries" date="Yesterday" amount="-$142.30" />
          <Separator />
          <TransactionItem icon={<Banknote className="size-4 text-fg-muted" />} title="Stripe Payout" sub="Income" date="Oct 12" amount="+$4,200.00" positive />
          <Separator />
          <TransactionItem icon={<Car className="size-4 text-fg-muted" />} title="Uber Technologies" sub="Transport" date="Oct 11" amount="-$24.10" />
          <Separator />
          <TransactionItem icon={<Tv className="size-4 text-fg-muted" />} title="Netflix Subscription" sub="Entertainment" date="Oct 10" amount="-$19.99" />
        </CardContent>
      </Card>

      {/* ── 9. Card Balance ─────────────────────────────────────────────── */}
      <Card>
        <CardContent className="flex flex-col gap-gp-4xl">
          <div className="grid grid-cols-2 gap-gp-4xl">
            <div className="flex flex-col gap-gp-xs">
              <p className="text-body-md text-fg-muted">Card Balance</p>
              <p className="text-heading-xs font-semibold">US$12.94</p>
              <p className="text-body-md text-fg-muted">US$11,337.06 Available</p>
            </div>
            <div className="text-right flex flex-col gap-gp-xs">
              <p className="text-body-md text-fg-muted">Payment Due</p>
              <p className="text-heading-xs font-semibold">1 Apr</p>
              <div><Button color="secondary" variant="outline" size="2xs">Pay Early</Button></div>
            </div>
          </div>
          <Separator />
          <div>
            <div className="flex items-center justify-between mb-sp-lg">
              <p className="text-body-md text-fg-muted">Yearly Activity</p>
              <Badge color="primary" variant="soft" size="sm">+US$0.25 Daily Cash</Badge>
            </div>
            <BarChart data={[20, 30, 25, 35, 40, 45, 50, 55, 60, 70, 65, 80]} color="bg-bg-warning" className="h-28" />
            <div className="flex justify-between text-caption-sm text-fg-subtle mt-sp-md">
              {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map(m => <span key={m}>{m}</span>)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 10. Preferences ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Preferences</CardTitle>
            <Button color="secondary" variant="soft" size="icon-xs">✕</Button>
          </div>
          <CardDescription>Manage your account settings and notifications.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-gp-4xl">
          <div className="flex flex-col gap-gp-lg">
            <Label>Default Currency</Label>
            <Select defaultValue="usd">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="usd">USD — United States Dollar</SelectItem>
                <SelectItem value="eur">EUR — Euro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-gp-xl">
            <div className="flex flex-col gap-gp-xs">
              <p className="text-body-md font-medium">Public Statistics</p>
              <p className="text-body-md text-fg-muted">Allow others to see your total stream count and listening activity</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between gap-gp-xl">
            <div className="flex flex-col gap-gp-xs">
              <p className="text-body-md font-medium">Email Notifications</p>
              <p className="text-body-md text-fg-muted">Monthly royalty reports and distribution updates</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
        <CardFooter className="gap-gp-md">
          <Button color="secondary" variant="ghost" size="sm">Reset</Button>
          <Button color="primary" variant="filled" size="sm">Save Preferences</Button>
        </CardFooter>
      </Card>

      {/* ── 11. Navigation Menu (2 dropdowns estáticos lado a lado) ───────── */}
      <div className="grid grid-cols-2 gap-gp-xl">
        {/* Dropdown 1 — Overview + Planning */}
        <div className="rounded-radius-xl bg-bg-surface border border-border-subtle shadow-sh-md dark:shadow-sh-xl p-pad-sm">
          <p className="px-pad-xl py-pad-lg text-body-xs text-fg-muted">Overview</p>
          {[
            { icon: LayoutDashboard, label: "Dashboard", active: true },
            { icon: CreditCard, label: "Transactions" },
            { icon: TrendingUp, label: "Investments" },
          ].map(item => (
            <div key={item.label} className={`flex items-center gap-gp-md rounded-radius-lg px-pad-xl py-pad-md text-body-md font-medium cursor-pointer ${item.active ? "bg-bg-muted text-fg-default" : "text-fg-default hover:bg-bg-muted"}`}>
              <item.icon className="size-4 text-fg-muted" /> {item.label}
            </div>
          ))}
          <Separator className="my-sp-md" />
          <p className="px-pad-xl py-pad-lg text-body-xs text-fg-muted">Planning</p>
          {[
            { icon: Target, label: "Goals" },
            { icon: ClipboardList, label: "Budget" },
            { icon: FileText, label: "Reports" },
            { icon: FolderOpen, label: "Documents" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-gp-md rounded-radius-lg px-pad-xl py-pad-md text-body-md font-medium text-fg-default cursor-pointer hover:bg-bg-muted">
              <item.icon className="size-4 text-fg-muted" /> {item.label}
            </div>
          ))}
        </div>
        {/* Dropdown 2 — Account + Support */}
        <div className="rounded-radius-xl bg-bg-surface border border-border-subtle shadow-sh-md dark:shadow-sh-xl p-pad-sm">
          <p className="px-pad-xl py-pad-lg text-body-xs text-fg-muted">Account</p>
          {[
            { icon: User, label: "Profile" },
            { icon: Receipt, label: "Billing", active: true },
            { icon: Bell, label: "Notifications" },
            { icon: Lock, label: "Security" },
          ].map(item => (
            <div key={item.label} className={`flex items-center gap-gp-md rounded-radius-lg px-pad-xl py-pad-md text-body-md font-medium cursor-pointer ${item.active ? "bg-bg-muted text-fg-default" : "text-fg-default hover:bg-bg-muted"}`}>
              <item.icon className="size-4 text-fg-muted" /> {item.label}
            </div>
          ))}
          <Separator className="my-sp-md" />
          <p className="px-pad-xl py-pad-lg text-body-xs text-fg-muted">Support</p>
          {[
            { icon: HelpCircle, label: "Help Center" },
            { icon: Mail, label: "Contact Us" },
            { icon: Activity, label: "Status" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-gp-md rounded-radius-lg px-pad-xl py-pad-md text-body-md font-medium text-fg-default cursor-pointer hover:bg-bg-muted">
              <item.icon className="size-4 text-fg-muted" /> {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── 12. FAQ ─────────────────────────────────────────────────────── */}
      <Card>
        <CardContent>
          <Tabs defaultValue="general">
            <TabsList className="w-full [&>*]:flex-1">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="pt-sp-2xl">
              <div className="border border-border-subtle rounded-radius-lg overflow-hidden">
                <Accordion type="single" collapsible defaultValue="q2">
                  <AccordionItem value="q1" className="border-b border-border-subtle px-pad-2xl bg-bg-surface data-[state=open]:bg-bg-muted">
                    <AccordionTrigger className="text-left">How secure is my financial data with Ledger?</AccordionTrigger>
                    <AccordionContent>We use bank-level AES-256 encryption, SOC 2 Type II certified infrastructure, and never store your credentials. All connections use read-only access tokens. We are a SEC registered investment advisor.</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q2" className="border-b border-border-subtle px-pad-2xl bg-bg-surface data-[state=open]:bg-bg-muted">
                    <AccordionTrigger className="text-left">How do I connect my bank or investment accounts?</AccordionTrigger>
                    <AccordionContent>Go to Settings &gt; Linked Accounts and search for your institution. We support over 12,000 banks and brokerages via Plaid and MX.</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="q3" className="border-0 px-pad-2xl bg-bg-surface data-[state=open]:bg-bg-muted">
                    <AccordionTrigger className="text-left">Can I export my data for tax purposes?</AccordionTrigger>
                    <AccordionContent>Yes, export CSV or PDF from Reports → Tax Documents.</AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>
            <TabsContent value="billing"><p className="text-body-md text-fg-muted py-sp-2xl">Billing FAQ content.</p></TabsContent>
            <TabsContent value="goals"><p className="text-body-md text-fg-muted py-sp-2xl">Goals FAQ content.</p></TabsContent>
          </Tabs>
          <div className="mt-sp-2xl">
            <Button color="secondary" variant="outline" size="sm" fullWidth>Contact Support</Button>
          </div>
        </CardContent>
      </Card>

      {/* ── 13. Breadcrumb + Links ──────────────────────────────────────── */}
      <Card>
        <CardContent className="flex flex-col gap-gp-2xl">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Payments</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="border border-border-subtle rounded-radius-lg overflow-hidden">
            {[
              { Icon: RotateCcw, title: "Change transfer limit", desc: "Adjust how much you can send from your balance." },
              { Icon: CalendarDays, title: "Scheduled transfers", desc: "Set up a transfer to send at a later date." },
              { Icon: RefreshCw, title: "Direct Debits", desc: "Set up and manage regular payments." },
              { Icon: RefreshCw, title: "Recurring card payments", desc: "Manage your repeated card transactions." },
            ].map((l, i, arr) => (
              <a key={l.title} href="#" className={`flex items-start gap-gp-xl bg-bg-surface px-pad-2xl py-pad-2xl hover:bg-bg-muted transition-colors ${i < arr.length - 1 ? "border-b border-border-subtle" : ""}`}>
                <l.Icon className="size-4 text-fg-muted shrink-0 mt-sp-2xs" />
                <div className="flex flex-col gap-gp-xs flex-1">
                  <p className="text-body-md font-medium text-fg-default">{l.title}</p>
                  <p className="text-body-md text-fg-muted">{l.desc}</p>
                </div>
                <ChevronRight className="size-4 text-fg-muted shrink-0 self-center" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── 14. Transfer Funds ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transfer Funds</CardTitle>
            <Button color="secondary" variant="soft" size="icon-xs">✕</Button>
          </div>
          <CardDescription>Move money between your connected accounts.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-gp-4xl">
          <div className="flex flex-col gap-gp-lg">
            <Label>Amount to Transfer</Label>
            <Input size="sm" defaultValue="1,200.00" />
          </div>
          <div className="flex flex-col gap-gp-lg">
            <Label>From Account</Label>
            <Select defaultValue="checking">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Main Checking (··8402) — $12,450.00</SelectItem>
                <SelectItem value="savings">High Yield Savings — $42,100.00</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-gp-lg">
            <Label>To Account</Label>
            <Select defaultValue="savings">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">High Yield Savings (··1192) — $42,100.00</SelectItem>
                <SelectItem value="checking">Main Checking — $12,450.00</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-gp-xs">
            <StatRow label="Estimated arrival" value="Today, Apr 14" />
            <StatRow label="Transaction fee" value="$0.00" />
            <StatRow label="Total amount" value="$1,200.00" />
          </div>
        </CardContent>
        <CardFooter>
          <Button color="primary" variant="filled" size="sm" fullWidth>Confirm Transfer</Button>
        </CardFooter>
      </Card>

      {/* ── 15. Upcoming Payments ───────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
          <CardDescription>Select a date to view scheduled payments.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-gp-4xl">
          {/* Calendar em box */}
          <div className="border border-border-subtle rounded-radius-base p-pad-4xl">
            <Calendar className="w-full bg-transparent" mode="single" selected={new Date()} />
          </div>
          {/* Payment items em cards individuais */}
          <div className="flex flex-col gap-gp-xl">
            {[
              { title: "Netflix Subscription", date: "Apr 15, 2024", amount: "$19.99" },
              { title: "Rent Payment", date: "Apr 1, 2024", amount: "$2,400.00" },
              { title: "Auto Insurance", date: "Apr 22, 2024", amount: "$186.00" },
            ].map(p => (
              <div key={p.title} className="flex items-center justify-between bg-bg-muted border border-transparent rounded-radius-lg px-pad-2xl py-pad-xl">
                <div className="flex flex-col gap-gp-2xs">
                  <span className="text-body-md font-medium text-fg-default">{p.title}</span>
                  <span className="text-body-md text-fg-muted">{p.date}</span>
                </div>
                <Badge color="secondary" variant="soft" className="bg-bg-surface" size="sm">{p.amount}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── 16. Kitchen Island ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-gp-xs">
              <CardTitle>Kitchen Island</CardTitle>
              <CardDescription>Hue Color Ambient</CardDescription>
            </div>
            <Switch defaultChecked />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-gp-4xl">
          {/* Scenes — chips/buttons */}
          <div className="flex gap-gp-md">
            {["Cooking", "Dining", "Nightlight", "Focus"].map((s, i) => (
              <Button key={s} color="secondary" variant={i === 0 ? "soft" : "outline"} size="xs">{s}</Button>
            ))}
          </div>
          {/* Sliders em cards com icon + label + slider inline */}
          <div className="flex flex-col gap-gp-lg">
            {[
              { icon: "☀", label: "Brightness", value: 90 },
              { icon: "♨", label: "Color Temp", value: 70 },
              { icon: "vol", label: "Volume", value: 30 },
              { icon: "◑", label: "Fade", value: 0 },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-gp-xl bg-bg-surface border border-border-subtle rounded-radius-lg px-pad-3xl py-pad-xl">
                <span className="text-fg-muted shrink-0">{item.icon === "vol" ? <Volume2 className="size-4" /> : item.icon}</span>
                <span className="text-body-md font-medium shrink-0 w-24">{item.label}</span>
                <div className="flex-1"><Slider defaultValue={[item.value]} /></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── 17. Payout Preferences ──────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Receiving Method</CardTitle>
            <Button color="secondary" variant="soft" size="icon-xs">✕</Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-gp-4xl">
          <div className="flex flex-col gap-gp-lg">
            <Label>Account Holder Name</Label>
            <Input size="sm" defaultValue="Synthetic Horizons Music LLC" />
          </div>
          <div className="flex flex-col gap-gp-lg">
            <Label>Receiving Method</Label>
            <RadioGroup defaultValue="bank">
              <label className="flex items-center gap-gp-xl px-pad-2xl py-pad-xl rounded-radius-lg border border-border-subtle bg-bg-surface has-[[data-state=checked]]:bg-bg-muted">
                <RadioGroupItem value="bank" />
                <div><p className="text-body-md font-medium">Bank Transfer</p><p className="text-body-md text-fg-muted">SWIFT / IBAN</p></div>
              </label>
              <label className="flex items-center gap-gp-xl px-pad-2xl py-pad-xl rounded-radius-lg border border-border-subtle bg-bg-surface has-[[data-state=checked]]:bg-bg-muted">
                <RadioGroupItem value="paypal" />
                <div><p className="text-body-md font-medium">PayPal</p><p className="text-body-md text-fg-muted">Instant Payout</p></div>
              </label>
            </RadioGroup>
          </div>
          <div className="flex flex-col gap-gp-lg">
            <Label>IBAN / Account Number</Label>
            <Input size="sm" placeholder="" />
          </div>
        </CardContent>
        <CardFooter>
          <Button color="primary" variant="filled" size="sm" fullWidth>Save Payout Settings</Button>
        </CardFooter>
      </Card>

      {/* ── 18. Set a New Milestone ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Set a new milestone</CardTitle>
          <CardDescription>Define your financial target and we'll help you pace your savings.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-gp-4xl">
          <div className="flex flex-col gap-gp-lg">
            <Label>Goal Name</Label>
            <Input size="sm" placeholder="e.g. Take Car, Home Downpayment" />
          </div>
          <div className="grid grid-cols-2 gap-gp-xl">
            <div className="flex flex-col gap-gp-lg">
              <Label>Target Amount</Label>
              <Input size="sm" defaultValue="$15,000" />
            </div>
            <div className="flex flex-col gap-gp-lg">
              <Label>Target Date</Label>
              <Input size="sm" defaultValue="Dec 2025" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="gap-gp-md justify-end">
          <Button color="secondary" variant="ghost" size="sm">Cancel</Button>
          <Button color="primary" variant="filled" size="sm">Create Goal</Button>
        </CardFooter>
      </Card>

      {/* ── 19. Social Links ────────────────────────────────────────────── */}
      <Card>
        <CardHeader><CardTitle>Social Links</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-gp-4xl">
          {[
            { label: "Spotify Artist URL", value: "spotify.com/artist/3j...2k" },
            { label: "Instagram Handle", value: "@julianduryea_music" },
            { label: "SoundCloud URL", value: "" },
            { label: "Website", value: "" },
          ].map(f => (
            <div key={f.label} className="flex flex-col gap-gp-lg">
              <Label>{f.label}</Label>
              <Input size="sm" defaultValue={f.value} placeholder={f.value ? undefined : `https://...`} />
            </div>
          ))}
        </CardContent>
        <CardFooter className="gap-gp-md justify-end">
          <Button color="secondary" variant="ghost" size="sm">Discard</Button>
          <Button color="primary" variant="filled" size="sm">Save Changes</Button>
        </CardFooter>
      </Card>

      {/* ── 20. Notifications ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose what you want to be notified about.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-gp-4xl">
          <label className="flex items-center gap-gp-xl">
            <Checkbox defaultChecked />
            <span className="text-body-md font-medium">Select all</span>
          </label>
          {[
            { label: "Transaction alerts", desc: "Deposits, withdrawals, and transfers.", checked: true },
            { label: "Security alerts", desc: "Login attempts and account changes.", checked: true },
            { label: "Goal milestones", desc: "Updates at 25%, 50%, 75%, and 100%.", checked: false },
            { label: "Market updates", desc: "Daily portfolio summary and price alerts.", checked: false },
          ].map(n => (
            <label key={n.label} className="flex items-start gap-gp-xl">
              <Checkbox defaultChecked={n.checked} className="mt-sp-2xs" />
              <div>
                <p className="text-body-md font-medium">{n.label}</p>
                <p className="text-body-md text-fg-muted">{n.desc}</p>
              </div>
            </label>
          ))}
        </CardContent>
        <CardFooter>
          <Button color="primary" variant="filled" size="sm" fullWidth>Save Preferences</Button>
        </CardFooter>
      </Card>

      {/* ── 21. Connect Bank ────────────────────────────────────────────── */}
      <Card>
        <CardContent className="flex flex-col items-center text-center">
          <p className="text-title-md font-medium">Connect Bank</p>
          <p className="text-body-md text-fg-muted mt-gp-lg">Link your payout method to receive monthly royalty distributions automatically.</p>
          <div className="mt-gp-3xl"><Button color="primary" variant="filled" size="sm">Set Up Payouts</Button></div>
        </CardContent>
      </Card>

      {/* ── 22. Explore Catalog ─────────────────────────────────────────── */}
      <Card>
        <CardContent className="flex flex-col items-center text-center">
          <span className="text-[2rem]">✦</span>
          <p className="text-body-md text-fg-muted mt-gp-4xl">Check your ISRC codes, metadata, and visual assets before going live.</p>
          <div className="mt-gp-3xl"><Button color="primary" variant="filled" size="sm">View Catalog</Button></div>
        </CardContent>
      </Card>

      {/* ── 23. Power Usage ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Power Usage</CardTitle>
          <CardDescription>Whole Home</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-gp-4xl">
          {/* Chart — 2x maior */}
          <div className="flex flex-col">
            <div className="h-36 w-full flex items-end gap-gp-md">
              {[20, 35, 40, 38, 42, 50, 45, 55].map((v, i) => (
                <div key={i} className="flex-1 bg-bg-warning rounded-t-radius-md" style={{ height: `${v * 1.6}%` }} />
              ))}
            </div>
            <div className="flex mt-gp-md">
              {["6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p"].map(t => (
                <span key={t} className="flex-1 text-center text-caption-sm text-fg-muted">{t}</span>
              ))}
            </div>
          </div>
          {/* Stats — 2 cards lado a lado */}
          <div className="grid grid-cols-2 gap-gp-md">
            <div className="bg-bg-muted border border-transparent rounded-radius-lg p-pad-2xl">
              <p className="text-caption-sm text-fg-muted">Currently Using</p>
              <p className="text-title-lg font-semibold">3.4 kW</p>
            </div>
            <div className="bg-bg-muted border border-transparent rounded-radius-lg p-pad-2xl">
              <p className="text-caption-sm text-fg-muted">Solar Gen</p>
              <p className="text-title-lg font-semibold text-fg-success">+1.2 kW</p>
            </div>
          </div>
          {/* Battery Level — primary */}
          <div>
            <p className="text-body-md text-fg-muted mb-gp-md">Battery Level</p>
            <div className="flex items-center gap-gp-xl">
              <Progress value={85} className="flex-1" />
              <span className="text-body-md font-medium tabular-nums">85%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 24. Living Room ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Living Room</CardTitle>
          <CardDescription>Roller Shades</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-gp-4xl">
          <div className="h-24 rounded-radius-xl bg-bg-muted" />
          <div className="flex items-center justify-between text-body-md text-fg-muted">
            <span>OPEN</span>
            <div className="flex-1 mx-3"><Slider defaultValue={[50]} /></div>
            <span>CLOSE</span>
          </div>
          <div className="grid grid-cols-3 gap-gp-xl">
            {["Open", "Half", "Closed"].map(s => (
              <Button key={s} color="secondary" variant="outline" size="sm" className="w-full">{s}</Button>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
