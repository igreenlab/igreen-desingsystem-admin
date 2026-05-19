/**
 * ComponentDocTemplate — Página de documentação estilo AlignUI.
 * Layout: conteúdo 744px + TOC sticky à direita.
 */

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Separator as ShadcnSeparator } from "../../components/shadcn/separator";

/* ═══════════════════════════════════════════════════════════════════════════
   BUILDING BLOCKS
   ═══════════════════════════════════════════════════════════════════════════ */

function DocHeader({ category, title, description, dependency }: {
  category: string; title: string; description: string; dependency?: string;
}) {
  return (
    <header className="mb-0">
      <p className="text-body-md font-medium text-fg-brand mb-2">{category}</p>
      <h1 className="text-[2rem] font-semibold text-fg-default tracking-tight leading-tight mb-2">{title}</h1>
      <p className="text-body-lg text-fg-muted mb-4">{description}</p>
      {dependency && (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-bg-muted text-body-xs text-fg-muted">
          {dependency}
          <ExternalIcon />
        </span>
      )}
    </header>
  );
}

function Separator() {
  return <div className="border-t border-dashed border-border-subtle my-8" />;
}

function SectionH2({ id, title }: { id: string; title: string }) {
  return (
    <h2 id={id} className="text-heading-xs font-semibold text-fg-default pb-5 border-b border-border-subtle mb-12 scroll-mt-6">
      {title}
    </h2>
  );
}

function ExampleSection({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  const [tab, setTab] = useState<"preview" | "code">("preview");

  return (
    <div className="mb-14" id={id}>
      <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">{title}</h3>
      {description && <p className="text-body-md text-fg-muted mb-gp-2xl">{description}</p>}

      {/* Tab bar */}
      <div className="flex items-center justify-between mb-gp-xl">
        <div className="flex items-center gap-1">
          <Button color="secondary" variant={tab === "preview" ? "outline" : "ghost"} size="2xs" onClick={() => setTab("preview")} iconLeft={<EyeIcon />}>Preview</Button>
          <Button color="secondary" variant={tab === "code" ? "outline" : "ghost"} size="2xs" onClick={() => setTab("code")} iconLeft={<CodeIcon />}>Code</Button>
        </div>
        <Button color="secondary" variant="soft" size="2xs" iconLeft={<CopyIcon />}>Copy</Button>
      </div>

      {/* Card */}
      <div className="rounded-radius-base ring-1 ring-border-subtle shadow-sh-md overflow-hidden">
        {tab === "preview" ? (
          <div className="flex items-center justify-center min-h-[256px] p-10 bg-bg-surface">
            {children}
          </div>
        ) : (
          <div className="p-5 bg-bg-subtle font-mono text-code-sm text-fg-muted overflow-x-auto">
            <pre className="whitespace-pre-wrap leading-relaxed">
              {`// Example code
<Button color="primary" variant="filled">
  Button
</Button>`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}


function PropsTable({ items }: { items: { name: string; type: string; defaultVal: string }[] }) {
  return (
    <div className="rounded-radius-3xl ring-1 ring-border-subtle overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-bg-muted">
          <tr>
            <th className="py-2.5 px-5 text-body-md font-medium text-fg-muted font-medium">Prop</th>
            <th className="py-2.5 px-5 text-body-md font-medium text-fg-muted font-medium">Type</th>
            <th className="py-2.5 px-5 text-body-md font-medium text-fg-muted font-medium">Default</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.name} className="border-t border-border-subtle">
              <td className="py-3 px-5 font-mono text-body-md text-fg-default">{p.name}</td>
              <td className="py-3 px-5 font-mono text-body-md text-fg-muted">{p.type}</td>
              <td className="py-3 px-5 font-mono text-body-md text-fg-subtle">{p.defaultVal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TOC({ items }: { items: { id: string; label: string; indent?: boolean }[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    // Find the scrollable parent (main with overflow-auto)
    const scrollParent = document.querySelector("main");
    if (!scrollParent) return;

    const handleScroll = () => {
      const ids = items.map((i) => i.id);
      // When scrolled to bottom, activate the last visible section
      const atBottom = scrollParent.scrollHeight - scrollParent.scrollTop - scrollParent.clientHeight < 2;
      if (atBottom) {
        // Find the last section visible in the viewport
        for (let i = ids.length - 1; i >= 0; i--) {
          const el = document.getElementById(ids[i]);
          if (el && el.getBoundingClientRect().top < scrollParent.clientHeight) {
            setActiveId(ids[i]);
            return;
          }
        }
      }
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) current = id;
      }
      setActiveId(current);
    };

    scrollParent.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => scrollParent.removeEventListener("scroll", handleScroll);
  }, [items]);

  return (
    <nav>
      <p className="text-caption-sm font-semibold text-fg-subtle uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <TocIcon /> ON THIS PAGE
      </p>
      <div className="flex flex-col gap-1 border-l-2 border-border-subtle pl-4">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={[
                "text-body-md font-medium transition-colors leading-relaxed py-0.5",
                isActive
                  ? "text-fg-brand font-medium"
                  : "text-fg-muted font-normal hover:text-fg-brand",
              ].join(" ")}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE DATA
   ═══════════════════════════════════════════════════════════════════════════ */

const PROPS = [
  { name: "color", type: '"primary" | "secondary" | "critical" | "success" | "warning"', defaultVal: '"primary"' },
  { name: "variant", type: '"filled" | "outline" | "soft" | "ghost"', defaultVal: '"filled"' },
  { name: "size", type: '"2xs" | "xs" | "sm" | "md"', defaultVal: '"md"' },
  { name: "fullWidth", type: "boolean", defaultVal: "false" },
  { name: "disabled", type: "boolean", defaultVal: "false" },
  { name: "loading", type: "boolean", defaultVal: "false" },
];

const TOC_DATA = [
  { id: "examples", label: "Examples" },
  { id: "ex-colors", label: "Colors", indent: true },
  { id: "ex-primary", label: "Primary", indent: true },
  { id: "ex-secondary", label: "Secondary", indent: true },
  { id: "ex-critical", label: "Critical", indent: true },
  { id: "ex-size-section", label: "Size", indent: true },
  { id: "ex-states-section", label: "States", indent: true },
  { id: "ex-disabled", label: "Disabled", indent: true },
  { id: "ex-composition-section", label: "Composition", indent: true },
  { id: "ex-icon", label: "With Icon", indent: true },
  { id: "ex-fullwidth", label: "Full Width", indent: true },
  { id: "api", label: "API Reference" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   DOC SIDEBAR — Navigation menu de documentação
   ═══════════════════════════════════════════════════════════════════════════ */

const DOC_NAV: { title: string; items: { label: string; href: string; active?: boolean; badge?: string }[] }[] = [
  {
    title: "Sections",
    items: [
      { label: "Introduction", href: "#" },
      { label: "Components", href: "#", active: true },
      { label: "Installation", href: "#" },
      { label: "Theming", href: "#" },
      { label: "Changelog", href: "#", badge: "new" },
    ],
  },
  {
    title: "Agents",
    items: [
      { label: "Orchestrator", href: "#" },
      { label: "DS Designer", href: "#" },
      { label: "DS Dev", href: "#" },
      { label: "DS Reviewer", href: "#" },
    ],
  },
  {
    title: "Foundations",
    items: [
      { label: "Color", href: "#" },
      { label: "Typography", href: "#" },
      { label: "Spacing", href: "#" },
      { label: "Shape & Radius", href: "#" },
      { label: "Elevation", href: "#" },
    ],
  },
  {
    title: "Tokens",
    items: [
      { label: "Primitives", href: "#" },
      { label: "Semantic", href: "#" },
      { label: "Component Tokens", href: "#" },
      { label: "Transforms", href: "#" },
    ],
  },
  {
    title: "Components",
    items: [
      { label: "Accordion", href: "#" },
      { label: "Alert", href: "#" },
      { label: "Avatar", href: "#" },
      { label: "Badge", href: "#" },
      { label: "Breadcrumb", href: "#" },
      { label: "Button", href: "#", active: true },
      { label: "Calendar", href: "#" },
      { label: "Card", href: "#" },
      { label: "Checkbox", href: "#" },
      { label: "Dialog", href: "#" },
      { label: "Dropdown Menu", href: "#" },
      { label: "Input", href: "#" },
      { label: "Label", href: "#" },
      { label: "Progress", href: "#" },
      { label: "Radio Group", href: "#" },
      { label: "Select", href: "#" },
      { label: "Separator", href: "#" },
      { label: "Slider", href: "#" },
      { label: "Switch", href: "#" },
      { label: "Tabs", href: "#" },
      { label: "Textarea", href: "#" },
    ],
  },
];

function DocSidebar() {
  return (
    <nav className="w-[260px] min-w-[260px] shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-border-subtle scrollbar-thin">
      <div className="flex flex-col gap-gp-4xl px-pad-4xl py-pad-4xl">
        {DOC_NAV.map((section) => (
          <div key={section.title}>
            <p className="text-caption-sm text-fg-subtle font-medium mb-gp-xl">{section.title}</p>
            <div className="flex flex-col">
              {section.items.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={[
                    "block py-pad-sm px-pad-xl rounded-radius-base text-body-xs font-medium transition-colors",
                    item.active
                      ? "text-fg-brand font-medium bg-bg-brand-subtle"
                      : "text-fg-default hover:text-fg-brand hover:bg-bg-muted/50",
                  ].join(" ")}
                >
                  {item.label}
                  {item.badge && <span className={`ml-gp-md text-caption-sm ${item.badge === "new" ? "text-fg-brand" : "text-fg-subtle"}`}>●</span>}
                </a>
              ))}
            </div>
            <ShadcnSeparator className="mt-gp-3xl" />
          </div>
        ))}
      </div>
    </nav>
  );
}

export function ComponentDocTemplate() {
  return (
    <div className="flex min-h-screen bg-bg-surface">
      {/* Doc Sidebar */}
      <DocSidebar />

      {/* Main content */}
      <div className="flex-1 px-10 py-10 xl:pr-[290px]">
        {/* TOC — fixed right */}
        <div className="fixed top-10 right-8 w-[250px] hidden xl:block">
          <TOC items={TOC_DATA} />
        </div>

        {/* Content */}
        <div className="max-w-[744px] mx-auto">

        <DocHeader
          category="Base Components"
          title="Button"
          description="Renders a button or an element styled to resemble a button."
          dependency="@radix-ui/react-slot"
        />

        <Separator />

        {/* Preview hero */}
        <ExampleSection id="ex-hero" title="">
          <Button color="primary" variant="filled">Button</Button>
        </ExampleSection>

        {/* Examples */}
        <SectionH2 id="examples" title="Examples" />

        <div id="ex-colors" className="scroll-mt-6" />

        <ExampleSection id="ex-primary" title="Primary (Default)" description="Main actions: submit, confirm, save. Used for the most important action on the page.">
          <div className="flex flex-col items-center gap-gp-xl">
            <Button color="primary" variant="filled">Filled</Button>
            <Button color="primary" variant="outline">Outline</Button>
            <Button color="primary" variant="soft">Soft</Button>
            <Button color="primary" variant="ghost">Ghost</Button>
          </div>
        </ExampleSection>

        <ExampleSection id="ex-secondary" title="Secondary" description="Neutral actions: cancel, back, dismiss. Lower emphasis than primary.">
          <div className="flex flex-col items-center gap-gp-xl">
            <Button color="secondary" variant="filled">Filled</Button>
            <Button color="secondary" variant="outline">Outline</Button>
            <Button color="secondary" variant="soft">Soft</Button>
            <Button color="secondary" variant="ghost">Ghost</Button>
          </div>
        </ExampleSection>

        <ExampleSection id="ex-critical" title="Critical" description="Destructive actions: delete, remove, revoke. Signals danger or irreversibility.">
          <div className="flex flex-col items-center gap-gp-xl">
            <Button color="critical" variant="filled">Filled</Button>
            <Button color="critical" variant="outline">Outline</Button>
            <Button color="critical" variant="soft">Soft</Button>
            <Button color="critical" variant="ghost">Ghost</Button>
          </div>
        </ExampleSection>

        <div id="ex-size-section" className="scroll-mt-6" />

        <ExampleSection id="ex-sizes" title="All Sizes" description="MD (40px) is the default. SM (36px) matches the shadcn reference. XXS (28px) for compact UI.">
          <div className="flex flex-col items-center gap-gp-xl">
            {(["filled", "outline", "soft", "ghost"] as const).map((v) => (
              <div key={v} className="flex items-center gap-gp-xl">
                <Button variant={v} size="md">Medium</Button>
                <Button variant={v} size="sm">Small</Button>
                <Button variant={v} size="xs">Xsmall</Button>
                <Button variant={v} size="2xs">Xxsmall</Button>
              </div>
            ))}
          </div>
        </ExampleSection>

        <div id="ex-states-section" className="scroll-mt-6" />

        <ExampleSection id="ex-disabled" title="Disabled" description="Prevents interaction. Applies reduced opacity and pointer-events: none.">
          <div className="flex flex-col items-center gap-gp-xl">
            <Button variant="filled" disabled>Disabled</Button>
            <Button variant="outline" disabled>Disabled</Button>
            <Button variant="soft" disabled>Disabled</Button>
            <Button variant="ghost" disabled>Disabled</Button>
          </div>
        </ExampleSection>

        <div id="ex-composition-section" className="scroll-mt-6" />

        <ExampleSection id="ex-icon" title="With Icon" description="Use iconLeft or iconRight to add inline icons. Icon-only buttons use the icon-* size variants.">
          <div className="flex flex-col items-center gap-gp-xl">
            <Button variant="filled" iconRight={<ChevronIcon />}>Button</Button>
            <Button variant="filled" iconLeft={<ClipboardDocIcon />} aria-label="Copy" />
          </div>
        </ExampleSection>

        <ExampleSection id="ex-fullwidth" title="Full Width" description="Use fullWidth for primary actions inside cards, dialogs and forms.">
          <div className="w-full max-w-sm">
            <Button fullWidth>Full Width Button</Button>
          </div>
        </ExampleSection>

        {/* API Reference */}
        <SectionH2 id="api" title="API Reference" />

        <div className="mb-8">
          <h3 className="text-title-lg font-semibold text-fg-default mb-1">Button</h3>
          <p className="text-body-md text-fg-muted mb-5">
            Based on the <code className="font-mono text-body-md bg-bg-muted px-1.5 py-0.5 rounded-md">&lt;button&gt;</code> element.
            Defaults to <code className="font-mono text-body-md bg-bg-muted px-1.5 py-0.5 rounded-md">type="button"</code>.
          </p>
          <PropsTable items={PROPS} />
        </div>
      </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ICONS (inline SVG — zero dependencies)
   ═══════════════════════════════════════════════════════════════════════════ */

function EyeIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
}
function CodeIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
}
function CopyIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>;
}
function ExternalIcon() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>;
}
function TocIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
}
function ChevronIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;
}
function ClipboardDocIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>;
}
