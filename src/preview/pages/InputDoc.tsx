import { Input } from "../../components/shadcn/input";
import { Label } from "../../components/shadcn/label";
import { Button } from "../../components/ui/Button/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/shadcn/card";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default" },
  { id: "ex-with-label", label: "With Label" },
  { id: "ex-sizes", label: "Sizes" },
  { id: "ex-file", label: "File" },
  { id: "ex-disabled", label: "Disabled" },
  { id: "ex-with-button", label: "With Button" },
  { id: "ex-form", label: "Form" },
  { id: "api", label: "API Reference" },
];
const PROPS = [
  { name: "size", type: '"2xs" | "xs" | "sm" | "md"', defaultVal: '"sm"' },
  { name: "disabled", type: "boolean", defaultVal: "false" },
  { name: "placeholder", type: "string", defaultVal: "—" },
  { name: "type", type: "string", defaultVal: '"text"' },
];

export function InputDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Form Controls" title="Input" description="Text input field with multiple sizes. Aligns with Button and Select heights." />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-default"
        title="Default"
        description="Basic text input with placeholder."
        code={`<Input placeholder="Email" />`}
      >
        <div className="max-w-sm w-full">
          <Input placeholder="Email" />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-with-label"
        title="With Label"
        description="Pair with the Label component for accessible forms."
        code={`<div className="grid gap-gp-md">
  <Label htmlFor="email">Email</Label>
  <Input id="email" placeholder="you@example.com" />
</div>`}
      >
        <div className="grid gap-gp-md max-w-sm w-full">
          <Label htmlFor="email-demo">Email</Label>
          <Input id="email-demo" placeholder="you@example.com" />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-sizes"
        title="Sizes"
        description="All four sizes. Heights align with Button for inline form layouts."
        code={`<Input size="xxs" placeholder="Size XXS (28px)" />
<Input size="xs" placeholder="Size XS (32px)" />
<Input size="sm" placeholder="Size SM (36px)" />
<Input size="md" placeholder="Size MD (40px)" />`}
      >
        <div className="flex flex-col gap-gp-xl max-w-sm w-full">
          <Input size="xxs" placeholder="Size XXS (28px)" />
          <Input size="xs" placeholder="Size XS (32px)" />
          <Input size="sm" placeholder="Size SM (36px)" />
          <Input size="md" placeholder="Size MD (40px)" />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-file"
        title="File"
        description="File input for uploads."
        code={`<div className="grid gap-gp-md">
  <Label htmlFor="picture">Picture</Label>
  <Input id="picture" type="file" />
</div>`}
      >
        <div className="grid gap-gp-md max-w-sm w-full">
          <Label htmlFor="picture-demo">Picture</Label>
          <Input id="picture-demo" type="file" />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-disabled"
        title="Disabled"
        description="Disabled inputs prevent user interaction."
        code={`<Input disabled placeholder="Disabled" />`}
      >
        <div className="max-w-sm w-full">
          <Input disabled placeholder="Disabled" />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-with-button"
        title="With Button"
        description="Combine Input and Button inline for search bars or subscribe forms."
        code={`<div className="flex gap-gp-md">
  <Input placeholder="Search..." />
  <Button color="primary" variant="filled" size="sm">
    Search
  </Button>
</div>`}
      >
        <div className="flex gap-gp-md max-w-md w-full">
          <Input placeholder="Search..." />
          <Button color="primary" variant="filled" size="sm">Search</Button>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-form"
        title="Form"
        description="Mini form card combining multiple inputs with labels and a submit button."
        code={`<Card className="max-w-sm w-full">
  <CardHeader>
    <CardTitle>Create account</CardTitle>
    <CardDescription>Enter your details below.</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid gap-gp-3xl">
      <div className="grid gap-gp-md">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="John Doe" />
      </div>
      <div className="grid gap-gp-md">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>
    </div>
  </CardContent>
  <CardFooter>
    <Button color="primary" variant="filled" size="sm" className="w-full">
      Submit
    </Button>
  </CardFooter>
</Card>`}
      >
        <Card className="max-w-sm w-full">
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>Enter your details below.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-gp-3xl">
              <div className="grid gap-gp-md">
                <Label htmlFor="form-name">Name</Label>
                <Input id="form-name" placeholder="John Doe" />
              </div>
              <div className="grid gap-gp-md">
                <Label htmlFor="form-email">Email</Label>
                <Input id="form-email" type="email" placeholder="you@example.com" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="button" color="primary" variant="filled" size="sm" className="w-full">Submit</Button>
          </CardFooter>
        </Card>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
