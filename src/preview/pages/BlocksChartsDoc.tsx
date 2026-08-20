import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
} from "../components";
import {
  BudgetBreakdownBlock,
  BLOCK as BUDGET_BREAKDOWN,
} from "@/blocks/chart/budget-breakdown";

/**
 * Galeria de blocos — categoria Gráficos.
 *
 * Diferença em relação ao `#/chart-showcase`: lá as composições são **definidas na
 * própria página**, como inspiração. Aqui a página **importa** o arquivo do bloco e
 * só o renderiza — o arquivo é a fonte de verdade, então galeria e código não têm
 * como divergir. Ver `.ai/specs/blocks-catalogo-de-composicoes.md` §4.2.
 *
 * Cada bloco expõe um `BLOCK` com `id`, `nome`, `descricao` e `usa` — é daqui que o
 * índice sai (gerado, não escrito à mão) e é o `id` que se cita pra IA reproduzir a
 * composição noutro projeto.
 */

const TOC = [
  { id: "como-usar", label: "Como usar" },
  { id: BUDGET_BREAKDOWN.id, label: BUDGET_BREAKDOWN.nome },
];

/** Cartão de identificação do bloco — o ID é o que se cita. */
function BlockMeta({
  bloco,
}: {
  bloco: { id: string; nome: string; descricao: string; usa: readonly string[] };
}) {
  return (
    <div className="flex flex-col gap-gp-md rounded-radius-lg border border-border-default bg-bg-subtle p-pad-3xl">
      <div className="flex flex-wrap items-center gap-gp-md">
        <code className="rounded-radius-sm bg-bg-muted px-pad-md py-pad-xs text-body-sm font-semibold text-fg-brand">
          {bloco.id}
        </code>
        <span className="text-body-md font-medium text-fg-default">{bloco.nome}</span>
      </div>
      <p className="text-body-sm text-fg-muted">{bloco.descricao}</p>
      <p className="text-caption-md text-fg-muted">
        Usa: {bloco.usa.join(" · ")}
      </p>
    </div>
  );
}

export function BlocksChartsDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Blocks"
        title="Gráficos"
        description="Composições de gráfico prontas, referenciáveis por ID. Cada bloco usa só componentes públicos do DS — cite o ID e a IA reproduz a composição no seu projeto."
        dependency="recharts"
      />
      <DocSeparator />

      <SectionH2 id="como-usar" title="Como usar" />
      <p className="text-body-md text-fg-default">
        Ache a composição que quer nesta página e cite o <strong>ID</strong> dela. A
        IA resolve o ID, lê o arquivo do bloco e monta a mesma estrutura com os seus
        dados — em vez de compor do zero e chegar num arranjo pior.
      </p>
      <p className="mt-gp-md text-body-md text-fg-default">
        Exemplo de pedido:{" "}
        <code className="rounded-radius-sm bg-bg-muted px-pad-md py-pad-xs text-body-sm text-fg-default">
          use a referência dsgreen-chart-1 pro rateio de custo por filial
        </code>
      </p>
      <p className="mt-gp-md text-body-sm text-fg-muted">
        Blocos <strong>não</strong> vêm instalados: nada entra no seu bundle até você
        pedir. Eles não são componentes — não têm props nem versão própria. São
        composições de referência, feitas com componentes que você já tem.
      </p>

      <DocSeparator />

      <SectionH2
        id={BUDGET_BREAKDOWN.id}
        title={BUDGET_BREAKDOWN.nome}
      />
      <BlockMeta bloco={BUDGET_BREAKDOWN} />
      <div className="mt-gp-2xl flex justify-center">
        <BudgetBreakdownBlock />
      </div>
    </DocLayout>
  );
}
