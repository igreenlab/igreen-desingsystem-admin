import { useEffect, useRef, useState } from "react";
import { MessageSquare, PenLine, Maximize2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../Button/button";
import { ChipGroup, ChipGroupItem } from "../Chip";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../../shadcn/input-group";
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
  hdMsg,
  hdMsgAvatar,
  hdMsgBody,
  hdMsgRow,
  hdMsgName,
  hdMsgTime,
  hdMsgPreviewRow,
  hdMsgPreview,
  hdMsgDot,
  hdFooter,
  hdFooterLink,
} from "./header.styles";
import type {
  HeaderMessage,
  HeaderMessageFilter,
  HeaderMessagesConfig,
} from "./header.types";

const DEFAULT_FILTERS: HeaderMessageFilter[] = [
  { id: "all", label: "Tudo", predicate: () => true },
  { id: "unread", label: "Não lidas", predicate: (m) => !!m.unread },
  { id: "groups", label: "Grupos", predicate: (m) => !!m.group },
];

export type HeaderMessagesProps = {
  config: HeaderMessagesConfig;
  className?: string;
};

export function HeaderMessages({ config, className }: HeaderMessagesProps) {
  const {
    items,
    filters = DEFAULT_FILTERS,
    showSearch = true,
    searchPlaceholder = "Pesquisar conversas...",
    emptyMessage = "Nenhuma conversa encontrada.",
    onNewMessage,
    onExpand,
    onViewAll,
    viewAllLabel = "Ver todas no Chat Interno",
  } = config;

  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(filters[0]?.id ?? "all");
  const [search, setSearch] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((m) => m.unread).length;

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

  const filtered = items
    .filter(filters.find((f) => f.id === activeFilter)?.predicate ?? (() => true))
    .filter((m) =>
      search ? m.name.toLowerCase().includes(search.toLowerCase()) : true
    );

  return (
    <div ref={wrapRef} className={cn(hdWrap(), className)}>
      <Button
        color="secondary"
        variant="outline"
        size="icon-sm"
        className="rounded-radius-md relative"
        aria-label="Mensagens"
        title="Mensagens"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <MessageSquare />
        {unreadCount > 0 && (
          <span className={headerIconBtnBadge({ kind: "brand" })} aria-hidden="true" />
        )}
      </Button>

      {open && (
        <div className={hdDropdown()} role="dialog" aria-label="Mensagens">
          <div className={hdTop()}>
            <div className={hdHeader()}>
              <div className={hdTitle()}>
                <span>Conversas</span>
                {unreadCount > 0 && <span className={hdTitleCount()}>{unreadCount}</span>}
              </div>
              <div className={hdHeaderActions()}>
                {onNewMessage && (
                  <Button
                    color="secondary"
                    variant="ghost"
                    size="icon-2xs"
                    className="rounded-radius-sm"
                    title="Nova mensagem"
                    onClick={onNewMessage}
                  >
                    <PenLine />
                  </Button>
                )}
                {onExpand && (
                  <Button
                    color="secondary"
                    variant="ghost"
                    size="icon-2xs"
                    className="rounded-radius-sm"
                    title="Expandir"
                    onClick={onExpand}
                  >
                    <Maximize2 />
                  </Button>
                )}
              </div>
            </div>

            {showSearch && (
              <InputGroup size="sm">
                <InputGroupAddon align="inline-start">
                  <Search strokeWidth={1.8} />
                </InputGroupAddon>
                <InputGroupInput
                  type="text"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            )}

            {filters.length > 0 && (
              <ChipGroup
                type="single"
                value={activeFilter}
                onValueChange={(v) => v && setActiveFilter(v)}
                size="lg"
                ariaLabel="Filtrar mensagens"
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
                <MessageSquare size={28} strokeWidth={1.4} />
                <p className={hdEmptyText()}>{emptyMessage}</p>
              </div>
            ) : (
              filtered.map((m) => <MessageRow key={m.id} item={m} />)
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

function MessageRow({ item }: { item: HeaderMessage }) {
  return (
    <button
      type="button"
      className={hdMsg()}
      onClick={item.onClick}
      title={`Conversar com ${item.name}`}
    >
      {item.avatarUrl ? (
        <img
          src={item.avatarUrl}
          alt={item.name}
          className="flex-none w-icon-lg h-icon-lg rounded-full object-cover"
        />
      ) : (
        <span className={hdMsgAvatar()} style={{ backgroundColor: item.color }}>
          {item.initials}
        </span>
      )}
      <span className={hdMsgBody()}>
        <span className={hdMsgRow()}>
          <span className={hdMsgName()}>{item.name}</span>
          <span className={hdMsgTime()}>{item.time}</span>
        </span>
        <span className={hdMsgPreviewRow()}>
          <span className={hdMsgPreview()}>{item.preview}</span>
          {item.unread && <span className={hdMsgDot()} aria-label="não lida" />}
        </span>
      </span>
    </button>
  );
}
