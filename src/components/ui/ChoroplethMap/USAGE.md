# ChoroplethMap

**Categoria:** iGreen (tv() + d3-geo). Primitiva **genérica** de mapa coroplético (regiões SVG coloridas por valor).

## Quando usar

- Visualizar uma métrica por região geográfica: municípios (IBGE), estados, países.
- Ex.: "Mapa de Cidades" do Rankings — clientes por município do Brasil.

Não é acoplado a nenhum dataset: você passa a geografia (GeoJSON/TopoJSON) + um mapa `id → número`.

## Props essenciais

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `geography` | `FeatureCollection \| Feature[] \| Topology` | — | Fonte geográfica. TopoJSON com 2+ objetos exige `topologyObject`. |
| `topologyObject` | `string` | objeto único da `Topology` | Nome do objeto a extrair do `Topology` (ex.: `"municipios"`). Obrigatório só quando há 2+ objetos — com 2+ e sem a prop, o mapa renderiza **vazio** (sem erro). |
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
| `selectedId` | `string \| number \| null` | — | Destaque PERSISTENTE de uma região (controlado; par natural de `onFeatureClick` pra seleção por clique). |
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

## Interação (comportamento embutido — não reimplemente)

- **Hover**: a região sob o cursor é REDESENHADA por cima de todas (contorno
  `fg-{scaleToken}` com 3× a espessura das divisas + tinta de 18% do token).
  O contorno acompanha a família de cor do mapa — amarelo forte num mapa
  `warning`, roxo forte num `info` — nunca verde fixo.
- **Tooltip**: próprio (NÃO Radix), vive numa camada `pointer-events-none` e
  SEGUE o cursor, trocando só o conteúdo. Nunca captura o mouse (era a causa
  de flicker direcional com o Tooltip portalado). Flip automático perto das
  bordas. Região sem valor mostra "Sem dados".
- **Seleção** (`selectedId`, controlado): destaque persistente com a mesma
  técnica do hover, tinta mais forte (32% vs 18%). Toggle é responsabilidade
  do consumer: `onFeatureClick={(i) => setSel(s => s?.id === i.id ? null : i)}`.

## Receita: UFs do Brasil (malha IBGE em runtime)

```tsx
const IBGE_UF = "https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?formato=application/json&qualidade=minima&intrarregiao=UF";
// devolve TopoJSON { objects: { BRUF } } — objeto único, extraído automaticamente
// qualidade=minima NÃO traz nome — só properties.codarea. Mapeie código → nome:
<ChoroplethMap
  geography={geo}                       // fetch da URL acima
  topologyObject="BRUF"                 // explícito por clareza (opcional: é único)
  values={clientesPorUf}                // { "35": 612, "31": 388, ... } (código IBGE)
  getFeatureId={(f) => String((f.properties as { codarea?: string })?.codarea ?? f.id ?? "")}
  getFeatureName={(f) => UF_NOMES[id] ?? id}  // tabela código → "São Paulo"...
/>
```

## Receita: master-detail (mapa + painel de detalhe)

Espelhe a seção "Seleção por clique" da doc page (`ChoroplethMapDoc.tsx`):

- Wrapper `relative w-full` com o mapa em largura total; painel FLUTUANDO no
  canto superior direito (área de oceano): `md:absolute md:right-0 md:top-0
  md:w-[220px] md:shadow-sh-md` + card `rounded-radius-lg border
  border-border-default bg-bg-surface p-pad-xl`. Mobile: empilha (`mt-gp-2xl`).
- ⚠️ **Largura do painel SEMPRE fixa** — painel que cresce com o conteúdo
  redimensiona o svg (que é `w-full` do espaço restante) a cada seleção.
- Dentro: título + subtítulo num card interno `rounded-radius-md bg-bg-subtle
  px-pad-xl py-pad-lg` (hierarquia surface < subtle); métricas abaixo, UMA por
  linha (`flex justify-between`, label `text-caption-md text-fg-muted`, valor
  `text-body-sm font-semibold tabular-nums`).
- Cobertura parcial: UF fora de `values` fica neutra (`bg-bg-muted`) — estado
  "vazio" de graça, sem prop.

## Gotchas

- **Dependências:** usa `d3-geo` (projeção + path) e `topojson-client` (TopoJSON → features) — as MESMAS primitivas que a `react-simple-maps` embrulha. Não usamos `react-simple-maps` porque ela trava peer em React ≤18 (o DS é React 19) — usar `--legacy-peer-deps` seria hack e contaminaria a árvore de todos os consumidores.
- **Cor data-driven é inline:** o `fill` de cada região é `color-mix(... var(--color-bg-{scaleToken}) ...)` e o contorno de hover/seleção é `var(--color-fg-{scaleToken})` (derivados de tokens, valor vem do dado) — não dá pra virar classe utilitária (valor contínuo/infinito). Mesma exceção justificada do `Avatar.colorHex` (L-027). Todo o resto (shell/legenda/tooltip) é classe token.
- **Não envolva o tooltip em Radix/portal:** qualquer wrapper portalado captura o mouse e reintroduz o flicker direcional (cursor persegue o tooltip → mouseleave do svg → fecha/reabre em loop).
- **Ids precisam casar:** as chaves de `values` têm que bater com o retorno de `getFeatureId`. TopoJSON do IBGE costuma trazer o código em `properties.codarea` (malhas v3) ou `feature.id` — confira a fonte e ajuste `getFeatureId`.
- **Dentro de container flex centrado** (ex.: preview de ExampleSection): dê `w-full` ao wrapper do mapa — sem ele o svg cai na largura intrínseca default (300px).
- **Performance:** milhares de `<path>` renderizam bem em SVG, mas re-render pesado; passe `values`/`geography` estáveis (memoize no consumer). A geometria (paths) é memoizada por `geography/projection/width/height`.

## Quando NÃO usar

Mapa **fixo** do Brasil por UF (KPI de dashboard) → use a **receita de paths inline**
(`#/chart-map`, `_dashboard-brazil-map.ts`): é SVG puro, zero dependência e não busca
malha em runtime.

Este componente existe para o caso **data-driven**: topologia arbitrária (municípios de
um estado, recortes que mudam), projeção real via `d3-geo` e drill-down por
`onFeatureClick`. Ele traz `d3-geo` + `topojson-client` junto — não pague esse custo
para desenhar o Brasil parado.
