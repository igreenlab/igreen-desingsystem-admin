import { forwardRef } from "react";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  sidebarItem,
  sidebarItemIcon,
  sidebarItemText,
  sidebarPill,
} from "./sidebar.styles";
import { shouldPreventNavigation } from "./nav-link";
import type {
  SidebarMenuItem,
  SidebarBadgeKind,
  SidebarLinkRenderer,
} from "./sidebar.types";

export type SidebarItemProps = {
  item: SidebarMenuItem;
  active?: boolean;
  subitem?: boolean;
  /** Quando true, o ícone usa cor de brand (usado em groups com filho ativo) */
  iconBrand?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  /** Substitui o `<a>` pelo link do router do consumidor. Ver `SidebarLinkRenderer`. */
  renderLink?: SidebarLinkRenderer;
  /**
   * O consumidor trata a navegação? Decide se o clique cancela o `<a>` nativo.
   *
   * ⚠️ Existe porque **inferir pelo `onClick` não funciona no caminho composto**: o
   * `SidebarPanel` SEMPRE passa um `onClick` (é como o `MenuSidebar` mantém o item ativo
   * em modo uncontrolled), então "tem onClick" seria sempre verdadeiro e o sidebar
   * cancelaria a navegação até de quem não passou handler nenhum — trocando o bug do
   * reload por "o link não faz nada". Foi o que um teste pegou nesta implementação.
   *
   * - `undefined` (uso standalone do `SidebarItem`) → infere de `item.onClick`/`onClick`.
   * - `boolean` (uso composto) → o `MenuSidebar` decide, olhando o `onItemClick` DELE.
   */
  interceptNavigation?: boolean;
  className?: string;
};

export const SidebarItem = forwardRef<HTMLAnchorElement | HTMLButtonElement, SidebarItemProps>(
  (
    {
      item,
      active,
      subitem,
      iconBrand,
      onClick,
      renderLink,
      interceptNavigation,
      className,
    },
    ref,
  ) => {
    const Icon = item.icon;
    const classes = cn(sidebarItem({ active, subitem }), className);

    const content: ReactNode = (
      <>
        {Icon && (
          <Icon
            size={subitem ? 15 : 17}
            strokeWidth={1.7}
            className={sidebarItemIcon({ active, parentActive: iconBrand })}
          />
        )}
        <span className={sidebarItemText()}>{item.name}</span>
        {item.badge && (
          <SidebarPill kind={item.badgeKind} active={active}>
            {item.badge}
          </SidebarPill>
        )}
      </>
    );

    const handleClick = (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      // Cancela a navegação nativa do `<a>` quando o consumidor claramente trata o
      // clique — mas nunca em clique modificado, `target="_blank"`, link externo ou
      // href de HASH. A regra e o porquê de cada exceção estão em `nav-link.ts`.
      //
      // Só corre quando NÃO há `renderLink`: com ele, quem decide é o `<Link>` do router.
      if (!renderLink) {
        const prevent = shouldPreventNavigation({
          href: item.href,
          hasHandler: interceptNavigation ?? !!(item.onClick || onClick),
          target: item.target,
          event: e as MouseEvent<HTMLAnchorElement>,
        });
        if (prevent) e.preventDefault();
      }
      if (item.onClick) item.onClick(e);
      onClick?.(e);
    };

    if (item.href) {
      const linkProps = {
        href: item.href,
        className: classes,
        onClick: handleClick as (e: MouseEvent<HTMLAnchorElement>) => void,
        target: item.target,
        "aria-current": active ? ("page" as const) : undefined,
        ref: ref as React.Ref<HTMLAnchorElement>,
        children: content,
      };

      // `renderLink` recebe as props de um `<a>` e devolve o link do router do
      // consumidor. `ref` vai no objeto: em React 19 `ref` é prop normal, então
      // funciona igual pra elemento DOM e pra componente.
      if (renderLink) return <>{renderLink(linkProps)}</>;

      return <a {...linkProps} />;
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        onClick={handleClick}
        aria-current={active ? "page" : undefined}
      >
        {content}
      </button>
    );
  }
);
SidebarItem.displayName = "SidebarItem";

/* ── Pill (badge) ─────────────────────────────────────────────────────────── */
export function SidebarPill({
  kind,
  active,
  children,
  className,
}: {
  kind?: SidebarBadgeKind;
  active?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn(sidebarPill({ kind, active }), className)}>
      {children}
    </span>
  );
}
