import { MessageCircle, Phone } from "lucide-react";
import {
  FloatingPanel,
  FloatingPanelSection,
  FloatingPanelField,
} from "@/components/ui/FloatingPanel";
import { Avatar } from "@/components/ui/avatar-ig";
import { Button } from "@/components/ui/Button";
import {
  byId,
  formatNum,
  kwh,
  subtreeLabel,
  type MapaRedeNode,
} from "../mapa-rede-mock";
import { GradChip, ProChip, initialsOf } from "../mapa-rede-ui";

export function MapaRedeDetailPanel({
  nodeId,
  onClose,
}: {
  nodeId: string | null;
  onClose: () => void;
}) {
  const c: MapaRedeNode | undefined = nodeId ? byId[nodeId] : undefined;
  if (!c) return null;

  const whatsapp = () => window.open("https://wa.me/", "_blank");
  const sub = subtreeLabel(c);

  return (
    <FloatingPanel
      open={!!c}
      onOpenChange={(o) => !o && onClose()}
      side="right"
      size="md"
      resizable
      maximizable
      bodyPadded={false}
      resizableStorageKey="mapa-rede.detail-panel.width"
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
              <span className="tabular-nums">N{c.nivel}</span>
              <span className="opacity-50">·</span>
              <GradChip graduacao={c.graduacao} />
              {c.pro && <ProChip />}
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
      <FloatingPanelSection title="Contato">
        <FloatingPanelField
          label="Celular"
          value={
            <a
              href={`tel:${c.celular.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-gp-2xs text-fg-brand hover:underline [&>svg]:size-icon-xs"
            >
              <Phone />
              {c.celular}
            </a>
          }
        />
        <FloatingPanelField label="Cidade" value={`${c.cidade}/${c.uf}`} />
        <FloatingPanelField label="ID" value={<span className="tabular-nums">#{c.idconsultor}</span>} />
      </FloatingPanelSection>

      <FloatingPanelSection title="Rede">
        <FloatingPanelField label="Graduação" value={<GradChip graduacao={c.graduacao} />} />
        <FloatingPanelField label="Nível" value={<span className="tabular-nums">N{c.nivel}</span>} />
        <FloatingPanelField
          label="Licenciados diretos"
          value={
            <span className="tabular-nums">
              {formatNum(c.licenciadosDiretosAtivos)}/{formatNum(c.licenciadosDiretos)} ativos
            </span>
          }
        />
        <FloatingPanelField label="Subárvore" value={sub || "Folha (sem rede)"} />
        <FloatingPanelField label="Plano PRO" value={c.pro ? "Ativo" : "—"} />
      </FloatingPanelSection>

      <FloatingPanelSection title="Volume">
        <FloatingPanelField label="GP (própria)" value={<span className="tabular-nums">{kwh(c.gp)}</span>} />
        <FloatingPanelField label="GI (indireta)" value={<span className="tabular-nums">{kwh(c.gi)}</span>} />
        <FloatingPanelField label="Bonificável" value={<span className="tabular-nums">{kwh(c.bonificavel)}</span>} />
      </FloatingPanelSection>

      <FloatingPanelSection title="Operação">
        <FloatingPanelField label="Clientes ativos" value={<span className="tabular-nums">{formatNum(c.clientesAtivos)}</span>} />
        <FloatingPanelField label="Ligações" value={<span className="tabular-nums">{formatNum(c.ligacoes)}</span>} />
        <FloatingPanelField label="Devolutivas abertas" value={<span className="tabular-nums">{formatNum(c.devolutivas)}</span>} />
        <FloatingPanelField label="Aguardando validação" value={<span className="tabular-nums">{formatNum(c.agValid)}</span>} />
        <FloatingPanelField label="Ativo desde" value={c.dataAtivo} />
      </FloatingPanelSection>
    </FloatingPanel>
  );
}
