import type { MouseEvent, ReactNode, Ref } from "react";

/**
 * Props que o Kpi entrega ao renderizador de link — são exatamente as de um `<a>`.
 * Mesma convenção do AppShell/MenuSidebar (L-068): render-prop, nunca `linkComponent`,
 * porque um prop que recebe TIPO de componente escrito inline cria um tipo novo a cada
 * render e o React desmonta a subárvore.
 */
export type KpiLinkRenderProps = {
  href: string;
  className: string;
  onClick: (e: MouseEvent<HTMLAnchorElement>) => void;
  target?: string;
  "aria-label": string;
  children?: ReactNode;
  ref?: Ref<HTMLAnchorElement>;
};

export type KpiLinkRenderer = (props: KpiLinkRenderProps) => ReactNode;

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
  /**
   * Texto de ajuda do indicador — vira um "?" ao lado do rótulo, com tooltip.
   * Use pra explicar COMO a métrica é calculada; não repita o rótulo.
   */
  helperText?: ReactNode;
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

  /* ── Drill-down: o card inteiro vira alvo ──────────────────────────────────
   * Com `onClick` ou `href` o Kpi ganha um `<button>`/`<a>` esticado sobre toda a
   * superfície. A raiz continua `<article>`: o conteúdo de `<button>` é phrasing
   * content, e um `<h3>` dentro dele é HTML inválido (o leitor de tela perde o
   * heading). O overlay dá foco, Enter/Space e "abrir em nova aba" de graça.
   *
   * O nome acessível vem do `label` — não precisa `aria-label`.                  */

  /** Clique no card. Sem `href`, renderiza `<button type="button">`. */
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  /** Destino. Com `href` o alvo é `<a>` (ctrl+clique, nova aba, copiar link). */
  href?: string;
  /** `target` do anchor. `"_blank"` desliga o cancelamento da navegação. */
  target?: string;
  /** Substitui o `<a>` interno pelo link do seu router (L-068). */
  renderLink?: KpiLinkRenderer;

  className?: string;
}

export interface KpiGroupProps {
  /**
   * Nº de colunas quando o CONTAINER é largo (responsivo abaixo, por container query
   * — não por viewport). Default: 4. Teto de 4 por linha até o container passar de
   * 1024px, porque 8 colunas em 768px dão 96px por KPI.
   */
  columns?: 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /** Divisórias entre os KPIs (vira 1 card único). Default: false. */
  divided?: boolean;
  children?: ReactNode;
  className?: string;
}
