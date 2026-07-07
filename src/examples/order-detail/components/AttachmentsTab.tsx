import { Download, FileText, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button/button";
import { SectionCard } from "./section-card";
import type { Order } from "../order.types";

export function AttachmentsTab({ order }: { order: Order }) {
  return (
    <SectionCard title="Anexos">
      <ul className="flex flex-col">
        {order.attachments.map((f, i) => {
          const Icon = f.kind === "image" ? ImageIcon : FileText;
          return (
            <li
              key={f.id}
              className={
                "flex items-center gap-gp-md py-pad-lg" +
                (i > 0 ? " border-t border-border-subtle" : "")
              }
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-radius-md bg-bg-muted text-fg-muted">
                <Icon className="size-icon-sm" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-body-sm font-semibold text-fg-default">
                  {f.name}
                </p>
                <p className="text-caption-sm uppercase tracking-wider text-fg-muted">
                  {f.kind} · {f.size}
                </p>
              </div>
              <Button
                variant="ghost"
                color="secondary"
                size="sm"
                iconLeft={<Download />}
              >
                Baixar
              </Button>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
