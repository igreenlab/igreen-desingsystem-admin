import { Button } from "../../components/ui/Button/button";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";
import { ChevronRight, Copy } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   Button Documentation Page
   ═══════════════════════════════════════════════════════════════════════════ */


const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-primary", label: "Primary" },
  { id: "ex-secondary", label: "Secondary" },
  { id: "ex-critical", label: "Critical" },
  { id: "ex-success", label: "Success" },
  { id: "ex-warning", label: "Warning" },
  { id: "ex-sizes", label: "Sizes" },
  { id: "ex-shape", label: "Shape (pill)" },
  { id: "ex-disabled", label: "Disabled" },
  { id: "ex-loading", label: "Loading" },
  { id: "ex-icon", label: "With Icon" },
  { id: "ex-icon-only", label: "Icon Only" },
  { id: "ex-fullwidth", label: "Full Width" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "color", type: '"primary" | "secondary" | "critical" | "success" | "warning"', defaultVal: '"primary"' },
  { name: "variant", type: '"filled" | "outline" | "soft" | "ghost"', defaultVal: '"filled"' },
  { name: "size", type: '"2xs" | "xs" | "sm" | "md" | "lg" | "icon-2xs" | "icon-xs" | "icon-sm" | "icon-md" | "icon-lg"', defaultVal: '"md"' },
  { name: "shape", type: '"rounded" | "pill"', defaultVal: '"rounded"' },
  { name: "fullWidth", type: "boolean", defaultVal: "false" },
  { name: "disabled", type: "boolean", defaultVal: "false" },
  { name: "loading", type: "boolean", defaultVal: "false" },
  { name: "iconLeft", type: "ReactNode", defaultVal: "—" },
  { name: "iconRight", type: "ReactNode", defaultVal: "—" },
];

export function ButtonDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Actions"
        title="Button"
        description="Triggers an action or event. Supports 5 semantic colors, 4 visual variants, and multiple sizes."
        dependency="tailwind-variants"
      />

      <DocSeparator />

      {/* Hero preview */}
      <ExampleSection id="ex-hero" title="" description="">
        <div className="flex items-center gap-gp-xl">
          <Button color="primary" variant="filled" size="sm">Button</Button>
          <Button color="primary" variant="outline" size="sm">Outline</Button>
          <Button color="primary" variant="soft" size="sm">Soft</Button>
          <Button color="primary" variant="ghost" size="sm">Ghost</Button>
        </div>
      </ExampleSection>

      {/* ── Examples ─────────────────────────────────────────────────── */}
      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-primary"
        title="Primary"
        description="Main actions: submit, confirm, save. The default color when no prop is specified."
        code={`<Button color="primary" variant="filled">Filled</Button>\n<Button color="primary" variant="outline">Outline</Button>\n<Button color="primary" variant="soft">Soft</Button>\n<Button color="primary" variant="ghost">Ghost</Button>`}
      >
        <div className="flex flex-col items-center gap-gp-xl">
          <Button color="primary" variant="filled">Filled</Button>
          <Button color="primary" variant="outline">Outline</Button>
          <Button color="primary" variant="soft">Soft</Button>
          <Button color="primary" variant="ghost">Ghost</Button>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-secondary"
        title="Secondary"
        description="Neutral actions: cancel, back, dismiss. Lower visual emphasis than primary."
        code={`<Button color="secondary" variant="filled">Filled</Button>`}
      >
        <div className="flex flex-col items-center gap-gp-xl">
          <Button color="secondary" variant="filled">Filled</Button>
          <Button color="secondary" variant="outline">Outline</Button>
          <Button color="secondary" variant="soft">Soft</Button>
          <Button color="secondary" variant="ghost">Ghost</Button>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-critical"
        title="Critical"
        description="Destructive actions: delete, remove, revoke. Signals danger or irreversibility."
        code={`<Button color="critical" variant="filled">Delete</Button>`}
      >
        <div className="flex flex-col items-center gap-gp-xl">
          <Button color="critical" variant="filled">Filled</Button>
          <Button color="critical" variant="outline">Outline</Button>
          <Button color="critical" variant="soft">Soft</Button>
          <Button color="critical" variant="ghost">Ghost</Button>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-success"
        title="Success"
        description="Positive actions: approve, complete, confirm success."
        code={`<Button color="success" variant="filled">Approve</Button>`}
      >
        <div className="flex flex-col items-center gap-gp-xl">
          <Button color="success" variant="filled">Filled</Button>
          <Button color="success" variant="outline">Outline</Button>
          <Button color="success" variant="soft">Soft</Button>
          <Button color="success" variant="ghost">Ghost</Button>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-warning"
        title="Warning"
        description="Cautionary actions: proceed with care, requires attention."
        code={`<Button color="warning" variant="filled">Proceed</Button>`}
      >
        <div className="flex flex-col items-center gap-gp-xl">
          <Button color="warning" variant="filled">Filled</Button>
          <Button color="warning" variant="outline">Outline</Button>
          <Button color="warning" variant="soft">Soft</Button>
          <Button color="warning" variant="ghost">Ghost</Button>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-sizes"
        title="Sizes"
        description="MD (40px) is the desktop default. SM (36px) matches the shadcn reference. All sizes align with Input and Select heights."
        code={`<Button size="md">Medium</Button>\n<Button size="sm">Small</Button>\n<Button size="xs">Xsmall</Button>\n<Button size="2xs">Xxsmall</Button>`}
      >
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

      <ExampleSection
        id="ex-shape"
        title="Shape (pill)"
        description="Use `shape='pill'` pra deixar o botão totalmente arredondado (rounded-full). O default `rounded` mantém o radius escalonado por size."
        code={`<Button shape="rounded">Default</Button>
<Button shape="pill">Pill</Button>

// Combina com qualquer color/variant/size:
<Button color="critical" variant="soft" shape="pill">Excluir</Button>
<Button size="icon-md" shape="pill">✕</Button>`}
      >
        <div className="flex flex-col gap-gp-4xl w-full">
          {/* Comparação rounded × pill */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gp-2xl">
            <div className="flex flex-col gap-gp-md">
              <span className="text-body-md font-medium text-fg-muted">rounded (default)</span>
              <div className="flex flex-col items-start gap-gp-md">
                <Button>Filled</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="soft">Soft</Button>
                <Button color="critical" variant="soft">Excluir</Button>
              </div>
            </div>
            <div className="flex flex-col gap-gp-md">
              <span className="text-body-md font-medium text-fg-muted">pill</span>
              <div className="flex flex-col items-start gap-gp-md">
                <Button shape="pill">Filled</Button>
                <Button shape="pill" variant="outline">Outline</Button>
                <Button shape="pill" variant="soft">Soft</Button>
                <Button shape="pill" color="critical" variant="soft">Excluir</Button>
              </div>
            </div>
          </div>

          {/* Sizes em pill */}
          <div className="flex flex-col gap-gp-md">
            <span className="text-body-md font-medium text-fg-muted">Sizes (pill)</span>
            <div className="flex items-center gap-gp-md flex-wrap">
              <Button shape="pill" size="lg">Large</Button>
              <Button shape="pill" size="md">Medium</Button>
              <Button shape="pill" size="sm">Small</Button>
              <Button shape="pill" size="xs">Xsmall</Button>
              <Button shape="pill" size="2xs">Xxsmall</Button>
            </div>
          </div>

          {/* Icon buttons em pill */}
          <div className="flex flex-col gap-gp-md">
            <span className="text-body-md font-medium text-fg-muted">Icon buttons (pill)</span>
            <div className="flex items-center gap-gp-md flex-wrap">
              <Button shape="pill" size="icon-lg">✕</Button>
              <Button shape="pill" size="icon-md">✕</Button>
              <Button shape="pill" size="icon-sm" variant="outline">✕</Button>
              <Button shape="pill" size="icon-xs" variant="soft">✕</Button>
              <Button shape="pill" size="icon-2xs" variant="ghost">✕</Button>
            </div>
          </div>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-disabled"
        title="Disabled"
        description="Prevents interaction. Reduces opacity and sets pointer-events: none."
        code={`<Button disabled>Disabled</Button>`}
      >
        <div className="flex items-center gap-gp-xl">
          <Button variant="filled" disabled>Filled</Button>
          <Button variant="outline" disabled>Outline</Button>
          <Button variant="soft" disabled>Soft</Button>
          <Button variant="ghost" disabled>Ghost</Button>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-loading"
        title="Loading"
        description="Shows a spinner and disables interaction. Text is hidden during loading."
        code={`<Button loading>Loading</Button>`}
      >
        <div className="flex items-center gap-gp-xl">
          <Button variant="filled" loading>Saving</Button>
          <Button color="secondary" variant="outline" loading>Loading</Button>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-icon"
        title="With Icon"
        description="Use iconLeft or iconRight to place an icon inline with text."
        code={`<Button iconRight={<ChevronRight />}>Next</Button>\n<Button iconLeft={<Copy />}>Copy</Button>`}
      >
        <div className="flex items-center gap-gp-xl">
          <Button variant="filled" iconRight={<ChevronRight className="size-4" />}>Next</Button>
          <Button variant="outline" iconLeft={<Copy className="size-4" />}>Copy</Button>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-icon-only"
        title="Icon Only"
        description="Square buttons for icon-only actions. Use the icon-* size variants."
        code={`<Button size="icon-md" variant="soft">✕</Button>\n<Button size="icon-sm" variant="soft">✕</Button>`}
      >
        <div className="flex items-center gap-gp-xl">
          <Button color="secondary" variant="soft" size="icon-md">✕</Button>
          <Button color="secondary" variant="soft" size="icon-sm">✕</Button>
          <Button color="secondary" variant="soft" size="icon-xs">✕</Button>
          <Button color="secondary" variant="soft" size="icon-2xs">✕</Button>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-fullwidth"
        title="Full Width"
        description="Expands to fill the parent container. Use for primary actions inside cards, dialogs and forms."
        code={`<Button fullWidth>Full Width Button</Button>`}
      >
        <div className="w-full max-w-sm">
          <Button fullWidth>Full Width Button</Button>
        </div>
      </ExampleSection>

      {/* ── API Reference ────────────────────────────────────────────── */}
      <SectionH2 id="api" title="API Reference" />

      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">Button</h3>
        <p className="text-body-md text-fg-muted mb-gp-3xl">
          Based on the <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">&lt;button&gt;</code> element.
          Defaults to <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">type="button"</code>.
        </p>
        <PropsTable items={PROPS} />
      </div>
    </DocLayout>
  );
}
