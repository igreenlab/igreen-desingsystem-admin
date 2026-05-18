import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Mic,
  PanelRightClose,
  PanelRightOpen,
  Paperclip,
  Send,
  Smile,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/shadcn/input";
import { SAMPLE_MESSAGES, STATUS_DOT } from "../../chat-v2-mocks";
import type { Message } from "../../chat-v2.types";
import { ChannelDot } from "../ChannelDot/channel-dot";
import { ConversationActionsMenu } from "../ConversationActionsMenu";
import { DateSeparator } from "../DateSeparator/date-separator";
import { MessageBubble } from "../MessageBubble";
import { PersonAvatar } from "../PersonAvatar";
import { conversationColumnStyles } from "./conversation-column.styles";
import type { ConversationColumnProps } from "./conversation-column.types";

/**
 * Coluna central. Header com avatar + nome + meta (id/canal/status) + ações,
 * thread scrollável com `DateSeparator` + `MessageBubble`, composer com Input
 * + botões. Estado local: texto digitado + lista de mensagens.
 */
export function ConversationColumn({
  conversation,
  detailsOpen,
  onToggleDetails,
  onBackToList,
  className,
}: ConversationColumnProps) {
  const s = conversationColumnStyles();
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Message[]>(SAMPLE_MESSAGES);

  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    setMsgs((m) => [
      ...m,
      {
        id: Date.now(),
        from: "me",
        text: text.trim(),
        time: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sent",
      },
    ]);
    setText("");
  };

  return (
    <section aria-label="Conversa" className={cn(s.root(), className)}>
      {/* Header da conversa */}
      <header className={s.header()}>
        {onBackToList && (
          <Button
            color="secondary"
            variant="ghost"
            size="icon-sm"
            aria-label="Voltar pra lista"
            onClick={onBackToList}
            className="md:hidden"
          >
            <ArrowLeft />
          </Button>
        )}
        <div className="max-md:hidden">
          <PersonAvatar
            initials={conversation.initials}
            hex={conversation.avatarHex}
            size="md"
          />
        </div>

        <div className={s.headerInfo()}>
          <div className={s.headerTitleRow()}>
            <span className={s.headerName()}>{conversation.name}</span>
            <Chip color={conversation.tagKind} variant="soft" size="sm" shape="pill">
              {conversation.tag}
            </Chip>
          </div>

          <div className={s.headerMetaRow()}>
            <span className="[font-variant-numeric:tabular-nums]">
              {conversation.id}
            </span>
            <span aria-hidden>·</span>
            <ChannelDot channel={conversation.channel} />
            <span aria-hidden>·</span>
            <span className={s.statusInner()}>
              <span
                className={s.statusDot()}
                style={{ background: STATUS_DOT[conversation.status] }}
                aria-hidden
              />
              {conversation.statusLabel}
            </span>
          </div>
        </div>

        <div className={s.headerActions()}>
          <Button
            color="primary"
            variant="filled"
            size="sm"
            iconLeft={<CheckCircle2 />}
            className="max-md:hidden"
          >
            Resolver
          </Button>
          <ConversationActionsMenu
            showResolveInMenu
            onResolve={() => console.log("resolver")}
            onCall={() => console.log("ligar")}
            onVideo={() => console.log("video")}
            onAddTag={() => console.log("tag")}
            onAssign={() => console.log("atribuir")}
            onArchive={() => console.log("arquivar")}
          />
          <Button
            color="secondary"
            variant="outline"
            size="icon-sm"
            aria-label={detailsOpen ? "Ocultar detalhes" : "Mostrar detalhes"}
            aria-pressed={detailsOpen}
            onClick={onToggleDetails}
          >
            {detailsOpen ? <PanelRightClose /> : <PanelRightOpen />}
          </Button>
        </div>
      </header>

      {/* Thread */}
      <div className={s.thread()} aria-live="polite">
        <DateSeparator label="Hoje" />
        {msgs.map((m) => (
          <MessageBubble key={m.id} msg={m} />
        ))}
      </div>

      {/* Composer */}
      <form onSubmit={send} className={s.composer()}>
        <Button
          color="secondary"
          variant="ghost"
          size="icon-sm"
          aria-label="Anexar"
          type="button"
        >
          <Paperclip />
        </Button>
        <Input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite uma mensagem..."
          aria-label="Mensagem"
          className="flex-1"
        />
        <Button
          color="secondary"
          variant="ghost"
          size="icon-sm"
          aria-label="Emoji"
          type="button"
        >
          <Smile />
        </Button>
        {text.trim() ? (
          <Button
            color="primary"
            variant="filled"
            size="icon-sm"
            aria-label="Enviar"
            type="submit"
          >
            <Send strokeWidth={2.2} />
          </Button>
        ) : (
          <Button
            color="primary"
            variant="filled"
            size="icon-sm"
            aria-label="Gravar áudio"
            type="button"
          >
            <Mic strokeWidth={2.2} />
          </Button>
        )}
      </form>
    </section>
  );
}
