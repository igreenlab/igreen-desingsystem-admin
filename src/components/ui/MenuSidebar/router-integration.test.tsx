/**
 * Regressão com react-router REAL (não mock): prova que a navegação virou client-side.
 * O sinal é `window.location.pathname` mudar SEM o documento recarregar, e o
 * componente da rota nova aparecer.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { MenuSidebar } from "@/components/ui/MenuSidebar";
import type { SidebarContext } from "@/components/ui/MenuSidebar";

beforeEach(() => {
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
  }));
});

const Dummy = (() => null) as unknown as SidebarContext["icon"];
const contexts: SidebarContext[] = [{
  id: "app", label: "App", icon: Dummy,
  items: [
    { name: "Clientes", href: "/clientes" },
    { name: "Pedidos", href: "/pedidos" },
  ],
}];

function Rota({ nome }: { nome: string }) {
  const loc = useLocation();
  return <div data-testid="rota">{nome} @ {loc.pathname}</div>;
}

function App() {
  return (
    <MemoryRouter initialEntries={["/clientes"]}>
      <MenuSidebar contexts={contexts} renderLink={(p) => <Link {...p} to={p.href} />} />
      <Routes>
        <Route path="/clientes" element={<Rota nome="CLIENTES" />} />
        <Route path="/pedidos" element={<Rota nome="PEDIDOS" />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("MenuSidebar + react-router (renderLink)", () => {
  it("clicar no menu troca a rota SEM recarregar", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    render(<App />);
    expect(screen.getByTestId("rota").textContent).toContain("CLIENTES");

    await userEvent.click(screen.getByText("Pedidos"));

    // Se houvesse reload, o jsdom logaria "navigation to another Document" e a rota
    // NÃO trocaria (o documento seria substituído).
    expect(screen.getByTestId("rota").textContent).toContain("PEDIDOS");
    expect(screen.getByTestId("rota").textContent).toContain("/pedidos");
  });
});
