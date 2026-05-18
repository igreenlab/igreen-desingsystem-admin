import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../Button/button";
import { ChipGroup, ChipGroupItem } from "../Chip";
import {
  headerIconBtnBadge,
  hdWrap,
  hdDropdown,
  hdTop,
  hdHeader,
  hdTitle,
  hdTitleCount,
  hdHeaderActions,
  hdBody,
  hdEmpty,
  hdEmptyText,
  hdNotif,
  hdNotifIcon,
  hdNotifBody,
  hdNotifTitle,
  hdNotifText,
  hdNotifTime,
  hdNotifDot,
  hdFooter,
  hdFooterLink,
} from "./header.styles";
import type {
  HeaderNotification,
  HeaderNotificationFilter,
  HeaderNotificationsConfig,
} from "./header.types";

const DEFAULT_FILTERS: HeaderNotificationFilter[] = [
  { id: "all", label: "Todas", predicate: () => true },
  { id: "unread", label: "Não lidas", predicate: (n) => !!n.unread },
  { id: "mentions", label: "Menções", predicate: (n) => n.kind === "mention" },
];

export type HeaderNotificationsProps = {
  config: HeaderNotificationsConfig;
  className?: string;
};

export function HeaderNotifications({ config, className }: HeaderNotificationsProps) {
  const {
    items,
    filters = DEFAULT_FILTERS,
    emptyMessage = "Nenhuma notificação por aqui.",
    onMarkAllRead,
    onMoreActions,
    onViewAll,
    viewAllLabel = "Ver todas as notificações",
  } = config;

  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(filters[0]?.id ?? "all");
  const wrapRef = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((n) => n.unread).length;

  // Click outside + Escape pra fechar
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const filtered = items.filter(
    filters.find((f) => f.id === activeFilter)?.predicate ?? (() => true)
  );

  return (
    <div ref={wrapRef} className={cn(hdWrap(), className)}>
      <Button
        color="secondary"
        variant="outline"
        size="icon-sm"
        className="rounded-radius-md relative"
        aria-label="Notificações"
        title="Notificações"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Bell />
        {unreadCount > 0 && (
          <span className={headerIconBtnBadge({ kind: "danger" })} aria-hidden="true" />
        )}
      </Button>

      {open && (
        <div className={hdDropdown()} role="dialog" aria-label="Notificações">
          <div className={hdTop()}>
            <div className={hdHeader()}>
              <div className={hdTitle()}>
                <span>Notificações</span>
                {unreadCount > 0 && <span className={hdTitleCount()}>{unreadCount}</span>}
              </div>
              <div className={hdHeaderActions()}>
                {onMarkAllRead && (
                  <Button
                    color="secondary"
                    variant="ghost"
                    size="icon-2xs"
                    className="rounded-radius-sm"
                    title="Marcar todas como lidas"
                    onClick={onMarkAllRead}
                  >
                    <CheckCheck />
                  </Button>
                )}
                {onMoreActions && (
                  <Button
                    color="secondary"
                    variant="ghost"
                    size="icon-2xs"
                    className="rounded-radius-sm"
                    title="Mais ações"
                    onClick={onMoreActions}
                  >
                    <MoreHorizontal />
                  </Button>
                )}
              </div>
            </div>

            {filters.length > 0 && (
              <ChipGroup
                type="single"
                value={activeFilter}
                onValueChange={(v) => v && setActiveFilter(v)}
                size="lg"
                ariaLabel="Filtrar notificações"
              >
                {filters.map((f) => {
                  const count = items.filter(f.predicate ?? (() => true)).length;
                  return (
                    <ChipGroupItem key={f.id} value={f.id}>
                      {f.label}
                      {count > 0 && ` (${count})`}
                    </ChipGroupItem>
                  );
                })}
              </ChipGroup>
            )}
          </div>

          <div className={hdBody()}>
            {filtered.length === 0 ? (
              <div className={hdEmpty()}>
                <Bell size={28} strokeWidth={1.4} />
                <p className={hdEmptyText()}>{emptyMessage}</p>
              </div>
            ) : (
              filtered.map((n) => <NotificationRow key={n.id} item={n} />)
            )}
          </div>

          {onViewAll && (
            <div className={hdFooter()}>
              <a
                href="#"
                className={hdFooterLink()}
                onClick={(e) => {
                  e.preventDefault();
                  onViewAll();
                  setOpen(false);
                }}
              >
                {viewAllLabel}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationRow({ item }: { item: HeaderNotification }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      className={hdNotif()}
      onClick={item.onClick}
    >
      <span
        className={hdNotifIcon()}
        style={{ color: item.color, background: `${item.color}1f` }}
        aria-hidden="true"
      >
        <Icon size={15} strokeWidth={1.8} />
      </span>
      <span className={hdNotifBody()}>
        <span className={hdNotifTitle()}>{item.title}</span>
        <span className={hdNotifText()}>{item.body}</span>
        <span className={hdNotifTime()}>{item.time}</span>
      </span>
      {item.unread && <span className={hdNotifDot()} aria-label="não lida" />}
    </button>
  );
}
