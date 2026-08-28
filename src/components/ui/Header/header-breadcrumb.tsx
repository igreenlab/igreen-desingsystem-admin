import { cn } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { HeaderBreadcrumbItem } from "./header.types";

export type HeaderBreadcrumbProps = {
  items: HeaderBreadcrumbItem[];
  /**
   * Quando true, em mobile (< md) mostra apenas o último item (título da seção
   * atual). Em desktop continua mostrando a cadeia completa.
   */
  mobileShowLastOnly?: boolean;
  className?: string;
};

/**
 * Breadcrumb do Header — hoje é uma casca fina sobre o `<Breadcrumb>` de `ui/`.
 *
 * ## Por que isto encolheu
 *
 * Este arquivo tinha a própria montagem da cadeia E o próprio estilo (`breadcrumbRoot`,
 * `breadcrumbItem`, `breadcrumbSeparator` em `header.styles.ts`), o que fazia o DS ter DOIS
 * breadcrumbs com aparências diferentes: 13px aqui, 14px no primitivo. Quem compunha um
 * caminho fora do Header pegava o outro tamanho sem perceber.
 *
 * Agora a montagem é do componente e o Header só escolhe o tamanho (`size="sm"`, que é
 * exatamente o que estava aqui: 13px na cadeia, 16px/600 quando há um item só) e o
 * comportamento mobile. Medido antes e depois da troca: gap 6px, cadeia 13px/400 com
 * `fg-muted` e o último em `fg-default`, item único 16px/600 — sem desvio.
 */
export function HeaderBreadcrumb({
  items,
  mobileShowLastOnly,
  className,
}: HeaderBreadcrumbProps) {
  if (items.length === 0) return null;

  const ultimo = items[items.length - 1];

  return (
    <>
      {/* Desktop: cadeia completa */}
      <Breadcrumb
        items={items}
        size="sm"
        className={cn("min-w-0", mobileShowLastOnly && "hidden md:block", className)}
      />

      {/* Mobile: só o último item — que continua sendo seletor, se for o caso. É onde mais
          importa: sem ele, trocar de registro no telefone significa voltar à lista. */}
      {mobileShowLastOnly ? (
        <Breadcrumb
          items={[ultimo]}
          size="sm"
          aria-label="Seção atual"
          className={cn("min-w-0 md:hidden", className)}
        />
      ) : null}
    </>
  );
}
