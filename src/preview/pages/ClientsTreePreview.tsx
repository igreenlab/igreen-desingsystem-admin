import { useMemo, useRef, useState } from "react";
import { Hash, User, AtSign, DollarSign, Network, Layers } from "lucide-react";
import {
  DataTable,
  type DataTableColumnDef,
  type DataTableRef,
} from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button/button";
import { Avatar } from "@/components/ui/Avatar/avatar";
import { ExamplePageLayout } from "../components/example-page-layout";

/* ── Mock: rede de licenciados (sponsor → descendentes) ──────────────
 * Espelha a view real V_MAPAREDE_DETALHADO do app virtual-office:
 *   - `id`        = id do licenciado (id da linha)
 *   - `parentId`  = id do patrocinador (null nas raízes)
 *   - `nivel`     = profundidade na rede (informativo; a árvore deriva do path)
 * A hierarquia é montada SÓ a partir de `getTreeDataPath` (ver abaixo). */

type NetworkRow = {
  id: string;
  parentId: string | null;
  nivel: number;
  name: string;
  initials: string;
  avatarColor: string;
  email: string;
  /** Volume de vendas próprio do licenciado (não soma a rede). */
  volume: number;
};

const NETWORK_MOCK: NetworkRow[] = [
  // Raiz 1 — Ana
  { id: "L-001", parentId: null, nivel: 0, name: "Ana Prado", initials: "AP", avatarColor: "#16a34a", email: "ana.prado@example.com", volume: 12400 },
  { id: "L-010", parentId: "L-001", nivel: 1, name: "Bruno Lima", initials: "BL", avatarColor: "#2563eb", email: "bruno.lima@example.com", volume: 8200 },
  { id: "L-011", parentId: "L-001", nivel: 1, name: "Carla Souza", initials: "CS", avatarColor: "#db2777", email: "carla.souza@example.com", volume: 6100 },
  { id: "L-100", parentId: "L-010", nivel: 2, name: "Diego Alves", initials: "DA", avatarColor: "#f59e0b", email: "diego.alves@example.com", volume: 3300 },
  { id: "L-101", parentId: "L-010", nivel: 2, name: "Elisa Rocha", initials: "ER", avatarColor: "#7c3aed", email: "elisa.rocha@example.com", volume: 2900 },
  { id: "L-110", parentId: "L-011", nivel: 2, name: "Felipe Nunes", initials: "FN", avatarColor: "#0891b2", email: "felipe.nunes@example.com", volume: 1800 },
  { id: "L-1000", parentId: "L-100", nivel: 3, name: "Gabriela Reis", initials: "GR", avatarColor: "#ca8a04", email: "gabriela.reis@example.com", volume: 950 },
  { id: "L-1001", parentId: "L-100", nivel: 3, name: "Heitor Dias", initials: "HD", avatarColor: "#dc2626", email: "heitor.dias@example.com", volume: 720 },
  // Raiz 2 — Igor
  { id: "L-002", parentId: null, nivel: 0, name: "Igor Castro", initials: "IC", avatarColor: "#059669", email: "igor.castro@example.com", volume: 9800 },
  { id: "L-020", parentId: "L-002", nivel: 1, name: "Júlia Mendes", initials: "JM", avatarColor: "#9333ea", email: "julia.mendes@example.com", volume: 5400 },
  { id: "L-200", parentId: "L-020", nivel: 2, name: "Kevin Barros", initials: "KB", avatarColor: "#0d9488", email: "kevin.barros@example.com", volume: 2100 },
];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const COLUMNS: DataTableColumnDef<NetworkRow>[] = [
  {
    // Coluna primária da árvore: recebe indentação + chevron via `treeColumn`.
    field: "name",
    headerName: "Licenciado",
    width: 320,
    icon: User,
    sortable: true,
    treeColumn: true,
    render: ({ row }) => (
      <span className="flex items-center gap-gp-sm min-w-0">
        <Avatar size="xs" colorHex={row.avatarColor}>
          {row.initials}
        </Avatar>
        <span className="truncate text-fg-strong font-medium">{row.name}</span>
      </span>
    ),
  },
  { field: "id", headerName: "ID", width: 120, icon: Hash, type: "text" },
  {
    field: "nivel",
    headerName: "Nível",
    width: 100,
    icon: Layers,
    align: "right",
    sortable: true,
    render: ({ value }) => (
      <span className="text-fg-muted tabular-nums">{value as number}</span>
    ),
  },
  {
    field: "email",
    headerName: "Email",
    width: 260,
    icon: AtSign,
    render: ({ value }) => (
      <a
        href={`mailto:${value}`}
        className="text-fg-brand hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {value as string}
      </a>
    ),
  },
  {
    field: "volume",
    headerName: "Volume",
    width: 140,
    icon: DollarSign,
    align: "right",
    sortable: true,
    valueFormatter: (v) => (typeof v === "number" ? currency.format(v) : ""),
    render: ({ value }) => (
      <span className="font-semibold tabular-nums">
        {currency.format(value as number)}
      </span>
    ),
  },
];

/**
 * Página standalone — DataTable em modo TREE-DATA (hierarquia multi-nível).
 *
 * - `getTreeDataPath(row)` deriva o caminho de cada linha (sobe a cadeia de
 *   `parentId` até a raiz). A árvore é reconstruída SÓ a partir dos caminhos —
 *   as rows continuam FLAT no `rows`.
 * - `treeColumn: true` na coluna `name` → indentação por nível + chevron.
 * - Chevron expande/colapsa por nó; `defaultExpanded` controla o estado inicial.
 * - `treeData.showDescendantCount` mostra "(N)" descendentes ao lado do nome.
 * - Pagination desliga automaticamente em tree-data (paginar cortaria ramos).
 * - Search/sort continuam operando sobre as rows; a árvore reconstrói do output.
 */
export default function ClientsTreePreview() {
  const columns = useMemo(() => COLUMNS, []);
  const [rows] = useState<NetworkRow[]>(() => NETWORK_MOCK);
  const [defaultExpanded, setDefaultExpanded] = useState(true);
  const [showCount, setShowCount] = useState(true);
  const tableRef = useRef<DataTableRef>(null);

  // Índice id → row pra subir a cadeia de patrocinador. Memoizado pra não
  // refazer a cada render.
  const byId = useMemo(() => {
    const m = new Map<string, NetworkRow>();
    for (const r of rows) m.set(r.id, r);
    return m;
  }, [rows]);

  /**
   * Caminho hierárquico: sobe de `parentId` em `parentId` até a raiz, montando
   * `[raiz, ..., self]`. Exatamente o que o app fará a partir de
   * V_MAPAREDE_DETALHADO (patrocinador → descendentes).
   */
  const getTreeDataPath = useMemo(
    () => (row: NetworkRow): string[] => {
      const path: string[] = [];
      let current: NetworkRow | undefined = row;
      const guard = new Set<string>(); // evita loop em dado inconsistente
      while (current && !guard.has(current.id)) {
        guard.add(current.id);
        path.unshift(current.id);
        current = current.parentId ? byId.get(current.parentId) : undefined;
      }
      return path;
    },
    [byId],
  );

  const controls = (
    <div className="flex flex-wrap items-center gap-gp-sm">
      <span className="text-body-xs text-fg-muted">Estado inicial:</span>
      <Button
        size="2xs"
        variant={defaultExpanded ? "filled" : "outline"}
        color={defaultExpanded ? "primary" : "secondary"}
        onClick={() => setDefaultExpanded(true)}
      >
        Expandido
      </Button>
      <Button
        size="2xs"
        variant={!defaultExpanded ? "filled" : "outline"}
        color={!defaultExpanded ? "primary" : "secondary"}
        onClick={() => setDefaultExpanded(false)}
      >
        Colapsado
      </Button>
      <span className="text-body-xs text-fg-muted ml-pad-md">Contagem:</span>
      <Button
        size="2xs"
        variant={showCount ? "filled" : "outline"}
        color={showCount ? "primary" : "secondary"}
        onClick={() => setShowCount((v) => !v)}
      >
        {showCount ? "(N) visível" : "(N) oculto"}
      </Button>
    </div>
  );

  return (
    <ExamplePageLayout
      category="Data Table Examples"
      title="Tree-data (hierarquia)"
      description="Hierarquia multi-nível derivada de getTreeDataPath. Cada linha continua FLAT em `rows`; o caminho (sponsor → descendentes) define a árvore. Indentação por nível + chevron expand/collapse na coluna primária. Pagination desliga automaticamente."
      code={CODE}
    >
      <DataTable<NetworkRow>
        ref={tableRef}
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        // Tree-data — Fase F.4c. A hierarquia vem só do path.
        getTreeDataPath={getTreeDataPath}
        treeData={{
          defaultExpanded,
          showDescendantCount: showCount,
        }}
        toolbar={{
          title: "Rede de licenciados",
          enableSearch: true,
          enableColumns: true,
          enableDensity: true,
          customLeft: controls,
        }}
        onRowClick={(row) => console.log("Row click:", row.name, row.id)}
        className="max-h-full"
      />
    </ExamplePageLayout>
  );
}

const CODE = `import { DataTable } from "@/components/ui/DataTable";

// Sobe a cadeia de patrocinador até a raiz: ["L-001", "L-010", "L-100"]
const byId = new Map(rows.map((r) => [r.id, r]));
const getTreeDataPath = (row) => {
  const path = [];
  let cur = row;
  while (cur) {
    path.unshift(cur.id);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  return path;
};

<DataTable
  rows={rows}                      // ← rows FLAT (não aninhadas)
  columns={columns}               // ← marque a coluna primária com treeColumn: true
  getRowId={(r) => r.id}
  getTreeDataPath={getTreeDataPath}
  treeData={{
    defaultExpanded: true,        // árvore começa aberta
    showDescendantCount: true,    // mostra "(N)" descendentes
  }}
  toolbar={{ enableSearch: true }}
/>`;
