/**
 * side-effects-declared.mjs — todo módulo publicado que RODA código no import está
 * declarado no `sideEffects` do package.json?
 *
 * ## O furo que isto fecha
 *
 * O build de lib saiu de um `index.mjs` único pra um módulo por arquivo
 * (`preserveModules`), e o package.json passou a declarar `sideEffects`. É isso que
 * deixa o bundler do consumidor descartar o módulo inteiro que ele não usa — o mapa
 * de 2.404 ícones, por exemplo. O preço: módulo que **roda código no import** e não
 * está na lista é descartado também, em build de PRODUÇÃO, sem erro nenhum.
 *
 * Caso real, medido em 2026-09-23 num consumidor Vite: `DataTable/column-types/index`
 * registra os 16 tipos de coluna default (`columnTypeRegistry.registerMany`) e é
 * importado só pelo efeito. Sem a entrada no `sideEffects`, a chamada some do bundle
 * e o DataTable perde filtro/formatação de todos os tipos — o `npm test` do DS passa,
 * porque o vitest não aplica `sideEffects`.
 *
 * ## O critério
 *
 * Statement de TOPO que executa algo: `ExpressionStatement` que não seja diretiva
 * (`"use client"`) nem atribuição em propriedade de identificador local
 * (`Button.displayName = …`, `Table.Row = …` — mexem só no objeto do próprio módulo).
 * Declaração (`const x = forwardRef(…)`, `tv(…)`) não conta: é o padrão de TODO
 * componente, e o que ela produz só é alcançável pelo export.
 *
 * A lista de módulos com efeito é o próprio `sideEffects` (fonte única): este gate só
 * confere que ela cobre o que a varredura acha — e que não sobra entrada morta.
 */
import ts from "typescript";
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";

/** Tudo que vira módulo em `dist-lib/`: os diretórios do barrel + os entries de `preview/*`. */
const RAIZES = [
  "src/components",
  "src/hooks",
  "src/lib",
  "src/utils",
  "tokens/index.ts",
  "tokens/brands",
  "src/preview/pages/ChatV2",
  "src/preview/pages/ClientesShowcase",
  "src/preview/pages/DashboardShowcase.tsx",
  "src/preview/pages/_table-data.ts",
  "src/preview/mocks",
];

/**
 * Efeito de topo que só mexe em estado LOCAL do módulo — conferido à mão, com motivo.
 * Entra aqui só o que não precisa rodar quando nenhum export do módulo é usado.
 */
export const INOFENSIVOS = {
  "src/preview/pages/DashboardShowcase.tsx":
    "`rankedUf.forEach` preenche `fillByUf`, objeto do próprio módulo, lido só pelo showcase",
};

const GLOBAIS = new Set(["window", "document", "globalThis", "self"]);

/** Statements de topo que executam algo no import. Ver "O critério". */
export function topLevelEffects(texto, nome = "x.tsx") {
  const sf = ts.createSourceFile(nome, texto, ts.ScriptTarget.Latest, true);
  const out = [];
  for (const st of sf.statements) {
    if (!ts.isExpressionStatement(st)) continue;
    const e = st.expression;
    if (ts.isStringLiteral(e)) continue; // diretiva ("use client")
    if (
      ts.isBinaryExpression(e) &&
      e.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isPropertyAccessExpression(e.left) &&
      ts.isIdentifier(e.left.expression) &&
      !GLOBAIS.has(e.left.expression.text)
    ) {
      continue;
    }
    out.push({
      linha: sf.getLineAndCharacterOfPosition(st.getStart()).line + 1,
      trecho: st.getText().split("\n")[0].slice(0, 80),
    });
  }
  return out;
}

/** `src/a/b.ts` → `./dist-lib/src/a/b.*` — o padrão que o `sideEffects` precisa ter. */
export const padraoDist = (arquivo) => `./dist-lib/${arquivo.replace(/\.(tsx?)$/, "")}.*`;

export function arquivosPublicados(raizes = RAIZES) {
  const acc = [];
  const walk = (p) => {
    if (!existsSync(p)) return;
    if (statSync(p).isDirectory()) {
      for (const n of readdirSync(p)) walk(`${p}/${n}`);
    } else if (/\.(ts|tsx)$/.test(p) && !/\.(test|spec)\.|\.d\.ts$/.test(p)) acc.push(p);
  };
  for (const r of raizes) walk(r);
  return acc;
}

/**
 * @returns {{ faltando: {arquivo:string, padrao:string, efeitos:object[]}[], sobrando: string[] }}
 *   `faltando` = módulo com efeito de topo sem entrada no `sideEffects`.
 *   `sobrando` = entrada `./dist-lib/…` que não corresponde a módulo com efeito.
 */
export function checkSideEffectsDeclared({ arquivos = arquivosPublicados(), pkg = null, ler = (f) => readFileSync(f, "utf8") } = {}) {
  const p = pkg ?? JSON.parse(readFileSync("package.json", "utf8"));
  const declarados = new Set((Array.isArray(p.sideEffects) ? p.sideEffects : []).filter((s) => s.startsWith("./dist-lib/")));
  const faltando = [];
  const usados = new Set();
  for (const arquivo of arquivos) {
    if (arquivo in INOFENSIVOS) continue;
    const efeitos = topLevelEffects(ler(arquivo), arquivo);
    if (!efeitos.length) continue;
    const padrao = padraoDist(arquivo);
    if (declarados.has(padrao)) usados.add(padrao);
    else faltando.push({ arquivo, padrao, efeitos });
  }
  const sobrando = [...declarados].filter((d) => !usados.has(d));
  return { faltando, sobrando };
}
