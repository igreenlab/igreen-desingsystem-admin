/**
 * api-doc-surface.mjs — lógica PURA (zero I/O): PR que AMPLIA a API pública de um
 * componente existente e não toca o `USAGE.md` dele.
 *
 * ## O furo que isto fecha
 *
 * O `showcase-check` só olha componente **novo** (pasta que não existia no base ref) —
 * de propósito, e mais estrito desde 2026-07-29. Então **mudança em componente
 * existente não dispara nada**, e é o cenário mais provável de um contribuidor de fora.
 *
 * Caso real: a PR #60 (18/07) adicionou `mode: single|range|multiple` ao DatePicker.
 * Código correto, PR legítima, CI verde — e ficou **11 dias** sem USAGE, sem inventory
 * e com o showcase ainda ensinando a compor `Popover` + `Calendar` na mão pra intervalo,
 * que a prop tornou desnecessário. Quem descobriu foi o mantenedor, de memória.
 *
 * ## Por que "linha `export` adicionada" e não "mudança de API"
 *
 * Detectar mudança de API de verdade exigiria AST e julgamento — o caminho curto pra
 * 50 falsos-positivos e pro time desligar o check (L-059). O proxy escolhido é
 * mecânico e quase sem ruído: **o diff adicionou uma linha que exporta algo**. Fix de
 * estilo não adiciona `export` (as 3 substituições de token de 2026-07-29 não
 * adicionaram nenhuma); ampliar API quase sempre adiciona.
 *
 * É **informativo** por isso mesmo: exportar um helper interno num refactor é falso-
 * positivo legítimo, e warning que atrapalha vira warning ignorado.
 */

/** `export ...` no início da linha — inclui `export type`, `export interface`, `export {`. */
const EXPORT_RE = /^\s*export\b/;

/**
 * Diretório-dono de um arquivo de componente, ou `null` se o path não é componente.
 *
 * `ui/<Nome>/**` → a pasta do componente (o USAGE mora nela).
 * `shadcn/<nome>.tsx` → `src/components/shadcn` (índice único de gotchas, não USAGE por
 * arquivo — decisão registrada em `ds-standards.md`).
 */
export function componentOwnerOf(filePath) {
  const p = String(filePath ?? "").replace(/\\/g, "/");
  const ui = /^src\/components\/ui\/([^/]+)\//.exec(p);
  if (ui) return { kind: "ui", name: ui[1], dir: `src/components/ui/${ui[1]}` };
  const sh = /^src\/components\/shadcn\/([^/]+)\.tsx?$/.exec(p);
  if (sh) return { kind: "shadcn", name: sh[1], dir: "src/components/shadcn" };
  return null;
}

/** O doc que se espera ter sido tocado junto, por tipo de componente. */
export function expectedDocOf(owner) {
  return owner.kind === "ui" ? `${owner.dir}/USAGE.md` : `${owner.dir}/USAGE.md`;
}

/**
 * @param {object} a
 * @param {Map<string, Array<{n:number, text:string}>>} a.addedByFile — saída LITERAL de
 *        `parseAddedLines`: um **Map** de path → `{n, text}`. Não é objeto e não é
 *        string — a 1ª versão disto assumiu as duas coisas erradas, os testes
 *        codificaram a suposição em vez do contrato, e o check devolveu 0 finding no
 *        commit real que ele existe pra pegar. Os testes agora montam a entrada pelo
 *        parser de verdade, então o formato não pode divergir em silêncio.
 * @param {string[]}                a.changedFiles — todos os paths tocados pela PR
 * @param {(name:string)=>boolean} [a.isNewComponent] — pasta nova? (o showcase-check já cobre
 *        essas; sem isto, um componente novo dispararia os dois checks pelo mesmo motivo)
 * @returns {Array<{name:string, kind:string, doc:string, exports:string[]}>}
 */
export function checkApiDocs({ addedByFile, changedFiles, isNewComponent }) {
  const tocados = new Set(
    (changedFiles ?? []).map((f) => String(f).replace(/\\/g, "/")),
  );
  const porComponente = new Map();

  const entradas =
    addedByFile instanceof Map
      ? addedByFile.entries()
      : Object.entries(addedByFile ?? {});

  for (const [file, linhas] of entradas) {
    const p = String(file).replace(/\\/g, "/");
    // .md não é superfície de API; o próprio USAGE tem "export" em bloco de exemplo.
    if (!/\.tsx?$/.test(p)) continue;
    if (/\.(test|spec)\.tsx?$/.test(p)) continue;

    const owner = componentOwnerOf(p);
    if (!owner) continue;
    if (isNewComponent?.(owner.name)) continue; // já é caso do showcase-check

    // Cada item é `{n, text}`; tolera string pra não quebrar se o parser mudar.
    const textos = (linhas ?? []).map((l) => (typeof l === "string" ? l : l?.text ?? ""));
    const exports = textos.filter((t) => EXPORT_RE.test(t));
    if (!exports.length) continue;

    const chave = `${owner.kind}:${owner.name}`;
    const atual = porComponente.get(chave) ?? { ...owner, exports: [] };
    atual.exports.push(...exports.map((t) => t.trim()));
    porComponente.set(chave, atual);
  }

  const findings = [];
  for (const owner of porComponente.values()) {
    const doc = expectedDocOf(owner);
    if (tocados.has(doc)) continue; // documentou junto — nada a dizer
    findings.push({
      name: owner.name,
      kind: owner.kind,
      doc,
      // dedupe: o mesmo `export` pode vir de arquivos diferentes do componente
      exports: [...new Set(owner.exports)],
    });
  }
  return findings;
}
