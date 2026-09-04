import { useId } from "react";
import { ganttLinkPath, ganttLinksLayer } from "../gantt.styles";
import { linkPath, linkSides } from "../hooks/links";
import type { GanttLink } from "../gantt.types";

/**
 * As setas de vínculo, em SVG.
 *
 * ## Por que é uma camada irmã do canvas, não filha das células
 *
 * A seta vai de uma linha a outra, e precisa desenhar **por cima** da grade e
 * **fora** dos limites da linha de origem. Filha da célula, ela seria recortada
 * pelo `overflow` de qualquer ancestral — e desapareceria exatamente quando
 * cruza pra outra linha, que é sempre.
 *
 * É o mesmo defeito que o `DragOverlay` resolveu no `Scheduler` na v0.56.0: o
 * bloco arrastado sumia atrás das grades, recortado por **3** ancestrais
 * diferentes, e a primeira hipótese (z-index) estava errada — era clipping.
 *
 * `pointer-events-none` na camada e `auto` só nos paths: sem isso a camada
 * cobriria o canvas inteiro e nenhuma barra receberia clique.
 *
 * ## Ortogonal, não Bézier
 *
 * Com 40 vínculos, curvas viram um emaranhado onde não se segue nenhuma;
 * segmentos retos com cotovelo se leem mesmo cruzados. É o que todas as
 * referências com muitos vínculos fazem.
 */

export type GanttLinkGeometry = {
  link: GanttLink;
  /** Âncora de saída, já em px relativos ao canvas. */
  from: { x: number; y: number };
  to: { x: number; y: number };
  conflict: boolean;
  critical: boolean;
};

export type GanttLinksLayerProps = {
  links: GanttLinkGeometry[];
  width: number;
  height: number;
  onLinkClick?: (link: GanttLink) => void;
};

export function GanttLinksLayer({
  links,
  width,
  height,
  onLinkClick,
}: GanttLinksLayerProps) {
  /**
   * `useId` no marker porque duas instâncias de `Gantt` na mesma página
   * compartilhariam o `<defs>` por id — e a segunda sobrescreveria a primeira.
   * Medido no `Chart`: o `<style>` do `ChartContainer` tem o mesmo problema e
   * usa a mesma solução (L-032).
   */
  const uid = useId().replace(/:/g, "");
  const seta = `gantt-arrow-${uid}`;
  const setaConflito = `gantt-arrow-conflict-${uid}`;

  if (links.length === 0) return null;

  return (
    <svg
      className={ganttLinksLayer()}
      width={width}
      height={height}
      // `overflow: visible` no atributo E na classe: o SVG recorta no viewBox
      // por default, e uma seta que sai um pixel além some a ponta.
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      focusable="false"
    >
      <defs>
        {/* `context-stroke` faz a ponta herdar a cor do path, então não é
            preciso um marker por variante de cor. */}
        <marker
          id={seta}
          viewBox="0 0 8 8"
          refX="6"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 6 4 L 0 7 z" fill="context-stroke" />
        </marker>
        <marker
          id={setaConflito}
          viewBox="0 0 8 8"
          refX="6"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 6 4 L 0 7 z" fill="context-stroke" />
        </marker>
      </defs>

      {links.map((g) => {
        const tipo = g.link.type ?? "FS";
        const lados = linkSides(tipo);
        const d = linkPath(g.from, g.to, lados);
        const state = g.conflict ? "conflict" : g.critical ? "critical" : "default";

        return (
          <path
            key={g.link.id}
            d={d}
            className={ganttLinkPath({ state })}
            markerEnd={`url(#${g.conflict ? setaConflito : seta})`}
            onClick={() => onLinkClick?.(g.link)}
          >
            {/* `<title>` e não `aria-label`: em SVG é o title que o leitor de
                tela anuncia, e a camada é `aria-hidden` de qualquer forma —
                serve pro tooltip nativo do browser ao passar o mouse. */}
            <title>
              {`${tipo}${g.link.lag ? ` ${g.link.lag > 0 ? "+" : ""}${g.link.lag}d` : ""}`}
              {g.conflict ? " — conflito" : ""}
            </title>
          </path>
        );
      })}
    </svg>
  );
}
