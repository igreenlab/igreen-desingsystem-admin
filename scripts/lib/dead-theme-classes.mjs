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

/**
 * Arquivos onde **citar** uma classe morta é o CONTEÚDO, não uso dela. Motivo é
 * obrigatório (mesma convenção do `ds-exceptions.mjs`). Mantenha curta: cada
 * entrada é um ponto cego do gate.
 *
 * `updates-data.ts` é dado puro do changelog — nenhuma string dali vira
 * `className`, e a entry do 0.30.2 precisa escrever `ring-ring-primary` para
 * explicar o que foi corrigido. Sem esta exceção o gate reprovaria a própria
 * release que o criou.
 */
export const EXCECOES = new Map([
  [
    "src/preview/pages/updates-data.ts",
    "changelog: a entry NOMEIA a classe morta pra explicar o fix; o arquivo é dado, não aplica className",
  ],
]);

/**
 * CITAÇÕES declaradas — por (arquivo, classe), não por arquivo inteiro.
 *
 * Existe porque o gate passou a varrer também as SUPERFÍCIES DE DOC (`.claude/`,
 * `.ai/`, `cli/templates/`, `CLAUDE.md`). Ali a classe morta aparece de dois jeitos
 * opostos: **prescrita** (a doc manda usar — é o defeito; foi assim que 44 usos de
 * vocabulário V2 sobreviveram meses nas skills, inclusive no template canônico de
 * implementação) e **citada** (a doc diz que ela NÃO existe — é a correção).
 *
 * Separar os dois por regex seria julgamento de intenção, que a L-059 manda deixar
 * fora de gate mecânico. A saída é a mesma convenção do `EXCECOES` acima: um humano
 * DECLARA a citação, com motivo. No momento do gate isso volta a ser context-free —
 * ou está declarado, ou reprova.
 *
 * Escopo por PAR, de propósito: `CLAUDE.md` pode citar `ring-ring-primary`, mas se
 * alguém escrever `bg-bg-primary` lá amanhã, reprova.
 */
export const CITACOES = new Map([
  [
    "CLAUDE.md",
    new Map([
      ["ring-ring-primary", "§Nomenclatura: nomeia a classe V2 extinta pra explicar o defeito que ela causou (9 usos com o foco caindo em currentColor)"],
      ["bg-bg-success-subtle", "§Nomenclatura: nomeia a forma que NÃO existe pra ensinar que status usa -muted, não -subtle"],
      ["border-border-warning", "§Nomenclatura: idem — a forma crua não existe, só a -muted"],
    ]),
  ],
  [
    "cli/templates/default/CLAUDE.md",
    new Map([
      ["ring-ring-primary", "anti-pattern do consumidor: nomeia a classe morta pra impedir que a IA a escreva — o texto anterior mandava USÁ-LA como correção"],
    ]),
  ],
  [
    // A regra que DOCUMENTA este gate precisa nomear os defeitos que ele pega.
    // Pegou a si mesma na 1ª execução — sinal de que o escopo está certo.
    ".claude/rules/ds-standards.md",
    new Map([
      ["ring-ring-primary", "§Classe de cor morta: nomeia o caso real que motivou estender o gate pras docs"],
      ["ring-ring-primary/30", "idem — o anti-pattern do consumidor citado na íntegra, com o modificador de opacidade"],
      ["bg-bg-primary", "§Classe de cor morta: exemplo de que a citação é por PAR (arquivo, classe), não cega o arquivo"],
    ]),
  ],
  [
    ".claude/skills/ds-dev/impl-igreen.md",
    new Map([["bg-bg-disabled", "comentário do compoundVariant disabled: explica que não existe e que o padrão do DS é opacity-50"]]),
  ],
  [
    ".ai/context/components/guide.md",
    new Map([["bg-bg-disabled", "idem — mesmo comentário no exemplo canônico de tv()"]]),
  ],
  [
    ".ai/rules/coding-standards.md",
    new Map([["bg-bg-disabled", "idem — mesmo comentário na referência longa do padrão tv()"]]),
  ],
]);

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
    if (EXCECOES.has(file)) continue;
    const citadas = CITACOES.get(file);
    const linhas = text.split("\n");
    for (const { prefixos, escopo } of NAMESPACES) {
      const re = new RegExp(
        `(?<![a-z0-9-])(?:${prefixos.join("|")})-(${escopo}-[a-z0-9-]+?)(/\\d+)?(?![a-z0-9-])`,
        "g",
      );
      for (let i = 0; i < linhas.length; i++) {
        for (const m of linhas[i].matchAll(re)) {
          /* Placeholder de template não é classe: `text-fg-on-{cor}`, `bg-bg-{status}`.
             O `{` logo depois é o sinal, e ele é context-free — nenhuma classe real
             tem chave. Sem isto, a doc que ENSINA o padrão por template reprovava. */
          if (linhas[i][m.index + m[0].length] === "{") continue;

          usosVarridos++;
          if (conhecidas.has(m[1])) continue;
          // citação declarada por (arquivo, classe) — ver CITACOES
          if (citadas?.has(m[0])) continue;
          mortas.push({ classe: m[0], file, line: i + 1 });
        }
      }
    }
  }

  return { varsConhecidas: conhecidas.size, usosVarridos, mortas };
}
