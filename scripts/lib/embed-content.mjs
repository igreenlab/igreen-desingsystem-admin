/**
 * embed-content.mjs — o embed servido ao consumidor bate com os arquivos-fonte?
 *
 * `registry-app/app/registry-data.ts` é o que o consumidor REALMENTE recebe: o
 * registry-app serve o embed por route handler (com auth Bearer), e `public/r/` nem
 * entra — é gitignored e "estático fura a auth". Então o embed é o artefato de
 * distribuição, e o conteúdo dele é o produto.
 *
 * ## Por que este check existe, tendo `embed-staleness`
 *
 * O `embed-staleness` compara **carimbos** (`meta.stamp`) entre `registry.json` e o
 * embed. Isso pega item novo e release não propagada, mas é cego pra mudança de
 * CONTEÚDO sem re-carimbo — e o carimbo só muda quando alguém roda `registry:stamp`.
 *
 * Medido em 2026-08-04: o PR que consertou o header dos CSS gerados mudou os 5 itens
 * de tema e não re-carimbou. Resultado: `registry-check` dizia "embed em sync (91
 * itens, carimbo v0.33.0)" enquanto o embed servia o header VELHO — com um path
 * (`src/hooks/useBrand.ts`) que não existe em projeto de consumidor. Três gates
 * verdes, artefato distribuído errado. Este check compara o que de fato importa.
 *
 * Comparação é exata: nas 483 entradas com `content`, o `shadcn build` copia o
 * arquivo verbatim (não reescreve import), então divergência = defasagem real.
 * Normaliza só CRLF e BOM, que variam por checkout no Windows.
 */
import { readFileSync, existsSync } from "node:fs";

const EMBED = "registry-app/app/registry-data.ts";

/** Normaliza o que varia por plataforma, e só isso. */
const norm = (s) => String(s).replace(/\r/g, "").replace(/^﻿/, "");

/**
 * Extrai o objeto do embed. O arquivo é `export const registry: Record<...> = {...};`
 * — JSON puro depois do `=`, porque é auto-gerado por `copy-registry.mjs`.
 */
export function parseEmbed(text) {
  const i = text.indexOf("=", text.indexOf("export const registry"));
  if (i < 0) throw new Error(`${EMBED}: não achei a declaração \`export const registry\``);
  const corpo = text.slice(i + 1).trim().replace(/;\s*$/, "");
  return JSON.parse(corpo);
}

/**
 * Compara cada `files[].content` do embed com o arquivo em disco.
 *
 * @returns {{ conferidos: number, divergentes: string[], semFonte: string[] }}
 *   `divergentes` = conteúdo diferente da fonte (embed defasado — rode
 *   `registry:build` + `copy-registry`). `semFonte` = embed cita path que não existe
 *   mais (arquivo renomeado/removido sem regerar o embed).
 */
export function compareEmbedContent(registry, { readFile = readFileSync, exists = existsSync } = {}) {
  const divergentes = [];
  const semFonte = [];
  let conferidos = 0;

  for (const [nome, item] of Object.entries(registry)) {
    for (const f of item?.files ?? []) {
      if (!f?.path || f.content === undefined) continue;
      if (!exists(f.path)) {
        semFonte.push(`${nome} → ${f.path}`);
        continue;
      }
      conferidos++;
      if (norm(readFile(f.path, "utf8")) !== norm(f.content)) {
        divergentes.push(`${nome} → ${f.path}`);
      }
    }
  }

  return { conferidos, divergentes, semFonte };
}

/** Lê o embed do disco e compara. Lança se o embed não existir. */
export function checkEmbedContent(embedPath = EMBED) {
  if (!existsSync(embedPath)) throw new Error(`${embedPath} não existe — rode copy-registry.mjs`);
  return compareEmbedContent(parseEmbed(readFileSync(embedPath, "utf8")));
}

export { EMBED };
