import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button/button";
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
  { id: "ex-sizes", label: "Tamanhos" },
  { id: "ex-colors", label: "Cores" },
  { id: "ex-button", label: "Inline em botão" },
  { id: "ex-on-brand", label: "Sobre a marca" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "size", type: `"sm" | "md" | "lg"`, defaultVal: `"md"` },
  {
    name: "color",
    type: `"current" | "default" | "muted" | "brand" | "on-brand"`,
    defaultVal: `"muted"`,
  },
  { name: "label", type: "string", defaultVal: `"Carregando"` },
  { name: "className", type: "string", defaultVal: "—" },
  { name: "...props", type: `SVGProps<SVGSVGElement> (menos color)`, defaultVal: "—" },
];

/** Botão que alterna loading pra mostrar o Spinner inline (color="current"). */
function SaveButtonExample() {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      disabled={loading}
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
      }}
    >
      {loading && <Spinner size="sm" color="current" aria-hidden />}
      {loading ? "Salvando…" : "Salvar"}
    </Button>
  );
}

export function SpinnerDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Spinner"
        description="Indicador de loading — SVG que gira via animate-spin e para automaticamente sob prefers-reduced-motion. Tamanho por size-icon-* e cor por text-fg-* (o traço usa currentColor)."
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-sizes"
        title="Tamanhos"
        description="Três tamanhos alinhados aos tokens de ícone: sm, md (default), lg."
        code={`<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />`}
      >
        <div className="flex items-center gap-gp-xl">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-colors"
        title="Cores"
        description="Tom por token de texto. muted é o default; brand puxa a cor da marca."
        code={`<Spinner color="default" />
<Spinner color="muted" />
<Spinner color="brand" />`}
      >
        <div className="flex items-center gap-gp-xl">
          <Spinner color="default" />
          <Spinner color="muted" />
          <Spinner color="brand" />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-button"
        title="Inline em botão"
        description="Dentro de um botão use size='sm', color='current' (herda o texto do botão) e aria-hidden — o texto 'Salvando…' já anuncia o estado. Clique pra ver."
        code={`<Button disabled={loading}>
  {loading && <Spinner size="sm" color="current" aria-hidden />}
  {loading ? "Salvando…" : "Salvar"}
</Button>`}
      >
        <SaveButtonExample />
      </ExampleSection>

      <ExampleSection
        id="ex-on-brand"
        title="Sobre a marca"
        description="color='on-brand' garante contraste do spinner quando ele fica sobre uma superfície da cor da marca."
        code={`<div className="bg-bg-brand ...">
  <Spinner size="lg" color="on-brand" label="Carregando ranking" />
</div>`}
      >
        <div className="flex items-center justify-center rounded-radius-lg bg-bg-brand p-sp-xl">
          <Spinner size="lg" color="on-brand" label="Carregando ranking" />
        </div>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default SpinnerDoc;
