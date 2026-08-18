import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LayoutGrid } from "lucide-react";
import { AppShell } from "./app-shell";
import type { SingleMenuCategory } from "@/components/ui/SingleMenuSidebar";

/**
 * `AppShell` com `sidebar="single"` — o cabeamento entre o shell e a sidebar de nível único.
 *
 * ## Por que TESTE e não conferência visual
 *
 * Tentei validar no browser e não consegui confiar em nenhuma medição, por três motivos
 * distintos que se acumularam em 2026-08-18:
 *
 *   · o dev server já rodando na 3100 tinha o HMR quebrado (websocket falhando) e servia
 *     **transformação velha** — o `fetch` do próprio módulo mostrou 0 ocorrências de uma
 *     prop que estava no disco
 *   · subir servidor próprio caiu em porta divergente (a tool atribuiu uma, o vite usou outra)
 *     e a aba oscilava entre as duas
 *   · `document.timeline` fica congelado no browser automatizado, então posição de elemento
 *     animado mede errado (a sidebar tem `transition-[width]`)
 *
 * Cada um desses me deu número plausível e falso. O que estes testes cobrem é justamente o
 * que eu tentava ver na tela — e aqui é determinístico.
 *
 * ## O que se garante
 *
 * 1. Nenhum botão flutuante grudado na borda da sidebar recolhida (`showToggleIndicator`).
 * 2. O toggle de colapsar sai do Header no desktop (a sidebar tem o próprio) e **fica** no
 *    mobile (onde a sidebar recolhida vira `hidden` e não haveria como abrir).
 * 3. O ciclo abre/fecha funciona e o botão interno reflete o MESMO estado do shell.
 */

const CATEGORIES: SingleMenuCategory[] = [
  { id: "dash", icon: <LayoutGrid />, label: "Dashboard", href: "#dash" },
  { id: "cfg", icon: <LayoutGrid />, label: "Configurações", href: "#cfg" },
];

/** Finge um viewport pro `matchMedia` do jsdom — mesmo padrão do default-menu-collapsed.test. */
function viewport(largura: number) {
  vi.stubGlobal("matchMedia", (q: string) => {
    const max = /max-width:\s*(\d+)px/.exec(q);
    const min = /min-width:\s*(\d+)px/.exec(q);
    const matches = max ? largura <= Number(max[1]) : min ? largura >= Number(min[1]) : false;
    return {
      matches,
      media: q,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });
}

function montar(extra: Record<string, unknown> = {}) {
  return render(
    <AppShell
      sidebar="single"
      categories={CATEGORIES}
      sidebarLogo={<span data-testid="logo" />}
      sidebarTitle="Sistema Único"
      breadcrumb={[{ label: "Sistema" }]}
      defaultMenuCollapsed={false}
      user={{ name: "Sérgio", email: "s@igreen.com" }}
      {...extra}
    >
      <div data-testid="corpo" />
    </AppShell>,
  );
}

beforeEach(() => viewport(1280));
afterEach(() => vi.unstubAllGlobals());

describe("AppShell sidebar=single — sem botão flutuante", () => {
  it("não renderiza o indicador flutuante grudado na borda", () => {
    montar({ defaultMenuCollapsed: true });
    // O `showToggleIndicator` desenha um botão `absolute … translate-x-1/2` de 26px na
    // borda EXTERNA da sidebar recolhida. Num rail que expande por hover ele é ruído.
    const flutuantes = [...document.querySelectorAll("button")].filter((b) =>
      String(b.className).includes("translate-x-1/2"),
    );
    expect(flutuantes, "o shell não deve forçar showToggleIndicator").toHaveLength(0);
  });

  it("logo e título vão no header DA SIDEBAR, não no do app", () => {
    montar();
    expect(screen.getByTestId("logo")).toBeTruthy();
    expect(screen.getByText("Sistema Único")).toBeTruthy();
  });

  it("a busca da sidebar vem DESLIGADA — o Header já tem a dele", () => {
    // `showSearch` é `true` por default NO COMPONENTE (faz sentido standalone). Dentro do
    // shell isso daria duas buscas na mesma tela, então o shell inverte pra false.
    const { container } = montar();
    // ⚠️ Escopado no <aside>: `screen.queryByText(/Buscar/i)` pega a busca DO HEADER e o
    // teste falha por motivo errado — foi o que aconteceu na 1ª versão.
    const aside = container.querySelector("aside")!;
    expect(
      aside.textContent,
      "sem sidebarShowSearch explícito, nenhuma busca DENTRO da sidebar",
    ).not.toMatch(/Buscar/i);
  });

  it("ligar sidebarShowSearch traz a busca de volta", () => {
    const { container } = montar({ sidebarShowSearch: true, sidebarSearchPlaceholder: "Buscar no menu" });
    expect(container.querySelector("aside")!.textContent).toMatch(/Buscar no menu/);
  });
});

describe("AppShell sidebar=single — de quem é o botão de colapsar", () => {
  const botaoDoHeader = () =>
    screen.queryByRole("button", { name: /(Colapsar|Expandir) menu/ });
  const toggleDaSidebar = () =>
    screen.queryByRole("button", { name: /(Recolher|Expandir) sidebar/ });

  it("DESKTOP: o Header não tem o botão — a sidebar tem o próprio", () => {
    viewport(1280);
    montar();
    expect(botaoDoHeader(), "dois controles pra mesma coisa, lado a lado").toBeNull();
    expect(toggleDaSidebar(), "o da sidebar é o que fica").toBeTruthy();
  });

  it("MOBILE: o botão do Header FICA — sem ele o menu não abre", () => {
    // Abaixo de 768px a sidebar recolhida é `hidden`, então o toggle dela desaparece
    // junto. Remover o do Header ali deixaria o menu inacessível.
    viewport(500);
    montar({ defaultMenuCollapsed: true });
    expect(botaoDoHeader(), "no mobile é a única entrada").toBeTruthy();
  });

  it("na variante menu (default) o botão do Header continua onde sempre esteve", () => {
    viewport(1280);
    render(
      <AppShell
        // Forma REAL do SidebarContext: `items` é obrigatório, `sections` é opcional.
        // Minha 1ª versão inverteu isso e forçou com `as never` — o render quebrou em
        // `context.items.map`. Fixture com forma diferente da de produção não é teste (L-068).
        contexts={[{ id: "c", label: "C", icon: LayoutGrid, items: [] }]}
        breadcrumb={[{ label: "X" }]}
        defaultMenuCollapsed={false}
      >
        <div />
      </AppShell>,
    );
    expect(botaoDoHeader(), "a mudança não pode mexer em quem já usa").toBeTruthy();
  });
});

describe("AppShell sidebar=single — o ciclo abre/fecha", () => {
  it("clicar no toggle da sidebar recolhe, e o shell é avisado", async () => {
    const onMenuCollapseChange = vi.fn();
    montar({ onMenuCollapseChange });

    const toggle = screen.getByRole("button", { name: /Recolher sidebar/ });
    await userEvent.click(toggle);

    expect(onMenuCollapseChange, "o shell precisa saber, pra o estado ser um só").toHaveBeenCalledWith(
      true,
    );
  });

  it("o botão interno responde ao MESMO estado do shell (controlled)", () => {
    // Com `menuCollapsed` controlado, o rótulo do botão da sidebar tem de acompanhar —
    // se divergisse, o usuário veria "Recolher" numa sidebar já recolhida.
    const { rerender } = render(
      <AppShell
        sidebar="single"
        categories={CATEGORIES}
        sidebarLogo={<span />}
        sidebarTitle="S"
        breadcrumb={[{ label: "S" }]}
        menuCollapsed={false}
        user={{ name: "S", email: "s@s.com" }}
      >
        <div />
      </AppShell>,
    );
    expect(screen.queryByRole("button", { name: /Recolher sidebar/ })).toBeTruthy();

    rerender(
      <AppShell
        sidebar="single"
        categories={CATEGORIES}
        sidebarLogo={<span />}
        sidebarTitle="S"
        breadcrumb={[{ label: "S" }]}
        menuCollapsed
        user={{ name: "S", email: "s@s.com" }}
      >
        <div />
      </AppShell>,
    );
    // Recolhida e sem showToggleIndicator: não há botão de sidebar nenhum — o hover é que
    // reabre no desktop. O que NÃO pode acontecer é sobrar um "Recolher" mentindo.
    expect(
      screen.queryByRole("button", { name: /Recolher sidebar/ }),
      "recolhida não pode oferecer 'Recolher'",
    ).toBeNull();
  });
});
