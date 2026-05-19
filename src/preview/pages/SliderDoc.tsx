import { useState } from "react";
import { Slider } from "../../components/shadcn/slider";
import { Label } from "../../components/shadcn/label";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default" },
  { id: "ex-range", label: "Range" },
  { id: "ex-multiple", label: "Multiple Thumbs" },
  { id: "ex-controlled", label: "Controlled" },
  { id: "ex-disabled", label: "Disabled" },
  { id: "ex-steps", label: "Steps" },
  { id: "api", label: "API Reference" },
];
const PROPS = [
  { name: "defaultValue", type: "number[]", defaultVal: "[50]" },
  { name: "value", type: "number[]", defaultVal: "—" },
  { name: "min", type: "number", defaultVal: "0" },
  { name: "max", type: "number", defaultVal: "100" },
  { name: "step", type: "number", defaultVal: "1" },
  { name: "disabled", type: "boolean", defaultVal: "false" },
  { name: "orientation", type: '"horizontal" | "vertical"', defaultVal: '"horizontal"' },
  { name: "onValueChange", type: "(value: number[]) => void", defaultVal: "—" },
];

export function SliderDoc() {
  const [val, setVal] = useState([33]);
  const [temp, setTemp] = useState([0.7]);
  const [range, setRange] = useState([25, 75]);

  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Form Controls" title="Slider" description="Range input with thumb control for selecting values within a range." dependency="@radix-ui/react-slider" />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      {/* Default */}
      <ExampleSection
        id="ex-default"
        title="Default"
        description="Drag the thumb to set a value."
        code={`<Slider defaultValue={[33]} max={100} step={1} />`}
      >
        <div className="flex flex-col gap-gp-xl max-w-sm w-full">
          <Slider value={val} onValueChange={setVal} />
          <p className="text-body-md font-medium text-fg-muted text-center tabular-nums">Value: {val[0]}</p>
        </div>
      </ExampleSection>

      {/* Range */}
      <ExampleSection
        id="ex-range"
        title="Range"
        description="Pass two values to create a min/max range selector. Useful for price filters or time ranges."
        code={`const [range, setRange] = useState([25, 75]);\n\n<Slider\n  value={range}\n  onValueChange={setRange}\n  max={100}\n  step={1}\n/>\n<p>Range: {range[0]} — {range[1]}</p>`}
      >
        <div className="flex flex-col gap-gp-xl max-w-sm w-full">
          <Slider value={range} onValueChange={setRange} max={100} step={1} />
          <p className="text-body-md font-medium text-fg-muted text-center tabular-nums">
            Range: {range[0]} — {range[1]}
          </p>
        </div>
      </ExampleSection>

      {/* Multiple Thumbs */}
      <ExampleSection
        id="ex-multiple"
        title="Multiple Thumbs"
        description="Three or more thumbs for complex segmentation like audio equalization or multi-point ranges."
        code={`<Slider defaultValue={[10, 50, 90]} max={100} step={1} />`}
      >
        <div className="flex flex-col gap-gp-xl max-w-sm w-full">
          <Slider defaultValue={[10, 50, 90]} max={100} step={1} />
        </div>
      </ExampleSection>

      {/* Controlled */}
      <ExampleSection
        id="ex-controlled"
        title="Controlled"
        description="Bind the slider to state and display the value in real-time. Great for settings like temperature or volume."
        code={`const [temp, setTemp] = useState([0.7]);\n\n<Label>Temperature: {temp[0].toFixed(1)}</Label>\n<Slider\n  value={temp}\n  onValueChange={setTemp}\n  min={0}\n  max={2}\n  step={0.1}\n/>`}
      >
        <div className="flex flex-col gap-gp-xl max-w-sm w-full">
          <div className="flex items-center justify-between">
            <Label>Temperature</Label>
            <span className="text-body-md font-medium text-fg-muted tabular-nums">{temp[0].toFixed(1)}</span>
          </div>
          <Slider value={temp} onValueChange={setTemp} min={0} max={2} step={0.1} />
        </div>
      </ExampleSection>

      {/* Disabled */}
      <ExampleSection
        id="ex-disabled"
        title="Disabled"
        description="Prevents user interaction. The thumb and track are visually muted."
        code={`<Slider defaultValue={[50]} disabled />`}
      >
        <div className="w-full max-w-sm">
          <Slider defaultValue={[50]} disabled />
        </div>
      </ExampleSection>

      {/* Steps */}
      <ExampleSection
        id="ex-steps"
        title="Steps"
        description="Use step to create discrete jumps. The thumb snaps to each increment."
        code={`<Slider defaultValue={[50]} max={100} step={10} />`}
      >
        <div className="flex flex-col gap-gp-xl max-w-sm w-full">
          <div className="flex items-center justify-between">
            <Label>Volume</Label>
            <span className="text-body-xs text-fg-subtle">step=10</span>
          </div>
          <Slider defaultValue={[50]} max={100} step={10} />
          <div className="flex justify-between text-caption-sm text-fg-subtle">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60</span>
            <span>80</span>
            <span>100</span>
          </div>
        </div>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">Slider</h3>
        <p className="text-body-md text-fg-muted mb-gp-3xl">
          Based on <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">@radix-ui/react-slider</code>.
          Accepts all standard div attributes.
        </p>
        <PropsTable items={PROPS} />
      </div>
    </DocLayout>
  );
}
