import type { ReactNode } from "react";
import { Cloud, TreePine, Sun, Plug, Users, Gift } from "lucide-react";
import { Separator } from "@/components/shadcn/separator";
import { SectionCard } from "../../painel-v2/_ui";
import { fmtInt, fmtDec1 } from "./resumo-status";

export interface ResumoMesProps {
  impacto: {
    mwhValidados: number;
    co2Toneladas: number;
    arvores: number;
    placas: number;
  };
  operacao: {
    comEnergiaAtiva: { valor: number; percentual: number };
    licenciadosComCadastro: number;
    aniversariantes: number;
  };
}

/** Chip de impacto — superfície sutil + ícone success + valor + texto. */
function ImpactoChip({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-gp-xs rounded-radius-lg bg-bg-muted px-pad-md py-pad-sm">
      <span className="shrink-0 text-fg-success [&>svg]:size-icon-xs">{icon}</span>
      <span className="text-body-sm font-semibold tabular-nums text-fg-default">{value}</span>
      <span className="text-caption-sm text-fg-muted">{label}</span>
    </div>
  );
}

/** Card de operação — ícone + número + descrição (sufixo em success). */
function OperacaoItem({
  icon,
  value,
  suffix,
  label,
}: {
  icon: ReactNode;
  value: string;
  suffix?: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-gp-sm rounded-radius-lg border border-border-subtle bg-bg-muted px-pad-xl py-pad-lg">
      <span className="flex size-comp-sm shrink-0 items-center justify-center rounded-radius-full bg-bg-brand-subtle text-fg-brand [&>svg]:size-icon-xs">
        {icon}
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-[18px] font-bold leading-none tabular-nums text-fg-default">
          {value}
          {suffix && <span className="text-caption-md font-medium text-fg-success"> · {suffix}</span>}
        </span>
        <span className="mt-gp-2xs text-caption-sm text-fg-muted">{label}</span>
      </div>
    </div>
  );
}

export function ResumoMes({ impacto, operacao }: ResumoMesProps) {
  return (
    <SectionCard title="Resumo do mês" subtitle="Impacto ambiental e operação da rede">
      {/* Impacto ambiental */}
      <div className="flex flex-col gap-gp-md">
        <span className="text-caption-md font-medium text-fg-muted">Impacto ambiental</span>
        <div>
          <span className="text-[28px] font-bold leading-none tabular-nums text-fg-success">
            {fmtInt(impacto.mwhValidados)}
          </span>
          <span className="ml-gp-xs text-body-sm text-fg-muted">MWh validados</span>
        </div>
        <div className="flex flex-wrap gap-gp-sm">
          <ImpactoChip icon={<Cloud />} value={`${fmtDec1(impacto.co2Toneladas)} t`} label="CO₂ evitado" />
          <ImpactoChip icon={<TreePine />} value={fmtInt(impacto.arvores)} label="árvores equiv." />
          <ImpactoChip icon={<Sun />} value={fmtInt(impacto.placas)} label="placas solares" />
        </div>
      </div>

      <Separator orientation="horizontal" />

      {/* Operação da rede — embaixo, em linha (3 itens) */}
      <div className="flex flex-col gap-gp-md">
        <span className="text-caption-md font-medium text-fg-muted">Operação da rede</span>
        <div className="grid grid-cols-1 gap-gp-lg sm:grid-cols-3">
          <OperacaoItem
            icon={<Plug />}
            value={fmtInt(operacao.comEnergiaAtiva.valor)}
            suffix={`${operacao.comEnergiaAtiva.percentual}%`}
            label="com energia ativa"
          />
          <OperacaoItem
            icon={<Users />}
            value={fmtInt(operacao.licenciadosComCadastro)}
            label="licenciados com cadastro"
          />
          <OperacaoItem
            icon={<Gift />}
            value={fmtInt(operacao.aniversariantes)}
            label="aniversariantes hoje"
          />
        </div>
      </div>
    </SectionCard>
  );
}
