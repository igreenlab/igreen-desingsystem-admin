import { useEffect, useState } from "react";

import { ChoroplethMap } from "@/components/ui/ChoroplethMap";
import type { ChoroplethGeography } from "@/components/ui/ChoroplethMap";
import { Spinner } from "@/components/ui/Spinner";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-brand", label: "Escala brand" },
  { id: "ex-token", label: "Outros tokens de escala" },
  { id: "ex-interaction", label: "Tooltip + clique" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "geography", type: "FeatureCollection | MapFeature[] | Topology", defaultVal: "—" },
  { name: "topologyObject", type: "string", defaultVal: "—" },
  { name: "values", type: "Record<string | number, number>", defaultVal: "—" },
  { name: "getFeatureId", type: "(feature) => string | number", defaultVal: "id → properties.id" },
  { name: "getFeatureName", type: "(feature) => string", defaultVal: "name → nome → NOME → id" },
  { name: "colorScale", type: "(value, { min, max }) => string", defaultVal: "gradiente sequencial" },
  { name: "scaleToken", type: `"brand" | "success" | "info" | "warning" | "danger"`, defaultVal: `"brand"` },
  { name: "domain", type: "[number, number]", defaultVal: "min/max de values" },
  { name: "projection", type: "GeoProjection (d3-geo)", defaultVal: "geoMercator().fitSize()" },
  { name: "width / height", type: "number", defaultVal: "800 / 600" },
  { name: "strokeWidth", type: "number", defaultVal: "0.5" },
  { name: "showLegend", type: "boolean", defaultVal: "true" },
  { name: "legendTitle", type: "ReactNode", defaultVal: "—" },
  { name: "formatValue", type: "(value: number) => string", defaultVal: "Intl pt-BR" },
  { name: "renderTooltip", type: "(info) => ReactNode", defaultVal: "nome + valor" },
  { name: "onFeatureClick", type: "(info) => void", defaultVal: "—" },
  { name: "ariaLabel", type: "string", defaultVal: "—" },
];

/**
 * Malha de UFs do IBGE — mesma fonte que o consumidor real usa. Buscada em
 * runtime de propósito: o showcase demonstra o padrão de produção (topologia
 * externa + projeção), não uma malha embutida. Um mapa fixo de KPI do Brasil
 * NÃO precisa deste componente — para esse caso a receita de paths inline
 * (`#/chart-map`) é mais leve e não traz dependência.
 */
const IBGE_UF_TOPO =
  "https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/json&qualidade=minima&intrarregiao=UF";

/** Mock: "clientes por UF" (código IBGE da UF → valor). */
const VALORES: Record<string, number> = {
  "35": 612, "31": 388, "41": 241, "43": 178, "33": 164, "29": 143, "42": 121,
  "26": 98, "52": 87, "23": 76, "51": 71, "53": 66, "21": 54, "50": 48,
  "24": 41, "25": 39, "32": 34, "13": 28, "15": 26, "22": 24, "27": 21,
  "28": 17, "17": 15, "11": 12, "12": 9, "16": 7, "14": 5,
};

function useIbgeUf() {
  const [geo, setGeo] = useState<ChoroplethGeography | null>(null);
  const [erro, setErro] = useState(false);
  useEffect(() => {
    let vivo = true;
    fetch(IBGE_UF_TOPO)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => vivo && setGeo(d as ChoroplethGeography))
      .catch(() => vivo && setErro(true));
    return () => {
      vivo = false;
    };
  }, []);
  return { geo, erro };
}

function MapaDemo({
  scaleToken = "brand" as const,
  onFeatureClick,
  legendTitle,
}: {
  scaleToken?: "brand" | "success" | "info" | "warning" | "danger";
  onFeatureClick?: (nome: string) => void;
  legendTitle?: string;
}) {
  const { geo, erro } = useIbgeUf();

  if (erro)
    return (
      <p className="py-sp-4xl text-center text-body-sm text-fg-muted">
        Não foi possível carregar a malha do IBGE (o showcase busca em runtime).
      </p>
    );
  if (!geo)
    return (
      <div className="flex justify-center py-sp-4xl">
        <Spinner size="lg" />
      </div>
    );

  return (
    <ChoroplethMap
      geography={geo}
      values={VALORES}
      scaleToken={scaleToken}
      legendTitle={legendTitle}
      ariaLabel="Clientes por unidade federativa"
      getFeatureId={(f) => String((f.properties as { codarea?: string } | null)?.codarea ?? f.id ?? "")}
      onFeatureClick={onFeatureClick ? (info) => onFeatureClick(info.name) : undefined}
    />
  );
}

export function ChoroplethMapDoc() {
  const [clicada, setClicada] = useState<string | null>(null);

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="ChoroplethMap"
        description="Mapa coroplético data-driven: colore regiões de uma topologia (GeoJSON ou TopoJSON) por valor, com escala derivada de token do DS, legenda, tooltip e clique."
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-brand"
        title="Escala brand"
        description="Gradiente sequencial bg-surface → bg-brand, domínio calculado de values."
      >
        <MapaDemo legendTitle="Clientes por UF" />
      </ExampleSection>

      <ExampleSection
        id="ex-token"
        title="Outros tokens de escala"
        description="scaleToken aceita brand · success · info · warning · danger — a rampa sai sempre de token do DS, nunca de hex."
      >
        <div className="grid gap-gp-2xl md:grid-cols-2">
          <MapaDemo scaleToken="info" legendTitle="info" />
          <MapaDemo scaleToken="warning" legendTitle="warning" />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-interaction"
        title="Tooltip + clique"
        description="onFeatureClick recebe { id, name, value, feature } — é o gancho de drill-down (ex.: UF → municípios)."
      >
        <MapaDemo onFeatureClick={setClicada} legendTitle="Clique numa UF" />
        <p className="mt-gp-2xl text-body-sm text-fg-muted">
          {clicada ? `Última região clicada: ${clicada}` : "Nenhuma região clicada ainda."}
        </p>
      </ExampleSection>

      <DocSeparator />

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default ChoroplethMapDoc;
