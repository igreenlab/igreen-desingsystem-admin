import { useState } from "react";
import { Send } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button/button";
import { Textarea } from "@/components/shadcn/textarea";
import { SectionCard, SectionDivider } from "./section-card";
import type { Order, OrderComment } from "../order.types";

export function CommentsTab({ order }: { order: Order }) {
  const [comments, setComments] = useState<OrderComment[]>(order.comments);
  const [draft, setDraft] = useState("");

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    setComments((prev) => [
      ...prev,
      {
        id: `local-${prev.length + 1}`,
        author: "Suporte iGreen",
        initials: "SI",
        colorHex: "#3B82F6",
        when: "agora",
        text,
      },
    ]);
    setDraft("");
  };

  return (
    <SectionCard
      title="Comentários"
      action={
        <span className="rounded-radius-full bg-bg-muted px-pad-md py-[2px] text-caption-sm font-semibold text-fg-muted">
          {comments.length}
        </span>
      }
    >
      {/* Composer — avatar + caixa com footer de ação */}
      <div className="flex gap-gp-md">
        <Avatar size="md" colorHex="#3B82F6" aria-label="Você">
          SI
        </Avatar>
        <div className="flex-1 overflow-hidden rounded-radius-lg border border-border-default bg-bg-canvas transition-[border-color,box-shadow] focus-within:border-border-brand focus-within:shadow-sh-ring">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Escreva um comentário..."
            rows={3}
            className="resize-none border-0 bg-transparent px-pad-lg py-pad-md shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center justify-between gap-gp-md border-t border-border-subtle px-pad-lg py-pad-sm">
            <span className="text-caption-sm text-fg-subtle">
              Visível para a equipe e o cliente.
            </span>
            <Button
              variant="filled"
              color="primary"
              size="sm"
              iconLeft={<Send />}
              disabled={!draft.trim()}
              onClick={submit}
            >
              Comentar
            </Button>
          </div>
        </div>
      </div>

      <SectionDivider className="my-gp-2xl" />

      {/* Thread estilo blog — avatar + balão + ações */}
      <ul className="flex flex-col gap-gp-2xl">
        {comments.map((cm) => (
          <li key={cm.id} className="flex gap-gp-md">
            <Avatar size="md" colorHex={cm.colorHex} aria-label={cm.author}>
              {cm.initials}
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="rounded-radius-lg border border-border-subtle bg-bg-canvas px-pad-lg py-pad-md">
                <div className="flex items-center justify-between gap-gp-sm">
                  <span className="text-body-sm font-semibold text-fg-default">
                    {cm.author}
                  </span>
                  <span className="text-caption-sm text-fg-subtle">
                    {cm.when}
                  </span>
                </div>
                <p className="mt-gp-xs text-body-sm leading-relaxed text-fg-default">
                  {cm.text}
                </p>
              </div>
              <div className="mt-gp-2xs flex items-center gap-gp-lg pl-pad-sm">
                <button
                  type="button"
                  className="text-caption-sm font-medium text-fg-muted transition-colors hover:text-fg-brand"
                >
                  Responder
                </button>
                <button
                  type="button"
                  className="text-caption-sm font-medium text-fg-muted transition-colors hover:text-fg-brand"
                >
                  Curtir
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
