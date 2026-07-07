"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shadcn/dropdown-menu";
import { styles } from "./single-menu-sidebar.styles";
import type { SingleMenuModuleSelectorProps } from "./single-menu-sidebar.types";

export function SingleMenuModuleSelector({
  icon,
  title,
  subtitle,
  options,
  onModuleChange,
}: SingleMenuModuleSelectorProps) {
  const s = styles.module;

  const triggerContent = (
    <>
      <div className={s.iconContainer}>{icon}</div>
      <div className={s.textContainer}>
        <span className={s.title}>{title}</span>
        <span className={s.subtitle}>{subtitle}</span>
      </div>
      <ChevronsUpDown className={s.chevron} />
    </>
  );

  // Sem opções: somente display (sem dropdown)
  if (!options || options.length === 0) {
    return <div className={s.trigger}>{triggerContent}</div>;
  }

  // Com opções: dropdown para trocar de módulo
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={s.trigger}>
        {triggerContent}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" sideOffset={4} align="start">
        {options.map((option) => {
          // módulo atual = o que está exibido no trigger (title)
          const isSelected = option.label === title;
          return (
            <DropdownMenuItem
              key={option.id}
              className={cn(
                s.dropdownItem,
                isSelected && s.dropdownItemSelected,
              )}
              onClick={() => onModuleChange?.(option.id)}
            >
              <div className={s.dropdownItemIcon}>{option.icon}</div>
              <span className={s.dropdownItemLabel}>{option.label}</span>
              {isSelected && <Check className={s.dropdownItemCheck} />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

SingleMenuModuleSelector.displayName = "SingleMenuModuleSelector";
