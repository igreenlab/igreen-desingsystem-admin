"use client";

import type { ReactNode } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/shadcn/command";
import type { SingleMenuCategory } from "./single-menu-sidebar.types";

interface SingleMenuCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: SingleMenuCategory[];
  placeholder?: string;
  /** Seleciona um item de menu (folha ou sub-item) */
  onSelect: (id: string, parentId?: string) => void;
  /** Conteúdo customizado (substitui a lista padrão derivada das categorias) */
  custom?: ReactNode;
}

/**
 * Paleta de busca (Command) acionada pelo campo de busca da sidebar.
 * Por padrão lista os menus (categorias-folha + sub-itens agrupados);
 * `custom` substitui a lista padrão.
 */
export function SingleMenuCommand({
  open,
  onOpenChange,
  categories,
  placeholder = "Buscar no menu…",
  onSelect,
  custom,
}: SingleMenuCommandProps) {
  const leaves = categories.filter((c) => !c.items?.length);
  const groups = categories.filter((c) => c.items?.length);

  const handle = (id: string, parentId?: string) => {
    onSelect(id, parentId);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>Nenhum resultado.</CommandEmpty>

        {custom ?? (
          <>
            {leaves.length > 0 && (
              <CommandGroup heading="Menu">
                {leaves.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={c.label}
                    onSelect={() => handle(c.id)}
                  >
                    {c.icon}
                    <span>{c.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {groups.map((cat) => (
              <CommandGroup key={cat.id} heading={cat.label}>
                {cat.items!.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${cat.label} ${item.label}`}
                    onSelect={() => handle(item.id, cat.id)}
                  >
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

SingleMenuCommand.displayName = "SingleMenuCommand";
