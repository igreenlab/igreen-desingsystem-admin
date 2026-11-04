import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { tv } from "@/utils/tv";

import { ToolbarApplied } from "./parts/toolbar-applied";
import type { AppliedFilter } from "./table-toolbar.types";

/**
 * O destaque do chip APLICADO é **opt-in** — `highlightAppliedFilterChips`.
 *
 * O item 16 pintou o chip com valor de marca (borda sólida + `bg-brand-subtle` +
 * valor em `fg-brand`) pra ele se distinguir do chip VAZIO, o placeholder de
 * `showEmptyFilterChips`. O destaque só **paga** quando há chip vazio na mesma
 * barra pra contrastar: numa barra onde todo chip visível já está aplicado ele
 * não distingue nada e só muda a cor de tudo — e essa é a maioria das telas.
 *
 * Medido nesta árvore, e é o que sustenta o opt-in:
 *   - `DataList` **nunca** produz chip vazio — `toAppliedFilters`
 *     (`DataList/parts/data-list-toolbar.tsx:101`) faz `continue` em item sem
 *     valor. Lá o item 16 pintou **100%** dos chips de marca, com zero contraste
 *     ganho.
 *   - No `DataTable` o chip vazio só existe com `showEmptyFilterChips`, ou
 *     transitoriamente pelo atalho de filtro do cabeçalho.
 *
 * ## O que estes testes travam, nesta ordem de importância
 *
 *   1. **O caminho antigo.** Sem a prop, o chip aplicado volta ao pixel de ANTES
 *      do item 16 — e isso não é conferido por lista escrita à mão: o arquivo
 *      recria a `tv()` de `21477d0^` verbatim e compara o CONJUNTO de classes.
 *      Lista à mão erraria junto com a implementação; a definição antiga, não.
 *   2. **Com a prop, o destaque do item 16 é o mesmo** — borda, fundo e valor.
 *   3. **A prop não toca o chip VAZIO** nos dois modos: ele é o tracejado neutro
 *      de sempre, e é contra ele que o aplicado contrasta.
 *
 * ⚠️ Classe condicional de `tv()` sai na lista de classes, então a comparação é
 * por **token exato**, nunca por `includes` na string (um `includes("bg-bg-brand")`
 * casaria dentro de `bg-bg-brand-subtle` e aprovaria o chip errado).
 *
 * ⚠️ Sem jest-dom: `vitest.setup.ts` está fora do `include` do `tsconfig.json` e
 * `npm test` roda `tsc --noEmit` antes do vitest.
 */

/* ── A definição de ANTES do item 16, copiada verbatim de `21477d0^` ─────
   `git show 21477d0^:src/components/ui/TableToolbar/table-toolbar.styles.ts`.

   É a régua do caminho antigo. Rodar a definição antiga pelo MESMO `tv()`/
   `tailwind-merge` da produção é mais estrito que escrever a lista esperada na
   mão — uma lista escrita à mão erra junto com quem a escreveu. */
const chipAntes = tv({
  base: [
    "inline-flex items-center gap-gp-md",
    "h-form-md pl-pad-sm pr-pad-lg",
    "bg-bg-surface dark:bg-bg-muted",
    "border border-dashed border-border-input rounded-radius-lg",
    "text-body-xs font-normal text-fg-default",
    "transition-[background-color,border-color] duration-150",
  ],
  variants: {
    interactive: {
      true: [
        "cursor-pointer",
        "hover:bg-bg-muted-hover hover:border-border-default",
        "dark:hover:bg-bg-accent",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
      ],
    },
  },
});

const valorAntes = tv({
  base: [
    "inline-flex items-center h-[22px] px-pad-md",
    "rounded-radius-sm",
    "bg-bg-muted dark:bg-bg-accent",
    "text-body-xs font-medium text-fg-default",
  ],
});

const chip = (over: Partial<AppliedFilter> = {}): AppliedFilter => ({
  id: "status",
  columnLabel: "Status",
  op: "isAnyOf",
  value: "Ativo",
  ...over,
});

const tokens = (s: string | null | undefined) =>
  (s ?? "").split(/\s+/).filter(Boolean).sort();

const classesDoChip = (i = 0) => {
  const spans = [...document.querySelectorAll("span")].filter((s) =>
    (s.getAttribute("class") ?? "").includes("rounded-radius-lg"),
  );
  return tokens(spans[i]?.getAttribute("class"));
};

/** A tag do valor — a pílula interna com o conteúdo formatado. */
const classesDoValor = () => {
  const el = [...document.querySelectorAll("span")].find(
    (s) =>
      s.textContent === "Ativo" &&
      (s.getAttribute("class") ?? "").includes("rounded-radius-sm"),
  );
  return tokens(el?.getAttribute("class"));
};

describe("ToolbarApplied — o caminho antigo: sem a prop, a cor é a de antes do item 16", () => {
  it("o chip APLICADO tem o MESMO conjunto de classes de 21477d0^", () => {
    render(<ToolbarApplied filters={[chip()]} onRemove={() => {}} />);
    expect(classesDoChip()).toEqual(tokens(chipAntes()));
  });

  it("o chip APLICADO interativo também — hover neutro, foco de sempre", () => {
    render(
      <ToolbarApplied
        filters={[chip()]}
        onRemove={() => {}}
        renderChip={(_f, d) => d}
      />,
    );
    expect(classesDoChip()).toEqual(tokens(chipAntes({ interactive: true })));
  });

  it("a pílula do VALOR volta a `text-fg-default`, sem `dark:` e sem marca", () => {
    render(<ToolbarApplied filters={[chip()]} onRemove={() => {}} />);
    const classes = classesDoValor();

    expect(classes).toEqual(tokens(valorAntes()));
    expect(classes).not.toContain("text-fg-brand");
    expect(classes).not.toContain("dark:text-fg-default");
  });

  it("o chip VAZIO é o tracejado neutro de sempre", () => {
    render(
      <ToolbarApplied
        filters={[chip({ isEmpty: true, value: [] })]}
        onRemove={() => {}}
      />,
    );
    expect(classesDoChip()).toEqual(tokens(chipAntes()));
  });

  it("numa barra MISTA, os dois chips ficam iguais — é o estado que o item 16 achou ruim", () => {
    // Trava a afirmação ao contrário: o destaque realmente não vaza sem a prop.
    render(
      <ToolbarApplied
        filters={[chip(), chip({ id: "uf", columnLabel: "UF", isEmpty: true, value: [] })]}
        onRemove={() => {}}
      />,
    );
    expect(classesDoChip(0)).toEqual(classesDoChip(1));
  });
});

describe("ToolbarApplied — com `highlightAppliedFilterChips`, o destaque do item 16", () => {
  it("o chip COM valor usa borda sólida de marca sobre bg-brand-subtle", () => {
    render(
      <ToolbarApplied filters={[chip()]} onRemove={() => {}} highlightAppliedFilterChips />,
    );
    const classes = classesDoChip();

    expect(classes).toContain("border-solid");
    expect(classes).toContain("border-border-brand");
    expect(classes).toContain("bg-bg-brand-subtle");
    expect(classes).not.toContain("border-dashed");
  });

  it("o valor do chip aplicado lê em text-fg-brand no claro", () => {
    render(
      <ToolbarApplied filters={[chip()]} onRemove={() => {}} highlightAppliedFilterChips />,
    );
    const classes = classesDoValor();
    expect(classes).toContain("text-fg-brand");
    expect(classes).not.toContain("text-fg-default");
  });

  it("no ESCURO o valor volta ao neutro — medido, o verde reprova o AA lá", () => {
    // `brandContrast` sobre superfície escura dá 4,36:1 (AA de texto pede 4,5).
    // No escuro quem carrega o estado é a borda do chip: 7,99:1 contra a barra,
    // onde o chip vazio mede 1,24. Mesma saída do `bulkBarCount`.
    render(
      <ToolbarApplied filters={[chip()]} onRemove={() => {}} highlightAppliedFilterChips />,
    );
    expect(classesDoValor()).toContain("dark:text-fg-default");
  });

  it("o FUNDO da pílula do valor não é tingido — o verde precisa de neutro atrás", () => {
    // Medido: pílula em `bg-brand-subtle-hover` derrubava o texto pra 3,14:1 no
    // claro (AA de texto pede 4,5). A cor de marca mora na borda e no fundo do
    // CHIP; embaixo do texto fica o neutro de sempre.
    render(
      <ToolbarApplied filters={[chip()]} onRemove={() => {}} highlightAppliedFilterChips />,
    );
    const classes = classesDoValor();
    expect(classes).toContain("bg-bg-muted");
    expect(classes).not.toContain("bg-bg-brand-subtle-hover");
  });

  it("o chip VAZIO NÃO é afetado pela prop — continua tracejado e neutro", () => {
    render(
      <ToolbarApplied
        filters={[chip({ isEmpty: true, value: [] })]}
        onRemove={() => {}}
        highlightAppliedFilterChips
      />,
    );
    const classes = classesDoChip();

    expect(classes).toContain("border-dashed");
    expect(classes).toContain("border-border-input");
    expect(classes).toContain("bg-bg-surface");
    expect(classes).not.toContain("border-border-brand");
    expect(classes).not.toContain("bg-bg-brand-subtle");
  });

  it("os dois estados coexistem na MESMA barra sem se contaminar", () => {
    render(
      <ToolbarApplied
        filters={[chip(), chip({ id: "uf", columnLabel: "UF", isEmpty: true, value: [] })]}
        onRemove={() => {}}
        highlightAppliedFilterChips
      />,
    );
    expect(classesDoChip(0)).toContain("bg-bg-brand-subtle");
    expect(classesDoChip(1)).toContain("border-dashed");
    expect(classesDoChip(1)).not.toContain("bg-bg-brand-subtle");
  });

  it("interactive mantém foco e hover — e o hover do aplicado é de marca", () => {
    render(
      <ToolbarApplied
        filters={[chip()]}
        onRemove={() => {}}
        renderChip={(_f, d) => d}
        highlightAppliedFilterChips
      />,
    );
    const classes = classesDoChip();

    expect(classes).toContain("cursor-pointer");
    expect(classes).toContain("focus-visible:ring-ring-brand");
    expect(classes).toContain("hover:bg-bg-brand-subtle-hover");
    // o hover neutro NÃO pode sobrar junto: duas classes de bg-hover no mesmo
    // elemento não são conflito pro tailwind-merge (prefixo DS, L-072) e quem
    // decidiria seria a ordem do CSS
    expect(classes).not.toContain("hover:bg-bg-muted-hover");
  });

  it("o chip VAZIO interativo mantém o hover neutro de sempre, com a prop ligada", () => {
    render(
      <ToolbarApplied
        filters={[chip({ isEmpty: true, value: [] })]}
        onRemove={() => {}}
        renderChip={(_f, d) => d}
        highlightAppliedFilterChips
      />,
    );
    const classes = classesDoChip();

    expect(classes).toContain("hover:bg-bg-muted-hover");
    expect(classes).toContain("hover:border-border-default");
    expect(classes).not.toContain("hover:bg-bg-brand-subtle-hover");
  });
});
