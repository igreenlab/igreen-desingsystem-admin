import type { ReactNode } from "react";

/** Superfície do CONTEÚDO abaixo da tira — a aba ativa precisa ser a mesma cor pra unir. */
export type NavTabsSurface = "surface" | "canvas";

/** `comfortable` = título + subtítulo (48px) · `compact` = só título (40px). */
export type NavTabsDensity = "comfortable" | "compact";

/** Tom do ponto de status. Passe um `ReactNode` em `status` pra desenhar o seu. */
export type NavTabStatus = "success" | "warning" | "danger" | "info" | "neutral";

export interface NavTabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** `value` da aba ativa. O componente é SEMPRE controlado — ver `NavTabsProps.onValueChange`. */
  value: string;

  /**
   * Chamado quando o usuário escolhe outra aba (clique, teclado ou lista de overflow).
   *
   * O componente **não hospeda o conteúdo**: ele diz qual aba está ativa e o consumidor
   * decide o que trocar. É o que permite o painel morar fora — outra coluna, outra rota,
   * outro componente. Pra fechar a acessibilidade nesse caso, passe `panelId` na aba.
   */
  onValueChange: (value: string) => void;

  /**
   * Superfície do conteúdo logo abaixo da tira. A aba ativa é pintada com ela — é o que a
   * une ao conteúdo. Num card `surface`; se o conteúdo for a própria página, `canvas`.
   * @default "surface"
   */
  surface?: NavTabsSurface;

  /**
   * `compact` remove o subtítulo e baixa a aba pra 40px. É escolha de CONTEÚDO, não de
   * densidade: sem subtítulo, duas conversas do mesmo cliente ficam idênticas.
   * @default "comfortable"
   */
  density?: NavTabsDensity;

  /**
   * `true` = a aba ocupa a faixa inteira (lê como segmento, não como aba de navegador) e a
   * tira perde a régua — a união passa a ser por continuidade de cor.
   * @default false
   */
  fill?: boolean;

  /**
   * `persistent` mantém as ações da aba sempre visíveis. Use quando a ação exige decisão
   * (aceitar/recusar um chamado): revelar no hover esconde justamente o que precisa ser visto.
   * @default "hover"
   */
  actionsMode?: "hover" | "persistent";

  /**
   * Pinta o fundo recuado da tira (`bg-subtle` no claro, `bg-canvas` no escuro — cada modo tem
   * o seu token de recuo). Desligue quando o container já pinta o fundo.
   * @default true
   */
  chrome?: boolean;

  /** Com isto, o `+` aparece — fora do trilho, pra não sair de alcance quando as abas rolam. */
  onNewTab?: () => void;

  /** Rótulo do conjunto pro leitor de tela, ex.: `"Conversas abertas"`. */
  "aria-label"?: string;

  /** `<NavTabs.Tab>`s e, opcionalmente, um `<NavTabs.Actions>`. */
  children?: ReactNode;
}

export interface NavTabProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Identidade da aba — é o que volta em `onValueChange`. */
  value: string;

  /** Qualquer nó à esquerda: `Avatar`, `Icon`, imagem, sigla. */
  leading?: ReactNode;

  /** Ponto de status pronto, ou o seu próprio nó. */
  status?: NavTabStatus | ReactNode;

  /** Contador (número) ou qualquer nó. Some quando a aba está ativa — o usuário já está lendo. */
  badge?: number | ReactNode;

  /**
   * SUBSTITUI as ações padrão. Passe quantas quiser (`<NavTabs.Action>` ou qualquer botão) —
   * é aqui que entram ✓/✗ de aceitar/recusar, "fixar", "duplicar".
   */
  actions?: ReactNode;

  /** Sem `actions`, declarar `onClose` liga as ações padrão (`⋯` de opções + `×` de fechar). */
  onClose?: () => void;

  /** Itens extras do menu `⋯` das ações padrão. Ignorado quando `actions` é passado. */
  menu?: ReactNode;

  /**
   * `id` do elemento que esta aba controla, quando o conteúdo mora FORA do componente.
   * Emite `aria-controls`. Dentro, prefira `<NavTabs.Panel value="…">`.
   */
  panelId?: string;

  /** Mantém as ações visíveis só nesta aba (o `pendente` do caso de chamados). */
  actionsAlwaysVisible?: boolean;

  /** `<NavTabs.Title>` + `<NavTabs.Subtitle>`, ou a composição que você quiser. */
  children?: ReactNode;
}

export interface NavTabsPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Casa com o `value` da aba. Renderiza apenas quando ela está ativa. */
  value: string;
  children?: ReactNode;
}
