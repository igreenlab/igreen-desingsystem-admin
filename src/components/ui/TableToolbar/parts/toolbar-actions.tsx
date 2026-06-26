import type { ReactNode } from "react";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { cn } from "@/lib/utils";
import { ToolbarToolButton } from "./toolbar-tool-button";
import { toolbarSearch, toolbarSearchInput } from "../table-toolbar.styles";

/* ── Tipos ──────────────────────────────────────────────────────────── */

/** Item de um menu dropdown (ou do colapso mobile). */
export type ToolbarActionMenuItem = {
  label: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  /** Marca o item como selecionado (ex.: período corrente). */
  active?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  separator?: boolean;
};

type ActionBase = { id: string; label: string; icon?: ReactNode };

/**
 * Ação custom do toolbar. Três formas — todas colapsam no ⋯ no mobile:
 * - `button`   → botão de ação.
 * - `dropdown` → botão com menu (ex.: trocar período).
 * - `input`    → campo de texto compacto (ex.: busca secundária).
 */
export type ToolbarAction =
  | (ActionBase & {
      kind: "button";
      onClick: () => void;
      isActive?: boolean;
      disabled?: boolean;
    })
  | (ActionBase & { kind: "dropdown"; items: ToolbarActionMenuItem[] })
  | (ActionBase & {
      kind: "input";
      value: string;
      onChange: (value: string) => void;
      placeholder?: string;
    });

export type ToolbarActionsProps = {
  /** Ações custom do consumer (button/dropdown/input). */
  actions: ToolbarAction[];
  /**
   * Itens extras que entram SÓ no menu ⋯ do mobile (ex.: os `moreActions`
   * antigos) — assim tudo colapsa num único ⋯ em telas pequenas.
   */
  extraItems?: ToolbarActionMenuItem[];
  className?: string;
};

/* ── Render de UM item dentro de um menu (dropdown / mobile) ─────────── */
function MenuItem({ item, idx }: { item: ToolbarActionMenuItem; idx: number }) {
  if (item.separator) return <DropdownMenuSeparator />;
  return (
    <DropdownMenuItem
      key={idx}
      variant={item.destructive ? "destructive" : "default"}
      disabled={item.disabled}
      onSelect={() => item.onClick?.()}
      className={cn(item.active && "bg-bg-brand-subtle text-fg-brand")}
    >
      {item.icon}
      {item.label}
    </DropdownMenuItem>
  );
}

/* ── Input compacto (desktop inline e dentro do ⋯ mobile) ───────────── */
function ActionInput({
  action,
  className,
}: {
  action: Extract<ToolbarAction, { kind: "input" }>;
  className?: string;
}) {
  return (
    <label className={cn(toolbarSearch(), className)}>
      {action.icon}
      <input
        className={toolbarSearchInput()}
        value={action.value}
        placeholder={action.placeholder}
        onChange={(e) => action.onChange(e.target.value)}
        // Impede o typeahead do Radix quando o input vive dentro do menu mobile.
        onKeyDown={(e) => e.stopPropagation()}
        aria-label={action.label}
      />
    </label>
  );
}

/* ── Render inline (desktop) de UMA ação ────────────────────────────── */
function InlineAction({ action }: { action: ToolbarAction }) {
  if (action.kind === "button") {
    return (
      <ToolbarToolButton
        icon={action.icon}
        label={action.label}
        isActive={action.isActive}
        disabled={action.disabled}
        onClick={action.onClick}
      />
    );
  }
  if (action.kind === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ToolbarToolButton
            icon={action.icon}
            label={
              <span className="inline-flex items-center gap-gp-xs">
                {action.label}
                <ChevronDown className="size-[14px]" />
              </span>
            }
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4}>
          {action.items.map((it, i) => (
            <MenuItem key={i} item={it} idx={i} />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return <ActionInput action={action} />;
}

/**
 * ToolbarActions — slot de ações custom do toolbar (DataTable / DataList).
 *
 * Desktop (≥ md): renderiza as ações inline (button/dropdown/input).
 * Mobile  (< md): colapsa tudo num único ⋯ — buttons viram item, dropdowns
 * viram um grupo (label + itens), inputs viram um campo dentro do menu. Os
 * `extraItems` (ex.: o ⋯ antigo) entram no mesmo menu, evitando dois ⋯.
 */
export function ToolbarActions({
  actions,
  extraItems,
  className,
}: ToolbarActionsProps) {
  if (actions.length === 0 && (!extraItems || extraItems.length === 0)) {
    return null;
  }

  return (
    <>
      {/* Desktop — inline (+ ⋯ pros extraItems, se houver) */}
      <div className={cn("hidden items-center gap-gp-sm md:flex", className)}>
        {actions.map((a) => (
          <InlineAction key={a.id} action={a} />
        ))}
        {extraItems && extraItems.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ToolbarToolButton
                icon={<MoreHorizontal />}
                aria-label="Mais ações"
                title="Mais ações"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4}>
              {extraItems.map((it, i) => (
                <MenuItem key={i} item={it} idx={i} />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Mobile — tudo no ⋯ */}
      <div className="flex md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ToolbarToolButton
              icon={<MoreHorizontal />}
              aria-label="Mais ações"
              title="Mais ações"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={4}
            className="min-w-[220px]"
          >
            {actions.map((a, ai) => {
              if (a.kind === "button") {
                return (
                  <MenuItem
                    key={a.id}
                    idx={ai}
                    item={{
                      label: a.label,
                      icon: a.icon,
                      onClick: a.onClick,
                      active: a.isActive,
                      disabled: a.disabled,
                    }}
                  />
                );
              }
              if (a.kind === "dropdown") {
                return (
                  <div key={a.id}>
                    <DropdownMenuLabel>{a.label}</DropdownMenuLabel>
                    {a.items.map((it, i) => (
                      <MenuItem key={i} item={it} idx={i} />
                    ))}
                  </div>
                );
              }
              return (
                <div key={a.id} className="px-pad-md py-pad-sm">
                  <DropdownMenuLabel className="px-0 pb-pad-sm">
                    {a.label}
                  </DropdownMenuLabel>
                  <ActionInput action={a} className="w-full" />
                </div>
              );
            })}

            {extraItems && extraItems.length > 0 && (
              <>
                {actions.length > 0 && <DropdownMenuSeparator />}
                {extraItems.map((it, i) => (
                  <MenuItem key={`x${i}`} item={it} idx={i} />
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
