import { MessageCircle } from "lucide-react";
import {
  FloatingPanel,
  FloatingPanelSection,
  FloatingPanelField,
} from "@/components/ui/FloatingPanel";
import { Avatar } from "@/components/ui/avatar-ig";
import { Button } from "@/components/ui/Button";
import {
  ATIVIDADES,
  num,
  atividadesConcluidas,
  proMakerById,
  type ProMakerConsultor,
} from "../pro-maker-mock";
import {
  MissionCard,
  StatusPill,
  StepBar,
  initialsOf,
} from "../pro-maker-ui";

/** Detalhe do consultor — estilo finance (sections por categoria + list rows). */
export function ProMakerDetailPanel({
  consultorId,
  onClose,
}: {
  consultorId: string | null;
  onClose: () => void;
}) {
  const c: ProMakerConsultor | undefined = consultorId
    ? proMakerById[consultorId]
    : undefined;

  if (!c) return null;

  const concluidas = atividadesConcluidas(c);
  const whatsapp = () => window.open("https://wa.me/", "_blank");

  return (
    <FloatingPanel
      open={!!c}
      onOpenChange={(o) => !o && onClose()}
      side="right"
      size="md"
      resizable
      maximizable
      bodyPadded={false}
      resizableStorageKey="pro-maker.detail-panel.width"
      titleSlot={
        <div className="flex min-w-0 items-center gap-gp-md">
          <Avatar color="brand" size="lg" className="shrink-0" aria-label={c.nome}>
            {initialsOf(c.nome)}
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="truncate text-body-md font-semibold text-fg-default">
              {c.nome}
            </div>
            <div className="mt-[2px] flex items-center gap-gp-sm text-body-xs font-normal text-fg-muted">
              <span className="tabular-nums">ID {c.idconsultor}</span>
              <span className="opacity-50">·</span>
              <StatusPill c={c} />
            </div>
          </div>
        </div>
      }
      headerActions={
        <Button
          variant="soft"
          color="success"
          size="icon-sm"
          aria-label="WhatsApp"
          onClick={whatsapp}
        >
          <MessageCircle />
        </Button>
      }
      footer={
        <>
          <Button variant="outline" color="secondary" size="sm" onClick={onClose}>
            Fechar
          </Button>
          <Button
            variant="filled"
            color="success"
            size="sm"
            iconLeft={<MessageCircle />}
            onClick={whatsapp}
          >
            WhatsApp
          </Button>
        </>
      }
    >
      {/* Progresso em destaque — gutter próprio (body sem padding). */}
      <div className="px-[18px] pt-pad-xl pb-pad-md">
        <div className="flex flex-col gap-gp-md rounded-radius-lg bg-bg-brand-subtle p-pad-2xl">
          <div className="flex items-baseline justify-between gap-gp-md">
            <span className="text-caption-sm text-fg-muted">Progresso PRO</span>
            <span className="text-body-md font-bold tabular-nums text-fg-default">
              {concluidas}/{ATIVIDADES.length}
            </span>
          </div>
          <StepBar total={ATIVIDADES.length} done={concluidas} />
        </div>
      </div>

      <FloatingPanelSection title="Rede">
        <FloatingPanelField
          label="Diretos PRO"
          value={<span className="tabular-nums">{num(c.diretosPro)}</span>}
        />
        <FloatingPanelField
          label="Rede PRO"
          value={<span className="tabular-nums">{num(c.redePro)}</span>}
        />
        <FloatingPanelField
          label="Rede total"
          value={<span className="tabular-nums">{num(c.redeTotal)}</span>}
        />
        <FloatingPanelField
          label="Nível"
          value={<span className="tabular-nums">{c.nivel}</span>}
        />
        <FloatingPanelField
          label="Vínculo"
          value={c.direto ? "Direto do líder" : "Indireto"}
        />
      </FloatingPanelSection>

      <FloatingPanelSection title="Identificação">
        <FloatingPanelField label="Graduação" value={c.graduacao} />
        <FloatingPanelField label="Cidade" value={c.cidade} />
        <FloatingPanelField
          label="Código"
          value={<span className="tabular-nums">#{c.idconsultor}</span>}
        />
      </FloatingPanelSection>

      {/* Atividades PRO — passos mantidos como cards (não vira lista). */}
      <FloatingPanelSection title="Atividades PRO">
        <div className="flex flex-col gap-gp-md">
          {ATIVIDADES.map((a) => (
            <MissionCard key={String(a.key)} atividade={a} atual={c[a.key] as number} />
          ))}
        </div>
      </FloatingPanelSection>
    </FloatingPanel>
  );
}
