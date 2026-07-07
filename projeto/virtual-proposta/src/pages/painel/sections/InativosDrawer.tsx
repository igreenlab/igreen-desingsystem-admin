import { UserX } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Avatar } from "@/components/ui/avatar-ig";
import { Chip } from "@/components/ui/Chip";
import { inativosList } from "../painel-mock";

export function InativosDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Panel
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      size="md"
      title="Inativos"
      description={`${inativosList.length} pessoas +90 dias sem atividade`}
      titleIcon={UserX}
    >
      <div className="flex flex-col gap-gp-sm">
        {inativosList.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-gp-md rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-lg"
          >
            <Avatar color="muted" size="md" aria-label={p.name}>
              {p.initials}
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-gp-sm">
                <span className="truncate text-title-md font-semibold text-fg-default">
                  {p.name}
                </span>
                <Chip color="neutral" variant="soft" size="sm">
                  {p.categoria}
                </Chip>
              </div>
              <p className="text-body-sm text-fg-muted">
                {p.cidade} · {p.linha}
              </p>
            </div>
            <Chip color="danger" variant="soft" size="sm" className="shrink-0">
              {p.diasParado}d parado
            </Chip>
          </div>
        ))}
      </div>
    </Panel>
  );
}
