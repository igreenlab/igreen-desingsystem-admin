import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";

/**
 * Par com `scripts/lib/tooltip-contrast.test.mjs`, e os dois juntos é que
 * fecham a afirmação.
 *
 * Aquele mede o VALOR dos tokens no CSS gerado; este trava o COMPONENTE nos
 * tokens certos. Sozinhos, cada um passa com o defeito de volta: trocar a
 * classe aqui por `bg-bg-emphasis` não mexe em var nenhuma, e o teste de
 * contraste continuaria verde medindo um token que a tooltip não usa mais.
 *
 * ⚠️ `getByRole("tooltip")` NÃO serve: o `role="tooltip"` do Radix vive num
 * `<span>` sr-only do `aria-describedby`, sem classe nenhuma. O nó real é
 * `[data-radix-popper-content-wrapper] > *`.
 */

const bolha = () =>
  document.querySelector("[data-radix-popper-content-wrapper] > *");

const classesDaBolha = () =>
  (bolha()?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);

const abrir = () =>
  render(
    <Tooltip defaultOpen>
      <TooltipTrigger>gatilho</TooltipTrigger>
      <TooltipContent>dica</TooltipContent>
    </Tooltip>,
  );

describe("Tooltip — a bolha usa o token invertido", () => {
  it("o fundo é bg-bg-tooltip, não o bg-bg-emphasis compartilhado", () => {
    abrir();
    const classes = classesDaBolha();

    expect(classes).toContain("bg-bg-tooltip");
    expect(classes).not.toContain("bg-bg-emphasis");
  });

  it("o texto é fg-on-tooltip — par do fundo invertido", () => {
    abrir();
    const classes = classesDaBolha();

    expect(classes).toContain("text-fg-on-tooltip");
    expect(classes).not.toContain("text-fg-default");
  });

  it("a seta acompanha o fundo (senão aparece um bico de outra cor)", () => {
    abrir();
    const svg = bolha()?.querySelector("svg");

    expect(svg).not.toBeNull();
    expect((svg?.getAttribute("class") ?? "").split(/\s+/)).toContain(
      "fill-bg-tooltip",
    );
  });

  /* ── CAMINHO ANTIGO: o que não pode mudar ── */

  it("geometria e sombra seguem as de sempre", () => {
    abrir();
    const classes = classesDaBolha();

    expect(classes).toContain("rounded-radius-md");
    expect(classes).toContain("shadow-sh-md");
    expect(classes).toContain("text-caption-sm");
    expect(classes).toContain("px-pad-lg");
    expect(classes).toContain("py-pad-xs");
  });

  it("showArrow={false} continua tirando a seta", () => {
    render(
      <Tooltip defaultOpen>
        <TooltipTrigger>gatilho</TooltipTrigger>
        <TooltipContent showArrow={false}>dica</TooltipContent>
      </Tooltip>,
    );

    expect(bolha()).not.toBeNull();
    expect(bolha()!.querySelector("svg")).toBeNull();
  });
});
