import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

/**
 * A geometria do header do Dialog e as correções funcionais da #333 são coisas
 * SEPARADAS, e este arquivo existe pra elas não voltarem coladas.
 *
 * A #333 entregou 5 mudanças num pacote só: teto de altura + rolagem, o popover
 * portalado que fechava o dialog, e mais três de geometria (X reposicionado, título com
 * a entrelinha do preset, header com reserva à direita). As duas primeiras consertam
 * defeito; as três últimas eram ajuste visual, e custaram 8px de header em todo diálogo
 * de título curto — o caso comum. O mantenedor comparou com o publicado e pediu a
 * geometria antiga de volta, mantendo as correções.
 *
 * Se alguém for "arrumar o alinhamento do X" de novo, que seja com este teste na frente.
 */

const abrir = (props: Record<string, unknown> = {}) =>
  render(
    <Dialog open>
      <DialogContent data-testid="c" {...props}>
        <DialogHeader data-testid="h">
          <DialogTitle data-testid="t">Editar cliente</DialogTitle>
          <DialogDescription>Ajuste os dados do cadastro.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>,
  );

describe("Dialog — as correções funcionais da #333 ficam", () => {
  it("teto de altura + rolagem interna no conteúdo", () => {
    abrir();
    const cls = screen.getByTestId("c").className;
    expect(cls).toContain("max-h-[calc(100dvh-2rem)]");
    expect(cls).toContain("overflow-y-auto");
  });
});

describe("Dialog — a geometria é a de sempre", () => {
  it("o X fica em right-4 top-4, sem caixa de 24px", () => {
    abrir();
    const x = screen.getByRole("button", { name: "Close" });
    expect(x.className).toContain("right-4");
    expect(x.className).toContain("top-4");
    // `size-comp-xs` (24px) centrava o X na 1ª linha do título e o empurrava 12px
    // pra dentro e pra baixo.
    expect(x.className).not.toContain("size-comp-xs");
  });

  it("o título mantém leading-none — 8px a menos de header que o preset", () => {
    abrir();
    expect(screen.getByTestId("t").className).toContain("leading-none");
  });

  it("o DialogHeader não reserva faixa à direita", () => {
    abrir();
    // A reserva era aplicada inclusive com `hideClose`, onde não há X que a justifique,
    // e estreitar o título o faz quebrar antes — mais altura, o oposto do pretendido.
    expect(screen.getByTestId("h").className).not.toContain("pr-pad-6xl");
  });

  it("quem precisar da reserva pede por className, e ela sobrevive ao merge", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader data-testid="h" className="pr-pad-6xl">
            <DialogTitle>t</DialogTitle>
            <DialogDescription>d</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByTestId("h").className).toContain("pr-pad-6xl");
  });
});
