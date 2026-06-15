import { forwardRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn/command";
import { comboboxStyles } from "./combobox.styles";
import type { ComboboxProps } from "./combobox.types";

/**
 * Combobox — select de escolha única com BUSCA (autocomplete) e lista ROLÁVEL.
 *
 * Compõe `Popover` + `Command` (cmdk): o trigger imita o `SelectTrigger` (parear
 * com Selects irmãos) e o dropdown traz `CommandInput` no topo + `CommandList`
 * com `max-h`/scroll. Use no lugar de um `Select` quando a lista é longa e o
 * usuário precisa digitar pra achar a opção (ex.: escolher uma coluna entre 30).
 *
 * Selação robusta: o `onSelect` do cmdk passa um valor normalizado, então o
 * componente NÃO depende dele — fecha via closure sobre `option.value`. A busca
 * casa por `label` + `keywords` (que inclui o `value` da opção).
 */
export const Combobox = forwardRef<HTMLButtonElement, ComboboxProps>(
  function Combobox(
    {
      options,
      value,
      onValueChange,
      placeholder = "Selecione…",
      searchPlaceholder = "Buscar…",
      emptyMessage = "Nenhum resultado.",
      open: openProp,
      defaultOpen,
      onOpenChange,
      align = "start",
      className,
      contentClassName,
      disabled,
      "aria-label": ariaLabel,
      ...rest
    },
    ref,
  ) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(
      defaultOpen ?? false,
    );
    const isControlled = openProp !== undefined;
    const open = isControlled ? openProp : uncontrolledOpen;
    const setOpen = (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    };

    const styles = comboboxStyles();
    const selected = options.find((o) => o.value === value);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-label={ariaLabel}
            disabled={disabled}
            data-placeholder={selected ? undefined : ""}
            className={styles.trigger({ className })}
            {...rest}
          >
            <span className={styles.value()}>
              {selected ? selected.label : placeholder}
            </span>
            <ChevronDown className={styles.icon()} aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align={align}
          className={styles.content({ className: contentClassName })}
        >
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      keywords={[option.value, ...(option.keywords ?? [])]}
                      onSelect={() => {
                        onValueChange?.(option.value);
                        setOpen(false);
                      }}
                      className={cn(
                        isSelected &&
                          "text-fg-default font-medium [&_svg]:text-fg-brand",
                      )}
                    >
                      <span className={styles.itemLabel()}>{option.label}</span>
                      {isSelected && <Check aria-hidden="true" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);
Combobox.displayName = "Combobox";
