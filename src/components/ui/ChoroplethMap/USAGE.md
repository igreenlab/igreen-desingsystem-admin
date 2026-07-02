# ChoroplethMap

**Categoria:** iGreen (tv() + d3-geo). Primitiva **genérica** de mapa coroplético (regiões SVG coloridas por valor).

## Quando usar

- Visualizar uma métrica por região geográfica: municípios (IBGE), estados, países.
- Ex.: "Mapa de Cidades" do Rankings — clientes por município do Brasil.

Não é acoplado a nenhum dataset: você passa a geografia (GeoJSON/TopoJSON) + um mapa `id → número`.

## Props essenciais

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `geography` | `FeatureCollection \| Feature[] \| Topology` | — | Fonte geográfica. TopoJSON exige `topologyObject`. |
| `topologyObject` | `string` | — | Nome do objeto a extrair do `Topology` (ex.: `"municipios"`). |
| `values` | `Record<string \| number, number>` | — | Mapa `id → valor`. Ids casam com `getFeatureId`. |
| `getFeatureId` | `(f) => string \| number` | `f.id` → `f.properties.id` | Como obter o id de uma feature. |
| `getFeatureName` | `(f) => string` | `properties.name/nome/NOME` → id | Nome exibido no tooltip. |
| `colorScale` | `(value, {min,max}) => string` | gradiente token | Escala custom (retorna cor CSS). |
| `scaleToken` | `"brand"\|"success"\|"info"\|"warning"\|"danger"` | `"brand"` | Token DS do extremo "cheio" do gradiente default. |
| `domain` | `[number, number]` | min/max de `values` | Domínio fixo da escala. |
| `projection` | `GeoProjection` (d3-geo) | `geoMercator().fitSize(...)` | Projeção custom (senão auto-fit). |
| `width` / `height` | `number` | `800` / `600` | ViewBox (o SVG é responsivo, `w-full h-auto`). |
| `strokeWidth` | `number` | `0.5` | Espessura das divisas (unidades do viewBox). |
| `showLegend` | `boolean` | `true` | Barra de gradiente + min/max. |
| `legendTitle` | `ReactNode` | — | Título da legenda. |
| `formatValue` | `(v) => string` | `Intl.NumberFormat("pt-BR")` | Formata legenda + tooltip. |
| `renderTooltip` | `(info) => ReactNode` | nome + valor | Conteúdo custom do tooltip. |
| `onFeatureClick` | `(info) => void` | — | Clique numa região. |
| `ariaLabel` | `string` | `"Mapa"` | Rótulo acessível (`role="img"`). |

## Exemplo mínimo (municípios do Brasil, IBGE TopoJSON)

```tsx
import { ChoroplethMap } from "@snksergio/design-system";
import brasilMunicipios from "./geo/br-municipios.topo.json"; // TopoJSON IBGE

<ChoroplethMap
  geography={brasilMunicipios}
  topologyObject="municipios"
  values={clientesPorMunicipio}         // { "3550308": 120, "3304557": 88, ... }
  getFeatureId={(f) => f.id ?? f.properties?.codarea}
  getFeatureName={(f) => f.properties?.name}
  scaleToken="brand"
  legendTitle="Clientes por cidade"
  ariaLabel="Clientes por município"
/>
```

## Gotchas

- **Dependências:** usa `d3-geo` (projeção + path) e `topojson-client` (TopoJSON → features) — as MESMAS primitivas que a `react-simple-maps` embrulha. Não usamos `react-simple-maps` porque ela trava peer em React ≤18 (o DS é React 19) — usar `--legacy-peer-deps` seria hack e contaminaria a árvore de todos os consumidores.
- **Cor data-driven é inline:** o `fill` de cada região é `color-mix(... var(--color-bg-{scaleToken}) ...)` (derivado de tokens, % vem do dado) — não dá pra virar classe utilitária (valor contínuo/infinito). Mesma exceção justificada do `Avatar.colorHex` (L-027). Todo o resto (shell/legenda/tooltip) é classe token.
- **Sem superfície escura no DS:** o tooltip reaproveita o `Tooltip` (bolha `bg-bg-emphasis`), ancorado no centroide da região — 1 tooltip controlado que segue o cursor (não 1 por path; escala pra milhares de municípios).
- **Ids precisam casar:** as chaves de `values` têm que bater com o retorno de `getFeatureId`. TopoJSON do IBGE costuma trazer o código do município em `feature.id` — confira a fonte e ajuste `getFeatureId`.
- **Performance:** milhares de `<path>` renderizam bem em SVG, mas re-render pesado; passe `values`/`geography` estáveis (memoize no consumer). A geometria (paths/centroides) é memoizada por `geography/projection/width/height`.
