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

      <ExampleSection
        id="ex-weight"
        title="weight"
        description="Default \`semibold\` — rótulo de CAMPO é contraste de leitura (WCAG). Use \`regular\` no rótulo de OPÇÃO dentro de um grupo: ali o destaque pertence à legenda, e oito opções em 600 achatam a hierarquia que o 600 deveria criar."
        code={`<Label>Nome do cliente</Label>                    // campo
<Label weight="regular">Receber notificações</Label>  // opção`}
      >
        <div className="flex flex-col gap-gp-md">
          <Label>Nome do cliente (default, semibold)</Label>
          <Label weight="regular">Receber notificações (regular)</Label>
        </div>
      </ExampleSection>

      <ExampleSection id="ex-default" title="Default" description="Label paired with an input.">
        <div className="flex flex-col gap-gp-lg max-w-page-sm w-full">
          <Label htmlFor="email">Email</Label>
          <Input id="email" size="sm" placeholder="you@example.com" />
        </div>
      </ExampleSection>
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
