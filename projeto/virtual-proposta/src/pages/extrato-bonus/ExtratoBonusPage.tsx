import { useMemo, useState } from "react";
import {
  CalendarDays,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  Tag,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import {
  DataTable,
  presetView,
  type DataTableColumnDef,
  type DataTablePresetView,
} from "@/components/ui/DataTable";
import type { ToolbarAction } from "@/components/ui/TableToolbar";
import {
  extratoBonus,
  extratoKpis,
  brl,
  dateBR,
  totalLancamentos,
  type ExtratoBonusRow,
} from "./extrato-bonus-mock";

const PERIODOS = ["Junho de 2026", "Maio de 2026", "Abril de 2026"];

const TABLE_VIEWS: DataTablePresetView[] = [
  presetView({
    id: "preset:bonificacoes",
    name: "Bonificações",
    filters: [{ field: "tipo", value: "Bonificação" }],
  }),
  presetView({
    id: "preset:saques",
    name: "Saques",
    filters: [{ field: "tipo", value: "Saque" }],
  }),
];

export function ExtratoBonusPage() {
  const [periodo, setPeriodo] = useState(PERIODOS[0]);
  const kpis = useMemo(() => extratoKpis(), []);

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

  const columns = useMemo<DataTableColumnDef<ExtratoBonusRow>[]>(
    () => [
      {
        field: "dtlancamento",
        headerName: "Data",
        width: 120,
        icon: CalendarDays,
        sortable: true,
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">
            {dateBR(value as string)}
          </span>
        ),
      },
      {
        field: "tipo",
        headerName: "Tipo",
        width: 150,
        icon: Tag,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: [
          { value: "Bonificação", label: "Bonificação" },
          { value: "Saque", label: "Saque" },
        ],
        render: ({ row }) =>
          row.tipo === "Bonificação" ? (
            <Chip color="success" variant="soft" size="sm" shape="pill">
              Bonificação
            </Chip>
          ) : (
            <Chip color="warning" variant="soft" size="sm" shape="pill">
              Saque
            </Chip>
          ),
      },
      {
        field: "historico",
        headerName: "Histórico",
        minWidth: 360,
        icon: FileText,
        isPrimary: true,
        sortable: true,
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => (
          <span className="truncate text-fg-default">{value as string}</span>
        ),
      },
      {
        field: "bonificacoes",
        headerName: "Bonificações",
        width: 160,
        icon: ArrowDownLeft,
        align: "right",
        sortable: true,
        type: "number",
        aggregate: "sum",
        aggregateFormatter: (v) => brl(v),
        valueFormatter: (v) => brl(v as number),
        render: ({ value }) => {
          const n = value as number;
          if (n === 0) return <span className="text-fg-subtle">—</span>;
          return (
            <span className="tabular-nums font-medium text-fg-success">
              {brl(n)}
            </span>
          );
        },
      },
      {
        field: "saques",
        headerName: "Saques",
        width: 160,
        icon: ArrowUpRight,
        align: "right",
        sortable: true,
        type: "number",
        aggregate: "sum",
        aggregateFormatter: (v) => brl(v),
        valueFormatter: (v) => brl(v as number),
        render: ({ value }) => {
          const n = value as number;
          if (n === 0) return <span className="text-fg-subtle">—</span>;
          return (
            <span className="tabular-nums font-medium text-fg-danger">
              {brl(n)}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-gp-2xl">
      <PageHeader
        title="Extrato de Bônus"
        description="Lançamentos de bonificações e saques da sua conta. Recorte por tipo e período."
        badge={
          <Chip color="primary" variant="soft" size="sm" shape="rounded">
            Saldo {brl(kpis.saldo)}
          </Chip>
        }
      />

      <DataTable<ExtratoBonusRow>
        rows={extratoBonus}
        columns={columns}
        getRowId={(r) => r.id}
        persistId="extrato-bonus"
        allowCreateView={false}
        autoFit
        showTotalizers
        defaultViews={TABLE_VIEWS}
        showEmptyFilterChips={["tipo"]}
        toolbar={{
          title: `${totalLancamentos} lançamentos`,
          enableSearch: true,
          enableFilters: true,
          enableColumns: true,
          enableDensity: true,
          actions: [periodoAction],
        }}
        paginationConfig={{
          enabled: true,
          initialPageSize: 25,
          pageSizeOptions: [10, 25, 50],
        }}
        className="min-h-0 flex-1"
      />
    </div>
  );
}
