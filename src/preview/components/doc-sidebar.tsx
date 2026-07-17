import { Separator } from "../../components/shadcn/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../../components/shadcn/dropdown-menu";
import { BRANDS, type Brand } from "../../hooks/useBrand";

export type DocNavSection = {
  title: string;
  items: {
    label: string;
    href: string;
    active?: boolean;
    badge?: string;
    /** Abre uma app standalone (fullscreen, fora do chrome de docs) via URL
     *  `?app=...` em vez de navegar pelo hash router interno. */
    url?: string;
  }[];
};

export function DocSidebar({
  sections,
  onNavigate,
  theme,
  onToggleTheme,
  brand,
  onSelectBrand,
}: {
  sections: DocNavSection[];
  onNavigate?: (href: string) => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  brand?: Brand;
  onSelectBrand?: (b: Brand) => void;
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
                    onClick={() =>
                      item.url
                        ? (window.location.href = item.url)
                        : onNavigate?.(item.href)
                    }
                    className={[
                      "flex items-center py-pad-sm px-pad-xl rounded-radius-md text-body-xs font-medium transition-colors text-left w-full",
                      item.active
                        ? "text-fg-brand font-semibold bg-bg-surface shadow-sh-sm dark:bg-bg-sidebar-accent dark:shadow-sh-none"
                        : "text-fg-default hover:text-fg-brand hover:bg-bg-sidebar-accent",
                    ].join(" ")}
                  >
                    {item.label}
                    {item.url && <span className="ml-gp-sm text-caption-sm text-fg-subtle" aria-hidden="true">↗</span>}
                    {item.badge && <span className={`ml-gp-md text-caption-sm ${item.badge === "new" ? "text-fg-brand" : "text-fg-subtle"}`}>●</span>}
                  </button>
                ))}
              </div>
              <Separator className="mt-gp-3xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer: theme (icon-only) + seletor de marca (circular → dropdown) */}
      {(onToggleTheme || onSelectBrand) && (
        <div className="shrink-0 px-pad-4xl py-pad-3xl border-t border-border-sidebar flex items-center gap-gp-md">
          {/* Theme toggle — só ícone */}
          {onToggleTheme && (
            <div className="flex-1 flex items-center rounded-radius-full bg-bg-muted p-pad-xs min-h-form-lg">
              <button
                type="button"
                aria-label="Tema claro"
                aria-pressed={theme === "light"}
                onClick={() => theme === "dark" && onToggleTheme()}
                className={[
                  "flex-1 flex items-center justify-center rounded-radius-full py-pad-sm transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary",
                  theme === "light"
                    ? "bg-bg-surface text-fg-default shadow-sh-sm"
                    : "text-fg-muted hover:text-fg-default",
                ].join(" ")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              </button>
              <button
                type="button"
                aria-label="Tema escuro"
                aria-pressed={theme === "dark"}
                onClick={() => theme === "light" && onToggleTheme()}
                className={[
                  "flex-1 flex items-center justify-center rounded-radius-full py-pad-sm transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary",
                  theme === "dark"
                    ? "bg-bg-surface text-fg-default shadow-sh-sm"
                    : "text-fg-muted hover:text-fg-default",
                ].join(" ")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              </button>
            </div>
          )}

          {/* Marca — botão circular só ícone (swatch atual) → dropdown */}
          {onSelectBrand && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Selecionar marca"
                  title="Marca"
                  className="size-form-lg shrink-0 rounded-radius-full bg-bg-muted flex items-center justify-center transition-colors hover:bg-bg-muted-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary"
                >
                  <span
                    className="size-icon-md rounded-radius-full ring-1 ring-border-default"
                    style={{ background: BRANDS.find((b) => b.id === brand)?.swatch ?? BRANDS[0].swatch }}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="min-w-[180px]">
                <DropdownMenuLabel>Marca</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={brand ?? "default"}
                  onValueChange={(v) => onSelectBrand(v as Brand)}
                >
                  {BRANDS.map((b) => (
                    <DropdownMenuRadioItem key={b.id} value={b.id} className="gap-gp-md">
                      <span
                        className="size-icon-md rounded-radius-full ring-1 ring-border-default"
                        style={{ background: b.swatch }}
                      />
                      {b.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </nav>
  );
}
