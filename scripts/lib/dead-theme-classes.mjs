/**
 * dead-theme-classes — acha classe de COR do DS que não emite CSS nenhum porque
 * a CSS var correspondente não existe no tema gerado. Puro, zero I/O.
 *
 * Por que existe: é a classe de defeito da L-057 (`max-w-container-*`), e ela
 * escapa de TODOS os gates do repo. Classe inexistente não quebra o build, não
 * quebra o `tsc` (é string), não quebra teste (nada renderiza cor em jsdom) e o
 * ratchet do `lint-styles` não vê (ele procura token literal do Tailwind, não
 * var ausente). Medido em 2026-07-30: **25 usos** em 14 arquivos, incluindo 9×
 * `ring-ring-primary` em 4 componentes distribuídos — anel de foco caindo em
 * `currentColor` em vez da marca, ou seja regressão de acessibilidade silenciosa.
 * A causa era doc: o `CLAUDE.md` e o `.ai/context/tokens/color.md` ensinavam a
 * nomenclatura V2 (`primary`/`critical`/`foreground`) que o código abandonou.
 *
 * Só cobre `--color-*`, que é onde o defeito foi medido. Estender pra
 * `--spacing-*` / `--radius-*` / `--shadow-*` é acrescentar uma linha em
 * `NAMESPACES` — mas só faça isso com um defeito real em mão (L-064).
 *
 * ⚠️ A fronteira à DIREITA é load-bearing. Sem o `(?![a-z0-9-])`,
 * `border-border-warning` casa dentro de `border-border-warning-muted` — que é
 * a classe CORRETA — e o check acusa ~40 falsos-positivos em código bom. Isso
 * aconteceu de verdade durante a construção deste módulo, e quase virou uma
 * edição em 20 arquivos que estavam certos.
 */

/**
 * Utilities do DS usam prefixo dobrado: `bg-bg-*`, `text-fg-*`,
 * `border-border-*`, `ring-ring-*`. O 2º segmento é o escopo dentro da var.
 */
const NAMESPACES = [
  { prefixos: ["bg", "from", "to", "via"], escopo: "bg" },
  { prefixos: ["text"], escopo: "fg" },
  { prefixos: ["border", "divide"], escopo: "border" },
  { prefixos: ["ring"], escopo: "ring" },
];

/** Extrai os nomes de var de cor definidos no tema (`--color-<nome>:`). */
export function varsDeCor(cssText) {
  return new Set([...cssText.matchAll(/--color-([a-z0-9-]+)\s*:/g)].map((m) => m[1]));
}

/**
 * @param {string} cssText  conteúdo de src/styles/theme/tailwind-theme.css
 * @param {Array<{file: string, text: string}>} fontes  arquivos .ts/.tsx/.md de src/
 * @returns {{varsConhecidas: number, usosVarridos: number,
 *            mortas: Array<{classe: string, file: string, line: number}>}}
 */
export function deadThemeClasses(cssText, fontes) {
  const conhecidas = varsDeCor(cssText);
  const mortas = [];
  let usosVarridos = 0;

  for (const { file, text } of fontes) {
    const linhas = text.split("\n");
    for (const { prefixos, escopo } of NAMESPACES) {
      const re = new RegExp(
        `(?<![a-z0-9-])(?:${prefixos.join("|")})-(${escopo}-[a-z0-9-]+?)(/\\d+)?(?![a-z0-9-])`,
        "g",
      );
      for (let i = 0; i < linhas.length; i++) {
        for (const m of linhas[i].matchAll(re)) {
          usosVarridos++;
          if (conhecidas.has(m[1])) continue;
          mortas.push({ classe: m[0], file, line: i + 1 });
        }
      }
    }
  }

  return { varsConhecidas: conhecidas.size, usosVarridos, mortas };
}
