/**
 * deps-por-item — cada item do registry declara os pacotes npm que os arquivos DELE importam?
 *
 * ## O furo que isto fecha
 *
 * O `deps-declared` valida o `package.json` do **DS**: prova que o repo instala o que a
 * fonte importa. Não olha o `dependencies[]` de **cada item** do registry — que é o que o
 * `igreen:add <item>` instala no projeto do consumidor. São perguntas diferentes, e o
 * comentário do `registry-imports` dizia que a segunda estava coberta pela primeira.
 *
 * Medido em 2026-09-24, com os dois verdes:
 *
 *     input-otp            importa cva, não declarava → quebra ATÉ no scaffold
 *                          (cva não está no package.json do template e não vem
 *                           por transitiva do tailwind-variants)
 *     chip                 importa lucide-react, não declarava
 *     example-order-detail idem
 *     date-picker          importa date-fns, não declarava — chegava por
 *                          transitiva do react-day-picker; some em pnpm estrito
 *
 * O `registry-add-item.mjs` deriva as deps corretamente, mas é **propose-time**: import
 * acrescentado depois a um componente já registrado nunca é revalidado. É o eixo da L-037.
 *
 * ## O que conta como declarado
 *
 * O próprio item, **ou** qualquer item alcançável pelas `registryDependencies` — porque o
 * copy-in instala o conjunto inteiro, e o `shadcn add` instala as deps de todos.
 */

/** Nome do item a partir de um `registryDependency` (`@igreen/chip` → `chip`). */
const semEscopo = (d) => d.replace(/^@[^/]+\//, "");

/** Nome do pacote a partir de um specifier (`date-fns/locale` → `date-fns`). */
export function nomeDoPacote(spec) {
  if (spec.startsWith("@")) return spec.split("/").slice(0, 2).join("/");
  return spec.split("/")[0];
}

/**
 * Tira comentários antes de procurar import. Sem isto, um JSDoc que ENSINA
 * (`* import { Link } from "react-router-dom";`) vira dependência inexistente —
 * aconteceu em 3 itens na primeira versão deste gate.
 */
export function semComentarios(fonte) {
  return fonte
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "");
}

/** Specifiers de pacote npm (não-relativos, não-alias) de um texto de módulo. */
export function pacotesImportados(fonte) {
  const out = new Set();
  for (const m of semComentarios(fonte).matchAll(/from\s+"([^"]+)"/g)) {
    const spec = m[1];
    if (spec.startsWith(".") || spec.startsWith("@/") || spec.startsWith("#")) continue;
    out.add(nomeDoPacote(spec));
  }
  return [...out];
}

/** Itens que o copy-in de `nome` instala: ele + registryDependencies, transitivamente. */
function instalados(nome, porNome, vistos = new Set()) {
  if (vistos.has(nome)) return vistos;
  if (!porNome.has(nome)) return vistos;
  vistos.add(nome);
  for (const d of porNome.get(nome).registryDependencies ?? []) {
    instalados(semEscopo(d), porNome, vistos);
  }
  return vistos;
}

const EH_CODIGO = /\.(tsx?|jsx?|mjs|cjs)$/;

/**
 * @param {{items: any[], lerFonte: (path: string) => string | null, ignorar?: Set<string>}} entrada
 * @returns {{faltando: {item: string, pacote: string, arquivo: string}[], conferidos: number}}
 */
export function checkDepsPorItem({ items, lerFonte, ignorar = new Set() }) {
  const porNome = new Map(items.map((i) => [i.name, i]));
  const faltando = [];
  let conferidos = 0;

  for (const item of items) {
    const declarados = new Set();
    for (const nome of instalados(item.name, porNome)) {
      for (const d of porNome.get(nome)?.dependencies ?? []) {
        declarados.add(nomeDoPacote(d.replace(/@[^@/]*$/, "")));
      }
    }

    for (const f of item.files ?? []) {
      if (!EH_CODIGO.test(f.path)) continue;
      const fonte = lerFonte(f.path);
      if (fonte == null) continue;
      for (const pkg of pacotesImportados(fonte)) {
        if (ignorar.has(pkg)) continue;
        conferidos++;
        if (declarados.has(pkg)) continue;
        // `import type { X } from "geojson"` é satisfeito por `@types/geojson`.
        if (declarados.has(`@types/${pkg}`)) continue;
        faltando.push({ item: item.name, pacote: pkg, arquivo: f.path });
      }
    }
  }
  return { faltando, conferidos };
}
