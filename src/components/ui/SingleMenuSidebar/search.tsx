"use client";

import { Search } from "lucide-react";
import { styles } from "./single-menu-sidebar.styles";

interface SingleMenuSearchTriggerProps {
  placeholder?: string;
  /** Abre a paleta de busca (Command) */
  onOpen: () => void;
}

/**
 * Campo de busca — na verdade um trigger que abre o CommandDialog.
 * O input "real" + filtragem ficam no Command.
 */
export function SingleMenuSearch({
  placeholder = "Buscar",
  onOpen,
}: SingleMenuSearchTriggerProps) {
  const s = styles.search;

  return (
    <button type="button" onClick={onOpen} className={s.wrapper}>
      <div className={s.inner}>
        <Search className={s.icon} />
        <span className={s.text}>{placeholder}</span>
      </div>
      <div className={s.shortcutBadge}>
        <span className={s.shortcutText}>&#8984;K</span>
      </div>
    </button>
  );
}

SingleMenuSearch.displayName = "SingleMenuSearch";
