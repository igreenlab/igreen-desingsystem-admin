import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "what", label: "What is the Agent Pipeline" },
  { id: "architecture", label: "Architecture" },
  { id: "file-structure", label: "File Structure" },
  { id: "how", label: "How it Works" },
  { id: "self-learning", label: "Self-Learning Loop" },
  { id: "gate", label: "Gate System" },
  { id: "routes", label: "Pipeline Routes" },
];

const COLORS = {
  orchestrator: "#6366f1",
  designer: "#f59e0b",
  dev: "#10b981",
  reviewer: "#3b82f6",
};

/* ── page ─────────────────────────────────────────────────────── */

export function AgentsOverviewDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Agents"
        title="Agent Pipeline Overview"
        description="How the iGreen DS uses a multi-agent architecture powered by Claude to design, implement, and review components."
      />
      <DocSeparator />

      {/* ── What is the Agent Pipeline ────────────────────────── */}
      <SectionH2 id="what" title="What is the Agent Pipeline" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <p className="text-body-md text-fg-muted">
            The iGreen Design System uses a{" "}
            <strong className="text-fg-default">multi-agent architecture</strong>{" "}
            powered by Claude. Instead of one monolithic AI that tries to do
            everything, tasks are split across specialized agents that collaborate
            in a defined pipeline. Each agent has a focused role, specific context
            files, and defined input/output signals — mirroring how a real
            design-engineering team operates.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-gp-2xl">
          {[
            {
              title: "Specialized Roles",
              desc: "Each agent only knows what it needs. The Designer thinks in tokens and specs; the Dev thinks in code and classes.",
            },
            {
              title: "Signal-Based Communication",
              desc: "Signals like SPEC_PRONTA and IMPL_PRONTA create clear checkpoints between phases with explicit hand-offs.",
            },
            {
              title: "Self-Learning",
              desc: "Mistakes are captured as lessons and loaded before every future task, building an ever-growing prevention database.",
            },
            {
              title: "Human Gates",
              desc: "Gate steps require explicit user approval before expensive implementation work begins, preventing wasted effort.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-radius-base border border-border-subtle p-pad-3xl"
            >
              <p className="text-body-md font-medium text-fg-default mb-gp-xs">
                {item.title}
              </p>
              <p className="text-body-md text-fg-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Architecture ──────────────────────────────────────── */}
      <SectionH2 id="architecture" title="Architecture" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          The flow from user task to completed work. The Orchestrator receives
          every request and delegates to the right specialist.
        </p>

        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          {/* Orchestrator — centered, wider */}
          <div className="flex flex-col items-center gap-gp-xl mb-gp-4xl">
            <div
              className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-3xl text-center w-full max-w-[320px]"
              style={{ borderLeftWidth: 4, borderLeftColor: COLORS.orchestrator }}
            >
              <div className="flex items-center justify-center gap-gp-md mb-gp-xs">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: COLORS.orchestrator }}
                />
                <p className="text-body-md font-medium font-semibold" style={{ color: COLORS.orchestrator }}>
                  Orchestrator
                </p>
              </div>
              <p className="text-caption-sm text-fg-muted">Classifies domain and selects route</p>
            </div>

            <span className="text-fg-subtle text-body-md font-medium">&darr;</span>
          </div>

          {/* Three sub-agents in a row */}
          <div className="grid grid-cols-3 gap-gp-3xl">
            {[
              { label: "Designer", subtitle: "Writes specs and token definitions", color: COLORS.designer },
              { label: "Dev", subtitle: "Implements code from specs", color: COLORS.dev },
              { label: "Reviewer", subtitle: "Validates against standards", color: COLORS.reviewer },
            ].map((agent) => (
              <div
                key={agent.label}
                className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-3xl text-center"
                style={{ borderTopWidth: 4, borderTopColor: agent.color }}
              >
                <div className="flex items-center justify-center gap-gp-md mb-gp-xs">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: agent.color }}
                  />
                  <p className="text-body-md font-medium font-semibold" style={{ color: agent.color }}>
                    {agent.label}
                  </p>
                </div>
                <p className="text-caption-sm text-fg-muted">{agent.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="border-t border-border-subtle pt-pad-3xl mt-gp-4xl">
            <p className="text-body-xs text-fg-subtle mb-gp-md">Agent colors</p>
            <div className="flex flex-wrap gap-gp-3xl">
              {Object.entries(COLORS).map(([label, color]) => (
                <div key={label} className="flex items-center gap-gp-md">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-caption-sm text-fg-muted capitalize">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── File Structure ─────────────────────────────────────── */}
      <SectionH2 id="file-structure" title="File Structure" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          The agent system is organized across three directories. Each agent has a definition file,
          and they share rules, lessons, and context files.
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <div className="font-mono text-code-sm leading-loose">
            {[
              { depth: 0, name: ".claude/", isDir: true },
              { depth: 1, name: "agents/", isDir: true, desc: "Agent definitions (loaded by Claude Code)" },
              { depth: 2, name: "orchestrator.md", desc: "Hub — classifies and delegates", color: COLORS.orchestrator },
              { depth: 2, name: "ds-designer.md", desc: "Specifies tokens and component specs", color: COLORS.designer },
              { depth: 2, name: "ds-dev.md", desc: "Implements specs into code", color: COLORS.dev },
              { depth: 2, name: "ds-reviewer.md", desc: "Validates before merge (4 checklists)", color: COLORS.reviewer },
              { depth: 1, name: "rules/", isDir: true, desc: "Auto-loaded on every session" },
              { depth: 2, name: "ds-standards.md", desc: "Prohibited/required patterns + lesson summaries" },
              { depth: 0, name: ".ai/", isDir: true },
              { depth: 1, name: "lessons.md", isDir: false, desc: "Error log — 14 lessons, loaded before every task" },
              { depth: 1, name: "rules/", isDir: true, desc: "Detailed coding standards" },
              { depth: 2, name: "coding-standards.md", desc: "Full rules: prefixes, rings, dark mode, a11y" },
              { depth: 1, name: "context/", isDir: true, desc: "Task-specific context (loaded on demand)" },
              { depth: 2, name: "tokens-color.md", desc: "Color token rules and workflows" },
              { depth: 2, name: "tokens-spacing.md", desc: "Spacing scale and prefixes" },
              { depth: 2, name: "tokens-typography.md", desc: "Typography presets and clamp()" },
              { depth: 2, name: "tokens-sizing-shape-elevation.md", desc: "Sizing, radius, shadows" },
              { depth: 2, name: "component-guide.md", desc: "Component creation patterns (tv, variants)" },
              { depth: 2, name: "doc-guide.md", desc: "Documentation page patterns (DocLayout, ExampleSection)" },
              { depth: 2, name: "shadcn-token-map.md", desc: "Shadcn CSS var → DS token mapping" },
              { depth: 2, name: "architecture.md", desc: "Full file map of the project" },
              { depth: 0, name: "CLAUDE.md", isDir: false, desc: "Master reference — architecture, prefixes, task routing" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-gp-xl" style={{ paddingLeft: f.depth * 20 }}>
                <span className="text-fg-subtle shrink-0">{f.isDir ? "📁" : "├─"}</span>
                <span className={f.isDir ? "text-fg-default font-semibold" : "text-fg-brand"} style={f.color ? { color: f.color } : undefined}>
                  {f.name}
                </span>
                {f.desc && <span className="text-fg-subtle">— {f.desc}</span>}
              </div>
            ))}
          </div>
        </div>

        <p className="text-body-md text-fg-muted">
          The loading strategy minimizes token cost:
        </p>
        <div className="grid grid-cols-2 gap-gp-2xl">
          <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-xs">Always loaded</p>
            <p className="text-body-md text-fg-muted">
              <code className="font-mono text-code-sm text-fg-brand">ds-standards.md</code> and{" "}
              <code className="font-mono text-code-sm text-fg-brand">CLAUDE.md</code> are auto-loaded
              by Claude Code on every session. Small files with essential rules.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-xs">Loaded per task</p>
            <p className="text-body-md text-fg-muted">
              Context files in <code className="font-mono text-code-sm text-fg-brand">.ai/context/</code> are
              loaded only when the task requires them. This keeps token usage low for simple tasks.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-xs">Loaded before any task</p>
            <p className="text-body-md text-fg-muted">
              <code className="font-mono text-code-sm text-fg-brand">lessons.md</code> is read by every
              agent before starting work. Prevents repeating known errors.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-xs">Self-updating</p>
            <p className="text-body-md text-fg-muted">
              When an error is corrected, a new lesson is added to{" "}
              <code className="font-mono text-code-sm text-fg-brand">lessons.md</code> and summarized
              in <code className="font-mono text-code-sm text-fg-brand">ds-standards.md</code>.
            </p>
          </div>
        </div>
      </div>

      {/* ── How it Works ──────────────────────────────────────── */}
      <SectionH2 id="how" title="How it Works" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <div className="grid gap-gp-3xl">
            {[
              {
                step: "1",
                title: "User describes a task",
                desc: "Natural language request like \"Create a new Chip component with solid and outlined variants.\"",
              },
              {
                step: "2",
                title: "Orchestrator classifies the domain",
                desc: "Reads the request, identifies it as a new component, and selects the optimal pipeline route.",
              },
              {
                step: "3",
                title: "Agents execute in sequence",
                desc: "Designer writes a spec, user approves at the gate, Dev implements, Reviewer validates against standards.",
              },
              {
                step: "4",
                title: "Signals mark completion",
                desc: "Each agent emits a signal when done: SPEC_PRONTA, IMPL_PRONTA, REVIEW_OK. These create clear checkpoints.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-gp-2xl">
                <div
                  className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-body-md font-medium font-semibold text-white"
                  style={{ backgroundColor: COLORS.orchestrator }}
                >
                  {item.step}
                </div>
                <div>
                  <p className="text-body-md font-medium text-fg-default mb-gp-xs">
                    {item.title}
                  </p>
                  <p className="text-body-md text-fg-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Self-Learning Loop ─────────────────────────────────── */}
      <SectionH2 id="self-learning" title="Self-Learning Loop" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-xl">
            Feedback loop
          </p>

          {/* Visual loop flow */}
          <div className="flex items-center gap-gp-xl flex-wrap mb-gp-3xl">
            <Badge color="critical" variant="soft" size="sm">
              Mistake
            </Badge>
            <span className="text-fg-subtle">&rarr;</span>
            <Badge color="warning" variant="soft" size="sm">
              Correction
            </Badge>
            <span className="text-fg-subtle">&rarr;</span>
            <Badge color="primary" variant="soft" size="sm">
              Lesson Added
            </Badge>
            <span className="text-fg-subtle">&rarr;</span>
            <Badge color="success" variant="soft" size="sm">
              Prevention
            </Badge>
          </div>

          <p className="text-body-md text-fg-muted mb-gp-3xl">
            When an agent makes an error and it is corrected, the lesson is
            captured and loaded before every future task. The more the system is
            used, the fewer mistakes it makes.
          </p>

          {/* Key files — treeview */}
          <div className="border-t border-border-subtle pt-pad-3xl">
            <p className="text-body-xs text-fg-subtle uppercase tracking-wider mb-gp-xl">
              Key files
            </p>
            <div className="font-mono text-code-sm leading-loose">
              {[
                { depth: 0, name: ".ai/", isDir: true },
                { depth: 1, name: "lessons.md", desc: "Error prevention database" },
                { depth: 1, name: "rules/coding-standards.md", desc: "Evolving coding rules" },
                { depth: 0, name: ".claude/", isDir: true },
                { depth: 1, name: "rules/ds-standards.md", desc: "Auto-loaded patterns" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-gp-xl" style={{ paddingLeft: f.depth * 20 }}>
                  <span className="text-fg-subtle shrink-0">{f.isDir ? "📁" : "├─"}</span>
                  <span className={f.isDir ? "text-fg-default font-semibold" : "text-fg-brand"}>{f.name}</span>
                  {f.desc && <span className="text-fg-subtle">— {f.desc}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Gate System ───────────────────────────────────────── */}
      <SectionH2 id="gate" title="Gate System" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <div className="grid gap-gp-3xl mb-gp-3xl">
            {[
              {
                step: "1",
                title: "Designer delivers spec",
                desc: "The Designer agent completes its work and emits SPEC_PRONTA.",
              },
              {
                step: "2",
                title: "Orchestrator presents to user",
                desc: "The spec is shown to the user for review. No code has been written yet.",
              },
              {
                step: "3",
                title: "User approves or requests changes",
                desc: "The gate blocks the pipeline until the user explicitly approves the spec.",
              },
              {
                step: "4",
                title: "Dev begins implementation",
                desc: "Only after approval does the Dev agent start implementing. This prevents wasted work.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-gp-2xl">
                <div
                  className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-body-md font-medium font-semibold text-white"
                  style={{ backgroundColor: COLORS.orchestrator }}
                >
                  {item.step}
                </div>
                <div>
                  <p className="text-body-md font-medium text-fg-default mb-gp-xs">
                    {item.title}
                  </p>
                  <p className="text-body-md text-fg-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-radius-base bg-bg-subtle p-pad-3xl">
            <p className="text-body-xs text-fg-subtle uppercase tracking-wider mb-gp-md">
              When gates are not used
            </p>
            <p className="text-body-md text-fg-muted">
              Tasks that skip spec creation — such as visual edits, Shadcn
              component additions, and token changes — go directly from
              Orchestrator to Dev without a gate. The cost of rework is low
              enough that human approval is unnecessary.
            </p>
          </div>
        </div>
      </div>

      {/* ── Pipeline Routes ───────────────────────────────────── */}
      <SectionH2 id="routes" title="Pipeline Routes" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Not every task runs through the full pipeline. The Orchestrator selects
          the shortest route that satisfies the task requirements.
        </p>

        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-subtle">
                <th className="text-left text-body-xs text-fg-muted font-medium py-pad-md px-pad-xl">
                  Route
                </th>
                <th className="text-left text-body-xs text-fg-muted font-medium py-pad-md px-pad-xl">
                  Flow
                </th>
                <th className="text-left text-body-xs text-fg-muted font-medium py-pad-md px-pad-xl">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  route: "Full pipeline",
                  flow: (
                    <div className="flex items-center gap-gp-md">
                      <span style={{ color: COLORS.designer }}>Designer</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span className="text-fg-default font-semibold">[GATE]</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span style={{ color: COLORS.dev }}>Dev</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span style={{ color: COLORS.reviewer }}>Reviewer</span>
                    </div>
                  ),
                  desc: "New iGreen component from scratch",
                },
                {
                  route: "Shadcn component",
                  flow: (
                    <div className="flex items-center gap-gp-md">
                      <span style={{ color: COLORS.dev }}>Dev</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span style={{ color: COLORS.reviewer }}>Reviewer</span>
                    </div>
                  ),
                  desc: "Adding a Shadcn component with DS tokens",
                },
                {
                  route: "Visual edit",
                  flow: (
                    <div className="flex items-center gap-gp-md">
                      <span style={{ color: COLORS.dev }}>Dev</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span style={{ color: COLORS.reviewer }}>Reviewer</span>
                    </div>
                  ),
                  desc: "Only touches .styles.ts files",
                },
                {
                  route: "Figma extraction",
                  flow: (
                    <div className="flex items-center gap-gp-md">
                      <span style={{ color: COLORS.designer }}>Designer</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span className="text-fg-default font-semibold">[GATE]</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span style={{ color: COLORS.dev }}>Dev</span>
                    </div>
                  ),
                  desc: "Extract and implement design from Figma",
                },
                {
                  route: "Spec only",
                  flow: (
                    <div className="flex items-center gap-gp-md">
                      <span style={{ color: COLORS.designer }}>Designer</span>
                    </div>
                  ),
                  desc: "Design exploration, no implementation",
                },
              ].map((row) => (
                <tr key={row.route} className="border-t border-border-subtle">
                  <td className="py-pad-md px-pad-xl text-body-md font-medium text-fg-default font-medium">
                    {row.route}
                  </td>
                  <td className="py-pad-md px-pad-xl text-code-sm font-mono">
                    {row.flow}
                  </td>
                  <td className="py-pad-md px-pad-xl text-body-md text-fg-muted">
                    {row.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DocLayout>
  );
}
