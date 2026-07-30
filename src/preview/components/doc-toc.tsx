import { useState, useEffect } from "react";
import { TocIcon } from "./doc-icons";

export type TocItem = {
  id: string;
  label: string;
  indent?: boolean;
};

export function TOC({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const scrollParent = document.querySelector("main");
    if (!scrollParent || !items.length) return;

    // Semântica: ativo = o ÚLTIMO item cuja borda superior já passou da linha dos
    // 120px. É a heurística clássica de "seção que você está lendo".
    //
    // ⚠️ Não use IntersectionObserver aqui — tentado e reprovado (2026-07-30). IO
    // sinaliza CRUZAMENTO de interseção, não posição: um salto de scroll que leva
    // uma âncora de "abaixo da faixa" pra "acima da faixa" mantém
    // `isIntersecting: false` nas duas pontas, não cruza limiar nenhum e NÃO
    // dispara callback. Âncora alta disfarça o bug (sempre intersecta em algum
    // momento); âncora fina, não — o `#historico` da página de Updates tem 33px e
    // nunca acendia depois de um clique no TOC.
    //
    // O custo do scroll listener era N `getBoundingClientRect()` por EVENTO, e
    // eventos de scroll chegam várias vezes por frame. Com throttle de rAF passa a
    // ser N por FRAME, no máximo — e N aqui é ~4 a 10 âncoras por página. É a
    // leitura de layout que o navegador ia fazer de todo jeito pra pintar o frame.
    let agendado = false;

    const recalcular = () => {
      agendado = false;
      // Fora do loop: 1 leitura, não N.
      const topoDoContainer = scrollParent.getBoundingClientRect().top;
      let atual = items[0]?.id ?? "";
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top - topoDoContainer <= 120) {
          atual = item.id;
        }
      }
      if (atual) setActiveId(atual);
    };

    const onScroll = () => {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(recalcular);
    };

    scrollParent.addEventListener("scroll", onScroll, { passive: true });
    recalcular();
    return () => scrollParent.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <nav>
      <p className="text-caption-sm font-semibold text-fg-subtle uppercase tracking-wider mb-gp-xl flex items-center gap-gp-sm">
        <TocIcon /> ON THIS PAGE
      </p>
      <div className="flex flex-col gap-gp-2xs border-l-2 border-border-subtle pl-pad-2xl">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={[
                "text-body-md font-medium transition-colors leading-relaxed py-pad-xs",
                isActive
                  ? "text-fg-brand font-medium"
                  : "text-fg-muted font-normal hover:text-fg-brand",
              ].join(" ")}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
