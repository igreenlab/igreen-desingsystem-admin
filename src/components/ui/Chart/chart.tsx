import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

/**
 * Chart — wrapper fino sobre o Recharts 3 que injeta a paleta do DS (tokens
 * `--color-chart-1..5`) via CSS vars escopadas por instância de gráfico, e
 * fornece Tooltip/Legend já estilizados com os tokens iGreen.
 *
 * Padrão de uso:
 *   <ChartContainer config={config}>
 *     <AreaChart data={data}>
 *       <Area dataKey="x" fill="var(--color-x)" stroke="var(--color-x)" />
 *     </AreaChart>
 *   </ChartContainer>
 *
 * `config[key].color` (ex: "var(--color-chart-1)") vira `--color-{key}` dentro
 * do gráfico — daí os elementos do Recharts referenciam `var(--color-{key})`.
 */

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

/**
 * Onde a legenda é renderizada: slots FORA da caixa de altura do gráfico.
 *
 * Os dois ficam `null` quando o container NÃO recebe `keepPlotHeight` — e é esse
 * `null` que devolve a legenda pra dentro do gráfico (ver `ChartLegend`). Um
 * mecanismo só: se algum dia alguém criar um slot de fallback aqui, estará
 * ligando o comportamento novo pra todo mundo sem passar por nenhuma prop.
 */
type LegendSlots = { top: HTMLDivElement | null; bottom: HTMLDivElement | null };

type ChartContextProps = { config: ChartConfig; legendSlots: LegendSlots };
const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const ctx = React.useContext(ChartContext);
  if (!ctx) {
    throw new Error("useChart deve ser usado dentro de <ChartContainer>");
  }
  return ctx;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * "Sem dado" — critério do `emptyState`
 *
 * Vazio = NENHUM número finito nas props `data` que encontramos (a do gráfico e
 * a das séries, até 2 níveis de filhos). Em uma linha, porque cada pedaço dela
 * foi uma decisão:
 *
 * - `0` É dado. Barra de altura zero é informação ("não houve consumo"), não
 *   ausência — trocá-la pelo estado vazio apagaria um fato.
 * - `null` / `undefined` / `NaN` / texto não são. Série que só tem a categoria
 *   do eixo preenchida renderiza exatamente o sintoma do item 28: eixos vazios.
 * - `data` ausente também é vazio: `data={query.data}` antes da resposta é o
 *   caso mais comum de todos, e exigir `[]` deixaria justamente ele de fora.
 * - Por isso olhamos os FILHOS também: `<PieChart><Pie data={…}/></PieChart>`
 *   guarda o dado na série, e sem essa varredura um gráfico cheio viraria
 *   estado vazio. O limite é a árvore ESCRITA: se o dado entra por um
 *   componente seu em volta da série, o container não o enxerga (documentado
 *   na USAGE).
 *
 * Limite conhecido: não distinguimos a chave de categoria da chave de valor —
 * `[{ x: 1696118400000, y: null }]` (eixo temporal numérico, série toda nula)
 * conta como dado por causa do `x`.
 * ────────────────────────────────────────────────────────────────────────── */

const isPlottableValue = (value: unknown): boolean =>
  typeof value === "number" && Number.isFinite(value);

const hasPlottableValue = (data: unknown[]): boolean =>
  data.some(
    (row) =>
      isPlottableValue(row) ||
      (typeof row === "object" &&
        row !== null &&
        Object.values(row).some(isPlottableValue)),
  );

function collectDataProps(node: React.ReactNode, found: unknown[][], depth = 0) {
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement(child)) return;
    const childProps = child.props as { data?: unknown; children?: React.ReactNode };
    if (Array.isArray(childProps.data)) found.push(childProps.data);
    if (depth < 2) collectDataProps(childProps.children, found, depth + 1);
  });
}

function isChartEmpty(children: React.ReactNode): boolean {
  const found: unknown[][] = [];
  collectDataProps(children, found);
  return !found.some(hasPlottableValue);
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    /**
     * Conteúdo a renderizar no lugar do gráfico quando não há dado (ver o
     * critério acima). Ausente = comportamento de hoje: o Recharts desenha os
     * eixos vazios.
     *
     * O nome acompanha o `emptyState` do `DataList` — mesmo conceito, mesmo
     * tipo. (O `renderEmpty` do `DataTable` é o terceiro nome da mesma coisa e
     * o pior dos três: soa render-prop e recebe `ReactNode`. É público, então
     * renomeá-lo é breaking e fica para outra rodada.)
     */
    emptyState?: React.ReactNode;
    /**
     * A altura do `className` passa a ser a da PLOTAGEM, e a legenda soma por
     * fora — em vez de ser descontada dela.
     *
     * Sem a prop (default), vale o de sempre: o Recharts mede o wrapper da
     * legenda e tira essa altura da área de plotagem, então `h-[250px]` com
     * legenda de 1 linha dá 250px de bloco e 228px de gráfico, e uma legenda que
     * quebra em 2 linhas cobra o dobro. Com a prop, os mesmos `h-[250px]` dão
     * 272px de bloco e 250px de gráfico, e a 2ª linha cresce o bloco.
     *
     * Opt-in de propósito: o conserto muda o pixel de QUALQUER gráfico com
     * legenda, inclusive o de 1 linha, que nunca teve queixa. Quem quer o
     * conserto liga; quem está satisfeito não toca em nada.
     *
     * Só tem efeito com `<ChartLegend>` horizontal em `top`/`bottom`. Sem
     * legenda os dois modos renderizam idêntico, e `layout="vertical"` /
     * `verticalAlign="middle"` seguem dentro do gráfico nos dois (ali a legenda
     * ocupa a lateral ou o meio — empurrá-la pra fora mudaria a composição).
     */
    keepPlotHeight?: boolean;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"];
  }
>((
  { id, className, children, config, emptyState, keepPlotHeight = false, ...props },
  ref,
) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
  /* Slots da legenda: estado (não ref) porque o `<ChartLegend>` só sabe pra
   * onde portar depois que o nó existe, e isso precisa disparar render. */
  const [topSlot, setTopSlot] = React.useState<HTMLDivElement | null>(null);
  const [bottomSlot, setBottomSlot] = React.useState<HTMLDivElement | null>(null);
  const value = React.useMemo(
    () => ({ config, legendSlots: { top: topSlot, bottom: bottomSlot } }),
    [config, topSlot, bottomSlot],
  );

  const showEmpty =
    emptyState !== undefined && emptyState !== null && isChartEmpty(children);

  return (
    <ChartContext.Provider value={value}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "text-caption-sm",
          "[&_.recharts-cartesian-axis-tick_text]:fill-fg-muted",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-[var(--color-chart-grid)]",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border-default",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-none",
          "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-[var(--color-chart-grid)]",
          "[&_.recharts-radial-bar-background-sector]:fill-bg-muted",
          "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-bg-muted",
          "[&_.recharts-reference-line_[stroke='#ccc']]:stroke-border-default",
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-sector]:outline-none",
          "[&_.recharts-surface]:outline-none",
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {keepPlotHeight ? <div ref={setTopSlot} /> : null}
        {/* Com `keepPlotHeight`, a altura pedida pelo consumidor vale pra ESTA
            caixa — a do gráfico — e a legenda é irmã dela, então quebrar em 2
            linhas cresce o container em vez de roubar área de plotagem. Sem a
            prop não há slot nenhum, a legenda renderiza dentro do gráfico e esta
            caixa é o bloco inteiro, como sempre foi. */}
        <div
          data-chart-plot=""
          className={cn("flex aspect-video justify-center", className)}
        >
          {showEmpty ? (
            <div
              data-chart-empty=""
              className="flex size-full items-center justify-center text-fg-muted"
            >
              {emptyState}
            </div>
          ) : (
            <RechartsPrimitive.ResponsiveContainer>
              {children}
            </RechartsPrimitive.ResponsiveContainer>
          )}
        </div>
        {keepPlotHeight ? <div ref={setBottomSlot} /> : null}
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

/* ⚠️ O conteúdo do <style> abaixo vai por `dangerouslySetInnerHTML`, então um
 * `</style>` em QUALQUER valor interpolado fecha a tag e o resto do texto é
 * parseado como HTML → XSS. Isso não é hipotético: `config` costuma ser montado
 * a partir das séries que vêm da API (`config[serie] = { label, color }`), e o
 * `id` é prop pública do ChartContainer. Sanitizamos os três pontos de
 * interpolação (id, key, color) em vez de confiar no consumidor.
 *
 * Descartar em silêncio é proposital: cor/chave inválida é bug de integração e
 * o gráfico degrada (cai no default do Recharts) em vez de quebrar a página. */
const SAFE_CSS_IDENT = /^[A-Za-z0-9_-]+$/;
// Cobre o que o DS realmente usa em cor: hex, var(), oklch()/color-mix() (daí a
// barra e o `%`), rgba(). Fora: `<`, `>`, `{`, `}`, `;`, quotes, `@`, `:` — os
// caracteres que fechariam a tag ou emendariam outra declaração/regra.
const SAFE_CSS_VALUE = /^[A-Za-z0-9\s#(),.%/_-]+$/;

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  if (!SAFE_CSS_IDENT.test(id)) return null;

  const colorConfig = Object.entries(config).filter(
    ([key, c]) => (c.theme || c.color) && SAFE_CSS_IDENT.test(key),
  );
  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color && SAFE_CSS_VALUE.test(color)
      ? `  --color-${key}: ${color};`
      : null;
  })
  .filter(Boolean)
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

type TooltipPayloadItem = {
  name?: string | number;
  value?: string | number;
  dataKey?: string | number;
  color?: string;
  payload?: Record<string, unknown>;
  fill?: string;
};

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: React.ReactNode;
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
    labelFormatter?: (value: unknown, payload: TooltipPayloadItem[]) => React.ReactNode;
    formatter?: (
      value: unknown,
      name: string,
      item: TooltipPayloadItem,
      index: number,
      payload: unknown,
    ) => React.ReactNode;
  }
>(
  (
    {
      active,
      payload,
      label,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      labelFormatter,
      formatter,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) return null;
      const [item] = payload;
      const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label;
      if (labelFormatter) {
        return (
          <div className="font-medium text-fg-default">
            {labelFormatter(value, payload)}
          </div>
        );
      }
      if (!value) return null;
      return <div className="font-medium text-fg-default">{value}</div>;
    }, [label, labelFormatter, payload, hideLabel, labelKey, config]);

    if (!active || !payload?.length) return null;

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-gp-sm rounded-radius-lg border border-border-default bg-bg-surface-elevated px-pad-lg py-pad-md text-caption-sm shadow-sh-lg",
          className,
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-gp-sm">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = item.color || item.payload?.fill;

            return (
              <div
                key={item.dataKey ?? index}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-gp-md [&>svg]:size-icon-xs [&>svg]:text-fg-muted",
                  indicator === "dot" && "items-center",
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, String(item.name), item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-radius-xs",
                            indicator === "dot" && "size-2.5",
                            indicator === "line" && "w-1",
                            indicator === "dashed" &&
                              "w-0 border-[1.5px] border-dashed bg-transparent",
                            nestLabel && indicator === "dashed" && "my-0.5",
                          )}
                          style={
                            {
                              backgroundColor:
                                indicator === "dashed"
                                  ? "transparent"
                                  : (indicatorColor as string),
                              borderColor: indicatorColor as string,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center",
                      )}
                    >
                      <div className="grid gap-gp-2xs">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-fg-muted">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value !== undefined && (
                        <span className="font-medium tabular-nums text-fg-default">
                          {typeof item.value === "number"
                            ? item.value.toLocaleString("pt-BR")
                            : item.value}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = "ChartTooltipContent";

/**
 * ChartLegend — a `Legend` do Recharts, renderizada num slot FORA da caixa de
 * altura do gráfico **quando o container pede `keepPlotHeight`**.
 *
 * O problema que o slot resolve: o Recharts mede o wrapper da legenda e desconta
 * essa altura da área de plotagem (`appendOffsetOfLegend`). Com altura fixa, uma
 * legenda que quebra em 2 linhas rouba o dobro — medido: `h-[250px]` com 1 linha
 * deixa a base do eixo X em 203; com 2 linhas, em 181. O gráfico encolhe e nada
 * na tela explica.
 *
 * A prop `portal` é a saída pública do Recharts: com ela o `LegendSizeDispatcher`
 * não é montado, o tamanho da legenda fica `{0,0}` e a plotagem usa a altura
 * inteira. O slot vive DENTRO do `[data-chart]` porque é lá que as CSS vars
 * `--color-{série}` são declaradas — fora dele, a bolinha de cor cairia em
 * `currentColor` (L-039).
 *
 * **Sem `keepPlotHeight` não existe slot**, `portal` fica `null` e a `Legend`
 * renderiza dentro do gráfico, descontando como sempre descontou. É o default:
 * a troca muda o pixel de todo gráfico com legenda, inclusive o de 1 linha.
 *
 * `layout="vertical"` e `verticalAlign="middle"` ficam dentro do gráfico nos
 * DOIS modos: ali a legenda ocupa a lateral/o meio, e empurrá-la pra baixo
 * mudaria a composição, não só a altura.
 */
const ChartLegend = ({
  layout = "horizontal",
  verticalAlign = "bottom",
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.Legend>) => {
  const { legendSlots } = useChart();
  const portal =
    layout === "horizontal" && verticalAlign !== "middle"
      ? legendSlots[verticalAlign]
      : null;

  return (
    <RechartsPrimitive.Legend
      layout={layout}
      verticalAlign={verticalAlign}
      portal={portal}
      {...props}
    />
  );
};
ChartLegend.displayName = "ChartLegend";

type LegendPayloadItem = {
  value?: string;
  dataKey?: string | number;
  color?: string;
};

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: LegendPayloadItem[];
    verticalAlign?: "top" | "bottom";
    hideIcon?: boolean;
    nameKey?: string;
  }
>(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div
      ref={ref}
      className={cn(
        /* `flex-wrap` vale nos DOIS modos, e não acompanha o `keepPlotHeight`:
         * sem ele os itens estouram a largura em silêncio — série some da
         * legenda sem nada na tela dizendo que sumiu. Isso não é um pixel que
         * alguém escolheu, é perda de informação, então não entra atrás de prop.
         * No modo default o preço de quebrar é o gráfico encolher; no outro, o
         * bloco crescer. Nos dois é melhor que a legenda mentir sobre as séries.
         * Quem precisar de uma linha só passa `flex-nowrap` no `className`. */
        "flex flex-wrap items-center justify-center gap-gp-xl",
        verticalAlign === "top" ? "pb-pad-md" : "pt-pad-md",
        className,
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        return (
          <div
            key={item.value}
            className="flex items-center gap-gp-sm text-fg-muted [&>svg]:size-icon-xs [&>svg]:text-fg-muted"
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="size-2.5 shrink-0 rounded-radius-xs"
                style={{ backgroundColor: item.color }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegendContent";

/** Resolve o ChartConfig de um item de payload do Recharts. */
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) return undefined;
  const inner =
    "payload" in payload &&
    typeof (payload as Record<string, unknown>).payload === "object"
      ? ((payload as Record<string, unknown>).payload as Record<string, unknown>)
      : undefined;

  let configLabelKey = key;
  const p = payload as Record<string, unknown>;
  if (key in p && typeof p[key] === "string") {
    configLabelKey = p[key] as string;
  } else if (inner && key in inner && typeof inner[key] === "string") {
    configLabelKey = inner[key] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  useChart,
};
