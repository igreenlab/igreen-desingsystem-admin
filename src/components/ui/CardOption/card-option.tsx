"use client";

import { createContext, forwardRef, useContext, useId } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/shadcn/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/shadcn/radio-group";
import { Switch } from "@/components/shadcn/switch";
import { cardOption, cardOptionGroup } from "./card-option.styles";
import type {
  CardOptionGroupProps,
  CardOptionLayout,
  CardOptionOrientation,
  CardOptionProps,
  CardOptionSize,
  CardOptionType,
} from "./card-option.types";

/**
 * Os defaults que dependem do `type` — a assimetria da família, num lugar só.
 *
 * Um default único erraria metade dos casos: switch mora à direita (linha de configuração) e
 * não ganha destaque de selecionado, porque switch é ESTADO e não seleção — lista de settings
 * toda pintada de verde é ruído. Foi por isso que o exemplo antigo do switch não tinha estado
 * visual nenhum, e é o que este mapa preserva.
 */
const PADRAO_POR_TIPO: Record<
  CardOptionType,
  { orientation: CardOptionOrientation; highlightSelected: boolean }
> = {
  checkbox: { orientation: "left", highlightSelected: true },
  radio: { orientation: "left", highlightSelected: true },
  switch: { orientation: "right", highlightSelected: false },
};

type Ctx = {
  type?: CardOptionType;
  size?: CardOptionSize;
  orientation?: CardOptionOrientation;
  layout?: CardOptionLayout;
  disabled?: boolean;
};

const CardOptionCtx = createContext<Ctx | null>(null);

/**
 * `CardOptionGroup` — o container.
 *
 * Existe por dois motivos que se somam:
 *
 *   1. **`type="radio"` PRECISA de um pai.** É o `RadioGroup` do Radix que dá navegação por
 *      seta e agrupamento por `name`. Checkbox e switch são autônomos — nesses casos o grupo
 *      é só um `<div>`.
 *   2. **O modo lista mora aqui.** Em `layout="list"` a borda e o arredondamento são do
 *      GRUPO e a separação é `divide-y`; o item perde os seus (`inList`). Se cada item
 *      mantivesse a borda, a lista sairia com borda dupla entre linhas.
 */
export const CardOptionGroup = forwardRef<HTMLDivElement, CardOptionGroupProps>(
  function CardOptionGroup(
    {
      type = "checkbox",
      size = "md",
      orientation,
      layout = "spaced",
      value,
      defaultValue,
      onValueChange,
      name,
      disabled,
      children,
      className,
      ...rest
    },
    ref,
  ) {
    const classes = cardOptionGroup({ layout, size, disabled: disabled ? true : undefined });
    const ctx: Ctx = { type, size, orientation, layout, disabled };

    if (type === "radio") {
      return (
        <CardOptionCtx.Provider value={ctx}>
          <RadioGroup
            ref={ref}
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            name={name}
            disabled={disabled}
            /* O RadioGroup do DS traz `grid gap-gp-xl` no base; aqui o espaçamento é do
               layout (gap no spaced, divide-y no list), então ele é sobrescrito. */
            className={cn(classes, "grid-none", className)}
            {...rest}
          >
            {children}
          </RadioGroup>
        </CardOptionCtx.Provider>
      );
    }

    return (
      <CardOptionCtx.Provider value={ctx}>
        <div ref={ref} className={cn(classes, className)} {...rest}>
          {children}
        </div>
      </CardOptionCtx.Provider>
    );
  },
);

/**
 * `CardOption` — o item.
 *
 * ⚠️ **É um `<label htmlFor>` nativo, nunca `<button onClick>` (L-025).** Com `button`, o
 * leitor de tela anuncia "button" em vez de checkbox/radio, o submit nativo perde
 * `name`/`value`, e o `stopPropagation` do controle interno faz o clique no card não chegar
 * nele. O label nativo propaga o clique pro controle real e preserva a semântica — foi a
 * lição que o `CardCheckbox` já carregava e que esta implementação mantém.
 */
export const CardOption = forwardRef<HTMLButtonElement, CardOptionProps>(
  function CardOption(
    {
      type: typeProp,
      value,
      size: sizeProp,
      orientation: orientationProp,
      highlightSelected: highlightProp,
      label,
      description,
      icon,
      checked,
      defaultChecked,
      onCheckedChange,
      disabled: disabledProp,
      id: idProp,
      className,
      ...rest
    },
    ref,
  ) {
    const ctx = useContext(CardOptionCtx);
    const autoId = useId();
    const id = idProp ?? autoId;

    const type = typeProp ?? ctx?.type ?? "checkbox";
    const size = sizeProp ?? ctx?.size ?? "md";
    const disabled = disabledProp ?? ctx?.disabled;
    const padroes = PADRAO_POR_TIPO[type];
    const orientation = orientationProp ?? ctx?.orientation ?? padroes.orientation;
    const highlight = highlightProp ?? padroes.highlightSelected;

    const styles = cardOption({
      size,
      orientation,
      highlight,
      inList: ctx?.layout === "list" ? true : undefined,
      disabled: disabled ? true : undefined,
    });

    const controle =
      type === "radio" ? (
        <RadioGroupItem
          ref={ref}
          id={id}
          value={value ?? ""}
          disabled={disabled}
          className={styles.control()}
          {...rest}
        />
      ) : type === "switch" ? (
        <Switch
          ref={ref}
          id={id}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={styles.control()}
          {...rest}
        />
      ) : (
        <Checkbox
          ref={ref}
          id={id}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className={styles.control()}
          {...rest}
        />
      );

    return (
      <label htmlFor={id} className={cn(styles.root(), className)}>
        {controle}
        {icon && (
          <span className={styles.iconWrap()} aria-hidden="true">
            {icon}
          </span>
        )}
        <div className={styles.body()}>
          <span className={styles.label()}>{label}</span>
          {description && (
            <span className={styles.description()}>{description}</span>
          )}
        </div>
      </label>
    );
  },
);
