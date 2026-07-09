import type { ReactNode } from "react";

/** Tom semântico do container de ícone do KPI. */
export type KpiTone =
  | "brand"
  | "success"
  | "warning"
  | "info"
  | "danger"
  | "neutral";

export interface KpiDeltaProps {
  /** Texto do delta (ex.: "+18%", "-12s"). */
  value: ReactNode;
  /** Tom da pílula. Default: "success" (ou derivado do sinal quando `signed`). */
  tone?: "success" | "danger" | "neutral";
  /** Mostra seta ↑/↓ antes do valor. */
  direction?: "up" | "down";
  /**
   * Deriva `tone` + `direction` do SINAL do `value` (string): começa com "-"
   * → danger/down, senão success/up. Opt-in; `tone`/`direction` explícitos
   * sempre vencem. Use quando o delta é literalmente positivo/negativo (ex.:
   * "+458", "-12"); NÃO use quando "subir" não é bom (ex.: tempo de espera).
   */
  signed?: boolean;
  className?: string;
}

export interface KpiProps {
  /** Título do KPI. */
  label: string;
  /** Valor de destaque. */
  value: ReactNode;
  /** Delta — passe um `<KpiDelta>` (ou qualquer nó). */
  delta?: ReactNode;
  /** Sublabel sob o valor (ex.: "vs ontem", "Last 7 days"). */
  hint?: ReactNode;
  /** Ícone (lucide etc.) — renderizado num container colorido por `tone`. */
  icon?: ReactNode;
  /** Tom do container do ícone. Default: "neutral". */
  tone?: KpiTone;
  /**
   * Tamanho do valor de destaque (preset `stat-*`). Default "md" (24px) —
   * idêntico ao comportamento anterior. Use "lg"/"xl" para KPIs hero.
   */
  size?: "sm" | "md" | "lg" | "xl";
  /** Nota no rodapé (com divisória acima). */
  footnote?: ReactNode;
  /** Slot livre (sparkline/chart) renderizado abaixo do valor. */
  children?: ReactNode;
  /**
   * Superfície do card. "card" = chrome próprio (borda+bg+shadow);
   * "plain" = sem chrome (pra usar dentro de `KpiGroup divided`).
   * Quando omitido, herda do `KpiGroup` (default "card").
   */
  surface?: "card" | "plain";
  className?: string;
}

export interface KpiGroupProps {
  /** Nº de colunas no desktop (responsivo abaixo). Default: 4. */
  columns?: 2 | 3 | 4 | 5 | 6;
  /** Divisórias entre os KPIs (vira 1 card único). Default: false. */
  divided?: boolean;
  children?: ReactNode;
  className?: string;
}
