import { useState, useEffect } from "react";
import { TocIcon } from "./doc-icons";

export type TocItem = {
  id: string;
  label: string;
  indent?: boolean;
};

export function TOC({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const scrollParent = document.querySelector("main");
    if (!scrollParent) return;

    const handleScroll = () => {
      const ids = items.map((i) => i.id);
      const atBottom = scrollParent.scrollHeight - scrollParent.scrollTop - scrollParent.clientHeight < 2;
      if (atBottom) {
        for (let i = ids.length - 1; i >= 0; i--) {
          const el = document.getElementById(ids[i]);
          if (el && el.getBoundingClientRect().top < scrollParent.clientHeight) {
            setActiveId(ids[i]);
            return;
          }
        }
      }
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) current = id;
      }
      setActiveId(current);
    };

    scrollParent.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => scrollParent.removeEventListener("scroll", handleScroll);
  }, [items]);

  return (
    <nav>
      <p className="text-caption-sm font-semibold text-fg-subtle uppercase tracking-wider mb-gp-xl flex items-center gap-gp-sm">
        <TocIcon /> ON THIS PAGE
      </p>
      <div className="flex flex-col gap-gp-2xs border-l-2 border-border-subtle pl-pad-2xl">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={[
                "text-body-md font-medium transition-colors leading-relaxed py-pad-xs",
                isActive
                  ? "text-fg-brand font-medium"
                  : "text-fg-muted font-normal hover:text-fg-brand",
              ].join(" ")}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
