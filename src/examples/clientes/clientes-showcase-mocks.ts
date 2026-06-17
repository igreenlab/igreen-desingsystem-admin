import {
  CLIENTS_MOCK,
  STATUSES,
  CATEGORIES,
  AGENTS,
  type ClientRow,
} from "./_table-data";

/* ── Dataset 87 clientes (bate com badge do print) ─────────────── */

export const CLIENTS_87: ClientRow[] = Array.from({ length: 9 }, (_, batch) =>
  CLIENTS_MOCK.map((row, i) => ({
    ...row,
    id: `CLI-${2400 + batch * 10 + i}`,
  })),
)
  .flat()
  .slice(0, 87);

/* ── Lookups por categoria de status (column color mapping) ────── */

export const STATUS_COLOR_MAP: Record<string, string> = {
  active: "success",
  pending: "warning",
  paused: "info",
  inactive: "neutral",
};

export const STATUS_DOT: Record<string, string> = {
  active: "var(--color-fg-success)",
  pending: "var(--color-fg-warning)",
  paused: "var(--color-fg-info)",
  inactive: "var(--color-fg-muted)",
};

export const CATEGORY_KIND: Record<string, "warning" | "info" | "success"> = {
  royal: "warning",
  licenciado: "info",
  lead: "success",
};

/* ── Options pra filters/selects ───────────────────────────────── */

export const STATUS_OPTIONS = Object.entries(STATUSES).map(([v, m]) => ({
  value: v,
  label: m.label,
  color: STATUS_COLOR_MAP[v] ?? "neutral",
}));

export const CATEGORY_OPTIONS = Object.entries(CATEGORIES).map(([v, m]) => ({
  value: v,
  label: m.label,
  color: m.kind === "neutral" ? "neutral" : m.kind,
}));

export const AGENT_OPTIONS = Object.entries(AGENTS).map(([v, a]) => ({
  value: v,
  label: a.name,
}));

/* ── Avatar lookup pro column type "user" ──────────────────────── */

export const AGENTS_LOOKUP = Object.fromEntries(
  Object.entries(AGENTS).map(([id, a]) => [
    id,
    {
      name: a.name,
      initials: a.name
        .split(" ")
        .map((s) => s[0])
        .join("")
        .slice(0, 2),
      color: a.color,
    },
  ]),
);

/* ── Kanban columns (1 por status) ─────────────────────────────── */

export const KANBAN_COLUMNS = Object.entries(STATUSES).map(([id, s]) => ({
  id,
  label: s.label,
  dotColor: STATUS_DOT[id] ?? "var(--color-fg-muted)",
}));

/* ── Cidades pro select do drawer ──────────────────────────────── */

export const CITIES = [
  "São Paulo, SP",
  "Rio de Janeiro, RJ",
  "Belo Horizonte, MG",
  "Porto Alegre, RS",
  "Curitiba, PR",
  "Recife, PE",
  "Salvador, BA",
  "Fortaleza, CE",
  "Brasília, DF",
  "Manaus, AM",
];

/* ── Helpers de formatação ─────────────────────────────────────── */

export function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function formatShortDate(ms: number) {
  if (!ms) return "—";
  const d = new Date(ms);
  const day = d.getDate().toString().padStart(2, "0");
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${day} ${months[d.getMonth()]}`;
}
