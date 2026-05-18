import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "display", label: "Display" },
  { id: "heading", label: "Heading" },
  { id: "title", label: "Title" },
  { id: "label", label: "Label" },
  { id: "paragraph", label: "Paragraph" },
  { id: "caption", label: "Caption" },
  { id: "code", label: "Code" },
];

/* ── Typography Sample ──────────────────────────────────────────────────── */
function TypeSample({ preset, label, size, weight, lineHeight, tracking }: {
  preset: string; label: string; size: string; weight: string; lineHeight: string; tracking: string;
}) {
  return (
    <div className="mb-14 scroll-mt-6">
      <p className="text-label-xs text-fg-brand mb-gp-xl">{label}</p>
      <p className={`${preset} text-fg-default mb-gp-4xl`}>The quick brown fox jumps over the lazy dog.</p>
      <div className="flex flex-wrap gap-gp-md">
        <Badge color="secondary" variant="outline" size="sm">Weight: {weight}</Badge>
        <Badge color="secondary" variant="outline" size="sm">Font Size: {size}</Badge>
        <Badge color="secondary" variant="outline" size="sm">Line Height: {lineHeight}</Badge>
        <Badge color="secondary" variant="outline" size="sm">Letter Spacing: {tracking}</Badge>
      </div>
      <div className="border-b border-border-subtle mt-gp-4xl" />
    </div>
  );
}

export function TypographyDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Foundations"
        title="Typography"
        description="A clear and consistent typography system that works effortlessly across all kinds of content. Fluid sizes use clamp() for responsive scaling."
      />

      <DocSeparator />

      <div id="display" className="scroll-mt-6">
        <SectionH2 id="display" title="Display" />
        <TypeSample preset="text-display-2xl" label="Display / 2XL" size="clamp(2.5rem, 4.75rem)" weight="Bold / 700" lineHeight="1.1" tracking="-2%" />
        <TypeSample preset="text-display-xl" label="Display / XL" size="clamp(2.25rem, 3.81rem)" weight="Bold / 700" lineHeight="1.1" tracking="-2%" />
        <TypeSample preset="text-display-lg" label="Display / LG" size="clamp(2rem, 3.06rem)" weight="Semibold / 600" lineHeight="1.15" tracking="-1%" />
        <TypeSample preset="text-display-md" label="Display / MD" size="clamp(1.75rem, 2.44rem)" weight="Semibold / 600" lineHeight="1.15" tracking="-1%" />
      </div>

      <div id="heading" className="scroll-mt-6">
        <SectionH2 id="heading" title="Heading" />
        <TypeSample preset="text-heading-xl" label="Heading / XL" size="clamp(2.25rem, 3.5rem)" weight="Medium / 500" lineHeight="1.15" tracking="-1%" />
        <TypeSample preset="text-heading-lg" label="Heading / LG" size="clamp(2rem, 3rem)" weight="Medium / 500" lineHeight="1.2" tracking="-1%" />
        <TypeSample preset="text-heading-md" label="Heading / MD" size="clamp(1.75rem, 2.5rem)" weight="Medium / 500" lineHeight="1.2" tracking="-1%" />
        <TypeSample preset="text-heading-sm" label="Heading / SM" size="clamp(1.5rem, 2rem)" weight="Medium / 500" lineHeight="1.25" tracking="0" />
        <TypeSample preset="text-heading-xs" label="Heading / XS" size="1.5rem (24px)" weight="Medium / 500" lineHeight="2rem" tracking="0" />
      </div>

      <div id="title" className="scroll-mt-6">
        <SectionH2 id="title" title="Title" />
        <TypeSample preset="text-title-lg" label="Title / LG" size="1.25rem (20px)" weight="Medium / 500" lineHeight="1.75rem" tracking="0" />
        <TypeSample preset="text-title-md" label="Title / MD" size="1rem (16px)" weight="Medium / 500" lineHeight="1.5rem" tracking="0" />
        <TypeSample preset="text-title-sm" label="Title / SM" size="0.875rem (14px)" weight="Medium / 500" lineHeight="1.25rem" tracking="0" />
      </div>

      <div id="label" className="scroll-mt-6">
        <SectionH2 id="label" title="Label" />
        <TypeSample preset="text-label-xl" label="Label / XL" size="1.5rem (24px)" weight="Medium / 500" lineHeight="2rem" tracking="-1.5%" />
        <TypeSample preset="text-label-lg" label="Label / LG" size="1.125rem (18px)" weight="Medium / 500" lineHeight="1.5rem" tracking="-1.5%" />
        <TypeSample preset="text-label-md" label="Label / MD" size="1rem (16px)" weight="Medium / 500" lineHeight="1.5rem" tracking="-1.1%" />
        <TypeSample preset="text-label-sm" label="Label / SM" size="0.875rem (14px)" weight="Medium / 500" lineHeight="1.25rem" tracking="-0.6%" />
        <TypeSample preset="text-label-xs" label="Label / XS" size="0.75rem (12px)" weight="Medium / 500" lineHeight="1rem" tracking="0" />
      </div>

      <div id="paragraph" className="scroll-mt-6">
        <SectionH2 id="paragraph" title="Paragraph" />
        <TypeSample preset="text-paragraph-xl" label="Paragraph / XL" size="1.5rem (24px)" weight="Regular / 400" lineHeight="2rem" tracking="-1.5%" />
        <TypeSample preset="text-paragraph-lg" label="Paragraph / LG" size="1.125rem (18px)" weight="Regular / 400" lineHeight="1.5rem" tracking="-1.5%" />
        <TypeSample preset="text-paragraph-md" label="Paragraph / MD" size="1rem (16px)" weight="Regular / 400" lineHeight="1.5rem" tracking="-1.1%" />
        <TypeSample preset="text-paragraph-sm" label="Paragraph / SM" size="0.875rem (14px)" weight="Regular / 400" lineHeight="1.25rem" tracking="-0.6%" />
        <TypeSample preset="text-paragraph-xs" label="Paragraph / XS" size="0.75rem (12px)" weight="Regular / 400" lineHeight="1rem" tracking="0" />
      </div>

      <div id="caption" className="scroll-mt-6">
        <SectionH2 id="caption" title="Caption" />
        <TypeSample preset="text-caption-md" label="Caption / MD" size="0.8125rem (13px)" weight="Regular / 400" lineHeight="1.125rem" tracking="0" />
        <TypeSample preset="text-caption-sm" label="Caption / SM" size="0.6875rem (11px)" weight="Regular / 400" lineHeight="0.875rem" tracking="0" />
      </div>

      <div id="code" className="scroll-mt-6">
        <SectionH2 id="code" title="Code" />
        <TypeSample preset="text-code-md" label="Code / MD" size="1rem (16px)" weight="Regular / 400" lineHeight="1.6" tracking="0" />
        <TypeSample preset="text-code-sm" label="Code / SM" size="0.8125rem (13px)" weight="Regular / 400" lineHeight="1.6" tracking="0" />
      </div>
    </DocLayout>
  );
}
