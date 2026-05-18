import type { ReactNode } from "react";

/**
 * Coluna do Kanban — um "estágio" do workflow.
 * Visualmente: header com dot colorido + label + badge de contagem + ações.
 */
export type KanbanColumn = {
  /** Identificador único da coluna (usado pra agrupar cards). */
  id: string;
  /** Label visível no header. */
  label: string;
  /**
   * Cor do dot do header. Aceita qualquer string CSS válida — ideal usar
   * uma var de token DS: `var(--color-fg-success)`, `var(--color-fg-warning)`,
   * `var(--color-fg-info)`, `var(--color-fg-muted)`, ou hex literal pra cores
   * não-tokenizadas.
   */
  dotColor?: string;
  /**
   * Override do count exibido no badge. Quando ausente, o Kanban calcula
   * automaticamente via `cards.filter(c => c.columnId === col.id).length`.
   */
  count?: number;

  /**
   * Define se esta coluna aceita drop de cards arrastados.
   * Default: `true`. Use `false` pra colunas "terminais" (ex: Cancelado,
   * Concluído) que bloqueiam reentrada. Durante drag, colunas inválidas
   * mostram cursor `not-allowed` e não destacam como drop target.
   */
  canReceiveDrop?: boolean;
  /**
   * Define se cards desta coluna podem ser arrastados.
   * Default: `true`. Use `false` pra colunas locked (cards definitivos).
   */
  canDragFrom?: boolean;
};

/**
 * Card do Kanban — uma entidade (cliente, tarefa, lead, etc).
 *
 * Composto por slots de conteúdo livres (`avatar`, `chip`, `footerLeft`,
 * `footerRight` são ReactNode) — o consumer monta usando componentes do DS
 * (`<Avatar>`, `<Chip>`, etc) sem o Kanban ditar visual interno.
 *
 * Pra customizar **completamente** o miolo do card (sair do layout default),
 * usar a prop `renderCard` no `<Kanban>`.
 */
export type KanbanCardData = {
  /** Identificador único do card (usado em selectedIds e openCardId). */
  id: string;
  /** Coluna a que o card pertence (deve bater com algum KanbanColumn.id). */
  columnId: string;

  /** Título principal (ex: nome do cliente, título da tarefa). */
  title: ReactNode;
  /** Subtítulo logo abaixo do título (ex: "CLI-2401", "#TASK-23"). */
  subtitle?: ReactNode;
  /**
   * Descrição curta — exibida entre o head e a meta, com line-clamp 2.
   * Quando ausente, a área não renderiza (sem espaço vazio).
   */
  description?: ReactNode;

  /** Avatar/ícone à esquerda do head (ex: `<Avatar>MS</Avatar>`, `<Eye />`). */
  avatar?: ReactNode;

  /** Chip/badge na linha de meta (ex: `<Chip color="warning">Royal</Chip>`). */
  chip?: ReactNode;
  /** Valor à direita da meta (ex: "R$ 4.800,00", "5 dias"). */
  value?: ReactNode;

  /** Conteúdo à esquerda do footer (ex: avatar do agent + nome). */
  footerLeft?: ReactNode;
  /** Conteúdo à direita do footer (ex: data, prazo). */
  footerRight?: ReactNode;
};

/**
 * Item de menu padronizado (card ou coluna). Quando `getCardMenuItems` /
 * `getColumnMenuItems` retorna array desses, o primitive renderiza um
 * `<DropdownMenu>` automático — consumer não monta o menu manualmente.
 */
export type KanbanMenuItem = {
  /** Texto do item. Ignorado quando `separator: true`. */
  label?: string;
  /** Ícone à esquerda (lucide ou qualquer ReactNode). */
  icon?: ReactNode;
  /** Handler ao clicar. */
  onClick?: () => void;
  /** Tom destrutivo (vermelho). Default: `false`. */
  destructive?: boolean;
  /** Desabilita o item (sem hover/click). */
  disabled?: boolean;
  /** Se `true`, renderiza `<DropdownMenuSeparator>` e ignora os outros campos. */
  separator?: boolean;
};

/** Parâmetros passados pro callback `renderCard`. */
export type KanbanRenderCardParams = {
  card: KanbanCardData;
  selected: boolean;
  open: boolean;
};

/**
 * Props do componente raiz `<Kanban>`.
 *
 * Dumb: todo o estado de seleção/abertura/menus é controlado externamente.
 * O componente só renderiza o que recebe — sem state interno de domínio.
 */
export type KanbanProps = {
  /** Definição das colunas (ordem visual = ordem do array). */
  columns: KanbanColumn[];
  /** Cards a serem distribuídos pelas colunas via `columnId`. */
  cards: KanbanCardData[];

  /* ── Seleção (opcional) ────────────────────────────────────── */
  /** IDs selecionados (Set). Quando presente, checkbox aparece nos cards. */
  selectedIds?: Set<string>;
  /** Callback quando o usuário marca/desmarca o checkbox de um card. */
  onToggleSelect?: (cardId: string) => void;

  /* ── Card aberto / detail panel (opcional) ─────────────────── */
  /** ID do card "aberto" no detail panel — pinta com brand-subtle. */
  openCardId?: string;
  /** Callback ao clicar no card (fora do checkbox/menu). */
  onOpenCard?: (cardId: string) => void;

  /* ── Ações de coluna (opcionais) ───────────────────────────── */
  /** Callback do botão "+" do header da coluna (criar card naquela coluna). */
  onAddCard?: (columnId: string) => void;
  /**
   * Callback do botão "⋯" do header da coluna (menu manual).
   * Ignorado se `getColumnMenuItems` estiver fornecido.
   */
  onColumnMenu?: (columnId: string, anchor: HTMLElement) => void;
  /**
   * Items do menu "⋯" da coluna (modo padronizado). Quando fornecido,
   * primitive monta `<DropdownMenu>` automático e ignora `onColumnMenu`.
   */
  getColumnMenuItems?: (column: KanbanColumn) => KanbanMenuItem[];
  /** Callback do botão "+ Adicionar" no rodapé da coluna. */
  onAddInFooter?: (columnId: string) => void;
  /** Esconde o botão "+ Adicionar" no rodapé da coluna. Default: false. */
  hideFooterAdd?: boolean;

  /* ── Ações de card (opcionais) ─────────────────────────────── */
  /**
   * Callback do botão "⋯" do card (menu manual).
   * Ignorado se `getCardMenuItems` estiver fornecido.
   */
  onCardMenu?: (cardId: string, anchor: HTMLElement) => void;
  /**
   * Items do menu "⋯" do card (modo padronizado). Quando fornecido,
   * primitive monta `<DropdownMenu>` automático e ignora `onCardMenu`.
   */
  getCardMenuItems?: (card: KanbanCardData) => KanbanMenuItem[];

  /* ── Render custom do card (opcional) ──────────────────────── */
  /**
   * Render custom do **conteúdo interno** do card. Quando ausente, usa
   * layout default (avatar/title/subtitle/description/chip/value/footerLeft/
   * footerRight) dos slots de `KanbanCardData`.
   *
   * O wrapper externo do card (border, shadow, focus ring, checkbox/menu
   * positioning, accessibility) é **sempre** controlado pelo primitive —
   * consumer só substitui o miolo. Garante consistência entre boards.
   */
  renderCard?: (params: KanbanRenderCardParams) => ReactNode;

  /* ── Drag-and-Drop entre colunas (opcional) ────────────────── */
  /** Habilita DnD entre colunas. Default: `false`. */
  enableDnD?: boolean;
  /**
   * Callback ao soltar card em coluna diferente. `from` = columnId origem;
   * `to` = columnId destino; `cardId` = card movido. Consumer decide commit
   * (otimista ou async) atualizando `cards` props. Primitive **não faz revert**
   * automático — se a operação falhar, consumer mantém `cards` inalterado e
   * o card volta visualmente.
   */
  onCardMove?: (cardId: string, from: string, to: string) => void | Promise<unknown>;

  /* ── Textos customizáveis ──────────────────────────────────── */
  /** Texto do empty state quando a coluna não tem cards. */
  emptyLabel?: string;
  /** Texto do botão "+ Adicionar" no rodapé da coluna. */
  addLabel?: string;

  /** ClassName extra no root. */
  className?: string;
};
