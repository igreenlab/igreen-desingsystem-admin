/**
 * skills-routing.mjs — toda skill do disco é alcançável, e todo caminho citado existe?
 *
 * ## O furo que isto fecha
 *
 * A **DoD da L-047** diz que uma skill builder nova toca 4 superfícies de roteamento:
 * (1) a skill, (2) o command, (3) o `orchestrator.md`, (4) o consumidor. Ela virou
 * texto num `.md` — e falhou por texto: em 2026-08-08, `app-builder`, `auth-builder`,
 * `screen-composer` e `module-replicator` estavam no `orchestrator.md` e tinham command
 * próprio, mas com **zero ocorrências** na tabela "Skills por tarefa" do
 * `ds-standards.md` — a rule auto-carregada, que é onde o agente procura. E a
 * `handoff-pr.md`, tornada **obrigatória pela Regra 8**, também não estava lá.
 *
 * Pior no sentido inverso: a `dashboard-builder` roteava pras skills `charts` e
 * `page-edit`, que **não existem neste repo** — só no payload do consumidor
 * (`cli/templates/default/_claude/skills/`). O agente ia procurar e não achava, sem
 * fallback declarado.
 *
 * ## As duas perguntas
 *
 * 1. **Alcançabilidade** — toda pasta de `.claude/skills/` é citada por um command, pelo
 *    orchestrator ou pela tabela da rule? Skill que só existe no disco depende de
 *    auto-descoberta por `description`, que é loteria.
 * 2. **Rota morta** — toda skill citada existe no disco? Apontar pra skill inexistente
 *    é pior que não apontar: o agente perde o turno procurando.
 *
 * Ambas são independentes de contexto (existe/não existe), então cabem em gate (L-059).
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";

const SKILLS_DIR = ".claude/skills";
const COMMANDS_DIR = ".claude/commands";
const ORCHESTRATOR = ".claude/agents/orchestrator.md";
const RULE = ".claude/rules/ds-standards.md";

/**
 * Skills deliberadamente NÃO roteadas, com motivo obrigatório.
 * Mesma disciplina do `ds-exceptions.mjs`: lista sem motivo apodrece.
 */
export const ROUTING_EXCEPTIONS = new Map([
  [
    "app-designer",
    "🚧 Domínio App não operacional — o orchestrator PROÍBE rotear (agente existe, aguarda o time iniciar telas de produto)",
  ],
  [
    "app-dev-react",
    "🚧 idem app-designer — par Designer/Dev do Domínio App, ambos aguardando",
  ],
]);

/** Pastas de skill em `.claude/skills/` (as que têm `SKILL.md`). */
export function skillFolders(dir = SKILLS_DIR) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(`${dir}/${d.name}/SKILL.md`))
    .map((d) => d.name)
    .sort();
}

/**
 * CITAÇÕES declaradas — par `<arquivo>::<nome>` → motivo obrigatório.
 *
 * Mesmo mecanismo (e mesmo motivo) do `CITACOES` do `dead-theme-classes.mjs`: um
 * texto que diz *"a skill `charts` **não existe** neste repo"* é a **correção**, não o
 * defeito — mas separar citação de prescrição por regex seria julgamento de intenção
 * (L-059). Então um humano declara o par, e no gate volta a ser mecânico.
 *
 * Escopo por PAR, nunca por nome solto: `ds-create-dashboard.md` pode citar `charts`,
 * e ainda assim o gate reprova se alguém escrever `skill \`charts\`` como ROTA em
 * `dashboard-builder/SKILL.md`.
 *
 * ⚠️ "Existe no payload do consumidor" **não** basta como motivo. Quando uma skill do
 * REPO manda carregar `charts`, o agente do REPO não consegue — que o payload tenha
 * uma `charts` é irrelevante pra ele.
 */
export const CITATION_EXCEPTIONS = new Map([
  [
    ".claude/rules/ds-standards.md::ds-kit",
    "skill do PAYLOAD do consumidor — citada ao descrever a 4ª superfície de roteamento da L-047, que é do consumidor por definição",
  ],
  [
    ".claude/commands/ds-create-dashboard.md::charts",
    "citação NEGATIVA — a linha diz literalmente que a skill `charts` não existe neste repo e manda usar chart-patterns.md; é a correção da rota morta, não a rota",
  ],
]);

/**
 * Os dois escopos de varredura, e por que são diferentes:
 *
 * - **entry**: onde o agente PROCURA uma skill (orchestrator + rule + commands).
 *   Serve pra pergunta "esta skill é alcançável?".
 * - **all**: todo `.claude/` (inclui as próprias skills). Serve pra "esta citação
 *   resolve?" — uma skill que roteia pra outra inexistente é o defeito, e ele mora
 *   dentro do arquivo de skill, não nos entry points.
 *
 * A 1ª versão deste módulo varria só `entry` nos dois casos: reportou 3 falsos
 * positivos (`release`/`update-changelog`, que são sub-arquivos de `ds-dev`, e
 * `ds-kit`, do payload) e **não viu** as 2 rotas mortas reais (`charts` e `page-edit`
 * na `dashboard-builder`), porque elas estão dentro de um arquivo de skill.
 */
/** `[{ path, texto }]` de todo `.md` sob `dir` — o `path` é o que escopa a exceção. */
export function readAllMd(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) readAllMd(p, acc);
    else if (e.name.endsWith(".md")) acc.push({ path: p, texto: readFileSync(p, "utf8") });
  }
  return acc;
}

export function routingText(scope = "entry") {
  if (scope === "all") return readAllMd(".claude").map((f) => f.texto).join("\n");
  const partes = [];
  if (existsSync(ORCHESTRATOR)) partes.push(readFileSync(ORCHESTRATOR, "utf8"));
  if (existsSync(RULE)) partes.push(readFileSync(RULE, "utf8"));
  if (existsSync(COMMANDS_DIR)) {
    for (const f of readdirSync(COMMANDS_DIR).filter((f) => f.endsWith(".md"))) {
      partes.push(readFileSync(`${COMMANDS_DIR}/${f}`, "utf8"));
    }
  }
  return partes.join("\n");
}

/**
 * Skills citadas como `.claude/skills/<nome>/`, `` `<nome>/SKILL.md` `` ou
 * `` skill `<nome>` ``.
 *
 * ⚠️ Sub-arquivo NÃO é skill. `skill \`release\`` cita `ds-dev/release.md`, e
 * `skill \`update-changelog\`` cita `ds-dev/update-changelog.md` — os dois existem,
 * como arquivo dentro de uma skill. Resolver isso é obrigação de quem consome a
 * lista (ver `resolvesToDisk`), senão o gate acusa arquivo que está lá.
 */
export function citedSkills(texto = routingText()) {
  const out = new Set();
  for (const re of [
    /\.claude\/skills\/([a-z0-9-]+)\//g,
    /`([a-z0-9-]+)\/SKILL\.md`/g,
    /\bskill\s+`([a-z0-9-]+)`/gi,
  ]) {
    for (const m of String(texto).matchAll(re)) out.add(m[1]);
  }
  return out;
}

/** O nome resolve pra alguma coisa no disco: pasta de skill OU sub-arquivo `<skill>/<nome>.md`? */
export function resolvesToDisk(nome, pastas = skillFolders(), dir = SKILLS_DIR) {
  if (pastas.includes(nome)) return true;
  return pastas.some((p) => existsSync(`${dir}/${p}/${nome}.md`));
}

/**
 * @returns {{ naoRoteadas:string[], rotasMortas:string[], exceçõesMortas:string[], total:number }}
 */
export function checkSkillsRouting({
  pastas = skillFolders(),
  entry = routingText("entry"),
  arquivos = readAllMd(".claude"),
} = {}) {
  const alcancaveis = citedSkills(entry);
  const naoRoteadas = pastas
    .filter((s) => !alcancaveis.has(s) && !ROUTING_EXCEPTIONS.has(s))
    .sort();

  // Rota morta é escopada por ARQUIVO: a exceção declarada vale só onde foi declarada.
  const rotasMortas = [];
  for (const { path: p, texto } of arquivos) {
    for (const nome of citedSkills(texto)) {
      if (resolvesToDisk(nome, pastas)) continue;
      if (CITATION_EXCEPTIONS.has(`${p}::${nome}`)) continue;
      rotasMortas.push(`${p} → \`${nome}\``);
    }
  }

  const existentes = new Set(pastas);
  const exceçõesMortas = [...ROUTING_EXCEPTIONS.keys()].filter((s) => !existentes.has(s));

  return { naoRoteadas, rotasMortas: rotasMortas.sort(), exceçõesMortas, total: pastas.length };
}

export { SKILLS_DIR, COMMANDS_DIR, ORCHESTRATOR, RULE };
