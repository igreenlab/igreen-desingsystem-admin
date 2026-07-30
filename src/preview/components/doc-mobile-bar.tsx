/**
 * doc-mobile-bar — barra superior que só existe abaixo de `lg`.
 *
 * O showcase nasceu desktop-only: o sidebar é `w-[260px] min-w-[260px]` num flex
 * row, sem uma única classe responsiva. Num viewport de 390px isso consome **260px
 * (67% da tela)** e o conteúdo fica em ~130px, cortado e com scroll horizontal
 * (medido antes do fix). A barra dá o ponto de entrada pro menu quando ele sai do
 * fluxo e vira drawer.
 *
 * Fica fora do `DocSidebar` de propósito: o sidebar precisa ser `fixed` no mobile
 * pra sobrepor, e um elemento fixed não pode servir de âncora de layout pro
 * conteúdo. A barra é quem ocupa espaço no topo.
 */
export function DocMobileBar({
  onOpenMenu,
  title,
}: {
  onOpenMenu: () => void;
  /** Página atual — orienta quem abriu o link direto num celular. */
  title?: string;
}) {
  return (
    <div className="lg:hidden shrink-0 sticky top-0 z-30 flex items-center gap-gp-md border-b border-border-sidebar bg-bg-sidebar px-pad-xl py-pad-md">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Abrir menu de navegação"
        className="grid place-items-center size-comp-lg shrink-0 rounded-radius-md text-fg-muted transition-colors hover:bg-bg-sidebar-accent hover:text-fg-default focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
      >
        {/* Hambúrguer: 3 barras. currentColor herda o estado de hover/foco do botão. */}
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M2.25 4.5h13.5M2.25 9h13.5M2.25 13.5h13.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="flex items-center gap-gp-md min-w-0">
        <div className="grid place-items-center size-comp-md shrink-0 rounded-radius-md bg-bg-brand text-fg-on-brand font-bold text-caption-sm">
          iG
        </div>
        <p className="text-body-md font-medium text-fg-default truncate">
          {title ?? "iGreen DS"}
        </p>
      </div>
    </div>
  );
}
