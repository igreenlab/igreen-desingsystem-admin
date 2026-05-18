import {
  Inbox,
  Contact,
  Megaphone,
  Brain,
  Settings as SettingsIcon,
  LayoutGrid,
  Target,
  Trophy,
  Tag,
  Reply,
  Star,
  GraduationCap,
  Activity,
  AlertCircle,
  Plug,
  ListOrdered,
  Network,
  Users,
  Ticket,
  Plus,
  Settings,
  UserCheck,
  AlertTriangle,
  Sparkles,
  CreditCard,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Maximize2,
  LayoutPanelLeft,
} from "lucide-react";
import type { SidebarContext } from "../../components/ui/MenuSidebar";
import type {
  HeaderCommandGroup,
  HeaderMessage,
  HeaderNotification,
  HeaderThemeOption,
} from "../../components/ui/Header";
import type {
  AppShellUser,
  AppShellLayoutOption,
} from "../../components/ui/AppShell";

/**
 * Mocks compartilhados pelo AppShellDoc + pages de showcase que precisam de uma
 * "casca de app realista". Em produção, esses dados viriam do backend/contexto da
 * app — aqui são estáticos pra demonstração consistente.
 */

export const APP_SHELL_CONTEXTS: SidebarContext[] = [
  {
    id: "inbox",
    label: "Inbox / Operação",
    icon: Inbox,
    items: [
      { name: "Atendimentos", icon: Inbox, href: "#atendimentos", badge: "8", badgeKind: "counter" },
      { name: "Chat Interno", icon: ListOrdered, href: "#chat-interno", badge: "2" },
      { name: "Agendamentos", icon: LayoutGrid, href: "#agendamentos", badge: "8" },
      {
        name: "Escalation",
        icon: AlertCircle,
        subitems: [
          { name: "Dashboard", href: "#esc-dash" },
          { name: "Departamentos", href: "#esc-deps" },
          { name: "Regras", href: "#esc-rules" },
        ],
      },
    ],
    sections: [
      {
        id: "filtros-rapidos",
        label: "Filtros rápidos",
        variant: "bookmark",
        items: [
          { color: "#1cb280", name: "Royais — In progress" },
          { color: "#f6b51e", name: "Licenciados — Waiting" },
          { color: "#8754ec", name: "IA — handover pendente" },
          { color: "#ef4444", name: "SLA crítico (> 30min)" },
        ],
      },
      {
        id: "mensagens-rapidas",
        label: "Mensagens rápidas",
        variant: "chat",
        items: [
          { name: "Aline Castro", initials: "AC", color: "#f59e0b", status: "online" },
          { name: "Carlos Souza", initials: "CS", color: "#8754ec", status: "online" },
          { name: "Maria Lima", initials: "ML", color: "#ef4444", status: "offline" },
          { name: "João Pedro", initials: "JP", color: "#1cb280", status: "online" },
          { name: "Beatriz Almeida", initials: "BA", color: "#0088cc", status: "online" },
        ],
      },
    ],
  },
  {
    id: "crm",
    label: "CRM",
    icon: Contact,
    items: [
      { name: "Contatos", icon: Contact, href: "#contatos", badge: "2.1k" },
      { name: "Segmentos", icon: Target, href: "#segmentos" },
      { name: "Tiers", icon: Trophy, href: "#tiers" },
      { name: "Tags", icon: Tag, href: "#tags" },
      { name: "Respostas Rápidas", icon: Reply, href: "#respostas" },
    ],
    sections: [
      {
        id: "listas-salvas",
        label: "Listas salvas",
        variant: "bookmark",
        items: [
          { color: "#0088cc", name: "Top 100 ativos" },
          { color: "#f59e0b", name: "Sem cadastro completo" },
          { color: "#1cb280", name: "Convertidos último mês" },
        ],
      },
    ],
  },
  {
    id: "engajamento",
    label: "Engajamento",
    icon: Megaphone,
    items: [
      { name: "Campanhas", icon: Megaphone, href: "#campanhas", badge: "6" },
      { name: "Pesquisa Satisfação", icon: Star, href: "#csat", badge: "CSAT", badgeKind: "success" },
      { name: "Capacitações", icon: GraduationCap, href: "#capacitacoes" },
      {
        name: "Green Points",
        icon: Trophy,
        subitems: [
          { name: "My Points", href: "#gp-my" },
          { name: "Management", href: "#gp-mgmt" },
          { name: "Periods", href: "#gp-periods" },
          { name: "Configuration", href: "#gp-config" },
        ],
      },
    ],
  },
  {
    id: "ia",
    label: "IA — Agente Sol",
    icon: Brain,
    items: [
      { name: "Sol Traces", icon: Activity, href: "#sol-traces", badge: "94 pgs" },
      { name: "Central de Alertas", icon: AlertCircle, href: "#alertas", badge: "1085", badgeKind: "counter" },
      {
        name: "AI Rules",
        icon: Brain,
        subitems: [
          { name: "Provenance", href: "#ai-prov" },
          { name: "Embeddings Health", href: "#ai-emb" },
          { name: "Few-shots Candidates", href: "#ai-fs" },
        ],
      },
    ],
  },
  {
    id: "config",
    label: "Configuração",
    icon: SettingsIcon,
    items: [
      { name: "Conexões", icon: Plug, href: "#conexoes", badge: "2" },
      { name: "Filas & Chatbot", icon: ListOrdered, href: "#filas-cb", badge: "8" },
      { name: "Regras de Fila", icon: Network, href: "#regras-fila" },
      { name: "Channels", icon: LayoutGrid, href: "#channels", badge: "2" },
    ],
  },
];

export const APP_SHELL_COMMANDS: HeaderCommandGroup[] = [
  {
    heading: "Navegação rápida",
    items: [
      { label: "Clientes", icon: Users, onSelect: () => alert("→ Clientes") },
      { label: "Tickets", icon: Ticket, onSelect: () => alert("→ Tickets") },
      { label: "Configurações", icon: Settings, shortcut: "⌘,", onSelect: () => alert("→ Settings") },
    ],
  },
  {
    heading: "Ações",
    items: [
      { label: "Novo cliente", icon: Plus, shortcut: "⌘N", onSelect: () => alert("Novo cliente") },
      { label: "Sair", icon: LogOut, shortcut: "⌘Q", destructive: true, onSelect: () => alert("Sair") },
    ],
  },
];

export const APP_SHELL_NOTIFICATIONS: HeaderNotification[] = [
  {
    id: "n1",
    icon: UserCheck,
    color: "#10B881",
    title: "Aline Castro mencionou você",
    body: 'em "Royais — In progress" comentou: "@você pode revisar?"',
    time: "2 min",
    unread: true,
    kind: "mention",
  },
  {
    id: "n2",
    icon: AlertTriangle,
    color: "#f59e0b",
    title: "SLA em risco",
    body: "Ticket #20260504-00031 sem resposta há 28 minutos",
    time: "15 min",
    unread: true,
    kind: "alert",
  },
  {
    id: "n3",
    icon: Sparkles,
    color: "#8754ec",
    title: "Sol Traces atualizado",
    body: "Nova versão com 12 melhorias na qualidade das respostas",
    time: "1 h",
    unread: true,
    kind: "system",
  },
  {
    id: "n4",
    icon: CreditCard,
    color: "#0FC589",
    title: "Fatura paga",
    body: "Pagamento de R$ 4.250,00 confirmado.",
    time: "3 h",
    kind: "billing",
  },
];

export const APP_SHELL_MESSAGES: HeaderMessage[] = [
  { id: "m1", name: "Aline Castro", initials: "AC", color: "#f59e0b", preview: "Olá! Você pode revisar o ticket #1234?", time: "2 min", unread: true },
  { id: "m2", name: "Equipe Suporte", initials: "ES", color: "#0088cc", preview: "Bruno: pessoal, alguém disponível pra cobrir...", time: "12 min", unread: true, group: true },
  { id: "m3", name: "Carlos Souza", initials: "CS", color: "#8754ec", preview: "Boa tarde! Aquele cliente confirmou.", time: "1 h" },
  { id: "m4", name: "Maria Lima", initials: "ML", color: "#ef4444", preview: "Reunião remarcada pra amanhã 10h.", time: "ontem" },
];

export const APP_SHELL_THEME_OPTIONS: HeaderThemeOption[] = [
  { id: "system", label: "Sistema", icon: Monitor },
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Escuro", icon: Moon },
];

/* ── User menu (avatar do rail) ───────────────────────────────────── */

export const APP_SHELL_USER: AppShellUser = {
  name: "Sergio Vieira",
  email: "sergio.vieira@igreenenergy.com.br",
  initials: "SV",
};

export const APP_SHELL_LAYOUT_OPTIONS: AppShellLayoutOption[] = [
  { id: "fluid", label: "Fluido", icon: Maximize2 },
  { id: "compact", label: "Compacto", icon: LayoutPanelLeft },
];
