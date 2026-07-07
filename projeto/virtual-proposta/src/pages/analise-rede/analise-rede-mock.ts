// Análise da Rede (Ranking PRO) — espelha GET /v1/analise-pro (AnaliseProRow).
// Tela legada: RankingRedePage. Tudo mockado, client-side.

export type Graduacao =
  | "CONSULTOR SENIOR"
  | "GESTOR GREEN"
  | "EXECUTIVO GREEN"
  | "DIRETOR GREEN"
  | "PRESIDENTE GREEN";

// Ordem ascendente (menor → maior ranking) — paridade com lib/graduacoes.ts.
export const GRADUACOES: Graduacao[] = [
  "CONSULTOR SENIOR",
  "GESTOR GREEN",
  "EXECUTIVO GREEN",
  "DIRETOR GREEN",
  "PRESIDENTE GREEN",
];

export const REGIOES = [
  "SP", "RJ", "MG", "ES", "PR", "SC", "RS", "BA", "PE", "CE",
  "GO", "DF", "MT", "MS", "PA", "AM", "MA", "PB", "RN", "TO",
] as const;

export interface AnaliseProRow {
  idconsultor: number;
  nome: string;
  celular: string;
  nivel: number;
  graduacao: Graduacao;
  regiao: string;
  cnxgreen_telecom: number;
  cnxlivre: number;
  cnxplaca: number;
  cnxclub: number;
  cnxexpansao: number;
  pro: "PRO" | "";
}

const FIRST = [
  "Ana", "Carlos", "Mariana", "Rafael", "Juliana", "Bruno", "Camila", "Felipe",
  "Larissa", "Gustavo", "Patrícia", "André", "Fernanda", "Thiago", "Beatriz",
  "Rodrigo", "Aline", "Marcelo", "Vanessa", "Diego", "Letícia", "Vinícius",
  "Tatiane", "Eduardo", "Sabrina", "Leonardo", "Priscila", "Henrique",
  "Natália", "Gabriel", "Renata", "Lucas",
];
const LAST = [
  "Souza", "Lima", "Ferreira", "Pereira", "Costa", "Alves", "Rodrigues",
  "Santos", "Oliveira", "Nunes", "Gomes", "Martins", "Dias", "Barbosa",
  "Melo", "Carvalho", "Ribeiro", "Teixeira", "Cardoso", "Fernandes",
  "Araújo", "Rocha", "Moreira", "Pinto", "Castro", "Azevedo", "Ramos",
];

// Pool ponderado de UFs (repetições = volume relativo) → contagens variadas.
const UF_WEIGHTS: Array<[string, number]> = [
  ["SP", 11], ["MG", 8], ["RJ", 7], ["PR", 6], ["RS", 5], ["BA", 5],
  ["SC", 4], ["GO", 4], ["PE", 3], ["CE", 3], ["DF", 3], ["ES", 2],
  ["MT", 2], ["PA", 2], ["MS", 2], ["AM", 1], ["MA", 1], ["PB", 1],
  ["RN", 1], ["TO", 1],
];
const UF_POOL: string[] = UF_WEIGHTS.flatMap(([uf, w]) => Array(w).fill(uf));

// Pool ponderado de graduações (Consultor mais comum, Presidente raro).
const GRAD_WEIGHTS: Array<[Graduacao, number]> = [
  ["CONSULTOR SENIOR", 9],
  ["GESTOR GREEN", 7],
  ["EXECUTIVO GREEN", 5],
  ["DIRETOR GREEN", 3],
  ["PRESIDENTE GREEN", 2],
];
const GRAD_POOL: Graduacao[] = GRAD_WEIGHTS.flatMap(([g, w]) => Array(w).fill(g));

const N_LICENCIADOS = 96;

// gerador determinístico (sem random — paridade de build); passos coprimos
// com o tamanho dos pools pra espalhar e produzir contagens diferentes.
export const analisePro: AnaliseProRow[] = Array.from(
  { length: N_LICENCIADOS },
  (_, i) => {
    const nome = `${FIRST[i % FIRST.length]} ${LAST[(i * 7) % LAST.length]}`;
    const isPro = i % 4 !== 0; // ~3/4 são PRO
    const base = (i * 7) % 13;
    return {
      idconsultor: 40000 + i * 137,
      nome,
      celular: `(11) 9${String(8000 + i).padStart(4, "0")}-${String(
        1000 + ((i * 31) % 9000),
      ).padStart(4, "0")}`,
      nivel: 1 + (i % 6),
      graduacao: GRAD_POOL[(i * 11) % GRAD_POOL.length],
      regiao: UF_POOL[(i * 17) % UF_POOL.length],
      cnxgreen_telecom: base + (i % 5),
      cnxlivre: (i * 2) % 9,
      cnxplaca: (i * 3) % 7,
      cnxclub: i % 4,
      cnxexpansao: (i * 5) % 11,
      pro: isPro ? "PRO" : "",
    };
  },
);

export const totalLicenciados = analisePro.length;

export const RANKING_ALL = "ALL";

/** Opções do select de graduação ("retirar inferiores à"). */
export function rankingOptions(): { value: string; label: string }[] {
  return [
    { value: RANKING_ALL, label: "Exibir todas as graduações" },
    ...GRADUACOES.map((g) => ({ value: g, label: g })),
  ];
}

/** Conta por chave, ordenado desc por total. */
export function countBy(
  rows: AnaliseProRow[],
  key: (r: AnaliseProRow) => string,
): { key: string; total: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) map.set(key(r), (map.get(key(r)) ?? 0) + 1);
  return [...map.entries()]
    .map(([k, total]) => ({ key: k, total }))
    .sort((a, b) => b.total - a.total);
}

export function num(v: number): string {
  return v.toLocaleString("pt-BR");
}

// UF → macro-região do IBGE.
export const REGIAO_BY_UF: Record<string, string> = {
  // Norte
  AC: "Norte", AP: "Norte", AM: "Norte", PA: "Norte", RO: "Norte", RR: "Norte", TO: "Norte",
  // Nordeste
  AL: "Nordeste", BA: "Nordeste", CE: "Nordeste", MA: "Nordeste", PB: "Nordeste",
  PE: "Nordeste", PI: "Nordeste", RN: "Nordeste", SE: "Nordeste",
  // Centro-Oeste
  DF: "Centro-Oeste", GO: "Centro-Oeste", MT: "Centro-Oeste", MS: "Centro-Oeste",
  // Sudeste
  ES: "Sudeste", MG: "Sudeste", RJ: "Sudeste", SP: "Sudeste",
  // Sul
  PR: "Sul", RS: "Sul", SC: "Sul",
};

/** Ordem fixa das macro-regiões (desempate de contagens iguais). */
export const MACRO_REGIOES = [
  "Sul",
  "Sudeste",
  "Nordeste",
  "Centro-Oeste",
  "Norte",
] as const;

export function regiaoDe(uf: string): string {
  return REGIAO_BY_UF[uf] ?? "—";
}
