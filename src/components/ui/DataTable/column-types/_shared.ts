/**
 * Helpers compartilhados entre column-type definitions.
 *
 * Consolida lógica que estava duplicada literalmente entre definitions:
 *  - `toNumber`   — era 3× (number/currency/percentage), com divergência sutil
 *                   (number usava `Number.isFinite`, currency/percentage
 *                   `!Number.isNaN` → aceitava `Infinity`). Unificado em
 *                   `Number.isFinite` (rejeita NaN E Infinity — correto pra
 *                   valores de célula/filtro).
 *  - date helpers — `toDateMs/dayStart/toDate/toIsoDate` eram idênticos em
 *                   date + datetime.
 *  - chip color   — `ChipColor/CHIP_COLORS/resolveChipColor` eram idênticos em
 *                   badge + tags.
 *  - lookups      — `findOption`, `toStringArray`.
 */
import type { ColumnOption } from "./column-types.types";

/* ── Number ──────────────────────────────────────────────────────── */

/** Coage pra número finito ou `null` (rejeita NaN, Infinity e não-numéricos). */
export function toNumber(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/* ── Date ────────────────────────────────────────────────────────── */

/** Coage qualquer valor (number ms / Date / string) em epoch ms, ou `null`. */
export function toDateMs(v: unknown): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

/** Zera a hora (00:00:00.000) — pra comparar só a data, ignorando horário. */
export function dayStart(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Converte qualquer valor em `Date` (pro Calendar) ou `undefined`. */
export function toDate(v: unknown): Date | undefined {
  const ms = toDateMs(v);
  return ms == null ? undefined : new Date(ms);
}

/** Serializa `Date` pra ISO date estável ("YYYY-MM-DD", sem hora) ou `null`. */
export function toIsoDate(d: Date | undefined | null): string | null {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ── Chip color ──────────────────────────────────────────────────── */

/** Cores de Chip suportadas pelos tipos badge/tags. */
export type ChipColor =
  | "primary"
  | "neutral"
  | "danger"
  | "warning"
  | "success"
  | "info";

export const CHIP_COLORS: ReadonlyArray<ChipColor> = [
  "primary",
  "neutral",
  "danger",
  "warning",
  "success",
  "info",
];

/**
 * Resolve `option.color` → variant de Chip. Aceita preset names diretos OU
 * aliases comuns (green/red/yellow/blue/gray); cai em `neutral` por padrão.
 */
export function resolveChipColor(raw: string | undefined): ChipColor {
  if (!raw) return "neutral";
  if (CHIP_COLORS.includes(raw as ChipColor)) return raw as ChipColor;
  const aliases: Record<string, ChipColor> = {
    green: "success",
    red: "danger",
    yellow: "warning",
    blue: "info",
    gray: "neutral",
    grey: "neutral",
  };
  return aliases[raw.toLowerCase()] ?? "neutral";
}

/* ── Lookups ─────────────────────────────────────────────────────── */

/** Acha a `ColumnOption` cujo `value` casa (comparação por string). */
export function findOption(
  value: unknown,
  options?: ColumnOption[],
): ColumnOption | null {
  if (value == null) return null;
  return options?.find((o) => String(o.value) === String(value)) ?? null;
}

/** Normaliza escalar OU array em array de strings. */
export function toStringArray(v: unknown): string[] {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(String);
  return [String(v)];
}
