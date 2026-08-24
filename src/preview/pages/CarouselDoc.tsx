import {
  Carousel,
  CarouselContent,
  CarouselDots,
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
  { id: "ex-dots", label: "Indicador de posição" },
  { id: "ex-dots-multi", label: "Vários por parada" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "Carousel", type: "raiz — `orientation`, `opts` (embla)", defaultVal: '"horizontal"' },
  { name: "CarouselContent / CarouselItem", type: "trilho + slides (use `basis-*` p/ N por vez)", defaultVal: "—" },
  { name: "CarouselPrevious / CarouselNext", type: "controles (Button do DS)", defaultVal: "—" },
  {
    name: "CarouselDots",
    type: "indicador de posição, clicável — um ponto por PARADA (`scrollSnapList`), não por slide. Some sozinho com 1 parada",
    defaultVal: "—",
  },
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

      <ExampleSection
        id="ex-dots"
        title="Indicador de posição"
        description="<CarouselDots /> mostra em qual card você está e leva pra qualquer um no clique. Vai FORA do CarouselContent — normalmente abaixo."
        code={`<Carousel className="w-full max-w-xs">
  <CarouselContent>…</CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
  <CarouselDots className="mt-gp-md" />
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
            <CarouselDots className="mt-gp-md" />
          </Carousel>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-dots-multi"
        title="Vários por parada"
        description="Um ponto por PARADA, não por slide: 6 slides com slidesToScroll: 2 dão 3 pontos. Contar CarouselItem daria 6, e os últimos não levariam a lugar nenhum."
        code={`<Carousel opts={{ slidesToScroll: 2 }}>
  <CarouselContent>
    {items.map((i) => (
      <CarouselItem key={i} className="basis-1/2">…</CarouselItem>
    ))}
  </CarouselContent>
  <CarouselDots className="mt-gp-md" />
</Carousel>`}
      >
        <div className="px-12">
          <Carousel className="w-full max-w-sm" opts={{ slidesToScroll: 2 }}>
            <CarouselContent>
              {Array.from({ length: 6 }, (_, i) => (
                <CarouselItem key={i} className="basis-1/2">
                  <div className="grid aspect-square place-items-center rounded-radius-lg border border-border-subtle bg-bg-surface text-heading-md font-bold text-fg-muted">
                    {i + 1}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselDots className="mt-gp-md" />
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
