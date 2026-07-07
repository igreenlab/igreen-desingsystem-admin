import { useMemo, useState } from "react";
import {
  User,
  Hash,
  Phone,
  MapPin,
  Plug,
  Zap,
  Activity,
  FileText,
  Wallet,
  ShieldCheck,
  Gift,
  Tag,
  GitBranch,
  CalendarDays,
  UserPlus,
  Layers,
  Link as LinkIcon,
  MessageSquare,
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
} from "@/components/ui/DataTable";
import type { ToolbarAction } from "@/components/ui/TableToolbar";
import {
  mapaClientes,
  totalClientes,
  num,
  kwh,
  UFS,
  DISTRIBUIDORAS,
  ORIGENS,
  STATUSES,
  type MapaClienteRow,
} from "./mapa-clientes-mock";
import {
  StatusChip,
  ContratoChip,
  FinanceiroChip,
  initialsOf,
} from "./mapa-clientes-ui";
import { MapaClienteDetailPanel } from "./sections/MapaClienteDetailPanel";

const PERIODOS = ["Junho de 2026", "Maio de 2026", "Abril de 2026"];

const TABLE_VIEWS: DataTablePresetView[] = [
  presetView({
    id: "preset:ativos",
    name: "Ativos",
    filters: [{ field: "status", value: "Ativo" }],
  }),
  presetView({
    id: "preset:pendentes",
    name: "Pendentes",
    filters: [{ field: "status", value: "Pendente" }],
  }),
  presetView({
    id: "preset:inadimplentes",
    name: "Inadimplentes",
    filters: [{ field: "statusFinanceiro", value: "Inadimplente" }],
  }),
];

export function MapaClientesPage() {
  const [periodo, setPeriodo] = useState(PERIODOS[0]);
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

  const columns = useMemo<DataTableColumnDef<MapaClienteRow>[]>(
    () => [
      {
        field: "codigo",
        headerName: "Código",
        width: 110,
        icon: Hash,
        type: "text",
        sortable: true,
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">#{value as number}</span>
        ),
      },
      {
        field: "nome",
        headerName: "Cliente",
        minWidth: 240,
        icon: User,
        isPrimary: true,
        sortable: true,
        enableColumnFilter: true,
        filterType: "text",
        render: ({ row }) => (
          <div className="flex w-full min-w-0 items-center gap-gp-md">
            <Avatar color="brand" size="md" aria-label={row.nome}>
              {initialsOf(row.nome)}
            </Avatar>
            <div className="flex min-w-0 flex-col gap-gp-2xs">
              <span className="truncate text-body-sm font-medium text-fg-default">
                {row.nome}
              </span>
              <span className="truncate text-caption-md tabular-nums text-fg-muted">
                #{row.codigo}
              </span>
            </div>
          </div>
        ),
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
        field: "distribuidora",
        headerName: "Distribuidora",
        minWidth: 150,
        icon: Plug,
        sortable: true,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: DISTRIBUIDORAS.map((d) => ({ value: d, label: d })),
      },
      {
        field: "consumoMedio",
        headerName: "Consumo médio",
        width: 150,
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
        field: "status",
        headerName: "Status",
        width: 130,
        icon: Activity,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: STATUSES.map((s) => ({ value: s, label: s })),
        render: ({ row }) => <StatusChip status={row.status} />,
      },
      {
        field: "statusContrato",
        headerName: "Contrato",
        width: 140,
        icon: FileText,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: [
          { value: "Assinado", label: "Assinado" },
          { value: "Pendente", label: "Pendente" },
          { value: "Não enviado", label: "Não enviado" },
        ],
        render: ({ row }) => <ContratoChip status={row.statusContrato} />,
      },
      {
        field: "statusFinanceiro",
        headerName: "Financeiro",
        width: 130,
        icon: Wallet,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: [
          { value: "Em dia", label: "Em dia" },
          { value: "Inadimplente", label: "Inadimplente" },
        ],
        render: ({ row }) => <FinanceiroChip status={row.statusFinanceiro} />,
      },
      {
        field: "andamento",
        headerName: "Andamento",
        minWidth: 200,
        icon: Activity,
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => (
          <span className="truncate text-fg-muted">{value as string}</span>
        ),
      },
      {
        field: "elegibilidade",
        headerName: "Elegível",
        width: 110,
        icon: ShieldCheck,
        enableColumnFilter: true,
        filterType: "boolean",
        render: ({ row }) =>
          row.elegibilidade ? (
            <Chip color="success" variant="soft" size="sm" shape="pill">
              Sim
            </Chip>
          ) : (
            <span className="text-fg-subtle">—</span>
          ),
      },
      {
        field: "cashback",
        headerName: "Cashback",
        width: 110,
        icon: Gift,
        enableColumnFilter: true,
        filterType: "boolean",
        render: ({ row }) => (
          <span className="text-fg-muted">{row.cashback ? "Sim" : "Não"}</span>
        ),
      },
      {
        field: "origem",
        headerName: "Origem",
        width: 130,
        icon: Tag,
        sortable: true,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: ORIGENS.map((o) => ({ value: o, label: o })),
      },
      {
        field: "nomeLicenciado",
        headerName: "Licenciado",
        minWidth: 170,
        icon: GitBranch,
        sortable: true,
        enableColumnFilter: true,
        filterType: "text",
      },
      {
        field: "dataCadastro",
        headerName: "Cadastro",
        width: 120,
        icon: CalendarDays,
        sortable: true,
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">{value as string}</span>
        ),
      },
      {
        field: "dataAtivo",
        headerName: "Data ativo",
        width: 120,
        icon: CalendarDays,
        sortable: true,
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">{(value as string) ?? "—"}</span>
        ),
      },
      {
        field: "nivelRede",
        headerName: "Nível rede",
        width: 100,
        icon: Layers,
        align: "right",
        sortable: true,
        type: "number",
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">N{value as number}</span>
        ),
      },
      {
        field: "validadoSucesso",
        headerName: "Validado",
        width: 110,
        icon: ShieldCheck,
        enableColumnFilter: true,
        filterType: "boolean",
        render: ({ row }) => (
          <span className="text-fg-muted">{row.validadoSucesso ? "Sim" : "Não"}</span>
        ),
      },
      {
        field: "codigoLicenciado",
        headerName: "Cód. licenciado",
        width: 130,
        icon: Hash,
        align: "right",
        sortable: true,
        type: "number",
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">{num(value as number)}</span>
        ),
      },
      {
        field: "codigoPatrocinador",
        headerName: "Cód. patrocinador",
        width: 150,
        icon: Hash,
        align: "right",
        sortable: true,
        type: "number",
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">{num(value as number)}</span>
        ),
      },
      {
        field: "dataNascimento",
        headerName: "Nascimento",
        width: 120,
        icon: CalendarDays,
        sortable: true,
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">{value as string}</span>
        ),
      },
      {
        field: "instalacao",
        headerName: "Instalação",
        width: 130,
        icon: Hash,
        type: "text",
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">{value as string}</span>
        ),
      },
      {
        field: "contratos",
        headerName: "Contratos",
        minWidth: 170,
        icon: FileText,
        render: ({ value }) => (
          <span className="truncate text-fg-muted">{value as string}</span>
        ),
      },
      {
        field: "statusAssinaturaCliente",
        headerName: "Assin. cliente",
        width: 160,
        icon: FileText,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: [
          { value: "ASSINADO", label: "Assinado" },
          { value: "AGUARDANDO ASSINATURA", label: "Aguardando" },
        ],
        render: ({ value }) => (
          <Chip
            color={value === "ASSINADO" ? "success" : "warning"}
            variant="soft"
            size="sm"
            shape="pill"
          >
            {value === "ASSINADO" ? "Assinado" : "Aguardando"}
          </Chip>
        ),
      },
      {
        field: "dataAssinaturaCliente",
        headerName: "Data assin. cliente",
        width: 150,
        icon: CalendarDays,
        sortable: true,
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">{(value as string) ?? "—"}</span>
        ),
      },
      {
        field: "statusAssinaturaIgreen",
        headerName: "Assin. iGreen",
        width: 160,
        icon: FileText,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: [
          { value: "ASSINADO", label: "Assinado" },
          { value: "AGUARDANDO ASSINATURA", label: "Aguardando" },
        ],
        render: ({ value }) => (
          <Chip
            color={value === "ASSINADO" ? "success" : "warning"}
            variant="soft"
            size="sm"
            shape="pill"
          >
            {value === "ASSINADO" ? "Assinado" : "Aguardando"}
          </Chip>
        ),
      },
      {
        field: "dataAssinaturaIgreen",
        headerName: "Data assin. iGreen",
        width: 150,
        icon: CalendarDays,
        sortable: true,
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">{(value as string) ?? "—"}</span>
        ),
      },
      {
        field: "observacao",
        headerName: "Observação",
        minWidth: 200,
        icon: MessageSquare,
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => (
          <span className="truncate text-fg-muted">{(value as string) || "—"}</span>
        ),
      },
      {
        field: "idconsultor",
        headerName: "ID consultor",
        width: 120,
        icon: Hash,
        align: "right",
        sortable: true,
        type: "number",
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">{num(value as number)}</span>
        ),
      },
      {
        field: "linkAssinatura",
        headerName: "Link assinatura",
        width: 140,
        icon: LinkIcon,
        render: ({ value }) => (
          <a
            href={value as string}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-gp-2xs text-fg-brand hover:underline [&>svg]:size-icon-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <LinkIcon />
            Abrir
          </a>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-gp-2xl">
      <PageHeader
        title="Mapa de Clientes"
        description="Clientes da sua rede — status, contrato, financeiro e consumo. Recorte por status, UF, distribuidora e período."
        badge={
          <Chip color="primary" variant="soft" size="sm" shape="rounded">
            {num(totalClientes)} clientes
          </Chip>
        }
        actions={
          <Button variant="filled" color="primary" size="md" iconLeft={<UserPlus />}>
            Novo cliente
          </Button>
        }
      />

      <DataTable<MapaClienteRow>
        rows={mapaClientes}
        columns={columns}
        getRowId={(r) => r.id}
        persistId="mapa-clientes"
        allowCreateView={false}
        autoFit
        showTotalizers
        defaultViews={TABLE_VIEWS}
        showEmptyFilterChips={["status", "uf", "distribuidora", "statusFinanceiro"]}
        toolbar={{
          title: "Clientes",
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
        onRowClick={(row) => setDetailId(row.id)}
        className="min-h-0 flex-1"
      />

      <MapaClienteDetailPanel
        clienteId={detailId}
        onClose={() => setDetailId(null)}
      />
    </div>
  );
}
