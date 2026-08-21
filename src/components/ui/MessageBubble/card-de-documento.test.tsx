import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageBubble } from "./message-bubble";

/**
 * O card de documento cumpre o gesto que ele mesmo ensina.
 *
 * ## O defeito (medido em 2026-08-20, no Hub)
 *
 * O card dizia "Toque para baixar" e não tinha clique. O único `onClick` vivia
 * num botão de ~16px encostado na borda direita — que, em coluna estreita como
 * a do atendimento, fica FORA da área visível. Tocar no card não fazia nada, e
 * não havia erro: só um card que ignora o dedo.
 *
 * ## A regra
 *
 * Alvo grande. O card inteiro abre, e o rótulo só promete o gesto quando ele
 * existe — componente dumb sem `onMediaClick` não inventa navegação.
 */

const ABRIR = /abrir documento/i;

describe("MessageBubble — card de documento", () => {
  it("o CARD INTEIRO é o alvo do clique, não um ícone na borda", async () => {
    const aoClicar = vi.fn();
    const usuario = userEvent.setup();

    render(
      <MessageBubble
        side="received"
        body="contrato.pdf"
        createdAt={new Date("2026-08-20T20:37:00")}
        mediaType="document"
        mediaUrl="https://exemplo/contrato.pdf"
        onMediaClick={aoClicar}
      />,
    );

    // Pelo nome do arquivo — é onde o dedo cai, e antes essa área era inerte.
    await usuario.click(screen.getByText("contrato.pdf"));

    expect(
      aoClicar,
      "clicar no corpo do card tem de abrir; era o gesto que o próprio rótulo ensinava",
    ).toHaveBeenCalledTimes(1);
  });

  it("o card clicável é um <button> de verdade — teclado e leitor de tela", () => {
    render(
      <MessageBubble
        side="received"
        body="contrato.pdf"
        createdAt={new Date("2026-08-20T20:37:00")}
        mediaType="document"
        mediaUrl="https://exemplo/contrato.pdf"
        onMediaClick={() => {}}
      />,
    );

    const alvo = screen.getByRole("button", { name: ABRIR });
    expect(alvo.tagName).toBe("BUTTON");
  });

  it("sem onMediaClick NÃO vira botão e não promete gesto nenhum", () => {
    render(
      <MessageBubble
        side="received"
        body="contrato.pdf"
        createdAt={new Date("2026-08-20T20:37:00")}
        mediaType="document"
        mediaUrl="https://exemplo/contrato.pdf"
      />,
    );

    expect(screen.queryByRole("button", { name: ABRIR })).toBeNull();
    expect(
      screen.queryByText(/toque para/i),
      "sem handler, prometer 'toque' é a mentira que originou o defeito",
    ).toBeNull();
  });

  it("não aninha botão dentro de botão", () => {
    render(
      <MessageBubble
        side="received"
        body="contrato.pdf"
        createdAt={new Date("2026-08-20T20:37:00")}
        mediaType="document"
        mediaUrl="https://exemplo/contrato.pdf"
        onMediaClick={() => {}}
      />,
    );

    const card = screen.getByRole("button", { name: ABRIR });
    expect(
      card.querySelector("button"),
      "botão dentro de botão é HTML inválido — o ícone de baixar virou decoração",
    ).toBeNull();
  });
});
