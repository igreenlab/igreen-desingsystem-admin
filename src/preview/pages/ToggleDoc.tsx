import { Toggle } from "../../components/shadcn/toggle";
import { Icon } from "../../components/ui/Icon";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-basic", label: "Básico" },
  { id: "ex-variants", label: "Variantes" },
  { id: "ex-sizes", label: "Tamanhos" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "pressed / defaultPressed", type: "boolean (controlado / inicial)", defaultVal: "—" },
  { name: "onPressedChange", type: "(pressed: boolean) => void", defaultVal: "—" },
  { name: "variant", type: '"default" | "outline"', defaultVal: '"default"' },
  { name: "size", type: '"sm" | "default" | "lg"', defaultVal: '"default"' },
  { name: "disabled", type: "boolean", defaultVal: "false" },
];

export function ToggleDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Toggle"
        description="Botão de dois estados (on/off). Tokenizado iGreen: estado ativo = bg-brand-subtle + fg-brand. Para escolher entre opções mutuamente exclusivas, use ToggleGroup."
        dependency="@radix-ui/react-toggle"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Básico"
        description="Clique alterna on/off (data-state=on)."
        code={`<Toggle aria-label="Negrito"><Icon name="line-edit" /> Negrito</Toggle>`}
      >
        <div className="flex items-center gap-gp-md">
          <Toggle aria-label="Negrito"><Icon name="line-edit" /> Negrito</Toggle>
          <Toggle defaultPressed aria-label="Favorito"><Icon name="line-status" /> Ativo</Toggle>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-variants"
        title="Variantes"
        description="default (sem borda) e outline."
        code={`<Toggle variant="default">A</Toggle>
<Toggle variant="outline">A</Toggle>`}
      >
        <div className="flex items-center gap-gp-md">
          <Toggle variant="default" aria-label="default"><Icon name="line-edit" /></Toggle>
          <Toggle variant="outline" aria-label="outline"><Icon name="line-edit" /></Toggle>
          <Toggle variant="outline" defaultPressed aria-label="outline ativo"><Icon name="line-edit" /></Toggle>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-sizes"
        title="Tamanhos"
        description="sm (36px) · default (40px) · lg (44px)."
        code={`<Toggle size="sm" /> <Toggle size="default" /> <Toggle size="lg" />`}
      >
        <div className="flex items-center gap-gp-md">
          <Toggle size="sm" variant="outline" aria-label="sm"><Icon name="line-edit" /></Toggle>
          <Toggle size="default" variant="outline" aria-label="default"><Icon name="line-edit" /></Toggle>
          <Toggle size="lg" variant="outline" aria-label="lg"><Icon name="line-edit" /></Toggle>
        </div>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default ToggleDoc;
