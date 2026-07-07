import { Chip } from "@/components/ui/Chip";
import type {
  ClienteStatus,
  StatusContrato,
  StatusFinanceiro,
} from "./mapa-clientes-mock";

type ChipColor = "success" | "warning" | "info" | "danger" | "neutral" | "primary";

const STATUS: Record<ClienteStatus, ChipColor> = {
  Ativo: "success",
  Pendente: "warning",
  "Em análise": "info",
  Cancelado: "neutral",
};
const CONTRATO: Record<StatusContrato, ChipColor> = {
  Assinado: "success",
  Pendente: "warning",
  "Não enviado": "neutral",
};
const FINANCEIRO: Record<StatusFinanceiro, ChipColor> = {
  "Em dia": "success",
  Inadimplente: "danger",
  "—": "neutral",
};

export function StatusChip({ status }: { status: ClienteStatus }) {
  return (
    <Chip color={STATUS[status]} variant="soft" size="sm" shape="pill">
      {status}
    </Chip>
  );
}
export function ContratoChip({ status }: { status: StatusContrato }) {
  return (
    <Chip color={CONTRATO[status]} variant="soft" size="sm" shape="pill">
      {status}
    </Chip>
  );
}
export function FinanceiroChip({ status }: { status: StatusFinanceiro }) {
  if (status === "—") return <span className="text-fg-subtle">—</span>;
  return (
    <Chip color={FINANCEIRO[status]} variant="soft" size="sm" shape="pill">
      {status}
    </Chip>
  );
}

export function initialsOf(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
