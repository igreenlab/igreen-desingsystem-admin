import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NavTabs } from "./nav-tabs";

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

function Tira(props: Partial<React.ComponentProps<typeof NavTabs>> = {}) {
  const { value = "a", onValueChange = () => {}, ...resto } = props;
  return (
    <NavTabs value={value} onValueChange={onValueChange} aria-label="Abas" {...resto}>
      <NavTabs.Tab value="a">
        <NavTabs.Title>Primeira</NavTabs.Title>
        <NavTabs.Subtitle>sub A</NavTabs.Subtitle>
      </NavTabs.Tab>
      <NavTabs.Tab value="b">
        <NavTabs.Title>Segunda</NavTabs.Title>
        <NavTabs.Subtitle>sub B</NavTabs.Subtitle>
      </NavTabs.Tab>
      <NavTabs.Tab value="c">
        <NavTabs.Title>Terceira</NavTabs.Title>
      </NavTabs.Tab>
    </NavTabs>
  );
}

describe("NavTabs — controle e conteúdo fora", () => {
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
      <NavTabs value="a" onValueChange={() => {}} aria-label="Abas">
        <NavTabs.Tab value="a" panelId="painel-externo">
          <NavTabs.Title>Primeira</NavTabs.Title>
        </NavTabs.Tab>
      </NavTabs>,
    );
    expect(screen.getByRole("tab").getAttribute("aria-controls")).toBe("painel-externo");
  });

  it("`Panel` renderiza só a ativa e é rotulado pela aba", () => {
    const { rerender } = render(
      <>
        <NavTabs value="a" onValueChange={() => {}} aria-label="Abas">
          <NavTabs.Tab value="a">
            <NavTabs.Title>Primeira</NavTabs.Title>
          </NavTabs.Tab>
          <NavTabs.Tab value="b">
            <NavTabs.Title>Segunda</NavTabs.Title>
          </NavTabs.Tab>
          <NavTabs.Panel value="a">conteúdo A</NavTabs.Panel>
          <NavTabs.Panel value="b">conteúdo B</NavTabs.Panel>
        </NavTabs>
      </>,
    );
    expect(screen.getByText("conteúdo A")).toBeTruthy();
    expect(screen.queryByText("conteúdo B")).toBeNull();

    const painel = screen.getByRole("tabpanel");
    const aba = screen.getByRole("tab", { selected: true });
    expect(painel.getAttribute("aria-labelledby")).toBe(aba.id);

    rerender(
      <NavTabs value="b" onValueChange={() => {}} aria-label="Abas">
        <NavTabs.Tab value="a">
          <NavTabs.Title>Primeira</NavTabs.Title>
        </NavTabs.Tab>
        <NavTabs.Tab value="b">
          <NavTabs.Title>Segunda</NavTabs.Title>
        </NavTabs.Tab>
        <NavTabs.Panel value="a">conteúdo A</NavTabs.Panel>
        <NavTabs.Panel value="b">conteúdo B</NavTabs.Panel>
      </NavTabs>,
    );
    expect(screen.getByText("conteúdo B")).toBeTruthy();
  });

  it("`Panel` não aparece dentro do tablist — ele é filho lógico, não item da tira", () => {
    render(
      <NavTabs value="a" onValueChange={() => {}} aria-label="Abas">
        <NavTabs.Tab value="a">
          <NavTabs.Title>Primeira</NavTabs.Title>
        </NavTabs.Tab>
        <NavTabs.Panel value="a">conteúdo</NavTabs.Panel>
      </NavTabs>,
    );
    // o painel é renderizado, mas não vira uma "aba" a mais
    expect(screen.getAllByRole("tab")).toHaveLength(1);
  });
});

describe("NavTabs — composição das ações", () => {
  it("sem `onClose` e sem `actions`, a aba não tem ação nenhuma", () => {
    render(<Tira />);
    expect(screen.queryByLabelText("Fechar aba")).toBeNull();
  });

  it("`onClose` liga as ações padrão (⋯ + ×)", () => {
    const onClose = vi.fn();
    render(
      <NavTabs value="a" onValueChange={() => {}} aria-label="Abas">
        <NavTabs.Tab value="a" onClose={onClose}>
          <NavTabs.Title>Primeira</NavTabs.Title>
        </NavTabs.Tab>
      </NavTabs>,
    );
    expect(screen.getByLabelText("Opções da aba")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Fechar aba"));
    expect(onClose).toHaveBeenCalled();
  });

  it("`actions` SUBSTITUI as padrão — é o escape hatch de ✓/✗", () => {
    const aceitar = vi.fn();
    render(
      <NavTabs value="a" onValueChange={() => {}} aria-label="Abas">
        <NavTabs.Tab
          value="a"
          onClose={() => {}}
          actions={
            <NavTabs.Action aria-label="Aceitar" tom="success" onClick={aceitar}>
              ok
            </NavTabs.Action>
          }
        >
          <NavTabs.Title>Primeira</NavTabs.Title>
        </NavTabs.Tab>
      </NavTabs>,
    );
    expect(screen.queryByLabelText("Fechar aba")).toBeNull();
    fireEvent.click(screen.getByLabelText("Aceitar"));
    expect(aceitar).toHaveBeenCalled();
  });

  it("clique na ação NÃO seleciona a aba", () => {
    const onValueChange = vi.fn();
    render(
      <NavTabs value="a" onValueChange={onValueChange} aria-label="Abas">
        <NavTabs.Tab value="b" onClose={() => {}}>
          <NavTabs.Title>Segunda</NavTabs.Title>
        </NavTabs.Tab>
      </NavTabs>,
    );
    fireEvent.click(screen.getByLabelText("Fechar aba"));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("NavTabs — a coluna de ações não reserva espaço", () => {
  const comAcoes = (props: Partial<React.ComponentProps<typeof NavTabs.Tab>> = {}) => {
    const { container } = render(
      <NavTabs value="a" onValueChange={() => {}} aria-label="Abas" {...(props.value ? {} : {})}>
        <NavTabs.Tab value="b" onClose={() => {}} {...props}>
          <NavTabs.Title>Segunda</NavTabs.Title>
        </NavTabs.Tab>
      </NavTabs>,
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
      <NavTabs value="a" onValueChange={() => {}} aria-label="Abas">
        <NavTabs.Tab value="a" onClose={() => {}}>
          <NavTabs.Title>Primeira</NavTabs.Title>
        </NavTabs.Tab>
      </NavTabs>,
    );
    expect(classes(container.querySelector('[role="tab"] .grid'))).toContain("grid-cols-[1fr]");
  });

  it("`actionsMode=persistent` abre a coluna de todas", () => {
    const { container } = render(
      <NavTabs value="a" onValueChange={() => {}} actionsMode="persistent" aria-label="Abas">
        <NavTabs.Tab value="b" onClose={() => {}}>
          <NavTabs.Title>Segunda</NavTabs.Title>
        </NavTabs.Tab>
      </NavTabs>,
    );
    expect(classes(container.querySelector('[role="tab"] .grid'))).toContain("grid-cols-[1fr]");
  });
});

describe("NavTabs — teclado", () => {
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

describe("NavTabs — densidade, fill e superfície", () => {
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
