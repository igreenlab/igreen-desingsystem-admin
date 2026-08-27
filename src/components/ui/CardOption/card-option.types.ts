import type { ReactNode } from "react";
import type { CardOptionVariants } from "./card-option.styles";

/** Qual controle o card embrulha. Ponto de extensão pra tipos futuros. */
export type CardOptionType = "checkbox" | "radio" | "switch";

export type CardOptionSize = NonNullable<CardOptionVariants["size"]>;

/** Lado em que o controle fica. Omitido → derivado do `type`. */
export type CardOptionOrientation = NonNullable<CardOptionVariants["orientation"]>;

/** `spaced` = cards separados · `list` = uma lista com divisórias, sem gap. */
export type CardOptionLayout = "spaced" | "list";

export interface CardOptionProps {
  /**
   * Controle embrulhado pelo card. Default: herda do grupo, ou `"checkbox"`.
   *
   * ⚠️ `"radio"` exige um `CardOptionGroup` em volta — é ele que vira o `RadioGroup` do
   * Radix e dá navegação por seta + agrupamento por `name`. Checkbox e switch funcionam
   * soltos.
   */
  type?: CardOptionType;
  /** Obrigatório quando `type="radio"` — é o valor que o grupo seleciona. */
  value?: string;
  size?: CardOptionSize;
  /**
   * Lado do controle. **Omita**: o default deriva do `type` — `left` pra checkbox/radio,
   * `right` pro switch (convenção de linha de configuração).
   */
  orientation?: CardOptionOrientation;
  /**
   * Pinta o card quando selecionado — fundo (`bg-success-muted`) + borda (`border-brand`).
   *
   * **Omita**: o default deriva do contexto.
   * - card solto → do `type`: ligado em checkbox/radio, desligado no switch (switch é estado,
   *   não seleção — lista de settings toda verde é ruído);
   * - dentro de `layout="list"` → **desligado**, inclusive pra checkbox e radio: em lista a
   *   única borda do item é a de baixo, a **divisória**, então a cor não contorna o
   *   selecionado, pinta a linha que o separa do vizinho.
   *
   * Ligue explicitamente (aqui ou no grupo) se quiser a linha pintada em lista.
   */
  highlightSelected?: boolean;
  label: ReactNode;
  description?: ReactNode;
  /** Ícone entre o controle e o texto. */
  icon?: ReactNode;
  /** Controlado. No `radio`, quem manda é o `value` do grupo. */
  checked?: boolean;
  /** Não-controlado. Funciona com o destaque, porque ele vem do data-state e não de prop. */
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** id do controle — gerado se omitido (o `<label htmlFor>` precisa dele). */
  id?: string;
  className?: string;
}

export interface CardOptionGroupProps {
  /** Aplicado a todos os filhos. `radio` faz o grupo virar `RadioGroup` do Radix. */
  type?: CardOptionType;
  size?: CardOptionSize;
  orientation?: CardOptionOrientation;
  layout?: CardOptionLayout;
  /**
   * Liga/desliga o destaque de selecionado (fundo + cor de borda) em todos os filhos de uma
   * vez. Omitido → cada item usa o default do contexto (ver `CardOptionProps`); em
   * `layout="list"` esse default é **desligado**, e é aqui que se liga.
   */
  highlightSelected?: boolean;
  /** Só `type="radio"`: valor selecionado (controlado). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Só `type="radio"`: nome do campo no submit nativo. */
  name?: string;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}
