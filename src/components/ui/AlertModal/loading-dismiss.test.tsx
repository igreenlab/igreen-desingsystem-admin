import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { AlertModal } from "./alert-modal";

/**
 * `loading` tem de travar TODOS os caminhos de dismiss — inclusive o ESC.
 *
 * O `USAGE.md` promete duas coisas sobre `loading`: *"trava interação durante async"* e
 * *"modal **não fecha automaticamente** — consumer chama `onOpenChange(false)` após async
 * terminar"*. O componente cumpria em 3 dos 4 caminhos:
 *
 *   botão Confirmar → `e.preventDefault()` se loading
 *   botão Cancelar  → `disabled={loading}`
 *   botão X         → `disabled={loading}`
 *   ESC             → passava DIRETO pro Radix, sem checar loading   ← o que faltava
 *
 * Os três primeiros mostram que o autor pensou no estado; o ESC escapou por ser o único
 * que não passa por um botão. Consequência num delete assíncrono: o usuário aperta ESC, o
 * modal desaparece, e a requisição continua em voo — a exclusão acontece depois, sem
 * nenhum feedback ligado à ação.
 *
 * ⚠️ Por que este teste é em jsdom e não no browser: a medição no browser foi
 * **inconclusiva** — o painel não estava recebendo input (um listener de `keydown` no
 * document registrou ZERO eventos enquanto a ferramenta reportava "pressed Escape"). O
 * `userEvent` não depende disso e vira regressão permanente.
 */

function Palco({ loading }: { loading: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <AlertModal
        open={open}
        onOpenChange={setOpen}
        tone="danger"
        title="Excluir cliente?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir cliente"
        loading={loading}
      />
      <span data-testid="estado">{open ? "aberto" : "fechado"}</span>
    </>
  );
}

describe("AlertModal — `loading` trava o dismiss", () => {
  it("ESC NÃO fecha enquanto loading — a promessa do USAGE", async () => {
    const user = userEvent.setup();
    render(<Palco loading />);
    expect(screen.getByRole("alertdialog")).toBeTruthy();

    await user.keyboard("{Escape}");

    expect(screen.getByTestId("estado").textContent).toBe("aberto");
    expect(screen.queryByRole("alertdialog")).not.toBeNull();
  });

  it("…e FECHA quando não está loading — o controle que valida o teste acima", async () => {
    // Sem este par, o teste de cima passaria por um ESC que nunca chega (foi exatamente
    // como a medição no browser me enganou).
    const user = userEvent.setup();
    render(<Palco loading={false} />);
    expect(screen.getByRole("alertdialog")).toBeTruthy();

    await user.keyboard("{Escape}");

    expect(screen.getByTestId("estado").textContent).toBe("fechado");
  });

  it("os outros 3 caminhos seguem travados no loading", async () => {
    render(<Palco loading />);
    const dialog = screen.getByRole("alertdialog");
    const desabilitados = Array.from(dialog.querySelectorAll("button")).filter(
      (b) => (b as HTMLButtonElement).disabled,
    );
    // Cancelar + X desabilitados; o Confirmar fica habilitado com spinner (é o alvo do
    // preventDefault, não do disabled — o Button em `loading` já bloqueia o clique).
    expect(desabilitados.length).toBeGreaterThanOrEqual(2);
  });

  it("onOpenChange do consumidor não é chamado por ESC durante o loading", async () => {
    // O guard tem de impedir a CHAMADA, não só o efeito: consumidor que faz
    // `onOpenChange={(o) => { setOpen(o); telemetria(o); }}` não pode receber o evento.
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <AlertModal
        open
        onOpenChange={onOpenChange}
        title="Excluir cliente?"
        loading
      />,
    );

    await user.keyboard("{Escape}");

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("sem loading, o ESC chega no onOpenChange com false", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<AlertModal open onOpenChange={onOpenChange} title="Excluir cliente?" />);

    await user.keyboard("{Escape}");

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
