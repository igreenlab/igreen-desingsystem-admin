import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export type DataTableEmptyProps = {
  /** Icone na ilustração. Default: Inbox. Renderizado dentro de circulo com bg-bg-muted. */
  icon?: ReactNode;
  /** Titulo principal. Default: "Nenhum dado cadastrado". */
  title?: string;
  /** Descricao secundaria. Default: orientacao de proximos passos. */
  description?: string;
  /** Acao primaria — ex: <Button>Adicionar</Button>. Renderizada abaixo da descricao. */
  action?: ReactNode;
};

/**
 * Estado vazio (dataset sem nenhum registro). Usado quando a tabela nao tem
 * dados em absoluto — diferente de NoResults (que aplica quando filtros zeraram).
 *
 * Estrutura: ilustracao circular > titulo > descricao > acao opcional.
 * Consumer pode customizar via props ou substituir 100% via `props.renderEmpty`.
 */
export function DataTableEmpty({
  icon = <Inbox aria-hidden />,
  title = "Nenhum dado cadastrado",
  description = "Comece adicionando novos itens para visualizar aqui.",
  action,
}: DataTableEmptyProps = {}) {
  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-gp-lg p-pad-4xl text-center">
      <div
        className="flex items-center justify-center size-[80px] rounded-full bg-bg-muted [&_svg]:size-icon-2xl [&_svg]:text-fg-muted"
        aria-hidden
      >
        {icon}
      </div>
      <div className="flex flex-col gap-gp-2xs items-center">
        <p className="text-title-md text-fg-strong">{title}</p>
        <p className="text-body-md text-fg-muted max-w-[360px]">
          {description}
        </p>
      </div>
      {action && <div className="mt-pad-md">{action}</div>}
    </div>
  );
}
