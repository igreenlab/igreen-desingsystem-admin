import { tv } from "@/utils/tv";

/**
 * Cor por status do funil de cadastros — fonte única (tailwind-variants).
 * Cada variante seta a custom prop `--sc` com o token OKLCH do DS; os
 * consumidores aplicam `bg-[var(--sc)]` (preenchimento/dot) ou
 * `text-[var(--sc)]` (número da taxa). Sem hex hardcoded.
 *
 * Mapa: validado→success · pendente→warning · ag.assinatura→teal(chart-2) ·
 * devolutivas→info/blue · reprovados→danger · cancelados→danger escuro.
 */
export const statusColor = tv({
  variants: {
    status: {
      validados: "[--sc:var(--color-fg-success)]",
      aguardandoValidacao: "[--sc:var(--color-fg-warning)]",
      agAssinatura: "[--sc:var(--color-chart-2)]",
      devolutivas: "[--sc:var(--color-fg-info)]",
      reprovados: "[--sc:var(--color-fg-danger)]",
      cancelados: "[--sc:color-mix(in_oklch,var(--color-fg-danger)_70%,black)]",
    },
  },
});

export type StatusKey =
  | "validados"
  | "aguardandoValidacao"
  | "agAssinatura"
  | "devolutivas"
  | "reprovados"
  | "cancelados";

/** Ordem + rótulos do funil (mesma ordem visual da barra e da legenda). */
export const ETAPAS: { key: StatusKey; label: string }[] = [
  { key: "validados", label: "Validados" },
  { key: "aguardandoValidacao", label: "Aguardando validação" },
  { key: "agAssinatura", label: "Ag. assinatura" },
  { key: "devolutivas", label: "Devolutivas" },
  { key: "reprovados", label: "Reprovados" },
  { key: "cancelados", label: "Cancelados" },
];

/* ── Formatação pt-BR ─────────────────────────────────────────────────────── */
const NF = new Intl.NumberFormat("pt-BR");

/** Inteiro com separador de milhar (7.240). Arredonda antes. */
export const fmtInt = (n: number) => NF.format(Math.round(n));

/** 1 casa decimal com vírgula (68,8 · 23,5). */
export const fmtDec1 = (n: number) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Percentual derivado (part/total) — nunca float cru; sempre 1 casa. */
export const pctOf = (part: number, total: number) =>
  total > 0 ? (part / total) * 100 : 0;
