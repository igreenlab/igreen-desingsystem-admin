import {
  forwardRef,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

import { Avatar } from "@/components/ui/avatar-ig";
import { MarkdownText } from "@/components/ui/MarkdownText";

import { conversationListItemStyles } from "./conversation-list-item.styles";
import type {
  ConversationListItemAvatar,
  ConversationListItemProps,
} from "./conversation-list-item.types";

/** Deriva até 2 iniciais de um nome (ex "Maria Silva" → "MS"). */
function initialsFromName(name?: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Type-guard: o `avatar` é o objeto de atalho (não um ReactNode)? */
function isAvatarData(
  value: ConversationListItemAvatar | ReactNode,
): value is ConversationListItemAvatar {
  return (
    typeof value === "object" &&
    value !== null &&
    !isValidElement(value) &&
    ("src" in value || "name" in value || "colorHex" in value)
  );
}

/**
 * ConversationListItem — item de lista de conversa (Atendimento / Chat).
 *
 * Linha clicável (não-DataTable) que compõe Avatar + Chip (via slot `badges`) +
 * Button/Icon (via slot `actions`) + MarkdownText (prévia inline). Visual 100%
 * por tokens DS; cores claro/escuro resolvidas via tokens (`.dark{}`).
 *
 * Renderiza como `div[role="button"]` (não `<button>`) porque os slots `actions`
 * podem conter `<button>` próprios (Pencil/Trash/menu) — botão aninhado é HTML
 * inválido. A11y por teclado: `tabIndex=0` + Enter/Space disparam `onClick`.
 * Foco = Padrão 1 (ring-4 brand). `disabled` é o último compoundVariant (L-006).
 *
 * - `avatar`: objeto `{ src?, name?, colorHex? }` (atalho que monta o Avatar do
 *   DS — iniciais derivadas do nome; `src` vira <img> dentro do Avatar) OU um
 *   `ReactNode` custom.
 * - `preview`: markdown WA renderizado inline e truncado em 1 linha.
 * - `badges`/`actions`: slots — o consumidor passa `<Chip>`/`<Button>` do DS.
 * - `unread > 0`: badge danger no trailing.
 * - `selected`: stripe brand 3px à esquerda + bg muted.
 */
export const ConversationListItem = forwardRef<
  HTMLDivElement,
  ConversationListItemProps
>(function ConversationListItem(
  {
    title,
    avatar,
    preview,
    time,
    badges,
    unread,
    variant = "ticket",
    density = "comfortable",
    selected = false,
    disabled = false,
    actions,
    onClick,
    className,
  },
  ref,
) {
  const hasUnread = typeof unread === "number" && unread > 0;
  const styles = conversationListItemStyles({
    variant,
    density,
    selected,
    unread: hasUnread,
    disabled,
  });

  const interactive = !disabled && typeof onClick === "function";

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  // Cliques dentro do slot de ações não devem disparar o onClick da linha.
  const stopActions = (e: MouseEvent) => e.stopPropagation();

  /* ── Coluna do avatar ──────────────────────────────────────────────── */
  let avatarNode: ReactNode = null;
  if (avatar != null) {
    if (isAvatarData(avatar)) {
      const { src, name, colorHex } = avatar;
      const label = name ?? title;
      avatarNode = (
        <Avatar size="lg" colorHex={colorHex} aria-label={label}>
          {src ? (
            <img
              src={src}
              alt=""
              className="size-full object-cover"
              aria-hidden="true"
            />
          ) : (
            initialsFromName(name ?? title)
          )}
        </Avatar>
      );
    } else {
      avatarNode = avatar;
    }
  }

  return (
    <div
      ref={ref}
      className={styles.root({
        className: [interactive && "cursor-pointer", className]
          .filter(Boolean)
          .join(" "),
      })}
      onClick={interactive ? onClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      {...(interactive ? { role: "button" as const, tabIndex: 0 } : {})}
      aria-disabled={disabled || undefined}
      aria-current={selected ? "true" : undefined}
    >
      {avatarNode && <span className={styles.media()}>{avatarNode}</span>}

      <span className={styles.body()}>
        <span className={styles.topRow()}>
          <span className={styles.title()}>{title}</span>
          {time && <span className={styles.time()}>{time}</span>}
        </span>

        {preview && (
          <MarkdownText inline className={styles.preview()}>
            {preview}
          </MarkdownText>
        )}

        {badges && <span className={styles.badges()}>{badges}</span>}
      </span>

      {(hasUnread || actions) && (
        <span className={styles.trailing()}>
          {hasUnread && (
            <span className={styles.unread()} aria-label={`${unread} não lidas`}>
              {unread! > 99 ? "99+" : unread}
            </span>
          )}
          {actions && (
            <span className={styles.actions()} onClick={stopActions}>
              {actions}
            </span>
          )}
        </span>
      )}
    </div>
  );
});

ConversationListItem.displayName = "ConversationListItem";
