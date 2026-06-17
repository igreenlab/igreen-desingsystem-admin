import type { Conversation } from "../../chat-v2.types";

export type ConversationListItemProps = {
  conv: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
};
