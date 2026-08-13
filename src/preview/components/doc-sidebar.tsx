import { useEffect } from "react";
import { cn } from "@/lib/utils";
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
import { SidebarBrandIcon } from "../../components/ui/MenuSidebar";

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
  mobileOpen = false,
  onCloseMobile,
}: {
  sections: DocNavSection[];
  onNavigate?: (href: string) => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
  brand?: Brand;
  onSelectBrand?: (b: Brand) => void;
  /** Abaixo de `lg` o sidebar sai do fluxo e vira drawer; isto controla se está aberto. */
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  // Fecha no Escape enquanto o drawer está aberto. Só registra o listener quando
  // precisa, pra não deixar um handler global vivo no desktop.
  useEffect(() => {
    if (!mobileOpen || !onCloseMobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseMobile();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onCloseMobile]);

  return (
    <>
      {/* Backdrop — só no mobile, e só quando aberto. */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <nav
        className={cn(
          // Mobile: fora do fluxo, sobreposto, deslizando da esquerda. `w-[280px]
          // max-w-[85vw]` em vez do 260 fixo — em telas de 320px o menu não pode
          // encostar na borda oposta.
          "fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] -translate-x-full transition-transform duration-200 ease-out",
          mobileOpen && "translate-x-0",
          // Desktop: volta pro fluxo, largura original, sem transform.
          "lg:static lg:z-auto lg:w-[260px] lg:min-w-[260px] lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:transition-none",
          "h-screen overflow-y-auto border-r border-border-sidebar bg-bg-sidebar scrollbar-thin flex flex-col",
        )}
      >
      {/* Logo */}
      <div className="flex items-center gap-gp-xl px-pad-4xl py-pad-3xl border-b border-border-sidebar shrink-0">
        {/* Logo real da iGreen, a MESMA do rail do AppShell (a das telas de CRUD) — era
            um "iG" datilografado. `size` é a LARGURA; a altura sai da proporção 46×64 do
            viewBox. 14 numa caixa de 32px mantém a proporção do rail (18 em 40 = 45% da
            largura da caixa), então a marca lê igual, só menor.

            `aria-hidden`: o `SidebarBrandIcon` traz `aria-label="iGreen"`, e o texto ao
            lado já diz "iGreen DS" — sem isto o leitor de tela anuncia a marca duas
            vezes. */}
        <div
          aria-hidden
          className="grid size-8 place-items-center rounded-radius-lg bg-bg-brand text-fg-on-brand"
        >
          <SidebarBrandIcon size={14} />
        </div>
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
    </>
  );
}
