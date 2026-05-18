import { DocSidebar, type DocNavSection } from "./doc-sidebar";
import { TOC, type TocItem } from "./doc-toc";
import { useDocNav } from "./doc-context";

/**
 * DocLayout — Template de página de documentação.
 * sidebar é opcional — quando omitido, o App.tsx renderiza o sidebar externamente (persistente).
 */
export function DocLayout({
  sidebar,
  toc,
  children,
}: {
  sidebar?: DocNavSection[];
  toc: TocItem[];
  children: React.ReactNode;
}) {
  const { onNavigate } = useDocNav();

  return (
    <div className="flex min-h-screen bg-bg-canvas">
      {sidebar && <DocSidebar sections={sidebar} onNavigate={onNavigate} />}
      <div className="flex-1 px-pad-4xl py-pad-4xl xl:pr-[290px]">
        <div className="fixed top-10 right-8 w-[250px] hidden xl:block">
          <TOC items={toc} />
        </div>
        <div className="max-w-[744px] mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
