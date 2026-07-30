/**
 * embed-staleness.mjs — lógica PURA (zero I/O) pra detectar embed do registry
 * DEFASADO em relação ao `registry.json`.
 *
 * ## O furo que isto fecha
 *
 * A cadeia de distribuição tem um passo MANUAL no meio:
 *
 *   registry:build → public/r/*.json (gitignored, só local)
 *        ↓  cd registry-app && node scripts/copy-registry.mjs   ← MANUAL
 *   registry-app/app/registry-data.ts (commitado, ~6.8 MB)
 *        ↓  Vercel (`buildCommand: "next build"` — NÃO roda o prebuild)
 *   igreen-registry.vercel.app/r/{name}.json                    ← o consumidor
 *
 * O `registry-check` só verificava se o embed **contém os nomes** dos itens. Como
 * nome nunca muda entre releases, ele dizia "embed em sync" com o CONTEÚDO
 * arbitrariamente velho. Cenário real: bump pra 0.30.1 → `registry:build` carimba
 * o `registry.json` com v0.30.1 → esquece o `copy-registry.mjs` → o consumidor
 * recebe o código de 0.30.0 rotulado como 0.30.1, e todo check verde.
 *
 * O `meta.stamp` de cada item (`igreen-ds · <nome> · v<versão> · <hash> · <data>`)
 * é o que torna isso detectável: ele existe nos DOIS artefatos commitados, então dá
 * pra comparar sem precisar do `public/r` (que não existe no CI).
 */

/** Formato do carimbo emitido por `registry-stamp.mjs`. */
const STAMP = /igreen-ds · ([a-z0-9@/-]+) · v([\d.]+) · ([0-9a-f]+) · (\d{4}-\d{2}-\d{2})/g;

/**
 * Extrai `nome → {version, hash, date}` de um texto qualquer que contenha carimbos.
 * Última ocorrência de um nome vence (o embed tem 1 carimbo por item).
 */
export function parseStamps(text) {
  const out = new Map();
  for (const m of String(text ?? "").matchAll(STAMP)) {
    out.set(m[1], { version: m[2], hash: m[3], date: m[4] });
  }
  return out;
}

/** Serializa de volta pro formato do carimbo — usado nas mensagens. */
function fmt(name, s) {
  return s ? `${name} · v${s.version} · ${s.hash}` : `${name} · (sem carimbo)`;
}

/**
 * Extrai o mapa `nome → item` do módulo do embed.
 *
 * O embed é `export const registry: Record<string, unknown> = { … };` — dá pra
 * recortar o objeto e `JSON.parse`. Devolve `null` quando não dá pra parsear, e o
 * chamador simplesmente pula as checagens que dependem disso (nunca lança: este
 * módulo é consumido por um check que já tem outras camadas).
 */
export function parseEmbedItems(text) {
  try {
    const s = String(text ?? "");
    const i = s.indexOf("{", s.indexOf("="));
    const j = s.lastIndexOf("}");
    if (i < 0 || j <= i) return null;
    const map = JSON.parse(s.slice(i, j + 1));
    return map && typeof map === "object" ? map : null;
  } catch {
    return null;
  }
}

/** Conjunto de `files[].path` de um item, normalizado. */
function pathsOf(item) {
  return new Set(
    (item?.files ?? [])
      .map((f) => String(f?.path ?? "").replace(/\\/g, "/"))
      .filter(Boolean),
  );
}

/**
 * Compara os carimbos do `registry.json` com os do embed.
 *
 * @param {object}   a
 * @param {Array}    a.items      — `registry.json.items`
 * @param {string}   a.embedText  — conteúdo de `registry-app/app/registry-data.ts`
 * @returns {Array<{id:string, name:string, msg:string}>} vazio = em sincronia.
 *
 * `id` classifica o achado:
 *   `no-registry-stamp` — item sem `meta.stamp`: nada a comparar (rode `registry:stamp`)
 *   `absent-in-embed`   — carimbo do item não existe no embed: nunca foi regenerado
 *   `stale`             — carimbo existe mas DIVERGE: embed defasado (conteúdo)
 *   `files-mismatch`    — `files[]` do item diverge entre registry.json e embed
 *                         (deriva ESTRUTURAL, que o carimbo não pega)
 */
export function checkEmbedStaleness({ items, embedText }) {
  const embed = parseStamps(embedText);
  // O carimbo pega deriva de CONTEÚDO (versão/hash). Não pega deriva ESTRUTURAL:
  // adicionar/remover um arquivo do `files[]` de um item sem re-carimbar deixa os
  // dois carimbos iguais. Caso real (2026-07-29): o `USAGE.md` do DatePicker entrou
  // no registry.json e o embed seguiu com 2 arquivos — "em sync" com o consumidor
  // sem receber a doc. Daí a comparação de `files[]` abaixo.
  const embedItems = parseEmbedItems(embedText);
  const findings = [];

  for (const it of items ?? []) {
    const name = it?.name;
    if (!name) continue;

    if (embedItems && name in embedItems) {
      const want = pathsOf(it);
      const got = pathsOf(embedItems[name]);
      const faltando = [...want].filter((p) => !got.has(p));
      const sobrando = [...got].filter((p) => !want.has(p));
      if (faltando.length || sobrando.length) {
        const partes = [];
        if (faltando.length) partes.push(`faltam no embed: ${faltando.join(", ")}`);
        if (sobrando.length) partes.push(`sobram no embed: ${sobrando.join(", ")}`);
        findings.push({
          id: "files-mismatch",
          name,
          msg: `${name}: files[] divergente — ${partes.join(" · ")}.`,
        });
      }
    }

    const raw = it?.meta?.stamp;
    if (!raw) {
      findings.push({
        id: "no-registry-stamp",
        name,
        msg: `${name}: sem meta.stamp no registry.json — rode \`npm run registry:stamp\`.`,
      });
      continue;
    }

    const want = parseStamps(raw).get(name);
    if (!want) {
      findings.push({
        id: "no-registry-stamp",
        name,
        msg: `${name}: meta.stamp em formato não reconhecido → ${JSON.stringify(raw)}`,
      });
      continue;
    }

    const got = embed.get(name);
    if (!got) {
      findings.push({
        id: "absent-in-embed",
        name,
        msg: `${name}: carimbo ausente no embed (registry.json diz ${fmt(name, want)}) — o embed nunca foi regenerado pra este item.`,
      });
      continue;
    }

    if (got.version !== want.version || got.hash !== want.hash) {
      findings.push({
        id: "stale",
        name,
        msg: `${name}: embed DEFASADO — registry.json diz ${fmt(name, want)}, embed tem ${fmt(name, got)}.`,
      });
    }
  }

  return findings;
}

/**
 * Resumo legível dos carimbos de um lado só — pra mensagem de sucesso e pra
 * diagnóstico quando há divergência em massa (todo item de uma vez).
 */
export function summarize(stamps) {
  const versions = [...new Set([...stamps.values()].map((s) => s.version))].sort();
  const hashes = [...new Set([...stamps.values()].map((s) => s.hash))].sort();
  return { count: stamps.size, versions, hashes };
}
