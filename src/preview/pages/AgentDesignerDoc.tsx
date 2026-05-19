import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "role", label: "Role" },
  { id: "naming-rules", label: "Naming Rules" },
  { id: "task-types", label: "Task Types" },
  { id: "signals", label: "Signals" },
];

const ACCENT = "#f59e0b";

export function AgentDesignerDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Agents"
        title="DS Designer"
        description="Specifies semantic tokens and component styles. Never generates code — delivers specs in markdown."
      />
      <DocSeparator />

      {/* Agent Hero Card */}
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
            <h3 className="text-title-md font-semibold text-fg-default">DS Designer</h3>
            <Badge color="secondary" variant="outline" size="sm">claude-sonnet-4-6</Badge>
          </div>
          <p className="text-body-md text-fg-muted">
            Specifies semantic tokens and component styles. Never generates code — delivers specs in markdown.
          </p>
        </div>
      </div>

      {/* Role */}
      <SectionH2 id="role" title="Role" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          The DS Designer agent owns the specification layer. It defines semantic tokens,
          component variants, sizing, states, and accessibility rules — but never writes
          implementation code. All output is structured markdown that DS Dev can directly implement.
        </p>
        <div className="grid grid-cols-2 gap-gp-2xl">
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-xs">Token Specification</p>
            <p className="text-body-md text-fg-muted">
              Defines semantic color, spacing, sizing, shape, and elevation tokens with
              exact naming, values, and dark mode equivalents.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-xs">Component Specs</p>
            <p className="text-body-md text-fg-muted">
              Produces full variant matrices (color x variant x size), accessibility rules,
              focus rings, and semantic class assignments.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl col-span-2">
            <p className="text-body-md font-medium text-fg-default mb-gp-xs">Figma Extraction</p>
            <p className="text-body-md text-fg-muted">
              Inventories all visual values from Figma designs, maps them to existing
              tokens, and flags gaps that need new token creation.
            </p>
          </div>
        </div>
      </div>

      {/* Naming Rules */}
      <SectionH2 id="naming-rules" title="Naming Rules" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          These naming conventions are enforced by the Designer and validated by the Reviewer.
          Incorrect names will cause a REVIEW_FAILED rejection.
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <div className="flex items-start gap-gp-3xl py-pad-xl border-b border-border-subtle">
            <span className="text-body-xs text-fg-muted w-[120px] shrink-0 uppercase tracking-wider">primary</span>
            <span className="text-body-md text-fg-default">
              Brand color. NOT "main text" — that is fg.foreground.
            </span>
          </div>
          <div className="flex items-start gap-gp-3xl py-pad-xl border-b border-border-subtle">
            <span className="text-body-xs text-fg-muted w-[120px] shrink-0 uppercase tracking-wider">fg.foreground</span>
            <span className="text-body-md text-fg-default">
              Default text color (neutral). The base foreground for all body text.
            </span>
          </div>
          <div className="flex items-start gap-gp-3xl py-pad-xl border-b border-border-subtle">
            <span className="text-body-xs text-fg-muted w-[120px] shrink-0 uppercase tracking-wider">critical</span>
            <span className="text-body-md text-fg-default">
              Destructive / error feedback. Never use "danger" or "error" as token names.
            </span>
          </div>
          <div className="flex items-start gap-gp-3xl py-pad-xl border-b border-border-subtle">
            <span className="text-body-xs text-fg-muted w-[120px] shrink-0 uppercase tracking-wider">ring.*</span>
            <span className="text-body-md text-fg-default">
              Focus rings for accessibility. NOT border.* — rings and borders are separate systems.
            </span>
          </div>
          <div className="flex items-start gap-gp-3xl py-pad-xl">
            <span className="text-body-xs text-fg-muted w-[120px] shrink-0 uppercase tracking-wider">on-*</span>
            <span className="text-body-md text-fg-default">
              Text on colored backgrounds (e.g., fg.on-primary over bg.primary).
            </span>
          </div>
        </div>
      </div>

      {/* Task Types */}
      <SectionH2 id="task-types" title="Task Types" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          For each type of task, the Designer follows a specific workflow and produces
          a different output format.
        </p>
        <div className="grid grid-cols-2 gap-gp-2xl">
          {/* New Color */}
          <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
            <div className="flex items-center gap-gp-xl mb-gp-2xl">
              <span
                className="inline-flex items-center justify-center size-icon-lg rounded-radius-sm text-body-xs font-bold text-white"
                style={{ backgroundColor: ACCENT }}
              >
                1
              </span>
              <p className="text-body-md font-medium text-fg-default">New Color</p>
            </div>
            <div className="flex flex-col gap-gp-xl text-body-md text-fg-muted">
              <p>1. Check that the primitive exists in color-palette.ts</p>
              <p>2. Specify role, token name, light value, dark value</p>
              <p>3. Ensure bg.* has corresponding fg.on-* and border.* tokens</p>
              <p>4. Output diff-style markdown with exact additions</p>
            </div>
          </div>

          {/* New Dimensional Token */}
          <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
            <div className="flex items-center gap-gp-xl mb-gp-2xl">
              <span
                className="inline-flex items-center justify-center size-icon-lg rounded-radius-sm text-body-xs font-bold text-white"
                style={{ backgroundColor: ACCENT }}
              >
                2
              </span>
              <p className="text-body-md font-medium text-fg-default">New Dimensional Token</p>
            </div>
            <div className="flex flex-col gap-gp-xl text-body-md text-fg-muted">
              <p>1. Check if the value fits an existing scale step</p>
              <p>2. Verify new step follows the base-4 progression</p>
              <p>3. Specify token name, value in rem, and prefix</p>
              <p>4. Output diff-style markdown with the new entry</p>
            </div>
          </div>

          {/* Component Spec */}
          <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
            <div className="flex items-center gap-gp-xl mb-gp-2xl">
              <span
                className="inline-flex items-center justify-center size-icon-lg rounded-radius-sm text-body-xs font-bold text-white"
                style={{ backgroundColor: ACCENT }}
              >
                3
              </span>
              <p className="text-body-md font-medium text-fg-default">Component Spec</p>
            </div>
            <div className="flex flex-col gap-gp-xl text-body-md text-fg-muted">
              <p>1. Define the full variant matrix: color x variant x size</p>
              <p>2. Specify a11y rules: ring-4, min-h-form-xl, disabled last</p>
              <p>3. List semantic classes for each compound variant</p>
              <p>4. Output spec markdown with variants table and rules</p>
            </div>
          </div>

          {/* Figma Extraction */}
          <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
            <div className="flex items-center gap-gp-xl mb-gp-2xl">
              <span
                className="inline-flex items-center justify-center size-icon-lg rounded-radius-sm text-body-xs font-bold text-white"
                style={{ backgroundColor: ACCENT }}
              >
                4
              </span>
              <p className="text-body-md font-medium text-fg-default">Figma Extraction</p>
            </div>
            <div className="flex flex-col gap-gp-xl text-body-md text-fg-muted">
              <p>1. Inventory all colors, spacing, typography from the design</p>
              <p>2. Map each value to an existing token or flag as a gap</p>
              <p>3. Identify missing tokens that need creation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Signals */}
      <SectionH2 id="signals" title="Signals" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <table className="w-full">
            <tbody>
              <tr className="border-b border-border-subtle">
                <td className="text-body-xs text-fg-muted font-medium uppercase tracking-wider py-pad-md px-pad-xl w-[100px]">Input</td>
                <td className="text-body-md text-fg-default py-pad-md px-pad-xl">Task delegation from Orchestrator</td>
              </tr>
              <tr className="border-b border-border-subtle">
                <td className="text-body-xs text-fg-muted font-medium uppercase tracking-wider py-pad-md px-pad-xl">Output</td>
                <td className="text-body-md py-pad-md px-pad-xl"><code className="font-mono text-code-sm text-fg-brand">SPEC_PRONTA: [name]</code></td>
              </tr>
              <tr>
                <td className="text-body-xs text-fg-muted font-medium uppercase tracking-wider py-pad-md px-pad-xl">Files</td>
                <td className="py-pad-md px-pad-xl font-mono text-code-sm text-fg-muted">tokens-color.md, tokens-spacing.md, component-guide.md</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DocLayout>
  );
}
