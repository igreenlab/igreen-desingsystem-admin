import { useMemo, useState } from "react";
import {
  User,
  Activity,
  Crown,
  GraduationCap,
  MapPin,
  Hash,
  SquareArrowOutUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/avatar-ig";
import { Chip } from "@/components/ui/Chip";
import {
  DataTable,
  presetView,
  type DataTableColumnDef,
  type DataTablePresetView,
} from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import { ProMakerDetailPanel } from "./sections/ProMakerDetailPanel";
import {
  proMaker,
  ATIVIDADES,
  num,
  atividadesConcluidas,
  type ProMakerConsultor,
} from "./pro-maker-mock";
import { StatusPill, StepBar, initialsOf } from "./pro-maker-ui";

/* Row = consultor + campos derivados (pra ordenar/filtrar nativo da tabela). */
type ProMakerRow = ProMakerConsultor & {
  concluidas: number;
  statusGroup: "construcao" | "pro";
  uf: string;
};

const GRADS = ["Executivo Green", "Líder Green", "Consultor", "Licenciado"];
const UFS = ["MG", "PB", "PR"];

export function ProMakerPage() {
  const [detailId, setDetailId] = useState<string | null>(null);

  const rows = useMemo<ProMakerRow[]>(
    () =>
      proMaker.map((c) => ({
        ...c,
        concluidas: atividadesConcluidas(c),
        statusGroup: c.isPro ? "pro" : "construcao",
        uf: c.cidade.split("/")[1] ?? "",
      })),
    [],
  );

  const columns = useMemo<DataTableColumnDef<ProMakerRow>[]>(
    () => [
      {
        field: "nome",
        headerName: "Licenciado",
        minWidth: 260,
        icon: User,
        isPrimary: true,
        sortable: true,
        enableColumnFilter: true,
        filterType: "text",
        aggregate: (rows) => (
          <span className="text-fg-muted">{rows.length} licenciados</span>
        ),
        render: ({ row }) => (
          <div className="flex w-full min-w-0 items-center gap-gp-md">
            <Avatar color="brand" size="md" aria-label={row.nome}>
              {initialsOf(row.nome)}
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-gp-2xs">
              <span className="flex min-w-0 items-center gap-gp-xs">
                <span className="truncate text-body-sm font-medium text-fg-default">
                  {row.nome}
                </span>
                {row.direto && (
                  <Chip color="primary" variant="soft" size="sm" shape="pill">
                    Direto
                  </Chip>
                )}
              </span>
              <span className="truncate text-caption-md tabular-nums text-fg-muted">
                ID {row.idconsultor}
              </span>
            </div>
            <span
              className="grid size-[24px] shrink-0 place-items-center rounded-radius-sm border border-border-subtle bg-bg-canvas text-fg-muted shadow-sh-sm dark:bg-bg-muted [&_svg]:size-icon-xs"
              aria-hidden
            >
              <SquareArrowOutUpRight strokeWidth={2} />
            </span>
          </div>
        ),
      },
      {
        field: "statusGroup",
        headerName: "Status",
        width: 150,
        icon: Activity,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: [
          { value: "construcao", label: "Em construção" },
          { value: "pro", label: "É PRO" },
        ],
        valueFormatter: (v) => (v === "pro" ? "É PRO" : "Em construção"),
        aggregate: (rows) => {
          const pros = rows.filter((r) => r.isPro).length;
          return (
            <span className="text-fg-muted tabular-nums">
              {pros} PRO · {rows.length - pros} constr.
            </span>
          );
        },
        render: ({ row }) => <StatusPill c={row} />,
      },
      {
        field: "concluidas",
        headerName: "Progresso",
        minWidth: 220,
        icon: Activity,
        sortable: true,
        aggregate: "avg",
        aggregateFormatter: (v) =>
          `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}/${ATIVIDADES.length} médio`,
        render: ({ row }) => {
          const zero = row.concluidas === 0;
          return (
            <div
              className={cn(
                "flex w-full items-center gap-gp-md",
                zero && "opacity-55",
              )}
            >
              <StepBar
                total={ATIVIDADES.length}
                done={row.concluidas}
                className="min-w-[120px] flex-1"
              />
              <span
                className={cn(
                  "shrink-0 text-caption-sm font-bold tabular-nums",
                  zero ? "text-fg-subtle" : "text-fg-default",
                )}
              >
                {row.concluidas}/{ATIVIDADES.length}
              </span>
            </div>
          );
        },
      },
      {
        field: "diretosPro",
        headerName: "Diretos PRO",
        width: 140,
        icon: Crown,
        align: "right",
        sortable: true,
        type: "number",
        enableColumnFilter: true,
        filterType: "number",
        aggregate: "sum",
        aggregateFormatter: (v) => `${num(v)} total`,
        render: ({ row }) => (
          <span
            className={cn(
              "inline-flex items-center gap-[3px] font-semibold tabular-nums [&>svg]:size-icon-xs",
              row.diretosPro > 0 ? "text-fg-success" : "text-fg-subtle",
            )}
          >
            <Crown />
            {num(row.diretosPro)}
          </span>
        ),
      },
      {
        field: "cidade",
        headerName: "Cidade",
        minWidth: 180,
        icon: MapPin,
        sortable: true,
        enableColumnFilter: true,
        filterType: "text",
      },
      {
        field: "uf",
        headerName: "UF",
        width: 76,
        icon: MapPin,
        sortable: true,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: UFS.map((u) => ({ value: u, label: u })),
      },
      {
        field: "graduacao",
        headerName: "Graduação",
        minWidth: 170,
        icon: GraduationCap,
        sortable: true,
        enableColumnFilter: true,
        filterType: "multiSelect",
        filterOptions: GRADS.map((g) => ({ value: g, label: g })),
      },
      {
        field: "nivel",
        headerName: "Nível",
        width: 80,
        icon: Hash,
        align: "right",
        sortable: true,
        type: "number",
      },
    ],
    [],
  );

  const defaultViews = useMemo<DataTablePresetView[]>(
    () => [
      presetView({
        id: "preset:construcao",
        name: "Em construção",
        filters: [{ field: "statusGroup", value: "construcao" }],
        sort: [{ field: "concluidas", direction: "asc" }],
      }),
      presetView({
        id: "preset:pro",
        name: "É PRO",
        filters: [{ field: "statusGroup", value: "pro" }],
        sort: [{ field: "diretosPro", direction: "desc" }],
      }),
    ],
    [],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-gp-2xl">
      <PageHeader
        title="Pro Maker"
        description="Construção de Licenciado PRO — quem está construindo (e o que falta) e quem já é PRO."
      />

      <DataTable<ProMakerRow>
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        persistId="pro-maker"
        allowCreateView={false}
        autoFit
        showTotalizers
        defaultViews={defaultViews}
        showEmptyFilterChips={["graduacao", "uf", "diretosPro", "statusGroup"]}
        toolbar={{
          title: "Licenciados",
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
        onRowClick={(row) => setDetailId(row.id)}
        className="min-h-0 flex-1"
      />

      <ProMakerDetailPanel
        consultorId={detailId}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}
