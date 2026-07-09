import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { entryOfHref } from "./nav-data";

/**
 * Mapa de rotas DECLARATIVO — href → conteúdo. Substitui a cadeia de
 * `if (href === ...) return <X/>` (frágil e verbosa quando cresce): registrar
 * uma tela = adicionar 1 linha aqui. `resolveRoute` faz o lookup com fallback.
 *
 * Cada tela real vem dos builders do DS (crud/list/dashboard) — aqui os stubs
 * só mostram o esqueleto navegável. Troque `<StubPage/>` pelo componente da tela.
 */
function StubPage({ href }: { href: string }) {
  const entry = entryOfHref(href);
  return (
    <div className="flex h-full min-h-0 flex-col gap-gp-2xl">
      <PageHeader
        title={entry.label}
        description={
          entry.parentLabel
            ? `${entry.contextLabel} › ${entry.parentLabel}`
            : entry.contextLabel
        }
      />
      <div className="grid flex-1 place-items-center rounded-radius-xl border border-dashed border-border-default bg-bg-subtle p-pad-6xl">
        <div className="flex max-w-[420px] flex-col items-center gap-gp-sm text-center">
          <p className="text-title-md font-semibold text-fg-default">
            Conteúdo de “{entry.label}”
          </p>
          <p className="text-body-sm text-fg-muted">
            Monte esta tela com os builders do DS —{" "}
            <code className="rounded-radius-sm bg-bg-muted px-pad-xs py-[1px] text-caption-sm">
              /ds-create-crud
            </code>
            ,{" "}
            <code className="rounded-radius-sm bg-bg-muted px-pad-xs py-[1px] text-caption-sm">
              /ds-create-list
            </code>{" "}
            ou{" "}
            <code className="rounded-radius-sm bg-bg-muted px-pad-xs py-[1px] text-caption-sm">
              /ds-create-dashboard
            </code>{" "}
            — e troque o stub pela tela no mapa de rotas.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Registro de rotas: href → factory de conteúdo. Adicione telas reais aqui
 * (ex.: `"#/app/clientes": () => <ClientesScreen />`).
 */
export const ROUTES: Record<string, () => ReactNode> = {
  "#/app/inicio": () => <StubPage href="#/app/inicio" />,
  "#/app/clientes": () => <StubPage href="#/app/clientes" />,
  "#/app/relatorios/vendas": () => <StubPage href="#/app/relatorios/vendas" />,
  "#/app/relatorios/desempenho": () => (
    <StubPage href="#/app/relatorios/desempenho" />
  ),
  "#/config/perfil": () => <StubPage href="#/config/perfil" />,
  "#/config/equipe": () => <StubPage href="#/config/equipe" />,
};

/** Resolve o conteúdo de um href, com placeholder pra rota não registrada. */
export function resolveRoute(href: string): ReactNode {
  const route = ROUTES[href];
  if (route) return route();
  return (
    <div className="grid h-full min-h-[60vh] place-items-center">
      <p className="text-body-sm text-fg-muted">Rota não encontrada: {href}</p>
    </div>
  );
}
