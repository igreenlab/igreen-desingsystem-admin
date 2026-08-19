import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SingleMenuSidebar } from "./single-menu-sidebar";
import { sidebarRoot, sidebarPanel } from "./single-menu-sidebar.styles";
import type { SingleMenuCategory, SingleMenuSidebarProps } from "./single-menu-sidebar.types";

/**
 * A espiada por hover FLUTUA sobre o conteúdo; o clique OCUPA espaço.
 *
 * Antes, expandir por hover animava a largura dentro do fluxo flex, então o conteúdo ao
 * lado era empurrado e re-diagramado a cada frame. Medido em 2026-08-19 numa tela com
 * DataTable: 5 recálculos completos de largura de coluna por gesto, travada de ~100ms e
 * **CLS 0,117**.
 *
 * O `MenuSidebar` nunca teve isso porque o painel dele é `absolute` sobre o conteúdo.
 * Aqui é o mesmo, com uma distinção que é o ponto do desenho:
 *
 *   recolhida        → fluxo rail  · painel rail  · absoluto
 *   hover (espiada)  → fluxo rail  · painel 280   · absoluto  ← não empurra
 *   clique (travada) → fluxo 280   · painel 280   · estático  ← empurra, e deve
 *
 * O clique é decisão de layout do usuário; o hover é espiada. Quem está com o menu
 * recolhido escolheu maximizar a área de conteúdo.
 *
 * Aferido no browser (`#/single-menu-sidebar` e `#/app-shell`): na espiada o vizinho
 * ficou imóvel em 1002/616 do início ao fim, inclusive durante a retração.
 */

const CATEGORIAS: SingleMenuCategory[] = [
  { id: "c1", label: "Cadastros", icon: <span>ic</span>, items: [{ id: "i1", label: "Clientes" }] },
];

const props: SingleMenuSidebarProps = {
  logo: <span>iG</span>,
  title: "Sistema",
  categories: CATEGORIAS,
  showSearch: false,
  user: { name: "Teste", email: "teste@igreen.com" },
};

/** O `<aside>` e o painel (primeiro filho). */
function caixas() {
  const aside = screen.getByLabelText("Navegação lateral");
  return { aside, painel: aside.firstElementChild as HTMLElement };
}

describe("sidebarRoot / sidebarPanel — contrato de classes", () => {
  it("fluxo `rail` não ocupa largura de expandida", () => {
    expect(sidebarRoot({ flowWidth: "rail" })).toContain("md:w-20");
    expect(sidebarRoot({ flowWidth: "rail" })).not.toContain("md:w-[280px]");
  });

  it("fluxo `full` ocupa 280 no desktop", () => {
    expect(sidebarRoot({ flowWidth: "full" })).toContain("md:w-[280px]");
  });

  it("overlay tira do fluxo e sobe o z — mas só no desktop", () => {
    const c = sidebarPanel({ overlay: true, visualWidth: "full" });
    expect(c).toContain("md:absolute");
    expect(c).toContain("md:z-40");
    // sem `absolute` cru: em mobile a sidebar é drawer e não deve flutuar
    expect(c).not.toMatch(/(^|\s)absolute(\s|$)/);
  });

  it("sombra SÓ quando overlay + largura cheia (a espiada)", () => {
    expect(sidebarPanel({ overlay: true, visualWidth: "full" })).toContain("md:shadow-sh-lg");
    // recolhida também é overlay, mas ali a sombra seria ruído
    expect(sidebarPanel({ overlay: true, visualWidth: "rail" })).not.toContain("shadow-sh-lg");
    expect(sidebarPanel({ overlay: false, visualWidth: "full" })).not.toContain("shadow-sh-lg");
  });

  it("travada (overlay false) fica no fluxo, sem position nem z", () => {
    const c = sidebarPanel({ overlay: false, visualWidth: "full" });
    expect(c).not.toContain("absolute");
    expect(c).not.toContain("z-40");
  });
});

describe("SingleMenuSidebar — os 3 estados no DOM", () => {
  it("travada aberta: painel no fluxo (sem absolute), aside com 280", () => {
    render(<SingleMenuSidebar {...props} defaultExpanded />);
    const { aside, painel } = caixas();
    expect(aside.className).toContain("md:w-[280px]");
    expect(painel.className).not.toContain("md:absolute");
  });

  it("recolhida: aside no rail e painel JÁ absoluto (não troca no meio da animação)", () => {
    render(<SingleMenuSidebar {...props} defaultExpanded={false} />);
    const { aside, painel } = caixas();
    expect(aside.className).toContain("md:w-20");
    expect(painel.className).toContain("md:absolute");
    expect(painel.className).toContain("md:w-20");
  });

  it("hover em recolhida: painel cresce e o ASIDE continua no rail", () => {
    render(<SingleMenuSidebar {...props} defaultExpanded={false} />);
    const { aside } = caixas();
    act(() => {
      fireEvent.mouseOver(aside, { relatedTarget: document.body });
    });
    const { aside: a2, painel: p2 } = caixas();
    // o painel virou largura cheia…
    expect(p2.className).toContain("md:w-[280px]");
    expect(p2.className).toContain("md:absolute");
    // …e o fluxo NÃO mudou: é isso que impede o conteúdo ao lado de se mexer
    expect(a2.className).toContain("md:w-20");
    expect(a2.className).not.toContain("md:w-[280px]");
  });

  it("hover NÃO altera nada quando já está travada aberta", () => {
    render(<SingleMenuSidebar {...props} defaultExpanded />);
    const { aside } = caixas();
    const antes = aside.className;
    act(() => {
      fireEvent.mouseOver(aside, { relatedTarget: document.body });
    });
    expect(caixas().aside.className).toBe(antes);
    expect(caixas().painel.className).not.toContain("md:absolute");
  });
});
