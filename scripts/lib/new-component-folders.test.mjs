import { describe, expect, it } from "vitest";
import { newComponentFolders } from "./new-component-folders.mjs";

/* Critério de "componente novo": pasta que NÃO existia no base ref.
   Antes (só status `A`), adicionar um arquivo em `Chart/` ou `Icon/` reprovava o
   CI cobrando showcase de componente já documentado — 2 de 42 medidos.
   Formato real da entrada (`git diff --name-status`): `A\tsrc/components/ui/X/y.tsx`. */

const nunca = () => false; // nada existia no base → tudo é novo
const sempre = () => true; // tudo já existia no base → nada é novo

describe("newComponentFolders — o que conta como pasta nova", () => {
  it("pasta AUSENTE no base ref é flagrada", () => {
    const diff = "A\tsrc/components/ui/EmptyState/empty-state.tsx";
    expect(newComponentFolders(diff, nunca)).toEqual(["EmptyState"]);
  });

  // O achado que motivou a correção: arquivo novo em pasta existente é rotina
  // (DataTable 8 commits, TableToolbar 6) e não é componente novo.
  it("pasta que EXISTE no base ref NÃO é flagrada, mesmo com arquivo novo dentro", () => {
    const diff = "A\tsrc/components/ui/Chart/chart-tooltip.tsx";
    expect(newComponentFolders(diff, sempre)).toEqual([]);
  });

  it("mistura: só as ausentes no base saem", () => {
    const diff = [
      "A\tsrc/components/ui/Chart/chart-tooltip.tsx",
      "A\tsrc/components/ui/Icon/icon-extra.tsx",
      "A\tsrc/components/ui/Widget/widget.tsx",
    ].join("\n");
    const existentes = new Set(["Chart", "Icon"]);
    expect(newComponentFolders(diff, (n) => existentes.has(n))).toEqual(["Widget"]);
  });

  // Ganho do `--no-renames` (commit a3a404a): com ele o rename vem como `A` sob
  // o nome NOVO + `D` sob o antigo. O nome novo não existe no base → flagrado.
  it("pasta RENOMEADA continua flagrada (o ganho do --no-renames é preservado)", () => {
    const diff = [
      "A\tsrc/components/ui/avatar-ig/avatar.tsx",
      "D\tsrc/components/ui/Avatar/avatar.tsx",
    ].join("\n");
    const existiaNoBase = (n) => n === "Avatar"; // `avatar-ig` ainda não existia
    expect(newComponentFolders(diff, existiaNoBase)).toEqual(["avatar-ig"]);
  });

  // Ruído oposto, que o critério novo mata de graça: rename DENTRO de pasta já
  // registrada não ressuscita a pasta na lista de "novos".
  it("rename dentro de pasta já registrada não ressuscita a pasta", () => {
    const diff = [
      "A\tsrc/components/ui/DataTable/parts/row-new.tsx",
      "D\tsrc/components/ui/DataTable/parts/row.tsx",
    ].join("\n");
    expect(newComponentFolders(diff, sempre)).toEqual([]);
  });
});

describe("newComponentFolders — parse do --name-status", () => {
  it("dedupe: N arquivos na mesma pasta → 1 entrada, 1 consulta ao base", () => {
    const diff = [
      "A\tsrc/components/ui/Widget/widget.tsx",
      "A\tsrc/components/ui/Widget/widget.styles.ts",
      "A\tsrc/components/ui/Widget/index.ts",
    ].join("\n");
    const consultas = [];
    const resultado = newComponentFolders(diff, (n) => {
      consultas.push(n);
      return false;
    });
    expect(resultado).toEqual(["Widget"]);
    expect(consultas).toEqual(["Widget"]);
  });

  it("ordena alfabeticamente (saída determinística)", () => {
    const diff = [
      "A\tsrc/components/ui/Zeta/zeta.tsx",
      "A\tsrc/components/ui/Alfa/alfa.tsx",
    ].join("\n");
    expect(newComponentFolders(diff, nunca)).toEqual(["Alfa", "Zeta"]);
  });

  it("ignora status que não é A", () => {
    const diff = [
      "M\tsrc/components/ui/Widget/widget.tsx",
      "D\tsrc/components/ui/Outro/outro.tsx",
    ].join("\n");
    expect(newComponentFolders(diff, nunca)).toEqual([]);
  });

  it("ignora arquivo solto em src/components/ui (não é pasta de componente)", () => {
    expect(newComponentFolders("A\tsrc/components/ui/index.ts", nunca)).toEqual([]);
  });

  it("ignora caminho fora de src/components/ui", () => {
    const diff = [
      "A\tsrc/components/shadcn/menubar.tsx",
      "A\tsrc/preview/pages/WidgetDoc.tsx",
    ].join("\n");
    expect(newComponentFolders(diff, nunca)).toEqual([]);
  });

  it("diff vazio devolve lista vazia (e nem consulta o base)", () => {
    let chamou = false;
    expect(
      newComponentFolders("", () => {
        chamou = true;
        return false;
      }),
    ).toEqual([]);
    expect(chamou).toBe(false);
  });

  it("aceita CRLF (git no Windows)", () => {
    const diff = "A\tsrc/components/ui/Widget/widget.tsx\r\nA\tsrc/components/ui/Outro/o.tsx\r\n";
    expect(newComponentFolders(diff, nunca)).toEqual(["Outro", "Widget"]);
  });
});
