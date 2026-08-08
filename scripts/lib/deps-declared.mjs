/**
 * deps-declared.mjs — todo pacote que o código publicado importa está declarado?
 *
 * ## O furo que isto fecha
 *
 * A L-037 diz "item de registry declara todas as deps reais" e a L-058 registra o
 * caso que a motivou: a `ChoroplethMap` usava `d3-geo`/`topojson-client` **sem
 * declarar no `package.json` do DS** e compilava só porque o consumidor declarava.
 * As duas lições existem porque **nada** pegava — e continuaram sem gate.
 *
 * Em 2026-08-08 o mesmo defeito estava vivo na camada de TIPOS: os `.d.ts`
 * publicados faziam `import { Feature } from 'geojson'` e `import { Topology } from
 * 'topojson-specification'` com os `@types/*` em `devDependencies`. O DS compila
 * (tem os pacotes localmente); o `tsc` do CONSUMIDOR quebra.
 *
 * ## Por que varrer a FONTE e não o `dist-lib`
 *
 * O critério ideal seria "pacote citado num `.d.ts` de `dist-lib/`". Mas `dist-lib`
 * é build artifact **gitignored**: no CI ele não existe sem rodar `build:lib`, e um
 * gate que depende de build opcional é um gate que não roda. Varrer a fonte é
 * estritamente mais forte — todo import de fonte que sobrevive ao build aparece no
 * `.d.ts`, e os que não sobrevivem (valor puro) o consumidor precisa igual em runtime.
 *
 * ## As três armadilhas do parsing, todas medidas neste repo
 *
 * 1. **Comentário conta como código.** `src/components/index.ts:51` tem
 *    `import { ChartContainer }` dentro de um JSDoc, e `tokens/transforms/
 *    to-tailwind.ts:8` documenta `from "@igreen/design-system/..."`. Sem remover
 *    comentário, o gate acusa 2 pacotes fantasma.
 * 2. **`import` como substring de dado.** `src/components/ui/Icon/icons.ts:228` tem
 *    a chave `"line-file-import": "M15.98,..."` — um regex frouxo casa `import"` +
 *    `: "` e extrai `:` como nome de pacote. Por isso só `\bfrom\s*"` e
 *    `\bimport\s*\(` contam; `import` seguido de aspas sem `from`/`(` não é import.
 * 3. **Tipo mora em `@types/X`, não em `X`.** `from "geojson"` é satisfeito por
 *    `@types/geojson` — `geojson` não existe como pacote de runtime. Sem essa
 *    resolução o gate reprova o estado CORRETO.
 *
 * Calibrado contra o repo: 391 arquivos, 49 pacotes externos, **0 falso positivo**.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";

/**
 * Diretórios cujo código chega ao consumidor pelos entries do `vite.lib.config.ts`
 * (`index`, `shadcn`, `tokens`, `preview/*`). `src/preview` fica de fora porque só
 * os 4 arquivos de `preview/*` viram entry, e eles importam por `@/` (interno).
 */
const SCAN_DIRS = ["src/components", "src/hooks", "src/lib", "src/utils", "tokens"];

/** Remove comentário de bloco e comentário de linha inteira. Ver armadilha 1. */
export const stripComments = (t) =>
  String(t ?? "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

/** `@radix-ui/react-dialog/foo` → `@radix-ui/react-dialog` · `lucide-react/x` → `lucide-react` */
export const packageName = (spec) =>
  spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];

/** `geojson` → `@types/geojson` · `@scope/pkg` → `@types/scope__pkg` (convenção DefinitelyTyped) */
export const typesPackage = (nome) =>
  nome.startsWith("@") ? `@types/${nome.slice(1).replace("/", "__")}` : `@types/${nome}`;

/** Import é interno/builtin? (relativo, alias `@/`, `node:`, absoluto) */
const isInternal = (s) =>
  s.startsWith(".") || s.startsWith("@/") || s.startsWith("node:") || s.startsWith("/");

/** Specifiers externos de um arquivo. Ver armadilhas 1 e 2. */
export function externalSpecifiers(texto) {
  const t = stripComments(texto);
  const out = new Set();
  const res = [
    /\bfrom\s*["']([^"']+)["']/g, // import ... from "x" · export ... from "x"
    /\bimport\s*\(\s*["']([^"']+)["']/g, // import("x")
    /\brequire\s*\(\s*["']([^"']+)["']/g, // require("x")
  ];
  for (const re of res) {
    for (const m of t.matchAll(re)) if (!isInternal(m[1])) out.add(packageName(m[1]));
  }
  return [...out];
}

/** `.ts`/`.tsx` dos diretórios publicados, sem testes. */
export function sourceFiles(dirs = SCAN_DIRS) {
  const acc = [];
  const walk = (d) => {
    if (!existsSync(d)) return;
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = `${d}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(e.name) && !/\.(test|spec)\./.test(e.name)) acc.push(p);
    }
  };
  for (const d of dirs) walk(d);
  return acc;
}

/**
 * @returns {{ faltando:{pacote:string,arquivo:string,viaTypes:string}[], viaTypes:object[], conferidos:number, pacotes:number }}
 *   `faltando` = importado e ausente de `dependencies`/`peerDependencies`, inclusive
 *   pela forma `@types/*`. `viaTypes` = satisfeito por `@types/*` (informativo:
 *   é o caso `geojson`, e ver a lista impede que alguém "conserte" removendo).
 */
export function checkDepsDeclared({ arquivos = sourceFiles(), pkg = null } = {}) {
  const p = pkg ?? JSON.parse(readFileSync("package.json", "utf8"));
  const declarados = new Set([
    ...Object.keys(p.dependencies ?? {}),
    ...Object.keys(p.peerDependencies ?? {}),
  ]);

  const primeiroUso = new Map();
  for (const f of arquivos) {
    for (const nome of externalSpecifiers(readFileSync(f, "utf8"))) {
      if (!primeiroUso.has(nome)) primeiroUso.set(nome, f);
    }
  }

  const faltando = [];
  const viaTypes = [];
  for (const [pacote, arquivo] of primeiroUso) {
    if (declarados.has(pacote)) continue;
    const tp = typesPackage(pacote);
    if (declarados.has(tp)) viaTypes.push({ pacote, arquivo, viaTypes: tp });
    else faltando.push({ pacote, arquivo, viaTypes: tp });
  }

  return { faltando, viaTypes, conferidos: arquivos.length, pacotes: primeiroUso.size };
}

export { SCAN_DIRS };
