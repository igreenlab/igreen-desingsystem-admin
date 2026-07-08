import { useMemo, useRef, useState } from "react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import ClientesFinanceiroShowcase from "./ClientesFinanceiroShowcase";
import { GuidedTour, type TourStep } from "../components/guided-tour";

/**
 * FinanceTutorialShowcase — standalone (`?app=finance-tutorial`) que reusa a tela
 * financeira real (ClientesFinanceiroShowcase = AppShell + DataTable) e sobrepõe
 * um tour guiado (GuidedTour, DS-native) percorrendo os recursos da tabela.
 *
 * Showcase-only: nenhum componente do DS é modificado. Passos que precisam de
 * estado (dropdown aberto, filtro aplicado, row detalhada) disparam a interação
 * no onEnter (via click/pointer) e revertem no onLeave. Alvos são resolvidos por
 * ARIA/estrutura; popovers são portados pro body (busca no document).
 */
export default function FinanceTutorialShowcase() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<number>(0);
  const [open, setOpen] = useState(true);

  const steps = useMemo<TourStep[]>(() => {
    const scope = () => scopeRef.current;
    const q = (sel: string) => scope()?.querySelector(sel) ?? null;
    const qa = (sel: string) => [...(scope()?.querySelectorAll(sel) ?? [])];

    // dispara sequência de pointer (Radix abre no pointerdown, não no click puro).
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

    const findDialog = (re: RegExp) =>
      [...document.querySelectorAll('[role="dialog"],[role="menu"]')].find(
        (d) => d.getAttribute("aria-label") !== "Tour guiado" && re.test(d.textContent ?? ""),
      ) ?? null;

    const anyPopoverOpen = () =>
      !!document.querySelector('[role="dialog"]:not([aria-label="Tour guiado"]),[role="menu"]');
    // Esc só quando há popover aberto (o tour ignora Esc nesse caso — fecha o
    // popover, não o tour; sem popover, um Esc "solto" fecharia o próprio tour).
    const closePopover = () => {
      if (anyPopoverOpen())
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    };

    // abre um popover pelo trigger, com atraso (a UI precisa assentar após a
    // troca de passo; o retry-measure do tour ancora quando aparecer).
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
          // clica o cabeçalho pra ordenar — o título (não o botão ⋯ do menu).
          const h = qa('[role="columnheader"]').find((x) => /Volume|Saldo/i.test(x.textContent ?? ""));
          const title = [...(h?.querySelectorAll("*") ?? [])].find(
            (e) => e.children.length === 0 && /Volume|Saldo/i.test(e.textContent ?? ""),
          );
          (title as HTMLElement)?.click();
        },
        target: () =>
          qa('[role="columnheader"]').find((x) => /Volume|Saldo/i.test(x.textContent ?? "")) ?? null,
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
        target: () =>
          qa('[role="columnheader"]').find((x) => /Razão|CNPJ/i.test(x.textContent ?? "")) ?? null,
      },
      {
        title: "Menu da coluna",
        body: (
          <>
            O menu <code>⋯</code> (aparece no hover do cabeçalho) traz{" "}
            <strong>ordenar, fixar, ocultar</strong> e filtrar só por aquela coluna.
          </>
        ),
        placement: "right",
        ...openStep(() => {
          const h = qa('[role="columnheader"]').find((x) => /Licenciado/i.test(x.textContent ?? ""));
          fire(h, "pointerover");
          fire(h, "mouseover");
          return document.querySelector('[aria-label^="Menu da coluna Licenciado"]');
        }, true),
        target: () => findDialog(/Ordenar crescente|Fixar à esquerda|Ocultar/i),
      },
      {
        title: "Filtros por coluna",
        body: (
          <>
            Cada coluna vira um filtro (tipo certo: texto, número, data, seleção). Abra
            o painel pra montar os filtros de uma vez.
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
            <em>Saldo ≥ R$ 5k</em>). O <code>×</code> remove; pelo painel de Filtros
            você edita o valor.
          </>
        ),
        placement: "bottom",
        noScroll: true,
        onEnter: () => {
          clearTimeout(openTimer.current);
          // abre o "+" de visões e aplica o preset "Alto valor" (aplica filtro+sort).
          (q('button[aria-label="Visões salvas"]') as HTMLElement)?.click();
          openTimer.current = window.setTimeout(() => {
            const dlg = document.querySelector('[role="dialog"]');
            const item = [...(dlg?.querySelectorAll("*") ?? [])].find(
              (el) => el.children.length === 0 && /Alto valor/i.test(el.textContent ?? ""),
            );
            (item as HTMLElement)?.click();
            // fecha o popover de visões — o chip (filtro aplicado) permanece.
            window.setTimeout(closePopover, 220);
          }, 260);
        },
        onLeave: () => {
          clearTimeout(openTimer.current);
          closePopover();
        },
        target: () => q('[aria-label^="Remover filtro"]')?.closest("span") ?? null,
      },
      {
        title: "Visões salvas — as abas",
        body: (
          <>
            As visões já criadas ficam como <strong>abas</strong> (ex.: <em>Default</em>,{" "}
            <em>Alto valor</em>). Clicar aplica o recorte inteiro de uma vez.
          </>
        ),
        placement: "bottom",
        target: '[role="tablist"]',
      },
      {
        title: "Criar / buscar visões — o +",
        body: (
          <>
            O <strong>+</strong> abre o gerenciador: <strong>salvar a visão atual</strong>{" "}
            e alternar entre <em>Pessoais</em> e <em>Todos</em> — inclusive visões salvas
            por <strong>outras pessoas</strong> do time.
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
            Selecione linhas (checkbox) pra agir em lote — exportar, pausar, etc. A
            barra de ações mostra o total selecionado.
          </>
        ),
        placement: "top",
        onEnter: () => (q('[aria-label="Selecionar linha"]') as HTMLElement)?.click(),
        onLeave: () => (q('[aria-label="Selecionar linha"]') as HTMLElement)?.click(),
        target: ['[aria-label="Ações em massa"]', '[aria-label="Acoes em massa"]'],
      },
      {
        title: "Clique na linha → detalhe",
        body: (
          <>
            Clicar numa linha abre o <strong>painel de detalhe</strong> (saldos, conta,
            contato, ações) sem sair da tela.
          </>
        ),
        placement: "left",
        noScroll: true,
        onEnter: () => {
          clearTimeout(openTimer.current);
          closePopover();
          openTimer.current = window.setTimeout(() => {
            // clica a célula do NOME (não checkbox/switch/ações) pra abrir o detalhe.
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
      {
        title: "Colunas, densidade e export",
        body: (
          <>
            Em <strong>Configurações da tabela</strong>: escolha as colunas visíveis,
            ajuste a <strong>densidade</strong> e <strong>exporte CSV</strong>.
          </>
        ),
        placement: "left",
        ...openStep(() => q('[aria-label="Configurações da tabela"]')),
        target: () => findDialog(/Configura[çc][õo]es da tabela|Ordena[çc][ãa]o.*Colunas/i),
      },
      {
        title: "Totalizadores no rodapé",
        body: (
          <>
            O rodapé soma/agrega as colunas numéricas (saldo, volume, média) — respeita o
            recorte atual (filtros aplicados).
          </>
        ),
        placement: "top",
        target: () => {
          const el = qa("*").find(
            (e) => e.children.length === 0 && /\d+\s*clientes/i.test(e.textContent ?? ""),
          );
          let row: Element | null | undefined = el;
          for (let i = 0; i < 6 && row; i++) {
            if ((row as HTMLElement).offsetWidth > 600) break;
            row = row.parentElement;
          }
          return row ?? el ?? null;
        },
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
