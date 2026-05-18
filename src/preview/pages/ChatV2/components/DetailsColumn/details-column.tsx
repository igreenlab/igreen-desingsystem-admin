import { ArrowLeft, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import { CHANNEL_LABEL } from "../../chat-v2-mocks";
import { DetailField } from "../DetailField/detail-field";
import { DetailSection } from "../DetailSection";
import { PersonAvatar } from "../PersonAvatar";
import { detailsColumnStyles } from "./details-column.styles";
import type { DetailsColumnProps } from "./details-column.types";

/**
 * Coluna direita: header com título + close, resize handle no left edge (4px),
 * body scrollável com 3 accordions (Contato, Atendimento, Histórico).
 * Width controlado pelo hook `useResizable` no parent.
 */
export function DetailsColumn({
  conversation,
  detail,
  openSections,
  onToggleSection,
  onClose,
  width,
  onResizeStart,
  onBackToChat,
  className,
}: DetailsColumnProps) {
  const s = detailsColumnStyles();

  return (
    <aside
      aria-label="Detalhes do contato"
      style={{ width }}
      className={cn(s.root(), className)}
    >
      <button
        type="button"
        onMouseDown={onResizeStart}
        aria-label="Redimensionar painel de detalhes"
        className={s.handle()}
      />

      <header className={s.header()}>
        {onBackToChat && (
          <Button
            color="secondary"
            variant="ghost"
            size="icon-sm"
            aria-label="Voltar pra conversa"
            onClick={onBackToChat}
            className="md:hidden"
          >
            <ArrowLeft />
          </Button>
        )}
        <h3 className={s.title()}>Detalhes</h3>
        <Button
          color="secondary"
          variant="ghost"
          size="icon-sm"
          aria-label="Fechar painel"
          onClick={onClose}
        >
          <X />
        </Button>
      </header>

      <div className={s.body()}>
        <DetailSection
          title="Contato"
          open={openSections.contact}
          onToggle={() => onToggleSection("contact")}
        >
          <div className={s.contactHead()}>
            <PersonAvatar
              initials={conversation.initials}
              hex={conversation.avatarHex}
              size="lg"
            />
            <div className={s.contactName()}>{conversation.name}</div>
          </div>
          <DetailField label="Telefone" value={detail.phone} />
          <DetailField label="Email" value={detail.email} />
          <DetailField label="Primeiro contato" value={detail.firstContact} />
        </DetailSection>

        <DetailSection
          title="Atendimento"
          open={openSections.ticket}
          onToggle={() => onToggleSection("ticket")}
        >
          <DetailField label="ID" value={conversation.id} />
          <DetailField label="Status" value={conversation.statusLabel} />
          <DetailField label="Atribuído a" value={detail.assignedTo} />
          <DetailField label="Canal" value={CHANNEL_LABEL[conversation.channel]} />
          <DetailField label="Criado em" value={detail.createdAt} />

          <div className={s.tagsRow()}>
            <span className={s.tagsLabel()}>Tags</span>
            <div className={s.tagsChips()}>
              <Chip color={conversation.tagKind} variant="soft" size="sm" shape="pill">
                {conversation.tag}
              </Chip>
              {detail.extraTags.map((t) => (
                <Chip key={t} color="info" variant="soft" size="sm" shape="pill">
                  {t}
                </Chip>
              ))}
              <button type="button" className={s.tagAddBtn()}>
                <Plus size={11} strokeWidth={2.2} /> tag
              </button>
            </div>
          </div>
        </DetailSection>

        <DetailSection
          title="Histórico"
          open={openSections.history}
          onToggle={() => onToggleSection("history")}
        >
          {detail.history.length === 0 ? (
            <div className={s.historyEmpty()}>Nenhum atendimento anterior.</div>
          ) : (
            <ul className={s.historyList()}>
              {detail.history.map((h) => (
                <li key={h.id} className={s.historyItem()}>
                  <span className={s.historyId()}>{h.id}</span>
                  <div className={s.historyBody()}>
                    <span className={s.historySubject()}>{h.subject}</span>
                    <span className={s.historyMeta()}>
                      {h.date} · {h.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DetailSection>
      </div>
    </aside>
  );
}
