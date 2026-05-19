import { useState } from "react";
import { Checkbox } from "../../components/shadcn/checkbox";
import { Label } from "../../components/shadcn/label";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default" },
  { id: "ex-with-description", label: "With Description" },
  { id: "ex-disabled", label: "Disabled" },
  { id: "ex-group", label: "Group" },
  { id: "ex-controlled", label: "Controlled" },
  { id: "api", label: "API Reference" },
];
const PROPS = [
  { name: "checked", type: "boolean | 'indeterminate'", defaultVal: "false" },
  { name: "defaultChecked", type: "boolean", defaultVal: "false" },
  { name: "onCheckedChange", type: "(checked: boolean | 'indeterminate') => void", defaultVal: "—" },
  { name: "disabled", type: "boolean", defaultVal: "false" },
];

export function CheckboxDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Form Controls" title="Checkbox" description="Allows multiple selections from a set of options." dependency="@radix-ui/react-checkbox" />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      {/* Default */}
      <ExampleSection
        id="ex-default"
        title="Default"
        description="Basic checkbox with a label."
        code={`<div className="flex items-center gap-gp-xl">
  <Checkbox id="cb-default" />
  <Label htmlFor="cb-default">Accept terms and conditions</Label>
</div>`}
      >
        <div className="flex items-center gap-gp-xl">
          <Checkbox id="cb-default" />
          <Label htmlFor="cb-default">Accept terms and conditions</Label>
        </div>
      </ExampleSection>

      {/* With Description */}
      <ExampleSection
        id="ex-with-description"
        title="With Description"
        description="Checkbox with a label and descriptive text below."
        code={`<div className="flex items-start gap-gp-xl">
  <Checkbox id="cb-terms" className="mt-1" />
  <div className="flex flex-col gap-gp-xs">
    <Label htmlFor="cb-terms">Accept terms and conditions</Label>
    <p className="text-body-md text-fg-muted">
      By checking this box, you agree to our Terms of Service and Privacy Policy.
    </p>
  </div>
</div>`}
      >
        <div className="flex items-start gap-gp-xl">
          <Checkbox id="cb-terms" className="mt-1" />
          <div className="flex flex-col gap-gp-xs">
            <Label htmlFor="cb-terms">Accept terms and conditions</Label>
            <p className="text-body-md text-fg-muted">By checking this box, you agree to our Terms of Service and Privacy Policy.</p>
          </div>
        </div>
      </ExampleSection>

      {/* Disabled */}
      <ExampleSection
        id="ex-disabled"
        title="Disabled"
        description="Checkbox in a disabled state, both checked and unchecked."
        code={`<div className="flex flex-col gap-gp-2xl">
  <div className="flex items-center gap-gp-xl">
    <Checkbox id="cb-dis-checked" disabled defaultChecked />
    <Label htmlFor="cb-dis-checked" className="text-fg-muted">
      Checked (disabled)
    </Label>
  </div>
  <div className="flex items-center gap-gp-xl">
    <Checkbox id="cb-dis-unchecked" disabled />
    <Label htmlFor="cb-dis-unchecked" className="text-fg-muted">
      Unchecked (disabled)
    </Label>
  </div>
</div>`}
      >
        <div className="flex flex-col gap-gp-2xl">
          <div className="flex items-center gap-gp-xl">
            <Checkbox id="cb-dis-checked" disabled defaultChecked />
            <Label htmlFor="cb-dis-checked" className="text-fg-muted">Checked (disabled)</Label>
          </div>
          <div className="flex items-center gap-gp-xl">
            <Checkbox id="cb-dis-unchecked" disabled />
            <Label htmlFor="cb-dis-unchecked" className="text-fg-muted">Unchecked (disabled)</Label>
          </div>
        </div>
      </ExampleSection>

      {/* Group */}
      <ExampleSection
        id="ex-group"
        title="Group"
        description="Multiple checkboxes presented as a selectable list."
        code={`<div className="flex flex-col gap-gp-2xl">
  <Label className="text-body-md font-medium">Select sidebar items</Label>
  {items.map((item) => (
    <div key={item.id} className="flex items-center gap-gp-xl">
      <Checkbox id={item.id} defaultChecked={item.checked} />
      <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
    </div>
  ))}
</div>`}
      >
        <div className="flex flex-col gap-gp-2xl">
          <span className="text-body-md font-medium text-fg-default">Select sidebar items</span>
          {[
            { id: "cb-g-hd", label: "Hard Disks", checked: true },
            { id: "cb-g-ext", label: "External Disks", checked: false },
            { id: "cb-g-srv", label: "Connected Servers", checked: true },
            { id: "cb-g-cloud", label: "Cloud Storage", checked: false },
            { id: "cb-g-tags", label: "Tags", checked: true },
          ].map((item) => (
            <div key={item.id} className="flex items-center gap-gp-xl">
              <Checkbox id={item.id} defaultChecked={item.checked} />
              <Label htmlFor={item.id} className="font-normal">{item.label}</Label>
            </div>
          ))}
        </div>
      </ExampleSection>

      {/* Controlled */}
      <ControlledCheckboxExample />

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

function ControlledCheckboxExample() {
  const [checked, setChecked] = useState(false);

  return (
    <ExampleSection
      id="ex-controlled"
      title="Controlled"
      description="Checkbox with controlled state via useState."
      code={`const [checked, setChecked] = useState(false);

<div className="flex flex-col gap-gp-2xl">
  <div className="flex items-center gap-gp-xl">
    <Checkbox
      id="cb-controlled"
      checked={checked}
      onCheckedChange={(v) => setChecked(v === true)}
    />
    <Label htmlFor="cb-controlled">
      Enable notifications
    </Label>
  </div>
  <p className="text-body-md text-fg-muted">
    Notifications are {checked ? "enabled" : "disabled"}.
  </p>
</div>`}
    >
      <div className="flex flex-col gap-gp-2xl">
        <div className="flex items-center gap-gp-xl">
          <Checkbox
            id="cb-controlled"
            checked={checked}
            onCheckedChange={(v) => setChecked(v === true)}
          />
          <Label htmlFor="cb-controlled">Enable notifications</Label>
        </div>
        <p className="text-body-md text-fg-muted">
          Notifications are {checked ? "enabled" : "disabled"}.
        </p>
      </div>
    </ExampleSection>
  );
}
