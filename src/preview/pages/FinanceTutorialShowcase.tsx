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
 * em balão centralizado.
 */
export default function FinanceTutorialShowcase() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);

  const steps = useMemo<TourStep[]>(() => {
    const q = (sel: string) => scopeRef.current?.querySelector(sel) ?? null;
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
        target: () =>
          [...(scopeRef.current?.querySelectorAll("input[type=text]") ?? [])].find(
            (i) => /buscar|filtrar|pesquis/i.test((i as HTMLInputElement).placeholder),
          ) ??
          scopeRef.current?.querySelector("input[type=text]") ??
          null,
      },
      {
        title: "Ordenar e menu da coluna",
        body: (
          <>
            Clique no cabeçalho pra <strong>ordenar</strong>. O menu <code>⋯</code> da
            coluna dá ordenar, fixar, ocultar e filtrar só por aquela coluna.
          </>
        ),
        placement: "bottom",
        // cabeçalho é sempre visível; o botão ⋯ da coluna é hover-only (rect 0×0).
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
            Cada filtro aplicado vira um <strong>chip</strong> na toolbar (clicável pra
            editar, removível pelo ×). O botão de filtros avançados monta condições
            compostas (E/OU).
          </>
        ),
        placement: "bottom",
        target: [
          '[aria-label="Filtros"]',
          '[aria-label^="Remover filtro"]',
          '[aria-label^="Filtrar "]',
        ],
      },
      {
        title: "Visões salvas",
        body: (
          <>
            Salve uma combinação de filtros + ordenação + colunas como uma{" "}
            <strong>visão</strong> e alterne entre elas pelas abas — ótimo pra recortes
            recorrentes (ex.: "High-value", "Bloqueados").
          </>
        ),
        placement: "bottom",
        target: ['[aria-label="Visões salvas"]', '[role="tablist"]'],
      },
      {
        title: "Tabela · Lista · Kanban",
        body: (
          <>
            Os <strong>mesmos dados</strong> em 3 visualizações. Kanban agrupa por
            status/etapa (funil); Lista é a versão compacta. O recorte (filtros/ordem)
            é preservado ao trocar.
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
        target: [
          '[aria-label="Ações em massa"]',
          '[aria-label="Acoes em massa"]',
        ],
      },
      {
        title: "Colunas, densidade e export",
        body: (
          <>
            Escolha <strong>quais colunas</strong> aparecem, ajuste a{" "}
            <strong>densidade</strong> das linhas e <strong>exporte CSV</strong> (tudo
            ou só o selecionado).
          </>
        ),
        placement: "bottom",
        target: [
          '[aria-label="Configurações da tabela"]',
          '[aria-label*="Export" i]',
        ],
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
