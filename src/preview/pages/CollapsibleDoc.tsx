import { useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../../components/shadcn/collapsible";
import { Button } from "../../components/ui/Button";
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
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "Collapsible", type: "raiz — open / defaultOpen / onOpenChange / disabled", defaultVal: "—" },
  { name: "CollapsibleTrigger", type: "gatilho — use `asChild` pra herdar o elemento", defaultVal: "—" },
  { name: "CollapsibleContent", type: "conteúdo que expande/colapsa", defaultVal: "—" },
];

function BasicExample() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-[420px]">
      <div className="flex items-center justify-between rounded-radius-lg border border-border-subtle bg-bg-surface px-pad-card-base py-pad-lg">
        <span className="text-body-md font-semibold text-fg-default">Filtros avançados</span>
        <CollapsibleTrigger asChild>
          <Button color="secondary" variant="ghost" size="icon-sm" aria-label="Expandir">
            <Icon name={open ? "line-remove" : "line-add"} />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-gp-sm flex flex-col gap-gp-sm">
        {["Status", "Plano", "Cidade"].map((f) => (
          <div key={f} className="rounded-radius-md border border-border-subtle bg-bg-canvas px-pad-card-base py-pad-md text-body-sm text-fg-muted">
            {f}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function CollapsibleDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Collapsible"
        description="Mostra/esconde uma seção (Radix). Sem estilo próprio — você compõe trigger e conteúdo. Ideal pra grupos de filtro, 'ver mais', seções recolhíveis."
        dependency="@radix-ui/react-collapsible"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Básico"
        description="Trigger via asChild + conteúdo que expande. Controlado por open/onOpenChange (ou defaultOpen)."
        code={`<Collapsible open={open} onOpenChange={setOpen}>
  <CollapsibleTrigger asChild>
    <Button>Toggle</Button>
  </CollapsibleTrigger>
  <CollapsibleContent>…conteúdo…</CollapsibleContent>
</Collapsible>`}
      >
        <BasicExample />
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default CollapsibleDoc;
