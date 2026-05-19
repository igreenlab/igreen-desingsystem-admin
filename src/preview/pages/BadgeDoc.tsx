import { Badge } from "../../components/shadcn/badge";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";
import { CheckCircle2, AlertTriangle, XCircle, Sparkles } from "lucide-react";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-counter", label: "Counter (sandbox pattern)" },
  { id: "ex-status-chip", label: "Status Chip (pill)" },
  { id: "ex-colors", label: "Colors" },
  { id: "ex-variants", label: "Variants" },
  { id: "ex-shapes", label: "Shapes" },
  { id: "ex-sizes", label: "Sizes" },
  { id: "ex-with-icon", label: "With Icon" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "color", type: '"primary" | "secondary" | "critical" | "success" | "warning" | "info"', defaultVal: '"secondary"' },
  { name: "variant", type: '"solid" | "soft" | "outline" | "ghost"', defaultVal: '"soft"' },
  { name: "size", type: '"sm" (20px) | "md" (24px) | "lg" (28px)', defaultVal: '"md"' },
  { name: "shape", type: '"default" (radius 6px) | "pill" (radius full)', defaultVal: '"default"' },
];

const COLORS = ["primary", "secondary", "critical", "success", "warning", "info"] as const;
const VARIANTS = ["solid", "soft", "outline", "ghost"] as const;

export function BadgeDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Data Display"
        title="Badge"
        description="Indicador visual compacto pra contadores, status, tags. Suporta 6 cores semânticas, 4 variantes visuais, 3 tamanhos e 2 shapes (default 6px ou pill full)."
        dependency="tailwind-variants"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      {/* Counter — sandbox pattern */}
      <ExampleSection
        id="ex-counter"
        title="Counter (sandbox .tbl-page-count)"
        description="Pattern do contador de registros do design-and-table-v2. Default shape + soft + primary."
        code={`<Badge color="primary" variant="soft">87 registros</Badge>`}
      >
        <div className="flex items-center gap-gp-md">
          <h3 className="text-title-lg font-bold text-fg-default">Clientes</h3>
          <Badge color="primary" variant="soft">87 registros</Badge>
        </div>
      </ExampleSection>

      {/* Status Chip — pill */}
      <ExampleSection
        id="ex-status-chip"
        title="Status Chip (sandbox .chip)"
        description="Pattern da coluna Categoria — shape pill + soft + colored. Várias categorias semânticas."
        code={`<Badge color="success" variant="soft" shape="pill">Ativo</Badge>
<Badge color="info" variant="soft" shape="pill">Negociação</Badge>
<Badge color="warning" variant="soft" shape="pill">Pendente</Badge>
<Badge color="critical" variant="soft" shape="pill">Cancelado</Badge>`}
      >
        <div className="flex flex-wrap gap-gp-md">
          <Badge color="success" variant="soft" shape="pill">Ativo</Badge>
          <Badge color="info" variant="soft" shape="pill">Negociação</Badge>
          <Badge color="warning" variant="soft" shape="pill">Pendente</Badge>
          <Badge color="critical" variant="soft" shape="pill">Cancelado</Badge>
          <Badge color="secondary" variant="soft" shape="pill">Arquivado</Badge>
        </div>
      </ExampleSection>

      {/* Colors */}
      <ExampleSection
        id="ex-colors"
        title="Colors"
        description="6 cores semânticas. Default secondary."
      >
        <div className="flex flex-col gap-gp-2xl">
          {VARIANTS.map((v) => (
            <div key={v} className="flex items-center gap-gp-md">
              <p className="w-[80px] text-body-xs text-fg-muted uppercase tracking-wider">{v}</p>
              <div className="flex flex-wrap gap-gp-md">
                {COLORS.map((c) => (
                  <Badge key={c} color={c} variant={v}>{c}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ExampleSection>

      {/* Variants */}
      <ExampleSection
        id="ex-variants"
        title="Variants"
        description="Solid (sólido, máxima ênfase), Soft (bg tinted, ênfase média), Outline (border, baixa), Ghost (só texto)."
      >
        <div className="flex flex-wrap gap-gp-md">
          {VARIANTS.map((v) => (
            <Badge key={v} color="primary" variant={v}>{v}</Badge>
          ))}
        </div>
      </ExampleSection>

      {/* Shapes */}
      <ExampleSection
        id="ex-shapes"
        title="Shapes"
        description='`default` — radius 6px (counters, value tags). `pill` — radius full (status chips).'
        code={`<Badge shape="default">Counter</Badge>
<Badge shape="pill">Status</Badge>`}
      >
        <div className="flex flex-wrap items-center gap-gp-md">
          <Badge color="primary" variant="soft" shape="default">Default (6px)</Badge>
          <Badge color="primary" variant="soft" shape="pill">Pill (full)</Badge>
        </div>
      </ExampleSection>

      {/* Sizes */}
      <ExampleSection
        id="ex-sizes"
        title="Sizes"
        description="SM (20px), MD (24px — default), LG (28px). Aplicável em ambos shapes."
      >
        <div className="flex flex-col gap-gp-2xl">
          <div className="flex flex-col gap-gp-md">
            <p className="text-body-xs text-fg-muted uppercase tracking-wider">Default shape</p>
            <div className="flex items-center gap-gp-md">
              <Badge color="primary" variant="soft" size="sm">SM 20px</Badge>
              <Badge color="primary" variant="soft" size="md">MD 24px</Badge>
              <Badge color="primary" variant="soft" size="lg">LG 28px</Badge>
            </div>
          </div>
          <div className="flex flex-col gap-gp-md">
            <p className="text-body-xs text-fg-muted uppercase tracking-wider">Pill shape</p>
            <div className="flex items-center gap-gp-md">
              <Badge color="success" variant="soft" shape="pill" size="sm">Ativo</Badge>
              <Badge color="success" variant="soft" shape="pill" size="md">Ativo</Badge>
              <Badge color="success" variant="soft" shape="pill" size="lg">Ativo</Badge>
            </div>
          </div>
        </div>
      </ExampleSection>

      {/* With Icon */}
      <ExampleSection
        id="ex-with-icon"
        title="With Icon"
        description="Ícones inline são suportados via children. Tamanho do ícone se adapta ao size do badge."
        code={`<Badge color="success" variant="soft" shape="pill">
  <CheckCircle2 /> Ativo
</Badge>`}
      >
        <div className="flex flex-wrap items-center gap-gp-md">
          <Badge color="success" variant="soft" shape="pill">
            <CheckCircle2 /> Ativo
          </Badge>
          <Badge color="warning" variant="soft" shape="pill">
            <AlertTriangle /> Atenção
          </Badge>
          <Badge color="critical" variant="soft" shape="pill">
            <XCircle /> Erro
          </Badge>
          <Badge color="info" variant="soft" shape="pill">
            <Sparkles /> Novo
          </Badge>
        </div>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
