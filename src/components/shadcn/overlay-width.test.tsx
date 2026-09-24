import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "./alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "./sheet";

/**
 * A largura dos overlays sai da escala de container do DS — não de valor arbitrário nem
 * dos nomes nativos do Tailwind.
 *
 * O que mudou em 2026-09-23 foi o NOME, não o tamanho:
 *
 *   DialogContent       sm:max-w-md      → sm:max-w-modal-lg  (768px, idêntico)
 *   SheetContent        sm:max-w-sm      → sm:max-w-drawer-lg (640px, idêntico)
 *   AlertDialogContent  sm:max-w-[420px] → sm:max-w-modal-xs  (420px, idêntico)
 *
 * Os nomes antigos eram degraus da escala de PÁGINA que estava sobrescrevendo o
 * Tailwind — ninguém tinha escolhido 768 ou 640, eles apenas caíam ali. O 420 era
 * hardcode, que a primeira regra crítica do CLAUDE.md proíbe. A escala `modal-*` foi
 * reconstruída a partir DESTAS larguras (420/480/640/768) em vez de manter o
 * 480/640/800 inventado, que nenhum overlay do DS usava.
 *
 * Assertivas em CLASSE, e não em pixel medido, de propósito: jsdom não resolve
 * `var(--container-modal-sm)`. O valor em px de cada degrau é gate do
 * `generated-artifacts` (tema × token), e a classe é o que liga um ao outro.
 */

const classeDo = (testId: string) => screen.getByTestId(testId).className;

describe("Dialog — largura vem da escala modal", () => {
  it("default é modal-lg (768px) — a largura que o Dialog sempre teve", () => {
    render(
      <Dialog open>
        <DialogContent data-testid="c">
          <DialogTitle>t</DialogTitle>
          <DialogDescription>d</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(classeDo("c")).toContain("sm:max-w-modal-lg");
  });

  it.each([
    ["sm", "sm:max-w-modal-sm"],
    ["md", "sm:max-w-modal-md"],
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
  it("default é drawer-lg (640px) — a largura que o Sheet sempre teve", () => {
    render(
      <Sheet open>
        <SheetContent data-testid="c">
          <SheetTitle>t</SheetTitle>
          <SheetDescription>d</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    expect(classeDo("c")).toContain("sm:max-w-drawer-lg");
  });

  it.each([
    ["sm", "sm:max-w-drawer-sm"],
    ["md", "sm:max-w-drawer-md"],
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
  it("usa modal-xs — o MESMO 420px, agora como token", () => {
    render(
      <AlertDialog open>
        <AlertDialogContent data-testid="c">
          <AlertDialogTitle>t</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    const cls = classeDo("c");
    expect(cls).toContain("sm:max-w-modal-xs");
    expect(cls).not.toContain("max-w-[420px]");
  });
});
