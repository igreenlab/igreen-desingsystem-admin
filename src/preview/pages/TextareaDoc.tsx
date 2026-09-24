import { Textarea } from "../../components/shadcn/textarea";
import { Label } from "../../components/shadcn/label";
import { Button } from "../../components/ui/Button/button";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";

const TOC = [
  { id: "ex-rows", label: "rows diminui a altura" },
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default" },
  { id: "ex-with-label", label: "With Label" },
  { id: "ex-disabled", label: "Disabled" },
  { id: "ex-with-button", label: "With Button" },
  { id: "api", label: "API Reference" },
];
const PROPS = [
  { name: "placeholder", type: "string", defaultVal: "—" },
  { name: "disabled", type: "boolean", defaultVal: "false" },
  { name: "rows", type: "number", defaultVal: "—" },
];

export function TextareaDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Form Controls" title="Textarea" description="Multi-line text input for longer content." />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-rows"
        title="rows diminui a altura"
        description="O piso de 100px só vale na AUSÊNCIA de \`rows\`. Antes ele estava na base, então \`rows={2}\` não encolhia nada e o consumidor anulava na mão. Com \`rows\`, manda o browser."
        code={`<Textarea placeholder="Sem rows — piso de 100px" />
<Textarea rows={2} placeholder="rows={2} — duas linhas" />`}
      >
        <div className="flex flex-col gap-gp-lg max-w-page-sm">
          <Textarea placeholder="Sem rows — piso de 100px" />
          <Textarea rows={2} placeholder="rows={2} — duas linhas" />
        </div>
      </ExampleSection>


      <ExampleSection
        id="ex-default"
        title="Default"
        description="Basic textarea with placeholder."
        code={`<Textarea placeholder="Type your message here." />`}
      >
        <div className="max-w-page-sm w-full">
          <Textarea placeholder="Type your message here." />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-with-label"
        title="With Label"
        description="Pair with Label and a description for accessible forms."
        code={`<div className="grid gap-gp-md">
  <Label htmlFor="message">Your message</Label>
  <Textarea id="message" placeholder="Type your message here." />
  <p className="text-caption-sm text-fg-muted">
    Your message will be sent to our support team.
  </p>
</div>`}
      >
        <div className="grid gap-gp-md max-w-page-sm w-full">
          <Label htmlFor="message-demo">Your message</Label>
          <Textarea id="message-demo" placeholder="Type your message here." />
          <p className="text-caption-sm text-fg-muted">
            Your message will be sent to our support team.
          </p>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-disabled"
        title="Disabled"
        description="Disabled textareas prevent user interaction."
        code={`<Textarea disabled placeholder="This textarea is disabled." />`}
      >
        <div className="max-w-page-sm w-full">
          <Textarea disabled placeholder="This textarea is disabled." />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-with-button"
        title="With Button"
        description="Textarea with a submit button below, useful for comment or messaging interfaces."
        code={`<div className="grid gap-gp-md">
  <Textarea placeholder="Write your comment..." />
  <Button color="primary" variant="filled" size="sm">
    Send message
  </Button>
</div>`}
      >
        <div className="grid gap-gp-md max-w-page-sm w-full">
          <Textarea placeholder="Write your comment..." />
          <Button type="button" color="primary" variant="filled" size="sm">Send message</Button>
        </div>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
