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
  { id: "ex-empty", label: "Regiões sem dados" },
  { id: "ex-interaction", label: "Seleção por clique" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "geography", type: "FeatureCollection | MapFeature[] | Topology", defaultVal: "—" },
  { name: "topologyObject", type: "string", defaultVal: "objeto único da Topology" },
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
  { name: "selectedId", type: "string | number | null", defaultVal: "—" },
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

/** Código IBGE → nome da UF (a malha `qualidade=minima` só traz `codarea`). */
const UF_NOMES: Record<string, string> = {
  "11": "Rondônia", "12": "Acre", "13": "Amazonas", "14": "Roraima",
  "15": "Pará", "16": "Amapá", "17": "Tocantins", "21": "Maranhão",
  "22": "Piauí", "23": "Ceará", "24": "Rio Grande do Norte", "25": "Paraíba",
  "26": "Pernambuco", "27": "Alagoas", "28": "Sergipe", "29": "Bahia",
  "31": "Minas Gerais", "32": "Espírito Santo", "33": "Rio de Janeiro",
  "35": "São Paulo", "41": "Paraná", "42": "Santa Catarina",
  "43": "Rio Grande do Sul", "50": "Mato Grosso do Sul", "51": "Mato Grosso",
  "52": "Goiás", "53": "Distrito Federal",
};

/** Mock: "clientes por UF" (código IBGE da UF → valor). */
const VALORES: Record<string, number> = {
  "35": 612, "31": 388, "41": 241, "43": 178, "33": 164, "29": 143, "42": 121,
  "26": 98, "52": 87, "23": 76, "51": 71, "53": 66, "21": 54, "50": 48,
  "24": 41, "25": 39, "32": 34, "13": 28, "15": 26, "22": 24, "27": 21,
  "28": 17, "17": 15, "11": 12, "12": 9, "16": 7, "14": 5,
};

/**
 * Mock PARCIAL: operação só no Sul/Sudeste + GO/DF. UF ausente de `values`
 * fica NEUTRA (`bg-muted`) — "vazia", como se não tivesse nada — e o tooltip
 * mostra "Sem dados". É o estado natural de cobertura incompleta: não precisa
 * de prop, basta não mandar a chave.
 */
const VALORES_PARCIAIS: Record<string, number> = {
  "35": 612, "31": 388, "33": 164, "32": 34,
  "41": 241, "42": 121, "43": 178,
  "52": 87, "53": 66,
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

type UfClicada = { id: string | number; name: string; value: number | undefined };

function MapaDemo({
  scaleToken = "brand" as const,
  values = VALORES,
  onFeatureClick,
  selectedId,
  legendTitle,
}: {
  scaleToken?: "brand" | "success" | "info" | "warning" | "danger";
  values?: Record<string, number>;
  onFeatureClick?: (info: UfClicada) => void;
  selectedId?: string | number | null;
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
      topologyObject="BRUF"
      values={values}
      scaleToken={scaleToken}
      legendTitle={legendTitle}
      ariaLabel="Clientes por unidade federativa"
      getFeatureId={(f) => String((f.properties as { codarea?: string } | null)?.codarea ?? f.id ?? "")}
      getFeatureName={(f) => {
        const id = String((f.properties as { codarea?: string } | null)?.codarea ?? f.id ?? "");
        return UF_NOMES[id] ?? id;
      }}
      onFeatureClick={
        onFeatureClick
          ? ({ id, name, value }) => onFeatureClick({ id, name, value })
          : undefined
      }
      selectedId={selectedId}
    />
  );
}

/**
 * Painel de detalhe do master-detail (dados derivados do mock VALORES:
 * participação = valor/total, ranking = posição por valor desc).
 */
function PainelUf({ uf }: { uf: UfClicada }) {
  const total = Object.values(VALORES).reduce((s, v) => s + v, 0);
  const ranking =
    Object.values(VALORES)
      .sort((a, b) => b - a)
      .findIndex((v) => v === uf.value) + 1;
  const fmtNum = new Intl.NumberFormat("pt-BR");

  const linhas: Array<[string, string]> = [
    ["Clientes", uf.value != null ? fmtNum.format(uf.value) : "—"],
    [
      "Participação",
      uf.value != null
        ? `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format((uf.value / total) * 100)}%`
        : "—",
    ],
    ["Ranking", uf.value != null ? `${ranking}º de 27` : "—"],
  ];

  return (
    <div className="flex flex-col gap-gp-md">
      <div>
        <h3 className="text-title-sm font-semibold text-fg-default">{uf.name}</h3>
        <p className="text-caption-sm text-fg-muted">Código IBGE {uf.id}</p>
      </div>
      <div className="flex flex-col gap-gp-sm border-t border-border-subtle pt-gp-md">
        {linhas.map(([label, valor]) => (
          <div key={label} className="flex items-baseline justify-between gap-gp-md">
            <span className="text-caption-md text-fg-muted">{label}</span>
            <span className="text-body-sm font-semibold tabular-nums text-fg-default">
              {valor}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChoroplethMapDoc() {
  const [selecionada, setSelecionada] = useState<UfClicada | null>(null);

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
        id="ex-empty"
        title="Regiões sem dados"
        description="UF ausente de values fica neutra (token bg-bg-muted), como se estivesse vazia, e o tooltip mostra 'Sem dados'. Não precisa de prop — basta não mandar a chave. Aqui: operação só no Sul/Sudeste + GO/DF."
      >
        <MapaDemo values={VALORES_PARCIAIS} legendTitle="Clientes por UF (cobertura parcial)" />
      </ExampleSection>

      <ExampleSection
        id="ex-interaction"
        title="Seleção por clique"
        description="Master-detail: onFeatureClick + selectedId — clicar seleciona a UF (destaque persistente, mais forte que o hover), clicar de novo desmarca. O painel lateral tem LARGURA FIXA de propósito: painel que cresce com o conteúdo redimensiona o mapa a cada clique."
      >
        <div className="flex flex-col gap-gp-2xl md:flex-row">
          <div className="min-w-0 flex-1">
            <MapaDemo
              onFeatureClick={(info) =>
                setSelecionada((atual) => (atual?.id === info.id ? null : info))
              }
              selectedId={selecionada?.id ?? null}
              legendTitle="Clique numa UF pra selecionar"
            />
          </div>
          <div className="h-fit shrink-0 rounded-radius-lg border border-border-default bg-bg-surface p-pad-2xl md:w-[220px]">
            {selecionada ? (
              <PainelUf uf={selecionada} />
            ) : (
              <div className="flex h-full items-center justify-center py-sp-4xl md:py-0">
                <p className="text-center text-body-sm text-fg-muted">
                  Clique numa UF do mapa pra ver o detalhe.
                </p>
              </div>
            )}
          </div>
        </div>
      </ExampleSection>

      <DocSeparator />

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default ChoroplethMapDoc;
