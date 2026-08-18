import { useState } from "react";
import type { MouseEvent } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  sidebarSection,
  sidebarSectionHeader,
  sidebarSectionChev,
  sidebarSectionAdd,
  sidebarSectionList,
  sidebarSectionItem,
  sidebarItemText,
  sidebarBookmarkDot,
  sidebarBookmarkIcon,
  sidebarChatAvatar,
  sidebarChatStatus,
} from "./sidebar.styles";
import { shouldPreventNavigation } from "@/utils/nav-link";
import type {
  SidebarSection as SidebarSectionData,
  SidebarLinkRenderer,
} from "./sidebar.types";

export type SidebarSectionProps = {
  section: SidebarSectionData;
  /** Estado controlado — se omitido, gerencia internamente */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Substitui o `<a>` pelo link do router do consumidor. */
  renderLink?: SidebarLinkRenderer;
  className?: string;
};

export function SidebarSection({
  section,
  open,
  onOpenChange,
  renderLink,
  className,
}: SidebarSectionProps) {
  const [internalOpen, setInternalOpen] = useState<boolean>(section.defaultOpen ?? true);
  const isOpen = open ?? internalOpen;
  const collapsed = !isOpen;

  const setOpen = (next: boolean) => {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <div className={cn(sidebarSection(), className)}>
      <button
        type="button"
        className={sidebarSectionHeader()}
        onClick={() => setOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`section-${section.id}`}
      >
        <ChevronDown
          size={12}
          strokeWidth={2}
          className={sidebarSectionChev({ collapsed })}
        />
        <span>{section.label}</span>
        {section.onAdd && (
          <span
            role="button"
            tabIndex={0}
            className={sidebarSectionAdd()}
            onClick={(e: MouseEvent<HTMLSpanElement>) => {
              e.stopPropagation();
              section.onAdd?.();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                section.onAdd?.();
              }
            }}
            aria-label={`Adicionar em ${section.label}`}
          >
            +
          </span>
        )}
      </button>

      <div
        id={`section-${section.id}`}
        className={sidebarSectionList({ collapsed, variant: section.variant })}
      >
        {section.variant === "bookmark" &&
          section.items.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarSectionLink
                key={item.name}
                href={item.href}
                onClick={item.onClick}
                renderLink={renderLink}
                title={item.name}
              >
                {Icon ? (
                  <span
                    className={sidebarBookmarkIcon()}
                    style={{ color: item.color }}
                    aria-hidden="true"
                  >
                    <Icon />
                  </span>
                ) : (
                  <span
                    className={sidebarBookmarkDot()}
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                )}
                <span className={sidebarItemText()}>{item.name}</span>
              </SidebarSectionLink>
            );
          })}

        {section.variant === "chat" &&
          section.items.map((item) => (
            <SidebarSectionLink
              key={item.name}
              href={item.href}
              onClick={item.onClick}
              renderLink={renderLink}
              title={`Conversar com ${item.name}`}
            >
              <span
                className={sidebarChatAvatar()}
                style={{ backgroundColor: item.color }}
              >
                {item.initials}
              </span>
              <span className={sidebarItemText()}>{item.name}</span>
              <span
                className={sidebarChatStatus({ status: item.status })}
                aria-hidden="true"
              />
            </SidebarSectionLink>
          ))}
      </div>
    </div>
  );
}

/* ── Wrapper que vira `<a>` ou link do router ──────────────────────────────── */
function SidebarSectionLink({
  href,
  onClick,
  title,
  renderLink,
  children,
}: {
  href?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  title?: string;
  renderLink?: SidebarLinkRenderer;
  children: React.ReactNode;
}) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Sem href (ou `#` puro) o anchor é só afordância — cancelar sempre foi certo aqui.
    if (!href || href === "#") {
      e.preventDefault();
      onClick?.(e);
      return;
    }
    // COM href, a versão anterior não cancelava nada: com `href` de path o browser
    // navegava e recarregava a página, mesmo tendo `onClick`. Mesma causa do
    // `sidebar-item.tsx`. Ver `@/utils/nav-link`.
    if (!renderLink) {
      const prevent = shouldPreventNavigation({
        href,
        hasHandler: !!onClick,
        event: e,
      });
      if (prevent) e.preventDefault();
    }
    onClick?.(e);
  };

  const linkProps = {
    href: href ?? "#",
    className: sidebarSectionItem(),
    onClick: handleClick,
    title,
    children,
  };

  // `renderLink` só faz sentido com destino real — `#` puro é afordância, não rota.
  if (renderLink && href && href !== "#") return <>{renderLink(linkProps)}</>;

  return <a {...linkProps} />;
}
