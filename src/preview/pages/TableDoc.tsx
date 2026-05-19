import { useMemo, useState } from "react";
import {
  Hash,
  User,
  AtSign,
  Phone,
  CheckCircle2,
  Tag,
  Users as UsersIcon,
  DollarSign,
  Calendar,
  Type,
  MoreVertical,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCardRow,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  useColumnWidths,
  type SortDirection,
  type TableDensity,
} from "@/components/ui/Table";
import { Badge } from "@/components/shadcn/badge";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
  type PropItem,
} from "../components";

/* ═══════════════════════════════════════════════════════════════════════════
   Table Documentation Page
   ═══════════════════════════════════════════════════════════════════════════ */

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-density", label: "Densidades" },
  { id: "ex-sticky", label: "Sticky header" },
  { id: "ex-pin-sort-resize", label: "Pin + Sort + Resize" },
  { id: "ex-selection", label: "Selection / hover" },
  { id: "ex-card-mode", label: "Card mode (responsive)" },
  { id: "ex-full", label: "Tabela completa" },
  { id: "api", label: "API Reference" },
  { id: "api-table", label: "<Table>" },
  { id: "api-head", label: "<TableHead>" },
  { id: "api-headcell", label: "<TableHeadCell>" },
  { id: "api-row", label: "<TableRow>" },
  { id: "api-cell", label: "<TableCell>" },
  { id: "api-cardrow", label: "<TableCardRow>" },
];

const TABLE_PROPS: PropItem[] = [
  { name: "density", type: '"compact" | "standard" | "comfortable"', defaultVal: '"standard"' },
  { name: "cardBreakpoint", type: "number | false", defaultVal: "768" },
  { name: "ariaLabel", type: "string", defaultVal: "—" },
  { name: "className", type: "string", defaultVal: "—" },
  { name: "children", type: "ReactNode", defaultVal: "—" },
];

const HEAD_PROPS: PropItem[] = [
  { name: "sticky", type: "boolean", defaultVal: "true" },
  { name: "className", type: "string", defaultVal: "—" },
];

const HEAD_CELL_PROPS: PropItem[] = [
  { name: "width", type: "number", defaultVal: "—" },
  { name: "pinned", type: '"left" | "right"', defaultVal: "—" },
  { name: "pinOffset", type: "number", defaultVal: "—" },
  { name: "align", type: '"left" | "center" | "right"', defaultVal: '"left"' },
  { name: "sortable", type: "boolean", defaultVal: "false" },
  { name: "sortDirection", type: '"asc" | "desc" | null', defaultVal: "null" },
  { name: "onSortClick", type: "() => void", defaultVal: "—" },
  { name: "resizable", type: "boolean", defaultVal: "—" },
  { name: "onResize", type: "(widthPx: number) => void", defaultVal: "—" },
  { name: "onResizeEnd", type: "(widthPx: number) => void", defaultVal: "—" },
];

const ROW_PROPS: PropItem[] = [
  { name: "selected", type: "boolean", defaultVal: "false" },
  { name: "clickable", type: "boolean", defaultVal: "auto (true se onClick)" },
  { name: "onClick", type: "(e: MouseEvent) => void", defaultVal: "—" },
];

const CELL_PROPS: PropItem[] = [
  { name: "width", type: "number", defaultVal: "—" },
  { name: "pinned", type: '"left" | "right"', defaultVal: "—" },
  { name: "pinOffset", type: "number", defaultVal: "—" },
  { name: "align", type: '"left" | "center" | "right"', defaultVal: '"left"' },
  { name: "ellipsis", type: "boolean", defaultVal: "false" },
  { name: "label", type: "string (usado no card mode)", defaultVal: "—" },
];

const CARD_ROW_PROPS: PropItem[] = [
  { name: "header", type: "ReactNode (esquerda)", defaultVal: "—" },
  { name: "headerActions", type: "ReactNode (direita)", defaultVal: "—" },
  { name: "items", type: "ReadonlyArray<{ label, value, key? }>", defaultVal: "—" },
  { name: "selected", type: "boolean", defaultVal: "false" },
  { name: "clickable", type: "boolean", defaultVal: "auto" },
  { name: "onClick", type: "(e: MouseEvent) => void", defaultVal: "—" },
];

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
};

const SEED_USERS: User[] = [
  { id: 1, name: "Ana Souza",     email: "ana@igreen.com",     role: "Admin",    status: "active" },
  { id: 2, name: "Bruno Lima",    email: "bruno@igreen.com",   role: "Manager",  status: "active" },
  { id: 3, name: "Carla Mendes",  email: "carla@igreen.com",   role: "Analyst",  status: "pending" },
  { id: 4, name: "Diego Rocha",   email: "diego@igreen.com",   role: "Analyst",  status: "inactive" },
  { id: 5, name: "Eduarda Lima",  email: "eduarda@igreen.com", role: "Admin",    status: "active" },
  { id: 6, name: "Felipe Costa",  email: "felipe@igreen.com",  role: "Manager",  status: "active" },
  { id: 7, name: "Giovana Reis",  email: "giovana@igreen.com", role: "Analyst",  status: "active" },
  { id: 8, name: "Henrique Sá",   email: "henrique@igreen.com", role: "Viewer",  status: "pending" },
];

const statusColor: Record<User["status"], "success" | "warning" | "secondary"> = {
  active: "success",
  pending: "warning",
  inactive: "secondary",
};

/* App.tsx uses: import TableDoc from "./preview/pages/TableDoc" (default import)
   Therefore: export default function TableDoc() */
export default function TableDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Tables"
        title="Table"
        description="Primitivo de tabela em divs. API 'lego' controlada — você gerencia widths, sort, selection. Para tabelas feature-completas use <DataTable>."
      />

      <DocSeparator />

      {/* Hero preview */}
      <ExampleSection id="ex-hero" title="" description="">
        <div className="w-full">
          <HeroExample />
        </div>
      </ExampleSection>

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-density"
        title="Densidades"
        description="Três modos: compact (32px), standard (40px, default) e comfortable (44px). Density propaga automaticamente pelos subcomponentes via Context interno."
        code={`<Table density="compact">
  <TableHead>{/* ... */}</TableHead>
  <TableBody>{/* ... */}</TableBody>
</Table>`}
      >
        <div className="w-full">
          <DensityExample />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-sticky"
        title="Sticky header"
        description="Header sticky no topo durante scroll vertical (default). Use altura fixa no container pra ativar o scroll."
        code={`<div style={{ height: 320 }}>
  <Table>
    <TableHead sticky>{/* ... */}</TableHead>
    <TableBody>{/* ... */}</TableBody>
  </Table>
</div>`}
      >
        <div className="w-full">
          <StickyExample />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-pin-sort-resize"
        title="Pin + Sort + Resize"
        description="Coluna fixa à esquerda (checkbox + nome) e à direita (actions). Headers clicáveis ciclam asc → desc → none. Drag no edge direito do header redimensiona."
        code={`const { widths, offsets } = useColumnWidths(cols);

<TableHeadCell
  width={widths.name}
  pinned="left"
  pinOffset={offsets.name}
  sortable
  sortDirection={sort.field === "name" ? sort.dir : null}
  onSortClick={() => toggleSort("name")}
  resizable
  onResize={(w) => setWidth("name", w)}
>
  Nome
</TableHeadCell>`}
      >
        <div className="w-full">
          <PinSortResizeExample />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-selection"
        title="Selection / hover / clickable"
        description="A row tem visual de selected (bg brand alpha) e hover. Combinar clickable + onClick faz a linha toda virar trigger."
        code={`<TableRow
  selected={isSelected(row.id)}
  clickable
  onClick={() => toggleRow(row.id)}
>
  {/* cells */}
</TableRow>`}
      >
        <div className="w-full">
          <SelectionExample />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-card-mode"
        title="Card mode (responsive)"
        description="No `<Table>` puro, o consumer renderiza `<TableCardRow>` manualmente em vez de `<TableRow>` quando o container fica estreito (decide via ResizeObserver/matchMedia). Já no `<DataTable>`, o switch é automático: abaixo de `cardBreakpoint` (default 768px), todas as rows viram cards automaticamente — sem trabalho extra."
        code={`<TableCardRow
  header={<strong>{row.name}</strong>}
  headerActions={<Button size="icon-xs"><Pencil /></Button>}
  items={[
    { label: "Email", value: row.email },
    { label: "Cargo", value: row.role },
  ]}
/>`}
      >
        <div className="w-full">
          <CardModeExample />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-full"
        title="Tabela completa (estilo design-and-table-v2)"
        description="Replica visual da tabela de CRUD: 13 colunas com icone de tipo, sort badge, cell borders, sticky right action column, strip lateral brand em selected, hover '...' na row, status/category/person/agent cells customizadas."
        code={`<Table cellBorders density="comfortable">
  <TableHead>
    <TableHeadCell icon={Hash} width={120}>ID</TableHeadCell>
    <TableHeadCell icon={User} sortable sortDirection="asc">Nome</TableHeadCell>
    <TableHeadCell icon={AtSign} headMenu={<Button>...</Button>}>Email</TableHeadCell>
  </TableHead>
  <TableBody>
    {rows.map(row => (
      <TableRow key={row.id} selected={isSelected(row.id)}>
        <TableCell>{row.id}</TableCell>
        <TableCell><PersonCell row={row} /></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>`}
      >
        <div className="w-full">
          <ClientsTableExample />
        </div>
      </ExampleSection>

      {/* ── API Reference ───────────────────────────────────────────── */}
      <SectionH2 id="api" title="API Reference" />

      <div id="api-table" className="mb-12">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-md">&lt;Table&gt;</h3>
        <PropsTable items={TABLE_PROPS} />
      </div>

      <div id="api-head" className="mb-12">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-md">&lt;TableHead&gt;</h3>
        <PropsTable items={HEAD_PROPS} />
      </div>

      <div id="api-headcell" className="mb-12">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-md">&lt;TableHeadCell&gt;</h3>
        <PropsTable items={HEAD_CELL_PROPS} />
      </div>

      <div id="api-row" className="mb-12">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-md">&lt;TableRow&gt;</h3>
        <PropsTable items={ROW_PROPS} />
      </div>

      <div id="api-cell" className="mb-12">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-md">&lt;TableCell&gt;</h3>
        <PropsTable items={CELL_PROPS} />
      </div>

      <div id="api-cardrow" className="mb-12">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-md">&lt;TableCardRow&gt;</h3>
        <PropsTable items={CARD_ROW_PROPS} />
      </div>
    </DocLayout>
  );
}

/* ── Examples ─────────────────────────────────────────────────────── */

function HeroExample() {
  const columns = useMemo(() => [
    { field: "name",   headerName: "Nome",   width: 180 },
    { field: "email",  headerName: "Email",  width: 220 },
    { field: "status", headerName: "Status", width: 100 },
  ], []);
  const { widths } = useColumnWidths(columns);

  return (
    <Table ariaLabel="Hero example">
      <TableHead>
        {columns.map((c) => (
          <TableHeadCell key={c.field} width={widths[c.field]}>{c.headerName}</TableHeadCell>
        ))}
      </TableHead>
      <TableBody>
        {SEED_USERS.slice(0, 3).map((row) => (
          <TableRow key={row.id}>
            <TableCell width={widths.name}>{row.name}</TableCell>
            <TableCell width={widths.email}>{row.email}</TableCell>
            <TableCell width={widths.status}>
              <Badge color={statusColor[row.status]} variant="soft" size="sm">{row.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function DensityExample() {
  const [density, setDensity] = useState<TableDensity>("standard");
  const columns = useMemo(() => [
    { field: "name",   headerName: "Nome",   width: 180 },
    { field: "email",  headerName: "Email",  width: 220 },
    { field: "role",   headerName: "Cargo",  width: 120 },
    { field: "status", headerName: "Status", width: 110 },
  ], []);
  const { widths } = useColumnWidths(columns);

  return (
    <div className="flex flex-col gap-gp-md">
      <div className="flex gap-gp-md">
        {(["compact", "standard", "comfortable"] as const).map((d) => (
          <Button
            key={d}
            size="xs"
            variant={density === d ? "filled" : "outline"}
            color={density === d ? "primary" : "secondary"}
            onClick={() => setDensity(d)}
          >
            {d}
          </Button>
        ))}
      </div>

      <Table density={density} ariaLabel="Density example">
        <TableHead>
          {columns.map((c) => (
            <TableHeadCell key={c.field} width={widths[c.field]}>{c.headerName}</TableHeadCell>
          ))}
        </TableHead>
        <TableBody>
          {SEED_USERS.slice(0, 4).map((row) => (
            <TableRow key={row.id}>
              <TableCell width={widths.name}>{row.name}</TableCell>
              <TableCell width={widths.email}>{row.email}</TableCell>
              <TableCell width={widths.role}>{row.role}</TableCell>
              <TableCell width={widths.status}>
                <Badge color={statusColor[row.status]} variant="soft" size="md">{row.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StickyExample() {
  const columns = useMemo(() => [
    { field: "name",  headerName: "Nome",  width: 180 },
    { field: "email", headerName: "Email", width: 220 },
    { field: "role",  headerName: "Cargo", width: 120 },
  ], []);
  const { widths } = useColumnWidths(columns);
  const bigRows = useMemo(
    () => Array.from({ length: 30 }, (_, i) => SEED_USERS[i % SEED_USERS.length]),
    [],
  );

  return (
    <div style={{ height: 320 }}>
      <Table ariaLabel="Sticky example">
        <TableHead>
          {columns.map((c) => (
            <TableHeadCell key={c.field} width={widths[c.field]}>{c.headerName}</TableHeadCell>
          ))}
        </TableHead>
        <TableBody>
          {bigRows.map((row, i) => (
            <TableRow key={`${row.id}-${i}`}>
              <TableCell width={widths.name}>{row.name}</TableCell>
              <TableCell width={widths.email}>{row.email}</TableCell>
              <TableCell width={widths.role}>{row.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PinSortResizeExample() {
  const initialCols = useMemo(
    () => [
      { field: "select", headerName: "",       width: 56,  pinned: "left" as const,  resizable: false, sortable: false },
      { field: "name",   headerName: "Nome",   width: 160, pinned: "left" as const,  resizable: true,  sortable: true },
      { field: "email",  headerName: "Email",  width: 200,                            resizable: true,  sortable: true },
      { field: "role",   headerName: "Cargo",  width: 120,                            resizable: true,  sortable: true },
      { field: "status", headerName: "Status", width: 110,                            resizable: true,  sortable: true },
      { field: "actions", headerName: "",      width: 56,  pinned: "right" as const, resizable: false, sortable: false },
    ],
    [],
  );

  const [widthMap, setWidthMap] = useState<Record<string, number>>({});
  const cols = useMemo(
    () => initialCols.map((c) => ({ ...c, width: widthMap[c.field] ?? c.width })),
    [initialCols, widthMap],
  );
  const { widths, offsets } = useColumnWidths(cols);

  const [sort, setSort] = useState<{ field: string; dir: SortDirection }>({ field: "", dir: null });
  const onSort = (field: string) => {
    setSort((prev) => {
      if (prev.field !== field) return { field, dir: "asc" };
      if (prev.dir === "asc") return { field, dir: "desc" };
      return { field: "", dir: null };
    });
  };

  return (
    <Table ariaLabel="Pin + sort + resize example">
      <TableHead>
        {cols.map((c) => (
          <TableHeadCell
            key={c.field}
            width={widths[c.field]}
            pinned={c.pinned}
            pinOffset={offsets[c.field]}
            sortable={c.sortable}
            sortDirection={sort.field === c.field ? sort.dir : null}
            onSortClick={() => onSort(c.field)}
            resizable={c.resizable}
            onResize={(w) => setWidthMap((m) => ({ ...m, [c.field]: w }))}
          >
            {c.headerName}
          </TableHeadCell>
        ))}
      </TableHead>
      <TableBody>
        {SEED_USERS.map((row) => (
          <TableRow key={row.id}>
            <TableCell width={widths.select} pinned="left" pinOffset={offsets.select}>
              <Checkbox aria-label={`Selecionar ${row.name}`} />
            </TableCell>
            <TableCell width={widths.name} pinned="left" pinOffset={offsets.name} ellipsis>{row.name}</TableCell>
            <TableCell width={widths.email} ellipsis>{row.email}</TableCell>
            <TableCell width={widths.role}>{row.role}</TableCell>
            <TableCell width={widths.status}>
              <Badge color={statusColor[row.status]} variant="soft" size="md">{row.status}</Badge>
            </TableCell>
            <TableCell width={widths.actions} pinned="right" pinOffset={offsets.actions} align="center">
              <Button size="icon-xs" variant="ghost" color="secondary" aria-label="Mais">
                <MoreVertical />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SelectionExample() {
  const [selected, setSelected] = useState<Set<number>>(new Set([2, 5]));
  const columns = useMemo(() => [
    { field: "select", headerName: "",     width: 56 },
    { field: "name",   headerName: "Nome", width: 180 },
    { field: "email",  headerName: "Email", width: 220 },
  ], []);
  const { widths } = useColumnWidths(columns);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const rows = SEED_USERS.slice(0, 6);
  const allSelected = selected.size === rows.length;
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll = () => {
    if (selected.size > 0) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.id)));
  };

  return (
    <Table ariaLabel="Selection example">
      <TableHead>
        <TableHeadCell width={widths.select} align="center">
          <Checkbox
            checked={allSelected ? true : someSelected ? "indeterminate" : false}
            onCheckedChange={toggleAll}
            aria-label="Selecionar todos"
          />
        </TableHeadCell>
        {columns.slice(1).map((c) => (
          <TableHeadCell key={c.field} width={widths[c.field]}>{c.headerName}</TableHeadCell>
        ))}
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={row.id}
            selected={selected.has(row.id)}
            clickable
            onClick={() => toggle(row.id)}
          >
            <TableCell width={widths.select} align="center">
              <Checkbox
                checked={selected.has(row.id)}
                aria-label={`Selecionar ${row.name}`}
                onClick={(e) => e.stopPropagation()}
                onCheckedChange={() => toggle(row.id)}
              />
            </TableCell>
            <TableCell width={widths.name}>{row.name}</TableCell>
            <TableCell width={widths.email}>{row.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CardModeExample() {
  return (
    <Table cardBreakpoint={768} ariaLabel="Card mode example">
      <TableBody>
        {SEED_USERS.slice(0, 4).map((row) => (
          <TableCardRow
            key={row.id}
            header={
              <>
                <Checkbox aria-label={`Selecionar ${row.name}`} />
                <strong className="text-body-lg text-fg-strong">{row.name}</strong>
              </>
            }
            headerActions={
              <Button size="icon-xs" variant="ghost" color="secondary" aria-label="Editar">
                <Pencil />
              </Button>
            }
            items={[
              { label: "Email", value: row.email },
              { label: "Cargo", value: row.role },
              {
                label: "Status",
                value: <Badge color={statusColor[row.status]} variant="soft" size="md">{row.status}</Badge>,
              },
            ]}
          />
        ))}
      </TableBody>
    </Table>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ClientsTable example: replica do design-and-table-v2
   ═══════════════════════════════════════════════════════════════════════════ */

export const STATUSES: Record<string, { label: string; color: string }> = {
  active:   { label: "Ativo",    color: "var(--color-fg-success)" },
  pending:  { label: "Pendente", color: "var(--color-fg-warning)" },
  paused:   { label: "Pausado",  color: "var(--color-fg-info)" },
  inactive: { label: "Inativo",  color: "var(--color-fg-muted)" },
};

export type CategoryKind = "warning" | "info" | "success" | "neutral";
export const CATEGORIES: Record<string, { label: string; kind: CategoryKind }> = {
  royal:      { label: "Royal",      kind: "warning" },
  licenciado: { label: "Licenciado", kind: "info" },
  lead:       { label: "Lead",       kind: "success" },
};

export const AGENTS: Record<string, { name: string; initials: string; color: string }> = {
  you:    { name: "Voce",         initials: "VC", color: "#0a3a2e" },
  aline:  { name: "Aline Castro", initials: "AC", color: "#f59e0b" },
  carlos: { name: "Carlos Souza", initials: "CS", color: "#8754ec" },
  maria:  { name: "Maria Lima",   initials: "ML", color: "#ef4444" },
};

export type ClientRow = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  email: string;
  phone: string;
  statusId: keyof typeof STATUSES;
  categoryId: keyof typeof CATEGORIES;
  location: string;
  value: number;
  agentId: keyof typeof AGENTS;
  createdAt: number;
  lastContact: number;
};

const BASE_DATE = new Date("2026-04-15T12:00:00Z").getTime();
const DAY_MS = 86400000;

export const CLIENTS_MOCK: ClientRow[] = [
  { id: "CLI-2401", name: "Maria Silva",     initials: "MS", avatarColor: "#f59e0b", email: "maria.silva@example.com",     phone: "+55 11 91234-5678", statusId: "active",   categoryId: "royal",      location: "São Paulo, SP",      value: 4800,  agentId: "you",    createdAt: BASE_DATE - 65 * DAY_MS, lastContact: BASE_DATE - 2 * DAY_MS  },
  { id: "CLI-2402", name: "João Santos",     initials: "JS", avatarColor: "#0a3a2e", email: "joao.santos@example.com",     phone: "+55 11 92345-6789", statusId: "pending",  categoryId: "licenciado", location: "Rio de Janeiro, RJ", value: 12300, agentId: "aline",  createdAt: BASE_DATE - 58 * DAY_MS, lastContact: BASE_DATE - 5 * DAY_MS  },
  { id: "CLI-2403", name: "Carlos Oliveira", initials: "CO", avatarColor: "#8754ec", email: "carlos.oliveira@example.com", phone: "+55 11 93456-7890", statusId: "active",   categoryId: "lead",       location: "Belo Horizonte, MG", value: 2150,  agentId: "carlos", createdAt: BASE_DATE - 51 * DAY_MS, lastContact: BASE_DATE - 1 * DAY_MS  },
  { id: "CLI-2404", name: "Ana Costa",       initials: "AC", avatarColor: "#1cb280", email: "ana.costa@example.com",       phone: "+55 11 94567-8901", statusId: "paused",   categoryId: "royal",      location: "Porto Alegre, RS",   value: 8900,  agentId: "maria",  createdAt: BASE_DATE - 44 * DAY_MS, lastContact: BASE_DATE - 12 * DAY_MS },
  { id: "CLI-2405", name: "Pedro Pereira",   initials: "PP", avatarColor: "#ef4444", email: "pedro.pereira@example.com",   phone: "+55 11 95678-9012", statusId: "inactive", categoryId: "lead",       location: "Curitiba, PR",       value: 1100,  agentId: "you",    createdAt: BASE_DATE - 37 * DAY_MS, lastContact: BASE_DATE - 30 * DAY_MS },
  { id: "CLI-2406", name: "Lúcia Almeida",   initials: "LA", avatarColor: "#f9a47a", email: "lucia.almeida@example.com",   phone: "+55 11 96789-0123", statusId: "active",   categoryId: "licenciado", location: "Recife, PE",         value: 6750,  agentId: "aline",  createdAt: BASE_DATE - 30 * DAY_MS, lastContact: BASE_DATE - 3 * DAY_MS  },
  { id: "CLI-2407", name: "Roberto Souza",   initials: "RS", avatarColor: "#0088cc", email: "roberto.souza@example.com",   phone: "+55 11 97890-1234", statusId: "pending",  categoryId: "royal",      location: "São Paulo, SP",      value: 15200, agentId: "carlos", createdAt: BASE_DATE - 23 * DAY_MS, lastContact: BASE_DATE - 7 * DAY_MS  },
  { id: "CLI-2408", name: "Fernanda Lima",   initials: "FL", avatarColor: "#e1306c", email: "fernanda.lima@example.com",   phone: "+55 11 98901-2345", statusId: "active",   categoryId: "lead",       location: "Rio de Janeiro, RJ", value: 3400,  agentId: "maria",  createdAt: BASE_DATE - 16 * DAY_MS, lastContact: BASE_DATE - 1 * DAY_MS  },
  { id: "CLI-2409", name: "Bruno Rodrigues", initials: "BR", avatarColor: "#70c748", email: "bruno.rodrigues@example.com", phone: "+55 11 99012-3456", statusId: "paused",   categoryId: "licenciado", location: "Belo Horizonte, MG", value: 5600,  agentId: "you",    createdAt: BASE_DATE - 9 * DAY_MS,  lastContact: BASE_DATE - 6 * DAY_MS  },
  { id: "CLI-2410", name: "Camila Ribeiro",  initials: "CR", avatarColor: "#8754ec", email: "camila.ribeiro@example.com",  phone: "+55 11 90123-4567", statusId: "active",   categoryId: "royal",      location: "Porto Alegre, RS",   value: 9800,  agentId: "aline",  createdAt: BASE_DATE - 2 * DAY_MS,  lastContact: BASE_DATE              },
];

const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export function formatDateShort(value: number): string {
  const d = new Date(value);
  const day = d.getDate().toString().padStart(2, "0");
  return `${day} de ${MONTHS_SHORT[d.getMonth()]}`;
}
export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

export function ClientAvatar({ initials, color, sm = false }: { initials: string; color: string; sm?: boolean }) {
  return (
    <span
      className={`inline-grid place-items-center rounded-radius-full text-white font-bold shrink-0 ${sm ? "size-[22px] text-caption-xs" : "size-[28px] text-caption-sm"}`}
      style={{ background: color }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function PersonCell({ row }: { row: ClientRow }) {
  return (
    <span className="inline-flex items-center gap-gp-md whitespace-nowrap overflow-hidden" title={row.name}>
      <ClientAvatar initials={row.initials} color={row.avatarColor} />
      <span className="truncate font-medium text-fg-default">{row.name}</span>
    </span>
  );
}

export function AgentCell({ agentId }: { agentId: keyof typeof AGENTS }) {
  const a = AGENTS[agentId];
  return (
    <span className="inline-flex items-center gap-gp-md whitespace-nowrap" title={a.name}>
      <ClientAvatar initials={a.initials} color={a.color} sm />
      <span className="text-fg-default">{a.name}</span>
    </span>
  );
}

export function StatusDot({ statusId }: { statusId: keyof typeof STATUSES }) {
  const s = STATUSES[statusId];
  return (
    <span className="inline-flex items-center gap-gp-md text-fg-default">
      <span className="size-[8px] rounded-radius-full shrink-0" style={{ background: s.color }} aria-hidden />
      {s.label}
    </span>
  );
}

export function CategoryChip({ categoryId }: { categoryId: keyof typeof CATEGORIES }) {
  const c = CATEGORIES[categoryId];
  const colorMap = {
    warning: "warning",
    info: "info",
    success: "success",
    neutral: "neutral",
  } as const;
  return (
    <Chip color={colorMap[c.kind]} variant="soft" size="sm">
      {c.label}
    </Chip>
  );
}

export function ClientsTableExample() {
  const [selected, setSelected] = useState<Set<string>>(new Set(["CLI-2401"]));
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allSelected = selected.size === CLIENTS_MOCK.length;
  const someSelected = selected.size > 0 && !allSelected;
  const toggleAll = () => {
    if (selected.size > 0) setSelected(new Set());
    else setSelected(new Set(CLIENTS_MOCK.map((r) => r.id)));
  };

  const cycleSort = () => {
    setSortDir((prev) => (prev === "asc" ? "desc" : prev === "desc" ? null : "asc"));
  };

  const initialCols = useMemo(() => [
    { field: "select",      headerName: "",                width: 56 },
    { field: "id",          headerName: "ID",              width: 120,    icon: Hash },
    { field: "name",        headerName: "Nome",            width: 220,    icon: User },
    { field: "email",       headerName: "Email",           width: 240,    icon: AtSign },
    { field: "phone",       headerName: "Telefone",        width: 170,    icon: Phone },
    { field: "status",      headerName: "Status",          width: 140,    icon: CheckCircle2 },
    { field: "category",    headerName: "Categoria",       width: 130,    icon: Tag },
    { field: "agent",       headerName: "Atribuido",       width: 170,    icon: UsersIcon },
    { field: "value",       headerName: "Valor",           width: 130,    icon: DollarSign },
    { field: "createdAt",   headerName: "Criado em",       width: 130,    icon: Calendar },
    { field: "lastContact", headerName: "Ultimo contato",  width: 150,    icon: Calendar },
    { field: "location",    headerName: "Localizacao",     width: 150,    icon: Type },
    { field: "actions",     headerName: "",                width: 44 },
  ], []);

  const [widthMap, setWidthMap] = useState<Record<string, number>>({});
  const cols = useMemo(
    () => initialCols.map((c) => ({ ...c, width: widthMap[c.field] ?? c.width })),
    [initialCols, widthMap],
  );

  const { widths } = useColumnWidths(cols);

  return (
    <Table cellBorders density="comfortable" ariaLabel="Tabela de clientes">
      <TableHead>
        <TableHeadCell width={widths.select} align="center">
          <Checkbox
            checked={allSelected ? true : someSelected ? "indeterminate" : false}
            onCheckedChange={toggleAll}
            aria-label="Selecionar todos"
          />
        </TableHeadCell>

        {cols.slice(1, -1).map((c) => (
          <TableHeadCell
            key={c.field}
            width={widths[c.field]}
            icon={c.icon}
            sortable={c.field === "name"}
            sortDirection={c.field === "name" ? sortDir : null}
            sortIndex={1}
            onSortClick={c.field === "name" ? cycleSort : undefined}
            resizable
            onResize={(w) => setWidthMap((m) => ({ ...m, [c.field]: w }))}
            headMenu={
              <Button size="icon-2xs" variant="ghost" color="secondary" aria-label={`Menu da coluna ${c.headerName}`} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <MoreVertical />
              </Button>
            }
          >
            {c.headerName}
          </TableHeadCell>
        ))}

        <TableHeadCell width={widths.actions} align="center" />
      </TableHead>

      <TableBody>
        {CLIENTS_MOCK.map((row) => {
          const isSelected = selected.has(row.id);
          return (
            <TableRow
              key={row.id}
              selected={isSelected}
              open={openRowId === row.id}
              clickable
              onClick={() => setOpenRowId((cur) => (cur === row.id ? null : row.id))}
            >
              <TableCell width={widths.select} align="center">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggle(row.id)}
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  aria-label={`Selecionar ${row.name}`}
                />
              </TableCell>

              <TableCell width={widths.id}>
                <span className="text-fg-muted tabular-nums">{row.id}</span>
              </TableCell>

              <TableCell width={widths.name}>
                <PersonCell row={row} />
              </TableCell>

              <TableCell width={widths.email}>
                <a
                  href={`mailto:${row.email}`}
                  className="text-fg-brand hover:underline"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  {row.email}
                </a>
              </TableCell>

              <TableCell width={widths.phone}>
                <a
                  href={`tel:${row.phone.replace(/\D/g, "")}`}
                  className="text-fg-brand hover:underline"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  {row.phone}
                </a>
              </TableCell>

              <TableCell width={widths.status}>
                <StatusDot statusId={row.statusId} />
              </TableCell>

              <TableCell width={widths.category}>
                <CategoryChip categoryId={row.categoryId} />
              </TableCell>

              <TableCell width={widths.agent}>
                <AgentCell agentId={row.agentId} />
              </TableCell>

              <TableCell width={widths.value}>
                <span className="font-semibold tabular-nums">{formatCurrency(row.value)}</span>
              </TableCell>

              <TableCell width={widths.createdAt}>
                <span className="text-fg-muted tabular-nums">{formatDateShort(row.createdAt)}</span>
              </TableCell>

              <TableCell width={widths.lastContact}>
                <span className="text-fg-muted tabular-nums">{formatDateShort(row.lastContact)}</span>
              </TableCell>

              <TableCell width={widths.location}>{row.location}</TableCell>

              <TableCell width={widths.actions} align="center" className="!px-0 opacity-0 group-hover/row:opacity-100 transition-opacity">
                <Button size="icon-xs" variant="ghost" color="secondary" aria-label="Acoes" onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}>
                  <MoreHorizontal />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
