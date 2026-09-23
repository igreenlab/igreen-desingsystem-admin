import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "./alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "./sheet";

/**
 * A largura dos overlays sai da escala de container do DS — não de valor arbitrário nem
 * dos nomes nativos do Tailwind.
 *
 * O que este gate impede de voltar (estado até 2026-09-23):
 *
 *   DialogContent       sm:max-w-md      → 768px  (a escala de página estava sobrescrita)
 *   SheetContent        sm:max-w-sm      → 640px
 *   AlertDialogContent  sm:max-w-[420px] → arbitrário, fora de modal-sm/md/lg
 *
 * O DS definia `modal-sm|md|lg` = 480/640/800 e não usava nenhum no próprio modal. Não
 * era decisão: o 768 não é degrau de escala nenhuma, e o 420 é hardcode que a primeira
 * regra crítica do CLAUDE.md proíbe.
 *
 * Assertivas em CLASSE, e não em pixel medido, de propósito: jsdom não resolve
 * `var(--container-modal-sm)`. O valor em px de cada degrau é gate do
 * `generated-artifacts` (tema × token), e a classe é o que liga um ao outro.
 */

const classeDo = (testId: string) => screen.getByTestId(testId).className;

describe("Dialog — largura vem da escala modal", () => {
  it("default é modal-sm (480px)", () => {
    render(
      <Dialog open>
        <DialogContent data-testid="c">
          <DialogTitle>t</DialogTitle>
          <DialogDescription>d</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(classeDo("c")).toContain("sm:max-w-modal-sm");
  });

  it.each([
    ["md", "sm:max-w-modal-md"],
    ["lg", "sm:max-w-modal-lg"],
  ] as const)("size=%s → %s", (size, esperado) => {
    render(
      <Dialog open>
        <DialogContent size={size} data-testid="c">
          <DialogTitle>t</DialogTitle>
          <DialogDescription>d</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(classeDo("c")).toContain(esperado);
  });

  it("não sobrou nenhum degrau da escala NATIVA na base", () => {
    render(
      <Dialog open>
        <DialogContent data-testid="c">
          <DialogTitle>t</DialogTitle>
          <DialogDescription>d</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    // `max-w-[calc(100%-2rem)]` (margem de viewport) é legítimo e fica.
    expect(classeDo("c")).not.toMatch(/(?<![\w-])sm:max-w-(xs|sm|md|lg|xl|2xl|3xl)(?![\w-])/);
  });
});

describe("Sheet — largura vem da escala drawer, e só nas laterais", () => {
  it("default é drawer-md (480px)", () => {
    render(
      <Sheet open>
        <SheetContent data-testid="c">
          <SheetTitle>t</SheetTitle>
          <SheetDescription>d</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    expect(classeDo("c")).toContain("sm:max-w-drawer-md");
  });

  it.each([
    ["sm", "sm:max-w-drawer-sm"],
    ["lg", "sm:max-w-drawer-lg"],
  ] as const)("size=%s → %s", (size, esperado) => {
    render(
      <Sheet open>
        <SheetContent size={size} data-testid="c">
          <SheetTitle>t</SheetTitle>
          <SheetDescription>d</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    expect(classeDo("c")).toContain(esperado);
  });

  it.each(["top", "bottom"] as const)(
    "side=%s NÃO recebe max-w (estreitaria o painel em vez de mudar a altura)",
    (side) => {
      render(
        <Sheet open>
          <SheetContent side={side} size="lg" data-testid="c">
            <SheetTitle>t</SheetTitle>
            <SheetDescription>d</SheetDescription>
          </SheetContent>
        </Sheet>,
      );
      expect(classeDo("c")).not.toContain("max-w-drawer");
    },
  );
});

describe("AlertDialog — sem valor arbitrário", () => {
  it("usa modal-sm no lugar do 420px hardcoded", () => {
    render(
      <AlertDialog open>
        <AlertDialogContent data-testid="c">
          <AlertDialogTitle>t</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    const cls = classeDo("c");
    expect(cls).toContain("sm:max-w-modal-sm");
    expect(cls).not.toContain("max-w-[420px]");
  });
});
