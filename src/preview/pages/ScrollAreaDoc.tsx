import { ScrollArea, ScrollBar } from "../../components/shadcn/scroll-area";
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
  { id: "ex-vertical", label: "Vertical" },
  { id: "ex-horizontal", label: "Horizontal" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "ScrollArea", type: "wrapper — defina a altura/largura (h-*, w-*)", defaultVal: "—" },
  { name: "ScrollBar", type: 'orientation="vertical" | "horizontal" (incluso por default na vertical)', defaultVal: '"vertical"' },
];

const TAGS = Array.from({ length: 24 }, (_, i) => `Registro #${i + 1}`);

export function ScrollAreaDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Scroll Area"
        description="Área rolável com scrollbar estilizada e consistente entre navegadores (Radix). Thumb usa o token bg-border-default. Use em listas/dropdowns longos."
        dependency="@radix-ui/react-scroll-area"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-vertical"
        title="Vertical"
        description="Defina a altura no ScrollArea; o conteúdo rola dentro."
        code={`<ScrollArea className="h-[200px] w-[280px] rounded-radius-lg border border-border-subtle">
  <div className="p-pad-card-base flex flex-col gap-gp-xs">
    {items.map((i) => <div key={i}>{i}</div>)}
  </div>
</ScrollArea>`}
      >
        <ScrollArea className="h-[200px] w-[280px] rounded-radius-lg border border-border-subtle bg-bg-surface">
          <div className="flex flex-col gap-gp-xs p-pad-card-base">
            {TAGS.map((t) => (
              <div key={t} className="rounded-radius-sm bg-bg-canvas px-pad-card-base py-pad-md text-body-sm text-fg-default">
                {t}
              </div>
            ))}
          </div>
        </ScrollArea>
      </ExampleSection>

      <ExampleSection
        id="ex-horizontal"
        title="Horizontal"
        description="Adicione um <ScrollBar orientation='horizontal' /> pro eixo X."
        code={`<ScrollArea className="w-[360px] whitespace-nowrap rounded-radius-lg border">
  <div className="flex gap-gp-md p-pad-card-base">…cards…</div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>`}
      >
        <ScrollArea className="w-[360px] whitespace-nowrap rounded-radius-lg border border-border-subtle bg-bg-surface">
          <div className="flex gap-gp-md p-pad-card-base">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="grid size-24 shrink-0 place-items-center rounded-radius-md bg-bg-brand-subtle text-fg-brand text-body-md font-semibold">
                {i + 1}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default ScrollAreaDoc;
