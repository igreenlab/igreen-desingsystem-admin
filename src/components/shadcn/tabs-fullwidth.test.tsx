import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger } from "./tabs";

/**
 * `fullWidth` tem de alcançar o TRIGGER, não só o container.
 *
 * O defeito que a prop resolve era silencioso e estava espalhado: `w-full` só no `<TabsList>`
 * estica o container e deixa os triggers **agrupados na esquerda**. Medido em 2026-08-21, era
 * o que 6 dos 7 usos manuais do DS faziam — só o `ShowcasePageV2` acertava, e usando a
 * variante arbitrária `[&>*]:flex-1` pra não repetir `flex-1` em cada trigger.
 *
 * Por isso o teste olha as TRÊS camadas. Testar só o List passaria com o bug de volta —
 * é exatamente o erro que o bug original tinha.
 *
 * A segunda parte cobre o trilho do `line`: era `w-fit`, então o `border-b` parava onde as
 * abas paravam e lia como fragmento em vez de divisória. Agora atravessa o container por
 * padrão, independente de `fullWidth`.
 */

function montar(props: { fullWidth?: boolean; variant?: "segmented" | "line" } = {}) {
  return render(
    <Tabs defaultValue="a" {...props}>
      <TabsList data-testid="list">
        <TabsTrigger value="a">Primeira</TabsTrigger>
        <TabsTrigger value="b">Segunda</TabsTrigger>
      </TabsList>
    </Tabs>,
  );
}

describe("Tabs — fullWidth alcança as 3 camadas", () => {
  it("sem a prop: container hug, trigger sem flex-1", () => {
    montar();
    expect(screen.getByTestId("list").className).toContain("w-fit");
    expect(screen.getByRole("tab", { name: "Primeira" }).className).not.toContain("flex-1");
  });

  it("com a prop: root, list E trigger — os três", () => {
    const { container } = montar({ fullWidth: true });
    const root = container.querySelector("[data-orientation]");
    const list = screen.getByTestId("list");

    expect(root?.className, "root precisa de w-full pra o list ter o que preencher").toContain("w-full");
    expect(list.className).toContain("w-full");
    expect(list.className, "w-full e w-fit juntos deixariam a largura na sorte do tailwind-merge").not.toContain("w-fit");

    for (const nome of ["Primeira", "Segunda"]) {
      expect(
        screen.getByRole("tab", { name: nome }).className,
        "sem flex-1 no trigger, o container estica e as abas ficam na esquerda — o defeito original",
      ).toContain("flex-1");
    }
  });

  it("className do consumidor continua vencendo (a prop não engessa)", () => {
    render(
      <Tabs defaultValue="a" fullWidth>
        <TabsList data-testid="list" className="max-w-[200px]">
          <TabsTrigger value="a">Só</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByTestId("list").className).toContain("max-w-[200px]");
  });
});

describe("Tabs — o trilho do line atravessa o container", () => {
  it("line: w-full por padrão, sem precisar de fullWidth", () => {
    montar({ variant: "line" });
    const list = screen.getByTestId("list");
    expect(list.className).toContain("w-full");
    expect(list.className, "era w-fit — a linha parava onde as abas paravam").not.toContain("w-fit");
  });

  it("line sem fullWidth: trilho atravessa mas as abas NÃO se distribuem", () => {
    // A distinção existe de propósito: no underline o trilho é full-bleed e as abas ficam
    // à esquerda (referência: Material/Carbon/Ant). Distribuir é opt-in, via fullWidth.
    montar({ variant: "line" });
    expect(screen.getByRole("tab", { name: "Primeira" }).className).not.toContain("flex-1");
  });

  it("line + fullWidth: aí sim distribui", () => {
    montar({ variant: "line", fullWidth: true });
    expect(screen.getByRole("tab", { name: "Primeira" }).className).toContain("flex-1");
  });

  it("segmented mantém o chrome de pill (não vazou nada do line)", () => {
    montar();
    const c = screen.getByTestId("list").className;
    expect(c).toContain("bg-bg-muted");
    expect(c).toContain("rounded-radius-lg");
    expect(c).not.toContain("border-b");
  });
});
