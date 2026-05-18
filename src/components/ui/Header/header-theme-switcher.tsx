import { Check, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../shadcn/dropdown-menu";
import { Button } from "../Button/button";
import type { HeaderThemeOption } from "./header.types";

const DEFAULT_OPTIONS: HeaderThemeOption[] = [
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Escuro", icon: Moon },
];

export type HeaderThemeSwitcherProps = {
  theme: string;
  onThemeChange: (id: string) => void;
  options?: HeaderThemeOption[];
  className?: string;
};

export function HeaderThemeSwitcher({
  theme,
  onThemeChange,
  options = DEFAULT_OPTIONS,
  className,
}: HeaderThemeSwitcherProps) {
  const current = options.find((o) => o.id === theme) ?? options[0];
  const CurrentIcon = current?.icon ?? Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          color="secondary"
          variant="outline"
          size="icon-sm"
          className={cn("rounded-radius-md", className)}
          aria-label="Trocar tema"
          title={`Tema: ${current?.label ?? ""}`}
        >
          <CurrentIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-[160px]">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = opt.id === theme;
          return (
            <DropdownMenuItem
              key={opt.id}
              onSelect={() => onThemeChange(opt.id)}
            >
              <Icon />
              <span className="flex-1">{opt.label}</span>
              {isActive && <Check className="text-fg-brand" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
