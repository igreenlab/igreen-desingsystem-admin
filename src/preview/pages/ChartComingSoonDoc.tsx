import { Construction } from "lucide-react";
import { DocLayout, DocHeader, DocSeparator } from "../components";

/**
 * Placeholder pros tipos de gráfico ainda não construídos (Bars, Lines, Pies,
 * Radars, Radials). Mantém o item no menu sem quebrar o clique. Substituído por
 * uma doc real conforme cada tipo é implementado.
 */
export function ChartComingSoonDoc({ title }: { title: string }) {
  return (
    <DocLayout toc={[]}>
      <DocHeader
        category="Charts"
        title={title}
        description="Exemplos deste tipo de gráfico chegam em breve, no mesmo padrão da página Area Chart."
        dependency="recharts"
      />
      <DocSeparator />
      <div className="flex flex-col items-center justify-center gap-gp-lg rounded-radius-lg border border-dashed border-border-default bg-bg-surface py-pad-7xl text-center">
        <span className="grid size-12 place-items-center rounded-radius-full bg-bg-muted text-fg-muted">
          <Construction className="size-icon-lg" />
        </span>
        <div className="flex flex-col gap-gp-2xs">
          <p className="text-title-md font-semibold text-fg-default">Em breve</p>
          <p className="max-w-sm text-body-sm text-fg-muted">
            Estamos construindo os exemplos de {title} um por um. A base
            (componente Chart + paleta) já está pronta — veja a página Area Chart.
          </p>
        </div>
      </div>
    </DocLayout>
  );
}
