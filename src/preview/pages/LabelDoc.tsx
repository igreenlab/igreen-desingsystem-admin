import { Label } from "../../components/shadcn/label";
import { Input } from "../../components/shadcn/input";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";

const TOC = [{ id: "examples", label: "Examples" }, { id: "ex-default", label: "Default" }, { id: "api", label: "API Reference" }];
const PROPS = [
  { name: "htmlFor", type: "string", defaultVal: "—" },
  { name: "children", type: "ReactNode", defaultVal: "—" },
];

export function LabelDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Form Controls" title="Label" description="Accessible label for form controls." dependency="@radix-ui/react-label" />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />
      <ExampleSection id="ex-default" title="Default" description="Label paired with an input.">
        <div className="flex flex-col gap-gp-lg max-w-sm w-full">
          <Label htmlFor="email">Email</Label>
          <Input id="email" size="sm" placeholder="you@example.com" />
        </div>
      </ExampleSection>
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
