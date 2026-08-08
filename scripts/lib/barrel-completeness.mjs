/**
 * barrel-completeness.mjs — toda pasta de `ui/` chega no barrel público?
 *
 * ## O furo que isto fecha
 *
 * As "7 superfícies" da L-042 (código · USAGE · inventory · showcase · registry ·
 * vocabulário · changelog) **não incluem o barrel**. E o barrel é o que define o
 * canal npm: o que não estiver em `src/components/index.ts` não existe pra quem faz
 * `import { X } from "@snksergio/design-system"`.
 *
 * Resultado medido: até a 0.37.0, `Chart`, `DataList`, `List` e `Toast` tinham **6
 * das 7** superfícies fechadas — código, USAGE, inventory, showcase, registry e
 * vocabulário —, a doc do canal npm anunciava "os 42 componentes ui/", e
 * `import { ChartContainer }` estourava "not exported" no consumidor. Por meses.
 * Nenhum gate podia pegar, porque nenhum gate olhava o barrel (`grep -rn
 * "components/index" scripts .claude .github` só achava `pack-contract` e
 * `lib-verify`, que conferem o PACOTE publicado, não a completude do barrel).
 *
 * Este módulo torna o barrel a 8ª superfície, e mecânica.
 *
 * ## Por que a lista de exceção NÃO é a do `ds-exceptions.mjs`
 *
 * São eixos diferentes, e confundi-los reintroduz o bug:
 *
 *   - `DS_EXCEPTIONS` = "não vai pro **registry/showcase**". Os 6 internos do
 *     example-chat estão lá — mas eles **são** exportados no barrel (viajam pelo npm
 *     junto do exemplo). Usar aquela lista aqui isentaria 6 componentes que hoje
 *     estão corretos, e o gate pararia de proteger justamente eles.
 *   - `BARREL_EXCEPTIONS` (abaixo) = "não vai pro **npm**". Hoje só `TabelaTeste`.
 *
 * Mesma disciplina do `ds-exceptions.mjs`: chave = nome da PASTA, valor = motivo
 * obrigatório. Exceção sem motivo apodrece porque ninguém sabe se ainda vale.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";

const UI_DIR = "src/components/ui";
const BARREL = "src/components/index.ts";

/** Pastas de `ui/` deliberadamente FORA do barrel público. Chave = nome da pasta. */
export const BARREL_EXCEPTIONS = new Map([
  [
    "TabelaTeste",
    "demo interno hardcoded (réplica do sandbox /design-and-table-v2) — o USAGE.md diz 'não use em features novas'; exportá-lo vazaria na lib npm",
  ],
]);

/** @param {string} pasta nome da pasta em `src/components/ui/` */
export function isBarrelException(pasta) {
  return BARREL_EXCEPTIONS.has(pasta);
}

/** Pastas de componente em `src/components/ui/` (só as que têm `index.ts`). */
export function uiFolders(dir = UI_DIR) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(`${dir}/${d.name}/index.ts`))
    .map((d) => d.name)
    .sort();
}

/**
 * Pastas de `ui/` que o barrel referencia — por `export * from "./ui/X"` **ou** por
 * export nomeado `... } from "./ui/X"`.
 *
 * As duas formas contam: `TableToolbar` entra por export nomeado (renomeia
 * `SortDirection` pra evitar colisão com `Table`) e está tão exportado quanto os
 * outros. Um parser que só entendesse `export *` acusaria falso positivo nele.
 */
export function barrelExports(texto = readFileSync(BARREL, "utf8")) {
  const nomes = new Set();
  for (const m of String(texto).matchAll(/from\s+"\.\/ui\/([^"/]+)"/g)) nomes.add(m[1]);
  return [...nomes].sort();
}

/**
 * @returns {{ faltando:{pasta:string}[], exceçõesMortas:string[], conferidos:number }}
 *   `faltando` = pasta de `ui/` fora do barrel e sem exceção declarada.
 *   `exceçõesMortas` = exceção declarada pra pasta que não existe mais (ou que já
 *   está no barrel) — lista de exceção que não é podada mente sobre o que protege.
 */
export function checkBarrelCompleteness({ pastas = uiFolders(), exportadas = barrelExports() } = {}) {
  const exp = new Set(exportadas);
  const faltando = pastas
    .filter((p) => !exp.has(p) && !isBarrelException(p))
    .map((pasta) => ({ pasta }));

  const existentes = new Set(pastas);
  const exceçõesMortas = [...BARREL_EXCEPTIONS.keys()].filter(
    (p) => !existentes.has(p) || exp.has(p),
  );

  return { faltando, exceçõesMortas, conferidos: pastas.length };
}

export { UI_DIR, BARREL };
