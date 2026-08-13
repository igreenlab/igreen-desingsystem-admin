#!/usr/bin/env node
/**
 * sync-agents-to-cursor.js
 *
 * Sincroniza .claude/agents/*.md → .cursor/rules/_agent-*.mdc
 * Fonte única: .claude/agents/
 * Destino gerado: .cursor/rules/
 *
 * Uso:
 *   npm run sync:agents
 *
 * Nota: agentes com status PENDING (App domain) também são sincronizados.
 * O Cursor não os invocará pois suas descriptions indicam que estão aguardando.
 */

const fs   = require("fs");
const path = require("path");

const AGENTS_DIR = path.join(__dirname, "..", "agents");
const CURSOR_DIR = path.join(__dirname, "..", "..", ".cursor", "rules");

/** CRLF → LF. Ver a nota do `buildMirror`. */
const toLF = (s) => String(s ?? "").replace(/\r\n/g, "\n");

/**
 * Monta o conteúdo do mirror `.mdc` a partir do `.md` do agente.
 *
 * PURA — sem I/O — pra ser testável. O bug abaixo passou despercebido justamente
 * porque não havia como exercitar esta lógica sem rodar o script inteiro.
 *
 * ## ⚠️ O bug do CRLF (corrigido em 2026-08-08)
 *
 * A extração era `sourceContent.match(/^---\n([\s\S]*?)\n---/)`. Os arquivos de
 * `.claude/agents/` são **CRLF** (`file` confirma: "with CRLF line terminators"),
 * então `^---\n` **nunca casava** `---\r\n`. Resultado: `frontmatterMatch === null`
 * → `frontmatter = ""` e `body = arquivo INTEIRO`. O `.mdc` gerado saía assim:
 *
 *     linha 1  (vazia)
 *     linha 2  (vazia)
 *     linha 3  > ⚠️ Mirror gerado automaticamente de ...
 *     linha 4  > Não editar manualmente ...
 *     linha 5  (vazia)
 *     linha 6  ---            ← o frontmatter começa AQUI
 *     linha 7  name: orchestrator
 *
 * O Cursor exige `---` na **linha 1** pra parsear frontmatter. Com ele na linha 6,
 * nenhum `description`/`globs`/`alwaysApply` era lido → **o Cursor nunca
 * auto-anexava nenhuma das 6 rules**. O script rodava, escrevia arquivo, reportava
 * sucesso, e o artefato era inerte — a L-061 ("no-op mudo") dentro do próprio
 * script de sync.
 *
 * Fix: normalizar pra LF **antes** de qualquer regex, e emitir LF (o git converte
 * no checkout conforme o `.gitattributes`/`core.autocrlf` de cada máquina). Assim o
 * mesmo conteúdo é gerado no Windows, no Linux e no CI, e a comparação de
 * idempotência para de depender de plataforma.
 *
 * @param {string} sourceContent conteúdo do `.md` do agente
 * @param {string} file nome do arquivo (pra nota de origem)
 * @returns {string} conteúdo do `.mdc`, sempre com LF
 */
function buildMirror(sourceContent, file) {
  const src = toLF(sourceContent);
  const frontmatterMatch = src.match(/^---\n([\s\S]*?)\n---/);
  const frontmatter = frontmatterMatch ? frontmatterMatch[0] : "";
  const body = frontmatterMatch ? src.slice(frontmatterMatch[0].length).trim() : src;

  return [
    frontmatter,
    "",
    `> ⚠️ Mirror gerado automaticamente de \`.claude/agents/${file}\``,
    `> Não editar manualmente — rodar \`npm run sync:agents\` para atualizar.`,
    "",
    body,
  ].join("\n");
}

/** Pares (origem, destino) — fonte única pro script e pro gate. */
function mirrorPairs() {
  return fs
    .readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => ({
      file,
      sourcePath: path.join(AGENTS_DIR, file),
      destPath: path.join(CURSOR_DIR, `_agent-${path.basename(file, ".md")}.mdc`),
    }));
}

function main() {
// Garantir que .cursor/rules/ existe
if (!fs.existsSync(CURSOR_DIR)) {
  fs.mkdirSync(CURSOR_DIR, { recursive: true });
  console.log(`✅ Criado: ${CURSOR_DIR}`);
}

let synced = 0;
let skipped = 0;

for (const { file, sourcePath, destPath } of mirrorPairs()) {
  const destFile   = path.basename(destPath);
  const mirrorContent = buildMirror(fs.readFileSync(sourcePath, "utf8"), file);

  // Verificar se precisa atualizar — comparando o conteúdo INTEIRO que seria
  // escrito contra o que está lá.
  //
  // ⚠️ Isto comparava `existing.includes(body.slice(0, 200))`, ou seja só os 200
  // primeiros caracteres do corpo. Toda edição depois disso — que é praticamente
  // toda edição real — dava "Sem mudança" e o mirror nunca era reescrito. Medido
  // em 2026-07-30: o `orchestrator.md` estava 217 linhas contra 173 do mirror, sem
  // nenhuma das 9 rotas de builder (crud/list/dashboard/auth/app/screen-composer/
  // module-replicator), e rodar `npm run sync:agents` reportava "0 sincronizados,
  // 6 sem mudança". O script não estava desligado: estava mentindo que já tinha
  // sincronizado (L-060 — a mensagem fazia quem lia parar de investigar).
  // A comparação normaliza CRLF dos DOIS lados: no Windows o git converte o arquivo
  // no checkout, então o que está em disco pode ter \r que o conteúdo gerado não tem.
  // Sem normalizar, o script reescreveria os 6 arquivos a cada execução.
  if (fs.existsSync(destPath)) {
    const existing = toLF(fs.readFileSync(destPath, "utf8"));
    if (existing === mirrorContent) {
      console.log(`⏭️  Sem mudança: ${destFile}`);
      skipped++;
      continue;
    }
  }

  fs.writeFileSync(destPath, mirrorContent, "utf8");
  console.log(`✅ Sincronizado: ${file} → ${destFile}`);
  synced++;
}

  console.log(`\n📊 Resultado: ${synced} sincronizados, ${skipped} sem mudança`);
}

if (require.main === module) main();

module.exports = { buildMirror, mirrorPairs, toLF, AGENTS_DIR, CURSOR_DIR };
