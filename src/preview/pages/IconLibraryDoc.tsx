import { useMemo, useState } from "react";
import { Icon, icons, type IconName, type IconTone } from "../../components/ui/Icon";
import { Input } from "../../components/shadcn/input";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

const ALL_NAMES = Object.keys(icons) as IconName[];

const TOC = [
  { id: "library", label: "Library" },
  { id: "examples", label: "Examples" },
  { id: "ex-sizes", label: "Sizes" },
  { id: "ex-tones", label: "Tones" },
  { id: "ex-color", label: "Color (CSS / prop)" },
  { id: "api", label: "API Reference" },
];

const ICON_PROPS = [
  { name: "name", type: "IconName (autocomplete da lib)", defaultVal: "—" },
  { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl" | number | string', defaultVal: '"md"' },
  { name: "tone", type: '"default" | "muted" | "brand" | "danger" | "success" | "warning" | "info"', defaultVal: "—" },
  { name: "color", type: "string (qualquer cor CSS)", defaultVal: "—" },
  { name: "title / aria-label", type: "string (→ role=img; senão decorativo)", defaultVal: "—" },
];

const TONES: IconTone[] = ["default", "muted", "brand", "danger", "success", "warning", "info"];

/* Catálogo navegável — busca + clique copia o `name` */
function IconGrid() {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? ALL_NAMES.filter((n) => n.toLowerCase().includes(q)) : ALL_NAMES;
  }, [query]);

  const copy = (name: string) => {
    navigator.clipboard?.writeText(name);
    setCopied(name);
    window.setTimeout(() => setCopied((c) => (c === name ? null : c)), 1400);
  };

  return (
    <div>
      <div className="mb-gp-lg flex items-center justify-between gap-gp-md">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar ícone…"
          className="max-w-[280px]"
        />
        <span className="text-caption-sm text-fg-muted [font-variant-numeric:tabular-nums]">
          {filtered.length} de {ALL_NAMES.length}
        </span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-gp-md">
        {filtered.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => copy(name)}
            title={`Copiar "${name}"`}
            className="flex flex-col items-center gap-gp-sm rounded-radius-base border border-border-subtle bg-bg-surface px-pad-md py-pad-3xl text-fg-default transition-colors hover:border-border-default hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
          >
            <Icon name={name} size="lg" />
            <span className="line-clamp-1 w-full text-center text-caption-sm text-fg-muted">
              {copied === name ? "Copiado!" : name}
            </span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-pad-4xl text-center text-body-sm text-fg-muted">
            Nenhum ícone encontrado para "{query}".
          </p>
        )}
      </div>
    </div>
  );
}

export function IconLibraryDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Icon"
        description="Biblioteca de ícones própria da iGreen. O SVG é fixo — só o path (d) muda via prop name. Tamanho por token, cor por currentColor/tone/CSS."
      />
      <DocSeparator />

      <SectionH2 id="library" title="Library" />
      <p className="mb-gp-lg text-body-md text-fg-muted">
        Clique num ícone pra copiar o <code className="text-fg-default">name</code>. Prefixo{" "}
        <code className="text-fg-default">line-*</code> = contorno, <code className="text-fg-default">fill-*</code> = preenchido.
      </p>
      <IconGrid />

      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-sizes"
        title="Sizes"
        description="Presets xs–xl mapeiam os tokens size-icon-* (12/16/20/24/32). size também aceita valor arbitrário (number→px ou string CSS)."
        code={`<Icon name="line-user" size="xs" />
<Icon name="line-user" size="sm" />
<Icon name="line-user" size="md" />
<Icon name="line-user" size="lg" />
<Icon name="line-user" size="xl" />
<Icon name="line-user" size={48} />`}
      >
        <div className="flex items-end gap-gp-lg text-fg-default">
          <Icon name="line-user" size="xs" />
          <Icon name="line-user" size="sm" />
          <Icon name="line-user" size="md" />
          <Icon name="line-user" size="lg" />
          <Icon name="line-user" size="xl" />
          <Icon name="line-user" size={48} />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-tones"
        title="Tones"
        description="Tom semântico via token (fg.*)."
        code={`<Icon name="fill-success" tone="brand" />
<Icon name="fill-success" tone="danger" />
<Icon name="fill-success" tone="success" />`}
      >
        <div className="flex items-center gap-gp-lg">
          {TONES.map((tone) => (
            <Icon key={tone} name="fill-success" size="lg" tone={tone} title={tone} />
          ))}
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-color"
        title="Color (CSS / prop)"
        description="Herda currentColor (controlável por classe text-*), ou cor arbitrária via prop color."
        code={`<span className="text-fg-brand"><Icon name="line-edit" /></span>
<Icon name="line-edit" color="#0fc589" />`}
      >
        <div className="flex items-center gap-gp-lg">
          <span className="text-fg-brand"><Icon name="line-edit" size="lg" /></span>
          <span className="text-fg-danger"><Icon name="line-bin" size="lg" /></span>
          <Icon name="line-edit" size="lg" color="#a855f7" />
        </div>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={ICON_PROPS} />
    </DocLayout>
  );
}
