import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "role", label: "Role" },
  { id: "anti-collision", label: "Anti-Collision Prefixes" },
  { id: "focus-ring", label: "Focus Ring Patterns" },
  { id: "component-structure", label: "Component Structure" },
  { id: "prohibited", label: "Prohibited" },
  { id: "signals", label: "Signals" },
];

const ACCENT = "#10b981";

export function AgentDevDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Agents"
        title="DS Dev"
        description="Implements the spec received. Creates tokens, components (tv() + semantic classes), adapters."
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
            <h3 className="text-title-md font-semibold text-fg-default">DS Dev</h3>
            <Badge color="secondary" variant="outline" size="sm">claude-opus-4-6</Badge>
          </div>
          <p className="text-body-md text-fg-muted">
            Implements the spec received. Creates tokens, components (tv() + semantic classes), adapters.
          </p>
        </div>
      </div>

      {/* Role */}
      <SectionH2 id="role" title="Role" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          The DS Dev agent receives approved specs and turns them into working code.
          It creates token files, components using tv() with semantic classes, and
          transform adapters. After any token change, it always runs{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">npm run tokens:tw4</code>{" "}
          to regenerate the CSS.
        </p>
        <div className="grid grid-cols-2 gap-gp-2xl">
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-xs">Token Implementation</p>
            <p className="text-body-md text-fg-muted">
              Creates Tier 2 and 2.5 token files, runs the transform pipeline,
              and verifies generated CSS vars are correct.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-xs">Component Creation</p>
            <p className="text-body-md text-fg-muted">
              Builds .styles.ts, .tsx, .types.ts, and barrel exports following
              the exact spec from the Designer.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl col-span-2">
            <p className="text-body-md font-medium text-fg-default mb-gp-xs">Transform Adapters</p>
            <p className="text-body-md text-fg-muted">
              Maintains to-tailwind-v4.ts and Shadcn adapter mappings so that
              all tokens are consumable as CSS vars and Tailwind classes.
            </p>
          </div>
        </div>
      </div>

      {/* Anti-Collision Prefixes */}
      <SectionH2 id="anti-collision" title="Anti-Collision Prefixes" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          All DS tokens use prefixed CSS variables to avoid overriding Tailwind
          built-in utilities. Using unprefixed classes will break the native scale.
        </p>
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-subtle">
                <th className="text-left text-body-xs text-fg-muted font-medium py-pad-md px-pad-xl">Token</th>
                <th className="text-left text-body-xs text-fg-muted font-medium py-pad-md px-pad-xl">CSS Var</th>
                <th className="text-left text-body-xs text-fg-muted font-medium py-pad-md px-pad-xl">Class</th>
                <th className="text-left text-body-xs text-fg-muted font-medium py-pad-md px-pad-xl">Avoids</th>
              </tr>
            </thead>
            <tbody>
              {[
                { token: "space", cssVar: "--spacing-sp-*", cls: "p-sp-md", avoids: "p-4 (numeric)" },
                { token: "gap", cssVar: "--spacing-gp-*", cls: "gap-gp-md", avoids: "gap-4 (numeric)" },
                { token: "pad", cssVar: "--spacing-pad-*", cls: "px-pad-xl", avoids: "px-3 (numeric)" },
                { token: "radius", cssVar: "--radius-radius-*", cls: "rounded-radius-base", avoids: "rounded-lg" },
                { token: "shadow", cssVar: "--shadow-sh-*", cls: "shadow-sh-md", avoids: "shadow-md" },
                { token: "comp", cssVar: "--spacing-comp-*", cls: "h-comp-lg", avoids: "h-10 (numeric)" },
                { token: "form", cssVar: "--spacing-form-*", cls: "min-h-form-lg", avoids: "h-10 / h-11" },
                { token: "icon", cssVar: "--spacing-icon-*", cls: "size-icon-md", avoids: "size-5 (numeric)" },
              ].map((row) => (
                <tr key={row.token} className="border-t border-border-subtle">
                  <td className="py-pad-md px-pad-xl text-body-md text-fg-default font-mono">{row.token}</td>
                  <td className="py-pad-md px-pad-xl text-body-md text-fg-default font-mono">{row.cssVar}</td>
                  <td className="py-pad-md px-pad-xl text-body-md text-fg-default font-mono">{row.cls}</td>
                  <td className="py-pad-md px-pad-xl text-body-md text-fg-muted">{row.avoids}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Focus Ring Patterns */}
      <SectionH2 id="focus-ring" title="Focus Ring Patterns" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Two focus ring patterns are used throughout the system. Using the wrong
          pattern will trigger a REVIEW_FAILED from the Reviewer.
        </p>
        <div className="grid grid-cols-2 gap-gp-2xl">
          <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-2xl">
              Pattern 1 — Static (buttons, selects)
            </p>
            <div className="rounded-radius-sm bg-bg-subtle p-pad-2xl font-mono text-code-sm text-fg-muted leading-relaxed">
              <p>focus-visible:outline-none</p>
              <p>focus-visible:ring-4</p>
              <p>focus-visible:ring-ring-brand</p>
            </div>
            <p className="text-caption-sm text-fg-subtle mt-gp-xl">
              Applied directly. No transition. Instant ring on focus.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-2xl">
              Pattern 2 — Animated (inputs, textareas)
            </p>
            <div className="rounded-radius-sm bg-bg-subtle p-pad-2xl font-mono text-code-sm text-fg-muted leading-relaxed">
              <p className="text-fg-subtle">{"// base"}</p>
              <p>ring-0 ring-ring-brand</p>
              <p>transition-[color,box-shadow,</p>
              <p className="ml-sp-md">background-color]</p>
              <p>focus-visible:outline-none</p>
              <p className="text-fg-subtle mt-gp-md">{"// focus state"}</p>
              <p>focus-visible:ring-4</p>
            </div>
            <p className="text-caption-sm text-fg-subtle mt-gp-xl">
              Smooth transition from ring-0 to ring-4. Ring color is pre-set in base.
            </p>
          </div>
        </div>
      </div>

      {/* Component Structure */}
      <SectionH2 id="component-structure" title="Component Structure" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Every iGreen component follows this file structure. Deviating from it
          will cause a Reviewer rejection.
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <div className="font-mono text-code-sm leading-loose">
            {[
              { depth: 0, name: "ui/[Name]/", isDir: true },
              { depth: 1, name: "[name].styles.ts", desc: "visual source of truth (tv())" },
              { depth: 1, name: "[name].tsx", desc: "logic and markup" },
              { depth: 1, name: "[name].types.ts", desc: "types and VariantProps" },
              { depth: 1, name: "index.ts", desc: "barrel export" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-gp-xl" style={{ paddingLeft: f.depth * 20 }}>
                <span className="text-fg-subtle shrink-0">{f.isDir ? "📁" : f.depth > 0 ? "├─" : ""}</span>
                <span className={f.isDir ? "text-fg-default font-semibold" : "text-fg-brand"}>{f.name}</span>
                {f.desc && <span className="text-fg-subtle">— {f.desc}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prohibited */}
      <SectionH2 id="prohibited" title="Prohibited" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-danger-muted/50 bg-bg-danger-muted p-pad-4xl">
          <h4 className="text-body-md font-medium text-fg-danger mb-gp-2xl">
            Violations below will always cause REVIEW_FAILED
          </h4>
          <div className="flex flex-col gap-gp-xl">
            {[
              "Zero hardcoded values — #fff, 16px, 0.875rem, 0.5 are all forbidden in components",
              "Never import tv from tailwind-variants — always from @/utils/tv",
              "Never ring-3 — does not exist in Tailwind, use ring-4",
              "Never ring-ring-brand/30 — alpha is built into the ring token, no opacity modifier",
              "Disabled compound must be LAST in compoundVariants array",
              "Never outline-none without focus-visible: prefix",
              "Never Tailwind literal when DS token exists — gap-4 -> gap-gp-md, p-4 -> p-sp-md, rounded-lg -> rounded-radius-lg",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-gp-xl">
                <span className="text-fg-danger mt-0.5 shrink-0">{"\u2715"}</span>
                <span className="text-body-md text-fg-muted">{item}</span>
              </div>
            ))}
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
                <td className="text-body-md py-pad-md px-pad-xl"><code className="font-mono text-code-sm text-fg-brand">SPEC_PRONTA: [name]</code> from Orchestrator gate</td>
              </tr>
              <tr className="border-b border-border-subtle">
                <td className="text-body-xs text-fg-muted font-medium uppercase tracking-wider py-pad-md px-pad-xl">Output</td>
                <td className="text-body-md py-pad-md px-pad-xl"><code className="font-mono text-code-sm text-fg-brand">IMPL_PRONTA: [name]</code> triggers DS Reviewer</td>
              </tr>
              <tr>
                <td className="text-body-xs text-fg-muted font-medium uppercase tracking-wider py-pad-md px-pad-xl">Files</td>
                <td className="py-pad-md px-pad-xl font-mono text-code-sm text-fg-muted">*.styles.ts, *.tsx, *.types.ts, to-tailwind-v4.ts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DocLayout>
  );
}
