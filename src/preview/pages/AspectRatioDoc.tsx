import { AspectRatio } from "../../components/shadcn/aspect-ratio";
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
  { id: "ex-ratios", label: "Proporções" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "ratio", type: "number — largura/altura (ex.: 16/9, 1, 4/3)", defaultVal: "1" },
  { name: "children", type: "conteúdo (imagem, vídeo, placeholder)", defaultVal: "—" },
];

const RATIOS: { label: string; ratio: number }[] = [
  { label: "16 / 9", ratio: 16 / 9 },
  { label: "4 / 3", ratio: 4 / 3 },
  { label: "1 / 1", ratio: 1 },
];

export function AspectRatioDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Aspect Ratio"
        description="Mantém uma proporção fixa pro conteúdo (imagens, vídeos, mapas) independente da largura. Radix."
        dependency="@radix-ui/react-aspect-ratio"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-ratios"
        title="Proporções"
        description="ratio = largura/altura. O filho preenche a caixa."
        code={`<AspectRatio ratio={16 / 9}>
  <img src="..." className="h-full w-full object-cover rounded-radius-lg" />
</AspectRatio>`}
      >
        <div className="grid grid-cols-1 gap-gp-lg sm:grid-cols-3">
          {RATIOS.map((r) => (
            <div key={r.label} className="flex flex-col gap-gp-xs">
              <AspectRatio ratio={r.ratio}>
                <div className="grid h-full w-full place-items-center rounded-radius-lg bg-bg-brand-subtle text-body-md font-semibold text-fg-brand">
                  {r.label}
                </div>
              </AspectRatio>
            </div>
          ))}
        </div>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default AspectRatioDoc;
