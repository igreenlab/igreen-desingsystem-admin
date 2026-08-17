#!/usr/bin/env node
/**
 * showcase-check — reprova PR que adiciona componente em `src/components/ui/`
 * sem o showcase registrado (superfície 4 da L-042).
 *
 * Detecta componente NOVO pelo diff, não por sweep total — assim não precisa
 * semear lista de exceção com o passivo atual. Critério de "novo" = pasta que
 * **não existia no base ref** (ver scripts/lib/new-component-folders.mjs);
 * arquivo novo em pasta existente NÃO é componente novo.
 *
 * Uso: node scripts/showcase-check.mjs [base-ref]
 *   Sem base-ref, resolve o remote CANÔNICO por URL (`scripts/lib/canonical-base-ref.mjs`).
 *   O default fixo `origin/main` era um bug aqui: neste repo `origin` é o fork parado.
 *
 * Não reprova em PR de rascunho: o wiring no ci.yml pula o step quando
 * `github.event.pull_request.draft` é true. Isso ADIA o check — o que fecha a
 * brecha é `ready_for_review` no `types:` do `pull_request`, que dispara uma run
 * nova ao sair de rascunho. Sem esse trigger a run verde do rascunho satisfaria
 * o required status check e o guard seria bypass permanente.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { newComponentFolders } from "./lib/new-component-folders.mjs";
import { checkRegistration, isPascalCase, toKebab } from "./lib/showcase-registration.mjs";
import { resolveBaseRefFromGit } from "./lib/canonical-base-ref.mjs";

const base = process.argv[2] ?? resolveBaseRefFromGit().ref;
const IN_GHA = process.env.GITHUB_ACTIONS === "true";
const esc = (s) =>
  String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");

/** @param {"error"|"warning"} level */
function annotate(level, title, message) {
  if (!IN_GHA) return;
  console.log(`::${level} title=${esc(title)}::${esc(message)}`);
}

/** Nomes de componentes cuja pasta é NOVA neste diff. Todo o git vive aqui. */
function novosComponentes(baseRef) {
  // O `A` do --name-status é por ARQUIVO: pasta existente que recebe um arquivo
  // aparece igual a pasta criada agora. Quem separa os dois é o predicado
  // `existsAtBase` — resolvido contra o merge-base, o mesmo ponto de comparação
  // do `${baseRef}...HEAD` abaixo (usar o tip da base divergiria quando a base
  // andou depois do fork).
  const mergeBase = execFileSync("git", ["merge-base", baseRef, "HEAD"], {
    encoding: "utf8",
  }).trim();

  const out = execFileSync(
    "git",
    [
      "diff",
      "--name-status",
      // Sem isto, git reescreve renames como `R100 old → new` (status `R`, não
      // `A`) e uma pasta renomeada (ex.: Avatar→avatar-ig, TableToolbarV2→
      // TableToolbarDeprecated — coisa que este repo faz rotineiramente) passa
      // batido pelo --diff-filter=A abaixo: silent-pass exato que a L-042 existe
      // pra impedir, só que via rename em vez de mkdir. (O nome NOVO também não
      // existe no merge-base, então o predicado abaixo mantém o rename flagrado.)
      "--no-renames",
      "--diff-filter=A",
      `${baseRef}...HEAD`,
      "--",
      "src/components/ui",
    ],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );

  // `cat-file -e` sai != 0 tanto pra "não existe" quanto pra erro de git; ler os
  // dois como `false` erra pro lado de FLAGRAR, que é o fail-closed que se quer
  // aqui (um git quebrado de verdade já teria estourado no merge-base/diff).
  const existsAtBase = (nome) => {
    try {
      execFileSync("git", ["cat-file", "-e", `${mergeBase}:src/components/ui/${nome}`], {
        stdio: "ignore",
      });
      return true;
    } catch {
      return false;
    }
  };

  return newComponentFolders(out, existsAtBase);
}

let novos;
try {
  novos = novosComponentes(base);
} catch (err) {
  const msg =
    `showcase-check: não consegui diffar contra "${base}".` +
    ` No CI, garanta fetch-depth: 0 no actions/checkout;` +
    ` localmente, rode git fetch origin main.` +
    (err?.message ? ` Detalhe do git: ${err.message.trim()}` : "");
  console.error(`\n⚠️  ${msg}\n`);
  annotate("error", "showcase-check não conseguiu rodar", msg);
  process.exit(1);
}

if (!novos.length) {
  // Diz CONTRA O QUÊ comparou, e que só olha o que está COMMITADO. Sem isso a
  // mensagem lia como "está tudo certo": rodando local antes do commit — que é o
  // que o checklist do `impl-igreen` manda fazer — a pasta nova existe no disco,
  // não existe no `HEAD`, e o check respondia "nenhum componente novo". Falso
  // verde medido em 2026-08-14, com a pasta untracked E com ela staged.
  console.log(
    `\n✓ showcase-check: nenhum componente novo em ${base}...HEAD.\n` +
      `  (compara o que está COMMITADO — trabalho untracked ou apenas staged é invisível aqui;\n` +
      `   se você acabou de criar a pasta e ainda não commitou, este ✓ não diz nada sobre ela)\n`,
  );
  process.exit(0);
}

const appTsx = readFileSync("src/App.tsx", "utf8");
const navData = readFileSync("src/preview/components/doc-nav-data.ts", "utf8");

let reprovados = 0;
for (const name of novos) {
  // `toKebab` assume PascalCase; fora desse padrão o id sai errado, e checar com id
  // errado produziria falha bogus. Mas PULAR também não serve: este laço só vê pasta
  // NOVA no diff, então pular aqui significa **componente novo entregue sem o showcase
  // verificado** — a brecha exata que este gate existe pra fechar. Até 2026-08-17 era
  // `::warning` + `continue`, e warning não reprova: bastava nomear a pasta começando
  // em minúscula pra atravessar o gate inteiro.
  //
  // Agora REPROVA. E isto **não** é o "override configurável pra 1 exceção" que a
  // L-063 manda resistir: nenhuma lista de exceção foi criada. O único violador do
  // repo (`avatar-ig`) existe na `main` e portanto NUNCA aparece como pasta nova —
  // conferido. O efeito no repo hoje é ZERO; ele vale pra pasta nova futura.
  if (!isPascalCase(name)) {
    reprovados++;
    const msg =
      `${name} — pasta de componente NOVO fora do padrão PascalCase.` +
      ` Não consigo derivar o id da rota com segurança, então não tenho como verificar o` +
      ` showcase — e deixar passar sem verificar é justamente a brecha que este gate fecha.` +
      ` Renomeie a pasta pra PascalCase (ex.: MeuComponente), ou, se o componente é interno` +
      ` de propósito (sem showcase), declare em scripts/lib/ds-exceptions.mjs com o motivo.`;
    console.log(`\n✗ ${msg}\n`);
    annotate("error", `Showcase não verificável: ${name}`, msg);
    continue;
  }

  const faltas = checkRegistration({
    name,
    docExists: existsSync(`src/preview/pages/${name}Doc.tsx`),
    appTsx,
    navData,
  });
  if (!faltas.length) {
    console.log(`  ✓ ${name} — showcase registrado`);
    continue;
  }
  reprovados++;
  const id = toKebab(name);
  const linhas = [
    `Componente novo \`${name}\` sem showcase registrado (L-042, superfície 4).`,
    `A rota #/${id} vai abrir EM BRANCO.`,
    ``,
    `Falta:`,
    ...faltas.map((f) => `  • ${f.what}\n    → ${f.fix}`),
    ``,
    `NÃO precisa nesta PR: registry.json, vocabulário do consumidor, changelog —`,
    `consolidam no /ds-release (Regra 8).`,
    ``,
    `Se o componente é interno de propósito (sem showcase), adicione em`,
    `scripts/lib/ds-exceptions.mjs com o motivo.`,
  ];
  console.log(`\n✗ ${linhas.join("\n  ")}\n`);
  annotate("error", `Showcase não registrado: ${name}`, linhas.join(" "));
}

process.exit(reprovados > 0 ? 1 : 0);
