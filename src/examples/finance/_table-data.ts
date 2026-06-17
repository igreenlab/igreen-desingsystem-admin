/**
 * Dados base compartilhados (extraídos do showcase TableDoc do DS).
 * Mantém o exemplo autossuficiente — sem dependência da infra de preview.
 */

export const STATUSES: Record<string, { label: string; color: string }> = {
  active: { label: "Ativo", color: "var(--color-fg-success)" },
  pending: { label: "Pendente", color: "var(--color-fg-warning)" },
  paused: { label: "Pausado", color: "var(--color-fg-info)" },
  inactive: { label: "Inativo", color: "var(--color-fg-muted)" },
};

export type CategoryKind = "warning" | "info" | "success" | "neutral";
export const CATEGORIES: Record<string, { label: string; kind: CategoryKind }> = {
  royal: { label: "Royal", kind: "warning" },
  licenciado: { label: "Licenciado", kind: "info" },
  lead: { label: "Lead", kind: "success" },
};

export const AGENTS: Record<string, { name: string; initials: string; color: string }> = {
  you: { name: "Voce", initials: "VC", color: "#0a3a2e" },
  aline: { name: "Aline Castro", initials: "AC", color: "#f59e0b" },
  carlos: { name: "Carlos Souza", initials: "CS", color: "#8754ec" },
  maria: { name: "Maria Lima", initials: "ML", color: "#ef4444" },
};

export type ClientRow = {
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

export const CLIENTS_MOCK: ClientRow[] = [
  { id: "CLI-2401", name: "Maria Silva", initials: "MS", avatarColor: "#f59e0b", email: "maria.silva@example.com", phone: "+55 11 91234-5678", statusId: "active", categoryId: "royal", location: "São Paulo, SP", value: 4800, agentId: "you", createdAt: BASE_DATE - 65 * DAY_MS, lastContact: BASE_DATE - 2 * DAY_MS },
  { id: "CLI-2402", name: "João Santos", initials: "JS", avatarColor: "#0a3a2e", email: "joao.santos@example.com", phone: "+55 11 92345-6789", statusId: "pending", categoryId: "licenciado", location: "Rio de Janeiro, RJ", value: 12300, agentId: "aline", createdAt: BASE_DATE - 58 * DAY_MS, lastContact: BASE_DATE - 5 * DAY_MS },
  { id: "CLI-2403", name: "Carlos Oliveira", initials: "CO", avatarColor: "#8754ec", email: "carlos.oliveira@example.com", phone: "+55 11 93456-7890", statusId: "active", categoryId: "lead", location: "Belo Horizonte, MG", value: 2150, agentId: "carlos", createdAt: BASE_DATE - 51 * DAY_MS, lastContact: BASE_DATE - 1 * DAY_MS },
  { id: "CLI-2404", name: "Ana Costa", initials: "AC", avatarColor: "#1cb280", email: "ana.costa@example.com", phone: "+55 11 94567-8901", statusId: "paused", categoryId: "royal", location: "Porto Alegre, RS", value: 8900, agentId: "maria", createdAt: BASE_DATE - 44 * DAY_MS, lastContact: BASE_DATE - 12 * DAY_MS },
  { id: "CLI-2405", name: "Pedro Pereira", initials: "PP", avatarColor: "#ef4444", email: "pedro.pereira@example.com", phone: "+55 11 95678-9012", statusId: "inactive", categoryId: "lead", location: "Curitiba, PR", value: 1100, agentId: "you", createdAt: BASE_DATE - 37 * DAY_MS, lastContact: BASE_DATE - 30 * DAY_MS },
  { id: "CLI-2406", name: "Lúcia Almeida", initials: "LA", avatarColor: "#f9a47a", email: "lucia.almeida@example.com", phone: "+55 11 96789-0123", statusId: "active", categoryId: "licenciado", location: "Recife, PE", value: 6750, agentId: "aline", createdAt: BASE_DATE - 30 * DAY_MS, lastContact: BASE_DATE - 3 * DAY_MS },
  { id: "CLI-2407", name: "Roberto Souza", initials: "RS", avatarColor: "#0088cc", email: "roberto.souza@example.com", phone: "+55 11 97890-1234", statusId: "pending", categoryId: "royal", location: "São Paulo, SP", value: 15200, agentId: "carlos", createdAt: BASE_DATE - 23 * DAY_MS, lastContact: BASE_DATE - 7 * DAY_MS },
  { id: "CLI-2408", name: "Fernanda Lima", initials: "FL", avatarColor: "#e1306c", email: "fernanda.lima@example.com", phone: "+55 11 98901-2345", statusId: "active", categoryId: "lead", location: "Rio de Janeiro, RJ", value: 3400, agentId: "maria", createdAt: BASE_DATE - 16 * DAY_MS, lastContact: BASE_DATE - 1 * DAY_MS },
  { id: "CLI-2409", name: "Bruno Rodrigues", initials: "BR", avatarColor: "#70c748", email: "bruno.rodrigues@example.com", phone: "+55 11 99012-3456", statusId: "paused", categoryId: "licenciado", location: "Belo Horizonte, MG", value: 5600, agentId: "you", createdAt: BASE_DATE - 9 * DAY_MS, lastContact: BASE_DATE - 6 * DAY_MS },
  { id: "CLI-2410", name: "Camila Ribeiro", initials: "CR", avatarColor: "#8754ec", email: "camila.ribeiro@example.com", phone: "+55 11 90123-4567", statusId: "active", categoryId: "royal", location: "Porto Alegre, RS", value: 9800, agentId: "aline", createdAt: BASE_DATE - 2 * DAY_MS, lastContact: BASE_DATE },
];
