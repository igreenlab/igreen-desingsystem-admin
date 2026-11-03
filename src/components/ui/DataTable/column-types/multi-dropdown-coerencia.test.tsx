/**
 * Três defeitos de COERÊNCIA no `MultiSelectDropdown` (o widget do chip multiSelect) —
 * nenhum é preferência visual: em cada um o DS discordava de si mesmo.
 *
 *  1. "Limpar" aparecia mesmo sem nenhuma opção, enquanto o "Selecionar todos" — o outro
 *     link da mesma linha — já sumia nesse estado.
 *  2. `LISTA_MAX_H` era um PISO: a lista reservava 96px mesmo com 1 ou 2 opções (ou só o
 *     "Carregando…"), deixando um vazio. Passa a ser só TETO; a altura vem do conteúdo.
 *  3. O popover do chip é dimensionado pelo conteúdo, então filtrar a lista (que estreita
 *     as linhas visíveis) encolhia o popover no meio da digitação.
 *
 * ⚠️ jsdom não tem layout. O que estes casos travam é a DECISÃO (que classe/valor o
 * componente emite e quando), não o pixel — a medição de altura e largura reais é no
 * browser, em `#/filter-chips-lab`. Onde o teste mede "largura", é um `offsetWidth`
 * simulado dirigindo o `ResizeObserver` simulado: o que se prova é a lógica do trava.
 *
 * Cada defeito tem o par do CAMINHO ANTIGO: o comportamento que não pode mudar.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MultiSelectDropdown } from "./definitions/multi-select-column-type";
import type { ColumnOption } from "./column-types.types";

const OPCOES: ColumnOption[] = [
  { value: "ativo", label: "Ativo" },
  { value: "pausado", label: "Pausado" },
  { value: "encerrado", label: "Encerrado" },
];

/** 12 opções: passa de BUSCA_A_PARTIR_DE (10), então o campo de busca existe. */
const MUITAS: ColumnOption[] = Array.from({ length: 12 }, (_, i) => ({
  value: `o${i + 1}`,
  label: `Opção ${String(i + 1).padStart(2, "0")}`,
}));

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

/** O container rolável: o pai direto das linhas de opção. */
const listaDe = (rotulo: string) =>
  screen.getByRole("checkbox", { name: rotulo }).closest("label")!.parentElement!;

const limpar = () => screen.queryByRole("button", { name: "Limpar" });

/* ═══ 1 · "Limpar" some junto com o "Selecionar todos" ═════════════════════ */

describe("'Limpar' não aparece enquanto não há opções", () => {
  it("async: nem antes do 1º fetch, nem durante o 'Carregando…' — aparece quando as opções chegam", async () => {
    let resolver!: (r: { options: ColumnOption[]; hasMore: boolean }) => void;
    const loadOptions = vi.fn(
      () => new Promise<{ options: ColumnOption[]; hasMore: boolean }>((r) => (resolver = r)),
    );
    renderMulti({ options: [], loadOptions });

    // antes do 1º fetch (o efeito dispara num setTimeout 0)
    expect(limpar()).toBeNull();
    expect(screen.queryByRole("button", { name: "Selecionar todos" })).toBeNull();

    await waitFor(() => expect(loadOptions).toHaveBeenCalledTimes(1));
    expect(screen.getByText("Carregando…")).toBeTruthy();
    expect(limpar()).toBeNull();
    expect(screen.queryByRole("button", { name: "Selecionar todos" })).toBeNull();

    await act(async () => resolver({ options: OPCOES, hasMore: false }));
    expect(screen.getByRole("button", { name: "Selecionar todos" })).toBeTruthy();
    expect(limpar()).toBeTruthy();
  });

  it("async sem resultado e nada marcado: sem 'Limpar' e sem linha de ações vazia", async () => {
    const { container } = renderMulti({
      options: [],
      loadOptions: async () => ({ options: [], hasMore: false }),
    });
    await waitFor(() => expect(screen.getByText("Nenhuma opção encontrada")).toBeTruthy());
    expect(limpar()).toBeNull();
    // A linha de ações é `justify-between` e ganha `gap` do container: vazia, deixaria um
    // espaço fantasma entre a busca e a lista. Some inteira, não só os links.
    expect(container.querySelector(".justify-between")).toBeNull();
  });

  it("sync com busca sem acerto e nada marcado: 'Limpar' some (o 'Selecionar visíveis' já sumia)", async () => {
    renderMulti({ options: MUITAS });
    await userEvent.type(screen.getByLabelText("Buscar opção"), "zzzz");
    expect(screen.getByText("Nenhuma opção encontrada")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Selecionar visíveis" })).toBeNull();
    expect(limpar()).toBeNull();
  });

  /* ── CAMINHO ANTIGO: o que não pode mudar ── */

  it("com opções visíveis e nada marcado: 'Limpar' continua lá, desabilitado", () => {
    renderMulti();
    const botao = limpar() as HTMLButtonElement;
    expect(botao).toBeTruthy();
    expect(botao.disabled).toBe(true);
  });

  it("com opções visíveis e algo marcado: 'Limpar' continua lá, habilitado, e limpa", async () => {
    const onChange = vi.fn();
    renderMulti({ value: ["ativo"], onChange });
    const botao = limpar() as HTMLButtonElement;
    expect(botao.disabled).toBe(false);
    await userEvent.click(botao);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("busca sem acerto MAS com algo marcado: 'Limpar' continua habilitado — não se perde a saída", async () => {
    // É o caso em que a paridade literal com o "Selecionar visíveis" (esconder sempre que
    // não há linha visível) tiraria do usuário o único jeito de desfazer a seleção sem
    // antes apagar a busca. Esconder só quando não há NADA a limpar nem a selecionar.
    const onChange = vi.fn();
    renderMulti({ options: MUITAS, value: ["o3"], onChange });
    await userEvent.type(screen.getByLabelText("Buscar opção"), "zzzz");
    expect(screen.queryByRole("button", { name: "Selecionar visíveis" })).toBeNull();
    const botao = limpar() as HTMLButtonElement;
    expect(botao).toBeTruthy();
    expect(botao.disabled).toBe(false);
    await userEvent.click(botao);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("async com valor já marcado e a 1ª página ainda não chegou: 'Limpar' aparece (o marcado está na tela)", async () => {
    renderMulti({
      options: [],
      value: ["x1"],
      loadOptions: () => new Promise(() => {}),
      resolveValueLabel: () => "Marcado X1",
    });
    expect(screen.getByText("Marcado X1")).toBeTruthy();
    expect((limpar() as HTMLButtonElement).disabled).toBe(false);
  });

  it("sync com 1 opção só: continua sem a linha de ações (regra que já existia)", () => {
    renderMulti({ options: [OPCOES[0]] });
    expect(limpar()).toBeNull();
    expect(screen.queryByRole("button", { name: "Selecionar todos" })).toBeNull();
  });
});

/* ═══ 2 · altura da lista pelo conteúdo; LISTA_MAX_H é só TETO ══════════════ */

describe("a lista não reserva altura que o conteúdo não pede", () => {
  it("2 opções: sem piso de 96px", () => {
    renderMulti({ options: OPCOES.slice(0, 2) });
    const lista = listaDe("Ativo");
    expect(lista.className).not.toContain("min-h-");
    expect(lista.className).toContain("max-h-[240px]");
  });

  it("3 opções: sem piso, e sem altura fixa nem base zerada (`flex-1`) que dependa do engine", () => {
    renderMulti();
    const lista = listaDe("Ativo");
    expect(lista.className).not.toContain("min-h-");
    // `flex-1` é `flex: 1 1 0%`: com a lista sem piso, uma base resolvida como 0 faria a
    // lista colapsar. Base `auto` (o default de flex item) é sempre o conteúdo.
    expect(lista.className).not.toContain("flex-1");
    expect(lista.className).toContain("max-h-[240px]");
  });

  it("o 'Carregando…' sozinho não reserva piso", async () => {
    renderMulti({ options: [], loadOptions: () => new Promise(() => {}) });
    await waitFor(() => expect(screen.getByText("Carregando…")).toBeTruthy());
    const lista = screen.getByText("Carregando…").parentElement!;
    expect(lista.className).toContain("overflow-y-auto");
    expect(lista.className).not.toContain("min-h-");
  });

  /* ── CAMINHO ANTIGO ── */

  it("lista longa (12 opções) mantém o piso de 96px e o teto de 240px", () => {
    // O piso existe pro monitor baixo: quando o popover é espremido pela viewport, só a
    // lista encolhe, e sem piso ela poderia sumir. Com 4+ linhas o conteúdo já passa de
    // 96px (cada linha tem 32px), então o piso nunca é maior que o conteúdo — só protege.
    renderMulti({ options: MUITAS });
    const lista = listaDe("Opção 01");
    expect(lista.className).toContain("min-h-[96px]");
    expect(lista.className).toContain("max-h-[240px]");
    expect(lista.className).toContain("overflow-y-auto");
  });

  it("busca que reduz a lista a 1 resultado perde o piso (altura volta a ser do conteúdo)", async () => {
    renderMulti({ options: MUITAS });
    expect(listaDe("Opção 01").className).toContain("min-h-[96px]");
    await userEvent.type(screen.getByLabelText("Buscar opção"), "Opção 07");
    expect(listaDe("Opção 07").className).not.toContain("min-h-");
  });

  it("async: os marcados na seção do topo contam como linhas, e não contam duas vezes", async () => {
    // 2 opções carregadas, ambas marcadas: na tela são 2 linhas (a seção do topo). Contar
    // também as de `visiveis` daria 4 e ligaria um piso de 96px sobre 66px de conteúdo.
    renderMulti({
      options: [],
      value: ["ativo", "pausado"],
      loadOptions: async () => ({ options: OPCOES.slice(0, 2), hasMore: false }),
    });
    await waitFor(() => expect(screen.getAllByRole("checkbox")).toHaveLength(2));
    const lista = screen.getAllByRole("checkbox")[0].closest("label")!.parentElement!
      .parentElement!;
    expect(lista.className).toContain("overflow-y-auto");
    expect(lista.className).not.toContain("min-h-");
  });
});

/* ═══ 3 · largura do popover travada ════════════════════════════════════════ */

describe("o popover não muda de largura ao filtrar a lista", () => {
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetWidth",
  );
  let largura = 0;
  let disparos: Array<() => void> = [];

  /** Liga `ResizeObserver` e `offsetWidth` simulados (jsdom não tem layout). */
  const comLayoutSimulado = (larguraInicial: number) => {
    largura = larguraInicial;
    disparos = [];
    class ROFalso {
      constructor(cb: ResizeObserverCallback) {
        disparos.push(() => cb([], this as unknown as ResizeObserver));
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", ROFalso);
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get: () => largura,
    });
  };
  const mudaLarguraPara = (px: number) => {
    largura = px;
    act(() => disparos.forEach((d) => d()));
  };

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalOffsetWidth) {
      Object.defineProperty(HTMLElement.prototype, "offsetWidth", originalOffsetWidth);
    }
  });

  /**
   * A variável que o root LÊ — extraída da própria `className`, não escrita aqui à mão.
   *
   * O trava tem dois lados que só se encontram por um NOME: o efeito escreve
   * `--ms-min-w` por `style.setProperty` e a classe `min-w-[…var(--ms-min-w,0px)…]` a lê.
   * Os testes de ratchet só viam o lado que escreve; renomear a variável em UM dos lados
   * deixava todos verdes e matava a feature (o root nunca lê o que o efeito grava).
   * Derivando o nome da classe, todo teste de largura abaixo passa pela ponte: se os dois
   * lados divergirem, a variável lida não tem valor nenhum e o `getPropertyValue` volta "".
   *
   * Exige exatamente UMA variável própria (as `--radix-*` são do Popover, não nossas) —
   * e lança se não achar, pra um helper que não encontra nada não virar "" vazio que faz
   * os casos "não escreve nada" passarem à toa.
   */
  const variavelLidaPelaClasse = (root: HTMLElement): string => {
    const nomes = [...root.className.matchAll(/var\((--[\w-]+)/g)]
      .map((m) => m[1])
      .filter((n) => !n.startsWith("--radix-"));
    if (nomes.length !== 1) {
      throw new Error(
        `esperava 1 variável própria lida pela className do root; achei ${nomes.length}: ${nomes.join(", ")}`,
      );
    }
    return nomes[0];
  };
  const travada = (root: HTMLElement) =>
    root.style.getPropertyValue(variavelLidaPelaClasse(root));

  it("o root LÊ a mesma variável que o efeito ESCREVE — o elo escritor↔leitor", () => {
    comLayoutSimulado(300);
    const { container } = renderMulti();
    const root = container.firstElementChild as HTMLElement;
    const nome = variavelLidaPelaClasse(root);
    // lado leitor: a classe consome a variável, com fallback 0px, dentro do `min()`
    // que a limita pelo espaço do Radix e do `max()` com o piso de 220px
    expect(root.className).toContain(`min(var(${nome},0px),var(--radix-popover-content-available-width`);
    expect(root.className).toContain("max(220px,min(");
    // lado escritor: o efeito gravou ESSA variável, com a largura medida
    expect(root.style.getPropertyValue(nome)).toBe("300px");
  });

  it("trava a largura medida na abertura", () => {
    comLayoutSimulado(300);
    const { container } = renderMulti();
    expect(travada(container.firstElementChild as HTMLElement)).toBe("300px");
  });

  it("filtrar a lista (largura natural cai) NÃO destrava", async () => {
    comLayoutSimulado(300);
    const { container } = renderMulti({ options: MUITAS });
    const root = container.firstElementChild as HTMLElement;
    await userEvent.type(screen.getByLabelText("Buscar opção"), "Opção 07");
    mudaLarguraPara(236); // sobrou 1 linha curta: sem o trava, o popover encolheria pra isto
    expect(travada(root)).toBe("300px");
    mudaLarguraPara(220);
    expect(travada(root)).toBe("300px");
  });

  it("cresce quando o conteúdo cresce de verdade (ex.: a 1ª página assíncrona chegou)", () => {
    comLayoutSimulado(220);
    const { container } = renderMulti();
    const root = container.firstElementChild as HTMLElement;
    expect(travada(root)).toBe("220px");
    mudaLarguraPara(340);
    expect(travada(root)).toBe("340px");
    mudaLarguraPara(300);
    expect(travada(root)).toBe("340px"); // só sobe
  });

  it("o trava é limitado pelo espaço que o Radix reporta — não vira overflow se a viewport encolher", () => {
    comLayoutSimulado(300);
    const { container } = renderMulti();
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("--radix-popover-content-available-width");
  });

  /* ── CAMINHO ANTIGO ── */

  it("o piso de 220px de antes continua no root", () => {
    comLayoutSimulado(300);
    const { container } = renderMulti();
    expect((container.firstElementChild as HTMLElement).className).toContain("220px");
  });

  it("sem layout (largura 0 — jsdom, display:none): não escreve nada e o piso de 220px segue sozinho", () => {
    comLayoutSimulado(0);
    const { container } = renderMulti();
    expect(travada(container.firstElementChild as HTMLElement)).toBe("");
  });

  it("sem ResizeObserver no ambiente: o componente renderiza igual, sem trava", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    const { container } = renderMulti();
    expect(screen.getByRole("checkbox", { name: "Ativo" })).toBeTruthy();
    expect(travada(container.firstElementChild as HTMLElement)).toBe("");
  });

  it("desmontar desconecta o observer", () => {
    const disconnect = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect = disconnect;
      },
    );
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get: () => 300,
    });
    const { unmount } = renderMulti();
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
