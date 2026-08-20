import type { ComponentType } from "react";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
} from "../components";

/**
 * Galeria de blocos — categoria Gráficos.
 *
 * ## Auto-descoberta: criar o arquivo é o único passo
 *
 * Esta página **não importa bloco por bloco**. Ela varre `src/blocks/chart/*.tsx` com
 * `import.meta.glob` e monta a galeria a partir do que achar. Bloco novo aparece aqui pelo
 * simples ato de existir — sem import, sem render, sem entrada de TOC pra editar.
 *
 * Antes era manual, e eram 3 edições por bloco. Com o catálogo crescendo "regularmente" (é o
 * plano), 3 edições por bloco vezes N é onde a divergência nasce: alguém cria o arquivo, esquece
 * o render, e o bloco existe no registry e não existe na galeria — sem nada acusar.
 *
 * ## O contrato que o glob espera
 *
 * Cada arquivo exporta:
 *   - `BLOCK` — `{ id, nome, descricao, usa }`, a identidade (é dela que sai o índice do
 *     consumidor e o item de registry, via `npm run blocks:build`)
 *   - **um** componente React, o bloco em si (qualquer nome; pegamos o primeiro export que é
 *     função e não é `BLOCK`)
 *
 * `_shared/` e arquivos com prefixo `_` ficam de fora — são helpers, não blocos. O gate
 * `blocks-index` reprova arquivo em `src/blocks/**` que não siga o contrato, então a galeria não
 * precisa se defender de arquivo malformado: ele não chega até aqui.
 *
 * ## Diferença em relação ao `#/chart-showcase`
 *
 * Lá as composições são **definidas na própria página**. Aqui a página **importa** o arquivo do
 * bloco — o arquivo é a fonte de verdade, então galeria e código não têm como divergir. Ver
 * `.ai/specs/blocks-catalogo-de-composicoes.md` §4.2.
 */

type BlockMeta = {
  id: string;
  nome: string;
  descricao: string;
  usa: readonly string[];
};

type BlockModule = Record<string, unknown> & { BLOCK?: BlockMeta };

const MODULOS = import.meta.glob<BlockModule>("../../blocks/chart/*.tsx", {
  eager: true,
});

/** Extrai `{ meta, Componente }` de cada módulo, ordenado pelo id. */
const BLOCOS = Object.entries(MODULOS)
  .flatMap(([caminho, mod]) => {
    const meta = mod.BLOCK;
    if (!meta) return [];
    const Componente = Object.entries(mod).find(
      ([nome, valor]) => nome !== "BLOCK" && typeof valor === "function",
    )?.[1] as ComponentType | undefined;
    if (!Componente) return [];
    return [{ caminho, meta, Componente }];
  })
  // `numeric: true` — sem ele o `dsgreen-chart-10` apareceria entre o 1 e o 2 (compara
  // "1" com "2", não 10 com 2). Mesma ordenação do gerador do índice, de propósito:
  // galeria e índice do consumidor listando em ordens diferentes é confusão gratuita.
  .sort((a, b) => a.meta.id.localeCompare(b.meta.id, "en", { numeric: true }));

const TOC = [
  { id: "como-usar", label: "Como usar" },
  ...BLOCOS.map((b) => ({ id: b.meta.id, label: b.meta.nome })),
];

/** Cartão de identificação do bloco — o ID é o que se cita. */
function BlockMetaCard({ meta }: { meta: BlockMeta }) {
  return (
    <div className="flex flex-col gap-gp-md rounded-radius-lg border border-border-default bg-bg-subtle p-pad-3xl">
      <div className="flex flex-wrap items-center gap-gp-md">
        <code className="rounded-radius-sm bg-bg-muted px-pad-md py-pad-xs text-body-sm font-semibold text-fg-brand">
          {meta.id}
        </code>
        <span className="text-body-md font-medium text-fg-default">{meta.nome}</span>
      </div>
      <p className="text-body-sm text-fg-muted">{meta.descricao}</p>
      <p className="text-caption-md text-fg-muted">Usa: {meta.usa.join(" · ")}</p>
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

      {BLOCOS.map(({ meta, Componente }) => (
        <div key={meta.id}>
          <DocSeparator />
          <SectionH2 id={meta.id} title={meta.nome} />
          <BlockMetaCard meta={meta} />
          <div className="mt-gp-2xl flex justify-center">
            <Componente />
          </div>
        </div>
      ))}
    </DocLayout>
  );
}
