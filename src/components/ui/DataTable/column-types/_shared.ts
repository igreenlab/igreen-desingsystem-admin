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
import type { ReactNode } from "react";
import type { ColumnOption } from "./column-types.types";

/* ── Number ──────────────────────────────────────────────────────── */

/** Coage pra número finito ou `null` (rejeita NaN, Infinity e não-numéricos). */
export function toNumber(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/* ── Afixo de unidade (prefix/suffix) ────────────────────────────── */

/**
 * `typeOptions.prefix` / `typeOptions.suffix` dos tipos numéricos — a unidade
 * ("kWh", "%", "/mês") ou um prefixo curto. Item 9a do Sólis.
 */
export type AffixOptions = { prefix?: string; suffix?: string };

/**
 * Gruda prefixo e sufixo num texto JÁ formatado pelo tipo.
 *
 * Duas regras, as duas deliberadas:
 *
 *  - **Texto vazio sai vazio.** Célula sem número não pode virar "kWh" sozinho —
 *    unidade sem grandeza é pior que a célula em branco, porque parece dado.
 *  - **A string entra LITERAL, sem espaço automático.** `" kWh"` dá "1.234 kWh" e
 *    `"%"` dá "1.234%". Injetar um espaço acertaria um caso e erraria o outro, e
 *    quem quisesse colado não teria como desligar.
 */
export function applyAffix(texto: string, opts?: AffixOptions): string {
  if (texto === "") return "";
  return `${opts?.prefix ?? ""}${texto}${opts?.suffix ?? ""}`;
}

/** Lê `prefix`/`suffix` de um `typeOptions` solto (`Record<string, unknown>`). */
export function readAffix(typeOptions?: Record<string, unknown>): AffixOptions | undefined {
  if (!typeOptions) return undefined;
  const prefix = typeof typeOptions.prefix === "string" ? typeOptions.prefix : undefined;
  const suffix = typeof typeOptions.suffix === "string" ? typeOptions.suffix : undefined;
  return prefix || suffix ? { prefix, suffix } : undefined;
}

/* ── Contagem ("3 selecionados") ─────────────────────────────────── */

/**
 * Rótulo de contagem do contexto de filtro — "3 selecionados" — com escape hatch
 * por coluna em `typeOptions.countLabel`. Item 27 do Sólis.
 *
 * **Por que existe.** O texto era literal, em português e **com gênero fixo**. Isso não é
 * personalização e sim defeito de i18n: qualquer coluna de substantivo feminino já nasce
 * errada ("3 usinas selecionadas"), e não havia porta pra corrigir — nem traduzindo, nem
 * concordando o gênero.
 *
 * **A forma é a do `selectionConfig.countLabel`** da barra de seleção de linhas
 * (`TableToolbar/parts/bulk-actions-bar.tsx`), que resolve o MESMO problema no MESMO
 * componente: recebe a contagem e devolve o rótulo INTEIRO — não um sufixo e não um par
 * singular/plural, porque idioma nenhum garante que o número fique na frente. Dois
 * desenhos diferentes pro mesmo problema seria a armadilha maior.
 *
 * **A rota é `column.typeOptions`** — a bag POR COLUNA que o item 9a já usa pra levar
 * `prefix`/`suffix` até o campo e o chip — e não uma prop do `DataTable`: o substantivo é
 * da coluna, não da tabela. Uma tabela com "clientes" e "usinas" precisa dos dois ao
 * mesmo tempo, e uma prop única só saberia dizer um.
 *
 * Lê-se defensivo (`typeof === "function"`) pelo mesmo motivo do `readAffix`:
 * `typeOptions` é `Record<string, unknown>` e chega sem checagem do TS.
 *
 * Default = o texto de hoje, byte por byte. Sem `countLabel`, nada muda.
 */
export function resolveCountLabel(
  count: number,
  typeOptions?: Record<string, unknown>,
): ReactNode {
  const custom = typeOptions?.countLabel;
  if (typeof custom === "function") {
    return (custom as (count: number) => ReactNode)(count);
  }
  return `${count} selecionados`;
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
