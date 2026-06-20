import { useState } from "react";
import {
  Building2,
  Layers,
  LoaderCircle,
  MapPin,
  Pencil,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { List, type ListGroup, type ListItemData } from "../../components/ui/List";
import { Button } from "../../components/ui/Button";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

const TOC = [
  { id: "construcao", label: "Construção" },
  { id: "examples", label: "Examples" },
  { id: "ex-standard", label: "Standard" },
  { id: "ex-grouped", label: "Grouped + DnD" },
  { id: "ex-hierarchical", label: "Hierarchical" },
  { id: "ex-variacoes", label: "Variações" },
  { id: "ex-rich-card", label: "Card rico" },
  { id: "api", label: "API Reference" },
];

/* ── helpers visuais ───────────────────────────────────────────── */

function Avatar({ children }: { children?: React.ReactNode }) {
  return (
    <span className="grid size-form-md place-items-center rounded-radius-full bg-bg-muted text-fg-muted [&>svg]:size-icon-sm">
      {children ?? <User />}
    </span>
  );
}

function IconChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid size-form-md place-items-center rounded-radius-md bg-bg-brand-subtle text-fg-brand [&>svg]:size-icon-sm">
      {children}
    </span>
  );
}

function StatusDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-gp-xs text-body-sm text-fg-default">
      <span className="size-[8px] rounded-radius-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function CountBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-gp-2xs rounded-radius-sm bg-bg-muted px-pad-md py-[2px] text-caption-sm text-fg-muted [&>svg]:size-[12px]">
      <Users /> {n}
    </span>
  );
}

function Parent({ tone, label, n }: { tone: "brand" | "warning"; label: string; n: number }) {
  return (
    <span className="flex items-center gap-gp-md">
      <Tag tone={tone}>{label}</Tag>
      <CountBadge n={n} />
    </span>
  );
}

function Tag({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "brand" | "warning" }) {
  const map = {
    muted: "bg-bg-muted text-fg-muted",
    brand: "bg-bg-brand-subtle text-fg-brand",
    warning: "bg-bg-warning-muted text-fg-warning",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-radius-sm px-pad-md py-[2px] text-caption-sm font-semibold uppercase tracking-wider ${map[tone]}`}>
      {children}
    </span>
  );
}

/* ── helpers do card rico (variação renderItem) ────────────────── */

type OrderStatus = "progress" | "exception" | "draft" | "late";

function StatusPill({ status }: { status: OrderStatus }) {
  const map = {
    progress: { label: "Em progresso", cls: "bg-bg-info-muted text-fg-info" },
    exception: { label: "Exceção", cls: "bg-bg-warning-muted text-fg-warning" },
    draft: { label: "Rascunho", cls: "bg-bg-muted text-fg-muted" },
    late: { label: "Atrasado", cls: "bg-bg-danger-muted text-fg-danger" },
  } as const;
  const v = map[status];
  return (
    <span className={`inline-flex items-center rounded-radius-full px-pad-md py-[2px] text-caption-sm font-semibold ${v.cls}`}>
      {v.label}
    </span>
  );
}

function AvatarStack({ n }: { n: number }) {
  return (
    <span className="flex shrink-0 items-center">
      {Array.from({ length: Math.min(n, 3) }).map((_, i) => (
        <span
          key={i}
          className="grid size-[24px] place-items-center rounded-radius-full border-2 border-bg-surface bg-bg-muted text-fg-muted [&>svg]:size-[12px] -ml-pad-sm first:ml-0"
        >
          <User />
        </span>
      ))}
    </span>
  );
}

function MetaInline({ icon, value }: { icon: React.ReactNode; value: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-gp-xs text-body-sm text-fg-muted [&>svg]:size-icon-sm [&>svg]:text-fg-subtle">
      {icon}
      {value}
    </span>
  );
}

type OrderData = {
  code: string; name: string; status: OrderStatus; people: number;
  manufacturer: string; country: string; owner: string; category: string;
  stage: string; done: number; total: number; updated: string;
};

const ORDERS: ListItemData[] = [
  { id: "o1", title: "Summer Linen Jacket SS22", data: {
    code: "80149", name: "Summer Linen Jacket SS22", status: "progress", people: 3,
    manufacturer: "Bozkurt Konfeksiyon", country: "Turquia", owner: "Stephanie Carvalho", category: "Jaquetas",
    stage: "Pré-produção", done: 2, total: 11, updated: "há 4 dias" } satisfies OrderData },
  { id: "o2", title: "Tapered-Fit Jeans - AW", data: {
    code: "79998", name: "Tapered-Fit Jeans - AW", status: "exception", people: 3,
    manufacturer: "Taian Hongbang", country: "Índia", owner: "Kathaleen Marrlow", category: "Jeans",
    stage: "Controle de qualidade", done: 6, total: 10, updated: "há 2 dias" } satisfies OrderData },
  { id: "o3", title: "Thermo-Sealed Parka - AW22", data: {
    code: "79948", name: "Thermo-Sealed Parka - AW22", status: "draft", people: 2,
    manufacturer: "Bozkurt Konfeksiyon", country: "China", owner: "Sebastian Petravic", category: "Jaquetas",
    stage: "Preparação do pedido", done: 1, total: 9, updated: "há 1 semana" } satisfies OrderData },
];

function renderOrderCard(item: ListItemData) {
  const o = item.data as OrderData;
  return (
    <div className="flex w-full flex-col gap-gp-md">
      {/* row 1 — id + nome + status · avatares à direita */}
      <div className="flex items-start gap-gp-md">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-gp-md">
          <span className="text-body-md font-semibold text-fg-default">
            <span className="text-fg-muted">#{o.code}</span> — {o.name}
          </span>
          <StatusPill status={o.status} />
        </div>
        <AvatarStack n={o.people} />
      </div>
      {/* row 2 — meta com ícones */}
      <div className="flex flex-wrap items-center gap-x-gp-2xl gap-y-gp-xs">
        <MetaInline icon={<Building2 />} value={o.manufacturer} />
        <MetaInline icon={<MapPin />} value={o.country} />
        <MetaInline icon={<User />} value={o.owner} />
        <MetaInline icon={<Layers />} value={o.category} />
      </div>
      {/* footer — divider + progresso + data */}
      <div className="flex flex-wrap items-center gap-x-gp-md gap-y-gp-xs border-t border-border-subtle pt-pad-md">
        <LoaderCircle className="size-icon-sm shrink-0 animate-spin text-fg-brand" />
        <span className="text-body-sm font-medium text-fg-default">
          {o.stage} <span className="text-fg-muted">({o.done}/{o.total})</span>
        </span>
        <span className="text-body-sm text-fg-subtle">atualizado {o.updated}</span>
      </div>
    </div>
  );
}

/* ── 1. STANDARD — Team Members (meta em colunas) ──────────────── */

const TEAM: ListItemData[] = [
  { id: "alice", leading: <Avatar />, title: "Alice Smith", subtitle: "alice@example.com",
    meta: [
      { label: "Role", value: <StatusDot color="var(--color-fg-success)" label="Admin" /> },
      { label: "Status", value: <StatusDot color="var(--color-fg-success)" label="Active" /> },
      { label: "Last seen", value: "2 min atrás", align: "end" },
    ] },
  { id: "bob", leading: <Avatar />, title: "Bob Jones", subtitle: "bob@example.com",
    meta: [
      { label: "Role", value: "Editor" },
      { label: "Status", value: <StatusDot color="var(--color-fg-success)" label="Active" /> },
      { label: "Last seen", value: "1 hora atrás", align: "end" },
    ] },
  { id: "charlie", leading: <Avatar />, title: "Charlie Davis", subtitle: "charlie@example.com",
    meta: [
      { label: "Role", value: "Viewer" },
      { label: "Status", value: <StatusDot color="var(--color-fg-warning)" label="Pending" /> },
      { label: "Last seen", value: "Nunca", align: "end" },
    ] },
  { id: "diana", leading: <Avatar />, title: "Diana Prince", subtitle: "diana@example.com",
    meta: [
      { label: "Role", value: "Editor" },
      { label: "Status", value: <StatusDot color="var(--color-fg-subtle)" label="Inativo" /> },
      { label: "Last seen", value: "2 dias atrás", align: "end" },
    ] },
];

/* ── 2. GROUPED — Tarefas com DnD (stateful) ───────────────────── */

const TASK_GROUPS: ListGroup[] = [
  { id: "todo", label: "To Do", color: "var(--color-fg-muted)" },
  { id: "doing", label: "In Progress", color: "var(--color-fg-info)" },
  { id: "done", label: "Done", color: "var(--color-fg-success)" },
];

const INITIAL_TASKS: ListItemData[] = [
  { id: "t1", groupId: "todo", title: "Atualizar tokens de cor", description: "Sincronizar HSL no Figma.",
    trailing: <Tag tone="warning">Medium</Tag> },
  { id: "t2", groupId: "todo", title: "Auditar raios dos botões", description: "Garantir radius consistente.",
    trailing: <Tag tone="warning">Urgent</Tag> },
  { id: "t3", groupId: "doing", title: "Implementar grouped list", description: "Lista vertical com drag and drop.",
    trailing: <Tag tone="brand">Em progresso</Tag> },
  { id: "t4", groupId: "done", title: "Revisão de tipografia", description: "Conferir letter-spacing.",
    trailing: <Tag>Low</Tag> },
  { id: "t5", groupId: "done", title: "Atualizar readmes", description: "Documentar usos de componentes.",
    trailing: <Tag>Low</Tag> },
];

function GroupedTasksDemo() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const handleMove = (id: string, _from: string, to: string, toIndex: number) => {
    setTasks((prev) => {
      const moved = prev.find((t) => t.id === id);
      if (!moved) return prev;
      const without = prev.filter((t) => t.id !== id);
      const destItems = without.filter((t) => t.groupId === to);
      const updated = { ...moved, groupId: to };
      const target = destItems[toIndex];
      const insertAt = target ? without.indexOf(target) : without.length;
      const next = [...without];
      next.splice(insertAt, 0, updated);
      return next;
    });
  };

  return (
    <List
      layout="grouped"
      items={tasks}
      groups={TASK_GROUPS}
      groupSurface
      enableDnD
      onMove={handleMove}
      getMenuItems={(item) => [
        { label: "Editar", icon: <Pencil />, onClick: () => {} },
        { separator: true },
        { label: "Excluir", icon: <Trash2 />, destructive: true, onClick: () => {} },
      ]}
    />
  );
}

/* ── 3. HIERARCHICAL — Organização (tree-as-list) ──────────────── */

const ORG: ListItemData[] = [
  {
    id: "acme", leading: <IconChip><Building2 /></IconChip>, title: "Acme Corp", subtitle: "admin@acme.com",
    trailing: <Parent tone="brand" label="Enterprise" n={2} />,
    children: [
      {
        id: "sarah", leading: <Avatar />, title: "Sarah Connor", subtitle: "sarah@acme.com",
        trailing: <Parent tone="warning" label="Pro" n={2} />,
        children: [
          { id: "john", leading: <Avatar />, title: "John Doe", subtitle: "john@acme.com", trailing: <Tag>Free</Tag> },
          { id: "jane", leading: <Avatar />, title: "Jane Smith", subtitle: "jane@acme.com", trailing: <Tag>Free</Tag> },
        ],
      },
      { id: "kyle", leading: <Avatar />, title: "Kyle Reese", subtitle: "kyle@acme.com", trailing: <Tag tone="warning">Pro</Tag> },
    ],
  },
  {
    id: "cyber", leading: <IconChip><Building2 /></IconChip>, title: "Cyberdyne Systems", subtitle: "hello@cyberdyne.com",
    trailing: <Parent tone="brand" label="Enterprise" n={1} />,
    children: [
      { id: "miles", leading: <Avatar />, title: "Miles Dyson", subtitle: "miles@cyberdyne.com", trailing: <Tag tone="warning">Pro</Tag> },
    ],
  },
];

/* ── Variações: seleção ────────────────────────────────────────── */

function SelectableDemo() {
  const [selected, setSelected] = useState<Set<string>>(new Set(["bob"]));
  return (
    <div className="flex flex-col gap-gp-md">
      <span className="text-body-sm text-fg-muted">{selected.size} selecionado(s)</span>
      <List
        items={TEAM}
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        onItemClick={() => {}}
      />
    </div>
  );
}

export function ListDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="List"
        description="Primitivo de listagem em cards (cada row é um card). 3 layouts: standard (plano), grouped (seções + drag-and-drop) e hierarchical (árvore-como-lista colapsável com conectores). Conteúdo via slots (leading/title/subtitle/description/meta/trailing) ou renderItem. DnD com física natural de lista (@hello-pangea/dnd). Burro como o Table — a versão com toolbar/busca/filtros (DataList) vem no passo 2."
        dependency="@hello-pangea/dnd"
      />
      <DocSeparator />

      <SectionH2 id="construcao" title="Construção" />
      <p className="mb-gp-lg text-body-md text-fg-muted">
        Monte com <code className="text-fg-default">{"<List items={...} />"}</code>. O estado de UI
        (seleção, colapso, ordem) é controlado/não-controlado; DnD via <code className="text-fg-default">enableDnD</code> + callbacks
        (consumer faz o commit, como no Kanban).
      </p>

      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-standard"
        title="Standard"
        description="Lista plana. Cada card tem leading + título/subtítulo + meta em colunas (Role/Status/Last seen) + menu. Click no card abre detalhe (onItemClick)."
        code={`<List
  items={team}
  onItemClick={(id) => open(id)}
  getMenuItems={(item) => [{ label: "Editar", onClick }]}
/>`}
      >
        <List
          items={TEAM}
          onItemClick={() => {}}
          getMenuItems={(item) => [
            { label: "Editar", icon: <Pencil />, onClick: () => {} },
            { separator: true },
            { label: "Remover", icon: <Trash2 />, destructive: true, onClick: () => {} },
          ]}
        />
      </ExampleSection>

      <ExampleSection
        id="ex-grouped"
        title="Grouped + Drag and Drop"
        description="Seções colapsáveis por status. Arraste cards (handle aparece no hover) entre grupos e reordene dentro. O consumer commita no onMove."
        code={`<List
  layout="grouped"
  items={tasks}
  groups={[{ id: "todo", label: "To Do" }, ...]}
  enableDnD
  onMove={(id, from, to, toIndex) => commit(...)}
/>`}
      >
        <GroupedTasksDemo />
      </ExampleSection>

      <ExampleSection
        id="ex-hierarchical"
        title="Hierarchical"
        description="Árvore-como-lista: níveis e subníveis colapsáveis com linhas de conexão. Entidades mistas por nível (empresa → manager → usuário). Clique no chevron pra expandir/recolher."
        code={`<List
  layout="hierarchical"
  items={org}                 // itens com children aninhados
  defaultExpandedIds={new Set(["acme", "sarah"])}
/>`}
      >
        <List
          layout="hierarchical"
          items={ORG}
          defaultExpandedIds={new Set(["acme", "sarah", "cyber"])}
          getMenuItems={() => [{ label: "Ver perfil", icon: <User /> }]}
        />
      </ExampleSection>

      <SectionH2 id="ex-variacoes" title="Variações" />

      <ExampleSection
        id="ex-selectable"
        title="Selecionável"
        description="selectable mostra checkbox por card; estado controlado via selectedIds + onSelectionChange (a base pro bulk no DataList)."
        code={`<List items={team} selectable selectedIds={set} onSelectionChange={setSet} />`}
      >
        <SelectableDemo />
      </ExampleSection>

      <ExampleSection
        id="ex-compact"
        title="Densidade compacta"
        description="density='compact' reduz o gap vertical entre cards."
        code={`<List items={team} density="compact" />`}
      >
        <List items={TEAM} density="compact" />
      </ExampleSection>

      <ExampleSection
        id="ex-states"
        title="Estados (loading / vazio)"
        description="loading mostra skeletons; sem itens mostra o emptyState."
        code={`<List items={[]} loading />
<List items={[]} emptyState={<Empty />} />`}
      >
        <div className="grid gap-gp-2xl md:grid-cols-2">
          <List items={[]} loading skeletonCount={3} />
          <List items={[]} />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-rich-card"
        title="Card rico (renderItem)"
        description="Variação de layout via renderItem: row de título + id + status e avatares à direita; row de meta com ícone+valor; footer com divider, progresso e data. O wrapper (card, hover, click) continua do List."
        code={`<List
  items={orders}
  onItemClick={open}
  renderItem={(item) => <OrderCard order={item.data} />}
/>`}
      >
        <List items={ORDERS} onItemClick={() => {}} renderItem={renderOrderCard} />
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable
        items={[
          { name: "layout", type: '"standard" | "grouped" | "hierarchical"', defaultVal: '"standard"' },
          { name: "items", type: "ListItemData[] (children aninhados na hierarquia)", defaultVal: "—" },
          { name: "groups", type: "ListGroup[] (layout grouped)", defaultVal: "—" },
          { name: "groupSurface", type: "painel sutil por grupo (card fino)", defaultVal: "false" },
          { name: "renderItem", type: "(item, state) => ReactNode — override do miolo", defaultVal: "—" },
          { name: "getMenuItems", type: "(item) => ListMenuItem[] — kebab", defaultVal: "—" },
          { name: "onItemClick / openId", type: "click no card / realce 'aberto'", defaultVal: "—" },
          { name: "selectable + selectedIds/defaultSelectedIds/onSelectionChange", type: "seleção (controlado/não-controlado)", defaultVal: "—" },
          { name: "expandedIds/defaultExpandedIds/onExpandedChange", type: "colapso (grupos/hierarquia)", defaultVal: "—" },
          { name: "showConnectors / indentSize", type: "linhas de conexão / indent (px)", defaultVal: "true / 24" },
          { name: "enableDnD + onReorder/onMove", type: "drag-and-drop (standard/grouped)", defaultVal: "false" },
          { name: "loading / skeletonCount / emptyState", type: "estados", defaultVal: "— / 4 / —" },
          { name: "density", type: '"comfortable" | "compact"', defaultVal: '"comfortable"' },
        ]}
      />
    </DocLayout>
  );
}

export default ListDoc;
