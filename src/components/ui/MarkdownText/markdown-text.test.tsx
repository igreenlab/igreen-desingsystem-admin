import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MarkdownText } from "./markdown-text";

/* Parser do MarkdownText: semântica de formatação + resistência a input hostil.
 * O componente renderiza conteúdo RECEBIDO (MessageBubble, ConversationListItem),
 * então o corpo da mensagem é entrada não-confiável. */

describe("MarkdownText — formatação", () => {
  it("aplica bold, italic e strike", () => {
    const { container } = render(<MarkdownText>{"*b* _i_ ~s~"}</MarkdownText>);
    expect(container.querySelector("strong")?.textContent).toBe("b");
    expect(container.querySelector("em")?.textContent).toBe("i");
    expect(container.querySelector("span")?.textContent).toBe("s");
  });

  it("preserva a ordem de leitura em torno dos marcadores", () => {
    const { container } = render(<MarkdownText>{"antes *meio* depois"}</MarkdownText>);
    expect(container.textContent).toBe("antes meio depois");
  });

  it("aninha italic dentro de bold (bold tem precedência)", () => {
    const { container } = render(<MarkdownText>{"*b _i_ b*"}</MarkdownText>);
    const strong = container.querySelector("strong");
    expect(strong?.textContent).toBe("b i b");
    expect(strong?.querySelector("em")?.textContent).toBe("i");
  });

  it("code é opaco — não recebe formatação interna", () => {
    const { container } = render(<MarkdownText>{"`*nao* bold`"}</MarkdownText>);
    expect(container.querySelector("code")?.textContent).toBe("*nao* bold");
    expect(container.querySelector("strong")).toBeNull();
  });

  it("linkifica http e www com rel de segurança", () => {
    const { container } = render(
      <MarkdownText>{"veja https://igreen.com.br e www.exemplo.com"}</MarkdownText>,
    );
    const links = [...container.querySelectorAll("a")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "https://igreen.com.br",
      "https://www.exemplo.com",
    ]);
    for (const a of links) {
      expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });

  it("não interpreta HTML cru — tag digitada vira texto literal", () => {
    const { container } = render(
      <MarkdownText>{'<img src=x onerror="alert(1)">'}</MarkdownText>,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toBe('<img src=x onerror="alert(1)">');
  });

  it("javascript: não é linkificado (o URL_RE só casa http(s) e www.)", () => {
    const { container } = render(
      <MarkdownText>{"javascript:alert(document.cookie)"}</MarkdownText>,
    );
    expect(container.querySelector("a")).toBeNull();
  });
});

describe("MarkdownText — input hostil (DoS)", () => {
  /* Regressão: o parser era recursivo e gastava um frame de pilha por marcador,
   * então ~5.000 marcadores (15 KB — cabe numa mensagem de WhatsApp, cujo limite
   * é 65.536 chars) estouravam com "Maximum call stack size exceeded" no meio do
   * render. Mensagem persistida ⇒ a conversa quebrava a cada abertura. */
  it.each([5_000, 20_000])("não estoura a pilha com %i marcadores irmãos", (n) => {
    const payload = "*a*".repeat(n);
    const { container } = render(<MarkdownText>{payload}</MarkdownText>);
    expect(container.querySelectorAll("strong").length).toBe(n);
  });

  it("não estoura a pilha com marcadores profundamente aninhados", () => {
    const depth = 5_000;
    const payload = "*_~".repeat(depth) + "a" + "~_*".repeat(depth);
    const { container } = render(<MarkdownText>{payload}</MarkdownText>);
    expect(container.textContent).toContain("a");
  });

  it("aguenta uma mensagem no tamanho máximo do WhatsApp", () => {
    const payload = "*a*".repeat(Math.floor(65_536 / 3));
    expect(() => render(<MarkdownText>{payload}</MarkdownText>)).not.toThrow();
  });
});
