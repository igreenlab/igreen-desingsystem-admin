"use client";

import { menuItem } from "./single-menu-sidebar.styles";
import type { SingleMenuItemProps } from "./single-menu-sidebar.types";

export function SingleMenuItem({
  label,
  selected = false,
  onClick,
}: SingleMenuItemProps) {
  const s = menuItem({ selected });

  return (
    <button type="button" onClick={onClick} className={s.root()}>
      <div className={s.border()} />
      <span className={s.text()}>{label}</span>
    </button>
  );
}

SingleMenuItem.displayName = "SingleMenuItem";
