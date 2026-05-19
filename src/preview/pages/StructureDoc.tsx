import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "tokens", label: "Token Files" },
  { id: "transforms", label: "Transforms" },
  { id: "components", label: "Components" },
  { id: "ai-pipeline", label: "AI Pipeline Folders" },
  { id: "context", label: "Project Context" },
  { id: "preview", label: "Preview App" },
  { id: "stack", label: "Tech Stack" },
];

function FileRow({ path, desc, tag }: { path: string; desc: string; tag?: string }) {
  return (
    <div className="flex items-start gap-gp-xl py-pad-md border-b border-border-subtle last:border-b-0">
      <code className="text-code-sm text-fg-brand font-mono shrink-0 min-w-[240px]">{path}</code>
      <span className="text-body-md text-fg-muted flex-1">{desc}</span>
      {tag && <Badge color="secondary" variant="outline" size="sm" className="shrink-0">{tag}</Badge>}
    </div>
  );
}

export function StructureDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Get Started"
        title="Structure"
        description="Project architecture, file map, AI pipeline folders, and tech stack."
      />
      <DocSeparator />

      {/* Overview */}
      <SectionH2 id="overview" title="Overview" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          The project is organized in five main areas: <strong className="text-fg-default">tokens</strong> (source of truth),{" "}
          <strong className="text-fg-default">transforms</strong> (generate consumable formats),{" "}
          <strong className="text-fg-default">components</strong> (UI library + preview),{" "}
          <strong className="text-fg-default">.claude/</strong> (pipeline orchestration), and{" "}
          <strong className="text-fg-default">.ai/</strong> (project context & audit).
        </p>
        <div className="rounded-radius-base border border-border-subtle p-pad-4xl font-mono text-code-sm text-fg-muted leading-loose">
          <p className="text-fg-default font-semibold">igreen-ds/</p>
          <p className="ml-sp-md">CLAUDE.md                          <span className="text-fg-subtle">← Project-wide rules (auto)</span></p>
          <p className="ml-sp-md">tokens/</p>
          <p className="ml-sp-2xl">brands/default/primitives/       <span className="text-fg-subtle">← Tier 1</span></p>
          <p className="ml-sp-2xl">brands/default/semantic/         <span className="text-fg-subtle">← Tier 2</span></p>
          <p className="ml-sp-2xl">brands/default/components/       <span className="text-fg-subtle">← Tier 2.5</span></p>
          <p className="ml-sp-2xl">transforms/                      <span className="text-fg-subtle">← Adapters</span></p>
          <p className="ml-sp-md">src/</p>
          <p className="ml-sp-2xl">components/ui/                   <span className="text-fg-subtle">← iGreen components (tv)</span></p>
          <p className="ml-sp-2xl">components/shadcn/               <span className="text-fg-subtle">← Shadcn styled</span></p>
          <p className="ml-sp-2xl">styles/theme/                    <span className="text-fg-subtle">← Generated CSS</span></p>
          <p className="ml-sp-2xl">preview/pages/                   <span className="text-fg-subtle">← Doc pages</span></p>
          <p className="ml-sp-2xl">utils/                           <span className="text-fg-subtle">← tv(), cn()</span></p>
          <p className="ml-sp-md">.claude/                           <span className="text-fg-subtle">← Pipeline orchestration</span></p>
          <p className="ml-sp-2xl">agents/                          <span className="text-fg-subtle">← 4 agents + 2 pending</span></p>
          <p className="ml-sp-2xl">skills/                          <span className="text-fg-subtle">← Atomic procedures</span></p>
          <p className="ml-sp-2xl">commands/                        <span className="text-fg-subtle">← Slash commands</span></p>
          <p className="ml-sp-2xl">hooks/                           <span className="text-fg-subtle">← Pre/Post tool hooks</span></p>
          <p className="ml-sp-2xl">rules/                           <span className="text-fg-subtle">← Auto-loaded rules</span></p>
          <p className="ml-sp-2xl">output-styles/                   <span className="text-fg-subtle">← Response shape (terse)</span></p>
          <p className="ml-sp-2xl">settings.json                    <span className="text-fg-subtle">← Permissions + hooks</span></p>
          <p className="ml-sp-md">.ai/                               <span className="text-fg-subtle">← Project context & audit</span></p>
          <p className="ml-sp-2xl">context/                         <span className="text-fg-subtle">← Architecture, tokens, components</span></p>
          <p className="ml-sp-2xl">rules/coding-standards.md        <span className="text-fg-subtle">← Long-form tv() reference</span></p>
          <p className="ml-sp-2xl">status/pipeline-state.md         <span className="text-fg-subtle">← Audit log (append-only)</span></p>
          <p className="ml-sp-2xl">status/lessons.md                <span className="text-fg-subtle">← Lessons L-001..L-014</span></p>
          <p className="ml-sp-md">memory/                            <span className="text-fg-subtle">← Project-level memory</span></p>
        </div>
      </div>

      {/* Token Files */}
      <SectionH2 id="tokens" title="Token Files" />
      <div className="flex flex-col gap-gp-xs mb-14">
        <p className="text-body-md text-fg-muted mb-gp-2xl">
          All tokens live in <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">tokens/brands/default/</code>.
          Each file exports a typed object.
        </p>

        <p className="text-body-md font-medium text-fg-default mb-gp-xs">Primitives (private — never imported by components)</p>
        <div className="mb-gp-3xl">
          <FileRow path="primitives/color-palette.ts" desc="OKLCH color scales: brand, neutral, feedback, alpha" tag="Tier 1" />
          <FileRow path="primitives/scales.ts" desc="Base-4 spatial system: sp(n) = n * 4px" tag="Tier 1" />
          <FileRow path="primitives/fonts.ts" desc="Font families, weights, typeSize() step function" tag="Tier 1" />
          <FileRow path="primitives/motion.ts" desc="Duration, easing, motion presets" tag="Tier 1" />
        </div>

        <p className="text-body-md font-medium text-fg-default mb-gp-xs">Semantic (public API — consumed via CSS vars)</p>
        <div className="mb-gp-3xl">
          <FileRow path="semantic/color-light.ts" desc="bg.*, fg.*, border.*, ring.*, overlay.* (light)" tag="Tier 2" />
          <FileRow path="semantic/color-dark.ts" desc="Same contract, dark mode values" tag="Tier 2" />
          <FileRow path="semantic/spacing.ts" desc="Unified scale: space (sp-), gap (gp-), pad (pad-)" tag="Tier 2" />
          <FileRow path="semantic/sizing.ts" desc="Component dimension scale (comp-*)" tag="Tier 2" />
          <FileRow path="semantic/shape.ts" desc="RADIUS_BASE knob + multiplicative radius scale" tag="Tier 2" />
          <FileRow path="semantic/elevation.ts" desc="Shadows (light/dark), opacity, blur, z-index" tag="Tier 2" />
          <FileRow path="semantic/typography.ts" desc="Display, heading, title, body, label, code presets" tag="Tier 2" />
        </div>

        <p className="text-body-md font-medium text-fg-default mb-gp-xs">Component Tokens (component-specific scales)</p>
        <div>
          <FileRow path="components/sizing.ts" desc="form.*, layout.*, icon.*, container.* heights/widths" tag="Tier 2.5" />
          <FileRow path="components/spacing.ts" desc="padCard.*, padPage.* internal padding" tag="Tier 2.5" />
        </div>
      </div>

      {/* Transforms */}
      <SectionH2 id="transforms" title="Transforms" />
      <div className="flex flex-col gap-gp-xs mb-14">
        <p className="text-body-md text-fg-muted mb-gp-2xl">
          Transforms read token objects and output consumable formats. Run via npm scripts.
        </p>
        <FileRow path="transforms/to-tailwind-v4.ts" desc="Generates @theme CSS + .dark overrides + @utility presets" tag="Primary" />
        <FileRow path="transforms/to-css-vars.ts" desc="Vanilla CSS custom properties (framework-agnostic)" tag="Optional" />
        <FileRow path="transforms/to-dtcg.ts" desc="Design Token Community Group JSON format" tag="Optional" />
        <FileRow path="transforms/to-js-theme.ts" desc="JS theme object for runtime use" tag="Optional" />
        <FileRow path="transforms/to-tailwind.ts" desc="Legacy Tailwind v3 config (deprecated)" tag="Legacy" />
      </div>

      {/* Components */}
      <SectionH2 id="components" title="Components" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Two component layers live in <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">src/components/</code>:
        </p>
        <div className="grid grid-cols-2 gap-gp-3xl">
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-md">ui/ — iGreen Components</p>
            <p className="text-body-md text-fg-muted">
              Custom components built from scratch using <code className="font-mono text-code-sm">tv()</code> from
              <code className="font-mono text-code-sm"> @/utils/tv</code>. Each folder has <code className="font-mono text-code-sm">.tsx</code>,{" "}
              <code className="font-mono text-code-sm">.styles.ts</code>, <code className="font-mono text-code-sm">.types.ts</code>,{" "}
              <code className="font-mono text-code-sm">index.ts</code>, and <code className="font-mono text-code-sm">USAGE.md</code>.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-md">shadcn/ — Adapted Shadcn</p>
            <p className="text-body-md text-fg-muted">
              Shadcn components restyled with DS tokens. Radix primitives under the hood. Classes reference
              CSS vars from the generated theme.
            </p>
          </div>
        </div>
      </div>

      {/* AI Pipeline */}
      <SectionH2 id="ai-pipeline" title="AI Pipeline Folders" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          The pipeline lives in <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">.claude/</code>.
          Each folder has a single responsibility — kept atomic on purpose.
        </p>
        <FileRow path=".claude/agents/" desc="4 active agents (orchestrator, designer, dev, reviewer) + 2 pending (app-*)" tag="Identity" />
        <FileRow path=".claude/skills/" desc="Atomic skills per agent: spec-token-*, impl-igreen, review-component, etc." tag="Procedure" />
        <FileRow path=".claude/commands/" desc="Slash commands as entry points: /ds-create-component, /ds-add-token..." tag="Entry" />
        <FileRow path=".claude/hooks/" desc="format-on-save, block-rm-rf, block-sensitive-edit (logged to .ai/scratch/)" tag="Triggers" />
        <FileRow path=".claude/rules/" desc="ds-standards.md auto-loaded by glob — 6 behavior rules + 14 lessons" tag="Rules" />
        <FileRow path=".claude/output-styles/" desc="terse.md — caps response shape across the project" tag="Style" />
        <FileRow path=".claude/settings.json" desc="Permissions, hooks registration, outputStyle binding" tag="Config" />
        <FileRow path=".claude/scripts/" desc="sync-agents-to-cursor.cjs — mirrors agents to .cursor/rules" tag="Tooling" />
      </div>

      {/* Context */}
      <SectionH2 id="context" title="Project Context" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Long-form context, lessons and the audit log live in <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">.ai/</code>.
          This area is what makes the pipeline reversible — every decision has an entry with its assumption.
        </p>
        <FileRow path=".ai/context/architecture.md" desc="Full system architecture: tiers, flow, fonte única" tag="Reference" />
        <FileRow path=".ai/context/tokens/" desc="Per-type token references (color, spacing, sizing, typography...)" tag="Reference" />
        <FileRow path=".ai/context/components/inventory.md" desc="Single source for what exists (ui + shadcn + composite)" tag="Inventory" />
        <FileRow path=".ai/context/components/guide.md" desc="Long-form component guide (variants, compounds, patterns)" tag="Guide" />
        <FileRow path=".ai/rules/coding-standards.md" desc="Long-form tv() pattern reference (sub-skill load)" tag="Rules" />
        <FileRow path=".ai/status/pipeline-state.md" desc="Audit log (append-only): every decision + Assumption field" tag="Audit" />
        <FileRow path=".ai/status/lessons.md" desc="Canonical L-001..L-014 (full descriptions, examples)" tag="Lessons" />
        <FileRow path=".ai/status/BACKLOG.md" desc="Pending features queued for the pipeline" tag="Queue" />
        <FileRow path="memory/" desc="Project-level memory (MEMORY.md index + project_*.md notes)" tag="Memory" />
      </div>

      {/* Preview App */}
      <SectionH2 id="preview" title="Preview App" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          This documentation site is the preview app. It runs on Vite + React and serves as the living styleguide.
        </p>
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <div className="flex items-center gap-gp-xl py-pad-md px-pad-3xl border-b border-border-subtle">
            <code className="font-mono text-code-sm text-fg-brand">npm run dev</code>
            <span className="text-body-md text-fg-muted">→ localhost:3100 (regenera tokens antes)</span>
          </div>
          <div className="flex items-center gap-gp-xl py-pad-md px-pad-3xl border-b border-border-subtle">
            <code className="font-mono text-code-sm text-fg-brand">npm run tokens:tw4</code>
            <span className="text-body-md text-fg-muted">→ regenerate Tailwind v4 theme CSS from tokens</span>
          </div>
          <div className="flex items-center gap-gp-xl py-pad-md px-pad-3xl border-b border-border-subtle">
            <code className="font-mono text-code-sm text-fg-brand">npm run build</code>
            <span className="text-body-md text-fg-muted">→ tokens + tsc -b + vite build</span>
          </div>
          <div className="flex items-center gap-gp-xl py-pad-md px-pad-3xl">
            <code className="font-mono text-code-sm text-fg-brand">npm run sync:agents</code>
            <span className="text-body-md text-fg-muted">→ espelha .claude/agents/ em .cursor/rules/</span>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <SectionH2 id="stack" title="Tech Stack" />
      <div className="flex flex-wrap gap-gp-md mb-14">
        {[
          "TypeScript", "React 19", "Vite", "Tailwind CSS v4",
          "Tailwind Variants (tv)", "Radix UI", "Shadcn/ui",
          "OKLCH Colors", "react-day-picker", "Lucide Icons",
          "@dnd-kit (Kanban)", "@tanstack/react-virtual", "Vitest", "Geist Font",
        ].map((tech) => (
          <Badge key={tech} color="secondary" variant="outline" size="md">{tech}</Badge>
        ))}
      </div>
    </DocLayout>
  );
}
