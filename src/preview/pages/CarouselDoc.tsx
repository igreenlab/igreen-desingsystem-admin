import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../../components/shadcn/carousel";
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
  { name: "Carousel", type: "raiz — `orientation`, `opts` (embla)", defaultVal: '"horizontal"' },
  { name: "CarouselContent / CarouselItem", type: "trilho + slides (use `basis-*` p/ N por vez)", defaultVal: "—" },
  { name: "CarouselPrevious / CarouselNext", type: "controles (Button do DS)", defaultVal: "—" },
];

export function CarouselDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Carousel"
        description="Slides navegáveis (Embla). Controles usam o Button do DS. Use basis-* nos itens pra mostrar vários por vez."
        dependency="embla-carousel-react"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Básico"
        description="Um slide por vez, com setas anterior/próxima."
        code={`<Carousel className="w-full max-w-xs">
  <CarouselContent>
    {items.map((i) => (
      <CarouselItem key={i}>…</CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`}
      >
        <div className="px-12">
          <Carousel className="w-full max-w-xs">
            <CarouselContent>
              {Array.from({ length: 5 }, (_, i) => (
                <CarouselItem key={i}>
                  <div className="grid aspect-square place-items-center rounded-radius-lg border border-border-subtle bg-bg-surface text-display-md font-bold text-fg-brand">
                    {i + 1}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default CarouselDoc;
