"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { styles } from "./single-menu-sidebar.styles";
import type { SingleMenuSearchProps } from "./single-menu-sidebar.types";

export function SingleMenuSearch({
  placeholder = "Buscar",
  value,
  onChange,
  inputRef,
}: SingleMenuSearchProps) {
  const s = styles.search;

  return (
    <div className={s.wrapper}>
      <div className={s.inner}>
        <Search className={s.icon} />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(s.text, "w-full bg-transparent outline-none")}
        />
      </div>
      <div className={s.shortcutBadge}>
        <span className={s.shortcutText}>&#8984;F</span>
      </div>
    </div>
  );
}

SingleMenuSearch.displayName = "SingleMenuSearch";
