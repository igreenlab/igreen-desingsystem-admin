import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Props do `<FilterChip>` — o chip de filtro aplicado compartilhado por
 * `TableToolbar`/`DataTable`, `DataList`, `Gantt` e `Scheduler`.
 *
 * O chip é **dumb**: ele desenha `[⊗] [nome] [operador] [valor…]` e avisa o
 * clique no `⊗`. Quem decide o texto do operador, como formatar o valor, se
 * colapsa numa contagem e o que acontece ao clicar no chip é de quem o usa —
 * essas regras diferem legitimamente entre tabela, cronograma e calendário.
 *
 * O que NÃO difere, e por isso mora aqui: a anatomia (ordem das peças, `⊗` à
 * esquerda) e os tokens.
 */
export type FilterChipProps = Omit<
  ComponentPropsWithoutRef<"span">,
  "children"
> & {
  /** Nome do campo filtrado — "Status", "Frente", "Responsável". */
  name: ReactNode;
  /**
   * Operador exibido entre o nome e o valor — "é", "contém", "entre".
   *
   * `null`/ausente não renderiza nada. Use isso no chip VAZIO (placeholder sem
   * valor) e quando o próprio valor já é auto-descritivo (uma faixa
   * `100 – 500` lida depois de "entre" diria a faixa duas vezes).
   */
  op?: ReactNode;
  /** Classe extra só no operador — ex.: destacar exclusão (`isNoneOf`) em danger. */
  opClassName?: string;
  /**
   * Os valores, um por pílula. Lista vazia = chip VAZIO (só o nome).
   *
   * Colapsar em `["3 selecionados"]` é decisão de quem chama: o `Gantt` faz
   * isso acima de 3 porque o eixo horizontal dele disputa a mesma largura.
   */
  values?: readonly ReactNode[];
  /**
   * Destaque de marca (borda sólida + `bg-brand-subtle` + valor em `fg-brand`).
   *
   * **Opt-in, e o default é o tracejado neutro.** Ligue só quando a mesma
   * fileira tiver chip VAZIO: é contra ele que o destaque contrasta. Numa
   * fileira onde todo chip já está aplicado ele não distingue nada — só repinta.
   */
  active?: boolean;
  /** Chip clicável (cursor, hover e anel de foco). O clique é de quem chama. */
  interactive?: boolean;
  /**
   * `false` troca o `⊗` por um `⊕` **decorativo**: o chip não se remove, o
   * clique nele é que faz algo (preencher o valor). O ícone fica pra manter o
   * alinhamento — sem ele a palavra encostaria mais à esquerda que a dos vizinhos.
   */
  removable?: boolean;
  /** Clique no `⊗`. Já vem com `stopPropagation` — não dispara o clique do chip. */
  onRemove?: () => void;
  /** `aria-label` do `⊗`. Default "Remover filtro". */
  removeLabel?: string;
};
