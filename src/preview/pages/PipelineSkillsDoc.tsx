import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "what", label: "What are Skills" },
  { id: "structure", label: "File Structure" },
  { id: "loading", label: "How Skills Load" },
  { id: "catalog", label: "Skill Catalog" },
  { id: "lifecycle", label: "Lifecycle" },
  { id: "vs-rules", label: "Skills vs Rules" },
];

function SkillRow({
  path,
  desc,
  agent,
  tag,
}: {
  path: string;
  desc: string;
  agent: string;
  tag?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-gp-sm sm:gap-gp-xl py-pad-md border-b border-border-subtle last:border-b-0">
      <code className="text-code-sm text-fg-brand font-mono shrink-0 min-w-0 sm:min-w-[260px]">{path}</code>
      <Badge color="secondary" variant="outline" size="sm" className="shrink-0 min-w-0 sm:min-w-[100px]">{agent}</Badge>
      <span className="text-body-md text-fg-muted flex-1">{desc}</span>
      {tag && <Badge color="primary" variant="soft" size="sm" className="shrink-0">{tag}</Badge>}
    </div>
  );
}

export function PipelineSkillsDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Pipeline Infra"
        title="Skills"
        description="Atomic procedures that teach an agent how to perform a specific task — Markdown files with templates, checklists, and rules."
      />
      <DocSeparator />

      {/* What */}
      <SectionH2 id="what" title="What are Skills" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          A <strong className="text-fg-default">Skill</strong> is a single-purpose Markdown file under <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">.claude/skills/&lt;agent&gt;/</code>{" "}
          — ou <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">.claude/skills/&lt;nome&gt;/</code> pras 9 skills de pipeline que não pertencem a um agente.
          It contains everything an agent needs to perform one task: input contract, template code, checklist,
          and the signal it must emit when done. Skills replace the &ldquo;super-prompt&rdquo; pattern with focused, swappable units.
        </p>
        <div className="grid grid-cols-2 gap-gp-2xl">
          {[
            { title: "Atomic", desc: "One file = one skill. Easier to update, less context cost per load." },
            { title: "Versioned with code", desc: "Skills live in the repo. Every behavior change has a git diff." },
            { title: "Discoverable", desc: "Listed in CLAUDE.md and ds-standards.md. Agents know which skill to load per task." },
            { title: "Invocable explicitly", desc: "Loaded via SkillTool or slash command — never relied on from session memory." },
          ].map((p) => (
            <div key={p.title} className="rounded-radius-base border border-border-subtle p-pad-3xl">
              <p className="text-body-md font-medium text-fg-default mb-gp-sm">{p.title}</p>
              <p className="text-body-md text-fg-muted">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Structure */}
      <SectionH2 id="structure" title="File Structure" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-subtle p-pad-4xl font-mono text-code-sm text-fg-muted leading-loose">
          <p className="text-fg-default font-semibold">.claude/skills/</p>
          <p className="ml-sp-md">ds-designer/                  <span className="text-fg-subtle">← Skills loaded by DS Designer</span></p>
          <p className="ml-sp-2xl">SKILL.md                   <span className="text-fg-subtle">← identidade + roteamento interno</span></p>
          <p className="ml-sp-2xl">spec-token.md              <span className="text-fg-subtle">← UM arquivo, args tipo=color|spacing|sizing|radius|shadow|typography</span></p>
          <p className="ml-sp-2xl">spec-component.md          <span className="text-fg-subtle">← novo componente</span></p>
          <p className="ml-sp-2xl">figma-extract.md           <span className="text-fg-subtle">← Figma → DS</span></p>
          <p className="ml-sp-md">ds-dev/                       <span className="text-fg-subtle">← Skills loaded by DS Dev</span></p>
          <p className="ml-sp-2xl">SKILL.md                   <span className="text-fg-subtle">← identidade + roteamento interno</span></p>
          <p className="ml-sp-2xl">impl-token.md              <span className="text-fg-subtle">← implementa token</span></p>
          <p className="ml-sp-2xl">impl-igreen.md             <span className="text-fg-subtle">← componente tv()</span></p>
          <p className="ml-sp-2xl">impl-shadcn.md             <span className="text-fg-subtle">← componente Shadcn</span></p>
          <p className="ml-sp-2xl">impl-composite.md          <span className="text-fg-subtle">← componente composto</span></p>
          <p className="ml-sp-2xl">update-changelog.md        <span className="text-fg-subtle">← timeline de Updates</span></p>
          <p className="ml-sp-2xl">release.md                 <span className="text-fg-subtle">← release em 7 passos</span></p>
          <p className="ml-sp-2xl">handoff-pr.md              <span className="text-fg-subtle">← Regra 8: branch → commit → push → PR</span></p>
          <p className="ml-sp-md">ds-reviewer/                  <span className="text-fg-subtle">← Skills loaded by DS Reviewer</span></p>
          <p className="ml-sp-2xl">SKILL.md                   <span className="text-fg-subtle">← revisa token</span></p>
          <p className="ml-sp-2xl">review-component.md        <span className="text-fg-subtle">← revisa componente</span></p>
          <p className="ml-sp-2xl">pre-commit-check.md        <span className="text-fg-subtle">← gate amplo antes de commit grande</span></p>
          <p className="mt-gp-lg text-fg-default font-semibold">.claude/skills/&lt;nome&gt;/ <span className="font-normal text-fg-subtle">— 9 skills de pipeline, SEM agente</span></p>
          <p className="ml-sp-md">crud-builder/                 <span className="text-fg-subtle">← /ds-create-crud · 5 arquivos (router + interview/blueprint/generate/kanban)</span></p>
          <p className="ml-sp-md">list-builder/                 <span className="text-fg-subtle">← /ds-create-list · 4 arquivos</span></p>
          <p className="ml-sp-md">dashboard-builder/            <span className="text-fg-subtle">← /ds-create-dashboard · 4 arquivos</span></p>
          <p className="ml-sp-md">brand-builder/                <span className="text-fg-subtle">← /ds-create-brand · 5 arquivos (+ color-derivation)</span></p>
          <p className="ml-sp-md">app-builder/                  <span className="text-fg-subtle">← /ds-create-app</span></p>
          <p className="ml-sp-md">auth-builder/                 <span className="text-fg-subtle">← /ds-create-login</span></p>
          <p className="ml-sp-md">screen-composer/              <span className="text-fg-subtle">← /ds-create-screen (composição de 2+ peças)</span></p>
          <p className="ml-sp-md">module-replicator/            <span className="text-fg-subtle">← /ds-replicate-module</span></p>
          <p className="ml-sp-md">igreen-frontend/              <span className="text-fg-subtle">← fallback sem entrevista</span></p>
        </div>
      </div>

      {/* Loading */}
      <SectionH2 id="loading" title="How Skills Load" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">Two ways an agent loads a skill — both explicit, never implicit:</p>
        <div className="grid grid-cols-2 gap-gp-3xl">
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-md">1. Slash command</p>
            <p className="text-body-md text-fg-muted mb-gp-md">
              User types <code className="font-mono text-code-sm">/ds-create-component Button</code>. The command file in{" "}
              <code className="font-mono text-code-sm">.claude/commands/</code> points to the skill to load.
            </p>
            <Badge color="success" variant="soft" size="sm">User-triggered</Badge>
          </div>
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-md">2. SkillTool invocation</p>
            <p className="text-body-md text-fg-muted mb-gp-md">
              Agent invokes <code className="font-mono text-code-sm">Skill(impl-igreen)</code> from within its workflow.
              The skill content is injected as a system message — never relied on from memory.
            </p>
            <Badge color="primary" variant="soft" size="sm">Agent-triggered</Badge>
          </div>
        </div>
      </div>

      {/* Catalog */}
      <SectionH2 id="catalog" title="Skill Catalog" />
      <div className="flex flex-col gap-gp-xs mb-14">
        <p className="text-body-md text-fg-muted mb-gp-2xl">
          Current skills shipped with the pipeline. Each one is callable via slash command or SkillTool.
        </p>
        <SkillRow path="spec-token" agent="DS Designer" desc="Especifica token novo — UM arquivo, roteado por args: tipo=color | spacing | sizing | radius | shadow | typography" tag="Gate" />
        <SkillRow path="spec-component" agent="DS Designer" desc="Specify new component with variants, slots, states + Strategist gate" tag="Gate" />
        <SkillRow path="figma-extract" agent="DS Designer" desc="Extract tokens/component from Figma and produce spec" />
        <SkillRow path="impl-token" agent="DS Dev" desc="Implement a token in the appropriate semantic file + regen CSS" />
        <SkillRow path="impl-igreen" agent="DS Dev" desc="Implement iGreen component with tv(): styles + tsx + types + USAGE.md" />
        <SkillRow path="impl-shadcn" agent="DS Dev" desc="Add/adapt Shadcn component with DS tokens" />
        <SkillRow path="impl-composite" agent="DS Dev" desc="Implement composite component (multiple sub-components with shared tv())" />
        <SkillRow path="update-changelog" agent="DS Dev" desc="Read git log + project state, classify changes, propose ReleaseEntry for the Updates timeline" tag="Gate" />
        <SkillRow path="release" agent="DS Dev" desc="Release completa em 7 passos: auto-review do diff (1.5) → changelog + bump → registry:build + regeneração do embed → release:check → branch/commit/PR via gh → PARA no merge. O passo 7 é o gate do publish npm: valida o pacote com lib:verify, apresenta, PEDE o token do mantenedor, publica com .npmrc temporário FORA do repo e apaga na hora. A IA nunca publica sozinha. Entry point /ds-release" tag="Gate" />
        <SkillRow path="SKILL (token review)" agent="DS Reviewer" desc="Token review checklist (7 items) + critique" />
        <SkillRow path="review-component" agent="DS Reviewer" desc="Component review: regression sweep + 3 checklists + genuine critique" tag="Gate" />
        <SkillRow path="pre-commit-check" agent="DS Reviewer" desc="Gate amplo antes de commit significativo (release, refactor amplo, token/componente/lição novos)" tag="Gate" />
        <SkillRow path="handoff-pr" agent="DS Dev" desc="Regra 8 (L-041): branch própria → commit descritivo → push no remote canônico → gh pr create → reporta o link. A IA PARA no merge — merge/publish/bump/deploy exigem autorização explícita (L-020)" tag="Obrigatória" />
        <SkillRow path="crud-builder/SKILL" agent="Pipeline" desc="Tela CRUD/tabela consumindo o DataTable: entrevista → blueprint → gate → geração. Entry point /ds-create-crud" tag="Gate" />
        <SkillRow path="list-builder/SKILL" agent="Pipeline" desc="Tela de lista de cards consumindo o DataList — irmã do crud-builder. Entry point /ds-create-list" tag="Gate" />
        <SkillRow path="dashboard-builder/SKILL" agent="Pipeline" desc="Tela de dashboard/painel (KPIs + gráficos + rankings) ancorada em dashboard-patterns.md. Entry point /ds-create-dashboard" tag="Gate" />
        <SkillRow path="brand-builder/SKILL" agent="Pipeline" desc="Marca/tema de cor novo: entrevista → derivação de cor medida → gate → as 10 superfícies → verificação no browser. Entry point /ds-create-brand" tag="Gate" />
        <SkillRow path="app-builder/SKILL" agent="Pipeline" desc="Esqueleto de app: AppShell + nav-data + mapa de rotas, adaptando o example-app-shell. Entry point /ds-create-app" />
        <SkillRow path="auth-builder/SKILL" agent="Pipeline" desc="Tela de login/auth: form split + painel de marca por tokens, adaptando o example-login. Entry point /ds-create-login" />
        <SkillRow path="screen-composer/SKILL" agent="Pipeline" desc="Composição de 2+ peças que reagem entre si (master-detail, cross-filter). Entry point /ds-create-screen" />
        <SkillRow path="module-replicator/SKILL" agent="Pipeline" desc="Replica uma família de telas pra outro segmento trocando dataset + rótulos — avalia PARAMETRIZAR antes de copiar. Entry point /ds-replicate-module" />
        <SkillRow path="igreen-frontend/SKILL" agent="Pipeline" desc="Fallback pra página/bloco solto, sem entrevista. Prefira os builders acima — eles têm gate" />
      </div>

      {/* Lifecycle */}
      <SectionH2 id="lifecycle" title="Lifecycle of a Skill Invocation" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <div className="grid gap-gp-3xl">
            {[
              { step: "1", title: "Entry", desc: "Slash command (user) or SkillTool call (agent). Skill ID resolved." },
              { step: "2", title: "Load", desc: "Skill file injected into the agent's context as a system message." },
              { step: "3", title: "Execute", desc: "Agent follows the template, runs checklists, produces artefacts (spec, code, review)." },
              { step: "4", title: "Signal", desc: "Agent emits the signal defined in the skill (SPEC_READY, IMPL_READY, REVIEW_OK)." },
              { step: "5", title: "Audit", desc: "Entry appended to .ai/status/pipeline-state.md with the assumption that justified the decision." },
            ].map((item) => (
              <div key={item.step} className="flex gap-gp-2xl">
                <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-body-md font-medium font-semibold bg-bg-brand text-fg-on-brand">
                  {item.step}
                </div>
                <div>
                  <p className="text-body-md font-medium text-fg-default mb-gp-xs">{item.title}</p>
                  <p className="text-body-md text-fg-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills vs Rules */}
      <SectionH2 id="vs-rules" title="Skills vs Rules" />
      <div className="grid grid-cols-2 gap-gp-3xl mb-14">
        <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-md">Skills</p>
          <ul className="list-disc pl-sp-md flex flex-col gap-gp-sm text-body-md text-fg-muted">
            <li>Loaded on-demand</li>
            <li>One skill = one task</li>
            <li>Contains a template + checklist</li>
            <li>Emits a signal</li>
            <li>Live in <code className="font-mono text-code-sm">.claude/skills/&lt;agent&gt;/</code> — ou <code className="font-mono text-code-sm">.claude/skills/&lt;nome&gt;/</code> quando não têm agente (os 9 builders de pipeline)</li>
          </ul>
        </div>
        <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-md">Rules</p>
          <ul className="list-disc pl-sp-md flex flex-col gap-gp-sm text-body-md text-fg-muted">
            <li>Auto-loaded em TODA sessão (todo <code className="font-mono text-code-sm">.md</code> de <code className="font-mono text-code-sm">rules/</code>) — não há escopo por glob</li>
            <li>Cross-cutting constraints (anti-patterns, lessons)</li>
            <li>Reference text — no template</li>
            <li>No signal — they apply continuously</li>
            <li>Live in <code className="font-mono text-code-sm">.claude/rules/</code></li>
          </ul>
        </div>
      </div>
    </DocLayout>
  );
}
