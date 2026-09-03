import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from "react";
import type { BreadcrumbSwitcherOption } from "./breadcrumb-switcher.types";

export type BreadcrumbItemData = {
  label: string;
  /** Vira link. O ÚLTIMO item nunca é link — ele é a página atual. */
  href?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;

  /**
   * Torna este item um seletor: o rótulo vira gatilho e abre uma lista com busca pra trocar o
   * registro aberto. Precisa dos três juntos — `switcher`, `value` e `onValueChange`;
   * faltando um, o item renderiza como texto (gatilho que abre lista vazia, ou que não sabe
   * avisar a escolha, é pior que texto).
   */
  switcher?: BreadcrumbSwitcherOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  switcherTitle?: ReactNode;
  switcherSearchPlaceholder?: string;
  switcherEmptyMessage?: ReactNode;
  switcherFooter?: ReactNode;
  /** Rótulo acessível do gatilho. Default: `"Trocar: <label>"`. */
  switcherAriaLabel?: string;

  /**
   * Conteúdo livre DEPOIS do rótulo deste item, dentro do mesmo `<li>`.
   *
   * O caso que pediu isto foi um chip de status ao lado do nome do registro
   * aberto (`Clientes / Maria Silva [Ativo]`), mas o slot não sabe disso: aceita
   * qualquer nó e qualquer montagem.
   *
   * ⚠️ **Fica FORA do gatilho do seletor, como irmão.** Não dentro do `<button>`
   * — `<button>` aninhado em `<button>` é HTML inválido e quebra clique e foco,
   * então um chip clicável, link ou botão aqui só funciona porque o slot é
   * externo. Consequência de desenho, não acidente: clicar no que está aqui
   * **não** abre a lista, e é o certo — status não é a affordance de "trocar
   * registro".
   *
   * Vale pra QUALQUER item, seletor ou não: badge ao lado de item de página é
   * igualmente legítimo e custa o mesmo.
   */
  trailing?: ReactNode;
};

export interface BreadcrumbProps extends ComponentPropsWithoutRef<"nav"> {
  /**
   * Monta a cadeia a partir de dados. **Sem isso**, o componente renderiza `children` no
   * primitivo — é o modo de composição, pra quem precisa interpor ou estilizar item a item.
   */
  items?: BreadcrumbItemData[];

  /**
   * `sm` (13px na cadeia, 16px quando há um item só) é o tamanho do `Header`. `md` (14px) é o
   * do primitivo shadcn. Os dois existem porque o DS já tinha os dois antes desta unificação —
   * ver o cabeçalho de `breadcrumb.styles.ts`.
   * @default "md"
   */
  size?: "sm" | "md";

  /** Separador custom. Default: `ChevronRight` de 14px. */
  separator?: ReactNode;
}
