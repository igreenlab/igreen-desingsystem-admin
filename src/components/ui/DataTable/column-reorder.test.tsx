/**
 * `enableColumnReorder` — liga/desliga o arrasto de cabeçalho do DataTable (SOLIS-391).
 *
 * O Sólis escolhe a ordem das colunas num painel próprio ("Colunas e ordem"), salvo por
 * usuário. O DataTable deixava arrastar QUALQUER cabeçalho — com o mouse e, via
 * `KeyboardSensor`, com Espaço/Enter — mesmo com `toolbar.enableColumns: false`. Duas fontes
 * de ordem: o usuário reordenava por um lado e o outro desfazia.
 *
 * ⚠️ jsdom não faz layout: todo `getBoundingClientRect` devolve 0, e o dnd-kit decide o
 * alvo do arrasto por colisão de retângulos — com tudo zerado ele nunca acharia um `over`
 * e "não reordenou" passaria por vacuidade. `medirCabecalhos` dá a cada cabeçalho um
 * retângulo de 100px lado a lado, na ordem em que estão no DOM. O teste do caminho padrão
 * prova que ESSA bancada reordena de verdade; só então o `false` prova alguma coisa.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DataTable } from "./data-table";
import type { DataTableColumnDef } from "./data-table.types";

interface Linha {
  id: string;
  nome: string;
  cidade: string;
  valor: number;
}

const LINHAS: Linha[] = [
  { id: "1", nome: "Beta", cidade: "Recife", valor: 20 },
  { id: "2", nome: "Alfa", cidade: "Natal", valor: 10 },
  { id: "3", nome: "Gama", cidade: "Belém", valor: 30 },
];

const COLUNAS: DataTableColumnDef<Linha>[] = [
  { field: "nome", headerName: "Nome" },
  { field: "cidade", headerName: "Cidade" },
  { field: "valor", headerName: "Valor", type: "number" },
];

beforeAll(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

const LARGURA = 100;
let restaurar: (() => void) | null = null;

/** Cada cabeçalho ocupa 100px, lado a lado, na ordem do DOM. */
function medirCabecalhos() {
  const original = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function (this: Element) {
    if (this.getAttribute("role") === "columnheader") {
      const todos = Array.from(
        this.parentElement?.querySelectorAll('[role="columnheader"]') ?? [],
      );
      const i = todos.indexOf(this);
      return {
        x: i * LARGURA,
        y: 0,
        left: i * LARGURA,
        right: (i + 1) * LARGURA,
        top: 0,
        bottom: 40,
        width: LARGURA,
        height: 40,
        toJSON: () => ({}),
      } as DOMRect;
    }
    return original.call(this);
  };
  restaurar = () => {
    Element.prototype.getBoundingClientRect = original;
  };
}

beforeEach(() => medirCabecalhos());
afterEach(() => {
  restaurar?.();
  restaurar = null;
});

function montar(extra: Record<string, unknown> = {}, colunas = COLUNAS) {
  return render(
    <DataTable<Linha>
      rows={LINHAS}
      columns={colunas}
      getRowId={(r) => r.id}
      {...extra}
    />,
  );
}

const cabecalhos = () => screen.getAllByRole("columnheader");
const ordemDosCampos = () =>
  cabecalhos()
    .map((h) => h.getAttribute("data-field"))
    .filter((f): f is string => !!f);
const cabecalho = (campo: string) => {
  const el = cabecalhos().find((h) => h.getAttribute("data-field") === campo);
  if (!el) throw new Error(`cabeçalho ${campo} não encontrado`);
  return el;
};

/** Arrasta o cabeçalho `de` até o centro do `para` com o mouse (pointer events). */
async function arrastar(de: string, para: string) {
  const user = userEvent.setup();
  const origem = cabecalho(de);
  const destino = cabecalho(para);
  const idx = (el: HTMLElement) => cabecalhos().indexOf(el);
  const xDe = idx(origem) * LARGURA + LARGURA / 2;
  const xPara = idx(destino) * LARGURA + LARGURA / 2;
  await user.pointer([
    { keys: "[MouseLeft>]", target: origem, coords: { clientX: xDe, clientY: 20 } },
    // além dos 5px do activationConstraint, em passos
    { coords: { clientX: xDe + 12, clientY: 20 } },
    { coords: { clientX: (xDe + xPara) / 2, clientY: 20 } },
    { coords: { clientX: xPara, clientY: 20 } },
    { keys: "[/MouseLeft]", coords: { clientX: xPara, clientY: 20 } },
  ]);
}

/** Pega a coluna `campo` pelo teclado (Espaço), desce uma casa (→) e solta (Espaço). */
async function pegarPeloTeclado(campo: string, tecla: "{ }" | "{Enter}") {
  const user = userEvent.setup();
  const el = cabecalho(campo);
  act(() => el.focus());
  await user.keyboard(tecla);
  return user;
}

describe("enableColumnReorder — caminho padrão (nada muda)", () => {
  it("bancada: com o padrão, arrastar o cabeçalho com o mouse REORDENA", async () => {
    montar();
    expect(ordemDosCampos()).toEqual(["nome", "cidade", "valor"]);

    await arrastar("nome", "valor");

    // A prova de que a bancada serve: sem este teste verde, o `false` abaixo seria vácuo.
    expect(ordemDosCampos()).toEqual(["cidade", "valor", "nome"]);
  });

  it("com `enableColumnReorder={true}` explícito é o mesmo caminho", async () => {
    montar({ enableColumnReorder: true });
    await arrastar("nome", "valor");
    expect(ordemDosCampos()).toEqual(["cidade", "valor", "nome"]);
  });

  it("Espaço no cabeçalho PEGA a coluna (aria-pressed) e as setas a movem", async () => {
    montar();
    const user = await pegarPeloTeclado("nome", "{ }");
    expect(cabecalho("nome").getAttribute("aria-pressed")).toBe("true");

    await user.keyboard("{ArrowRight}");
    await user.keyboard("{ }");
    expect(ordemDosCampos()).toEqual(["cidade", "nome", "valor"]);
  });

  it("Enter também pega a coluna", async () => {
    montar();
    await pegarPeloTeclado("nome", "{Enter}");
    expect(cabecalho("nome").getAttribute("aria-pressed")).toBe("true");
  });

  it("o cabeçalho ordenável segue com cursor pointer e os atributos do dnd-kit", () => {
    montar();
    const h = cabecalho("nome");
    expect(h.style.cursor).toBe("pointer");
    expect(h.getAttribute("tabindex")).toBe("0");
    expect(h.getAttribute("aria-roledescription")).toBe("sortable");
  });
});

describe("enableColumnReorder={false} — a grade deixa de ser fonte de ordem", () => {
  it("arrastar o cabeçalho com o mouse (além dos 5px) NÃO reordena", async () => {
    montar({ enableColumnReorder: false });
    expect(ordemDosCampos()).toEqual(["nome", "cidade", "valor"]);

    await arrastar("nome", "valor");

    expect(ordemDosCampos()).toEqual(["nome", "cidade", "valor"]);
  });

  it("o arrasto não chega a começar: nenhum cabeçalho fica 'pego' no meio do gesto", async () => {
    montar({ enableColumnReorder: false });
    const user = userEvent.setup();
    const origem = cabecalho("nome");
    await user.pointer([
      { keys: "[MouseLeft>]", target: origem, coords: { clientX: 50, clientY: 20 } },
      { coords: { clientX: 150, clientY: 20 } },
    ]);

    expect(origem.getAttribute("aria-pressed")).toBeNull();
    expect(origem.style.opacity).toBe("");
    expect(origem.style.cursor).not.toBe("grabbing");
    await user.pointer({ keys: "[/MouseLeft]" });
  });

  it("Espaço no cabeçalho NÃO pega a coluna", async () => {
    montar({ enableColumnReorder: false });
    const user = await pegarPeloTeclado("nome", "{ }");
    await user.keyboard("{ArrowRight}");
    await user.keyboard("{ }");

    expect(cabecalho("nome").getAttribute("aria-pressed")).toBeNull();
    expect(ordemDosCampos()).toEqual(["nome", "cidade", "valor"]);
  });

  it("Enter no cabeçalho NÃO pega a coluna", async () => {
    montar({ enableColumnReorder: false });
    const user = await pegarPeloTeclado("nome", "{Enter}");
    await user.keyboard("{ArrowRight}");
    await user.keyboard("{Enter}");

    expect(cabecalho("nome").getAttribute("aria-pressed")).toBeNull();
    expect(ordemDosCampos()).toEqual(["nome", "cidade", "valor"]);
  });

  it("o cursor não indica arrasto, nem em coluna ordenável nem em coluna sem ordenação", () => {
    montar(
      { enableColumnReorder: false },
      [
        { field: "nome", headerName: "Nome" },
        { field: "cidade", headerName: "Cidade", sortable: false },
        { field: "valor", headerName: "Valor", type: "number" },
      ],
    );
    for (const campo of ["nome", "cidade", "valor"]) {
      const cursor = cabecalho(campo).style.cursor;
      expect(cursor, campo).not.toBe("grab");
      expect(cursor, campo).not.toBe("grabbing");
      expect(cursor, campo).toBe("");
    }
  });

  it("o cabeçalho deixa de anunciar 'sortable' e de ser parada de Tab", () => {
    montar({ enableColumnReorder: false });
    for (const h of cabecalhos().filter((c) => c.getAttribute("data-field"))) {
      expect(h.hasAttribute("tabindex")).toBe(false);
      expect(h.hasAttribute("aria-roledescription")).toBe(false);
      expect(h.hasAttribute("aria-describedby")).toBe(false);
    }
  });

  it("o clique no cabeçalho continua ordenando a coluna ordenável", async () => {
    montar({ enableColumnReorder: false });
    const user = userEvent.setup();
    const valorDe = (campo: string) => cabecalho(campo).getAttribute("aria-sort");
    expect(valorDe("nome")).toBe("none");

    await user.click(cabecalho("nome"));
    expect(valorDe("nome")).toBe("ascending");
    expect(
      screen.getAllByRole("gridcell").filter((c) => /Alfa|Beta|Gama/.test(c.textContent ?? ""))
        .map((c) => c.textContent),
    ).toEqual(["Alfa", "Beta", "Gama"]);

    await user.click(cabecalho("nome"));
    expect(valorDe("nome")).toBe("descending");
  });

  it("o clique não ordena a coluna com `sortable: false`", async () => {
    montar({ enableColumnReorder: false }, [
      { field: "nome", headerName: "Nome", sortable: false },
      { field: "cidade", headerName: "Cidade" },
    ]);
    const user = userEvent.setup();
    await user.click(cabecalho("nome"));
    expect(cabecalho("nome").hasAttribute("aria-sort")).toBe(false);
  });

  it("é independente de `toolbar.enableColumns`: o popover some e o arrasto continua valendo o que a prop disser", async () => {
    // enableColumns:false sozinho NÃO desliga o arrasto (é o defeito original do SOLIS-391)…
    const a = montar({ toolbar: { enableColumns: false } });
    await arrastar("nome", "valor");
    expect(ordemDosCampos()).toEqual(["cidade", "valor", "nome"]);
    a.unmount();

    // …e as duas juntas travam a ordem de vez.
    montar({ toolbar: { enableColumns: false }, enableColumnReorder: false });
    await arrastar("nome", "valor");
    expect(ordemDosCampos()).toEqual(["nome", "cidade", "valor"]);
  });

  it("alternar a prop em runtime liga e desliga o arrasto", async () => {
    const { rerender } = montar({ enableColumnReorder: false });
    await arrastar("nome", "cidade");
    expect(ordemDosCampos()).toEqual(["nome", "cidade", "valor"]);

    rerender(
      <DataTable<Linha>
        rows={LINHAS}
        columns={COLUNAS}
        getRowId={(r) => r.id}
        enableColumnReorder
      />,
    );
    await arrastar("nome", "cidade");
    expect(ordemDosCampos()).toEqual(["cidade", "nome", "valor"]);
  });
});
