import { useMemo, useRef, useState } from "react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import ClientesFinanceiroShowcase from "./ClientesFinanceiroShowcase";
import { GuidedTour, type TourStep } from "../components/guided-tour";

/**
 * FinanceTutorialShowcase — standalone (`?app=finance-tutorial`) que reusa a tela
 * financeira real (ClientesFinanceiroShowcase = AppShell + DataTable) e sobrepõe
 * um tour guiado (GuidedTour, DS-native).
 *
 * Padrão "antes/depois": cada recurso que abre algo (menu de coluna, filtros, +
 * de visões, configurações, detalhe da linha) tem 2 passos — primeiro o botão
 * FECHADO (onde fica), depois ABERTO. Showcase-only: nada do DS é modificado.
 */
export default function FinanceTutorialShowcase() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<number>(0);
  const [open, setOpen] = useState(true);

  const steps = useMemo<TourStep[]>(() => {
    const scope = () => scopeRef.current;
    const q = (sel: string) => scope()?.querySelector(sel) ?? null;
    const qa = (sel: string) => [...(scope()?.querySelectorAll(sel) ?? [])];
    const header = (re: RegExp) =>
      qa('[role="columnheader"]').find((h) => re.test(h.textContent ?? "")) ?? null;

    const fire = (el: Element | null | undefined, type: string) =>
      el?.dispatchEvent(
        new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, button: 0 }),
      );
    const pointerClick = (el: Element | null | undefined) => {
      fire(el, "pointerover");
      fire(el, "pointerenter");
      fire(el, "pointerdown");
      fire(el, "pointerup");
      (el as HTMLElement | null)?.click();
    };
    // revela o botão ⋯ (hover-only) da coluna Licenciado e retorna ele.
    const revealColMenuBtn = () => {
      const h = header(/Licenciado/i);
      fire(h, "pointerover");
      fire(h, "mouseover");
      return document.querySelector('[aria-label^="Menu da coluna Licenciado"]');
    };

    const findDialog = (re: RegExp) =>
      [...document.querySelectorAll('[role="dialog"],[role="menu"]')].find(
        (d) => d.getAttribute("aria-label") !== "Tour guiado" && re.test(d.textContent ?? ""),
      ) ?? null;

    const anyPopoverOpen = () =>
      !!document.querySelector(
        '[role="dialog"]:not([aria-label="Tour guiado"]),[role="menu"]',
      );
    const closePopover = () => {
      if (anyPopoverOpen())
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    };

    // "depois": abre um popover pelo trigger, com atraso (a UI assenta após a
    // troca de passo). onLeave limpa o timer e fecha o popover.
    const openStep = (getTrigger: () => Element | null, viaPointer = false) => ({
      noScroll: true,
      onEnter: () => {
        clearTimeout(openTimer.current);
        openTimer.current = window.setTimeout(
          () => (viaPointer ? pointerClick(getTrigger()) : (getTrigger() as HTMLElement)?.click()),
          260,
        );
      },
      onLeave: () => {
        clearTimeout(openTimer.current);
        closePopover();
      },
    });

    return [
      {
        title: "Busca global",
        body: (
          <>
            Filtra <strong>todas as colunas</strong> ao digitar. Combina com filtros e
            ordenação — o jeito mais rápido de achar uma linha.
          </>
        ),
        placement: "bottom",
        target: () => {
          const inp = q("input[type=text]");
          return (inp?.closest("label") as Element | null) ?? inp;
        },
      },
      {
        title: "Ordenar por coluna",
        body: (
          <>
            Clique no <strong>cabeçalho</strong> pra ordenar (asc → desc → limpar).
            Segure <code>Shift</code> pra ordenar por várias colunas.
          </>
        ),
        placement: "bottom",
        onEnter: () => {
          const h = header(/Volume|Saldo/i);
          const title = [...(h?.querySelectorAll("*") ?? [])].find(
            (e) => e.children.length === 0 && /Volume|Saldo/i.test(e.textContent ?? ""),
          );
          (title as HTMLElement)?.click();
        },
        target: () => header(/Volume|Saldo/i),
      },
      {
        title: "Redimensionar coluna",
        body: (
          <>
            <strong>Arraste a borda direita</strong> do cabeçalho pra alargar ou
            estreitar a coluna. A largura fica salva na visão.
          </>
        ),
        placement: "bottom",
        target: () => header(/Razão|CNPJ/i),
      },

      // ── Menu da coluna: antes (botão ⋯) → depois (menu aberto) ──────────
      {
        title: "Menu da coluna — onde fica",
        body: (
          <>
            Passe o mouse no cabeçalho e aparece o <code>⋯</code>. Ele concentra as
            ações <strong>daquela coluna</strong>.
          </>
        ),
        placement: "bottom",
        noScroll: true,
        // o ⋯ é hover-only (some na medição) → spotlight no cabeçalho inteiro,
        // com o hover disparado pra o ⋯ aparecer dentro do recorte.
        onEnter: () => revealColMenuBtn(),
        target: () => {
          revealColMenuBtn();
          return header(/Licenciado/i);
        },
      },
      {
        title: "Menu da coluna — aberto",
        body: (
          <>
            Aberto, traz <strong>ordenar</strong>, <strong>fixar</strong> à esquerda/
            direita e <strong>ocultar</strong> a coluna.
          </>
        ),
        placement: "right",
        ...openStep(revealColMenuBtn, true),
        target: () => findDialog(/Ordenar crescente|Fixar à esquerda|Ocultar/i),
      },

      // ── Filtros: antes (botão) → depois (painel aberto) ────────────────
      {
        title: "Filtros — onde fica",
        body: (
          <>
            O ícone de <strong>funil</strong> na toolbar abre o painel de filtros por
            coluna.
          </>
        ),
        placement: "bottom",
        target: '[aria-label="Filtros"]',
      },
      {
        title: "Filtros — painel aberto",
        body: (
          <>
            Cada coluna vira um filtro do tipo certo (texto, número, data, seleção). Monte
            vários de uma vez.
          </>
        ),
        placement: "left",
        ...openStep(() => q('[aria-label="Filtros"]')),
        target: () => findDialog(/filtros?\s*ativos|filtro ativo/i),
      },
      {
        title: "Filtro aplicado vira chip",
        body: (
          <>
            Todo filtro ativo aparece como <strong>chip</strong> na toolbar (aqui:{" "}
            <em>Saldo ≥ R$ 5k</em>). O <code>×</code> remove; pelo painel de Filtros você
            edita o valor.
          </>
        ),
        placement: "bottom",
        noScroll: true,
        onEnter: () => {
          clearTimeout(openTimer.current);
          (q('button[aria-label="Visões salvas"]') as HTMLElement)?.click();
          openTimer.current = window.setTimeout(() => {
            const dlg = document.querySelector('[role="dialog"]');
            const item = [...(dlg?.querySelectorAll("*") ?? [])].find(
              (el) => el.children.length === 0 && /Alto valor/i.test(el.textContent ?? ""),
            );
            (item as HTMLElement)?.click();
            window.setTimeout(closePopover, 220); // fecha o popover; o chip permanece
          }, 260);
        },
        onLeave: () => {
          clearTimeout(openTimer.current);
          closePopover();
        },
        target: () => q('[aria-label^="Remover filtro"]')?.closest("span") ?? null,
      },

      // ── Visões: abas → antes (botão +) → depois (gerenciador) ──────────
      {
        title: "Visões salvas — as abas",
        body: (
          <>
            As visões já criadas ficam como <strong>abas</strong> (ex.: <em>Default</em>,{" "}
            <em>Alto valor</em>). Clicar aplica o recorte inteiro.
          </>
        ),
        placement: "bottom",
        target: '[role="tablist"]',
      },
      {
        title: "Criar / buscar visões — o +",
        body: (
          <>
            O <strong>+</strong> ao lado das abas abre o gerenciador de visões.
          </>
        ),
        placement: "bottom",
        target: 'button[aria-label="Visões salvas"]',
      },
      {
        title: "Gerenciador de visões — aberto",
        body: (
          <>
            <strong>Salvar a visão atual</strong> e alternar entre <em>Pessoais</em> e{" "}
            <em>Todos</em> — inclusive visões salvas por <strong>outras pessoas</strong> do
            time.
          </>
        ),
        placement: "left",
        ...openStep(() => q('button[aria-label="Visões salvas"]')),
        target: () => findDialog(/Salvar visão atual|Pessoais.*Todos|Todos.*Pessoais/i),
      },

      {
        title: "Tabela e Kanban",
        body: (
          <>
            Os <strong>mesmos dados</strong> como Tabela densa ou Kanban (funil por
            status). O recorte é preservado ao trocar.
          </>
        ),
        placement: "bottom",
        target: '[role="radiogroup"]',
      },
      {
        title: "Seleção e ações em massa",
        body: (
          <>
            Selecione linhas (checkbox) pra agir em lote — exportar, pausar, etc. A barra
            de ações mostra o total selecionado.
          </>
        ),
        placement: "top",
        onEnter: () => (q('[aria-label="Selecionar linha"]') as HTMLElement)?.click(),
        onLeave: () => (q('[aria-label="Selecionar linha"]') as HTMLElement)?.click(),
        target: ['[aria-label="Ações em massa"]', '[aria-label="Acoes em massa"]'],
      },

      // ── Linha: antes (a linha) → depois (detalhe aberto) ───────────────
      {
        title: "Clique numa linha",
        body: (
          <>
            Qualquer linha é clicável (fora dos controles). Clicar abre o painel de
            detalhe do cliente.
          </>
        ),
        placement: "bottom",
        target: () => qa('[role="row"]').find((r) => /CLI-/i.test(r.textContent ?? "")) ?? null,
      },
      {
        title: "Painel de detalhe — aberto",
        body: (
          <>
            Mostra saldos, conta bancária, contato, gestão e <strong>ações</strong> (sacar,
            editar) sem sair da tela.
          </>
        ),
        placement: "left",
        noScroll: true,
        onEnter: () => {
          clearTimeout(openTimer.current);
          closePopover();
          openTimer.current = window.setTimeout(() => {
            const row = qa('[role="row"]').find((r) => /CLI-/i.test(r.textContent ?? ""));
            const cells = [...(row?.querySelectorAll('[role="gridcell"]') ?? [])];
            const nameCell =
              cells.find((c) => /LTDA|ME|S\.A|Energy|Solar|Eco|@/i.test(c.textContent ?? "")) ??
              cells[1] ??
              cells[0];
            (nameCell as HTMLElement)?.click();
          }, 420);
        },
        onLeave: () => {
          clearTimeout(openTimer.current);
          closePopover();
        },
        target: () => findDialog(/Saldo dispon[íi]vel|Conta banc[áa]ria|Editar/i),
      },

      // ── Configurações: antes (botão) → depois (painel aberto) ──────────
      {
        title: "Configurações da tabela — onde fica",
        body: (
          <>
            O ícone de <strong>ajustes</strong> na toolbar abre as configurações de
            exibição.
          </>
        ),
        placement: "bottom",
        target: '[aria-label="Configurações da tabela"]',
      },
      {
        title: "Colunas, densidade e export — aberto",
        body: (
          <>
            Escolha as <strong>colunas</strong> visíveis, ajuste a <strong>densidade</strong>{" "}
            das linhas e <strong>exporte CSV</strong>.
          </>
        ),
        placement: "left",
        ...openStep(() => q('[aria-label="Configurações da tabela"]')),
        target: () => findDialog(/Configura[çc][õo]es da tabela|Ordena[çc][ãa]o.*Colunas/i),
      },

      {
        title: "Totais no rodapé",
        body: (
          <>
            A linha fixa no rodapé (<em>N clientes</em>) soma/agrega as colunas numéricas —
            saldo, volume, média — respeitando o recorte atual.
          </>
        ),
        placement: "top",
        target: () => qa('[role="row"]').find((r) => /\d+\s*clientes/i.test(r.textContent ?? "")) ?? null,
      },
      {
        title: "Paginação",
        body: (
          <>
            Navegue entre páginas e ajuste <strong>itens por página</strong>. Na Lista/
            Kanban a paginação é opcional.
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
