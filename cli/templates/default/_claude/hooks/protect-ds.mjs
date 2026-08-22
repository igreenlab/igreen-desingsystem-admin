#!/usr/bin/env node
/**
 * protect-ds.mjs — PreToolUse hook (Edit|Write) que protege a integridade do
 * iGreen DS no projeto consumidor.
 *
 * **Ciente do modo** (desde 2026-08-18): sem `.claude/ds-config.json` opera em copy-in,
 * exatamente como antes; com `mode: "submodule"` os paths gerenciados passam a ser
 * prefixados por `<dsPath>/`, e o `src/` do consumidor deixa de ser confundido com o do
 * DS. Ver o bloco "Modo" abaixo — é o que permitiu ao `ds:link` parar de excluir este
 * arquivo do canal submódulo, que é a maioria do uso.
 *
 * - BLOQUEIA (exit 2) edição de arquivos GERENCIADOS que quebram o sistema todo:
 *   tema/tokens (`src/styles/theme/**`), a fundação (cn em `src/lib/utils.ts`, tv em
 *   `src/utils/tv.ts`, `src/lib/lucide-types.ts`) e, em submódulo, também `tokens/`.
 *   Esses NÃO se editam à mão — customize na composição ou restaure do DS.
 * - AVISA (exit 1, não bloqueia) edição de um componente do DS (`src/components/ui/**`;
 *   em submódulo, qualquer `<dsPath>/src/components/`): vira "edição local" (drift).
 * - AVISA (exit 1) quando o CONTEÚDO sendo escrito tem anti-pattern de estilo:
 *   hex cru, `gap-4`, `h-10`, `rounded-lg`, alpha em ring-ring… Ver abaixo.
 *
 * ## O lint de conteúdo (entrou em 2026-08-08)
 *
 * Até então este hook inspecionava **só o `file_path`**. Consequência medida na
 * auditoria: `bg-[#0fff00]` ou `gap-13` numa tela nova (`src/pages/Foo.tsx`) passava
 * **100% limpo** — o consumidor não tinha lint de estilo em canal nenhum, enquanto o
 * repo do DS tem `ds-lint-styles` + ratchet no CI desde sempre. A orientação existia
 * (`.claude/rules/ds-design.md`), mas era **só texto**, e texto é o que falha.
 *
 * A tabela de padrões é **a mesma do CI do DS** (`scripts/lib/ds-lint-patterns.mjs`),
 * bakeada aqui como foundational — `check-foundationals` reprova se divergirem. Nunca
 * reescreva os regexes neste arquivo: edite a fonte no DS e rode `npm run cli:rebake`.
 *
 * ⚠️ **AVISA, não bloqueia**, e isso é deliberado: o consumidor é dono do código dele,
 * e a decisão de usar um valor fora do sistema pode ser legítima (marca de terceiro,
 * embed, print). O que não pode é ser **silencioso**. Bloquear aqui transformaria o
 * kit num obstáculo e o primeiro reflexo seria desligar o hook.
 *
 * Robusto por design: qualquer erro de parse → libera (exit 0). Nunca trava o fluxo
 * do consumidor por bug do próprio hook.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, relative } from "node:path";

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

let payload;
try {
  payload = JSON.parse(readStdin() || "{}");
} catch {
  process.exit(0);
}

const input = payload.tool_input || payload.toolInput || {};

// ── Modo: copy-in (default) ou submódulo ─────────────────────────────────────
// Até 2026-08-18 este hook era **copy-in-only por construção**, e o `ds:link` o excluía
// inteiro do canal submódulo — que é a MAIORIA do uso. A razão registrada lá era correta
// só pela metade: os paths abaixo significam coisas DIFERENTES nos dois layouts.
//
//   copy-in    `src/styles/theme/` é o DS dentro da árvore do consumidor
//   submódulo  `src/styles/theme/` é o código DELE; o DS mora em <dsPath>/src/…
//
// Copiar o hook sem tocar nos paths avisaria sobre os arquivos do próprio consumidor —
// falso-positivo, e o reflexo seguinte é desligar o hook. Mas o **lint de conteúdo** no
// fim deste arquivo não tem dependência de layout NENHUMA: ele inspeciona o texto que
// está sendo escrito. Ele foi excluído junto, e com ele o único mecanismo que pega
// `h-10`, `gap-4`, `rounded-lg` e hex cru no código do consumidor — exatamente o que a
// seção "lint de conteúdo" acima diz que existe porque *"texto é o que falha"*.
//
// A correção não é um segundo hook: é resolver o modo UMA vez, aqui. Sem `ds-config.json`
// (copy-in, scaffold) o comportamento é idêntico ao de antes, byte por byte.
function leDsConfig() {
  for (const p of [".claude/ds-config.json", "ds-config.json"]) {
    try {
      return JSON.parse(readFileSync(p, "utf8"));
    } catch {
      /* ausente ou ilegível → copy-in */
    }
  }
  return null;
}
const cfg = leDsConfig();
const dsPath =
  cfg && cfg.mode === "submodule" && cfg.dsPath
    ? String(cfg.dsPath).replace(/\\/g, "/").replace(/\/+$/, "")
    : null;

/**
 * O `dsPath` do config e o `file_path` da tool podem vir em formas DIFERENTES — um
 * absoluto, o outro relativo à raiz do projeto. Se as formas não casarem, o `includes`
 * abaixo não casa e **a proteção falha em silêncio**, que é o pior resultado possível
 * para um hook de integridade: ele parece instalado e não bloqueia nada.
 *
 * Medido em 2026-08-18 rodando o `ds:link` num pai de teste: o script escreve o `dsPath`
 * **absoluto** sempre que o DS não está sob o target (`--target` apontando pra fora,
 * layout de monorepo, worktree). Então as duas formas entram no jogo.
 */
const DS_FORMAS = (() => {
  if (!dsPath) return [];
  const formas = new Set([dsPath]);
  try {
    const rel = relative(process.cwd(), dsPath).replace(/\\/g, "/").replace(/\/+$/, "");
    // `..` = o DS está FORA do projeto; nesse caso a forma relativa não descreve nada
    // que a tool vá reportar, e incluí-la só criaria falso positivo.
    if (rel && !rel.startsWith("..")) formas.add(rel);
  } catch {
    /* cwd indisponível → fica só a forma do config */
  }
  return [...formas].filter(Boolean);
})();

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Onde o consumidor conserta, por modo — mensagem que aponta pro mecanismo ERRADO é
 *  instrução pra fazer a coisa errada, e em submódulo não existe `igreen:add`. */
const COMO_RESTAURAR = dsPath
  ? `git -C ${dsPath} checkout -- <arquivo>   (o DS é um submódulo: a edição vira conflito no próximo update)`
  : "npm run igreen:add -- theme";

// ── Bash: o caminho que escapava do hook ─────────────────────────────────────
// O matcher era só `Edit|Write`, então `sed -i`, `cp`, `>` e `node -e fs.writeFileSync`
// escreviam nos arquivos gerenciados sem passar por aqui. Evidência real do dogfood:
// o `my-app/src/styles/theme/tailwind-theme.css` ficou modificado — arquivo que este
// hook deveria bloquear — porque a escrita veio por shell.
//
// ⚠️ AVISA, não bloqueia. Parsear shell pra decidir "isto escreve?" é heurística, e
// heurística que BLOQUEIA vira obstáculo no primeiro falso-positivo — e o reflexo
// seguinte é desligar o hook. O objetivo aqui é não ser silencioso.
const cmd = String(input.command ?? "");
if (cmd) {
  const escreve = />>?\s|(^|\s)(sed\s+-i|tee|cp|mv|rm)\s|writeFileSync|truncate/.test(cmd);
  const alvoGerenciado = /src[\\/](styles[\\/]theme|lib[\\/](utils|lucide-types)\.ts|utils[\\/]tv\.ts)/;
  // Em submódulo, exigir o dsPath no comando: sem isso, um `sed -i` no
  // `src/styles/theme/` DO CONSUMIDOR dispararia o aviso sobre arquivo que é dele.
  const tocaGerenciado = dsPath
    ? DS_FORMAS.some((d) =>
        new RegExp(
          `${escRe(d)}[\\\\/](src[\\\\/](styles[\\\\/]theme|lib[\\\\/](utils|lucide-types)\\.ts|utils[\\\\/]tv\\.ts)|tokens[\\\\/])`
        ).test(cmd)
      )
    : alvoGerenciado.test(cmd);
  if (escreve && tocaGerenciado) {
    process.stderr.write(
      "⚠ Este comando parece ESCREVER num arquivo gerenciado pelo iGreen DS.\n" +
        `   ${cmd.slice(0, 200)}\n` +
        "   Tema/tokens e cn/tv somem no próximo update — customize na composição\n" +
        `   ou restaure:  ${COMO_RESTAURAR}\n` +
        "   (aviso, não bloqueio: shell não dá pra classificar com certeza.)\n",
    );
    process.exit(1);
  }
  process.exit(0);
}

const raw = input.file_path || input.path || input.filePath || "";
if (!raw) process.exit(0);

const p = String(raw).replace(/\\/g, "/");

// Caminhos gerenciados pelo DS — bloquear edição manual.
// Em copy-in, as duas formas (com e sem `/` inicial) existem porque o match é `includes`
// e o path chega absoluto ou relativo. Em submódulo, o prefixo `<dsPath>/` já desambigua:
// só o que está DENTRO do submódulo é gerenciado — o `src/` do consumidor é dele.
const GERENCIADOS = [
  "src/styles/theme/",
  "src/lib/utils.ts",
  "src/utils/tv.ts",
  "src/lib/lucide-types.ts",
];
const BLOCK = dsPath
  ? DS_FORMAS.flatMap((d) => GERENCIADOS.map((s) => `${d}/${s}`).concat([`${d}/tokens/`]))
  : GERENCIADOS.flatMap((s) => [`/${s}`, s]);
const isBlocked = BLOCK.some((b) => p.includes(b));

// Componente do DS — permitido, mas avisar (drift).
const isComponentEdit = dsPath
  ? DS_FORMAS.some((d) => p.includes(`${d}/src/components/`))
  : /\/src\/components\/ui\//.test(p) || /^src\/components\/ui\//.test(p);

if (isBlocked) {
  process.stderr.write(
    "⛔ Arquivo GERENCIADO pelo iGreen DS — não edite à mão.\n" +
      `   ${raw}\n` +
      "   Tema/tokens e cn/tv são a fundação visual; editar aqui quebra o sistema todo\n" +
      "   e some no próximo update. Em vez disso:\n" +
      "   • Customize na COMPOSIÇÃO da sua tela (props + classes DS), não no token.\n" +
      `   • Pra desfazer:  ${COMO_RESTAURAR}\n` +
      "   Veja DESIGN.md + .claude/rules/ds-design.md.\n",
  );
  process.exit(2); // bloqueia
}

if (isComponentEdit) {
  process.stderr.write(
    "⚠ Você está editando um COMPONENTE do iGreen DS (vira edição local / drift).\n" +
      `   ${raw}\n` +
      "   Prefira customizar na COMPOSIÇÃO (props/variantes + classes na sua tela).\n" +
      (dsPath
        ? "   ⚠ Aqui o DS é um SUBMÓDULO git: esta edição não é sua, é do repo do DS.\n" +
          `      Ela vira conflito no próximo update, e um \`git -C ${dsPath} checkout\` a apaga\n` +
          "      sem aviso. Se a mudança tem de existir, ela pertence a um PR no DS.\n"
        : "   Se a mudança é intencional e específica do seu projeto, pode seguir —\n" +
          "   mas o `npm run igreen:update` vai pular este arquivo pra não sobrescrever.\n"),
  );
  process.exit(1); // avisa, não bloqueia
}

// ── Lint de conteúdo ─────────────────────────────────────────────────────────
// Só em arquivo de UI. `.css`/`.json`/`.md` ficam de fora: hex em CSS é legítimo
// (é onde o token é DEFINIDO) e falso-positivo em massa mata a credibilidade do aviso.
if (!/\.(tsx|jsx)$/.test(p)) process.exit(0);

// Em submódulo, NÃO lintar o código do DS: ele já passa pelo `ds-lint-styles` + ratchet
// do CI do próprio DS, e 10 dos 223 arquivos de lá têm débito legado que o ratchet
// congela de propósito. Avisar o consumidor sobre linha que ele não escreveu é o ruído
// que faz desligar o hook. O lint vale pro código DELE, que é onde não havia nenhum.
if (dsPath && DS_FORMAS.some((d) => p.includes(`${d}/`))) process.exit(0);

// `content` (Write) ou `new_string` (Edit) — só o que está ENTRANDO, nunca o arquivo
// inteiro: avisar sobre linha que o usuário não tocou é ruído (é o mesmo princípio do
// ratchet do CI do DS, que só olha linha adicionada pelo diff).
const novo = input.content ?? input.new_string ?? input.newString ?? "";
if (!novo) process.exit(0);

// ⚠️ `scanLines` recebe `Array<{n, text}>`, NÃO array de string. Passar string crua
// faz o destructuring devolver `undefined` e o scan retorna [] — sem erro, sem aviso.
// Aconteceu na 1ª versão deste hook: presumi o shape em vez de ler a assinatura, e o
// lint ficou mudo (L-064 — "monte a entrada pela função de produção que a gera").
const linhasNum = String(novo)
  .split("\n")
  .map((text, i) => ({ n: i + 1, text }));

let achados = [];
try {
  const aqui = dirname(fileURLToPath(import.meta.url));
  // ⚠️ `pathToFileURL` é OBRIGATÓRIO. No Windows, `import()` com path absoluto
  // (`D:\...\ds-lint-patterns.mjs`) lança ERR_UNSUPPORTED_ESM_URL_SCHEME — o Node lê
  // `D:` como esquema de URL. Como o catch abaixo libera em silêncio, o lint ficava
  // MUDO exatamente na plataforma em que o DS é desenvolvido. É a L-044 na forma
  // moderna: hook que depende de detalhe de path some sem avisar no Windows.
  const { scanLines } = await import(pathToFileURL(join(aqui, "ds-lint-patterns.mjs")).href);
  achados = scanLines(linhasNum);
} catch {
  process.exit(0); // tabela ausente/ilegível → libera, nunca trava por bug do hook
}

// Hex cru não está na tabela do DS (lá, `dead-theme-classes` cobre o eixo de cor de
// outro jeito). Aqui é o anti-pattern nº 1 do consumidor, então entra à parte.
for (const { n, text } of linhasNum) {
  if (/(?:bg|text|border|ring|fill|stroke)-\[#[0-9a-fA-F]{3,8}\]/.test(text)) {
    achados.push({
      id: "HEX",
      n,
      text: text.trim(),
      msg: "cor hex crua → use token DS (bg-bg-*, text-fg-*, border-border-*). Se a cor vem de dado externo (marca de terceiro), passe por prop/style inline, não por classe.",
    });
  }
}

/* ── regras do componente que está sendo escrito ───────────────────────────────
 * Não pede leitura: entrega. O gatilho é o componente APARECER no código, então quem
 * não usa aquele componente nunca vê uma linha sobre ele. Silêncio absoluto até alguém
 * declarar um bloco `ds:regras` no USAGE — é o que torna isto progressivo.
 * ────────────────────────────────────────────────────────────────────────────── */
let regras = [];
let regrasTexto = "";
try {
  const aqui2 = dirname(fileURLToPath(import.meta.url));
  const { regrasAplicaveis, formatar } = await import(
    pathToFileURL(join(aqui2, "component-rules.mjs")).href
  );
  /* Resolve o USAGE nos DOIS canais: copy-in grava em `src/components/ui/<Nome>/`, e em
     submódulo o componente vive em `<dsPath>/src/components/ui/<Nome>/`. Falha = null,
     e null é silêncio — nunca erro no caminho de um Write. */
  const raizes = dsPath
    ? [join(dsPath, "src/components/ui"), "src/components/ui"]
    : ["src/components/ui"];
  const lerUsage = (nome) => {
    for (const r of raizes) {
      try {
        return readFileSync(join(r, nome, "USAGE.md"), "utf8");
      } catch {
        /* próxima raiz */
      }
    }
    return null;
  };
  regras = regrasAplicaveis(novo, lerUsage);
  if (regras.length) {
    regrasTexto = formatar(regras, achados.length ? "" : raw);
    if (!achados.length) {
      /* Sem anti-pattern de estilo: informa e libera aqui mesmo. */
      process.stderr.write(regrasTexto);
      process.exit(1);
    }
  }
} catch {
  /* módulo ausente (payload antigo) → segue como antes, sem dizer nada */
}

if (achados.length) {
  const linhas = achados
    .slice(0, 6)
    .map((a) => `   • [${a.id}] linha ${a.n}: ${a.msg}\n     ${a.text.slice(0, 100)}`)
    .join("\n");
  process.stderr.write(
    `⚠ ${achados.length} anti-pattern(s) de estilo no que você está escrevendo:\n` +
      `   ${raw}\n${linhas}\n` +
      (achados.length > 6 ? `   … e mais ${achados.length - 6}.\n` : "") +
      "   Tabela: .claude/rules/ds-design.md · DESIGN.md · .claude/rules/ds-components.md\n" +
      "   (aviso, não bloqueio — se o valor fora do sistema é intencional, siga.)\n" +
      /* As regras do componente vão NO MESMO relatório. Dois blocos pro mesmo Write seria
         ruído — e descartá-las (o que este hook fazia na 1ª versão, contrariando o próprio
         comentário) perdia justamente o sinal mais valioso: o de arquitetura. */
      (regrasTexto ? `${regrasTexto}` : ""),
  );
  process.exit(1);
}

process.exit(0);
