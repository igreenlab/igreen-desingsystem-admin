import { afterEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "./chart";

/* Dois contratos do ChartContainer que só se enxergam medindo o layout:
 *
 * 1. `emptyState` — gráfico sem dado renderiza o nó do consumidor no lugar dos eixos
 *    vazios. Sem a prop, nada muda.
 * 2. A legenda mora FORA da caixa de altura fixa (portal do Recharts), então
 *    quebrar em 2 linhas faz o container crescer em vez de achatar o gráfico.
 *
 * jsdom não tem layout: `getBoundingClientRect` devolve 0 em tudo, e sem tamanho
 * o `ResponsiveContainer` não renderiza filho nenhum. O stub abaixo dá tamanho
 * ao container e à legenda — é o MESMO caminho que o Recharts usa no browser
 * (`useElementOffset` lê `getBoundingClientRect` do wrapper da legenda e
 * desconta essa altura da área de plotagem), então o número medido aqui é o
 * mesmo mecanismo do pixel real, não uma simulação dele. */

const CHART = { width: 400, height: 260 };
const origRect = Element.prototype.getBoundingClientRect;

function rect(width: number, height: number): DOMRect {
  return {
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect;
}

/** Dá layout ao jsdom: container 400×260 e legenda com a altura pedida. */
function stubLayout(legendHeight: number) {
  Element.prototype.getBoundingClientRect = function () {
    const el = this as Element;
    if (el.classList?.contains("recharts-legend-wrapper")) {
      return rect(CHART.width - 10, legendHeight);
    }
    if (el.classList?.contains("recharts-responsive-container")) {
      return rect(CHART.width, CHART.height);
    }
    return rect(0, 0);
  };
}

afterEach(() => {
  Element.prototype.getBoundingClientRect = origRect;
});

const config: ChartConfig = { total: { label: "Total", color: "#10b981" } };

/** Onde termina a área de plotagem: o `y` da linha do eixo X. */
function baseDoEixoX(container: HTMLElement) {
  return container
    .querySelector(".recharts-xAxis .recharts-cartesian-axis-line")
    ?.getAttribute("y1");
}

function renderBarras(options: { legenda: boolean; data?: unknown[] }) {
  return render(
    <ChartContainer config={config}>
      <BarChart data={options.data ?? [{ mes: "jan", total: 10 }, { mes: "fev", total: 20 }]}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="mes" />
        <YAxis />
        <Bar dataKey="total" fill="var(--color-total)" />
        {options.legenda ? <ChartLegend content={<ChartLegendContent />} /> : null}
      </BarChart>
    </ChartContainer>,
  );
}

describe("ChartContainer — legenda não achata o gráfico", () => {
  it("legenda em 2 linhas nao reduz a area do grafico", () => {
    stubLayout(22);
    const umaLinha = baseDoEixoX(renderBarras({ legenda: true }).container);

    Element.prototype.getBoundingClientRect = origRect;
    stubLayout(44);
    const duasLinhas = baseDoEixoX(renderBarras({ legenda: true }).container);

    expect(umaLinha).not.toBeNull();
    expect(duasLinhas).toBe(umaLinha);
  });

  it("a legenda não tira altura nenhuma da plotagem (mesma base do gráfico sem legenda)", () => {
    stubLayout(22);
    const semLegenda = baseDoEixoX(renderBarras({ legenda: false }).container);
    const comLegenda = baseDoEixoX(renderBarras({ legenda: true }).container);

    expect(semLegenda).not.toBeNull();
    expect(comLegenda).toBe(semLegenda);
  });

  it("a legenda sai da caixa de altura, mas continua dentro do escopo das CSS vars", () => {
    stubLayout(22);
    const { container } = renderBarras({ legenda: true });

    const escopo = container.querySelector("[data-chart]");
    const caixa = container.querySelector("[data-chart-plot]");
    const legenda = container.querySelector(".recharts-legend-wrapper");

    expect(legenda).not.toBeNull();
    // dentro do [data-chart]: é lá que `--color-total` é declarada
    expect(escopo?.contains(legenda!)).toBe(true);
    // fora da caixa que carrega a altura pedida pelo consumidor
    expect(caixa?.contains(legenda!)).toBe(false);
  });
});

describe("ChartContainer — emptyState", () => {
  it("sem emptyState, grafico sem dado renderiza como hoje", () => {
    stubLayout(0);
    const { container } = renderBarras({ legenda: false, data: [] });

    expect(container.querySelector("[data-chart-empty]")).toBeNull();
    expect(container.querySelector(".recharts-responsive-container")).not.toBeNull();
    expect(container.querySelector(".recharts-xAxis")).not.toBeNull();
  });

  it("com emptyState e data vazio, mostra o nó do consumidor no lugar dos eixos", () => {
    stubLayout(0);
    const { container } = render(
      <ChartContainer config={config} emptyState={<p>Sem dados no período</p>}>
        <BarChart data={[]}>
          <XAxis dataKey="mes" />
          <Bar dataKey="total" />
        </BarChart>
      </ChartContainer>,
    );

    expect(container.querySelector("[data-chart-empty]")?.textContent).toBe(
      "Sem dados no período",
    );
    expect(container.querySelector(".recharts-xAxis")).toBeNull();
  });

  it("todos os valores nulos conta como sem dado", () => {
    stubLayout(0);
    const { container } = render(
      <ChartContainer config={config} emptyState={<p>Sem dados</p>}>
        <BarChart data={[{ mes: "jan", total: null }, { mes: "fev", total: undefined }]}>
          <Bar dataKey="total" />
        </BarChart>
      </ChartContainer>,
    );

    expect(container.querySelector("[data-chart-empty]")).not.toBeNull();
  });

  it("zero é dado: não cai no emptyState", () => {
    stubLayout(0);
    const { container } = render(
      <ChartContainer config={config} emptyState={<p>Sem dados</p>}>
        <BarChart data={[{ mes: "jan", total: 0 }]}>
          <XAxis dataKey="mes" />
          <Bar dataKey="total" />
        </BarChart>
      </ChartContainer>,
    );

    expect(container.querySelector("[data-chart-empty]")).toBeNull();
    expect(container.querySelector(".recharts-xAxis")).not.toBeNull();
  });

  it("dado na série e não no gráfico (Pie) não cai no emptyState", () => {
    stubLayout(0);
    const { container } = render(
      <ChartContainer config={config} emptyState={<p>Sem dados</p>}>
        <PieChart>
          <Pie data={[{ fonte: "solar", kwh: 120 }]} dataKey="kwh" nameKey="fonte" />
        </PieChart>
      </ChartContainer>,
    );

    expect(container.querySelector("[data-chart-empty]")).toBeNull();
    expect(container.querySelector(".recharts-pie")).not.toBeNull();
  });
});
