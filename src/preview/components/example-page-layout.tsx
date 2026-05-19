import { useState, type ReactNode } from "react";
import { Check, ChevronDown, Code, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export type ExamplePageLayoutProps = {
  /** Etiqueta superior (ex: "Data Table Examples"). */
  category: string;
  /** Título principal compacto. */
  title: string;
  /** Descrição curta (max ~640px de largura). */
  description: string;
  /**
   * Snippet de código mostrado no card expansível do rodapé.
   * String literal (template string) — não tenta ser "live preview".
   */
  code: string;
  /** Preview principal — a tabela, board, ou qualquer componente em demo. */
  children: ReactNode;
  /** ClassName extra no root (raro). */
  className?: string;
};

/**
 * Layout standalone pra páginas de exemplo (ClientsCRUDPreview, etc).
 *
 * Diferente das doc pages (TableDoc, KanbanDoc) que usam `<DocLayout>` com
 * sidebar/TOC, esta layout é "full-screen" — o preview ocupa o body inteiro
 * como se fosse uma tela real do app. Inclui:
 *
 * - Header compacto (label brand + título 18px + descrição 14px)
 * - Padding lateral `px-pad-page-lg` (40px) — mais respiro que pages-base
 * - Preview ocupando flex-1 do main
 * - Card de código expansível no rodapé (collapsed por default; click expande)
 *
 * O `code` é estático — snippet conceitual pra consumer entender como montar.
 * Não tenta ser uma fonte da verdade do JSX renderizado.
 */
export function ExamplePageLayout({
  category,
  title,
  description,
  code,
  children,
  className,
}: ExamplePageLayoutProps) {
  const [codeOpen, setCodeOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore — clipboard pode ser bloqueado em ambiente sem secure context
    }
  };

  return (
    <div className={cn("flex flex-col h-screen overflow-hidden bg-bg-canvas", className)}>
      {/* Header compacto */}
      <header className="shrink-0 px-pad-page-lg py-pad-2xl border-b border-border-subtle">
        <p className="text-body-xs text-fg-brand uppercase tracking-wide">
          {category}
        </p>
        <h1 className="text-title-lg text-fg-strong mt-sp-2xs">{title}</h1>
        <p className="text-body-md text-fg-muted max-w-[640px] mt-sp-xs">
          {description}
        </p>
      </header>

      {/* Preview — ocupa o resto do viewport.
          `h-screen` no root + `flex-1 min-h-0` aqui é o que dá altura fixa
          pro container do preview (necessário pra virtualização do
          react-virtual funcionar: sem altura definida, ele renderiza TUDO
          e o browser trava em datasets grandes). */}
      <main className="flex-1 min-h-0 flex flex-col px-pad-page-lg py-pad-2xl overflow-hidden">
        <div className="flex-1 min-h-0 flex overflow-hidden">{children}</div>
      </main>

      {/* Card de código (collapsed por default) */}
      <section className="shrink-0 mx-pad-page-lg mb-pad-2xl border border-border-subtle rounded-radius-lg bg-bg-subtle overflow-hidden">
        <header
          className={cn(
            "flex items-center justify-between gap-gp-md",
            "px-pad-xl py-pad-md cursor-pointer select-none",
            "hover:bg-bg-muted transition-[background-color] duration-150",
            codeOpen && "border-b border-border-subtle",
          )}
          onClick={() => setCodeOpen((v) => !v)}
          role="button"
          tabIndex={0}
          aria-expanded={codeOpen}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setCodeOpen((v) => !v);
            }
          }}
        >
          <div className="flex items-center gap-gp-sm text-body-md font-medium font-medium text-fg-default">
            <Code className="size-icon-sm text-fg-muted" aria-hidden />
            <span>Ver código deste exemplo</span>
          </div>
          <div className="flex items-center gap-gp-sm">
            {codeOpen && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleCopy();
                }}
                className={cn(
                  "inline-flex items-center gap-gp-2xs",
                  "px-pad-md py-pad-2xs rounded-radius-md",
                  "text-body-sm font-normal text-fg-muted",
                  "hover:bg-bg-muted-hover hover:text-fg-default",
                  "transition-[background-color,color] duration-150",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
                )}
                aria-label="Copiar código"
              >
                {copied ? (
                  <>
                    <Check className="size-icon-xs" aria-hidden />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="size-icon-xs" aria-hidden />
                    Copiar
                  </>
                )}
              </button>
            )}
            <ChevronDown
              className={cn(
                "size-icon-sm text-fg-muted transition-transform duration-150",
                codeOpen && "rotate-180",
              )}
              aria-hidden
            />
          </div>
        </header>
        {codeOpen && (
          <pre
            className={cn(
              "px-pad-xl py-pad-md",
              "text-code-sm font-mono text-fg-default",
              "overflow-x-auto whitespace-pre scrollbar-thin",
              "max-h-[420px] overflow-y-auto",
            )}
          >
            {code}
          </pre>
        )}
      </section>
    </div>
  );
}
