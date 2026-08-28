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
