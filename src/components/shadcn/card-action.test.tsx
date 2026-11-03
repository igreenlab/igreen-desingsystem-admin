import { createRef } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "./card";
import * as barrelShadcn from "./index";

/**
 * `CardAction` é a parte do shadcn oficial que nunca foi adaptada ao nosso `card.tsx`:
 * o slot de ação (botão, menu, badge) à direita do título. Sem ele o consumidor
 * reescrevia a posição na unha — e o `CardHeader` é `grid`, então `flex-row` não resolve
 * (o botão cai embaixo do título; está no gotcha do índice dos primitivos).
 *
 * Duas coisas a travar, e a segunda é a que importa pro "ausente = comportamento de
 * hoje": (1) a ação se posiciona numa 2ª coluna; (2) o header SÓ reserva essa coluna
 * quando há uma ação — `has-data-[slot=card-action]` é CSS, então o header sem ação
 * continua o mesmo grid de uma coluna que sempre foi.
 */

const COLUNA_DA_ACAO = "has-data-[slot=card-action]:grid-cols-[1fr_auto]";

describe("CardAction", () => {
  it("é exportado pelo barrel do subpath /shadcn (o canal npm do Card)", () => {
    // `toBeDefined` primeiro: dois `undefined` são `toBe` iguais, e o teste passaria
    // antes de a peça existir.
    expect(barrelShadcn.CardAction).toBeDefined();
    expect(barrelShadcn.CardAction).toBe(CardAction);
  });

  it("renderiza uma div marcada com data-slot, repassando children, ref e className", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <CardAction ref={ref} className="minha-classe">
        Editar
      </CardAction>,
    );
    const acao = screen.getByText("Editar");
    expect(acao.tagName).toBe("DIV");
    expect(acao.getAttribute("data-slot")).toBe("card-action");
    expect(acao.className).toContain("minha-classe");
    expect(ref.current).toBe(acao);
  });

  it("posiciona na 2ª coluna, ocupando as duas linhas do header, alinhada ao canto", () => {
    render(<CardAction>Editar</CardAction>);
    const classes = screen.getByText("Editar").className.split(/\s+/);
    for (const c of [
      "col-start-2",
      "row-span-2",
      "row-start-1",
      "self-start",
      "justify-self-end",
    ]) {
      expect(classes).toContain(c);
    }
  });

  it("o CardHeader reserva a coluna da ação (1fr + auto) — nas duas variantes", () => {
    const { rerender } = render(
      <CardHeader data-testid="h">
        <CardTitle>Lote</CardTitle>
        <CardAction>Editar</CardAction>
      </CardHeader>,
    );
    expect(screen.getByTestId("h").className.split(/\s+/)).toContain(COLUNA_DA_ACAO);

    rerender(
      <CardHeader data-testid="h" variant="banded">
        <CardTitle>Lote</CardTitle>
        <CardAction>Editar</CardAction>
      </CardHeader>,
    );
    expect(screen.getByTestId("h").className.split(/\s+/)).toContain(COLUNA_DA_ACAO);
  });

  it("a ação funciona dentro de um Card completo, sem alterar o resto do header", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Lote 42</CardTitle>
          <CardDescription>120 unidades</CardDescription>
          <CardAction>
            <button type="button">Editar</button>
          </CardAction>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByRole("button", { name: "Editar" }).closest("[data-slot=card-action]")).not.toBeNull();
    expect(screen.getByText("Lote 42")).toBeTruthy();
    expect(screen.getByText("120 unidades")).toBeTruthy();
  });
});

/**
 * O CAMINHO ANTIGO. Estes casos passam antes e depois da mudança — é o que prova que
 * adicionar o slot não mexeu no header de quem nunca o usa.
 */
describe("CardHeader sem CardAction — o que já existia não muda", () => {
  it("plain: continua grid de gap 2px com o padding horizontal do size", () => {
    render(
      <CardHeader data-testid="h">
        <CardTitle>Lote</CardTitle>
      </CardHeader>,
    );
    const classes = screen.getByTestId("h").className.split(/\s+/);
    for (const c of ["grid", "auto-rows-min", "items-start", "gap-gp-2xs", "px-pad-card-md"]) {
      expect(classes).toContain(c);
    }
  });

  it("banded: continua a faixa (fundo, divisória, quinas) com padding nos 4 lados", () => {
    render(
      <CardHeader data-testid="h" variant="banded">
        <CardTitle>Lote</CardTitle>
      </CardHeader>,
    );
    const classes = screen.getByTestId("h").className.split(/\s+/);
    for (const c of [
      "grid",
      "gap-gp-2xs",
      "bg-bg-subtle",
      "border-b",
      "border-border-subtle",
      "rounded-t-radius-base",
      "p-pad-card-md",
      "-mt-pad-card-md",
    ]) {
      expect(classes).toContain(c);
    }
  });

  it("não ganhou nenhuma coluna INCONDICIONAL: só a variante `has-` do slot, que é CSS", () => {
    render(
      <CardHeader data-testid="h">
        <CardTitle>Lote</CardTitle>
      </CardHeader>,
    );
    const colunasIncondicionais = screen
      .getByTestId("h")
      .className.split(/\s+/)
      .filter((c) => c.startsWith("grid-cols-"));
    expect(colunasIncondicionais).toEqual([]);
  });

  it("className do consumidor ainda vence — o caminho `flex` da ação à direita segue valendo", () => {
    render(
      <CardHeader data-testid="h" className="flex items-center justify-between">
        <CardTitle>Lote</CardTitle>
      </CardHeader>,
    );
    const classes = screen.getByTestId("h").className.split(/\s+/);
    // O gotcha documentado: com `flex` o tailwind-merge troca o `grid` — a receita
    // antiga (ação à direita por `flex`) não pode ter quebrado por causa do slot novo.
    expect(classes).toContain("flex");
    expect(classes).not.toContain("grid");
  });
});
