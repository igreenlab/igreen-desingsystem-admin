import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TabsNavigation } from "./tabs-navigation";

/**
 * Os testes são das DECISÕES da spec, não de estilo — são elas que um refactor futuro desfaz
 * sem perceber:
 *
 *   1. o componente é CONTROLADO e não hospeda conteúdo (o painel pode morar fora);
 *   2. `actions` SUBSTITUI as ações padrão, e `onClose` sem `actions` as liga;
 *   3. as ações não reservam espaço (coluna 0fr) — exceto quando devem persistir;
 *   4. teclado: setas movem a seleção, e só a ativa fica na ordem de tabulação;
 *   5. `Subtitle` some sozinho em `density="compact"`.
 *
 * ⚠️ Leem CLASSE onde o valor é do Tailwind: jsdom não carrega o CSS, então `grid-cols-[0fr]`
 * existe como nome de classe e a largura computada é sempre 0.
 */

const classes = (el: Element | null) => String(el?.className ?? "");

function Tira(props: Partial<React.ComponentProps<typeof TabsNavigation>> = {}) {
  const { value = "a", onValueChange = () => {}, ...resto } = props;
  return (
    <TabsNavigation value={value} onValueChange={onValueChange} aria-label="Abas" {...resto}>
      <TabsNavigation.Tab value="a">
        <TabsNavigation.Title>Primeira</TabsNavigation.Title>
        <TabsNavigation.Subtitle>sub A</TabsNavigation.Subtitle>
      </TabsNavigation.Tab>
      <TabsNavigation.Tab value="b">
        <TabsNavigation.Title>Segunda</TabsNavigation.Title>
        <TabsNavigation.Subtitle>sub B</TabsNavigation.Subtitle>
      </TabsNavigation.Tab>
      <TabsNavigation.Tab value="c">
        <TabsNavigation.Title>Terceira</TabsNavigation.Title>
      </TabsNavigation.Tab>
    </TabsNavigation>
  );
}

describe("TabsNavigation — controle e conteúdo fora", () => {
  it("é controlado: clicar avisa, mas quem troca é o consumidor", () => {
    const onValueChange = vi.fn();
    render(<Tira value="a" onValueChange={onValueChange} />);

    fireEvent.click(screen.getByText("Segunda"));
    expect(onValueChange).toHaveBeenCalledWith("b");
    // sem o consumidor mudar `value`, a ativa continua sendo a primeira
    expect(screen.getByRole("tab", { selected: true }).textContent).toContain("Primeira");
  });

  it("`panelId` vira aria-controls — é o que fecha a a11y com o painel FORA", () => {
    render(
      <TabsNavigation value="a" onValueChange={() => {}} aria-label="Abas">
        <TabsNavigation.Tab value="a" panelId="painel-externo">
          <TabsNavigation.Title>Primeira</TabsNavigation.Title>
        </TabsNavigation.Tab>
      </TabsNavigation>,
    );
    expect(screen.getByRole("tab").getAttribute("aria-controls")).toBe("painel-externo");
  });

  it("`Panel` renderiza só a ativa e é rotulado pela aba", () => {
    const { rerender } = render(
      <>
        <TabsNavigation value="a" onValueChange={() => {}} aria-label="Abas">
          <TabsNavigation.Tab value="a">
            <TabsNavigation.Title>Primeira</TabsNavigation.Title>
          </TabsNavigation.Tab>
          <TabsNavigation.Tab value="b">
            <TabsNavigation.Title>Segunda</TabsNavigation.Title>
          </TabsNavigation.Tab>
          <TabsNavigation.Panel value="a">conteúdo A</TabsNavigation.Panel>
          <TabsNavigation.Panel value="b">conteúdo B</TabsNavigation.Panel>
        </TabsNavigation>
      </>,
    );
    expect(screen.getByText("conteúdo A")).toBeTruthy();
    expect(screen.queryByText("conteúdo B")).toBeNull();

    const painel = screen.getByRole("tabpanel");
    const aba = screen.getByRole("tab", { selected: true });
    expect(painel.getAttribute("aria-labelledby")).toBe(aba.id);

    rerender(
      <TabsNavigation value="b" onValueChange={() => {}} aria-label="Abas">
        <TabsNavigation.Tab value="a">
          <TabsNavigation.Title>Primeira</TabsNavigation.Title>
        </TabsNavigation.Tab>
        <TabsNavigation.Tab value="b">
          <TabsNavigation.Title>Segunda</TabsNavigation.Title>
        </TabsNavigation.Tab>
        <TabsNavigation.Panel value="a">conteúdo A</TabsNavigation.Panel>
        <TabsNavigation.Panel value="b">conteúdo B</TabsNavigation.Panel>
      </TabsNavigation>,
    );
    expect(screen.getByText("conteúdo B")).toBeTruthy();
  });

  it("`Panel` não aparece dentro do tablist — ele é filho lógico, não item da tira", () => {
    render(
      <TabsNavigation value="a" onValueChange={() => {}} aria-label="Abas">
        <TabsNavigation.Tab value="a">
          <TabsNavigation.Title>Primeira</TabsNavigation.Title>
        </TabsNavigation.Tab>
        <TabsNavigation.Panel value="a">conteúdo</TabsNavigation.Panel>
      </TabsNavigation>,
    );
    // o painel é renderizado, mas não vira uma "aba" a mais
    expect(screen.getAllByRole("tab")).toHaveLength(1);
  });
});

describe("TabsNavigation — composição das ações", () => {
  it("sem `onClose` e sem `actions`, a aba não tem ação nenhuma", () => {
    render(<Tira />);
    expect(screen.queryByLabelText("Fechar aba")).toBeNull();
  });

  it("`onClose` liga as ações padrão (⋯ + ×)", () => {
    const onClose = vi.fn();
    render(
      <TabsNavigation value="a" onValueChange={() => {}} aria-label="Abas">
        <TabsNavigation.Tab value="a" onClose={onClose}>
          <TabsNavigation.Title>Primeira</TabsNavigation.Title>
        </TabsNavigation.Tab>
      </TabsNavigation>,
    );
    expect(screen.getByLabelText("Opções da aba")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Fechar aba"));
    expect(onClose).toHaveBeenCalled();
  });

  it("`actions` SUBSTITUI as padrão — é o escape hatch de ✓/✗", () => {
    const aceitar = vi.fn();
    render(
      <TabsNavigation value="a" onValueChange={() => {}} aria-label="Abas">
        <TabsNavigation.Tab
          value="a"
          onClose={() => {}}
          actions={
            <TabsNavigation.Action aria-label="Aceitar" tom="success" onClick={aceitar}>
              ok
            </TabsNavigation.Action>
          }
        >
          <TabsNavigation.Title>Primeira</TabsNavigation.Title>
        </TabsNavigation.Tab>
      </TabsNavigation>,
    );
    expect(screen.queryByLabelText("Fechar aba")).toBeNull();
    fireEvent.click(screen.getByLabelText("Aceitar"));
    expect(aceitar).toHaveBeenCalled();
  });

  it("clique na ação NÃO seleciona a aba", () => {
    const onValueChange = vi.fn();
    render(
      <TabsNavigation value="a" onValueChange={onValueChange} aria-label="Abas">
        <TabsNavigation.Tab value="b" onClose={() => {}}>
          <TabsNavigation.Title>Segunda</TabsNavigation.Title>
        </TabsNavigation.Tab>
      </TabsNavigation>,
    );
    fireEvent.click(screen.getByLabelText("Fechar aba"));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("TabsNavigation — a coluna de ações não reserva espaço", () => {
  const comAcoes = (props: Partial<React.ComponentProps<typeof TabsNavigation.Tab>> = {}) => {
    const { container } = render(
      <TabsNavigation value="a" onValueChange={() => {}} aria-label="Abas" {...(props.value ? {} : {})}>
        <TabsNavigation.Tab value="b" onClose={() => {}} {...props}>
          <TabsNavigation.Title>Segunda</TabsNavigation.Title>
        </TabsNavigation.Tab>
      </TabsNavigation>,
    );
    return classes(container.querySelector('[role="tab"] .grid'));
  };

  it("aba inativa: coluna 0fr (o título usa a aba inteira)", () => {
    expect(comAcoes()).toContain("grid-cols-[0fr]");
  });

  it("`actionsAlwaysVisible` mantém a coluna aberta — o caso do chamado pendente", () => {
    expect(comAcoes({ actionsAlwaysVisible: true })).toContain("grid-cols-[1fr]");
  });

  it("aba ATIVA sempre mostra as ações", () => {
    const { container } = render(
      <TabsNavigation value="a" onValueChange={() => {}} aria-label="Abas">
        <TabsNavigation.Tab value="a" onClose={() => {}}>
          <TabsNavigation.Title>Primeira</TabsNavigation.Title>
        </TabsNavigation.Tab>
      </TabsNavigation>,
    );
    expect(classes(container.querySelector('[role="tab"] .grid'))).toContain("grid-cols-[1fr]");
  });

  it("`actionsMode=persistent` abre a coluna de todas", () => {
    const { container } = render(
      <TabsNavigation value="a" onValueChange={() => {}} actionsMode="persistent" aria-label="Abas">
        <TabsNavigation.Tab value="b" onClose={() => {}}>
          <TabsNavigation.Title>Segunda</TabsNavigation.Title>
        </TabsNavigation.Tab>
      </TabsNavigation>,
    );
    expect(classes(container.querySelector('[role="tab"] .grid'))).toContain("grid-cols-[1fr]");
  });
});

describe("TabsNavigation — teclado", () => {
  it("só a aba ativa entra na ordem de tabulação (roving tabindex)", () => {
    render(<Tira value="b" />);
    const abas = screen.getAllByRole("tab");
    expect(abas.map((a) => a.getAttribute("tabindex"))).toEqual(["-1", "0", "-1"]);
  });

  it("→ e ← movem a seleção; Home/End vão às pontas", () => {
    const onValueChange = vi.fn();
    render(<Tira value="b" onValueChange={onValueChange} />);
    const tablist = screen.getByRole("tablist");

    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenLastCalledWith("c");
    fireEvent.keyDown(tablist, { key: "ArrowLeft" });
    expect(onValueChange).toHaveBeenLastCalledWith("a");
    fireEvent.keyDown(tablist, { key: "End" });
    expect(onValueChange).toHaveBeenLastCalledWith("c");
    fireEvent.keyDown(tablist, { key: "Home" });
    expect(onValueChange).toHaveBeenLastCalledWith("a");
  });

  it("o foco acompanha a seleção quando ela veio DA TIRA", () => {
    function Controlada() {
      const [v, setV] = useState("a");
      return <Tira value={v} onValueChange={setV} />;
    }
    render(<Controlada />);
    const abas = screen.getAllByRole("tab");
    abas[0].focus();
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getAllByRole("tab")[1]);
  });

  it("mas NÃO rouba o foco quando a troca veio de fora", () => {
    // app trocando de aba sozinho (notificação, rota) enquanto o usuário digita em outro lugar
    const { rerender } = render(
      <>
        <input aria-label="busca" />
        <Tira value="a" />
      </>,
    );
    const input = screen.getByLabelText("busca");
    input.focus();
    rerender(
      <>
        <input aria-label="busca" />
        <Tira value="b" />
      </>,
    );
    expect(document.activeElement).toBe(input);
  });

  it("→ na última circula pra primeira", () => {
    const onValueChange = vi.fn();
    render(<Tira value="c" onValueChange={onValueChange} />);
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenLastCalledWith("a");
  });
});

describe("TabsNavigation — densidade, fill e superfície", () => {
  it("`compact` esconde o subtítulo sem o consumidor condicionar nada", () => {
    const { rerender } = render(<Tira />);
    expect(screen.getByText("sub A")).toBeTruthy();

    rerender(<Tira density="compact" />);
    expect(screen.queryByText("sub A")).toBeNull();
  });

  it("modo pousado tem régua na tira e `-mb-px` na aba; `fill` não tem nenhum dos dois", () => {
    const { container, rerender } = render(<Tira />);
    expect(classes(container.querySelector('[role="tablist"]'))).toContain("border-b");
    expect(classes(container.querySelector('[role="tab"]'))).toContain("-mb-px");

    rerender(<Tira fill />);
    // a união em `fill` é por continuidade de cor — régua e -mb-px sairiam de lugar
    expect(classes(container.querySelector('[role="tablist"]'))).not.toContain("border-b");
    expect(classes(container.querySelector('[role="tab"]'))).not.toContain("-mb-px");
    expect(classes(container.querySelector('[role="tab"]'))).toContain("h-full");
  });

  it("`surface` decide a cor da aba ATIVA — é ela que precisa casar com o conteúdo", () => {
    const { container, rerender } = render(<Tira value="a" />);
    expect(classes(container.querySelector('[role="tab"]'))).toContain("bg-bg-surface");

    rerender(<Tira value="a" surface="canvas" />);
    const cls = classes(container.querySelector('[role="tab"]'));
    expect(cls).toContain("bg-bg-canvas");
    expect(cls).not.toContain("bg-bg-surface");
  });
});
