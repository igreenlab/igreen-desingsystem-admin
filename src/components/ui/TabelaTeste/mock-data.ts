import type { LucideIcon } from "lucide-react";
import {
  Hash, User, AtSign, Phone, CheckCircle2, Tag,
  Users, DollarSign, Calendar, Type,
} from "lucide-react";

/* ── Colunas (idêntico ao sandbox `/design-and-table-v2`) ──────────── */

export type TabelaCol = {
  key: string;
  type: "select" | "id" | "person" | "email" | "phone" | "status" | "category" | "agent" | "currency" | "date" | "text" | "actions";
  label?: string;
  icon?: LucideIcon;
  width?: number;
  minWidth?: number;
  sorted?: boolean;
};

export const COLUMNS: TabelaCol[] = [
  { key: "select",      width: 44,                              type: "select"   },
  { key: "id",          width: 120,    label: "ID",             type: "id",       icon: Hash },
  { key: "name",        minWidth: 220, label: "Nome",           type: "person",   icon: User, sorted: true },
  { key: "email",       minWidth: 240, label: "Email",          type: "email",    icon: AtSign },
  { key: "phone",       minWidth: 170, label: "Telefone",       type: "phone",    icon: Phone },
  { key: "status",      minWidth: 140, label: "Status",         type: "status",   icon: CheckCircle2 },
  { key: "category",    minWidth: 130, label: "Categoria",      type: "category", icon: Tag },
  { key: "agent",       minWidth: 170, label: "Atribuído",      type: "agent",    icon: Users },
  { key: "value",       width: 130,    label: "Valor",          type: "currency", icon: DollarSign },
  { key: "createdAt",   width: 130,    label: "Criado em",      type: "date",     icon: Calendar },
  { key: "lastContact", width: 150,    label: "Último contato", type: "date",     icon: Calendar },
  { key: "location",    minWidth: 150, label: "Localização",    type: "text",     icon: Type },
  { key: "actions",     width: 44,                              type: "actions"  },
];

export function getColCellStyle(col: TabelaCol): React.CSSProperties {
  if (col.width)    return { width: col.width,       flex: `0 0 ${col.width}px` };
  if (col.minWidth) return { minWidth: col.minWidth, flex: `1 0 ${col.minWidth}px` };
  return {};
}

/* ── Lookups (statuses/categorias/agentes) ─────────────────────────── */

export const STATUSES = {
  active:   { label: "Ativo",    color: "var(--color-fg-success)" },
  pending:  { label: "Pendente", color: "var(--color-fg-warning)" },
  paused:   { label: "Pausado",  color: "var(--color-fg-info)" },
  inactive: { label: "Inativo",  color: "var(--color-fg-muted)" },
} as const;

export const CATEGORIES = {
  royal:      { label: "Royal",      kind: "warning" as const },
  licenciado: { label: "Licenciado", kind: "info"    as const },
  lead:       { label: "Lead",       kind: "success" as const },
};

export const AGENTS = {
  you:    { name: "Você",         initials: "VC", color: "#0a3a2e" },
  aline:  { name: "Aline Castro", initials: "AC", color: "#f59e0b" },
  carlos: { name: "Carlos Souza", initials: "CS", color: "#8754ec" },
  maria:  { name: "Maria Lima",   initials: "ML", color: "#ef4444" },
} as const;

/* ── Mock data (10 rows determinísticas) ───────────────────────────── */

export type TabelaRow = {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  email: string;
  phone: string;
  statusId: keyof typeof STATUSES;
  categoryId: keyof typeof CATEGORIES;
  location: string;
  value: number;
  agentId: keyof typeof AGENTS;
  createdAt: number;
  lastContact: number;
};

const BASE_DATE = new Date("2026-04-15T12:00:00Z").getTime();
const DAY_MS = 86400000;

const ROWS_BASE: TabelaRow[] = [
  { id: "CLI-2401", name: "Maria Silva",     initials: "MS", avatarColor: "#f59e0b", email: "maria.silva@example.com",     phone: "+55 11 91234-5678", statusId: "active",   categoryId: "royal",      location: "São Paulo, SP",      value: 4800,  agentId: "you",    createdAt: BASE_DATE - 65 * DAY_MS, lastContact: BASE_DATE - 2 * DAY_MS  },
  { id: "CLI-2402", name: "João Santos",     initials: "JS", avatarColor: "#0a3a2e", email: "joao.santos@example.com",     phone: "+55 11 92345-6789", statusId: "pending",  categoryId: "licenciado", location: "Rio de Janeiro, RJ", value: 12300, agentId: "aline",  createdAt: BASE_DATE - 58 * DAY_MS, lastContact: BASE_DATE - 5 * DAY_MS  },
  { id: "CLI-2403", name: "Carlos Oliveira", initials: "CO", avatarColor: "#8754ec", email: "carlos.oliveira@example.com", phone: "+55 11 93456-7890", statusId: "active",   categoryId: "lead",       location: "Belo Horizonte, MG", value: 2150,  agentId: "carlos", createdAt: BASE_DATE - 51 * DAY_MS, lastContact: BASE_DATE - 1 * DAY_MS  },
  { id: "CLI-2404", name: "Ana Costa",       initials: "AC", avatarColor: "#1cb280", email: "ana.costa@example.com",       phone: "+55 11 94567-8901", statusId: "paused",   categoryId: "royal",      location: "Porto Alegre, RS",   value: 8900,  agentId: "maria",  createdAt: BASE_DATE - 44 * DAY_MS, lastContact: BASE_DATE - 12 * DAY_MS },
  { id: "CLI-2405", name: "Pedro Pereira",   initials: "PP", avatarColor: "#ef4444", email: "pedro.pereira@example.com",   phone: "+55 11 95678-9012", statusId: "inactive", categoryId: "lead",       location: "Curitiba, PR",       value: 1100,  agentId: "you",    createdAt: BASE_DATE - 37 * DAY_MS, lastContact: BASE_DATE - 30 * DAY_MS },
  { id: "CLI-2406", name: "Lúcia Almeida",   initials: "LA", avatarColor: "#f9a47a", email: "lucia.almeida@example.com",   phone: "+55 11 96789-0123", statusId: "active",   categoryId: "licenciado", location: "Recife, PE",         value: 6750,  agentId: "aline",  createdAt: BASE_DATE - 30 * DAY_MS, lastContact: BASE_DATE - 3 * DAY_MS  },
  { id: "CLI-2407", name: "Roberto Souza",   initials: "RS", avatarColor: "#0088cc", email: "roberto.souza@example.com",   phone: "+55 11 97890-1234", statusId: "pending",  categoryId: "royal",      location: "São Paulo, SP",      value: 15200, agentId: "carlos", createdAt: BASE_DATE - 23 * DAY_MS, lastContact: BASE_DATE - 7 * DAY_MS  },
  { id: "CLI-2408", name: "Fernanda Lima",   initials: "FL", avatarColor: "#e1306c", email: "fernanda.lima@example.com",   phone: "+55 11 98901-2345", statusId: "active",   categoryId: "lead",       location: "Rio de Janeiro, RJ", value: 3400,  agentId: "maria",  createdAt: BASE_DATE - 16 * DAY_MS, lastContact: BASE_DATE - 1 * DAY_MS  },
  { id: "CLI-2409", name: "Bruno Rodrigues", initials: "BR", avatarColor: "#70c748", email: "bruno.rodrigues@example.com", phone: "+55 11 99012-3456", statusId: "paused",   categoryId: "licenciado", location: "Belo Horizonte, MG", value: 5600,  agentId: "you",    createdAt: BASE_DATE - 9 * DAY_MS,  lastContact: BASE_DATE - 6 * DAY_MS  },
  { id: "CLI-2410", name: "Camila Ribeiro",  initials: "CR", avatarColor: "#8754ec", email: "camila.ribeiro@example.com",  phone: "+55 11 90123-4567", statusId: "active",   categoryId: "royal",      location: "Porto Alegre, RS",   value: 9800,  agentId: "aline",  createdAt: BASE_DATE - 2 * DAY_MS,  lastContact: BASE_DATE                },
];

/** Sufixos pra gerar variações nos clones (mantém aparência de dataset real) */
const NAME_SUFFIXES = ["", " Jr", " Filho", " Neto", " II"];
const CITY_OVERRIDES = ["Salvador, BA", "Fortaleza, CE", "Manaus, AM", "Brasília, DF", "Vitória, ES"];

/**
 * Dataset estendido — 50 rows.
 * 5 ciclos de ROWS_BASE com IDs sequenciais (CLI-2401 → CLI-2450) e pequenas
 * variações em nome/cidade/valor pra dar a sensação de dataset real.
 */
export const ROWS_MOCK: TabelaRow[] = Array.from({ length: 50 }, (_, i) => {
  const base = ROWS_BASE[i % ROWS_BASE.length];
  const cycle = Math.floor(i / ROWS_BASE.length); // 0..4
  const seq = 2401 + i;
  const nameSuffix = NAME_SUFFIXES[cycle];
  return {
    ...base,
    id: `CLI-${seq}`,
    name: `${base.name}${nameSuffix}`,
    location: cycle === 0 ? base.location : CITY_OVERRIDES[cycle - 1] ?? base.location,
    value: base.value + cycle * 175,
    createdAt: base.createdAt - cycle * 7 * DAY_MS,
    lastContact: base.lastContact - cycle * 3 * DAY_MS,
  };
});

/* ── Formatters ─────────────────────────────────────────────────────── */

export function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export function formatDateShort(value: number) {
  if (!value) return "—";
  const d = new Date(value);
  const day = d.getDate().toString().padStart(2, "0");
  return `${day} de ${MONTHS_SHORT[d.getMonth()]}`;
}
