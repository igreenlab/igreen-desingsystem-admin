import { LayoutGrid, LogOut, Settings, SunMoon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../shadcn/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../shadcn/dropdown-menu";
import type { HeaderThemeOption } from "../Header";
import type { AppShellLayoutOption, AppShellUser } from "./app-shell.types";

export type UserMenuProps = {
  user: AppShellUser;
  /** Layout state (radio group). Sem theme/layout escondidos automaticamente. */
  layout?: string;
  onLayoutChange?: (id: string) => void;
  layoutOptions?: AppShellLayoutOption[];
  theme?: string;
  onThemeChange?: (id: string) => void;
  themeOptions?: HeaderThemeOption[];
  onSettings?: () => void;
  onLogout?: () => void;
};

function deriveInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * UserMenu — Avatar do rail do MenuSidebar com DropdownMenu.
 *
 * Conteúdo (na ordem):
 *   1. Header com avatar + nome + email
 *   2. Separator
 *   3. Layout radio group (se layoutOptions)
 *   4. Tema radio group (se themeOptions)
 *   5. Configurações (se onSettings)
 *   6. Separator
 *   7. Sair (se onLogout)
 *
 * Renderizado como `user={<UserMenu ...>}` na MenuSidebar.
 */
export function UserMenu({
  user,
  layout,
  onLayoutChange,
  layoutOptions,
  theme,
  onThemeChange,
  themeOptions,
  onSettings,
  onLogout,
}: UserMenuProps) {
  const initials = user.initials ?? deriveInitials(user.name);
  const hasLayout = !!(layoutOptions && layoutOptions.length > 0);
  const hasTheme = !!(themeOptions && themeOptions.length > 0);
  const hasGroups = hasLayout || hasTheme || !!onSettings;

  const currentLayoutLabel =
    hasLayout && layout
      ? layoutOptions!.find((o) => o.id === layout)?.label
      : undefined;
  const currentThemeLabel =
    hasTheme && theme
      ? themeOptions!.find((o) => o.id === theme)?.label
      : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Menu do usuário (${user.name})`}
          className={[
            "grid place-items-center w-9 h-9 rounded-full shrink-0",
            "bg-bg-brand text-fg-on-brand text-caption-sm font-bold uppercase tracking-[0.02em]",
            "cursor-pointer transition-opacity duration-150",
            "hover:opacity-90",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-secondary",
            "data-[state=open]:ring-4 data-[state=open]:ring-ring-secondary",
          ].join(" ")}
          style={user.avatarColor ? { background: user.avatarColor } : undefined}
        >
          {user.avatarSrc ? (
            <Avatar className="size-9">
              <AvatarImage src={user.avatarSrc} alt={user.name} />
              <AvatarFallback className="bg-transparent text-fg-on-brand">
                {initials}
              </AvatarFallback>
            </Avatar>
          ) : (
            <span aria-hidden>{initials}</span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="end"
        sideOffset={12}
        className="min-w-[240px]"
      >
        {/* Header — avatar + nome + email */}
        <div className="flex items-center gap-gp-md px-pad-lg py-pad-md">
          <Avatar
            className="size-9 shrink-0"
            style={user.avatarColor ? { background: user.avatarColor } : undefined}
          >
            {user.avatarSrc && <AvatarImage src={user.avatarSrc} alt={user.name} />}
            <AvatarFallback className="bg-bg-brand text-fg-on-brand text-body-xs font-bold uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-body-sm font-medium text-fg-default truncate">
              {user.name}
            </span>
            {user.email && (
              <span className="text-caption-sm text-fg-muted truncate">
                {user.email}
              </span>
            )}
          </div>
        </div>

        {hasGroups && <DropdownMenuSeparator />}

        {/* Layout — submenu */}
        {hasLayout && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <LayoutGrid />
              <span>Layout</span>
              {currentLayoutLabel && (
                <span className="flex-1 text-right text-caption-sm text-fg-subtle">
                  {currentLayoutLabel}
                </span>
              )}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent sideOffset={4}>
              <DropdownMenuRadioGroup
                value={layout}
                onValueChange={onLayoutChange}
              >
                {layoutOptions!.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <DropdownMenuRadioItem key={opt.id} value={opt.id}>
                      <Icon />
                      <span>{opt.label}</span>
                    </DropdownMenuRadioItem>
                  );
                })}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        {/* Tema — submenu */}
        {hasTheme && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <SunMoon />
              <span>Tema</span>
              {currentThemeLabel && (
                <span className="flex-1 text-right text-caption-sm text-fg-subtle">
                  {currentThemeLabel}
                </span>
              )}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent sideOffset={4}>
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={onThemeChange}
              >
                {themeOptions!.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <DropdownMenuRadioItem key={opt.id} value={opt.id}>
                      <Icon />
                      <span>{opt.label}</span>
                    </DropdownMenuRadioItem>
                  );
                })}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}

        {/* Configurações */}
        {onSettings && (
          <DropdownMenuItem onSelect={onSettings}>
            <Settings />
            <span>Configurações</span>
          </DropdownMenuItem>
        )}

        {/* Logout */}
        {onLogout && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onLogout}>
              <LogOut />
              <span>Sair</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
