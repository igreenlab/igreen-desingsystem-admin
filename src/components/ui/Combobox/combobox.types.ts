import type { ComponentPropsWithoutRef, ReactNode } from "react";

/** Uma opção do Combobox. `value` é o que sai no `onValueChange`; `label` é o
 *  texto exibido E o termo principal de busca. `keywords` adiciona termos extras
 *  de match (ex.: sinônimos, o nome técnico da coluna). */
export type ComboboxOption = {
  value: string;
  label: string;
  keywords?: string[];
  /**
   * Linha secundária na opção (código, e-mail, unidade). NÃO entra na busca por si —
   * se quiser que o texto seja pesquisável, repita em `keywords`.
   */
  hint?: string;
  /**
   * Cabeçalho do grupo a que a opção pertence. Opções com o mesmo `group` são
   * renderizadas juntas, sob esse título.
   *
   * É chave na OPÇÃO, e não uma mudança na forma de `options`, de propósito: quem já
   * passa uma lista plana não muda nada, e agrupar vira acrescentar um campo. Opções
   * sem `group` aparecem primeiro, sem cabeçalho.
   */
  group?: string;
};

export interface ComboboxBaseProps
  extends Omit<
    ComponentPropsWithoutRef<"button">,
    "value" | "defaultValue" | "onChange"
  > {
  /** Opções selecionáveis (a busca filtra por `label` + `keywords`). */
  options: ComboboxOption[];
  /** Valor selecionado (controlado). */
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

/** Escolha única — o comportamento default, inalterado. */
export interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false;
  /** Valor selecionado (controlado). */
  value?: string;
  /** Disparado ao escolher uma opção — recebe o `value` da opção. */
  onValueChange?: (value: string) => void;
  /**
   * Fecha o dropdown ao escolher. Default `true`.
   *
   * `false` mantém aberto — útil quando a escolha alimenta uma prévia ao lado e o
   * usuário compara alternativas antes de sair.
   */
  closeOnSelect?: boolean;
}

/**
 * Multi-seleção com busca.
 *
 * Diferenças de comportamento em relação ao single, todas por causa do fluxo real
 * (escolher várias de uma lista longa):
 *
 * - o dropdown **não fecha** ao selecionar; fecha no clique fora ou no Esc;
 * - clicar numa opção já marcada **desmarca**;
 * - o trigger mostra chips das escolhidas, e resume em "+N" a partir de `maxChips`.
 *
 * ⚠️ Os chips do trigger NÃO têm × — o trigger é um `<button>`, e o × seria um botão
 * dentro de outro (HTML inválido, o navegador desaninha e o × passa a abrir o dropdown).
 * Pra remover com × fora do campo, renderize `<Chip onRemove>` ABAIXO do Combobox.
 */
export interface ComboboxMultipleProps extends ComboboxBaseProps {
  multiple: true;
  /** Valores selecionados (controlado). */
  value?: string[];
  /** Recebe a lista COMPLETA de selecionados a cada toggle. */
  onValueChange?: (values: string[]) => void;
  /** Quantos chips aparecem antes de resumir em "+N". Default 2. */
  maxChips?: number;
  /** Substitui o conteúdo do trigger quando há seleção. */
  renderSummary?: (selecionados: ComboboxOption[]) => ReactNode;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;
