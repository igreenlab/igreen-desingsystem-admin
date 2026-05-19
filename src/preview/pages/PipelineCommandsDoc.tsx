import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "what", label: "What are Commands" },
  { id: "structure", label: "File Structure" },
  { id: "catalog", label: "Command Catalog" },
  { id: "authoring", label: "Authoring a Command" },
  { id: "vs-skills", label: "Commands vs Skills" },
];

function CmdCard({
  cmd,
  desc,
  agent,
  skill,
}: {
  cmd: string;
  desc: string;
  agent: string;
  skill: string;
}) {
  return (
    <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
      <div className="flex items-center justify-between gap-gp-md mb-gp-md">
        <code className="font-mono text-code-sm text-fg-brand">{cmd}</code>
        <Badge color="secondary" variant="outline" size="sm">{agent}</Badge>
      </div>
      <p className="text-body-md text-fg-muted mb-gp-md">{desc}</p>
      <p className="text-caption-sm text-fg-subtle">
        Loads skill: <code className="font-mono text-code-sm">{skill}</code>
      </p>
    </div>
  );
}

export function PipelineCommandsDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Pipeline Infra"
        title="Slash Commands"
        description="User-facing entry points to the pipeline. A slash command resolves to a skill and runs the full flow."
      />
      <DocSeparator />

      {/* What */}
      <SectionH2 id="what" title="What are Commands" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          A <strong className="text-fg-default">Slash Command</strong> is a Markdown file in{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">.claude/commands/</code> that
          gives the user a typed shortcut to invoke a pipeline route. Typing{" "}
          <code className="font-mono text-code-sm">/ds-create-component Button</code> loads the corresponding skill,
          starts the agent flow, and goes through any gates.
        </p>
        <div className="grid grid-cols-2 gap-gp-2xl">
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-sm">Discoverable</p>
            <p className="text-body-md text-fg-muted">
              Type <code className="font-mono text-code-sm">/</code> in the chat to autocomplete. Each command lists its required arguments.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-sm">Verb-based naming</p>
            <p className="text-body-md text-fg-muted">
              <code className="font-mono text-code-sm">ds-create-*</code>, <code className="font-mono text-code-sm">ds-add-*</code>,{" "}
              <code className="font-mono text-code-sm">ds-extract-*</code>. Verbs map to common task buckets.
            </p>
          </div>
        </div>
      </div>

      {/* Structure */}
      <SectionH2 id="structure" title="File Structure" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-subtle p-pad-4xl font-mono text-code-sm text-fg-muted leading-loose">
          <p className="text-fg-default font-semibold">.claude/commands/</p>
          <p className="ml-sp-md">ds-create-component.md     <span className="text-fg-subtle">← /ds-create-component &lt;name&gt;</span></p>
          <p className="ml-sp-md">ds-create-composite.md     <span className="text-fg-subtle">← /ds-create-composite &lt;name&gt;</span></p>
          <p className="ml-sp-md">ds-add-shadcn.md           <span className="text-fg-subtle">← /ds-add-shadcn &lt;name&gt;</span></p>
          <p className="ml-sp-md">ds-add-token.md            <span className="text-fg-subtle">← /ds-add-token &lt;name&gt;</span></p>
          <p className="ml-sp-md">ds-extract-figma.md        <span className="text-fg-subtle">← /ds-extract-figma &lt;url&gt;</span></p>
          <p className="ml-sp-md">ds-update.md               <span className="text-fg-subtle">← /ds-update [tag]</span></p>
        </div>
      </div>

      {/* Catalog */}
      <SectionH2 id="catalog" title="Command Catalog" />
      <div className="grid grid-cols-2 gap-gp-3xl mb-14">
        <CmdCard
          cmd="/ds-create-component <Name>"
          desc="Cria componente iGreen do zero. Roda DS Designer → [GATE] → DS Dev → DS Reviewer."
          agent="Full pipeline"
          skill="impl-igreen + spec-component"
        />
        <CmdCard
          cmd="/ds-create-composite <Name>"
          desc="Cria componente composto (múltiplos sub-componentes, shared tv())."
          agent="Full pipeline"
          skill="impl-composite"
        />
        <CmdCard
          cmd="/ds-add-shadcn <name>"
          desc="Adiciona componente Shadcn já adaptado para tokens DS. Pula DS Designer."
          agent="Dev → Reviewer"
          skill="impl-shadcn"
        />
        <CmdCard
          cmd="/ds-add-token <name>"
          desc="Adiciona ou modifica token semântico (cor, spacing, sizing, etc.)."
          agent="Designer → [GATE] → Dev → Reviewer"
          skill="spec-token-* + impl-token"
        />
        <CmdCard
          cmd="/ds-extract-figma <url>"
          desc="Extrai tokens ou componentes de um arquivo Figma e produz spec para revisão."
          agent="Designer → [GATE]"
          skill="figma-extract"
        />
        <CmdCard
          cmd="/ds-update [tag]"
          desc="Lê git log desde a última entry, classifica as mudanças e propõe uma ReleaseEntry para a timeline Updates. Gate de revisão antes de gravar."
          agent="Dev → [GATE preview]"
          skill="update-changelog"
        />
      </div>

      {/* Authoring */}
      <SectionH2 id="authoring" title="Authoring a Command" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          A command file has YAML frontmatter and a short body describing the route. The frontmatter binds
          the command name and the skill(s) it loads.
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted overflow-x-auto">
          <pre className="whitespace-pre leading-relaxed">{`---
name: ds-create-component
description: Cria componente iGreen com tv() — Designer → Gate → Dev → Reviewer.
---

Inicia o pipeline completo de componente novo.
Carrega: skills/ds-designer/spec-component.md, skills/ds-dev/impl-igreen.md, skills/ds-reviewer/review-component.md.

Argumentos:
- $1: Nome do componente (PascalCase)

Gate obrigatório após spec — usuário aprova antes da implementação.`}</pre>
        </div>
      </div>

      {/* vs Skills */}
      <SectionH2 id="vs-skills" title="Commands vs Skills" />
      <div className="grid grid-cols-2 gap-gp-3xl mb-14">
        <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-md">Slash Command</p>
          <ul className="list-disc pl-sp-md flex flex-col gap-gp-sm text-body-md text-fg-muted">
            <li>Entrada do USUÁRIO</li>
            <li>Resolve para 1+ skills</li>
            <li>Aceita argumentos posicionais</li>
            <li>Vive em <code className="font-mono text-code-sm">.claude/commands/</code></li>
          </ul>
        </div>
        <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-md">Skill</p>
          <ul className="list-disc pl-sp-md flex flex-col gap-gp-sm text-body-md text-fg-muted">
            <li>Procedimento técnico para o AGENTE</li>
            <li>Pode ser carregada por command OU por SkillTool</li>
            <li>Template + checklist + signal</li>
            <li>Vive em <code className="font-mono text-code-sm">.claude/skills/&lt;agent&gt;/</code></li>
          </ul>
        </div>
      </div>
    </DocLayout>
  );
}
