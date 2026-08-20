#!/usr/bin/env node
/**
 * lint-styles — anti-patterns de estilo do DS, em 2 modos.
 *
 *   --file <path>      varre o arquivo inteiro. Usado pelo hook local
 *                      (aviso informativo). SEMPRE exit 0 — EM QUALQUER
 *                      caminho do modo, incluindo path faltando/arquivo
 *                      inexistente. O hook nunca pode passar a bloquear
 *                      o edit do dev por causa deste modo.
 *   --ratchet [base]   varre SÓ as linhas adicionadas vs <base>. Usado no CI
 *                      (que passa base explícita). Sem base, resolve o remote
 *                      CANÔNICO por URL — ver scripts/lib/canonical-base-ref.mjs
 *                      e por que "default origin/main" era um bug neste repo.
 *                      exit 1 se houver violação nova.
 *
 * Erro de uso do CLI (nenhuma flag reconhecida) é diferente: sai 2 no
 * dispatch de argv abaixo — isso é fronteira do CLI, não do modo --file.
 *
 * Patterns: scripts/lib/ds-lint-patterns.mjs (fonte única, compartilhada com o
 * hook — nunca duplique a tabela aqui).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { scanLines } from "./lib/ds-lint-patterns.mjs";
import { parseAddedLines } from "./lib/diff-added-lines.mjs";
import { resolveBaseRefFromGit } from "./lib/canonical-base-ref.mjs";

// Escopo: styles de componente E os próprios componentes.
//
// `*.tsx` entrou porque o gate só olhava `*styles.ts` — então Tailwind literal
// escrito direto no componente (`<div className="flex gap-4">`) passava limpo,
// que é o erro mais provável de quem não conhece o padrão. Medido antes de
// ligar: 3 violações reais no `ui/` (todas o mesmo container de 36px) e 27 no
// `shadcn/`, congeladas pelo ratchet.
//
// `src/examples/**` e `src/preview/**` seguem FORA de propósito — são
// cópias/demos, não a fonte do DS.
//
// ⚠️ POLÍTICA (decidida aqui, não pra ser descoberta no meio de um re-sync): com
// `.tsx` no escopo, o ratchet BLOQUEIA re-sync upstream dos primitivos shadcn. As
// 27 violações congeladas vivem em menubar/context-menu/dropdown-menu/drawer/
// select; re-colar essas linhas ao trazer versão nova conta como linha ADICIONADA
// (a mensagem do ratchet avisa: "código MOVIDO conta como adicionado"). Ou seja:
// quem re-sincroniza um primitivo adapta pros tokens DS na MESMA passagem — que
// já é a regra do repo (L-039/L-040), agora obrigatória. Se um dia atrapalhar um
// re-sync grande, a saída não é afrouxar o pattern.
// `src/blocks/**` ENTRA (2026-08-19): bloco não é demo — é a fonte de um padrão que
// alguém vai copiar confiando. Bloco ensinando `gap-4` em vez de `gap-gp-md` é o mesmo
// defeito que custou duas vezes em 2026-08-19 (exemplo canônico ensinando o contrário
// da regra). Medido antes de ligar: o glob de `src/components/**` NÃO alcançava
// `src/blocks/`, então o lint passaria limpo por ausência, não por conformidade.
const GLOB = [
  "src/components/**/*styles.ts",
  "src/components/**/*.tsx",
  "src/blocks/**/*.tsx",
];

// Rodando dentro do GitHub Actions? Lá, além do log humano, emitimos workflow
// commands (`::error file=…,line=…::`) — o GitHub transforma isso em anotação
// NA LINHA do diff, na aba "Files changed". Sem isso o achado fica só no log
// do step, que vem colapsado e ninguém abre.
const IN_GHA = process.env.GITHUB_ACTIONS === "true";

/** Escapa os separadores que os workflow commands do GitHub interpretam. */
const esc = (s) =>
  String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");

/**
 * Emite uma anotação do GitHub Actions. No-op fora do CI.
 * @param {"error"|"warning"|"notice"} level
 */
function annotate(level, { file, line, title, message }) {
  if (!IN_GHA) return;
  const loc = [file && `file=${esc(file)}`, line && `line=${line}`, title && `title=${esc(title)}`]
    .filter(Boolean)
    .join(",");
  console.log(`::${level} ${loc}::${esc(message)}`);
}

function report(violations, { blocking }) {
  for (const v of violations) {
    console.log(`\n  ${blocking ? "✗" : "•"} ${v.file}:${v.n}  [${v.id}]`);
    console.log(`      ${v.text.trim().slice(0, 110)}`);
    console.log(`      → ${v.msg}`);
    // Só o modo bloqueante anota como `error`. O modo hook não roda no CI.
    if (blocking) {
      annotate("error", {
        file: v.file,
        line: v.n,
        title: `${v.id} — anti-pattern de estilo do DS`,
        message: v.msg,
      });
    }
  }
}

function modeFile(path) {
  if (!path) {
    console.error("--file exige um caminho");
    return 0; // modo hook NUNCA bloqueia — nem em erro de uso deste modo
  }
  if (!existsSync(path)) return 0; // hook pode disparar em arquivo já removido
  const lines = readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((text, i) => ({ n: i + 1, text }));
  const violations = scanLines(lines).map((v) => ({ ...v, file: path }));
  if (violations.length) {
    console.log(
      `\n⚠️  ds-lint-styles — ${violations.length} violação(ões) anti-DS em ${path}:`,
    );
    report(violations, { blocking: false });
    console.log(
      "\n   Referência: .claude/rules/ds-standards.md (Anti-patterns) · tokens em .ai/context/tokens/\n",
    );
  }
  return 0; // modo hook NUNCA bloqueia
}

function modeRatchet(base, motivoDaBase) {
  let diff = "";
  // A base resolvida vai pro log SEMPRE (não só no erro): foi justamente uma base
  // silenciosa que deixou o gate diffar contra uma foto de maio por meses.
  if (motivoDaBase) console.log(`   base do ratchet: ${base} — ${motivoDaBase}`);
  try {
    // --merge-base: compara com o ponto de divergência, não com o tip da base.
    // Sem isso, commit que entrou na base depois do fork aparece como `+`
    // e reprova quem não mexeu naquilo.
    diff = execFileSync("git", ["diff", "-U0", "--merge-base", base, "--", ...GLOB], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (err) {
    const detail = err?.message ? ` Detalhe do git: ${err.message.trim()}` : "";
    // A instrução cita o remote REALMENTE resolvido. Mandar "git fetch origin main"
    // num repo onde `origin` é o fork parado é instrução pra reproduzir o bug (L-060).
    const remote = base.includes("/") ? base.slice(0, base.indexOf("/")) : "origin";
    const branch = base.includes("/") ? base.slice(base.indexOf("/") + 1) : base;
    const msg =
      `lint-styles: não consegui diffar contra "${base}".` +
      ` No CI, garanta fetch-depth: 0 no actions/checkout;` +
      ` localmente, rode git fetch ${remote} ${branch}.${detail}`;
    console.error(`\n⚠️  ${msg}\n`);
    annotate("error", { title: "lint-styles não conseguiu rodar", message: msg });
    return 1;
  }

  const added = parseAddedLines(diff);
  const violations = [];
  let files = 0;
  let lines = 0;
  for (const [file, ls] of added) {
    if (!ls.length) continue;
    files++;
    lines += ls.length;
    violations.push(...scanLines(ls).map((v) => ({ ...v, file })));
  }

  if (!violations.length) {
    // `files === 0` é ambíguo: pode ser "a PR não tocou arquivo lintável" ou
    // "o que eu escrevi ainda não está commitado". O ratchet lê `git diff`, então
    // trabalho untracked é invisível — medido em 2026-08-14: pasta nova no disco
    // devolvia "0 arquivo(s)", e o mesmo comando via 63 linhas depois do `git add`.
    const nada =
      files === 0
        ? `\n  (0 arquivo comparável em ${base}...HEAD — se você acabou de escrever código,` +
          ` confira se está ao menos em staging: o ratchet lê o diff do git, não o disco)`
        : "";
    console.log(
      `\n✓ lint-styles (ratchet vs ${base}): ${files} arquivo(s), ${lines} linha(s) adicionada(s), 0 violação nova.${nada}\n`,
    );
    return 0;
  }

  console.log(
    `\n✗ lint-styles (ratchet vs ${base}): ${violations.length} violação(ões) em linha ADICIONADA por esta PR:`,
  );
  report(violations, { blocking: true });
  console.log(
    "\n  Só linhas adicionadas contam — débito pré-existente no arquivo não reprova.\n" +
      "  Nota: código MOVIDO conta como adicionado; se você só reposicionou uma linha\n" +
      "  que já violava, corrija-a agora.\n" +
      "  Referência: .claude/rules/ds-standards.md (Anti-patterns).\n",
  );
  return 1;
}

const argv = process.argv.slice(2);
const fileIdx = argv.indexOf("--file");
const ratchetIdx = argv.indexOf("--ratchet");
if (fileIdx !== -1) {
  process.exit(modeFile(argv[fileIdx + 1]));
} else if (ratchetIdx !== -1) {
  // `--ratchet --outra-flag` não é um ref chamado "--outra-flag".
  const seguinte = argv[ratchetIdx + 1];
  const explicita = seguinte && !seguinte.startsWith("--") ? seguinte : undefined;
  if (explicita) {
    // CI passa base explícita (`origin/${{ github.base_ref }}`) — a base pode não
    // ser `main`. Quem passa manda; nada a resolver.
    process.exit(modeRatchet(explicita));
  }
  const { ref, motivo } = resolveBaseRefFromGit();
  process.exit(modeRatchet(ref, motivo));
} else {
  console.error("uso: lint-styles.mjs --file <path> | --ratchet [base-ref]");
  process.exit(2);
}
