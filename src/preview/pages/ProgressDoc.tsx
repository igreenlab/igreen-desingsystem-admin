import { useState } from "react";
import { Progress } from "../../components/shadcn/progress";
import { Button } from "../../components/ui/Button/button";
import { Label } from "../../components/shadcn/label";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default" },
  { id: "ex-with-label", label: "With Label" },
  { id: "ex-controlled", label: "Controlled" },
  { id: "ex-sizes", label: "Sizes" },
  { id: "ex-colors", label: "Colors" },
  { id: "api", label: "API Reference" },
];
const PROPS = [
  { name: "value", type: "number", defaultVal: "0" },
  { name: "max", type: "number", defaultVal: "100" },
  { name: "className", type: "string", defaultVal: "—" },
];

export function ProgressDoc() {
  const [val, setVal] = useState(40);

  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Data Display" title="Progress" description="Linear progress indicator for showing completion status." dependency="@radix-ui/react-progress" />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      {/* Default */}
      <ExampleSection
        id="ex-default"
        title="Default"
        description="Basic progress bar at a fixed value."
        code={`<Progress value={66} />`}
      >
        <div className="w-full max-w-sm">
          <Progress value={66} />
        </div>
      </ExampleSection>

      {/* With Label */}
      <ExampleSection
        id="ex-with-label"
        title="With Label"
        description="Progress bar with a descriptive label and percentage readout."
        code={`<div className="w-full max-w-sm flex flex-col gap-gp-md">\n  <div className="flex items-center justify-between">\n    <Label>Upload progress</Label>\n    <span className="text-body-md font-medium text-fg-muted tabular-nums">66%</span>\n  </div>\n  <Progress value={66} />\n</div>`}
      >
        <div className="w-full max-w-sm flex flex-col gap-gp-md">
          <div className="flex items-center justify-between">
            <Label>Upload progress</Label>
            <span className="text-body-md font-medium text-fg-muted tabular-nums">66%</span>
          </div>
          <Progress value={66} />
        </div>
      </ExampleSection>

      {/* Controlled */}
      <ExampleSection
        id="ex-controlled"
        title="Controlled"
        description="Use state to drive the progress value with increment and decrement controls."
        code={`const [val, setVal] = useState(40);\n\n<Progress value={val} />\n<div className="flex items-center gap-gp-xl justify-center">\n  <Button color="secondary" variant="outline" size="2xs"\n    onClick={() => setVal(Math.max(0, val - 10))}>-10</Button>\n  <span className="text-body-md font-medium text-fg-muted tabular-nums">{val}%</span>\n  <Button color="secondary" variant="outline" size="2xs"\n    onClick={() => setVal(Math.min(100, val + 10))}>+10</Button>\n</div>`}
      >
        <div className="flex flex-col gap-gp-xl max-w-sm w-full">
          <Progress value={val} />
          <div className="flex items-center gap-gp-xl justify-center">
            <Button color="secondary" variant="outline" size="2xs" onClick={() => setVal(Math.max(0, val - 10))}>-10</Button>
            <span className="text-body-md font-medium text-fg-muted tabular-nums">{val}%</span>
            <Button color="secondary" variant="outline" size="2xs" onClick={() => setVal(Math.min(100, val + 10))}>+10</Button>
          </div>
        </div>
      </ExampleSection>

      {/* Sizes */}
      <ExampleSection
        id="ex-sizes"
        title="Sizes"
        description="Override the height via className to create thinner or thicker bars. Progress has no built-in size token."
        code={`<Progress value={60} className="h-1" />\n<Progress value={60} className="h-2" />\n<Progress value={60} className="h-3" />\n<Progress value={60} className="h-4" />`}
      >
        <div className="flex flex-col gap-gp-3xl w-full max-w-sm">
          <div className="flex flex-col gap-gp-xs">
            <span className="text-body-xs text-fg-subtle">h-1 (4px)</span>
            <Progress value={60} className="h-1" />
          </div>
          <div className="flex flex-col gap-gp-xs">
            <span className="text-body-xs text-fg-subtle">h-2 (8px) — default</span>
            <Progress value={60} className="h-2" />
          </div>
          <div className="flex flex-col gap-gp-xs">
            <span className="text-body-xs text-fg-subtle">h-3 (12px)</span>
            <Progress value={60} className="h-3" />
          </div>
          <div className="flex flex-col gap-gp-xs">
            <span className="text-body-xs text-fg-subtle">h-4 (16px)</span>
            <Progress value={60} className="h-4" />
          </div>
        </div>
      </ExampleSection>

      {/* Colors */}
      <ExampleSection
        id="ex-colors"
        title="Colors"
        description="The indicator inherits the primary brand color by default. Custom indicator colors require overriding the indicator's className through a wrapper approach or direct style."
        code={`{/* Default — uses primary brand color */}\n<Progress value={75} />`}
      >
        <div className="flex flex-col gap-gp-3xl w-full max-w-sm">
          <div className="flex flex-col gap-gp-xs">
            <span className="text-body-xs text-fg-subtle">Default (primary)</span>
            <Progress value={75} />
          </div>
        </div>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">Progress</h3>
        <p className="text-body-md text-fg-muted mb-gp-3xl">
          Based on <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">@radix-ui/react-progress</code>.
          Accepts all standard div attributes.
        </p>
        <PropsTable items={PROPS} />
      </div>
    </DocLayout>
  );
}
