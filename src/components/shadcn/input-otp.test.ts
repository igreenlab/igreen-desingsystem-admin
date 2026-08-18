import { describe, it, expect } from "vitest";
import { slotVariants } from "./input-otp";
import { inputVariants } from "./input";

/**
 * Paridade do `InputOTP` com o `Input` de texto, e as variantes do slot.
 *
 * ## Por que ISTO é teste e não conferência visual
 *
 * Tentei validar no browser em 2026-08-18 e consegui medir **altura, borda e fundo em
 * repouso** — batem. O que **não** consegui foi o estado de foco: o slot ativo do
 * `input-otp` depende de foco REAL no input escondido, e no browser automatizado
 * `.focus()` programático não registra (nem com `FocusEvent` disparado à mão) porque o
 * pane não está compondo frames. O caractere digitado aparece no slot — logo o componente
 * reage —, mas `isActive` nunca acende.
 *
 * Então o par (foco, state) fica coberto aqui, onde é função pura: `slotVariants` é
 * exportado justamente pra isso.
 *
 * ## O que este arquivo protege de verdade
 *
 * A paridade de altura foi um PEDIDO explícito: "ter o mesmo tamanho/altura dos input
 * text que consomem tokens de form-height". Sem gate, ela se desfaz na primeira vez que
 * alguém mexer nos sizes de um dos dois — e o sintoma é sutil (um OTP 4px mais baixo que
 * o campo ao lado no mesmo formulário), do tipo que passa em review.
 *
 * O teste não repete os valores: ele **compara os dois `cva`**. Se o `Input` mudar de
 * `min-h-form-lg` pra outro degrau, este teste falha — que é o ponto.
 */

/** Extrai a classe de altura/tamanho emitida, sem depender da ordem do cva. */
const classeDeTamanho = (s: string) =>
  s.split(/\s+/).find((c) => /^(size|min-h)-form-/.test(c));

/** O degrau `form-*` puro (`xs`, `sm`, `md`, `lg`) — o que precisa coincidir. */
const degrau = (s: string | undefined) => s?.replace(/^(size|min-h)-form-/, "");

const SIZES = ["xxs", "xs", "sm", "md"] as const;

describe("InputOTP — paridade de altura com o Input de texto", () => {
  it.each(SIZES)("size %s usa o MESMO degrau form-* que o Input", (size) => {
    const otp = classeDeTamanho(slotVariants({ size }));
    const input = classeDeTamanho(inputVariants({ size }));

    expect(otp, `o slot do OTP não emitiu classe de tamanho no size ${size}`).toBeDefined();
    expect(input, `o Input não emitiu classe de tamanho no size ${size}`).toBeDefined();
    expect(
      degrau(otp),
      `size="${size}": OTP=${otp} vs Input=${input}. Os dois têm de cair no mesmo degrau ` +
        `form-*, senão um OTP e um campo de texto no mesmo formulário ficam com alturas ` +
        `diferentes — é o pedido que originou esta API`,
    ).toBe(degrau(input));
  });

  it("o slot é QUADRADO (size-*), não só altura (min-h-*)", () => {
    // `size-form-lg` define height E width. Com `min-h-form-lg` o slot viraria um
    // retângulo do tamanho do conteúdo — 1 caractere — e a fileira ficaria estreita.
    for (const size of SIZES) {
      expect(classeDeTamanho(slotVariants({ size })), `size ${size}`).toMatch(/^size-form-/);
    }
  });

  it("cobre os 4 sizes do Input — nem a mais, nem a menos", () => {
    // Se o Input ganhar um 5º degrau, este teste falha e alguém decide se o OTP
    // acompanha. Sem isso, a divergência entra em silêncio.
    for (const size of SIZES) {
      expect(() => inputVariants({ size })).not.toThrow();
      expect(() => slotVariants({ size })).not.toThrow();
    }
  });
});

describe("InputOTP — foco e states (o que o browser não mostrou)", () => {
  it("slot ativo em state default ganha borda VERDE + anel, como o focus do Input", () => {
    const cls = slotVariants({ active: true, state: "default" });
    expect(cls).toContain("border-border-brand");
    expect(cls).toContain("shadow-sh-ring");
  });

  it("slot inativo NÃO tem borda de marca", () => {
    const cls = slotVariants({ active: false, state: "default" });
    expect(cls).not.toContain("border-border-brand");
    expect(cls).toContain("border-border-input");
  });

  it.each([
    ["error", "border-border-danger-muted", "shadow-sh-ring-danger"],
    ["warning", "border-border-warning-muted", "shadow-sh-ring-warning"],
    ["success", "border-border-success-muted", "shadow-sh-ring-success"],
  ] as const)("state %s: borda semântica em repouso, anel próprio no foco", (state, borda, anel) => {
    expect(slotVariants({ state }), "borda em repouso").toContain(borda);

    const focado = slotVariants({ state, active: true });
    expect(focado, "o anel de foco troca de cor").toContain(anel);
    // A borda semântica PERMANECE no foco: o usuário precisa continuar vendo que o
    // campo está inválido enquanto digita. Se o brand sobrescrevesse, o erro
    // desapareceria exatamente no momento da correção.
    expect(focado, "a borda de erro não pode virar verde no foco").toContain(borda);
    expect(focado).not.toContain("border-border-brand");
  });

  it("os states usam o MESMO token semântico de borda que o Input", () => {
    /**
     * Compara só o token SEMÂNTICO (`-danger-muted` etc), não a lista inteira.
     *
     * Os dois componentes chegam ao mesmo resultado por caminhos diferentes, e isso é
     * legítimo: o `Input` mantém `border-border-input` na **base** e conta com o
     * `tailwind-merge` do `cn()` pra deixar o state sobrescrever; o slot do OTP escopa a
     * borda dentro do próprio `state`, então em `error` ele emite **só** o token de erro.
     * Minha primeira versão deste teste exigia que o OTP também emitisse
     * `border-border-input` em erro — exigência sem sentido, e o teste falhou por estar
     * errado, não o código.
     */
    const semantico = (cls: string) =>
      cls.split(/\s+/).find((c) => /^border-border-(danger|warning|success)-muted$/.test(c));

    for (const state of ["error", "warning", "success"] as const) {
      const doInput = semantico(inputVariants({ state }));
      const doOtp = semantico(slotVariants({ state }));
      expect(doOtp, `state ${state}: o Input usa ${doInput}`).toBe(doInput);
    }
  });
});

describe("InputOTP — as 4 variantes visuais", () => {
  it("connected: 3 lados por slot, 4º no primeiro — sem borda dupla entre vizinhos", () => {
    const cls = slotVariants({ variant: "connected" });
    expect(cls).toContain("border-y");
    expect(cls).toContain("border-r");
    expect(cls).toContain("first:border-l");
  });

  it("outlined: borda completa em cada slot", () => {
    expect(slotVariants({ variant: "outlined" })).toMatch(/(^|\s)border(\s|$)/);
  });

  it("filled: fundo próprio e borda transparente", () => {
    const cls = slotVariants({ variant: "filled" });
    expect(cls).toContain("border-transparent");
    expect(cls).toContain("bg-bg-muted");
  });

  it("underline: só a linha de baixo, sem fundo e sem radius", () => {
    const cls = slotVariants({ variant: "underline" });
    expect(cls).toContain("border-b-2");
    expect(cls).toContain("border-0");
    expect(cls).toContain("bg-transparent");
    expect(cls, "o radius das pontas do connected vem do grupo — aqui tem de ser anulado").toContain(
      "rounded-none",
    );
  });

  it("connected continua sendo o DEFAULT — a mudança não é breaking", () => {
    // Quem já usava <InputOTP> sem props tem de continuar vendo os slots colados.
    const semProps = slotVariants({});
    expect(semProps).toContain("border-y");
    expect(semProps).toContain("size-form-lg");
    expect(semProps).toContain("border-border-input");
  });
});
