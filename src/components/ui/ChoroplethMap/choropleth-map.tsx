import { forwardRef, useMemo, useState } from "react";
import {
  geoMercator,
  geoPath,
  type GeoPermissibleObjects,
  type ExtendedFeatureCollection,
} from "d3-geo";
import { feature as topojsonFeature } from "topojson-client";
import type { FeatureCollection, Feature } from "geojson";
import type { Topology, GeometryObject } from "topojson-specification";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import { choroplethStyles } from "./choropleth-map.styles";
import type {
  ChoroplethGeography,
  ChoroplethHoverInfo,
  ChoroplethMapProps,
  MapFeature,
} from "./choropleth-map.types";

/* ── Normalização da fonte geográfica → Feature[] ─────────────────────────── */

function isTopology(g: ChoroplethGeography): g is Topology {
  return !Array.isArray(g) && (g as Topology).type === "Topology";
}
function isFeatureCollection(g: ChoroplethGeography): g is FeatureCollection {
  return !Array.isArray(g) && (g as FeatureCollection).type === "FeatureCollection";
}

function normalizeFeatures(
  geography: ChoroplethGeography,
  topologyObject?: string,
): MapFeature[] {
  if (Array.isArray(geography)) return geography;
  if (isTopology(geography)) {
    if (!topologyObject) return [];
    const obj = geography.objects[topologyObject] as GeometryObject | undefined;
    if (!obj) return [];
    const out = topojsonFeature(geography, obj) as unknown as
      | Feature
      | FeatureCollection;
    if (out.type === "FeatureCollection") return out.features as MapFeature[];
    return [out as MapFeature];
  }
  if (isFeatureCollection(geography)) return geography.features as MapFeature[];
  return [];
}

/**
 * ChoroplethMap — mapa coroplético genérico e data-driven.
 *
 * Renderiza `features` (GeoJSON/TopoJSON) como `<path>`s SVG, colorindo cada
 * região por `values[id]` numa escala sequencial derivada de tokens DS
 * (`bg-surface → bg-{scaleToken}` via `color-mix`). Hover mostra um tooltip
 * (reaproveita o `Tooltip` do DS, ancorado no centroide da região) e há uma
 * legenda de gradiente. A API NÃO é acoplada a nenhum dataset — funciona para
 * municípios do Brasil (IBGE), estados, países, etc.
 */
export const ChoroplethMap = forwardRef<HTMLDivElement, ChoroplethMapProps>(
  function ChoroplethMap(
    {
      geography,
      topologyObject,
      values,
      getFeatureId,
      getFeatureName,
      colorScale,
      scaleToken = "brand",
      domain,
      projection,
      width = 800,
      height = 600,
      strokeWidth = 0.5,
      showLegend = true,
      legendTitle,
      formatValue,
      renderTooltip,
      onFeatureClick,
      ariaLabel = "Mapa",
      className,
    },
    ref,
  ) {
    const styles = choroplethStyles();

    const features = useMemo(
      () => normalizeFeatures(geography, topologyObject),
      [geography, topologyObject],
    );

    // Geometria (d + centroide) — independe de valores/ids, memoiza pesado.
    const geometry = useMemo(() => {
      const proj =
        projection ??
        geoMercator().fitSize(
          [width, height],
          {
            type: "FeatureCollection",
            features,
          } as unknown as ExtendedFeatureCollection,
        );
      const pathGen = geoPath(proj);
      return features.map((f) => ({
        feature: f,
        d: pathGen(f as unknown as GeoPermissibleObjects) ?? "",
        centroid: pathGen.centroid(f as unknown as GeoPermissibleObjects),
      }));
    }, [features, projection, width, height]);

    const getId = (f: MapFeature): string | number => {
      if (getFeatureId) return getFeatureId(f);
      if (f.id != null) return f.id;
      const p = f.properties ?? {};
      return (p.id ?? p.ID ?? "") as string | number;
    };
    const getName = (f: MapFeature): string => {
      if (getFeatureName) return getFeatureName(f);
      const p = (f.properties ?? {}) as Record<string, unknown>;
      return String(p.name ?? p.nome ?? p.NOME ?? p.Name ?? getId(f));
    };

    // Domínio da escala.
    const numeric = Object.values(values).filter(
      (v): v is number => typeof v === "number" && Number.isFinite(v),
    );
    const min = domain ? domain[0] : numeric.length ? Math.min(...numeric) : 0;
    const max = domain ? domain[1] : numeric.length ? Math.max(...numeric) : 0;

    const scaleVar = `var(--color-bg-${scaleToken})`;
    const surfaceVar = "var(--color-bg-surface)";
    const noDataVar = "var(--color-bg-muted)";

    const fillFor = (value: number | undefined): string => {
      if (value === undefined || !Number.isFinite(value)) return noDataVar;
      if (colorScale) return colorScale(value, { min, max });
      const range = max - min;
      const t = range > 0 ? (value - min) / range : 1;
      const clamped = Math.max(0, Math.min(1, t));
      const pct = 12 + clamped * 88; // 12%..100% do token misturado na surface
      // SRGB de propósito: em oklch a interpolação roda o MATIZ entre o token
      // (verde) e o surface (cinza-azulado) e as regiões saem marrons/oliva.
      // Em srgb a cor só clareia/escurece — mesma família do legendGradient.
      return `color-mix(in srgb, ${scaleVar} ${pct}%, ${surfaceVar})`;
    };

    const fmt =
      formatValue ??
      ((v: number) => new Intl.NumberFormat("pt-BR").format(v));

    const [hover, setHover] = useState<
      (ChoroplethHoverInfo & { ax: number; ay: number }) | null
    >(null);

    const legendGradient = `linear-gradient(to right, ${surfaceVar}, ${scaleVar})`;

    return (
      <div ref={ref} className={styles.root({ className })}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={styles.svg()}
          role="img"
          aria-label={ariaLabel}
          onMouseLeave={() => setHover(null)}
        >
          {geometry.map(({ feature, d, centroid }, index) => {
            const id = getId(feature);
            const value = values[id];
            return (
              <path
                key={`${id}-${index}`}
                d={d}
                fill={fillFor(value)}
                strokeWidth={strokeWidth}
                className={styles.path()}
                style={onFeatureClick ? { cursor: "pointer" } : undefined}
                onMouseEnter={() =>
                  setHover({
                    id,
                    name: getName(feature),
                    value,
                    feature,
                    ax: (centroid[0] / width) * 100,
                    ay: (centroid[1] / height) * 100,
                  })
                }
                onClick={
                  onFeatureClick
                    ? () =>
                        onFeatureClick({
                          id,
                          name: getName(feature),
                          value,
                          feature,
                        })
                    : undefined
                }
              />
            );
          })}
        </svg>

        {/* Ancora do tooltip: um ponto 0×0 posicionado no centroide (em %) da
            região sob o cursor. Reaproveita o Tooltip do DS de forma controlada
            — um único tooltip que "segue" a região ativa (escala pra milhares
            de paths, ao contrário de 1 Tooltip por região). */}
        <div className={styles.tooltipLayer()}>
          <Tooltip open={hover != null} onOpenChange={() => {}} disableHoverableContent>
            <TooltipTrigger asChild>
              <span
                aria-hidden="true"
                className={styles.tooltipAnchor()}
                style={{ left: `${hover?.ax ?? 0}%`, top: `${hover?.ay ?? 0}%` }}
              />
            </TooltipTrigger>
            {/* bg sólido: o bg-bg-emphasis default do Tooltip é vidro translúcido
                (12% branco) no dark — sobre o mapa fica esbranquiçado/ilegível. */}
            <TooltipContent
              showArrow={false}
              className="border border-border-default bg-bg-surface-elevated shadow-sh-lg"
            >
              {hover &&
                (renderTooltip ? (
                  renderTooltip(hover)
                ) : (
                  <div>
                    <div className={styles.tooltipName()}>{hover.name}</div>
                    <div className={styles.tooltipValue()}>
                      {hover.value != null && Number.isFinite(hover.value)
                        ? fmt(hover.value)
                        : "Sem dados"}
                    </div>
                  </div>
                ))}
            </TooltipContent>
          </Tooltip>
        </div>

        {showLegend && numeric.length > 0 && (
          <div className={styles.legend()}>
            {legendTitle && (
              <span className={styles.legendTitle()}>{legendTitle}</span>
            )}
            <div
              className={styles.legendBar()}
              style={{ background: legendGradient }}
              aria-hidden="true"
            />
            <div className={styles.legendScale()}>
              <span>{fmt(min)}</span>
              <span>{fmt(max)}</span>
            </div>
          </div>
        )}
      </div>
    );
  },
);
ChoroplethMap.displayName = "ChoroplethMap";
