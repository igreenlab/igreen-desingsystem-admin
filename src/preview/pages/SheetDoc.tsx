import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "../../components/shadcn/sheet";
import { Button } from "../../components/ui/Button";
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
  { id: "ex-sides", label: "Lados" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "Sheet", type: "raiz (open / defaultOpen / onOpenChange)", defaultVal: "—" },
  { name: "SheetTrigger", type: "gatilho — `asChild` herda o elemento", defaultVal: "—" },
  { name: "SheetContent", type: 'painel — `side="right|left|top|bottom"`', defaultVal: 'side="right"' },
  { name: "SheetHeader / SheetTitle / SheetDescription", type: "cabeçalho do painel", defaultVal: "—" },
  { name: "SheetFooter / SheetClose", type: "rodapé + fechar", defaultVal: "—" },
];

export function SheetDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Sheet"
        description="Painel deslizante a partir de uma borda (Radix Dialog). Base do Panel do DS. Para formulários de criar/editar no padrão, prefira o composto Panel; use Sheet cru para casos simples."
        dependency="@radix-ui/react-dialog"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Básico"
        description="Trigger + Content com header/footer. Fecha no SheetClose, Esc ou clique-fora."
        code={`<Sheet>
  <SheetTrigger asChild>
    <Button>Abrir painel</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Detalhes</SheetTitle>
      <SheetDescription>Informações do registro.</SheetDescription>
    </SheetHeader>
    <SheetFooter>
      <SheetClose asChild><Button>Fechar</Button></SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>`}
      >
        <Sheet>
          <SheetTrigger asChild>
            <Button color="secondary" variant="outline">Abrir painel</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Detalhes</SheetTitle>
              <SheetDescription>Informações do registro.</SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <SheetClose asChild>
                <Button color="secondary" variant="outline">Fechar</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </ExampleSection>

      <ExampleSection
        id="ex-sides"
        title="Lados"
        description="side = right (default) | left | top | bottom."
        code={`<SheetContent side="left">…</SheetContent>`}
      >
        <div className="flex flex-wrap items-center gap-gp-md">
          {(["right", "left", "top", "bottom"] as const).map((side) => (
            <Sheet key={side}>
              <SheetTrigger asChild>
                <Button color="secondary" variant="outline" size="sm">{side}</Button>
              </SheetTrigger>
              <SheetContent side={side}>
                <SheetHeader>
                  <SheetTitle>Painel {side}</SheetTitle>
                  <SheetDescription>Desliza a partir de {side}.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          ))}
        </div>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default SheetDoc;
