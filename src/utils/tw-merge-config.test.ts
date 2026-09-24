/**
 * tw-merge-config.test.ts — o merge do DS conhece os tokens do DS?
 *
 * Duas perguntas, porque uma só não basta:
 *
 * 1. COBERTURA — a lista registrada bate 1:1 com o token-fonte? Token novo que ninguém
 *    registra aqui vira conflito não-resolvido no dia em que alguém tentar sobrescrever.
 * 2. COMPORTAMENTO — o merge REALMENTE resolve? Lista certa com `theme`/`classGroup`
 *    errado passa na (1) e falha na tela. É a L-064: o teste tem que exercitar o caminho
 *    de produção (`cn`), não uma reimplementação.
 *
 * O defeito que originou o gate: `max-w-modal-sm` não vencia NADA — nem
 * `sm:max-w-[420px]` da base do AlertDialog, nem `max-w-modal-lg`, token do DS contra
 * token do DS. As duas classes sobreviviam e a ordem do CSS decidia. Sem erro em lugar
 * nenhum. O consumidor igreen-tickets prefixou 51 overlays com `sm:` pra contornar.
 */
import { describe, expect, it } from "vitest";

import { componentSizing } from "../../tokens/brands/default/components/sizing";
import { typography } from "../../tokens/brands/default/semantic/typography";
import { cn } from "@/lib/utils";
import { DS_CONTAINER_SCALE, DS_TYPOGRAPHY_PRESETS } from "./tw-merge-config";

/**
 * `full` e `prose` têm nome E valor idênticos aos do Tailwind nativo — já são
 * reconhecidos sem registro. Qualquer outra ausência é drift.
 */
const CONTAINER_NATIVOS = new Set(["full", "prose"]);

describe("cobertura — a lista registrada bate com o token-fonte", () => {
  it("escala de container", () => {
    const doToken = Object.keys(componentSizing.container)
      .filter((k) => !CONTAINER_NATIVOS.has(k))
      .sort();
    expect([...DS_CONTAINER_SCALE].sort()).toEqual(doToken);
  });

  it("presets tipográficos", () => {
    expect([...DS_TYPOGRAPHY_PRESETS].sort()).toEqual(Object.keys(typography).sort());
  });
});

describe("comportamento — o cn() resolve o conflito de verdade", () => {
  it.each([
    // [entrada, vencedor esperado] — o segundo argumento é o override do consumidor
    ["max-w-page-md max-w-modal-sm", "max-w-modal-sm"],
    ["max-w-modal-sm max-w-modal-lg", "max-w-modal-lg"],
    ["sm:max-w-[420px] sm:max-w-modal-sm", "sm:max-w-modal-sm"],
    ["w-drawer-md w-modal-lg", "w-modal-lg"],
    ["min-w-sidebar-sm min-w-sidebar-lg", "min-w-sidebar-lg"],
    // typography (L-016) e os prefixos que já existiam — não podem regredir
    ["text-body-sm text-body-md", "text-body-md"],
    ["p-pad-4xl p-0", "p-0"],
    ["gap-gp-md gap-gp-2xl", "gap-gp-2xl"],
  ])("%s → %s", (entrada, esperado) => {
    expect(cn(entrada)).toBe(esperado);
  });

  it("NÃO funde o que tem variante diferente (base não conflita com sm:)", () => {
    // Controle: se isto começar a fundir, o merge virou agressivo demais.
    expect(cn("max-w-modal-sm sm:max-w-modal-lg")).toBe("max-w-modal-sm sm:max-w-modal-lg");
  });

  it("reprova um token de container que NÃO está registrado (veja falhar antes de confiar)", () => {
    // `max-w-inventado-sm` não existe no tema nem na lista: as duas classes sobrevivem.
    // É exatamente o que acontecia com `max-w-modal-*` antes deste commit.
    expect(cn("max-w-page-md max-w-inventado-sm")).toBe("max-w-page-md max-w-inventado-sm");
  });
});
