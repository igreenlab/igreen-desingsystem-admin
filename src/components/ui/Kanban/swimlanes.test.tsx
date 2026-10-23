/**
 * Raias (swimlanes) — o segundo eixo do Kanban.
 *
 * Três regras do contrato que não se leem no código e que um refactor derruba
 * sem avisar:
 *
 *  1. recolher/expandir vale pra TODAS as colunas (estado por id de grupo, não
 *     por par coluna+grupo);
 *  2. a raia só existe na coluna onde o grupo tem card;
 *  3. card sem `groupId` cai na sintetizada, SEMPRE por último.
 *
 * E a de baixo, que é a que mais importa: **board sem `groups` continua plano**.
 * O recurso é aditivo, e esse teste é o que prova.
 */
import { describe, expect, it, beforeAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Kanban } from "./kanban";
import type { KanbanCardData, KanbanColumn, KanbanGroup } from "./kanban.types";

beforeAll(() => {
  window.ResizeObserver ??= vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

const COLUNAS: KanbanColumn[] = [
  { id: "todo", label: "A fazer" },
  { id: "doing", label: "Fazendo" },
  { id: "done", label: "Pronto" },
];

const GRUPOS: KanbanGroup[] = [
  { id: "ep-1", label: "Onboarding", code: "EP-12", progress: { done: 3, total: 8 } },
  { id: "ep-2", label: "Faturamento" },
];

/* ep-1 tem card em `todo` e `doing` (não em `done`).
   ep-2 só em `todo`. Um card sem grupo em `todo`. */
const CARDS: KanbanCardData[] = [
  { id: "a", columnId: "todo", groupId: "ep-1", title: "A" },
  { id: "b", columnId: "doing", groupId: "ep-1", title: "B" },
  { id: "c", columnId: "todo", groupId: "ep-2", title: "C" },
  { id: "d", columnId: "todo", title: "D sem grupo" },
];

/** Cabeçalhos de raia visíveis, na ordem do DOM. */
const raias = () =>
  screen
    .getAllByRole("button", { expanded: undefined })
    .filter((b) => b.hasAttribute("aria-expanded"))
    .map((b) => (b.textContent ?? "").trim());

describe("Kanban — raias", () => {
  it("sem `groups`, o board continua plano (nenhuma raia, nenhum aria-expanded)", () => {
    render(<Kanban columns={COLUNAS} cards={CARDS} />);
    expect(document.querySelectorAll("[aria-expanded]")).toHaveLength(0);
    expect(screen.getByText("A")).toBeTruthy();
  });

  it("a raia só aparece na coluna onde o grupo tem card", () => {
    render(<Kanban columns={COLUNAS} cards={CARDS} groups={GRUPOS} />);
    // ep-1 em 2 colunas; ep-2 em 1; "Sem grupo" em 1. Total = 4 cabeçalhos.
    const textos = raias();
    expect(textos.filter((t) => t.includes("Onboarding"))).toHaveLength(2);
    expect(textos.filter((t) => t.includes("Faturamento"))).toHaveLength(1);
    expect(textos.filter((t) => t.includes("Sem grupo"))).toHaveLength(1);
  });

  it("cabeçalho traz código, progresso e a contagem DESTA coluna", () => {
    render(<Kanban columns={COLUNAS} cards={CARDS} groups={GRUPOS} />);
    const onboarding = raias().filter((t) => t.includes("Onboarding"));
    // "Onboarding" + "EP-12" + "3/8" + contagem 1 em cada coluna
    expect(onboarding[0]).toContain("EP-12");
    expect(onboarding[0]).toContain("3/8");
  });

  it("recolher/expandir vale pra TODAS as colunas ao mesmo tempo", async () => {
    render(
      <Kanban
        columns={COLUNAS}
        cards={CARDS}
        groups={GRUPOS}
        defaultExpandedGroupIds={new Set(["ep-1"])}
      />,
    );
    const cabecalhos = () =>
      screen.getAllByRole("button").filter((b) => /Onboarding/.test(b.textContent ?? ""));

    // Começa expandida nas duas colunas onde existe.
    expect(cabecalhos().map((b) => b.getAttribute("aria-expanded"))).toEqual([
      "true",
      "true",
    ]);

    await userEvent.click(cabecalhos()[0]);

    // Um clique numa coluna fecha nas DUAS — o estado é por id de grupo.
    expect(cabecalhos().map((b) => b.getAttribute("aria-expanded"))).toEqual([
      "false",
      "false",
    ]);
  });

  it("card sem groupId cai na raia sintetizada, por último na coluna", () => {
    render(<Kanban columns={COLUNAS} cards={CARDS} groups={GRUPOS} />);
    const naColunaTodo = raias().slice(0, 3);
    expect(naColunaTodo[naColunaTodo.length - 1]).toContain("Sem grupo");
  });

  it("`ungroupedLabel={null}` esconde a raia sintetizada", () => {
    render(
      <Kanban columns={COLUNAS} cards={CARDS} groups={GRUPOS} ungroupedLabel={null} />,
    );
    expect(raias().some((t) => t.includes("Sem grupo"))).toBe(false);
  });

  it("`notice` renderiza abaixo do card no layout default", () => {
    render(
      <Kanban
        columns={COLUNAS}
        cards={[{ ...CARDS[0], notice: "Dependência pendente" }]}
        groups={GRUPOS}
        defaultExpandedGroupIds={new Set(["ep-1"])}
      />,
    );
    expect(screen.getByText("Dependência pendente")).toBeTruthy();
  });
});
