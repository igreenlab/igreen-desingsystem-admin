import type { ReactNode, MouseEvent } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  sidebarRail,
  sidebarRailBrand,
  sidebarRailList,
  sidebarRailItem,
  sidebarRailActiveBar,
  sidebarRailTooltip,
  sidebarRailAdd,
  sidebarRailUser,
  sidebarRailUserDefault,
} from "./sidebar.styles";
import { SidebarBrandIcon } from "./sidebar-brand";
import { shouldPreventNavigation } from "./nav-link";
import type { SidebarContext, SidebarLinkRenderer } from "./sidebar.types";

export type SidebarRailProps = {
  contexts: SidebarContext[];
  activeContextId: string;
  onContextChange: (id: string) => void;
  brand?: ReactNode;
  user?: ReactNode;
  showAdd?: boolean;
  onAddClick?: () => void;
  /** Destino do brand. Default `"/"`; string vazia torna o brand não-navegável. */
  brandHref?: string;
  onBrandClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  renderLink?: SidebarLinkRenderer;
  className?: string;
};

export function SidebarRail({
  contexts,
  activeContextId,
  onContextChange,
  brand,
  user,
  showAdd = false,
  onAddClick,
  brandHref = "/",
  onBrandClick,
  renderLink,
  className,
}: SidebarRailProps) {
  return (
    <aside className={cn(sidebarRail(), className)}>
      <SidebarBrandLink
        href={brandHref}
        onClick={onBrandClick}
        renderLink={renderLink}
      >
        {brand ?? <SidebarBrandIcon />}
      </SidebarBrandLink>

      <div className={sidebarRailList()}>
        {contexts.map((ctx) => {
          const Icon = ctx.icon;
          const isActive = activeContextId === ctx.id;
          return (
            <button
              key={ctx.id}
              type="button"
              className={sidebarRailItem({ active: isActive })}
              onClick={() => onContextChange(ctx.id)}
              aria-label={ctx.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} strokeWidth={1.7} />
              {isActive && <span className={sidebarRailActiveBar()} aria-hidden="true" />}
              <span className={sidebarRailTooltip()}>{ctx.label}</span>
            </button>
          );
        })}

        {showAdd && (
          <button
            type="button"
            className={sidebarRailAdd()}
            onClick={onAddClick}
            aria-label="Adicionar contexto"
          >
            <Plus size={16} strokeWidth={2} />
          </button>
        )}
      </div>

      {user !== null && (
        <div className={sidebarRailUser()}>
          {user ?? <div className={sidebarRailUserDefault()}>SV</div>}
        </div>
      )}
    </aside>
  );
}

/* ── Brand do rail ─────────────────────────────────────────────────────────── */
//
// ⚠️ Era `<a href="/">` FIXO no JSX até 2026-08-08: recarregava pra raiz em qualquer
// app, sem forma de configurar nem de rotear. Agora aceita `brandHref`, `onBrandClick`
// e `renderLink`, e segue a mesma regra de cancelamento dos itens (ver `nav-link.ts`).
function SidebarBrandLink({
  href,
  onClick,
  renderLink,
  children,
}: {
  href?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  renderLink?: SidebarLinkRenderer;
  children: ReactNode;
}) {
  // `brandHref=""` = brand decorativo/só-ação: vira <button> pra não mentir semântica
  // de link (screen reader anuncia "link" pra algo que não navega).
  if (!href) {
    return (
      <button
        type="button"
        className={sidebarRailBrand()}
        onClick={onClick as unknown as () => void}
        aria-label="Home"
      >
        {children}
      </button>
    );
  }

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!renderLink) {
      const prevent = shouldPreventNavigation({ href, hasHandler: !!onClick, event: e });
      if (prevent) e.preventDefault();
    }
    onClick?.(e);
  };

  const linkProps = {
    href,
    className: sidebarRailBrand(),
    onClick: handleClick,
    "aria-label": "Home",
    children,
  };

  if (renderLink) return <>{renderLink(linkProps)}</>;
  return <a {...linkProps} />;
}
