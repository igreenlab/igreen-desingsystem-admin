import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  Check,
  MapPin,
  Hash,
  User,
  GraduationCap,
  CalendarDays,
  CircleDot,
  AlertTriangle,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shadcn/dropdown-menu";
import {
  DataTable,
  presetView,
  type DataTableColumnDef,
  type DataTablePresetView,
} from "@/components/ui/DataTable";
import {
  devolutivas,
  totalDevolutivas,
  totalAbertas,
  totalResolvidas,
  totalVencidas,
  MOTIVO_SPLIT,
  MOTIVO_COLOR,
  LICENCIADO_RANKING,
  proximoPrazo,
  PERIODOS,
  STATUS_LABEL,
  num,
  fmtDate,
  fmtDayMonth,
  type DevolutivaRow,
  type DevolutivaStatus,
  type DevolutivaMotivo,
} from "./devolutivas-mock";

const STATUS_CHIP: Record<DevolutivaStatus, "warning" | "info" | "success" | "danger"> = {
  pendente: "warning",
  reenviado: "info",
  resolvido: "success",
  vencida: "danger",
};

const TABLE_VIEWS: DataTablePresetView[] = [
  presetView({
    id: "preset:em-aberto",
    name: "Em aberto",
    filters: [{ field: "status", operator: "isAnyOf", value: ["pendente", "reenviado", "vencida"] }],
    sort: [{ field: "prazo", direction: "asc" }],
  }),
  presetView({
    id: "preset:vencidas",
    name: "Vencidas",
    filters: [{ field: "status", value: "vencida" }],
  }),
];

/** Card único — padrão "Subscription Billing" do chart-showcase, com título e
 *  subtítulo no topo do próprio card: número de destaque + barra segmentada por
 *  motivo + resolvidas na semana + faixa de alerta com ação. */
function VisaoGeralCard() {
  return (
    <section className="flex flex-col rounded-radius-lg border border-border-subtle bg-bg-surface p-pad-3xl shadow-sh-sm">
      <div className="flex items-start justify-between gap-gp-md">
        <div className="flex flex-col gap-gp-2xs">
          <p className="text-title-md font-semibold leading-tight text-fg-default">Devolutivas</p>
          <p className="text-body-sm text-fg-muted">
            Acompanhe motivos, prazos e a resolução das devolutivas.
          </p>
        </div>
        <MoreVertical className="size-icon-sm shrink-0 text-fg-muted" />
      </div>

      <p className="mt-pad-3xl text-caption-md text-fg-muted">Devolutivas em aberto</p>
      <p className="text-heading-sm font-bold tabular-nums text-fg-default">{num(totalAbertas)}</p>

      <div className="mt-pad-2xl flex h-[8px] gap-[3px] overflow-hidden rounded-radius-full">
        {MOTIVO_SPLIT.map((m) => (
          <span key={m.motivo} style={{ width: `${m.pct}%`, background: m.color }} />
        ))}
      </div>
      <div className="mt-pad-md flex flex-wrap gap-gp-lg">
        {MOTIVO_SPLIT.map((m) => (
          <span key={m.motivo} className="flex items-center gap-gp-2xs text-caption-sm text-fg-muted">
            <span className="size-[8px] rounded-[2px]" style={{ background: m.color }} />
            <span className="font-semibold text-fg-default">{m.pct}%</span> {m.motivo}
          </span>
        ))}
      </div>

      <div className="my-pad-3xl border-t border-border-subtle" />

      <p className="text-body-md font-semibold text-fg-default">
        {num(totalResolvidas)} devolutivas resolvidas esta semana
      </p>
      <div className="mt-pad-md flex items-center justify-between gap-gp-md rounded-radius-base bg-bg-muted px-pad-3xl py-pad-2xl">
        <span className="flex items-center gap-gp-sm text-body-sm text-fg-muted">
          <AlertTriangle className="size-icon-sm shrink-0 text-fg-warning" />
          {num(totalVencidas)} devolutivas vencidas — revisar antes de {fmtDayMonth(proximoPrazo)}.
        </span>
        <button
          type="button"
          className="flex shrink-0 items-center gap-gp-2xs text-body-sm font-medium text-fg-info hover:underline"
        >
          Ver pendências <ExternalLink className="size-icon-xs" />
        </button>
      </div>
    </section>
  );
}

/** Ranking de licenciados com mais devolutivas — barras horizontais. */
function RankingCard() {
  return (
    <section className="flex flex-col rounded-radius-lg border border-border-subtle bg-bg-surface p-pad-3xl shadow-sh-sm">
      <div className="flex items-start justify-between gap-gp-md">
        <div className="flex flex-col gap-gp-2xs">
          <p className="text-title-md font-semibold leading-tight text-fg-default">
            Licenciados com mais ocorrência
          </p>
          <p className="text-body-sm text-fg-muted">Devolutivas por licenciado no período.</p>
        </div>
        <MoreVertical className="size-icon-sm shrink-0 text-fg-muted" />
      </div>

      <div className="mt-pad-3xl flex flex-1 flex-col justify-between gap-gp-lg">
        {LICENCIADO_RANKING.map((r, i) => (
          <div key={r.nome} className="flex items-center gap-gp-md">
            <span className="w-[18px] shrink-0 text-caption-sm font-semibold tabular-nums text-fg-muted">
              {i + 1}
            </span>
            <span className="w-[150px] shrink-0 truncate text-body-sm font-medium text-fg-default">
              {r.nome}
            </span>
            <div className="h-[8px] flex-1 overflow-hidden rounded-radius-full bg-bg-muted">
              <span
                className="block h-full rounded-radius-full bg-bg-warning"
                style={{ width: `${r.pct}%` }}
              />
            </div>
            <span className="w-[24px] shrink-0 text-right text-body-sm font-semibold tabular-nums text-fg-default">
              {r.count}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DevolutivasPage() {
  const [periodo, setPeriodo] = useState(PERIODOS[0]);

  const periodSelector = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button color="secondary" variant="outline" size="sm" iconLeft={<Calendar />} iconRight={<ChevronDown />}>
          {periodo}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {PERIODOS.map((p) => (
          <DropdownMenuItem
            key={p}
            onSelect={() => setPeriodo(p)}
            className={cn(periodo === p && "bg-bg-brand-subtle text-fg-brand")}
          >
            <Check className={periodo === p ? "opacity-100" : "opacity-0"} />
            {p}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const columns = useMemo<DataTableColumnDef<DevolutivaRow>[]>(
    () => [
      {
        field: "cliente",
        headerName: "Cliente",
        minWidth: 200,
        icon: User,
        isPrimary: true,
        sortable: true,
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => (
          <span className="truncate font-medium text-fg-default">{value as string}</span>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 140,
        icon: CircleDot,
        sortable: true,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: (Object.keys(STATUS_LABEL) as DevolutivaStatus[]).map((s) => ({
          value: s,
          label: STATUS_LABEL[s],
        })),
        render: ({ value }) => (
          <Chip color={STATUS_CHIP[value as DevolutivaStatus]} variant="soft" size="sm" shape="rounded">
            {STATUS_LABEL[value as DevolutivaStatus]}
          </Chip>
        ),
      },
      {
        field: "motivo",
        headerName: "Motivo",
        width: 170,
        icon: AlertTriangle,
        sortable: true,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: (Object.keys(MOTIVO_COLOR) as DevolutivaMotivo[]).map((m) => ({
          value: m,
          label: m,
        })),
        render: ({ value }) => (
          <span className="flex items-center gap-gp-sm text-fg-default">
            <span
              className="size-[8px] shrink-0 rounded-[2px]"
              style={{ background: MOTIVO_COLOR[value as DevolutivaMotivo] }}
            />
            {value as string}
          </span>
        ),
      },
      {
        field: "documento",
        headerName: "Documento",
        width: 170,
        icon: Hash,
        type: "text",
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => <span className="tabular-nums text-fg-muted">{value as string}</span>,
      },
      {
        field: "cidade",
        headerName: "Cidade",
        minWidth: 140,
        icon: MapPin,
        sortable: true,
        enableColumnFilter: true,
        filterType: "text",
      },
      {
        field: "uf",
        headerName: "UF",
        width: 80,
        align: "center",
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: [...new Set(devolutivas.map((d) => d.uf))].map((u) => ({ value: u, label: u })),
      },
      {
        field: "licenciado",
        headerName: "Licenciado",
        minWidth: 170,
        icon: GraduationCap,
        sortable: true,
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => <span className="truncate text-fg-muted">{value as string}</span>,
      },
      {
        field: "abertura",
        headerName: "Abertura",
        width: 120,
        icon: CalendarDays,
        align: "right",
        sortable: true,
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">{fmtDate(value as string)}</span>
        ),
      },
      {
        field: "prazo",
        headerName: "Prazo",
        width: 120,
        icon: CalendarDays,
        align: "right",
        sortable: true,
        render: ({ row }) => (
          <span
            className={cn(
              "tabular-nums",
              row.status === "vencida"
                ? "text-fg-danger"
                : row.status === "resolvido"
                  ? "text-fg-muted"
                  : "text-fg-warning",
            )}
          >
            {fmtDate(row.prazo)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-gp-2xl">
      <PageHeader
        title="Devolutivas"
        description="Cadastros devolvidos por inconsistência — motivo, prazo e resolução."
        actions={periodSelector}
      />

      {/* KPI — card visão geral (Subscription Billing) + ranking */}
      <div className="grid grid-cols-1 items-stretch gap-gp-2xl lg:grid-cols-2">
        <VisaoGeralCard />
        <RankingCard />
      </div>

      {/* Manejo — tabela das devolutivas */}
      <DataTable<DevolutivaRow>
        rows={devolutivas}
        columns={columns}
        getRowId={(r) => r.id}
        persistId="devolutivas-clientes"
        allowCreateView={false}
        autoFit
        showTotalizers
        defaultViews={TABLE_VIEWS}
        toolbar={{
          title: `${totalDevolutivas} devolutivas`,
          enableSearch: true,
          enableFilters: true,
          enableColumns: true,
          enableDensity: true,
        }}
        paginationConfig={{
          enabled: true,
          initialPageSize: 25,
          pageSizeOptions: [10, 25, 50],
        }}
        className="mt-gp-xl max-h-[80vh]"
      />

      <div aria-hidden className="h-pad-3xl shrink-0" />
    </div>
  );
}
