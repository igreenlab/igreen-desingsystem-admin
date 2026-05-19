import { Separator } from "../../components/shadcn/separator";

export type DocNavSection = {
  title: string;
  items: { label: string; href: string; active?: boolean; badge?: string }[];
};

export function DocSidebar({
  sections,
  onNavigate,
  theme,
  onToggleTheme,
}: {
  sections: DocNavSection[];
  onNavigate?: (href: string) => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}) {
  return (
    <nav className="w-[260px] min-w-[260px] shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-border-sidebar bg-bg-sidebar scrollbar-thin flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-gp-xl px-pad-4xl py-pad-3xl border-b border-border-sidebar shrink-0">
        <div className="w-8 h-8 rounded-radius-lg bg-bg-brand text-fg-on-brand flex items-center justify-center font-bold text-caption-sm">iG</div>
        <div>
          <p className="text-body-md font-medium text-fg-default leading-none">iGreen DS</p>
          <p className="text-caption-sm text-fg-subtle">preview</p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-pad-4xl py-pad-3xl">
        <div className="flex flex-col gap-gp-4xl">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="text-caption-sm text-fg-subtle font-medium mb-gp-xl">{section.title}</p>
              <div className="flex flex-col">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onNavigate?.(item.href)}
                    className={[
                      "block py-pad-sm px-pad-xl rounded-radius-md text-body-xs font-medium transition-colors text-left w-full",
                      item.active
                        ? "text-fg-brand font-semibold bg-bg-surface shadow-sh-sm dark:bg-bg-sidebar-accent dark:shadow-sh-none"
                        : "text-fg-default hover:text-fg-brand hover:bg-bg-sidebar-accent",
                    ].join(" ")}
                  >
                    {item.label}
                    {item.badge && <span className={`ml-gp-md text-caption-sm ${item.badge === "new" ? "text-fg-brand" : "text-fg-subtle"}`}>●</span>}
                  </button>
                ))}
              </div>
              <Separator className="mt-gp-3xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Theme toggle */}
      {onToggleTheme && (
        <div className="shrink-0 px-pad-4xl py-pad-3xl border-t border-border-sidebar">
          <div className="flex rounded-full bg-bg-muted p-pad-xs">
            <button
              type="button"
              onClick={() => theme === "dark" && onToggleTheme()}
              className={[
                "flex-1 flex items-center justify-center gap-gp-md rounded-full py-pad-md text-body-xs transition-all",
                theme === "light"
                  ? "bg-bg-surface text-fg-default shadow-sh-sm"
                  : "text-fg-muted hover:text-fg-default",
              ].join(" ")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              Light
            </button>
            <button
              type="button"
              onClick={() => theme === "light" && onToggleTheme()}
              className={[
                "flex-1 flex items-center justify-center gap-gp-md rounded-full py-pad-md text-body-xs transition-all",
                theme === "dark"
                  ? "bg-bg-surface text-fg-default shadow-sh-sm"
                  : "text-fg-muted hover:text-fg-default",
              ].join(" ")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              Dark
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
