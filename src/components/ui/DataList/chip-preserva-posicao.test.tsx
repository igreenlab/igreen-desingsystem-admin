/**
 * Editar um chip não pode REORDENAR a barra de filtros do `DataList`.
 *
 * Sintoma: com 3 chips na barra, editar o do MEIO jogava ele pro FIM e puxava os
 * outros pra esquerda — a barra se reorganizava embaixo do cursor, e o alvo que o
 * usuário acabou de clicar some de onde estava.
 *
 * Causa, `parts/data-list-toolbar.tsx` `setGroupValue`:
 *
 *     const rest = filterModel.items.filter(i => !(mesmo grupo));
 *     onFilterModelChange({ ...filterModel, items: [...rest, ...novos] });
 *
 * `rest` é tudo que NÃO é este grupo, e `novos` ia no fim — a posição se perdia a
 * cada edição. A ordem dos chips vem da ordem de PRIMEIRA OCORRÊNCIA no
 * `filterModel.items` (o `toAppliedFilters` agrupa num `Map`, que preserva
 * inserção), então mover o grupo no array move o chip na tela.
 *
 * A correção é a MESMA do `updateGroupValue` do `DataTable`
 * (`hooks/use-filter-popover-adapter.ts`), que já tinha o conserto e nomeia o
 * mesmo sintoma no comentário: reconstruir o array em ordem, substituindo os
 * items do grupo na posição da PRIMEIRA ocorrência e pulando as demais. A
 * adaptação é só no identificador do grupo — lá é um `Set` de ids resolvido pelo
 * `appliedGroups`, aqui é o par `field` + `operator`.
 *
 * ## O que é escopo e o que NÃO é
 *
 * Só a ORDEM muda. QUANTOS items saem e COM QUE valores continua byte por byte o
 * de antes — inclusive o spread de 1-item-por-valor dos `MULTI_VALUE_OPERATORS` e
 * o UM item vazio que segura o grupo quando o valor é esvaziado (o chip é a
 * âncora do popover; removê-lo fecharia o popover no meio da interação —
 * `chip-nao-desmonta.test.tsx`). Por isso os testes abaixo conferem a ordem
 * SEMPRE junto do conteúdo: uma correção de ordem que mudasse os valores teria
 * passado do escopo.
 *
 * Com 1 chip a ordem resultante é idêntica antes e depois do conserto — é o que
 * torna a correção segura sem prop: quem não tem o defeito não sente nada.
 *
 * ⚠️ Sem jest-dom: `vitest.setup.ts` está fora do `include` do `tsconfig.json` e
 * `npm test` roda `tsc --noEmit` antes do vitest.
 */
import type { ComponentProps } from "react";
import { describe, expect, it, beforeAll, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataList } from "./data-list";
import type { FilterFieldType, FilterableField } from "./data-list.types";
import type { FilterModel } from "@/components/ui/DataTable/data-table.types";
import type { ListItemData } from "@/components/ui/List";

/* jsdom não tem matchMedia nem ResizeObserver — mesmo shim dos testes vizinhos
   (a toolbar compartilhada e o MultiSelectDropdown usam os dois). */
beforeAll(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  window.ResizeObserver ??= vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

beforeEach(() => {
  localStorage.clear();
});

type Dados = { status: string; uf: string; tipo: string };

const ITEMS: ListItemData[] = [
  {
    id: "1",
    title: "Projeto Alfa",
    data: { status: "ativo", uf: "SP", tipo: "pf" } satisfies Dados,
  },
  {
    id: "2",
    title: "Projeto Beta",
    data: { status: "pausado", uf: "MG", tipo: "pj" } satisfies Dados,
  },
  {
    id: "3",
    title: "Projeto Gama",
    data: { status: "encerrado", uf: "RJ", tipo: "pf" } satisfies Dados,
  },
];

/** Três campos com rótulos e opções DISTINTOS — a ordem dos chips só é
 *  observável se der pra distinguir um chip do outro pelo texto. */
const campo = (
  id: keyof Dados,
  label: string,
  options: Array<{ value: string; label: string }>,
): FilterableField => ({
  id,
  label,
  accessor: (it) => (it.data as Dados)[id],
  type: "select" as FilterFieldType,
  options,
});

const CAMPOS: FilterableField[] = [
  campo("status", "Status", [
    { value: "ativo", label: "Ativo" },
    { value: "pausado", label: "Pausado" },
    { value: "encerrado", label: "Encerrado" },
  ]),
  campo("uf", "Estado", [
    { value: "SP", label: "São Paulo" },
    { value: "MG", label: "Minas Gerais" },
    { value: "RJ", label: "Rio de Janeiro" },
  ]),
  campo("tipo", "Tipo", [
    { value: "pf", label: "Pessoa Física" },
    { value: "pj", label: "Pessoa Jurídica" },
  ]),
];

/** FilterModel com os items EXATAMENTE na ordem passada — sem normalizar nada. */
function modelo(
  ...items: Array<{ field: keyof Dados; value: unknown }>
): FilterModel {
  return {
    logicOperator: "AND",
    items: items.map((it, i) => ({
      id: `f${i}`,
      field: it.field,
      operator: "isAnyOf",
      value: it.value,
    })) as FilterModel["items"],
  };
}

let chave = 0;
let chaveAtual = "";
function montar(
  model: FilterModel,
  extra?: Partial<ComponentProps<typeof DataList>>,
) {
  chaveAtual = `chip-preserva-posicao-${chave++}`;
  localStorage.setItem(
    `ds-datalist:${chaveAtual}`,
    JSON.stringify({ search: "", filterModel: model }),
  );
  render(
    <DataList
      items={ITEMS}
      filterFields={CAMPOS}
      persistKey={chaveAtual}
      {...extra}
    />,
  );
}

/** O `filterModel` como ele está no estado do componente — o `persistKey` grava
 *  a query CRUA, então é por ele que se enxerga a ORDEM real dos items. */
function itensPersistidos(): FilterModel["items"] {
  const raw = localStorage.getItem(`ds-datalist:${chaveAtual}`);
  return JSON.parse(raw ?? "{}").filterModel?.items ?? [];
}

/** Par `field|valor` de cada item, na ordem do array — ordem E conteúdo juntos. */
const resumo = () =>
  itensPersistidos().map((i) => `${i.field}=${i.value ?? "∅"}`);

/** As RAÍZES dos chips, na ordem em que estão na barra. Localizadas pelo botão
 *  de remover (`aria-label` estável) e subindo um nível — mesmo caminho do
 *  `acharChip` do `chip-nao-desmonta.test.tsx`. */
function chips(): HTMLElement[] {
  return screen
    .queryAllByRole("button", { name: "Remover filtro" })
    .map((b) => b.parentElement as HTMLElement);
}

/** O RÓTULO do campo de cada chip, na ordem da barra — o que o usuário vê. */
const ordemDosChips = () =>
  chips().map((c) => {
    const texto = c.textContent ?? "";
    const rotulo = ["Status", "Estado", "Tipo"].find((r) => texto.startsWith(r));
    return rotulo ?? texto;
  });

async function clicarNoChip(indice: number) {
  const alvo = chips()[indice];
  if (!alvo) throw new Error(`chip de índice ${indice} não existe na barra`);
  await userEvent.click(alvo);
}

describe("DataList — editar um chip preserva a POSIÇÃO dele na barra", () => {
  it("3 chips: editar o do MEIO não o empurra pro fim", async () => {
    montar(
      modelo(
        { field: "status", value: "ativo" },
        { field: "uf", value: "SP" },
        { field: "tipo", value: "pf" },
      ),
    );
    expect(ordemDosChips()).toEqual(["Status", "Estado", "Tipo"]);

    await clicarNoChip(1); // Estado
    await userEvent.click(
      screen.getByRole("checkbox", { name: /minas gerais/i }),
    );

    expect(ordemDosChips()).toEqual(["Status", "Estado", "Tipo"]);
    // E o conteúdo é o de sempre: o grupo editado spreada 1 item por valor,
    // na posição dele — os vizinhos não se mexem.
    expect(resumo()).toEqual([
      "status=ativo",
      "uf=SP",
      "uf=MG",
      "tipo=pf",
    ]);
  });

  it("3 chips: editar o PRIMEIRO o mantém em primeiro", async () => {
    montar(
      modelo(
        { field: "status", value: "ativo" },
        { field: "uf", value: "SP" },
        { field: "tipo", value: "pf" },
      ),
    );

    await clicarNoChip(0); // Status
    await userEvent.click(screen.getByRole("checkbox", { name: /pausado/i }));

    expect(ordemDosChips()).toEqual(["Status", "Estado", "Tipo"]);
    expect(resumo()).toEqual([
      "status=ativo",
      "status=pausado",
      "uf=SP",
      "tipo=pf",
    ]);
  });

  it("3 chips: editar o ÚLTIMO o mantém em último (nada se mexe)", async () => {
    montar(
      modelo(
        { field: "status", value: "ativo" },
        { field: "uf", value: "SP" },
        { field: "tipo", value: "pf" },
      ),
    );

    await clicarNoChip(2); // Tipo
    await userEvent.click(
      screen.getByRole("checkbox", { name: /pessoa jurídica/i }),
    );

    expect(ordemDosChips()).toEqual(["Status", "Estado", "Tipo"]);
    expect(resumo()).toEqual([
      "status=ativo",
      "uf=SP",
      "tipo=pf",
      "tipo=pj",
    ]);
  });

  it("2 chips: editar o primeiro não troca os dois de lugar", async () => {
    montar(
      modelo({ field: "status", value: "ativo" }, { field: "uf", value: "SP" }),
    );
    expect(ordemDosChips()).toEqual(["Status", "Estado"]);

    await clicarNoChip(0);
    await userEvent.click(screen.getByRole("checkbox", { name: /pausado/i }));

    expect(ordemDosChips()).toEqual(["Status", "Estado"]);
    expect(resumo()).toEqual(["status=ativo", "status=pausado", "uf=SP"]);
  });

  it("1 chip: a ordem é idêntica — quem não tem o defeito não sente a correção", async () => {
    // Este caso passava ANTES do conserto e passa DEPOIS, de propósito: com um
    // grupo só, "no lugar" e "no fim" são a mesma posição. É o que dispensa prop.
    montar(modelo({ field: "status", value: "ativo" }));
    expect(ordemDosChips()).toEqual(["Status"]);

    await clicarNoChip(0);
    await userEvent.click(screen.getByRole("checkbox", { name: /pausado/i }));

    expect(ordemDosChips()).toEqual(["Status"]);
    expect(resumo()).toEqual(["status=ativo", "status=pausado"]);
  });
});

describe("DataList — a proteção do item vazio também fica no LUGAR do grupo", () => {
  it("esvaziar o chip do meio deixa o item vazio na posição dele, não no fim", async () => {
    // O item vazio existe pra manter o chip montado — ele é a âncora do popover
    // (`chip-nao-desmonta.test.tsx`). Se ele nascesse no FIM, o popover
    // continuaria aberto mas debaixo de outro ponto da barra: o mesmo salto,
    // no instante mais sensível da interação.
    montar(
      modelo(
        { field: "status", value: "ativo" },
        { field: "uf", value: "SP" },
        { field: "tipo", value: "pf" },
      ),
    );

    await clicarNoChip(1); // Estado
    await userEvent.click(
      screen.getByRole("checkbox", { name: /são paulo/i }),
    ); // desmarca o único valor

    expect(resumo()).toEqual(["status=ativo", "uf=∅", "tipo=pf"]);
    // O chip placeholder (só o rótulo) segue no MEIO da barra.
    expect(ordemDosChips()).toEqual(["Status", "Estado", "Tipo"]);
    expect(chips()[1]?.textContent).toBe("Estado");
  });

  it("remarcar depois de esvaziar devolve o valor NA MESMA posição", async () => {
    montar(
      modelo(
        { field: "status", value: "ativo" },
        { field: "uf", value: "SP" },
        { field: "tipo", value: "pf" },
      ),
    );

    await clicarNoChip(1);
    await userEvent.click(screen.getByRole("checkbox", { name: /são paulo/i }));
    await userEvent.click(
      screen.getByRole("checkbox", { name: /rio de janeiro/i }),
    );

    expect(resumo()).toEqual(["status=ativo", "uf=RJ", "tipo=pf"]);
    expect(ordemDosChips()).toEqual(["Status", "Estado", "Tipo"]);
  });
});
