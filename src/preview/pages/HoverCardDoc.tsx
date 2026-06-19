import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "../../components/shadcn/hover-card";
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
  { name: "HoverCardTrigger", type: "elemento que dispara no hover (`asChild`)", defaultVal: "—" },
  { name: "HoverCardContent", type: "card flutuante — `align` / `side` / `sideOffset`", defaultVal: "—" },
  { name: "openDelay / closeDelay", type: "atraso de abertura/fechamento (ms)", defaultVal: "700 / 300" },
];

export function HoverCardDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Hover Card"
        description="Prévia em card ao passar o mouse (Radix). Para conteúdo rico de pré-visualização (perfil, resumo) — não para dica curta (use Tooltip)."
        dependency="@radix-ui/react-hover-card"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Básico"
        description="Passe o mouse no gatilho pra ver o card."
        code={`<HoverCard>
  <HoverCardTrigger asChild>
    <a href="#" className="underline">@igreen</a>
  </HoverCardTrigger>
  <HoverCardContent>Perfil / resumo aqui</HoverCardContent>
</HoverCard>`}
      >
        <HoverCard>
          <HoverCardTrigger asChild>
            <button type="button" className="text-body-md font-semibold text-fg-brand underline underline-offset-4">
              @igreen-energy
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-72">
            <div className="flex flex-col gap-gp-xs">
              <span className="text-body-md font-semibold text-fg-default">iGreen Energy</span>
              <span className="text-caption-md text-fg-muted">
                Plataforma de energia renovável. Membro desde 2021 · 1.2k licenciados.
              </span>
            </div>
          </HoverCardContent>
        </HoverCard>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default HoverCardDoc;
