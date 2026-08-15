/**
 * typography-merge-sync — os presets tipográficos do tema chegam nos DOIS
 * merges de classe? Puro, zero I/O (ler arquivo é do teste).
 *
 * ## O furo que isto fecha
 *
 * A **L-016** é o defeito mais silencioso do sistema. O `tailwind-merge` decide
 * o que é conflito por GRUPO de classe. Um preset novo (`text-stat-lg`) tem o
 * prefixo `text-`, então, se não estiver registrado como `font-size`, o merge o
 * classifica como `text-color` — e quando o mesmo elemento tem uma cor real
 * (`text-fg-default`), ele considera os dois conflitantes e **remove o preset**.
 *
 * O elemento perde font-size, line-height, weight e tracking de uma vez, e cai
 * no default do browser. Sem erro de `tsc`, sem warning, sem teste falhando,
 * sem diff. Só o pixel errado.
 *
 * ## Por que DUAS listas, e não uma
 *
 * O DS tem dois caminhos de merge, e um preset precisa estar nos dois:
 *
 *   - `src/utils/tv.ts`   → `twMergeConfig` do `tv()`  — usado por *.styles.ts
 *   - `src/lib/utils.ts`  → `extendTailwindMerge` do `cn()` — usado no .tsx,
 *                            nas telas, e é o que o consumidor recebe baked
 *
 * A defesa até 2026-08-14 era um `diff <(grep …) <(grep …)` dentro de um
 * checklist que alguém precisava lembrar de rodar. O `pre-commit-check.md`
 * classifica a L-016 como CRÍTICO e manda comparar as listas na mão.
 *
 * ## O que a medição encontrou quando este gate foi escrito
 *
 * O `cn()` estava com **23 de 27** presets: faltavam `stat-sm`, `stat-md`,
 * `stat-lg` e `stat-xl` — exatamente o role de valor de KPI. Comprovado
 * executando o merge real:
 *
 *     entrada          "text-stat-lg text-fg-default"
 *     cn() de então →  "text-fg-default"          ← o tamanho sumiu
 *
 * Não mordia no showcase (as páginas usam string literal em `className`, que
 * nunca passa pelo merge, e o `Kpi` usa `tv()`, cuja lista estava completa) —
 * mas o `cn()` viaja baked no template do CLI, e a doc manda o consumidor usar
 * `cn()` **e** `stat-*` pra KPI. Quem seguisse as duas instruções perdia a classe.
 *
 * O comentário que já existia no `src/lib/utils.ts` dizia "Lista 1:1 com
 * typography.ts. Manter sincronizado com src/utils/tv.ts. Ver L-016." — e não
 * estava 1:1. Texto não é gate (L-060).
 *
 * ## Fonte da verdade
 *
 * O **tema gerado**, não o `typography.ts`. É o CSS que decide qual classe
 * existe de fato: um preset que o transform não emitiu não tem utility, e um
 * registrado no merge sem utility correspondente é entrada morta. Mesmo
 * critério do `dead-theme-classes`.
 */

/** Presets emitidos como `@utility text-<nome>` no tema gerado. */
export function presetsDoTema(cssTema) {
  return [...cssTema.matchAll(/@utility\s+text-([a-z0-9-]+)/g)].map((m) => m[1]);
}

/**
 * Presets registrados no bloco `text: [ … ]` de um config de merge.
 * Casa o PRIMEIRO bloco `text: [`, que é o do grupo `font-size` nos dois
 * arquivos. Só aceita nome no formato `<role>-<degrau>` — o mesmo shape que o
 * transform emite.
 */
export function presetsDoMerge(codigo) {
  const i = codigo.indexOf("text: [");
  if (i === -1) return [];
  const j = codigo.indexOf("]", i);
  if (j === -1) return [];
  return [...codigo.slice(i, j).matchAll(/"([a-z0-9]+-[a-z0-9]+)"/g)].map((m) => m[1]);
}

/**
 * @param {{tema: string[], consumidores: Record<string, string[]>}} entrada
 * @returns {{faltando: Array<{arquivo:string, preset:string}>,
 *            mortos:   Array<{arquivo:string, preset:string}>,
 *            conferidos: number}}
 */
export function checkTypographyMergeSync({ tema, consumidores }) {
  const doTema = new Set(tema);
  const faltando = [];
  const mortos = [];

  for (const [arquivo, lista] of Object.entries(consumidores)) {
    const registrados = new Set(lista);
    // No tema e ausente do merge → a classe é REMOVIDA em silêncio (o defeito).
    for (const preset of tema) {
      if (!registrados.has(preset)) faltando.push({ arquivo, preset });
    }
    // No merge e ausente do tema → entrada morta: o preset saiu do transform e
    // o registro ficou. Não quebra pixel, mas mente sobre o que existe.
    for (const preset of lista) {
      if (!doTema.has(preset)) mortos.push({ arquivo, preset });
    }
  }

  return { faltando, mortos, conferidos: tema.length };
}
