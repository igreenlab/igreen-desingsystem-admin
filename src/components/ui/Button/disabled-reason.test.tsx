/**
 * Task 13 (item 33 do Sólis) — `Button.disabledReason`.
 *
 * Um botão desabilitado hoje recebe `pointer-events-none`: não tem hover, não tem
 * foco, e por isso **não há onde pendurar a explicação** de por que ele está
 * desabilitado. O usuário vê o cinza e não sabe o que fazer com ele. É a forma da
 * **L-070** — um estado que apaga a própria saída: lá o `pointer-events-none` na raiz
 * matava o botão "Reabrir com template"; aqui ele mata a única superfície onde o
 * motivo caberia.
 *
 * Com `disabledReason` o botão troca o atributo `disabled` por `aria-disabled`, volta
 * a receber hover e foco, e uma tooltip diz o motivo.
 *
 * ⚠️ **`aria-disabled` NÃO barra nada.** O elemento continua clicável, focável e — se
 * for `type="submit"` — continua submetendo o formulário. Quem barra é o `onClick` do
 * `button.tsx`, na mão. Os dois testes do final (`onClick` e `submit`) são o que separa
 * esta prop de um buraco de segurança de formulário; se eles ficarem verdes por acidente,
 * a prop entrega um botão que parece desligado e age ligado.
 *
 * Os três primeiros testes travam o **caminho antigo**: 807 usos de `<Button` em 147
 * arquivos deste repo não passam a prop, e nenhum deles pode mudar.
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

/** Classe como TOKEN, não como substring: `includes` em string casaria demais. */
function temClasse(el: HTMLElement, classe: string) {
  return el.className.split(/\s+/).includes(classe);
}

describe("Button — caminho antigo (sem disabledReason)", () => {
  it("sem disabledReason, disabled continua pointer-events-none", () => {
    render(<Button disabled>Salvar</Button>);
    const btn = screen.getByRole("button", { name: "Salvar" });

    expect(btn.hasAttribute("disabled")).toBe(true);
    expect(btn.getAttribute("aria-disabled")).toBeNull();
    expect(temClasse(btn, "pointer-events-none")).toBe(true);
    expect(temClasse(btn, "opacity-50")).toBe(true);
  });

  it("sem disabledReason, o botão desabilitado não dispara onClick", async () => {
    const onClick = vi.fn();
    // `pointerEventsCheck: 0` — o userEvent se recusa a clicar em elemento com
    // `pointer-events-none` e o teste morreria no próprio guarda, sem exercitar o
    // componente. Queremos o clique REAL chegando (ou não) no handler.
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(
      <Button disabled onClick={onClick}>
        Salvar
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("sem disabledReason e habilitado, o onClick continua disparando", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Salvar</Button>);

    await user.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabledReason num botão HABILITADO não muda nada", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabledReason="Preencha o CNPJ" onClick={onClick}>
        Salvar
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Salvar" });

    expect(btn.getAttribute("aria-disabled")).toBeNull();
    expect(temClasse(btn, "opacity-50")).toBe(false);
    await user.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("Button — disabledReason", () => {
  it("com disabledReason, o botão troca `disabled` por `aria-disabled`", () => {
    render(
      <Button disabled disabledReason="Preencha o CNPJ antes de salvar">
        Salvar
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Salvar" });

    // Sem isto não há hover nem foco — e sem hover nem foco não há tooltip.
    expect(btn.hasAttribute("disabled")).toBe(false);
    expect(btn.getAttribute("aria-disabled")).toBe("true");
    expect(temClasse(btn, "pointer-events-none")).toBe(false);
    // Continua cinza e continua dizendo "não clique" pelo cursor.
    expect(temClasse(btn, "opacity-50")).toBe(true);
    expect(temClasse(btn, "cursor-not-allowed")).toBe(true);
  });

  it("com disabledReason, o hover abre a tooltip com o motivo", async () => {
    const user = userEvent.setup();
    render(
      <Button disabled disabledReason="Preencha o CNPJ antes de salvar">
        Salvar
      </Button>,
    );

    expect(screen.queryByText("Preencha o CNPJ antes de salvar")).toBeNull();

    await user.hover(screen.getByRole("button", { name: "Salvar" }));

    // `findAllBy` porque o Radix renderiza uma cópia visualmente escondida para o
    // leitor de tela além da bolha visível.
    const ditos = await screen.findAllByText("Preencha o CNPJ antes de salvar");
    expect(ditos.length).toBeGreaterThan(0);
  });

  it("com disabledReason, o FOCO pelo teclado também abre a tooltip", async () => {
    const user = userEvent.setup();
    render(
      <Button disabled disabledReason="Preencha o CNPJ antes de salvar">
        Salvar
      </Button>,
    );

    // Botão com atributo `disabled` fica FORA da ordem de tabulação — este tab só
    // alcança alguém porque o atributo virou `aria-disabled`.
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Salvar" }),
    );

    const ditos = await screen.findAllByText("Preencha o CNPJ antes de salvar");
    expect(ditos.length).toBeGreaterThan(0);
  });

  it("com aria-disabled, o onClick NAO dispara", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled disabledReason="Sem permissão" onClick={onClick}>
        Excluir
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "Excluir" }));
    expect(onClick).not.toHaveBeenCalled();

    // E pelo teclado também: o `<button>` converte Enter/Espaço em clique.
    screen.getByRole("button", { name: "Excluir" }).focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("com aria-disabled, o clique não vaza pro container clicável", async () => {
    // Regressão sutil: botão com atributo `disabled` **não dispara clique nenhum**,
    // então o container nunca via o evento. Com `aria-disabled` o clique existe e
    // borbulha — um botão "Excluir" cinza dentro de uma linha de tabela clicável
    // abriria o registro. Quem segura é o `stopPropagation`.
    const onClickPai = vi.fn();
    const user = userEvent.setup();
    render(
      <div onClick={onClickPai}>
        <Button disabled disabledReason="Sem permissão">
          Excluir
        </Button>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "Excluir" }));
    expect(onClickPai).not.toHaveBeenCalled();
  });

  it("com aria-disabled, o type=submit NAO submete o formulário", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const user = userEvent.setup();
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" disabled disabledReason="Sem permissão">
          Enviar
        </Button>
      </form>,
    );

    await user.click(screen.getByRole("button", { name: "Enviar" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("loading + disabledReason: o motivo também vale para o estado de loading", () => {
    render(
      <Button loading disabledReason="Aguarde o envio terminar">
        Enviar
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Enviar" });

    expect(btn.hasAttribute("disabled")).toBe(false);
    expect(btn.getAttribute("aria-disabled")).toBe("true");
  });
});
