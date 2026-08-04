/**
 * brand-surfaces.mjs — toda marca do catálogo está em TODAS as superfícies?
 *
 * Uma marca nova toca 10 superfícies e só **duas** falham visivelmente: `PALETAS` do
 * `ColorsDoc` (o `Record<Brand, Paleta>` quebra o `tsc`) e o `exports` do
 * `package.json` (o `build:lib` lança). As outras oito falham em silêncio — a marca
 * existe, o showcase funciona, e ela simplesmente não chega em algum canal.
 *
 * ## Por que isto é gate e não checklist
 *
 * A `ChoroplethMap` saiu da `main` num merge e nenhum sinal disparou porque ela só
 * ocupava 1 das 7 superfícies de componente (L-058). Marca tem a mesma forma: em
 * 2026-08-04 a doc auto-carregada listava **6** superfícies (faltando `ColorsDoc` e a
 * `ds-themes.md` do consumidor) e descrevia duas delas com o mecanismo errado —
 * `isBrand()` como edição manual, que a v0.33.0 tornou desnecessária, e "copiar o CSS
 * gerado" no template, que virou descoberta de diretório no `cli:rebake`. Quem
 * seguisse a doc entregava marca incompleta com tudo verde.
 *
 * Checklist em `.md` não reprova PR. Isto reprova.
 *
 * O catálogo (`BRANDS` em `src/hooks/useBrand.ts`) é a FONTE: uma marca só conta como
 * existente quando está lá, porque é o que o showcase e o consumidor enxergam.
 */
import { readFileSync, existsSync } from "node:fs";

const CATALOGO = "src/hooks/useBrand.ts";

/** Ids do catálogo `BRANDS`, na ordem em que aparecem. */
export function brandsDoCatalogo(texto = readFileSync(CATALOGO, "utf8")) {
  const bloco = /export const BRANDS[^=]*=\s*\[([\s\S]*?)\];/.exec(texto);
  if (!bloco) throw new Error(`${CATALOGO}: não achei o array BRANDS`);
  return [...bloco[1].matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
}

/**
 * As superfícies, por marca. `default` é o tema-base: não tem overlay, nem script,
 * nem item `theme-<id>` próprio (usa o item `theme`), então essas ficam isentas.
 *
 * Cada entrada devolve `true` quando a superfície está fechada pra aquela marca.
 */
const SUPERFICIES = [
  {
    nome: "tokens/brands/<id>/semantic",
    ok: (id) =>
      existsSync(`tokens/brands/${id}/semantic/color-light.ts`) &&
      existsSync(`tokens/brands/${id}/semantic/color-dark.ts`),
  },
  {
    nome: "overlay src/styles/theme/brand-<id>.css",
    soNaoDefault: true,
    ok: (id) => existsSync(`src/styles/theme/brand-${id}.css`),
  },
  {
    nome: "script tokens:brand:<id>",
    soNaoDefault: true,
    ok: (id) => !!lerJson("package.json").scripts?.[`tokens:brand:${id}`],
  },
  {
    nome: "@import em globals.css",
    soNaoDefault: true,
    ok: (id) => readFileSync("src/styles/globals.css", "utf8").includes(`brand-${id}.css`),
  },
  {
    nome: "exports ./theme/brand-<id>.css",
    soNaoDefault: true,
    ok: (id) => `./theme/brand-${id}.css` in (lerJson("package.json").exports ?? {}),
  },
  {
    nome: "item de registry",
    ok: (id) => {
      const alvo = id === "default" ? "theme" : `theme-${id}`;
      return lerJson("registry.json").items.some((i) => i.name === alvo);
    },
  },
  {
    nome: "BRAND_LABELS do CLI",
    soNaoDefault: true, // `default` tem rótulo fixo no detectBrandThemes()
    ok: (id) => new RegExp(`^\\s+${id}:\\s*"`, "m").test(readFileSync("cli/src/create.js", "utf8")),
  },
  {
    nome: "overlay bakeado no template",
    soNaoDefault: true,
    ok: (id) => existsSync(`cli/templates/default/src/styles/theme/brand-${id}.css`),
  },
  {
    nome: "PALETAS do ColorsDoc",
    ok: (id) =>
      new RegExp(`^\\s+${id}:\\s*paleta`, "im").test(
        readFileSync("src/preview/pages/ColorsDoc.tsx", "utf8"),
      ),
  },
  {
    nome: "ds-themes.md do consumidor",
    ok: (id) =>
      readFileSync("cli/templates/default/_claude/rules/ds-themes.md", "utf8").includes(`\`${id}\``),
  },
];

const cache = new Map();
function lerJson(p) {
  if (!cache.has(p)) cache.set(p, JSON.parse(readFileSync(p, "utf8")));
  return cache.get(p);
}

/**
 * @returns {{ marcas: string[], superficies: string[], faltando: Array<{marca:string,superficie:string}> }}
 */
export function checkBrandSurfaces(marcas = brandsDoCatalogo()) {
  const faltando = [];
  for (const id of marcas) {
    for (const s of SUPERFICIES) {
      if (s.soNaoDefault && id === "default") continue;
      let fechada;
      try {
        fechada = s.ok(id);
      } catch {
        fechada = false; // arquivo ausente/ilegível conta como superfície aberta
      }
      if (!fechada) faltando.push({ marca: id, superficie: s.nome });
    }
  }
  return { marcas, superficies: SUPERFICIES.map((s) => s.nome), faltando };
}

export { SUPERFICIES, CATALOGO };
