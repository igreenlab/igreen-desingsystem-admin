#!/usr/bin/env node
/**
 * registry-check.mjs — valida a consistência do registry SEM precisar buildar
 * (não requer IGREEN_TOKEN). Roda local e no CI.
 *
 * Checa:
 *   1. Todo files[].path de cada item do registry.json existe no disco.
 *  1b. Nenhum path com backslash (quebraria o copy-in em Linux/Mac).
 *   2. O embed (registry-app/app/registry-data.ts) está em sincronia com o
 *      registry.json — comparando o `meta.stamp` (versão + hash git) de cada item,
 *      não só a presença do nome. Ver `lib/embed-staleness.mjs` pra por quê.
 *
 * Exit 1 se houver qualquer inconsistência (falha o CI); 0 se tudo ok.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { checkEmbedStaleness, parseStamps, summarize } from "./lib/embed-staleness.mjs";

let fail = 0;
const r = JSON.parse(readFileSync("registry.json", "utf8"));

// 0. componentes ui/ NÃO importam shadcn/ por caminho RELATIVO. O copy-in só
//    reescreve import por ALIAS (@/components/shadcn/X → ui/X); relativo é
//    PRESERVADO → aponta pra shadcn/ que não existe no consumidor → crash do app
//    inteiro (bug real: Modal importava "../../shadcn/dialog"). Gate standing — o
//    warning do registry-add-item é propose-time e não pega débito legado.
function walkTsUi(d) {
  let out = [];
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) out = out.concat(walkTsUi(p));
    else if (/\.tsx?$/.test(e.name) && !/\.test\./.test(e.name)) out.push(p);
  }
  return out;
}
const UI_DIR = "src/components/ui";
let relShadcn = 0;
if (existsSync(UI_DIR)) {
  for (const f of walkTsUi(UI_DIR)) {
    const m = readFileSync(f, "utf8").match(/from\s+"(\.\.\/)+shadcn\/[^"]+"/);
    if (m) {
      console.error(`✗ ${f.split(/[\\/]/).join("/")}: import relativo pra shadcn (${m[0]}) → troque por "@/components/shadcn/…" (relativo quebra no copy-in).`);
      relShadcn++;
    }
  }
}
if (relShadcn) { console.error(`✗ ${relShadcn} componente(s) ui/ com import relativo pra shadcn/ — quebra o consumidor.`); fail = 1; }
else console.log(`✓ ui/: sem import relativo pra shadcn/.`);

// 1. paths existem
let missing = 0;
for (const it of r.items) {
  for (const f of it.files || []) {
    if (!existsSync(f.path)) {
      console.error(`✗ ${it.name}: arquivo ausente → ${f.path}`);
      missing++;
    }
  }
}
if (missing) { console.error(`✗ ${missing} path(s) de registry.json não existem no disco.`); fail = 1; }
else console.log(`✓ registry.json: ${r.items.length} itens, todos os files[].path existem.`);

// 1b. separador de path tem que ser "/" — backslash quebra o copy-in em Linux/Mac
let bs = 0;
for (const it of r.items) {
  for (const f of it.files || []) {
    if (`${f.path}${f.target ?? ""}`.includes("\\")) {
      console.error(`✗ ${it.name}: path/target com backslash (Windows) → ${f.path}`);
      bs++;
    }
  }
}
if (bs) { console.error(`✗ ${bs} path(s) com "\\" — normalize pra "/" (quebra consumidor não-Windows).`); fail = 1; }
else console.log(`✓ separadores de path ok (sem backslash).`);

// 2. embed em sync — por CARIMBO, não por nome.
//
// Checar só "o embed contém o nome do item" era verde-permanente: nome não muda
// entre releases. O `meta.stamp` (v<versão> + hash git) muda, e existe nos dois
// artefatos commitados — então detecta o release que carimbou o registry.json e
// esqueceu o `copy-registry.mjs`, que serve código velho com número novo.
const EMBED = "registry-app/app/registry-data.ts";
if (existsSync(EMBED)) {
  const embedText = readFileSync(EMBED, "utf8");

  const absent = r.items.map((i) => i.name).filter((n) => !embedText.includes(`"${n}"`));
  if (absent.length) {
    console.error(`✗ embed (${EMBED}) não contém: ${absent.join(", ")} — rode copy-registry.mjs.`);
    fail = 1;
  } else {
    const findings = checkEmbedStaleness({ items: r.items, embedText });
    if (findings.length) {
      const stale = findings.filter((f) => f.id === "stale");
      const noStamp = findings.filter((f) => f.id === "no-registry-stamp");
      console.error(`✗ embed DEFASADO em ${findings.length}/${r.items.length} itens.`);
      for (const f of findings.slice(0, 8)) console.error(`   ${f.msg}`);
      if (findings.length > 8) console.error(`   … e ${findings.length - 8} outros.`);
      const reg = summarize(parseStamps(r.items.map((i) => i.meta?.stamp ?? "").join("\n")));
      const emb = summarize(parseStamps(embedText));
      console.error(
        `   registry.json: ${reg.count} carimbos, v[${reg.versions}] · embed: ${emb.count} carimbos, v[${emb.versions}]`,
      );
      if (stale.length && !noStamp.length) {
        console.error(`   → regenere o embed:  cd registry-app && node scripts/copy-registry.mjs`);
        console.error(`     (precisa do public/r local — rode \`npm run registry:build\` antes)`);
      }
      if (noStamp.length) console.error(`   → carimbe primeiro:  npm run registry:stamp`);
      fail = 1;
    } else {
      const { versions } = summarize(parseStamps(embedText));
      console.log(`✓ embed em sync (${r.items.length} itens, carimbo v${versions.join("/")}).`);
    }
  }
} else {
  console.error(`✗ embed ausente: ${EMBED}`); fail = 1;
}

process.exit(fail);
