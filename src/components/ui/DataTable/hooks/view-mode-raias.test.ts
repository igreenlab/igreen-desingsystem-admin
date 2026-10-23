/**
 * A ponte `DataTable` → raias do Kanban, pelos dois lados.
 *
 * O recurso é **aditivo**, e "aditivo" é afirmação sobre o caminho ANTIGO —
 * quem já usa `viewMode="kanban"` hoje não pode receber board diferente por
 * causa de código que ele não pediu. Metade destes testes existe só pra travar
 * isso: sem `laneField`, o card sai sem `groupId` e `groups` sai vazio, que é o
 * que o `<Kanban>` precisa pra renderizar o board plano de sempre.
 *
 * A outra metade trava o que MUDA: ligar `groupBy` passa a criar raias no
 * board. Isso é mudança de comportamento pra quem já combinava `groupBy` com a
 * view kanban — intencional, e por isso escrita como teste em vez de ficar só
 * no changelog.
 */
import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDataTableViewMode } from "./use-data-table-view-mode";
import type { DataTableKanbanConfig } from "../data-table.types";

type Linha = {
  id: string;
  status: string;
  epico?: string | null;
  titulo: string;
};

const LINHAS: Linha[] = [
  { id: "1", status: "todo", epico: "ep-1", titulo: "Um" },
  { id: "2", status: "doing", epico: "ep-1", titulo: "Dois" },
  { id: "3", status: "todo", epico: "ep-2", titulo: "Três" },
  { id: "4", status: "todo", epico: null, titulo: "Quatro" },
];

const CONFIG: DataTableKanbanConfig<Linha> = {
  groupByField: "status",
  renderCard: ({ row }) => ({ title: row.titulo }),
};

const montar = (laneField?: string) =>
  renderHook(() =>
    useDataTableViewMode<Linha>({
      rows: LINHAS,
      config: CONFIG,
      getRowId: (row) => row.id,
      laneField,
    }),
  ).result.current;

describe("useDataTableViewMode — sem eixo de raia, o board de antes", () => {
  it("nenhum card ganha `groupId`", () => {
    const { cards } = montar(undefined);

    expect(cards).toHaveLength(4);
    for (const card of cards) {
      expect(card).not.toHaveProperty("groupId");
    }
  });

  it("`groups` sai vazio — é o que faz o `<Kanban>` renderizar plano", () => {
    expect(montar(undefined).groups).toEqual([]);
  });

  it("as colunas continuam derivando só do `groupByField`", () => {
    expect(montar(undefined).columns).toEqual([
      { id: "todo", label: "todo" },
      { id: "doing", label: "doing" },
    ]);
  });

  it("sem `config` não há board nenhum — nem raia", () => {
    const { result } = renderHook(() =>
      useDataTableViewMode<Linha>({
        rows: LINHAS,
        config: undefined,
        getRowId: (row) => row.id,
        laneField: "epico",
      }),
    );

    expect(result.current).toEqual({ columns: [], cards: [], groups: [] });
  });
});

describe("useDataTableViewMode — com eixo, as raias aparecem", () => {
  it("cada valor do eixo vira uma raia, na ordem de aparição", () => {
    expect(montar("epico").groups).toEqual([
      { id: "ep-1", label: "ep-1" },
      { id: "ep-2", label: "ep-2" },
    ]);
  });

  it("linha sem valor no eixo fica SEM `groupId` — a raia sintetizada é do Kanban", () => {
    const porId = new Map(montar("epico").cards.map((c) => [c.id, c]));

    expect(porId.get("1")).toMatchObject({ groupId: "ep-1" });
    expect(porId.get("4")).not.toHaveProperty("groupId");
  });

  it("as colunas NÃO mudam por causa do eixo — são eixos independentes", () => {
    expect(montar("epico").columns).toEqual(montar(undefined).columns);
  });

  /**
   * Caso de borda que o `DataTable` deixa acontecer sozinho: nada impede o
   * usuário de agrupar pela mesma coluna que já define as colunas do board.
   * O resultado seria uma raia por coluna, com todos os cards dela — ruído
   * puro, e pior que o board plano.
   */
  it("eixo IGUAL ao da coluna é ignorado, e o board volta a ser plano", () => {
    const comEixoIgual = montar("status");

    expect(comEixoIgual.groups).toEqual([]);
    expect(comEixoIgual.cards).toEqual(montar(undefined).cards);
  });
});
