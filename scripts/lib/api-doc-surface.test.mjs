import { describe, it, expect } from "vitest";
import { componentOwnerOf, checkApiDocs } from "./api-doc-surface.mjs";
import { parseAddedLines } from "./diff-added-lines.mjs";

/**
 * Monta a entrada pelo PARSER REAL, a partir de um texto de `git diff -U0`.
 *
 * A 1ª versão destes testes montava `{ "arquivo": ["linha"] }` na mão — objeto de
 * strings. O parser devolve um **Map** de `{n, text}`. Os testes passavam e o check
 * devolvia 0 finding no commit real que ele existe pra pegar. Montar pelo parser é o
 * que impede a suposição de voltar.
 */
const diffDe = (arquivo, ...linhasAdicionadas) =>
  parseAddedLines(
    [
      `diff --git a/${arquivo} b/${arquivo}`,
      `--- a/${arquivo}`,
      `+++ b/${arquivo}`,
      `@@ -1,0 +1,${linhasAdicionadas.length} @@`,
      ...linhasAdicionadas.map((l) => `+${l}`),
    ].join("\n"),
  );

/** Junta vários arquivos num só Map, como um diff de PR de verdade. */
const juntar = (...maps) => {
  const out = new Map();
  for (const m of maps) for (const [k, v] of m) out.set(k, v);
  return out;
};

describe("componentOwnerOf", () => {
  it("reconhece ui/<Nome>/**", () => {
    expect(componentOwnerOf("src/components/ui/DatePicker/datepicker.tsx")).toEqual({
      kind: "ui",
      name: "DatePicker",
      dir: "src/components/ui/DatePicker",
    });
  });

  it("reconhece arquivo aninhado do componente", () => {
    expect(componentOwnerOf("src/components/ui/DataTable/parts/row.tsx")?.name).toBe("DataTable");
  });

  it("reconhece shadcn/<nome>.tsx (USAGE é índice único, não por arquivo)", () => {
    expect(componentOwnerOf("src/components/shadcn/select.tsx")).toEqual({
      kind: "shadcn",
      name: "select",
      dir: "src/components/shadcn",
    });
  });

  it("normaliza backslash (diff no Windows)", () => {
    expect(componentOwnerOf("src\\components\\ui\\Chip\\chip.tsx")?.name).toBe("Chip");
  });

  it("devolve null pra path que não é componente", () => {
    for (const p of ["src/preview/pages/TableDoc.tsx", "scripts/x.mjs", "src/utils/tv.ts"]) {
      expect(componentOwnerOf(p)).toBeNull();
    }
  });
});

describe("checkApiDocs", () => {
  const DP = "src/components/ui/DatePicker/datepicker.tsx";

  // As linhas abaixo são as REAIS do commit 8fdcb0d (PR #60, o `mode` do DatePicker),
  // que ficou 11 dias sem doc com o showcase ensinando o padrão obsoleto.
  it("caso real do Caio: export adicionado sem tocar o USAGE → finding", () => {
    const f = checkApiDocs({
      addedByFile: diffDe(
        DP,
        'import type { DateRange } from "react-day-picker";',
        "export type { DateRange };",
        "interface SingleDatePickerProps extends BaseDatePickerProps {",
        "export type DatePickerProps =",
      ),
      changedFiles: [DP],
    });
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({
      name: "DatePicker",
      kind: "ui",
      doc: "src/components/ui/DatePicker/USAGE.md",
    });
    // pega os dois `export`, ignora o `import` e o `interface` não exportado
    expect(f[0].exports).toEqual(["export type { DateRange };", "export type DatePickerProps ="]);
  });

  it("export adicionado COM o USAGE tocado → silencioso", () => {
    expect(
      checkApiDocs({
        addedByFile: diffDe(DP, "export type X = 1;"),
        changedFiles: [DP, "src/components/ui/DatePicker/USAGE.md"],
      }),
    ).toEqual([]);
  });

  // As 3 substituições de token de 2026-07-29 (size-9 → size-comp-lg) não adicionaram
  // nenhum export. É o que mantém o ruído baixo o suficiente pra o aviso ser lido.
  it("fix de estilo sem export → silencioso", () => {
    const f = "src/components/ui/AppShell/user-menu.tsx";
    expect(
      checkApiDocs({
        addedByFile: diffDe(f, '            <Avatar className="size-comp-lg" />'),
        changedFiles: [f],
      }),
    ).toEqual([]);
  });

  it("componente NOVO é pulado (é caso do showcase-check, não deste)", () => {
    const f = "src/components/ui/Widget/widget.tsx";
    expect(
      checkApiDocs({
        addedByFile: diffDe(f, "export const Widget = 1;"),
        changedFiles: [f],
        isNewComponent: (n) => n === "Widget",
      }),
    ).toEqual([]);
  });

  it("teste e arquivo não-componente são ignorados", () => {
    expect(
      checkApiDocs({
        addedByFile: juntar(
          diffDe("src/components/ui/Chip/chip.test.tsx", "export const x = 1;"),
          diffDe("src/preview/pages/ChipDoc.tsx", "export function ChipDoc() {}"),
          diffDe("scripts/foo.mjs", "export function foo() {}"),
        ),
        changedFiles: ["src/components/ui/Chip/chip.test.tsx"],
      }),
    ).toEqual([]);
  });

  it("agrupa por componente e deduplica exports de arquivos diferentes", () => {
    const f = checkApiDocs({
      addedByFile: juntar(
        diffDe("src/components/ui/Toast/toast.tsx", "export interface ToastApi {"),
        diffDe("src/components/ui/Toast/index.ts", "export interface ToastApi {"),
      ),
      changedFiles: ["src/components/ui/Toast/toast.tsx", "src/components/ui/Toast/index.ts"],
    });
    expect(f).toHaveLength(1);
    expect(f[0].exports).toEqual(["export interface ToastApi {"]);
  });

  it("relata múltiplos componentes de uma PR", () => {
    const f = checkApiDocs({
      addedByFile: juntar(
        diffDe("src/components/ui/A/a.tsx", "export const a = 1;"),
        diffDe("src/components/ui/B/b.tsx", "export const b = 1;"),
      ),
      changedFiles: ["src/components/ui/A/a.tsx", "src/components/ui/B/b.tsx"],
    });
    expect(f.map((x) => x.name).sort()).toEqual(["A", "B"]);
  });

  it("entrada vazia/ausente não lança", () => {
    expect(checkApiDocs({})).toEqual([]);
    expect(checkApiDocs({ addedByFile: new Map(), changedFiles: [] })).toEqual([]);
  });

  it("tolera Map de strings (se o parser algum dia simplificar o formato)", () => {
    const f = checkApiDocs({
      addedByFile: new Map([[DP, ["export type X = 1;"]]]),
      changedFiles: [DP],
    });
    expect(f).toHaveLength(1);
  });
});
