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
      <div className="flex-1 px-pad-4xl py-pad-4xl xl:pr-[290px]">
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
