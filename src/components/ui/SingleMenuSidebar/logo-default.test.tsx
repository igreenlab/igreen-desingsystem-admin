import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { SingleMenuSidebar } from "./single-menu-sidebar";
import { AppShell } from "@/components/ui/AppShell";
import type { SingleMenuCategory } from "./single-menu-sidebar.types";

/**
 * A marca iGreen não pode depender de quem monta lembrar dela.
 *
 * `MenuSidebar.brand` sempre foi opcional, caindo em `<SidebarBrandIcon />`. O
 * `SingleMenuSidebar.logo` era **obrigatório e sem fallback**, e o `AppShell` repassava
 * direto (`logo={sidebarLogo}`, com `sidebarLogo: ReactNode` obrigatória). Então trocar pra
 * sidebar única **forçava** quem montava a produzir uma logo — e em 2026-08-22 um consumidor
 * relatou a logo da iGreen desaparecendo exatamente nessa troca. A IA não removeu nada: a
 * API pediu outra coisa.
 *
 * O teste ancora no `aria-label="iGreen"` do SVG — o que um leitor de tela anuncia — e não
 * numa classe de estilo, que muda sem o comportamento mudar.
 */

const CATEGORIAS: SingleMenuCategory[] = [
  { id: "c1", label: "Cadastros", icon: <span>ic</span> },
];
const USER = { name: "Teste", email: "teste@igreen.com" };

/** O `aria-label` do SVG da marca. */
function marca(container: HTMLElement) {
  return container.querySelector('[aria-label="iGreen"]');
}

/** Finge um viewport pro `matchMedia` do jsdom — mesmo padrão do sidebar-single.test. */
beforeEach(() => {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: /min-width/.test(q),
    media: q,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

describe("logo default — a marca iGreen vem de graça", () => {
  it("SingleMenuSidebar sem `logo` renderiza a marca iGreen", () => {
    const { container } = render(
      <SingleMenuSidebar
        title="Meu Projeto"
        categories={CATEGORIAS}
        showSearch={false}
        user={USER}
      />,
    );
    expect(marca(container)).not.toBeNull();
  });

  it("`logo` explícito VENCE o default (marca própria segue possível)", () => {
    const { container, getByTestId } = render(
      <SingleMenuSidebar
        logo={<span data-testid="propria">X</span>}
        title="Meu Projeto"
        categories={CATEGORIAS}
        showSearch={false}
        user={USER}
      />,
    );
    expect(getByTestId("propria")).toBeTruthy();
    expect(marca(container), "logo do consumidor não deve conviver com a do DS").toBeNull();
  });

  it("AppShell sidebar=single sem `sidebarLogo` também tem a marca", () => {
    // Era o caminho real do defeito: o builder monta pelo AppShell, não pela sidebar crua.
    const { container } = render(
      <AppShell
        sidebar="single"
        categories={CATEGORIAS}
        sidebarTitle="Meu Projeto"
        breadcrumb={[{ label: "Início" }]}
      >
        <div>conteúdo</div>
      </AppShell>,
    );
    expect(marca(container)).not.toBeNull();
  });

  it("o nome do projeto aparece ao lado da logo", () => {
    // `title`/`sidebarTitle` segue OBRIGATÓRIO de propósito: é o que o DS não adivinha, e o
    // TS cobrando é o que força a pergunta no fluxo do builder.
    const { getByText } = render(
      <SingleMenuSidebar
        title="Sólis iGreen"
        categories={CATEGORIAS}
        showSearch={false}
        user={USER}
      />,
    );
    expect(getByText("Sólis iGreen")).toBeTruthy();
  });
});
