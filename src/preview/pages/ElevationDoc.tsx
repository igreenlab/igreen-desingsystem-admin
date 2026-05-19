import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "shadows", label: "Shadows" },
  { id: "opacity", label: "Opacity" },
  { id: "blur", label: "Blur" },
  { id: "z-index", label: "Z-Index" },
];

const SHADOWS = [
  { name: "none", level: "—", use: "Flat surface" },
  { name: "base", level: "1", use: "Card rest, input" },
  { name: "sm", level: "1", use: "Same as base (alias)" },
  { name: "md", level: "2", use: "Card hover, toggle" },
  { name: "lg", level: "3", use: "Dropdown, popover" },
  { name: "xl", level: "4", use: "Modal, dialog" },
  { name: "2xl", level: "5", use: "Toast, snackbar" },
  { name: "3xl", level: "6", use: "Maximum elevation" },
];

const OPACITY = [
  { name: "disabled", value: "0.38", use: "Disabled elements" },
  { name: "hover", value: "0.08", use: "Hover overlay" },
  { name: "focus", value: "0.12", use: "Focus overlay" },
  { name: "pressed", value: "0.12", use: "Active/pressed" },
  { name: "dragged", value: "0.16", use: "Dragging state" },
  { name: "invisible", value: "0", use: "Hidden" },
  { name: "muted", value: "0.5", use: "Reduced emphasis" },
  { name: "subtle", value: "0.7", use: "Slightly reduced" },
  { name: "full", value: "1", use: "Full visibility" },
  { name: "scrim-light", value: "0.32", use: "Light modal overlay" },
  { name: "scrim-dark", value: "0.64", use: "Dark modal overlay" },
];

const BLUR = [
  { name: "sm", value: "4px", use: "Subtle blur" },
  { name: "md", value: "8px", use: "Medium blur" },
  { name: "lg", value: "16px", use: "Strong blur" },
  { name: "xl", value: "24px", use: "Maximum blur" },
];

const ZINDEX = [
  { name: "hide", value: "-1" },
  { name: "base", value: "0" },
  { name: "dropdown", value: "100" },
  { name: "sticky", value: "200" },
  { name: "overlay", value: "300" },
  { name: "modal", value: "400" },
  { name: "popover", value: "500" },
  { name: "toast", value: "600" },
  { name: "tooltip", value: "700" },
];

export function ElevationDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Foundations" title="Elevation" description="Shadows, opacity, blur, and z-index tokens that define visual depth and layering." />
      <DocSeparator />

      {/* Shadows */}
      <SectionH2 id="shadows" title="Shadows" />
      <p className="text-body-md text-fg-muted mb-gp-4xl">Hierarchical shadow scale. Dark mode uses 2-3x higher opacity. Prefix: <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">sh-</code></p>
      <div className="grid grid-cols-4 gap-gp-4xl mb-14">
        {SHADOWS.map(s => (
          <div key={s.name} className="flex flex-col items-center gap-gp-xl">
            <div className={`size-20 rounded-radius-xl bg-bg-surface shadow-sh-${s.name}`} />
            <div className="text-center">
              <p className="text-body-xs text-fg-default">sh-{s.name}</p>
              <p className="text-caption-sm text-fg-subtle">{s.use}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Opacity */}
      <SectionH2 id="opacity" title="Opacity" />
      <div className="flex flex-col gap-gp-md mb-14">
        {OPACITY.map(o => (
          <div key={o.name} className="flex items-center gap-gp-xl">
            <div className="size-8 rounded-radius-md bg-bg-brand shrink-0" style={{ opacity: Number(o.value) }} />
            <span className="text-body-xs text-fg-default w-24">{o.name}</span>
            <Badge color="secondary" variant="outline" size="sm" className="font-mono">{o.value}</Badge>
            <span className="text-caption-sm text-fg-subtle">{o.use}</span>
          </div>
        ))}
      </div>

      {/* Blur */}
      <SectionH2 id="blur" title="Blur (Tailwind native)" />
      <p className="text-body-md text-fg-muted mb-gp-4xl">Uses Tailwind built-in blur utilities. Not tokenized — use directly: <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">blur-sm</code>, <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">blur-md</code>, etc.</p>
      <div className="grid grid-cols-4 gap-gp-4xl mb-14">
        {BLUR.map(b => (
          <div key={b.name} className="flex flex-col items-center gap-gp-xl">
            <div className="size-20 rounded-radius-xl bg-bg-brand/20 flex items-center justify-center overflow-hidden">
              <div className={`size-full backdrop-blur-${b.name}`} />
            </div>
            <div className="text-center">
              <p className="text-body-xs text-fg-default">blur-{b.name}</p>
              <p className="text-caption-sm text-fg-subtle">{b.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Z-Index */}
      <SectionH2 id="z-index" title="Z-Index" />
      <p className="text-body-md text-fg-muted mb-gp-4xl">Stacking order for overlays, modals, tooltips.</p>
      <div className="flex flex-col gap-gp-md mb-14">
        {ZINDEX.map(z => (
          <div key={z.name} className="flex items-center gap-gp-xl">
            <span className="text-body-xs text-fg-default w-20">{z.name}</span>
            <div className="flex-1 h-3 bg-bg-moderate rounded-full overflow-hidden">
              <div className="h-full bg-bg-brand rounded-full" style={{ width: `${Math.max(2, (Number(z.value) + 1) / 7)}%` }} />
            </div>
            <Badge color="secondary" variant="outline" size="sm" className="font-mono">{z.value}</Badge>
          </div>
        ))}
      </div>
    </DocLayout>
  );
}
