import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import {
  FilterChip,
  filterChip,
  filterChipClearLink,
  filterChipName,
  filterChipOp,
  filterChipRemove,
  filterChipRow,
  filterChipValue,
} from "./index";

import {
  toolbarApplied,
  toolbarAppliedChip,
  toolbarAppliedChipName,
  toolbarAppliedChipOp,
  toolbarAppliedChipRemove,
  toolbarAppliedChipValue,
  toolbarAppliedClearLink,
} from "../TableToolbar/table-toolbar.styles";
import { ToolbarApplied } from "../TableToolbar/parts/toolbar-applied";
import type { AppliedFilter } from "../TableToolbar/table-toolbar.types";

import {
  ganttAppliedChip,
  ganttAppliedChipName,
  ganttAppliedChipOp,
  ganttAppliedChipRemove,
  ganttAppliedChipValue,
  ganttAppliedRow,
  ganttClearLink,
} from "../Gantt/gantt.styles";
import { GanttAppliedFilters } from "../Gantt/parts/gantt-applied-filters";
import type { GanttFilterField } from "../Gantt/gantt.types";

import {
  schedulerClearLink,
  schedulerFilterChip,
  schedulerFilterChipName,
  schedulerFilterChipValue,
  schedulerFilterRow,
} from "../Scheduler/scheduler.styles";
import { SchedulerToolbar } from "../Scheduler/parts/scheduler-toolbar";

/**
 * P12 — o chip de filtro aplicado existe UMA vez.
 *
 * ## O defeito que isto fecha
 *
 * Até 2026-11-04 a mesma gramática estava escrita à mão em três arquivos:
 * `toolbarAppliedChip*` (`TableToolbar`, a origem), `schedulerFilterChip*` e
 * `ganttAppliedChip*`. Os dois últimos documentavam a cópia com razões — e
 * mesmo assim já tinham divergido:
 *
 *   | o quê                | TableToolbar        | Gantt               | Scheduler           |
 *   |----------------------|---------------------|---------------------|---------------------|
 *   | gap interno          | `gap-gp-md` (8px)   | `gap-gp-md` (8px)   | `gap-gp-sm` (6px)   |
 *   | padding              | `pl-pad-sm pr-pad-lg` | idem              | `pl-pad-lg pr-pad-md` |
 *   | pílula do valor      | `h-[22px]`          | `h-[22px]`          | `h-comp-2xs` (20px) |
 *   | posição do `⊗`       | esquerda            | esquerda            | DIREITA             |
 *   | operador             | sim                 | sim                 | ausente             |
 *
 * A causa: `toolbarAppliedChip` **não era exportado**, nem do `TableToolbar`
 * nem do barrel. Quem queria o chip não tinha como importá-lo, então copiava.
 *
 * ## Por que o teste de IDENTIDADE e não de igualdade de classes
 *
 * Comparar o conjunto de classes aprovaria duas definições separadas que por
 * ora coincidem — e foi exatamente assim que as três começaram. `toBe` exige
 * que seja **o mesmo objeto**: a única forma de passar é importar a mesma peça.
 *
 * ⚠️ Sem jest-dom: `vitest.setup.ts` está fora do `include` do `tsconfig.json`
 * e o `npm test` roda `tsc --noEmit` antes do vitest.
 */

const tokens = (s: string | null | undefined) =>
  (s ?? "").split(/\s+/).filter(Boolean).sort();

/** O `<span>` do chip — o único com `rounded-radius-lg` + `h-form-md`. */
const chipsNaTela = () =>
  [...document.querySelectorAll("span")].filter((s) => {
    const c = s.getAttribute("class") ?? "";
    return c.includes("rounded-radius-lg") && c.includes("h-form-md");
  });

/* ═══════════════════════════════════════════════════════════════════════════
   1. Uma definição só — identidade referencial
   ═══════════════════════════════════════════════════════════════════════════ */

describe("P12 — os três nomes apontam para a MESMA peça", () => {
  it("o chip do TableToolbar É o `filterChip`", () => {
    expect(toolbarAppliedChip).toBe(filterChip);
  });

  it("o chip do Gantt É o `filterChip`", () => {
    expect(ganttAppliedChip).toBe(filterChip);
  });

  it("o chip do Scheduler É o `filterChip`", () => {
    expect(schedulerFilterChip).toBe(filterChip);
  });

  it("a fileira é a mesma nos três", () => {
    expect(toolbarApplied).toBe(filterChipRow);
    expect(ganttAppliedRow).toBe(filterChipRow);
    expect(schedulerFilterRow).toBe(filterChipRow);
  });

  it("as peças internas — ⊗, nome, operador, valor — são as mesmas", () => {
    expect(toolbarAppliedChipRemove).toBe(filterChipRemove);
    expect(ganttAppliedChipRemove).toBe(filterChipRemove);

    expect(toolbarAppliedChipName).toBe(filterChipName);
    expect(ganttAppliedChipName).toBe(filterChipName);
    expect(schedulerFilterChipName).toBe(filterChipName);

    expect(toolbarAppliedChipOp).toBe(filterChipOp);
    expect(ganttAppliedChipOp).toBe(filterChipOp);

    expect(toolbarAppliedChipValue).toBe(filterChipValue);
    expect(ganttAppliedChipValue).toBe(filterChipValue);
    expect(schedulerFilterChipValue).toBe(filterChipValue);
  });

  it('o "Limpar todos" é o mesmo nos três', () => {
    expect(toolbarAppliedClearLink).toBe(filterChipClearLink);
    expect(ganttClearLink).toBe(filterChipClearLink);
    expect(schedulerClearLink).toBe(filterChipClearLink);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   2. As divergências medidas — cada uma vira uma afirmação
   ═══════════════════════════════════════════════════════════════════════════ */

describe("P12 — as divergências que existiam, agora impossíveis", () => {
  it("o gap é `gap-gp-md` (era `gap-gp-sm` no Scheduler)", () => {
    const c = tokens(filterChip());
    expect(c).toContain("gap-gp-md");
    expect(c).not.toContain("gap-gp-sm");
  });

  it("o padding é `pl-pad-sm pr-pad-lg` (estava invertido no Scheduler)", () => {
    const c = tokens(filterChip());
    expect(c).toContain("pl-pad-sm");
    expect(c).toContain("pr-pad-lg");
    expect(c).not.toContain("pl-pad-lg");
    expect(c).not.toContain("pr-pad-md");
  });

  it("a pílula do valor tem 22px (era 20px no Scheduler)", () => {
    const c = tokens(filterChipValue());
    expect(c).toContain("h-[22px]");
    expect(c).not.toContain("h-comp-2xs");
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   3. A anatomia — a ordem é o que a cópia solta deixava divergir
   ═══════════════════════════════════════════════════════════════════════════ */

describe("P12 — a anatomia é a mesma: ⊗ · nome · operador · valor", () => {
  const ordemDoChip = () => {
    const chip = chipsNaTela()[0];
    return [...(chip?.children ?? [])].map((n) => n.tagName.toLowerCase());
  };

  it("o `⊗` é o PRIMEIRO filho — nunca o último", () => {
    render(
      <FilterChip name="Status" op="é" values={["Ativo"]} onRemove={() => {}} />,
    );
    expect(ordemDoChip()[0]).toBe("button");
  });

  it("o botão de remover é o único `<button>` do chip", () => {
    render(
      <FilterChip name="Status" op="é" values={["Ativo"]} onRemove={() => {}} />,
    );
    expect(chipsNaTela()[0]?.querySelectorAll("button").length).toBe(1);
  });

  it("`removable={false}` troca o `⊗` por um ⊕ decorativo, não-botão", () => {
    render(<FilterChip name="UF" removable={false} />);
    const chip = chipsNaTela()[0];
    expect(chip?.querySelectorAll("button").length).toBe(0);
    expect(chip?.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
  });

  it("o `⊗` para a propagação do teclado — Enter nele não abre o popover do chip", () => {
    let abriu = 0;
    render(
      <FilterChip
        name="Status"
        op="é"
        values={["Ativo"]}
        onRemove={() => {}}
        onKeyDown={() => {
          abriu += 1;
        }}
      />,
    );
    const botao = chipsNaTela()[0]?.querySelector("button");
    botao?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    expect(abriu).toBe(0);
  });

  it("um valor sai sem wrapper; dois ou mais ganham a fileira de pílulas", () => {
    const { unmount } = render(<FilterChip name="UF" op="é" values={["SP"]} />);
    expect(
      chipsNaTela()[0]?.querySelectorAll(".gap-gp-2xs").length,
    ).toBe(0);
    unmount();

    render(<FilterChip name="UF" op="é" values={["SP", "RJ"]} />);
    expect(
      chipsNaTela()[0]?.querySelectorAll(".gap-gp-2xs").length,
    ).toBe(1);
  });

  it("sem valor, o chip é só o nome — nem operador nem pílula", () => {
    render(<FilterChip name="UF" />);
    const chip = chipsNaTela()[0];
    expect(chip?.textContent).toBe("UF");
    expect(chip?.querySelectorAll(".rounded-radius-sm").length).toBe(0);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   4. O destaque de marca continua OPT-IN (commit 944138f, item 16 2ª volta)
   ═══════════════════════════════════════════════════════════════════════════ */

describe("P12 — unificar NÃO reabriu o destaque automático", () => {
  it("o default é o tracejado neutro", () => {
    const c = tokens(filterChip());
    expect(c).toContain("border-dashed");
    expect(c).toContain("border-border-input");
    expect(c).not.toContain("border-solid");
    expect(c).not.toContain("bg-bg-brand-subtle");
  });

  it("`active` liga o sólido de marca", () => {
    const c = tokens(filterChip({ active: true }));
    expect(c).toContain("border-solid");
    expect(c).toContain("border-border-brand");
    expect(c).toContain("bg-bg-brand-subtle");
    expect(c).not.toContain("border-dashed");
  });

  it("o fundo da pílula NÃO é tingido nem com `active` — o verde precisa de neutro atrás", () => {
    const c = tokens(filterChipValue({ active: true }));
    expect(c).toContain("bg-bg-muted");
    expect(c).toContain("text-fg-brand");
    expect(c).toContain("dark:text-fg-default");
    expect(c).not.toContain("bg-bg-brand-subtle");
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   5. As DECISÕES de cada tela — preservadas, e travadas aqui
   ═══════════════════════════════════════════════════════════════════════════ */

const chipTabela = (over: Partial<AppliedFilter> = {}): AppliedFilter => ({
  id: "status",
  columnLabel: "Status",
  op: "isAnyOf",
  value: "Ativo",
  ...over,
});

const campoGantt = (over: Partial<GanttFilterField> = {}): GanttFilterField => ({
  id: "frente",
  label: "Frente",
  kind: "multi",
  options: [
    { value: "a", label: "Design" },
    { value: "b", label: "Produto" },
    { value: "c", label: "Dados" },
    { value: "d", label: "Infra" },
  ],
  accessor: () => "a",
  ...over,
});

const toolbarScheduler = (model: Record<string, string[]>) => (
  <SchedulerToolbar
    title="Novembro"
    view="month"
    onViewChange={() => {}}
    onPrev={() => {}}
    onNext={() => {}}
    onToday={() => {}}
    searchable={false}
    search=""
    onSearchChange={() => {}}
    filterFields={[
      {
        id: "status",
        label: "Status",
        options: [
          { value: "ok", label: "Confirmado" },
          { value: "no", label: "Cancelado" },
        ],
      },
    ]}
    filterModel={model}
    onClearField={() => {}}
    onClearAll={() => {}}
    appliedCount={Object.values(model).flat().length}
    filterPanelOpen={false}
    onToggleFilterPanel={() => {}}
  />
);

describe("DECISÃO preservada — o Scheduler não mostra chip VAZIO", () => {
  it("sem filtro aplicado, a fileira inteira some", () => {
    render(toolbarScheduler({}));
    expect(chipsNaTela().length).toBe(0);
  });

  it("com filtro aplicado, aparece um chip — e só os aplicados", () => {
    render(toolbarScheduler({ status: ["ok"] }));
    expect(chipsNaTela().length).toBe(1);
    expect(chipsNaTela()[0]?.textContent).toContain("Status");
    expect(chipsNaTela()[0]?.textContent).toContain("Confirmado");
  });

  it("e por isso o chip dele NÃO usa o destaque de marca", () => {
    // O destaque existe pra contrastar com o vazio. Sem vazio na fileira ele
    // repinta tudo sem distinguir — a conclusão do mantenedor no item 16.
    render(toolbarScheduler({ status: ["ok"] }));
    const c = tokens(chipsNaTela()[0]?.getAttribute("class"));
    expect(c).toContain("border-dashed");
    expect(c).not.toContain("bg-bg-brand-subtle");
  });

  it("o chip não finge ser clicável — a fileira é resumo, o painel é onde se escolhe", () => {
    render(toolbarScheduler({ status: ["ok"] }));
    const c = tokens(chipsNaTela()[0]?.getAttribute("class"));
    expect(c).not.toContain("cursor-pointer");
  });
});

describe("DECISÃO preservada — o Gantt colapsa valores ACIMA de 3, não a partir de 2", () => {
  const renderGantt = (marcados: string[]) =>
    render(
      <GanttAppliedFilters
        fields={[campoGantt()]}
        model={{ frente: marcados }}
        counts={{}}
        onToggleValue={() => {}}
        onClearField={() => {}}
        onClearAll={() => {}}
      />,
    );

  it("2 valores aparecem por extenso — é o caso mais comum", () => {
    renderGantt(["a", "b"]);
    const t = chipsNaTela()[0]?.textContent ?? "";
    expect(t).toContain("Design");
    expect(t).toContain("Produto");
    expect(t).not.toContain("selecionados");
  });

  it("3 valores ainda aparecem por extenso", () => {
    renderGantt(["a", "b", "c"]);
    expect(chipsNaTela()[0]?.textContent).not.toContain("selecionados");
  });

  it("4 viram contagem — o eixo horizontal disputa a mesma largura", () => {
    renderGantt(["a", "b", "c", "d"]);
    expect(chipsNaTela()[0]?.textContent).toContain("4 selecionados");
  });

  it("sem filtro aplicado, a fileira some", () => {
    renderGantt([]);
    expect(chipsNaTela().length).toBe(0);
  });
});

describe("DECISÃO preservada — o chip VAZIO da tabela existe e é neutro", () => {
  it("`isEmpty` renderiza só o nome da coluna", () => {
    render(
      <ToolbarApplied
        filters={[chipTabela({ isEmpty: true, value: [] })]}
        onRemove={() => {}}
        clearLabel={null}
      />,
    );
    expect(chipsNaTela()[0]?.textContent).toBe("Status");
  });

  it("e continua neutro mesmo com `highlightAppliedFilterChips`", () => {
    render(
      <ToolbarApplied
        filters={[chipTabela({ isEmpty: true, value: [] })]}
        onRemove={() => {}}
        highlightAppliedFilterChips
        clearLabel={null}
      />,
    );
    const c = tokens(chipsNaTela()[0]?.getAttribute("class"));
    expect(c).toContain("border-dashed");
    expect(c).not.toContain("bg-bg-brand-subtle");
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   6. O que a unificação MUDOU no Scheduler — travado pra não regredir
   ═══════════════════════════════════════════════════════════════════════════ */

describe("P12 — o Scheduler ganhou a anatomia dos outros dois", () => {
  it("o `⊗` passou pra ESQUERDA", () => {
    render(toolbarScheduler({ status: ["ok"] }));
    expect(chipsNaTela()[0]?.firstElementChild?.tagName.toLowerCase()).toBe(
      "button",
    );
  });

  it("o operador aparece — o chip lê 'Status é Confirmado'", () => {
    render(toolbarScheduler({ status: ["ok"] }));
    // Sem espaço no `textContent`: as três peças são `<span>` irmãos e o
    // respiro vem do `gap-gp-md` do chip, não de texto.
    expect(chipsNaTela()[0]?.textContent).toBe("StatuséConfirmado");
  });

  it("o chip do Scheduler tem o MESMO conjunto de classes do chip da tabela", () => {
    const { unmount } = render(toolbarScheduler({ status: ["ok"] }));
    const doScheduler = tokens(chipsNaTela()[0]?.getAttribute("class"));
    unmount();

    render(
      <ToolbarApplied
        filters={[chipTabela()]}
        onRemove={() => {}}
        clearLabel={null}
      />,
    );
    expect(doScheduler).toEqual(tokens(chipsNaTela()[0]?.getAttribute("class")));
  });
});
