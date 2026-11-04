import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import { Kpi } from "./kpi";

/**
 * Trava de identidade de DOM — a restrição que define a Task 18 (item 30).
 *
 * O botão de ajuda do `Kpi` saiu para `ui/HelpTip`, e o `Kpi` passou a consumir a
 * peça extraída. Refatoração não pode mudar pixel nem DOM: o HTML abaixo foi
 * **capturado do `Kpi` ANTES da extração** (render real, não escrito de cabeça) e
 * é comparado byte a byte com o de depois.
 *
 * É teste de caracterização: ele nasce verde por construção. O que prova que ele
 * é load-bearing é a mutação (L-064) — trocar uma classe em `help-tip.styles.ts`,
 * ou o `about` que compõe o `aria-label`, derruba exatamente este arquivo. A
 * prova está registrada no relatório da tarefa.
 *
 * ⚠️ Comparação de string inteira, não `toContain`. Um `includes` passaria com a
 * ordem das classes trocada, que é justamente o tipo de mudança silenciosa que
 * esta trava existe para pegar.
 */

/** Capturado do `Kpi` pré-extração. Não editar à mão: recapturar com um render. */
const HTML_COM_AJUDA =
  '<article class="relative flex min-w-0 flex-col gap-gp-lg rounded-radius-xl border border-border-subtle bg-bg-surface p-pad-3xl shadow-sh-sm">' +
  '<header class="flex items-start justify-between gap-gp-md">' +
  '<div class="flex min-w-0 items-start gap-gp-xs">' +
  '<h3 class="m-0 line-clamp-2 min-w-0 text-body-md font-semibold text-fg-default">SLA</h3>' +
  '<button data-state="closed" type="button" class="relative z-10 grid size-icon-md shrink-0 place-items-center rounded-radius-full text-fg-subtle transition-colors hover:text-fg-default focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand [&amp;>svg]:size-icon-xs" aria-label="Ajuda sobre SLA">' +
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-question-mark" aria-hidden="true">' +
  '<circle cx="12" cy="12" r="10"></circle>' +
  '<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>' +
  '<path d="M12 17h.01"></path>' +
  "</svg></button></div></header>" +
  '<div class="flex min-w-0 flex-col gap-gp-xs">' +
  '<div class="flex flex-wrap items-center gap-gp-md">' +
  '<span class="min-w-0 truncate text-fg-default [font-variant-numeric:tabular-nums] text-stat-md">98%</span>' +
  "</div></div></article>";

/** Idem, sem `helperText` — o caminho em que o botão NÃO existe. */
const HTML_SEM_AJUDA =
  '<article class="relative flex min-w-0 flex-col gap-gp-lg rounded-radius-xl border border-border-subtle bg-bg-surface p-pad-3xl shadow-sh-sm">' +
  '<header class="flex items-start justify-between gap-gp-md">' +
  '<div class="flex min-w-0 items-start gap-gp-xs">' +
  '<h3 class="m-0 line-clamp-2 min-w-0 text-body-md font-semibold text-fg-default">SLA</h3>' +
  "</div></header>" +
  '<div class="flex min-w-0 flex-col gap-gp-xs">' +
  '<div class="flex flex-wrap items-center gap-gp-md">' +
  '<span class="min-w-0 truncate text-fg-default [font-variant-numeric:tabular-nums] text-stat-md">98%</span>' +
  "</div></div></article>";

describe("Kpi — o DOM não mudou com a extração do HelpTip", () => {
  it("com helperText: HTML byte a byte igual ao de antes da extração", () => {
    const { container } = render(
      <Kpi
        label="SLA"
        value="98%"
        helperText="Percentual dentro do prazo."
        helperSide="right"
        helperMaxWidth="max-w-page-xs"
      />,
    );
    expect(container.innerHTML).toBe(HTML_COM_AJUDA);
  });

  it("sem helperText: HTML byte a byte igual, e nenhum botão aparece", () => {
    const { container } = render(<Kpi label="SLA" value="98%" />);
    expect(container.innerHTML).toBe(HTML_SEM_AJUDA);
  });

  /**
   * `helperSide` e `helperMaxWidth` não aparecem no HTML acima — o Radix só
   * materializa o conteúdo quando a dica abre. Sem este caso, as duas props
   * poderiam parar de ser repassadas e a trava de DOM continuaria verde.
   */
  it("helperSide e helperMaxWidth continuam chegando no conteúdo da dica", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    const { getByRole, findAllByText } = render(
      <Kpi
        label="SLA"
        value="98%"
        helperText="Percentual dentro do prazo."
        helperSide="right"
        helperMaxWidth="max-w-page-xs"
      />,
    );
    await user.hover(getByRole("button", { name: "Ajuda sobre SLA" }));
    await findAllByText("Percentual dentro do prazo.");
    // ⚠️ NÃO use `role="tooltip"`: ele vive no `<span>` sr-only do `aria-describedby`,
    // que não tem `data-side` nem as classes do conteúdo. O nó real é o do popper.
    const tip = document.querySelector<HTMLElement>(
      "[data-radix-popper-content-wrapper] > *",
    );
    expect(tip).not.toBeNull();
    expect(tip!.getAttribute("data-side")).toBe("right");
    expect(tip!.className).toContain("max-w-page-xs");
  });
});
