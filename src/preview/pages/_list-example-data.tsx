import {
  Building2,
  Layers,
  LoaderCircle,
  MapPin,
  User,
  Users,
} from "lucide-react";
import type { ListGroup, ListItemData } from "../../components/ui/List";
import type { FilterableField, DataListView } from "../../components/ui/DataList";

/* ═══════════════════════════════════════════════════════════════════
   Mocks + helpers compartilhados pelas telas de exemplo do DataList
   (list-standard · list-grouped · list-hierarchical · list-selectable ·
   list-rich). Mesma linguagem visual do ListDoc — extraído pra DRY.
   ═══════════════════════════════════════════════════════════════════ */

/* ── helpers visuais ───────────────────────────────────────────── */

export function Avatar({ children }: { children?: React.ReactNode }) {
  return (
    <span className="grid size-form-md place-items-center rounded-radius-full bg-bg-muted text-fg-muted [&>svg]:size-icon-sm">
      {children ?? <User />}
    </span>
  );
}

export function IconChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid size-form-md place-items-center rounded-radius-md bg-bg-brand-subtle text-fg-brand [&>svg]:size-icon-sm">
      {children}
    </span>
  );
}

export function StatusDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-gp-xs text-body-sm text-fg-default">
      <span className="size-[8px] rounded-radius-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export function Tag({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "brand" | "warning";
}) {
  const map = {
    muted: "bg-bg-muted text-fg-muted",
    brand: "bg-bg-brand-subtle text-fg-brand",
    warning: "bg-bg-warning-muted text-fg-warning",
  } as const;
  return (
    <span
      className={`inline-flex items-center rounded-radius-sm px-pad-md py-[2px] text-caption-sm font-semibold uppercase tracking-wider ${map[tone]}`}
    >
      {children}
    </span>
  );
}

export function CountBadge({ n }: { n: number }) {
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

/* ── tipos / mapas de pessoa ───────────────────────────────────── */

export type Person = { role: string; status: string };

export const ROLE = { admin: "Admin", editor: "Editor", viewer: "Viewer" } as const;
export const STATUS_COLOR: Record<string, string> = {
  active: "var(--color-fg-success)",
  pending: "var(--color-fg-warning)",
  inactive: "var(--color-fg-subtle)",
};
export const STATUS_LABEL: Record<string, string> = {
  active: "Ativo",
  pending: "Pendente",
  inactive: "Inativo",
};

const FIRST = [
  "Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "Gabriel", "Helena",
  "Igor", "Júlia", "Kevin", "Lara", "Marcos", "Nina", "Otávio", "Paula",
  "Rafael", "Sofia", "Tomás", "Vera", "William", "Yara", "Zeca", "Bianca",
];
const LAST = [
  "Smith", "Jones", "Davis", "Prince", "Hunt", "Gallagher", "Moreira", "Costa",
  "Lima", "Souza", "Almeida", "Ferreira", "Rocha", "Pinto", "Barros", "Nunes",
];
const SEEN = ["2 min", "8 min", "1 h", "3 h", "ontem", "2 dias", "1 semana", "—"];

function personItem(
  id: string,
  name: string,
  email: string,
  role: keyof typeof ROLE,
  status: string,
  seen: string,
): ListItemData {
  return {
    id,
    leading: <Avatar />,
    title: name,
    subtitle: email,
    data: { role, status } satisfies Person,
    meta: [
      { label: "Papel", value: ROLE[role] },
      {
        label: "Status",
        value: <StatusDot color={STATUS_COLOR[status]} label={STATUS_LABEL[status]} />,
      },
      { label: "Visto", value: seen, align: "end" },
    ],
  };
}

/** Gera N membros determinísticos (sem Math.random — estável entre renders). */
export function makeTeam(n: number): ListItemData[] {
  const roles = ["admin", "editor", "viewer"] as const;
  const statuses = ["active", "pending", "inactive"];
  return Array.from({ length: n }, (_, i) => {
    const first = FIRST[i % FIRST.length];
    const last = LAST[(i * 7) % LAST.length];
    const name = `${first} ${last}`;
    const email = `${first.toLowerCase()}.${last.toLowerCase()}@example.com`;
    return personItem(
      `u${i}`,
      name,
      email,
      roles[i % 3],
      statuses[(i * 5) % 3],
      SEEN[i % SEEN.length],
    );
  });
}

/** Campos filtráveis Papel / Status (standard + selectable). */
export const PERSON_FILTER_FIELDS: FilterableField[] = [
  {
    id: "role",
    label: "Papel",
    type: "select",
    accessor: (i) => (i.data as Person).role,
    options: [
      { label: "Admin", value: "admin" },
      { label: "Editor", value: "editor" },
      { label: "Viewer", value: "viewer" },
    ],
  },
  {
    id: "status",
    label: "Status",
    type: "select",
    accessor: (i) => (i.data as Person).status,
    options: [
      { label: "Ativo", value: "active" },
      { label: "Pendente", value: "pending" },
      { label: "Inativo", value: "inactive" },
    ],
  },
];

/** Visões (abas) Admins / Ativos. */
export const PERSON_VIEWS: DataListView[] = [
  {
    id: "admins",
    label: "Admins",
    query: {
      search: "",
      filterModel: {
        logicOperator: "AND",
        items: [{ id: "va", field: "role", operator: "equals", value: "admin" }],
      },
    },
  },
  {
    id: "ativos",
    label: "Ativos",
    query: {
      search: "",
      filterModel: {
        logicOperator: "AND",
        items: [{ id: "vs", field: "status", operator: "equals", value: "active" }],
      },
    },
  },
];

/* ── grouped (tarefas) ─────────────────────────────────────────── */

export const TASK_GROUPS: ListGroup[] = [
  { id: "todo", label: "To Do", color: "var(--color-fg-muted)" },
  { id: "doing", label: "In Progress", color: "var(--color-fg-info)" },
  { id: "done", label: "Done", color: "var(--color-fg-success)" },
];

const TASK_TITLES = [
  "Atualizar tokens de cor", "Auditar raios dos botões", "Implementar grouped list",
  "Revisão de tipografia", "Atualizar readmes", "Migrar ícones pro Lucide",
  "Calibrar shadows dark", "Documentar DataList", "Revisar focus rings",
  "Sincronizar Figma", "Testar virtualização", "Ajustar gap de form",
  "Escrever USAGE do Chart", "Refatorar TableToolbar", "Validar dark mode",
  "Empacotar registry", "Bump do CLI", "Revisar lições L-04x",
  "Criar exemplo infinite scroll", "Limpar tokens órfãos", "Auditar contrastes WCAG",
  "Mapear Code Connect", "Revisar drawers", "Polir empty states",
];
const PRIORITY = [
  { tone: "warning" as const, label: "Urgent" },
  { tone: "warning" as const, label: "Medium" },
  { tone: "muted" as const, label: "Low" },
  { tone: "brand" as const, label: "Em progresso" },
];

/** Gera ~24 tarefas distribuídas nos 3 grupos. */
export function makeTasks(): ListItemData[] {
  const groups = ["todo", "todo", "doing", "done", "done"];
  return TASK_TITLES.map((title, i) => {
    const groupId = groups[i % groups.length];
    const prio = groupId === "doing" ? PRIORITY[3] : PRIORITY[i % 3];
    return {
      id: `t${i}`,
      groupId,
      title,
      description: "Tarefa de design system — arraste entre colunas.",
      data: { priority: prio.label },
      trailing: <Tag tone={prio.tone}>{prio.label}</Tag>,
    } satisfies ListItemData;
  });
}

/* ── hierarchical (organização) ────────────────────────────────── */

const COMPANIES = [
  { id: "acme", name: "Acme Corp", plan: "Enterprise" },
  { id: "cyber", name: "Cyberdyne Systems", plan: "Enterprise" },
  { id: "initech", name: "Initech", plan: "Pro" },
  { id: "umbrella", name: "Umbrella Inc", plan: "Enterprise" },
  { id: "stark", name: "Stark Industries", plan: "Pro" },
  { id: "wayne", name: "Wayne Enterprises", plan: "Enterprise" },
];

/** Árvore empresa → manager → membros (~30 nós). */
export function makeOrg(): ListItemData[] {
  return COMPANIES.map((c, ci) => {
    const managers = Array.from({ length: 2 }, (_, mi) => {
      const mFirst = FIRST[(ci * 3 + mi) % FIRST.length];
      const members = Array.from({ length: 2 }, (_, ui) => {
        const uFirst = FIRST[(ci * 5 + mi * 2 + ui + 6) % FIRST.length];
        const uLast = LAST[(ci + ui) % LAST.length];
        return {
          id: `${c.id}-m${mi}-u${ui}`,
          leading: <Avatar />,
          title: `${uFirst} ${uLast}`,
          subtitle: `${uFirst.toLowerCase()}@${c.id}.com`,
          trailing: <Tag>Free</Tag>,
        } satisfies ListItemData;
      });
      return {
        id: `${c.id}-m${mi}`,
        leading: <Avatar />,
        title: `${mFirst} ${LAST[(ci + mi) % LAST.length]}`,
        subtitle: `${mFirst.toLowerCase()}@${c.id}.com`,
        trailing: <Parent tone="warning" label="Pro" n={members.length} />,
        children: members,
      } satisfies ListItemData;
    });
    return {
      id: c.id,
      leading: (
        <IconChip>
          <Building2 />
        </IconChip>
      ),
      title: c.name,
      subtitle: `admin@${c.id}.com`,
      trailing: <Parent tone="brand" label={c.plan} n={managers.length} />,
      children: managers,
    } satisfies ListItemData;
  });
}

/* ── card rico (pedidos) ───────────────────────────────────────── */

export type OrderStatus = "progress" | "exception" | "draft" | "late";

function StatusPill({ status }: { status: OrderStatus }) {
  const map = {
    progress: { label: "Em progresso", cls: "bg-bg-info-muted text-fg-info" },
    exception: { label: "Exceção", cls: "bg-bg-warning-muted text-fg-warning" },
    draft: { label: "Rascunho", cls: "bg-bg-muted text-fg-muted" },
    late: { label: "Atrasado", cls: "bg-bg-danger-muted text-fg-danger" },
  } as const;
  const v = map[status];
  return (
    <span
      className={`inline-flex items-center rounded-radius-full px-pad-md py-[2px] text-caption-sm font-semibold ${v.cls}`}
    >
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

export type OrderData = {
  code: string; name: string; status: OrderStatus; people: number;
  manufacturer: string; country: string; owner: string; category: string;
  stage: string; done: number; total: number; updated: string;
};

const ORDER_NAMES = [
  "Summer Linen Jacket SS22", "Tapered-Fit Jeans AW", "Thermo-Sealed Parka AW22",
  "Merino Wool Sweater", "Oversized Cotton Tee", "Recycled Down Vest",
  "Stretch Chino Pants", "Heavyweight Hoodie", "Tailored Blazer FW",
  "Performance Running Short", "Quilted Bomber Jacket", "Slim Oxford Shirt",
  "Cargo Utility Pants", "Knit Beanie Pack", "Waterproof Trench Coat",
  "Pleated Midi Skirt", "Fleece Lined Leggings", "Denim Trucker Jacket",
  "Ribbed Tank Top", "Corduroy Overshirt",
];
const ORDER_STATUS: OrderStatus[] = ["progress", "exception", "draft", "late"];
const MANUF = ["Bozkurt Konfeksiyon", "Taian Hongbang", "Anhui Garments", "Délhi Textiles"];
const COUNTRY = ["Turquia", "Índia", "China", "Vietnã"];
const OWNER = ["Stephanie Carvalho", "Kathaleen Marrlow", "Sebastian Petravic", "Nina Moreira"];
const CATEGORY = ["Jaquetas", "Jeans", "Malhas", "Calças"];
const STAGE = ["Pré-produção", "Controle de qualidade", "Preparação do pedido", "Em trânsito"];
const UPDATED = ["há 4 dias", "há 2 dias", "há 1 semana", "ontem", "há 6 h"];

/** Gera ~20 pedidos pro card rico. */
export function makeOrders(n = 20): ListItemData[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `o${i}`,
    title: ORDER_NAMES[i % ORDER_NAMES.length],
    data: {
      code: String(80149 - i * 13),
      name: ORDER_NAMES[i % ORDER_NAMES.length],
      status: ORDER_STATUS[i % ORDER_STATUS.length],
      people: (i % 3) + 1,
      manufacturer: MANUF[i % MANUF.length],
      country: COUNTRY[i % COUNTRY.length],
      owner: OWNER[i % OWNER.length],
      category: CATEGORY[i % CATEGORY.length],
      stage: STAGE[i % STAGE.length],
      done: (i % 9) + 1,
      total: 11,
      updated: UPDATED[i % UPDATED.length],
    } satisfies OrderData,
  }));
}

/** Campos filtráveis pro card rico (Status do pedido / Categoria). */
export const ORDER_FILTER_FIELDS: FilterableField[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    accessor: (i) => (i.data as OrderData).status,
    options: [
      { label: "Em progresso", value: "progress" },
      { label: "Exceção", value: "exception" },
      { label: "Rascunho", value: "draft" },
      { label: "Atrasado", value: "late" },
    ],
  },
  {
    id: "category",
    label: "Categoria",
    type: "select",
    accessor: (i) => (i.data as OrderData).category,
    options: CATEGORY.map((c) => ({ label: c, value: c })),
  },
];

export function renderOrderCard(item: ListItemData) {
  const o = item.data as OrderData;
  return (
    <div className="flex w-full flex-col gap-gp-md">
      <div className="flex items-start gap-gp-md">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-gp-md">
          <span className="text-body-md font-semibold text-fg-default">
            <span className="text-fg-muted">#{o.code}</span> — {o.name}
          </span>
          <StatusPill status={o.status} />
        </div>
        <AvatarStack n={o.people} />
      </div>
      <div className="flex flex-wrap items-center gap-x-gp-2xl gap-y-gp-xs">
        <MetaInline icon={<Building2 />} value={o.manufacturer} />
        <MetaInline icon={<MapPin />} value={o.country} />
        <MetaInline icon={<User />} value={o.owner} />
        <MetaInline icon={<Layers />} value={o.category} />
      </div>
      <div className="mt-gp-xs flex flex-wrap items-center gap-x-gp-md gap-y-gp-xs border-t border-border-subtle pt-pad-xl">
        <LoaderCircle className="size-icon-sm shrink-0 animate-spin text-fg-brand" />
        <span className="text-body-sm font-medium text-fg-default">
          {o.stage} <span className="text-fg-muted">({o.done}/{o.total})</span>
        </span>
        <span className="text-body-sm text-fg-subtle">atualizado {o.updated}</span>
      </div>
    </div>
  );
}
