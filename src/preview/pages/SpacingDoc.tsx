import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "unified-scale", label: "Unified Scale" },
  { id: "space", label: "Space" },
  { id: "gap", label: "Gap" },
  { id: "pad", label: "Pad" },
  { id: "radius", label: "Radius" },
  { id: "shadows", label: "Shadows" },
];

const UNIFIED_SCALE = [
  { step: "2xs", px: 2 }, { step: "xs", px: 4 }, { step: "sm", px: 6 },
  { step: "md", px: 8 }, { step: "lg", px: 10 }, { step: "xl", px: 12 },
  { step: "2xl", px: 16 }, { step: "3xl", px: 20 }, { step: "4xl", px: 24 },
  { step: "5xl", px: 28 }, { step: "6xl", px: 32 }, { step: "7xl", px: 48 },
];

const RADIUS_SCALE = [
  { step: "none", px: "0", mult: "0" },
  { step: "xs", px: "4", mult: "0.4" },
  { step: "sm", px: "6", mult: "0.6" },
  { step: "md", px: "8", mult: "0.8" },
  { step: "lg", px: "10", mult: "1.0" },
  { step: "xl", px: "14", mult: "1.4" },
  { step: "2xl", px: "18", mult: "1.8" },
  { step: "3xl", px: "22", mult: "2.2" },
  { step: "base", px: "26", mult: "2.6" },
  { step: "4xl", px: "26", mult: "2.6" },
  { step: "full", px: "9999", mult: "—" },
];

const SHADOWS = ["none", "base", "sm", "md", "lg", "xl", "2xl", "3xl"];

function SpacingBar({ step, px, prefix }: { step: string; px: number; prefix: string }) {
  return (
    <div className="flex items-center gap-gp-xl">
      <span className="text-caption-sm font-mono text-fg-muted w-16 text-right">{step}</span>
      <div className="bg-bg-brand rounded-radius-xs" style={{ width: `${px * 2}px`, height: 12 }} />
      <span className="text-caption-sm text-fg-subtle">{px}px</span>
      <Badge color="secondary" variant="outline" size="sm" className="font-mono">{prefix}-{step}</Badge>
    </div>
  );
}

export function SpacingDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Foundations"
        title="Spacing & Shape"
        description="Unified spacing scale shared across space, gap and pad tokens. Radius uses a multiplicative knob system."
      />

      <DocSeparator />

      {/* ── Unified Scale ─────────────────────────────────────────── */}
      <SectionH2 id="unified-scale" title="Unified Scale" />
      <p className="text-body-md text-fg-muted mb-gp-4xl">
        All three spacing roles (space, gap, pad) share the same value scale: 2 4 6 8 10 12 16 20 24 28 32 48.
        The prefix differentiates the role in CSS classes.
      </p>

      <div id="space" className="mb-14 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">Space</h3>
        <p className="text-body-md text-fg-muted mb-gp-4xl">Generic spacing for margin, padding, offsets. Base: 16px. Prefix: <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">sp-</code></p>
        <div className="flex flex-col gap-gp-xl">
          {UNIFIED_SCALE.map(s => <SpacingBar key={`sp-${s.step}`} step={s.step} px={s.px} prefix="sp" />)}
        </div>
      </div>

      <div id="gap" className="mb-14 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">Gap</h3>
        <p className="text-body-md text-fg-muted mb-gp-4xl">Between flex/grid children. Base: 24px. Prefix: <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">gp-</code></p>
        <div className="flex flex-col gap-gp-xl">
          {UNIFIED_SCALE.map(s => <SpacingBar key={`gp-${s.step}`} step={s.step} px={s.px} prefix="gp" />)}
        </div>
      </div>

      <div id="pad" className="mb-14 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">Pad</h3>
        <p className="text-body-md text-fg-muted mb-gp-4xl">Component internal padding. Base: 12px. Prefix: <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">pad-</code></p>
        <div className="flex flex-col gap-gp-xl">
          {UNIFIED_SCALE.map(s => <SpacingBar key={`pad-${s.step}`} step={s.step} px={s.px} prefix="pad" />)}
        </div>
      </div>

      {/* ── Radius ────────────────────────────────────────────────── */}
      <SectionH2 id="radius" title="Border Radius" />
      <p className="text-body-md text-fg-muted mb-gp-4xl">
        Multiplicative scale based on <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">RADIUS_BASE = 0.625rem (10px)</code>.
        Changing the base scales the entire system.
      </p>

      <div className="grid grid-cols-3 gap-gp-2xl mb-14">
        {RADIUS_SCALE.map(r => (
          <div key={r.step} className="flex flex-col items-center gap-gp-md">
            <div
              className="size-16 bg-bg-brand/20 border-2 border-border-brand"
              style={{ borderRadius: r.px === "9999" ? "9999px" : `${r.px}px` }}
            />
            <div className="text-center">
              <p className="text-body-xs text-fg-default">{r.step}</p>
              <p className="text-caption-sm text-fg-subtle">{r.px}px · ×{r.mult}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Shadows ───────────────────────────────────────────────── */}
      <SectionH2 id="shadows" title="Shadows" />
      <p className="text-body-md text-fg-muted mb-gp-4xl">
        Elevation levels from none to 3xl. Prefix: <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">sh-</code>
      </p>

      <div className="grid grid-cols-4 gap-gp-4xl">
        {SHADOWS.map(s => (
          <div key={s} className="flex flex-col items-center gap-gp-xl">
            <div className={`size-20 rounded-radius-xl bg-bg-surface shadow-sh-${s}`} />
            <div className="text-center">
              <p className="text-body-xs text-fg-default">sh-{s}</p>
              <Badge color="secondary" variant="outline" size="sm" className="font-mono">shadow-sh-{s}</Badge>
            </div>
          </div>
        ))}
      </div>
    </DocLayout>
  );
}
