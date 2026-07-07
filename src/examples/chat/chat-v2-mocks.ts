import {
  CheckCircle2,
  Clock,
  Crown,
  Inbox,
  Mail,
  MessageSquare,
  Send,
  Shield,
  Users,
} from "lucide-react";
import type {
  ChannelId,
  Conversation,
  ConversationDetail,
  ConversationStatus,
  FilterGroupKey,
  FilterItem,
  Message,
} from "./chat-v2.types";

/* ── Lookups por canal ──────────────────────────────────────────── */

export const CHANNEL_LABEL: Record<ChannelId, string> = {
  whatsapp:  "WhatsApp",
  telegram:  "Telegram",
  instagram: "Instagram",
  webchat:   "Web Chat",
  email:     "Email",
};

export const CHANNEL_HEX: Record<ChannelId, string> = {
  whatsapp:  "#25d366",
  telegram:  "#0088cc",
  instagram: "#e1306c",
  webchat:   "#0a3a2e",
  email:     "#8754ec",
};

/* ── Status dot (cor por status na sidebar/header) ──────────────── */

export const STATUS_DOT: Record<ConversationStatus, string> = {
  attending: "var(--color-fg-success)",
  waiting:   "var(--color-fg-warning)",
  ai:        "var(--color-fg-info)",
};

/* ── Conversations (fila) ───────────────────────────────────────── */

export const CONVERSATIONS: Conversation[] = [
  {
    id: "#A-2453", name: "Maria Hernandez", initials: "MH", avatarHex: "#f59e0b",
    channel: "whatsapp", tag: "Royal", tagKind: "warning",
    status: "attending", statusLabel: "Em atendimento",
    last: "Quanto seria o investimento inicial?", time: "10:42", unread: 0,
  },
  {
    id: "#A-2455", name: "James Johnson", initials: "JJ", avatarHex: "#0a3a2e",
    channel: "telegram", tag: "Licenciado", tagKind: "info",
    status: "waiting", statusLabel: "Em espera",
    last: "Hey, how are you?", time: "10:30", unread: 2,
  },
  {
    id: "#A-2458", name: "Camila Ribeiro", initials: "CR", avatarHex: "#8754ec",
    channel: "instagram", tag: "Royal", tagKind: "warning",
    status: "attending", statusLabel: "Em atendimento",
    last: "Vou enviar os documentos hoje à tarde", time: "09:55", unread: 1,
  },
  {
    id: "#A-2461", name: "Roberto Souza", initials: "RS", avatarHex: "#0088cc",
    channel: "whatsapp", tag: "Lead", tagKind: "success",
    status: "ai", statusLabel: "IA",
    last: "Obrigado! Vou avaliar a proposta.", time: "Ontem", unread: 0,
  },
  {
    id: "#A-2466", name: "Ana Costa", initials: "AC", avatarHex: "#1cb280",
    channel: "email", tag: "Licenciado", tagKind: "info",
    status: "waiting", statusLabel: "Em espera",
    last: "Bom dia! Quando podemos conversar?", time: "Ontem", unread: 0,
  },
  {
    id: "#A-2470", name: "Pedro Pereira", initials: "PP", avatarHex: "#ef4444",
    channel: "webchat", tag: "Lead", tagKind: "success",
    status: "attending", statusLabel: "Em atendimento",
    last: "Recebi os materiais, muito bons!", time: "Seg", unread: 0,
  },
];

/* ── Filtros (sidebar esquerda) ─────────────────────────────────── */

export const STATUS_WORKFLOW: FilterItem[] = [
  { id: "open",     name: "Abertos",    count: 24, hasUnread: true,  icon: Inbox },
  { id: "pending",  name: "Pendentes",  count: 6,                    icon: Clock },
  { id: "resolved", name: "Resolvidos", count: 18,                   icon: CheckCircle2 },
];

export const CHANNELS_LIST: FilterItem[] = [
  { id: "whatsapp",  name: "WhatsApp",  count: 12, hasUnread: true, color: "#25d366", icon: MessageSquare },
  { id: "telegram",  name: "Telegram",  count: 4,                    color: "#0088cc", icon: Send },
  { id: "instagram", name: "Instagram", count: 5,                    color: "#e1306c", icon: MessageSquare },
  { id: "webchat",   name: "Web Chat",  count: 2,                    color: "#0a3a2e", icon: MessageSquare },
  { id: "email",     name: "Email",     count: 1,                    color: "#8754ec", icon: Mail },
];

export const CATEGORIES_LIST: FilterItem[] = [
  { id: "royal",      name: "Royals",      count: 9,  color: "#f6b51e", icon: Crown },
  { id: "licenciado", name: "Licenciados", count: 11, color: "#8754ec", icon: Shield },
  { id: "lead",       name: "Leads",       count: 4,  color: "#70c748", icon: Users },
];

export const STATUS_INNER_LIST: FilterItem[] = [
  { id: "attending", name: "Em atendimento", count: 8, color: "var(--color-fg-success)" },
  { id: "waiting",   name: "Em espera",      count: 7, color: "var(--color-fg-warning)" },
  { id: "ai",        name: "IA",             count: 9, color: "var(--color-fg-info)" },
];

/* ── Ordem canônica dos 4 grupos de filtros ───────────────────── */

/**
 * Fonte única dos grupos de filtros. Consumido por `FiltersColumn` (com
 * `title`) e `FiltersRail` (sem `title`, divisor entre grupos).
 */
export const FILTER_GROUPS: {
  group: FilterGroupKey;
  title: string;
  items: FilterItem[];
}[] = [
  { group: "status",      title: "STATUS",         items: STATUS_WORKFLOW },
  { group: "channels",    title: "CANAIS",         items: CHANNELS_LIST },
  { group: "categories",  title: "CATEGORIAS",     items: CATEGORIES_LIST },
  { group: "innerStatus", title: "STATUS INTERNO", items: STATUS_INNER_LIST },
];

/* ── Conversation details (painel direito) ──────────────────────── */

export const CONVERSATION_DETAILS: Record<string, ConversationDetail> = {
  "#A-2453": {
    phone: "+55 11 98765-4321",
    email: "maria.hernandez@example.com",
    firstContact: "12 mar 2024",
    assignedTo: "Você",
    createdAt: "Hoje, 09:30",
    extraTags: ["VIP", "Setor financeiro"],
    history: [
      { id: "#A-2401", date: "20 abr 2024", subject: "Dúvida sobre comissão",    status: "Resolvido" },
      { id: "#A-2389", date: "15 abr 2024", subject: "Reativação de conta",      status: "Resolvido" },
      { id: "#A-2367", date: "10 abr 2024", subject: "Materiais exclusivos",     status: "Resolvido" },
    ],
  },
};

export const DEFAULT_DETAIL: ConversationDetail = {
  phone: "—",
  email: "—",
  firstContact: "—",
  assignedTo: "—",
  createdAt: "—",
  extraTags: [],
  history: [],
};

/* ── Sample messages (thread inicial da conversa ativa) ─────────── */

export const SAMPLE_MESSAGES: Message[] = [
  { id: 1, from: "them", text: "Olá! Bom dia 👋", time: "10:30" },
  { id: 2, from: "them", text: "Vi a oferta de vocês para licenciados Royal e gostaria de mais informações.", time: "10:30" },
  { id: 3, from: "me",   text: "Bom dia, Maria! Tudo bem? 😊 Posso te ajudar com toda alegria.", time: "10:32", status: "read" },
  { id: 4, from: "me",   text: "A oferta para Royals inclui 30% de comissão recorrente, suporte prioritário e materiais exclusivos.", time: "10:32", status: "read" },
  { id: 5, from: "them", text: "Have good budget for the project.", time: "10:42" },
  { id: 6, from: "them", text: "Quanto seria o investimento inicial?", time: "10:42" },
];
