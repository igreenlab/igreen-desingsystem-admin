#!/usr/bin/env node
/**
 * lib-verify.mjs — valida o pacote npm ANTES do publish.
 *
 * Automatiza a parte da **L-017** que nunca foi automatizada. A lição termina com
 * *"Validar via `npm pack --dry-run` antes de publish"* — e dependia de alguém
 * lembrar. Custou 4 releases publicadas quebradas em silêncio (v0.1.0→v0.5.0): os
 * `.d.ts` apontavam pra `dist-lib/src/**`, que não estava em `files`, então o
 * tarball subia sem eles e todo `import` do consumidor virava `any`.
 *
 * Três camadas, da mais barata pra mais forte:
 *   1. contrato (puro, `lib/pack-contract.mjs`): todo path prometido em
 *      exports/main/module/types é coberto por alguma entrada de `files`?
 *   2. disco: esses arquivos e os diretórios de `files` existem de verdade?
 *   3. **o que o npm VAI empacotar** (`npm pack --dry-run --json`): a resolução
 *      real do npm inclui cada entry? Esta é a que pega o modo de falha da L-017,
 *      porque não depende da minha emulação de glob.
 *
 * Uso:
 *   node scripts/lib-verify.mjs            # exige dist-lib já buildado
 *   node scripts/lib-verify.mjs --build    # roda `npm run build:lib` antes
 *
 * Exit 1 em qualquer problema (fail-closed — é gate de publish).
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { packContract, dtsSpecifiers, resolveDtsCandidates } from "./lib/pack-contract.mjs";

const build = process.argv.includes("--build");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
// `execFileSync` não executa `.cmd` no Windows sem shell (spawnSync → EINVAL).
// Todos os args aqui são literais fixos, então não há superfície de injeção.
const win = process.platform === "win32";
let fail = 0;

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const { entryPaths, dirGlobs, problems } = packContract(pkg);

console.log(`lib-verify — ${pkg.name}@${pkg.version}`);

// ── 1. contrato (não toca disco) ────────────────────────────────────────────────
const bloqueantes = problems.filter((p) => p.id !== "sem-readme");
for (const p of problems) {
  const grave = p.id !== "sem-readme";
  console[grave ? "error" : "warn"](`  ${grave ? "✗" : "⚠"} ${p.msg}`);
}
if (bloqueantes.length) fail = 1;
else console.log(`  ✓ contrato: ${entryPaths.length} entry(s) cobertos por \`files\`.`);

// ── 2. build opcional ──────────────────────────────────────────────────────────
if (build) {
  console.log("  … rodando `npm run build:lib`");
  try {
    execFileSync(npm, ["run", "build:lib"], { stdio: "pipe", shell: win });
    console.log("  ✓ build:lib ok.");
  } catch (e) {
    console.error("  ✗ `npm run build:lib` FALHOU — publish sairia quebrado.");
    console.error(String(e.stdout ?? e.message).split("\n").slice(-12).join("\n"));
    process.exit(1);
  }
}

// ── 3. disco ───────────────────────────────────────────────────────────────────
if (!existsSync("dist-lib")) {
  console.error(
    "  ✗ `dist-lib/` não existe — rode com `--build` (ou `npm run build:lib`) antes.",
  );
  process.exit(1);
}

const ausentes = entryPaths.filter((p) => !existsSync(p));
if (ausentes.length) {
  console.error(`  ✗ ${ausentes.length} entry(s) prometido(s) NÃO existem em disco:`);
  for (const p of ausentes) console.error(`      ${p}`);
  fail = 1;
} else console.log(`  ✓ disco: os ${entryPaths.length} entry(s) existem.`);

const dirsVazios = dirGlobs.filter(
  (d) => !existsSync(d) || readdirSync(d).length === 0,
);
if (dirsVazios.length) {
  console.error(
    `  ✗ diretório(s) de \`files\` ausente(s)/vazio(s): ${dirsVazios.join(", ")} — é o modo de falha da L-017 (os .d.ts referenciam esses paths).`,
  );
  fail = 1;
} else console.log(`  ✓ disco: ${dirGlobs.length} diretório(s) de \`files\` populado(s).`);

// ── 4. o que o npm VAI empacotar ───────────────────────────────────────────────
let tar;
try {
  const out = execFileSync(npm, ["pack", "--dry-run", "--json"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
    shell: win,
  });
  tar = JSON.parse(out)[0];
} catch (e) {
  console.error(`  ✗ \`npm pack --dry-run\` falhou: ${e.message.split("\n")[0]}`);
  process.exit(1);
}

const noTarball = new Set((tar.files ?? []).map((f) => f.path.replace(/\\/g, "/")));
const foraDoTarball = entryPaths.filter((p) => !noTarball.has(p));
if (foraDoTarball.length) {
  console.error(
    `  ✗ ${foraDoTarball.length} entry(s) NÃO entram no tarball — o consumidor instalaria e o import quebraria (L-017):`,
  );
  for (const p of foraDoTarball) console.error(`      ${p}`);
  fail = 1;
} else {
  console.log(
    `  ✓ tarball: ${tar.entryCount} arquivo(s), ${(tar.size / 1024 / 1024).toFixed(1)} MB — todos os entry(s) incluídos.`,
  );
}

// Sanidade: um tarball minúsculo significa que o `files` não casou com nada — foi
// exatamente o que `npm pack` devolveu (2 arquivos) com o dist-lib ausente.
if ((tar.entryCount ?? 0) < 50) {
  console.error(
    `  ✗ tarball com só ${tar.entryCount} arquivo(s) — suspeito de \`files\` não casar com nada. Buildou?`,
  );
  fail = 1;
}

// ── 5. FECHAMENTO dos .d.ts (o check que de fato pega a L-017) ──────────────────
//
// Os entry points existirem e entrarem no tarball NÃO basta: `dist-lib/index.d.ts`
// é só `export * from './src/components/index'`. O contrato real é que o conjunto
// de `.d.ts` do tarball seja FECHADO sob imports relativos — se `files` derrubar um
// diretório, algum `.d.ts` passa a referenciar arquivo ausente e todo `import` do
// consumidor vira `any`, que é o bug das v0.1.0→v0.5.0.
const dts = [...noTarball].filter((p) => p.endsWith(".d.ts"));
const quebrados = [];
for (const f of dts) {
  let conteudo;
  try {
    conteudo = readFileSync(f, "utf8");
  } catch {
    continue; // está no tarball mas não em disco — já acusado acima
  }
  for (const spec of dtsSpecifiers(conteudo)) {
    const cands = resolveDtsCandidates(f, spec);
    if (!cands.some((c) => noTarball.has(c))) {
      quebrados.push({ de: f, spec, tentou: cands });
    }
  }
}
if (quebrados.length) {
  console.error(
    `  ✗ ${quebrados.length} referência(s) de tipo apontam pra FORA do tarball — o consumidor instala e o import vira \`any\` (L-017):`,
  );
  for (const q of quebrados.slice(0, 6)) {
    console.error(`      ${q.de}  →  "${q.spec}"`);
    console.error(`         tentou: ${q.tentou.join(" | ")}`);
  }
  if (quebrados.length > 6) console.error(`      … e ${quebrados.length - 6} outra(s).`);
  console.error(
    `      → normalmente falta uma entrada de diretório em \`files\` (ver L-017 em lessons.md).`,
  );
  fail = 1;
} else {
  console.log(`  ✓ tipos: ${dts.length} .d.ts, todas as referências relativas resolvem dentro do tarball.`);
}

console.log(fail ? "\n✗ lib-verify REPROVOU — não publique." : "\n✓ lib-verify ok — pronto pro publish.");
process.exit(fail);
