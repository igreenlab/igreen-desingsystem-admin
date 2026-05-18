import type { Conversation } from "../../chat-v2.types";

export type ConversationColumnProps = {
  conversation: Conversation;
  detailsOpen: boolean;
  onToggleDetails: () => void;
  /** Visível só em mobile (max-md:flex). Desktop esconde. */
  onBackToList?: () => void;
  className?: string;
};
