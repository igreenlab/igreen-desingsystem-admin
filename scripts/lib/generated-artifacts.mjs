/**
 * generated-artifacts.mjs — o CSS commitado bate com os tokens-fonte?
 *
 * ## O furo que isto fecha
 *
 * `src/styles/theme/tailwind-theme.css` e os 4 `brand-*.css` são **gerados** por
 * `tokens/transforms/*` e, ao mesmo tempo, **commitados** — de propósito, porque são
 * o export publicado (`.gitignore`: "Generated theme CSS is committed because it's
 * the published export"). O passo que regenera é MANUAL:
 *
 *   tokens/brands/**\/*.ts  →  npm run tokens:tw4        →  src/styles/theme/tailwind-theme.css
 *                          →  npm run tokens:brand:<id>  →  src/styles/theme/brand-<id>.css
 *
 * Nenhum workflow rodava esses comandos: `grep tokens .github/workflows/ci.yml`
 * devolvia vazio. Então editar um token e esquecer o `tokens:tw4` passava **verde
 * em tudo** — e o efeito é pior que o de um artefato defasado qualquer, porque
 * TODOS os gates de cor do repo (`dead-theme-classes`, `shadcn-vocab`,
 * `orphan-utilities`, `runtime-base`, `audit-token-docs`) leem justamente esse CSS.
 * Eles confirmavam a si mesmos contra um artefato que nada garantia estar atual.
 *
 * O único sinal era o hook `ds-tokens-check.sh`, que (a) é informativo, (b) só
 * dispara em edit feito pelo Claude Code e (c) exclui `tokens/transforms/` — ou
 * seja, não cobre nem o arquivo que mais muda o resultado.
 *
 * Este módulo é o análogo, pro par tokens↔tema, do que o `foundational-pairs.mjs`
 * já é pro par DS↔CLI-baked.
 *
 * ## Duas perguntas, não uma
 *
 * 1. **Sync** — regerar cada artefato e comparar com o disco.
 * 2. **Cobertura** — todo `.css` de `src/styles/theme/` tem um gerador conhecido?
 *    Sem isso o gate mente por omissão: uma 6ª marca entraria sem ninguém conferir,
 *    e o resumo diria "✓ N artefatos em sync" sobre um conjunto incompleto. É a
 *    mesma forma de falha que o `brand-check` existe pra evitar nas 10 superfícies.
 *
 * A lista de marcas vem de `brand-surfaces.mjs` (que lê o catálogo `BRANDS` de
 * `src/hooks/useBrand.ts`) — nunca reenumere marca aqui.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { brandsDoCatalogo } from "./brand-surfaces.mjs";

const THEME_DIR = "src/styles/theme";
/** CLI do tsx por path — ver a nota de plataforma em `regenerate()`. */
const TSX_CLI = "node_modules/tsx/dist/cli.mjs";

/** Normaliza só o que varia por checkout/plataforma. */
export const norm = (s) => String(s ?? "").replace(/\r/g, "").replace(/^﻿/, "");

/**
 * Os artefatos gerados e como cada um se regenera.
 *
 * `default` não tem overlay — é o tema-base, emitido pelo `to-tailwind-v4`. Mesma
 * isenção que o `brand-surfaces.mjs` aplica.
 *
 * @param {string[]} marcas ids do catálogo (default incluído)
 */
export function generatedArtifacts(marcas = brandsDoCatalogo()) {
  return [
    {
      out: `${THEME_DIR}/tailwind-theme.css`,
      transform: "tokens/transforms/to-tailwind-v4.ts",
      args: [],
      npm: "npm run tokens:tw4",
    },
    ...marcas
      .filter((id) => id !== "default")
      .map((id) => ({
        out: `${THEME_DIR}/brand-${id}.css`,
        transform: "tokens/transforms/to-brand-overlay.ts",
        args: [id],
        npm: `npm run tokens:brand:${id}`,
      })),
  ];
}

/**
 * `.css` em `src/styles/theme/` que nenhum gerador conhecido produz.
 *
 * @param {{out:string}[]} artefatos
 * @returns {string[]} paths sem gerador
 */
export function uncoveredThemeFiles(artefatos = generatedArtifacts()) {
  if (!existsSync(THEME_DIR)) return [];
  const cobertos = new Set(artefatos.map((a) => a.out.replace(/\\/g, "/")));
  return readdirSync(THEME_DIR)
    .filter((f) => f.endsWith(".css"))
    .map((f) => `${THEME_DIR}/${f}`)
    .filter((p) => !cobertos.has(p));
}

/**
 * Compara esperado × atual e localiza a PRIMEIRA linha divergente.
 *
 * Puro — o CLI e o teste passam as strings. Devolver a linha importa: o tema tem
 * 712 linhas e "difere" sem posição não diz se foi um token ou o header inteiro.
 *
 * @returns {{equal:boolean, linha?:number, esperado?:string, atual?:string}}
 */
export function compareGenerated(esperado, atual) {
  const e = norm(esperado);
  const a = norm(atual);
  if (e === a) return { equal: true };

  const le = e.split("\n");
  const la = a.split("\n");
  const n = Math.max(le.length, la.length);
  for (let i = 0; i < n; i++) {
    if (le[i] !== la[i]) {
      return {
        equal: false,
        linha: i + 1,
        esperado: le[i] ?? "(fim do arquivo)",
        atual: la[i] ?? "(fim do arquivo)",
      };
    }
  }
  return { equal: false, linha: 1, esperado: "?", atual: "?" };
}

/**
 * Roda o transform e devolve o CSS que ele emite AGORA.
 *
 * Executa o MESMO tsx que os scripts do `package.json` (`tsx <transform>`) — o gate
 * exercita o caminho de produção, não uma reimplementação (L-064). Custo medido:
 * ~0,6 s por artefato.
 *
 * Invoca o CLI do tsx por path (`node node_modules/tsx/dist/cli.mjs`) em vez de
 * `npx`: no Windows `npx` é `.cmd` e exigiria `shell: true`, que (a) dispara o
 * DEP0190 do Node — args concatenados, não escapados — e (b) abriria superfície de
 * injeção se um id de marca chegasse com metacaractere. Sem shell, `execFileSync`
 * passa os args como vetor, e o mesmo código roda igual nas 3 plataformas.
 *
 * @throws se o transform falhar (isso É o defeito: transform quebrado)
 */
export function regenerate({ transform, args = [] }) {
  return execFileSync(process.execPath, [TSX_CLI, transform, ...args], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
}

/**
 * Roda tudo: regenera cada artefato, compara com o disco, e checa cobertura.
 *
 * @returns {{ conferidos:number, defasados:object[], ausentes:string[], semGerador:string[] }}
 */
export function checkGeneratedArtifacts(artefatos = generatedArtifacts()) {
  const defasados = [];
  const ausentes = [];
  let conferidos = 0;

  for (const art of artefatos) {
    if (!existsSync(art.out)) {
      ausentes.push(art.out);
      continue;
    }
    const esperado = regenerate(art);
    const atual = readFileSync(art.out, "utf8");
    const r = compareGenerated(esperado, atual);
    conferidos++;
    if (!r.equal) defasados.push({ ...art, ...r });
  }

  return { conferidos, defasados, ausentes, semGerador: uncoveredThemeFiles(artefatos) };
}

export { THEME_DIR };
