/**
 * O carregamento assíncrono do `MultiSelectDropdown` era uma linha de texto de
 * 12px no FIM da lista. Numa lista ainda vazia — que é exatamente quando ele
 * aparece — o popover abria com um rodapezinho cinza e nada mais: affordance
 * fraca para o único estado em que o usuário precisa esperar.
 *
 * Passa a ser um estado CENTRADO: `Spinner` do DS + o mesmo texto, numa caixa
 * `items-center justify-center` com respiro próprio.
 *
 * Duas decisões que vieram das regras já medidas neste componente:
 *
 *  - **o spinner é decorativo** (`aria-hidden`) e quem anuncia é o texto. É a
 *    receita do próprio `Spinner` ("dentro de um botão que já tem texto
 *    'Salvando…', passe aria-hidden"); sem isso o leitor de tela diria
 *    "Carregando" duas vezes.
 *  - **a caixa não reserva piso.** O respiro é `py`, não `min-h`: a Rodada 1
 *    tirou daqui justamente um piso de 96px que deixava vazio quando só o
 *    carregamento estava na tela (`multi-dropdown-coerencia.test.tsx` §2), e
 *    centralizar não pode trazê-lo de volta pela porta dos fundos.
 */
import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { MultiSelectDropdown } from "./definitions/multi-select-column-type";
import type { ColumnOption } from "./column-types.types";

const OPCOES: ColumnOption[] = [
  { value: "ativo", label: "Ativo" },
  { value: "pausado", label: "Pausado" },
];

const renderMulti = (
  over: Partial<React.ComponentProps<typeof MultiSelectDropdown>> = {},
) =>
  render(
    <MultiSelectDropdown
      value={[]}
      onChange={() => {}}
      options={OPCOES}
      operator="isAnyOf"
      {...over}
    />,
  );

/** O SVG que gira — `animate-spin` é a assinatura do `Spinner` do DS. */
const spinner = () => document.querySelector("svg.animate-spin");

/** A caixa do estado de carregamento (o pai do texto). */
const caixaDeCarregando = () => screen.getByText("Carregando…").parentElement!;

describe("MultiSelectDropdown — carregamento centrado", () => {
  it("async em voo: desenha o Spinner do DS, não só a linha de texto", async () => {
    renderMulti({ options: [], loadOptions: () => new Promise(() => {}) });
    await waitFor(() => expect(screen.getByText("Carregando…")).toBeTruthy());

    expect(spinner()).not.toBeNull();
  });

  it("o estado é CENTRADO, com respiro próprio", async () => {
    renderMulti({ options: [], loadOptions: () => new Promise(() => {}) });
    await waitFor(() => expect(screen.getByText("Carregando…")).toBeTruthy());

    const classes = (caixaDeCarregando().getAttribute("class") ?? "").split(/\s+/);
    expect(classes).toContain("items-center");
    expect(classes).toContain("justify-center");
    expect(classes).toContain("py-pad-2xl");
  });

  it("centralizar NÃO traz de volta o piso que a Rodada 1 tirou", async () => {
    renderMulti({ options: [], loadOptions: () => new Promise(() => {}) });
    await waitFor(() => expect(screen.getByText("Carregando…")).toBeTruthy());

    const caixa = caixaDeCarregando();
    expect(caixa.getAttribute("class") ?? "").not.toContain("min-h-");
    const lista = caixa.closest(".overflow-y-auto")!;
    expect(lista.getAttribute("class") ?? "").not.toContain("min-h-");
  });

  it("quem ANUNCIA é o texto — o spinner vai aria-hidden, sem role", async () => {
    renderMulti({ options: [], loadOptions: () => new Promise(() => {}) });
    await waitFor(() => expect(screen.getByText("Carregando…")).toBeTruthy());

    const svg = spinner()!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("role")).toBeNull();
    expect(screen.queryAllByRole("status")).toHaveLength(0);
  });

  it("as opções chegam e o estado some inteiro", async () => {
    let resolver!: (r: { options: ColumnOption[]; hasMore: boolean }) => void;
    renderMulti({
      options: [],
      loadOptions: vi.fn(
        () =>
          new Promise<{ options: ColumnOption[]; hasMore: boolean }>(
            (r) => (resolver = r),
          ),
      ),
    });
    await waitFor(() => expect(screen.getByText("Carregando…")).toBeTruthy());

    await act(async () => resolver({ options: OPCOES, hasMore: false }));
    expect(screen.queryByText("Carregando…")).toBeNull();
    expect(spinner()).toBeNull();
  });

  /* ── CAMINHO ANTIGO: o que não pode mudar ── */

  it("sync (sem loadOptions) nunca mostra carregamento nem spinner", () => {
    renderMulti();
    expect(screen.queryByText("Carregando…")).toBeNull();
    expect(spinner()).toBeNull();
  });

  it("o texto continua sendo 'Carregando…' — mesma palavra de sempre", async () => {
    renderMulti({ options: [], loadOptions: () => new Promise(() => {}) });
    await waitFor(() => expect(screen.getByText("Carregando…")).toBeTruthy());

    const p = screen.getByText("Carregando…");
    const classes = (p.getAttribute("class") ?? "").split(/\s+/);
    expect(classes).toContain("text-body-xs");
    expect(classes).toContain("text-fg-muted");
  });

  it("erro continua com a saída própria, sem spinner junto", async () => {
    renderMulti({
      options: [],
      loadOptions: async () => {
        throw new Error("falhou");
      },
    });
    await waitFor(() =>
      expect(screen.getByText("Falha ao carregar as opções.")).toBeTruthy(),
    );
    expect(spinner()).toBeNull();
    expect(screen.getByRole("button", { name: "Tentar de novo" })).toBeTruthy();
  });
});
