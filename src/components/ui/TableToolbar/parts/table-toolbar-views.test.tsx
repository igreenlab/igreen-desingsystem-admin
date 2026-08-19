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

/* Regressão — truncamento SILENCIOSO das abas (dogfood de 2026-08-14).
   `maxTabs` default é 3 e a aba "Default" consome 1 slot, então só 2 presets viram aba:
   o 3º é cortado por `.slice(0, maxTabs - 1)` sem erro, sem aviso, sem overflow. Quem
   gerou a tela viu 2 de 3 abas e não teve como aumentar — `maxTabs` existia só aqui, e
   o `DataTable` não expunha nada. O 1º teste PROVA o corte (é o defeito); o 2º prova a
   saída, hoje alcançável via `<DataTable maxViewTabs={4}>`. */
describe("TableToolbarViews — maxTabs corta em silêncio", () => {
  const tresPresets = [
    { id: "v-1", name: "Ativos", owner: "preset" as const },
    { id: "v-2", name: "Inativos", owner: "preset" as const },
    { id: "v-3", name: "Pendentes", owner: "preset" as const },
  ];

  it("com o default (3), o TERCEIRO preset não vira aba — e nada avisa", () => {
    render(
      <TableToolbarViews
        views={tresPresets}
        onApply={noop}
        onApplyDefault={noop}
        onDelete={noop}
        onSave={noop}
        allowCreate={false}
      />,
    );
    expect(screen.getByText("Default")).toBeTruthy();
    expect(screen.getByText("Ativos")).toBeTruthy();
    expect(screen.getByText("Inativos")).toBeTruthy();
    // o defeito: some sem sinal nenhum
    expect(screen.queryByText("Pendentes")).toBeNull();
  });

  it("com maxTabs={4}, os três presets cabem", () => {
    render(
      <TableToolbarViews
        views={tresPresets}
        onApply={noop}
        onApplyDefault={noop}
        onDelete={noop}
        onSave={noop}
        allowCreate={false}
        maxTabs={4}
      />,
    );
    expect(screen.getByText("Ativos")).toBeTruthy();
    expect(screen.getByText("Inativos")).toBeTruthy();
    expect(screen.getByText("Pendentes")).toBeTruthy();
  });
});

/* O corte deixou de ser silencioso (2026-08-19).
   O `.slice()` continua cortando — mudar isso quebraria o layout da barra —, mas em DEV
   agora avisa quais visões não vão aparecer e como aumentar o limite. Antes, a única
   forma de descobrir era medir no browser: foi assim que o audit log registra a própria
   página de doc do DataTable declarando 3 presets e renderizando 2. */
describe("TableToolbarViews — o corte avisa em dev", () => {
  const tresPresets = [
    { id: "v1", name: "Ativos", owner: "preset" as const },
    { id: "v2", name: "Pendentes", owner: "preset" as const },
    { id: "v3", name: "Pipeline (Kanban)", owner: "preset" as const },
  ];
  const base = {
    onApply: noop,
    onApplyDefault: noop,
    onDelete: noop,
    onSave: noop,
    allowCreate: false,
  };

  it("avisa nomeando a visão cortada e o valor que resolveria", () => {
    const avisos: string[] = [];
    const original = console.warn;
    console.warn = (m: string) => avisos.push(String(m));
    try {
      render(<TableToolbarViews views={tresPresets} {...base} />);
    } finally {
      console.warn = original;
    }
    expect(avisos).toHaveLength(1);
    // nomeia a que sumiu
    expect(avisos[0]).toContain("Pipeline (Kanban)");
    // e diz o número que resolve: 3 candidatas + a Default = 4
    expect(avisos[0]).toContain("maxViewTabs={4}");
    // e explica a conta que confunde
    expect(avisos[0]).toContain("Default");
  });

  it("NÃO avisa quando tudo cabe", () => {
    const avisos: string[] = [];
    const original = console.warn;
    console.warn = (m: string) => avisos.push(String(m));
    try {
      render(<TableToolbarViews views={tresPresets.slice(0, 2)} {...base} />);
    } finally {
      console.warn = original;
    }
    expect(avisos).toEqual([]);
  });

  it("NÃO avisa quando maxTabs acomoda todas", () => {
    const avisos: string[] = [];
    const original = console.warn;
    console.warn = (m: string) => avisos.push(String(m));
    try {
      render(<TableToolbarViews views={tresPresets} maxTabs={4} {...base} />);
    } finally {
      console.warn = original;
    }
    expect(avisos).toEqual([]);
  });

  it("avisa UMA vez, não a cada render", () => {
    const avisos: string[] = [];
    const original = console.warn;
    console.warn = (m: string) => avisos.push(String(m));
    try {
      const { rerender } = render(<TableToolbarViews views={tresPresets} {...base} />);
      rerender(<TableToolbarViews views={tresPresets} {...base} />);
      rerender(<TableToolbarViews views={tresPresets} {...base} />);
    } finally {
      console.warn = original;
    }
    expect(avisos).toHaveLength(1);
  });

  it("nome em JSX não vira [object Object] na mensagem", () => {
    const avisos: string[] = [];
    const original = console.warn;
    console.warn = (m: string) => avisos.push(String(m));
    try {
      render(
        <TableToolbarViews
          views={[
            ...tresPresets.slice(0, 2),
            { id: "v-jsx", name: <span>Com ícone</span>, owner: "preset" as const },
          ]}
          {...base}
        />,
      );
    } finally {
      console.warn = original;
    }
    expect(avisos).toHaveLength(1);
    expect(avisos[0]).not.toContain("[object Object]");
    expect(avisos[0]).toContain("v-jsx"); // cai no id
  });
});
