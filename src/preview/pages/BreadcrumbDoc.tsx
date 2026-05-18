import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "../../components/shadcn/breadcrumb";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";

const TOC = [{ id: "examples", label: "Examples" }, { id: "ex-default", label: "Default" }, { id: "api", label: "API Reference" }];
const PROPS = [
  { name: "separator", type: "ReactNode", defaultVal: "ChevronRight" },
];

export function BreadcrumbDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Navigation" title="Breadcrumb" description="Hierarchical navigation path." />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />
      <ExampleSection id="ex-default" title="Default" description="Three-level breadcrumb with active page.">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink href="#">Products</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Details</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </ExampleSection>
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
