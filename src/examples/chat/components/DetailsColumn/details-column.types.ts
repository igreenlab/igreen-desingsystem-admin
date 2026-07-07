import type { Conversation, ConversationDetail } from "../../chat-v2.types";

export type SectionsState = Record<"contact" | "ticket" | "history", boolean>;

export type DetailsColumnProps = {
  conversation: Conversation;
  detail: ConversationDetail;
  openSections: SectionsState;
  onToggleSection: (id: keyof SectionsState) => void;
  onClose: () => void;
  width: number;
  onResizeStart: (e: React.MouseEvent) => void;
  /** Em mobile: botão de voltar pro chat. Desktop esconde. */
  onBackToChat?: () => void;
  className?: string;
};
