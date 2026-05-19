import { Avatar, AvatarFallback } from "@/components/shadcn/avatar";

export type PersonAvatarSize = "sm" | "md" | "lg";

export type PersonAvatarProps = {
  initials: string;
  /** Cor de fundo do avatar — hex/rgb/CSS color (vem do mock do contato). */
  hex: string;
  /** sm=28px / md=36px / lg=40px. Default: md. */
  size?: PersonAvatarSize;
};

const SIZE_CLASSES: Record<PersonAvatarSize, string> = {
  sm: "size-[28px] text-caption-sm",
  md: "size-[36px] text-body-sm font-normal",
  lg: "size-[40px] text-body-md",
};

/**
 * Avatar circular com `initials` em branco bold sobre `hex` como background.
 * Usado em ConversationListItem, header de ConversationColumn e DetailsColumn.
 */
export function PersonAvatar({ initials, hex, size = "md" }: PersonAvatarProps) {
  return (
    <Avatar className={SIZE_CLASSES[size]} style={{ background: hex }}>
      <AvatarFallback className="bg-transparent text-white font-bold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
