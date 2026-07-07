import { MessageCircle, Phone } from "lucide-react";
import {
  FloatingPanel,
  FloatingPanelSection,
  FloatingPanelField,
} from "@/components/ui/FloatingPanel";
import { Avatar } from "@/components/ui/avatar-ig";
import { Button } from "@/components/ui/Button";
import { clienteById, kwh, num, type MapaClienteRow } from "../mapa-clientes-mock";
import {
  StatusChip,
  ContratoChip,
  FinanceiroChip,
  initialsOf,
} from "../mapa-clientes-ui";

export function MapaClienteDetailPanel({
  clienteId,
  onClose,
}: {
  clienteId: string | null;
  onClose: () => void;
}) {
  const c: MapaClienteRow | undefined = clienteId
    ? clienteById[clienteId]
    : undefined;
  if (!c) return null;

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
      resizableStorageKey="mapa-clientes.detail-panel.width"
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
              <span className="tabular-nums">#{c.codigo}</span>
              <span className="opacity-50">·</span>
              <StatusChip status={c.status} />
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
        <FloatingPanelField label="UF" value={c.uf} />
        <FloatingPanelField label="Origem" value={c.origem} />
      </FloatingPanelSection>

      <FloatingPanelSection title="Energia">
        <FloatingPanelField label="Distribuidora" value={c.distribuidora} />
        <FloatingPanelField
          label="Consumo médio"
          value={<span className="tabular-nums">{kwh(c.consumoMedio)}</span>}
        />
        <FloatingPanelField
          label="Elegibilidade"
          value={c.elegibilidade ? "Elegível" : "Não elegível"}
        />
        <FloatingPanelField label="Cashback" value={c.cashback ? "Sim" : "Não"} />
      </FloatingPanelSection>

      <FloatingPanelSection title="Status">
        <FloatingPanelField label="Status" value={<StatusChip status={c.status} />} />
        <FloatingPanelField
          label="Contrato"
          value={<ContratoChip status={c.statusContrato} />}
        />
        <FloatingPanelField
          label="Financeiro"
          value={<FinanceiroChip status={c.statusFinanceiro} />}
        />
        <FloatingPanelField label="Andamento" value={c.andamento} />
      </FloatingPanelSection>

      <FloatingPanelSection title="Rede & datas">
        <FloatingPanelField label="Licenciado" value={c.nomeLicenciado} />
        <FloatingPanelField
          label="Nível da rede"
          value={<span className="tabular-nums">N{c.nivelRede}</span>}
        />
        <FloatingPanelField label="Cadastro" value={c.dataCadastro} />
        <FloatingPanelField label="Ativo desde" value={c.dataAtivo ?? "—"} />
      </FloatingPanelSection>
    </FloatingPanel>
  );
}
