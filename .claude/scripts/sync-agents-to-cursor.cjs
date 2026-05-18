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

// Garantir que .cursor/rules/ existe
if (!fs.existsSync(CURSOR_DIR)) {
  fs.mkdirSync(CURSOR_DIR, { recursive: true });
  console.log(`✅ Criado: ${CURSOR_DIR}`);
}

const agentFiles = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith(".md"));

let synced = 0;
let skipped = 0;

for (const file of agentFiles) {
  const sourcePath = path.join(AGENTS_DIR, file);
  const agentName  = path.basename(file, ".md");
  const destFile   = `_agent-${agentName}.mdc`;
  const destPath   = path.join(CURSOR_DIR, destFile);

  const sourceContent = fs.readFileSync(sourcePath, "utf8");

  // Extrair frontmatter e corpo
  const frontmatterMatch = sourceContent.match(/^---\n([\s\S]*?)\n---/);
  const frontmatter = frontmatterMatch ? frontmatterMatch[0] : "";
  const body = frontmatterMatch
    ? sourceContent.slice(frontmatterMatch[0].length).trim()
    : sourceContent;

  // Gerar conteúdo do mirror com nota de origem
  const mirrorContent = [
    frontmatter,
    "",
    `> ⚠️ Mirror gerado automaticamente de \`.claude/agents/${file}\``,
    `> Não editar manualmente — rodar \`npm run sync:agents\` para atualizar.`,
    "",
    body,
  ].join("\n");

  // Verificar se precisa atualizar
  if (fs.existsSync(destPath)) {
    const existing = fs.readFileSync(destPath, "utf8");
    // Comparar apenas o corpo (ignorar nota de mirror que pode mudar)
    if (existing.includes(body.slice(0, 200))) {
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
