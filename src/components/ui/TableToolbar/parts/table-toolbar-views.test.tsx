import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TableToolbarViews } from "./table-toolbar-views";

/* Regressão — Bug pego pelo dogfood (tela de Líderes):
   presets (defaultViews, owner "preset") DEVEM aparecer como abas fixas read-only,
   inclusive com allowCreate={false}. Antes, só owner "me" auto-pinava, então os
   presets ficavam INALCANÇÁVEIS (com allowCreate=false o "+" some e não há como
   aplicá-los). USAGE + L-054 + a skill crud-builder prometiam que funcionava. */

const noop = () => {};

describe("TableToolbarViews — presets como abas fixas", () => {
  it("mostra os presets (owner 'preset') como abas mesmo com allowCreate=false", () => {
    render(
      <TableToolbarViews
        views={[
          { id: "v-ativos", name: "Ativos", owner: "preset" },
          { id: "v-inativos", name: "Inativos", owner: "preset" },
        ]}
        onApply={noop}
        onApplyDefault={noop}
        onDelete={noop}
        onSave={noop}
        allowCreate={false}
      />,
    );

    // as duas abas de preset aparecem, além da Default (getByText lança se ausente)
    expect(screen.getByText("Ativos")).toBeTruthy();
    expect(screen.getByText("Inativos")).toBeTruthy();
    expect(screen.getByText("Default")).toBeTruthy();
  });

  it("presets contam pra label da Default (não vira soloLabel quando há preset)", () => {
    render(
      <TableToolbarViews
        views={[{ id: "v-ativos", name: "Ativos", owner: "preset" }]}
        onApply={noop}
        onApplyDefault={noop}
        onDelete={noop}
        onSave={noop}
        soloLabel="Lista de Líderes"
        allowCreate={false}
      />,
    );
    // com ≥1 preset, a primeira aba é "Default" (não o soloLabel)
    expect(screen.getByText("Default")).toBeTruthy();
    expect(screen.queryByText("Lista de Líderes")).toBeNull();
  });
});
