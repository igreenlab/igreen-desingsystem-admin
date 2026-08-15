import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ChartContainer, ChartStyle, type ChartConfig } from "./chart";

/* O ChartStyle escreve CSS por `dangerouslySetInnerHTML`. Estes testes travam o
 * contrato: valor legítimo de cor do DS passa, valor capaz de fechar a tag
 * <style> (→ XSS) não passa. `config` é tipicamente montado a partir das séries
 * que vêm da API, então as chaves/cores são entrada não-confiável. */

const styleOf = (container: HTMLElement) =>
  container.querySelector("style")?.textContent ?? "";

describe("ChartStyle — cores legítimas", () => {
  it("emite a CSS var da série", () => {
    const config: ChartConfig = { desktop: { label: "Desktop", color: "#10b981" } };
    const { container } = render(<ChartStyle id="chart-x" config={config} />);
    expect(styleOf(container)).toContain("--color-desktop: #10b981;");
  });

  it("aceita a sintaxe de cor usada nos tokens do DS (var, oklch com barra, color-mix)", () => {
    const config: ChartConfig = {
      a: { color: "var(--color-chart-1)" },
      b: { color: "oklch(0 0 0 / 0.4)" },
      c: { color: "color-mix(in oklch, var(--color-fg-danger) 70%, black)" },
      d: { color: "rgba(0,0,0,0.55)" },
    };
    const css = styleOf(render(<ChartStyle id="chart-x" config={config} />).container);
    expect(css).toContain("--color-a: var(--color-chart-1);");
    expect(css).toContain("--color-b: oklch(0 0 0 / 0.4);");
    expect(css).toContain("--color-c: color-mix(in oklch, var(--color-fg-danger) 70%, black);");
    expect(css).toContain("--color-d: rgba(0,0,0,0.55);");
  });

  it("resolve cor por tema (light/dark)", () => {
    const config: ChartConfig = {
      s: { theme: { light: "#111111", dark: "#eeeeee" } },
    };
    const css = styleOf(render(<ChartStyle id="chart-x" config={config} />).container);
    expect(css).toContain("--color-s: #111111;");
    expect(css).toContain("--color-s: #eeeeee;");
  });

  it("mantém o <style> quando o id vem do useId (sem prop id)", () => {
    const config: ChartConfig = { desktop: { color: "#10b981" } };
    const { container } = render(
      <ChartContainer config={config}>
        <div />
      </ChartContainer>,
    );
    expect(styleOf(container)).toContain("--color-desktop: #10b981;");
  });
});

describe("ChartStyle — valores hostis", () => {
  it("descarta cor que fecharia a tag <style>", () => {
    const config: ChartConfig = {
      evil: { color: "red} </style><img src=x onerror=alert(1)> <style>{a: b" },
      ok: { color: "#10b981" },
    };
    const { container } = render(<ChartStyle id="chart-x" config={config} />);
    expect(styleOf(container)).not.toContain("</style>");
    expect(styleOf(container)).toContain("--color-ok: #10b981;");
    expect(container.querySelector("img")).toBeNull();
  });

  it("descarta chave de série com caractere estrutural", () => {
    const config: ChartConfig = {
      "x} </style><script>alert(1)</script><style>{y": { color: "#10b981" },
    };
    const { container } = render(<ChartStyle id="chart-x" config={config} />);
    expect(styleOf(container)).not.toContain("</style>");
    expect(container.querySelector("script")).toBeNull();
  });

  it("não emite nada quando o id do gráfico é hostil", () => {
    const config: ChartConfig = { desktop: { color: "#10b981" } };
    const { container } = render(
      <ChartStyle id={"x] {} </style><img src=x onerror=alert(1)>"} config={config} />,
    );
    expect(container.querySelector("style")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  it("rejeita `;` na cor (impede declaração extra na regra)", () => {
    const config: ChartConfig = {
      evil: { color: "#fff; background: url(https://attacker.example/x)" },
    };
    const { container } = render(<ChartStyle id="chart-x" config={config} />);
    expect(styleOf(container)).not.toContain("attacker.example");
  });
});
