import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  Check,
  Hash,
  User,
  Phone,
  GraduationCap,
  UserCheck,
  Rocket,
  Target,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/avatar-ig";
import { Button } from "@/components/ui/Button";
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
  lideresPro,
  totalLideres,
  liderProKpis,
  GRADUACOES,
  num,
  type LiderProRow,
} from "./lider-pro-mock";

const PERIODOS = ["Junho de 2026", "Maio de 2026", "Abril de 2026"];

const ACTIVE_BTN =
  "!bg-bg-brand-subtle !border-border-brand !text-fg-brand hover:!bg-bg-brand-subtle";

const titleCase = (s: string) =>
  s.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase());

function initialsOf(nome: string): string {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

const TABLE_VIEWS: DataTablePresetView[] = [
  presetView({
    id: "preset:bateram",
    name: "Bateram a meta",
    filters: [{ field: "trabalhoPessoal", value: "Sim" }],
  }),
];

export function LiderProPage() {
  const [periodo, setPeriodo] = useState(PERIODOS[0]);
  const kpis = useMemo(() => liderProKpis(), []);
  const periodoAtivo = periodo !== PERIODOS[0];

  const headerActions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          color="secondary"
          variant="outline"
          size="md"
          iconLeft={<Calendar />}
          iconRight={<ChevronDown />}
          className={cn(periodoAtivo && ACTIVE_BTN)}
        >
          {periodo}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {PERIODOS.map((p) => (
          <DropdownMenuItem
            key={p}
            onSelect={() => setPeriodo(p)}
            className={cn(p === periodo && "bg-bg-brand-subtle text-fg-brand")}
          >
            <Check className={p === periodo ? "opacity-100" : "opacity-0"} />
            {p}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const columns = useMemo<DataTableColumnDef<LiderProRow>[]>(
    () => [
      {
        field: "nivel",
        headerName: "Nível",
        width: 90,
        icon: Hash,
        type: "number",
        align: "center",
        sortable: true,
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">N{value as number}</span>
        ),
      },
      {
        field: "consultor",
        headerName: "Consultor",
        width: 120,
        icon: Hash,
        type: "number",
        align: "right",
        sortable: true,
        enableColumnFilter: true,
        filterType: "text",
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">{num(value as number)}</span>
        ),
      },
      {
        field: "nome",
        headerName: "Nome",
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
                #{row.consultor}
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
        render: ({ value }) => (
          <a
            href={`https://wa.me/55${String(value).replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="tabular-nums text-fg-brand hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {value as string}
          </a>
        ),
      },
      {
        field: "graduacao",
        headerName: "Graduação",
        width: 180,
        icon: GraduationCap,
        align: "center",
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: GRADUACOES.map((g) => ({ value: g, label: titleCase(g) })),
        render: ({ value }) => (
          <Chip color="primary" variant="soft" size="sm" shape="pill">
            {titleCase(value as string)}
          </Chip>
        ),
      },
      {
        field: "trabalhoPessoal",
        headerName: "Trabalho pessoal",
        width: 160,
        icon: UserCheck,
        align: "center",
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: [
          { value: "Sim", label: "Sim" },
          { value: "Não", label: "Não" },
        ],
        render: ({ row }) => (
          <Chip
            color={row.trabalhoPessoal === "Sim" ? "success" : "neutral"}
            variant="soft"
            size="sm"
            shape="pill"
          >
            {row.trabalhoPessoal}
          </Chip>
        ),
      },
      {
        field: "linhasDePro",
        headerName: "Linhas de PRO",
        width: 140,
        icon: Rocket,
        align: "right",
        type: "number",
        sortable: true,
        aggregate: "sum",
        aggregateFormatter: (v) => num(v),
        render: ({ value }) => (
          <span className="tabular-nums font-medium text-fg-default">
            {num(value as number)}
          </span>
        ),
      },
      {
        field: "metaCampanha",
        headerName: "Meta campanha",
        width: 150,
        icon: Target,
        align: "right",
        type: "number",
        sortable: true,
        aggregate: "sum",
        aggregateFormatter: (v) => num(v),
        render: ({ value }) => (
          <span className="tabular-nums text-fg-muted">{num(value as number)}</span>
        ),
      },
      {
        field: "atingimento",
        headerName: "Atingimento",
        minWidth: 180,
        icon: Target,
        type: "number",
        sortable: true,
        render: ({ row }) => {
          const pct = row.atingimento;
          const hit = pct >= 100;
          return (
            <div className="flex w-full items-center gap-gp-md">
              <div className="h-[8px] flex-1 overflow-hidden rounded-radius-full bg-bg-muted">
                <div
                  className="h-full rounded-radius-full"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: hit
                      ? "var(--color-fg-success)"
                      : "var(--color-chart-1)",
                  }}
                />
              </div>
              <span
                className={cn(
                  "w-[42px] text-right text-body-sm font-semibold tabular-nums",
                  hit ? "text-fg-success" : "text-fg-default",
                )}
              >
                {pct}%
              </span>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-gp-2xl">
      <PageHeader
        title="Líder PRO"
        description="Acompanhe a construção PRO da sua liderança — linhas de PRO vs meta da campanha por consultor."
        badge={
          <Chip color="primary" variant="soft" size="sm" shape="rounded">
            {num(kpis.bateram)}/{num(totalLideres)} bateram a meta
          </Chip>
        }
        actions={headerActions}
      />

      <DataTable<LiderProRow>
        rows={lideresPro}
        columns={columns}
        getRowId={(r) => r.id}
        persistId="lider-pro"
        allowCreateView={false}
        autoFit
        showTotalizers
        defaultViews={TABLE_VIEWS}
        showEmptyFilterChips={["graduacao", "trabalhoPessoal"]}
        toolbar={{
          title: "Líder PRO",
          enableSearch: true,
          enableFilters: true,
          enableColumns: true,
          enableDensity: true,
        }}
        paginationConfig={{
          enabled: true,
          initialPageSize: 25,
          pageSizeOptions: [10, 25, 50, 100],
        }}
        className="min-h-0 flex-1"
      />
    </div>
  );
}
