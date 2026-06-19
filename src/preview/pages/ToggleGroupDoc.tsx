import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "../../components/shadcn/toggle-group";
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
  { id: "ex-single", label: "Single" },
  { id: "ex-multiple", label: "Multiple" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "type", type: '"single" | "multiple" (obrigatório)', defaultVal: "—" },
  { name: "value / onValueChange", type: "string (single) | string[] (multiple)", defaultVal: "—" },
  { name: "variant / size", type: "herdados pelos itens (default | outline · sm/default/lg)", defaultVal: "default" },
  { name: "ToggleGroupItem value", type: "string — identifica o item", defaultVal: "—" },
];

function SingleExample() {
  const [value, setValue] = useState("center");
  return (
    <ToggleGroup type="single" variant="outline" value={value} onValueChange={(v) => v && setValue(v)}>
      <ToggleGroupItem value="left" aria-label="Esquerda"><Icon name="line-arrow-back" /></ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Centro"><Icon name="line-status" /></ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="Direita"><Icon name="line-circle-arrow-right" /></ToggleGroupItem>
    </ToggleGroup>
  );
}

function MultipleExample() {
  const [value, setValue] = useState<string[]>(["bold"]);
  return (
    <ToggleGroup type="multiple" variant="outline" value={value} onValueChange={setValue}>
      <ToggleGroupItem value="bold" aria-label="Negrito"><Icon name="line-edit" /></ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Itálico"><Icon name="line-edit-doc" /></ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Sublinhado"><Icon name="line-add" /></ToggleGroupItem>
    </ToggleGroup>
  );
}

export function ToggleGroupDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Toggle Group"
        description="Conjunto de toggles relacionados (segmented). type='single' (escolha única) ou 'multiple' (várias). Para split-button de ações, veja também o ButtonGroup do DS."
        dependency="@radix-ui/react-toggle-group"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-single"
        title="Single"
        description="Escolha única (value: string). Mantém sempre uma opção ativa."
        code={`<ToggleGroup type="single" value={v} onValueChange={setV}>
  <ToggleGroupItem value="left">…</ToggleGroupItem>
  <ToggleGroupItem value="center">…</ToggleGroupItem>
</ToggleGroup>`}
      >
        <SingleExample />
      </ExampleSection>

      <ExampleSection
        id="ex-multiple"
        title="Multiple"
        description="Várias ativas ao mesmo tempo (value: string[])."
        code={`<ToggleGroup type="multiple" value={v} onValueChange={setV}>…</ToggleGroup>`}
      >
        <MultipleExample />
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default ToggleGroupDoc;
