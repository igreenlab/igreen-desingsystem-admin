"use client";

import { forwardRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useTableContext } from "./table";

/**
 * TableSpanRow — a linha que ocupa a largura inteira da tabela.
 *
 * É a resposta do `Table` ao `colSpan`: aqui a tabela é um grid de `<div>`, não um
 * `<table>`, então não existe atributo `colSpan` pra esticar uma célula. Sem esta peça,
 * "nenhum resultado", "carregando" e cabeçalho de grupo eram montados com uma `TableRow`
 * de uma célula só — que respeita a largura da PRIMEIRA coluna e deixa o texto espremido
 * num canto, com o resto da linha vazio.
 *
 * `sticky` gruda a linha à esquerda no scroll horizontal: numa tabela larga, o "nenhum
 * resultado" sumia de vista ao rolar pro lado.
 */
export type TableSpanRowProps = {
  children: ReactNode;
  /** Altura mínima. Default: `"row"` (a altura de linha da densidade). */
  height?: "row" | "auto";
  /**
   * Mantém o conteúdo visível na rolagem horizontal. Default `true` — numa tabela mais
   * larga que a viewport, o texto centralizado some ao rolar.
   */
  sticky?: boolean;
  /** Alinhamento horizontal do conteúdo. Default `"center"`. */
  align?: "left" | "center";
  className?: string;
};

const ALTURA = {
  compact: "min-h-[40px]",
  standard: "min-h-[56px]",
  comfortable: "min-h-[72px]",
} as const;

export const TableSpanRow = forwardRef<HTMLDivElement, TableSpanRowProps>(
  function TableSpanRow(
    { children, height = "row", sticky = true, align = "center", className },
    ref,
  ) {
    const { density } = useTableContext();

    return (
      <div
        ref={ref}
        role="row"
        className={cn(
          "flex w-full border-b border-border-table bg-bg-table last:border-b-0",
          height === "row" && ALTURA[density],
        )}
      >
        <div
          role="cell"
          className={cn(
            "flex w-full items-center px-pad-2xl py-pad-xl",
            "text-body-sm text-fg-muted",
            align === "center" ? "justify-center" : "justify-start",
            className,
          )}
        >
          {/*
            O `sticky` fica no CONTEÚDO, não na célula: a célula tem a largura total do
            grid (que pode ser bem maior que a tela), então grudá-la não adianta. É o
            texto que precisa acompanhar a rolagem lateral.
          */}
          <span className={cn("min-w-0", sticky && "sticky left-pad-2xl")}>{children}</span>
        </div>
      </div>
    );
  },
);
