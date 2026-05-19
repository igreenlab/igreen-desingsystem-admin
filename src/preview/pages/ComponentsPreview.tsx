import { useState } from "react";
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
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "../../components/shadcn/breadcrumb";
import { Calendar } from "../../components/shadcn/calendar";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/shadcn/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/shadcn/card";
import { Alert, AlertTitle, AlertDescription } from "../../components/shadcn/alert";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/shadcn/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "../../components/shadcn/dropdown-menu";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut } from "../../components/shadcn/command";
import { MenuSidebar } from "../../components/ui/MenuSidebar";
import type { SidebarContext } from "../../components/ui/MenuSidebar";
import { AlertCircle, ChevronDown, User, Settings, LogOut, Inbox, Contact, Megaphone, Brain, ListOrdered, LayoutGrid, Target, Trophy, PanelLeftClose, PanelLeftOpen, Search, Plus, Calculator, Smile, CreditCard } from "lucide-react";

const SIDEBAR_DEMO_CONTEXTS: SidebarContext[] = [
  {
    id: "inbox",
    label: "Inbox / Operação",
    icon: Inbox,
    items: [
      { name: "Atendimentos", icon: Inbox, href: "#sb-at", badge: "12", badgeKind: "counter" },
      { name: "Filas", icon: ListOrdered, href: "#sb-filas", badge: "3" },
      { name: "Dashboards", icon: LayoutGrid, href: "#sb-dash" },
      {
        name: "Escalation",
        icon: AlertCircle,
        subitems: [
          { name: "Dashboard", href: "#sb-esc-dash" },
          { name: "Departamentos", href: "#sb-esc-deps" },
        ],
      },
    ],
    sections: [
      {
        id: "filtros",
        label: "Filtros rápidos",
        variant: "bookmark",
        items: [
          { color: "#1cb280", name: "Royais — In progress" },
          { color: "#f6b51e", name: "Licenciados — Waiting" },
          { color: "#ef4444", name: "SLA crítico" },
        ],
      },
    ],
  },
  { id: "crm", label: "CRM", icon: Contact, items: [
    { name: "Contatos", icon: Contact, href: "#sb-contatos", badge: "2.1k" },
    { name: "Segmentos", icon: Target, href: "#sb-seg" },
    { name: "Tiers", icon: Trophy, href: "#sb-tiers" },
  ]},
  { id: "eng", label: "Engajamento", icon: Megaphone, items: [
    { name: "Campanhas", icon: Megaphone, href: "#sb-camp", badge: "6" },
  ]},
  { id: "ia", label: "IA — Sol", icon: Brain, items: [
    { name: "Sol Traces", icon: Brain, href: "#sb-sol" },
  ]},
];

/* ═══════════════════════════════════════════════════════════════════════════
   Components Preview — Todos os componentes do DS com exemplos
   ═══════════════════════════════════════════════════════════════════════════ */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-gp-2xl">
      <h2 className="text-title-lg font-semibold text-fg-default">{title}</h2>
      <div className="flex flex-col gap-gp-2xl">{children}</div>
    </div>
  );
}

function Example({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-gp-lg">
      {label && <p className="text-body-xs text-fg-muted uppercase tracking-wider">{label}</p>}
      <div>{children}</div>
    </div>
  );
}

export function ComponentsPreview() {
  const [progress, setProgress] = useState(60);
  const [sliderVal, setSliderVal] = useState([50]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <div className="p-pad-4xl max-w-4xl mx-auto flex flex-col gap-gp-7xl">
      <div>
        <h1 className="text-heading-xs font-semibold text-fg-default">Components</h1>
        <p className="text-body-lg text-fg-muted mt-gp-xs">Todos os componentes do iGreen DS.</p>
      </div>

      {/* ── Button ──────────────────────────────────────────────────────── */}
      <Section title="Button">
        <Example label="Colors × Variants">
          <div className="flex flex-wrap gap-gp-lg">
            <Button color="primary" variant="filled" size="sm">Primary</Button>
            <Button color="secondary" variant="filled" size="sm">Secondary</Button>
            <Button color="critical" variant="filled" size="sm">Critical</Button>
            <Button color="success" variant="filled" size="sm">Success</Button>
            <Button color="warning" variant="filled" size="sm">Warning</Button>
          </div>
        </Example>
        <Example label="Variants">
          <div className="flex flex-wrap gap-gp-lg">
            <Button color="primary" variant="filled" size="sm">Filled</Button>
            <Button color="primary" variant="outline" size="sm">Outline</Button>
            <Button color="primary" variant="soft" size="sm">Soft</Button>
            <Button color="primary" variant="ghost" size="sm">Ghost</Button>
          </div>
        </Example>
        <Example label="Sizes">
          <div className="flex items-center gap-gp-lg">
            <Button color="primary" variant="filled" size="md">MD</Button>
            <Button color="primary" variant="filled" size="sm">SM</Button>
            <Button color="primary" variant="filled" size="xs">XS</Button>
            <Button color="primary" variant="filled" size="2xs">XXS</Button>
            <Button color="secondary" variant="soft" size="icon-md">✕</Button>
            <Button color="secondary" variant="soft" size="icon-sm">✕</Button>
            <Button color="secondary" variant="soft" size="icon-xs">✕</Button>
          </div>
        </Example>
        <Example label="States">
          <div className="flex items-center gap-gp-lg">
            <Button color="primary" variant="filled" size="sm">Default</Button>
            <Button color="primary" variant="filled" size="sm" disabled>Disabled</Button>
            <Button color="primary" variant="filled" size="sm" loading>Loading</Button>
          </div>
        </Example>
      </Section>

      <Separator />

      {/* ── Input ───────────────────────────────────────────────────────── */}
      <Section title="Input">
        <Example label="Sizes">
          <div className="flex flex-col gap-gp-lg max-w-sm">
            <Input size="md" placeholder="Size MD" />
            <Input size="sm" placeholder="Size SM" />
            <Input size="xs" placeholder="Size XS" />
            <Input size="xxs" placeholder="Size XXS" />
          </div>
        </Example>
        <Example label="States">
          <div className="flex flex-col gap-gp-lg max-w-sm">
            <Input size="sm" placeholder="Default" />
            <Input size="sm" defaultValue="With value" />
            <Input size="sm" placeholder="Disabled" disabled />
            <Input size="sm" type="password" defaultValue="secret" />
          </div>
        </Example>
      </Section>

      <Separator />

      {/* ── Label ───────────────────────────────────────────────────────── */}
      <Section title="Label">
        <Example>
          <div className="flex flex-col gap-gp-lg max-w-sm">
            <Label>Email Address</Label>
            <Input size="sm" placeholder="you@example.com" />
          </div>
        </Example>
      </Section>

      <Separator />

      {/* ── Textarea ────────────────────────────────────────────────────── */}
      <Section title="Textarea">
        <Example>
          <div className="max-w-sm">
            <Textarea placeholder="Write your message here..." />
          </div>
        </Example>
      </Section>

      <Separator />

      {/* ── Select ──────────────────────────────────────────────────────── */}
      <Section title="Select">
        <Example>
          <div className="max-w-sm">
            <Select defaultValue="react">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="react">React</SelectItem>
                <SelectItem value="vue">Vue</SelectItem>
                <SelectItem value="svelte">Svelte</SelectItem>
                <SelectItem value="angular">Angular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Example>
      </Section>

      <Separator />

      {/* ── Badge ───────────────────────────────────────────────────────── */}
      <Section title="Badge">
        <Example label="Colors × Variants">
          <div className="flex flex-wrap gap-gp-lg">
            {(["primary", "secondary", "critical", "success", "warning"] as const).map(c => (
              <div key={c} className="flex gap-gp-xs">
                <Badge color={c} variant="solid" size="sm">{c}</Badge>
                <Badge color={c} variant="outline" size="sm">{c}</Badge>
                <Badge color={c} variant="soft" size="sm">{c}</Badge>
              </div>
            ))}
          </div>
        </Example>
        <Example label="Sizes">
          <div className="flex items-center gap-gp-lg">
            <Badge color="primary" variant="solid" size="sm">SM</Badge>
            <Badge color="primary" variant="solid" size="md">MD</Badge>
            <Badge color="primary" variant="solid" size="lg">LG</Badge>
          </div>
        </Example>
      </Section>

      <Separator />

      {/* ── Switch ──────────────────────────────────────────────────────── */}
      <Section title="Switch">
        <Example>
          <div className="flex items-center gap-gp-4xl">
            <div className="flex items-center gap-gp-xl">
              <Switch defaultChecked />
              <span className="text-body-md">Enabled</span>
            </div>
            <div className="flex items-center gap-gp-xl">
              <Switch />
              <span className="text-body-md">Disabled</span>
            </div>
          </div>
        </Example>
      </Section>

      <Separator />

      {/* ── Checkbox ────────────────────────────────────────────────────── */}
      <Section title="Checkbox">
        <Example>
          <div className="flex flex-col gap-gp-xl">
            <label className="flex items-center gap-gp-xl">
              <Checkbox defaultChecked /> <span className="text-body-md">Checked</span>
            </label>
            <label className="flex items-center gap-gp-xl">
              <Checkbox /> <span className="text-body-md">Unchecked</span>
            </label>
            <label className="flex items-center gap-gp-xl">
              <Checkbox disabled /> <span className="text-body-md text-fg-muted">Disabled</span>
            </label>
          </div>
        </Example>
      </Section>

      <Separator />

      {/* ── Radio Group ─────────────────────────────────────────────────── */}
      <Section title="Radio Group">
        <Example>
          <RadioGroup defaultValue="option-1">
            <label className="flex items-center gap-gp-xl">
              <RadioGroupItem value="option-1" /> <span className="text-body-md">Option 1</span>
            </label>
            <label className="flex items-center gap-gp-xl">
              <RadioGroupItem value="option-2" /> <span className="text-body-md">Option 2</span>
            </label>
            <label className="flex items-center gap-gp-xl">
              <RadioGroupItem value="option-3" /> <span className="text-body-md">Option 3</span>
            </label>
          </RadioGroup>
        </Example>
      </Section>

      <Separator />

      {/* ── Slider ──────────────────────────────────────────────────────── */}
      <Section title="Slider">
        <Example>
          <div className="max-w-sm flex flex-col gap-gp-lg">
            <Slider value={sliderVal} onValueChange={setSliderVal} />
            <p className="text-body-md text-fg-muted">Value: {sliderVal[0]}</p>
          </div>
        </Example>
      </Section>

      <Separator />

      {/* ── Progress ────────────────────────────────────────────────────── */}
      <Section title="Progress">
        <Example>
          <div className="max-w-sm flex flex-col gap-gp-lg">
            <Progress value={progress} />
            <div className="flex gap-gp-lg">
              <Button color="secondary" variant="outline" size="2xs" onClick={() => setProgress(Math.max(0, progress - 10))}>-10</Button>
              <span className="text-body-md text-fg-muted">{progress}%</span>
              <Button color="secondary" variant="outline" size="2xs" onClick={() => setProgress(Math.min(100, progress + 10))}>+10</Button>
            </div>
          </div>
        </Example>
      </Section>

      <Separator />

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <Section title="Tabs">
        <Example>
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Account</TabsTrigger>
              <TabsTrigger value="tab2">Password</TabsTrigger>
              <TabsTrigger value="tab3">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1"><p className="text-body-md text-fg-muted py-pad-2xl">Account settings content.</p></TabsContent>
            <TabsContent value="tab2"><p className="text-body-md text-fg-muted py-pad-2xl">Password settings content.</p></TabsContent>
            <TabsContent value="tab3"><p className="text-body-md text-fg-muted py-pad-2xl">General settings content.</p></TabsContent>
          </Tabs>
        </Example>
      </Section>

      <Separator />

      {/* ── Card ────────────────────────────────────────────────────────── */}
      <Section title="Card">
        <Example>
          <div className="max-w-sm">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-md text-fg-muted">Card content with some text.</p>
              </CardContent>
              <CardFooter>
                <Button color="primary" variant="filled" size="sm">Action</Button>
              </CardFooter>
            </Card>
          </div>
        </Example>
      </Section>

      <Separator />

      {/* ── Accordion ───────────────────────────────────────────────────── */}
      <Section title="Accordion">
        <Example>
          <div className="max-w-lg">
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Is it styled?</AccordionTrigger>
                <AccordionContent>Yes. It comes with default styles using iGreen DS tokens.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is it animated?</AccordionTrigger>
                <AccordionContent>Yes. It uses CSS animations for smooth expand/collapse.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Example>
      </Section>

      <Separator />

      {/* ── Alert ───────────────────────────────────────────────────────── */}
      <Section title="Alert">
        <Example>
          <div className="flex flex-col gap-gp-2xl max-w-lg">
            <Alert>
              <AlertTitle>Default alert</AlertTitle>
              <AlertDescription>This is an informational alert message.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Something went wrong. Please try again.</AlertDescription>
            </Alert>
          </div>
        </Example>
      </Section>

      <Separator />

      {/* ── Dialog ──────────────────────────────────────────────────────── */}
      <Section title="Dialog">
        <Example>
          <Dialog>
            <DialogTrigger asChild>
              <Button color="secondary" variant="outline" size="sm">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
                <DialogDescription>This is a description of the dialog content.</DialogDescription>
              </DialogHeader>
              <p className="text-body-md text-fg-muted">Dialog body content goes here.</p>
              <DialogFooter>
                <Button color="secondary" variant="ghost" size="sm">Cancel</Button>
                <Button color="primary" variant="filled" size="sm">Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Example>
      </Section>

      <Separator />

      {/* ── Dropdown Menu ───────────────────────────────────────────────── */}
      <Section title="Dropdown Menu">
        <Example>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button color="secondary" variant="outline" size="sm">
                Open Menu <ChevronDown className="size-4 ml-gp-xs" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><User className="size-4" /> Profile</DropdownMenuItem>
              <DropdownMenuItem><Settings className="size-4" /> Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem><LogOut className="size-4" /> Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Example>
      </Section>

      <Separator />

      {/* ── Separator ───────────────────────────────────────────────────── */}
      <Section title="Separator">
        <Example>
          <div className="flex flex-col gap-gp-2xl">
            <p className="text-body-md">Content above</p>
            <Separator />
            <p className="text-body-md">Content below</p>
          </div>
        </Example>
      </Section>

      <Separator />

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <Section title="Breadcrumb">
        <Example>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="#">Products</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Details</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Example>
      </Section>

      <Separator />

      {/* ── Avatar ──────────────────────────────────────────────────────── */}
      <Section title="Avatar">
        <Example>
          <div className="flex items-center gap-gp-2xl">
            <Avatar className="size-8"><AvatarFallback>JD</AvatarFallback></Avatar>
            <Avatar className="size-10"><AvatarFallback>AB</AvatarFallback></Avatar>
            <Avatar className="size-12"><AvatarFallback>CD</AvatarFallback></Avatar>
            <Avatar className="size-14"><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>CN</AvatarFallback></Avatar>
          </div>
        </Example>
      </Section>

      <Separator />

      {/* ── Calendar ────────────────────────────────────────────────────── */}
      <Section title="Calendar">
        <Example>
          <div className="max-w-sm border border-border-subtle rounded-radius-base p-pad-4xl">
            <Calendar mode="single" selected={new Date()} className="w-full" />
          </div>
        </Example>
      </Section>

      <Separator />

      {/* ── Command (search palette) ────────────────────────────────────── */}
      <Section title="Command">
        <Example label="Command palette (⌘K)">
          <div className="flex flex-col gap-gp-xl max-w-md">
            <Button
              color="secondary"
              variant="outline"
              size="sm"
              iconLeft={<Search className="size-4" />}
              onClick={() => setCommandOpen(true)}
            >
              Abrir command palette
            </Button>
            <p className="text-body-md text-fg-muted">
              Em apps reais, o trigger é tipicamente um fake input no header (ver Header template).
            </p>
            <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
              <CommandInput placeholder="Digite um comando ou busque..." />
              <CommandList>
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                <CommandGroup heading="Sugestões">
                  <CommandItem onSelect={() => setCommandOpen(false)}>
                    <Calculator />
                    <span>Calculadora</span>
                  </CommandItem>
                  <CommandItem onSelect={() => setCommandOpen(false)}>
                    <Smile />
                    <span>Buscar emoji</span>
                  </CommandItem>
                  <CommandItem onSelect={() => setCommandOpen(false)}>
                    <CreditCard />
                    <span>Faturamento</span>
                    <CommandShortcut>⌘B</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Configurações">
                  <CommandItem onSelect={() => setCommandOpen(false)}>
                    <User />
                    <span>Perfil</span>
                    <CommandShortcut>⌘P</CommandShortcut>
                  </CommandItem>
                  <CommandItem onSelect={() => setCommandOpen(false)}>
                    <Settings />
                    <span>Configurações</span>
                    <CommandShortcut>⌘S</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </CommandDialog>
          </div>
        </Example>
      </Section>

      <Separator />

      {/* ── MenuSidebar ─────────────────────────────────────────────────── */}
      <Section title="MenuSidebar">
        <Example label="Interactive — toggle collapse">
          <div className="flex flex-col gap-gp-xl">
            <div>
              <Button
                color="secondary"
                variant="outline"
                size="sm"
                iconLeft={sidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
                onClick={() => setSidebarCollapsed((c) => !c)}
              >
                {sidebarCollapsed ? "Expandir panel" : "Colapsar panel"}
              </Button>
            </div>
            <div className="h-[560px] w-full rounded-radius-base ring-1 ring-border-subtle overflow-hidden bg-bg-canvas">
              <MenuSidebar
                contexts={SIDEBAR_DEMO_CONTEXTS}
                defaultActiveContextId="inbox"
                defaultActiveItemHref="#sb-at"
                panelCollapsed={sidebarCollapsed}
                onPanelCollapseChange={setSidebarCollapsed}
              />
            </div>
          </div>
        </Example>
        <Example label="Rail-only (default collapsed — hover to expand)">
          <div className="h-[560px] w-full rounded-radius-base ring-1 ring-border-subtle overflow-hidden bg-bg-canvas">
            <MenuSidebar
              contexts={SIDEBAR_DEMO_CONTEXTS}
              defaultActiveContextId="crm"
              defaultPanelCollapsed
            />
          </div>
        </Example>
      </Section>

    </div>
  );
}
