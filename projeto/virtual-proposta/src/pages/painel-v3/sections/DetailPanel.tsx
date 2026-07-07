import { Panel } from "@/components/ui/Panel";
import { Avatar } from "@/components/ui/avatar-ig";
import { Chip } from "@/components/ui/Chip";
import { healthDrill } from "../v3-mock";

/** Painel de drill-down das métricas da Saúde da rede (lista mockada). */
export function DetailPanel({
  drillId,
  onClose,
}: {
  drillId: string | null;
  onClose: () => void;
}) {
  const data = drillId ? healthDrill[drillId] : undefined;

  return (
    <Panel
      open={!!data}
      onOpenChange={(o) => !o && onClose()}
      side="right"
      size="md"
      title={data?.title ?? ""}
      description={data?.description}
    >
      {data && data.rows.length > 0 ? (
        <div className="flex flex-col gap-gp-sm">
          {data.rows.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-gp-md rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-lg"
            >
              <Avatar color="muted" size="md" aria-label={r.name}>
                {r.initials}
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-title-md font-semibold text-fg-default">
                  {r.name}
                </p>
                <p className="text-body-sm text-fg-muted">{r.sub}</p>
              </div>
              {r.value && (
                <Chip
                  color={r.value === "inativo" ? "danger" : "neutral"}
                  variant="soft"
                  size="sm"
                  className="shrink-0"
                >
                  {r.value}
                </Chip>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid place-items-center py-pad-7xl text-center">
          <p className="text-body-sm text-fg-muted">
            {data?.emptyHint ?? "Nada por aqui ainda."}
          </p>
        </div>
      )}
    </Panel>
  );
}
