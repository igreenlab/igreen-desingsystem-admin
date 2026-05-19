import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "role", label: "Role" },
  { id: "checklists", label: "Checklists" },
  { id: "signals", label: "Signals" },
];

const ACCENT = "#3b82f6";

export function AgentReviewerDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Agents"
        title="DS Reviewer"
        description="Validates tokens and components before merge. Has 4 specialized checklists."
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
            <h3 className="text-title-md font-semibold text-fg-default">DS Reviewer</h3>
            <Badge color="secondary" variant="outline" size="sm">claude-sonnet-4-6</Badge>
          </div>
          <p className="text-body-md text-fg-muted">
            Validates tokens and components before merge. Has 4 specialized checklists.
          </p>
        </div>
      </div>

      {/* Role */}
      <SectionH2 id="role" title="Role" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          The DS Reviewer is the quality gate before any token or component merges into
          the system. It runs 4 specialized checklists depending on the type of
          implementation received, and either approves with REVIEW_OK or rejects with
          REVIEW_FAILED plus a corrections list.
        </p>
        <div className="grid grid-cols-2 gap-gp-2xl">
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-xs">Quality Gate</p>
            <p className="text-body-md text-fg-muted">
              Every implementation must pass the Reviewer before merge. No exceptions,
              no skipping. Checks correctness, not aesthetics.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-xs">4 Checklists</p>
            <p className="text-body-md text-fg-muted">
              Semantic Token (8), Shadcn (7), iGreen Component (11), and Composite (7).
              The right checklist is selected based on implementation type.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl col-span-2">
            <p className="text-body-md font-medium text-fg-default mb-gp-xs">Approval / Rejection</p>
            <p className="text-body-md text-fg-muted">
              REVIEW_OK means the implementation can be merged. REVIEW_FAILED includes a
              numbered list of exact corrections needed. DS Dev must fix and re-submit.
            </p>
          </div>
        </div>
      </div>

      {/* Checklists */}
      <SectionH2 id="checklists" title="Checklists" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="grid grid-cols-2 gap-gp-2xl">
          {/* Semantic Token Checklist */}
          <div
            className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl"
            style={{ borderLeftWidth: 4, borderLeftColor: ACCENT }}
          >
            <h4 className="text-body-md font-medium text-fg-default mb-gp-2xl flex items-center gap-gp-md">
              Semantic Token <Badge color="secondary" variant="outline" size="sm">8 items</Badge>
            </h4>
            <div className="flex flex-col gap-gp-xl">
              {[
                "Naming follows {role}.{variant} pattern (e.g., bg.primary-subtle)",
                "Value references correct primitive — no hardcoded hex",
                "Dark mode equivalent exists in color-dark.ts",
                "bg.* has corresponding fg.on-* for text legibility",
                "Focus ring uses ring.* namespace, not border.*",
                "Typography values in rem or clamp(rem), never px",
                "npm run tokens:tw4 was run after changes",
                "Token inventory (component-inventory.md) updated",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-gp-xl">
                  <span className="text-fg-success mt-0.5 shrink-0">{"\u2713"}</span>
                  <span className="text-body-md text-fg-muted">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shadcn Component Checklist */}
          <div
            className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl"
            style={{ borderLeftWidth: 4, borderLeftColor: ACCENT }}
          >
            <h4 className="text-body-md font-medium text-fg-default mb-gp-2xl flex items-center gap-gp-md">
              Shadcn Component <Badge color="secondary" variant="outline" size="sm">7 items</Badge>
            </h4>
            <div className="flex flex-col gap-gp-xl">
              {[
                "File lives in shadcn/ directory, NOT ui/",
                "Zero hardcoded values — all reference DS CSS vars",
                "Original Radix primitives logic preserved",
                "h-* replaced with min-h-form-* for WCAG 2.5.5",
                "Dark mode works via CSS vars only",
                "Barrel exports created in shadcn/index.ts",
                "Focus rings follow correct pattern (ring-4, no opacity)",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-gp-xl">
                  <span className="text-fg-success mt-0.5 shrink-0">{"\u2713"}</span>
                  <span className="text-body-md text-fg-muted">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* iGreen Component Checklist — full width */}
          <div
            className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl col-span-2"
            style={{ borderLeftWidth: 4, borderLeftColor: ACCENT }}
          >
            <h4 className="text-body-md font-medium text-fg-default mb-gp-2xl flex items-center gap-gp-md">
              iGreen Component <Badge color="secondary" variant="outline" size="sm">11 items</Badge>
            </h4>
            <div className="grid grid-cols-2 gap-x-gp-4xl gap-y-gp-xl">
              {[
                "Structure: .tsx + .styles.ts + .types.ts + index.ts",
                "tv imported from @/utils/tv, never tailwind-variants",
                "Zero hardcoded values in components",
                "Typography uses presets (text-body-md font-medium), never raw",
                "Touch target >= 44px (min-h-form-xl for WCAG 2.5.5)",
                "Correct focus ring pattern (static / animated)",
                "No ring opacity modifier (never /30)",
                "Base has border border-transparent",
                "Disabled compound is LAST in compoundVariants",
                "type=\"button\" on all button elements",
                "DS class prefixes used (gap-gp-*, p-sp-*, rounded-radius-*)",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-gp-xl">
                  <span className="text-fg-success mt-0.5 shrink-0">{"\u2713"}</span>
                  <span className="text-body-md text-fg-muted">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Composite Component Checklist */}
          <div
            className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl col-span-2"
            style={{ borderLeftWidth: 4, borderLeftColor: ACCENT }}
          >
            <h4 className="text-body-md font-medium text-fg-default mb-gp-2xl flex items-center gap-gp-md">
              Composite Component <Badge color="secondary" variant="outline" size="sm">7 items</Badge>
            </h4>
            <div className="grid grid-cols-2 gap-x-gp-4xl gap-y-gp-xl">
              {[
                "Clean API surface — minimal required props, sensible defaults",
                "aria-* attributes present for screen readers",
                "Slot-based tv() — separate slots for each sub-component",
                "USAGE.md with at least 3 examples (basic, error, disabled)",
                "Composed components imported, not duplicated",
                "Ref forwarding works to primary interactive element",
                "Error and validation states visually distinct and exposed",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-gp-xl">
                  <span className="text-fg-success mt-0.5 shrink-0">{"\u2713"}</span>
                  <span className="text-body-md text-fg-muted">{item}</span>
                </div>
              ))}
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
                <td className="text-body-md py-pad-md px-pad-xl"><code className="font-mono text-code-sm text-fg-brand">IMPL_PRONTA: [name]</code> from DS Dev</td>
              </tr>
              <tr className="border-b border-border-subtle">
                <td className="text-body-xs text-fg-muted font-medium uppercase tracking-wider py-pad-md px-pad-xl">Output</td>
                <td className="text-body-md py-pad-md px-pad-xl"><code className="font-mono text-code-sm text-fg-success">REVIEW_OK</code> or <code className="font-mono text-code-sm text-fg-danger">REVIEW_FAILED</code></td>
              </tr>
              <tr>
                <td className="text-body-xs text-fg-muted font-medium uppercase tracking-wider py-pad-md px-pad-xl">Files</td>
                <td className="py-pad-md px-pad-xl font-mono text-code-sm text-fg-muted">coding-standards.md, lessons.md, component source files</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DocLayout>
  );
}
