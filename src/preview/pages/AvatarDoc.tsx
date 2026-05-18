import { Avatar, AvatarImage, AvatarFallback } from "../../components/shadcn/avatar";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";

const TOC = [{ id: "examples", label: "Examples" }, { id: "ex-default", label: "Default" }, { id: "ex-sizes", label: "Sizes" }, { id: "api", label: "API Reference" }];
const PROPS = [
  { name: "className", type: "string", defaultVal: '"size-8"' },
  { name: "src (AvatarImage)", type: "string", defaultVal: "—" },
  { name: "children (AvatarFallback)", type: "ReactNode", defaultVal: "—" },
];

export function AvatarDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Data Display" title="Avatar" description="User profile image with fallback initials." dependency="@radix-ui/react-avatar" />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />
      <ExampleSection id="ex-default" title="Default" description="With image and fallback.">
        <div className="flex items-center gap-gp-xl">
          <Avatar><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>CN</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
        </div>
      </ExampleSection>
      <ExampleSection id="ex-sizes" title="Sizes" description="Override size via className.">
        <div className="flex items-center gap-gp-xl">
          <Avatar className="size-6"><AvatarFallback>XS</AvatarFallback></Avatar>
          <Avatar className="size-8"><AvatarFallback>SM</AvatarFallback></Avatar>
          <Avatar className="size-10"><AvatarFallback>MD</AvatarFallback></Avatar>
          <Avatar className="size-12"><AvatarFallback>LG</AvatarFallback></Avatar>
          <Avatar className="size-14"><AvatarFallback>XL</AvatarFallback></Avatar>
        </div>
      </ExampleSection>
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
