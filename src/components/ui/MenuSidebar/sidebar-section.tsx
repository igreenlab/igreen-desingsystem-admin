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
  sidebarChatAvatar,
  sidebarChatStatus,
} from "./sidebar.styles";
import type { SidebarSection as SidebarSectionData } from "./sidebar.types";

export type SidebarSectionProps = {
  section: SidebarSectionData;
  /** Estado controlado — se omitido, gerencia internamente */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export function SidebarSection({
  section,
  open,
  onOpenChange,
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
          section.items.map((item) => (
            <SidebarSectionLink
              key={item.name}
              href={item.href}
              onClick={item.onClick}
              title={item.name}
            >
              <span
                className={sidebarBookmarkDot()}
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className={sidebarItemText()}>{item.name}</span>
            </SidebarSectionLink>
          ))}

        {section.variant === "chat" &&
          section.items.map((item) => (
            <SidebarSectionLink
              key={item.name}
              href={item.href}
              onClick={item.onClick}
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

/* ── Wrapper que vira `<a>` ou `<button>` ─────────────────────────────────── */
function SidebarSectionLink({
  href,
  onClick,
  title,
  children,
}: {
  href?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  title?: string;
  children: React.ReactNode;
}) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!href || href === "#") e.preventDefault();
    onClick?.(e);
  };

  return (
    <a
      href={href ?? "#"}
      className={sidebarSectionItem()}
      onClick={handleClick}
      title={title}
    >
      {children}
    </a>
  );
}
