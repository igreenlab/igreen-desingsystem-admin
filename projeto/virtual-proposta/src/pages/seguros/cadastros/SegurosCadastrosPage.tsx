import { useMemo, useState } from "react";
import { Calendar, ChevronDown, Check, MapPin, Hash, ShieldCheck, Building2, Wallet, User, GraduationCap, CalendarDays, CircleDot } from "lucide-react";
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
  cadastros,
  totalCadastros,
  PERIODOS,
  STATUS_LABEL,
  brl,
  fmtDate,
  type CadastroRow,
  type CadastroStatus,
} from "./seguros-cadastros-mock";

const STATUS_CHIP: Record<CadastroStatus, "success" | "warning" | "info" | "danger"> = {
  emitida: "success",
  analise: "info",
  vistoria: "warning",
  aguardando: "warning",
  recusada: "danger",
  cancelada: "danger",
};

const TABLE_VIEWS: DataTablePresetView[] = [
  presetView({
    id: "preset:pendentes",
    name: "Pendentes",
    filters: [{ field: "status", operator: "isAnyOf", value: ["analise", "vistoria", "aguardando"] }],
    sort: [{ field: "data", direction: "desc" }],
  }),
  presetView({
    id: "preset:emitidas",
    name: "Emitidas",
    filters: [{ field: "status", value: "emitida" }],
  }),
];

export function SegurosCadastrosPage() {
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

  const columns = useMemo<DataTableColumnDef<CadastroRow>[]>(
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
        width: 150,
        icon: CircleDot,
        sortable: true,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: (Object.keys(STATUS_LABEL) as CadastroStatus[]).map((s) => ({
          value: s,
          label: STATUS_LABEL[s],
        })),
        render: ({ value }) => (
          <Chip color={STATUS_CHIP[value as CadastroStatus]} variant="soft" size="sm" shape="rounded">
            {STATUS_LABEL[value as CadastroStatus]}
          </Chip>
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
        filterOptions: [...new Set(cadastros.map((c) => c.uf))].map((u) => ({ value: u, label: u })),
      },
      {
        field: "ramo",
        headerName: "Ramo",
        width: 150,
        icon: ShieldCheck,
        sortable: true,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: [...new Set(cadastros.map((c) => c.ramo))].map((r) => ({
          value: r,
          label: r,
        })),
      },
      {
        field: "seguradora",
        headerName: "Seguradora",
        minWidth: 160,
        icon: Building2,
        sortable: true,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: [...new Set(cadastros.map((c) => c.seguradora))].map((s) => ({
          value: s,
          label: s,
        })),
      },
      {
        field: "premio",
        headerName: "Prêmio",
        width: 150,
        icon: Wallet,
        align: "right",
        sortable: true,
        type: "currency",
        aggregate: "sum",
        aggregateFormatter: (v) => brl(v),
        valueFormatter: (v) => brl(v as number),
        render: ({ value }) => (
          <span className="tabular-nums text-fg-default">{brl(value as number)}</span>
        ),
      },
      {
        field: "corretor",
        headerName: "Corretor",
        minWidth: 170,
        icon: GraduationCap,
        sortable: true,
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => <span className="truncate text-fg-muted">{value as string}</span>,
      },
      {
        field: "data",
        headerName: "Cadastro",
        width: 120,
        icon: CalendarDays,
        align: "right",
        sortable: true,
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">{fmtDate(value as string)}</span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-gp-2xl">
      <PageHeader
        title="Cadastros"
        description="Propostas de seguro e seus estágios de emissão."
        actions={periodSelector}
      />

      <DataTable<CadastroRow>
        rows={cadastros}
        columns={columns}
        getRowId={(r) => r.id}
        persistId="seguros-cadastros"
        allowCreateView={false}
        autoFit
        showTotalizers
        defaultViews={TABLE_VIEWS}
        toolbar={{
          title: `${totalCadastros} propostas`,
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
