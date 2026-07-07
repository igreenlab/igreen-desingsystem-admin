import { Chip } from "@/components/ui/Chip";
import type { Graduacao } from "./mapa-rede-mock";

/* ── graduação → label + cor do chip (compartilhado tabela + lista) ── */
export const GRADUACAO: Record<Graduacao, "success" | "info" | "warning" | "neutral"> = {
  "Executivo Green": "success",
  "Líder Green": "info",
  Consultor: "warning",
  Licenciado: "neutral",
};

export function GradChip({ graduacao }: { graduacao: Graduacao }) {
  return (
    <Chip color={GRADUACAO[graduacao]} variant="soft" size="sm" shape="pill">
      {graduacao}
    </Chip>
  );
}

export function ProChip() {
  return (
    <Chip color="success" variant="soft" size="sm" shape="pill">
      PRO
    </Chip>
  );
}

export function initialsOf(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/* Cor do avatar por nível — hues DISTINTOS (não tons do mesmo verde, que não
   separavam). Cada nível é uma cor categórica; o Avatar (colorHex) calcula o
   contraste do texto automaticamente (L-027). */
const LEVEL_RAMP = ["#16a34a", "#2563eb", "#db2777", "#d97706", "#7c3aed", "#0891b2"];
export function avatarColorForLevel(nivel: number): string {
  return LEVEL_RAMP[Math.min(nivel, LEVEL_RAMP.length - 1)];
}
