"use client";

import { ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/shadcn/dropdown-menu";
import { useSingleMenuSidebar } from "./use-single-menu-sidebar";
import { styles } from "./single-menu-sidebar.styles";
import type { SingleMenuFooterProps } from "./single-menu-sidebar.types";

export function SingleMenuFooter({
  name,
  email,
  avatar,
  actions,
  onAction,
}: SingleMenuFooterProps) {
  const { expanded } = useSingleMenuSidebar();
  const s = styles.footer;

  const triggerContent = (
    <>
      <div className={s.avatar}>
        {avatar ?? <User className={s.avatarIcon} />}
      </div>
      {expanded && (
        <>
          <div className={s.textContainer}>
            <span className={s.name}>{name}</span>
            <span className={s.email}>{email}</span>
          </div>
          <ChevronsUpDown className={s.chevron} />
        </>
      )}
    </>
  );

  // Sem ações: somente display (sem dropdown)
  if (!actions || actions.length === 0) {
    return (
      <div className={s.wrapper}>
        <div className={cn(s.button, !expanded && "justify-center px-0")}>
          {triggerContent}
        </div>
      </div>
    );
  }

  // Com ações: dropdown do usuário
  return (
    <div className={s.wrapper}>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(s.button, !expanded && "justify-center px-0")}
        >
          {triggerContent}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={expanded ? "top" : "right"}
          sideOffset={8}
          align={expanded ? "end" : "start"}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className={s.dropdownLabel}>
              <span className={s.dropdownLabelName}>{name}</span>
              <span className={s.dropdownLabelEmail}>{email}</span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              variant={
                action.variant === "destructive" ? "destructive" : "default"
              }
              onClick={() => onAction?.(action.id)}
              className={s.dropdownItem}
            >
              {action.icon && (
                <span className={s.dropdownItemIcon}>{action.icon}</span>
              )}
              <span>{action.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

SingleMenuFooter.displayName = "SingleMenuFooter";
