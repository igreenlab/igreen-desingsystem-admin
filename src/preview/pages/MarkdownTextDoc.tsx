import { MarkdownText } from "@/components/ui/MarkdownText";
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
  { id: "ex-formatting", label: "Formatação inline" },
  { id: "ex-code-links", label: "Code e links" },
  { id: "ex-message", label: "Bolha de mensagem" },
  { id: "ex-inline", label: "Prévia inline (truncável)" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  {
    name: "children",
    type: "string",
    defaultVal: "— (obrigatório)",
  },
  {
    name: "inline",
    type: "boolean — true: <span> colapsando quebras (prévia truncável) · false: <p> preservando quebras",
    defaultVal: "false",
  },
  {
    name: "className",
    type: "string — classe extra no elemento raiz",
    defaultVal: "—",
  },
];

export function MarkdownTextDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="MarkdownText"
        description="Renderiza markdown estilo WhatsApp já sanitizado. Parse manual para React nodes (sem dangerouslySetInnerHTML) — HTML/markdown não suportado vira texto literal, seguro contra injeção por design. Suporta *bold*, _italic_, ~strike~, `mono` e links."
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-formatting"
        title="Formatação inline"
        description="Negrito (*), itálico (_) e tachado (~) — recursivos entre si."
        code={`<MarkdownText>{"Texto com *negrito*, _itálico_ e ~tachado~."}</MarkdownText>
<MarkdownText>{"Aninhado: *negrito com _itálico_ dentro*."}</MarkdownText>`}
      >
        <div className="flex flex-col gap-gp-md max-w-[520px]">
          <MarkdownText>{"Texto com *negrito*, _itálico_ e ~tachado~."}</MarkdownText>
          <MarkdownText>{"Aninhado: *negrito com _itálico_ dentro*."}</MarkdownText>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-code-links"
        title="Code e links"
        description="Code spans (`...` e ```...```) são opacos — não recebem formatação. URLs http(s):// e www. viram link em nova aba."
        code={`<MarkdownText>{"Rode \`npm run dev\` para iniciar."}</MarkdownText>
<MarkdownText>{"Acesse https://igreen.com.br ou www.igreen.com.br"}</MarkdownText>`}
      >
        <div className="flex flex-col gap-gp-md max-w-[520px]">
          <MarkdownText>{"Rode `npm run dev` para iniciar o servidor."}</MarkdownText>
          <MarkdownText>{"Acesse https://igreen.com.br ou www.igreen.com.br para saber mais."}</MarkdownText>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-message"
        title="Bolha de mensagem"
        description="Uso típico no chat: multilinha, preservando quebras (whitespace-pre-wrap) e combinando toda a sintaxe."
        code={`<MarkdownText>
  {"Olá *João*! 👋\\nSegue o _link_ do painel: https://app.igreen.com.br\\nQualquer dúvida rode \`suporte\`."}
</MarkdownText>`}
      >
        <div className="max-w-[420px] rounded-radius-lg border border-border-subtle bg-bg-surface p-pad-card-base">
          <MarkdownText>
            {"Olá *João*! 👋\nSegue o _link_ do painel: https://app.igreen.com.br\nQualquer dúvida rode `suporte`."}
          </MarkdownText>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-inline"
        title="Prévia inline (truncável)"
        description="inline colapsa quebras num único espaço e renderiza em <span>. O line-clamp fica por conta do consumer."
        code={`<MarkdownText inline className="line-clamp-1">
  {"*Maria*: já enviei os documentos\\npode conferir quando puder 🙏"}
</MarkdownText>`}
      >
        <div className="w-full max-w-[280px] rounded-radius-md border border-border-subtle bg-bg-surface p-pad-card-base">
          <MarkdownText inline className="line-clamp-1">
            {"*Maria*: já enviei os documentos\npode conferir quando puder 🙏"}
          </MarkdownText>
        </div>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default MarkdownTextDoc;
