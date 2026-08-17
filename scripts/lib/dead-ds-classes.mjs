/**
 * dead-ds-classes — classe DS **não-cor** que não emite CSS nenhum porque o token
 * correspondente não existe no tema. Puro, zero I/O (ler arquivo é do teste).
 *
 * ## O furo que isto fecha
 *
 * Achado por dogfood em 2026-08-17: escrevi `shadow-sh-xs` num `.styles.ts`. Essa
 * sombra **não existe** — os degraus são `sm/md/lg/xl/2xl/none/aside/ring`. A classe
 * fica no `className`, o CSS não casa, e o componente renderiza sem sombra.
 *
 * Medido com a classe morta no arquivo: **tudo passa**.
 *
 *   tsc --noEmit        passa (classe é string)
 *   lint:styles         passa (ele caça Tailwind LITERAL, não token DS inexistente)
 *   dead-theme-classes  passa (cobre COR — ver abaixo)
 *   npm test            passa
 *
 * ## Por que gate NOVO e não estender o `dead-theme-classes`
 *
 * São **eixos diferentes**, e a decisão segue o precedente que o repo já escreveu ao
 * separar `DS_EXCEPTIONS` de `BARREL_EXCEPTIONS`: usar a lista errada isentaria coisa
 * certa.
 *
 * Classe de **cor** tem caso de citação legítima em doc — a doc PRECISA nomear
 * `ring-ring-primary` pra explicar que ele é vocabulário extinto, e por isso aquele
 * módulo carrega um mapa `CITACOES` por par (arquivo, classe), com motivo obrigatório.
 *
 * Sombra, radius e spacing mortos **não têm caso de citação**: ninguém escreve
 * `shadow-sh-xs` pra ensinar algo. Misturar os dois vocabulários no mesmo mapa de
 * exceção tornaria o mapa de cor mais frouxo do que precisa ser.
 *
 * ## ⚠️ A armadilha do parser — medida, não hipotética
 *
 * Nome de token pode ter **mais de um segmento**: `pad-card-base`, `form-gap`,
 * `radius-base`. Meu primeiro regex de medição usou `[a-z0-9]+` e parou no hífen:
 * casou `pad-card` a partir de `p-pad-card-base` e reportou classe morta que **não
 * era** — o tema emite `--spacing-pad-card-base`.
 *
 * Falso positivo por parser preguiçoso é pior que gate nenhum: reprova código correto
 * e ensina o time a ignorar o gate. Por isso o `NOME` abaixo aceita hífen interno, e
 * há teste fixando exatamente o caso `p-pad-card-base`.
 */

/** Segmento de nome de token: aceita hífen interno (`pad-card-base`, `radius-base`). */
const NOME = "[a-z0-9]+(?:-[a-z0-9]+)*";

/**
 * Famílias de classe DS com prefixo DOBRADO, fora de cor. Cada entrada diz como a
 * classe se escreve e em qual namespace de CSS var o token vive.
 *
 * `re` captura o nome do token (grupo 1). `ns` é o prefixo da var: o tema emite
 * `--<ns>-<nome>`.
 */
export const FAMILIAS = [
  { nome: "shadow-sh-*", ns: "shadow", re: new RegExp(`\\bshadow-(sh-${NOME})\\b`, "g") },
  { nome: "rounded-radius-*", ns: "radius", re: new RegExp(`\\brounded(?:-[trbl]{1,2})?-(radius-${NOME})\\b`, "g") },
  { nome: "form-* (altura/tamanho)", ns: "spacing", re: new RegExp(`\\b(?:min-h|max-h|h|w|size)-(form-${NOME})\\b`, "g") },
  { nome: "size-icon-*", ns: "spacing", re: new RegExp(`\\bsize-(icon-${NOME})\\b`, "g") },
  { nome: "size-comp-*", ns: "spacing", re: new RegExp(`\\bsize-(comp-${NOME})\\b`, "g") },
  { nome: "gap-gp-*", ns: "spacing", re: new RegExp(`\\bgap(?:-[xy])?-(gp-${NOME})\\b`, "g") },
  { nome: "pad-*", ns: "spacing", re: new RegExp(`\\b[pm][trblxyse]?-(pad-${NOME})\\b`, "g") },
  { nome: "sp-*", ns: "spacing", re: new RegExp(`\\b[pm][trblxyse]?-(sp-${NOME})\\b`, "g") },
];

/**
 * Nomes de token que o tema emite, por namespace: `{ shadow: Set, radius: Set, … }`.
 * Lê as declarações `--<ns>-<nome>:` do CSS gerado — a mesma fonte que o
 * `dead-theme-classes` usa pra cor, e a única que decide o que existe de fato.
 */
export function tokensDoTema(cssText) {
  const out = {};
  for (const m of String(cssText ?? "").matchAll(/--([a-z]+)-([a-z0-9-]+)\s*:/g)) {
    (out[m[1]] ??= new Set()).add(m[2]);
  }
  return out;
}

/**
 * @param {{arquivos: Record<string,string>, tokens: Record<string,Set<string>>}} entrada
 * @returns {{mortas: Array<{arquivo:string, linha:number, classe:string, familia:string}>, conferidos:number}}
 *   `mortas` = uso de classe DS cujo token não existe no namespace correspondente.
 */
export function checkDeadDsClasses({ arquivos, tokens }) {
  const mortas = [];
  let conferidos = 0;

  for (const [arquivo, texto] of Object.entries(arquivos)) {
    conferidos++;
    const linhas = String(texto ?? "").split(/\r?\n/);
    linhas.forEach((linha, i) => {
      for (const { nome, ns, re } of FAMILIAS) {
        re.lastIndex = 0;
        for (const m of linha.matchAll(re)) {
          const token = m[1];
          if (!tokens[ns]?.has(token)) {
            mortas.push({ arquivo, linha: i + 1, classe: m[0], familia: nome });
          }
        }
      }
    });
  }

  return { mortas, conferidos };
}
