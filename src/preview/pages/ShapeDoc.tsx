import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "radius", label: "Border Radius" },
  { id: "knob", label: "Radius Knob" },
  { id: "border-width", label: "Border Width" },
  { id: "outline", label: "Outline (Focus)" },
];

const RADIUS = [
  { step: "none", px: "0", mult: "0" },
  { step: "xs", px: "4", mult: "0.4" },
  { step: "sm", px: "6", mult: "0.6" },
  { step: "md", px: "8", mult: "0.8" },
  { step: "lg", px: "10", mult: "1.0 (knob)" },
  { step: "xl", px: "14", mult: "1.4" },
  { step: "2xl", px: "18", mult: "1.8" },
  { step: "3xl", px: "22", mult: "2.2" },
  { step: "base", px: "26", mult: "2.6 (default)" },
  { step: "4xl", px: "26", mult: "2.6" },
  { step: "full", px: "9999", mult: "pill" },
];

export function ShapeDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Foundations" title="Shape & Radius" description="Border radius knob system, border widths, and outline tokens. The radius knob scales the entire system proportionally." />
      <DocSeparator />

      {/* Radius */}
      <SectionH2 id="radius" title="Border Radius" />
      <p className="text-body-md text-fg-muted mb-gp-4xl">
        Multiplicative scale based on <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">RADIUS_BASE = 0.625rem (10px)</code>.
        Prefix: <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">radius-</code>
      </p>
      <div className="grid grid-cols-4 gap-gp-4xl mb-14">
        {RADIUS.map(r => (
          <div key={r.step} className="flex flex-col items-center gap-gp-lg">
            <div
              className="size-16 bg-bg-brand/20 border-2 border-border-brand"
              style={{ borderRadius: r.px === "9999" ? "9999px" : `${r.px}px` }}
            />
            <div className="text-center">
              <p className="text-body-xs text-fg-default">{r.step}</p>
              <p className="text-caption-sm text-fg-subtle">{r.px}px</p>
              <Badge color="secondary" variant="outline" size="sm" className="font-mono mt-gp-xs">×{r.mult}</Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Knob */}
      <div id="knob" className="mb-14 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-4xl">Radius Knob</h3>
        <div className="bg-bg-subtle rounded-radius-2xl p-pad-4xl">
          <p className="text-body-md text-fg-muted mb-gp-2xl">Changing <code className="font-mono text-code-sm bg-bg-muted px-pad-sm py-pad-2xs rounded-radius-md">RADIUS_BASE</code> in <code className="font-mono text-code-sm bg-bg-muted px-pad-sm py-pad-2xs rounded-radius-md">shape.ts</code> scales every radius proportionally.</p>
          <div className="font-mono text-code-sm text-fg-default bg-bg-surface rounded-radius-xl p-pad-2xl">
            <p>export const RADIUS_BASE = "0.625rem"; // 10px</p>
            <p className="text-fg-muted mt-gp-md">// radius.base = RADIUS_BASE × 2.6 = 26px</p>
            <p className="text-fg-muted">// radius.lg  = RADIUS_BASE × 1.0 = 10px</p>
            <p className="text-fg-muted">// radius.sm  = RADIUS_BASE × 0.6 = 6px</p>
          </div>
        </div>
      </div>

      {/* Border Width */}
      <SectionH2 id="border-width" title="Border Width" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        {[
          { name: "none", px: "0", use: "No border" },
          { name: "xs", px: "1px", use: "Default — separators, inputs, cards" },
          { name: "sm", px: "2px", use: "Emphasis — focus, hover outline" },
          { name: "md", px: "4px", use: "Strong — accent, progress" },
        ].map(b => (
          <div key={b.name} className="flex items-center gap-gp-xl">
            <div className="w-24 border-border-brand" style={{ borderBottomWidth: b.px, borderBottomStyle: "solid" }} />
            <span className="text-body-xs text-fg-default w-12">{b.name}</span>
            <span className="text-caption-sm text-fg-subtle">{b.px}</span>
            <span className="text-caption-sm text-fg-muted">{b.use}</span>
          </div>
        ))}
      </div>

      {/* Outline */}
      <SectionH2 id="outline" title="Outline (Focus Ring)" />
      <div className="bg-bg-subtle rounded-radius-2xl p-pad-4xl mb-14">
        <p className="text-body-md text-fg-muted mb-gp-2xl">Focus rings use <code className="font-mono text-code-sm bg-bg-muted px-pad-sm py-pad-2xs rounded-radius-md">ring-4</code> with semantic ring color tokens. Two patterns:</p>
        <div className="grid grid-cols-2 gap-gp-4xl mt-gp-4xl">
          <div>
            <p className="text-body-xs text-fg-default mb-gp-md">Static (buttons, selects)</p>
            <div className="font-mono text-code-sm text-fg-muted bg-bg-surface rounded-radius-xl p-pad-2xl">
              focus-visible:ring-4<br />focus-visible:ring-ring-brand
            </div>
          </div>
          <div>
            <p className="text-body-xs text-fg-default mb-gp-md">Animated (inputs)</p>
            <div className="font-mono text-code-sm text-fg-muted bg-bg-surface rounded-radius-xl p-pad-2xl">
              ring-0 ring-ring-brand<br />focus-visible:ring-4
            </div>
          </div>
        </div>
      </div>
    </DocLayout>
  );
}
