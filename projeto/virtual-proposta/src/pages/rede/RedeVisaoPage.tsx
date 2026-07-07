import { useMemo, useState } from "react";
import {
  Hash,
  MapPin,
  Users,
  Zap,
  TrendingUp,
  Award,
  BadgeCheck,
  Eye,
  MessageCircle,
  CalendarDays,
  UserPlus,
  Layers,
  User,
  GraduationCap,
  Tag,
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
  redeFlat,
  getTreeDataPath,
  subtreeLabel,
  kwh,
  num,
  totalRede,
  GRADUACOES,
  type RedeConsultor,
} from "./rede-mock";
import {
  GradChip,
  TipoChip,
  initialsOf,
  avatarColorForLevel,
} from "./rede-ui";
import { RedeDetailPanel } from "./sections/RedeDetailPanel";

const PERIODOS = ["Junho de 2026", "Maio de 2026", "Abril de 2026"];

/* ── meta inline (mesmo padrão do Mapa de Rede: body-sm + ícone-sm) ──── */
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

/** Mini-stat à direita (estilo "Saúde da rede"): ícone em quadrado arredondado +
 *  valor/label, largura fixa (padroniza os 3, não variam pelo conteúdo). */
function MiniStat({
  icon,
  value,
  label,
  iconClass = "bg-bg-muted text-fg-muted",
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  iconClass?: string;
}) {
  return (
    <div className="hidden w-[150px] shrink-0 items-center gap-gp-md sm:flex">
      <span
        className={`grid size-comp-lg shrink-0 place-items-center rounded-radius-base [&>svg]:size-icon-sm ${iconClass}`}
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-body-md font-semibold tabular-nums text-fg-default">
          {value}
        </span>
        <span className="text-caption-sm text-fg-muted">{label}</span>
      </div>
    </div>
  );
}

/* ── card da LISTA (viewMode="list") ─────────────────────────────────── */
function renderListCard(c: RedeConsultor, depth: number) {
  return (
    <div className="flex w-full items-center gap-gp-xl">
      <span className="grid size-form-md shrink-0 place-items-center rounded-radius-md bg-bg-muted text-caption-sm font-semibold tabular-nums text-fg-muted">
        N{depth + 1}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-gp-sm">
        <div className="flex flex-wrap items-center gap-gp-sm">
          <span className="shrink-0 text-body-sm tabular-nums text-fg-muted">
            #{c.codigo}
          </span>
          <span className="truncate text-body-md font-semibold text-fg-default">
            {c.nome}
          </span>
          <GradChip graduacao={c.graduacao} />
          <TipoChip tipo={c.tipo} />
        </div>
        <div className="flex flex-wrap items-center gap-x-gp-2xl gap-y-gp-2xs">
          <MetaInline icon={<MapPin />}>
            {c.cidade} · {subtreeLabel(c)}
          </MetaInline>
          <MetaInline icon={<Zap />}>GP: {kwh(c.gp)}</MetaInline>
          <MetaInline icon={<TrendingUp />}>GI: {kwh(c.gi)}</MetaInline>
          <MetaInline icon={<Award />}>Bonificável: {kwh(c.bonificavel)}</MetaInline>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-gp-2xl">
        <MiniStat
          icon={<Users />}
          value={num(c.clientes)}
          label="Clientes"
          iconClass="bg-bg-success-muted text-fg-success"
        />
        <MiniStat
          icon={<BadgeCheck />}
          value={`${num(c.licGreen.atual)}/${num(c.licGreen.meta)}`}
          label="Lic. Green"
          iconClass="bg-bg-brand-subtle text-fg-brand"
        />
        <MiniStat
          icon={<Zap />}
          value={kwh(c.volume)}
          label="Volume"
          iconClass="bg-bg-info-muted text-fg-info"
        />
      </div>
    </div>
  );
}

const TABLE_VIEWS: DataTablePresetView[] = [
  presetView({
    id: "preset:diretos",
    name: "Diretos",
    filters: [{ field: "tipo", value: "Direto" }],
  }),
  presetView({
    id: "preset:executivos",
    name: "Executivos",
    filters: [{ field: "graduacao", value: "Executivo Green" }],
  }),
];

export function RedeVisaoPage() {
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

  const listConfig = useMemo<DataTableListConfig<RedeConsultor>>(
    () => ({
      hierarchical: true,
      defaultExpanded: true,
      getPath: getTreeDataPath,
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

  const columns = useMemo<DataTableColumnDef<RedeConsultor>[]>(
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
        field: "codigo",
        headerName: "Código",
        width: 110,
        icon: Hash,
        type: "text",
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">#{value as string}</span>
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
        field: "tipo",
        headerName: "Tipo",
        width: 120,
        icon: Tag,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: [
          { value: "Direto", label: "Direto" },
          { value: "Indireto", label: "Indireto" },
        ],
        render: ({ row }) => <TipoChip tipo={row.tipo} />,
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
        field: "gp",
        headerName: "GP",
        width: 130,
        icon: Zap,
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
        headerName: "GI",
        width: 130,
        icon: Zap,
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
        headerName: "Bonificável",
        width: 140,
        icon: Zap,
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
        field: "clientes",
        headerName: "Clientes",
        width: 110,
        icon: Users,
        align: "right",
        sortable: true,
        type: "number",
        aggregate: "sum",
        aggregateFormatter: (v) => `${num(v)} total`,
        render: ({ value }) => (
          <span className="tabular-nums text-fg-default">{num(value as number)}</span>
        ),
      },
      {
        field: "licGreen",
        headerName: "Lic. Green",
        width: 110,
        icon: UserPlus,
        align: "right",
        render: ({ row }) => (
          <span className="tabular-nums text-fg-default">
            {num(row.licGreen.atual)}/{num(row.licGreen.meta)}
          </span>
        ),
      },
      {
        field: "volume",
        headerName: "Volume",
        width: 140,
        icon: Zap,
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
    ],
    [],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-gp-2xl">
      <PageHeader
        title="Visão da Rede"
        description="Sua rede de consultores por níveis. Alterne entre tabela (árvore) e lista pelo toggle; recorte por graduação, tipo e período."
        badge={
          <Chip color="primary" variant="soft" size="sm" shape="rounded">
            {num(totalRede)} consultores
          </Chip>
        }
        actions={
          <Button variant="filled" color="primary" size="md" iconLeft={<UserPlus />}>
            Convidar
          </Button>
        }
      />

      <DataTable<RedeConsultor>
        rows={redeFlat}
        columns={columns}
        getRowId={(r) => r.id}
        getTreeDataPath={getTreeDataPath}
        treeData={{ defaultExpanded: true, showDescendantCount: true }}
        persistId="rede-visao"
        allowCreateView={false}
        autoFit
        showTotalizers
        defaultViews={TABLE_VIEWS}
        showEmptyFilterChips={["graduacao", "tipo"]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        listConfig={listConfig}
        toolbar={{
          title: "Consultores",
          enableSearch: true,
          enableFilters: true,
          enableColumns: true,
          enableDensity: true,
          actions: [periodoAction],
        }}
        onRowClick={(row) => setDetailId(row.id)}
        className="min-h-0 flex-1"
      />

      <RedeDetailPanel consultorId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}
