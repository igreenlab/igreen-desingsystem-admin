import { useState } from "react";
import { Switch } from "../../components/shadcn/switch";
import { Label } from "../../components/shadcn/label";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default" },
  { id: "ex-with-description", label: "With Description" },
  { id: "ex-card-toggle", label: "Card Toggle" },
  { id: "ex-disabled", label: "Disabled" },
  { id: "ex-controlled", label: "Controlled" },
  { id: "api", label: "API Reference" },
];
const PROPS = [
  { name: "checked", type: "boolean", defaultVal: "false" },
  { name: "defaultChecked", type: "boolean", defaultVal: "false" },
  { name: "onCheckedChange", type: "(checked: boolean) => void", defaultVal: "—" },
  { name: "disabled", type: "boolean", defaultVal: "false" },
];

export function SwitchDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Form Controls" title="Switch" description="Toggle control for binary options." dependency="@radix-ui/react-switch" />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      {/* Default */}
      <ExampleSection
        id="ex-default"
        title="Default"
        description="Basic switch with a label."
        code={`<div className="flex items-center gap-gp-xl">
  <Switch id="sw-default" />
  <Label htmlFor="sw-default">Airplane Mode</Label>
</div>`}
      >
        <div className="flex items-center gap-gp-xl">
          <Switch id="sw-default" />
          <Label htmlFor="sw-default">Airplane Mode</Label>
        </div>
      </ExampleSection>

      {/* With Description */}
      <ExampleSection
        id="ex-with-description"
        title="With Description"
        description="Switch with label and descriptive helper text."
        code={`<div className="flex items-start gap-gp-3xl">
  <div className="flex flex-col gap-gp-xs flex-1">
    <Label htmlFor="sw-desc">Share across devices</Label>
    <p className="text-body-md text-fg-muted">
      Focus mode is shared across all your signed-in devices.
    </p>
  </div>
  <Switch id="sw-desc" />
</div>`}
      >
        <div className="flex items-start gap-gp-3xl w-full max-w-sm">
          <div className="flex flex-col gap-gp-xs flex-1">
            <Label htmlFor="sw-desc">Share across devices</Label>
            <p className="text-body-md text-fg-muted">Focus mode is shared across all your signed-in devices.</p>
          </div>
          <Switch id="sw-desc" />
        </div>
      </ExampleSection>

      {/* Card Toggle */}
      <ExampleSection
        id="ex-card-toggle"
        title="Card Toggle"
        description="Switches inside a card-like container, similar to a settings panel."
        code={`<div className="rounded-radius-base border border-border-default divide-y divide-border-default w-full max-w-sm">
  <div className="flex items-center justify-between p-pad-3xl">
    <div className="flex flex-col gap-gp-xs">
      <span className="text-body-md font-medium">Wi-Fi</span>
      <span className="text-body-md text-fg-muted">Connect to wireless networks.</span>
    </div>
    <Switch id="sw-wifi" defaultChecked />
  </div>
  <div className="flex items-center justify-between p-pad-3xl">
    <div className="flex flex-col gap-gp-xs">
      <span className="text-body-md font-medium">Bluetooth</span>
      <span className="text-body-md text-fg-muted">Allow Bluetooth connections.</span>
    </div>
    <Switch id="sw-bt" />
  </div>
</div>`}
      >
        <div className="rounded-radius-base border border-border-default divide-y divide-border-default w-full max-w-sm">
          {[
            { id: "sw-wifi", label: "Wi-Fi", desc: "Connect to wireless networks.", on: true },
            { id: "sw-bt", label: "Bluetooth", desc: "Allow Bluetooth connections.", on: false },
            { id: "sw-airdrop", label: "AirDrop", desc: "Share files with nearby devices.", on: true },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-pad-3xl">
              <div className="flex flex-col gap-gp-xs">
                <span className="text-body-md font-medium text-fg-default">{item.label}</span>
                <span className="text-body-md text-fg-muted">{item.desc}</span>
              </div>
              <Switch id={item.id} defaultChecked={item.on} />
            </div>
          ))}
        </div>
      </ExampleSection>

      {/* Disabled */}
      <ExampleSection
        id="ex-disabled"
        title="Disabled"
        description="Switch in a disabled state, both on and off."
        code={`<div className="flex flex-col gap-gp-2xl">
  <div className="flex items-center gap-gp-xl">
    <Switch id="sw-dis-on" disabled defaultChecked />
    <Label htmlFor="sw-dis-on" className="text-fg-muted">On (disabled)</Label>
  </div>
  <div className="flex items-center gap-gp-xl">
    <Switch id="sw-dis-off" disabled />
    <Label htmlFor="sw-dis-off" className="text-fg-muted">Off (disabled)</Label>
  </div>
</div>`}
      >
        <div className="flex flex-col gap-gp-2xl">
          <div className="flex items-center gap-gp-xl">
            <Switch id="sw-dis-on" disabled defaultChecked />
            <Label htmlFor="sw-dis-on" className="text-fg-muted">On (disabled)</Label>
          </div>
          <div className="flex items-center gap-gp-xl">
            <Switch id="sw-dis-off" disabled />
            <Label htmlFor="sw-dis-off" className="text-fg-muted">Off (disabled)</Label>
          </div>
        </div>
      </ExampleSection>

      {/* Controlled */}
      <ControlledSwitchExample />

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

function ControlledSwitchExample() {
  const [enabled, setEnabled] = useState(false);

  return (
    <ExampleSection
      id="ex-controlled"
      title="Controlled"
      description="Switch with controlled state via useState."
      code={`const [enabled, setEnabled] = useState(false);

<div className="flex flex-col gap-gp-2xl">
  <div className="flex items-center gap-gp-xl">
    <Switch
      id="sw-controlled"
      checked={enabled}
      onCheckedChange={setEnabled}
    />
    <Label htmlFor="sw-controlled">Marketing emails</Label>
  </div>
  <p className="text-body-md text-fg-muted">
    Marketing emails are {enabled ? "enabled" : "disabled"}.
  </p>
</div>`}
    >
      <div className="flex flex-col gap-gp-2xl">
        <div className="flex items-center gap-gp-xl">
          <Switch
            id="sw-controlled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
          <Label htmlFor="sw-controlled">Marketing emails</Label>
        </div>
        <p className="text-body-md text-fg-muted">
          Marketing emails are {enabled ? "enabled" : "disabled"}.
        </p>
      </div>
    </ExampleSection>
  );
}
