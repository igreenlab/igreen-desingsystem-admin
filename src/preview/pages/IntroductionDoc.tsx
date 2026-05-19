import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "what", label: "What is iGreen DS" },
  { id: "principles", label: "Principles" },
  { id: "architecture", label: "Architecture" },
  { id: "ai-pipeline", label: "AI Pipeline" },
  { id: "why", label: "Why v2" },
  { id: "status", label: "Status" },
];

export function IntroductionDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Get Started"
        title="Introduction"
        description="Token-first design system for iGreen SaaS CRM, admin panels and dashboards — React + Tailwind v4 + Shadcn + AI pipeline."
      />
      <DocSeparator />

      {/* What */}
      <SectionH2 id="what" title="What is iGreen DS" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          iGreen Design System is the internal library used by iGreen SaaS platforms — admin panels, CRM,
          operational dashboards and licensing portals. It ships a unified set of{" "}
          <strong className="text-fg-default">design tokens</strong>,{" "}
          <strong className="text-fg-default">UI components</strong>,{" "}
          <strong className="text-fg-default">documentation</strong>, and a{" "}
          <strong className="text-fg-default">multi-agent AI pipeline</strong> that enforces consistency at every change.
        </p>
        <p className="text-body-md text-fg-muted">
          The canonical stack is <strong className="text-fg-default">React 19 + TypeScript + Vite + Tailwind v4 + Shadcn/ui + Radix UI</strong>.
          Tokens are the single source of truth — components consume them through generated CSS variables and
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">tv()</code> classes.
          The DS is opinionated for data-dense interfaces (large tables, multi-step forms, kanbans, filters, modals).
        </p>
      </div>

      {/* Principles */}
      <SectionH2 id="principles" title="Principles" />
      <div className="grid gap-gp-3xl mb-14">
        {[
          {
            title: "Token-first",
            desc: "Every visual decision (color, spacing, radius, shadow) starts as a token. Components consume tokens via CSS variables — never hardcoded values.",
          },
          {
            title: "Focused on data-dense SaaS",
            desc: "Built for admin panels, CRM, dashboards. Optimized for large tables, multi-step forms, kanbans, complex filters, and modal flows — not for marketing sites.",
          },
          {
            title: "Anti-collision prefixes",
            desc: "All DS tokens use prefixed CSS variables (sp-, gp-, pad-, radius-, sh-) to avoid overriding Tailwind built-in utilities like gap-4 or rounded-lg.",
          },
          {
            title: "Dark mode via tokens",
            desc: "Light and dark palettes are separate token files with the same contract. Toggling themes swaps CSS vars — no component logic needed.",
          },
          {
            title: "Accessible by default",
            desc: "Interactive elements meet WCAG 2.5.5 minimum target sizes (44px). Focus rings use visible ring tokens with built-in alpha.",
          },
          {
            title: "AI-assisted pipeline",
            desc: "A 4-agent system (Orchestrator → Designer → Dev → Reviewer) governs every change with mandatory gates, cascade protocols, and an append-only audit log.",
          },
        ].map((p) => (
          <div key={p.title} className="flex gap-gp-2xl">
            <div className="w-1 shrink-0 rounded-full bg-bg-brand" />
            <div>
              <p className="text-body-md font-medium text-fg-default mb-gp-xs">{p.title}</p>
              <p className="text-body-md text-fg-muted">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Architecture */}
      <SectionH2 id="architecture" title="Architecture Overview" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">The system is organized in 3 tiers:</p>
        <div className="rounded-radius-base border border-border-subtle p-pad-4xl font-mono text-code-sm text-fg-muted leading-relaxed">
          <p className="text-fg-default font-semibold mb-gp-xl">Tier 1 — Primitives (private API)</p>
          <p className="ml-sp-md mb-gp-md">color-palette.ts, scales.ts, fonts.ts, motion.ts</p>
          <p className="text-fg-subtle mb-gp-2xl ml-sp-md">Raw values: OKLCH hues, base-4 scale, font stacks</p>

          <p className="text-fg-default font-semibold mb-gp-xl">Tier 2 — Semantic (public API)</p>
          <p className="ml-sp-md mb-gp-md">color-light.ts, color-dark.ts, spacing.ts, sizing.ts, shape.ts, elevation.ts, typography.ts</p>
          <p className="text-fg-subtle mb-gp-2xl ml-sp-md">Meaningful names: bg.brand, gap.md, radius.base, shadow.md</p>

          <p className="text-fg-default font-semibold mb-gp-xl">Tier 2.5 — Component Tokens</p>
          <p className="ml-sp-md mb-gp-md">components/sizing.ts, components/spacing.ts</p>
          <p className="text-fg-subtle ml-sp-md">Component-specific: form.lg, icon.md, padCard.base</p>
        </div>
        <p className="text-body-md text-fg-muted">
          Components <strong className="text-fg-default">never</strong> import primitives directly.
          They consume semantic tokens via Tailwind v4 CSS variables generated by the transform pipeline.
        </p>
      </div>

      {/* AI Pipeline */}
      <SectionH2 id="ai-pipeline" title="AI Pipeline" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Every change to a token or component flows through a four-agent pipeline. Each agent has a single
          responsibility, an explicit gate, and an audit log entry recording the decision and its assumption.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gp-2xl">
          {[
            { name: "Orchestrator", desc: "Classifies the request, routes to the right agent, holds the gate." },
            { name: "DS Designer", desc: "Writes the spec with alternatives and a central assumption." },
            { name: "DS Dev", desc: "Implements the approved spec using tv() and tokenized classes." },
            { name: "DS Reviewer", desc: "Runs regression sweep + genuine critique + checks the assumption." },
          ].map((a) => (
            <div key={a.name} className="rounded-radius-base border border-border-subtle p-pad-3xl">
              <p className="text-body-md font-medium text-fg-default mb-gp-sm">{a.name}</p>
              <p className="text-caption-sm text-fg-muted leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-body-md text-fg-muted">
          Backed by skills (atomic procedures), slash commands (entry points), hooks (PreToolUse/PostToolUse),
          output styles, MCP servers, and a four-layer memory system. See{" "}
          <strong className="text-fg-default">Agents</strong> in the sidebar.
        </p>
      </div>

      {/* Why v2 */}
      <SectionH2 id="why" title="Why v2" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          v1 was tightly coupled to a single Tailwind config and relied on hardcoded design decisions
          inside components. v2 was rebuilt from scratch with these goals:
        </p>
        <ul className="list-disc pl-sp-md flex flex-col gap-gp-md text-body-md text-fg-muted">
          <li>Decouple tokens from any specific CSS framework</li>
          <li>Support multi-brand theming (same tokens, different palettes)</li>
          <li>Anti-collision prefixes to coexist with Tailwind built-ins</li>
          <li>AI-assisted pipeline: Designer → Dev → Reviewer agents with mandatory gates</li>
          <li>Unified spacing scale across gap, padding, and margin</li>
          <li>Append-only audit log with reversible assumptions per decision</li>
        </ul>
      </div>

      {/* Status */}
      <SectionH2 id="status" title="Status" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="flex items-center gap-gp-xl">
          <Badge color="success" variant="soft" size="md">Stable</Badge>
          <span className="text-body-md text-fg-muted">Token architecture, 3-tier hierarchy and transform pipeline</span>
        </div>
        <div className="flex items-center gap-gp-xl">
          <Badge color="success" variant="soft" size="md">Stable</Badge>
          <span className="text-body-md text-fg-muted">Shadcn + iGreen components, all styled with DS tokens</span>
        </div>
        <div className="flex items-center gap-gp-xl">
          <Badge color="success" variant="soft" size="md">Stable</Badge>
          <span className="text-body-md text-fg-muted">AI pipeline (4 agents) + skills + hooks + output style + memory</span>
        </div>
        <div className="flex items-center gap-gp-xl">
          <Badge color="warning" variant="soft" size="md">Preview</Badge>
          <span className="text-body-md text-fg-muted">Documentation site (you're looking at it)</span>
        </div>
        <div className="flex items-center gap-gp-xl">
          <Badge color="primary" variant="soft" size="md">Planned</Badge>
          <span className="text-body-md text-fg-muted">NPM package distribution</span>
        </div>
      </div>
    </DocLayout>
  );
}
