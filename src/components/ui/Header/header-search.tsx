import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button/button";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/shadcn/command";
import {
  searchFakeInput,
  searchFakeInputIcon,
  searchFakeInputText,
  searchFakeInputKbd,
} from "./header.styles";
import type { HeaderCommandGroup } from "./header.types";

export type HeaderSearchProps = {
  placeholder?: string;
  shortcut?: string;
  commandGroups?: HeaderCommandGroup[];
  commandPlaceholder?: string;
  commandEmptyMessage?: string;
  /** Atalho de teclado pra abrir (default: cmd/ctrl + k) */
  hotkey?: { key: string; meta?: boolean; ctrl?: boolean };
  /**
   * Delega a abertura: quando passado, o clique no campo e o atalho chamam ISTO em vez
   * de abrir a paleta interna — e o `CommandDialog` do componente não é montado.
   *
   * Existe porque o `open` era `useState` interno, sem saída: um app que já tem a
   * própria paleta global (Ctrl+K com busca assíncrona, histórico, navegação por rota)
   * não conseguia reaproveitá-la. Só dava pra preencher a NOSSA paleta por
   * `commandGroups`, que é dado estático — sem busca assíncrona nem render custom.
   *
   * Com `onOpen`, o header entrega só o campo falso (que é o que ele faz de melhor:
   * aparência e atalho consistentes) e a paleta é sua.
   */
  onOpen?: () => void;
  className?: string;
};

/**
 * Fake input no header que abre Command palette ao click.
 * Atalho ⌘K (Mac) / Ctrl+K (Windows) registrado globalmente.
 */
export function HeaderSearch({
  placeholder = "Buscar...",
  shortcut = "⌘K",
  commandGroups = [],
  commandPlaceholder = "Digite um comando ou busque...",
  commandEmptyMessage = "Nenhum resultado encontrado.",
  hotkey = { key: "k", meta: true, ctrl: true },
  onOpen,
  className,
}: HeaderSearchProps) {
  const [open, setOpen] = useState(false);
  const delegado = Boolean(onOpen);
  const abrir = () => (onOpen ? onOpen() : setOpen(true));

  // Atalho global (⌘K / Ctrl+K)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== hotkey.key.toLowerCase()) return;
      const meta = hotkey.meta && e.metaKey;
      const ctrl = hotkey.ctrl && e.ctrlKey;
      if (meta || ctrl) {
        e.preventDefault();
        if (onOpen) onOpen();
        else setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hotkey.key, hotkey.meta, hotkey.ctrl, onOpen]);

  return (
    <>
      {/* Desktop: fake input completo com placeholder + atalho */}
      <button
        type="button"
        className={cn(searchFakeInput(), "hidden md:inline-flex", className)}
        onClick={abrir}
        aria-label="Abrir busca"
      >
        <Search className={searchFakeInputIcon()} strokeWidth={1.8} />
        <span className={searchFakeInputText()}>{placeholder}</span>
        <kbd className={searchFakeInputKbd()}>{shortcut}</kbd>
      </button>

      {/* Mobile: icon-button (mesma altura/style dos triggers do header) */}
      <Button
        color="secondary"
        variant="outline"
        size="icon-sm"
        className="md:hidden rounded-radius-md"
        onClick={abrir}
        aria-label="Abrir busca"
        title={`Buscar (${shortcut})`}
      >
        <Search />
      </Button>

      {/* Com `onOpen` a paleta é do consumidor — não montamos a nossa. */}
      {!delegado && (
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={commandPlaceholder} />
        <CommandList>
          <CommandEmpty>{commandEmptyMessage}</CommandEmpty>
          {commandGroups.map((group, gIdx) => (
            <CommandGroupBlock
              key={group.heading}
              group={group}
              isLast={gIdx === commandGroups.length - 1}
              onSelect={() => setOpen(false)}
            />
          ))}
        </CommandList>
      </CommandDialog>
      )}
    </>
  );
}

function CommandGroupBlock({
  group,
  isLast,
  onSelect,
}: {
  group: HeaderCommandGroup;
  isLast: boolean;
  onSelect: () => void;
}) {
  return (
    <>
      <CommandGroup heading={group.heading}>
        {group.items.map((item) => {
          const Icon = item.icon;
          return (
            <CommandItem
              key={item.id ?? item.label}
              value={item.id ?? item.label}
              keywords={item.keywords}
              onSelect={() => {
                item.onSelect();
                onSelect();
              }}
              className={item.destructive ? "text-fg-danger [&_svg]:text-fg-danger" : undefined}
            >
              {Icon && <Icon />}
              <span>{item.label}</span>
              {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
            </CommandItem>
          );
        })}
      </CommandGroup>
      {!isLast && <CommandSeparator />}
    </>
  );
}
