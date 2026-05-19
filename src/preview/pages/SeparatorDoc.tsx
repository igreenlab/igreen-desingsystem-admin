import { Separator } from "../../components/shadcn/separator";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";

const TOC = [{ id: "examples", label: "Examples" }, { id: "ex-default", label: "Default" }, { id: "api", label: "API Reference" }];
const PROPS = [
  { name: "orientation", type: '"horizontal" | "vertical"', defaultVal: '"horizontal"' },
  { name: "decorative", type: "boolean", defaultVal: "true" },
];

export function SeparatorDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Data Display" title="Separator" description="Visual divider between content sections." dependency="@radix-ui/react-separator" />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />
      <ExampleSection id="ex-default" title="Default" description="Horizontal separator between text blocks.">
        <div className="flex flex-col gap-gp-2xl w-full max-w-sm">
          <p className="text-body-md">Content above</p>
          <Separator />
          <p className="text-body-md">Content below</p>
        </div>
      </ExampleSection>
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
