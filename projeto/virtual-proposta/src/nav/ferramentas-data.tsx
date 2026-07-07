import {
  ListChecks,
  Contact,
  Smartphone,
  Zap,
  MessageCircle,
  Calculator,
  FileText,
  Target,
  GraduationCap,
  LifeBuoy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Catálogo de ferramentas do Virtual Proposta.
 *
 * Conceito: existem "N" ferramentas — cada líder ativa só as que fazem sentido
 * pra ele. As ativadas viram atalhos (variante `bookmark`) na seção "Ferramentas"
 * do sidebar; o catálogo completo (ativar/desativar) abre num modal estilo plugin.
 *
 * Tudo mockado: os `href` caem no placeholder "em construção" do AppShell.
 */
export type ToolDef = {
  id: string;
  name: string;
  description: string;
  href: string;
  /** Cor do dot do atalho no sidebar + caixa de ícone no catálogo. */
  color: string;
  icon: LucideIcon;
  /** Já vem ativada por padrão? */
  defaultEnabled: boolean;
  /** Chip opcional no card do catálogo (ex.: "Popular"). */
  tag?: string;
};

export const FERRAMENTAS_CATALOG: ToolDef[] = [
  {
    id: "rotinas",
    name: "Rotinas de CEO",
    description: "Checklist diário de gestão da rede e acompanhamento de metas.",
    href: "#/geral/rotinas",
    color: "#1cb280",
    icon: ListChecks,
    defaultEnabled: true,
    tag: "Popular",
  },
  {
    id: "crm",
    name: "CRM",
    description: "Pipeline de contatos, follow-ups e oportunidades da sua rede.",
    href: "#/geral/crm",
    color: "#0088cc",
    icon: Contact,
    defaultEnabled: true,
  },
  {
    id: "igreen-digital",
    name: "iGreen Digital",
    description: "Sua presença digital — link de captação e materiais de marca.",
    href: "#/geral/igreen-digital",
    color: "#16a34a",
    icon: Smartphone,
    defaultEnabled: true,
  },
  {
    id: "conexao-express",
    name: "Conexão Express",
    description: "Ativação rápida de clientes com fluxo simplificado.",
    href: "#/geral/conexao-express",
    color: "#f6b51e",
    icon: Zap,
    defaultEnabled: true,
  },
  {
    id: "disparo-whatsapp",
    name: "Disparo WhatsApp",
    description: "Mensagens em massa segmentadas para sua base de licenciados.",
    href: "#/geral/disparo-whatsapp",
    color: "#22c55e",
    icon: MessageCircle,
    defaultEnabled: false,
    tag: "Novo",
  },
  {
    id: "simulador",
    name: "Simulador de Economia",
    description: "Estime a economia do cliente na conta de energia em segundos.",
    href: "#/geral/simulador",
    color: "#8754ec",
    icon: Calculator,
    defaultEnabled: false,
  },
  {
    id: "gerador-proposta",
    name: "Gerador de Proposta",
    description: "Monte propostas comerciais personalizadas e prontas pra enviar.",
    href: "#/geral/gerador-proposta",
    color: "#ef4444",
    icon: FileText,
    defaultEnabled: false,
  },
  {
    id: "metas",
    name: "Metas & Campanhas",
    description: "Acompanhe campanhas vigentes e o progresso das metas da rede.",
    href: "#/geral/metas",
    color: "#f59e0b",
    icon: Target,
    defaultEnabled: false,
  },
  {
    id: "treinamentos",
    name: "Treinamentos",
    description: "Trilhas de capacitação para você e sua equipe evoluírem.",
    href: "#/geral/treinamentos",
    color: "#06b6d4",
    icon: GraduationCap,
    defaultEnabled: false,
  },
  {
    id: "suporte",
    name: "Suporte",
    description: "Abra chamados e fale com o time de apoio ao licenciado.",
    href: "#/geral/suporte",
    color: "#ec4899",
    icon: LifeBuoy,
    defaultEnabled: false,
  },
];

export const DEFAULT_ENABLED_TOOLS = FERRAMENTAS_CATALOG.filter(
  (t) => t.defaultEnabled,
).map((t) => t.id);
