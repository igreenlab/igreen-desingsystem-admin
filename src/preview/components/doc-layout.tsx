import { cn } from "@/lib/utils";
import { DocSidebar, type DocNavSection } from "./doc-sidebar";
import { TOC, type TocItem } from "./doc-toc";
import { useDocNav } from "./doc-context";

/**
 * DocLayout — Template de página de documentação.
 * sidebar é opcional — quando omitido, o App.tsx renderiza o sidebar externamente (persistente).
 * wide — páginas que precisam de mais largura (ex.: composições de dashboard).
 */
export function DocLayout({
  sidebar,
  toc,
  children,
  wide = false,
}: {
  sidebar?: DocNavSection[];
  toc: TocItem[];
  children: React.ReactNode;
  wide?: boolean;
}) {
  const { onNavigate } = useDocNav();

  return (
    <div className="flex min-h-screen bg-bg-canvas">
      {sidebar && <DocSidebar sections={sidebar} onNavigate={onNavigate} />}
      {/*
        `min-w-0` é o que faz a página caber no celular. Sem ele, o `min-width:
        auto` default de um flex item impede encolher abaixo da largura INTRÍNSECA
        do conteúdo — e os blocos de código têm strings longas sem ponto de quebra
        (`brands/default/primitives/`), que exigiam 474px num viewport de 390.
        O resultado era texto cortado na borda direita, sem padding.

        `[&_pre]:` faz cada bloco de código rolar SOZINHO em vez de esticar a
        página. Aplicado aqui, no layout, porque são 40+ doc pages — não dá pra
        confiar em cada uma se lembrar.

        Padding menor no mobile: 24px de cada lado num viewport de 390 é 12% da
        tela só em margem.
      */}
      <div className="flex-1 min-w-0 px-pad-xl sm:px-pad-4xl py-pad-4xl xl:pr-[290px] [&_pre]:overflow-x-auto [&_pre]:max-w-full">
        <div className="fixed top-10 right-8 w-[250px] hidden xl:block">
          <TOC items={toc} />
        </div>
        <div className={cn("mx-auto", wide ? "max-w-[1180px]" : "max-w-[744px]")}>
          {children}
        </div>
      </div>
    </div>
  );
}
