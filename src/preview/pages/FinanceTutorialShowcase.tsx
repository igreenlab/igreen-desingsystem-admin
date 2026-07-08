import { useMemo, useRef, useState } from "react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import ClientesFinanceiroShowcase from "./ClientesFinanceiroShowcase";
import { GuidedTour, type TourStep } from "../components/guided-tour";

/**
 * FinanceTutorialShowcase — standalone (`?app=finance-tutorial`) que reusa a tela
 * financeira real (ClientesFinanceiroShowcase = AppShell + DataTable) e sobrepõe
 * um tour guiado (GuidedTour, DS-native) percorrendo todos os recursos da tabela.
 *
 * Showcase-only: nenhum componente do DS é modificado. As âncoras dos passos são
 * resolvidas por ARIA/estrutura contra o container (scopeRef); alvo ausente cai
 * em balão centralizado. Passos de dropdown (Filtros/Config) abrem o popover no
 * onEnter e o fecham no onLeave.
 */
export default function FinanceTutorialShowcase() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<number>(0);
  const [open, setOpen] = useState(true);

  const steps = useMemo<TourStep[]>(() => {
    const q = (sel: string) => scopeRef.current?.querySelector(sel) ?? null;
    // fecha qualquer popover Radix aberto via Esc (o tour ignora Esc enquanto
    // houver popover não-tour aberto, então isso não fecha o tour).
    const closePopover = () => {
      // só dispara Esc se realmente há popover aberto — senão o Esc "solto"
      // fecharia o próprio tour (o guard do tour ignora Esc com popover aberto).
      if (document.querySelector('[role="dialog"]:not([aria-label="Tour guiado"])'))
        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
    };
    // abre um popover pelo trigger, com atraso (UI precisa assentar após a
    // transição de passo — clicar cedo demais não abre). O retry-measure ancora
    // quando o popover aparecer. onLeave limpa o timer + fecha o popover.
    const openStep = (triggerSel: string) => ({
      onEnter: () => {
        clearTimeout(openTimer.current);
        openTimer.current = window.setTimeout(
          () => (q(triggerSel) as HTMLElement)?.click(),
          240,
        );
      },
      onLeave: () => {
        clearTimeout(openTimer.current);
        closePopover();
      },
    });
    // popovers são portados pro body (fora do scopeRef) → busca no document,
    // ignorando o próprio balão do tour.
    const findDialog = (re: RegExp) =>
      [...document.querySelectorAll('[role="dialog"]')].find(
        (d) =>
          d.getAttribute("aria-label") !== "Tour guiado" && re.test(d.textContent ?? ""),
      ) ?? null;

    return [
      {
        title: "Busca global",
        body: (
          <>
            Filtra <strong>todas as colunas</strong> ao digitar. Combina com filtros
            e ordenação — é o jeito mais rápido de achar uma linha.
          </>
        ),
        placement: "bottom",
        // ancora no wrapper (label) — o <input> sozinho é menor que a caixa visível.
        target: () => {
          const inp = scopeRef.current?.querySelector("input[type=text]") ?? null;
          return (inp?.closest("label") as Element | null) ?? inp;
        },
      },
      {
        title: "Ordenar e menu da coluna",
        body: (
          <>
            Clique no cabeçalho pra <strong>ordenar</strong>. Passando o mouse, o menu{" "}
            <code>⋯</code> da coluna dá ordenar, fixar, ocultar e filtrar só por ela.
          </>
        ),
        placement: "bottom",
        target: () =>
          [...(scopeRef.current?.querySelectorAll('[role="columnheader"]') ?? [])].find(
            (h) => /Licenciado|Razão|ID/i.test(h.textContent ?? ""),
          ) ??
          scopeRef.current?.querySelector('[role="columnheader"]') ??
          null,
      },
      {
        title: "Filtros por coluna",
        body: (
          <>
            Cada coluna vira um filtro (tipo certo: texto, número, data, seleção). O que
            for aplicado aparece como <strong>chip</strong> na toolbar — clicável pra
            editar, removível pelo ×.
          </>
        ),
        placement: "left",
        noScroll: true,
        ...openStep('[aria-label="Filtros"]'),
        target: () => findDialog(/filtros?\s*ativos|filtro ativo/i),
      },
      {
        title: "Visões salvas — as abas",
        body: (
          <>
            As visões já criadas aparecem como <strong>abas</strong> (ex.:{" "}
            <em>Default</em>). Clicar numa aba aplica o recorte dela — filtros,
            ordenação e colunas de uma vez.
          </>
        ),
        placement: "bottom",
        target: '[role="tablist"]',
      },
      {
        title: "Criar nova visão — o +",
        body: (
          <>
            O <strong>+</strong> salva a combinação <em>atual</em> (filtros + ordenação
            + colunas) como uma nova visão, pra reusar depois. Ótimo pra recortes
            recorrentes (ex.: "High-value", "Bloqueados").
          </>
        ),
        placement: "bottom",
        target: '[aria-label="Visões salvas"]',
      },
      {
        title: "Tabela e Kanban",
        body: (
          <>
            Os <strong>mesmos dados</strong> em visualizações diferentes: a{" "}
            <strong>Tabela</strong> densa e o <strong>Kanban</strong> (funil por
            status/etapa). O recorte é preservado ao trocar.
          </>
        ),
        placement: "bottom",
        target: '[role="radiogroup"]',
      },
      {
        title: "Seleção e ações em massa",
        body: (
          <>
            Selecione linhas (checkbox) pra agir em lote — exportar, pausar, etc. A
            barra de ações aparece com o total selecionado.
          </>
        ),
        placement: "top",
        onEnter: () => (q('[aria-label="Selecionar linha"]') as HTMLElement)?.click(),
        onLeave: () => (q('[aria-label="Selecionar linha"]') as HTMLElement)?.click(),
        target: ['[aria-label="Ações em massa"]', '[aria-label="Acoes em massa"]'],
      },
      {
        title: "Colunas, densidade e export",
        body: (
          <>
            Nas <strong>Configurações da tabela</strong>: escolha quais colunas
            aparecem, ajuste a <strong>densidade</strong> das linhas e{" "}
            <strong>exporte CSV</strong> (tudo ou só o selecionado).
          </>
        ),
        placement: "left",
        noScroll: true,
        ...openStep('[aria-label="Configurações da tabela"]'),
        target: () => findDialog(/Configura[çc][õo]es da tabela|Ordena[çc][ãa]o.*Colunas/i),
      },
      {
        title: "Paginação",
        body: (
          <>
            Navegue entre páginas e ajuste <strong>itens por página</strong>. Na Lista/
            Kanban a paginação é opcional (rola tudo).
          </>
        ),
        placement: "top",
        target: () => q('[aria-label^="Página"]')?.parentElement ?? null,
      },
    ];
  }, []);

  return (
    <div ref={scopeRef} className="relative h-screen w-full">
      <ClientesFinanceiroShowcase />

      {!open && (
        <div className="fixed bottom-pad-3xl right-pad-3xl z-[60]">
          <Button variant="filled" color="primary" onClick={() => setOpen(true)}>
            <GraduationCap className="size-icon-md" aria-hidden="true" />
            Iniciar tutorial
          </Button>
        </div>
      )}

      <GuidedTour
        steps={steps}
        open={open}
        onClose={() => setOpen(false)}
        scopeRef={scopeRef}
      />
    </div>
  );
}
