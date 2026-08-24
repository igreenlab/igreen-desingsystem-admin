import { ScreenLoader } from "@/components/ui/ScreenLoader";
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
  { id: "ex-spinner", label: "Spinner centrado" },
  { id: "ex-skeleton", label: "Skeleton genérico" },
  { id: "ex-sizes", label: "Tamanhos" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  {
    name: "variant",
    type: `"spinner" | "skeleton"`,
    defaultVal: `"spinner"`,
    description:
      "spinner = Spinner centrado + título + descrição. skeleton = silhueta genérica de página (header + bloco), sem prever o layout final.",
  },
  {
    name: "title",
    type: "string",
    defaultVal: `"Carregando…"`,
    description:
      "Visível na variante spinner; sr-only na skeleton (anunciado via role=status).",
  },
  {
    name: "description",
    type: "string",
    defaultVal: "—",
    description: "Linha auxiliar sob o título (só na variante spinner).",
  },
  {
    name: "size",
    type: `"sm" | "md" | "lg"`,
    defaultVal: `"md"`,
    description:
      "Escala o Spinner e a tipografia do título. Sem efeito na variante skeleton.",
  },
  {
    name: "color",
    type: `"current" | "default" | "muted" | "brand" | "on-brand"`,
    defaultVal: `"brand"`,
    description: "Cor do Spinner (repassada). Só na variante spinner.",
  },
  { name: "className", type: "string", defaultVal: "—" },
];

/** Moldura com altura fixa simulando o slot de conteúdo que está carregando. */
function SlotFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[320px] w-full flex-col rounded-radius-lg border border-border-subtle bg-bg-surface p-sp-xl">
      {children}
    </div>
  );
}

export function ScreenLoaderDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="ScreenLoader"
        description="Estado de carregamento de página/área — preenche o container pai (slot de conteúdo do AppShell, card, section) enquanto o conteúdo processa. Irmão do EmptyState: um pro vazio, um pro carregando. Duas variações: spinner centrado com título/descrição, ou silhueta skeleton genérica."
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-spinner"
        title="Spinner centrado (default)"
        description="Spinner + título + descrição centralizados no container. O pai precisa ter altura — aqui a moldura simula o slot de conteúdo."
        code={`{isLoading ? (
  <ScreenLoader
    title="Carregando clientes"
    description="Buscando os dados mais recentes…"
  />
) : (
  <ClientesPage />
)}`}
      >
        <SlotFrame>
          <ScreenLoader
            title="Carregando clientes"
            description="Buscando os dados mais recentes…"
          />
        </SlotFrame>
      </ExampleSection>

      <ExampleSection
        id="ex-skeleton"
        title="Skeleton genérico"
        description="Silhueta de página deliberadamente genérica (header + bloco de conteúdo) — quando prever o layout final não vale a pena. Layout conhecido? Componha <Skeleton> na mão (DataTable/DataList já trazem os próprios)."
        code={`{isLoading ? <ScreenLoader variant="skeleton" /> : <Dashboard />}`}
      >
        <SlotFrame>
          <ScreenLoader variant="skeleton" />
        </SlotFrame>
      </ExampleSection>

      <ExampleSection
        id="ex-sizes"
        title="Tamanhos"
        description="size escala o Spinner e o título juntos (sm · md · lg). Sem efeito na variante skeleton."
        code={`<ScreenLoader size="sm" title="Carregando…" />
<ScreenLoader size="lg" title="Carregando…" description="Isso pode levar alguns segundos." />`}
      >
        <div className="flex w-full flex-col gap-gp-2xl">
          <div className="flex h-[180px] flex-col rounded-radius-lg border border-border-subtle bg-bg-surface">
            <ScreenLoader size="sm" title="Carregando…" />
          </div>
          <div className="flex h-[220px] flex-col rounded-radius-lg border border-border-subtle bg-bg-surface">
            <ScreenLoader
              size="lg"
              title="Carregando…"
              description="Isso pode levar alguns segundos."
            />
          </div>
        </div>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default ScreenLoaderDoc;
