import { useMemo } from "react";
import { Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionCard } from "../../painel-v2/_ui";
import {
  statusColor,
  ETAPAS,
  fmtInt,
  fmtDec1,
  pctOf,
  type StatusKey,
} from "./resumo-status";

export interface StatusFunil {
  validados: number;
  aguardandoValidacao: number;
  agAssinatura: number;
  devolutivas: number;
  reprovados: number;
  cancelados: number;
}

export interface ResumoGeralOperacaoProps {
  totalCadastros: number;
  mwhContratados: number;
  status: StatusFunil;
  licenciadosComCadastro: number;
  aguardandoInjecao: number;
}

const CARD = "rounded-radius-lg border border-border-subtle bg-bg-muted px-pad-xl py-pad-lg";

/** Card de taxa (24px, na cor do status). */
function Taxa({
  label,
  statusKey,
  pct,
  sub,
}: {
  label: string;
  statusKey: StatusKey;
  pct: number;
  sub: string;
}) {
  return (
    <div className={cn(CARD, "flex flex-col gap-gp-2xs")}>
      <span className="text-caption-md text-fg-muted">{label}</span>
      <span
        className={cn(
          statusColor({ status: statusKey }),
          "text-[24px] font-bold leading-none tabular-nums text-[var(--sc)]",
        )}
      >
        {fmtDec1(pct)}%
      </span>
      <span className="text-caption-sm text-fg-muted">{sub}</span>
    </div>
  );
}

export function ResumoGeralOperacao({
  totalCadastros,
  mwhContratados,
  status,
  licenciadosComCadastro,
  aguardandoInjecao,
}: ResumoGeralOperacaoProps) {
  const total = totalCadastros || 1;

  const segmentos = useMemo(
    () =>
      ETAPAS.map((e) => ({
        ...e,
        n: status[e.key],
        width: pctOf(status[e.key], total),
      })),
    [status, total],
  );

  const taxaValidacao = useMemo(() => pctOf(status.validados, total), [status, total]);
  const emAndamentoN = status.aguardandoValidacao + status.agAssinatura + status.devolutivas;
  const taxaAndamento = useMemo(() => pctOf(emAndamentoN, total), [emAndamentoN, total]);
  const perdaN = status.reprovados + status.cancelados;
  const taxaPerda = useMemo(() => pctOf(perdaN, total), [perdaN, total]);

  const funilAria = ETAPAS.map((e) => `${e.label} ${fmtInt(status[e.key])}`).join(", ");

  return (
    <SectionCard
      title="Resumo Geral da Operação"
      subtitle="Acumulado de todos os tempos"
    >
      {/* Herói */}
      <div className="flex flex-wrap items-end justify-between gap-gp-md">
        <span className="text-[34px] font-medium leading-none tabular-nums text-fg-default">
          {fmtInt(totalCadastros)}
        </span>
        <span className="text-body-sm text-fg-muted">
          cadastros · {fmtInt(mwhContratados)} MWh contratados
        </span>
      </div>

      {/* Barra de funil */}
      <div className="flex flex-col gap-gp-md">
        <div
          role="img"
          aria-label={`Composição dos cadastros: ${funilAria}`}
          className="flex h-[10px] w-full gap-[2px] overflow-hidden rounded-radius-md"
        >
          {segmentos.map((s) => (
            <div
              key={s.key}
              className={cn(statusColor({ status: s.key }), "h-full bg-[var(--sc)]")}
              style={{ width: `${s.width}%` }}
              title={`${s.label}: ${fmtInt(s.n)}`}
            />
          ))}
        </div>

        <ul className="flex flex-wrap gap-x-gp-xl gap-y-gp-xs">
          {segmentos.map((s) => (
            <li key={s.key} className="flex items-center gap-gp-xs">
              <span
                className={cn(
                  statusColor({ status: s.key }),
                  "size-[10px] shrink-0 rounded-radius-sm bg-[var(--sc)]",
                )}
                aria-hidden
              />
              <span className="text-caption-md text-fg-muted">{s.label}</span>
              <span className="text-caption-md font-semibold tabular-nums text-fg-default">
                {fmtInt(s.n)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Três taxas (em cards) */}
      <div className="grid grid-cols-1 gap-gp-lg sm:grid-cols-3">
        <Taxa
          label="Taxa de validação"
          statusKey="validados"
          pct={taxaValidacao}
          sub={`${fmtInt(status.validados)} cadastros`}
        />
        <Taxa
          label="Em andamento"
          statusKey="aguardandoValidacao"
          pct={taxaAndamento}
          sub={`${fmtInt(emAndamentoN)} · aguardando, assinatura, devolutivas`}
        />
        <Taxa
          label="Taxa de perda"
          statusKey="reprovados"
          pct={taxaPerda}
          sub={`${fmtInt(perdaN)} · reprovados + cancelados`}
        />
      </div>

      {/* Rodapé — texto com ícone, abaixo */}
      <div className="flex flex-wrap items-center gap-x-gp-xl gap-y-gp-xs border-t border-border-subtle pt-pad-xl text-body-sm">
        <span className="flex items-center gap-gp-xs text-fg-muted">
          <Users className="size-icon-xs" />
          Licenciados com cadastro{" "}
          <span className="font-semibold text-fg-default">{fmtInt(licenciadosComCadastro)}</span>
        </span>
        <span className="flex items-center gap-gp-xs text-fg-warning">
          <Zap className="size-icon-xs" />
          Aguardando injeção <span className="font-semibold">{fmtInt(aguardandoInjecao)}</span>
        </span>
      </div>
    </SectionCard>
  );
}
