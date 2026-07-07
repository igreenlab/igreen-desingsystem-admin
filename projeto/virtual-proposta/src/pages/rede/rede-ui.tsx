import { Chip } from "@/components/ui/Chip";
import { gradColor, type Graduacao, type RedeConsultor } from "./rede-mock";

export function GradChip({ graduacao }: { graduacao: Graduacao }) {
  return (
    <Chip color={gradColor[graduacao]} variant="soft" size="sm" shape="pill">
      {graduacao}
    </Chip>
  );
}

export function TipoChip({ tipo }: { tipo: RedeConsultor["tipo"] }) {
  return (
    <Chip
      color={tipo === "Direto" ? "primary" : "info"}
      variant="soft"
      size="sm"
      shape="pill"
    >
      {tipo}
    </Chip>
  );
}

export function initialsOf(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/* Cor do avatar por nível — hues distintos (separação clara por profundidade).
   O Avatar (colorHex) calcula o contraste do texto automaticamente (L-027). */
const LEVEL_RAMP = ["#16a34a", "#2563eb", "#db2777", "#d97706", "#7c3aed", "#0891b2"];
export function avatarColorForLevel(nivel: number): string {
  const i = Math.max(0, Math.min(nivel - 1, LEVEL_RAMP.length - 1));
  return LEVEL_RAMP[i];
}
