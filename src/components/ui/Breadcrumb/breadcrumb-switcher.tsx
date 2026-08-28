import { forwardRef, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn/command";
import { cn } from "@/lib/utils";
import { breadcrumbSwitcher } from "./breadcrumb-switcher.styles";
import type { BreadcrumbSwitcherProps } from "./breadcrumb-switcher.types";

/**
 * `BreadcrumbSwitcher` — o item do breadcrumb que **troca o registro aberto**.
 *
 * É o seletor de repositório do GitHub aplicado a qualquer domínio: o nome do que está aberto
 * fica no caminho, e clicar nele abre uma lista com busca pra pular direto pra outro registro.
 *
 * ## Por que não é o `Combobox`
 *
 * Por dentro é a mesma receita (Popover + `Command`), e é de propósito: busca, teclado e
 * estado vazio já estão resolvidos ali e não se reescrevem. O que muda é o **gatilho** — o
 * `Combobox` desenha um campo de formulário porque coleta um valor; aqui o gatilho é o texto
 * do caminho, com a tipografia dos irmãos e sem borda. Trocar o registro aberto é
 * **navegação**, não preenchimento de campo, e o componente precisa parecer o que é.
 *
 * ## O que ele NÃO faz
 *
 * Não navega: `onValueChange` devolve o `value` e o consumidor decide (rota, fetch, estado).
 * Não hospeda o conteúdo da página. E não busca no servidor — o `Command` filtra a lista que
 * você passou; pra milhares de registros o certo é paginar antes de entregar as opções.
 *
 * @example
 * <BreadcrumbItem>
 *   <BreadcrumbSwitcher
 *     value={clienteId}
 *     onValueChange={abrirCliente}
 *     options={clientes}
 *     title="Trocar cliente"
 *     searchPlaceholder="Buscar cliente…"
 *     aria-label="Trocar cliente"
 *   />
 * </BreadcrumbItem>
 */
export const BreadcrumbSwitcher = forwardRef<HTMLButtonElement, BreadcrumbSwitcherProps>(
  function BreadcrumbSwitcher(
    {
      value,
      onValueChange,
      options,
      placeholder,
      title,
      searchPlaceholder = "Buscar…",
      emptyMessage = "Nada encontrado.",
      footer,
      open: openProp,
      onOpenChange,
      align = "start",
      disabled,
      className,
      contentClassName,
      "aria-label": ariaLabel = "Trocar registro aberto",
    },
    ref,
  ) {
    const [openInterno, setOpenInterno] = useState(false);
    const open = openProp ?? openInterno;
    const setOpen = (proximo: boolean) => {
      setOpenInterno(proximo);
      onOpenChange?.(proximo);
    };

    const estilos = breadcrumbSwitcher();
    const atual = options.find((o) => o.value === value);

    /**
     * Agrupa preservando a ORDEM em que os grupos aparecem em `options` — não alfabética.
     * "Recentes" antes de "Todos" é informação que quem montou a lista quis dar.
     */
    const grupos = useMemo(() => {
      const mapa = new Map<string, typeof options>();
      for (const opcao of options) {
        const chave = opcao.group ?? "";
        const atual = mapa.get(chave);
        if (atual) atual.push(opcao);
        else mapa.set(chave, [opcao]);
      }
      return [...mapa.entries()];
    }, [options]);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            aria-label={ariaLabel}
            aria-expanded={open}
            disabled={disabled}
            className={estilos.trigger({ className })}
          >
            <span className={estilos.label()}>{atual?.label ?? placeholder ?? value}</span>
            {/* `ChevronsUpDown`, não `ChevronDown`: a seta dupla é o sinal de "troca", e é o que
                distingue o gatilho de um link do caminho — que também abre algo ao clicar. */}
            <ChevronsUpDown className={estilos.chevron()} aria-hidden />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align={align}
          className={estilos.content({ className: contentClassName })}
        >
          <Command>
            {title ? <div className={estilos.title()}>{title}</div> : null}
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              {grupos.map(([nomeGrupo, opcoes]) => (
                <CommandGroup key={nomeGrupo || "_"} heading={nomeGrupo || undefined}>
                  {opcoes.map((opcao) => {
                    const selecionada = opcao.value === value;
                    return (
                      <CommandItem
                        key={opcao.value}
                        /* `data-atual` marca o registro ABERTO no DOM. O `data-selected` do
                           cmdk é outra coisa — ele segue o item ativo do teclado — e o ícone
                           de check não serve de sinal: `leading` também é um svg, então
                           "tem svg" não distingue nada. */
                        data-atual={selecionada || undefined}
                        value={opcao.label}
                        /* O `value` entra como keyword: o usuário costuma saber o código/id do
                           registro, e ele nem sempre aparece no rótulo. */
                        keywords={[opcao.value, ...(opcao.keywords ?? [])]}
                        onSelect={() => {
                          onValueChange(opcao.value);
                          setOpen(false);
                        }}
                        className={cn(selecionada && "font-medium text-fg-default")}
                      >
                        <span className={estilos.item()}>
                          {opcao.leading}
                          <span className={estilos.itemTexto()}>
                            <span className={estilos.itemLabel()}>{opcao.label}</span>
                            {opcao.description ? (
                              <span className={estilos.itemDescricao()}>{opcao.description}</span>
                            ) : null}
                          </span>
                          {selecionada ? (
                            <Check className="size-icon-sm shrink-0 text-fg-brand" aria-hidden />
                          ) : null}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
            {footer ? <div className={estilos.footer()}>{footer}</div> : null}
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

BreadcrumbSwitcher.displayName = "BreadcrumbSwitcher";
