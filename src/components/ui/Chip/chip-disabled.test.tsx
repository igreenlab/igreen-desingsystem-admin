import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Chip } from "./chip";

/**
 * Reportado pelo consumidor igreen-tickets ao migrar pra 0.67.0: com `onRemove`, o
 * `disabled` ia parar no `<span>` externo em vez dos botões. Em `<span>` ele não é
 * atributo válido — não desabilita nada, e ainda vaza pro DOM. Nas 9 tags de
 * configuração que eles desabilitavam durante o salvamento, o × continuava clicável e
 * a proteção teve que ir pro handler.
 *
 * O defeito nasceu junto com a anatomia do `onRemove` (v0.67.0): a pílula deixou de ser
 * `<button>` e ninguém repassou o `disabled` pra dentro.
 */
describe("Chip — disabled alcança os botões", () => {
  it("chip clicável simples (sem onRemove)", () => {
    render(<Chip onClick={() => {}} disabled>Ativo</Chip>);
    expect(screen.getByRole("button", { name: "Ativo" })).toHaveProperty("disabled", true);
  });

  it("com onRemove: a LABEL e o × ficam desabilitados", () => {
    render(
      <Chip onClick={() => {}} onRemove={() => {}} disabled>
        Status: Ativo
      </Chip>,
    );
    expect(screen.getByRole("button", { name: "Status: Ativo" })).toHaveProperty("disabled", true);
    expect(screen.getByRole("button", { name: "Remover Status: Ativo" })).toHaveProperty("disabled", true);
  });

  it("o × desabilitado não dispara onRemove", async () => {
    const aoRemover = vi.fn();
    render(<Chip onRemove={aoRemover} disabled>SP</Chip>);
    await userEvent.click(screen.getByRole("button", { name: "Remover SP" }));
    expect(aoRemover).not.toHaveBeenCalled();
  });

  it("o `disabled` NÃO vaza pro <span> da pílula", () => {
    const { container } = render(<Chip onRemove={() => {}} disabled>SP</Chip>);
    const pilula = container.firstElementChild!;
    expect(pilula.tagName).toBe("SPAN");
    expect(pilula.hasAttribute("disabled")).toBe(false);
  });
});
