import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "tokens", label: "Token Files" },
  { id: "transforms", label: "Transforms" },
  { id: "components", label: "Components" },
  { id: "preview", label: "Preview App" },
  { id: "stack", label: "Tech Stack" },
];

function FileRow({ path, desc, tag }: { path: string; desc: string; tag?: string }) {
  return (
    <div className="flex items-start gap-gp-xl py-pad-md border-b border-border-subtle last:border-b-0">
      <code className="text-code-sm text-fg-brand font-mono shrink-0 min-w-[240px]">{path}</code>
      <span className="text-paragraph-sm text-fg-muted flex-1">{desc}</span>
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
        description="Project architecture, file map, and tech stack."
      />
      <DocSeparator />

      {/* Overview */}
      <SectionH2 id="overview" title="Overview" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-paragraph-sm text-fg-muted">
          The project is organized in three main areas: <strong className="text-fg-default">tokens</strong> (the source of truth),{" "}
          <strong className="text-fg-default">transforms</strong> (generate consumable formats), and{" "}
          <strong className="text-fg-default">components</strong> (UI library + preview app).
        </p>
        <div className="rounded-radius-base border border-border-subtle p-pad-4xl font-mono text-code-sm text-fg-muted leading-loose">
          <p className="text-fg-default font-semibold">igreen-ds-v2/</p>
          <p className="ml-sp-md">tokens/</p>
          <p className="ml-sp-2xl">brands/default/primitives/ <span className="text-fg-subtle">← Tier 1</span></p>
          <p className="ml-sp-2xl">brands/default/semantic/   <span className="text-fg-subtle">← Tier 2</span></p>
          <p className="ml-sp-2xl">brands/default/components/ <span className="text-fg-subtle">← Tier 2.5</span></p>
          <p className="ml-sp-2xl">transforms/                <span className="text-fg-subtle">← Adapters</span></p>
          <p className="ml-sp-md">src/</p>
          <p className="ml-sp-2xl">components/ui/             <span className="text-fg-subtle">← iGreen components</span></p>
          <p className="ml-sp-2xl">components/shadcn/         <span className="text-fg-subtle">← Shadcn styled</span></p>
          <p className="ml-sp-2xl">styles/theme/              <span className="text-fg-subtle">← Generated CSS</span></p>
          <p className="ml-sp-2xl">preview/pages/             <span className="text-fg-subtle">← Doc pages</span></p>
          <p className="ml-sp-2xl">utils/                     <span className="text-fg-subtle">← tv(), cn()</span></p>
        </div>
      </div>

      {/* Token Files */}
      <SectionH2 id="tokens" title="Token Files" />
      <div className="flex flex-col gap-gp-xs mb-14">
        <p className="text-paragraph-sm text-fg-muted mb-gp-2xl">
          All tokens live in <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">tokens/brands/default/</code>.
          Each file exports a typed object.
        </p>

        <p className="text-label-sm text-fg-default mb-gp-xs">Primitives (private — never imported by components)</p>
        <div className="mb-gp-3xl">
          <FileRow path="primitives/color-palette.ts" desc="OKLCH color scales: brand, neutral, feedback, alpha" tag="Tier 1" />
          <FileRow path="primitives/scales.ts" desc="Base-4 spatial system: sp(n) = n * 4px" tag="Tier 1" />
          <FileRow path="primitives/fonts.ts" desc="Font families, weights, typeSize() step function" tag="Tier 1" />
          <FileRow path="primitives/motion.ts" desc="Duration, easing, motion presets" tag="Tier 1" />
        </div>

        <p className="text-label-sm text-fg-default mb-gp-xs">Semantic (public API — consumed via CSS vars)</p>
        <div className="mb-gp-3xl">
          <FileRow path="semantic/color-light.ts" desc="bg.*, fg.*, border.*, ring.*, overlay.* (light)" tag="Tier 2" />
          <FileRow path="semantic/color-dark.ts" desc="Same contract, dark mode values" tag="Tier 2" />
          <FileRow path="semantic/spacing.ts" desc="Unified scale: space (sp-), gap (gp-), pad (pad-)" tag="Tier 2" />
          <FileRow path="semantic/sizing.ts" desc="Component dimension scale (comp-*)" tag="Tier 2" />
          <FileRow path="semantic/shape.ts" desc="RADIUS_BASE knob + multiplicative radius scale" tag="Tier 2" />
          <FileRow path="semantic/elevation.ts" desc="Shadows (light/dark), opacity, blur, z-index" tag="Tier 2" />
          <FileRow path="semantic/typography.ts" desc="Display, heading, title, body, label, code presets" tag="Tier 2" />
        </div>

        <p className="text-label-sm text-fg-default mb-gp-xs">Component Tokens (component-specific scales)</p>
        <div>
          <FileRow path="components/sizing.ts" desc="form.*, layout.*, icon.*, container.* heights/widths" tag="Tier 2.5" />
          <FileRow path="components/spacing.ts" desc="padCard.*, padPage.* internal padding" tag="Tier 2.5" />
        </div>
      </div>

      {/* Transforms */}
      <SectionH2 id="transforms" title="Transforms" />
      <div className="flex flex-col gap-gp-xs mb-14">
        <p className="text-paragraph-sm text-fg-muted mb-gp-2xl">
          Transforms read token objects and output consumable formats. Run via npm scripts.
        </p>
        <FileRow path="transforms/to-tailwind-v4.ts" desc="Generates @theme CSS + .dark overrides + @utility presets" tag="Primary" />
        <FileRow path="transforms/to-css-vars.ts" desc="Vanilla CSS custom properties (framework-agnostic)" tag="Optional" />
        <FileRow path="transforms/to-dtcg.ts" desc="Design Token Community Group JSON format" tag="Optional" />
      </div>

      {/* Components */}
      <SectionH2 id="components" title="Components" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-paragraph-sm text-fg-muted">
          Two component layers live in <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">src/components/</code>:
        </p>
        <div className="grid grid-cols-2 gap-gp-3xl">
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-label-sm text-fg-default mb-gp-md">ui/ — iGreen Components</p>
            <p className="text-paragraph-sm text-fg-muted">
              Custom components built from scratch using <code className="font-mono text-code-sm">tv()</code> from Tailwind Variants.
              Each has a <code className="font-mono text-code-sm">.styles.ts</code>, <code className="font-mono text-code-sm">.tsx</code>, and <code className="font-mono text-code-sm">.types.ts</code>.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-label-sm text-fg-default mb-gp-md">shadcn/ — Adapted Shadcn</p>
            <p className="text-paragraph-sm text-fg-muted">
              21 Shadcn components restyled with DS tokens. Radix primitives under the hood. Classes reference
              CSS vars from the generated theme.
            </p>
          </div>
        </div>
      </div>

      {/* Preview App */}
      <SectionH2 id="preview" title="Preview App" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-paragraph-sm text-fg-muted">
          This documentation site is the preview app. It runs on Vite + React and serves as the living styleguide.
        </p>
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <div className="flex items-center gap-gp-xl py-pad-md px-pad-3xl border-b border-border-subtle">
            <code className="font-mono text-code-sm text-fg-brand">npm run dev</code>
            <span className="text-paragraph-sm text-fg-muted">→ localhost:3100</span>
          </div>
          <div className="flex items-center gap-gp-xl py-pad-md px-pad-3xl border-b border-border-subtle">
            <code className="font-mono text-code-sm text-fg-brand">npm run tokens:tw4</code>
            <span className="text-paragraph-sm text-fg-muted">→ regenerate theme CSS from tokens</span>
          </div>
          <div className="flex items-center gap-gp-xl py-pad-md px-pad-3xl">
            <code className="font-mono text-code-sm text-fg-brand">npm run build</code>
            <span className="text-paragraph-sm text-fg-muted">→ tokens + tsc + vite build</span>
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
        ].map((tech) => (
          <Badge key={tech} color="secondary" variant="outline" size="md">{tech}</Badge>
        ))}
      </div>
    </DocLayout>
  );
}
