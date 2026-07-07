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
  ShieldCheck,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  type LucideIcon,
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
  apolices,
  totalApolices,
  financeiro,
  RAMOS,
  PERIODOS,
  STATUS_LABEL,
  num,
  brl,
  brlMil,
  fmtDate,
  type ApoliceRow,
  type ParcelaStatus,
} from "./seguros-financeiro-mock";

const STATUS_CHIP: Record<ParcelaStatus, "success" | "warning"> = {
  paga: "success",
  pendente: "warning",
};

const TABLE_VIEWS: DataTablePresetView[] = [
  presetView({
    id: "preset:pagas",
    name: "1ª parcela paga",
    filters: [{ field: "parcela", value: "paga" }],
  }),
  presetView({
    id: "preset:pendentes",
    name: "1ª parcela pendente",
    filters: [{ field: "parcela", value: "pendente" }],
  }),
];

type KpiTone = "neutral" | "success" | "brand" | "info" | "warning" | "danger";
const KPI_ICON_BOX: Record<KpiTone, string> = {
  neutral: "bg-bg-muted text-fg-default",
  success: "bg-bg-success-muted text-fg-success",
  brand: "bg-bg-brand-subtle text-fg-brand",
  info: "bg-bg-info-muted text-fg-info",
  warning: "bg-bg-warning-muted text-fg-warning",
  danger: "bg-bg-danger-muted text-fg-danger",
};

/** Célula de KPI — mesmo design do Resumo (Painel do Líder: card único com
 *  divisores, label + ícone em círculo, valor 24px, hint). */
function KpiCell({
  icon: Icon,
  value,
  label,
  hint,
  tone = "neutral",
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  hint?: string;
  tone?: KpiTone;
}) {
  return (
    <div className="flex flex-col gap-[2px] p-pad-3xl first:rounded-l-radius-xl last:rounded-r-radius-xl">
      <div className="flex items-start justify-between gap-gp-md">
        <p className="text-title-sm font-semibold text-fg-default">{label}</p>
        <span className={cn("grid size-form-lg shrink-0 place-items-center rounded-radius-full", KPI_ICON_BOX[tone])}>
          <Icon className="size-icon-sm" aria-hidden />
        </span>
      </div>
      <p className="text-[24px] font-bold leading-tight tabular-nums text-fg-default">{value}</p>
      {hint && <p className="text-caption-md text-fg-muted">{hint}</p>}
    </div>
  );
}

export function SegurosFinanceiroPage() {
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

  const columns = useMemo<DataTableColumnDef<ApoliceRow>[]>(
    () => [
      {
        field: "cliente",
        headerName: "Segurado",
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
        field: "parcela",
        headerName: "1ª parcela",
        width: 150,
        icon: CircleDot,
        sortable: true,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: (Object.keys(STATUS_LABEL) as ParcelaStatus[]).map((s) => ({
          value: s,
          label: STATUS_LABEL[s],
        })),
        render: ({ value }) => (
          <Chip color={STATUS_CHIP[value as ParcelaStatus]} variant="soft" size="sm" shape="rounded">
            {STATUS_LABEL[value as ParcelaStatus]}
          </Chip>
        ),
      },
      {
        field: "ramo",
        headerName: "Ramo",
        width: 150,
        icon: ShieldCheck,
        sortable: true,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: RAMOS.map((r) => ({ value: r, label: r })),
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
        filterOptions: [...new Set(apolices.map((a) => a.uf))].map((u) => ({ value: u, label: u })),
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
        field: "mensal",
        headerName: "Prêmio/mês",
        width: 140,
        icon: Wallet,
        align: "right",
        sortable: true,
        type: "currency",
        aggregate: "sum",
        aggregateFormatter: (v) => brl(v),
        valueFormatter: (v) => brl(v as number),
        render: ({ value }) => (
          <span className="tabular-nums font-medium text-fg-default">{brl(value as number)}</span>
        ),
      },
      {
        field: "emissao",
        headerName: "Emissão",
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
        title="Financeiro"
        description="Carteira mensal de prêmios e status da 1ª parcela das apólices."
        actions={periodSelector}
      />

      {/* Aviso — seguro não tem parcela recorrente vencível */}
      <div className="flex items-start gap-gp-sm rounded-radius-lg border border-border-subtle bg-bg-muted px-pad-2xl py-pad-xl">
        <AlertTriangle className="mt-[2px] size-icon-sm shrink-0 text-fg-warning" />
        <p className="text-body-sm text-fg-muted">
          Seguro não tem parcela recorrente vencível na base iGreen — então aqui mostramos a{" "}
          <strong className="text-fg-default">carteira mensal</strong> e o status da{" "}
          <strong className="text-fg-default">1ª parcela</strong> (paga/pendente). Não há
          "vencido" mês a mês.
        </p>
      </div>

      {/* KPIs da carteira — mesmo design do Resumo (card único + divisores) */}
      <section className="rounded-radius-xl border border-border-subtle bg-bg-surface shadow-sh-sm">
        <div className="grid grid-cols-1 divide-y divide-border-subtle sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 [&>*]:border-border-subtle sm:[&>*]:border-l sm:[&>*:first-child]:border-l-0 lg:[&>*:nth-child(3)]:border-l">
          <KpiCell icon={Wallet} label="Carteira / mês" value={brlMil(financeiro.carteiraMensal)} hint="prêmio recorrente (vigentes)" tone="brand" />
          <KpiCell icon={ShieldCheck} label="Apólices vigentes" value={num(financeiro.vigentes)} hint="em vigor" tone="success" />
          <KpiCell icon={CheckCircle2} label="1ª parcela paga" value={num(financeiro.primeiraPaga.n)} hint={brl(financeiro.primeiraPaga.valor)} tone="success" />
          <KpiCell icon={Clock} label="1ª parcela pendente" value={num(financeiro.primeiraPendente.n)} hint={brl(financeiro.primeiraPendente.valor)} tone="warning" />
        </div>
      </section>

      {/* Apólices — carteira */}
      <DataTable<ApoliceRow>
        rows={apolices}
        columns={columns}
        getRowId={(r) => r.id}
        persistId="seguros-financeiro-carteira"
        allowCreateView={false}
        autoFit
        showTotalizers
        defaultViews={TABLE_VIEWS}
        toolbar={{
          title: `${totalApolices} apólices`,
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
