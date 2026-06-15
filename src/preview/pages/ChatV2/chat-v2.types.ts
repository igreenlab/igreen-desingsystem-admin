import type { LucideIcon } from "@/lib/lucide-types";

/* ── Channels (canais de comunicação) ───────────────────────────── */

export type ChannelId =
  | "whatsapp"
  | "telegram"
  | "instagram"
  | "webchat"
  | "email";

/* ── Conversation (item da fila) ─────────────────────────────────── */

export type ConvTagKind = "warning" | "info" | "success";

export type ConversationStatus = "attending" | "waiting" | "ai";

export type Conversation = {
  id: string;
  name: string;
  initials: string;
  avatarHex: string;
  channel: ChannelId;
  tag: string;
  tagKind: ConvTagKind;
  status: ConversationStatus;
  statusLabel: string;
  last: string;
  time: string;
  unread: number;
};

/* ── Details (painel direito da tela) ────────────────────────────── */

export type ConversationHistoryItem = {
  id: string;
  subject: string;
  date: string;
  status: string;
};

export type ConversationDetail = {
  phone: string;
  email: string;
  firstContact: string;
  assignedTo: string;
  createdAt: string;
  extraTags: string[];
  history: ConversationHistoryItem[];
};

/* ── Filters (sidebar esquerda) ──────────────────────────────────── */

export type FilterGroupKey = "status" | "channels" | "categories" | "innerStatus";

export type FilterItem = {
  id: string;
  name: string;
  count: number;
  hasUnread?: boolean;
  /** Cor do dot/ícone leading — aceita CSS var ou hex. */
  color?: string;
  /** Componente lucide opcional pra leading. */
  icon?: LucideIcon;
};

/* ── Messages (thread) ───────────────────────────────────────────── */

export type MessageStatus = "sent" | "read";

export type Message = {
  id: number;
  from: "me" | "them";
  text: string;
  time: string;
  status?: MessageStatus;
};

/* ── Queue filter chips (Todas / Não lidas / Lidas) ─────────────── */

export type QueueFilter = "all" | "unread" | "read";
