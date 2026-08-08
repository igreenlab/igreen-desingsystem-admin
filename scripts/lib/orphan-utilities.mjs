/**
 * orphan-utilities — classe que COMPONENTE DISTRIBUÍDO usa e que só existe no
 * CSS do showcase.
 *
 * `src/styles/globals.css` é o stylesheet do preview: ele NÃO viaja pra canal
 * nenhum (npm publica `theme.css`; copy-in e scaffold recebem
 * `styles/theme/tailwind-theme.css`). Uma `@utility` custom definida lá funciona
 * perfeitamente no showcase e **não existe** no consumidor — a classe fica no
 * `className`, o CSS não casa, e o componente renderiza diferente. Sem erro, sem
 * aviso, sem diff.
 *
 * ## O caso que originou o check (2026-08-07)
 *
 * `outline-float` (outline de 6px em superfície flutuante) morava só no
 * `globals.css`. **14 componentes distribuídos** a usavam — Modal, Panel,
 * FloatingPanel, Header, dialog, popover, select, dropdown-menu, command,
 * context-menu, menubar, hover-card, alert-dialog, navigation-menu. Em todo
 * projeto de consumidor, desde sempre, o outline não renderizava.
 *
 * O agravante: o TOKEN viajava (`--color-overlay-float` está no tema), só a
 * utility que o consome não. Então nem o `dead-theme-classes` pegava — pra ele a
 * var existe.
 *
 * Quem achou foi o mantenedor comparando um print do projeto dele com o showcase.
 * Nenhum gate acusou. Este existe pra fechar essa porta.
 *
 * ## O que ele checa
 *
 * Para cada `@utility <nome>` declarada em `globals.css`: se algum arquivo de
 * `src/components/` referencia `<nome>` e a utility NÃO está no tema gerado,
 * é órfã. A correção é mover pro `to-tailwind-v4.ts` (ver `buildFloatingUtilities`).
 *
 * Não cobre seletor global cru (ex.: `[data-radix-popper-content-wrapper]`) —
 * esse não tem nome derivável do className. Escopo deliberado: pegar a classe de
 * defeito medida, não tentar adivinhar o resto (L-059).
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";

const GLOBALS = "src/styles/globals.css";
const TEMA = "src/styles/theme/tailwind-theme.css";
const COMPONENTES = "src/components";

/** Nomes de `@utility <nome>` declarados num CSS. */
export function utilitiesDeclaradas(css) {
  return [...css.matchAll(/^@utility\s+([a-z0-9-]+)/gm)].map((m) => m[1]);
}

function arquivosDeComponente(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) arquivosDeComponente(p, acc);
    else if (/\.tsx?$/.test(e.name) && !/\.test\./.test(e.name)) acc.push(p);
  }
  return acc;
}

/**
 * @returns {{ orfas: Array<{nome:string,usos:number,arquivos:string[]}>, checadas: number }}
 */
export function checkOrphanUtilities({
  globals = existsSync(GLOBALS) ? readFileSync(GLOBALS, "utf8") : "",
  tema = existsSync(TEMA) ? readFileSync(TEMA, "utf8") : "",
  fontes = arquivosDeComponente(COMPONENTES).map((p) => ({ p, t: readFileSync(p, "utf8") })),
} = {}) {
  const noTema = new Set(utilitiesDeclaradas(tema));
  const orfas = [];
  const nomes = utilitiesDeclaradas(globals);

  for (const nome of nomes) {
    if (noTema.has(nome)) continue; // declarada no tema: viaja, ok
    const usa = fontes.filter(({ t }) => new RegExp(`\\b${nome}\\b`).test(t));
    if (usa.length) {
      orfas.push({ nome, usos: usa.length, arquivos: usa.map(({ p }) => p.replace(/\\/g, "/")) });
    }
  }
  return { orfas, checadas: nomes.length };
}

export { GLOBALS, TEMA };
