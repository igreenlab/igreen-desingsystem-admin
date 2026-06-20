import { Pencil, UserMinus } from "lucide-react";
import {
  FloatingPanel,
  FloatingPanelSection,
  FloatingPanelField,
} from "@/components/ui/FloatingPanel";
import { Button } from "@/components/ui/Button/button";
import { Chip } from "@/components/ui/Chip";
import {
  GRADUACAO,
  formatLongDate,
  formatNum,
  subtreeLabel,
} from "../../mapa-de-rede-mocks";
import type { Consultor } from "../../mapa-de-rede.types";

export type ConsultorDetailPanelProps = {
  consultor: Consultor | null;
  onClose: () => void;
  onEdit?: (c: Consultor) => void;
  onRemove?: (c: Consultor) => void;
};

export function ConsultorDetailPanel({
  consultor,
  onClose,
  onEdit,
  onRemove,
}: ConsultorDetailPanelProps) {
  if (!consultor) return null;

  const grad = GRADUACAO[consultor.graduacao];
  const diretos = consultor.children?.length ?? 0;

  return (
    <FloatingPanel
      open={consultor !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      side="right"
      size="md"
      resizable
      maximizable
      bodyPadded={false}
      resizableStorageKey="mapa-de-rede.detail-panel.width"
      titleSlot={
        <div className="flex min-w-0 flex-col gap-gp-2xs">
          <span className="truncate text-body-md font-semibold text-fg-default">
            {consultor.name}
          </span>
          <span className="flex items-center gap-gp-sm">
            <Chip color="neutral" variant="soft" size="sm" shape="pill">
              {consultor.level}
            </Chip>
            <Chip color={grad.color} variant="soft" size="sm" shape="pill">
              {grad.label}
            </Chip>
            {consultor.pro && (
              <Chip color="success" variant="soft" size="sm" shape="pill">
                PRO
              </Chip>
            )}
          </span>
        </div>
      }
      footer={
        <div className="flex items-center gap-gp-md">
          <Button
            variant="outline"
            color="secondary"
            size="md"
            iconLeft={<Pencil />}
            className="flex-1"
            onClick={() => onEdit?.(consultor)}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            color="critical"
            size="icon-md"
            aria-label="Remover da rede"
            onClick={() => onRemove?.(consultor)}
          >
            <UserMinus />
          </Button>
        </div>
      }
    >
      <FloatingPanelSection title="Desempenho próprio">
        <FloatingPanelField
          label="GP próprio"
          value={formatNum(consultor.gpProprio)}
        />
        <FloatingPanelField
          label="Clientes diretos"
          value={formatNum(consultor.clientes)}
        />
        <FloatingPanelField
          label="Descendentes diretos"
          value={formatNum(diretos)}
        />
      </FloatingPanelSection>

      <FloatingPanelSection title="Subárvore (agregado)">
        {consultor.subtree ? (
          <>
            <FloatingPanelField
              label="Consultores"
              value={formatNum(consultor.subtree.consultores)}
            />
            <FloatingPanelField
              label="GP da rede"
              value={formatNum(consultor.subtree.gp)}
            />
            <FloatingPanelField
              label="Clientes da rede"
              value={formatNum(consultor.subtree.clientes)}
            />
          </>
        ) : (
          <p className="px-pad-xl py-pad-md text-body-sm text-fg-muted">
            {subtreeLabel(consultor)}
          </p>
        )}
      </FloatingPanelSection>

      <FloatingPanelSection title="Contato">
        <FloatingPanelField label="Email" value={consultor.email} />
        <FloatingPanelField label="Localização" value={consultor.location} />
        <FloatingPanelField
          label="Consultor desde"
          value={formatLongDate(consultor.since)}
        />
      </FloatingPanelSection>
    </FloatingPanel>
  );
}
