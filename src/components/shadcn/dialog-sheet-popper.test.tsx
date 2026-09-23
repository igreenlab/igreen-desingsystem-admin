import { describe, it, expect, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState, type ComponentType, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./dialog";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "./sheet";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";

/**
 * Clique dentro de um overlay Radix portalado (Popover, Select, DropdownMenu…) NÃO pode
 * fechar o Dialog/Sheet por baixo.
 *
 * O Radix decide "dentro × fora" pela árvore REACT: o `onPointerDownCapture` do conteúdo
 * marca o clique como interno quando o evento atravessa a subárvore dele. Um popover que
 * é filho React do dialog passa por ali e está coberto. Um que NÃO é — montado fora da
 * subárvore do dialog, como aqui — chega como pointerdown "fora", e o dialog fecha no meio
 * da interação. Veio do consumidor igreen-tickets, que carregava a proteção nas cópias
 * locais destes dois primitivos.
 *
 * O Popover abaixo é irmão do dialog de propósito: é o único jeito de exercitar o caminho
 * que o Radix não cobre. Os pares "…e FECHA" são o controle — sem eles, o teste de cima
 * passaria por um pointerdown que nunca chegou ao listener.
 */

type Casca = ComponentType<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPointerDownOutside?: (event: Event) => void;
  children: ReactNode;
}>;

const DialogCasca: Casca = ({ open, onOpenChange, onPointerDownOutside, children }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent onPointerDownOutside={onPointerDownOutside}>
      <DialogTitle>Editar ticket</DialogTitle>
      <DialogDescription>Formulário com campos que abrem overlay.</DialogDescription>
      {children}
    </DialogContent>
  </Dialog>
);

const SheetCasca: Casca = ({ open, onOpenChange, onPointerDownOutside, children }) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent onPointerDownOutside={onPointerDownOutside}>
      <SheetTitle>Filtros</SheetTitle>
      <SheetDescription>Painel com campos que abrem overlay.</SheetDescription>
      {children}
    </SheetContent>
  </Sheet>
);

function Palco({
  Casca,
  onPointerDownOutside,
}: {
  Casca: Casca;
  onPointerDownOutside?: (event: Event) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Casca open={open} onOpenChange={setOpen} onPointerDownOutside={onPointerDownOutside}>
        <span>conteúdo</span>
      </Casca>
      <Popover open>
        <PopoverAnchor />
        <PopoverContent>
          <button type="button">opção do popover</button>
        </PopoverContent>
      </Popover>
      <div data-testid="fora">fora</div>
      <span data-testid="estado">{open ? "aberto" : "fechado"}</span>
    </>
  );
}

const umTick = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)));

/** O Radix registra o listener de pointerdown num `setTimeout(0)` após montar. */
const esperarListener = umTick;

/**
 * Clique COMPLETO, não só o pointerdown. Desde o dismissable-layer 1.1.13 (react-dialog
 * 1.1.17 passa `deferPointerDownOutside`), o dismiss do botão esquerdo espera o `click` —
 * um `pointerDown` sozinho não fecha nada, e o par de controle abaixo passaria a mentir.
 */
async function clicar(el: Element) {
  fireEvent.pointerDown(el, { button: 0 });
  fireEvent.mouseDown(el, { button: 0 });
  fireEvent.pointerUp(el, { button: 0 });
  fireEvent.mouseUp(el, { button: 0 });
  fireEvent.click(el, { button: 0 });
  await umTick();
}

describe.each([
  ["DialogContent", DialogCasca],
  ["SheetContent", SheetCasca],
] as const)("%s — clique em overlay Radix portalado", (_nome, Casca) => {
  it("NÃO fecha ao clicar dentro de [data-radix-popper-content-wrapper]", async () => {
    render(<Palco Casca={Casca} />);
    await esperarListener();

    const opcao = screen.getByRole("button", { name: "opção do popover", hidden: true });
    expect(opcao.closest("[data-radix-popper-content-wrapper]")).not.toBeNull();

    await clicar(opcao);

    expect(screen.getByTestId("estado").textContent).toBe("aberto");
  });

  it("…e FECHA ao clicar fora de verdade — o controle que valida o teste acima", async () => {
    render(<Palco Casca={Casca} />);
    await esperarListener();

    await clicar(screen.getByTestId("fora"));

    expect(screen.getByTestId("estado").textContent).toBe("fechado");
  });

  it("preserva o onPointerDownOutside do consumidor no clique fora, e não o chama no popover", async () => {
    const handler = vi.fn();
    render(<Palco Casca={Casca} onPointerDownOutside={handler} />);
    await esperarListener();

    await clicar(screen.getByRole("button", { name: "opção do popover", hidden: true }));
    expect(handler).not.toHaveBeenCalled();

    await clicar(screen.getByTestId("fora"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("o consumidor ainda consegue bloquear o fechamento com preventDefault", async () => {
    render(
      <Palco Casca={Casca} onPointerDownOutside={(event) => event.preventDefault()} />,
    );
    await esperarListener();

    await clicar(screen.getByTestId("fora"));

    expect(screen.getByTestId("estado").textContent).toBe("aberto");
  });
});
