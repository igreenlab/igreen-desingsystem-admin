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
import { Chip } from "@/components/ui/Chip";
import { comboboxStyles } from "./combobox.styles";
import type { ComboboxOption, ComboboxProps } from "./combobox.types";

/**
 * Combobox — select com BUSCA (autocomplete) e lista ROLÁVEL, em escolha única
 * (default) ou múltipla (`multiple`).
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
  function Combobox(props, ref) {
    const {
      options,
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
      multiple,
      value,
      onValueChange,
      ...rest
    } = props as ComboboxProps & {
      multiple?: boolean;
      value?: string | string[];
      onValueChange?: (v: never) => void;
    };
    const { maxChips = 2, renderSummary } =
      props.multiple === true ? props : ({} as { maxChips?: number; renderSummary?: never });

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

    const selecionados: ComboboxOption[] = multiple
      ? options.filter((o) => (value as string[] | undefined)?.includes(o.value))
      : options.filter((o) => o.value === value);

    const estaSelecionada = (o: ComboboxOption) =>
      multiple
        ? Boolean((value as string[] | undefined)?.includes(o.value))
        : o.value === value;

    const escolher = (o: ComboboxOption) => {
      if (!multiple) {
        (onValueChange as ((v: string) => void) | undefined)?.(o.value);
        setOpen(false);
        return;
      }
      // Toggle, e o dropdown FICA ABERTO: escolher várias de uma lista longa com o
      // popover fechando a cada clique custa um reabrir + re-buscar por item.
      const atual = (value as string[] | undefined) ?? [];
      const proximo = atual.includes(o.value)
        ? atual.filter((v) => v !== o.value)
        : [...atual, o.value];
      (onValueChange as ((v: string[]) => void) | undefined)?.(proximo);
    };

    const conteudoTrigger = () => {
      if (selecionados.length === 0) return placeholder;
      if (!multiple) return selecionados[0].label;
      if (renderSummary) return renderSummary(selecionados);
      const visiveis = selecionados.slice(0, maxChips);
      const resto = selecionados.length - visiveis.length;
      return (
        // Chips SEM × de propósito: o trigger é um <button>, e um botão de remover
        // aqui dentro seria botão aninhado — HTML inválido, e o navegador desaninha,
        // fazendo o × abrir o dropdown. Pra remover com ×, renderize <Chip onRemove>
        // ABAIXO do campo.
        <span className="flex min-w-0 items-center gap-gp-xs">
          {visiveis.map((o) => (
            <Chip key={o.value} size="sm" color="neutral" variant="soft">
              {o.label}
            </Chip>
          ))}
          {resto > 0 && (
            <span className="shrink-0 text-fg-muted">+{resto}</span>
          )}
        </span>
      );
    };

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
            data-placeholder={selecionados.length > 0 ? undefined : ""}
            className={styles.trigger({ className })}
            {...rest}
          >
            <span className={styles.value()}>{conteudoTrigger()}</span>
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
                  const isSelected = estaSelecionada(option);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      keywords={[option.value, ...(option.keywords ?? [])]}
                      // `aria-selected` é do cmdk (item ativo do teclado). Em multi,
                      // quem diz "marcado" é `aria-checked` + role de opção múltipla.
                      role={multiple ? "option" : undefined}
                      aria-checked={multiple ? isSelected : undefined}
                      onSelect={() => escolher(option)}
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
