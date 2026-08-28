import type { ReactNode } from "react";

export type BreadcrumbSwitcherOption = {
  /** Identidade do registro — é o que volta em `onValueChange`. */
  value: string;
  /** Texto da opção. É por ele que a busca filtra. */
  label: string;
  /** Ícone/avatar à esquerda: no seletor do GitHub é o cadeado do repo privado. */
  leading?: ReactNode;
  /** Linha secundária — código, dono, data. Não entra na busca; use `keywords` pra isso. */
  description?: ReactNode;
  /** Termos extras de busca (documento, apelido, id) que não aparecem no rótulo. */
  keywords?: string[];
  /** Agrupa opções sob um cabeçalho (ex.: "Recentes" · "Todos"). */
  group?: string;
};

export interface BreadcrumbSwitcherProps {
  /** Registro aberto agora — aparece no caminho e vem marcado na lista. */
  value: string;
  /** Escolher outra opção. Trocar de registro é navegação: o consumidor decide o que fazer. */
  onValueChange: (value: string) => void;

  /** As opções. A busca filtra por `label` + `keywords`. */
  options: BreadcrumbSwitcherOption[];

  /**
   * Texto do gatilho quando `value` não está em `options` — carregando, ou registro que saiu
   * da lista. Sem isso o caminho apareceria vazio, que lê como bug.
   */
  placeholder?: ReactNode;

  /** Cabeçalho do dropdown ("Trocar cliente"). Omita e o dropdown abre direto na busca. */
  title?: ReactNode;
  searchPlaceholder?: string;
  emptyMessage?: ReactNode;

  /** Rodapé fixo do dropdown — "Ver todos", "Criar novo". Fica fora da área que rola. */
  footer?: ReactNode;

  /** Abertura controlada, pro caso de abrir por atalho de teclado. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  /** Alinhamento do dropdown em relação ao gatilho. @default "start" */
  align?: "start" | "center" | "end";

  /**
   * Rótulo do gatilho pro leitor de tela. Default: `"Trocar registro aberto"` — troque pelo
   * nome do domínio ("Trocar cliente"), que é o que faz sentido pra quem ouve.
   */
  "aria-label"?: string;

  disabled?: boolean;
  className?: string;
  contentClassName?: string;
}
