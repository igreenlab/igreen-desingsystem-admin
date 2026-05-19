import { RadioGroup, RadioGroupItem } from "../../components/shadcn/radio-group";
import { Label } from "../../components/shadcn/label";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default" },
  { id: "ex-with-description", label: "With Description" },
  { id: "ex-card-selection", label: "Card Selection" },
  { id: "ex-horizontal", label: "Horizontal" },
  { id: "ex-disabled", label: "Disabled" },
  { id: "api", label: "API Reference" },
];
const PROPS = [
  { name: "defaultValue", type: "string", defaultVal: "—" },
  { name: "value", type: "string", defaultVal: "—" },
  { name: "onValueChange", type: "(value: string) => void", defaultVal: "—" },
  { name: "disabled", type: "boolean", defaultVal: "false" },
];

export function RadioGroupDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Form Controls" title="Radio Group" description="Single selection from a set of options." dependency="@radix-ui/react-radio-group" />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      {/* Default */}
      <ExampleSection
        id="ex-default"
        title="Default"
        description="Vertical radio group with three options."
        code={`<RadioGroup defaultValue="option-1">
  <div className="flex items-center gap-gp-xl">
    <RadioGroupItem value="option-1" id="r-default-1" />
    <Label htmlFor="r-default-1">Option 1</Label>
  </div>
  <div className="flex items-center gap-gp-xl">
    <RadioGroupItem value="option-2" id="r-default-2" />
    <Label htmlFor="r-default-2">Option 2</Label>
  </div>
  <div className="flex items-center gap-gp-xl">
    <RadioGroupItem value="option-3" id="r-default-3" />
    <Label htmlFor="r-default-3">Option 3</Label>
  </div>
</RadioGroup>`}
      >
        <RadioGroup defaultValue="option-1" className="flex flex-col gap-gp-2xl">
          {["Option 1", "Option 2", "Option 3"].map((opt, i) => (
            <div key={opt} className="flex items-center gap-gp-xl">
              <RadioGroupItem value={`option-${i + 1}`} id={`r-default-${i + 1}`} />
              <Label htmlFor={`r-default-${i + 1}`}>{opt}</Label>
            </div>
          ))}
        </RadioGroup>
      </ExampleSection>

      {/* With Description */}
      <ExampleSection
        id="ex-with-description"
        title="With Description"
        description="Radio items with label and descriptive text below each option."
        code={`<RadioGroup defaultValue="email" className="flex flex-col gap-gp-3xl">
  <div className="flex items-start gap-gp-xl">
    <RadioGroupItem value="email" id="r-desc-email" className="mt-1" />
    <div className="flex flex-col gap-gp-xs">
      <Label htmlFor="r-desc-email">Email</Label>
      <p className="text-body-md text-fg-muted">
        Get notified via email.
      </p>
    </div>
  </div>
  ...
</RadioGroup>`}
      >
        <RadioGroup defaultValue="email" className="flex flex-col gap-gp-3xl">
          {[
            { value: "email", label: "Email", desc: "Get notified via email." },
            { value: "sms", label: "SMS", desc: "Receive text messages on your phone." },
            { value: "push", label: "Push Notifications", desc: "Get push notifications on your device." },
          ].map((item) => (
            <div key={item.value} className="flex items-start gap-gp-xl">
              <RadioGroupItem value={item.value} id={`r-desc-${item.value}`} className="mt-1" />
              <div className="flex flex-col gap-gp-xs">
                <Label htmlFor={`r-desc-${item.value}`}>{item.label}</Label>
                <p className="text-body-md text-fg-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </ExampleSection>

      {/* Card Selection */}
      <ExampleSection
        id="ex-card-selection"
        title="Card Selection"
        description="Radio items styled as selectable cards with border highlight."
        code={`<RadioGroup defaultValue="standard">
  <label className="rounded-radius-base border border-border-subtle p-pad-3xl flex items-start gap-gp-xl cursor-pointer has-[[data-state=checked]]:bg-bg-subtle">
    <RadioGroupItem value="standard" id="r-card-standard" />
    <div className="flex flex-col gap-gp-xs">
      <span className="text-body-md font-medium">Standard</span>
      <span className="text-body-md text-fg-muted">4-10 business days</span>
    </div>
  </label>
  ...
</RadioGroup>`}
      >
        <RadioGroup defaultValue="standard" className="flex flex-col gap-gp-2xl w-full max-w-sm">
          {[
            { value: "standard", label: "Standard", desc: "4-10 business days" },
            { value: "express", label: "Express", desc: "2-3 business days" },
            { value: "overnight", label: "Overnight", desc: "Next business day" },
          ].map((item) => (
            <label
              key={item.value}
              className="rounded-radius-base border border-border-subtle p-pad-3xl flex items-start gap-gp-xl cursor-pointer transition-colors has-[[data-state=checked]]:bg-bg-subtle"
            >
              <RadioGroupItem value={item.value} id={`r-card-${item.value}`} />
              <div className="flex flex-col gap-gp-xs">
                <span className="text-body-md font-medium text-fg-default">{item.label}</span>
                <span className="text-body-md text-fg-muted">{item.desc}</span>
              </div>
            </label>
          ))}
        </RadioGroup>
      </ExampleSection>

      {/* Horizontal */}
      <ExampleSection
        id="ex-horizontal"
        title="Horizontal"
        description="Radio group laid out in a horizontal row."
        code={`<RadioGroup defaultValue="option-1" className="flex flex-row gap-gp-3xl">
  <div className="flex items-center gap-gp-xl">
    <RadioGroupItem value="option-1" id="r-h-1" />
    <Label htmlFor="r-h-1">Option 1</Label>
  </div>
  <div className="flex items-center gap-gp-xl">
    <RadioGroupItem value="option-2" id="r-h-2" />
    <Label htmlFor="r-h-2">Option 2</Label>
  </div>
  <div className="flex items-center gap-gp-xl">
    <RadioGroupItem value="option-3" id="r-h-3" />
    <Label htmlFor="r-h-3">Option 3</Label>
  </div>
</RadioGroup>`}
      >
        <RadioGroup defaultValue="option-1" className="flex flex-row gap-gp-3xl">
          {["Option 1", "Option 2", "Option 3"].map((opt, i) => (
            <div key={opt} className="flex items-center gap-gp-xl">
              <RadioGroupItem value={`option-${i + 1}`} id={`r-h-${i + 1}`} />
              <Label htmlFor={`r-h-${i + 1}`}>{opt}</Label>
            </div>
          ))}
        </RadioGroup>
      </ExampleSection>

      {/* Disabled */}
      <ExampleSection
        id="ex-disabled"
        title="Disabled"
        description="Radio group items in a disabled state."
        code={`<RadioGroup defaultValue="option-1" disabled>
  <div className="flex items-center gap-gp-xl">
    <RadioGroupItem value="option-1" id="r-dis-1" />
    <Label htmlFor="r-dis-1" className="text-fg-muted">Selected (disabled)</Label>
  </div>
  <div className="flex items-center gap-gp-xl">
    <RadioGroupItem value="option-2" id="r-dis-2" />
    <Label htmlFor="r-dis-2" className="text-fg-muted">Unselected (disabled)</Label>
  </div>
</RadioGroup>`}
      >
        <RadioGroup defaultValue="option-1" disabled className="flex flex-col gap-gp-2xl">
          <div className="flex items-center gap-gp-xl">
            <RadioGroupItem value="option-1" id="r-dis-1" />
            <Label htmlFor="r-dis-1" className="text-fg-muted">Selected (disabled)</Label>
          </div>
          <div className="flex items-center gap-gp-xl">
            <RadioGroupItem value="option-2" id="r-dis-2" />
            <Label htmlFor="r-dis-2" className="text-fg-muted">Unselected (disabled)</Label>
          </div>
        </RadioGroup>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
