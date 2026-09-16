import { describe, it, expect, beforeAll, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Building2, LayoutGrid } from "lucide-react";
import { AppShell } from "./app-shell";
import type { SingleMenuCategory } from "@/components/ui/SingleMenuSidebar";

/**
 * O shell não repassava duas props que a sidebar sempre teve.
 *
 * `SingleMenuSidebar` aceita `module` (seletor de escopo, sem trocar o menu) e
 * `searchCommand` (conteúdo da paleta da busca). O `AppShell` — que é **como se usa** a
 * sidebar, porque ela raramente é montada standalone — expunha só `sidebarModules`
 * (plural, que troca as `categories`) e o par `showSearch`/`searchPlaceholder`.
 *
 * O efeito no consumidor não é erro: é ausência. Ele lê o `USAGE.md` da sidebar, vê a
 * prop, não acha equivalente no shell, e conclui que precisa contornar. Medido num CMS
 * real que queria o seletor de empresa no topo da sidebar: a saída disponível era usar
 * `sidebarModules` com N entradas carregando categorias idênticas — funciona por
 * acidente e quebra no dia em que um escopo precisar de menu diferente.
 *
 * ⚠️ Estes dois casos passariam mesmo COM o defeito se o assert fosse só "a sidebar
 * renderizou". O que eles afirmam é que o CONTEÚDO passado chega na tela: o título do
 * escopo e o nó da paleta. Sem o passthrough, `module`/`searchCommand` chegam
 * `undefined` na sidebar e nada disso aparece.
 */

const CATEGORIAS: SingleMenuCategory[] = [
  { id: "visao", icon: <LayoutGrid />, label: "Visão geral", href: "#visao" },
  { id: "faturas", icon: <LayoutGrid />, label: "Faturas", href: "#faturas" },
];

beforeAll(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

function montar(extra: Record<string, unknown> = {}) {
  return render(
    <AppShell
      sidebar="single"
      categories={CATEGORIAS}
      sidebarTitle="iGreen System"
      breadcrumb={[{ label: "iGreen" }]}
      defaultMenuCollapsed={false}
      {...extra}
    >
      <div>corpo</div>
    </AppShell>,
  );
}

describe("AppShell — escopo na sidebar single", () => {
  it("repassa `sidebarModule` e mostra o seletor de escopo", () => {
    montar({
      sidebarModule: {
        icon: <Building2 />,
        title: "PV MOB",
        subtitle: "Empresa selecionada",
      },
    });

    expect(screen.getByText("PV MOB")).toBeTruthy();
    expect(screen.getByText("Empresa selecionada")).toBeTruthy();
  });

  it("repassa `sidebarSearchCommand` pro conteúdo da paleta", async () => {
    montar({
      sidebarShowSearch: true,
      sidebarSearchPlaceholder: "Locais",
      sidebarSearchCommand: <div>lista-de-locais</div>,
    });

    /**
     * ⚠️ A versão anterior deste caso afirmava `getByText("Locais")` — e passava COM o
     * defeito, porque "Locais" vem do `sidebarSearchPlaceholder`, prop que já era
     * repassada. Não testava nada.
     *
     * O que prova o passthrough é o CONTEÚDO chegar na paleta, e a paleta é um
     * `CommandDialog`: só monta aberta. Daí o clique no gatilho antes do assert.
     */
    fireEvent.click(screen.getByText("Locais"));
    expect(await screen.findByText("lista-de-locais")).toBeTruthy();
  });

  it("não quebra a sidebar quando nenhuma das duas é passada", () => {
    montar();

    // Controle: sem as props novas o menu continua montando. Se o passthrough tivesse
    // regredido pra algo obrigatório, isto cairia junto.
    expect(screen.getByText("Visão geral")).toBeTruthy();
    expect(screen.getByText("iGreen System")).toBeTruthy();
  });
});
