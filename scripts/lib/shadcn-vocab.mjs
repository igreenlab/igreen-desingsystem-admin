/**
 * shadcn-vocab — acha classe de COR do vocabulário SHADCN usada em componente
 * distribuído. Puro, zero I/O.
 *
 * Por que existe: `bg-background`, `ring-foreground`, `bg-muted`, `text-muted-foreground`
 * e `bg-border` resolvem por uma **bridge** (`@theme inline`) que existe só em dois
 * arquivos mantidos à mão — o `globals.css` do showcase e o `index.css` do scaffold.
 * A bridge NÃO viaja nos canais npm e submódulo. Lá a var não existe, e a cor cai em
 * `currentColor`.
 *
 * O defeito é invisível onde se olha. Medido no consumidor npm real em 2026-08-08, no
 * `Card`:
 *
 *     intenção : ring-foreground/5   → oklch(0.15 0 0 / 0.05)   fio quase invisível
 *     real     : ring-1 currentColor → oklch(0.15 0 0)          linha sólida preta
 *
 * O `/5` é ignorado junto: sem cor, não há a que aplicar o alpha. No dark saía branco
 * sólido. Eram 8 classes em 5 componentes, e **quem achou foi o mantenedor num print** —
 * nenhum gate pegava. O `dead-theme-classes` não pega porque essas vars EXISTEM (no
 * showcase); o que não existe é o canal onde elas existem.
 *
 * A regra é context-free: componente distribuído não pode depender de var que só a
 * bridge define. Se precisar do valor, use o token DS que a própria bridge resolve —
 * o computado é idêntico, e funciona nos 4 canais.
 */

/**
 * As 19 chaves da bridge. Fonte: o bloco `@theme inline` do `globals.css`.
 * Nenhuma delas existe no `tailwind-theme.css` — é isso que as torna dependentes
 * da bridge, e o teste contra o repo real confirma essa premissa.
 */
export const VOCAB_SHADCN = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
];

/** Substituto DS de cada chave — o que a PRÓPRIA bridge resolve (globals.css). */
export const EQUIVALENTE = {
  background: "bg-bg-canvas",
  foreground: "text-fg-default / ring-fg-default",
  card: "bg-bg-surface",
  "card-foreground": "text-fg-default",
  popover: "bg-bg-dropdown",
  "popover-foreground": "text-fg-default",
  primary: "bg-bg-brand",
  "primary-foreground": "text-fg-on-brand",
  secondary: "bg-bg-muted",
  "secondary-foreground": "text-fg-default",
  muted: "bg-bg-muted",
  "muted-foreground": "text-fg-muted",
  accent: "bg-bg-muted",
  "accent-foreground": "text-fg-default",
  destructive: "bg-bg-danger",
  "destructive-foreground": "text-fg-on-danger",
  border: "border-border-default / bg-border-default",
  input: "border-border-input",
  ring: "ring-ring-brand",
};

const PREFIXOS = ["bg", "text", "border", "ring", "divide", "from", "to", "via", "outline", "fill", "stroke"];

/**
 * CITAÇÕES declaradas — (arquivo, classe), com motivo. Mesma convenção do
 * `dead-theme-classes`: a doc/showcase às vezes NOMEIA a classe errada pra ensinar que
 * ela é errada, e separar citação de uso por regex seria julgamento de intenção (L-059).
 */
export const CITACOES = new Map([
  [
    "src/preview/pages/KanbanDoc.tsx",
    new Map([["bg-muted", "prosa: a `description` do componente LISTA os tokens que ele consome; não é className"]]),
  ],
  [
    "src/preview/pages/PaginationDoc.tsx",
    new Map([["bg-muted", "prosa: coluna `type` da prop table descreve o container; não é className"]]),
  ],
  [
    "src/preview/pages/PipelineMemoryDoc.tsx",
    new Map([["bg-input/50", "prosa: é o TEXTO da lição L-005, que existe pra ensinar que essa classe é o anti-pattern"]]),
  ],
  [
    "src/preview/pages/updates-data.ts",
    new Map([
      ["bg-popover", "changelog: a entry da v0.36.0 NOMEIA a classe pra explicar o que foi corrigido; o arquivo é dado, não aplica className"],
      ["text-popover-foreground", "changelog: idem — mesma entry, mesma razão"],
    ]),
  ],
]);

/**
 * Paleta padrão do Tailwind. Não é vocabulário da bridge — funciona nos 4 canais — mas
 * fura o sistema de tokens: um `bg-red-500` não responde a marca nem a dark mode, e
 * nenhuma troca de tema o alcança. Medido em 2026-08-08: **0** em `src/components` e
 * **0** em `src/examples`, ou seja o gate nasce como ratchet — não há débito a limpar,
 * ele só impede a entrada.
 */
export const PALETA_TAILWIND = [
  "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan",
  "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose",
  "slate", "gray", "zinc", "neutral", "stone",
];

/**
 * Remove comentário de bloco e de linha — citar a classe num comentário não é usá-la.
 *
 * ⚠️ PRESERVA as quebras de linha do comentário. Colapsar o bloco desloca todas as
 * linhas seguintes, e o gate passa a apontar arquivo:linha ERRADO — o que é pior que
 * não apontar, porque manda a pessoa investigar o lugar errado (L-060). Custou uma
 * investigação de falso positivo em 2026-08-08.
 */
const semComentario = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/^([ \t]*)\/\/.*$/gm, "$1");

/**
 * @param {Array<{file: string, text: string}>} fontes  componentes .ts/.tsx distribuídos
 * @returns {{usos: Array<{classe: string, chave: string, file: string, line: number, sugestao: string}>}}
 */
export function shadcnVocab(fontes) {
  const re = new RegExp(
    `(?<![a-z0-9-])(?:${PREFIXOS.join("|")})-(${VOCAB_SHADCN.join("|")})(/\\d+)?(?![a-z0-9-])`,
    "g",
  );
  const usos = [];
  for (const { file, text } of fontes) {
    const citadas = CITACOES.get(file);
    const linhas = semComentario(text).split("\n");
    for (let i = 0; i < linhas.length; i++) {
      for (const m of linhas[i].matchAll(re)) {
        if (citadas?.has(m[0])) continue;
        usos.push({
          classe: m[0],
          chave: m[1],
          file,
          line: i + 1,
          sugestao: EQUIVALENTE[m[1]] ?? "(sem equivalente mapeado)",
        });
      }
    }
  }
  return { usos };
}

/**
 * Classe da paleta padrão do Tailwind (`bg-red-500`, `text-slate-700`…).
 *
 * Por que é defeito mesmo funcionando: a cor fica **fora do sistema**. Não muda com a
 * marca (5 hoje), não muda no dark, e nenhuma evolução de tema a alcança — a tela
 * envelhece sozinha enquanto o resto acompanha. É a diferença entre "renderiza" e "está
 * sendo usado corretamente".
 *
 * ⚠️ Não sugere substituto de propósito: `red-500` não tem equivalente 1:1 no DS, e
 * inventar um mapeamento aqui seria decidir design por regex. A escolha certa depende do
 * PAPEL (é status? é marca? é neutro?) — quem escreve decide, com `.ai/context/tokens/color.md`.
 *
 * @param {Array<{file: string, text: string}>} fontes
 */
export function paletaNativa(fontes) {
  const re = new RegExp(
    `(?<![a-z0-9-])(?:${PREFIXOS.join("|")}|accent|caret|decoration|shadow)-(?:${PALETA_TAILWIND.join("|")})-(?:50|[1-9]00|950)(?:/\\d+)?(?![a-z0-9-])`,
    "g",
  );
  const usos = [];
  for (const { file, text } of fontes) {
    const linhas = semComentario(text).split("\n");
    for (let i = 0; i < linhas.length; i++) {
      for (const m of linhas[i].matchAll(re)) {
        usos.push({ classe: m[0], file, line: i + 1 });
      }
    }
  }
  return { usos };
}
