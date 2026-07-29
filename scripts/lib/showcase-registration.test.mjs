import { describe, expect, it } from "vitest";
import { checkRegistration, toKebab } from "./showcase-registration.mjs";

/* Superfície 4 da L-042: componente novo precisa de Doc page + rota no App.tsx
   (DOC_PAGES **e** render) + entrada no doc-nav-data.
   Formatos reais no repo:
     DOC_PAGES →   "spinner",
     render    →   {activePage === "spinner" && <SpinnerDoc />}
     nav       →   { label: "Spinner", href: "spinner" }, */

const APP_COMPLETO = `
const DOC_PAGES = [
  "button",
  "empty-state",
];
{activePage === "button" && <ButtonDoc />}
{activePage === "empty-state" && <EmptyStateDoc />}
`;
const NAV_COMPLETO = `{ label: "Empty State", href: "empty-state" },`;

describe("checkRegistration", () => {
  it("tudo registrado → nenhuma pendência", () => {
    expect(
      checkRegistration({
        name: "EmptyState",
        docExists: true,
        appTsx: APP_COMPLETO,
        navData: NAV_COMPLETO,
      }),
    ).toEqual([]);
  });

  // ESTE é o caso que um grep genérico deixa passar — e é exatamente o defeito
  // que a L-042 registra: a rota abre EM BRANCO.
  it("id no DOC_PAGES mas SEM render → reprova (rota abre em branco)", () => {
    const appSemRender = `
const DOC_PAGES = [
  "empty-state",
];
{activePage === "button" && <ButtonDoc />}
`;
    const faltas = checkRegistration({
      name: "EmptyState",
      docExists: true,
      appTsx: appSemRender,
      navData: NAV_COMPLETO,
    });
    expect(faltas).toHaveLength(1);
    expect(faltas[0].id).toBe("app-render");
    expect(faltas[0].what).toMatch(/render/i);
  });

  it("render presente mas SEM entrada no DOC_PAGES → reprova", () => {
    const appSemDocPages = `
const DOC_PAGES = [
  "button",
];
{activePage === "empty-state" && <EmptyStateDoc />}
`;
    const faltas = checkRegistration({
      name: "EmptyState",
      docExists: true,
      appTsx: appSemDocPages,
      navData: NAV_COMPLETO,
    });
    expect(faltas).toHaveLength(1);
    expect(faltas[0].id).toBe("app-doc-pages");
  });

  it("Doc page ausente → reprova", () => {
    const faltas = checkRegistration({
      name: "EmptyState",
      docExists: false,
      appTsx: APP_COMPLETO,
      navData: NAV_COMPLETO,
    });
    expect(faltas).toHaveLength(1);
    expect(faltas[0].id).toBe("doc-page");
    expect(faltas[0].what).toContain("EmptyStateDoc.tsx");
  });

  it("nav ausente → reprova", () => {
    const faltas = checkRegistration({
      name: "EmptyState",
      docExists: true,
      appTsx: APP_COMPLETO,
      navData: `{ label: "Button", href: "button" },`,
    });
    expect(faltas).toHaveLength(1);
    expect(faltas[0].id).toBe("nav");
  });

  // 3 REQUISITOS (doc page · App.tsx · nav) mas 4 CHECKS — o App.tsx conta
  // duas vezes, porque DOC_PAGES e render são falhas independentes.
  it("nada registrado → reporta os 4 checks, na ordem", () => {
    const faltas = checkRegistration({
      name: "EmptyState",
      docExists: false,
      appTsx: "",
      navData: "",
    });
    expect(faltas.map((f) => f.id)).toEqual(["doc-page", "app-doc-pages", "app-render", "nav"]);
  });

  it("componente na lista de exceção → nenhuma pendência, mesmo sem nada", () => {
    expect(
      checkRegistration({ name: "MessageBubble", docExists: false, appTsx: "", navData: "" }),
    ).toEqual([]);
  });

  it("toda pendência traz um `fix` acionável", () => {
    const faltas = checkRegistration({ name: "EmptyState", docExists: false, appTsx: "", navData: "" });
    for (const f of faltas) {
      expect(f.fix.length, f.id).toBeGreaterThan(10);
    }
    // Conteúdo, não só tamanho — placeholder longo não deve passar disfarçado.
    expect(faltas.find((f) => f.id === "doc-page").fix).toContain("Doc.tsx");
    expect(faltas.find((f) => f.id === "nav").fix).toContain("href:");
  });

  it("não confunde id que é prefixo de outro", () => {
    // "chip" não deve casar com "chip-group"
    const app = `
const DOC_PAGES = [
  "chip-group",
];
{activePage === "chip-group" && <ChipGroupDoc />}
`;
    const faltas = checkRegistration({
      name: "Chip",
      docExists: true,
      appTsx: app,
      navData: `{ label: "Chip Group", href: "chip-group" },`,
    });
    expect(faltas.map((f) => f.id)).toEqual(["app-doc-pages", "app-render", "nav"]);
  });
});

describe("toKebab", () => {
  it("converte PascalCase", () => {
    expect(toKebab("EmptyState")).toBe("empty-state");
    expect(toKebab("DataTable")).toBe("data-table");
    expect(toKebab("Button")).toBe("button");
  });

  it("lida com sigla e dígito", () => {
    expect(toKebab("Kpi")).toBe("kpi");
    expect(toKebab("MonthYearPicker")).toBe("month-year-picker");
  });

  // Premissa: nome de pasta em PascalCase. `avatar-ig` é o único violador hoje
  // no repo (id real: "avatar") — não alcançado porque o check só vê pasta nova.
  // A Task 4 pula + avisa em pasta não-PascalCase. Ver docstring do módulo.
  it("nome já em kebab volta inalterado — premissa PascalCase documentada", () => {
    expect(toKebab("avatar-ig")).toBe("avatar-ig");
  });
});
