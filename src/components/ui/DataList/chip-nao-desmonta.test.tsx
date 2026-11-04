/**
 * Desmarcar o ÚLTIMO valor não pode fechar o popover do chip — P3.
 *
 * O chip é a **âncora** do `Popover`. Até 2026-11-04 o `setGroupValue` devolvia
 * `[]` quando o valor esvaziava (`isEmptyVal(value) ? [] : …`), o grupo sumia do
 * `filterModel`, o `toAppliedFilters` deixava de produzir o chip — e o popover
 * que o usuário estava usando **desmontava junto**, no meio da interação.
 *
 * O `DataTable` se protege disso de propósito, e a receita dele tem TRÊS peças,
 * não uma (`use-filter-popover-adapter.ts` + `data-table.tsx`):
 *
 *   1. `updateGroupValue` mantém UM item vazio em vez de remover o grupo;
 *   2. `appliedGroups` deixa o grupo vazio VIVO enquanto `key === openChipKey`
 *      — sem isto o item vazio existe no model e o chip não é montado mesmo
 *      assim, e a âncora morre igual;
 *   3. `closeChip` remove o item vazio no fechamento, ADIADO pro próximo tick e
 *      lendo o model por `ref`.
 *
 * A peça 3 não é zelo: widget de valor único (`FastSingleSelectList`, usado por
 * `select`) chama `onChange` e `onClose` no MESMO clique. Com cleanup síncrono,
 * os dois partiriam do mesmo estado stale e o cleanup venceria — apagando o
 * valor que o usuário acabou de escolher.
 *
 * ## O que cada bloco trava
 *
 *   1. **O sintoma** — o popover segue ABERTO depois de desmarcar o último valor,
 *      e o chip segue montado (como placeholder, só o rótulo do campo).
 *   2. **A peça 3** — fechar o chip LIMPA o item vazio: ele não fica inerte no
 *      model (iria pro `persistKey`) nem deixa o contador de filtros mentindo.
 *   3. **A regressão que a peça 3 causaria se fosse síncrona** — escolher valor
 *      num widget single (onChange+onClose no mesmo clique) PRESERVA a escolha.
 *   4. **O caminho antigo** — chip com valor não vira placeholder, e esvaziar e
 *      fechar deixa o model igual a antes de existir o filtro.
 *
 * ⚠️ Sem jest-dom: `vitest.setup.ts` está fora do `include` do `tsconfig.json` e
 * `npm test` roda `tsc --noEmit` antes do vitest.
 */
import type { ComponentProps } from "react";
import { describe, expect, it, beforeAll, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataList } from "./data-list";
import { columnTypeRegistry } from "@/components/ui/DataTable/column-types";
import type { FilterFieldType, FilterableField } from "./data-list.types";
import type { FilterModel } from "@/components/ui/DataTable/data-table.types";
import type { ListItemData } from "@/components/ui/List";

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

const ITEMS: ListItemData[] = [
  { id: "1", title: "Projeto Alfa", data: { status: "ativo" } },
  { id: "2", title: "Projeto Beta", data: { status: "pausado" } },
  { id: "3", title: "Projeto Gama", data: { status: "encerrado" } },
];

const OPCOES = [
  { value: "ativo", label: "Ativo" },
  { value: "pausado", label: "Pausado" },
  { value: "encerrado", label: "Encerrado" },
];

const CAMPO: FilterableField = {
  id: "status",
  label: "Status",
  accessor: (it) => (it.data as { status: string }).status,
  type: "select" as FilterFieldType,
  options: OPCOES,
};

function modelo(
  ...items: Array<{ operator: string; value: unknown }>
): FilterModel {
  return {
    logicOperator: "AND",
    items: items.map((it, i) => ({
      id: `f${i}`,
      field: "status",
      operator: it.operator,
      value: it.value,
    })) as FilterModel["items"],
  };
}

let chave = 0;
function montar(
  model: FilterModel,
  extra?: Partial<ComponentProps<typeof DataList>>,
) {
  const persistKey = `chip-nao-desmonta-${chave++}`;
  localStorage.setItem(
    `ds-datalist:${persistKey}`,
    JSON.stringify({ search: "", filterModel: model }),
  );
  render(
    <DataList
      items={ITEMS}
      filterFields={[CAMPO]}
      persistKey={persistKey}
      {...extra}
    />,
  );
}

/**
 * A RAIZ do chip de filtro — o `<span>` do `<FilterChip>`, que é o nó que o
 * `PopoverTrigger asChild` usa de âncora. Localizado pelo botão de remover
 * (`aria-label` estável) e subindo um nível: procurar "o menor nó cujo texto
 * começa por Status" devolve o `<span>` interno do NOME, que existe nos dois
 * estados e por isso não distingue placeholder de chip com valor.
 */
function acharChip(): HTMLElement | null {
  const botoes = screen.queryAllByRole("button", { name: "Remover filtro" });
  return (botoes[0]?.parentElement as HTMLElement) ?? null;
}

async function clicarNoChip() {
  const chip = acharChip();
  if (!chip) throw new Error("chip de Status não encontrado");
  await userEvent.click(chip);
}

/** O popover do chip está montado? (o checkbox só existe dentro dele) */
const popoverAberto = () => screen.queryAllByRole("checkbox").length > 0;

describe("DataList — desmarcar o último valor não desmonta o chip nem fecha o popover", () => {
  it("o popover CONTINUA aberto e o chip montado depois de desmarcar o único valor", async () => {
    montar(modelo({ operator: "isAnyOf", value: "ativo" }));
    await clicarNoChip();
    expect(popoverAberto()).toBe(true);

    await userEvent.click(screen.getByRole("checkbox", { name: /ativo/i }));

    // O chip (âncora) segue na tela, agora como placeholder…
    expect(acharChip()).not.toBeNull();
    // …e o popover não fechou sozinho: dá pra remarcar sem reabrir nada.
    expect(popoverAberto()).toBe(true);
  });

  it("o chip vazio vira PLACEHOLDER — só o rótulo, sem operador nem valor", async () => {
    montar(modelo({ operator: "isAnyOf", value: "ativo" }));
    await clicarNoChip();
    expect(acharChip()?.textContent).toMatch(/Ativo/);

    await userEvent.click(screen.getByRole("checkbox", { name: /ativo/i }));

    const texto = acharChip()?.textContent ?? "";
    expect(texto).toMatch(/Status/);
    expect(texto).not.toMatch(/Ativo/);
  });

  it("remarcar DEPOIS de esvaziar volta a filtrar — a interação não se perdeu", async () => {
    montar(modelo({ operator: "isAnyOf", value: "ativo" }));
    await clicarNoChip();
    await userEvent.click(screen.getByRole("checkbox", { name: /ativo/i }));
    await userEvent.click(screen.getByRole("checkbox", { name: /pausado/i }));

    expect(screen.queryByText("Projeto Beta")).not.toBeNull();
    expect(screen.queryByText("Projeto Alfa")).toBeNull();
  });
});

/** O `filterModel` como ele está no estado do componente — o `persistKey` grava
 *  a query CRUA, então é por ele que se enxerga o item inerte. */
function modeloPersistido(): FilterModel["items"] {
  const chaves = Object.keys(localStorage).filter((k) =>
    k.startsWith("ds-datalist:chip-nao-desmonta-"),
  );
  const raw = localStorage.getItem(chaves[chaves.length - 1]!);
  return JSON.parse(raw ?? "{}").filterModel?.items ?? [];
}

describe("DataList — o item vazio existe ENQUANTO aberto e some quando fecha", () => {
  it("com o popover aberto e esvaziado, o grupo segue no model (é a âncora)", async () => {
    montar(modelo({ operator: "isAnyOf", value: "ativo" }));
    await clicarNoChip();
    await userEvent.click(screen.getByRole("checkbox", { name: /ativo/i }));

    const itens = modeloPersistido();
    expect(itens).toHaveLength(1);
    expect(itens[0].value == null).toBe(true);
  });

  it("fechar o chip esvaziado remove o grupo (não sobra item inerte no model)", async () => {
    montar(modelo({ operator: "isAnyOf", value: "ativo" }));
    await clicarNoChip();
    await userEvent.click(screen.getByRole("checkbox", { name: /ativo/i }));
    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(modeloPersistido()).toHaveLength(0));
    // E o chip sai da barra junto.
    expect(acharChip()).toBeNull();
  });
});

describe("DataList — o item inerte NÃO chega ao servidor", () => {
  it("`onQueryChange` nunca emite filtro sem valor (o backend recebe o de sempre)", async () => {
    // O item vazio é interno à interação do chip. Emiti-lo faria o backend
    // receber um `isAnyOf` sem valor que ele nunca recebeu — "filtro incompleto
    // não dispara nada" é a mesma regra do `useDataTableQuery`.
    const emitidos: FilterModel[] = [];
    montar(modelo({ operator: "isAnyOf", value: "ativo" }), {
      mode: "server",
      onQueryChange: (q) => emitidos.push(q.filterModel),
    });

    await clicarNoChip();
    await userEvent.click(screen.getByRole("checkbox", { name: /ativo/i }));
    // o item inerte ESTÁ no model neste instante
    expect(modeloPersistido()).toHaveLength(1);

    await waitFor(() => expect(emitidos.length).toBeGreaterThan(0));
    for (const m of emitidos) {
      for (const it of m.items) {
        expect(it.value == null || it.value === "").toBe(false);
      }
    }
  });
});

describe("DataList — o cleanup NÃO pode apagar a escolha do widget que fecha no mesmo clique", () => {
  /**
   * Por que o teste precisa de um tipo CUSTOM, e não do `select` built-in.
   *
   * O par perigoso é **placeholder + widget que chama `onChange` e `onClose` no
   * MESMO clique**: o cleanup do fechamento tem o id do item vazio na mão, e se
   * rodar síncrono lê o model ANTES do `onChange` ter sido aplicado — os dois
   * `onFilterModelChange` partem do mesmo estado e o cleanup vence, apagando a
   * escolha. É por isso que ele é adiado pro próximo tick.
   *
   * Nos built-ins do `DataList` esse par é **inalcançável hoje**: quem fecha no
   * mesmo clique é `select`/`boolean` (`FastSingleSelectList`), e nenhum dos dois
   * tem como ESVAZIAR o valor pelo funil — é a pendência dos "4 tipos sem saída".
   * Sem esvaziar não há placeholder, e sem placeholder não há item vazio a
   * limpar. Medido: com mutação síncrona, um teste partindo de `select` com
   * valor passa igual — ele não exercita a linha que diz exercitar.
   *
   * Pelo `ownsMulti`, que é o ponto de extensão público, o par é alcançável: o
   * widget do consumidor esvazia (`onChange([])`) e escolhe-e-fecha, exatamente
   * como o `select` built-in faz. Então a proteção não é defensiva — é o
   * contrato do escape hatch.
   */
  function registrarWidgetQueFechaNoMesmoClique(tipo: string) {
    columnTypeRegistry.register({
      ...columnTypeRegistry.get("multiSelect"),
      type: tipo as never,
      ownsMulti: true,
      renderFastFilterInput: ({ onChange, onClose }) => (
        <div>
          <button type="button" onClick={() => onChange([])}>
            limpar-tudo
          </button>
          <button
            type="button"
            onClick={() => {
              onChange(["pausado"]);
              onClose?.();
            }}
          >
            escolher-pausado
          </button>
        </div>
      ),
    });
  }

  it("escolher valor a partir do PLACEHOLDER preserva a escolha (cleanup adiado)", async () => {
    const tipo = "listaQueFechaNoMesmoClique";
    registrarWidgetQueFechaNoMesmoClique(tipo);
    montar(modelo({ operator: "isAnyOf", value: "ativo" }), {
      filterFields: [{ ...CAMPO, type: tipo as FilterFieldType }],
    });

    await clicarNoChip();
    // esvazia → o chip vira placeholder e o grupo fica com UM item sem valor
    await userEvent.click(screen.getByText("limpar-tudo"));
    expect(modeloPersistido()).toHaveLength(1);
    expect(acharChip()?.textContent).toBe("Status");

    // escolhe e fecha NO MESMO clique — é aqui que o cleanup síncrono venceria
    await userEvent.click(screen.getByText("escolher-pausado"));

    await waitFor(() => {
      expect(screen.queryByText("Projeto Beta")).not.toBeNull();
    });
    expect(screen.queryByText("Projeto Alfa")).toBeNull();
    const itens = modeloPersistido();
    expect(itens).toHaveLength(1);
    expect(itens[0].value).toBe("pausado");
  });
});

describe("DataList — o caminho antigo não muda", () => {
  it("chip COM valor segue mostrando operador e valor (não vira placeholder)", () => {
    montar(modelo({ operator: "isAnyOf", value: "ativo" }));
    expect(acharChip()?.textContent).toMatch(/Status.*Ativo/);
  });

  it("sem nenhum filtro não existe chip (o item vazio não nasce sozinho)", () => {
    montar(modelo());
    expect(acharChip()).toBeNull();
  });
});
