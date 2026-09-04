import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "./message-bubble";
import { messageBubbleStyles } from "./message-bubble.styles";

/**
 * Dois pedidos do atendimento (2026-09-03), os dois medidos em token:
 *
 * 1. O botão ⋮ sumia no tema escuro: ghost sem superfície, sobre bolha
 *    (`bg-surface`, L 0.225) e fundo (`bg-subtle`, 1% de branco) de luminância
 *    quase igual. Agora tem superfície própria, e a bolha recebida tem borda real.
 * 2. `origin="ai"` troca a borda pela da marca. A ORDEM importa: a variante
 *    `side` já escreve `border-border-subtle`, e o twMerge só deixa a da marca
 *    vencer porque `origin` é declarada depois — este teste trava isso.
 */

const classes = (value: string) => value.split(/\s+/).filter(Boolean);

describe("MessageBubble — origem e ações", () => {
  it("origin=ai troca a borda pela da marca, nos dois lados", () => {
    for (const side of ["received", "sent"] as const) {
      const bubble = classes(messageBubbleStyles({ side, origin: "ai" }).bubble());
      expect(bubble, side).toContain("border-border-brand-subtle");
      expect(bubble, side).not.toContain("border-border-subtle");
      expect(bubble, side).not.toContain("border-transparent");
    }
  });

  it("sem origin nada muda: recebida com borda sutil, enviada sem borda", () => {
    const received = classes(messageBubbleStyles({ side: "received" }).bubble());
    expect(received).toContain("border-border-subtle");
    expect(received).not.toContain("border-border-brand-subtle");

    const sent = classes(messageBubbleStyles({ side: "sent" }).bubble());
    expect(sent).toContain("border-transparent");
    expect(sent).not.toContain("border-border-brand-subtle");
  });

  it("o botão de ações tem superfície própria, e o hover do ghost não a apaga", () => {
    render(
      <MessageBubble
        side="received"
        body="oi"
        createdAt={new Date("2026-09-03T10:00:00")}
        actions={<button type="button">Responder</button>}
      />,
    );

    const trigger = classes(
      screen.getByRole("button", { name: /ações da mensagem/i }).className,
    );
    expect(trigger).toContain("bg-bg-emphasis");
    expect(trigger).toContain("shadow-sh-sm");
    expect(trigger).toContain("hover:bg-bg-accent-hover");
    expect(
      trigger,
      "o hover:bg-bg-muted do ghost (3% de branco no escuro) apagaria a pílula ao passar o mouse",
    ).not.toContain("hover:bg-bg-muted");
    expect(trigger).toContain("!rounded-full");
    expect(trigger, "glifo de 16px: size icon-xs").toContain("[&_svg]:size-[16px]");
  });
});
