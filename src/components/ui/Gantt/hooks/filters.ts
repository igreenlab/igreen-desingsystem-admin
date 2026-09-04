import { differenceInCalendarDays, startOfDay } from "date-fns";
import type {
  GanttFilterField,
  GanttFilterKind,
  GanttFilterModel,
  GanttRow,
} from "../gantt.types";

/**
 * Núcleo puro do filtro — sem React, sem DOM.
 *
 * ## Por que este arquivo existe
 *
 * Até aqui o `Gantt` aceitava **um único tipo de filtro**: multi-seleção de
 * `options` pré-declaradas. Filtro de texto, de faixa numérica, de período ou
 * booleano eram impossíveis — não por bug, por ausência de contrato. A
 * `DataTable` aceita `text` / `number` / `select` (+ `filterType` pra date e
 * currency) com operador por campo; o Gantt aceitava 1 de 6.
 *
 * ## A decisão que evitou breaking change: o modelo NÃO mudou
 *
 * `GanttFilterModel` continua `Record<string, string[]>`. Todos os 6 tipos
 * codificam o valor em `string[]`:
 *
 *   multi     ["design", "produto"]     → os valores marcados
 *   single    ["design"]                → um só (a UI é radio)
 *   text      ["mapa de"]               → o termo
 *   number    ["3", "10"]               → [min, max], "" = sem limite
 *   date      ["2026-09-01", ""]        → [de, até], "" = sem limite
 *   boolean   ["true"]                  → o valor
 *
 * `string[]` já era um carregador genérico o suficiente; o que faltava não era
 * a forma do dado — era **como interpretá-lo** e **que input renderizar**. Por
 * isso `appliedCount`, o "Limpar tudo", a serialização do consumidor e o
 * `filterModel` controlado seguem funcionando sem uma linha de migração.
 *
 * ⚠️ A convenção de "vazio = SEM filtro" (não "esconde tudo") vale pros 6, e é
 * a mesma do `filterModel` do resto do DS. Um tipo que resolvesse isso
 * diferente faria o mesmo modelo significar coisas opostas em telas diferentes.
 */

/* ─────────────────────────────────────────────── normalização ── */

/**
 * Compara texto ignorando caixa **e acento**.
 *
 * ⚠️ O acento não é preciosismo: em pt-BR, "Fábio", "Sustentação" e "Aquisição"
 * são nomes reais no dado, e um usuário que digita "fabio" espera achar. Sem a
 * decomposição NFD, `includes` falha e o filtro parece quebrado.
 */
export function normalizarTexto(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/** O valor do acessor, achatado numa lista de strings comparáveis. */
function comoLista(v: unknown): string[] {
  if (v === undefined || v === null) return [];
  if (Array.isArray(v)) return v.map((x) => String(x));
  if (v instanceof Date) return [v.toISOString()];
  return [String(v)];
}

/** O valor do acessor como número, ou `null` se não der. */
function comoNumero(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    // `Number("")` é 0, e "" tem que ser AUSÊNCIA e não zero — daí o guarda.
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * `YYYY-MM-DD` — o formato que `<input type="date">` emite.
 *
 * ⚠️ **NÃO use `new Date("2026-09-30")` pra isto.** A spec manda parsear
 * ISO date-only como **UTC**, e em qualquer fuso negativo isso volta um dia:
 * medido aqui (UTC−3), `new Date("2026-09-30")` é **29/09 21:00 local**.
 *
 * O efeito era um filtro de período deslocado em 1 dia, sempre, sem erro
 * nenhum — e invisível em UTC ou em fuso positivo, onde o teste passaria. Foi
 * o teste desta borda que achou; é a L-045 (defeito que só aparece na borda)
 * cruzada com fuso.
 *
 * Timestamp COM hora (`2026-09-30T14:00:00-03:00`) já traz o fuso e vai pelo
 * caminho nativo.
 */
const SO_DIA = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDiaISO(s: string): Date | null {
  const m = SO_DIA.exec(s.trim());
  if (m) {
    // Construtor de 3 argumentos = meia-noite LOCAL, que é o que o usuário
    // quis dizer ao escolher um dia num seletor de data.
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : startOfDay(d);
}

/** O valor do acessor como data (dia), ou `null`. */
function comoData(v: unknown): Date | null {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : startOfDay(v);
  if (typeof v === "string" && v.trim() !== "") return parseDiaISO(v);
  return null;
}

/* ─────────────────────────────────────────────────── operador ── */

/**
 * Operador exibido no chip, por tipo — o vocabulário é o do `AppliedFilterOp`
 * da `DataTable`, pra o usuário ler a mesma frase nas duas telas.
 *
 * `number` e `date` variam com QUAIS limites estão preenchidos: "entre 3 e 10",
 * "≥ 3", "até 10". Um operador fixo mentiria em 2 dos 3 casos.
 */
export function operadorDoCampo(
  kind: GanttFilterKind,
  values: readonly string[],
): string {
  const [a = "", b = ""] = values;
  const temA = a.trim() !== "";
  const temB = b.trim() !== "";

  switch (kind) {
    case "text":
      return "contém";
    case "number":
      if (temA && temB) return "entre";
      if (temA) return "≥";
      return "≤";
    case "date":
      if (temA && temB) return "entre";
      if (temA) return "a partir de";
      return "até";
    case "multi":
    case "single":
    case "boolean":
    default:
      return "é";
  }
}

/* ──────────────────────────────────────────────────── vazio? ── */

/**
 * O campo está SEM filtro?
 *
 * ⚠️ Não é `values.length === 0`. Em `number` e `date` o modelo guarda um par,
 * e `["", ""]` tem length 2 com zero intenção de filtrar. Tratar isso como
 * filtro ativo esconderia todas as linhas cujo acessor não é numérico — um
 * "sumiu tudo" sem nada marcado na tela.
 */
export function campoVazio(
  kind: GanttFilterKind,
  values: readonly string[] | undefined,
): boolean {
  if (!values || values.length === 0) return true;
  if (kind === "number" || kind === "date" || kind === "text") {
    return values.every((v) => v.trim() === "");
  }
  return false;
}

/* ───────────────────────────────────────────────── predicado ── */

/**
 * A linha passa neste campo?
 *
 * ⚠️ Linha cujo acessor devolve `undefined` é **excluída** quando o filtro está
 * ativo — não incluída "por falta de informação". Filtrar por "Responsável =
 * Ana" e receber as linhas sem responsável nenhum é o oposto do pedido.
 */
export function linhaPassaNoCampo(
  campo: GanttFilterField,
  values: readonly string[] | undefined,
  row: GanttRow,
): boolean {
  const kind = campo.kind ?? "multi";
  if (campoVazio(kind, values)) return true;

  const vs = values ?? [];
  const bruto = campo.accessor(row);

  switch (kind) {
    case "multi":
    case "single": {
      const lista = comoLista(bruto);
      if (lista.length === 0) return false;
      return lista.some((x) => vs.includes(x));
    }

    case "boolean": {
      const lista = comoLista(bruto);
      if (lista.length === 0) return false;
      // Normaliza "1"/"0" e "sim"/"não" pro par booleano — o dado do
      // consumidor raramente vem como a string "true".
      const normal = lista.map((x) => {
        const n = normalizarTexto(x);
        if (n === "1" || n === "sim" || n === "true" || n === "yes") return "true";
        if (n === "0" || n === "nao" || n === "false" || n === "no") return "false";
        return n;
      });
      return normal.some((x) => vs.includes(x));
    }

    case "text": {
      const termo = normalizarTexto(vs[0] ?? "");
      if (termo === "") return true;
      const lista = comoLista(bruto);
      if (lista.length === 0) return false;
      return lista.some((x) => normalizarTexto(x).includes(termo));
    }

    case "number": {
      const n = comoNumero(bruto);
      if (n === null) return false;
      const min = comoNumero(vs[0]);
      const max = comoNumero(vs[1]);
      if (min !== null && n < min) return false;
      if (max !== null && n > max) return false;
      return true;
    }

    case "date": {
      const d = comoData(bruto);
      if (d === null) return false;
      const de = comoData(vs[0]);
      const ate = comoData(vs[1]);
      // `differenceInCalendarDays` e não comparação de timestamp: com horário
      // no dado, `d <= ate` recusaria o próprio dia do limite superior. É a
      // mesma razão do resto do componente (DST + resto de tempo).
      if (de !== null && differenceInCalendarDays(d, de) < 0) return false;
      if (ate !== null && differenceInCalendarDays(d, ate) > 0) return false;
      return true;
    }

    default:
      return true;
  }
}

/** Aplica todos os campos. Ordem não importa — é conjunção. */
export function aplicarFiltros(
  rows: readonly GanttRow[],
  fields: readonly GanttFilterField[] | undefined,
  model: GanttFilterModel,
): GanttRow[] {
  if (!fields || fields.length === 0) return [...rows];
  let saida = [...rows];
  for (const campo of fields) {
    const values = model[campo.id];
    if (campoVazio(campo.kind ?? "multi", values)) continue;
    saida = saida.filter((r) => linhaPassaNoCampo(campo, values, r));
  }
  return saida;
}

/** Quantos campos estão de fato filtrando — o número do badge e do painel. */
export function contarAplicados(
  fields: readonly GanttFilterField[] | undefined,
  model: GanttFilterModel,
): number {
  if (!fields) return 0;
  return fields.filter(
    (c) => !campoVazio(c.kind ?? "multi", model[c.id]),
  ).length;
}

/* ────────────────────────────────────────── texto pro chip ── */

/**
 * O que o chip mostra depois do operador.
 *
 * Devolve LISTA porque `multi` rende uma pílula por valor (é o formato da
 * tabela). Os outros tipos rendem uma só.
 */
export function valoresDoChip(
  campo: GanttFilterField,
  values: readonly string[] | undefined,
  formatarData?: (iso: string) => string,
): string[] {
  const kind = campo.kind ?? "multi";
  const vs = values ?? [];
  const dia = (iso: string) =>
    formatarData ? formatarData(iso) : iso;

  switch (kind) {
    case "multi":
    case "single":
      return (campo.options ?? [])
        .filter((o) => vs.includes(o.value))
        .map((o) => o.label);

    case "boolean": {
      const achou = (campo.options ?? []).find((o) => vs.includes(o.value));
      // Sem `options`, cai no par universal — o consumidor não precisa
      // declarar duas opções pra um campo que só tem dois estados.
      return [achou?.label ?? (vs[0] === "true" ? "Sim" : "Não")];
    }

    case "text":
      return vs[0] ? [vs[0]] : [];

    case "number": {
      const [a = "", b = ""] = vs;
      if (a.trim() && b.trim()) return [`${a} e ${b}`];
      return [a.trim() || b.trim()];
    }

    case "date": {
      const [a = "", b = ""] = vs;
      if (a.trim() && b.trim()) return [`${dia(a)} e ${dia(b)}`];
      return [a.trim() ? dia(a) : dia(b)];
    }

    default:
      return [];
  }
}
