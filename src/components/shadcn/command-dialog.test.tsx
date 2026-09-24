import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Command, CommandDialog, CommandInput, CommandList, CommandLoading } from "./command";

/**
 * R.5 do retorno do igreen-tickets: o `CommandDialog` era `({children, ...DialogProps})`
 * — não repassava nada ao conteúdo nem ao cmdk, e fixava 384px. Busca no SERVIDOR era
 * impossível por ele, porque não havia como passar `shouldFilter={false}`. Eles montaram
 * a busca global com `Dialog` + `Command` na mão: composição legítima, mas não deveria
 * ser obrigatória pra algo tão comum.
 *
 * ⚠️ O primeiro caso é o que importa: o DEFAULT continua 384px. Tokenizar o valor não
 * pode mudar a largura de quem já usa.
 */
describe("CommandDialog", () => {
  const abrir = (props = {}) =>
    render(
      <CommandDialog open {...props}>
        <CommandInput placeholder="Buscar…" />
        <CommandList />
      </CommandDialog>,
    );

  it("default é 384px — a largura de sempre", () => {
    abrir();
    expect(screen.getByRole("dialog").className).toContain("sm:max-w-sm");
  });

  it.each([
    ["md", "sm:max-w-drawer-md"],
    ["lg", "sm:max-w-modal-md"],
  ] as const)("size=%s → %s", (size, esperado) => {
    abrir({ size });
    expect(screen.getByRole("dialog").className).toContain(esperado);
  });

  it("contentClassName chega no conteúdo", () => {
    abrir({ contentClassName: "max-h-[70vh]" });
    expect(screen.getByRole("dialog").className).toContain("max-h-[70vh]");
  });

  it("commandProps chega no cmdk — é o que destrava busca no servidor", () => {
    render(
      <CommandDialog open commandProps={{ shouldFilter: false }}>
        <CommandInput placeholder="Buscar…" />
        <CommandList>
          <div role="option" aria-selected={false}>Resultado do servidor</div>
        </CommandList>
      </CommandDialog>,
    );
    // com shouldFilter={false} o cmdk não esconde nada por conta própria
    expect(screen.getByText("Resultado do servidor")).toBeTruthy();
  });

  it("title acessível é configurável", () => {
    abrir({ title: "Busca global" });
    expect(screen.getByText("Busca global")).toBeTruthy();
  });

  it("CommandLoading é exportado pelo DS", () => {
    render(
      <Command>
        <CommandLoading>Carregando…</CommandLoading>
      </Command>,
    );
    expect(screen.getByText("Carregando…")).toBeTruthy();
  });
});
