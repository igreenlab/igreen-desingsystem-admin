/**
 * Ações do cabeçalho do DataTable — menu, funil, ícone do tipo e largura mínima.
 *
 * Quatro pedidos do Sólis (itens 17, 15, 14 e 7) que editam as MESMAS ~20 linhas do
 * cabeçalho. Juntos porque separados conflitariam entre si.
 *
 *   17  O menu da coluna oferecia "Ordenar crescente/decrescente" em coluna que não é
 *       ordenável. `DataTableColumnMenu` recebia `sortDirection` mas nunca `sortable`.
 *   15  Não havia como esconder SÓ o funil. A única saída era `enableColumnMenu: false`, que
 *       leva "Fixar" e "Ocultar" junto. `enableHeaderFilter: false` esconde o funil e o menu
 *       fica.
 *   14  `showTypeIcons={false}` desliga o ícone do tipo no cabeçalho (e a largura que ele
 *       reservava).
 *   7   Em coluna estreita o conjunto de ações (sort + funil + menu) é mais largo que a
 *       célula e transborda. O piso do cabeçalho passa a contar as ações VISÍVEIS.
 *
 * ⚠️ Constraint global: prop nova ausente = o cabeçalho de hoje. Cada item tem um teste do
 * CAMINHO ANTIGO ao lado do novo — "aditivo" é afirmação sobre quem já usa, e afirmação sem
 * teste é esperança.
 *
 * ⚠️ Por que a parte de largura testa `calculateColumnWidths` direto e não o DataTable: o
 * cálculo só roda com `containerWidth > 0`, e em jsdom o container mede 0 — o DataTable
 * inteiro nunca chegaria lá. E o canvas (`measureTextWidth`) não existe em jsdom, então a
 * medição é trocada por uma régua de 7px/caractere. Os números abaixo dependem dela e dos
 * tokens do cabeçalho — que `scripts/lib/header-widths-sync.test.mjs` amarra às constantes.
 */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/* A régua precisa estar pronta ANTES do import de `calculate-column-widths` — por isso
   `vi.hoisted`. `REGUA` é o comportamento padrão; os testes de NaN o trocam e o
   `afterEach` devolve. */
const { medir, REGUA } = vi.hoisted(() => {
  const regua = (texto: string) => texto.length * 7;
  return { medir: vi.fn(regua), REGUA: regua };
});
vi.mock("./utils/measure-text", () => ({ measureTextWidth: medir }));

import { DataTable } from "./data-table";
import type { DataTableColumnDef } from "./data-table.types";
import {
  calculateColumnWidths,
  type CalculateColumnWidthsOptions,
} from "./utils/calculate-column-widths";

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

afterEach(() => {
  medir.mockImplementation(REGUA);
});

/* ═══ Render — itens 17, 15 e 14 ═══════════════════════════════════════════ */

interface Linha {
  id: string;
  nome: string;
  fixa: string;
  status: string;
  valor: number;
}

const LINHAS: Linha[] = [
  { id: "1", nome: "Alfa", fixa: "x", status: "ativo", valor: 10 },
  { id: "2", nome: "Beta", fixa: "y", status: "pausado", valor: 20 },
];

function montar(
  colunas: DataTableColumnDef<Linha>[],
  extra: Record<string, unknown> = {},
) {
  return render(
    <DataTable<Linha>
      rows={LINHAS}
      columns={colunas}
      getRowId={(r) => r.id}
      {...extra}
    />,
  );
}

async function abrirMenu(coluna: string) {
  await userEvent.click(
    screen.getByRole("button", { name: `Menu da coluna ${coluna}` }),
  );
}

const itemDoMenu = (nome: RegExp) => screen.queryByRole("menuitem", { name: nome });

describe("item 17 — menu da coluna só oferece ordenar em coluna ordenável", () => {
  it("coluna sortable:false não oferece 'Ordenar' no menu", async () => {
    montar([{ field: "fixa", headerName: "Fixa", sortable: false }]);
    await abrirMenu("Fixa");

    expect(itemDoMenu(/Ordenar crescente/)).toBeNull();
    expect(itemDoMenu(/Ordenar decrescente/)).toBeNull();
    // O resto do menu segue — é exatamente o que o contorno `enableColumnMenu:false` perdia.
    expect(itemDoMenu(/Fixar à esquerda/)).not.toBeNull();
    expect(itemDoMenu(/Ocultar coluna/)).not.toBeNull();
  });

  it("coluna sortável CONTINUA oferecendo as duas ordenações", async () => {
    // Caminho antigo: sem `sortable` declarado a coluna é ordenável e o menu é o de hoje.
    montar([{ field: "nome", headerName: "Nome" }]);
    await abrirMenu("Nome");

    expect(itemDoMenu(/Ordenar crescente/)).not.toBeNull();
    expect(itemDoMenu(/Ordenar decrescente/)).not.toBeNull();
  });

  it("sem itens de ordenação, o separador também some", async () => {
    // `hideable:false` tira o separador do "Ocultar" — sobra só o separador entre a
    // seção de ordenar e a de fixar, que é o que este teste isola.
    montar([
      { field: "nome", headerName: "Nome", hideable: false },
      { field: "fixa", headerName: "Fixa", sortable: false, hideable: false },
    ]);

    await abrirMenu("Nome");
    expect(screen.queryAllByRole("separator")).toHaveLength(1); // controle: ordenável tem

    await userEvent.keyboard("{Escape}");
    await abrirMenu("Fixa");
    expect(screen.queryAllByRole("separator")).toHaveLength(0);
  });

  it("coluna não ordenável mas ORDENADA agora ainda oferece 'Limpar ordenação'", async () => {
    // Um `sortModel` controlado pode ordenar por coluna `sortable:false`. Tirar a única
    // saída desse estado seria o erro da L-070: esconder o botão que encerra o estado.
    montar([{ field: "fixa", headerName: "Fixa", sortable: false }], {
      sortModel: { field: "fixa", direction: "asc" },
    });
    await abrirMenu("Fixa");

    expect(itemDoMenu(/Ordenar crescente/)).toBeNull();
    expect(itemDoMenu(/Limpar ordenação/)).not.toBeNull();
  });
});

describe("item 15 — enableHeaderFilter esconde só o funil", () => {
  const status = (extra: Partial<DataTableColumnDef<Linha>> = {}) =>
    ({
      field: "status",
      headerName: "Status",
      enableColumnFilter: true,
      ...extra,
    }) as DataTableColumnDef<Linha>;

  it("sem a prop, o funil aparece (caminho antigo)", () => {
    montar([status()]);

    expect(screen.queryByRole("button", { name: "Filtrar Status" })).not.toBeNull();
    expect(
      screen.queryByRole("button", { name: "Menu da coluna Status" }),
    ).not.toBeNull();
  });

  it("enableHeaderFilter:false esconde o funil e MANTÉM o menu", () => {
    montar([status({ enableHeaderFilter: false })]);

    expect(screen.queryByRole("button", { name: "Filtrar Status" })).toBeNull();
    // O que o contorno deles (`enableColumnMenu:false`) perdia: o menu com Fixar/Ocultar.
    expect(
      screen.queryByRole("button", { name: "Menu da coluna Status" }),
    ).not.toBeNull();
  });

  it("enableHeaderFilter:false NÃO desliga o filtro da coluna — só o atalho", async () => {
    // O nome da prop pode enganar: `enableColumnFilter` segue mandando no filtro. A coluna
    // continua entre as filtráveis do painel "Filtros" do toolbar — e a que NÃO declara
    // `enableColumnFilter` (ID) segue de fora, o que prova que o painel está filtrando
    // por essa flag e não listando tudo.
    montar(
      [status({ enableHeaderFilter: false }), { field: "id", headerName: "ID" }],
      { toolbar: { enableFilters: true } },
    );

    await userEvent.click(screen.getByRole("button", { name: "Filtros" }));
    const painel = await screen.findByRole("dialog");

    expect(within(painel).queryAllByText("Status").length).toBeGreaterThan(0);
    expect(within(painel).queryAllByText("ID")).toHaveLength(0);
  });
});

describe("item 14 — showTypeIcons", () => {
  /** O ícone do tipo é o único svg do cabeçalho desenhado com `size={13}`. */
  const iconeDoTipo = (coluna: string) => {
    const cab = screen.getByRole("columnheader", { name: new RegExp(coluna) });
    return cab.querySelector('svg[width="13"]');
  };

  it("sem a prop, o ícone continua aparecendo (caminho antigo)", () => {
    montar([{ field: "valor", headerName: "Valor", type: "number" }]);

    expect(iconeDoTipo("Valor")).not.toBeNull();
  });

  it("showTypeIcons:false esconde o ícone do tipo", () => {
    montar([{ field: "valor", headerName: "Valor", type: "number" }], {
      showTypeIcons: false,
    });

    expect(iconeDoTipo("Valor")).toBeNull();
  });

  // `col.icon` é documentado como "Ícone do tipo no header": os dois ocupam o mesmo slot,
  // então a prop desliga os dois.
  const Estrela = (p: { className?: string; size?: number }) => (
    <svg width={p.size} height={p.size} className={p.className} />
  );

  it("`icon` explícito da coluna aparece sem a prop (caminho antigo)", () => {
    montar([{ field: "nome", headerName: "Nome", icon: Estrela }]);
    expect(iconeDoTipo("Nome")).not.toBeNull();
  });

  it("showTypeIcons:false esconde também o `icon` explícito da coluna", () => {
    montar([{ field: "nome", headerName: "Nome", icon: Estrela }], {
      showTypeIcons: false,
    });
    expect(iconeDoTipo("Nome")).toBeNull();
  });
});

/* ═══ Largura — item 7 + Review Focus #4 ═══════════════════════════════════ */

type L = { a: string };
const LINHAS_L: L[] = [{ a: "x" }];

/**
 * `containerWidth` PEQUENO de propósito: com a soma das colunas ≥ container o rateio da
 * Layer 3 não roda, e o resultado é o piso puro. Com container folgado a coluna estica
 * (a width explícita vira base do rateio) e o teste mediria o rateio, não o piso.
 */
const calcular = (
  cols: DataTableColumnDef<L>[],
  opts: Partial<CalculateColumnWidthsOptions> = {},
) =>
  calculateColumnWidths<L>(cols, LINHAS_L, {
    containerWidth: 20,
    autoFit: true,
    ...opts,
  });

/** Coluna estreita pedida pelo consumidor — o caso do Sólis (~64px, com funil + menu). */
const estreita = (extra: Partial<DataTableColumnDef<L>> = {}) =>
  ({ field: "n", headerName: "#", width: 40, ...extra }) as DataTableColumnDef<L>;

describe("item 7 — o piso do cabeçalho conta as ações visíveis", () => {
  it("largura mínima do cabeçalho inclui as ações visíveis", () => {
    // Régua 7px/char: título "#" = 7. Piso do TÍTULO = 7 + 32 de padding + 24 de reserva
    // do funil = 63 — menor que as ações. O stack hover é
    //   8 (right-pad-md) + 4 (pl-pad-xs) + 12 (sort) + 4 (gap) + 28 (funil) + 28 (menu) = 84
    // e é ele que precisa caber DENTRO da célula.
    const w = calcular([estreita({ enableColumnFilter: true })]);
    expect(w.n).toBe(84);
  });

  it("cada ação que some tira a sua largura do piso", () => {
    const comFunilEMenu = calcular([estreita({ enableColumnFilter: true })]).n;
    const soMenu = calcular([estreita()]).n; // sort + menu: 12 + 12 + 4 + 28 = 56
    const semAcoes = calcular([
      estreita({ sortable: false, enableColumnMenu: false }),
    ]).n;

    expect(comFunilEMenu).toBe(84);
    expect(soMenu).toBe(56);
    expect(semAcoes).toBe(40); // nada a mostrar: a width pedida vale (caminho antigo)
  });

  it("enableHeaderFilter:false também tira o funil do piso", () => {
    // O funil escondido não ocupa espaço — reservar largura pra ele seria piso fantasma.
    const w = calcular([
      estreita({ enableColumnFilter: true, enableHeaderFilter: false }),
    ]);
    expect(w.n).toBe(56);
  });

  it("coluna normal NÃO muda — o piso das ações é MAX com o do título, não soma", () => {
    // Estes dois valores são os de antes da correção. Se alguém trocar o `Math.max` por
    // uma soma, TODA tabela do DS alarga (`autoFit` é default true): a coluna boolean de
    // 'Ativo' iria de 112 a 196.
    //   boolean 'Ativo': 35 de título + 32 + 21 do ícone + 24 de reserva = 112 (> 80 do tipo)
    //   texto 'Cliente': cai no DEFAULT_COLUMN_WIDTH de 160
    const w = calcular([
      { field: "ativo", headerName: "Ativo", type: "boolean" },
      { field: "cliente", headerName: "Cliente" },
    ]);
    expect(w.ativo).toBe(112);
    expect(w.cliente).toBe(160);
  });

  it("maxWidth do consumidor continua mandando sobre o piso das ações", () => {
    // Mesma regra do piso do título ("header > maxWidth = truncamento assumido pelo
    // consumer"): quem trava a largura sabe o que pediu.
    const w = calcular([estreita({ enableColumnFilter: true, maxWidth: 50 })]);
    expect(w.n).toBe(50);
  });

  it("coluna sem headerName não produz largura NaN", () => {
    // Review Focus #4. Colunas montadas a partir de schema dinâmico chegam sem rótulo.
    // O título cai no `field`, e a régua do teste LANÇA se receber `undefined` — como
    // `measureTextWidth` faria com `.length` num texto ausente.
    medir.mockImplementation((t: string) => t.length * 7);
    const semNome = { field: "x", width: 40, enableColumnFilter: true } as DataTableColumnDef<L>;
    const nomeVazio = { ...semNome, field: "y", headerName: "" } as DataTableColumnDef<L>;
    const nomeNulo = {
      ...semNome,
      field: "z",
      headerName: undefined as unknown as string,
    } as DataTableColumnDef<L>;

    const w = calcular([semNome, nomeVazio, nomeNulo]);
    for (const campo of ["x", "y", "z"]) {
      expect(Number.isFinite(w[campo])).toBe(true);
      expect(w[campo]).toBeGreaterThan(0);
    }
  });

  it("medição que devolve NaN (canvas mockado sem `width`) não contamina a largura", () => {
    // Um mock parcial de canvas pode devolver `measureText` sem `width`, e `undefined + 32`
    // é NaN — que viraria `width: NaN` na célula. O cálculo trata a medição inválida como 0.
    medir.mockImplementation(() => NaN);
    const w = calcular([
      estreita({ enableColumnFilter: true }),
      { field: "t", headerName: "Texto" },
    ]);
    expect(Number.isFinite(w.n)).toBe(true);
    expect(Number.isFinite(w.t)).toBe(true);
  });
});

describe("item 14 — showTypeIcons na largura", () => {
  const boolean = () =>
    [{ field: "ativo", headerName: "Ativo", type: "boolean" }] as DataTableColumnDef<L>[];

  it("sem a opção, o ícone do tipo reserva 21px no piso do título (caminho antigo)", () => {
    expect(calcular(boolean()).ativo).toBe(112);
  });

  it("showTypeIcons:false tira a reserva do ícone", () => {
    // 35 + 32 + 24 = 91 — ainda acima dos 80 do tipo, então o piso é o que aparece.
    expect(calcular(boolean(), { showTypeIcons: false }).ativo).toBe(91);
  });
});

/* ═══ Fiação — a largura calculada chega no cabeçalho do DataTable ══════════ */

describe("DataTable montado — o cálculo chega ao cabeçalho", () => {
  /**
   * Os testes acima provam o cálculo. Este prova a FIAÇÃO: que `showTypeIcons` e as props de
   * coluna atravessam controller → hook → `calculateColumnWidths` → `style.width` do header.
   * Sem ele, esquecer de repassar a prop no controller passaria os 27 testes verdes.
   *
   * O container tem de medir > 0 pro cálculo rodar (jsdom devolve 0), e PEQUENO pra a soma
   * das colunas passar dele e o rateio da Layer 3 não esticar nada.
   */
  beforeAll(() => {
    vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(20);
  });
  afterAll(() => {
    vi.restoreAllMocks();
  });

  const larguraDoCabecalho = (nome: RegExp) =>
    screen.getByRole("columnheader", { name: nome }).style.width;

  it("coluna estreita com funil + menu recebe o piso das ações (84px, não os 40 pedidos)", () => {
    montar([{ field: "nome", headerName: "#", width: 40, enableColumnFilter: true }]);

    expect(larguraDoCabecalho(/#/)).toBe("84px");
  });

  it("showTypeIcons:false chega no cálculo — o ícone deixa de reservar 21px", () => {
    const col: DataTableColumnDef<Linha> = {
      field: "status",
      headerName: "Ativo",
      type: "boolean",
    };
    const { unmount } = montar([col]);
    const comIcone = larguraDoCabecalho(/Ativo/);
    unmount();

    montar([col], { showTypeIcons: false });
    const semIcone = larguraDoCabecalho(/Ativo/);

    expect(comIcone).toBe("112px");
    expect(semIcone).toBe("91px");
  });
});
