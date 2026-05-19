import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { colorPalette } from "../../../tokens/brands/default/primitives/color-palette";

const TOC = [
  { id: "primitives", label: "Primitives" },
  { id: "brand", label: "Brand" },
  { id: "brandcontrast", label: "Brand Contrast" },
  { id: "gray", label: "Gray" },
  { id: "success", label: "Success" },
  { id: "warning", label: "Warning" },
  { id: "danger", label: "Danger" },
  { id: "info", label: "Info" },
  { id: "semantic", label: "Semantic" },
  { id: "bg", label: "Background" },
  { id: "fg", label: "Foreground" },
  { id: "border-tokens", label: "Border" },
  { id: "ring-tokens", label: "Ring" },
];

/* ── Swatch ─────────────────────────────────────────────────────────────── */
function Swatch({ name, value, dark }: { name: string; value: string; dark?: boolean }) {
  return (
    <div className="flex flex-col rounded-radius-xl overflow-hidden ring-1 ring-border-subtle">
      <div className="h-16" style={{ backgroundColor: value }} />
      <div className="px-pad-xl py-pad-md bg-bg-surface">
        <p className={`text-body-xs ${dark ? "text-fg-default" : "text-fg-default"}`}>{name}</p>
        <p className="text-caption-sm text-fg-subtle font-mono">{value}</p>
      </div>
    </div>
  );
}

function PaletteGrid({ id, name, scale }: { id: string; name: string; scale: Record<string | number, string> }) {
  return (
    <div id={id} className="mb-14 scroll-mt-6">
      <h3 className="text-title-lg font-semibold text-fg-default mb-gp-4xl">{name}</h3>
      <div className="grid grid-cols-5 gap-gp-xl">
        {Object.entries(scale).map(([step, value]) => (
          <Swatch key={step} name={`${id}-${step}`} value={value} dark={Number(step) >= 600} />
        ))}
      </div>
    </div>
  );
}

/* ── Semantic Color Row ─────────────────────────────────────────────────── */
function SemanticRow({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="flex items-center gap-gp-xl">
      <div className="size-10 rounded-radius-lg shrink-0 ring-1 ring-border-subtle" style={{ backgroundColor: `var(${cssVar})` }} />
      <div>
        <p className="text-body-xs text-fg-default">{name}</p>
        <p className="text-caption-sm text-fg-subtle font-mono">{cssVar}</p>
      </div>
    </div>
  );
}

export function ColorsDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Foundations"
        title="Color Palette"
        description="Core color scales in OKLCH format. Primitives are consumed by semantic tokens — never used directly in components."
      />

      <DocSeparator />

      {/* ── Primitives ────────────────────────────────────────────── */}
      <SectionH2 id="primitives" title="Primitives" />

      <PaletteGrid id="brand" name="Brand" scale={colorPalette.brand} />
      <PaletteGrid id="brandcontrast" name="Brand Contrast (dark)" scale={colorPalette.brandContrast} />
      <PaletteGrid id="gray" name="Gray" scale={colorPalette.gray} />
      <PaletteGrid id="success" name="Success" scale={colorPalette.success} />
      <PaletteGrid id="warning" name="Warning" scale={colorPalette.warning} />
      <PaletteGrid id="danger" name="Danger" scale={colorPalette.danger} />
      <PaletteGrid id="info" name="Info" scale={colorPalette.info} />

      {/* ── Semantic ──────────────────────────────────────────────── */}
      <SectionH2 id="semantic" title="Semantic Tokens" />

      <div id="bg" className="mb-14 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-4xl">Background</h3>
        <div className="grid grid-cols-2 gap-gp-2xl">
          {[
            ["bg.canvas", "--color-bg-canvas"],
            ["bg.surface", "--color-bg-surface"],
            ["bg.surface-elevated", "--color-bg-surface-elevated"],
            ["bg.surface-panels", "--color-bg-surface-panels"],
            ["bg.sidebar", "--color-bg-sidebar"],
            ["bg.subtle", "--color-bg-subtle"],
            ["bg.muted", "--color-bg-muted"],
            ["bg.input", "--color-bg-input"],
            ["bg.accent", "--color-bg-accent"],
            ["bg.brand", "--color-bg-brand"],
            ["bg.brand-subtle", "--color-bg-brand-subtle"],
            ["bg.danger", "--color-bg-danger"],
            ["bg.danger-muted", "--color-bg-danger-muted"],
            ["bg.success", "--color-bg-success"],
            ["bg.success-muted", "--color-bg-success-muted"],
            ["bg.warning", "--color-bg-warning"],
            ["bg.warning-muted", "--color-bg-warning-muted"],
            ["bg.info", "--color-bg-info"],
            ["bg.info-muted", "--color-bg-info-muted"],
          ].map(([name, cssVar]) => (
            <SemanticRow key={name} name={name} cssVar={cssVar} />
          ))}
        </div>
      </div>

      <div id="fg" className="mb-14 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-4xl">Foreground</h3>
        <div className="grid grid-cols-2 gap-gp-2xl">
          {[
            ["fg.strong", "--color-fg-strong"],
            ["fg.default", "--color-fg-default"],
            ["fg.muted", "--color-fg-muted"],
            ["fg.subtle", "--color-fg-subtle"],
            ["fg.disabled", "--color-fg-disabled"],
            ["fg.brand", "--color-fg-brand"],
            ["fg.danger", "--color-fg-danger"],
            ["fg.success", "--color-fg-success"],
            ["fg.warning", "--color-fg-warning"],
            ["fg.info", "--color-fg-info"],
            ["fg.on-brand", "--color-fg-on-brand"],
            ["fg.on-danger", "--color-fg-on-danger"],
            ["fg.on-success", "--color-fg-on-success"],
            ["fg.on-warning", "--color-fg-on-warning"],
            ["fg.on-info", "--color-fg-on-info"],
          ].map(([name, cssVar]) => (
            <SemanticRow key={name} name={name} cssVar={cssVar} />
          ))}
        </div>
      </div>

      <div id="border-tokens" className="mb-14 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-4xl">Border</h3>
        <div className="grid grid-cols-2 gap-gp-2xl">
          {[
            ["border.default", "--color-border-default"],
            ["border.subtle", "--color-border-subtle"],
            ["border.input", "--color-border-input"],
            ["border.sidebar", "--color-border-sidebar"],
            ["border.brand", "--color-border-brand"],
            ["border.brand-subtle", "--color-border-brand-subtle"],
            ["border.danger-muted", "--color-border-danger-muted"],
            ["border.success-muted", "--color-border-success-muted"],
            ["border.warning-muted", "--color-border-warning-muted"],
            ["border.info-muted", "--color-border-info-muted"],
          ].map(([name, cssVar]) => (
            <SemanticRow key={name} name={name} cssVar={cssVar} />
          ))}
        </div>
      </div>

      <div id="ring-tokens" className="mb-14 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-4xl">Ring (focus)</h3>
        <div className="grid grid-cols-2 gap-gp-2xl">
          {[
            ["ring.brand", "--color-ring-brand"],
            ["ring.danger", "--color-ring-danger"],
            ["ring.success", "--color-ring-success"],
            ["ring.warning", "--color-ring-warning"],
            ["ring.info", "--color-ring-info"],
            ["ring.secondary", "--color-ring-secondary"],
          ].map(([name, cssVar]) => (
            <SemanticRow key={name} name={name} cssVar={cssVar} />
          ))}
        </div>
      </div>
    </DocLayout>
  );
}
