import { useMemo, useState } from "react";
import { Calendar, GraduationCap, Crown, ChevronDown, Check } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shadcn/dropdown-menu";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/Chart";
import {
  DataTable,
  type DataTableColumnDef,
} from "@/components/ui/DataTable";
import {
  analisePro,
  totalLicenciados,
  GRADUACOES,
  RANKING_ALL,
  REGIAO_BY_UF,
  MACRO_REGIOES,
  regiaoDe,
  countBy,
  num,
  type AnaliseProRow,
} from "./analise-rede-mock";
import { BRAZIL_PATHS, BRAZIL_VIEWBOX } from "./brazil-map-paths";

const PERIODOS = ["Junho de 2026", "Maio de 2026", "Abril de 2026"];

// "CONSULTOR SENIOR" → "Consultor Senior"
const titleCase = (s: string) =>
  s.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase());

// Estado ativo dos controles do header: fundo verde fraco + borda forte
// (mesmo do botão de filtros aplicado do DS — table-toolbar.styles).
const ACTIVE_BTN =
  "!bg-bg-brand-subtle !border-border-brand !text-fg-brand hover:!bg-bg-brand-subtle";

const numCenter = {
  type: "number" as const,
  align: "center" as const,
  sortable: true,
};

const columns: DataTableColumnDef<AnaliseProRow>[] = [
  {
    field: "idconsultor",
    headerName: "ID Licenciado",
    type: "number",
    width: 130,
    sortable: true,
  },
  {
    field: "nome",
    headerName: "Nome",
    type: "text",
    minWidth: 240,
    sortable: true,
    isPrimary: true,
    enableColumnFilter: true,
    filterType: "text",
  },
  {
    field: "celular",
    headerName: "Celular",
    type: "text",
    width: 160,
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
  { field: "nivel", headerName: "Nível", width: 90, ...numCenter },
  {
    field: "graduacao",
    headerName: "Graduação",
    type: "text",
    width: 180,
    sortable: true,
    enableColumnFilter: true,
    filterType: "select",
    filterOptions: GRADUACOES.map((g) => ({ value: g, label: g })),
  },
  {
    field: "regiao",
    headerName: "Região",
    type: "text",
    width: 110,
    sortable: true,
    align: "center",
    enableColumnFilter: true,
    filterType: "select",
  },
  {
    field: "cnxgreen_telecom",
    headerName: "Green Telecom",
    width: 150,
    aggregate: "sum",
    ...numCenter,
  },
  { field: "cnxlivre", headerName: "Livre", width: 100, aggregate: "sum", ...numCenter },
  { field: "cnxplaca", headerName: "Placa", width: 100, aggregate: "sum", ...numCenter },
  { field: "cnxclub", headerName: "Club", width: 100, aggregate: "sum", ...numCenter },
  {
    field: "cnxexpansao",
    headerName: "Expansão",
    width: 120,
    aggregate: "sum",
    ...numCenter,
  },
  {
    field: "pro",
    headerName: "PRO",
    type: "text",
    width: 90,
    align: "center",
    sortable: true,
    render: ({ value }) =>
      value === "PRO" ? (
        <Chip color="success" variant="soft" size="sm" shape="pill">
          PRO
        </Chip>
      ) : (
        <span className="text-fg-subtle">—</span>
      ),
  },
];

// Paleta categórica de chart (tokens DS) — fatias coloridas do donut + legenda.
const DONUT_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const donutConfig = {
  total: { label: "PRO" },
} satisfies ChartConfig;

/** Cabeçalho de coluna — título + subtítulo (padrão SectionCard). */
function ColHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-[2px]">
      <h3 className="m-0 text-body-md font-medium text-fg-default">{title}</h3>
      <p className="m-0 text-body-xs text-fg-muted">{subtitle}</p>
    </div>
  );
}

/** Donut de graduações — total no centro + legenda com contagem. */
function GradDonut({
  data,
  total,
}: {
  data: { short: string; full: string; total: number }[];
  total: number;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-gp-2xl">
      {/* área do gráfico — fluida e centralizada na altura disponível */}
      <div className="flex flex-1 items-center justify-center">
        <div className="relative">
          <ChartContainer config={donutConfig} className="aspect-square w-[200px]">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent nameKey="short" hideLabel />}
              />
              <Pie
                data={data}
                dataKey="total"
                nameKey="short"
                innerRadius={80}
                outerRadius={100}
                paddingAngle={3}
                cornerRadius={6}
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[30px] font-bold leading-none tabular-nums text-fg-default">
              {total}
            </span>
            <span className="text-caption-md text-fg-muted">PRO</span>
          </div>
        </div>
      </div>

      <ul className="flex flex-col gap-gp-md">
        {data.map((d, i) => {
          const pct = total > 0 ? Math.round((d.total / total) * 100) : 0;
          return (
            <li key={d.full} className="flex items-center gap-gp-md">
              <span
                className="size-[10px] shrink-0 rounded-radius-full"
                style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                aria-hidden
              />
              <span className="flex-1 truncate text-body-md text-fg-default">
                {d.short}
              </span>
              <span className="text-body-sm tabular-nums text-fg-muted">
                {pct}%
              </span>
              <span className="w-[24px] text-right text-body-md font-semibold tabular-nums text-fg-default">
                {d.total}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Rampa discreta de verdes p/ o choropleth — tons uniformes, atribuída por
// ranking da região (1ª = mais clara). Regiões sem PRO → muted.
const MAP_RAMP = [
  "var(--color-chart-1)",
  "color-mix(in oklch, var(--color-chart-1) 80%, black)",
  "color-mix(in oklch, var(--color-chart-1) 62%, black)",
  "color-mix(in oklch, var(--color-chart-1) 46%, black)",
  "color-mix(in oklch, var(--color-chart-1) 34%, black)",
];

/** region → cor (por ranking de contagem desc). */
function buildRegionColor(
  list: { key: string; total: number }[],
): Record<string, string> {
  const ranked = list
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total);
  const m: Record<string, string> = {};
  ranked.forEach((r, i) => {
    m[r.key] = MAP_RAMP[Math.min(i, MAP_RAMP.length - 1)];
  });
  for (const r of list) if (!(r.key in m)) m[r.key] = "var(--color-bg-muted)";
  return m;
}

/** Mapa do Brasil — cada UF pintada pela cor da sua região. */
function BrazilMap({ fillByUf }: { fillByUf: Record<string, string> }) {
  return (
    <svg
      viewBox={BRAZIL_VIEWBOX}
      className="h-full max-h-[300px] w-full"
      role="img"
      aria-label="Mapa do Brasil — concentração de PRO por região"
    >
      {BRAZIL_PATHS.map((p) => (
        <path
          key={p.uf}
          d={p.d}
          fill={fillByUf[p.uf] ?? "var(--color-bg-muted)"}
          stroke="var(--color-bg-surface)"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/** Lista de barras horizontais por UF (badge + track + valor) — estilo print. */
function UfBarList({ data }: { data: { key: string; total: number }[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div className="flex flex-1 flex-col justify-center gap-gp-md">
      {data.map(({ key, total }, i) => {
        const leader = i === 0;
        return (
          <div key={key} className="flex items-center gap-gp-md">
            <span
              className={cn(
                "grid h-[24px] w-[34px] shrink-0 place-items-center rounded-radius-sm text-caption-md font-semibold tabular-nums",
                leader
                  ? "bg-bg-brand text-fg-on-brand"
                  : "bg-bg-muted text-fg-muted",
              )}
            >
              {key}
            </span>
            <div className="h-[10px] flex-1 overflow-hidden rounded-radius-full bg-bg-muted">
              <div
                className="h-full rounded-radius-full"
                style={{
                  width: `${(total / max) * 100}%`,
                  background: "var(--color-chart-1)",
                }}
              />
            </div>
            <span className="w-[20px] text-right text-body-md font-semibold tabular-nums text-fg-default">
              {total}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AnaliseRedePage() {
  const [periodo, setPeriodo] = useState(PERIODOS[0]);
  const [apenasPro, setApenasPro] = useState(false);
  const [graduacaoMin, setGraduacaoMin] = useState<string>(RANKING_ALL);

  // Filtro de domínio (controles do toolbar) — alimenta a grade E os gráficos.
  const rows = useMemo(() => {
    let out = analisePro;
    if (apenasPro) out = out.filter((r) => r.pro === "PRO");
    if (graduacaoMin !== RANKING_ALL) {
      const min = GRADUACOES.indexOf(graduacaoMin as never);
      out = out.filter((r) => GRADUACOES.indexOf(r.graduacao) >= min);
    }
    return out;
  }, [apenasPro, graduacaoMin]);

  const proRows = useMemo(() => rows.filter((r) => r.pro === "PRO"), [rows]);
  const totalPro = proRows.length;

  // PRO por UF (estado), contagem desc.
  const porUf = useMemo(
    () => countBy(proRows, (r) => r.regiao).sort((a, b) => b.total - a.total),
    [proRows],
  );

  // Direita — PRO por graduação (donut), contagem desc; nome curto = 1ª palavra.
  const porGraduacao = useMemo(() => {
    const counted = countBy(proRows, (r) => r.graduacao);
    return GRADUACOES.map((g) => ({
      full: g,
      short: titleCase(g.split(" ")[0]),
      total: counted.find((c) => c.key === g)?.total ?? 0,
    })).sort((a, b) => b.total - a.total);
  }, [proRows]);

  // Proposta — UF (top 12) + mapa por região.
  const ufTop = useMemo(() => porUf.slice(0, 12), [porUf]);
  const regiaoList = useMemo(() => {
    const counted = countBy(proRows, (r) => regiaoDe(r.regiao));
    return MACRO_REGIOES.map((reg) => ({
      key: reg,
      total: counted.find((c) => c.key === reg)?.total ?? 0,
    }));
  }, [proRows]);
  const regionColor = useMemo(() => buildRegionColor(regiaoList), [regiaoList]);
  const fillByUf = useMemo(() => {
    const f: Record<string, string> = {};
    for (const [uf, reg] of Object.entries(REGIAO_BY_UF)) {
      f[uf] = regionColor[reg] ?? "var(--color-bg-muted)";
    }
    return f;
  }, [regionColor]);
  const leaderUf = porUf[0]?.key ?? "—";

  const graduacaoAtiva = graduacaoMin !== RANKING_ALL;
  const periodoAtivo = periodo !== PERIODOS[0];

  const headerActions = (
    <div className="flex flex-wrap items-center gap-gp-sm">
      <Button
        color="secondary"
        variant="outline"
        size="md"
        iconLeft={<Crown />}
        onClick={() => setApenasPro((v) => !v)}
        className={cn(apenasPro && ACTIVE_BTN)}
      >
        Apenas PRO
      </Button>

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
            <Check
              className={graduacaoMin === RANKING_ALL ? "opacity-100" : "opacity-0"}
            />
            Todas as graduações
          </DropdownMenuItem>
          {GRADUACOES.map((g) => (
            <DropdownMenuItem
              key={g}
              onSelect={() => setGraduacaoMin(g)}
              className={cn(
                graduacaoMin === g && "bg-bg-brand-subtle text-fg-brand",
              )}
            >
              <Check className={graduacaoMin === g ? "opacity-100" : "opacity-0"} />
              {titleCase(g)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

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
    </div>
  );

  return (
    <div className="flex flex-col gap-gp-2xl">
      <PageHeader
        title="Análise da Rede"
        description="Ranking PRO da sua rede por período e graduação."
        badge={
          <Chip color="primary" variant="soft" size="sm" shape="rounded">
            {num(totalPro)} PRO · {num(rows.length)} licenciados
          </Chip>
        }
        actions={headerActions}
      />

      {/* Gráficos: donut próprio + card maior (UF + mapa por região) */}
      <div className="grid grid-cols-1 gap-gp-2xl lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* Card próprio — Por Graduação */}
        <section className="flex flex-col gap-gp-2xl rounded-radius-xl border border-border-subtle bg-bg-surface p-pad-3xl shadow-sh-sm">
          <ColHead title="Por Graduação" subtitle={`${GRADUACOES.length} níveis`} />
          <GradDonut data={porGraduacao} total={totalPro} />
        </section>

        {/* Card maior — PRO por UF + mapa por região */}
        <section className="rounded-radius-xl border border-border-subtle bg-bg-surface shadow-sh-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* UF (top 10) — barras horizontais com badge */}
            <div className="flex flex-col gap-gp-2xl p-pad-3xl">
              <ColHead
                title="PRO por UF"
                subtitle={`${num(porUf.length)} estados com PRO · líder ${leaderUf}`}
              />
              <UfBarList data={ufTop} />
            </div>

            {/* Mapa por região */}
            <div className="flex flex-col gap-gp-2xl border-t border-border-subtle p-pad-3xl lg:border-l lg:border-t-0">
              <ColHead
                title="Por Região"
                subtitle="Concentração geográfica dos PRO"
              />
              <div className="flex flex-1 items-center justify-center">
                <BrazilMap fillByUf={fillByUf} />
              </div>
              <ul className="grid grid-cols-2 gap-x-gp-2xl gap-y-gp-sm">
                {regiaoList.map((r) => (
                  <li key={r.key} className="flex items-center gap-gp-md">
                    <span
                      className="size-[12px] shrink-0 rounded-radius-xs"
                      style={{ background: regionColor[r.key] }}
                      aria-hidden
                    />
                    <span
                      className={cn(
                        "flex-1 text-body-sm",
                        r.total > 0 ? "text-fg-default" : "text-fg-subtle",
                      )}
                    >
                      {r.key}
                    </span>
                    <span
                      className={cn(
                        "text-body-md font-semibold tabular-nums",
                        r.total > 0 ? "text-fg-default" : "text-fg-subtle",
                      )}
                    >
                      {r.total}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      <DataTable<AnaliseProRow>
        rows={rows}
        columns={columns}
        getRowId={(r) => String(r.idconsultor)}
        persistId="analise-rede"
        allowCreateView={false}
        autoFit
        showTotalizers
        toolbar={{
          title: "Ranking da Rede",
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
