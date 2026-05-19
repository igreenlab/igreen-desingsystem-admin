import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "comp", label: "Component (comp)" },
  { id: "form", label: "Form Heights" },
  { id: "icon", label: "Icon Sizes" },
  { id: "layout", label: "Layout Heights" },
  { id: "container", label: "Container Widths" },
];

function SizeRow({ name, px, cssClass }: { name: string; px: string; cssClass: string }) {
  const pxNum = parseInt(px);
  return (
    <div className="flex items-center gap-gp-xl">
      <span className="text-body-xs text-fg-default w-12 text-right font-mono">{name}</span>
      <div className="bg-bg-brand rounded-radius-xs" style={{ width: `${Math.min(pxNum * 1.5, 300)}px`, height: 14 }} />
      <span className="text-caption-sm text-fg-subtle w-12">{px}px</span>
      <Badge color="secondary" variant="outline" size="sm" className="font-mono">{cssClass}</Badge>
    </div>
  );
}

export function SizingDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Tokens" title="Sizing" description="Component heights, form control heights, icon sizes, layout heights, and container widths." />
      <DocSeparator />

      {/* Comp */}
      <SectionH2 id="comp" title="Component Heights (comp)" />
      <p className="text-body-md text-fg-muted mb-gp-4xl">Generic component dimension scale. Base: 40px. Prefix: <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">comp-</code></p>
      <div className="flex flex-col gap-gp-lg mb-14">
        {[
          { name: "base", px: "40", cls: "h-comp-base" },
          { name: "3xs", px: "16", cls: "h-comp-3xs" },
          { name: "2xs", px: "20", cls: "h-comp-2xs" },
          { name: "xs", px: "24", cls: "h-comp-xs" },
          { name: "sm", px: "28", cls: "h-comp-sm" },
          { name: "md", px: "32", cls: "h-comp-md" },
          { name: "lg", px: "36", cls: "h-comp-lg" },
          { name: "xl", px: "40", cls: "h-comp-xl" },
          { name: "2xl", px: "44", cls: "h-comp-2xl" },
          { name: "3xl", px: "48", cls: "h-comp-3xl" },
          { name: "4xl", px: "56", cls: "h-comp-4xl" },
        ].map(s => <SizeRow key={s.name} name={s.name} px={s.px} cssClass={s.cls} />)}
      </div>

      {/* Form */}
      <SectionH2 id="form" title="Form Heights" />
      <p className="text-body-md text-fg-muted mb-gp-4xl">Subset for interactive controls. Ensures Button sm = Input sm = Select sm. Base: 40px. Prefix: <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">form-</code></p>
      <div className="flex flex-col gap-gp-lg mb-14">
        {[
          { name: "base", px: "40", cls: "min-h-form-base" },
          { name: "3xs", px: "20", cls: "min-h-form-3xs" },
          { name: "2xs", px: "24", cls: "min-h-form-2xs" },
          { name: "xs", px: "28", cls: "min-h-form-xs" },
          { name: "sm", px: "32", cls: "min-h-form-sm" },
          { name: "md", px: "36", cls: "min-h-form-md" },
          { name: "lg", px: "40", cls: "min-h-form-lg" },
          { name: "xl", px: "44", cls: "min-h-form-xl (WCAG touch)" },
        ].map(s => <SizeRow key={s.name} name={s.name} px={s.px} cssClass={s.cls} />)}
      </div>

      {/* Icon */}
      <SectionH2 id="icon" title="Icon Sizes" />
      <p className="text-body-md text-fg-muted mb-gp-4xl">Square dimensions for icons. Base: 20px. Prefix: <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">icon-</code></p>
      <div className="flex flex-col gap-gp-lg mb-14">
        {[
          { name: "base", px: "20", cls: "size-icon-base" },
          { name: "2xs", px: "8", cls: "size-icon-2xs" },
          { name: "xs", px: "12", cls: "size-icon-xs" },
          { name: "sm", px: "16", cls: "size-icon-sm" },
          { name: "md", px: "20", cls: "size-icon-md" },
          { name: "lg", px: "24", cls: "size-icon-lg" },
          { name: "xl", px: "32", cls: "size-icon-xl" },
          { name: "2xl", px: "40", cls: "size-icon-2xl" },
          { name: "3xl", px: "48", cls: "size-icon-3xl" },
        ].map(s => <SizeRow key={s.name} name={s.name} px={s.px} cssClass={s.cls} />)}
      </div>

      {/* Layout */}
      <SectionH2 id="layout" title="Layout Heights" />
      <p className="text-body-md text-fg-muted mb-gp-4xl">Fixed heights for structural elements. Prefix: <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">layout-</code></p>
      <div className="flex flex-col gap-gp-lg mb-14">
        {[
          { name: "toolbar", px: "48", cls: "h-layout-toolbar" },
          { name: "tab-bar", px: "56", cls: "h-layout-tab-bar" },
          { name: "navbar", px: "64", cls: "h-layout-navbar" },
          { name: "header-sm", px: "80", cls: "h-layout-header-sm" },
          { name: "header-md", px: "96", cls: "h-layout-header-md" },
          { name: "header-lg", px: "128", cls: "h-layout-header-lg" },
        ].map(s => <SizeRow key={s.name} name={s.name} px={s.px} cssClass={s.cls} />)}
      </div>

      {/* Container */}
      <SectionH2 id="container" title="Container Widths" />
      <p className="text-body-md text-fg-muted mb-gp-4xl">Max-width breakpoints and overlay widths.</p>
      <div className="grid grid-cols-2 gap-gp-xl mb-14">
        {[
          { name: "xs", val: "480px" }, { name: "sm", val: "640px" }, { name: "md", val: "768px" },
          { name: "lg", val: "1024px" }, { name: "xl", val: "1280px" }, { name: "2xl", val: "1440px" },
          { name: "3xl", val: "1920px" }, { name: "prose", val: "65ch" }, { name: "full", val: "100%" },
          { name: "modal-sm", val: "480px" }, { name: "modal-md", val: "640px" }, { name: "modal-lg", val: "800px" },
          { name: "sidebar-sm", val: "240px" }, { name: "sidebar-md", val: "280px" }, { name: "sidebar-lg", val: "320px" },
        ].map(c => (
          <div key={c.name} className="flex items-center gap-gp-md">
            <span className="text-body-xs text-fg-default font-mono w-24">{c.name}</span>
            <span className="text-caption-sm text-fg-subtle">{c.val}</span>
          </div>
        ))}
      </div>
    </DocLayout>
  );
}
