"use client";

import { ChevronsUpDown } from "lucide-react";
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
        {options.map((option) => (
          <DropdownMenuItem
            key={option.id}
            className={s.dropdownItem}
            onClick={() => onModuleChange?.(option.id)}
          >
            <div className={s.dropdownItemIcon}>{option.icon}</div>
            <span className={s.dropdownItemLabel}>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

SingleMenuModuleSelector.displayName = "SingleMenuModuleSelector";
