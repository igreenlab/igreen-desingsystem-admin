/**
 * new-component-folders — decide QUAIS pastas de `src/components/ui/` são
 * componente **novo** neste diff. Puro, zero I/O (o git vive no CLI).
 *
 * Por que não basta "tem arquivo com status `A`": adicionar **um** arquivo numa
 * pasta que já existe é rotina aqui (DataTable 8 commits, TableToolbar 6,
 * DataList 3). Com o critério ingênuo, `git diff --diff-filter=A` marcava a
 * pasta como nova e o check cobrava showcase de componente **já documentado** —
 * medido: `Chart` (documentado em 8 páginas `chart-*`, sem id `chart`) e `Icon`
 * (id roteado pra `IconLibraryDoc.tsx`, não `IconDoc.tsx`) reprovavam com
 * instrução errada, 2 de 42. Pior: a escapatória que a mensagem sugeria
 * (declarar em `ds-exceptions.mjs`) seria afirmação falsa E tiraria `Chart` da
 * varredura do `distribution-debt.mjs`, que compartilha o mesmo `Map`.
 *
 * Critério correto: a pasta é nova se **não existia no base ref**.
 *
 * ⚠️ Isso NÃO reabre a cegueira a rename que o `--no-renames` fechou: pasta
 * renomeada não existe sob o nome NOVO no base ref → continua sendo flagrada.
 * De graça, some o ruído oposto: rename de arquivo DENTRO de pasta já
 * registrada não ressuscita mais a pasta na lista.
 */

/**
 * @param {string} diffText   saída de `git diff --name-status --no-renames --diff-filter=A <base>...HEAD -- src/components/ui`
 * @param {(folderName: string) => boolean} existsAtBase predicado injetado —
 *   "essa pasta existia no base ref?". Injetado porque a resposta exige git, e
 *   `scripts/lib/` é zero I/O. Quem implementa (o CLI) deve errar pro lado de
 *   `false` em caso de dúvida: `false` = flagra = fail-closed.
 * @returns {string[]} nomes de pasta, ordenados, sem repetição
 */
export function newComponentFolders(diffText, existsAtBase) {
  const candidatas = new Set();
  for (const linha of diffText.split(/\r?\n/)) {
    // `A<TAB>src/components/ui/<Pasta>/<arquivo>`. O `/` final é obrigatório:
    // arquivo solto em `src/components/ui/` (ex.: um barrel `index.ts`) não é
    // pasta de componente.
    const m = linha.match(/^A\s+src\/components\/ui\/([^/]+)\//);
    if (m) candidatas.add(m[1]);
  }
  return [...candidatas].filter((nome) => !existsAtBase(nome)).sort();
}
