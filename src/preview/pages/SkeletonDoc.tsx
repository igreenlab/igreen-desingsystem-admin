import { Skeleton } from "../../components/shadcn/skeleton";
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
  { id: "ex-shapes", label: "Formas" },
  { id: "ex-card", label: "Card" },
  { id: "ex-list", label: "Lista" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "className", type: "string — defina width/height/shape (h-*, w-*, rounded-*, size-*)", defaultVal: "—" },
  { name: "...props", type: "HTMLAttributes<HTMLDivElement>", defaultVal: "—" },
];

export function SkeletonDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Skeleton"
        description="Placeholder de carregamento (pulse). bg-bg-muted + rounded-radius-md. Componha vários pra desenhar a silhueta do conteúdo enquanto carrega — mesma geometria do estado final."
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-shapes"
        title="Formas"
        description="A forma vem do className (linha, círculo, bloco)."
        code={`<Skeleton className="h-4 w-[220px]" />
<Skeleton className="size-12 rounded-radius-full" />
<Skeleton className="h-24 w-full rounded-radius-lg" />`}
      >
        <div className="flex flex-col gap-gp-md">
          <Skeleton className="h-4 w-[220px]" />
          <Skeleton className="size-12 rounded-radius-full" />
          <Skeleton className="h-24 w-full max-w-[360px] rounded-radius-lg" />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-card"
        title="Card"
        description="Avatar + duas linhas — padrão de card de pessoa carregando."
        code={`<div className="flex items-center gap-gp-md">
  <Skeleton className="size-12 rounded-radius-full" />
  <div className="flex flex-col gap-gp-sm">
    <Skeleton className="h-4 w-[160px]" />
    <Skeleton className="h-3 w-[120px]" />
  </div>
</div>`}
      >
        <div className="flex items-center gap-gp-md rounded-radius-lg border border-border-subtle bg-bg-surface p-pad-card-base max-w-[360px]">
          <Skeleton className="size-12 rounded-radius-full shrink-0" />
          <div className="flex flex-col gap-gp-sm">
            <Skeleton className="h-4 w-[160px]" />
            <Skeleton className="h-3 w-[120px]" />
          </div>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-list"
        title="Lista"
        description="Repita pra simular N linhas (ex.: enquanto a tabela/lista carrega)."
        code={`{Array.from({ length: 4 }).map((_, i) => (
  <Skeleton key={i} className="h-form-md w-full rounded-radius-md" />
))}`}
      >
        <div className="flex flex-col gap-gp-sm w-full max-w-[420px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-form-md w-full rounded-radius-md" />
          ))}
        </div>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default SkeletonDoc;
