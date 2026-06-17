import { User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";
import { Avatar } from "../../../Avatar";
import { FILTER_FIELD_SIZE } from "../_filter-field";
import type { ColumnTypeDefinition } from "../column-types.types";

/** Estrutura esperada em `typeOptions.users` — dicionário id → user info. */
type UserInfo = {
  name: string;
  avatar?: string;
  initials?: string;
  color?: string;
};

type UserTypeOptions = {
  users?: Record<string, UserInfo>;
};

function lookupUser(value: unknown, opts?: UserTypeOptions): UserInfo | null {
  if (value == null) return null;
  const key = String(value);
  return opts?.users?.[key] ?? null;
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

/** Gera cor consistente pelo hash do nome — quando user não tem `color` no
 *  typeOptions, usa essa fallback estável (mesmo nome = mesma cor sempre).
 *  Paleta de 8 cores semânticas. */
const FALLBACK_COLORS = [
  "#0a3a2e", // brand-deep
  "#f59e0b", // warning
  "#8754ec", // purple
  "#ef4444", // danger
  "#06b6d4", // cyan
  "#22c55e", // success
  "#ec4899", // pink
  "#3b82f6", // info
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function colorForName(name: string): string {
  return FALLBACK_COLORS[hashName(name) % FALLBACK_COLORS.length];
}


export const UserColumnType: ColumnTypeDefinition = {
  type: "user",
  operators: [
    { id: "equals", label: "é" },
    { id: "neq", label: "não é" },
    { id: "isAnyOf", label: "é um de" },
  ],
  renderFilterInput: ({ value, onChange, options }) => (
    <Select
      value={value == null ? "" : String(value)}
      onValueChange={(v) => onChange(v)}
    >
      <SelectTrigger className={FILTER_FIELD_SIZE}>
        <SelectValue placeholder="Selecione usuário..." />
      </SelectTrigger>
      <SelectContent>
        {(options ?? []).map((o) => (
          <SelectItem key={String(o.value)} value={String(o.value)}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
  renderFastFilterInput: ({ value, onChange, options }) => (
    <div className="p-pad-md">
      <Select
        defaultOpen
        value={value == null ? "" : String(value)}
        onValueChange={(v) => onChange(v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione usuário..." />
        </SelectTrigger>
        <SelectContent>
          {(options ?? []).map((o) => (
            <SelectItem key={String(o.value)} value={String(o.value)}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ),
  matchesFilter: (cellValue, filterValue, operator) => {
    const cell = cellValue == null ? "" : String(cellValue);
    if (operator === "equals") return cell === String(filterValue ?? "");
    if (operator === "neq") return cell !== String(filterValue ?? "");
    if (operator === "isAnyOf") {
      // Aceita escalar (do preset) ou array — normaliza pra array.
      const arr = Array.isArray(filterValue)
        ? filterValue.map(String)
        : filterValue == null
          ? []
          : [String(filterValue)];
      return arr.includes(cell);
    }
    return null;
  },
  renderChipValue: (value, options) => {
    if (value == null) return "";
    const opt = options?.find((o) => String(o.value) === String(value));
    return opt?.label ?? String(value);
  },

  renderCell: ({ value, column }) => {
    const opts = column?.typeOptions as UserTypeOptions | undefined;
    const user = lookupUser(value, opts);
    if (!user) {
      // Sem typeOptions.users registrado, fallback: usa o valor raw como nome
      const fallbackName = value == null ? "" : String(value);
      if (!fallbackName) return null;
      const initials = initialsFromName(fallbackName);
      const color = colorForName(fallbackName);
      return (
        <span
          className="inline-flex items-center gap-gp-md whitespace-nowrap"
          title={fallbackName}
        >
          <Avatar size="sm" colorHex={color}>{initials}</Avatar>
          <span className="truncate text-fg-default font-medium">{fallbackName}</span>
        </span>
      );
    }
    const initials = user.initials ?? initialsFromName(user.name);
    const color = user.color ?? colorForName(user.name);
    return (
      <span
        className="inline-flex items-center gap-gp-md whitespace-nowrap"
        title={user.name}
      >
        <Avatar size="sm" colorHex={color}>{initials}</Avatar>
        <span className="truncate text-fg-default font-medium">{user.name}</span>
      </span>
    );
  },
  formatValue: (v) => (v == null ? "" : String(v)),
  defaultAlign: "left",
  defaultWidth: 170,
  defaultSortable: true,
  defaultEllipsis: true,
  defaultIcon: User,
};
