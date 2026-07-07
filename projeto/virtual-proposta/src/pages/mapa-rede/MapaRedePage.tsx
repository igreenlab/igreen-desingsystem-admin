import { useMemo, useState } from "react";
import {
  Network,
  Coins,
  Users,
  MapPin,
  Phone,
  Eye,
  MessageCircle,
  CalendarDays,
  UserPlus,
  Layers,
  Hash,
  User,
  GraduationCap,
  BadgeCheck,
  GitBranch,
  Sparkles,
  FileText,
  ShieldCheck,
  ListTree,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/avatar-ig";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import {
  DataTable,
  presetView,
  type DataTableColumnDef,
  type DataTablePresetView,
  type DataTableListConfig,
  type DataTableViewMode,
} from "@/components/ui/DataTable";
import type { ToolbarAction } from "@/components/ui/TableToolbar";
import {
  mapaRede,
  getTreeDataPath,
  subtreeLabel,
  patrocinadorNome,
  formatNum,
  kwh,
  totalRede,
  GRADUACOES,
  UFS,
  type MapaRedeNode,
  type StatusLicenca,
} from "./mapa-rede-mock";
import {
  GradChip,
  ProChip,
  initialsOf,
  avatarColorForLevel,
} from "./mapa-rede-ui";
import { MapaRedeDetailPanel } from "./sections/MapaRedeDetailPanel";

const PERIODOS = ["Junho de 2026", "Maio de 2026", "Abril de 2026"];

const STATUS_LIC: Record<StatusLicenca, "success" | "warning" | "danger"> = {
  Ativa: "success",
  Pendente: "warning",
  Vencida: "danger",
};

/* ── card da LISTA (viewMode="list") — igual ao exemplo #/mapa-rede,
      menos campos e "horário" trocado por ligações ──────────────────── */
function MetaInline({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-gp-xs text-body-sm text-fg-muted [&>svg]:size-icon-sm [&>svg]:text-fg-subtle">
      {icon}
      {children}
    </span>
  );
}

function renderListCard(c: MapaRedeNode, depth: number) {
  return (
    <div className="flex w-full items-center gap-gp-xl">
      <span className="grid size-form-md shrink-0 place-items-center rounded-radius-md bg-bg-muted text-caption-sm font-semibold text-fg-muted [font-variant-numeric:tabular-nums]">
        N{depth + 1}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-gp-sm">
        <div className="flex flex-wrap items-center gap-gp-sm">
          <span className="truncate text-body-md font-semibold text-fg-default">
            {c.nome}
          </span>
          <GradChip graduacao={c.graduacao} />
          {c.pro && <ProChip />}
        </div>

        <div className="flex flex-wrap items-center gap-x-gp-2xl gap-y-gp-2xs">
          <MetaInline icon={<Coins />}>
            <strong className="font-semibold tabular-nums text-fg-default">
              {formatNum(c.gp)}
            </strong>{" "}
            GP
          </MetaInline>
          <MetaInline icon={<Users />}>
            <strong className="font-semibold tabular-nums text-fg-default">
              {formatNum(c.clientesAtivos)}
            </strong>{" "}
            clientes
          </MetaInline>
          {subtreeLabel(c) && (
            <MetaInline icon={<Network />}>{subtreeLabel(c)}</MetaInline>
          )}
          <MetaInline icon={<MapPin />}>
            {c.cidade}/{c.uf}
          </MetaInline>
        </div>
      </div>

      {/* lugar do "horário" no exemplo → ligações da rede do nível (badge) */}
      <Chip
        color="neutral"
        variant="soft"
        size="sm"
        shape="rounded"
        className="hidden shrink-0 md:inline-flex"
      >
        <span className="inline-flex items-center gap-gp-2xs tabular-nums [&>svg]:size-icon-xs">
          <ListTree />
          {formatNum(c.ligacoes)} ligações
        </span>
      </Chip>
    </div>
  );
}

const TABLE_VIEWS: DataTablePresetView[] = [
  presetView({
    id: "preset:diretos",
    name: "Diretos",
    filters: [{ field: "nivel", value: 1 }],
  }),
  presetView({
    id: "preset:pro",
    name: "PRO",
    filters: [{ field: "pro", value: true }],
  }),
  presetView({
    id: "preset:sp",
    name: "SP",
    filters: [{ field: "uf", value: "SP" }],
  }),
];

export function MapaRedePage() {
  const [periodo, setPeriodo] = useState(PERIODOS[0]);
  const [viewMode, setViewMode] = useState<DataTableViewMode>("table");
  const [detailId, setDetailId] = useState<string | null>(null);

  const periodoAction: ToolbarAction = {
    kind: "dropdown",
    id: "periodo",
    label: periodo,
    icon: <CalendarDays />,
    hideChevron: true,
    items: PERIODOS.map((p) => ({
      label: p,
      active: p === periodo,
      onClick: () => setPeriodo(p),
    })),
  };

  const listConfig = useMemo<DataTableListConfig<MapaRedeNode>>(
    () => ({
      hierarchical: true,
      defaultExpanded: true,
      getPath: getTreeDataPath, // árvore só na Lista — tabela fica flat+paginada
      renderItem: (row, state) => renderListCard(row, state.depth),
      getMenuItems: (row) => [
        { label: "Ver detalhe", icon: <Eye />, onClick: () => setDetailId(row.id) },
        {
          label: "WhatsApp",
          icon: <MessageCircle />,
          onClick: () => window.open("https://wa.me/", "_blank"),
        },
      ],
    }),
    [],
  );

  const columns = useMemo<DataTableColumnDef<MapaRedeNode>[]>(
    () => [
      {
        field: "nivel",
        headerName: "Nível",
        width: 90,
        icon: Layers,
        sortable: true,
        type: "number",
        enableColumnFilter: true,
        filterType: "number",
        render: ({ value }) => (
          <span className="inline-flex items-center justify-center rounded-radius-full bg-bg-muted px-pad-sm py-[1px] text-caption-sm font-semibold tabular-nums text-fg-muted">
            N{value as number}
          </span>
        ),
      },
      {
        field: "nome",
        headerName: "Licenciado",
        width: 440,
        minWidth: 240,
        icon: User,
        treeColumn: true,
        isPrimary: true,
        sortable: true,
        enableColumnFilter: true,
        filterType: "text",
        render: ({ row }) => (
          <span className="flex min-w-0 items-center gap-gp-sm">
            <Avatar
              size="sm"
              colorHex={avatarColorForLevel(row.nivel)}
              aria-label={row.nome}
            >
              {initialsOf(row.nome)}
            </Avatar>
            <span className="truncate font-medium text-fg-default">
              {row.nome}
            </span>
          </span>
        ),
      },
      {
        field: "idconsultor",
        headerName: "ID",
        width: 110,
        icon: Hash,
        type: "text",
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">#{value as number}</span>
        ),
      },
      {
        field: "parentId",
        headerName: "Patrocinador",
        minWidth: 170,
        icon: GitBranch,
        render: ({ row }) => (
          <span className="truncate text-fg-default">{patrocinadorNome(row)}</span>
        ),
      },
      {
        field: "graduacao",
        headerName: "Graduação",
        width: 160,
        icon: GraduationCap,
        sortable: true,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: GRADUACOES.map((g) => ({ value: g, label: g })),
        render: ({ row }) => <GradChip graduacao={row.graduacao} />,
      },
      {
        field: "celular",
        headerName: "Celular",
        width: 160,
        icon: Phone,
        type: "text",
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => (
          <a
            href={`tel:${String(value).replace(/\D/g, "")}`}
            className="tabular-nums text-fg-brand hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {value as string}
          </a>
        ),
      },
      {
        field: "cidade",
        headerName: "Cidade",
        minWidth: 150,
        icon: MapPin,
        sortable: true,
        enableColumnFilter: true,
        filterType: "text",
      },
      {
        field: "uf",
        headerName: "UF",
        width: 80,
        icon: MapPin,
        sortable: true,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: UFS.map((u) => ({ value: u, label: u })),
      },
      {
        field: "gp",
        headerName: "GP Qualificável",
        width: 150,
        icon: Coins,
        align: "right",
        sortable: true,
        type: "number",
        aggregate: "sum",
        aggregateFormatter: (v) => kwh(v),
        valueFormatter: (v) => kwh(v as number),
        render: ({ value }) => (
          <span className="tabular-nums text-fg-default">{kwh(value as number)}</span>
        ),
      },
      {
        field: "gi",
        headerName: "GI Qualificável",
        width: 150,
        icon: Coins,
        align: "right",
        sortable: true,
        type: "number",
        valueFormatter: (v) => kwh(v as number),
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">{kwh(value as number)}</span>
        ),
      },
      {
        field: "bonificavel",
        headerName: "GT Qualificável",
        width: 150,
        icon: Coins,
        align: "right",
        sortable: true,
        type: "number",
        aggregate: "sum",
        aggregateFormatter: (v) => kwh(v),
        valueFormatter: (v) => kwh(v as number),
        render: ({ value }) => (
          <span className="font-semibold tabular-nums text-fg-success">
            {kwh(value as number)}
          </span>
        ),
      },
      {
        field: "greenPoints",
        headerName: "Green Points",
        width: 130,
        icon: Sparkles,
        align: "right",
        sortable: true,
        type: "number",
        aggregate: "sum",
        aggregateFormatter: (v) => `${formatNum(v)} total`,
        render: ({ value }) => (
          <span className="font-semibold tabular-nums text-fg-brand">
            {formatNum(value as number)}
          </span>
        ),
      },
      {
        field: "clientesAtivos",
        headerName: "Clientes ativos",
        width: 130,
        icon: Users,
        align: "right",
        sortable: true,
        type: "number",
        aggregate: "sum",
        aggregateFormatter: (v) => `${formatNum(v)} total`,
        render: ({ value }) => (
          <span className="tabular-nums text-fg-default">{formatNum(value as number)}</span>
        ),
      },
      {
        field: "licenciadosDiretosAtivos",
        headerName: "Diretos ativos",
        width: 120,
        icon: BadgeCheck,
        align: "right",
        sortable: true,
        render: ({ row }) => (
          <span className="tabular-nums text-fg-default">
            {formatNum(row.licenciadosDiretosAtivos)}/
            {formatNum(row.licenciadosDiretos)}
          </span>
        ),
      },
      {
        field: "diretosMes",
        headerName: "Diretos mês",
        width: 110,
        icon: UserPlus,
        align: "right",
        sortable: true,
        type: "number",
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">{formatNum(value as number)}</span>
        ),
      },
      {
        field: "ligacoes",
        headerName: "Ligações",
        width: 110,
        icon: ListTree,
        align: "right",
        sortable: true,
        type: "number",
        aggregate: "sum",
        aggregateFormatter: (v) => `${formatNum(v)} total`,
        render: ({ value }) => (
          <span className="tabular-nums text-fg-default">{formatNum(value as number)}</span>
        ),
      },
      {
        field: "tipoLicenca",
        headerName: "Tipo",
        width: 90,
        icon: FileText,
        sortable: true,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: [
          { value: "PJ", label: "PJ" },
          { value: "PF", label: "PF" },
        ],
        render: ({ value }) => (
          <span className="text-fg-muted">{value as string}</span>
        ),
      },
      {
        field: "statusLicenca",
        headerName: "Status",
        width: 120,
        icon: ShieldCheck,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: [
          { value: "Ativa", label: "Ativa" },
          { value: "Pendente", label: "Pendente" },
          { value: "Vencida", label: "Vencida" },
        ],
        render: ({ row }) => (
          <Chip color={STATUS_LIC[row.statusLicenca]} variant="soft" size="sm" shape="pill">
            {row.statusLicenca}
          </Chip>
        ),
      },
      {
        field: "preQualificacao",
        headerName: "Pré-qual.",
        width: 120,
        icon: BadgeCheck,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: [
          { value: "Apto", label: "Apto" },
          { value: "Pendente", label: "Pendente" },
        ],
        render: ({ row }) => (
          <Chip
            color={row.preQualificacao === "Apto" ? "success" : "neutral"}
            variant="soft"
            size="sm"
            shape="pill"
          >
            {row.preQualificacao}
          </Chip>
        ),
      },
      {
        field: "pro",
        headerName: "PRO",
        width: 90,
        icon: BadgeCheck,
        enableColumnFilter: true,
        filterType: "boolean",
        render: ({ row }) => (row.pro ? <ProChip /> : <span className="text-fg-subtle">—</span>),
      },
    ],
    [],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-gp-2xl">
      <PageHeader
        title="Mapa de Rede"
        description="Navegue sua downline por níveis (líder → N1 → N2…). Alterne entre tabela (árvore) e lista pelo toggle da toolbar; recorte por graduação, UF, PRO e período."
        badge={
          <Chip color="primary" variant="soft" size="sm" shape="rounded">
            {formatNum(totalRede)} consultores
          </Chip>
        }
        actions={
          <Button variant="filled" color="primary" size="md" iconLeft={<UserPlus />}>
            Convidar
          </Button>
        }
      />

      <DataTable<MapaRedeNode>
        rows={mapaRede}
        columns={columns}
        getRowId={(r) => r.id}
        getTreeDataPath={getTreeDataPath}
        treeData={{ defaultExpanded: true, showDescendantCount: true }}
        persistId="mapa-rede"
        allowCreateView={false}
        autoFit
        showTotalizers
        defaultViews={TABLE_VIEWS}
        showEmptyFilterChips={["graduacao", "uf", "pro"]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        listConfig={listConfig}
        toolbar={{
          title: "Rede",
          enableSearch: true,
          enableFilters: true,
          enableColumns: true,
          enableDensity: true,
          actions: [periodoAction],
        }}
        onRowClick={(row) => setDetailId(row.id)}
        className="min-h-0 flex-1"
      />

      <MapaRedeDetailPanel nodeId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}
