import { useMemo, useState } from "react";
import {
  GraduationCap,
  ChevronDown,
  Check,
  Hash,
  User,
  Phone,
  MapPin,
  CalendarClock,
  Award,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
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
  retencaoRows,
  totalRetencao,
  GRADUACOES,
  UFS,
  countBy,
  num,
  type RetencaoRow,
  type StatusRetencao,
} from "./retencao-mock";

const RANKING_ALL = "ALL";

const ACTIVE_BTN =
  "!bg-bg-brand-subtle !border-border-brand !text-fg-brand hover:!bg-bg-brand-subtle";

const titleCase = (s: string) =>
  s.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase());

function initialsOf(nome: string): string {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

const STATUS_META: Record<
  StatusRetencao,
  { color: "success" | "warning" | "danger"; icon: typeof ShieldCheck }
> = {
  Retido: { color: "success", icon: ShieldCheck },
  Atenção: { color: "warning", icon: ShieldAlert },
  "Em risco": { color: "danger", icon: ShieldX },
};

const TABLE_VIEWS: DataTablePresetView[] = [
  presetView({
    id: "preset:risco",
    name: "Em risco",
    filters: [{ field: "status", value: "Em risco" }],
  }),
  presetView({
    id: "preset:retidos",
    name: "Retidos",
    filters: [{ field: "status", value: "Retido" }],
  }),
];

/** Cabeçalho de coluna — título + subtítulo (padrão das telas de resumo). */
function ColHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-[2px]">
      <h3 className="m-0 text-body-md font-medium text-fg-default">{title}</h3>
      <p className="m-0 text-body-xs text-fg-muted">{subtitle}</p>
    </div>
  );
}

/** Barras horizontais por graduação (track + preenchimento brand). */
function GradBars({ data }: { data: { key: string; total: number }[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  if (data.length === 0)
    return (
      <p className="py-sp-2xl text-center text-body-sm text-fg-muted">
        Nenhum resultado encontrado.
      </p>
    );
  return (
    <div className="flex flex-1 flex-col justify-center gap-gp-xl">
      {data.map(({ key, total }) => (
        <div key={key} className="flex flex-col gap-gp-sm">
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-fg-default">{titleCase(key)}</span>
            <span className="text-body-sm font-semibold tabular-nums text-fg-default">
              {total}
            </span>
          </div>
          <div className="h-[10px] w-full overflow-hidden rounded-radius-full bg-bg-muted">
            <div
              className="h-full rounded-radius-full"
              style={{
                width: `${(total / max) * 100}%`,
                background: "var(--color-chart-1)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** KPI de status de retenção — sub-card elevado (fundo mais claro), ícone +
 *  label/valor empilhados, crescendo pra preencher a coluna. */
function StatusKpi({
  status,
  total,
  pct,
}: {
  status: StatusRetencao;
  total: number;
  pct: number;
}) {
  const { color, icon: Icon } = STATUS_META[status];
  const box = {
    success: "bg-bg-success-muted text-fg-success",
    warning: "bg-bg-warning-muted text-fg-warning",
    danger: "bg-bg-danger-muted text-fg-danger",
  }[color];
  return (
    <div className="flex flex-1 items-center gap-gp-lg rounded-radius-lg bg-bg-muted px-pad-xl py-pad-lg">
      <span
        className={cn(
          "grid size-comp-2xl shrink-0 place-items-center rounded-radius-base",
          box,
        )}
      >
        <Icon className="size-icon-md" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-gp-2xs">
        <span className="text-caption-md text-fg-muted">
          {status} · {pct}%
        </span>
        <span className="text-title-md font-bold tabular-nums text-fg-default">
          {num(total)}
        </span>
      </div>
    </div>
  );
}

export function RetencaoPage() {
  const [graduacaoMin, setGraduacaoMin] = useState<string>(RANKING_ALL);
  const graduacaoAtiva = graduacaoMin !== RANKING_ALL;

  const rows = useMemo(() => {
    if (graduacaoMin === RANKING_ALL) return retencaoRows;
    const min = GRADUACOES.indexOf(graduacaoMin as never);
    return retencaoRows.filter((r) => GRADUACOES.indexOf(r.graduacao) >= min);
  }, [graduacaoMin]);

  const porGraduacao = useMemo(() => {
    const counted = countBy(rows, (r) => r.graduacao);
    return [...GRADUACOES]
      .reverse()
      .map((g) => ({ key: g, total: counted.find((c) => c.key === g)?.total ?? 0 }))
      .filter((g) => g.total > 0);
  }, [rows]);

  const statusCount = useMemo(() => {
    const c: Record<StatusRetencao, number> = {
      Retido: 0,
      Atenção: 0,
      "Em risco": 0,
    };
    for (const r of rows) c[r.status]++;
    return c;
  }, [rows]);
  const totalRows = rows.length;
  const pct = (n: number) => (totalRows > 0 ? Math.round((n / totalRows) * 100) : 0);

  const headerActions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          color="secondary"
          variant="outline"
          size="md"
          iconLeft={<GraduationCap />}
          iconRight={<ChevronDown />}
          className={cn(graduacaoAtiva && ACTIVE_BTN)}
        >
          {graduacaoAtiva ? titleCase(graduacaoMin) : "Graduação"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        <DropdownMenuItem
          onSelect={() => setGraduacaoMin(RANKING_ALL)}
          className={cn(
            graduacaoMin === RANKING_ALL && "bg-bg-brand-subtle text-fg-brand",
          )}
        >
          <Check className={graduacaoMin === RANKING_ALL ? "opacity-100" : "opacity-0"} />
          Todas as graduações
        </DropdownMenuItem>
        {GRADUACOES.map((g) => (
          <DropdownMenuItem
            key={g}
            onSelect={() => setGraduacaoMin(g)}
            className={cn(graduacaoMin === g && "bg-bg-brand-subtle text-fg-brand")}
          >
            <Check className={graduacaoMin === g ? "opacity-100" : "opacity-0"} />
            {titleCase(g)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const columns = useMemo<DataTableColumnDef<RetencaoRow>[]>(
    () => [
      {
        field: "idconsultor",
        headerName: "ID Licenciado",
        width: 130,
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
                #{row.idconsultor}
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
        field: "uf",
        headerName: "UF",
        width: 80,
        icon: MapPin,
        align: "center",
        sortable: true,
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: UFS.map((u) => ({ value: u, label: u })),
      },
      {
        field: "periodoPro",
        headerName: "Período PRO",
        width: 130,
        icon: CalendarClock,
        align: "right",
        type: "number",
        sortable: true,
        render: ({ value }) => (
          <span className="tabular-nums text-fg-default">
            {value as number} {(value as number) === 1 ? "mês" : "meses"}
          </span>
        ),
      },
      {
        field: "status",
        headerName: "Retenção",
        width: 140,
        icon: ShieldCheck,
        align: "center",
        enableColumnFilter: true,
        filterType: "select",
        filterOptions: [
          { value: "Retido", label: "Retido" },
          { value: "Atenção", label: "Atenção" },
          { value: "Em risco", label: "Em risco" },
        ],
        render: ({ row }) => (
          <Chip
            color={STATUS_META[row.status].color}
            variant="soft"
            size="sm"
            shape="pill"
          >
            {row.status}
          </Chip>
        ),
      },
      {
        field: "ultimaGraduacao",
        headerName: "Última graduação",
        width: 180,
        icon: Award,
        render: ({ value }) => (
          <span className="text-fg-muted">{titleCase(value as string)}</span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-gp-2xl">
      <PageHeader
        title="Análise de Retenção"
        description="Continuidade PRO da sua downline — quem mantém, quem está em risco, por graduação."
        badge={
          <Chip color="primary" variant="soft" size="sm" shape="rounded">
            {num(statusCount["Em risco"])} em risco · {num(totalRows)} consultores
          </Chip>
        }
        actions={headerActions}
      />

      {/* Resumo: Total por Graduação + Status de retenção */}
      <section className="rounded-radius-xl border border-border-subtle bg-bg-surface shadow-sh-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex flex-col gap-gp-2xl p-pad-3xl">
            <ColHead
              title="Total por Graduação"
              subtitle={`${num(totalRows)} consultores PRO na downline`}
            />
            <GradBars data={porGraduacao} />
          </div>
          <div className="flex flex-col gap-gp-2xl border-t border-border-subtle p-pad-3xl lg:border-l lg:border-t-0">
            <ColHead title="Retenção" subtitle="Distribuição por situação" />
            <div className="flex flex-1 flex-col gap-gp-lg">
              <StatusKpi
                status="Retido"
                total={statusCount["Retido"]}
                pct={pct(statusCount["Retido"])}
              />
              <StatusKpi
                status="Atenção"
                total={statusCount["Atenção"]}
                pct={pct(statusCount["Atenção"])}
              />
              <StatusKpi
                status="Em risco"
                total={statusCount["Em risco"]}
                pct={pct(statusCount["Em risco"])}
              />
            </div>
          </div>
        </div>
      </section>

      <DataTable<RetencaoRow>
        rows={rows}
        columns={columns}
        getRowId={(r) => r.id}
        persistId="retencao"
        allowCreateView={false}
        autoFit
        showTotalizers
        defaultViews={TABLE_VIEWS}
        showEmptyFilterChips={["status", "graduacao", "uf"]}
        toolbar={{
          title: "Retenção PRO",
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
        className="mt-gp-2xl max-h-[80vh]"
      />

      {/* Respiro no rodapé pra não colar na borda do viewport */}
      <div aria-hidden className="h-pad-3xl shrink-0" />
    </div>
  );
}
