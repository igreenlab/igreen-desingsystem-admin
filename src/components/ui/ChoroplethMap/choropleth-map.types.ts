import type { ReactNode } from "react";
import type { Feature, FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import type { GeoProjection } from "d3-geo";
import type { Topology } from "topojson-specification";

/** Uma feature GeoJSON (região do mapa). */
export type MapFeature = Feature<Geometry, GeoJsonProperties>;

/**
 * Fonte geográfica aceita pelo mapa:
 *  - `FeatureCollection` GeoJSON (usado direto),
 *  - array de `Feature` GeoJSON,
 *  - `Topology` TopoJSON (requer `topologyObject` apontando o objeto a extrair).
 */
export type ChoroplethGeography = FeatureCollection | MapFeature[] | Topology;

/** Token de cor do DS usado como extremo "cheio" do gradiente sequencial. */
export type ChoroplethScaleToken =
  | "brand"
  | "success"
  | "info"
  | "warning"
  | "danger";

/** Contexto passado ao `colorScale` custom. */
export interface ChoroplethScaleContext {
  min: number;
  max: number;
}

/** Info da região sob o cursor, passada ao `renderTooltip`. */
export interface ChoroplethHoverInfo {
  id: string | number;
  name: string;
  value: number | undefined;
  feature: MapFeature;
}

export interface ChoroplethMapProps {
  /** Fonte geográfica: FeatureCollection, Feature[] ou Topology (TopoJSON). */
  geography: ChoroplethGeography;
  /**
   * Nome do objeto a extrair quando `geography` é um `Topology` TopoJSON
   * (ex.: `"municipios"`). Ignorado para GeoJSON.
   */
  topologyObject?: string;
  /** Mapa `id → número` que colore as regiões. Ids devem casar com `getFeatureId`. */
  values: Record<string | number, number>;
  /**
   * Extrai o id de uma feature (deve casar com as chaves de `values`).
   * Default: `feature.id` → `feature.properties.id`.
   */
  getFeatureId?: (feature: MapFeature) => string | number;
  /**
   * Nome legível de uma feature (tooltip). Default tenta
   * `properties.name` → `properties.nome` → `properties.NOME` → o id.
   */
  getFeatureName?: (feature: MapFeature) => string;
  /**
   * Escala de cor custom — recebe o valor da região e `{ min, max }` e retorna
   * qualquer cor CSS (idealmente derivada de tokens DS). Quando ausente, usa um
   * gradiente sequencial `bg-surface → bg-{scaleToken}` via `color-mix`.
   */
  colorScale?: (value: number, ctx: ChoroplethScaleContext) => string;
  /** Token DS do extremo "cheio" do gradiente default. Default `"brand"`. */
  scaleToken?: ChoroplethScaleToken;
  /** Domínio `[min, max]` fixo. Default: min/max calculados de `values`. */
  domain?: [number, number];
  /** Projeção d3-geo já configurada. Default: `geoMercator().fitSize(...)` (auto-fit). */
  projection?: GeoProjection;
  /** Largura do viewBox (coordenadas internas). Default `800`. */
  width?: number;
  /** Altura do viewBox. Default `600`. */
  height?: number;
  /** Espessura do traço das divisas (unidades do viewBox). Default `0.5`. */
  strokeWidth?: number;
  /** Mostra a legenda (barra de gradiente + min/max). Default `true`. */
  showLegend?: boolean;
  /** Título opcional acima da legenda. */
  legendTitle?: ReactNode;
  /** Formata os números (legenda + tooltip). Default: `Intl.NumberFormat("pt-BR")`. */
  formatValue?: (value: number) => string;
  /** Conteúdo custom do tooltip. Default: nome + valor formatado. */
  renderTooltip?: (info: ChoroplethHoverInfo) => ReactNode;
  /** Disparado ao clicar numa região. */
  onFeatureClick?: (info: ChoroplethHoverInfo) => void;
  /** Rótulo acessível do mapa (`role="img"`/`figure`). */
  ariaLabel?: string;
  /** className do container raiz. */
  className?: string;
}
