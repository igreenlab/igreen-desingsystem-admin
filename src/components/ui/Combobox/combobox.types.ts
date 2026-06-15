import type { ComponentPropsWithoutRef, ReactNode } from "react";

/** Uma opção do Combobox. `value` é o que sai no `onValueChange`; `label` é o
 *  texto exibido E o termo principal de busca. `keywords` adiciona termos extras
 *  de match (ex.: sinônimos, o nome técnico da coluna). */
export type ComboboxOption = {
  value: string;
  label: string;
  keywords?: string[];
};

export interface ComboboxProps
  extends Omit<
    ComponentPropsWithoutRef<"button">,
    "value" | "defaultValue" | "onChange"
  > {
  /** Opções selecionáveis (a busca filtra por `label` + `keywords`). */
  options: ComboboxOption[];
  /** Valor selecionado (controlado). */
  value?: string;
  /** Disparado ao escolher uma opção — recebe o `value` da opção. */
  onValueChange?: (value: string) => void;
  /** Texto do trigger quando nada está selecionado. */
  placeholder?: ReactNode;
  /** Placeholder do input de busca dentro do dropdown. */
  searchPlaceholder?: string;
  /** Conteúdo exibido quando a busca não retorna nada. */
  emptyMessage?: ReactNode;
  /** Abertura controlada do dropdown. */
  open?: boolean;
  /** Abertura inicial (não-controlada) — abre o dropdown ao montar. */
  defaultOpen?: boolean;
  /** Notifica mudança de abertura (controlado ou não). */
  onOpenChange?: (open: boolean) => void;
  /** Alinhamento do dropdown em relação ao trigger. Default `"start"`. */
  align?: "start" | "center" | "end";
  /** className aplicada ao trigger (recebe os mesmos overrides de um Select). */
  className?: string;
  /** className aplicada ao dropdown (PopoverContent). */
  contentClassName?: string;
}
