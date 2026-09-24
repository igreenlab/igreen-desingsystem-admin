/**
 * lib-externals — todo pacote importado por SUBPATH está externalizado como subpath?
 *
 * ## O furo que isto fecha
 *
 * No `external` do `vite.lib.config.ts`, uma string casa **o specifier inteiro**:
 * `"date-fns"` NÃO cobre `date-fns/locale`, que pro Rollup é outro módulo. O que não é
 * externo é **bundlado** — e o import sai do tarball como
 * `../../../../node_modules/date-fns/locale/pt-BR.mjs`, um caminho que só existe na
 * máquina que buildou. O build do consumidor quebra.
 *
 * Aconteceu em 2026-09-24, ao entrar o locale pt-BR do `DatePicker`. O `lib:verify`
 * pegou — mas só no CI, porque ele roda o build inteiro (~30s) e ninguém o roda a cada
 * edição. Este gate é a mesma pergunta em milissegundos, pra falhar no `npm test`.
 *
 * ## Por que não confiar só no lib:verify
 *
 * Ele é a rede definitiva e continua sendo. Mas ele responde "o tarball está quebrado",
 * e a causa (`external` incompleto) só aparece pra quem sabe ler a mensagem. Aqui a
 * pergunta é direta: "você importa `x/sub` e declarou só `x`?".
 *
 * ## Escopo
 *
 * Só `src/components/` e `tokens/` — é o que entra na lib. `src/preview/` e
 * `src/examples/` são do showcase e não viram pacote.
 */

/** Extrai o bloco `external: [ … ]` do config. */
export function lerExternals(configTexto) {
  const i = configTexto.indexOf("external: [");
  if (i === -1) return { exatos: [], regex: [], achou: false };
  const fim = configTexto.indexOf("],", i);
  const bloco = configTexto.slice(i, fim === -1 ? undefined : fim);
  return {
    achou: true,
    // "date-fns" → cobre só o specifier inteiro
    exatos: [...bloco.matchAll(/"([^"]+)"/g)].map((m) => m[1]),
    // /^date-fns\// → cobre os subpaths
    regex: [...bloco.matchAll(/\/\^([@a-z0-9-]+)\\\//g)].map((m) => m[1]),
  };
}

/** Imports de subpath de pacote (não-relativos) num texto de módulo. */
export function subpathsImportados(codigo) {
  const out = [];
  for (const m of codigo.matchAll(/from\s+"(@[a-z0-9-]+\/[a-z0-9-]+|[a-z0-9-]+)\/([^"]+)"/g)) {
    out.push({ pacote: m[1], subpath: m[2], specifier: `${m[1]}/${m[2]}` });
  }
  return out;
}

/**
 * @param {{externals: ReturnType<typeof lerExternals>, arquivos: {path: string, codigo: string}[]}} entrada
 * @returns {{descobertos: {specifier: string, pacote: string, arquivo: string}[], conferidos: number}}
 *   `descobertos` = subpath importado cujo pacote está no external como string exata,
 *   sem o par regex — ou seja, será bundlado.
 */
export function checkLibExternals({ externals, arquivos }) {
  const exatos = new Set(externals.exatos);
  const comRegex = new Set(externals.regex);
  const descobertos = [];
  let conferidos = 0;

  for (const { path, codigo } of arquivos) {
    for (const imp of subpathsImportados(codigo)) {
      conferidos++;
      // O próprio specifier declarado explicitamente já resolve.
      if (exatos.has(imp.specifier)) continue;
      // Pacote não é external nenhum: é dep bundlada de propósito, não é este gate.
      if (!exatos.has(imp.pacote)) continue;
      if (comRegex.has(imp.pacote)) continue;
      descobertos.push({ specifier: imp.specifier, pacote: imp.pacote, arquivo: path });
    }
  }
  return { descobertos, conferidos };
}
