import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../components/shadcn/card";
import { DocLayout, DocHeader, DocSeparator } from "../components";
import { BRAZIL_PATHS, BRAZIL_VIEWBOX } from "./_dashboard-brazil-map";

/* ── Mock (domínio iGreen: clientes por UF) ──────────────────────────── */
type UfRow = { uf: string; name: string; value: number; regiao: Regiao };
type Regiao = "Sudeste" | "Sul" | "Nordeste" | "Centro-Oeste" | "Norte";

const CLIENTES: UfRow[] = [
  { uf: "SP", name: "São Paulo", value: 612, regiao: "Sudeste" },
  { uf: "MG", name: "Minas Gerais", value: 388, regiao: "Sudeste" },
  { uf: "PR", name: "Paraná", value: 241, regiao: "Sul" },
  { uf: "RS", name: "Rio Grande do Sul", value: 178, regiao: "Sul" },
  { uf: "BA", name: "Bahia", value: 121, regiao: "Nordeste" },
  { uf: "SC", name: "Santa Catarina", value: 98, regiao: "Sul" },
  { uf: "GO", name: "Goiás", value: 76, regiao: "Centro-Oeste" },
  { uf: "PE", name: "Pernambuco", value: 54, regiao: "Nordeste" },
  { uf: "CE", name: "Ceará", value: 34, regiao: "Nordeste" },
  { uf: "ES", name: "Espírito Santo", value: 26, regiao: "Sudeste" },
];

const TOTAL = CLIENTES.reduce((s, u) => s + u.value, 0);
const MAX = Math.max(...CLIENTES.map((u) => u.value));

/* ── 1. Choropleth por ranking — rampa verde monocromática ───────────── */
const RAMP = [
  "var(--color-chart-1)",
  "color-mix(in oklch, var(--color-chart-1) 80%, black)",
  "color-mix(in oklch, var(--color-chart-1) 62%, black)",
  "color-mix(in oklch, var(--color-chart-1) 46%, black)",
  "color-mix(in oklch, var(--color-chart-1) 34%, black)",
];
const rankedUf = [...CLIENTES].sort((a, b) => b.value - a.value);
const fillRank: Record<string, string> = {};
rankedUf.forEach((u, i) => { fillRank[u.uf] = RAMP[Math.min(i, RAMP.length - 1)]; });

/* ── 2. Choropleth por intensidade — escala contínua (value/max) ─────── */
// value alto = verde puro; baixo = escurecido. Mix% ∈ [30, 100].
const fillIntensity: Record<string, string> = {};
CLIENTES.forEach((u) => {
  const pct = Math.round(30 + (u.value / MAX) * 70);
  fillIntensity[u.uf] = `color-mix(in oklch, var(--color-chart-1) ${pct}%, black)`;
});

/* ── 3. Por região — cada região uma cor chart-* ─────────────────────── */
const REGIAO_COLOR: Record<Regiao, string> = {
  Sudeste: "var(--color-chart-1)",
  Sul: "var(--color-chart-2)",
  Nordeste: "var(--color-chart-3)",
  "Centro-Oeste": "var(--color-chart-4)",
  Norte: "var(--color-chart-5)",
};
const fillRegiao: Record<string, string> = {};
CLIENTES.forEach((u) => { fillRegiao[u.uf] = REGIAO_COLOR[u.regiao]; });

const regioesResumo = (Object.keys(REGIAO_COLOR) as Regiao[])
  .map((r) => ({
    regiao: r,
    color: REGIAO_COLOR[r],
    total: CLIENTES.filter((u) => u.regiao === r).reduce((s, u) => s + u.value, 0),
  }))
  .filter((r) => r.total > 0)
  .sort((a, b) => b.total - a.total);

const num = (n: number) => n.toLocaleString("pt-BR");

/* ── Átomos ──────────────────────────────────────────────────────────── */
function MapSvg({ fill }: { fill: Record<string, string> }) {
  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox={BRAZIL_VIEWBOX}
        className="h-full max-h-[280px] w-full"
        role="img"
        aria-label="Mapa do Brasil — clientes por estado"
      >
        {BRAZIL_PATHS.map((p) => (
          <path
            key={p.uf}
            d={p.d}
            fill={fill[p.uf] ?? "var(--color-bg-muted)"}
            stroke="var(--color-bg-surface)"
            strokeWidth={1}
          />
        ))}
      </svg>
    </div>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <li className="flex items-center gap-gp-sm">
      <span className="size-[10px] shrink-0 rounded-radius-full" style={{ background: color }} aria-hidden />
      <span className="flex-1 truncate text-body-sm text-fg-default">{label}</span>
      <span className="text-body-sm font-semibold tabular-nums text-fg-default">{value}</span>
    </li>
  );
}

const TOC = [
  { id: "ranking", label: "Por UF (ranking)" },
  { id: "intensity", label: "Intensidade" },
  { id: "regiao", label: "Por região" },
];

export function MapChartDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Charts"
        title="Maps"
        description="Mapas coropléticos do Brasil por UF — mesma linguagem visual dos charts (rampa verde monocromática por token, legenda com dots). SVG por token, sem lib externa."
      />
      <DocSeparator />

      <div className="grid gap-gp-2xl lg:grid-cols-2">
        {/* 1 — Ranking */}
        <Card id="ranking" className="flex flex-col">
          <CardHeader>
            <CardTitle>Clientes por UF</CardTitle>
            <CardDescription>{CLIENTES.length} estados · {num(TOTAL)} ativos</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <MapSvg fill={fillRank} />
          </CardContent>
          <CardFooter>
            <ul className="grid w-full grid-cols-2 gap-x-gp-xl gap-y-gp-xs">
              {rankedUf.slice(0, 6).map((u, i) => (
                <LegendItem key={u.uf} color={RAMP[Math.min(i, RAMP.length - 1)]} label={u.uf} value={num(u.value)} />
              ))}
            </ul>
          </CardFooter>
        </Card>

        {/* 2 — Intensidade (escala contínua) */}
        <Card id="intensity" className="flex flex-col">
          <CardHeader>
            <CardTitle>Intensidade</CardTitle>
            <CardDescription>Escala contínua por volume de clientes</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <MapSvg fill={fillIntensity} />
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-gp-xs">
            <div className="h-[10px] w-full rounded-radius-full" style={{ background: "linear-gradient(to right, color-mix(in oklch, var(--color-chart-1) 30%, black), var(--color-chart-1))" }} aria-hidden />
            <div className="flex justify-between text-caption-sm text-fg-muted">
              <span>menos clientes</span>
              <span>mais clientes</span>
            </div>
          </CardFooter>
        </Card>

        {/* 3 — Por região */}
        <Card id="regiao" className="flex flex-col lg:col-span-2">
          <CardHeader>
            <CardTitle>Por região</CardTitle>
            <CardDescription>Agrupamento das 5 macrorregiões — uma cor por região</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-gp-2xl md:flex-row md:items-stretch">
            <div className="w-full max-w-[320px]">
              <MapSvg fill={fillRegiao} />
            </div>
            <ul className="flex flex-1 flex-col justify-center gap-gp-md">
              {regioesResumo.map((r) => (
                <LegendItem key={r.regiao} color={r.color} label={r.regiao} value={`${num(r.total)} clientes`} />
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </DocLayout>
  );
}

export default MapChartDoc;
