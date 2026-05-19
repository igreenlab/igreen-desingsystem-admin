import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "role", label: "Role" },
  { id: "routing", label: "Routing Table" },
  { id: "signals", label: "Signals" },
  { id: "gate", label: "Gate System" },
  { id: "cascade", label: "Cascade Detection" },
];

const ACCENT = "#6366f1";

const COLORS = {
  designer: "#f59e0b",
  dev: "#10b981",
  reviewer: "#3b82f6",
};

/* ── page ─────────────────────────────────────────────────────── */

export function AgentOrchestratorDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Agents"
        title="Orchestrator"
        description="The hub of the pipeline — receives every task, classifies the domain, and delegates to the right specialist agent."
      />
      <DocSeparator />

      {/* ── Hero Card ─────────────────────────────────────────── */}
      <div
        className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl mb-14 flex items-start gap-gp-3xl"
        style={{ borderLeftWidth: 4, borderLeftColor: ACCENT }}
      >
        <div
          className="w-10 h-10 rounded-radius-lg flex items-center justify-center shrink-0"
          style={{ background: ACCENT + "15" }}
        >
          <div className="w-3 h-3 rounded-full" style={{ background: ACCENT }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-gp-xl mb-gp-xs">
            <h3 className="text-title-md font-semibold text-fg-default">Orchestrator</h3>
            <Badge color="secondary" variant="outline" size="sm">claude-sonnet-4-6</Badge>
          </div>
          <p className="text-body-md text-fg-muted">
            Classifies &middot; Delegates
          </p>
        </div>
      </div>

      {/* ── Role ──────────────────────────────────────────────── */}
      <SectionH2 id="role" title="Role" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <p className="text-body-md text-fg-muted">
            The Orchestrator is the{" "}
            <strong className="text-fg-default">entry point</strong> for every
            task in the pipeline. It never executes work directly — its job is to
            understand the user&apos;s intent, classify the domain, select the optimal
            route, and delegate to the right specialist agent. Even tasks that go
            directly to Dev are first classified and routed by the Orchestrator.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-gp-2xl">
          {[
            {
              title: "Domain Classification",
              desc: "Reads the task description and determines the domain: color token, new component, visual edit, Figma extraction, or token change.",
            },
            {
              title: "Route Selection",
              desc: "Selects the shortest pipeline route that satisfies the task. Full pipeline for new components, Dev-only for visual edits.",
            },
            {
              title: "Cascade Detection",
              desc: "Identifies when a task depends on tokens or components that do not exist yet, and triggers their creation first.",
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

      {/* ── Routing Table ─────────────────────────────────────── */}
      <SectionH2 id="routing" title="Routing Table" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          The Orchestrator matches the task description to one of these routing
          rules. Each row shows the task type, the agents involved, and the
          context files loaded.
        </p>

        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-subtle">
                <th className="text-left text-body-xs text-fg-muted font-medium py-pad-md px-pad-xl">
                  Task
                </th>
                <th className="text-left text-body-xs text-fg-muted font-medium py-pad-md px-pad-xl">
                  Route
                </th>
                <th className="text-left text-body-xs text-fg-muted font-medium py-pad-md px-pad-xl">
                  Context Files
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  task: "New iGreen component",
                  route: (
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
                  context: "component-guide.md",
                },
                {
                  task: "New semantic color",
                  route: (
                    <div className="flex items-center gap-gp-md">
                      <span style={{ color: COLORS.designer }}>Designer</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span style={{ color: COLORS.dev }}>Dev</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span style={{ color: COLORS.reviewer }}>Reviewer</span>
                    </div>
                  ),
                  context: "tokens-color.md",
                },
                {
                  task: "New spacing / gap",
                  route: (
                    <div className="flex items-center gap-gp-md">
                      <span style={{ color: COLORS.designer }}>Designer</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span style={{ color: COLORS.dev }}>Dev</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span style={{ color: COLORS.reviewer }}>Reviewer</span>
                    </div>
                  ),
                  context: "tokens-spacing.md",
                },
                {
                  task: "Shadcn component",
                  route: (
                    <div className="flex items-center gap-gp-md">
                      <span style={{ color: COLORS.dev }}>Dev</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span style={{ color: COLORS.reviewer }}>Reviewer</span>
                    </div>
                  ),
                  context: "shadcn-token-map.md",
                },
                {
                  task: "Visual edit",
                  route: (
                    <div className="flex items-center gap-gp-md">
                      <span style={{ color: COLORS.dev }}>Dev</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span style={{ color: COLORS.reviewer }}>Reviewer</span>
                    </div>
                  ),
                  context: "component-guide.md",
                },
                {
                  task: "Figma extraction",
                  route: (
                    <div className="flex items-center gap-gp-md">
                      <span style={{ color: COLORS.designer }}>Designer</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span className="text-fg-default font-semibold">[GATE]</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span style={{ color: COLORS.dev }}>Dev</span>
                    </div>
                  ),
                  context: "tokens-color.md, component-guide.md",
                },
                {
                  task: "New typography preset",
                  route: (
                    <div className="flex items-center gap-gp-md">
                      <span style={{ color: COLORS.designer }}>Designer</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span style={{ color: COLORS.dev }}>Dev</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span style={{ color: COLORS.reviewer }}>Reviewer</span>
                    </div>
                  ),
                  context: "tokens-typography.md",
                },
                {
                  task: "New radius / shadow",
                  route: (
                    <div className="flex items-center gap-gp-md">
                      <span style={{ color: COLORS.designer }}>Designer</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span style={{ color: COLORS.dev }}>Dev</span>
                      <span className="text-fg-subtle">&rarr;</span>
                      <span style={{ color: COLORS.reviewer }}>Reviewer</span>
                    </div>
                  ),
                  context: "tokens-sizing-shape-elevation.md",
                },
              ].map((row) => (
                <tr key={row.task} className="border-t border-border-subtle">
                  <td className="py-pad-md px-pad-xl text-body-md text-fg-default">
                    {row.task}
                  </td>
                  <td className="py-pad-md px-pad-xl text-code-sm font-mono">
                    {row.route}
                  </td>
                  <td className="py-pad-md px-pad-xl text-code-sm text-fg-brand font-mono">
                    {row.context}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Signals ───────────────────────────────────────────── */}
      <SectionH2 id="signals" title="Signals" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <table className="w-full">
            <tbody>
              <tr className="border-b border-border-subtle">
                <td className="text-body-xs text-fg-muted font-medium uppercase tracking-wider py-pad-md px-pad-xl w-[100px]">Input</td>
                <td className="text-body-md text-fg-default py-pad-md px-pad-xl">User task in natural language</td>
              </tr>
              <tr className="border-b border-border-subtle">
                <td className="text-body-xs text-fg-muted font-medium uppercase tracking-wider py-pad-md px-pad-xl">Output</td>
                <td className="text-body-md py-pad-md px-pad-xl"><code className="font-mono text-code-sm text-fg-brand">→ Delegating to [agent]</code></td>
              </tr>
              <tr>
                <td className="text-body-xs text-fg-muted font-medium uppercase tracking-wider py-pad-md px-pad-xl">Files</td>
                <td className="py-pad-md px-pad-xl flex flex-wrap gap-gp-md"><code className="font-mono text-code-sm text-fg-muted">CLAUDE.md</code> <code className="font-mono text-code-sm text-fg-muted">.ai/lessons.md</code> <code className="font-mono text-code-sm text-fg-muted">ds-standards.md</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Gate System ───────────────────────────────────────── */}
      <SectionH2 id="gate" title="Gate System" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <div className="grid gap-gp-3xl">
            {[
              {
                step: "1",
                title: "Designer emits SPEC_PRONTA",
                desc: "The spec is complete and ready for review. No code has been written yet.",
              },
              {
                step: "2",
                title: "Orchestrator presents spec to user",
                desc: "The full specification is shown so the user can evaluate before committing to implementation.",
              },
              {
                step: "3",
                title: "User approves or requests changes",
                desc: "The pipeline is blocked until the user explicitly approves. Changes loop back to the Designer.",
              },
              {
                step: "4",
                title: "Dev begins implementation",
                desc: "Only after approval does the Dev agent start writing code, preventing wasted work on rejected specs.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-gp-2xl">
                <div
                  className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-body-md font-medium font-semibold text-white"
                  style={{ backgroundColor: ACCENT }}
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

      {/* ── Cascade Detection ─────────────────────────────────── */}
      <SectionH2 id="cascade" title="Cascade Detection" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <p className="text-body-md text-fg-muted mb-gp-3xl">
            When a task requires tokens or components that do not exist yet, the
            Orchestrator detects the dependency and triggers a sub-pipeline
            before resuming the original task.
          </p>

          <div className="grid gap-gp-3xl mb-gp-3xl">
            {[
              {
                step: "1",
                title: "Dependency detected",
                desc: "The Orchestrator identifies that the task references tokens or components not yet in the system.",
              },
              {
                step: "2",
                title: "Original task paused",
                desc: "The primary pipeline is suspended to avoid referencing non-existent dependencies.",
              },
              {
                step: "3",
                title: "Sub-pipeline triggered",
                desc: "A new pipeline is started to create the missing dependency (token, component, etc.).",
              },
              {
                step: "4",
                title: "Original task resumed",
                desc: "Once the dependency passes review, the original pipeline resumes from where it was paused.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-gp-2xl">
                <div
                  className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-body-md font-medium font-semibold text-white"
                  style={{ backgroundColor: ACCENT }}
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

          {/* Example scenario */}
          <div className="rounded-radius-base bg-bg-subtle p-pad-3xl">
            <p className="text-body-xs text-fg-subtle uppercase tracking-wider mb-gp-md">
              Example scenario
            </p>
            <p className="text-body-md text-fg-muted">
              User asks for a{" "}
              <code className="font-mono text-code-sm bg-bg-surface px-pad-sm rounded-radius-sm">StatusIndicator</code>{" "}
              component that uses a new{" "}
              <code className="font-mono text-code-sm bg-bg-surface px-pad-sm rounded-radius-sm">bg.info</code>{" "}
              color token. The Orchestrator detects that{" "}
              <code className="font-mono text-code-sm bg-bg-surface px-pad-sm rounded-radius-sm">bg.info</code>{" "}
              does not exist in{" "}
              <code className="font-mono text-code-sm bg-bg-surface px-pad-sm rounded-radius-sm">color-light.ts</code>,
              pauses the component task, and first routes a token-creation task through{" "}
              <span style={{ color: COLORS.designer }}>Designer</span>
              <span className="text-fg-subtle"> &rarr; </span>
              <span style={{ color: COLORS.dev }}>Dev</span>
              <span className="text-fg-subtle"> &rarr; </span>
              <span style={{ color: COLORS.reviewer }}>Reviewer</span>.
              Once the token passes review, the component pipeline resumes.
            </p>
          </div>
        </div>
      </div>
    </DocLayout>
  );
}
