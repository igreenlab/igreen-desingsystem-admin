import type { ComponentType } from "react";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
} from "../components";

/**
 * Galeria de blocos — categoria Painel de detalhe.
 *
 * ## Auto-descoberta: criar o arquivo é o único passo
 *
 * Esta página **não importa bloco por bloco**. Ela varre `src/blocks/paneldetail/*.tsx` com
 * `import.meta.glob` e monta a galeria a partir do que achar — igual à de Gráficos, e pelo mesmo
 * motivo: 3 edições por bloco vezes N é onde a divergência nasce.
 *
 * ## O contrato que o glob espera
 *
 * Cada arquivo exporta `BLOCK` (`{ id, nome, descricao, usa }`) e **um** componente React — o
 * primeiro export que é função e não é `BLOCK`. `_shared/` e prefixo `_` ficam de fora. O gate
 * `blocks-index` reprova arquivo que não siga o contrato, então esta página não precisa se
 * defender de arquivo malformado.
 *
 * ## Por que a categoria se chama `paneldetail` e não `drawer`
 *
 * O segmento do ID **é a pasta**, e a pasta nomeia a categoria da galeria — não os componentes
 * usados (spec §9.1 regra 1). E aqui isso importa mais que no caso dos gráficos: o mesmo arranjo
 * de detalhe mora em `Panel` (modal), `FloatingPanel` (non-modal, resizável) e `Drawer`
 * (bottom-sheet), que diferem em **comportamento**, não em desenho. Categoria batizada pelo
 * componente deixaria duas das três de fora do próprio nome.
 *
 * ⚠️ Regra 2 da mesma seção: **nunca re-segmentar depois de publicado**. Se aparecer um segundo
 * tipo de painel de detalhe, ele ganha ID novo — `dsgreen-paneldetail-1` fica como está, mesmo
 * que a simetria peça outra coisa. Citação de ID vive fora do repo (ticket, Figma, conversa).
 */

type BlockMeta = {
  id: string;
  nome: string;
  descricao: string;
  usa: readonly string[];
};

type BlockModule = Record<string, unknown> & { BLOCK?: BlockMeta };

const MODULOS = import.meta.glob<BlockModule>("../../blocks/paneldetail/*.tsx", {
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
  // `numeric: true` — sem ele o `dsgreen-paneldetail-10` apareceria entre o 1 e o 2. Mesma
  // ordenação do gerador do índice, de propósito.
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

export function BlocksPanelDetailDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Blocks"
        title="Painel de detalhe"
        description="Composições do conteúdo de um painel de detalhe — o que abre quando se clica na linha de uma tabela. Referenciáveis por ID; cada bloco usa só componentes públicos do DS."
      />
      <DocSeparator />

      <SectionH2 id="como-usar" title="Como usar" />
      <p className="text-body-md text-fg-default">
        Ache a composição que quer nesta página e cite o <strong>ID</strong> dela. A IA
        resolve o ID, lê o arquivo do bloco e monta a mesma estrutura com os seus dados —
        em vez de compor do zero e chegar num arranjo pior.
      </p>
      <p className="mt-gp-md text-body-md text-fg-default">
        Exemplo de pedido:{" "}
        <code className="rounded-radius-sm bg-bg-muted px-pad-md py-pad-xs text-body-sm text-fg-default">
          use a referência dsgreen-paneldetail-1 no painel de detalhe do cliente
        </code>
      </p>

      <div className="mt-gp-2xl flex flex-col gap-gp-md rounded-radius-lg border border-border-info-muted bg-bg-info-muted p-pad-3xl">
        <p className="text-body-md font-medium text-fg-default">
          O bloco é o CONTEÚDO do painel, não a casca
        </p>
        <p className="text-body-sm text-fg-default">
          <code className="text-code-sm">Panel</code> (modal),{" "}
          <code className="text-code-sm">FloatingPanel</code> (non-modal, resizável) e{" "}
          <code className="text-code-sm">Drawer</code> (bottom-sheet) diferem em{" "}
          <strong>comportamento</strong>, não em desenho — o arranjo do detalhe é o mesmo nos
          três. Por isso os blocos daqui renderizam o conteúdo numa superfície fixa: é o que
          você põe <em>dentro</em> da casca que escolher. O JSDoc de cada arquivo diz qual
          casca serve a qual caso.
        </p>
      </div>

      <p className="mt-gp-2xl text-body-sm text-fg-muted">
        Blocos <strong>não</strong> vêm instalados: nada entra no seu bundle até você pedir.
        Eles não são componentes — não têm props nem versão própria. São composições de
        referência, feitas com componentes que você já tem.
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

export default BlocksPanelDetailDoc;
