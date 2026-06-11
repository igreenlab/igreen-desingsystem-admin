import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button/button";
import { Textarea } from "@/components/shadcn/textarea";
import { SectionCard } from "./section-card";
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
        <span className="text-body-sm text-fg-muted">{comments.length}</span>
      }
    >
      {/* Caixa de novo comentário */}
      <div className="rounded-radius-md border border-border-subtle bg-bg-canvas p-pad-md">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escreva um comentário..."
          rows={3}
          className="border-0 bg-transparent p-0 focus-visible:ring-0"
        />
        <div className="mt-gp-sm flex justify-end border-t border-border-subtle pt-pad-sm">
          <Button
            variant="filled"
            color="primary"
            size="sm"
            disabled={!draft.trim()}
            onClick={submit}
          >
            Comentar
          </Button>
        </div>
      </div>

      {/* Thread */}
      <ul className="mt-gp-xl flex flex-col">
        {comments.map((cm, i) => (
          <li
            key={cm.id}
            className={
              "flex gap-gp-md py-pad-lg" +
              (i > 0 ? " border-t border-border-subtle" : "")
            }
          >
            <Avatar size="md" colorHex={cm.colorHex} aria-label={cm.author}>
              {cm.initials}
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-gp-sm">
                <span className="text-body-sm font-semibold text-fg-default">
                  {cm.author}
                </span>
                <span className="text-caption-sm text-fg-subtle">{cm.when}</span>
              </p>
              <p className="mt-gp-2xs text-body-sm leading-relaxed text-fg-muted">
                {cm.text}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
