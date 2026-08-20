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
 *  2b. O CONTEÚDO do embed bate com os arquivos-fonte em disco. O check 2 é cego
 *      pra isso: carimbo só muda quando alguém roda `registry:stamp`, então PR que
 *      edita arquivo distribuído sem re-carimbar deixa carimbo igual e conteúdo
 *      diferente — e o embed é o que o consumidor recebe. INFORMATIVO sem `--ci`
 *      (Regra 8: distribuição consolida no /ds-release). Ver `lib/embed-content.mjs`.
 *
 * Exit 1 se houver qualquer inconsistência (falha o CI); 0 se tudo ok.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  checkEmbedStaleness,
  parseStamps,
  summarize,
  particionarPorSeveridade,
} from "./lib/embed-staleness.mjs";
import { compareEmbedContent, parseEmbed } from "./lib/embed-content.mjs";

const isCi = process.argv.includes("--ci");
let fail = 0;
const r = JSON.parse(readFileSync("registry.json", "utf8"));

// 0. código distribuído NÃO importa shadcn/ por caminho RELATIVO. O copy-in só
//    reescreve import por ALIAS (@/components/shadcn/X → ui/X); relativo é
//    PRESERVADO → aponta pra shadcn/ que não existe no consumidor → crash do app
//    inteiro (bug real: Modal importava "../../shadcn/dialog"). Gate standing — o
//    warning do registry-add-item é propose-time e não pega débito legado.
//
//    ⚠️ `src/blocks/` entra aqui junto de `ui/`: bloco também é item de registry
//    (`registry:block`), também chega no consumidor por copy-in, e o único jeito de o
//    import dele sobreviver é pelo alias. A varredura era só de `ui/` porque quando o
//    gate nasceu bloco não existia — e do `src/blocks/chart/x.tsx` a forma relativa é
//    `../../components/shadcn/card`, com o segmento `components/` no meio, que o padrão
//    antigo (`(\.\./)+shadcn/`) atravessava sem ver.
function walkTsUi(d) {
  let out = [];
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) out = out.concat(walkTsUi(p));
    else if (/\.tsx?$/.test(e.name) && !/\.test\./.test(e.name)) out.push(p);
  }
  return out;
}
const DIRS_DISTRIBUIDOS = ["src/components/ui", "src/blocks"];
let relShadcn = 0;
for (const dir of DIRS_DISTRIBUIDOS) {
  if (!existsSync(dir)) continue;
  for (const f of walkTsUi(dir)) {
    const m = readFileSync(f, "utf8").match(/from\s+"(\.\.\/)+(components\/)?shadcn\/[^"]+"/);
    if (m) {
      console.error(`✗ ${f.split(/[\\/]/).join("/")}: import relativo pra shadcn (${m[0]}) → troque por "@/components/shadcn/…" (relativo quebra no copy-in).`);
      relShadcn++;
    }
  }
}
if (relShadcn) { console.error(`✗ ${relShadcn} arquivo(s) distribuído(s) com import relativo pra shadcn/ — quebra o consumidor.`); fail = 1; }
else console.log(`✓ ui/ + blocks/: sem import relativo pra shadcn/.`);

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
      // `files-mismatch` é transitório POR DESIGN (Regra 8: distribuição consolida no
      // /ds-release) — informativo sem `--ci`, igual ao bloco 2b logo abaixo, que já
      // tinha esse tratamento pelo mesmo motivo. Carimbo divergente e afins seguem
      // bloqueando sempre: release que esqueceu o copy-registry não é transitório.
      // Ver `particionarPorSeveridade` em `lib/embed-staleness.mjs`.
      const { bloqueantes, transitorios } = particionarPorSeveridade(findings);
      const stale = bloqueantes.filter((f) => f.id === "stale");
      const noStamp = bloqueantes.filter((f) => f.id === "no-registry-stamp");

      const relata = (lista, marca, nivel) => {
        nivel(`${marca} embed DEFASADO em ${lista.length}/${r.items.length} itens.`);
        for (const f of lista.slice(0, 8)) nivel(`   ${f.msg}`);
        if (lista.length > 8) nivel(`   … e ${lista.length - 8} outros.`);
      };

      if (bloqueantes.length) {
        relata(bloqueantes, "✗", console.error);
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
      }

      if (transitorios.length) {
        const nivel = isCi ? console.error : console.warn;
        relata(transitorios, isCi ? "✗" : "⚠", nivel);
        nivel(`   → npm run registry:build  &&  cd registry-app && node scripts/copy-registry.mjs`);
        if (isCi) fail = 1;
        else nivel(`   (informativo: consolide no /ds-release — Regra 8)`);
      }
    } else {
      const { versions } = summarize(parseStamps(embedText));
      console.log(`✓ embed em sync (${r.items.length} itens, carimbo v${versions.join("/")}).`);
    }

    // 2b. embed em sync por CONTEÚDO — o carimbo acima não cobre isto.
    //
    // Carimbo só muda quando alguém roda `registry:stamp`. Um PR que edita arquivo
    // distribuído e não re-carimba deixa os dois artefatos com carimbo IGUAL e
    // conteúdo DIFERENTE — e o check de cima aprova. Medido em 2026-08-04: o fix do
    // header dos CSS gerados mudou os 5 itens de tema, e o embed seguiu servindo o
    // header velho (com um path que não existe em projeto de consumidor) com este
    // gate verde. O embed é o que o consumidor recebe; conteúdo é o produto.
    //
    // ⚠️ INFORMATIVO sem `--ci`, e isso é load-bearing. A Regra 8 diz que
    // distribuição (registry + embed) NÃO vai por-PR-de-componente — consolida no
    // `/ds-release`. Então toda PR que edita componente distribuído deixa o embed
    // defasado POR DESIGN, e um gate bloqueante aqui reprovaria a PR justamente por
    // seguir a regra do projeto. Descoberto na 1ª PR de componente depois de eu
    // ligar este check: ele reprovou uma mudança de padding do AppShell. Mesma forma
    // do `distribution-debt`, pelo mesmo motivo. A forma bloqueante vive no
    // `release:check`, que é onde "defasado" deixa de ser transitório e vira o que
    // o consumidor recebe.
    try {
      const { conferidos, divergentes, semFonte } = compareEmbedContent(parseEmbed(embedText));
      if (divergentes.length || semFonte.length) {
        const nivel = isCi ? console.error : console.warn;
        const marca = isCi ? "✗" : "⚠";
        if (divergentes.length) {
          nivel(`${marca} embed com CONTEÚDO defasado em ${divergentes.length}/${conferidos} arquivo(s).`);
          for (const d of divergentes.slice(0, 8)) nivel(`   ${d}`);
          if (divergentes.length > 8) nivel(`   … e ${divergentes.length - 8} outros.`);
        }
        if (semFonte.length) {
          nivel(`${marca} embed cita ${semFonte.length} arquivo(s) que não existem mais na fonte.`);
          for (const s of semFonte.slice(0, 8)) nivel(`   ${s}`);
        }
        nivel(`   → npm run registry:build  &&  cd registry-app && node scripts/copy-registry.mjs`);
        if (isCi) fail = 1;
        else nivel(`   (informativo: consolide no /ds-release — Regra 8)`);
      } else {
        console.log(`✓ embed em sync por conteúdo (${conferidos} arquivos idênticos à fonte).`);
      }
    } catch (e) {
      console.error(`✗ não consegui comparar o conteúdo do embed: ${e.message}`); fail = 1;
    }
  }
} else {
  console.error(`✗ embed ausente: ${EMBED}`); fail = 1;
}

process.exit(fail);
