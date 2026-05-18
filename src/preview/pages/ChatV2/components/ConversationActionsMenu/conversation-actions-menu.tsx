import {
  Archive,
  CheckCircle2,
  MoreVertical,
  Phone,
  Tag,
  UserPlus,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";

export type ConversationActionsMenuProps = {
  /** Quando true, adiciona "Resolver" no topo do dropdown (mobile compact). */
  showResolveInMenu?: boolean;
  onResolve?: () => void;
  onCall?: () => void;
  onVideo?: () => void;
  onAddTag?: () => void;
  onAssign?: () => void;
  onArchive?: () => void;
};

/**
 * Dropdown "..." do header da conversa com 5–6 ações (Ligar, Vídeo, Tag,
 * Atribuir, Arquivar; opcionalmente Resolver no topo pra mobile).
 */
export function ConversationActionsMenu({
  showResolveInMenu = false,
  onResolve,
  onCall,
  onVideo,
  onAddTag,
  onAssign,
  onArchive,
}: ConversationActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          color="secondary"
          variant="outline"
          size="icon-sm"
          aria-label="Mais opções"
        >
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="min-w-[200px]">
        {showResolveInMenu && (
          <>
            <DropdownMenuItem onSelect={onResolve}>
              <CheckCircle2 /> Resolver
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onSelect={onCall}>
          <Phone /> Ligar
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onVideo}>
          <Video /> Vídeo chamada
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onAddTag}>
          <Tag /> Adicionar tag
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onAssign}>
          <UserPlus /> Atribuir
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onArchive}>
          <Archive /> Arquivar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
