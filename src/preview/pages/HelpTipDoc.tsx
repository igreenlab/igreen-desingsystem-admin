import { HelpTip } from "@/components/ui/HelpTip";
import { Kpi, KpiGroup } from "@/components/ui/Kpi";
import { FormFieldInput } from "@/components/ui/FormField";
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
  { id: "ex-titulo", label: "Ao lado de um título" },
  { id: "ex-campo", label: "Ao lado de um label de campo" },
  { id: "ex-lados", label: "Lados" },
  { id: "ex-largura", label: "Texto longo e largura" },
  { id: "ex-kpi", label: "Dentro do Kpi (não monte à mão)" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  {
    name: "about",
    type: "string",
    defaultVal: "— (obrigatório)",
    description:
      'O que está sendo explicado. Vira o nome acessível "Ajuda sobre {about}".',
  },
  {
    name: "children",
    type: "ReactNode",
    defaultVal: "— (obrigatório)",
    description: "O texto da dica.",
  },
  {
    name: "side",
    type: `"top" | "right" | "bottom" | "left"`,
    defaultVal: `"top"`,
    description: "Lado em que a dica abre.",
  },
  {
    name: "contentClassName",
    type: "string",
    defaultVal: "—",
    description:
      "className do CONTEÚDO da dica — na prática, a largura (o teto padrão é 256px).",
  },
  {
    name: "className",
    type: "string",
    defaultVal: "—",
    description: "className do botão.",
  },
];

export function HelpTipDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="HelpTip"
        description='O "?" que explica um rótulo: botão de ícone discreto que revela um tooltip curto. Nasceu dentro do Kpi (prop helperText) e saiu de lá para acompanhar qualquer rótulo — título de seção, label de campo, cabeçalho de coluna.'
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-titulo"
        title="Ao lado de um título"
        description="O caso mais comum: o rótulo cabe, a definição dele não. Passe o próprio rótulo em about — o nome acessível do botão vira 'Ajuda sobre Margem de contribuição'. Passe o mouse (ou dê Tab até o '?')."
        code={`<h2 className="flex items-center gap-gp-xs text-heading-sm text-fg-default">
  Margem de contribuição
  <HelpTip about="Margem de contribuição">
    Receita menos custos variáveis, antes dos custos fixos.
  </HelpTip>
</h2>`}
      >
        <h2 className="flex items-center gap-gp-xs text-heading-sm text-fg-default">
          Margem de contribuição
          <HelpTip about="Margem de contribuição">
            Receita menos custos variáveis, antes dos custos fixos.
          </HelpTip>
        </h2>
      </ExampleSection>

      <ExampleSection
        id="ex-campo"
        title="Num formulário — no cabeçalho do grupo, nunca dentro do label"
        description="⛔ Um <button> dentro de <label> é HTML inválido (o content model do label proíbe conteúdo interativo) e o clique na ajuda acabaria no campo. Por isso o '?' acompanha o CABEÇALHO do grupo de campos, como irmão. O que todo mundo precisa ler continua em helperText do FormField, que fica visível — a dica atrás de hover é, por definição, opcional."
        code={`<div className="flex items-center gap-gp-xs">
  <span className="text-body-md font-semibold text-fg-default">Integração</span>
  <HelpTip about="Integração" side="right">
    O identificador que a concessionária usa na fatura — canto superior
    direito do PDF, 11 dígitos.
  </HelpTip>
</div>
<FormFieldInput label="Código de integração" placeholder="00000000000" />`}
      >
        <div className="flex max-w-page-xs flex-col gap-form-gap">
          <div className="flex items-center gap-gp-xs">
            <span className="text-body-md font-semibold text-fg-default">
              Integração
            </span>
            <HelpTip about="Integração" side="right">
              O identificador que a concessionária usa na fatura — canto superior
              direito do PDF, 11 dígitos.
            </HelpTip>
          </div>
          <FormFieldInput
            label="Código de integração"
            placeholder="00000000000"
            helperText="Só números."
          />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-lados"
        title="Lados"
        description="side escolhe de que lado a dica abre. Default top — troque quando o topo estiver fora da área visível (primeira linha de uma tabela, topo de um drawer)."
        code={`<HelpTip about="Topo" side="top">Abre em cima.</HelpTip>
<HelpTip about="Direita" side="right">Abre à direita.</HelpTip>
<HelpTip about="Baixo" side="bottom">Abre embaixo.</HelpTip>
<HelpTip about="Esquerda" side="left">Abre à esquerda.</HelpTip>`}
      >
        <div className="flex items-center gap-gp-2xl">
          <span className="flex items-center gap-gp-xs text-body-sm text-fg-default">
            Topo
            <HelpTip about="Topo" side="top">
              Abre em cima.
            </HelpTip>
          </span>
          <span className="flex items-center gap-gp-xs text-body-sm text-fg-default">
            Direita
            <HelpTip about="Direita" side="right">
              Abre à direita.
            </HelpTip>
          </span>
          <span className="flex items-center gap-gp-xs text-body-sm text-fg-default">
            Baixo
            <HelpTip about="Baixo" side="bottom">
              Abre embaixo.
            </HelpTip>
          </span>
          <span className="flex items-center gap-gp-xs text-body-sm text-fg-default">
            Esquerda
            <HelpTip about="Esquerda" side="left">
              Abre à esquerda.
            </HelpTip>
          </span>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-largura"
        title="Texto longo e largura"
        description="O teto padrão da dica é 256px — texto de ajuda longo ali vira uma coluna alta e difícil de ler. contentClassName solta: max-w-tooltip-lg dá 320px. Compare os dois."
        code={`<HelpTip about="Padrão">{textoLongo}</HelpTip>

<HelpTip about="Solta" contentClassName="max-w-tooltip-lg">
  {textoLongo}
</HelpTip>`}
      >
        <div className="flex items-center gap-gp-2xl">
          <span className="flex items-center gap-gp-xs text-body-sm text-fg-default">
            Padrão (256px)
            <HelpTip about="Consumo compensado">
              Soma da energia injetada na rede pelas usinas do cliente no mês de
              referência, já descontadas as perdas de transmissão informadas pela
              concessionária.
            </HelpTip>
          </span>
          <span className="flex items-center gap-gp-xs text-body-sm text-fg-default">
            max-w-tooltip-lg (320px)
            <HelpTip
              about="Consumo compensado"
              contentClassName="max-w-tooltip-lg"
            >
              Soma da energia injetada na rede pelas usinas do cliente no mês de
              referência, já descontadas as perdas de transmissão informadas pela
              concessionária.
            </HelpTip>
          </span>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-kpi"
        title="Dentro do Kpi (não monte à mão)"
        description="O Kpi já consome o HelpTip: passe helperText e o card monta o '?' no lugar certo, com o nome acessível derivado do label. O card da direita é clicável — e o '?' continua clicável por cima dele, que é o que o relative z-10 da base garante."
        code={`<Kpi
  label="SLA"
  value="98%"
  helperText="Percentual de atendimentos resolvidos dentro do prazo."
/>`}
      >
        <KpiGroup columns={2}>
          <Kpi
            label="SLA"
            value="98%"
            helperText="Percentual de atendimentos resolvidos dentro do prazo."
          />
          <Kpi
            label="Tickets abertos"
            value="1.284"
            helperText="Conta tickets sem resolução no fim do dia."
            href="#/help-tip"
          />
        </KpiGroup>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default HelpTipDoc;
