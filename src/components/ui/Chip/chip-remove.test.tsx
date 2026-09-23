import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Chip } from "./chip";

/**
 * `onRemove` existe porque a receita anterior do DS era
 * `<Chip onClick={remover}>Status: Ativo ×</Chip>` — o "×" digitado no texto, o chip
 * inteiro removendo, e sem jeito de ter "editar o filtro" e "tirar o filtro" no mesmo
 * chip. O que estes casos travam é a ANATOMIA: dois alvos, nunca botão dentro de botão.
 */

describe("Chip — onRemove", () => {
  it("sem onRemove nada muda (chip estático segue <span>, clicável segue <button>)", () => {
    const { rerender, container } = render(<Chip>Ativo</Chip>);
    expect(container.firstElementChild!.tagName).toBe("SPAN");
    rerender(<Chip onClick={() => {}}>Ativo</Chip>);
    expect(container.firstElementChild!.tagName).toBe("BUTTON");
  });

  it("com onRemove a pílula é <span> e o × é botão irmão — nunca aninhado", () => {
    const { container } = render(
      <Chip onClick={() => {}} onRemove={() => {}}>
        Status: Ativo
      </Chip>,
    );
    const pilula = container.firstElementChild!;
    expect(pilula.tagName).toBe("SPAN");
    // dois alvos, lado a lado, nenhum dentro do outro
    const botoes = [...pilula.querySelectorAll("button")];
    expect(botoes).toHaveLength(2);
    expect(botoes[0].contains(botoes[1])).toBe(false);
  });

  it("clicar no × chama só onRemove; clicar na label chama só onClick", async () => {
    const aoClicar = vi.fn();
    const aoRemover = vi.fn();
    render(
      <Chip onClick={aoClicar} onRemove={aoRemover}>
        Status: Ativo
      </Chip>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Remover Status: Ativo" }));
    expect(aoRemover).toHaveBeenCalledTimes(1);
    expect(aoClicar).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Status: Ativo" }));
    expect(aoClicar).toHaveBeenCalledTimes(1);
    expect(aoRemover).toHaveBeenCalledTimes(1);
  });

  it("chip só removível (sem onClick) não cria botão de label", () => {
    render(<Chip onRemove={() => {}}>Ativo</Chip>);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Remover Ativo" })).toBeTruthy();
  });

  it("nome acessível: derivado do texto, ou explícito quando o conteúdo não é texto", () => {
    const { rerender } = render(
      <Chip onRemove={() => {}}>
        <span>Período</span>
      </Chip>,
    );
    // sem texto simples, o default é genérico — por isso removeLabel existe
    expect(screen.getByRole("button", { name: "Remover" })).toBeTruthy();

    rerender(
      <Chip onRemove={() => {}} removeLabel="Remover filtro de período">
        <span>Período</span>
      </Chip>,
    );
    expect(screen.getByRole("button", { name: "Remover filtro de período" })).toBeTruthy();
  });
});
